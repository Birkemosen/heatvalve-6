#pragma once
// =============================================================================
// BTHome v2 Protocol Parser
// =============================================================================
// Modular parser for BTHome v2 BLE advertisement format.
// Reference: https://bthome.io/format/
//
// This parser extracts sensor data from BTHome v2 service data (UUID 0xFCD2).
// Supports temperature, humidity, battery, illuminance, and binary sensors.
// =============================================================================

#include <cmath>
#include <cstdint>
#include <cstring>
#include <string>
#include <vector>

namespace heatvalve_ble {
namespace bthome {

// =============================================================================
// BTHome v2 Parsed Data Structure
// =============================================================================

struct BTHomeData {
  // Device info flags (from first byte)
  bool encrypted{false};
  bool trigger_based{false};
  uint8_t bthome_version{0};

  // Packet tracking
  uint8_t packet_id{0};
  bool has_packet_id{false};

  // Sensors - NAN means not present
  float temperature{NAN};      // °C (multiple formats supported)
  float humidity{NAN};         // % (uint8 1% or uint16 0.01%)
  uint8_t battery{0};          // 0-100%
  bool has_battery{false};
  float illuminance{NAN};      // lux (uint24 0.01 lux)
  float pressure{NAN};         // hPa (uint24 0.01 hPa)
  float voltage{NAN};          // V
  float dewpoint{NAN};         // °C
  uint16_t co2{0};             // ppm
  bool has_co2{false};
  uint16_t tvoc{0};            // ppb
  bool has_tvoc{false};
  uint16_t pm25{0};            // μg/m³
  bool has_pm25{false};
  uint16_t pm10{0};            // μg/m³
  bool has_pm10{false};
  float uv_index{NAN};         // UV index

  // Light level (0x64) - uint8 percentage or level
  uint8_t light_level{0};
  bool has_light_level{false};

  // Binary sensors
  bool light{false};
  bool has_light{false};
  bool motion{false};
  bool has_motion{false};
  bool occupancy{false};
  bool has_occupancy{false};
  bool opening{false};         // door/window
  bool has_opening{false};
  bool smoke{false};
  bool has_smoke{false};
  bool tamper{false};
  bool has_tamper{false};
  bool vibration{false};
  bool has_vibration{false};
  bool power{false};           // power on/off
  bool has_power{false};

  // Count/energy
  uint32_t count{0};
  bool has_count{false};
  float energy{NAN};           // kWh
  float power_w{NAN};          // W

  // Button events (last event only)
  uint8_t button_event{0};     // 0=none, 1=press, 2=double, 3=triple, 4=long, etc.
  bool has_button_event{false};

  // Parse status
  bool valid{false};
  size_t bytes_parsed{0};
};

// =============================================================================
// BTHome v2 Object ID Size Mapping
// =============================================================================

inline int object_size(uint8_t obj_id) {
  // BTHome v2 object sizes from https://bthome.io/format/
  switch (obj_id) {
    // 1-byte objects
    case 0x00:  // packet_id
    case 0x01:  // battery (uint8, %)
    case 0x09:  // count (uint8)
    case 0x0F:  // generic_boolean
    case 0x10:  // power (binary)
    case 0x11:  // opening
    case 0x15:  // battery_low (binary)
    case 0x16:  // battery_charging
    case 0x17:  // carbon_monoxide
    case 0x18:  // cold
    case 0x19:  // connectivity
    case 0x1A:  // door
    case 0x1B:  // garage_door
    case 0x1C:  // gas
    case 0x1D:  // heat
    case 0x1E:  // light (binary)
    case 0x1F:  // lock
    case 0x20:  // moisture (binary)
    case 0x21:  // motion
    case 0x22:  // moving
    case 0x23:  // occupancy
    case 0x24:  // plug
    case 0x25:  // presence
    case 0x26:  // problem
    case 0x27:  // running
    case 0x28:  // safety
    case 0x29:  // smoke
    case 0x2A:  // sound
    case 0x2B:  // tamper
    case 0x2C:  // vibration
    case 0x2D:  // window
    case 0x2E:  // humidity (uint8, 1%)
    case 0x2F:  // moisture (uint8, %)
    case 0x3A:  // button event
    case 0x46:  // uv_index (uint8, 0.1)
    case 0x57:  // temperature (sint8, 1°C)
    case 0x58:  // temperature (sint8, 0.35°C)
    case 0x59:  // count (sint8)
    case 0x60:  // channel
    case 0x64:  // light_level
      return 1;

    // 2-byte objects
    case 0x02:  // temperature (sint16, 0.01°C)
    case 0x03:  // humidity (uint16, 0.01%)
    case 0x06:  // mass_kg
    case 0x07:  // mass_lb
    case 0x08:  // dewpoint (sint16, 0.01°C)
    case 0x0C:  // voltage (uint16, 0.001V)
    case 0x0D:  // pm2.5
    case 0x0E:  // pm10
    case 0x12:  // co2
    case 0x13:  // tvoc
    case 0x14:  // moisture (uint16, 0.01%)
    case 0x3D:  // count (uint16)
    case 0x3F:  // rotation (sint16, 0.1°)
    case 0x40:  // distance_mm
    case 0x41:  // distance_m
    case 0x43:  // current (uint16, 0.001A)
    case 0x44:  // speed
    case 0x45:  // temperature (sint16, 0.1°C)
    case 0x47:  // volume (uint16, 0.1L)
    case 0x48:  // volume_ml
    case 0x49:  // volume_flow_rate
    case 0x4A:  // voltage (uint16, 0.1V)
    case 0x51:  // acceleration
    case 0x52:  // gyroscope
    case 0x56:  // conductivity
    case 0x5A:  // count (sint16)
    case 0x5D:  // current (sint16)
    case 0x5E:  // direction
    case 0x5F:  // precipitation
    case 0x61:  // rotational_speed
    case 0xF0:  // device_type_id
      return 2;

    // 3-byte objects
    case 0x04:  // pressure (uint24, 0.01 hPa)
    case 0x05:  // illuminance (uint24, 0.01 lux)
    case 0x0A:  // energy (uint24, 0.001 kWh)
    case 0x0B:  // power (uint24, 0.01 W)
    case 0x3C:  // dimmer event
    case 0x42:  // duration
    case 0x4B:  // gas (uint24)
    case 0xF2:  // firmware_version
      return 3;

    // 4-byte objects
    case 0x3E:  // count (uint32)
    case 0x4C:  // gas (uint32)
    case 0x4D:  // energy (uint32, 0.001 kWh)
    case 0x4E:  // volume (uint32)
    case 0x4F:  // water (uint32)
    case 0x50:  // timestamp
    case 0x55:  // volume_storage
    case 0x5B:  // count (sint32)
    case 0x5C:  // power (sint32)
    case 0x62:  // speed (sint32)
    case 0x63:  // acceleration (sint32)
    case 0xF1:  // firmware_version (4-part)
      return 4;

    default:
      return -1;  // Unknown object ID
  }
}

// =============================================================================
// Utility Functions
// =============================================================================

inline uint16_t read_u16(const uint8_t *data) {
  return static_cast<uint16_t>(data[0] | (data[1] << 8));
}

inline int16_t read_s16(const uint8_t *data) {
  return static_cast<int16_t>(read_u16(data));
}

inline uint32_t read_u24(const uint8_t *data) {
  return static_cast<uint32_t>(data[0] | (data[1] << 8) | (data[2] << 16));
}

inline uint32_t read_u32(const uint8_t *data) {
  return static_cast<uint32_t>(data[0] | (data[1] << 8) | (data[2] << 16) | (data[3] << 24));
}

// =============================================================================
// BTHome v2 Parser
// =============================================================================

inline BTHomeData parse(const std::vector<uint8_t> &raw) {
  BTHomeData data;

  if (raw.empty()) {
    return data;
  }

  // First byte contains device info
  const uint8_t info_byte = raw[0];
  data.encrypted = (info_byte & 0x01) != 0;
  data.trigger_based = (info_byte & 0x04) != 0;
  data.bthome_version = (info_byte >> 5) & 0x07;

  // If encrypted, we can't parse further
  if (data.encrypted) {
    data.bytes_parsed = 1;
    return data;
  }

  // Parse measurement objects starting at offset 1
  size_t pos = 1;
  while (pos < raw.size()) {
    const uint8_t obj_id = raw[pos++];
    const int len = object_size(obj_id);

    // Unknown object ID or not enough data
    if (len < 0 || pos + static_cast<size_t>(len) > raw.size()) {
      break;
    }

    const uint8_t *d = &raw[pos];

    switch (obj_id) {
      // Packet ID
      case 0x00:
        data.packet_id = d[0];
        data.has_packet_id = true;
        break;

      // Battery (uint8, %)
      case 0x01:
        data.battery = d[0];
        data.has_battery = true;
        break;

      // Temperature (sint16, 0.01°C)
      case 0x02:
        data.temperature = read_s16(d) * 0.01f;
        break;

      // Humidity (uint16, 0.01%)
      case 0x03:
        data.humidity = read_u16(d) * 0.01f;
        break;

      // Pressure (uint24, 0.01 hPa)
      case 0x04:
        data.pressure = read_u24(d) * 0.01f;
        break;

      // Illuminance (uint24, 0.01 lux)
      case 0x05:
        data.illuminance = read_u24(d) * 0.01f;
        break;

      // Dewpoint (sint16, 0.01°C)
      case 0x08:
        data.dewpoint = read_s16(d) * 0.01f;
        break;

      // Energy (uint24, 0.001 kWh)
      case 0x0A:
        data.energy = read_u24(d) * 0.001f;
        break;

      // Power (uint24, 0.01 W)
      case 0x0B:
        data.power_w = read_u24(d) * 0.01f;
        break;

      // Voltage (uint16, 0.001V)
      case 0x0C:
        data.voltage = read_u16(d) * 0.001f;
        break;

      // PM2.5 (uint16)
      case 0x0D:
        data.pm25 = read_u16(d);
        data.has_pm25 = true;
        break;

      // PM10 (uint16)
      case 0x0E:
        data.pm10 = read_u16(d);
        data.has_pm10 = true;
        break;

      // Power binary (on/off)
      case 0x10:
        data.power = d[0] != 0;
        data.has_power = true;
        break;

      // Opening (door/window)
      case 0x11:
        data.opening = d[0] != 0;
        data.has_opening = true;
        break;

      // CO2 (uint16, ppm)
      case 0x12:
        data.co2 = read_u16(d);
        data.has_co2 = true;
        break;

      // TVOC (uint16, ppb)
      case 0x13:
        data.tvoc = read_u16(d);
        data.has_tvoc = true;
        break;

      // Light binary
      case 0x1E:
        data.light = d[0] != 0;
        data.has_light = true;
        break;

      // Motion
      case 0x21:
        data.motion = d[0] != 0;
        data.has_motion = true;
        break;

      // Occupancy
      case 0x23:
        data.occupancy = d[0] != 0;
        data.has_occupancy = true;
        break;

      // Smoke
      case 0x29:
        data.smoke = d[0] != 0;
        data.has_smoke = true;
        break;

      // Tamper
      case 0x2B:
        data.tamper = d[0] != 0;
        data.has_tamper = true;
        break;

      // Vibration
      case 0x2C:
        data.vibration = d[0] != 0;
        data.has_vibration = true;
        break;

      // Humidity (uint8, 1%)
      case 0x2E:
        data.humidity = static_cast<float>(d[0]);
        break;

      // Button event
      case 0x3A:
        data.button_event = d[0];
        data.has_button_event = true;
        break;

      // Count (uint32)
      case 0x3E:
        data.count = read_u32(d);
        data.has_count = true;
        break;

      // Temperature (sint16, 0.1°C) - Shelly format
      case 0x45:
        data.temperature = read_s16(d) * 0.1f;
        break;

      // UV Index (uint8, 0.1)
      case 0x46:
        data.uv_index = d[0] * 0.1f;
        break;

      // Energy (uint32, 0.001 kWh)
      case 0x4D:
        data.energy = read_u32(d) * 0.001f;
        break;

      // Temperature (sint8, 1°C)
      case 0x57:
        data.temperature = static_cast<float>(static_cast<int8_t>(d[0]));
        break;

      // Temperature (sint8, 0.35°C) - special scaling
      case 0x58:
        data.temperature = static_cast<float>(static_cast<int8_t>(d[0])) * 0.35f;
        break;

      // Light level (uint8) - Shelly H&T uses this
      case 0x64:
        data.light_level = d[0];
        data.has_light_level = true;
        break;

      default:
        // Unknown but valid size, skip
        break;
    }

    pos += static_cast<size_t>(len);
  }

  data.bytes_parsed = pos;
  data.valid = (pos > 1);  // At least parsed the info byte + some data
  return data;
}

// =============================================================================
// JSON Serialization Helper
// =============================================================================

inline std::string to_json_fields(const BTHomeData &d) {
  std::string json;
  char buf[64];

  // Temperature
  if (!std::isnan(d.temperature)) {
    snprintf(buf, sizeof(buf), "\"temp\":%.2f,", d.temperature);
    json += buf;
  }

  // Humidity
  if (!std::isnan(d.humidity)) {
    snprintf(buf, sizeof(buf), "\"hum\":%.1f,", d.humidity);
    json += buf;
  }

  // Battery
  if (d.has_battery) {
    snprintf(buf, sizeof(buf), "\"bat\":%u,", d.battery);
    json += buf;
  }

  // Illuminance
  if (!std::isnan(d.illuminance)) {
    snprintf(buf, sizeof(buf), "\"lux\":%.1f,", d.illuminance);
    json += buf;
  }

  // Pressure
  if (!std::isnan(d.pressure)) {
    snprintf(buf, sizeof(buf), "\"pres\":%.2f,", d.pressure);
    json += buf;
  }

  // Voltage
  if (!std::isnan(d.voltage)) {
    snprintf(buf, sizeof(buf), "\"volt\":%.3f,", d.voltage);
    json += buf;
  }

  // Dewpoint
  if (!std::isnan(d.dewpoint)) {
    snprintf(buf, sizeof(buf), "\"dew\":%.2f,", d.dewpoint);
    json += buf;
  }

  // CO2
  if (d.has_co2) {
    snprintf(buf, sizeof(buf), "\"co2\":%u,", d.co2);
    json += buf;
  }

  // TVOC
  if (d.has_tvoc) {
    snprintf(buf, sizeof(buf), "\"tvoc\":%u,", d.tvoc);
    json += buf;
  }

  // PM2.5
  if (d.has_pm25) {
    snprintf(buf, sizeof(buf), "\"pm25\":%u,", d.pm25);
    json += buf;
  }

  // PM10
  if (d.has_pm10) {
    snprintf(buf, sizeof(buf), "\"pm10\":%u,", d.pm10);
    json += buf;
  }

  // UV Index
  if (!std::isnan(d.uv_index)) {
    snprintf(buf, sizeof(buf), "\"uv\":%.1f,", d.uv_index);
    json += buf;
  }

  // Energy
  if (!std::isnan(d.energy)) {
    snprintf(buf, sizeof(buf), "\"energy\":%.3f,", d.energy);
    json += buf;
  }

  // Power (watts)
  if (!std::isnan(d.power_w)) {
    snprintf(buf, sizeof(buf), "\"power\":%.2f,", d.power_w);
    json += buf;
  }

  // Binary sensors
  if (d.has_light) {
    json += d.light ? "\"light\":true," : "\"light\":false,";
  }
  if (d.has_motion) {
    json += d.motion ? "\"motion\":true," : "\"motion\":false,";
  }
  if (d.has_occupancy) {
    json += d.occupancy ? "\"occ\":true," : "\"occ\":false,";
  }
  if (d.has_opening) {
    json += d.opening ? "\"open\":true," : "\"open\":false,";
  }
  if (d.has_smoke) {
    json += d.smoke ? "\"smoke\":true," : "\"smoke\":false,";
  }
  if (d.has_tamper) {
    json += d.tamper ? "\"tamper\":true," : "\"tamper\":false,";
  }
  if (d.has_vibration) {
    json += d.vibration ? "\"vib\":true," : "\"vib\":false,";
  }
  if (d.has_power) {
    json += d.power ? "\"pwr\":true," : "\"pwr\":false,";
  }

  // Button event
  if (d.has_button_event) {
    snprintf(buf, sizeof(buf), "\"btn\":%u,", d.button_event);
    json += buf;
  }

  // Count
  if (d.has_count) {
    snprintf(buf, sizeof(buf), "\"cnt\":%u,", d.count);
    json += buf;
  }

  // Remove trailing comma if present
  if (!json.empty() && json.back() == ',') {
    json.pop_back();
  }

  return json;
}

}  // namespace bthome
}  // namespace heatvalve_ble
