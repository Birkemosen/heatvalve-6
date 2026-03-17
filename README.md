# HeatValve-6 (CURRENTLY UNTESTED)

ESPHome firmware for HeatValve-6 floor heating valve controller using ESP32-S3 Super Mini with 6x DRV8215 I2C motor drivers.

## Features

- **Hardware**: ESP32-S3 Super Mini + 6x DRV8215 I2C motor drivers
- **6 motor channels** with current-based endstop detection
- **Modular architecture**: Separate files for zones, control profiles, and optional integrations
- **4 control profiles**: Tanh (recommended), Linear, PID, Remote
- **Multiple temperature sources**: Home Assistant, Dallas/OneWire, DHT, BLE
- **Standalone dashboard**: Built-in web UI at `/dashboard`
- **Optional**: [Threyr Advanced Control](#threyr-advanced-control) — physics-aware, self-learning

## Hardware

### GPIO Pinout (ESP32-S3 Super Mini)

| GPIO | Function | Description |
|------|----------|-------------|
| GPIO1 | IPROPI ADC | Shared motor current sensing |
| GPIO2 | nSLEEP | Shared nSLEEP for all 6x DRV8215 |
| GPIO3-6 | *Spare* | Available for expansion |
| GPIO7 | nFAULT | Wired-OR fault from all DRV8215 |
| GPIO8 | I2C SDA | I2C Data (DRV8215 x6, expansion) |
| GPIO9 | I2C SCL | I2C Clock (DRV8215 x6, expansion) |
| GPIO10 | 1-Wire | Dallas temperature sensors |
| GPIO11-13 | *Spare* | Available for expansion |
| GPIO43 | UART TX | UART0 Transmit |
| GPIO44 | UART RX | UART0 Receive |
| GPIO48 | Status LED | WS2812 RGB |

### Motor Mapping (DRV8215 I2C)

| Motor | I2C Address | A1 | A0 |
|-------|------------|-----|-----|
| 1 | 0x30 | GND | GND |
| 2 | 0x31 | GND | Hi-Z |
| 3 | 0x32 | GND | VCC |
| 4 | 0x33 | Hi-Z | GND |
| 5 | 0x34 | Hi-Z | Hi-Z |
| 6 | 0x35 | Hi-Z | VCC |

**Note**: Only ONE motor can run at a time (shared IPROPI current sensing).

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
│   ├── motor_driver.yaml  # DRV8215 I2C motor control
│   ├── settings.yaml
│   └── ...
├── zones/           # Zone templates (base + control combined)
│   ├── tanh.yaml    # Tanh control (recommended for UFH)
│   ├── linear.yaml  # Linear control
│   ├── pid.yaml     # PID control
│   └── remote.yaml  # External/Home Assistant control
├── control/         # Control profiles (used internally)
├── sensors/         # Sensor templates
├── optional/        # Pump control, MQTT integration
├── components/      # Custom ESPHome components
│   └── heatvalve_dashboard/  # Standalone web UI
├── threyr.yaml      # Threyr integration config
└── docs/            # Documentation
```

## Lokalt udviklingsmiljø (test uden commit/pull)

Byg og upload direkte fra repo-roden:

```bash
cd heatvalve-6
make run            # Basic control
make run-threyr     # With Threyr (requires ../threyr/ repo)
```

Device-navn er `heatvalve-6-dev` så OTA ikke overskriver produktions-enhed. Se [docs/LOCAL_DEV.md](docs/LOCAL_DEV.md).

---

## Quick Start (produktion / Home Assistant)

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
   - Use the DS18x20 selector entities to map supply/return sensors
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

### Hydraulic Balancing

Hydraulic balancing is implemented in Threyr.

```yaml
packages:
   threyr: !include heatvalve-6/threyr.yaml
```

Detailed algorithm documentation: [threyr/docs/hydraulic_balancing.md](https://github.com/birkemosen/threyr/blob/main/docs/hydraulic_balancing.md)

## Threyr Advanced Control

Threyr is an optional closed-source advanced heating control system that extends HeatValve-6 with:

- **Hydraulic balancing** — Physics-based flow distribution using pipe ratios
- **Weather-aware control** — Solar influx, wind, outdoor temperature
- **Energy price optimization** — Schedule heating around energy costs
- **Self-learning thermal model** — Adapts to your building's characteristics
- **Predictive zone management** — Per-zone temperature forecasting
- **Comfort preheating** — Maintains comfort by preheating ahead of schedule

**License required.** When no license is active, the system runs basic control only.

### Quick Setup (Threyr)

1. Clone the Threyr repo (requires access):
   ```bash
   git clone https://github.com/birkemosen/threyr.git
   ```

2. Add license key to `secrets.yaml`:
   ```yaml
   threyr_license_key: "LIC-XXXX-XXXX-XXXX"
   ```

3. Use `config_dev_threyr.yaml` or add to your config:
   ```yaml
   external_components:
     - source:
         type: git
         url: https://github.com/birkemosen/threyr.git
         ref: main
       components:
         - threyr
   packages:
     threyr: !include heatvalve-6/threyr.yaml
   ```

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for full architecture details.

## First Time Upload

1. Connect ESP32-S3 via USB
2. Press BOOT button for 2-3 seconds before flashing
3. After OTA update, press EN (reset) button
4. Future uploads will be wireless (OTA)

## Documentation

- [Architecture](docs/ARCHITECTURE.md) – system design and Threyr integration
- [Lokalt udviklingsmiljø](docs/LOCAL_DEV.md) – test uden commit/pull
- [Quick Start Guide](docs/quick_start.md)
- [Hydraulic Balancing (Threyr)](https://github.com/birkemosen/threyr/blob/main/docs/hydraulic_balancing.md)

## Inspiration & Credits

This project was inspired by and builds upon ideas from:

- [VdMot_Controller](https://github.com/Lenti84/VdMot_Controller) by Lenti84 — multiplexed motor control and current-based endstop detection for Homematic HmIP-VDMOT valve actuators
- [floor-heating-controller](https://github.com/nliaudat/floor-heating-controller) by nliaudat — BEMF analysis and trigger calculations for valve motor tachometry
- [Motor Controller Tachometer](https://yyao.ca/projects/motor_controller_tachometer/) by Yi Yao — back-EMF tachometer circuit design

## License

See [LICENSE](LICENSE) file.
