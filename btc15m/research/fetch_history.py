"""Download history for the backtest: Kalshi KXBTC15M settled markets with
1-minute quote candles, plus Coinbase 1-minute BTC candles.

    python research/fetch_history.py --days 21
"""
import argparse
import json
import os
import sys
import time

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
import feeds  # noqa: E402

DATA = os.path.join(os.path.dirname(__file__), "data")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--days", type=int, default=21)
    args = ap.parse_args()
    os.makedirs(DATA, exist_ok=True)
    end = int(time.time()) // 900 * 900
    start = end - args.days * 86400

    mkts = feeds.settled_markets(start, end)
    print(f"{len(mkts)} settled markets", flush=True)
    path = os.path.join(DATA, "kalshi.jsonl")
    done = set()
    if os.path.exists(path):
        with open(path) as f:
            done = {json.loads(l)["ticker"] for l in f}
    with open(path, "a") as f:
        for i, m in enumerate(sorted(mkts, key=lambda m: m["close_ts"])):
            if m["ticker"] in done:
                continue
            try:
                m["candles"] = feeds.market_candles(m["ticker"], m["open_ts"] - 60, m["close_ts"] + 60)
            except Exception as e:
                print("skip", m["ticker"], e, flush=True)
                continue
            f.write(json.dumps(m) + "\n")
            if i % 100 == 0:
                print(i, m["ticker"], flush=True)
            time.sleep(0.1)

    # spot candles, with a day of warm-up for volatility estimates
    candles = feeds.coinbase_candles(start - 86400, end + 900)
    with open(os.path.join(DATA, "coinbase_1m.json"), "w") as f:
        json.dump(candles, f)
    print(f"{len(candles)} spot candles")


if __name__ == "__main__":
    main()
