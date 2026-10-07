"""Daily price history from Yahoo Finance (adjusted for splits and dividends)
and CBOE index files, cached as CSV under data/."""
import io
import os
import time

import pandas as pd
import requests

DATA = os.path.join(os.path.dirname(os.path.abspath(__file__)), "data")
UA = {"User-Agent": "Mozilla/5.0"}


def yahoo(symbol: str, refresh: bool = False) -> pd.DataFrame:
    """Columns: open high low close adj (adjusted close) volume, indexed by date."""
    path = os.path.join(DATA, f"{symbol.replace('^', '_').replace('=', '_')}.csv")
    if os.path.exists(path) and not refresh:
        return pd.read_csv(path, index_col=0, parse_dates=True)
    url = f"https://query1.finance.yahoo.com/v8/finance/chart/{symbol}"
    params = {"period1": 0, "period2": int(time.time()), "interval": "1d",
              "events": "div,split", "includeAdjustedClose": "true"}
    for attempt in range(4):
        try:
            r = requests.get(url, params=params, headers=UA, timeout=30)
            r.raise_for_status()
            res = r.json()["chart"]["result"][0]
            break
        except Exception:
            if attempt == 3:
                raise
            time.sleep(2 ** attempt)
    q = res["indicators"]["quote"][0]
    adj = res["indicators"].get("adjclose", [{}])[0].get("adjclose", q["close"])
    df = pd.DataFrame({"open": q["open"], "high": q["high"], "low": q["low"],
                       "close": q["close"], "adj": adj, "volume": q["volume"]},
                      index=pd.to_datetime(res["timestamp"], unit="s").normalize())
    df = df[~df.index.duplicated(keep="last")].dropna(subset=["close"])
    os.makedirs(DATA, exist_ok=True)
    df.to_csv(path)
    return df


def cboe(index: str) -> pd.Series:
    """CBOE benchmark index history, e.g. PUT (S&P 500 PutWrite), BXM (BuyWrite)."""
    path = os.path.join(DATA, f"cboe_{index}.csv")
    if not os.path.exists(path):
        r = requests.get(f"https://cdn.cboe.com/api/global/us_indices/daily_prices/{index}_History.csv",
                         headers=UA, timeout=30)
        r.raise_for_status()
        os.makedirs(DATA, exist_ok=True)
        with open(path, "w") as f:
            f.write(r.text)
    df = pd.read_csv(path)
    df.columns = [c.strip().upper() for c in df.columns]
    s = df.set_index(pd.to_datetime(df["DATE"]))[index if index in df.columns else df.columns[-1]]
    return s.astype(float).sort_index()


def stats(daily_ret: pd.Series, label: str = "", periods: int = 252) -> dict:
    """CAGR, volatility, Sharpe (vs 0), max drawdown, worst year."""
    r = daily_ret.dropna()
    eq = (1 + r).cumprod()
    years = len(r) / periods
    cagr = eq.iloc[-1] ** (1 / years) - 1 if years > 0 else float("nan")
    vol = r.std() * periods ** 0.5
    sharpe = r.mean() / r.std() * periods ** 0.5 if r.std() > 0 else float("nan")
    dd = (eq / eq.cummax() - 1).min()
    yearly = (1 + r).groupby(r.index.year).prod() - 1
    return {"label": label, "start": r.index[0].date(), "end": r.index[-1].date(),
            "CAGR": cagr, "vol": vol, "Sharpe": sharpe, "maxDD": dd,
            "worst_year": yearly.min()}


def show(rows: list[dict]):
    print(f"  {'strategy':<46}{'period':<24}{'CAGR':>7}{'vol':>7}{'Sharpe':>8}{'maxDD':>8}{'worst yr':>9}")
    for s in rows:
        print(f"  {s['label']:<46}{str(s['start'])+' - '+str(s['end']):<24}{s['CAGR']:>7.1%}{s['vol']:>7.1%}"
              f"{s['Sharpe']:>8.2f}{s['maxDD']:>8.1%}{s['worst_year']:>9.1%}")
