#!/usr/bin/env python3
"""Robinhood holdings scanner.

Reads a holdings + market-data snapshot (data/snapshot.json), scores every
position, runs portfolio-level checks, and writes:
  reports/report.md    plain-text report
  reports/report.html  dashboard version of the same report

Usage:  python3 scan.py [path/to/snapshot.json]

The scoring is a transparent, rules-based model. It is a decision aid, not a
prediction of future returns.
"""
import html
import json
import math
import statistics
import sys
from datetime import date
from pathlib import Path

ROOT = Path(__file__).parent
SNAPSHOT = Path(sys.argv[1]) if len(sys.argv) > 1 else ROOT / "data" / "snapshot.json"
OUT = ROOT / "reports"

# Broad index funds get a fixed quality score for diversification and low cost.
CORE_ETF_QUALITY = {"VOO": 45, "VXUS": 40, "QQQM": 36}
# Expense ratios (% per year) for the index funds, used for the cost grade.
EXPENSE_RATIO = {"VOO": 0.03, "VXUS": 0.05, "QQQM": 0.15}
SPECULATIVE_CAP_PCT = 10.0    # suggested ceiling for single stocks + crypto
SMALL_POSITION_PCT = 1.0      # under this weight a position barely moves the account
CONCENTRATION_PCT = 25.0      # single-stock weight that starts to dominate outcomes
TODAY = date.today()


def clamp(x, lo, hi):
    return max(lo, min(hi, x))


def lerp(x, x0, x1, y0, y1):
    """Map x from [x0, x1] onto [y0, y1], clamped."""
    t = clamp((x - x0) / (x1 - x0), 0.0, 1.0)
    return y0 + t * (y1 - y0)


# ---------------------------------------------------------------- factors

def trend_metrics(closes):
    price = closes[-1]
    ma10 = statistics.mean(closes[-10:])
    ret13 = (price / closes[-14] - 1) * 100 if len(closes) >= 14 else (price / closes[0] - 1) * 100
    rets = [closes[i] / closes[i - 1] - 1 for i in range(1, len(closes))]
    vol = statistics.stdev(rets) * math.sqrt(52) * 100
    return {"ma10": ma10, "above_ma10": price > ma10, "ret13": ret13, "vol": vol}


def momentum_score(t, price, hi52, lo52):
    """0-20: trend vs 10-week average, 13-week return, spot in 52-week range."""
    s = 7 if t["above_ma10"] else 0
    s += lerp(t["ret13"], -20, 20, 0, 8)
    s += lerp((price - lo52) / (hi52 - lo52), 0, 1, 0, 5)
    return s


def risk_score(vol):
    """0-20: lower annualized volatility scores higher."""
    return lerp(vol, 20, 80, 20, 2)


def valuation_score(pe):
    """0-15: trailing P/E bands. No P/E means no trailing profits."""
    if pe is None or pe <= 0:
        return 4
    if pe < 15:
        return 15
    if pe < 25:
        return 12
    if pe < 35:
        return 8
    return 4


def analyst_scores(a, price):
    """Upside to mean target (0-30) and buy-rating share (0-15)."""
    upside = (a["target"] / price - 1) * 100
    n = a["buy"] + a["hold"] + a["sell"]
    buy_pct = a["buy"] / n * 100
    return upside, buy_pct, lerp(upside, -10, 50, 0, 30), lerp(buy_pct, 30, 100, 0, 15)


def grade(score):
    for cutoff, g in ((80, "A"), (70, "B+"), (62, "B"), (54, "C+"), (46, "C"), (38, "D")):
        if score >= cutoff:
            return g
    return "F"


# ---------------------------------------------------------------- scan

def scan(snap):
    total = snap["account"]["total_value"]
    locked = set(snap.get("profile", {}).get("locked", []))
    rows = []
    for p in snap["equities"]:
        sym, price = p["symbol"], p["price"]
        value = p["qty"] * price
        cost = p["qty"] * p["avg_cost"]
        t = trend_metrics(snap["weekly_closes"][sym])
        mom = momentum_score(t, price, p["hi52"], p["lo52"])
        rsk = risk_score(t["vol"])
        r = {
            **p, "value": value, "cost": cost, "pnl": value - cost,
            "pnl_pct": (value / cost - 1) * 100, "weight": value / total * 100,
            "trend": t, "off_high": (price / p["hi52"] - 1) * 100,
            "f_mom": mom, "f_risk": rsk, "locked": sym in locked,
        }
        if p["kind"] == "etf":
            r["f_quality"] = CORE_ETF_QUALITY.get(sym, 30)
            r["f_val"] = valuation_score(p["pe"])
            r["score"] = r["f_quality"] + mom + rsk + r["f_val"]
            r["upside"] = r["buy_pct"] = None
        else:
            up, bp, f_up, f_cons = analyst_scores(p["analyst"], price)
            r.update(upside=up, buy_pct=bp, f_up=f_up, f_cons=f_cons, f_val=valuation_score(p["pe"]))
            r["score"] = f_up + f_cons + mom + rsk + r["f_val"]
        r["score"] = round(r["score"])
        r["grade"] = grade(r["score"])
        r["action"], r["why"] = verdict(r)
        rows.append(r)
    rows.sort(key=lambda r: -r["value"])
    return rows


def verdict(r):
    """Turn the score plus position context into an action and a reason."""
    sym, s, w = r["symbol"], r["score"], r["weight"]
    if r["kind"] == "etf":
        if sym == "VOO":
            return "HOLD / ADD (core)", "Low-cost S&P 500 core; this should be the engine of long-run returns."
        if sym == "QQQM":
            return "HOLD", "Growth tilt that works with VOO, but it overlaps: MSFT, GOOGL and MU are already inside both funds."
        if sym == "VXUS":
            if r["locked"]:
                return "HOLD (locked)", "Sensible international diversifier. Kept in place to protect the transfer bonus."
            return "HOLD (harvest candidate)", "Sensible international diversifier. Sitting on a short-term loss you could harvest by swapping to a similar, not identical, fund."
        return "HOLD", "Index fund."
    notes = []
    if w < SMALL_POSITION_PCT:
        notes.append(f"only {w:.1f}% of the account, so even a double adds about {w:.1f}%")
    if r["pe"] is None:
        notes.append("no trailing profits")
    if r["trend"]["vol"] > 55:
        notes.append(f"very volatile ({r['trend']['vol']:.0f}% annualized)")
    if not r["trend"]["above_ma10"]:
        notes.append("trading below its 10-week average")
    if r["upside"] is not None and r["upside"] > 20:
        notes.append(f"analysts see {r['upside']:.0f}% upside")
    if s >= 70:
        action = "ADD on dips"
    elif s >= 56:
        action = "HOLD"
    elif s >= 46:
        action = "HOLD / WATCH"
    else:
        action = "TRIM / SELL"
    if w < SMALL_POSITION_PCT and s < 62:
        action = "CONSOLIDATE"
    return action, "; ".join(notes) or "Balanced profile."


def portfolio_checks(snap, rows):
    acct = snap["account"]
    total = acct["total_value"]
    etf_w = sum(r["weight"] for r in rows if r["kind"] == "etf")
    stocks = [r for r in rows if r["kind"] == "stock"]
    small = [r["symbol"] for r in stocks if r["weight"] < SMALL_POSITION_PCT]
    profile = snap.get("profile", {})
    losers = sorted((r for r in rows if r["pnl"] < 0 and not r["locked"]), key=lambda r: r["pnl"])
    harvestable = sum(r["pnl"] for r in losers)
    crypto_val = sum(c["qty"] * c["price"] for c in snap["crypto"])
    crypto_cost = sum(c["cost_basis"] for c in snap["crypto"])
    unrealized = sum(r["pnl"] for r in rows)
    w_vol = sum(r["weight"] * r["trend"]["vol"] for r in rows) / sum(r["weight"] for r in rows)
    w_score = sum(r["weight"] * r["score"] for r in rows) / sum(r["weight"] for r in rows)

    findings = []
    findings.append(("good", "Diversified core",
        f"{etf_w:.0f}% of the account is in broad index funds (VOO, QQQM, VXUS). That is a solid base and cheap to own."))
    biggest = max(stocks, key=lambda r: r["weight"])
    if biggest["weight"] > CONCENTRATION_PCT:
        findings.append(("warn", "Concentration", f"{biggest['symbol']} is {biggest['weight']:.0f}% of the account."))
    else:
        findings.append(("good", "No single-stock concentration risk",
            f"Largest individual stock is {biggest['symbol']} at {biggest['weight']:.1f}%."))
    if small:
        findings.append(("warn", "Too many tiny positions",
            f"{len(small)} stocks ({', '.join(small)}) are each under {SMALL_POSITION_PCT:.0f}% of the account. "
            "Together they are "
            f"{sum(r['weight'] for r in stocks if r['symbol'] in small):.1f}%. They add tracking work and tax lots "
            "without changing results. Either size up the ones you believe in or fold them into the core."))
    findings.append(("warn", "Overlap",
        "MSFT, GOOGL and MU are already large holdings inside VOO and QQQM, so you own them twice. "
        "That's fine if you want the tilt, just know your real big-tech exposure is higher than the position list shows."))
    if acct["cash"] < 100 and profile.get("cash_held_elsewhere"):
        lev = acct["buying_power"] > acct["cash"] + 1
        findings.append(("good" if not lev else "warn", "Fully invested; cash buffer kept at the bank",
            "Your emergency cash lives outside Robinhood, so being fully invested here is fine. "
            + ("Buying power equals cash, so the account can't borrow." if not lev else
               f"Buying power (${acct['buying_power']:,.2f}) exceeds cash, so margin borrowing is available. Avoid using it.")))
    elif acct["cash"] < 100:
        findings.append(("bad", "No cash on hand",
            f"Cash is ${acct['cash']:.2f} and buying power is ${acct['buying_power']:.2f}. You can't buy dips or cover a margin call. "
            "Keep the account out of margin debt; borrowing to invest magnifies losses as well as gains."))
    else:
        findings.append(("info", "Cash waiting to be deployed",
            f"${acct['cash']:,.2f} in cash ({acct['cash'] / total * 100:.1f}% of the account). Fine as a small buffer; "
            "beyond that, idle cash drags on returns. Decide where it goes rather than letting it sit."))
    realized = snap.get("realized", [])
    if realized:
        pl = lambda r: r["qty"] * r["price"] - r["cost"] - r["fees"]
        pnl = sum(pl(r) for r in realized)
        parts = ", ".join(f"{r['symbol']} {money(pl(r), True)}" for r in realized)
        msg = f"Sold {parts}: net {'loss' if pnl < 0 else 'gain'} of ${abs(pnl):,.2f}, all short-term."
        sold_losses = [r for r in realized if pl(r) < 0]
        if sold_losses:
            last = max(date.fromisoformat(r["date"]) for r in sold_losses)
            clear = date.fromordinal(last.toordinal() + 31)
            if clear > TODAY:
                msg += (f" To keep the losses, don't rebuy {', '.join(r['symbol'] for r in sold_losses)} in any account, "
                        f"including the Roth, before {clear:%b %-d, %Y}.")
        findings.append(("good" if pnl < 0 else "info", "Sold this year", msg))
    if profile.get("earned_income", True):
        findings.append(("bad", "Roth IRA is empty",
            "Your Roth IRA holds $0.03. Growth inside a Roth is tax-free forever. For most people, funding it "
            "(2026 limit: $7,500 if under 50, income limits apply) beats any stock pick in this report. "
            "Fund it with new money. Selling here to fund it would realize short-term gains and losses."))
    else:
        findings.append(("info", "Roth IRA on hold",
            "Roth contributions need earned income (wages or self-employment), so it stays empty for now. "
            "Fund it in any year you have earned income, up to the lesser of that income or the annual limit. "
            "If you're married and file jointly, a spouse's earnings can fund it (spousal IRA)."))
        findings.append(("good", "Low income can mean 0% tax on long-term gains",
            "If your taxable income stays low, federal tax on long-term gains can be 0% (2026: taxable income up to roughly "
            "$49K single / $98K joint). Once lots pass one year (from Aug 2027), you could sell some winners and rebuy right away "
            "to reset your cost basis tax-free. The wash-sale rule doesn't apply to gains. Check with a tax pro first."))
    if profile.get("locked"):
        findings.append(("info", "Locked positions",
            f"{', '.join(profile['locked'])}: {profile['lock_reason']}. The scanner won't suggest selling them. "
            "Check the bonus terms for how long assets must stay and whether the rule covers specific positions or just account value."))
    findings.append(("info", "Every lot is short-term", snap["tax_note"] +
        " Gains sold before then are taxed as ordinary income. Holding winners past one year can save 10-20 percentage points of tax."))
    if losers:
        findings.append(("info", "Tax-loss harvesting",
            f"Unrealized losses total ${-harvestable:,.0f} ({', '.join(f'{r['symbol']} ${-r['pnl']:,.0f}' for r in losers[:5])}). "
            "Selling a loser and buying a similar but not identical fund or stock books a loss that offsets gains and up to "
            "$3,000 of ordinary income. Don't rebuy the same security within 30 days (wash-sale rule)."))
    findings.append(("info", "Crypto",
        f"${crypto_val:,.2f} in {'/'.join(c['symbol'] for c in snap['crypto'])} (cost ${crypto_cost:,.2f}). Negligible at {crypto_val / total * 100:.2f}% of the account."))
    return {
        "total": total, "unrealized": unrealized, "etf_w": etf_w, "w_vol": w_vol,
        "returns": total_return(snap, unrealized),
        "w_score": w_score, "w_grade": grade(w_score), "findings": findings,
        "crypto_val": crypto_val,
    }


def total_return(snap, unrealized):
    """What you put in vs what it's worth now, split into where the gain came from.

    Cost-basis P&L alone misleads: bonuses and transfer matches arrive as cash or
    shares, so they raise the account value without ever showing as a gain on a
    position. net_contributed is the user's own money in (bank deposits plus the
    value of assets transferred in, minus withdrawals).
    """
    contributed = snap.get("profile", {}).get("net_contributed")
    if not contributed:
        return None
    total = snap["account"]["total_value"]
    gain = total - contributed
    crypto_pnl = sum(c["qty"] * c["price"] - c["cost_basis"] for c in snap["crypto"])
    realized = snap.get("lifetime_realized", 0.0)
    other = gain - unrealized - crypto_pnl - realized
    return {"contributed": contributed, "gain": gain, "pct": gain / contributed * 100,
            "parts": [("Price changes on current stocks", unrealized),
                      ("Price changes on crypto", crypto_pnl),
                      ("Closed trades (lifetime)", realized),
                      ("Bonuses, dividends and interest", other)]}


def project(snap, rows):
    """Monte Carlo of account value at the horizon date.

    Each equity gets its own volatility from weekly returns, linked by the
    correlations observed over the weeks every holding has traded. Drift is a
    flat long-run assumption, not a forecast from recent momentum.
    """
    import numpy as np
    cfg = snap.get("projection")
    if not cfg:
        return None
    end = date.fromisoformat(cfg["horizon_end"])
    T = (end - TODAY).days / 365
    syms = [r["symbol"] for r in rows]
    closes = [snap["weekly_closes"][s] for s in syms]
    n = min(len(c) for c in closes)
    rets = np.array([np.diff(np.log(c[-n:])) for c in closes])
    corr = np.corrcoef(rets)
    vols = np.array([r["trend"]["vol"] / 100 for r in rows])
    values = np.array([r["value"] for r in rows])

    crypto_val = sum(c["qty"] * c["price"] for c in snap["crypto"])
    if crypto_val > 0:
        k = len(syms)
        big = np.full((k + 1, k + 1), cfg["crypto_equity_corr"])
        big[:k, :k] = corr
        big[k, k] = 1.0
        corr = big
        vols = np.append(vols, cfg["crypto_vol"])
        values = np.append(values, crypto_val)
    # Clip tiny negative eigenvalues so the sample correlation is usable.
    w, v = np.linalg.eigh(corr)
    corr = v @ np.diag(np.clip(w, 1e-8, None)) @ v.T
    L = np.linalg.cholesky(corr)

    mu = np.full(len(values), cfg["equity_expected_return"])
    if crypto_val > 0:
        mu[-1] = 0.0
    rng = np.random.default_rng(7)
    z = rng.standard_normal((cfg["paths"], len(values))) @ L.T
    growth = np.exp((np.log1p(mu) - vols ** 2 / 2) * T + vols * np.sqrt(T) * z)
    final = growth @ values + snap["account"]["cash"]
    start = values.sum() + snap["account"]["cash"]
    pct = {p: float(np.percentile(final, p)) for p in (5, 25, 50, 75, 95)}
    cov = np.outer(vols, vols) * corr
    port_vol = float(np.sqrt(values @ cov @ values) / values.sum())
    return {"end": end, "days": (end - TODAY).days, "start": start, "pct": pct,
            "p_loss": float((final < start).mean() * 100),
            "p_down5": float((final < start * 0.95).mean() * 100),
            "note": cfg.get("dividends_note", ""), "mu": cfg["equity_expected_return"],
            "long": project_long(snap, start, port_vol)}


def project_long(snap, start, port_vol):
    """Closed-form lognormal range to the target age, plus cash-flow scenarios.

    Uses the portfolio's current volatility (floored, since six months of data
    understates long-run swings) and the same expected return as the
    short-term projection. Scenarios compound at the median growth rate.
    """
    profile, cfg = snap.get("profile", {}), snap["projection"]
    if "age" not in profile or "target_age" not in profile:
        return None
    years = profile["target_age"] - profile["age"]
    vol = max(port_vol, cfg.get("long_vol_floor", 0.15))
    drift = math.log1p(cfg["equity_expected_return"]) - vol ** 2 / 2
    deflate = (1 + cfg.get("inflation", 0.025)) ** years
    z = {5: -1.645, 25: -0.674, 50: 0.0, 75: 0.674, 95: 1.645}
    pct = {p: start * math.exp(drift * years + zz * vol * math.sqrt(years)) for p, zz in z.items()}
    growth = math.exp(drift) - 1
    scen = []
    for sc in cfg.get("scenarios", []):
        v = start
        for y in range(years):
            flow = sc["yearly"] * (1 + sc.get("grow", 0)) ** y if y >= sc["start_year"] else 0
            v = max(v * (1 + growth) + flow, 0)
        scen.append((sc["label"], v, v / deflate))
    return {"years": years, "age": profile["target_age"], "vol": vol, "growth": growth,
            "pct": pct, "real": {p: v / deflate for p, v in pct.items()},
            "inflation": cfg.get("inflation", 0.025), "scenarios": scen}


GPA = {"A": 4.0, "A-": 3.7, "B+": 3.3, "B": 3.0, "B-": 2.7, "C+": 2.3, "C": 2.0, "C-": 1.7, "D": 1.0, "F": 0.0}


def letter(gpa):
    return min(GPA, key=lambda g: abs(GPA[g] - gpa))


def assess(snap, rows, pf, events):
    """Advisor-style summary: allocation, report card, strengths, watch list, stress test, to-dos."""
    acct, profile = snap["account"], snap.get("profile", {})
    total = acct["total_value"]
    val = {r["symbol"]: r["value"] for r in rows}
    stocks = [r for r in rows if r["kind"] == "stock"]
    crypto = sum(c["qty"] * c["price"] for c in snap["crypto"])
    alloc = [
        ("US index funds", " + ".join(s for s in ("VOO", "QQQM") if s in val), sum(val.get(s, 0) for s in ("VOO", "QQQM"))),
        ("International index", "VXUS", val.get("VXUS", 0)),
        ("Single stocks", f"{len(stocks)} positions", sum(r["value"] for r in stocks)),
        ("Crypto", "/".join(c["symbol"] for c in snap["crypto"]), crypto),
        ("Cash", "in Robinhood", acct["cash"]),
    ]
    alloc = [(n, d, v, v / total * 100) for n, d, v in alloc]
    spec_pct = (sum(r["value"] for r in stocks) + crypto) / total * 100

    etfs = [r for r in rows if r["kind"] == "etf"]
    fee = sum(r["value"] * EXPENSE_RATIO.get(r["symbol"], 0.2) for r in etfs) / max(sum(r["value"] for r in etfs), 1)
    pick_score = sum(r["score"] * r["value"] for r in stocks) / max(sum(r["value"] for r in stocks), 1)
    weak = [r["symbol"] for r in stocks if r["score"] < 54]
    strong = [r["symbol"] for r in stocks if r["score"] >= 70]
    levered = acct["buying_power"] > acct["cash"] + 1
    safe = profile.get("cash_held_elsewhere") and not levered
    age = profile.get("age")
    card = [
        ("Diversification", "A" if pf["etf_w"] >= 85 else "B" if pf["etf_w"] >= 70 else "C",
         f"{pf['etf_w']:.0f}% in index funds covering thousands of companies worldwide."),
        ("Costs", "A" if fee <= 0.1 else "B",
         f"Index funds cost about {fee:.2f}% a year on average, about ${fee / 100 * sum(r['value'] for r in etfs):,.0f}/yr. Almost nothing leaks to fees."),
        ("Fit for your age", "A-" if age and age < 35 and spec_pct < 20 else "B",
         (f"All stocks at {age} with {profile.get('target_age', 60) - age} years to go is appropriate."
          if age else "Add your age to the profile for this grade.")),
        ("Stock picks", grade(pick_score),
         f"Value-weighted score {pick_score:.0f}. Strongest: {', '.join(strong) or 'none'}. Weakest: {', '.join(weak) or 'none'}."),
        ("Liquidity and safety", "A" if safe else "D",
         "Emergency cash is at the bank and the account can't borrow." if safe else
         "No cash buffer recorded, or margin borrowing is available."),
        ("Tax setup", "B" if snap.get("tax_note") else "A",
         "Every lot is short-term until Aug 2027, and locked positions limit harvesting. Little to fix until then."),
    ]
    overall = letter(sum(GPA[g] for _, g, _ in card) / len(card))

    worst = min(rows, key=lambda r: r["pnl"])
    working = [
        f"The core does the heavy lifting: {pf['etf_w']:.0f}% in low-cost index funds, led by VOO at {val.get('VOO', 0) / total * 100:.0f}%.",
        f"Losses are small and spread out. The biggest is {worst['symbol']} at {money(worst['pnl'], True)}, {abs(worst['pnl']) / total * 100:.1f}% of the account.",
    ]
    if snap.get("realized"):
        working.append("You've cut weak positions and booked the losses: " + ", ".join(r["symbol"] for r in snap["realized"]) + ".")
    if safe:
        working.append("Emergency cash sits at the bank, so this account can stay fully invested.")

    watch = []
    small = [r for r in stocks if r["weight"] < SMALL_POSITION_PCT]
    if small:
        watch.append(f"Small positions ({', '.join(r['symbol'] for r in small)}): fine as deliberate bets, "
                     f"but together they're {sum(r['weight'] for r in small):.1f}% of the account and can't move the total much.")
    watch.append("You own the same tech companies twice: MSFT, GOOGL and MU sit inside VOO and QQQM too. Avoid adding more tech on top.")
    watch.append(f"Single stocks plus crypto are {spec_pct:.1f}% of the account, "
                 + ("under" if spec_pct <= SPECULATIVE_CAP_PCT else "over") + f" the {SPECULATIVE_CAP_PCT:.0f}% cap.")
    if events:
        watch.append("Earnings: " + "; ".join(f"{s} {date.fromisoformat(d):%b %-d}" for d, s in events) + ".")

    verdicts = [holding_verdict(r, events) for r in rows]
    stress = [(label, drop, total * drop) for label, drop in (("Typical bear market, like 2022", 0.25), ("Severe crash, like 2008", 0.50))]
    yrs = profile.get("target_age", 60) - age if age else None
    lows = [n.lower() for n, g, _ in card if GPA[g] < 3.3]
    summary = (f"A strong, diversified core{f' for a {yrs}-year horizon' if yrs else ''}. "
               + (f"Room to improve: {', '.join(lows)}." if lows else "No weak spots."))
    return {"overall": overall, "summary": summary, "alloc": alloc, "card": card, "working": working, "watch": watch,
            "stress": stress, "verdicts": verdicts, "todo": profile.get("todo", []), "spec_pct": spec_pct}


def holding_verdict(r, events):
    """Collapse the scanner action into a plain BUY / HOLD / SELL call with a short reason."""
    a, sym = r["action"], r["symbol"]
    earn = dict((s, d) for d, s in events).get(sym)
    if a.startswith(("ADD", "HOLD / ADD")):
        call = "BUY"
    elif a.startswith(("TRIM", "CONSOL")):
        call = "SELL"
    else:
        call = "HOLD"
    bits = [f"score {r['score']} ({r['grade']})"]
    if r["upside"] is not None:
        bits.append(f"analysts {r['upside']:+.0f}%")
    bits.append(f"{r['trend']['vol']:.0f}% vol")
    if sym == "VOO":
        why = "Core holding and the best home for new money, including the $100/month."
    elif r.get("locked"):
        why = "Keep for the transfer bonus. Solid international diversifier."
    elif sym == "QQQM":
        why = "Keep the growth tilt, but don't add: it overlaps VOO and your tech stocks."
    elif call == "BUY":
        why = "Strong score and analyst upside. Add only in small amounts"
        why += f", ideally after earnings on {date.fromisoformat(earn):%b %-d}." if earn else "."
        if r["trend"]["vol"] > 60:
            why += " Very volatile, so keep it small."
    elif call == "SELL":
        why = (f"Optional: only {r['weight']:.1f}% of the account, so it can't move your total much. "
               "Keep it only if it's a deliberate bet you want to follow.")
    else:
        why = "Reasonable to hold. No reason to add or sell right now."
        if earn:
            why += f" Earnings {date.fromisoformat(earn):%b %-d}."
    return {"symbol": sym, "call": call, "why": why, "stats": " · ".join(bits),
            "value": r["value"], "pnl": r["pnl"]}


def upcoming_earnings(rows):
    ev = [(r["next_earnings"], r["symbol"]) for r in rows if r.get("next_earnings")]
    return sorted(ev)


# ---------------------------------------------------------------- output

def money(x, signed=False):
    s = f"{abs(x):,.0f}"
    if signed:
        return ("+$" if x >= 0 else "-$") + s
    return "$" + s


def write_markdown(snap, rows, pf, events, proj, a):
    L = [f"# Robinhood Holdings Scan: {snap['as_of']}", ""]
    rt = pf["returns"]
    if rt:
        L += ["## Total return", "", f"You put in **{money(rt['contributed'])}**; it's worth **{money(pf['total'])}**: "
              f"**{money(rt['gain'], True)} ({rt['pct']:+.2f}%)**.", "", "| Source | Amount |", "|---|---:|"]
        L += [f"| {n} | {money(v, True)} |" for n, v in rt["parts"]] + [""]
    L += [f"## Assessment: {a['overall']} overall", "", "| Area | Grade | Why |", "|---|:-:|---|"]
    L += [f"| {n} | {g} | {w} |" for n, g, w in a["card"]]
    L += ["", "| Allocation | Holdings | Value | Share |", "|---|---|---:|---:|"]
    L += [f"| {n} | {d} | {money(v)} | {p:.1f}% |" for n, d, v, p in a["alloc"]]
    L += ["", "**Holding by holding**", "", "| Holding | Call | Why | Stats |", "|---|:-:|---|---|"]
    L += [f"| {v['symbol']} | {v['call']} | {v['why']} | {v['stats']} |" for v in a["verdicts"]]
    L += ["", "**What's working**", ""] + [f"- {x}" for x in a["working"]]
    L += ["", "**What to watch**", ""] + [f"- {x}" for x in a["watch"]]
    L += ["", "**Stress test**", ""] + [f"- {l}: about -{money(v)} (-{d * 100:.0f}%)" for l, d, v in a["stress"]]
    if a["todo"]:
        L += ["", "**To-do**", ""] + [f"{i}. {t}" for i, t in enumerate(a["todo"], 1)]
    L += [""]
    L += [f"**Account value:** {money(pf['total'])}  ",
          f"**Unrealized P&L (equities, vs cost basis):** {money(pf['unrealized'], True)}  ",
          f"**Portfolio score:** {pf['w_score']:.0f}/100 ({pf['w_grade']})  ",
          f"**Weighted volatility:** {pf['w_vol']:.0f}% annualized", ""]
    L += ["## Positions", "",
          "| Symbol | Value | Weight | P&L | Score | Grade | Action | Notes |",
          "|---|---:|---:|---:|---:|:-:|---|---|"]
    for r in rows:
        L.append(f"| {r['symbol']} | {money(r['value'])} | {r['weight']:.1f}% | "
                 f"{money(r['pnl'], True)} ({r['pnl_pct']:+.1f}%) | {r['score']} | {r['grade']} | "
                 f"{r['action']} | {r['why']} |")
    L += ["", "## Portfolio findings", ""]
    for _, title, body in pf["findings"]:
        L.append(f"- **{title}.** {body}")
    if events:
        L += ["", "## Upcoming earnings (volatility events)", ""]
        L += [f"- {d}: {s}" for d, s in events]
    if proj:
        L += ["", f"## Projection to {proj['end']:%b %-d, %Y} ({proj['days']} days)", "",
              f"Starting value {money(proj['start'])}. Range of outcomes from {len(proj['pct'])}-point percentiles "
              f"of a simulation using each holding's volatility and correlations and an assumed {proj['mu'] * 100:.0f}%/yr expected return:", "",
              "| Outcome | Value | Change |", "|---|---:|---:|"]
        for p, label in ((5, "Bad (1 in 20)"), (25, "Below average"), (50, "Middle"), (75, "Above average"), (95, "Great (1 in 20)")):
            v = proj["pct"][p]
            L.append(f"| {label} | {money(v)} | {money(v - proj['start'], True)} ({(v / proj['start'] - 1) * 100:+.1f}%) |")
        L += ["", f"Chance of ending below today: {proj['p_loss']:.0f}%. Chance of dropping more than 5%: {proj['p_down5']:.0f}%. {proj['note']}"]
        lg = proj.get("long")
        if lg:
            L += ["", f"## Projection to age {lg['age']} ({lg['years']} years, no deposits or withdrawals)", "",
                  "| Outcome | Value | In today's dollars |", "|---|---:|---:|"]
            for p, label in ((5, "Bad (1 in 20)"), (25, "Below average"), (50, "Middle"), (75, "Above average"), (95, "Great (1 in 20)")):
                L.append(f"| {label} | {money(lg['pct'][p])} | {money(lg['real'][p])} |")
            L += ["", "| Scenario (middle outcome) | Value | In today's dollars |", "|---|---:|---:|",
                  f"| No deposits or withdrawals | {money(lg['pct'][50])} | {money(lg['real'][50])} |"]
            L += [f"| {lab} | {money(v)} | {money(r)} |" for lab, v, r in lg["scenarios"]]
            L += ["", f"Assumes {proj['mu'] * 100:.0f}%/yr expected return with {lg['vol'] * 100:.0f}% yearly swings "
                  f"(about {lg['growth'] * 100:.1f}%/yr compounded in the middle case) and {lg['inflation'] * 100:.1f}% inflation. "
                  "Ignores taxes on dividends."]
    L += ["", "## How the score works", "",
          "Stocks (0-100): analyst upside to mean target (30) + buy-rating share (15) + momentum (20) "
          "+ low volatility (20) + valuation by trailing P/E (15).  ",
          "Index funds: diversification/cost quality (36-45) + momentum (20) + low volatility (20) + valuation (15).  ",
          "Grades: A ≥80, B+ ≥70, B ≥62, C+ ≥54, C ≥46, D ≥38, F below.", "",
          "_Rules-based decision aid, not personalized financial, tax, or legal advice. "
          "Analyst targets are often wrong and past momentum doesn't guarantee future returns._"]
    (OUT / "report.md").write_text("\n".join(L) + "\n")


def write_html(snap, rows, pf, events, proj, a):
    e = html.escape
    tone = {"good": "good", "warn": "warn", "bad": "bad", "info": "info"}
    def chip(a):
        cls = "add" if a.startswith(("ADD", "HOLD / ADD")) else "sell" if a.startswith(("TRIM", "CONSOL")) else "hold"
        return f'<span class="chip {cls}">{e(a)}</span>'
    trs = []
    for r in rows:
        up = "n/a" if r["upside"] is None else f"{r['upside']:+.0f}%"
        trs.append(
            f"<tr><td class=sym>{e(r['symbol'])}<small>{e(r['sector'])}</small></td>"
            f"<td class=num>{money(r['value'])}</td><td class=num>{r['weight']:.1f}%</td>"
            f"<td class='num {'pos' if r['pnl'] >= 0 else 'neg'}'>{money(r['pnl'], True)}<small>{r['pnl_pct']:+.1f}%</small></td>"
            f"<td class=num>{r['trend']['ret13']:+.1f}%</td><td class=num>{r['trend']['vol']:.0f}%</td>"
            f"<td class=num>{up}</td>"
            f"<td class=num><b>{r['score']}</b> <span class='g g{r['grade'][0]}'>{e(r['grade'])}</span></td>"
            f"<td>{chip(r['action'])}<small>{e(r['why'])}</small></td></tr>")
    cards = "".join(
        f'<div class="find {tone[t]}"><h3>{e(title)}</h3><p>{e(body)}</p></div>'
        for t, title, body in pf["findings"])
    ev = "".join(f"<li><b>{e(d)}</b> {e(s)}</li>" for d, s in events)
    proj_html = ""
    if proj:
        lo, hi = proj["pct"][5], proj["pct"][95]
        def pos(v):
            return (v - lo) / (hi - lo) * 100
        bars = []
        for p, label in ((5, "Bad (1 in 20)"), (25, "Below avg"), (50, "Middle"), (75, "Above avg"), (95, "Great (1 in 20)")):
            v = proj["pct"][p]
            cls = "pos" if v >= proj["start"] else "neg"
            bars.append(f"<div class=pq><span>{label}</span><b>{money(v)}</b><small class={cls}>{money(v - proj['start'], True)} "
                        f"({(v / proj['start'] - 1) * 100:+.1f}%)</small></div>")
        proj_html = (f"<h2>Projected value on {proj['end']:%b %-d, %Y}</h2>"
            f"<div class=proj><div class=range><div class=band style='left:{pos(proj['pct'][25]):.1f}%;width:{pos(proj['pct'][75]) - pos(proj['pct'][25]):.1f}%'></div>"
            f"<div class=mid style='left:{pos(proj['pct'][50]):.1f}%'></div><div class=now style='left:{pos(proj['start']):.1f}%' title='Today'></div></div>"
            f"<div class=pqs>{''.join(bars)}</div>"
            f"<p>Today {money(proj['start'])} (black tick). Shaded band is the middle half of outcomes. "
            f"Chance of ending below today: <b>{proj['p_loss']:.0f}%</b>; of dropping more than 5%: <b>{proj['p_down5']:.0f}%</b>. "
            f"Simulated from each holding's volatility and correlations with an assumed {proj['mu'] * 100:.0f}%/yr expected return. "
            f"{e(proj['note'])}</p></div>")
        lg = proj.get("long")
        if lg:
            rows_l = "".join(
                f"<tr><td>{label}</td><td class=num>{money(lg['pct'][p])}</td><td class=num>{money(lg['real'][p])}</td></tr>"
                for p, label in ((5, "Bad (1 in 20)"), (25, "Below average"), (50, "<b>Middle</b>"), (75, "Above average"), (95, "Great (1 in 20)")))
            rows_s = f"<tr><td>No deposits or withdrawals</td><td class=num>{money(lg['pct'][50])}</td><td class=num>{money(lg['real'][50])}</td></tr>" + "".join(
                f"<tr><td>{e(lab)}</td><td class=num>{money(v)}</td><td class=num>{money(r)}</td></tr>" for lab, v, r in lg["scenarios"])
            proj_html += (f"<h2>Projected value at age {lg['age']} ({lg['years']} years)</h2><div class=two>"
                f"<div class=wrap><table class=slim><thead><tr><th>Outcome, no cash flows</th><th class=num>Value</th><th class=num>Today's $</th></tr></thead><tbody>{rows_l}</tbody></table></div>"
                f"<div class=wrap><table class=slim><thead><tr><th>Scenario, middle outcome</th><th class=num>Value</th><th class=num>Today's $</th></tr></thead><tbody>{rows_s}</tbody></table></div></div>"
                f"<p class=fine>Assumes {proj['mu'] * 100:.0f}%/yr expected return with {lg['vol'] * 100:.0f}% yearly swings "
                f"(about {lg['growth'] * 100:.1f}%/yr compounded in the middle case) and {lg['inflation'] * 100:.1f}% inflation. Ignores taxes on dividends.</p>")
    rt = pf["returns"]
    if rt:
        ret_kpi = (f"<div class=kpi><span>Total gain vs. money you put in</span><b class=\"{'pos' if rt['gain'] >= 0 else 'neg'}\">"
                   f"{money(rt['gain'], True)}</b><small class=kmute>{rt['pct']:+.2f}% on {money(rt['contributed'])}</small></div>")
        parts = "".join(f"<li><span>{e(n)}</span><b class=\"{'pos' if v >= 0 else 'neg'}\">{money(v, True)}</b></li>" for n, v in rt["parts"])
        ret_html = (f"<div class=ret><h3 class=sh>Total return</h3><p>You put in <b>{money(rt['contributed'])}</b>. "
                    f"It's worth <b>{money(pf['total'])}</b> now: <b class=\"{'pos' if rt['gain'] >= 0 else 'neg'}\">{money(rt['gain'], True)} "
                    f"({rt['pct']:+.2f}%)</b>.</p><ul class=parts>{parts}</ul>"
                    "<p class=note>Position P&amp;L only compares prices to your cost basis. Bonuses and matches add value "
                    "without showing up as a gain on any position, so this is the truer number.</p></div>")
    else:
        ret_kpi = (f"<div class=kpi><span>Unrealized P&amp;L (vs cost basis)</span><b class=\"{'pos' if pf['unrealized'] >= 0 else 'neg'}\">"
                   f"{money(pf['unrealized'], True)}</b><small class=kmute>Add net_contributed to the profile for total return</small></div>")
        ret_html = ""
    gcls = lambda g: "gA" if g[0] in "AB" else "gC" if g[0] == "C" else "gD"
    segs = "".join(
        f"<div class='seg s{i}' style='flex-grow:{max(p, 0.6):.2f}' title='{e(n)}: {money(v)} ({p:.1f}%)'></div>"
        for i, (n, d, v, p) in enumerate(a["alloc"], 1) if v >= 1)
    legend = "".join(
        f"<li><i class='sw s{i}'></i><span>{e(n)}<small>{e(d)}</small></span><b>{p:.1f}%</b><em>{money(v)}</em></li>"
        for i, (n, d, v, p) in enumerate(a["alloc"], 1) if v >= 1)
    grades = "".join(
        f"<div class=rc><b class='big {gcls(g)}'>{e(g)}</b><div><h3>{e(n)}</h3><p>{e(w)}</p></div></div>"
        for n, g, w in a["card"])
    vcards = "".join(
        f"<div class=vc><div class=vtop><b>{e(v['symbol'])}</b><span class='call c{v['call']}'>{v['call']}</span></div>"
        f"<p>{e(v['why'])}</p><small>{money(v['value'])} · <span class=\"{'pos' if v['pnl'] >= 0 else 'neg'}\">{money(v['pnl'], True)}</span> · {e(v['stats'])}</small></div>"
        for v in a["verdicts"])
    li = lambda xs: "".join(f"<li>{e(x)}</li>" for x in xs)
    stress = "".join(f"<div class=st><span>{e(l)}</span><b class=neg>-{money(v)}</b><small>-{d * 100:.0f}% → {money(pf['total'] - v)}</small></div>"
                     for l, d, v in a["stress"])
    todo = "".join(f"<li>{e(t)}</li>" for t in a["todo"])
    assess_html = f"""<section class=assess>
<div class=ahead><div class=overall><span>Overall</span><b class='{gcls(a['overall'])}'>{e(a['overall'])}</b></div>
<div><h2>Assessment</h2><p>{e(a['summary'])}</p></div></div>
{ret_html}
<div class=rcs>{grades}</div>
<h3 class=sh>Holding by holding: buy, hold or sell</h3><div class=vcs>{vcards}</div>
<h3 class=sh>Where the money is</h3>
<div class=alloc role=img aria-label="Allocation bar">{segs}</div><ul class=legend>{legend}</ul>
<div class=cols><div class=col><h3 class=sh>What's working</h3><ul class=ticks>{li(a['working'])}</ul></div>
<div class=col><h3 class=sh>What to watch</h3><ul class=dots>{li(a['watch'])}</ul></div></div>
<h3 class=sh>Stress test: what a crash would look like</h3><div class=sts>{stress}</div>
<p class=note>Your portfolio moves almost in step with the overall market. Both kinds of drop have happened and fully recovered for people who held on. Decide now that you won't sell when it happens.</p>
{f"<h3 class=sh>To-do</h3><ol class=todo>{todo}</ol>" if todo else ""}
</section>"""
    doc = f"""<!doctype html><html lang=en><head><meta charset=utf-8>
<meta name=viewport content="width=device-width,initial-scale=1">
<title>Holdings Scan</title>
<style>
:root{{--c1:#2a78d6;--c2:#eb6834;--c3:#1baf7a;--c4:#eda100;--c5:#9a9aa2;--bg:#f7f7f5;--card:#fff;--ink:#1d1d1f;--mute:#6b6b70;--line:#e4e4e0;--pos:#0a7d45;--neg:#c2362b;--warn:#a86400;--info:#2557a7}}
@media (prefers-color-scheme:dark){{:root:not([data-theme=light]){{--c1:#3987e5;--c2:#d95926;--c3:#199e70;--c4:#c98500;--c5:#6b6b70;--bg:#121214;--card:#1c1c1f;--ink:#ececee;--mute:#9a9aa2;--line:#2c2c31;--pos:#3ccf85;--neg:#ff6b5e;--warn:#f0a940;--info:#79a7ff;color-scheme:dark}}}}
:root[data-theme=dark]{{--c1:#3987e5;--c2:#d95926;--c3:#199e70;--c4:#c98500;--c5:#6b6b70;--bg:#121214;--card:#1c1c1f;--ink:#ececee;--mute:#9a9aa2;--line:#2c2c31;--pos:#3ccf85;--neg:#ff6b5e;--warn:#f0a940;--info:#79a7ff;color-scheme:dark}}
*{{box-sizing:border-box}}body{{margin:0;background:var(--bg);color:var(--ink);font:15px/1.5 system-ui,-apple-system,Segoe UI,sans-serif}}
main{{max-width:1100px;margin:0 auto;padding:24px 16px 48px}}h1{{font-size:24px;margin:0 0 4px}}.sub{{color:var(--mute);margin:0 0 20px}}
.kpis{{display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:12px;margin-bottom:24px}}
.kpi{{background:var(--card);border:1px solid var(--line);border-radius:10px;padding:14px}}.kpi span{{color:var(--mute);font-size:13px}}.kpi b{{display:block;font-size:22px}}
h2{{font-size:17px;margin:28px 0 10px}}.wrap{{overflow-x:auto;background:var(--card);border:1px solid var(--line);border-radius:10px}}
table{{border-collapse:collapse;width:100%;min-width:860px}}th,td{{padding:10px 12px;border-bottom:1px solid var(--line);text-align:left;vertical-align:top}}
th{{font-size:12px;color:var(--mute);font-weight:600;text-transform:uppercase;letter-spacing:.03em}}td.num,th.num{{text-align:right;font-variant-numeric:tabular-nums}}
td small{{display:block;color:var(--mute);font-size:12px;max-width:340px}}.sym{{font-weight:700}}.pos{{color:var(--pos)}}.neg{{color:var(--neg)}}
.chip{{display:inline-block;font-size:12px;font-weight:700;padding:2px 8px;border-radius:99px;border:1px solid currentColor}}
.chip.add{{color:var(--pos)}}.chip.hold{{color:var(--info)}}.chip.sell{{color:var(--neg)}}
.g{{font-size:12px;font-weight:700;padding:1px 6px;border-radius:4px;border:1px solid var(--line)}}.gA,.gB{{color:var(--pos)}}.gC{{color:var(--warn)}}.gD,.gF{{color:var(--neg)}}
.finds{{display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:12px}}
.find{{background:var(--card);border:1px solid var(--line);border-left:4px solid var(--info);border-radius:10px;padding:12px 14px}}
.find.good{{border-left-color:var(--pos)}}.find.warn{{border-left-color:var(--warn)}}.find.bad{{border-left-color:var(--neg)}}
.find h3{{margin:0 0 4px;font-size:15px}}.find p{{margin:0;color:var(--mute);font-size:14px}}
ul{{padding-left:18px}}
.proj{{background:var(--card);border:1px solid var(--line);border-radius:10px;padding:16px}}.proj p{{color:var(--mute);font-size:13px;margin:12px 0 0}}
.range{{position:relative;height:14px;background:var(--line);border-radius:7px;margin:6px 0 16px}}.band{{position:absolute;top:0;bottom:0;background:var(--info);opacity:.35;border-radius:7px}}
.mid{{position:absolute;top:-3px;bottom:-3px;width:3px;background:var(--info);margin-left:-1px}}.now{{position:absolute;top:-5px;bottom:-5px;width:2px;background:var(--ink);margin-left:-1px}}
.two{{display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:12px}}table.slim{{min-width:0}}
.assess{{background:var(--card);border:1px solid var(--line);border-radius:14px;padding:20px;margin-bottom:8px}}
.ahead{{display:flex;gap:16px;align-items:center;margin-bottom:16px}}.ahead h2{{margin:0}}.ahead p{{margin:2px 0 0;color:var(--mute)}}
.overall{{flex:none;width:84px;height:84px;border-radius:14px;border:1px solid var(--line);display:grid;place-content:center;text-align:center}}
.overall span{{font-size:11px;color:var(--mute);text-transform:uppercase;letter-spacing:.05em}}.overall b{{font-size:34px;line-height:1.1}}
.rcs{{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:10px}}
.rc{{display:flex;gap:12px;padding:12px;border:1px solid var(--line);border-radius:10px}}.rc h3{{margin:0;font-size:14px}}.rc p{{margin:2px 0 0;font-size:13px;color:var(--mute)}}
.big{{flex:none;width:40px;font-size:22px;text-align:center}}
.sh{{font-size:14px;margin:22px 0 8px;text-transform:uppercase;letter-spacing:.04em;color:var(--mute)}}
.alloc{{display:flex;gap:2px;height:22px}}.seg{{flex-basis:0;min-width:3px}}.seg:first-child{{border-radius:4px 0 0 4px}}.seg:last-child{{border-radius:0 4px 4px 0}}
.s1{{background:var(--c1)}}.s2{{background:var(--c2)}}.s3{{background:var(--c3)}}.s4{{background:var(--c4)}}.s5{{background:var(--c5)}}
.legend{{list-style:none;padding:0;margin:10px 0 0;display:grid;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));gap:6px 16px}}
.legend li{{display:grid;grid-template-columns:12px 1fr auto;gap:2px 8px;align-items:baseline;font-size:14px}}.legend small{{display:block;color:var(--mute);font-size:12px}}
.legend em{{grid-column:2/4;font-style:normal;color:var(--mute);font-size:12px;margin-top:-4px}}.sw{{width:12px;height:12px;border-radius:3px;display:inline-block}}
.cols{{display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:4px 24px}}
.ticks,.dots,.todo{{margin:0;padding-left:20px;font-size:14px}}.ticks li,.dots li,.todo li{{margin:6px 0}}.ticks li::marker{{content:"✓  ";color:var(--pos)}}.dots li::marker{{color:var(--warn)}}
.sts{{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:10px}}.st{{border:1px solid var(--line);border-radius:10px;padding:12px}}
.st span{{display:block;font-size:13px;color:var(--mute)}}.st b{{display:block;font-size:20px}}.st small{{color:var(--mute)}}.note{{font-size:13px;color:var(--mute);margin:10px 0 0}}
.kmute{{display:block;color:var(--mute);font-size:12px}}
.ret{{border:1px solid var(--line);border-radius:10px;padding:14px;margin-bottom:12px}}.ret .sh{{margin-top:0}}.ret p{{margin:0 0 8px}}
.parts{{list-style:none;padding:0;margin:0;display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:6px 20px}}
.parts li{{display:flex;justify-content:space-between;gap:8px;font-size:14px;border-bottom:1px dashed var(--line);padding:4px 0}}
.vcs{{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:10px}}
.vc{{border:1px solid var(--line);border-radius:10px;padding:12px}}.vc p{{margin:6px 0;font-size:13px}}.vc small{{color:var(--mute);font-size:12px}}
.vtop{{display:flex;justify-content:space-between;align-items:center}}.vtop b{{font-size:16px}}
.call{{font-size:12px;font-weight:800;letter-spacing:.06em;padding:3px 10px;border-radius:99px;border:1.5px solid currentColor}}
.cBUY{{color:var(--pos)}}.cHOLD{{color:var(--info)}}.cSELL{{color:var(--neg)}}
.pqs{{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:10px}}.pq span{{display:block;color:var(--mute);font-size:12px}}.pq b{{display:block;font-size:18px}}.pq small{{font-size:12px}}.fine{{color:var(--mute);font-size:13px;margin-top:28px}}
</style></head><body><main>
<h1>Robinhood Holdings Scan</h1><p class=sub>Data as of {e(snap['as_of'])} · {e(snap['account']['label'])}</p>
<div class=kpis>
<div class=kpi><span>Account value</span><b>{money(pf['total'])}</b></div>
{ret_kpi}
<div class=kpi><span>Portfolio score</span><b>{pf['w_score']:.0f}/100 · {pf['w_grade']}</b></div>
<div class=kpi><span>In index funds</span><b>{pf['etf_w']:.0f}%</b></div>
<div class=kpi><span>Weighted volatility</span><b>{pf['w_vol']:.0f}%/yr</b></div>
</div>
{assess_html}
{proj_html}
<h2>Positions</h2><div class=wrap><table><thead><tr><th>Symbol</th><th class=num>Value</th><th class=num>Weight</th><th class=num>P&amp;L</th>
<th class=num>13-wk</th><th class=num>Vol</th><th class=num>Analyst upside</th><th class=num>Score</th><th>Action</th></tr></thead>
<tbody>{''.join(trs)}</tbody></table></div>
<h2>Detailed findings</h2><div class=finds>{cards}</div>
<h2>Upcoming earnings</h2><ul>{ev}</ul>
<p class=fine>Score: analyst upside (30) + buy-rating share (15) + momentum (20) + low volatility (20) + valuation (15) for stocks;
index funds swap the analyst factors for a diversification/cost quality score. Rules-based decision aid, not personalized financial, tax, or legal advice.</p>
</main></body></html>"""
    (OUT / "report.html").write_text(doc)
    # Same page without the document skeleton, for publishing as a claude.ai page
    # (the host adds doctype, head and body itself).
    head, body = doc.split("</head><body>", 1)
    style = head[head.index("<style>"):]
    title = "<title>Holdings Scan</title>"
    page = title + "\n" + style.replace(title, "") + "\n" + body.replace("</body></html>", "")
    (OUT / "page.html").write_text(page)


def main():
    snap = json.loads(SNAPSHOT.read_text())
    OUT.mkdir(exist_ok=True)
    rows = scan(snap)
    pf = portfolio_checks(snap, rows)
    events = upcoming_earnings(rows)
    proj = project(snap, rows)
    a = assess(snap, rows, pf, events)
    write_markdown(snap, rows, pf, events, proj, a)
    write_html(snap, rows, pf, events, proj, a)
    print(f"{'SYM':6} {'VALUE':>9} {'WT':>6} {'P&L':>8} {'13WK':>7} {'VOL':>5} {'UPSIDE':>7} {'SCORE':>5}  ACTION")
    for r in rows:
        up = "   n/a" if r["upside"] is None else f"{r['upside']:+6.0f}%"
        print(f"{r['symbol']:6} {r['value']:9,.0f} {r['weight']:5.1f}% {r['pnl']:+8,.0f} "
              f"{r['trend']['ret13']:+6.1f}% {r['trend']['vol']:4.0f}% {up} {r['score']:4} {r['grade']:2}  {r['action']}")
    print(f"\nPortfolio score {pf['w_score']:.0f} ({pf['w_grade']}), unrealized {pf['unrealized']:+,.0f}")
    print("Assessment: " + a["overall"] + " | " + ", ".join(f"{n} {g}" for n, g, _ in a["card"]))
    if proj:
        print(f"Projection to {proj['end']}: " + ", ".join(f"p{p} {v:,.0f}" for p, v in proj["pct"].items())
              + f"; P(loss) {proj['p_loss']:.0f}%")
    print(f"Reports written to {OUT}/report.md and report.html")


if __name__ == "__main__":
    main()
