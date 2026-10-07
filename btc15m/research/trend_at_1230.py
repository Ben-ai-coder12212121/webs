"""Test: 'buy the trend with 12:30 left and hold to settlement'.

The trend side is whichever side the market favors (mid > 50c), checked at
the quote just before 12:30 left. Fill = ask at the next minute close
(12:00 left), or the same-minute ask as an optimistic case. Fee 2c.
No parameters are fitted, so all markets are used.
"""
import json, math, os, sys
import numpy as np

DATA = os.path.join(os.path.dirname(__file__), "data")
FEE = 0.02

mkts = [json.loads(l) for l in open(os.path.join(DATA, "kalshi.jsonl"))]
mkts = [m for m in mkts if m["result"] in ("yes", "no")]

def ok(q):
    return q and q["yes_bid"] is not None and q["yes_ask"] is not None and 0 < q["yes_bid"] < q["yes_ask"] < 1

def run(sig_left, fill_left, lo=0.0, hi=1.0, label=""):
    pnl, wins, costs = [], 0, []
    for m in mkts:
        q = {c["ts"]: c for c in m["candles"]}
        qs, qf = q.get(m["close_ts"] - sig_left), q.get(m["close_ts"] - fill_left)
        if not (ok(qs) and ok(qf)):
            continue
        mid = (qs["yes_bid"] + qs["yes_ask"]) / 2
        if mid == 0.5:
            continue
        over = mid > 0.5
        cost = qf["yes_ask"] if over else 1 - qf["yes_bid"]
        if not (lo <= cost < hi):
            continue
        win = (m["result"] == "yes") == over
        pnl.append((1 if win else 0) - cost - FEE); wins += win; costs.append(cost)
    p = np.array(pnl)
    if len(p) == 0:
        print(f"{label:<44} no trades"); return
    se = p.std(ddof=1) / math.sqrt(len(p))
    half = len(p) // 2
    print(f"{label:<44} n={len(p):4d} win={wins/len(p):5.1%} avg cost={np.mean(costs)*100:4.1f}c "
          f"avg P&L={p.mean()*100:+5.2f}c (+/-{se*100:.2f})  total=${p.sum():+7.2f}  "
          f"1st half {p[:half].mean()*100:+.2f}c / 2nd half {p[half:].mean()*100:+.2f}c")

print(f"{len(mkts)} markets, Sep 16 - Oct 7 2026, 1 contract per window\n")
run(780, 720, label="trend @12:30, filled ~12:00 left (realistic)")
run(780, 780, label="trend @13:00, filled same minute (optimistic)")
run(720, 720, label="trend @12:00, filled same minute (optimistic)")
print("\nBy price paid (realistic fill):")
for lo, hi in ((0.4, 0.5), (0.5, 0.6), (0.6, 0.7), (0.7, 0.8), (0.8, 1.0)):
    run(780, 720, lo, hi, label=f"  paid {lo*100:.0f}-{hi*100:.0f}c")
print("\nSame idea without fees (is there any edge at all?):")
FEE = 0.0
run(780, 720, label="trend @12:30, no fee")
