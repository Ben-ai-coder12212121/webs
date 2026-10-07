#!/usr/bin/env python3
"""Monthly trend-following signals for Robinhood micro futures (or ETFs).

Run once at each month-end (or any time to see the current target):

    python trend_bot.py --capital 25000              # micro futures
    python trend_bot.py --capital 25000 --vol 0.15   # more aggressive
    python trend_bot.py --capital 5000 --etf         # no futures account: long-only ETFs

It prints, for every market, LONG / SHORT / FLAT and how many contracts (or
dollars of ETF) to hold. You place the orders in Robinhood yourself.
Same rules as the backtest in futures.py: 12-month trend decides direction,
each market sized to equal risk, whole book scaled to the target volatility.
"""
import argparse
import math

import pandas as pd

import data
from engine import ohlc_adj
from futures import ETFS, RH_FUTURES, trend_weights

# Micro contract specs: (Robinhood symbol, description, multiplier on the Yahoo price)
MICROS = {
    "ES=F": ("MES", "Micro S&P 500", 5),
    "NQ=F": ("MNQ", "Micro Nasdaq-100", 2),
    "YM=F": ("MYM", "Micro Dow", 0.5),
    "GC=F": ("MGC", "Micro Gold (10 oz)", 10),
    "SI=F": ("SIL", "Micro Silver (1,000 oz)", 1000),
    "HG=F": ("MHG", "Micro Copper (2,500 lb)", 2500),
    "6E=F": ("M6E", "Micro EUR/USD (12,500 EUR)", 12500),
    "6J=F": ("MJY", "Micro JPY/USD (1.25M JPY)", 1_250_000),
    "6B=F": ("M6B", "Micro GBP/USD (6,250 GBP)", 6250),
    "6A=F": ("M6A", "Micro AUD/USD (10,000 AUD)", 10000),
}


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--capital", type=float, required=True, help="dollars allocated to this strategy")
    ap.add_argument("--vol", type=float, default=0.10, help="target annual volatility (default 0.10)")
    ap.add_argument("--etf", action="store_true", help="long-only ETF version, no futures or leverage")
    args = ap.parse_args()

    if args.etf:
        for s in ETFS:
            data.yahoo(s, refresh=True)
        px = pd.DataFrame({s: ohlc_adj(s)["close"] for s in ETFS})
        w = trend_weights(px.pct_change(fill_method=None), px.index[-1], long_only=True,
                          target_vol=args.vol, max_gross=1.0)
        print(f"ETF trend portfolio for ${args.capital:,.0f} as of {px.index[-1].date()}\n")
        for s in ETFS:
            amt = w[s] * args.capital
            action = f"BUY/HOLD ${amt:>10,.0f}  (~{amt / px[s].iloc[-1]:.1f} sh)" if amt > 0 else "FLAT  (sell if held)"
            print(f"  {s:<5} {action}")
        print(f"  {'cash':<5} ${(1 - w.sum()) * args.capital:>10,.0f}  (T-bills / cash sweep)")
        return

    prices = pd.DataFrame({s: data.yahoo(s, refresh=True)["close"] for s in RH_FUTURES})
    prices = prices[prices.index >= "2015-01-01"].ffill(limit=3)
    rets = prices.pct_change(fill_method=None).clip(-0.25, 0.25)
    asof = rets.index[-1]
    w = trend_weights(rets, asof, long_only=False, target_vol=args.vol)

    print(f"Futures trend portfolio for ${args.capital:,.0f}, target vol {args.vol:.0%}, as of {asof.date()}\n")
    print(f"  {'contract':<10}{'market':<30}{'signal':<8}{'target $':>12}{'per contract':>14}{'contracts':>11}")
    total_notional, too_small = 0.0, []
    for y in RH_FUTURES:
        sym, desc, mult = MICROS[y]
        per = prices[y].iloc[-1] * mult
        target = w[y] * args.capital
        n = int(round(target / per)) if per > 0 else 0
        sig = "LONG" if w[y] > 0 else "SHORT" if w[y] < 0 else "FLAT"
        if n == 0 and abs(target) > 0:
            too_small.append(sym)
        total_notional += abs(n) * per
        print(f"  {sym:<10}{desc:<30}{sig:<8}{target:>12,.0f}{per:>14,.0f}{n:>+11d}")
    print(f"\n  Total notional ~${total_notional:,.0f} ({total_notional / args.capital:.1f}x capital). "
          f"Keep the unused cash in the account; margin is a fraction of notional.")
    if too_small:
        need = max(0.5 * prices[y].iloc[-1] * MICROS[y][2] / abs(w[y]) for y in RH_FUTURES if w[y] != 0)
        print(f"  Rounded to 0 (too small for 1 micro contract): {', '.join(too_small)}.\n"
              f"  With these markets missing the portfolio is NOT the backtested strategy. Holding every\n"
              f"  market today needs about ${need:,.0f} at {args.vol:.0%} vol. Use --etf until then.")
    print("  Rebalance once a month. Check Robinhood lists each contract before trading; "
          "roll before expiry.")


if __name__ == "__main__":
    main()
