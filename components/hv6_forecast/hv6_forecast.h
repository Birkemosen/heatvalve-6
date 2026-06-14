// =============================================================================
// HV6 Forecast — ESPHome Component Header
// =============================================================================
// Wind-direction-aware per-zone preload ("Helios-lite", on-device). Fetches a
// 48 h Open-Meteo forecast, evaluates the per-zone exposure model
// (forecast_model.h) and issues setpoint preload offsets through the existing
// Helios command path — all per-zone safety clamps apply unchanged.
// Auto-quiesces while an external Helios service is enabled (that service
// then owns the command slots). Runs as a FreeRTOS task on Core 1.
// =============================================================================

#pragma once

#include "esphome/core/component.h"
#include "esphome/components/hv6_config_store/hv6_config_store.h"
#include "esphome/components/hv6_zone_controller/hv6_zone_controller.h"
#include "forecast_model.h"
#include "freertos/FreeRTOS.h"
#include "freertos/task.h"

namespace esphome {
namespace hv6_forecast {

using ::hv6fc::ForecastHour;
using ::hv6fc::FORECAST_HOURS;

class Hv6Forecast : public esphome::Component {
 public:
  float get_setup_priority() const override { return esphome::setup_priority::AFTER_WIFI; }
  void setup() override;
  void dump_config() override;

  void set_zone_controller(hv6::Hv6ZoneController *ctrl) { zone_controller_ = ctrl; }
  void set_config_store(hv6::Hv6ConfigStore *store) { config_store_ = store; }

  // Diagnostic accessors (consumed by hv6_dashboard; scalar reads)
  const char *get_status_str() const;
  uint32_t get_forecast_age_s() const;
  uint32_t get_fetch_fail_streak() const { return fetch_fail_streak_; }
  const char *get_last_error() const { return last_error_; }
  float get_zone_offset(uint8_t zone) const {
    return zone < hv6::NUM_ZONES ? zone_offset_c_[zone] : 0.0f;
  }
  int8_t get_zone_peak_in_h(uint8_t zone) const {
    return zone < hv6::NUM_ZONES ? zone_peak_in_h_[zone] : -1;
  }

 protected:
  static constexpr uint32_t STACK_SIZE = 16384;  ///< TLS handshake + 48 h JSON parse
  static constexpr UBaseType_t PRIORITY = 1;
  static constexpr BaseType_t CORE = 1;
  static constexpr uint32_t HTTP_TIMEOUT_MS = 10000;  ///< TLS + Open-Meteo latency
  static constexpr uint32_t FORECAST_MAX_AGE_S = 6 * 3600;  ///< Older cache → clear offsets

  enum class Status : uint8_t { DISABLED = 0, NO_DATA = 1, OK = 2, STALE = 3, EXTERNAL = 4 };

  void run_();
  static void task_func_(void *arg);

  bool fetch_forecast_(const hv6::ForecastConfig &cfg);
  void recompute_preloads_(const hv6::ForecastConfig &cfg);
  void clear_offsets_();
  void save_cache_();
  void load_cache_();

  hv6::Hv6ZoneController *zone_controller_{nullptr};
  hv6::Hv6ConfigStore *config_store_{nullptr};
  TaskHandle_t task_handle_{nullptr};

  // Forecast cache (written by the task; persisted to NVS across reboots)
  ForecastHour hours_[FORECAST_HOURS];
  uint8_t hours_count_{0};
  uint32_t hours_base_epoch_{0};  ///< Epoch of hours_[0]; 0 = no data

  // Diagnostics (written by task, read by dashboard)
  Status status_{Status::DISABLED};
  uint32_t fetch_fail_streak_{0};
  bool offsets_active_{false};
  float zone_offset_c_[hv6::NUM_ZONES]{};
  int8_t zone_peak_in_h_[hv6::NUM_ZONES]{};
  char last_error_[64]{0};
};

}  // namespace hv6_forecast
}  // namespace esphome
