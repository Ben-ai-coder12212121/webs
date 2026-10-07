"""Fair-value model for the 15-minute BTC up/down contract.

The contract pays $1 if A_close >= K, where
    K       = 60-second average of BRTI before the window opens (the "target price")
    A_close = 60-second average of BRTI before the window closes.

Over minutes BTC is close to a driftless random walk, so the fair probability
of OVER is a function of how far spot is from the target, measured in units of
the volatility left before settlement:

    P(over) = Phi( ln(S / K) / (sigma * sqrt(tau_eff)) )

tau_eff accounts for the settlement being an average: a 60-second average of a
random walk has only 1/3 of the variance of the endpoint over that minute.

On top of that base we apply a small logistic recalibration fitted on history
(see research/backtest.py); its coefficients live in CALIBRATION.
"""

from __future__ import annotations

import math
from dataclasses import dataclass

import numpy as np

# Fitted by research/backtest.py on 21 days / 1,993 KXBTC15M markets
# (Sep 16 - Oct 7 2026). a scales the base logit; the fitted momentum term was
# ~0 so it is left at 0. The fitted intercept (+0.11, a slight OVER bias) is a
# three-week drift artefact and is deliberately not used.
CALIBRATION = {"a": 1.10, "b_mom": 0.0, "b0": 0.0}

# The market price was the single best predictor out of sample. Combining it
# with the spot model gave the spot model a weight of ~0 and the in-window
# move a small positive weight, so live fair value is anchored on the market:
#     logit(fair) = mid * logit(market mid) + mom * (window move in sd units)
MARKET_BLEND = {"mid": 1.04, "mom": 0.078}


def norm_cdf(x: float) -> float:
    return 0.5 * (1.0 + math.erf(x / math.sqrt(2.0)))


def logit(p: float) -> float:
    p = min(max(p, 1e-6), 1 - 1e-6)
    return math.log(p / (1 - p))


def sigmoid(x: float) -> float:
    return 1.0 / (1.0 + math.exp(-x))


def effective_tau(secs_left: float, avg_window: float = 60.0) -> float:
    """Variance-time (in seconds) between now and the settlement average."""
    if secs_left <= 0:
        return 0.0
    if secs_left > avg_window:
        return (secs_left - avg_window) + avg_window / 3.0
    # Inside the averaging minute: only the unobserved fraction is uncertain.
    # The future part is (n/60) * mean of an n-second path => var n^3/(3*60^2).
    n = secs_left
    return n ** 3 / (3.0 * avg_window ** 2)


def vol_per_sqrt_sec(closes: np.ndarray, halflife_min: float = 30.0) -> float:
    """Blend of a fast EWMA and a slow 24h realised vol of 1-minute log returns,
    returned in per-sqrt-second units."""
    r = np.diff(np.log(closes))
    if len(r) < 10:
        return 0.0006 / math.sqrt(60)  # ~0.06%/min fallback
    lam = 0.5 ** (1.0 / halflife_min)
    w = lam ** np.arange(len(r))[::-1]
    ewma = float(np.sum(w * r * r) / np.sum(w))
    slow = float(np.mean(r[-1440:] ** 2))
    var_min = 0.6 * ewma + 0.4 * slow
    return math.sqrt(var_min / 60.0)


@dataclass
class Fair:
    p_over: float        # calibrated probability BTC settles >= target
    p_base: float        # pure random-walk probability
    z: float             # distance to target in std devs of remaining move
    sigma_left: float    # expected $ move std dev until settlement


def fair_value(spot: float, strike: float, secs_left: float, sigma: float,
               window_ret: float = 0.0, settle_avg_so_far: tuple[float, int] | None = None,
               cal: dict | None = None) -> Fair:
    """
    spot        current BRTI proxy
    strike      target price
    secs_left   seconds until window close
    sigma       per-sqrt-second log vol (vol_per_sqrt_sec)
    window_ret  log return of spot since the window opened (momentum feature)
    settle_avg_so_far  (sum, count) of spot samples already inside the final
                minute, if tracking them live
    """
    cal = cal or CALIBRATION
    if settle_avg_so_far and settle_avg_so_far[1] > 0 and secs_left <= 60:
        s_sum, n_obs = settle_avg_so_far
        n_left = max(secs_left, 0)
        # Expected final average if the remaining seconds sit at current spot.
        expected = (s_sum + spot * n_left) / (n_obs + n_left)
        center = math.log(expected / strike)
    else:
        center = math.log(spot / strike)

    tau = effective_tau(secs_left)
    sd = sigma * math.sqrt(tau)
    if sd <= 1e-12:
        p = 1.0 if center >= 0 else 0.0
        return Fair(p, p, math.copysign(99.0, center or 1.0), 0.0)
    z = center / sd
    p_base = norm_cdf(z)
    # momentum term scaled by remaining vol so it fades as expiry nears
    mom = window_ret / (sigma * math.sqrt(900.0))
    x = cal["a"] * logit(p_base) + cal["b_mom"] * mom + cal["b0"]
    p = sigmoid(x)
    return Fair(p, p_base, z, spot * sd)


def market_fair(mid: float, window_ret: float, sigma: float, blend: dict | None = None) -> float:
    """Fair P(over) anchored on the market mid with the small momentum tilt
    the backtest found. Use this whenever a live two-sided quote exists."""
    b = blend or MARKET_BLEND
    mom = window_ret / (sigma * math.sqrt(900.0)) if sigma > 0 else 0.0
    return sigmoid(b["mid"] * logit(mid) + b["mom"] * mom)
