# HeatValve-6 (CURRENTLY UNTESTED)

ESPHome firmware for HeatValve-6 floor heating valve controller using ESP32-S3 Super Mini with 3x DRV8837 motor drivers.

## Features

- **Hardware**: ESP32-S3 Super Mini + 3x DRV8837 motor drivers
- **6 motor channels** with current-based endstop detection
- **Modular architecture**: Separate files for zones, control profiles, and modes
- **4 control profiles**: Tanh (recommended), Linear, PID, Remote
- **2 operating modes**: Standard or Hydraulic Balancing
- **Multiple temperature sources**: Home Assistant, Dallas/OneWire, DHT, BLE

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
│   ├── linear.yaml  # Linear control
│   ├── pid.yaml     # PID control
│   └── remote.yaml  # External/Home Assistant control
├── control/         # Control profiles (used internally)
├── modes/           # Operating modes
│   └── hydraulic.yaml
├── sensors/         # Sensor templates
├── optional/        # Pump control, MQTT integration
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

## Inspiration & Credits

This project was inspired by and builds upon ideas from:

- [VdMot_Controller](https://github.com/Lenti84/VdMot_Controller) by Lenti84 — multiplexed motor control and current-based endstop detection for Homematic HmIP-VDMOT valve actuators
- [floor-heating-controller](https://github.com/nliaudat/floor-heating-controller) by nliaudat — BEMF analysis and trigger calculations for valve motor tachometry
- [Motor Controller Tachometer](https://yyao.ca/projects/motor_controller_tachometer/) by Yi Yao — back-EMF tachometer circuit design

## License

See [LICENSE](LICENSE) file.
