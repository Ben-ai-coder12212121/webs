# Robinhood Holdings Scanner

Scores every position in your Robinhood account, runs checks on the whole portfolio, and writes a report.

## Run it

```
python3 scan.py                 # uses data/snapshot.json
python3 scan.py other.json      # or any snapshot file
```

Output: `reports/report.md` and `reports/report.html`.

## Refresh the data

Robinhood has no official public API for personal accounts, so the snapshot is pulled through
Claude's Robinhood connector. Ask Claude: *"refresh my Robinhood snapshot and rerun the scanner"*.
Claude pulls positions, quotes, fundamentals, analyst ratings, 6 months of weekly prices, earnings
dates, and tax lots, then rewrites `data/snapshot.json`.

`data/` and `reports/` are gitignored because they hold your account details. This repo deploys to a
public site, so keep them out of version control.

## Scoring

| Factor | Stocks | Index funds |
|---|---|---|
| Analyst upside to mean target | 0-30 | n/a |
| Share of Buy ratings | 0-15 | n/a |
| Diversification / cost quality | n/a | 36-45 |
| Momentum (10-wk trend, 13-wk return, 52-wk range) | 0-20 | 0-20 |
| Low volatility (annualized from weekly returns) | 0-20 | 0-20 |
| Valuation (trailing P/E bands) | 0-15 | 0-15 |

Grades: A ≥80, B+ ≥70, B ≥62, C+ ≥54, C ≥46, D ≥38, F below.
Positions under 1% of the account that score below 62 get flagged **CONSOLIDATE**.

This is a rules-based decision aid, not personalized financial, tax, or legal advice.
