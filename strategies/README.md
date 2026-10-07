# Robinhood strategy research: swing trading, options, futures, prediction markets

This folder tests whether well-known strategies make money with Robinhood's
products. Every test uses real historical prices and includes costs.

* **Swing and tactical ETF trading.** Signals are taken at the close and
  trades happen at the next day's open, with 0.05% slippage per trade. Idle
  cash earns T-bill interest.
* **Options.** Results come from CBOE's published strategy indexes, which are
  built from real historical S&P 500 option prices. They exclude trading
  costs.
* **Futures.** A trend-following backtest. Futures commissions plus fees and
  slippage are charged as 0.03% of turnover.
* **Prediction markets.** Real Kalshi order books and settlement results,
  with Robinhood's 2¢ per contract fee.

Strategies use textbook parameters with no tuning. Each table also shows the
period since 2015 on its own, so you can check a result wasn't luck from one
era.

**How to read the tables:**

* **CAGR** is the average yearly return.
* **Sharpe** is return per unit of risk. Higher is better, and the S&P 500 is
  about 0.6.
* **maxDD** is the worst fall from a peak.

## Bottom line

1. **Nothing tested beat simply holding the S&P 500 (SPY) on total return.**
   It returned 10–11% a year, and 13.9% a year since 2015. The catch is enduring
   a −55% crash in 2008–09 and −34% in 2020.
2. **The one strategy that clearly improved the risk/reward was futures trend
   following, held next to stocks.** In 2008 the trend portfolio made +18%
   while stocks fell −37%, and in 2022 it made +20% while stocks fell −18%.
   Half S&P plus half trend:
   * earned about the same return as the S&P (10.0% a year vs 10.3%)
   * with less than half the worst drop (−24% vs −55%)
   * at Sharpe 0.90 vs 0.62
3. **Swing trading, option selling and prediction markets did not add
   value.** These strategies lower risk mostly by being in cash or capping
   upside, so they also lower returns.
4. **Robinhood's 2¢ per contract fee is bigger than every prediction-market
   edge measured.**

## 1. Swing and tactical trading (`swing.py`)

| strategy | CAGR | Sharpe | max drawdown | since 2015 CAGR |
|---|---|---|---|---|
| Buy & hold SPY | 8.3% | 0.51 | −55% | 13.9% |
| Buy & hold QQQ | 9.0% | 0.45 | −83% | 19.4% |
| 60/40 stocks/bonds | 8.7% | 0.82 | −31% | 9.0% |
| RSI(2) mean reversion, SPY | 4.3% | 0.71 | −15% | 4.6% |
| IBS reversal, QQQ | 10.1% | 0.58 | −52% | 12.4% |
| 200-day trend filter, SPY | 8.5% | 0.73 | −24% | 7.5% |
| 200-day trend filter, QQQ | 10.2% | 0.62 | −40% | 15.6% |
| Dual momentum | 9.6% | 0.67 | −34% | 7.5% |
| Sector rotation | 8.9% | 0.71 | −21% | 6.1% |
| Turn of month | 3.8% | 0.46 | −28% | 3.9% |

The test period runs from 2000 to Oct 2026. Full output is in
`results_swing.txt`.

* **Short-term "buy the dip" rules (RSI(2) and IBS) still work in the sense
  that their trades win more often than they lose.** But they sit in cash most
  of the time, so they earn far less than holding the index.
* **Trend filters cut crash losses but lag in bull markets.**

## 2. Options (`options.py`, CBOE indexes, 2007 to Oct 2026)

| strategy | CAGR | Sharpe | max drawdown | 2008 | 2020 crash |
|---|---|---|---|---|---|
| S&P 500 buy & hold | 11.0% | 0.63 | −55% | −55% | −34% |
| Sell monthly puts (cash-secured) | 7.3% | 0.58 | −37% | −35% | −29% |
| Sell weekly puts | 4.5% | 0.42 | −29% | −24% | −25% |
| Covered call, 30-delta monthly | 8.5% | 0.57 | −47% | −47% | −32% |
| Covered call, ATM monthly | 6.1% | 0.49 | −40% | −39% | −30% |
| Collar (5% put / 10% call) | 7.1% | 0.60 | −26% | −22% | −15% |
| Protective 5% put | 8.3% | 0.65 | −42% | −42% | −12% |
| Iron condor | 0.9% | 0.16 | −20% | +2% | −9% |
| Iron butterfly | −2.1% | −0.13 | −55% | −1% | −3% |

What these numbers say:

* **Selling options ("collecting premium") feels like steady income.** But
  over 20 years it earned *less* than owning the index, with about the same
  return per unit of risk. You give up the big up-months and keep most of the
  crash.
* **Iron condors and butterflies, which are popular on social media, did
  badly.**
* **Collars are the best option tool for protection.** They cut the worst
  loss to about −26%, at the cost of about 4% a year of return.
* **You need a lot of cash for one contract.** One SPY cash-secured put needs
  about $67k set aside per contract at today's price.

## 3. Futures trend following (`futures.py`, `trend_bot.py`)

Rules:

* Each month, each market is long if its 12-month return is positive and
  short if negative.
* Each market is sized to equal risk.
* The whole portfolio is scaled to 10% volatility.

| strategy (2001 to Oct 2026) | CAGR | Sharpe | max drawdown | since 2015 Sharpe |
|---|---|---|---|---|
| S&P 500 | 10.3% | 0.62 | −55% | 0.83 |
| Trend, 13 futures | 8.5% | 0.78 | −21% | 0.83 |
| Trend, Robinhood-listed futures only | 8.8% | 0.77 | −22% | 0.70 |
| Trend, long-only ETFs, no leverage (2008+) | 5.7% | 0.69 | −23% | 0.53 |
| **50% S&P + 50% futures trend** | **10.0%** | **0.90** | **−24%** | **1.05** |

* **It is nearly independent of stocks** (correlation 0.05). It made money in
  2002, 2008 and 2022, the years stocks crashed.
* **It also has long flat or losing stretches.** It lost −19% in 2016, and
  2009 and 2011–12 were also weak.
* **Expect less in real life.** Professional trend funds earned less than
  this backtest after fees. The data also uses spliced continuous futures
  prices, which add some error.
* **You need a lot of capital to do it properly with futures.** One micro
  contract controls $7k–$63k of exposure. At 10% volatility, holding every
  market today needs roughly $550k. Below that the bot shows which markets
  round to zero contracts. Under about $100k, use the ETF version
  (`--etf`), which is weaker but works at any size.
* **Robinhood does not list Treasury futures.** The "Robinhood-listed" row
  leaves them out.

Run it once a month:

```bash
python trend_bot.py --capital 600000            # futures: contracts per market
python trend_bot.py --capital 10000 --etf       # ETF version: dollars per ETF
```

## 4. Prediction markets: the favorite/long-shot bias (`kalshi/`)

The sample is 4,618 settled Kalshi markets from Aug to Oct 2026, with the order
book 24h, 6h and 1h before close. It is 85% sports. Kalshi runs Robinhood's
prediction markets.

The bias is real:

* **Long shots are overpriced.** YES contracts priced 0–5¢ won 1.5–2.8% of
  the time against a 3¢ price.
* **YES is overpriced in general.** Buying YES lost money at almost every
  price level.

But the edge is smaller than the fee:

| strategy, after Robinhood's 2¢ fee | 24h before | 6h before | 1h before |
|---|---|---|---|
| Buy the favorite at 80–95¢ | −3.1¢ | −4.1¢ | −2.9¢ |
| Bet against long shots: buy NO when YES is 0–5¢ | −2.0¢ | −2.6¢ | −1.5¢ |
| Buy NO when YES is 20–50¢ | −0.7¢ | −2.1¢ | −0.8¢ |

Full output is in `results_kalshi.txt`. A few small categories, such as
commodities, looked positive, but on 30–40 trades with first-half and
second-half results that disagree. That is noise.

## Files

| file | what it does |
|---|---|
| `data.py`, `engine.py` | data download (Yahoo, CBOE) and backtest helpers |
| `swing.py` | swing and tactical ETF strategies |
| `options.py` | option strategy benchmarks |
| `futures.py` | trend-following backtests |
| `trend_bot.py` | monthly trend signals for Robinhood micro futures or ETFs |
| `kalshi/fetch_kalshi.py`, `kalshi/longshot.py` | prediction-market long-shot study |
| `results_*.txt` | outputs quoted above |

```bash
pip install numpy pandas requests
python swing.py; python options.py; python futures.py
python kalshi/fetch_kalshi.py && python kalshi/longshot.py   # ~1 hour of downloads
```

Backtests are not guarantees, and these strategies all had long losing
stretches. Not financial advice.

Sources: Moskowitz, Ooi & Pedersen, "Time Series Momentum" (2012); Hurst,
Ooi & Pedersen, "A Century of Evidence on Trend-Following Investing"; CBOE
strategy benchmark indexes ([cboe.com](https://www.cboe.com/us/indices/benchmark_indices/));
Robinhood futures ([robinhood.com/us/en/about/futures](https://robinhood.com/us/en/about/futures),
[MetroTrade comparison](https://www.metrotrade.com/robinhood-futures-trading-vs-metrotrade-compared/)).
