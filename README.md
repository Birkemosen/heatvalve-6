# HeatValve-6 (CURRENTLY UNTESTED)

ESPHome firmware for HeatValve-6 floor heating valve controller using ESP32-S3 Super Mini with 6x DRV8215 I2C motor drivers.

## Features

- **Hardware**: ESP32-S3 Super Mini + 6x DRV8215 I2C motor drivers
- **6 motor channels** with current-based endstop detection
- **Modular architecture**: Separate files for zones, control profiles, and optional integrations
- **4 control profiles**: Tanh (recommended), Linear, PID, Remote
- **Multiple temperature sources**: Home Assistant, Dallas/OneWire, DHT, BLE
- **Standalone dashboard**: Built-in web UI at `/dashboard`

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
├── heatvalve-6.yaml             # Single root template (shared by all deployments)
├── deploy/
│   ├── local-prod.yaml          # Repo-local production entrypoint
│   ├── local-dev.yaml           # Repo-local development entrypoint
│   ├── esphome-remote.yaml      # ESPHome server entrypoint (no clone)
│   ├── drv8215-test.yaml        # DRV8215 full test profile
│   └── drv8215-motor1-manual.yaml
└── docs/            # Documentation
```

## Lokalt udviklingsmiljø (test uden commit/pull)

Byg og upload direkte fra repo-roden:

```bash
cd heatvalve-6
make run            # Basic control
```

Device-navn er `heatvalve-6-dev` så OTA ikke overskriver produktions-enhed. Se [docs/LOCAL_DEV.md](docs/LOCAL_DEV.md).

---

## Quick Start (produktion / Home Assistant)

### Option A (recommended): No local clone, use remote package

1. Download entrypoint config:
   ```bash
   curl -L -o /config/heatvalve-6-stue.yaml https://raw.githubusercontent.com/birkemosen/heatvalve-6/main/deploy/esphome-remote.yaml
   ```
2. Add secrets in `/config/secrets.yaml`: `wifi_ssid`, `wifi_password`, `fallback_password`, `ota_password`.
3. Optional: override `name` and `friendly_name` in substitutions.
4. Compile & upload:
   ```bash
   esphome run /config/heatvalve-6-stue.yaml
   ```

### Option B: Repo-local workflow

1. Clone repository into ESPHome config directory:
   ```bash
   cd /mnt/data/esphome/config
   git clone https://github.com/birkemosen/heatvalve-6.git heatvalve-6
   ```
2. Use `heatvalve-6/deploy/local-prod.yaml` (or `heatvalve-6/deploy/local-dev.yaml`).

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

## First Time Upload

1. Connect ESP32-S3 via USB
2. Press BOOT button for 2-3 seconds before flashing
3. After OTA update, press EN (reset) button
4. Future uploads will be wireless (OTA)

## Documentation

- [Architecture](docs/ARCHITECTURE.md) – system design
- [Lokalt udviklingsmiljø](docs/LOCAL_DEV.md) – test uden commit/pull
- [Quick Start Guide](docs/quick_start.md)

## Inspiration & Credits

This project was inspired by and builds upon ideas from:

- [VdMot_Controller](https://github.com/Lenti84/VdMot_Controller) by Lenti84 — multiplexed motor control and current-based endstop detection for Homematic HmIP-VDMOT valve actuators
- [floor-heating-controller](https://github.com/nliaudat/floor-heating-controller) by nliaudat — BEMF analysis and trigger calculations for valve motor tachometry
- [Motor Controller Tachometer](https://yyao.ca/projects/motor_controller_tachometer/) by Yi Yao — back-EMF tachometer circuit design

## License

See [LICENSE](LICENSE) file.
