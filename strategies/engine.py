"""Shared backtest helpers.

Signals are computed from data up to the close of day t and executed at the
OPEN of day t+1 (what you can actually do after looking at a close). Cash that
is not invested earns the 3-month T-bill rate, like Robinhood's cash sweep.
"""
import numpy as np
import pandas as pd

import data

SLIPPAGE = 0.0005  # 0.05% per side for liquid ETFs (Robinhood: $0 commission)


def ohlc_adj(symbol: str) -> pd.DataFrame:
    """Dividend/split adjusted OHLC."""
    d = data.yahoo(symbol)
    k = d["adj"] / d["close"]
    out = pd.DataFrame({"open": d["open"] * k, "high": d["high"] * k,
                        "low": d["low"] * k, "close": d["adj"]}).dropna()
    return out[out["open"] > 0]


def tbill_daily(index: pd.DatetimeIndex) -> pd.Series:
    irx = data.yahoo("^IRX")["close"].reindex(index).ffill().fillna(0)
    return irx / 100 / 252


def run_open_exec(px: pd.DataFrame, want: pd.Series, cost: float = SLIPPAGE) -> pd.Series:
    """Daily returns of holding 0/1 of px, switching at the next day's open."""
    want = want.reindex(px.index).fillna(0).astype(float)
    held = want.shift(1).fillna(0)          # position during day t (after open)
    prev = held.shift(1).fillna(0)          # position during day t-1
    C, O = px["close"], px["open"]
    cc = C / C.shift(1) - 1
    co = C / O - 1                          # entered at open
    oc = O / C.shift(1) - 1                 # exited at open
    cash = tbill_daily(px.index)
    r = (prev * held * cc + (1 - prev) * held * co + prev * (1 - held) * oc
         + (1 - prev) * (1 - held) * cash)
    trades = (held != prev).astype(float)
    return (r - trades * cost).fillna(0)


def run_weights_monthly(prices: pd.DataFrame, weights: pd.DataFrame, cost: float = SLIPPAGE) -> pd.Series:
    """Portfolio of close prices; weights decided at month-end close, applied
    from the next day's close (one-day lag, conservative). Residual weight in T-bills."""
    rets = prices.pct_change().fillna(0)
    w = weights.reindex(prices.index).ffill().shift(1).fillna(0)
    cash_w = (1 - w.sum(axis=1)).clip(lower=0)
    r = (w * rets).sum(axis=1) + cash_w * tbill_daily(prices.index)
    turnover = w.diff().abs().sum(axis=1).fillna(0)
    return r - turnover * cost


def rsi(close: pd.Series, n: int) -> pd.Series:
    d = close.diff()
    up = d.clip(lower=0).ewm(alpha=1 / n, adjust=False).mean()
    dn = (-d.clip(upper=0)).ewm(alpha=1 / n, adjust=False).mean()
    return 100 - 100 / (1 + up / dn)


def month_ends(index: pd.DatetimeIndex) -> pd.DatetimeIndex:
    s = pd.Series(index, index=index)
    return pd.DatetimeIndex(s.groupby([index.year, index.month]).last().values)


def split_stats(r: pd.Series, label: str, split: str = "2015-01-01") -> list[dict]:
    """Full period plus the out-of-sample part after `split`."""
    out = [data.stats(r, label)]
    oos = r[r.index >= split]
    if len(oos) > 250:
        out.append(data.stats(oos, "   ...since " + split[:4]))
    return out
