// =============================================================================
// HV6 Adaptive Balancing — pure C++, host-testable (no ESP-IDF / ESPHome deps)
// =============================================================================
// Room-temperature-feedback hydraulic balancing. The static prior (resistance-
// aware design model) supplies the coarse split; this module supplies the slow
// learned correction multiplier (adapt_i) that rides on top of it.
//
// Balancing is a *redistribution* of a shared flow, so adaptation acts on the
// RELATIVE control error (e_i − e_mean). This cancels the common mode: if the
// whole house is cold because the supply temperature is too low, every e_i
// rises together, (e_i − e_mean) ≈ 0, and balancing does not react — it only
// ever moves flow between loops, never raises total demand.
//
// Tested by test/adaptive_balance/test_adaptive_balance.cpp (make test-balance).
// See docs/adaptive_balancing.md.
// =============================================================================

#pragma once

namespace hv6ab {

struct AdaptParams {
  float step = 0.02f;       ///< k: max factor move per update (bounds the per-step move)
  float adapt_min = 0.5f;   ///< Clamp on the learned multiplier (lower)
  float adapt_max = 1.5f;   ///< Clamp on the learned multiplier (upper)
};

/// Clamp helper (avoids pulling in <algorithm> for the firmware include path).
inline float clampf(float v, float lo, float hi) {
  return v < lo ? lo : (v > hi ? hi : v);
}

/// One outer-loop step of the learned multiplier for a single zone.
///   delta = clamp(step · (e_i − e_mean), −step, +step)   // move bounded by k
///   adapt = clamp(adapt + delta, adapt_min, adapt_max)
///
/// e_i      — this zone's long-window mean control error (setpoint − temp).
/// e_mean   — manifold common-mode mean over the contributing zones.
/// A zone colder than its peers (e_i > e_mean) is flow-starved → adapt rises.
/// A zone satisfied more easily (e_i < e_mean) is over-served → adapt falls.
/// Equal errors (common mode) → no move (self-normalizing).
inline float next_adapt(float adapt, float e_i, float e_mean, const AdaptParams &p) {
  float delta = p.step * (e_i - e_mean);
  delta = clampf(delta, -p.step, p.step);
  return clampf(adapt + delta, p.adapt_min, p.adapt_max);
}

}  // namespace hv6ab
