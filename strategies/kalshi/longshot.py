"""Favourite / long-shot bias on Kalshi (the exchange behind Robinhood's
prediction markets), after Robinhood's fee of 2c per contract.

For each sampled settled market we know the order book (best bid/ask) at
48h, 24h, 6h and 1h before close, and the result.

    python kalshi/fetch_kalshi.py
    python kalshi/longshot.py
"""
import json
import math
import os
from collections import defaultdict

import numpy as np

DATA = os.path.join(os.path.dirname(__file__), "..", "data")
FEE = 0.02
BUCKETS = [(0, .05), (.05, .10), (.10, .20), (.20, .35), (.35, .50), (.50, .65), (.65, .80),
           (.80, .90), (.90, .95), (.95, 1.0)]


def load(h):
    rows = []
    for line in open(os.path.join(DATA, "kalshi_longshot.jsonl")):
        m = json.loads(line)
        q = m["quotes"].get(str(h))
        if not q or q["bid"] is None or q["ask"] is None:
            continue
        b, a = q["bid"], q["ask"]
        if not (0 < b < a < 1) or a - b > 0.10:
            continue
        rows.append({"cat": m["category"], "event": m["ticker"].rsplit("-", 1)[0], "y": m["result"] == "yes",
                     "bid": b, "ask": a, "mid": (a + b) / 2, "T": m["close_ts"]})
    return rows


def clustered(pnls, events):
    """Mean and standard error clustered by event (markets in one event are linked)."""
    by = defaultdict(list)
    for p, e in zip(pnls, events):
        by[e].append(p)
    sums = np.array([sum(v) for v in by.values()])
    n = len(pnls)
    mean = sum(pnls) / n
    k = len(sums)
    resid = sums - mean * np.array([len(v) for v in by.values()])
    se = math.sqrt((resid ** 2).sum() * k / max(k - 1, 1)) / n
    return mean, se


def favourite_side(r):
    """Buy whichever side is the favourite: returns (cost, win)."""
    if r["mid"] >= 0.5:
        return r["ask"], r["y"]
    return 1 - r["bid"], not r["y"]


def main():
    for h in (24, 6, 1):
        rows = load(h)
        if not rows:
            continue
        print(f"\n=== {h}h before close: {len(rows)} markets, {len({r['event'] for r in rows})} events ===")
        print(f"  {'YES price':<12}{'n':>6}{'avg price':>11}{'YES won':>9}  "
              f"{'buy YES P&L':>14}{'buy NO P&L':>14}   (per contract, after 2c fee, +/- 1 s.e.)")
        for lo, hi in BUCKETS:
            sel = [r for r in rows if lo <= r["mid"] < hi]
            if len(sel) < 30:
                continue
            ev = [r["event"] for r in sel]
            yes = [(1.0 if r["y"] else 0.0) - r["ask"] - FEE for r in sel]
            no = [(0.0 if r["y"] else 1.0) - (1 - r["bid"]) - FEE for r in sel]
            my, sy = clustered(yes, ev)
            mn, sn = clustered(no, ev)
            print(f"  {f'{lo*100:.0f}-{hi*100:.0f}c':<12}{len(sel):>6}{np.mean([r['mid'] for r in sel])*100:>10.1f}c"
                  f"{np.mean([r['y'] for r in sel]):>9.1%}  {my*100:>+8.2f}c ±{sy*100:4.1f}{mn*100:>+8.2f}c ±{sn*100:4.1f}")

        print("\n  Strategy: buy the FAVOURITE when it costs 80-95c (i.e. sell the long shot):")
        for cat in ["ALL"] + sorted({r["cat"] for r in rows}):
            sel = [r for r in rows if (cat == "ALL" or r["cat"] == cat)]
            trades = []
            for r in sel:
                cost, win = favourite_side(r)
                if 0.80 <= cost <= 0.95:
                    trades.append(((1.0 if win else 0.0) - cost - FEE, r["event"], r["T"], cost + FEE))
            if len(trades) < 30:
                continue
            m, se = clustered([t[0] for t in trades], [t[1] for t in trades])
            trades.sort(key=lambda t: t[2])
            half = len(trades) // 2
            m1 = np.mean([t[0] for t in trades[:half]])
            m2 = np.mean([t[0] for t in trades[half:]])
            print(f"    {cat:<24} n={len(trades):5d}  avg {m*100:+6.2f}c ±{se*100:4.2f}   "
                  f"ROI {m / np.mean([t[3] for t in trades]):+6.1%}   "
                  f"1st half {m1*100:+5.2f}c / 2nd half {m2*100:+5.2f}c")

        # Hypothesis suggested by an early look at the data: YES is overpriced
        # in general (people like buying "yes"), so buy NO on 20-50c YES.
        print("\n  Strategy: buy NO when YES trades at 20-50c (\"YES is overpriced\"):")
        for cat in ["ALL"] + sorted({r["cat"] for r in rows}):
            sel = [r for r in rows if (cat == "ALL" or r["cat"] == cat) and 0.20 <= r["mid"] < 0.50]
            if len(sel) < 30:
                continue
            sel.sort(key=lambda r: r["T"])
            p = [(0.0 if r["y"] else 1.0) - (1 - r["bid"]) - FEE for r in sel]
            m, se = clustered(p, [r["event"] for r in sel])
            half = len(p) // 2
            print(f"    {cat:<24} n={len(p):5d}  avg {m*100:+6.2f}c ±{se*100:4.2f}   "
                  f"1st half {np.mean(p[:half])*100:+5.2f}c / 2nd half {np.mean(p[half:])*100:+5.2f}c")


if __name__ == "__main__":
    main()
