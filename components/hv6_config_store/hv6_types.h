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

enum class ZoneDisplayState : int8_t {
  UNKNOWN = -1,
  OFF = 0,
  MANUAL = 1,
  CALIBRATING = 2,
  WAITING_CALIBRATION = 3,
  WAITING_ROOM_TEMP = 4,
  HEATING = 5,
  IDLE = 6,
  OVERHEATED = 7,
};

enum class SystemConditionState : int8_t {
  UNKNOWN = -1,
  NORMAL = 0,
  ABOVE_SETPOINT = 1,
  OVERHEATED = 2,
};

enum class ControllerState : int8_t {
  UNKNOWN = -1,
  OFF = 0,
  MANUAL = 1,
  CALIBRATING = 2,
  WAITING_INPUT = 3,
  IDLE = 4,
  HEATING = 5,
  MIXED = 6,
  FAULT = 7,
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

enum class ManifoldType : uint8_t {
  NO = 0,
  NC = 1,
};

enum class TempSource : uint8_t {
  LOCAL_PROBE = 0,
  MQTT_EXTERNAL = 1,
  BLE_SENSOR = 2,
};

/// What the zone's local DS18B20 probe measures.
enum class ProbeRole : uint8_t {
  ROOM_TEMPERATURE = 0,   ///< Measures room/air temperature (used as control input)
  RETURN_WATER = 1,       ///< Measures return-pipe water temperature (enables dynamic balancing)
};

namespace ExteriorWall {
  static constexpr uint8_t NONE  = 0;
  static constexpr uint8_t NORTH = 1 << 0;
  static constexpr uint8_t EAST  = 1 << 1;
  static constexpr uint8_t SOUTH = 1 << 2;
  static constexpr uint8_t WEST  = 1 << 3;
}  // namespace ExteriorWall

// =============================================================================
// Configuration Structs
// =============================================================================

struct ZoneConfig {
  bool enabled = true;
  float area_m2 = 15.0f;
  float max_opening_pct = 90.0f;
  PipeType pipe_type = PipeType::PEX_16X2;
  FloorType floor_type = FloorType::TILE;
  float pipe_spacing_mm = 200.0f;
  float floor_cover_thickness_mm = 15.0f;
  float setpoint_c = 21.0f;
  ControlAlgorithm algorithm = ControlAlgorithm::TANH;
  float heat_loss_w_m2 = 35.0f;
  float supply_pipe_length_m = 2.0f;
  float cooling_delta_c = 5.0f;
  float concrete_thickness_mm = 50.0f;
  char name[16] = "";
  uint8_t exterior_walls = ExteriorWall::NONE;  // Bitmask: N|E|S|W
  ProbeRole probe_role = ProbeRole::ROOM_TEMPERATURE;
  int8_t sync_to_zone = -1;  ///< -1 = independent, 0–5 = synced to that zone (shares setpoint + avg temp)
};

struct ControlConfig {
  float comfort_band_c = 0.5f;
  float min_valve_opening_pct = 25.0f;
  float maintenance_base_pct = 15.0f;
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

static constexpr uint8_t MQTT_DEVICE_NAME_LEN = 48;
static constexpr uint8_t BLE_MAC_LEN = 18;  // "AA:BB:CC:DD:EE:FF" + null

struct MqttTempConfig {
  TempSource zone_temp_source[NUM_ZONES] = {};
  char zone_mqtt_device[NUM_ZONES][MQTT_DEVICE_NAME_LEN] = {};
  char zone_ble_mac[NUM_ZONES][BLE_MAC_LEN] = {};
};

struct BalancingConfig {
  bool dynamic_balancing_enabled = false;   ///< Use measured return temps for balance factors
  bool modulating_heat_source = false;      ///< True when heat source can modulate flow temp (Helios-6/Ecodan)
  float minimum_flow_pct = 15.0f;           ///< Per-zone minimum valve opening (only active with modulating source)
  float flow_increase_threshold_pct = 80.0f;///< Request higher flow temp when avg zone opening exceeds this
  float flow_decrease_threshold_pct = 30.0f;///< Request lower flow temp when avg zone opening drops below this
  float target_delta_t_c = 5.0f;            ///< Target ΔT (flow − return) for dynamic balancing
  float damping_factor = 0.3f;              ///< EMA damping for balance factor updates (0..1, lower = slower)
};

static constexpr uint8_t MQTT_BROKER_LEN = 64;
static constexpr uint8_t MQTT_CRED_LEN = 48;

struct MqttBrokerConfig {
  char broker[MQTT_BROKER_LEN] = "";   ///< MQTT broker hostname/IP (empty = use YAML default)
  uint16_t port = 0;                     ///< MQTT broker port (0 = use YAML default)
  char username[MQTT_CRED_LEN] = "";   ///< MQTT username (empty = use YAML default)
  char password[MQTT_CRED_LEN] = "";   ///< MQTT password (empty = use YAML default)
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
  uint32_t calibration_timeout_s = 120;
  // Close-direction endstop (higher current at mechanical stop)
  float close_current_factor = 1.8f;
  float close_slope_threshold_ma_per_s = 0.6f;
  float close_slope_current_factor = 1.3f;
  // Open-direction endstop (gentler ramp — spring assist)
  float open_current_factor = 1.2f;
  float open_slope_threshold_ma_per_s = 0.15f;
  float open_slope_current_factor = 1.3f;
  // Ripple safety limit for opening: learned_open_ripples × factor (0 = disabled)
  float open_ripple_limit_factor = 1.2f;
  // Pin engagement detection (calibration)
  float pin_engage_step_ma = 3.0f;              // Current increase to detect pin contact
  uint16_t pin_engage_margin_ripples = 50;       // Offset toward open from detected point
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
  uint32_t pin_engage_close_ripples = 0;  // Ripples from open end at pin contact (close pass)
};

struct ZoneSnapshot {
  float temperature_c = NAN;
  float setpoint_c = 21.0f;
  float valve_position_pct = 0.0f;
  ZoneState state = ZoneState::UNKNOWN;
  ZoneDisplayState display_state = ZoneDisplayState::UNKNOWN;
  float hydraulic_factor = 0.0f;
  bool was_overheated = false;
  float heat_output_w = 0.0f;
  float pipe_length_m = 0.0f;
  float flow_lh = 0.0f;
  float floor_surface_temp_c = 0.0f;
  bool pipe_length_warning = false;
  float return_temp_c = NAN;          ///< Measured return water temperature (when probe_role == RETURN_WATER)
  float measured_delta_t_c = NAN;     ///< Measured ΔT (flow − return)
};

struct SystemSnapshot {
  std::array<ZoneSnapshot, NUM_ZONES> zones{};
  ControllerState controller_state = ControllerState::UNKNOWN;
  SystemConditionState system_condition_state = SystemConditionState::UNKNOWN;
  uint8_t active_zones = 0;
  float avg_valve_pct = 0.0f;
  float manifold_flow_temp_c = NAN;
  float manifold_return_temp_c = NAN;
  bool flow_temp_increase_requested = false;  ///< Avg opening > threshold → need higher flow temp
  bool flow_temp_decrease_requested = false;  ///< Avg opening < threshold → can lower flow temp
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

/// Bump this whenever a struct layout or default value changes to force
/// NVS-stored config to be discarded in favour of fresh C++ defaults.
static constexpr uint32_t CONFIG_VERSION = 6;

struct DeviceConfig {
  uint32_t config_version = CONFIG_VERSION;
  SystemConfig system;
  ZoneConfig zones[NUM_ZONES];
  ControlConfig control;
  ProbeConfig probes;
  PIDParams pid;
  MotorConfig motor;
  ManifoldType manifold_type = ManifoldType::NO;
  MqttTempConfig mqtt_temp;
  BalancingConfig balancing;
  MqttBrokerConfig mqtt_broker;
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
    case ZoneState::UNKNOWN:
    default: return "UNKNOWN";
  }
}

inline const char *zone_display_state_to_string(ZoneDisplayState state) {
  switch (state) {
    case ZoneDisplayState::OFF: return "OFF";
    case ZoneDisplayState::MANUAL: return "MANUAL";
    case ZoneDisplayState::CALIBRATING: return "CALIBRATING";
    case ZoneDisplayState::WAITING_CALIBRATION: return "WAITING_CALIBRATION";
    case ZoneDisplayState::WAITING_ROOM_TEMP: return "WAITING_ROOM_TEMP";
    case ZoneDisplayState::HEATING: return "HEATING";
    case ZoneDisplayState::IDLE: return "IDLE";
    case ZoneDisplayState::OVERHEATED: return "OVERHEATED";
    case ZoneDisplayState::UNKNOWN:
    default:
      return "UNKNOWN";
  }
}

inline const char *controller_state_to_string(ControllerState state) {
  switch (state) {
    case ControllerState::OFF: return "OFF";
    case ControllerState::MANUAL: return "MANUAL";
    case ControllerState::CALIBRATING: return "CALIBRATING";
    case ControllerState::WAITING_INPUT: return "WAITING_INPUT";
    case ControllerState::IDLE: return "IDLE";
    case ControllerState::HEATING: return "HEATING";
    case ControllerState::MIXED: return "MIXED";
    case ControllerState::FAULT: return "FAULT";
    case ControllerState::UNKNOWN:
    default:
      return "UNKNOWN";
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
