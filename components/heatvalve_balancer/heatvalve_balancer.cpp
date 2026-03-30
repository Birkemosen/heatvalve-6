// HeatValve-6 Hydraulic Balancer
// Copyright (c) 2026 Birkemosen. All rights reserved.

#include "heatvalve_balancer.h"
#include "esphome/core/log.h"

#include <cctype>
#include <cmath>
#include <cstdio>
#include <string>

namespace heatvalve_balancer {

static const char *const TAG = "heatvalve_balancer";

namespace {
float clampf(float value, float minimum, float maximum) {
  if (value < minimum)
    return minimum;
  if (value > maximum)
    return maximum;
  return value;
}
}  // namespace

void HeatvalveBalancer::setup() {
  uint8_t zones = count_configured_zones_();
  ESP_LOGI(TAG, "Hydraulic balancer initialized with %d zones", zones);
#ifdef USE_MQTT
  mqtt_subscribe_adjustments_();
#endif
}

void HeatvalveBalancer::update() {
  if (count_configured_zones_() == 0)
    return;

  cycle_count_++;
  ESP_LOGD(TAG, "Running hydraulic balancing cycle #%u", cycle_count_);

  classify_zones_();
  find_reference_zone_();
  compute_hydraulic_factors_();
  publish_factors_();
#ifdef USE_MQTT
  mqtt_publish_zone_states_();
#endif
}

void HeatvalveBalancer::dump_config() {
  ESP_LOGCONFIG(TAG, "HeatValve-6 Hydraulic Balancer:");
  ESP_LOGCONFIG(TAG, "  Zones configured: %d", count_configured_zones_());
  ESP_LOGCONFIG(TAG, "  Update interval: %ums", get_update_interval());
  const char *profile_name = "boiler";
  if (heating_profile_ == HeatingProfile::HEAT_PUMP) profile_name = "heat_pump";
  else if (heating_profile_ == HeatingProfile::DISTRICT_HEATING) profile_name = "district_heating";
  ESP_LOGCONFIG(TAG, "  Heating profile: %s", profile_name);
}

uint8_t HeatvalveBalancer::count_configured_zones_() const {
  uint8_t count = 0;
  for (uint8_t i = 0; i < MAX_ZONES; i++) {
    if (climates_[i] != nullptr)
      count++;
  }
  return count;
}

// ============================================================
// Zone Classification
// ============================================================

void HeatvalveBalancer::classify_zones_() {
  if (comfort_band_ == nullptr || !comfort_band_->has_state())
    return;

  float band = comfort_band_->state;

  for (uint8_t i = 0; i < MAX_ZONES; i++) {
    if (climates_[i] == nullptr)
      continue;

    float current_temp = climates_[i]->current_temperature;
    float target_temp = climates_[i]->target_temperature_low;

    if (std::isnan(current_temp) || std::isnan(target_temp)) {
      zones_[i].state = -1;
      continue;
    }

    float diff = target_temp - current_temp;

    if (diff < -band) {
      zones_[i].state = 0;  // OVERHEATED
      zones_[i].was_overheated = true;
    } else if (zones_[i].was_overheated && diff < 0) {
      zones_[i].state = 0;  // Hysteresis: remain overheated until at setpoint
    } else if (diff <= band) {
      zones_[i].state = 1;  // SATISFIED
      zones_[i].was_overheated = false;
    } else {
      zones_[i].state = 2;  // DEMAND
      zones_[i].was_overheated = false;
    }

    ESP_LOGD(TAG, "Zone %d: state=%d diff=%.2f", i + 1, zones_[i].state, diff);
  }
}

// ============================================================
// Reference Zone Selection
// ============================================================

void HeatvalveBalancer::find_reference_zone_() {
  float max_pipe = 0;
  reference_zone_ = -1;

  for (uint8_t i = 0; i < MAX_ZONES; i++) {
    if (climates_[i] == nullptr)
      continue;

    // Skip overheated zones as reference
    if (zones_[i].state == 0)
      continue;

    float pipe_len = calculate_pipe_length_(i);
    zones_[i].pipe_length = pipe_len;

    if (pipe_len > max_pipe) {
      max_pipe = pipe_len;
      reference_zone_ = i;
    }
  }

  reference_pipe_length_ = max_pipe > 0 ? max_pipe : 100.0f;
  ESP_LOGD(TAG, "Reference zone: %d (pipe length: %.1fm)",
           reference_zone_ + 1, reference_pipe_length_);
}

// ============================================================
// Hydraulic Factor Computation
// ============================================================

void HeatvalveBalancer::compute_hydraulic_factors_() {
  if (reference_pipe_length_ <= 0)
    return;

  if (maintenance_base_ == nullptr || !maintenance_base_->has_state())
    return;

  float maint_base = maintenance_base_->state / 100.0f;

  for (uint8_t i = 0; i < MAX_ZONES; i++) {
    if (climates_[i] == nullptr)
      continue;

    // Overheated zones get zero factor
    if (zones_[i].state == 0) {
      zones_[i].hydraulic_factor = 0.0f;
      continue;
    }

    float pipe_len = zones_[i].pipe_length;
    if (pipe_len <= 0)
      pipe_len = calculate_pipe_length_(i);

    // Pipe ratio relative to reference zone
    float ratio = pipe_len / reference_pipe_length_;

    // Per-zone correction factors
    float pipe_correction = get_pipe_correction_factor_(i);
    float floor_correction = get_floor_correction_factor_(i);

    zones_[i].hydraulic_factor = maint_base * ratio * pipe_correction * floor_correction;
    zones_[i].hydraulic_factor = clampf(zones_[i].hydraulic_factor, 0.0f, 1.0f);

    // Heat pump profile: enforce min 25% valve opening for demanding zones
    // to maintain flow and avoid compressor cycling
    if (heating_profile_ == HeatingProfile::HEAT_PUMP && zones_[i].state == 2) {
      zones_[i].hydraulic_factor = clampf(zones_[i].hydraulic_factor, 0.25f, 1.0f);
    }

    ESP_LOGV(TAG,
             "Zone %d: pipe=%.1fm ratio=%.2f pipe_corr=%.2f floor_corr=%.2f factor=%.2f",
             i + 1, pipe_len, ratio, pipe_correction, floor_correction,
             zones_[i].hydraulic_factor);
  }
}

// ============================================================
// Publish Factors to Globals
// ============================================================

void HeatvalveBalancer::publish_factors_() {
  for (uint8_t i = 0; i < MAX_ZONES; i++) {
    if (hyd_factor_globals_[i] == nullptr)
      continue;

    hyd_factor_globals_[i]->value() = zones_[i].hydraulic_factor;
  }
}

// ============================================================
// Pipe Length Calculation
// ============================================================

float HeatvalveBalancer::calculate_pipe_length_(uint8_t zone) const {
  // pipe_length = ceil(zone_area / spacing_m) + manifold_extra
  if (zone < MAX_ZONES && zone_areas_[zone] != nullptr &&
      zone_areas_[zone]->has_state()) {
    auto *spacing_entity = zone_pipe_spacings_[zone];
    if (spacing_entity != nullptr && spacing_entity->has_state()) {
      float spacing_m = spacing_entity->state / 1000.0f;
      float area_m2 = zone_areas_[zone]->state;
      if (!std::isnan(spacing_m) && !std::isnan(area_m2) &&
          spacing_m > 0.0f && area_m2 > 0.0f) {
        float manifold_extra_m = 2.0f;
        return std::ceil(area_m2 / spacing_m) + manifold_extra_m;
      }
    }
  }

  return 100.0f;  // Fallback
}

// ============================================================
// Pipe/Floor Correction Factors
// ============================================================

std::string HeatvalveBalancer::normalize_option_(const std::string &input) {
  std::string normalized;
  normalized.reserve(input.size());
  for (char ch : input) {
    unsigned char uc = static_cast<unsigned char>(ch);
    if (std::isalnum(uc)) {
      normalized.push_back(static_cast<char>(std::toupper(uc)));
    }
  }
  return normalized;
}

float HeatvalveBalancer::get_pipe_inner_diameter_mm_(uint8_t zone) const {
  auto *sel = (zone < MAX_ZONES) ? zone_pipe_types_[zone] : nullptr;
  if (sel == nullptr || !sel->has_state())
    return 12.0f;

  const std::string id = normalize_option_(sel->current_option());

  if (id == "PEX12X2")
    return 8.0f;
  if (id == "PEX14X2")
    return 10.0f;
  if (id == "PEX16X2" || id == "ALUPEX16X2" || id == "ALUPEX16")
    return 12.0f;
  if (id == "PEX17X2")
    return 13.0f;
  if (id == "PEX18X2")
    return 14.0f;
  if (id == "PEX20X2" || id == "PEX20" || id == "ALUPEX20X2")
    return 16.0f;

  return 12.0f;
}

float HeatvalveBalancer::get_floor_conductivity_w_mk_(uint8_t zone) const {
  auto *sel = (zone < MAX_ZONES) ? zone_floor_types_[zone] : nullptr;
  if (sel == nullptr || !sel->has_state())
    return 1.3f;

  const std::string id = normalize_option_(sel->current_option());
  if (id.find("TILE") != std::string::npos)
    return 1.3f;
  if (id.find("PARQ") != std::string::npos)
    return 0.13f;
  if (id.find("OAK") != std::string::npos || id.find("BEECH") != std::string::npos)
    return 0.18f;
  if (id.find("CARPET") != std::string::npos)
    return 0.09f;
  return 1.3f;
}

float HeatvalveBalancer::get_pipe_correction_factor_(uint8_t zone) const {
  const float inner_diameter_mm = get_pipe_inner_diameter_mm_(zone);
  if (inner_diameter_mm <= 0.0f)
    return 1.0f;

  const float baseline_inner_diameter_mm = 12.0f;  // PEX/AluPEX 16x2 baseline
  const float ratio = baseline_inner_diameter_mm / inner_diameter_mm;
  return clampf(std::sqrt(ratio), 0.85f, 1.35f);
}

float HeatvalveBalancer::get_floor_correction_factor_(uint8_t zone) const {
  float thickness_mm = 15.0f;
  auto *thickness_entity = (zone < MAX_ZONES) ? zone_floor_cover_thicknesses_[zone] : nullptr;
  if (thickness_entity != nullptr && thickness_entity->has_state() &&
      !std::isnan(thickness_entity->state)) {
    thickness_mm = thickness_entity->state;
  }
  thickness_mm = clampf(thickness_mm, 5.0f, 40.0f);

  const float conductivity = get_floor_conductivity_w_mk_(zone);
  if (conductivity <= 0.0f)
    return 1.0f;

  const float surface_h = 10.8f;
  const float screed_res = 0.045f;
  const float screed_lambda = 1.4f;
  const float cover_res = (thickness_mm / 1000.0f) / conductivity;

  const float numerator = (1.0f / surface_h) + screed_res;
  const float denominator = (1.0f / surface_h) + (screed_res / screed_lambda) + cover_res;
  if (denominator <= 0.0f)
    return 1.0f;

  const float transfer_factor = clampf(numerator / denominator, 0.45f, 1.05f);
  return clampf(1.0f / transfer_factor, 1.0f, 1.6f);
}

// ============================================================
// MQTT State Publishing & Adjustment Subscription
// ============================================================

#ifdef USE_MQTT

void HeatvalveBalancer::mqtt_publish_zone_states_() {
  auto *client = esphome::mqtt::global_mqtt_client;
  if (client == nullptr || !client->is_connected())
    return;

  const std::string &controller_id = esphome::App.get_name();

  // Publish per-zone state
  for (uint8_t i = 0; i < MAX_ZONES; i++) {
    if (climates_[i] == nullptr)
      continue;

    float temp = climates_[i]->current_temperature;
    float setpoint = climates_[i]->target_temperature_low;
    float valve = zones_[i].hydraulic_factor;
    int state = zones_[i].state;
    float area = (zone_areas_[i] != nullptr && zone_areas_[i]->has_state())
                     ? zone_areas_[i]->state : 0.0f;

    char payload[128];
    snprintf(payload, sizeof(payload),
             "{\"temperature\":%.2f,\"setpoint\":%.2f,\"valve\":%.2f,\"state\":%d,"
             "\"hyd_factor\":%.3f,\"area\":%.1f}",
             std::isnan(temp) ? 0.0f : temp,
             std::isnan(setpoint) ? 0.0f : setpoint,
             valve, state, zones_[i].hydraulic_factor, area);

    char topic[64];
    snprintf(topic, sizeof(topic), "heatvalve/%s/zone/%d/state",
             controller_id.c_str(), i + 1);

    client->publish(topic, payload, strlen(payload), 0, false);
  }

  // Publish system status
  float avg_valve = 0.0f;
  int active = 0;
  int total = 0;
  for (uint8_t i = 0; i < MAX_ZONES; i++) {
    if (climates_[i] == nullptr)
      continue;
    total++;
    if (zones_[i].state == 2) active++;
    avg_valve += zones_[i].hydraulic_factor;
  }
  if (total > 0)
    avg_valve /= total;

  char sys_payload[128];
  snprintf(sys_payload, sizeof(sys_payload),
           "{\"avg_valve\":%.2f,\"active_zones\":%d,\"zone_count\":%d,"
           "\"ref_zone\":%d,\"cycle\":%u}",
           avg_valve, active, total, reference_zone_ + 1, cycle_count_);

  char sys_topic[64];
  snprintf(sys_topic, sizeof(sys_topic), "heatvalve/%s/system/status",
           controller_id.c_str());

  client->publish(sys_topic, sys_payload, strlen(sys_payload), 0, false);

  ESP_LOGD(TAG, "Published MQTT state for %d zones", total);
}

void HeatvalveBalancer::mqtt_subscribe_adjustments_() {
  auto *client = esphome::mqtt::global_mqtt_client;
  if (client == nullptr)
    return;

  const std::string &controller_id = esphome::App.get_name();

  // Subscribe to per-zone setpoint adjustments from Helios-6
  for (uint8_t i = 0; i < MAX_ZONES; i++) {
    if (climates_[i] == nullptr)
      continue;

    char topic[64];
    snprintf(topic, sizeof(topic), "helios/%s/zone/%d/adjustment",
             controller_id.c_str(), i + 1);

    uint8_t zone_idx = i;
    client->subscribe(
        topic,
        [this, zone_idx](const std::string &topic, const std::string &payload) {
          float offset = strtof(payload.c_str(), nullptr);
          if (!std::isnan(offset) && offset >= -5.0f && offset <= 5.0f) {
            setpoint_adjustments_[zone_idx] = offset;
            ESP_LOGD(TAG, "Helios adjustment zone %d: %.2f°C", zone_idx + 1, offset);
          }
        },
        0);

    ESP_LOGD(TAG, "Subscribed to %s", topic);
  }

  // Subscribe to heating profile changes from Helios-6
  char profile_topic[64];
  snprintf(profile_topic, sizeof(profile_topic), "helios/%s/config/heating_profile",
           controller_id.c_str());

  client->subscribe(
      profile_topic,
      [this](const std::string &topic, const std::string &payload) {
        if (payload == "heat_pump") {
          heating_profile_ = HeatingProfile::HEAT_PUMP;
        } else if (payload == "boiler") {
          heating_profile_ = HeatingProfile::BOILER;
        } else if (payload == "district_heating") {
          heating_profile_ = HeatingProfile::DISTRICT_HEATING;
        }
        ESP_LOGI(TAG, "Heating profile set to: %s", payload.c_str());
      },
      0);

  ESP_LOGD(TAG, "Subscribed to %s", profile_topic);
}

#endif  // USE_MQTT

}  // namespace heatvalve_balancer
