#include "ripple_counter.h"
#include <cmath>

namespace hv6 {

static constexpr float kTwoPi = 6.28318530f;
static constexpr float kMinTh = 0.01f;  // Guard against near-zero threshold

RippleCounter::RippleCounter(const Config& cfg) : cfg_(cfg) {
  reset();
}

void RippleCounter::reset() {
  dc_                  = 0.0f;
  prev_x_              = 0.0f;
  hp_                  = 0.0f;
  th_                  = (cfg_.threshold > kMinTh) ? cfg_.threshold : kMinTh;
  above_               = false;
  samples_since_edge_  = 0;
  last_period_samples_ = 0;
  stale_counter_       = 0;
  count_               = 0;
  initialized_         = false;
}

void RippleCounter::update(uint16_t adcSample) {
  const float x = static_cast<float>(adcSample);

  // Seed filter state on first sample to avoid long convergence transient
  if (!initialized_) {
    dc_          = x;
    prev_x_      = x;
    hp_          = 0.0f;
    initialized_ = true;
    ++samples_since_edge_;
    ++stale_counter_;
    return;
  }

  // §4.1 IIR low-pass DC removal
  // dc[n] = (1-α)*dc[n-1] + α*x[n]  ≡  dc += α*(x - dc)
  dc_ += cfg_.lpAlpha * (x - dc_);

  // §4.2 High-pass filter
  // hp[n] = α*(hp[n-1] + x[n] - x[n-1])
  const float hp_new = cfg_.hpAlpha * (hp_ + x - prev_x_);

  // §4.3 Adaptive threshold
  // th[n] = 0.99*th[n-1] + 0.01*|hp[n]|
  const float abs_hp = (hp_new >= 0.0f) ? hp_new : -hp_new;
  th_ = 0.99f * th_ + 0.01f * abs_hp;
  if (th_ < kMinTh) th_ = kMinTh;  // guard NaN / division-by-zero downstream

  // §4.4 Schmitt trigger — count rising edges only
  if (above_) {
    // Falling: signal below lower hysteresis band
    if (hp_new < th_ * (1.0f - cfg_.hysteresis))
      above_ = false;
  } else {
    // Rising: signal above adaptive threshold
    if (hp_new > th_) {
      // §4.5 Minimum-period gate
      if (samples_since_edge_ >= cfg_.minPeriodSamples) {
        last_period_samples_ = samples_since_edge_;
        samples_since_edge_  = 0;
        stale_counter_       = 0;
        above_               = true;
        ++count_;
      }
    }
  }

  prev_x_ = x;
  hp_     = hp_new;
  ++samples_since_edge_;
  ++stale_counter_;
}

uint32_t RippleCounter::getRippleCount() const {
  return count_;
}

float RippleCounter::getPositionRad() const {
  if (cfg_.ripplesPerRev == 0) return 0.0f;
  return static_cast<float>(count_) * kTwoPi
         / static_cast<float>(cfg_.ripplesPerRev);
}

float RippleCounter::getSpeedRPS() const {
  if (cfg_.sampleRate    <= 0.0f) return 0.0f;
  if (cfg_.ripplesPerRev == 0)    return 0.0f;
  if (last_period_samples_ == 0)  return 0.0f;

  // Return 0 if no edge has arrived for more than 1 second of samples
  const uint32_t stale_limit = static_cast<uint32_t>(cfg_.sampleRate);
  if (stale_counter_ > stale_limit) return 0.0f;

  // speed [RPS] = sampleRate / (period_samples * ripples_per_rev)
  return cfg_.sampleRate
         / (static_cast<float>(last_period_samples_)
            * static_cast<float>(cfg_.ripplesPerRev));
}

}  // namespace hv6
