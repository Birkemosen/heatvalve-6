# HeatValve-6 (CURRENTLY UNTESTED)

ESPHome firmware for HeatValve-6 floor heating valve controller using ESP32-S3 Super Mini with 3x DRV8837 motor drivers.

## Features

- **Hardware**: ESP32-S3 Super Mini + 3x DRV8837 motor drivers
- **6 motor channels** with current-based endstop detection
- **Modular architecture**: Separate files for zones, control profiles, and modes
- **4 control profiles**: Tanh (recommended), Linear, PID, Remote
- **2 operating modes**: Standard or Hydraulic Balancing
- **Multiple temperature sources**: Home Assistant, Dallas/OneWire, DHT, BLE (Xiaomi, BTHome/Shelly BLU H&T)

## Hardware

### GPIO Pinout (ESP32-S3 Super Mini)

| GPIO | Function | Description |
|------|----------|-------------|
| GPIO1 | *Spare* | Available for expansion |
| GPIO2 | Mux | HIGH=N1 (odd motors), LOW=N2 (even motors) |
| GPIO3 | nSLEEP 1 | DRV8837 #2: Motors 3 & 4 (strapping pin) |
| GPIO4 | nSLEEP 2 | DRV8837 #3: Motors 5 & 6 |
| GPIO5 | DIR2 | IN2 on all DRV8837 (direction) |
| GPIO6 | DIR1 | IN1 on all DRV8837 (direction) |
| GPIO7 | Tacho | Revolution counting (LMV358 conditioned) |
| GPIO8 | I2C SCL | I2C Clock (INA219, expansion) |
| GPIO9 | I2C SDA | I2C Data (INA219, expansion) |
| GPIO10 | 1-Wire | Dallas temperature sensors |
| GPIO11 | nSLEEP 0 | DRV8837 #1: Motors 1 & 2 |
| GPIO12 | *Spare* | Available for expansion |
| GPIO13 | *Spare* | Available for expansion |
| GPIO43 | UART TX | UART0 Transmit |
| GPIO44 | UART RX | UART0 Receive |
| GPIO48 | Status LED | WS2812 RGB |

### Motor Mapping

| Motor | DRV8837 | nSLEEP Pin | Mux State | Output |
|-------|---------|------------|-----------|--------|
| 1 | #1 | GPIO11 | HIGH (N1) | M1+ / MNODD |
| 2 | #1 | GPIO11 | LOW (N2) | M2+ / MNEVEN |
| 3 | #2 | GPIO3 | HIGH (N1) | M3+ / MNODD |
| 4 | #2 | GPIO3 | LOW (N2) | M4+ / MNEVEN |
| 5 | #3 | GPIO4 | HIGH (N1) | M5+ / MNODD |
| 6 | #3 | GPIO4 | LOW (N2) | M6+ / MNEVEN |

**Note**: Only ONE motor can run at a time due to the multiplexed design.

### Status LED Color Codes (WS2812)

| Color | Effect | Status |
|-------|--------|--------|
| 🟢 Green | Solid | Normal, connected to Home Assistant |
| 🟢 Green | Breathing | Normal, standalone mode |
| 🔵 Blue | Flashing | Booting / WiFi connecting |
| 🔵 Cyan | Solid | Motor running |
| 🟡 Yellow | Solid | Warning (sensor offline) |
| 🟠 Orange | Flashing | No 1-Wire sensors found |
| 🔴 Red | Solid | Error (API disconnected, standalone OFF) |
| 🔴 Red | Flashing | Critical error (motor stall) |
| 🟣 Purple | Solid | Calibration in progress |
| ⚪ White | Flash | Command received |

## Folder Structure

```
heatvalve-6/
├── boards/          # ESP32-S3 Super Mini only
├── core/            # Core infrastructure
│   ├── motor_driver.yaml  # DRV8837 motor control
│   ├── settings.yaml
│   └── ...
├── zones/           # Zone templates (base + control combined)
│   ├── tanh.yaml    # Tanh control (recommended for UFH)
│   ├── tanh_forecast.yaml  # Tanh + forecast (weather + solar)
│   ├── linear.yaml  # Linear control
│   ├── pid.yaml     # PID control
│   └── remote.yaml  # External/Home Assistant control
├── control/         # Control profiles (used internally)
├── modes/           # Operating modes
│   └── hydraulic.yaml
├── sensors/         # Sensor templates
├── optional/        # Pump, MQTT, BTHome BLE, Forecast (weather + solar)
└── docs/            # Documentation
```

## Quick Start

1. **Clone** the repository:
   ```bash
   cd /mnt/data/esphome/config
   git clone https://github.com/birkemosen/heatvalve-6.git heatvalve-6
   ```

2. **Setup secrets**:
   ```bash
   cp heatvalve-6/secrets.yaml secrets.yaml
   # Edit secrets.yaml with your WiFi credentials
   ```

3. **Create your config** (copy and modify `config.yaml`):
   - Set zone names and temperature sensors
   - Set Dallas sensor addresses for supply/return
   - Adjust motor mapping (`motor_number`) for each zone

4. **Compile & Upload**:
   ```bash
   esphome run config.yaml
   ```

## Configuration

### Control Profiles

| Profile | Algorithm | Best For |
|---------|-----------|----------|
| `zones/tanh.yaml` | Non-linear S-curve | UFH (recommended) |
| `zones/linear.yaml` | Linear interpolation | Simple systems |
| `zones/pid.yaml` | PID controller | Precise control |
| `zones/remote.yaml` | External control | Home Assistant |

### Zone Configuration

```yaml
zone_1: !include
  file: heatvalve-6/zones/tanh.yaml
  vars:
    zone_number: "1"
    motor_number: "1"          # Physical motor (1-6)
    id: living
    friendly_name: "Living Room"
    temperature_sensor: living_temp
    current_factor: "1.7"      # Endstop detection sensitivity
    zone_area_default: "25"
    zone_max_opening_default: "90"
    # ... temperature presets ...
```

### Standalone with BLE (Shelly BLU H&T)

Use Shelly BLU H&T Display thermostats over BLE (BTHome v2) so the board can run fully standalone. Add the `bthome_shelly_blu` package with each sensor’s MAC and a `temperature_sensor` id that matches your zones (e.g. `living_temp`). Enable **Standalone mode** in the web UI. Optionally include `bthome_shelly_blu_mqtt` together with an MQTT package (e.g. `mqtt_ecodan`) so BLE sensor values are published to MQTT for storage in Home Assistant (e.g. with Zigbee2MQTT or HA MQTT integration).

- Topics: `floor_heating/controller_<id>/ble/<sensor_id>/temperature`, `.../humidity`, `.../battery`
- BLE sensors are also exposed via the ESPHome API, so HA can read them when connected.
- Shelly BLU H&T **illuminance** (lx) is parsed and used by **Forecast** when enabled.

### Forecast (weather + solar, MPC-style, per-zone model)

In standalone you can use a simple predictive correction inspired by [better_thermostat](https://github.com/KartoffelToby/better_thermostat) MPC. The **per-zone model** lets the controller pre-heat rooms that face incoming wind so they can hold temperature later (typical room response 3–12 h).

- **Outdoor temp**: colder → higher demand (loss model).
- **Wind speed + direction**: wind *from* the opposite direction of a zone’s exposed wall → extra loss and **pre-heat** for that zone (opvarm til lidt højere effektiv mål-temp så rummet kan holde temperaturen når blæsten rammer).
- **Response time** (3–12 h per zone): slow rooms get a larger pre-heat offset so they “charge” in time. Can be configured now; learning from data can be added later.
- **Illuminance** (Shelly BLU H&T): more light → less demand (solar term).

1. Include **optional/forecast.yaml** (with BLE illuminance) or **optional/forecast_no_ble.yaml**.
2. Use **zones/tanh_forecast.yaml** for zones that should use forecast.
3. Feed weather via MQTT: `forecast_outdoor_temp`, `forecast_wind_speed` (m/s), `forecast_wind_direction` (degrees, 0=N, 90=E, 180=S, 270=W).  
   **Standalone med Open-Meteo:** Controlleren kan hente vejr direkte (WiFi + internet). Ingen MQTT nødvendig.  
   - Kun aktuel vejr: **optional/forecast_openmeteo_current.yaml** (kræver kun forecast eller forecast_no_ble).  
   - Aktuel vejr + 24h prognose: **optional/forecast_openmeteo.yaml** (kræver også forecast_learn).  
   Sæt `openmeteo_latitude` og `openmeteo_longitude` i config.  
   **Eller via MQTT:** Uden internet på controlleren kan vejr hentes fra et API i HA/Node-RED og sendes til MQTT. Se [Forecast data fra API](docs/FORECAST_DATA_SOURCES.md).
4. Per-zone in `forecast.yaml` / `forecast_no_ble.yaml`:
   - **zN_exposure_deg**: direction the room’s cold wall *faces* (0=N, 90=E, 180=S, 270=W). Use `-1` for no wind-direction effect.
   - **zN_response_h**: thermal response time in hours (3–12). Larger value → more pre-heat when wind will hit.
5. Tune: `forecast_k_outdoor`, `forecast_k_wind`, `forecast_k_preheat`, `forecast_k_solar`, and correction clamp.

Correction = outdoor_term + wind_term_zone + preheat_zone − solar_zone; applied as **effective_diff_temp = diff_temp + zone_forecast_correction** in tanh_forecast.

#### Selvlæring og 24h vejrudsigt

Når **optional/forecast_learn.yaml** er inkluderet (efter forecast.yaml eller forecast_no_ble.yaml):

- **Prognose-horisont**: Systemet bruger *worst-case* over de næste **N** timer (N = forecast_horizon_hours, default 12; bør matche rummenes reaktionstid) (laveste udetemp, højeste vind pr. zone) til at beslutte hvor meget et rum skal “lades op”. Feed 24 timers data via MQTT til template-text-sensorerne:
  - **outdoor**: N kommaseparerede temperaturer (°C). **wind_speed**, **wind_dir**: N værdier hver.
  Sæt state med `id(heating_forecast_24h_outdoor).publish_state(payload)` i en MQTT `on_message` (tilsvarende for `forecast_24h_wind_speed` og `forecast_24h_wind_dir`).
- **Selvlæring**: Per zone estimeres termisk respons tid (tau, timer) fra observeret temperatur og ventilåbning. Når tillid > 0,3 bruges den lært tau i stedet for `zN_response_h` til pre-heat-skala. Tanh-forecast skriver løbende `zone_N_learn_T`, `zone_N_learn_valve`, `zone_N_learn_target`, `zone_N_learn_ts`; forecast_learn beregner tau hver 5. min ud fra to samples med ≥10 min mellemrum under opvarmning.

Uden prognose-data forbliver worst-case på −999, og systemet bruger kun aktuel vejr. Sæt **forecast_horizon_hours** til den længste reaktionstid blandt rum (samme tal som max af z1_response_h … z8_response_h, typisk 6–12).

### Hydraulic Balancing

Enable for pipe-length based flow balancing:

```yaml
packages:
  hydraulic: !include heatvalve-6/modes/hydraulic.yaml
```

## First Time Upload

1. Connect ESP32-S3 via USB
2. Press BOOT button for 2-3 seconds before flashing
3. After OTA update, press EN (reset) button
4. Future uploads will be wireless (OTA)

## Documentation

- [Quick Start Guide](docs/QUICK_START.md)
- [Hydraulic Balancing](docs/HYDRAULIC_BALANCING.md)
- [Forecast data fra API (MQTT + Open-Meteo m.m.)](docs/FORECAST_DATA_SOURCES.md)
- [Algorithm optimizations (Better Thermostat–inspired)](docs/ALGORITHM_OPTIMIZATIONS.md)

## Inspiration & Credits

This project was inspired by and builds upon ideas from:

- [VdMot_Controller](https://github.com/Lenti84/VdMot_Controller) by Lenti84 — multiplexed motor control and current-based endstop detection for Homematic HmIP-VDMOT valve actuators
- [floor-heating-controller](https://github.com/nliaudat/floor-heating-controller) by nliaudat — BEMF analysis and trigger calculations for valve motor tachometry
- [Motor Controller Tachometer](https://yyao.ca/projects/motor_controller_tachometer/) by Yi Yao — back-EMF tachometer circuit design
- [better_thermostat](https://github.com/KartoffelToby/better_thermostat) by KartoffelToby — MPC-style forecast and virtual temperature ideas

## License

See [LICENSE](LICENSE) file.
