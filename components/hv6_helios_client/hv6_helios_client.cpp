// =============================================================================
// HV6 Helios Client — ESPHome Component Implementation
// =============================================================================
// Pushes state snapshots to Helios-3 and applies optimizer commands.
// HTTP calls run in a dedicated FreeRTOS task (STACK_SIZE = 8 KB, CORE 0).
// Uses ESP-IDF esp_http_client directly for full control over timeouts.
// =============================================================================

#include "hv6_helios_client.h"
#include "esphome/core/log.h"
#include "esp_http_client.h"
#include "esp_timer.h"
#include <cstdio>
#include <cstring>
#include <cmath>
#include <algorithm>
#include <ArduinoJson.h>

namespace esphome {
namespace hv6_helios_client {

static const char *const TAG = "hv6_helios";

// =============================================================================
// ESPHome lifecycle
// =============================================================================

void Hv6HeliosClient::setup() {
  if (!zone_controller_ || !config_store_) {
    ESP_LOGE(TAG, "zone_controller or config_store not set; Helios client disabled");
    this->mark_failed();
    return;
  }

  cached_cfg_ = config_store_->get_helios_config();

  xTaskCreatePinnedToCore(
      task_func_, "hv6_helios", STACK_SIZE,
      this, PRIORITY, &task_handle_, CORE);

  ESP_LOGI(TAG, "Helios client started (host=%s port=%u interval=%us)",
           cached_cfg_.host, cached_cfg_.port, cached_cfg_.poll_interval_s);
}

void Hv6HeliosClient::loop() {
  // Refresh cached config periodically so changes are picked up.
  // The task itself always reads fresh config before each HTTP call.
  cached_cfg_ = config_store_->get_helios_config();

  if (!cached_cfg_.enabled)
    return;

  // Staleness check: if we haven't seen Helios for stale_after_s, clear offsets.
  uint32_t now_s = get_epoch_s_();
  if (now_s > 0 && last_helios_seen_s_ > 0) {
    uint32_t elapsed = now_s - last_helios_seen_s_;
    if (elapsed > cached_cfg_.stale_after_s) {
      zone_controller_->clear_all_helios_commands();
      helios_status_ = HeliosStatus::OFFLINE;
      last_helios_seen_s_ = 0;  // Prevent repeated clears
      ESP_LOGW(TAG, "Helios stale (no response for %us), cleared all offsets", elapsed);
    }
  }
}

void Hv6HeliosClient::dump_config() {
  ESP_LOGCONFIG(TAG, "HV6 Helios Client:");
  ESP_LOGCONFIG(TAG, "  Host: %s:%u", cached_cfg_.host, cached_cfg_.port);
  ESP_LOGCONFIG(TAG, "  Enabled: %s", cached_cfg_.enabled ? "yes" : "no");
  ESP_LOGCONFIG(TAG, "  Poll interval: %u s", cached_cfg_.poll_interval_s);
  ESP_LOGCONFIG(TAG, "  Stale after: %u s", cached_cfg_.stale_after_s);
}

// =============================================================================
// FreeRTOS task
// =============================================================================

void Hv6HeliosClient::task_func_(void *arg) {
  auto *self = static_cast<Hv6HeliosClient *>(arg);
  self->run_();
}

void Hv6HeliosClient::run_() {
  // Initial startup delay — let WiFi and config store settle.
  vTaskDelay(pdMS_TO_TICKS(5000));

  while (true) {
    hv6::HeliosConfig cfg = config_store_->get_helios_config();

    if (cfg.enabled && strlen(cfg.host) > 0) {
      post_snapshot_(cfg);
      get_commands_(cfg);
    }

    uint32_t sleep_s = (cfg.poll_interval_s > 0) ? cfg.poll_interval_s : 30;
    vTaskDelay(pdMS_TO_TICKS(sleep_s * 1000));
  }
}

// =============================================================================
// HTTP helpers
// =============================================================================

bool Hv6HeliosClient::post_snapshot_(const hv6::HeliosConfig &cfg) {
  if (!zone_controller_ || !config_store_)
    return false;

  hv6::SystemSnapshot sys = zone_controller_->get_system_snapshot();
  hv6::DeviceConfig dev_cfg = config_store_->get_config();

  // Compute a simple hash over zone configs to detect changes.
  uint32_t zone_hash = 0;
  for (uint8_t i = 0; i < hv6::NUM_ZONES; i++) {
    const auto &z = dev_cfg.zones[i];
    zone_hash ^= static_cast<uint32_t>(z.pipe_type) + (i * 31u);
    zone_hash ^= static_cast<uint32_t>(z.area_m2 * 10.0f) + (i * 13u);
    zone_hash ^= static_cast<uint32_t>(z.exterior_walls) + (i * 7u);
  }

  bool send_configs = !zone_configs_sent_ || (zone_hash != zone_configs_hash_);
  std::string body = build_snapshot_json_(cfg, sys, dev_cfg, send_configs);

  // Build URL: http://<host>:<port>/api/hv6/<controller_id>/snapshot
  const char *cid = (strlen(cfg.controller_id) > 0) ? cfg.controller_id : dev_cfg.system.controller_id;
  char url[160];
  snprintf(url, sizeof(url), "http://%s:%u/api/hv6/%s/snapshot", cfg.host, cfg.port, cid);

  esp_http_client_config_t http_cfg{};
  http_cfg.url = url;
  http_cfg.method = HTTP_METHOD_POST;
  http_cfg.timeout_ms = HTTP_TIMEOUT_MS;
  http_cfg.disable_auto_redirect = true;

  esp_http_client_handle_t client = esp_http_client_init(&http_cfg);
  if (!client) {
    ESP_LOGE(TAG, "Failed to create HTTP client");
    return false;
  }

  esp_http_client_set_header(client, "Content-Type", "application/json");
  esp_http_client_set_post_field(client, body.c_str(), body.size());

  esp_err_t err = esp_http_client_perform(client);
  bool ok = false;
  if (err == ESP_OK) {
    int status = esp_http_client_get_status_code(client);
    if (status == 204) {
      ok = true;
      if (send_configs) {
        zone_configs_sent_ = true;
        zone_configs_hash_ = zone_hash;
        ESP_LOGD(TAG, "Helios snapshot OK (204), zone_configs acked");
      } else {
        ESP_LOGD(TAG, "Helios snapshot OK (204)");
      }
    } else {
      ESP_LOGW(TAG, "Helios snapshot returned %d (expected 204)", status);
    }
  } else {
    ESP_LOGW(TAG, "Helios snapshot POST failed: %s", esp_err_to_name(err));
  }

  esp_http_client_cleanup(client);
  return ok;
}

bool Hv6HeliosClient::get_commands_(const hv6::HeliosConfig &cfg) {
  if (!zone_controller_ || !config_store_)
    return false;

  hv6::DeviceConfig dev_cfg = config_store_->get_config();
  const char *cid = (strlen(cfg.controller_id) > 0) ? cfg.controller_id : dev_cfg.system.controller_id;

  char url[160];
  snprintf(url, sizeof(url), "http://%s:%u/api/hv6/%s/commands", cfg.host, cfg.port, cid);

  esp_http_client_config_t http_cfg{};
  http_cfg.url = url;
  http_cfg.method = HTTP_METHOD_GET;
  http_cfg.timeout_ms = HTTP_TIMEOUT_MS;
  http_cfg.disable_auto_redirect = true;

  esp_http_client_handle_t client = esp_http_client_init(&http_cfg);
  if (!client) {
    ESP_LOGE(TAG, "Failed to create HTTP client for commands");
    return false;
  }

  esp_err_t err = esp_http_client_perform(client);
  bool ok = false;

  if (err == ESP_OK) {
    int status = esp_http_client_get_status_code(client);
    if (status == 200) {
      int content_length = esp_http_client_get_content_length(client);
      if (content_length > 0 && content_length < 4096) {
        std::string buf;
        buf.resize(content_length + 1, '\0');
        int read = esp_http_client_read_response(client, buf.data(), content_length);
        if (read > 0) {
          buf[read] = '\0';

          StaticJsonDocument<2048> doc;
          DeserializationError jerr = deserializeJson(doc, buf.c_str());
          if (jerr == DeserializationError::Ok) {
            // Parse helios_status
            const char *hs = doc["helios_status"] | "offline";
            if (strcmp(hs, "active") == 0)
              helios_status_ = HeliosStatus::ACTIVE;
            else if (strcmp(hs, "degraded") == 0)
              helios_status_ = HeliosStatus::DEGRADED;
            else
              helios_status_ = HeliosStatus::OFFLINE;

            // Update last-seen timestamp
            uint32_t now_s = get_epoch_s_();
            if (now_s > 0)
              last_helios_seen_s_ = now_s;

            // Parse per-zone commands
            JsonObjectConst zones = doc["zones"];
            if (!zones.isNull()) {
              for (uint8_t i = 0; i < hv6::NUM_ZONES; i++) {
                char key[4];
                snprintf(key, sizeof(key), "%d", i + 1);
                if (!zones.containsKey(key))
                  continue;

                JsonObjectConst zobj = zones[key];
                hv6::HeliosZoneCommand cmd{};
                cmd.setpoint_offset_c = zobj["setpoint_offset"] | 0.0f;
                cmd.preheat_floor_c = 0.0f;

                // Apply preheat window if epoch time is available
                if (zobj.containsKey("preheat_start") && zobj.containsKey("preheat_end") &&
                    zobj.containsKey("preheat_target_c")) {
                  uint32_t ps = zobj["preheat_start"] | 0u;
                  uint32_t pe = zobj["preheat_end"] | 0u;
                  float pt = zobj["preheat_target_c"] | 0.0f;
                  if (ps > 0 && pe > ps && pt > 0.0f && now_s > 0) {
                    if (now_s >= ps && now_s <= pe)
                      cmd.preheat_floor_c = pt;
                  }
                }

                // Expire check for valid_until
                uint32_t valid_until = zobj["valid_until"] | 0u;
                if (valid_until > 0 && now_s > 0 && now_s > valid_until) {
                  // Command expired — send zeros to clear it
                  cmd = {};
                }

                zone_controller_->apply_helios_command(i, cmd);
              }
            }

            ok = true;
            ESP_LOGD(TAG, "Helios commands applied (status=%s)", hs);
          } else {
            ESP_LOGW(TAG, "Helios commands JSON parse error: %s", jerr.c_str());
          }
        }
      } else if (content_length == 0) {
        // Empty body means no commands; still treat as success
        ok = true;
      }
    } else {
      ESP_LOGW(TAG, "Helios commands returned %d", status);
    }
  } else {
    ESP_LOGW(TAG, "Helios commands GET failed: %s", esp_err_to_name(err));
  }

  esp_http_client_cleanup(client);
  return ok;
}

// =============================================================================
// Snapshot JSON builder
// =============================================================================

std::string Hv6HeliosClient::build_snapshot_json_(const hv6::HeliosConfig &cfg,
                                                   const hv6::SystemSnapshot &sys,
                                                   const hv6::DeviceConfig &dev_cfg,
                                                   bool include_zone_configs) {
  const char *cid = (strlen(cfg.controller_id) > 0) ? cfg.controller_id : dev_cfg.system.controller_id;
  uint32_t ts = get_epoch_s_();

  // Average valve (already in sys as 0..100 pct; convert to 0..1 for spec)
  float avg_valve = sys.avg_valve_pct / 100.0f;

  char buf[2048];
  int off = 0;

  // Header
  off += snprintf(buf + off, sizeof(buf) - off,
      "{\"controller_id\":\"%s\",\"ts\":%lu,"
      "\"system\":{\"input_temp\":%.2f,\"output_temp\":%.2f,"
      "\"avg_valve\":%.3f,\"active_zones\":%u,\"zone_count\":%u},"
      "\"zones\":{",
      cid, (unsigned long) ts,
      std::isnan(sys.manifold_flow_temp_c) ? 0.0f : sys.manifold_flow_temp_c,
      std::isnan(sys.manifold_return_temp_c) ? 0.0f : sys.manifold_return_temp_c,
      avg_valve,
      static_cast<unsigned>(sys.active_zones),
      static_cast<unsigned>(hv6::NUM_ZONES));

  for (uint8_t i = 0; i < hv6::NUM_ZONES; i++) {
    const hv6::ZoneSnapshot &z = sys.zones[i];
    if (i > 0)
      off += snprintf(buf + off, sizeof(buf) - off, ",");
    off += snprintf(buf + off, sizeof(buf) - off,
        "\"%d\":{\"temperature\":%.2f,\"setpoint\":%.2f,\"valve\":%.3f,"
        "\"state\":%d,\"hyd_factor\":%.3f}",
        i + 1,
        std::isnan(z.temperature_c) ? 0.0f : z.temperature_c,
        z.setpoint_c,
        z.valve_position_pct / 100.0f,
        zone_state_to_int_(z.state),
        z.hydraulic_factor);
  }

  off += snprintf(buf + off, sizeof(buf) - off, "}");

  if (include_zone_configs) {
    off += snprintf(buf + off, sizeof(buf) - off, ",\"zone_configs\":{");
    for (uint8_t i = 0; i < hv6::NUM_ZONES; i++) {
      const hv6::ZoneConfig &z = dev_cfg.zones[i];
      if (i > 0)
        off += snprintf(buf + off, sizeof(buf) - off, ",");
      // Build escaped name
      char safe_name[33] = "";
      size_t ni = 0;
      for (size_t si = 0; z.name[si] && ni < sizeof(safe_name) - 2; si++) {
        char c = z.name[si];
        if (c == '"' || c == '\\') safe_name[ni++] = '\\';
        safe_name[ni++] = c;
      }
      safe_name[ni] = '\0';
      off += snprintf(buf + off, sizeof(buf) - off,
          "\"%d\":{\"area_m2\":%.1f,\"pipe_type\":\"%s\","
          "\"pipe_length_m\":%.1f,\"floor_type\":\"%s\","
          "\"exterior_walls\":%u,\"friendly_name\":\"%s\"}",
          i + 1,
          z.area_m2,
          pipe_type_to_string_(z.pipe_type),
          z.supply_pipe_length_m,
          floor_type_to_string_(z.floor_type),
          static_cast<unsigned>(z.exterior_walls),
          safe_name);
    }
    off += snprintf(buf + off, sizeof(buf) - off, "}");
  }

  off += snprintf(buf + off, sizeof(buf) - off, "}");
  return std::string(buf, off);
}

// =============================================================================
// Utility helpers
// =============================================================================

uint32_t Hv6HeliosClient::get_epoch_s_() const {
  // Use esp_timer (monotonic ms) only as a last resort;
  // prefer the time component if wired in.
  if (time_component_ != nullptr) {
    // Try casting to ESPHome's time::RealTimeClock via a virtual method
    // We use the ESPHome time API generically.
    // The component type is opaque here (to avoid including time headers);
    // rely on the fact that ESPHome time components expose esptime_os_time().
    struct timeval tv;
    if (gettimeofday(&tv, nullptr) == 0 && tv.tv_sec > 1000000000L)
      return static_cast<uint32_t>(tv.tv_sec);
  }
  // Fall back to gettimeofday if SNTP has synced (even without explicit component)
  struct timeval tv;
  if (gettimeofday(&tv, nullptr) == 0 && tv.tv_sec > 1000000000L)
    return static_cast<uint32_t>(tv.tv_sec);
  return 0;
}

const char *Hv6HeliosClient::pipe_type_to_string_(hv6::PipeType type) const {
  switch (type) {
    case hv6::PipeType::PEX_12X2:     return "PEX-12x2";
    case hv6::PipeType::PEX_14X2:     return "PEX-14x2";
    case hv6::PipeType::PEX_16X2:     return "PEX-16x2";
    case hv6::PipeType::PEX_17X2:     return "PEX-17x2";
    case hv6::PipeType::PEX_18X2:     return "PEX-18x2";
    case hv6::PipeType::PEX_20X2:     return "PEX-20x2";
    case hv6::PipeType::ALUPEX_16X2:  return "ALUPEX-16x2";
    case hv6::PipeType::ALUPEX_20X2:  return "ALUPEX-20x2";
    default:                           return "unknown";
  }
}

const char *Hv6HeliosClient::floor_type_to_string_(hv6::FloorType type) const {
  switch (type) {
    case hv6::FloorType::TILE:    return "tile";
    case hv6::FloorType::PARQUET: return "parquet";
    case hv6::FloorType::OAK:     return "oak";
    case hv6::FloorType::CARPET:  return "carpet";
    default:                       return "unknown";
  }
}

int Hv6HeliosClient::zone_state_to_int_(hv6::ZoneState state) const {
  // Spec: 0=idle  1=heating  2=satisfied  3=fault
  switch (state) {
    case hv6::ZoneState::OVERHEATED: return 0;  // idle / overheated
    case hv6::ZoneState::DEMAND:     return 1;  // heating
    case hv6::ZoneState::SATISFIED:  return 2;  // satisfied
    default:                          return 3;  // unknown / fault
  }
}

}  // namespace hv6_helios_client
}  // namespace esphome
