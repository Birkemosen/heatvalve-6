// =============================================================================
// HV6 Asgard Bridge — ESPHome Component Header
// =============================================================================
// Pushes the house-weighted room temperature to Asgard's virtual thermostat
// (Ecodan heat pump). Two HV6 boards run identical firmware; the coordinator
// (master) polls the peer board's /api/hv6/v1/peer snapshot, weights all 12
// zones by area and POSTs the result to Asgard's z1 number entity.
// Runs as a FreeRTOS task to avoid blocking the ESPHome main loop.
// Contract: docs/ecodan_integration.md
// =============================================================================

#pragma once

#include "esphome/core/component.h"
#include "esphome/components/hv6_config_store/hv6_config_store.h"
#include "esphome/components/hv6_zone_controller/hv6_zone_controller.h"
#include "freertos/FreeRTOS.h"
#include "freertos/task.h"

namespace esphome {
namespace hv6_asgard_bridge {

enum class PeerStatus : uint8_t { NOT_CONFIGURED = 0, OK = 1, STALE = 2, UNREACHABLE = 3 };

class Hv6AsgardBridge : public esphome::Component {
 public:
  float get_setup_priority() const override { return esphome::setup_priority::AFTER_WIFI; }
  void setup() override;
  void dump_config() override;

  void set_zone_controller(hv6::Hv6ZoneController *ctrl) { zone_controller_ = ctrl; }
  void set_config_store(hv6::Hv6ConfigStore *store) { config_store_ = store; }

  // Diagnostic accessors (consumed by hv6_dashboard; scalar reads, no locking)
  const char *get_role_str() const;
  const char *get_peer_status_str() const;
  float    get_last_push_value() const { return last_push_value_; }
  uint32_t get_last_push_age_s() const;
  uint32_t get_push_fail_streak() const { return push_fail_streak_; }
  const char *get_last_error() const { return last_error_; }
  uint8_t  get_local_zones_used() const { return local_zones_used_; }
  uint8_t  get_peer_zones_used() const { return peer_zones_used_; }

 protected:
  static constexpr uint32_t STACK_SIZE = 12288;  ///< esp_http_client + JSON parsing
  static constexpr UBaseType_t PRIORITY = 1;     ///< Same as loopTask — yields during socket I/O
  static constexpr BaseType_t CORE = 1;          ///< Core 1; keeps WiFi/lwIP/httpd on Core 0 untouched
  static constexpr uint32_t HTTP_TIMEOUT_MS = 3000;

  void run_();
  static void task_func_(void *arg);

  bool fetch_peer_(const hv6::AsgardConfig &cfg);
  bool push_asgard_(const hv6::AsgardConfig &cfg, float value);
  /// Area-weighted average over local + fresh peer zones. Returns NAN when no
  /// zone qualifies. Sets local_zones_used_/peer_zones_used_.
  float compute_weighted_temp_(const hv6::AsgardConfig &cfg);

  hv6::Hv6ZoneController *zone_controller_{nullptr};
  hv6::Hv6ConfigStore *config_store_{nullptr};
  TaskHandle_t task_handle_{nullptr};

  // Peer zone cache (written by HTTP task only)
  float peer_temp_c_[hv6::NUM_ZONES];
  float peer_area_m2_[hv6::NUM_ZONES];
  bool  peer_enabled_[hv6::NUM_ZONES]{};
  uint32_t peer_last_success_s_{0};  ///< mono seconds; 0 = never
  PeerStatus peer_status_{PeerStatus::NOT_CONFIGURED};

  // Diagnostic state (written by HTTP task, read by dashboard)
  bool coordinator_active_{false};
  float last_push_value_{NAN};
  uint32_t last_push_s_{0};  ///< mono seconds; 0 = never
  uint32_t push_fail_streak_{0};
  uint8_t local_zones_used_{0};
  uint8_t peer_zones_used_{0};
  char last_error_[64]{0};
};

}  // namespace hv6_asgard_bridge
}  // namespace esphome
