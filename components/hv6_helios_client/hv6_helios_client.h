// =============================================================================
// HV6 Helios Client — ESPHome Component Header
// =============================================================================
// Pushes a state snapshot to Helios-3 and polls for optimizer commands.
// Runs as a FreeRTOS task to avoid blocking the ESPHome main loop.
// =============================================================================

#pragma once

#include "esphome/core/component.h"
#include "esphome/components/hv6_config_store/hv6_config_store.h"
#include "esphome/components/hv6_zone_controller/hv6_zone_controller.h"
#include "freertos/FreeRTOS.h"
#include "freertos/task.h"
#include "freertos/semphr.h"
#include <string>

namespace esphome {
namespace hv6_helios_client {

enum class HeliosStatus : uint8_t { OFFLINE = 0, ACTIVE = 1, DEGRADED = 2 };

class Hv6HeliosClient : public esphome::Component {
 public:
  float get_setup_priority() const override { return esphome::setup_priority::AFTER_WIFI; }
  void setup() override;
  void loop() override;
  void dump_config() override;

  void set_zone_controller(hv6::Hv6ZoneController *ctrl) { zone_controller_ = ctrl; }
  void set_config_store(hv6::Hv6ConfigStore *store) { config_store_ = store; }

  // Optional time component for epoch-based valid_until / preheat
  void set_time_component(esphome::Component *rtc) { time_component_ = rtc; }

  HeliosStatus get_helios_status() const { return helios_status_; }
  uint32_t get_last_seen_s() const { return last_helios_seen_s_; }

 protected:
  static constexpr uint32_t STACK_SIZE = 8192;
  static constexpr UBaseType_t PRIORITY = 3;
  static constexpr BaseType_t CORE = 0;
  static constexpr uint32_t HTTP_TIMEOUT_MS = 10000;

  void run_();
  static void task_func_(void *arg);

  bool post_snapshot_(const hv6::HeliosConfig &cfg);
  bool get_commands_(const hv6::HeliosConfig &cfg);

  std::string build_snapshot_json_(const hv6::HeliosConfig &cfg,
                                   const hv6::SystemSnapshot &sys,
                                   const hv6::DeviceConfig &dev_cfg,
                                   bool include_zone_configs);
  uint32_t get_epoch_s_() const;

  const char *pipe_type_to_string_(hv6::PipeType type) const;
  const char *floor_type_to_string_(hv6::FloorType type) const;
  int zone_state_to_int_(hv6::ZoneState state) const;

  hv6::Hv6ZoneController *zone_controller_{nullptr};
  hv6::Hv6ConfigStore *config_store_{nullptr};
  esphome::Component *time_component_{nullptr};

  TaskHandle_t task_handle_{nullptr};
  HeliosStatus helios_status_{HeliosStatus::OFFLINE};
  uint32_t last_helios_seen_s_{0};

  // Zone config tracking — send on first POST and after any change
  bool zone_configs_sent_{false};
  uint32_t zone_configs_hash_{0};

  // Cache current config for staleness check in loop()
  hv6::HeliosConfig cached_cfg_{};
};

}  // namespace hv6_helios_client
}  // namespace esphome
