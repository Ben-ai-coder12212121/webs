"""Sample settled Kalshi markets across all categories and record their
quotes at fixed times before close (for the favourite/long-shot study).

    python kalshi/fetch_kalshi.py --sample 6000
"""
import argparse
import json
import os
import random
import sys
import time
from datetime import datetime, timezone

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "..", "btc15m"))
import feeds  # noqa: E402  (get_json with retries)

API = "https://api.elections.kalshi.com/trade-api/v2"
DATA = os.path.join(os.path.dirname(__file__), "..", "data")
HORIZONS_H = [48, 24, 6, 1]


def iso(s):
    return int(datetime.fromisoformat(s.replace("Z", "+00:00")).timestamp())


def f(x):
    try:
        return float(x)
    except (TypeError, ValueError):
        return None


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--sample", type=int, default=6000)
    ap.add_argument("--per-day", type=int, default=15000, help="max markets listed per sampled day")
    ap.add_argument("--min-volume", type=float, default=500)
    args = ap.parse_args()
    random.seed(7)

    series = json.load(open(os.path.join(DATA, "kalshi_series.json")))
    cat = {s["ticker"]: s.get("category") for s in series}

    # The live API only serves markets settled after the historical cutoff
    # (older ones moved to /historical), so we take every day since then.
    cutoff = iso(feeds.get_json(f"{API}/historical/cutoff")["market_settled_ts"])
    now = int(time.time()) // 86400 * 86400
    days = list(range(1, (now - cutoff) // 86400, 4))  # every 4th day keeps the download manageable
    pool = []
    for d in days:
        t0 = now - d * 86400
        cursor, got = None, 0
        while got < args.per_day:
            p = {"status": "settled", "limit": 1000, "min_close_ts": t0, "max_close_ts": t0 + 86400,
                 "mve_filter": "exclude"}
            if cursor:
                p["cursor"] = cursor
            r = feeds.get_json(f"{API}/markets", p)
            for m in r.get("markets", []):
                if m.get("result") not in ("yes", "no") or f(m.get("volume_fp")) is None:
                    continue
                if f(m["volume_fp"]) < args.min_volume:
                    continue
                st = m["event_ticker"].split("-")[0]
                pool.append({"ticker": m["ticker"], "series": st, "category": cat.get(st, "?"),
                             "open_ts": iso(m["open_time"]), "close_ts": iso(m["close_time"]),
                             "result": m["result"], "volume": f(m["volume_fp"]), "title": m.get("title", "")})
            got += len(r.get("markets", []))
            cursor = r.get("cursor")
            if not cursor or not r.get("markets"):
                break
            time.sleep(0.2)
        print(f"day -{d}: pool {len(pool)}", flush=True)

    # Cap any one series so huge recurring series don't dominate, then sample.
    by_series = {}
    for m in pool:
        by_series.setdefault(m["series"], []).append(m)
    capped = [m for ms in by_series.values() for m in random.sample(ms, min(len(ms), 60))]
    # Skip 15-minute / hourly crypto up-down style markets (studied separately)
    capped = [m for m in capped if m["close_ts"] - m["open_ts"] > 2 * 3600]
    sample = random.sample(capped, min(args.sample, len(capped)))
    print(f"{len(pool)} markets, {len(by_series)} series, sampling {len(sample)}", flush=True)

    out_path = os.path.join(DATA, "kalshi_longshot.jsonl")
    done = set()
    if os.path.exists(out_path):
        done = {json.loads(l)["ticker"] for l in open(out_path)}
    with open(out_path, "a") as out:
        for i, m in enumerate(sample):
            if m["ticker"] in done:
                continue
            T = m["close_ts"]
            start = max(m["open_ts"], T - 50 * 3600)
            try:
                r = feeds.get_json(f"{API}/series/{m['series']}/markets/{m['ticker']}/candlesticks",
                                   {"start_ts": start, "end_ts": T, "period_interval": 60})
            except Exception as e:
                continue
            candles = {int(c["end_period_ts"]): c for c in r.get("candlesticks", [])}
            quotes = {}
            for h in HORIZONS_H:
                target = T - h * 3600
                # last candle ending at or before target
                ks = [k for k in candles if k <= target and k >= target - 3 * 3600]
                if not ks:
                    continue
                c = candles[max(ks)]
                quotes[h] = {"bid": f(c.get("yes_bid", {}).get("close_dollars")),
                             "ask": f(c.get("yes_ask", {}).get("close_dollars"))}
            m["quotes"] = quotes
            out.write(json.dumps(m) + "\n")
            if i % 250 == 0:
                print(i, m["category"], m["ticker"], flush=True)
            time.sleep(0.08)


if __name__ == "__main__":
    main()
