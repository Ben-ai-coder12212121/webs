"""Swing-trading and tactical strategies on ETFs, with standard textbook
parameters (no tuning). Signals at the close, trades at the next open.

    python swing.py
"""
import numpy as np
import pandas as pd

import data
from engine import month_ends, ohlc_adj, rsi, run_open_exec, run_weights_monthly, split_stats

START = "2000-01-01"


def rsi2(sym):
    """Connors RSI(2): buy when RSI(2) < 10 above the 200-day average, sell when close > 5-day average."""
    px = ohlc_adj(sym)
    c = px["close"]
    r2, sma200, sma5 = rsi(c, 2), c.rolling(200).mean(), c.rolling(5).mean()
    pos, want = 0, []
    for i in range(len(c)):
        if pos == 0 and r2.iloc[i] < 10 and c.iloc[i] > sma200.iloc[i]:
            pos = 1
        elif pos == 1 and c.iloc[i] > sma5.iloc[i]:
            pos = 0
        want.append(pos)
    return run_open_exec(px, pd.Series(want, index=c.index))


def ibs(sym):
    """Internal bar strength: buy when close is in the bottom 20% of the day's range, sell when IBS > 0.8."""
    px = ohlc_adj(sym)
    v = (px["close"] - px["low"]) / (px["high"] - px["low"]).replace(0, np.nan)
    pos, want = 0, []
    for x in v.fillna(0.5):
        if pos == 0 and x < 0.2:
            pos = 1
        elif pos == 1 and x > 0.8:
            pos = 0
        want.append(pos)
    return run_open_exec(px, pd.Series(want, index=px.index))


def sma200_filter(sym):
    """Hold when the month-end close is above the 200-day average, else T-bills."""
    px = ohlc_adj(sym)
    c = px["close"]
    sig = (c > c.rolling(200).mean()).astype(float)
    me = month_ends(c.index)
    want = sig.where(sig.index.isin(me)).ffill().fillna(0)
    return run_open_exec(px, want)


def turn_of_month(sym):
    """Hold from the close 2 days before month-end to the 3rd trading day of the new month."""
    px = ohlc_adj(sym)
    idx = px.index
    s = pd.Series(range(len(idx)), index=idx)
    g = s.groupby([idx.year, idx.month])
    day_of = g.cumcount()
    days_left = g.cumcount(ascending=False)
    # want at close t means held during day t+1
    want = ((days_left <= 2) | (day_of <= 1)).astype(float)
    return run_open_exec(px, want)


def buy_hold(sym):
    px = ohlc_adj(sym)
    return px["close"].pct_change().fillna(0)


def closes(syms):
    return pd.DataFrame({s: ohlc_adj(s)["close"] for s in syms}).dropna()


def dual_momentum():
    """Antonacci GEM: 12-month return of SPY vs EFA; if the winner beats T-bills hold it, else bonds (AGG/IEF)."""
    p = closes(["SPY", "EFA", "IEF"])
    me = month_ends(p.index)
    lb = p.pct_change(252)
    tb = data.yahoo("^IRX")["close"].reindex(p.index).ffill() / 100
    w = pd.DataFrame(0.0, index=me, columns=p.columns)
    for d in me:
        if pd.isna(lb.loc[d, "SPY"]):
            continue
        best = "SPY" if lb.loc[d, "SPY"] >= lb.loc[d, "EFA"] else "EFA"
        w.loc[d, best if lb.loc[d, "SPY"] > tb.loc[d] else "IEF"] = 1.0
    return run_weights_monthly(p, w)


def sector_rotation():
    """Top 3 of 9 SPDR sectors by 6-month return, only while SPY > 200-day average."""
    secs = ["XLK", "XLF", "XLE", "XLV", "XLY", "XLP", "XLI", "XLU", "XLB"]
    p = closes(secs + ["SPY"])
    me = month_ends(p.index)
    mom = p[secs].pct_change(126)
    trend = p["SPY"] > p["SPY"].rolling(200).mean()
    w = pd.DataFrame(0.0, index=me, columns=p.columns)
    for d in me:
        if mom.loc[d].isna().any() or not trend.loc[d]:
            continue
        for s in mom.loc[d].nlargest(3).index:
            w.loc[d, s] = 1 / 3
    return run_weights_monthly(p, w)


def sixty_forty():
    p = closes(["SPY", "IEF"])
    me = month_ends(p.index)
    w = pd.DataFrame({"SPY": 0.6, "IEF": 0.4}, index=me)
    return run_weights_monthly(p, w)


def main():
    rows = []
    tests = [
        ("Buy & hold SPY (benchmark)", lambda: buy_hold("SPY")),
        ("Buy & hold QQQ", lambda: buy_hold("QQQ")),
        ("60/40 SPY/IEF, monthly rebalance", sixty_forty),
        ("RSI(2) mean reversion, SPY", lambda: rsi2("SPY")),
        ("RSI(2) mean reversion, QQQ", lambda: rsi2("QQQ")),
        ("IBS reversal, SPY", lambda: ibs("SPY")),
        ("IBS reversal, QQQ", lambda: ibs("QQQ")),
        ("200-day trend filter, SPY", lambda: sma200_filter("SPY")),
        ("200-day trend filter, QQQ", lambda: sma200_filter("QQQ")),
        ("Turn of month, SPY", lambda: turn_of_month("SPY")),
        ("Dual momentum (SPY/EFA/IEF)", dual_momentum),
        ("Sector rotation top-3 + trend filter", sector_rotation),
    ]
    for label, fn in tests:
        r = fn()
        r = r[r.index >= START]
        rows += split_stats(r, label)
    print("Swing / tactical strategies (signals at close, trades next open, 0.05% slippage/side,")
    print("idle cash earns T-bills). '...since 2015' = recent sub-period.\n")
    data.show(rows)


if __name__ == "__main__":
    main()
