"""Option-selling and hedging strategies, using CBOE's published benchmark
indexes. They are calculated from real historical S&P 500 option prices.
They exclude trading costs, so expect roughly 0.5-2%/yr less in practice
(more for weekly strategies).

    python options.py
"""
import pandas as pd

import data
from engine import ohlc_adj

INDEXES = [
    ("PUT", "Sell monthly ATM puts, cash-secured (PUT)"),
    ("WPUT", "Sell weekly ATM puts, cash-secured (WPUT)"),
    ("BXM", "Covered call, monthly ATM (BXM)"),
    ("BXY", "Covered call, monthly 2% OTM (BXY)"),
    ("BXMD", "Covered call, monthly 30-delta (BXMD)"),
    ("BXMW", "Covered call, weekly ATM (BXMW)"),
    ("CLL", "Collar: own S&P, buy 5% OTM put, sell 10% OTM call (CLL)"),
    ("PPUT", "Protective put: own S&P + 5% OTM put (PPUT)"),
    ("CNDR", "Iron condor, monthly (CNDR)"),
    ("BFLY", "Iron butterfly, monthly (BFLY)"),
    ("VXTH", "S&P + VIX call tail hedge (VXTH)"),
]


def main(start="2007-01-01"):
    spy = ohlc_adj("SPY")["close"]
    rows = []
    for split in (start, "2015-01-01"):
        rows.append(data.stats(spy[spy.index >= split].pct_change().dropna(),
                               f"S&P 500 buy & hold (SPY){'' if split == start else ' since 2015'}"))
        for code, label in INDEXES:
            s = data.cboe(code)
            s = s[s.index >= split]
            # these files have gaps on some days; use common trading days with SPY
            s = s.reindex(spy.index).dropna()
            s = s[s.index >= split]
            if len(s) < 500:
                continue
            rows.append(data.stats(s.pct_change().dropna(), label))
        rows.append({"label": "", "start": "", "end": "", "CAGR": float("nan"), "vol": float("nan"),
                     "Sharpe": float("nan"), "maxDD": float("nan"), "worst_year": float("nan")})
    print("Option strategies (CBOE benchmark indexes on the S&P 500, no trading costs)\n")
    data.show([r for r in rows if r["label"]])
    # Crash behaviour
    print("\nReturn in the worst stretches:")
    periods = [("2008 crash", "2007-10-09", "2009-03-09"), ("2020 Covid crash", "2020-02-19", "2020-03-23"),
               ("2022 bear market", "2022-01-03", "2022-10-12"), ("2018 Volmageddon/Q4", "2018-09-20", "2018-12-24")]
    hdr = "  " + f"{'':<52}" + "".join(f"{p[0]:>22}" for p in periods)
    print(hdr)
    series = [("S&P 500 buy & hold (SPY)", spy)] + [(l, data.cboe(c).reindex(spy.index).dropna()) for c, l in INDEXES]
    for label, s in series:
        cells = []
        for _, a, b in periods:
            w = s[(s.index >= a) & (s.index <= b)]
            cells.append(f"{(w.iloc[-1] / w.iloc[0] - 1):>22.1%}" if len(w) > 5 else f"{'n/a':>22}")
        print(f"  {label:<52}" + "".join(cells))


if __name__ == "__main__":
    main()
