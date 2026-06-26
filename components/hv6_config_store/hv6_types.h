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

enum class MotorProfile : uint8_t {
  INHERIT = 0,
  GENERIC = 1,
  HMIP_VDMOT = 2,
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
  MECHANICAL_OVERRUN = 8,
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
  BLE_SENSOR = 1,
};

/// Hydraulic-balancing strategy. STATIC uses the resistance-aware design model
/// only; ADAPTIVE adds a slow room-temperature correction on top (no return
/// probes); RETURN_TEMP is the legacy ΔT-from-return-probe balancer (superseded
/// by ADAPTIVE, kept for back-compat). See docs/adaptive_balancing.md.
enum class BalanceMode : uint8_t {
  STATIC = 0,
  RETURN_TEMP = 1,
  ADAPTIVE = 2,
};

static constexpr TempSource DEFAULT_ZONE_TEMP_SOURCE = TempSource::BLE_SENSOR;

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

/// Seed a sensible forecast wind-exposure factor (0..1) from the exterior-wall
/// bitmask. More exposed walls (a corner room) catch more wind regardless of
/// direction, so exposure scales with the wall count. Used to pre-fill the
/// editable per-zone wind_exposure when the walls are changed — the user can
/// still override it afterwards for site-specific shelter.
inline float default_wind_exposure(uint8_t walls) {
  uint8_t count = 0;
  for (uint8_t bit = 0; bit < 4; bit++)
    if (walls & (1 << bit))
      count++;
  switch (count) {
    case 0:  return 0.0f;
    case 1:  return 0.5f;
    case 2:  return 0.7f;
    case 3:  return 0.85f;
    default: return 1.0f;
  }
}

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
  MotorProfile motor_profile_override = MotorProfile::INHERIT;
  // Motor-specific endstop tuning (0.0 = use global default from MotorConfig)
  float motor_close_current_factor_override = 0.0f;  ///< Per-motor close threshold (slower motors may need 1.6x vs 1.7x to avoid premature pop-off)
  float motor_open_current_factor_override = 0.0f;   ///< Per-motor open threshold
  // Helios-3 per-zone setpoint offset safety limits
  float min_offset_c = -2.0f;  ///< Minimum setpoint offset from Helios (firmware safety clamp)
  float max_offset_c = 2.0f;   ///< Maximum setpoint offset from Helios (firmware safety clamp)
  float abs_min_c = 5.0f;      ///< Absolute minimum effective setpoint (overrides all offsets)
  float abs_max_c = 30.0f;     ///< Absolute maximum effective setpoint (overrides all offsets)
  // Forecast preload exposure model (wind direction is matched against the
  // exterior_walls bitmask above; see components/hv6_forecast/forecast_model.h)
  float wind_exposure = 0.5f;      ///< 0..1 — facade shelter factor for forecast preload
  float solar_gain_factor = 0.3f;  ///< 0..1 — passive solar relief through glazing
  uint8_t thermal_lead_h = 4;      ///< Hours before a forecast load peak charging must start
  // Adaptive balancing — learned room-temp correction multiplier (adapt_i). Rides
  // on top of the resistance-aware static prior; persisted in the durable zones
  // blob so it survives legacy main-config resets. See docs/adaptive_balancing.md.
  float balance_adapt = 1.0f;
  // Simple preheat — learned per-zone head-start (°C above setpoint to start
  // heating so the zone reaches temperature on time). Adapts over time; persisted
  // so the device doesn't have to re-learn from zero after every reboot.
  float preheat_advance_c = 0.0f;
};

struct ControlConfig {
  float comfort_band_c = 0.5f;
  float min_valve_opening_pct = 25.0f;
  float maintenance_base_pct = 15.0f;
  float demand_boost_pct = 30.0f;
  float boost_factor = 1.0f;
  float min_movement_pct = 5.0f;
  float tanh_steepness = 0.70f;
  bool simple_preheat_enabled = true;
  // Preheat absorption — when an external optimizer (Odin via Asgard) pre-buffers
  // the slab, hot water arrives while no zone demands heat. Without this, zones
  // hit OVERHEATED and close, blocking the buffer. While absorbing, the overheat
  // cutoff is raised by preheat_absorb_band_c (scaled per zone by floor thermal
  // mass) so satisfied zones keep their maintenance opening.
  bool preheat_absorb_enabled = true;
  float preheat_absorb_band_c = 1.0f;   ///< Extra °C above comfort band before OVERHEATED while absorbing
  float preheat_detect_delta_c = 8.0f;  ///< Flow must exceed house-average temp by this to detect pre-buffering
};

struct ProbeConfig {
  // Probe indices are 0-based (Probe 1 = index 0).
  int8_t manifold_flow_probe = 6;    // Probe 7
  int8_t manifold_return_probe = 7;  // Probe 8
  int8_t zone_return_probe[NUM_ZONES] = {0, 1, 2, 3, 4, 5};  // Zone N -> Probe N
};

static constexpr uint8_t BLE_MAC_LEN = 18;  // "AA:BB:CC:DD:EE:FF" + null

struct SensorConfig {
  TempSource zone_temp_source[NUM_ZONES] = {
      DEFAULT_ZONE_TEMP_SOURCE,
      DEFAULT_ZONE_TEMP_SOURCE,
      DEFAULT_ZONE_TEMP_SOURCE,
      DEFAULT_ZONE_TEMP_SOURCE,
      DEFAULT_ZONE_TEMP_SOURCE,
      DEFAULT_ZONE_TEMP_SOURCE,
  };
  char zone_ble_mac[NUM_ZONES][BLE_MAC_LEN] = {};
};

/// Version tag for the standalone sensor-pairing NVS blob. This is persisted
/// under its own key (separate from the main DeviceConfig blob) so BLE MAC
/// pairings + temp sources survive legacy main-config resets on firmware update.
/// Bump only when SensorConfig's layout changes.
static constexpr uint32_t SENSOR_CONFIG_VERSION = 1;

/// Version tag for the standalone zone-config NVS blob. Persisted under its own
/// key (separate from the main DeviceConfig blob) so per-zone settings (area,
/// pipe type/spacing, exterior walls, etc.) survive legacy main-config resets on
/// firmware update. Bump only when ZoneConfig's layout changes.
/// v2 adds balance_adapt (learned adaptive-balancing multiplier).
/// v3 adds preheat_advance_c (learned simple-preheat head-start per zone).
static constexpr uint32_t ZONE_CONFIG_VERSION = 3;

/// Per-section durable NVS blob versions. Each global-settings section is mirrored
/// to its own NVS key (like zones/sensors above) so it survives any discard of
/// the legacy main `config` blob. Bump an individual
/// constant ONLY when that one struct's layout changes — that resets just that
/// section, not the user's whole configuration. See hv6_config_store.cpp.
static constexpr uint32_t SYSTEM_CONFIG_VERSION = 1;
static constexpr uint32_t CONTROL_CONFIG_VERSION = 1;
static constexpr uint32_t PROBE_CONFIG_VERSION = 1;
static constexpr uint32_t PID_CONFIG_VERSION = 1;
static constexpr uint32_t MOTOR_CONFIG_VERSION = 1;
static constexpr uint32_t MANIFOLD_CONFIG_VERSION = 1;
static constexpr uint32_t BALANCING_CONFIG_VERSION = 1;
static constexpr uint32_t ASGARD_CONFIG_VERSION = 1;
static constexpr uint32_t FORECAST_CONFIG_VERSION = 1;

struct BalancingConfig {
  bool dynamic_balancing_enabled = false;   ///< Back-compat alias: true ⇒ mode == RETURN_TEMP
  bool modulating_heat_source = false;      ///< Manually enforce per-zone minimum flow for a modulating heat source
  float minimum_flow_pct = 15.0f;           ///< Per-zone minimum valve opening while manual minimum flow is active
  float flow_increase_threshold_pct = 80.0f;///< Request higher flow temp when avg zone opening exceeds this
  float flow_decrease_threshold_pct = 30.0f;///< Request lower flow temp when avg zone opening drops below this
  float target_delta_t_c = 5.0f;            ///< Target ΔT (flow − return) for dynamic (RETURN_TEMP) balancing
  float damping_factor = 0.3f;              ///< EMA damping for balance factor updates (0..1, lower = slower)
  // --- Adaptive balancing (room-temperature feedback; docs/adaptive_balancing.md) ---
  BalanceMode mode = BalanceMode::STATIC;   ///< Supersedes dynamic_balancing_enabled
  uint32_t adapt_interval_s = 3600;         ///< Outer-loop period (learned-factor step cadence)
  float    adapt_step = 0.02f;              ///< k: max factor move per update
  float    adapt_min = 0.5f;                ///< Clamp on the learned multiplier (lower)
  float    adapt_max = 1.5f;                ///< Clamp on the learned multiplier (upper)
  float    adapt_error_window_s = 1800.0f;  ///< β = dt / window for the per-zone error EMA
  uint16_t adapt_min_samples = 30;          ///< Eligible cycles a zone needs before it can update
  float    adapt_heat_margin_c = 2.0f;      ///< flow_temp must exceed room by this to count a sample
};

/// The external Helios-3 optimizer client was removed; whole-house MPC is now
/// handled by Odin via the Asgard bridge. All that remains is a quiesce gate:
/// `enabled` lets the on-device forecast preload stand down if a future external
/// optimizer is reintroduced (it owns the per-zone command slots). It has no
/// runtime setter today, so it stays false. The former host/port/mDNS fields
/// were dead and were removed (see docs/CLAUDE.md → Helios command path).
struct HeliosConfig {
  bool enabled = false;
};

static constexpr uint8_t ASGARD_HOST_LEN = 64;
static constexpr uint8_t ASGARD_ENTITY_LEN = 48;

/// Asgard (Ecodan heat-pump bridge) integration. Two HV6 boards run identical
/// firmware; exactly one has `coordinator = true` and pushes the house-weighted
/// room temperature to Asgard's virtual thermostat z1 (see docs/ecodan_integration.md).
struct AsgardConfig {
  bool enabled = false;
  bool coordinator = false;                   ///< This board aggregates + pushes to Asgard
  char host[ASGARD_HOST_LEN] = "";            ///< Asgard hostname or IP
  uint16_t port = 80;                         ///< Asgard HTTP port
  char entity_name[ASGARD_ENTITY_LEN] = "virtual_thermostat_input_z1";  ///< Asgard number entity (REST object_id)
  uint16_t push_interval_s = 30;              ///< Weighted-temp push cadence
  char peer_host[ASGARD_HOST_LEN] = "";       ///< The other HV6 board (coordinator only; empty = single board)
  uint16_t peer_port = 80;                    ///< Peer dashboard HTTP port
  uint16_t peer_stale_after_s = 300;          ///< Exclude peer zones when its snapshot is older than this
};

/// Weather-forecast preload (hv6_forecast component). Pulls a 48 h Open-Meteo
/// forecast and issues per-zone setpoint preload offsets through the Helios
/// command path. Auto-quiesces while an external Helios service is enabled.
struct ForecastConfig {
  bool enabled = false;
  float latitude = 0.0f;
  float longitude = 0.0f;
  uint16_t fetch_interval_s = 3600;     ///< Open-Meteo refresh cadence
  uint16_t recompute_interval_s = 300;  ///< Preload re-evaluation cadence
  float load_threshold = 1.0f;          ///< Load units before preload kicks in
  float gain_c_per_load = 0.5f;         ///< °C offset per load unit above threshold
  float max_offset_c = 1.5f;            ///< Model cap (per-zone clamps still apply)
  float indoor_ref_c = 21.0f;           ///< Reference indoor temp for the cold term
};

struct PIDParams {
  float kp = 5.0f;
  float ki = 0.005f;
  float kd = 0.0f;
  float integral_limit = 50.0f;
};

struct MotorConfig {
  MotorProfile default_profile = MotorProfile::HMIP_VDMOT;
  uint32_t pwm_boost_ms = 350;
  uint8_t pwm_hold_duty_pct = 70;
  uint32_t pwm_period_ms = 40;
  // Soft-approach: reduce drive force in the final stretch of a drive-to-endstop
  // move so the actuator coasts into the mechanical stop instead of slamming it
  // (prevents piston-lock / socket pop-off). 0 disables.
  uint8_t pwm_approach_duty_pct = 40;  // reduced hold duty during final approach
  uint8_t approach_zone_pct = 80;      // begin soft-approach at this % of the move
  uint32_t max_runtime_s = 45;  // Reduced from 65s to prevent piston lock/socket pop-off (mechanical limit ~40s)
  uint32_t generic_profile_runtime_limit_s = 45;
  uint32_t hmip_vdmot_runtime_limit_s = 40;
  // Margin added to the learned stroke time to form the adaptive runtime safety
  // cap (caps a calibrated valve sooner than the per-profile limit). Smaller =
  // tighter overrun protection.
  uint32_t adaptive_runtime_margin_ms = 3000;
  uint32_t calibration_timeout_s = 120;
  // Close-direction endstop (higher current at mechanical stop)
  float close_current_factor = 1.7f;
  float close_slope_threshold_ma_per_s = 0.6f;
  float close_slope_current_factor = 1.3f;
  // Open-direction endstop (gentler ramp — spring assist)
  float open_current_factor = 1.7f;
  float open_slope_threshold_ma_per_s = 0.15f;
  float open_slope_current_factor = 1.3f;
  // Direction-aware fast hard cap: the gentle open stall (~25 mA) never reaches
  // the fixed ENDSTOP_HARD_CAP_MA safety ceiling, so derive a lower open cap on
  // the raw (low-latency) current as a fast belt for the open endstop.
  float open_hard_cap_factor = 1.7f;     // open raw cap = max(floor, mean_open × factor)
  float open_hard_cap_floor_ma = 20.0f;  // floor so a low/under-learned mean can't trip mid-travel
                                         // (20 mA: low enough that low-current opens still get a fast belt;
                                         //  detection only runs past the ~500 ms guard, clear of boost decay)
  // Ripple safety limit for opening: learned_open_ripples × factor (0 = disabled)
  float open_ripple_limit_factor = 1.10f;
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
  bool auto_apply_learned_factors = true;
  uint8_t learned_factor_min_samples = 3;
  float learned_factor_max_deviation_pct = 0.12f;
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
  float mean_open_current_ma = 20.0f;   ///< Running mean current, OPEN moves (open endstop threshold base)
  float mean_close_current_ma = 20.0f;  ///< Running mean current, CLOSE moves (close endstop threshold base)
  float current_position_pct = 0.0f;
  uint32_t pin_engage_close_ripples = 0;  // Ripples from open end at pin contact (close pass)
  float learned_open_current_factor = 0.0f;
  float learned_close_current_factor = 0.0f;
  uint8_t learned_open_confidence = 0;
  uint8_t learned_close_confidence = 0;
  float last_open_candidate_factor = 0.0f;
  float last_close_candidate_factor = 0.0f;
  float last_open_peak_ma = 0.0f;
  float last_close_peak_ma = 0.0f;
  bool last_learning_sample_valid = false;
  FaultCode last_fault_code = FaultCode::NONE;
};

struct ZoneSnapshot {
  float temperature_c = NAN;
  float setpoint_c = 21.0f;
  float valve_position_pct = 0.0f;
  float preheat_advance_c = 0.0f;
  ZoneState state = ZoneState::UNKNOWN;
  ZoneDisplayState display_state = ZoneDisplayState::UNKNOWN;
  float hydraulic_factor = 0.0f;      ///< Effective balance factor applied (static × adapt)
  float static_factor = 0.0f;         ///< Resistance-aware static prior (normalized, 0..1)
  float balance_adapt = 1.0f;         ///< Learned adaptive multiplier in effect (adapt_i)
  float adapt_err_ema = NAN;          ///< Long-window room-temp error EMA (NAN = no samples yet)
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
  bool preheat_absorbing = false;             ///< External pre-buffering detected; overheat cutoff raised
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

/// Baseline version tag for the legacy all-in-one DeviceConfig blob.
///
/// Firmware release bumps must not change this value. User-facing settings are
/// mirrored into independently versioned NVS section blobs above; bump only the
/// affected *_CONFIG_VERSION when that section's binary layout is no longer
/// compatible. The main blob version is kept stable at schema v1.0 and is used
/// only as a broad fallback/normalization marker.
static constexpr uint32_t CONFIG_VERSION = 1;

struct DeviceConfig {
  uint32_t config_version = CONFIG_VERSION;
  SystemConfig system;
  ZoneConfig zones[NUM_ZONES];
  ControlConfig control;
  ProbeConfig probes;
  PIDParams pid;
  MotorConfig motor;
  ManifoldType manifold_type = ManifoldType::NO;
  SensorConfig sensor_config;
  BalancingConfig balancing;
  HeliosConfig helios;
  AsgardConfig asgard;
  ForecastConfig forecast;
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
    case FaultCode::MECHANICAL_OVERRUN: return "MECHANICAL_OVERRUN";
    default: return "UNKNOWN";
  }
}

inline const char *motor_profile_to_string(MotorProfile profile) {
  switch (profile) {
    case MotorProfile::INHERIT: return "INHERIT";
    case MotorProfile::GENERIC: return "GENERIC";
    case MotorProfile::HMIP_VDMOT: return "HMIP_VDMOT";
    default: return "UNKNOWN";
  }
}

inline const char *balance_mode_to_string(BalanceMode mode) {
  switch (mode) {
    case BalanceMode::STATIC: return "STATIC";
    case BalanceMode::RETURN_TEMP: return "RETURN_TEMP";
    case BalanceMode::ADAPTIVE: return "ADAPTIVE";
    default: return "STATIC";
  }
}

/// Resolve the effective balance mode, honouring the legacy
/// dynamic_balancing_enabled flag as an alias for RETURN_TEMP.
inline BalanceMode effective_balance_mode(const BalancingConfig &b) {
  if (b.dynamic_balancing_enabled || b.mode == BalanceMode::RETURN_TEMP)
    return BalanceMode::RETURN_TEMP;
  return b.mode;
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
