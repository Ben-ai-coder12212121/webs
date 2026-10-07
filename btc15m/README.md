# BTC 15-minute prediction market bot (Robinhood)

A live signal bot for Robinhood's **"BTC 15 min"** up/down prediction markets.
It prices each contract, compares that price with what the market charges, and
tells you **BUY OVER**, **BUY UNDER**, **SELL**, **HOLD**, or **NO TRADE**. It
does not place orders. You tap the trade in the Robinhood app.

> **Read the backtest section before you trade real money.** On three weeks of
> real market data, no strategy I tested made money after Robinhood's fees.
> Because of that, the bot is built to say "NO TRADE" most of the time.

## How the contract works

* A new contract opens every 15 minutes (:00, :15, :30, :45), 24/7.
* **Target price** is the average of CF Benchmarks' BRTI over the 60 seconds
  before the window opens.
* **OVER (Yes/Up)** pays $1 if the BRTI average over the last 60 seconds of
  the window is **at or above** the target. **UNDER (No/Down)** pays $1
  otherwise.
* Robinhood charges **$0.01 commission plus $0.01 exchange fee per contract,
  per side**, so 2¢ to get in and another 2¢ if you sell before settlement.
  Holding to settlement avoids the second fee.
* Robinhood lists the same contract terms as Kalshi's `KXBTC15M` series. The
  bot reads Kalshi's public order book as its live price reference.

## Quick start

```bash
cd btc15m
pip install -r requirements.txt
python bot.py --bankroll 500
```

The dashboard refreshes every 2 seconds:

```
BTC 15-min  11:45-12:00   5:27 left   [KXBTC15M-26OCT070000-00]
BTC now $84,194.10   target $84,121.82   diff +72.28 (+0.83 sd)   expected move left +/-$87
FAIR VALUE   OVER  90.6c   UNDER   9.4c   (market-anchored)
spot model  OVER  81.7c
MARKET (Kalshi order book)   OVER ask 90.0c bid 89.0c   UNDER ask 11.0c bid 10.0c

NO TRADE - best edge OVER -1.4c < 5c needed
```

Type these commands while it runs:

| command | meaning |
|---|---|
| `rh 63 39` | prices shown in **your Robinhood app**, in cents (OVER ask, UNDER ask). Use this when the app's prices differ from Kalshi's. |
| `rh off` | go back to Kalshi's live prices |
| `own over 10 55` | you bought 10 OVER at 55¢, so the bot can tell you SELL or HOLD |
| `flat` | you no longer hold anything |
| `bank 800` | bankroll used for position sizing |
| `q` | quit |

Other modes:

* `python bot.py --once` prints one snapshot and exits.
* `python bot.py --report` scores every BUY signal logged to `signals.csv`
  against how the contract actually settled (paper trading).

## The strategy

1. **BTC spot.** The median mid-price across Coinbase, Kraken, Bitstamp and
   Gemini, the main venues in the BRTI. It updates every 2 seconds.
2. **Spot model.** It treats BTC as a random walk over the minutes that
   remain: `P(over) = Φ(ln(S/K) / (σ·√τ_eff))`.
   * σ is a blend of a 30-minute EWMA and 24-hour realized 1-minute
     volatility.
   * τ_eff corrects for settlement on a 60-second *average*, which has 1/3 of
     the endpoint variance. Inside the final minute it also uses the
     per-second prices it has already observed.
3. **Fair value is anchored on the market.** In the backtest the market price
   was the best predictor of the outcome. A model that combined the market
   price and the spot model gave the spot model about **zero weight**. The
   bot therefore uses
   `logit(fair) = 1.04·logit(mid) + 0.078·(move since open, in σ units)`.
   It falls back to the spot model only when there is no live order book, and
   then demands twice the edge.
4. **Entry rules:**
   * edge after the 2¢ fee must be at least 5¢
   * no new trades in the first 2 minutes or the last 90 seconds
   * entry price must be between 10¢ and 90¢
5. **Size:** quarter-Kelly, capped at 3% of bankroll per window.
6. **Exit:** hold to settlement, which avoids the second 2¢ fee. The bot says
   SELL only when the bid beats fair value by at least 3¢ after fees.

In practice the bot fires when the price you can actually get in Robinhood
(entered with `rh`) is clearly worse than the live order book plus spot imply,
for example a stale quote in the app. It does not fire because a chart
"looks like it's going up".

## Backtest results

The backtest used **1,993 real KXBTC15M markets from Sep 16 to Oct 7, 2026**:
1-minute bid/ask history, official targets and results from Kalshi's API, and
Coinbase 1-minute BTC candles. Parameters were fitted on the first 60% of the
period and every number below comes from the remaining 40%. Fills assume you
act **one minute after** the signal, which is realistic for tapping through an
app. Full output is in `research/backtest_output.txt`.

**Prediction accuracy** (log-loss, lower is better):

| predictor | log-loss |
|---|---|
| spot / volatility model | 0.478 |
| market mid price | **0.463** |
| market + spot model + momentum | 0.464 |

**Trading P&L** (1 contract per window, after 2¢ fee):

| strategy | trades | win % | avg P&L per contract |
|---|---|---|---|
| spot model, edge ≥ 4¢ | 796 | 37.7% | −2.8¢ |
| spot model, edge ≥ 10¢ | 746 | 30.2% | −6.3¢ |
| resting limit orders at fair − edge | ~770 | ~38% | −8¢ to −11¢ |
| buy the favorite with 3 min left | 324 | 69.1% | −5.4¢ |
| follow momentum with 10 min left | 767 | 70.0% | −2.1¢ |
| fade a ≥ 10–25¢ one-minute price jump | 279–748 | 28–32% | −3.3¢ to −4.9¢ |

What the numbers say:

* **The market is efficient at this horizon.** Whenever the spot model
  disagreed with the market, the market was usually right. The bigger the
  "edge" the model claimed, the more it lost.
* **High win rates do not mean profit.** Buying the favorite wins about 70% of
  the time and still loses, because you pay about 75¢ or more to win $1.
* **Resting limit orders get picked off.** They fill mostly when the market is
  moving against you.
* **"Panic fade" did not hold up.** A published backtest reported it as the
  winner, but here it was negative after fees on every threshold.
* **The real edges belong to fast bots.** They come from latency (Kalshi or
  Polymarket quotes lagging Binance/Coinbase by seconds) and from making
  markets with near-zero fees. A person tapping an app cannot capture
  either.

## Recommended use

1. Run the bot in paper mode for a week or more. Every BUY signal goes to
   `signals.csv`, and `python bot.py --report` shows the real result.
2. Trade real money only if the paper results are positive over hundreds of
   signals, not dozens.
3. Keep size small. The bot already caps risk at 3% of bankroll per window.
4. Treat this as entertainment risk. A 15-minute BTC binary is close to a
   coin flip with a fee attached.

## Files

* `bot.py`: live dashboard, signals, sizing, paper log and report
* `model.py`: fair-value math and fitted calibration
* `feeds.py`: spot prices from 4 exchanges, candles, and Kalshi market data
* `research/fetch_history.py`: downloads market and price history
  (`--days 21`)
* `research/backtest.py`: calibration, accuracy comparison, and strategy
  simulations
* `research/backtest_output.txt`: output of the run quoted above

## Sources

* [Robinhood BTC 15-min contract page](https://robinhood.com/us/en/prediction-markets/crypto/events/btc-up-or-down-15-minutes-oct-04-2026-5b01855a/) (rules, BRTI settlement)
* [Prediction market fees: Robinhood $0.01 + $0.01 per contract](https://defirate.com/prediction-markets/fees/)
* [Kalshi KXBTC15M rules, settlement and edge](https://predictionmarketspicks.com/articles/kalshi-bitcoin-15-minute-markets)
* [4,904-strategy backtest of Kalshi BTC 15m](https://www.turbinefi.com/blog/5000-strategy-backtest-kalshi-btc-15m)
* [Kalshi bitcoin bot: leading side +0.67¢ gross vs 1.55¢ fee](https://www.botforkalshi.com/blog/kalshi-bitcoin-bot)
* [Polymarket 5m/15m bot strategies](https://casatrick.substack.com/p/polymarket-trading-bot-strategies-5m-15m)

Not financial advice.
