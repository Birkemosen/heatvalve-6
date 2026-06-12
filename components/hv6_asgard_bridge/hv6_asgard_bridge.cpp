// =============================================================================
// HV6 Asgard Bridge — ESPHome Component Implementation
// =============================================================================
// HTTP calls run in a dedicated FreeRTOS task on Core 1 (loopTask's core),
// priority 1, 12 KB stack — same pattern as hv6_helios_client. Stability gates
// inside run_() prevent HTTP work until WiFi is up and the user has enabled
// the bridge with coordinator role and a non-empty Asgard host.
// =============================================================================

#include "hv6_asgard_bridge.h"
#include "esphome/core/log.h"
#include "esphome/components/network/util.h"
#include "esp_http_client.h"
#include "esp_timer.h"
#include <cstdio>
#include <cstring>
#include <cmath>
#include <algorithm>
#include <ArduinoJson.h>

namespace esphome {
namespace hv6_asgard_bridge {

static const char *const TAG = "hv6_asgard";

static uint32_t mono_s_() {
  return static_cast<uint32_t>(esp_timer_get_time() / 1000000ULL);
}

// =============================================================================
// ESPHome lifecycle
// =============================================================================

void Hv6AsgardBridge::setup() {
  if (!zone_controller_ || !config_store_) {
    ESP_LOGE(TAG, "zone_controller or config_store not set; Asgard bridge disabled");
    this->mark_failed();
    return;
  }

  for (uint8_t i = 0; i < hv6::NUM_ZONES; i++) {
    peer_temp_c_[i] = NAN;
    peer_area_m2_[i] = 0.0f;
  }

  // Always spawn the task — it self-quiesces (sleeps in 5 s ticks, no HTTP)
  // unless enabled + coordinator + host configured. This lets the user
  // toggle the bridge / coordinator role at runtime without rebooting.
  xTaskCreatePinnedToCore(task_func_, "hv6_asgard", STACK_SIZE, this, PRIORITY, &task_handle_, CORE);

  hv6::AsgardConfig cfg = config_store_->get_asgard_config();
  ESP_LOGI(TAG, "Asgard bridge task spawned (core=%d prio=%u stack=%u)",
           (int) CORE, (unsigned) PRIORITY, (unsigned) STACK_SIZE);
  ESP_LOGI(TAG, "  config: enabled=%s coordinator=%s host='%s:%u' entity='%s' peer='%s:%u' interval=%us",
           cfg.enabled ? "yes" : "no", cfg.coordinator ? "yes" : "no",
           cfg.host, cfg.port, cfg.entity_name, cfg.peer_host, cfg.peer_port, cfg.push_interval_s);
}

void Hv6AsgardBridge::dump_config() {
  hv6::AsgardConfig cfg = config_store_ ? config_store_->get_asgard_config() : hv6::AsgardConfig{};
  ESP_LOGCONFIG(TAG, "HV6 Asgard Bridge:");
  ESP_LOGCONFIG(TAG, "  Enabled: %s  Role: %s", cfg.enabled ? "yes" : "no", get_role_str());
  ESP_LOGCONFIG(TAG, "  Asgard: %s:%u  entity: %s", cfg.host, cfg.port, cfg.entity_name);
  ESP_LOGCONFIG(TAG, "  Peer: %s:%u  stale after: %u s", cfg.peer_host, cfg.peer_port, cfg.peer_stale_after_s);
  ESP_LOGCONFIG(TAG, "  Push interval: %u s", cfg.push_interval_s);
}

const char *Hv6AsgardBridge::get_role_str() const {
  if (!coordinator_active_)
    return "slave";
  return "master";
}

const char *Hv6AsgardBridge::get_peer_status_str() const {
  switch (peer_status_) {
    case PeerStatus::OK:          return "ok";
    case PeerStatus::STALE:       return "stale";
    case PeerStatus::UNREACHABLE: return "unreachable";
    default:                      return "n/a";
  }
}

uint32_t Hv6AsgardBridge::get_last_push_age_s() const {
  if (last_push_s_ == 0)
    return 0;
  uint32_t now = mono_s_();
  return (now > last_push_s_) ? (now - last_push_s_) : 0;
}

// =============================================================================
// FreeRTOS task
// =============================================================================

void Hv6AsgardBridge::task_func_(void *arg) {
  static_cast<Hv6AsgardBridge *>(arg)->run_();
}

void Hv6AsgardBridge::run_() {
  // Boot warmup — let WiFi associate before doing HTTP work.
  vTaskDelay(pdMS_TO_TICKS(30000));

  while (true) {
    hv6::AsgardConfig cfg = config_store_->get_asgard_config();
    coordinator_active_ = cfg.enabled && cfg.coordinator;

    // ---- Stability gates --------------------------------------------------
    // Only the coordinator does HTTP work; a slave board just serves its
    // /api/hv6/v1/peer endpoint (hv6_dashboard) and idles here.
    bool config_ok = cfg.enabled && cfg.coordinator && strlen(cfg.host) > 0;
    bool network_ok = esphome::network::is_connected();

    if (!config_ok || !network_ok) {
      if (!config_ok) {
        push_fail_streak_ = 0;
        peer_status_ = PeerStatus::NOT_CONFIGURED;
      }
      vTaskDelay(pdMS_TO_TICKS(5000));
      continue;
    }

    // ---- Cycle: fetch peer → weight → push --------------------------------
    if (strlen(cfg.peer_host) > 0) {
      bool peer_ok = fetch_peer_(cfg);
      uint32_t age = (peer_last_success_s_ > 0) ? (mono_s_() - peer_last_success_s_) : UINT32_MAX;
      if (peer_ok) {
        peer_status_ = PeerStatus::OK;
      } else if (age <= cfg.peer_stale_after_s) {
        peer_status_ = PeerStatus::OK;  // last good snapshot still fresh enough
      } else if (peer_last_success_s_ > 0) {
        peer_status_ = PeerStatus::STALE;
      } else {
        peer_status_ = PeerStatus::UNREACHABLE;
      }
    } else {
      peer_status_ = PeerStatus::NOT_CONFIGURED;
    }

    float weighted = compute_weighted_temp_(cfg);
    bool ok = false;
    if (std::isfinite(weighted)) {
      ok = push_asgard_(cfg, weighted);
    } else {
      snprintf(last_error_, sizeof(last_error_), "no zones with valid temp");
      ESP_LOGW(TAG, "No enabled zones with a valid temperature — skipping push");
    }

    if (ok) {
      push_fail_streak_ = 0;
      last_push_value_ = weighted;
      last_push_s_ = mono_s_();
      last_error_[0] = '\0';
    } else {
      if (push_fail_streak_ < 0xFFFFFFFFu) push_fail_streak_++;
    }

    // ---- Sleep with exponential backoff on push failure --------------------
    uint32_t base_s = (cfg.push_interval_s > 0) ? cfg.push_interval_s : 30;
    uint32_t sleep_s = base_s;
    if (push_fail_streak_ > 0) {
      uint32_t shift = std::min<uint32_t>(push_fail_streak_, 8);
      sleep_s = std::min<uint32_t>(base_s * (1u << shift), 300);  // cap at 5 minutes
      ESP_LOGD(TAG, "Asgard backoff: %u failures, sleeping %u s", push_fail_streak_, sleep_s);
    }
    vTaskDelay(pdMS_TO_TICKS(sleep_s * 1000));
  }
}

// =============================================================================
// Weighted house temperature
// =============================================================================

float Hv6AsgardBridge::compute_weighted_temp_(const hv6::AsgardConfig &cfg) {
  float sum = 0.0f, weight = 0.0f;
  local_zones_used_ = 0;
  peer_zones_used_ = 0;

  // Local zones — real measured temperatures, weighted by area.
  hv6::SystemSnapshot sys = zone_controller_->get_system_snapshot();
  hv6::DeviceConfig dev_cfg = config_store_->get_config();
  for (uint8_t i = 0; i < hv6::NUM_ZONES; i++) {
    const auto &zc = dev_cfg.zones[i];
    float temp = sys.zones[i].temperature_c;
    if (!zc.enabled || !std::isfinite(temp) || zc.area_m2 <= 0.0f)
      continue;
    sum += temp * zc.area_m2;
    weight += zc.area_m2;
    local_zones_used_++;
  }

  // Peer zones — only when the last snapshot is fresh.
  uint32_t age = (peer_last_success_s_ > 0) ? (mono_s_() - peer_last_success_s_) : UINT32_MAX;
  if (age <= cfg.peer_stale_after_s) {
    for (uint8_t i = 0; i < hv6::NUM_ZONES; i++) {
      if (!peer_enabled_[i] || !std::isfinite(peer_temp_c_[i]) || peer_area_m2_[i] <= 0.0f)
        continue;
      sum += peer_temp_c_[i] * peer_area_m2_[i];
      weight += peer_area_m2_[i];
      peer_zones_used_++;
    }
  }

  if (weight <= 0.0f)
    return NAN;
  return sum / weight;
}

// =============================================================================
// HTTP — peer poll
// =============================================================================

bool Hv6AsgardBridge::fetch_peer_(const hv6::AsgardConfig &cfg) {
  char url[160];
  snprintf(url, sizeof(url), "http://%s:%u/api/hv6/v1/peer", cfg.peer_host, cfg.peer_port);

  esp_http_client_config_t http_cfg{};
  http_cfg.url = url;
  http_cfg.method = HTTP_METHOD_GET;
  http_cfg.timeout_ms = HTTP_TIMEOUT_MS;
  http_cfg.disable_auto_redirect = true;

  esp_http_client_handle_t client = esp_http_client_init(&http_cfg);
  if (!client)
    return false;

  bool ok = false;
  char body[1024];
  esp_err_t err = esp_http_client_open(client, 0);
  if (err == ESP_OK) {
    esp_http_client_fetch_headers(client);
    int status = esp_http_client_get_status_code(client);
    int len = esp_http_client_read_response(client, body, sizeof(body) - 1);
    if (status == 200 && len > 0) {
      body[len] = '\0';
      StaticJsonDocument<1024> doc;
      DeserializationError jerr = deserializeJson(doc, body);
      if (!jerr && doc["ok"] == true) {
        JsonArray zones = doc["zones"].as<JsonArray>();
        uint8_t i = 0;
        for (JsonObject z : zones) {
          if (i >= hv6::NUM_ZONES) break;
          peer_enabled_[i] = z["en"] | false;
          peer_area_m2_[i] = z["area"] | 0.0f;
          peer_temp_c_[i] = z["t"].isNull() ? NAN : (z["t"] | NAN);
          i++;
        }
        for (; i < hv6::NUM_ZONES; i++)
          peer_enabled_[i] = false;
        peer_last_success_s_ = mono_s_();
        ok = true;
      } else {
        snprintf(last_error_, sizeof(last_error_), "peer json %s", jerr ? jerr.c_str() : "bad payload");
      }
    } else {
      snprintf(last_error_, sizeof(last_error_), "peer http %d", status);
    }
  } else {
    snprintf(last_error_, sizeof(last_error_), "peer %s", esp_err_to_name(err));
    ESP_LOGD(TAG, "Peer fetch failed: %s", esp_err_to_name(err));
  }

  esp_http_client_close(client);
  esp_http_client_cleanup(client);
  return ok;
}

// =============================================================================
// HTTP — Asgard push
// =============================================================================

bool Hv6AsgardBridge::push_asgard_(const hv6::AsgardConfig &cfg, float value) {
  // ESPHome REST: POST /number/<object_id>/set?value=<float>
  char url[192];
  snprintf(url, sizeof(url), "http://%s:%u/number/%s/set?value=%.2f",
           cfg.host, cfg.port, cfg.entity_name, value);

  esp_http_client_config_t http_cfg{};
  http_cfg.url = url;
  http_cfg.method = HTTP_METHOD_POST;
  http_cfg.timeout_ms = HTTP_TIMEOUT_MS;
  http_cfg.disable_auto_redirect = true;

  esp_http_client_handle_t client = esp_http_client_init(&http_cfg);
  if (!client)
    return false;

  bool ok = false;
  esp_err_t err = esp_http_client_perform(client);
  if (err == ESP_OK) {
    int status = esp_http_client_get_status_code(client);
    if (status >= 200 && status < 300) {
      ok = true;
      ESP_LOGD(TAG, "Pushed %.2f°C to Asgard %s (local=%u peer=%u zones)",
               value, cfg.entity_name, local_zones_used_, peer_zones_used_);
    } else {
      snprintf(last_error_, sizeof(last_error_), "asgard http %d", status);
      ESP_LOGW(TAG, "Asgard push returned %d", status);
    }
  } else {
    snprintf(last_error_, sizeof(last_error_), "asgard %s", esp_err_to_name(err));
    ESP_LOGW(TAG, "Asgard push failed: %s", esp_err_to_name(err));
  }

  esp_http_client_cleanup(client);
  return ok;
}

}  // namespace hv6_asgard_bridge
}  // namespace esphome
