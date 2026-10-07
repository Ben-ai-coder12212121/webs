"""Trend following (time-series momentum), the best-documented futures strategy
(Moskowitz, Ooi & Pedersen 2012; Hurst, Ooi & Pedersen "A Century of
Evidence on Trend-Following"). Standard parameters, no tuning:

  * every month-end, each market's 12-month return decides long (+) or short (-)
  * position size = risk parity, each market targets the same volatility
  * whole portfolio scaled to 10% annual volatility (using recent covariance)

Two versions:
  1. Futures, long/short, on financial and metal futures (Yahoo continuous
     front-month prices; their roll jumps add some noise).
  2. ETFs, long-only (go to T-bills instead of shorting), no leverage.
     Anyone can run this in a normal Robinhood account.

    python futures.py
"""
import numpy as np
import pandas as pd

import data
from engine import month_ends, ohlc_adj, split_stats, tbill_daily

FUTURES = {"ES=F": "S&P 500", "NQ=F": "Nasdaq 100", "YM=F": "Dow", "ZN=F": "10y Treasury",
           "ZB=F": "30y Treasury", "ZF=F": "5y Treasury", "GC=F": "Gold", "SI=F": "Silver",
           "HG=F": "Copper", "6E=F": "Euro", "6J=F": "Yen", "6B=F": "Pound", "6A=F": "Aussie $"}
# Robinhood does not list Treasury futures; this is the universe it does offer
# (micro equity index, metals, FX). Crude is left out because Yahoo's
# continuous crude series has large roll jumps that would corrupt the test.
RH_FUTURES = ["ES=F", "NQ=F", "YM=F", "GC=F", "SI=F", "HG=F", "6E=F", "6J=F", "6B=F", "6A=F"]
ETFS = ["SPY", "EFA", "EEM", "TLT", "IEF", "GLD", "DBC", "VNQ"]
COST = 0.0003  # per unit of turnover (futures: ~$0.50 commission + ~$0.35 fees + 1 tick)


def trend_weights(rets: pd.DataFrame, d, long_only: bool, target_vol=0.10, max_gross=None,
                  lookback=252) -> pd.Series:
    """Target weights (fraction of capital, +long / -short) as of date d."""
    hist = rets.loc[:d]
    vol = hist.tail(63).std() * np.sqrt(252)
    level = (1 + hist.fillna(0)).cumprod()
    mom = level.iloc[-1] / level.iloc[-1 - lookback] - 1 if len(level) > lookback else level.iloc[-1] * np.nan
    # a market needs a full lookback of real prices
    mom[hist.tail(lookback + 1).isna().sum() > lookback // 10] = np.nan
    ok = mom.notna() & vol.notna() & (vol > 0)
    w = pd.Series(0.0, index=rets.columns)
    if ok.sum() < 3:
        return w
    sig = np.sign(mom[ok])
    if long_only:
        sig = sig.clip(lower=0)
    raw = sig / vol[ok]
    # scale the whole book to the target using the recent covariance
    # (correlated markets, e.g. three US bond futures, count as one bet)
    cov = hist[raw.index].tail(126).cov() * 252
    pvol = float(np.sqrt(raw.values @ cov.values @ raw.values))
    raw *= target_vol / pvol if pvol > 0 else 0
    if max_gross and raw.abs().sum() > max_gross:
        raw *= max_gross / raw.abs().sum()
    w[raw.index] = raw
    return w


def trend_portfolio(rets: pd.DataFrame, long_only: bool, target_vol=0.10, max_gross=None,
                    lookback=252, earns_cash=False):
    me = month_ends(rets.index)
    w = pd.DataFrame([trend_weights(rets, d, long_only, target_vol, max_gross, lookback) for d in me],
                     index=me)
    wd = w.reindex(rets.index).ffill().shift(1).fillna(0)
    r = (wd * rets.fillna(0)).sum(axis=1)
    if earns_cash:  # unlevered ETF version: idle money in T-bills
        r += (1 - wd.sum(axis=1)).clip(lower=0) * tbill_daily(rets.index)
    else:           # futures: margin cash sits in T-bills while positions are on
        r += tbill_daily(rets.index)
    turnover = wd.diff().abs().sum(axis=1).fillna(0)
    return r - turnover * COST


def main():
    fut = pd.DataFrame({s: data.yahoo(s)["close"] for s in FUTURES})
    fut = fut[fut.index >= "2000-09-25"].ffill(limit=3)
    fut_r = fut.pct_change(fill_method=None).clip(-0.25, 0.25)

    etf = pd.DataFrame({s: ohlc_adj(s)["close"] for s in ETFS})
    etf_r = etf.pct_change(fill_method=None)

    spy = ohlc_adj("SPY")["close"].pct_change()
    rows = []
    rows += split_stats(spy[spy.index >= "2001-10-01"], "S&P 500 buy & hold (SPY)")
    r = trend_portfolio(fut_r, long_only=False)
    rows += split_stats(r[r.index >= "2001-10-01"], "Futures trend, long/short, 10% vol")
    r15 = trend_portfolio(fut_r, long_only=False, target_vol=0.15)
    rows += split_stats(r15[r15.index >= "2001-10-01"], "Futures trend, long/short, 15% vol")
    rr = trend_portfolio(fut_r[RH_FUTURES], long_only=False)
    rows += split_stats(rr[rr.index >= "2001-10-01"], "Futures trend, Robinhood-listed only, 10% vol")
    re = trend_portfolio(etf_r, long_only=True, target_vol=0.10, max_gross=1.0, earns_cash=True)
    re = re[re.index >= "2008-01-01"]
    rows += split_stats(re, "ETF trend, long-only, no leverage")
    rows += split_stats(spy[spy.index >= "2008-01-01"], "S&P 500 same period")

    # 50/50 blend of SPY and the futures trend portfolio: the classic use
    blend = (0.5 * spy + 0.5 * r).dropna()
    rows += split_stats(blend[blend.index >= "2001-10-01"], "50% S&P + 50% futures trend")
    print(__doc__.split("\n\n")[0])
    print("\nResults:\n")
    data.show(rows)

    print("\nCalendar years, futures trend (10% vol) vs S&P 500:")
    yr = pd.DataFrame({"trend": (1 + r).groupby(r.index.year).prod() - 1,
                       "S&P": (1 + spy).groupby(spy.index.year).prod() - 1}).dropna()
    yr = yr[yr.index >= 2001]
    print("  " + "  ".join(f"{y}:{a:+.0%}/{b:+.0%}" for y, (a, b) in yr.iterrows()))
    print(f"\n  Correlation of daily returns with S&P 500: {r.corr(spy):.2f}")


if __name__ == "__main__":
    main()
