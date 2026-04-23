// =============================================================================
// RippleCounter — Host-runnable unit tests
// =============================================================================
// Covers all test cases from docs/esp32_ripple_spec_strict.md §6.
// Each case runs across 5 sample rates: {1, 5, 10, 15, 20} kHz.
//
// Build + run (from repo root):
//   clang++ -std=c++17 -O2 -Wall -Wextra -Wno-unused-parameter \
//     -I components/hv6_valve_controller \
//     components/hv6_valve_controller/ripple_counter.cpp \
//     test/ripple_counter/test_ripple_counter.cpp -o /tmp/test_ripple -lm \
//   && /tmp/test_ripple
// =============================================================================

#include "ripple_counter.h"
#include <cassert>
#include <cmath>
#include <cstdio>
#include <cstdlib>
#include <cstdint>

// ---------------------------------------------------------------------------
// Test rates — prove the algorithm is rate-independent
// ---------------------------------------------------------------------------
static constexpr float kTestRates[] = {1000.0f, 5000.0f, 10000.0f, 15000.0f, 20000.0f};
static constexpr int   kNumRates    = 5;

// Fixed physical parameters (matches user's firmware defaults)
static constexpr float    kLpAlpha    = 0.002f;
static constexpr float    kHpAlpha    = 0.90f;
static constexpr float    kThreshold  = 3.0f;
static constexpr float    kHysteresis = 0.5f;
static constexpr uint32_t kRipPerRev  = 1;   // 1 keeps pos/speed maths simple in tests
static constexpr float    kDcOffset   = 512.0f;
static constexpr float    kAmplitude  = 80.0f;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/// Build a Config for the given sample rate.
/// ripple_freq is chosen as 4× the HPF -3dB cutoff so the signal is well
/// in the passband at every test rate.
/// HPF -3dB: f_hp = Fs * (-ln α_hp) / (2π)
static hv6::RippleCounter::Config make_config(float fs) {
  const float f_hp         = fs * (-logf(kHpAlpha)) / (2.0f * 3.14159265f);
  const float ripple_freq  = 4.0f * f_hp;          // well into HPF passband
  const uint32_t min_p     = static_cast<uint32_t>(fs / ripple_freq / 2.0f);

  hv6::RippleCounter::Config cfg;
  cfg.sampleRate       = fs;
  cfg.lpAlpha          = kLpAlpha;
  cfg.hpAlpha          = kHpAlpha;
  cfg.threshold        = kThreshold;
  cfg.hysteresis       = kHysteresis;
  cfg.ripplesPerRev    = kRipPerRev;
  cfg.minPeriodSamples = (min_p < 1) ? 1 : min_p;
  return cfg;
}

/// Ripple frequency corresponding to a given sample rate (same formula as above).
static float ripple_freq_for(float fs) {
  return 4.0f * fs * (-logf(kHpAlpha)) / (2.0f * 3.14159265f);
}

/// Simple seeded LCG — deterministic, no heap.
static uint32_t lcg_next(uint32_t& state) {
  state = state * 1664525u + 1013904223u;
  return state;
}

/// Approximate Gaussian noise via Box-Muller (two uniform samples from LCG).
static float gaussian(uint32_t& state, float sigma) {
  float u1 = (float)((lcg_next(state) >> 8) & 0xFFFFFF) / (float)0x1000000;
  float u2 = (float)((lcg_next(state) >> 8) & 0xFFFFFF) / (float)0x1000000;
  if (u1 < 1e-9f) u1 = 1e-9f;
  return sigma * sqrtf(-2.0f * logf(u1)) * cosf(6.28318530f * u2);
}

/// Warm up filters: feed N_WARMUP samples of pure sine+DC.
/// Returns sample phase at end of warmup (so counting can continue from there).
static float do_warmup(hv6::RippleCounter& rc, float fs, float freq, uint32_t n_warmup) {
  float phase = 0.0f;
  const float phase_step = 2.0f * 3.14159265f * freq / fs;
  for (uint32_t i = 0; i < n_warmup; ++i) {
    float v = kDcOffset + kAmplitude * sinf(phase);
    int16_t raw = (int16_t)(v + 0.5f);
    if (raw < 0)    raw = 0;
    if (raw > 4095) raw = 4095;
    rc.update((uint16_t)raw);
    phase += phase_step;
    if (phase >= 2.0f * 3.14159265f) phase -= 2.0f * 3.14159265f;
  }
  return phase;
}

// ---------------------------------------------------------------------------
// TC 6.1: Synthetic sine wave — count within ±1 %
// ---------------------------------------------------------------------------
static void test_6_1_sine_wave(float fs) {
  const hv6::RippleCounter::Config cfg = make_config(fs);
  const float freq = ripple_freq_for(fs);

  hv6::RippleCounter rc(cfg);

  // Warm up: 3 × LPF time constant (= 3/lpAlpha samples)
  const uint32_t n_warmup = (uint32_t)(3.0f / kLpAlpha);  // 1500
  float phase = do_warmup(rc, fs, freq, n_warmup);

  rc.reset();  // Reset count; filters are now seeded — only reset counters
  // Re-seed by feeding one sample so initialized_ is set
  {
    float v = kDcOffset + kAmplitude * sinf(phase);
    int16_t raw = (int16_t)(v + 0.5f);
    if (raw < 0)    raw = 0;
    if (raw > 4095) raw = 4095;
    rc.update((uint16_t)raw);
    phase += 2.0f * 3.14159265f * freq / fs;
  }

  // Count 200 full cycles
  const int expected = 200;
  const uint32_t n_count = (uint32_t)(expected * fs / freq);
  const float phase_step = 2.0f * 3.14159265f * freq / fs;

  for (uint32_t i = 0; i < n_count; ++i) {
    float v = kDcOffset + kAmplitude * sinf(phase);
    int16_t raw = (int16_t)(v + 0.5f);
    if (raw < 0)    raw = 0;
    if (raw > 4095) raw = 4095;
    rc.update((uint16_t)raw);
    phase += phase_step;
    if (phase >= 2.0f * 3.14159265f) phase -= 2.0f * 3.14159265f;
  }

  uint32_t got = rc.getRippleCount();
  // ±2 counts on 200 = ±1 %
  if ((int)got < expected - 2 || (int)got > expected + 2) {
    fprintf(stderr, "[FAIL] TC6.1 Fs=%.0f Hz: expected %d ±2 ripples, got %u\n",
            fs, expected, got);
    exit(1);
  }
}

// ---------------------------------------------------------------------------
// TC 6.2: Noisy signal — false detections ≤ 5 %
// ---------------------------------------------------------------------------
static void test_6_2_noisy(float fs) {
  const hv6::RippleCounter::Config cfg = make_config(fs);
  const float freq = ripple_freq_for(fs);

  hv6::RippleCounter rc(cfg);

  const uint32_t n_warmup = (uint32_t)(3.0f / kLpAlpha);
  float phase = do_warmup(rc, fs, freq, n_warmup);

  rc.reset();
  {
    float v = kDcOffset + kAmplitude * sinf(phase);
    int16_t raw = (int16_t)(v + 0.5f);
    if (raw < 0) raw = 0; if (raw > 4095) raw = 4095;
    rc.update((uint16_t)raw);
    phase += 2.0f * 3.14159265f * freq / fs;
  }

  const int expected = 200;
  const uint32_t n_count = (uint32_t)(expected * fs / freq);
  const float phase_step = 2.0f * 3.14159265f * freq / fs;
  const float noise_sigma = kAmplitude * 0.10f;  // 10 % of signal amplitude
  uint32_t seed = 0xDEADBEEFu;

  for (uint32_t i = 0; i < n_count; ++i) {
    float v = kDcOffset + kAmplitude * sinf(phase) + gaussian(seed, noise_sigma);
    int16_t raw = (int16_t)(v + 0.5f);
    if (raw < 0)    raw = 0;
    if (raw > 4095) raw = 4095;
    rc.update((uint16_t)raw);
    phase += phase_step;
    if (phase >= 2.0f * 3.14159265f) phase -= 2.0f * 3.14159265f;
  }

  uint32_t got = rc.getRippleCount();
  // Spec: false detections ≤ 5 % → count in [expected*0.95, expected*1.05]
  int lo = (int)(expected * 0.95f);
  int hi = (int)(expected * 1.05f + 0.999f);
  if ((int)got < lo || (int)got > hi) {
    fprintf(stderr, "[FAIL] TC6.2 Fs=%.0f Hz: expected %d ±5%%, got %u\n",
            fs, expected, got);
    exit(1);
  }
}

// ---------------------------------------------------------------------------
// TC 6.3: Constant DC — ripple count = 0
// ---------------------------------------------------------------------------
static void test_6_3_constant_dc(float fs) {
  const hv6::RippleCounter::Config cfg = make_config(fs);

  hv6::RippleCounter rc(cfg);

  // Feed 5000 samples of constant value (no ripple)
  const uint32_t n = 5000;
  for (uint32_t i = 0; i < n; ++i)
    rc.update(512u);

  uint32_t got = rc.getRippleCount();
  if (got != 0) {
    fprintf(stderr, "[FAIL] TC6.3 Fs=%.0f Hz: expected 0 ripples on DC, got %u\n",
            fs, got);
    exit(1);
  }
}

// ---------------------------------------------------------------------------
// TC 6.4: Frequency sweep — speed within ±5 %
// ---------------------------------------------------------------------------
static void test_6_4_frequency_sweep(float fs) {
  const hv6::RippleCounter::Config cfg = make_config(fs);
  const float f_base = ripple_freq_for(fs);
  const float f_start = f_base * 0.5f;
  const float f_end   = f_base * 1.5f;

  hv6::RippleCounter rc(cfg);

  // Warmup at f_start
  const uint32_t n_warmup = (uint32_t)(3.0f / kLpAlpha);
  float phase = do_warmup(rc, fs, f_start, n_warmup);

  rc.reset();
  {
    float v = kDcOffset + kAmplitude * sinf(phase);
    int16_t raw = (int16_t)(v + 0.5f); if (raw < 0) raw = 0; if (raw > 4095) raw = 4095;
    rc.update((uint16_t)raw);
    phase += 2.0f * 3.14159265f * f_start / fs;
  }

  // Sweep over 2 seconds
  const uint32_t n_sweep = (uint32_t)(2.0f * fs);
  float inst_freq = f_start;
  for (uint32_t i = 0; i < n_sweep; ++i) {
    inst_freq = f_start + (f_end - f_start) * ((float)i / (float)n_sweep);
    float v = kDcOffset + kAmplitude * sinf(phase);
    int16_t raw = (int16_t)(v + 0.5f); if (raw < 0) raw = 0; if (raw > 4095) raw = 4095;
    rc.update((uint16_t)raw);
    phase += 2.0f * 3.14159265f * inst_freq / fs;
    if (phase >= 2.0f * 3.14159265f) phase -= 2.0f * 3.14159265f;
  }

  // Speed at end should reflect f_end / ripplesPerRev
  float expected_rps = f_end / (float)kRipPerRev;
  float got_rps      = rc.getSpeedRPS();
  float err = fabsf(got_rps - expected_rps) / expected_rps;

  if (err > 0.05f) {
    fprintf(stderr, "[FAIL] TC6.4 Fs=%.0f Hz: expected speed %.3f RPS ±5%%, got %.3f (err=%.1f%%)\n",
            fs, expected_rps, got_rps, err * 100.0f);
    exit(1);
  }
}

// ---------------------------------------------------------------------------
// TC 6.5: Minimum-period enforcement — double peaks rejected
// ---------------------------------------------------------------------------
// After 100 clean cycles, switch to 3× ripple frequency.
// At 3× freq, period = ripple_period/3 < minPeriodSamples = ripple_period/2.
// The gate should reject alternating peaks → acceptance rate ~50 %.
// Assert: count from 3× section < 75 % of attempted (proves rejection).
// Assert: count from 3× section > 10 % of attempted (proves counter still works).
// ---------------------------------------------------------------------------
static void test_6_5_min_period(float fs) {
  const hv6::RippleCounter::Config cfg = make_config(fs);
  const float freq    = ripple_freq_for(fs);
  const float freq_3x = freq * 3.0f;

  hv6::RippleCounter rc(cfg);

  // Warmup + 100 clean cycles at base frequency
  const uint32_t n_warmup = (uint32_t)(3.0f / kLpAlpha);
  float phase = do_warmup(rc, fs, freq, n_warmup);

  rc.reset();
  {
    float v = kDcOffset + kAmplitude * sinf(phase);
    int16_t raw = (int16_t)(v + 0.5f); if (raw < 0) raw = 0; if (raw > 4095) raw = 4095;
    rc.update((uint16_t)raw);
    phase += 2.0f * 3.14159265f * freq / fs;
  }

  const int base_cycles = 100;
  const uint32_t n_base = (uint32_t)(base_cycles * fs / freq);
  const float ps_base   = 2.0f * 3.14159265f * freq / fs;
  for (uint32_t i = 0; i < n_base; ++i) {
    float v = kDcOffset + kAmplitude * sinf(phase);
    int16_t raw = (int16_t)(v + 0.5f); if (raw < 0) raw = 0; if (raw > 4095) raw = 4095;
    rc.update((uint16_t)raw);
    phase += ps_base;
    if (phase >= 2.0f * 3.14159265f) phase -= 2.0f * 3.14159265f;
  }
  uint32_t count_after_base = rc.getRippleCount();

  // Switch to 3× frequency for 100 base-equivalent cycles (= 300 high-freq cycles)
  const int fast_cycles_equiv = 100;
  const uint32_t n_fast = (uint32_t)(fast_cycles_equiv * fs / freq);  // same sample count
  const float ps_fast   = 2.0f * 3.14159265f * freq_3x / fs;

  // Reset phase smoothly (continue from where we are, just increase freq)
  for (uint32_t i = 0; i < n_fast; ++i) {
    float v = kDcOffset + kAmplitude * sinf(phase);
    int16_t raw = (int16_t)(v + 0.5f); if (raw < 0) raw = 0; if (raw > 4095) raw = 4095;
    rc.update((uint16_t)raw);
    phase += ps_fast;
    if (phase >= 2.0f * 3.14159265f) phase -= 2.0f * 3.14159265f;
  }

  uint32_t count_after_fast = rc.getRippleCount();
  uint32_t added_count      = count_after_fast - count_after_base;
  // At 3× freq: 100 equiv-cycles → 300 high-freq peaks attempted
  // ~50 % should pass (see analysis in test plan) → expect ~150 accepted.
  // Ungated would be: all 300 pass (at base it's 100 per equiv).
  // So: added_count should be significantly < 300 (< 75% = 225).
  // And > 10% of 300 = 30 (counter still works).
  uint32_t attempted = (uint32_t)(fast_cycles_equiv * 3);  // 300
  if (added_count >= (attempted * 75 / 100)) {
    fprintf(stderr, "[FAIL] TC6.5 Fs=%.0f Hz: min-period gate not effective: "
            "added=%u (>= 75%% of %u attempted)\n", fs, added_count, attempted);
    exit(1);
  }
  if (added_count < (attempted * 10 / 100)) {
    fprintf(stderr, "[FAIL] TC6.5 Fs=%.0f Hz: counter stopped working under 3× freq: "
            "added=%u (< 10%% of %u attempted)\n", fs, added_count, attempted);
    exit(1);
  }
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
int main() {
  for (int r = 0; r < kNumRates; ++r) {
    float fs = kTestRates[r];
    printf("Rate %.0f Hz ...", fs);
    fflush(stdout);

    test_6_1_sine_wave(fs);
    test_6_2_noisy(fs);
    test_6_3_constant_dc(fs);
    test_6_4_frequency_sweep(fs);
    test_6_5_min_period(fs);

    printf(" PASS\n");
  }
  printf("All tests passed.\n");
  return 0;
}
