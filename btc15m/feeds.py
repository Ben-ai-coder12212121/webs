"""Market data feeds: BTC spot (BRTI proxy), 1-minute candles, and the live
15-minute contract from Kalshi (Robinhood's BTC 15-min markets list the same
contract terms: up/down vs. the 60-second CF Benchmarks BRTI average)."""

from __future__ import annotations

import time
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timezone

import requests

KALSHI = "https://api.elections.kalshi.com/trade-api/v2"
SERIES = "KXBTC15M"

_session = requests.Session()
_session.headers["User-Agent"] = "btc15m-bot/1.0"


def get_json(url: str, params: dict | None = None, retries: int = 5, timeout: float = 10):
    delay = 0.5
    for attempt in range(retries):
        try:
            r = _session.get(url, params=params, timeout=timeout)
            if r.status_code == 429:
                raise requests.HTTPError("rate limited")
            r.raise_for_status()
            return r.json()
        except (requests.RequestException, ValueError):
            if attempt == retries - 1:
                raise
            time.sleep(delay)
            delay *= 2


# --- spot ------------------------------------------------------------------
# CF Benchmarks' BRTI is built from the order books of the major USD venues
# (Coinbase, Kraken, Bitstamp, Gemini, ...). A median of their mid prices is a
# close, robust stand-in.

def _coinbase():
    d = get_json("https://api.exchange.coinbase.com/products/BTC-USD/ticker", retries=1, timeout=3)
    return (float(d["bid"]) + float(d["ask"])) / 2


def _kraken():
    d = get_json("https://api.kraken.com/0/public/Ticker", {"pair": "XBTUSD"}, retries=1, timeout=3)
    t = next(iter(d["result"].values()))
    return (float(t["a"][0]) + float(t["b"][0])) / 2


def _bitstamp():
    d = get_json("https://www.bitstamp.net/api/v2/ticker/btcusd/", retries=1, timeout=3)
    return (float(d["bid"]) + float(d["ask"])) / 2


def _gemini():
    d = get_json("https://api.gemini.com/v1/pubticker/btcusd", retries=1, timeout=3)
    return (float(d["bid"]) + float(d["ask"])) / 2


_VENUES = {"coinbase": _coinbase, "kraken": _kraken, "bitstamp": _bitstamp, "gemini": _gemini}
_pool = ThreadPoolExecutor(max_workers=len(_VENUES))


def composite_spot() -> tuple[float, dict]:
    """Median mid across venues. Returns (price, per-venue prices)."""
    futures = {name: _pool.submit(fn) for name, fn in _VENUES.items()}
    prices = {}
    for name, f in futures.items():
        try:
            prices[name] = f.result(timeout=4)
        except Exception:
            pass
    if not prices:
        raise RuntimeError("no spot venue reachable")
    vals = sorted(prices.values())
    n = len(vals)
    med = vals[n // 2] if n % 2 else (vals[n // 2 - 1] + vals[n // 2]) / 2
    return med, prices


def coinbase_order_book_imbalance(depth_usd: float = 25.0) -> float | None:
    """(bid size - ask size) / total within +/- depth_usd of mid. Range [-1, 1]."""
    try:
        d = get_json("https://api.exchange.coinbase.com/products/BTC-USD/book",
                     {"level": 2}, retries=1, timeout=3)
    except Exception:
        return None
    bids = [(float(p), float(s)) for p, s, *_ in d["bids"]]
    asks = [(float(p), float(s)) for p, s, *_ in d["asks"]]
    if not bids or not asks:
        return None
    mid = (bids[0][0] + asks[0][0]) / 2
    b = sum(s for p, s in bids if p >= mid - depth_usd)
    a = sum(s for p, s in asks if p <= mid + depth_usd)
    return (b - a) / (b + a) if b + a else 0.0


def coinbase_candles(start: int, end: int) -> list[tuple[int, float, float, float, float, float]]:
    """1-minute candles [start, end) as (ts, open, high, low, close, volume), ascending."""
    out = {}
    step = 300 * 60
    t = start
    while t < end:
        t2 = min(t + step, end)
        rows = get_json(
            "https://api.exchange.coinbase.com/products/BTC-USD/candles",
            {"granularity": 60,
             "start": datetime.fromtimestamp(t, timezone.utc).isoformat(),
             "end": datetime.fromtimestamp(t2, timezone.utc).isoformat()},
        )
        for ts, lo, hi, op, cl, vol in rows:
            if start <= ts < end:
                out[int(ts)] = (int(ts), float(op), float(hi), float(lo), float(cl), float(vol))
        t = t2
        time.sleep(0.15)
    return [out[k] for k in sorted(out)]


# --- Kalshi contract -------------------------------------------------------

def _f(x):
    try:
        return float(x)
    except (TypeError, ValueError):
        return None


def current_market() -> dict | None:
    """The open 15-minute BTC contract (the one closing soonest)."""
    d = get_json(f"{KALSHI}/markets", {"series_ticker": SERIES, "status": "open"})
    mkts = d.get("markets", [])
    if not mkts:
        return None
    m = min(mkts, key=lambda m: m["close_time"])
    return {
        "ticker": m["ticker"],
        "open_ts": _iso(m["open_time"]),
        "close_ts": _iso(m["close_time"]),
        "strike": _f(m.get("floor_strike")),
        "yes_bid": _f(m.get("yes_bid_dollars")),
        "yes_ask": _f(m.get("yes_ask_dollars")),
        "no_bid": _f(m.get("no_bid_dollars")),
        "no_ask": _f(m.get("no_ask_dollars")),
    }


def settled_markets(min_close_ts: int, max_close_ts: int) -> list[dict]:
    out, cursor = [], None
    while True:
        params = {"series_ticker": SERIES, "status": "settled", "limit": 1000,
                  "min_close_ts": min_close_ts, "max_close_ts": max_close_ts}
        if cursor:
            params["cursor"] = cursor
        d = get_json(f"{KALSHI}/markets", params)
        for m in d.get("markets", []):
            out.append({
                "ticker": m["ticker"],
                "open_ts": _iso(m["open_time"]),
                "close_ts": _iso(m["close_time"]),
                "strike": _f(m.get("floor_strike")),
                "settle": _f(m.get("expiration_value")),
                "result": m.get("result"),
            })
        cursor = d.get("cursor")
        if not cursor or not d.get("markets"):
            return out
        time.sleep(0.2)


def market_candles(ticker: str, start: int, end: int) -> list[dict]:
    d = get_json(f"{KALSHI}/series/{SERIES}/markets/{ticker}/candlesticks",
                 {"start_ts": start, "end_ts": end, "period_interval": 1})
    rows = []
    for c in d.get("candlesticks", []):
        rows.append({
            "ts": int(c["end_period_ts"]),
            "yes_bid": _f(c.get("yes_bid", {}).get("close_dollars")),
            "yes_ask": _f(c.get("yes_ask", {}).get("close_dollars")),
            "volume": _f(c.get("volume_fp")),
        })
    return rows


def _iso(s: str) -> int:
    return int(datetime.fromisoformat(s.replace("Z", "+00:00")).timestamp())
