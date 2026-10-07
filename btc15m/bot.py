#!/usr/bin/env python3
"""Live signal bot for Robinhood's "BTC 15 min" up/down prediction markets.

Every 15 minutes a contract asks: will BTC's 60-second average price at the
end of the window be AT OR ABOVE the target price (the 60-second average at
the start)? OVER = "Yes / Up", UNDER = "No / Down". Pays $1 if right.

The bot prices that contract from live BTC spot and volatility, compares it
with the market price, and tells you when to BUY OVER, BUY UNDER, SELL, or do
nothing. It does not place orders -- you tap the trade in Robinhood.

    python bot.py                  # live dashboard
    python bot.py --bankroll 500   # also size trades
    python bot.py --once           # print one snapshot and exit

While it runs, type a command and press Enter:
    rh 63 39          Robinhood prices in cents: OVER ask, UNDER ask
                      (use when the app shows different prices than Kalshi)
    rh off            go back to Kalshi's live order book prices
    own over 10 55    you bought 10 OVER at 55c  (so the bot can say SELL/HOLD)
    own under 4 38
    flat              you no longer hold a position
    bank 800          set bankroll for sizing
    q                 quit
"""

from __future__ import annotations

import argparse
import csv
import math
import os
import sys
import threading
import time
from collections import deque
from datetime import datetime

import numpy as np

import feeds
import model

# ---- strategy parameters (see README "Backtest results") -------------------
FEE = 0.02             # Robinhood: 1c commission + 1c exchange fee per contract per side
MIN_EDGE = 0.05        # required edge after fees to buy (vs market-anchored fair value)
MIN_EDGE_SPOT_ONLY = 0.10  # when no live order book is available and only the spot model prices it
MIN_SECS_LEFT = 90     # don't open new trades in the last 90s (can't fill in time)
MAX_SECS_LEFT = 13 * 60  # skip the first 2 minutes (vol/target still settling)
PRICE_LO, PRICE_HI = 0.10, 0.90  # avoid lottery tickets and 95c "picking up pennies"
SELL_MARGIN = 0.03     # sell early when the bid beats fair value by this much after fees
KELLY_FRACTION = 0.25
MAX_RISK_PCT = 0.03    # never risk more than 3% of bankroll on one contract window


class State:
    def __init__(self, bankroll: float | None):
        self.bankroll = bankroll
        self.rh_over_ask: float | None = None
        self.rh_under_ask: float | None = None
        self.rh_ticker: str | None = None
        self.pos_side: str | None = None
        self.pos_qty = 0
        self.pos_cost = 0.0
        self.pos_ticker: str | None = None
        self.quit = False
        self.msg = ""
        self.lock = threading.Lock()


def read_commands(st: State):
    for line in sys.stdin:
        parts = line.strip().lower().split()
        if not parts:
            continue
        with st.lock:
            try:
                cmd = parts[0]
                if cmd in ("q", "quit", "exit"):
                    st.quit = True
                    return
                elif cmd == "rh" and len(parts) == 2 and parts[1] == "off":
                    st.rh_over_ask = st.rh_under_ask = None
                    st.msg = "using Kalshi prices"
                elif cmd == "rh" and len(parts) == 3:
                    st.rh_over_ask = float(parts[1]) / 100
                    st.rh_under_ask = float(parts[2]) / 100
                    st.rh_ticker = None  # bound to the current market on next tick
                    st.msg = f"Robinhood prices set: OVER {parts[1]}c / UNDER {parts[2]}c"
                elif cmd == "own" and len(parts) == 4 and parts[1] in ("over", "under"):
                    st.pos_side = parts[1].upper()
                    st.pos_qty = int(parts[2])
                    st.pos_cost = float(parts[3]) / 100
                    st.pos_ticker = None
                    st.msg = f"position: {st.pos_qty} {st.pos_side} @ {parts[3]}c"
                elif cmd == "flat":
                    st.pos_side, st.pos_qty, st.pos_ticker = None, 0, None
                    st.msg = "position cleared"
                elif cmd == "bank" and len(parts) == 2:
                    st.bankroll = float(parts[1])
                    st.msg = f"bankroll ${st.bankroll:,.2f}"
                else:
                    st.msg = f"unknown command: {line.strip()}"
            except ValueError:
                st.msg = f"could not parse: {line.strip()}"


class Spot:
    """Per-second composite spot samples plus 1-minute history for volatility."""

    def __init__(self):
        now = int(time.time()) // 60 * 60
        hist = feeds.coinbase_candles(now - 1440 * 60, now)
        self.closes = {c[0] + 60: c[4] for c in hist}  # minute-end ts -> close
        self.samples: deque[tuple[float, float]] = deque(maxlen=1200)
        self.last_refresh = 0.0

    def tick(self) -> float:
        px, _ = feeds.composite_spot()
        t = time.time()
        self.samples.append((t, px))
        m = int(t) // 60 * 60
        self.closes.setdefault(m, px)  # first sample after a minute boundary
        if t - self.last_refresh > 60:
            self.last_refresh = t
            try:
                for c in feeds.coinbase_candles(m - 30 * 60, m):
                    self.closes[c[0] + 60] = c[4]
            except Exception:
                pass
            for k in sorted(self.closes)[:-1500]:
                del self.closes[k]
        return px

    def sigma(self) -> float:
        ks = sorted(self.closes)
        return model.vol_per_sqrt_sec(np.array([self.closes[k] for k in ks]))

    def price_at(self, ts: int) -> float | None:
        if ts in self.closes:
            return self.closes[ts]
        near = [k for k in self.closes if abs(k - ts) <= 60]
        return self.closes[min(near, key=lambda k: abs(k - ts))] if near else None

    def avg_between(self, t0: float, t1: float) -> tuple[float, int]:
        xs = [p for t, p in self.samples if t0 <= t < t1]
        return (sum(xs), len(xs))


def kelly_contracts(p_win: float, cost: float, bankroll: float) -> int:
    c = cost + FEE
    if c >= 1 or p_win <= c:
        return 0
    f = (p_win - c) / (1 - c) * KELLY_FRACTION
    f = min(f, MAX_RISK_PCT)
    return max(int(bankroll * f / c), 0)


def decide(st: State, mkt: dict, p: float, anchored: bool, secs_left: float):
    """p is the fair P(over). Returns (action lines, over_ask, under_ask,
    over_bid, under_bid, source, buy signal or None)."""
    min_edge = MIN_EDGE if anchored else MIN_EDGE_SPOT_ONLY
    use_rh = st.rh_over_ask is not None and st.rh_ticker == mkt["ticker"]
    if use_rh:
        over_ask, under_ask = st.rh_over_ask, st.rh_under_ask
        # Robinhood shows asks; estimate bids from the complementary side.
        over_bid, under_bid = 1 - under_ask, 1 - over_ask
        src = "Robinhood (manual)"
    else:
        over_ask, under_ask = mkt["yes_ask"], mkt["no_ask"]
        over_bid, under_bid = mkt["yes_bid"], mkt["no_bid"]
        src = "Kalshi order book"

    lines = []
    if st.pos_side and st.pos_ticker == mkt["ticker"]:
        p_side = p if st.pos_side == "OVER" else 1 - p
        bid = over_bid if st.pos_side == "OVER" else under_bid
        pnl_now = ((bid or 0) - st.pos_cost - FEE) * st.pos_qty
        if bid is not None and bid - FEE >= p_side + SELL_MARGIN:
            lines.append(f">>> SELL {st.pos_qty} {st.pos_side} at {bid*100:.0f}c  "
                         f"(bid beats fair {p_side*100:.0f}c; locks ${pnl_now:+.2f})")
        else:
            lines.append(f"HOLD {st.pos_qty} {st.pos_side} to settlement  "
                         f"(fair {p_side*100:.0f}c vs bid {('%.0f' % (bid*100)) if bid else '--'}c; "
                         f"EV ${(p_side - st.pos_cost - FEE) * st.pos_qty:+.2f})")
        return lines, over_ask, under_ask, over_bid, under_bid, src, None

    if over_ask is None or under_ask is None:
        return ["no prices yet"], over_ask, under_ask, over_bid, under_bid, src, None
    e_over = p - over_ask - FEE
    e_under = (1 - p) - under_ask - FEE
    side, cost, edge, p_side = (("OVER", over_ask, e_over, p) if e_over >= e_under
                                else ("UNDER", under_ask, e_under, 1 - p))
    if secs_left > MAX_SECS_LEFT:
        lines.append(f"WAIT - first {(900 - MAX_SECS_LEFT) // 60} minutes of the window, no entries")
    elif secs_left < MIN_SECS_LEFT:
        lines.append("WAIT - too close to expiry to fill reliably; next window soon")
    elif not (PRICE_LO <= cost <= PRICE_HI):
        lines.append(f"NO TRADE - {side} costs {cost*100:.0f}c (outside {PRICE_LO*100:.0f}-{PRICE_HI*100:.0f}c band)")
    elif edge >= min_edge:
        size = ""
        if st.bankroll:
            n = kelly_contracts(p_side, cost, st.bankroll)
            size = f"  size: {n} contracts (${n * (cost + FEE):.2f})" if n else "  size: 0 (edge too thin for bankroll)"
        arrow = "UP / YES" if side == "OVER" else "DOWN / NO"
        lines.append(f">>> BUY {side} ({arrow}) at <= {math.floor((p_side - FEE - min_edge) * 100 + 1e-9)}c"
                     f"   now {cost*100:.0f}c, fair {p_side*100:.0f}c, edge {edge*100:+.1f}c{size}")
        return lines, over_ask, under_ask, over_bid, under_bid, src, (side, cost, p_side, edge)
    else:
        lines.append(f"NO TRADE - best edge {side} {edge*100:+.1f}c < {min_edge*100:.0f}c needed")
    return lines, over_ask, under_ask, over_bid, under_bid, src, None


def log_signal(path: str, mkt: dict, buy, secs_left: float, src: str):
    side, cost, p_side, edge = buy
    new = not os.path.exists(path)
    with open(path, "a", newline="") as f:
        w = csv.writer(f)
        if new:
            w.writerow(["time", "ticker", "side", "price", "fair", "edge", "secs_left", "price_source"])
        w.writerow([datetime.now().isoformat(timespec="seconds"), mkt["ticker"], side,
                    f"{cost:.3f}", f"{p_side:.3f}", f"{edge:.3f}", int(secs_left), src])


def report(path: str):
    """Paper-trading scorecard: 1 contract per logged signal, held to settlement."""
    if not os.path.exists(path):
        print(f"no log at {path}")
        return
    with open(path) as f:
        rows = list(csv.DictReader(f))
    pnl, n, wins, pending = 0.0, 0, 0, 0
    for r in rows:
        try:
            m = feeds.get_json(f"{feeds.KALSHI}/markets/{r['ticker']}")["market"]
        except Exception:
            pending += 1
            continue
        if m.get("result") not in ("yes", "no"):
            pending += 1
            continue
        win = (m["result"] == "yes") == (r["side"] == "OVER")
        p = (1.0 if win else 0.0) - float(r["price"]) - FEE
        pnl += p
        n += 1
        wins += win
        print(f"{r['time']}  {r['ticker']:<26} {r['side']:<5} @ {float(r['price'])*100:4.0f}c  "
              f"{'WIN ' if win else 'LOSS'}  {p*100:+6.1f}c")
    if n:
        print(f"\n{n} settled signals, win rate {wins/n:.1%}, P&L ${pnl:+.2f} per 1 contract each "
              f"({pnl/n*100:+.2f}c/trade){f', {pending} pending' if pending else ''}")
    else:
        print(f"no settled signals yet ({pending} pending)")


def fmt_c(x):
    return "--" if x is None else f"{x*100:.1f}c"


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--bankroll", type=float, default=None)
    ap.add_argument("--interval", type=float, default=2.0, help="seconds between updates")
    ap.add_argument("--once", action="store_true")
    ap.add_argument("--log", default="signals.csv",
                    help="paper-trade log of every BUY signal (first per window); '' to disable")
    ap.add_argument("--report", action="store_true", help="score the signal log against settled results")
    args = ap.parse_args()
    if args.report:
        report(args.log)
        return

    st = State(args.bankroll)
    print("loading 24h of BTC history for volatility...", flush=True)
    spot = Spot()
    if not args.once:
        threading.Thread(target=read_commands, args=(st,), daemon=True).start()

    mkt, mkt_fetched, last_signal = None, 0.0, None
    logged: dict = {}
    while not st.quit:
        loop_start = time.time()
        try:
            S = spot.tick()
            if mkt is None or time.time() - mkt_fetched > 3 or time.time() > mkt["close_ts"]:
                mkt = feeds.current_market() or mkt
                mkt_fetched = time.time()
        except Exception as e:
            print(f"data error: {e}", flush=True)
            time.sleep(args.interval)
            continue
        if not mkt:
            print("no open BTC 15-min market found", flush=True)
            time.sleep(5)
            continue

        now = time.time()
        secs_left = mkt["close_ts"] - now
        strike = mkt["strike"]
        if not strike:  # not yet published: compute from our own samples
            s, n = spot.avg_between(mkt["open_ts"] - 60, mkt["open_ts"])
            strike = s / n if n else spot.price_at(mkt["open_ts"]) or S
        open_px = spot.price_at(mkt["open_ts"]) or strike
        sigma = spot.sigma()
        settle_obs = spot.avg_between(mkt["close_ts"] - 60, now) if secs_left <= 60 else None
        window_ret = math.log(S / open_px)
        fair = model.fair_value(S, strike, secs_left, sigma,
                                window_ret=window_ret, settle_avg_so_far=settle_obs)
        yb, ya = mkt["yes_bid"], mkt["yes_ask"]
        anchored = bool(yb and ya and 0 < yb < ya < 1 and ya - yb <= 0.05)
        p_mkt = model.market_fair((yb + ya) / 2, window_ret, sigma) if anchored else None
        p_fair = p_mkt if anchored else fair.p_over

        with st.lock:
            if st.rh_over_ask is not None and st.rh_ticker is None:
                st.rh_ticker = mkt["ticker"]
            if st.pos_side and st.pos_ticker is None:
                st.pos_ticker = mkt["ticker"]
            if st.pos_side and st.pos_ticker != mkt["ticker"]:
                st.msg = f"previous window settled; position on {st.pos_ticker} cleared"
                st.pos_side, st.pos_qty, st.pos_ticker = None, 0, None
            if st.rh_ticker and st.rh_ticker != mkt["ticker"]:
                st.rh_over_ask = st.rh_under_ask = st.rh_ticker = None
            lines, oa, ua, ob, ub, src, buy = decide(st, mkt, p_fair, anchored, secs_left)
            msg = st.msg

        start_s = datetime.fromtimestamp(mkt["open_ts"]).strftime("%H:%M")
        end_s = datetime.fromtimestamp(mkt["close_ts"]).strftime("%H:%M")
        out = []
        if not args.once:
            out.append("\033[2J\033[H")
        out.append(f"BTC 15-min  {start_s}-{end_s}   {int(secs_left)//60}:{int(secs_left)%60:02d} left   [{mkt['ticker']}]")
        out.append(f"BTC now ${S:,.2f}   target ${strike:,.2f}   diff {S-strike:+,.2f} "
                   f"({fair.z:+.2f} sd)   expected move left +/-${fair.sigma_left:,.0f}")
        out.append(f"FAIR VALUE   OVER {p_fair*100:5.1f}c   UNDER {(1-p_fair)*100:5.1f}c   "
                   + ("(market-anchored)" if anchored else "(spot model only - no live book)"))
        out.append(f"spot model  OVER {fair.p_over*100:5.1f}c"
                   + (f"   (disagrees with market by {abs(fair.p_over - p_fair)*100:.0f}c - in backtests the market was right)"
                      if anchored and abs(fair.p_over - p_fair) > 0.15 else ""))
        out.append(f"MARKET ({src})   OVER ask {fmt_c(oa)} bid {fmt_c(ob)}   UNDER ask {fmt_c(ua)} bid {fmt_c(ub)}")
        out.append("")
        out.extend(lines)
        out.append("")
        if st.bankroll:
            out.append(f"bankroll ${st.bankroll:,.2f}")
        if msg:
            out.append(f"[{msg}]")
        if not args.once:
            out.append("commands: rh <over> <under> | rh off | own over|under <qty> <cents> | flat | bank <$> | q")
        if buy and args.log and logged.get(mkt["ticker"]) is None:
            logged[mkt["ticker"]] = buy
            log_signal(args.log, mkt, buy, secs_left, src)
        signal = lines[0] if lines and lines[0].startswith(">>>") else None
        if signal and signal.split("  ")[0] != last_signal:
            out.append("\a")
        last_signal = signal.split("  ")[0] if signal else None
        print("\n".join(out), flush=True)

        if args.once:
            return
        time.sleep(max(0.0, args.interval - (time.time() - loop_start)))


if __name__ == "__main__":
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    main()
