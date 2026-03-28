#pragma once
// =============================================================================
// BLE Advertisement Queue Parser
// =============================================================================
// Manages queued BLE advertisements and parsed device data.
// Uses modular protocol parsers (BTHome, Xiaomi, etc.)
// =============================================================================

#include <algorithm>
#include <array>
#include <cmath>
#include <cstdint>
#include <cstdio>
#include <cstring>
#include <deque>
#include <string>
#include <vector>

#include "esphome/core/hal.h"
#include "bthome_parser.h"

namespace heatvalve_ble {

struct QueuedAdv {
  std::string mac;
  std::string name;
  int rssi{0};
  std::vector<uint8_t> raw;
  uint32_t seen_at{0};
};

// Extended device data with all sensor fields
struct SeenDevice {
  std::string mac;
  std::string name;
  int rssi{0};
  bool has_bthome{false};
  bool encrypted{false};
  uint32_t seen_at{0};

  // Sensor data from BTHome or other protocols
  float temp{NAN};
  float humidity{NAN};
  uint8_t battery{0};
  bool has_battery{false};
  float illuminance{NAN};
  float pressure{NAN};
  float voltage{NAN};

  // Light level (BTHome 0x64)
  uint8_t light_level{0};
  bool has_light_level{false};

  // Binary sensors
  bool light{false};
  bool has_light{false};
  bool motion{false};
  bool has_motion{false};
  bool occupancy{false};
  bool has_occupancy{false};
  bool opening{false};
  bool has_opening{false};
};

class BleAdvQueueParser {
 public:
  void enqueue(const std::string &mac, const std::string &name, int rssi, const std::vector<uint8_t> &raw) {
    if (this->queue_.size() >= this->max_queue_size_) {
      this->queue_.pop_front();
    }

    QueuedAdv adv;
    adv.mac = mac;
    adv.name = name;
    adv.rssi = rssi;
    adv.raw = raw;
    adv.seen_at = millis();
    this->queue_.push_back(std::move(adv));
  }

  void process_budget(uint32_t budget_ms, size_t max_packets) {
    const uint32_t start = millis();
    size_t processed = 0;

    while (!this->queue_.empty()) {
      if (processed >= max_packets) {
        break;
      }
      if ((millis() - start) >= budget_ms) {
        break;
      }

      QueuedAdv adv = std::move(this->queue_.front());
      this->queue_.pop_front();
      this->process_one_(adv);
      processed++;
    }
  }

  // Find sensor values by MAC
  float find_temp_for_mac(const std::string &mac) const {
    const SeenDevice *dev = find_device_by_mac_(mac);
    return dev ? dev->temp : NAN;
  }

  float find_humidity_for_mac(const std::string &mac) const {
    const SeenDevice *dev = find_device_by_mac_(mac);
    return dev ? dev->humidity : NAN;
  }

  int find_battery_for_mac(const std::string &mac) const {
    const SeenDevice *dev = find_device_by_mac_(mac);
    return (dev && dev->has_battery) ? static_cast<int>(dev->battery) : -1;
  }

  float find_illuminance_for_mac(const std::string &mac) const {
    const SeenDevice *dev = find_device_by_mac_(mac);
    return dev ? dev->illuminance : NAN;
  }

  int find_rssi_for_mac(const std::string &mac) const {
    const SeenDevice *dev = find_device_by_mac_(mac);
    return dev ? dev->rssi : -999;
  }

  // Build JSON with all sensor data
  std::string build_scan_json() const {
    std::string json = "[";
    bool first = true;

    for (const auto &dev : this->seen_) {
      if (dev.mac.empty()) {
        continue;
      }
      if (!first) {
        json += ",";
      }
      first = false;

      const std::string escaped_mac = json_escape_(dev.mac);
      const std::string escaped_name = json_escape_(dev.name);

      // Build entry with all sensor fields
      json += "{\"mac\":\"" + escaped_mac + "\",\"name\":\"" + escaped_name + "\"";
      
      char buf[32];
      snprintf(buf, sizeof(buf), ",\"rssi\":%d", dev.rssi);
      json += buf;

      json += ",\"b\":";
      json += dev.has_bthome ? "true" : "false";
      json += ",\"e\":";
      json += dev.encrypted ? "true" : "false";

      // Temperature
      if (!std::isnan(dev.temp)) {
        snprintf(buf, sizeof(buf), ",\"temp\":%.2f", dev.temp);
        json += buf;
      }

      // Humidity
      if (!std::isnan(dev.humidity)) {
        snprintf(buf, sizeof(buf), ",\"hum\":%.1f", dev.humidity);
        json += buf;
      }

      // Battery
      if (dev.has_battery) {
        snprintf(buf, sizeof(buf), ",\"bat\":%u", dev.battery);
        json += buf;
      }

      // Illuminance
      if (!std::isnan(dev.illuminance)) {
        snprintf(buf, sizeof(buf), ",\"lux\":%.1f", dev.illuminance);
        json += buf;
      }

      // Pressure
      if (!std::isnan(dev.pressure)) {
        snprintf(buf, sizeof(buf), ",\"pres\":%.2f", dev.pressure);
        json += buf;
      }

      // Voltage
      if (!std::isnan(dev.voltage)) {
        snprintf(buf, sizeof(buf), ",\"volt\":%.3f", dev.voltage);
        json += buf;
      }

      // Light level (0-100 scale from BTHome)
      if (dev.has_light_level) {
        snprintf(buf, sizeof(buf), ",\"lvl\":%u", dev.light_level);
        json += buf;
      }

      // Binary sensors
      if (dev.has_light) {
        json += ",\"light\":";
        json += dev.light ? "true" : "false";
      }
      if (dev.has_motion) {
        json += ",\"motion\":";
        json += dev.motion ? "true" : "false";
      }
      if (dev.has_occupancy) {
        json += ",\"occ\":";
        json += dev.occupancy ? "true" : "false";
      }
      if (dev.has_opening) {
        json += ",\"open\":";
        json += dev.opening ? "true" : "false";
      }

      json += "}";
    }

    json += "]";
    return json;
  }

 private:
  const SeenDevice *find_device_by_mac_(const std::string &mac) const {
    if (mac.empty()) {
      return nullptr;
    }
    for (const auto &dev : this->seen_) {
      if (!dev.mac.empty() && same_mac_ci_(dev.mac, mac)) {
        return &dev;
      }
    }
    return nullptr;
  }

  static bool contains_ci_(const std::string &value, const std::string &needle) {
    if (needle.empty() || value.size() < needle.size()) {
      return false;
    }

    for (size_t start = 0; start + needle.size() <= value.size(); start++) {
      bool ok = true;
      for (size_t i = 0; i < needle.size(); i++) {
        char a = static_cast<char>(toupper(static_cast<unsigned char>(value[start + i])));
        char b = static_cast<char>(toupper(static_cast<unsigned char>(needle[i])));
        if (a != b) {
          ok = false;
          break;
        }
      }
      if (ok) {
        return true;
      }
    }

    return false;
  }

  static bool same_mac_ci_(const std::string &a, const std::string &b) {
    if (a.size() != b.size()) {
      return false;
    }
    for (size_t i = 0; i < a.size(); i++) {
      const char ca = static_cast<char>(toupper(static_cast<unsigned char>(a[i])));
      const char cb = static_cast<char>(toupper(static_cast<unsigned char>(b[i])));
      if (ca != cb) {
        return false;
      }
    }
    return true;
  }

  // Using BTHome parser for object sizes
  static int measurement_size_(uint8_t obj_id) {
    return bthome::object_size(obj_id);
  }

  static std::string json_escape_(const std::string &value) {
    std::string out;
    out.reserve(value.size() + 8);
    for (char c : value) {
      if (c == '\\' || c == '"') {
        out.push_back('\\');
        out.push_back(c);
      } else if (static_cast<unsigned char>(c) < 0x20) {
        out.push_back(' ');
      } else {
        out.push_back(c);
      }
    }
    return out;
  }

  void process_one_(const QueuedAdv &adv) {
    const bool has_bthome = !adv.raw.empty();
    const bool looks_like_shelly = contains_ci_(adv.name, "SHELLY") || contains_ci_(adv.name, "BLU") ||
                                   contains_ci_(adv.name, "sbht") || contains_ci_(adv.name, "S1") ||
                                   contains_ci_(adv.name, "S3") || contains_ci_(adv.name, "SBHT");

    if (!has_bthome && !looks_like_shelly) {
      return;
    }

    // Parse BTHome data using modular parser
    bthome::BTHomeData parsed;
    if (has_bthome && adv.raw.size() > 1) {
      parsed = bthome::parse(adv.raw);
    }

    // Find or allocate slot for this device
    int index = -1;
    for (int i = 0; i < static_cast<int>(this->seen_.size()); i++) {
      if (!this->seen_[i].mac.empty() && same_mac_ci_(this->seen_[i].mac, adv.mac)) {
        index = i;
        break;
      }
    }
    if (index < 0) {
      for (int i = 0; i < static_cast<int>(this->seen_.size()); i++) {
        if (this->seen_[i].mac.empty()) {
          index = i;
          break;
        }
      }
    }
    if (index < 0) {
      // Replace oldest entry
      index = 0;
      uint32_t oldest = this->seen_[0].seen_at;
      for (int i = 1; i < static_cast<int>(this->seen_.size()); i++) {
        if (this->seen_[i].seen_at < oldest) {
          oldest = this->seen_[i].seen_at;
          index = i;
        }
      }
    }

    auto &slot = this->seen_[index];
    const bool is_new_entry = slot.mac.empty();

    // Update device info
    slot.mac = adv.mac;
    if (!adv.name.empty() || is_new_entry) {
      slot.name = adv.name.size() > 18 ? adv.name.substr(0, 18) : adv.name;
    }
    slot.rssi = adv.rssi;
    slot.has_bthome = has_bthome;
    slot.encrypted = parsed.encrypted;
    slot.seen_at = adv.seen_at;

    // Copy parsed sensor data (only if valid/present)
    if (!std::isnan(parsed.temperature) || is_new_entry) {
      slot.temp = parsed.temperature;
    }
    if (!std::isnan(parsed.humidity) || is_new_entry) {
      slot.humidity = parsed.humidity;
    }
    if (parsed.has_battery || is_new_entry) {
      slot.battery = parsed.battery;
      slot.has_battery = parsed.has_battery;
    }
    if (!std::isnan(parsed.illuminance) || is_new_entry) {
      slot.illuminance = parsed.illuminance;
    }
    if (!std::isnan(parsed.pressure) || is_new_entry) {
      slot.pressure = parsed.pressure;
    }
    if (!std::isnan(parsed.voltage) || is_new_entry) {
      slot.voltage = parsed.voltage;
    }
    // Light level
    if (parsed.has_light_level || is_new_entry) {
      slot.light_level = parsed.light_level;
      slot.has_light_level = parsed.has_light_level;
    }
    // Binary sensors
    if (parsed.has_light || is_new_entry) {
      slot.light = parsed.light;
      slot.has_light = parsed.has_light;
    }
    if (parsed.has_motion || is_new_entry) {
      slot.motion = parsed.motion;
      slot.has_motion = parsed.has_motion;
    }
    if (parsed.has_occupancy || is_new_entry) {
      slot.occupancy = parsed.occupancy;
      slot.has_occupancy = parsed.has_occupancy;
    }
    if (parsed.has_opening || is_new_entry) {
      slot.opening = parsed.opening;
      slot.has_opening = parsed.has_opening;
    }
  }

  std::deque<QueuedAdv> queue_;
  std::array<SeenDevice, 8> seen_{};
  size_t max_queue_size_{32};
};

inline BleAdvQueueParser &ble_parser_instance() {
  static BleAdvQueueParser parser;
  return parser;
}

}  // namespace heatvalve_ble
