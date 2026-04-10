# HeatValve-6

ESPHome firmware for the HeatValve-6 underfloor heating controller on ESP32-S3 with 6 DRV8215 I2C motor drivers.

This repository is now ESPHome-only. The legacy PlatformIO and ESP-IDF source tree has been removed.

## Repository Layout

```text
heatvalve-6/
├── heatvalve-6.yaml   # Main ESPHome firmware config
├── secrets.yaml       # Local secrets template (gitignored)
├── components/        # Custom ESPHome external components
│   ├── hv6_config_store/
│   ├── hv6_valve_controller/
│   └── hv6_zone_controller/
├── docs/
├── README.md
└── changelog.md
```

## What Is In The Firmware

- ESPHome on ESP-IDF
- 6-zone valve control with DRV8215 over I2C
- Custom C++ external components for config storage, valve control, and zone control
- Native ESPHome WiFi, API, OTA, web server, display, and climate entities
- DS18B20 1-Wire temperature sensors
- SSD1306 OLED support
- WS2812 status LED

## Hardware Mapping

| GPIO | Function |
|------|----------|
| GPIO1 | Motor current sense ADC |
| GPIO2 | DRV8215 nSLEEP |
| GPIO7 | DRV8215 nFAULT |
| GPIO8 | I2C SDA |
| GPIO9 | I2C SCL |
| GPIO12 | 1-Wire bus |
| GPIO48 | WS2812 status LED |

### DRV8215 Addresses

| Zone | Address |
|------|---------|
| 1 | 0x30 |
| 2 | 0x31 |
| 3 | 0x32 |
| 4 | 0x35 |
| 5 | 0x33 |
| 6 | 0x34 |

Only one motor should run at a time because current sensing is shared.

## Quick Start

1. Edit `secrets.yaml` with your WiFi, API, OTA, and optional MQTT values.
2. Replace the placeholder DS18B20 addresses in `heatvalve-6.yaml` after first discovery.
3. Build or deploy from the repo root.

Preferred workflow:

```bash
make build
make deploy
make logs
```

If you want USB flashing explicitly:

```bash
make deploy PORT=/dev/cu.usbmodemXXXX
```

If you want OTA to a specific host/IP:

```bash
make ota HOST=192.168.1.50
```

The `Makefile` automatically uses `.venv/bin/esphome` when present.

Direct ESPHome commands still work:

```bash
esphome run heatvalve-6.yaml
```

For config validation only:

```bash
esphome config heatvalve-6.yaml
```

## Dashboard Mock Development

The custom dashboard can now run without the device by opening `web/mock-dashboard.html` in a browser. It uses the same `web/dashboard.js` and `web/dashboard.css` files as the ESPHome dashboard, but swaps SSE and REST for a local mock state engine.

Useful options:

```bash
open web/mock-dashboard.html
```

```bash
cd web && python3 -m http.server 8000
```

Then open `http://127.0.0.1:8000/mock-dashboard.html`.

Mock mode keeps all dashboard controls active, including setpoint changes, toggles, settings inputs, and diagnostics actions, so UI work can happen without `make deploy`.

## Notes

- The current firmware layout assumes the ESPHome config lives at the repository root.
- `secrets.yaml` is kept as a local template and remains gitignored.
- The repository has not been fully compile-tested yet after the migration.

## Documentation

- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)
- [docs/ecodan_integration.md](docs/ecodan_integration.md)
- [docs/esp32-s3_ufh_pcb_solution.md](docs/esp32-s3_ufh_pcb_solution.md)
- [docs/schematics/rev3_wroom1/esp32_s3_wroom1_n16r8_controller.md](docs/schematics/rev3_wroom1/esp32_s3_wroom1_n16r8_controller.md)

## Inspiration & Credits

This project was inspired by and builds upon ideas from:

- [VdMot_Controller](https://github.com/Lenti84/VdMot_Controller) by Lenti84 — multiplexed motor control and current-based endstop detection for Homematic HmIP-VDMOT valve actuators
- [floor-heating-controller](https://github.com/nliaudat/floor-heating-controller) by nliaudat — BEMF analysis and trigger calculations for valve motor tachometry
- [Motor Controller Tachometer](https://yyao.ca/projects/motor_controller_tachometer/) by Yi Yao — back-EMF tachometer circuit design

## License

See [LICENSE](LICENSE) file.
