// =============================================================================
// RippleCounter — Deterministic brushed-DC motor position estimator
// =============================================================================
// Implements the processing chain from docs/esp32_ripple_spec_strict.md §3-§5:
//   §4.1 IIR low-pass DC removal
//   §4.2 First-order high-pass filter
//   §4.3 Adaptive threshold (0.99/0.01)
//   §4.4 Schmitt-trigger edge detection
//   §4.5 Minimum-period gate
//
// Design constraints (§5):
//   - No dynamic allocation after construction
//   - O(1) per update()
//   - No NaN / overflow
//   - Compiles on the host (no ESP-IDF / ESPHome includes)
// =============================================================================

#pragma once

#include <cstdint>
#include <cstddef>  // size_t

namespace hv6 {

class RippleCounter {
 public:
  /// All parameters that define the signal-processing chain.
  struct Config {
    float    sampleRate;        ///< ADC sample rate in Hz
    float    lpAlpha;           ///< DC-removal LPF coefficient α ∈ (0,1)
    float    hpAlpha;           ///< High-pass filter coefficient α ∈ (0,1)
    float    threshold;         ///< Initial adaptive-threshold seed (ADC raw units)
    float    hysteresis;        ///< Schmitt hysteresis ratio ∈ [0,1) — falling threshold = th*(1-hyst)
    uint32_t ripplesPerRev;     ///< Commutator ripples per shaft revolution
    uint32_t minPeriodSamples;  ///< Minimum samples between accepted rising edges
  };

  explicit RippleCounter(const Config& cfg);

  /// Reset all filter + counting state; preserves Config.
  void reset();

  /// Process one ADC sample — O(1), no allocation.
  void update(uint16_t adcSample);

  /// Process a batch of ADC samples (e.g. from a DMA frame).
  /// Calls update() for each element — O(n), no allocation.
  inline void update(const uint16_t* samples, size_t n) {
    for (size_t i = 0; i < n; ++i)
      update(samples[i]);
  }

  uint32_t getRippleCount() const;  ///< Cumulative rising-edge count since last reset()
  float    getPositionRad() const;  ///< Absolute shaft position in radians since reset()
  float    getSpeedRPS()    const;  ///< Shaft speed in rev/s; 0 if stale (no edge for ≥1 s)

 private:
  Config   cfg_;

  // Filter state
  float    dc_;           ///< IIR LPF estimate of DC component
  float    prev_x_;       ///< Previous raw input (HPF difference term)
  float    hp_;           ///< Previous HPF output (HPF recursion term)
  float    th_;           ///< Adaptive threshold (§4.3)

  // Edge-detection state
  bool     above_;               ///< Schmitt trigger: currently in high state
  uint32_t samples_since_edge_;  ///< Samples since last accepted rising edge
  uint32_t last_period_samples_; ///< Period in samples between last two accepted edges

  // Speed-staleness tracking
  uint32_t stale_counter_;  ///< Samples since last accepted edge (for speed timeout)

  // Count
  uint32_t count_;

  bool initialized_;  ///< True after first sample; prevents LPF cold-start overshoot
};

}  // namespace hv6
