// =============================================================================
// Control Algorithm Interface + Implementations
// =============================================================================
// Ported directly from lib/zone_controller/src/ headers.
// All algorithms in a single header for simplicity.
// =============================================================================

#pragma once

#include "../hv6_config_store/hv6_types.h"
#include <cmath>
#include <algorithm>

namespace hv6 {

// =============================================================================
// Abstract Interface
// =============================================================================

class IControlAlgorithm {
 public:
  virtual ~IControlAlgorithm() = default;
  virtual float calculate(float current_temp, float setpoint,
                          const ControlConfig &control, const ZoneConfig &zone) = 0;
  virtual void reset() = 0;
};

// =============================================================================
// Tanh — Smooth nonlinear response
// =============================================================================

class TanhControl : public IControlAlgorithm {
 public:
  float calculate(float current_temp, float setpoint,
                  const ControlConfig &control, const ZoneConfig &zone) override {
    float error = setpoint - current_temp;
    float raw = std::tanh(control.tanh_steepness * error);
    float position = raw * control.boost_factor * 100.0f;
    return std::clamp(position, 0.0f, zone.max_opening_pct);
  }
  void reset() override {}
};

// =============================================================================
// Linear — Simple proportional
// =============================================================================

class LinearControl : public IControlAlgorithm {
 public:
  float calculate(float current_temp, float setpoint,
                  const ControlConfig &control, const ZoneConfig &zone) override {
    float error = setpoint - current_temp;
    float normalized = (error + 1.0f) / 2.0f;
    float position = normalized * control.boost_factor * 100.0f;
    return std::clamp(position, 0.0f, zone.max_opening_pct);
  }
  void reset() override {}
};

// =============================================================================
// PID — Full proportional-integral-derivative with anti-windup
// =============================================================================

class PIDControl : public IControlAlgorithm {
 public:
  explicit PIDControl(const PIDParams &params = {}) : params_(params) {}

  float calculate(float current_temp, float setpoint,
                  const ControlConfig &control, const ZoneConfig &zone) override {
    float error = setpoint - current_temp;
    float p_term = params_.kp * error;

    integral_ += error;
    integral_ = std::clamp(integral_, -params_.integral_limit, params_.integral_limit);
    float i_term = params_.ki * integral_;

    float derivative = current_temp - last_temp_;
    float d_term = -params_.kd * derivative;
    last_temp_ = current_temp;

    float position = (p_term + i_term + d_term) * control.boost_factor;
    return std::clamp(position, 0.0f, zone.max_opening_pct);
  }

  void reset() override {
    integral_ = 0.0f;
    last_temp_ = NAN;
  }

  void set_params(const PIDParams &params) { params_ = params; }

 private:
  PIDParams params_;
  float integral_ = 0.0f;
  float last_temp_ = NAN;
};

// =============================================================================
// Adaptive — Runtime-switchable delegating controller
// =============================================================================

class AdaptiveControl : public IControlAlgorithm {
 public:
  explicit AdaptiveControl(const PIDParams &pid_params = {})
      : pid_(pid_params), active_algo_(ControlAlgorithm::TANH) {}

  float calculate(float current_temp, float setpoint,
                  const ControlConfig &control, const ZoneConfig &zone) override {
    switch (active_algo_) {
      case ControlAlgorithm::LINEAR:
        return linear_.calculate(current_temp, setpoint, control, zone);
      case ControlAlgorithm::PID:
        return pid_.calculate(current_temp, setpoint, control, zone);
      case ControlAlgorithm::TANH:
      case ControlAlgorithm::ADAPTIVE:
      default:
        return tanh_.calculate(current_temp, setpoint, control, zone);
    }
  }

  void reset() override {
    tanh_.reset();
    linear_.reset();
    pid_.reset();
  }

  void set_algorithm(ControlAlgorithm algo) {
    if (algo != active_algo_) {
      active_algo_ = algo;
      reset();
    }
  }

  ControlAlgorithm get_algorithm() const { return active_algo_; }
  void set_pid_params(const PIDParams &params) { pid_.set_params(params); }

 private:
  TanhControl tanh_;
  LinearControl linear_;
  PIDControl pid_;
  ControlAlgorithm active_algo_;
};

}  // namespace hv6
