// =============================================================================
// HV6 Shared Types — Configuration structs, enums, and constants
// =============================================================================
// Single source of truth for all HeatValve-6 data types.
// Ported directly from src/app_config.h, adapted for ESPHome.
// =============================================================================

#pragma once

#include <cstdint>
#include <cmath>
#include <algorithm>
#include <array>

namespace hv6 {

// =============================================================================
// Constants
// =============================================================================

static constexpr uint8_t NUM_ZONES = 6;
static constexpr uint8_t MAX_PROBES = 8;
static constexpr int8_t PROBE_UNASSIGNED = -1;
static constexpr uint32_t I2C_FREQ_HZ = 100000;
static constexpr float IPROPI_RESISTOR_OHM = 5100.0f;
static constexpr float IPROPI_GAIN_UA_A = 5320.0f;
static constexpr float IPROPI_DIVISOR = 0.027132f;

// =============================================================================
// Enums
// =============================================================================

enum class ControlAlgorithm : uint8_t {
  TANH = 0,
  LINEAR = 1,
  PID = 2,
  ADAPTIVE = 3,
};

enum class ZoneState : int8_t {
  UNKNOWN = -1,
  OVERHEATED = 0,
  SATISFIED = 1,
  DEMAND = 2,
};

enum class MotorDirection : int8_t {
  CLOSE = 0,
  OPEN = 1,
};

enum class FaultCode : uint8_t {
  NONE = 0,
  OPEN_CIRCUIT = 1,
  BLOCKED = 2,
  TIMEOUT = 3,
  OVERCURRENT = 4,
  THERMAL = 5,
  STALL = 6,
  UNKNOWN_FAULT = 7,
};

enum class MotorFsmState : uint8_t {
  IDLE = 0,
  BOOST = 1,
  HOLD = 2,
  STOPPING = 3,
};

enum class PipeType : uint8_t {
  PEX_12X2 = 0,
  PEX_14X2 = 1,
  PEX_16X2 = 2,
  PEX_17X2 = 3,
  PEX_18X2 = 4,
  PEX_20X2 = 5,
  ALUPEX_16X2 = 6,
  ALUPEX_20X2 = 7,
};

enum class FloorType : uint8_t {
  TILE = 0,
  PARQUET = 1,
  OAK = 2,
  CARPET = 3,
};

enum class HeatingProfile : uint8_t {
  BOILER = 0,
  HEAT_PUMP = 1,
  DISTRICT_HEATING = 2,
};

// =============================================================================
// Configuration Structs
// =============================================================================

struct ZoneConfig {
  bool enabled = true;
  float area_m2 = 15.0f;
  float max_opening_pct = 90.0f;
  PipeType pipe_type = PipeType::PEX_16X2;
  FloorType floor_type = FloorType::TILE;
  float pipe_spacing_mm = 150.0f;
  float floor_cover_thickness_mm = 15.0f;
  float setpoint_c = 21.0f;
  ControlAlgorithm algorithm = ControlAlgorithm::TANH;
  float heat_loss_w_m2 = 35.0f;
  float supply_pipe_length_m = 2.0f;
  float cooling_delta_c = 5.0f;
  float concrete_thickness_mm = 50.0f;
  char name[16] = "";
};

struct ControlConfig {
  float comfort_band_c = 0.5f;
  float min_valve_opening_pct = 25.0f;
  float maintenance_base_pct = 45.0f;
  float demand_boost_pct = 30.0f;
  float boost_factor = 1.0f;
  float min_movement_pct = 5.0f;
  float tanh_steepness = 0.70f;
};

struct ProbeConfig {
  int8_t manifold_flow_probe = 0;
  int8_t manifold_return_probe = 1;
  int8_t zone_return_probe[NUM_ZONES] = {2, 3, 4, 5, 6, 7};
};

struct PIDParams {
  float kp = 5.0f;
  float ki = 0.005f;
  float kd = 0.0f;
  float integral_limit = 50.0f;
};

struct MotorConfig {
  uint32_t pwm_boost_ms = 350;
  uint8_t pwm_hold_duty_pct = 70;
  uint32_t pwm_period_ms = 40;
  uint32_t max_runtime_s = 65;
  float current_factor_high = 1.7f;
  float low_current_threshold_ma = 5.0f;
  uint32_t low_current_window_ms = 1200;
  uint32_t calibration_min_travel_ms = 3000;
  uint8_t calibration_max_retries = 2;
  uint32_t relearn_after_movements = 2000;
  uint32_t relearn_after_hours = 168;
  float drift_relearn_threshold_pct = 15.0f;
  uint32_t presence_test_duration_ms = 800;
};

struct MotorTelemetry {
  uint32_t movement_count = 0;
  uint32_t open_count = 0;
  uint32_t close_count = 0;
  uint32_t last_open_endstop_ms = 0;
  uint32_t last_close_endstop_ms = 0;
  uint32_t learned_open_ms = 0;
  uint32_t learned_close_ms = 0;
  uint32_t learned_open_ripples = 0;
  uint32_t learned_close_ripples = 0;
  int32_t deadzone_ms = 0;
  float drift_percent = 0.0f;
  uint32_t movements_since_learn = 0;
  uint32_t last_learn_ms = 0;
  uint8_t calibration_retries = 0;
  bool blocked = false;
  bool present = false;
  bool presence_known = false;
  float mean_current_ma = 20.0f;
  float current_position_pct = 0.0f;
};

struct ZoneSnapshot {
  float temperature_c = NAN;
  float setpoint_c = 21.0f;
  float valve_position_pct = 0.0f;
  ZoneState state = ZoneState::UNKNOWN;
  float hydraulic_factor = 0.0f;
  bool was_overheated = false;
  float heat_output_w = 0.0f;
  float pipe_length_m = 0.0f;
  float flow_lh = 0.0f;
  float floor_surface_temp_c = 0.0f;
  bool pipe_length_warning = false;
};

struct SystemSnapshot {
  std::array<ZoneSnapshot, NUM_ZONES> zones{};
  uint8_t active_zones = 0;
  float avg_valve_pct = 0.0f;
  float manifold_flow_temp_c = NAN;
  float manifold_return_temp_c = NAN;
  uint32_t uptime_s = 0;
  uint32_t free_heap = 0;
  uint32_t cycle_count = 0;
  bool wifi_connected = true;
};

struct SystemConfig {
  char controller_id[33] = "heatvalve-6";
  HeatingProfile heating_profile = HeatingProfile::HEAT_PUMP;
  float supply_temp_c = 35.0f;
};

struct DeviceConfig {
  SystemConfig system;
  ZoneConfig zones[NUM_ZONES];
  ControlConfig control;
  ProbeConfig probes;
  PIDParams pid;
  MotorConfig motor;
};

// =============================================================================
// Helper Functions
// =============================================================================

inline const char *fault_code_to_string(FaultCode code) {
  switch (code) {
    case FaultCode::NONE: return "NONE";
    case FaultCode::OPEN_CIRCUIT: return "OPEN_CIRCUIT";
    case FaultCode::BLOCKED: return "BLOCKED";
    case FaultCode::TIMEOUT: return "TIMEOUT";
    case FaultCode::OVERCURRENT: return "OVERCURRENT";
    case FaultCode::THERMAL: return "THERMAL";
    case FaultCode::STALL: return "STALL";
    default: return "UNKNOWN";
  }
}

inline const char *zone_state_to_string(ZoneState state) {
  switch (state) {
    case ZoneState::OVERHEATED: return "OVERHEATED";
    case ZoneState::SATISFIED: return "SATISFIED";
    case ZoneState::DEMAND: return "DEMAND";
    default: return "UNKNOWN";
  }
}

inline float pipe_inner_diameter_mm(PipeType type) {
  switch (type) {
    case PipeType::PEX_12X2: return 8.0f;
    case PipeType::PEX_14X2: return 10.0f;
    case PipeType::PEX_16X2: return 12.0f;
    case PipeType::PEX_17X2: return 13.0f;
    case PipeType::PEX_18X2: return 14.0f;
    case PipeType::PEX_20X2: return 16.0f;
    case PipeType::ALUPEX_16X2: return 12.0f;
    case PipeType::ALUPEX_20X2: return 16.0f;
    default: return 12.0f;
  }
}

inline float pipe_max_length_m(PipeType type) {
  switch (type) {
    case PipeType::PEX_12X2: return 80.0f;
    case PipeType::PEX_14X2: return 90.0f;
    case PipeType::PEX_16X2: return 120.0f;
    case PipeType::PEX_17X2: return 120.0f;
    case PipeType::PEX_18X2: return 150.0f;
    case PipeType::PEX_20X2: return 150.0f;
    case PipeType::ALUPEX_16X2: return 100.0f;
    case PipeType::ALUPEX_20X2: return 125.0f;
    default: return 120.0f;
  }
}

}  // namespace hv6
