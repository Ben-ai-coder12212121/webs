"""Backtest the fair-value strategy against real KXBTC15M quotes.

    python research/fetch_history.py --days 21
    python research/backtest.py

Decisions at minute t use only spot data up to t. Fills are taken at the
contract quotes one minute LATER (t+1) by default, to approximate the delay of
reading a signal and tapping buy in the Robinhood app.
"""
import argparse
import json
import math
import os
import sys
from collections import defaultdict

import numpy as np

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
import model  # noqa: E402

DATA = os.path.join(os.path.dirname(__file__), "data")
FEE = 0.02  # Robinhood: $0.01 commission + $0.01 exchange fee per contract, per side


def load():
    with open(os.path.join(DATA, "coinbase_1m.json")) as f:
        candles = json.load(f)
    # Coinbase candle ts = minute start; its close is the price at ts + 60.
    ts = np.array([c[0] + 60 for c in candles], dtype=np.int64)
    close = np.array([c[4] for c in candles], dtype=float)
    mkts = []
    with open(os.path.join(DATA, "kalshi.jsonl")) as f:
        for line in f:
            m = json.loads(line)
            if m["result"] in ("yes", "no") and m["strike"]:
                mkts.append(m)
    mkts.sort(key=lambda m: m["close_ts"])
    return ts, close, mkts


def build_samples(ts, close, mkts):
    """One row per (market, decision minute)."""
    idx = {int(t): i for i, t in enumerate(ts)}
    rows = []
    sigma_cache = {}
    for m in mkts:
        T, O, K = m["close_ts"], m["open_ts"], m["strike"]
        y = 1 if m["result"] == "yes" else 0
        quotes = {c["ts"]: c for c in m["candles"]}
        i_open = idx.get(O)
        if i_open is None:
            continue
        for e in range(O + 60, T, 60):
            i = idx.get(e)
            q_now, q_next = quotes.get(e), quotes.get(e + 60)
            if i is None or q_now is None or i < 300:
                continue
            if e not in sigma_cache:
                sigma_cache[e] = model.vol_per_sqrt_sec(close[max(0, i - 1440):i + 1])
            sig = sigma_cache[e]
            S = close[i]
            secs_left = T - e
            tau = model.effective_tau(secs_left)
            z = math.log(S / K) / (sig * math.sqrt(tau))
            mom = math.log(S / close[i_open]) / (sig * math.sqrt(900))
            prev15 = math.log(close[i_open] / close[max(0, i_open - 15)]) / (sig * math.sqrt(900))
            rows.append(dict(
                ticker=m["ticker"], T=T, e=e, secs_left=secs_left, y=y,
                p_base=model.norm_cdf(z), z=z, mom=mom, prev15=prev15,
                now=q_now, nxt=q_next,
            ))
    return rows


def fit_logistic(X, y, l2=1e-3, iters=50):
    w = np.zeros(X.shape[1])
    for _ in range(iters):
        p = 1 / (1 + np.exp(-X @ w))
        g = X.T @ (p - y) + l2 * w
        H = (X * (p * (1 - p))[:, None]).T @ X + l2 * np.eye(len(w))
        w -= np.linalg.solve(H, g)
    return w


def logloss(p, y):
    p = np.clip(p, 1e-4, 1 - 1e-4)
    return float(-np.mean(y * np.log(p) + (1 - y) * np.log(1 - p)))


def brier(p, y):
    return float(np.mean((p - y) ** 2))


def L(p):
    p = np.clip(p, 1e-4, 1 - 1e-4)
    return np.log(p / (1 - p))


def quotes_ok(q):
    return q and q["yes_bid"] is not None and q["yes_ask"] is not None and \
        0 < q["yes_bid"] < q["yes_ask"] < 1 and q["yes_ask"] - q["yes_bid"] <= 0.05


def simulate(rows, p_fn, min_edge, fill="nxt", min_secs=90, max_secs=840,
             price_lo=0.05, price_hi=0.95, one_per_market=True):
    """Buy 1 contract of the side with edge >= min_edge after fees; hold to settlement."""
    trades = []
    taken = set()
    for r in rows:
        if r["secs_left"] < min_secs or r["secs_left"] > max_secs:
            continue
        if one_per_market and r["ticker"] in taken:
            continue
        q = r[fill]
        if not quotes_ok(q):
            continue
        p = p_fn(r)
        over_cost = q["yes_ask"]
        under_cost = 1 - q["yes_bid"]
        e_over = p - over_cost - FEE
        e_under = (1 - p) - under_cost - FEE
        side, cost, edge = ("OVER", over_cost, e_over) if e_over >= e_under else ("UNDER", under_cost, e_under)
        if edge < min_edge or not (price_lo <= cost <= price_hi):
            continue
        win = (r["y"] == 1) if side == "OVER" else (r["y"] == 0)
        pnl = (1.0 if win else 0.0) - cost - FEE
        trades.append(dict(side=side, cost=cost, edge=edge, win=win, pnl=pnl,
                           secs_left=r["secs_left"], T=r["T"]))
        taken.add(r["ticker"])
    return trades


def simulate_limit(rows, p_fn, min_edge, rest_min=3, min_secs=120, max_secs=840,
                   price_lo=0.10, price_hi=0.90):
    """Post a resting limit buy at (fair - fee - min_edge) on the side the model
    favours versus the market mid; filled if the opposing quote trades through
    it within rest_min minutes. Evaluated on the outcome, so adverse selection
    (getting filled only when the market moves against you) is included."""
    by_mkt = defaultdict(list)
    for r in rows:
        by_mkt[r["ticker"]].append(r)
    trades = []
    for rs in by_mkt.values():
        rs.sort(key=lambda r: r["e"])
        for i, r in enumerate(rs):
            if not (min_secs <= r["secs_left"] <= max_secs) or not quotes_ok(r["now"]):
                continue
            p = p_fn(r)
            mid = (r["now"]["yes_bid"] + r["now"]["yes_ask"]) / 2
            side = "OVER" if p >= mid else "UNDER"
            p_side = p if side == "OVER" else 1 - p
            L = math.floor((p_side - FEE - min_edge) * 100) / 100
            if not (price_lo <= L <= price_hi):
                continue
            filled = None
            for r2 in rs[i + 1:i + 1 + rest_min]:
                q = r2["now"]
                if not quotes_ok(q) or r2["secs_left"] < 60:
                    continue
                if (side == "OVER" and q["yes_ask"] <= L) or (side == "UNDER" and 1 - q["yes_bid"] <= L):
                    filled = r2
                    break
            if filled is None:
                continue
            win = (r["y"] == 1) if side == "OVER" else (r["y"] == 0)
            trades.append(dict(side=side, cost=L, edge=p_side - L - FEE, win=win,
                               pnl=(1.0 if win else 0.0) - L - FEE, secs_left=filled["secs_left"], T=r["T"]))
            break
    return trades


def summarize(trades, label):
    if not trades:
        print(f"  {label:<38} no trades")
        return
    pnl = np.array([t["pnl"] for t in trades])
    cost = np.array([t["cost"] + FEE for t in trades])
    wins = np.mean([t["win"] for t in trades])
    se = pnl.std(ddof=1) / math.sqrt(len(pnl)) if len(pnl) > 1 else float("nan")
    # max drawdown in $ per 1-contract bets
    eq = np.cumsum(pnl)
    dd = float(np.max(np.maximum.accumulate(eq) - eq)) if len(eq) else 0.0
    print(f"  {label:<38} n={len(pnl):5d}  win={wins:5.1%}  avg pnl={pnl.mean()*100:+6.2f}c "
          f"(+/-{se*100:4.2f})  ROI={pnl.sum()/cost.sum():+6.1%}  total=${pnl.sum():+7.2f}  maxDD=${dd:.2f}")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--train-frac", type=float, default=0.6)
    args = ap.parse_args()

    ts, close, mkts = load()
    rows = build_samples(ts, close, mkts)
    cut_T = mkts[int(len(mkts) * args.train_frac)]["close_ts"]
    train = [r for r in rows if r["T"] < cut_T]
    test = [r for r in rows if r["T"] >= cut_T]
    print(f"markets={len(mkts)}  samples={len(rows)}  train={len(train)}  test={len(test)}")
    print(f"OVER base rate: {np.mean([m['result']=='yes' for m in mkts]):.3f}")
    idx = {int(t): i for i, t in enumerate(ts)}
    err = [close[idx[m["open_ts"]]] - m["strike"] for m in mkts if m["open_ts"] in idx]
    print(f"Coinbase close vs official target: mean {np.mean(err):+.2f}$, "
          f"abs median {np.median(np.abs(err)):.2f}$")

    def arr(rs, k):
        return np.array([r[k] for r in rs], dtype=float)

    # --- 1. calibration of the random-walk model -------------------------
    ytr, yte = arr(train, "y"), arr(test, "y")
    Xtr = np.c_[L(arr(train, "p_base")), arr(train, "mom"), arr(train, "prev15"), np.ones(len(train))]
    Xte = np.c_[L(arr(test, "p_base")), arr(test, "mom"), arr(test, "prev15"), np.ones(len(test))]
    w_full = fit_logistic(Xtr, ytr)
    w_a = fit_logistic(Xtr[:, [0, 3]], ytr)
    print("\nRecalibration fit (train):")
    print(f"  a only:             a={w_a[0]:.3f} b0={w_a[1]:+.3f}")
    print(f"  a + momentum terms: a={w_full[0]:.3f} b_mom={w_full[1]:+.3f} "
          f"b_prev15={w_full[2]:+.3f} b0={w_full[3]:+.3f}")

    mid_te = np.array([(r["now"]["yes_bid"] + r["now"]["yes_ask"]) / 2 if quotes_ok(r["now"]) else np.nan
                       for r in test])
    ok = ~np.isnan(mid_te)
    p_base_te = arr(test, "p_base")
    p_a_te = 1 / (1 + np.exp(-Xte[:, [0, 3]] @ w_a))
    p_full_te = 1 / (1 + np.exp(-Xte @ w_full))
    print("\nOut-of-sample accuracy (lower is better), same rows, where market quote valid:")
    for name, p in [("random-walk model", p_base_te), ("recalibrated (a)", p_a_te),
                    ("recalibrated + momentum", p_full_te), ("Kalshi market mid", mid_te)]:
        print(f"  {name:<26} logloss={logloss(p[ok], yte[ok]):.4f}  brier={brier(p[ok], yte[ok]):.4f}")

    # Does the model add information beyond the market price?
    mid_tr = np.array([(r["now"]["yes_bid"] + r["now"]["yes_ask"]) / 2 if quotes_ok(r["now"]) else np.nan
                       for r in train])
    ok_tr = ~np.isnan(mid_tr)
    Xs = np.c_[L(mid_tr[ok_tr]), Xtr[ok_tr, 0], Xtr[ok_tr, 1], np.ones(ok_tr.sum())]
    w_s = fit_logistic(Xs, ytr[ok_tr])
    print(f"\nStacked fit y ~ logit(mid) + logit(model) + mom (train): "
          f"mid={w_s[0]:.3f} model={w_s[1]:.3f} mom={w_s[2]:+.3f} b0={w_s[3]:+.3f}")
    Xs_te = np.c_[L(mid_te[ok]), Xte[ok, 0], Xte[ok, 1], np.ones(ok.sum())]
    p_s = 1 / (1 + np.exp(-Xs_te @ w_s))
    print(f"  stacked out-of-sample logloss={logloss(p_s, yte[ok]):.4f}  brier={brier(p_s, yte[ok]):.4f}")

    # Calibration table of the recalibrated model
    print("\nReliability (test, recalibrated+momentum):")
    bins = np.linspace(0, 1, 11)
    for lo, hi in zip(bins[:-1], bins[1:]):
        sel = (p_full_te >= lo) & (p_full_te < hi)
        if sel.sum() > 30:
            print(f"  p in [{lo:.1f},{hi:.1f}): n={sel.sum():5d}  predicted={p_full_te[sel].mean():.3f}  actual={yte[sel].mean():.3f}")

    # --- 2. trading simulation on the test period -----------------------
    def p_model(r):
        x = np.array([L(np.array([r["p_base"]]))[0], r["mom"], r["prev15"], 1.0])
        return float(1 / (1 + np.exp(-x @ w_full)))

    def p_stack(r):
        q = r["now"]
        if not quotes_ok(q):
            return 0.5
        mid = (q["yes_bid"] + q["yes_ask"]) / 2
        x = np.array([L(np.array([mid]))[0], L(np.array([r["p_base"]]))[0], r["mom"], 1.0])
        return float(1 / (1 + np.exp(-x @ w_s)))

    for fill in ("now", "nxt"):
        print(f"\nStrategy sim, TEST period, fills at {'same-minute' if fill=='now' else 'NEXT-minute (realistic manual)'} quotes, fee {FEE*100:.0f}c:")
        for me in (0.0, 0.02, 0.04, 0.06, 0.08, 0.10):
            summarize(simulate(test, p_model, me, fill=fill), f"model edge>={me*100:.0f}c")
        for me in (0.02, 0.04, 0.06):
            summarize(simulate(test, p_stack, me, fill=fill), f"stacked edge>={me*100:.0f}c")

    print("\nResting LIMIT orders at fair - fee - edge (test, maker-style):")
    for me in (0.0, 0.02, 0.04, 0.06, 0.08):
        for rest in (2, 5):
            summarize(simulate_limit(test, p_model, me, rest_min=rest),
                      f"limit edge>={me*100:.0f}c rest {rest}m")

    print("\nBy time remaining (model, edge>=4c, next-minute fills):")
    for lo, hi in ((60, 240), (240, 480), (480, 720), (720, 900)):
        summarize(simulate(test, p_model, 0.04, fill="nxt", min_secs=lo, max_secs=hi - 1),
                  f"{lo//60}-{hi//60} min left")

    print("\nBy entry price (model, edge>=4c, next-minute fills):")
    for lo, hi in ((0.05, 0.3), (0.3, 0.5), (0.5, 0.7), (0.7, 0.95)):
        summarize(simulate(test, p_model, 0.04, fill="nxt", price_lo=lo, price_hi=hi),
                  f"cost {lo:.2f}-{hi:.2f}")

    # Baselines
    print("\nBaselines (test, next-minute fills):")
    summarize(simulate(test, lambda r: 1.0 if r["now"] and r["now"]["yes_bid"] and
                       (r["now"]["yes_bid"] + r["now"]["yes_ask"]) / 2 >= 0.5 else 0.0,
                       -1, fill="nxt", min_secs=180, max_secs=239), "buy the favourite @ 3 min left")
    summarize(simulate(test, lambda r: 1.0 if r["mom"] > 0 else 0.0, -1, fill="nxt",
                       min_secs=600, max_secs=659), "momentum @ 10 min left")

    # Panic fade: one-minute jump in mid of >= X, buy the other side next minute
    print("\nPanic fade (test):")
    by_mkt = defaultdict(list)
    for r in test:
        by_mkt[r["ticker"]].append(r)
    for thr in (0.10, 0.15, 0.20, 0.25):
        trades = []
        for rs in by_mkt.values():
            for a, b in zip(rs, rs[1:]):
                if not (quotes_ok(a["now"]) and quotes_ok(b["now"]) and quotes_ok(b["nxt"])):
                    continue
                if b["secs_left"] < 120:
                    continue
                ma = (a["now"]["yes_bid"] + a["now"]["yes_ask"]) / 2
                mb = (b["now"]["yes_bid"] + b["now"]["yes_ask"]) / 2
                d = mb - ma
                if abs(d) < thr:
                    continue
                q = b["nxt"]
                side_over = d < 0
                cost = q["yes_ask"] if side_over else 1 - q["yes_bid"]
                win = (b["y"] == 1) == side_over
                trades.append(dict(cost=cost, win=win, pnl=(1.0 if win else 0.0) - cost - FEE))
                break
        summarize(trades, f"fade 1-min move >= {thr*100:.0f}c")

    with open(os.path.join(DATA, "calibration.json"), "w") as f:
        json.dump({"a": w_full[0], "b_mom": w_full[1], "b_prev15": w_full[2], "b0": w_full[3],
                   "stack": {"mid": w_s[0], "model": w_s[1], "mom": w_s[2], "b0": w_s[3]}}, f, indent=1)


if __name__ == "__main__":
    main()
