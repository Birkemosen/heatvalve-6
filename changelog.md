# Changelog

## v1.0.1 — Power & Docs Update (2026-02-13)

### Hardware
- ESP32 powered via 5V pin (VBUS) through SS14 Schottky diode for backfeed protection
- AMS1117 (3V3_LOG) now powers analog/peripherals only, not ESP32
- Added D_5V (SS14, 1A/40V, SMA) to BOM

### Documentation
- Updated power architecture: three independent paths (ESP32, 3V3_MOT, 3V3_LOG)
- Updated README GPIO table to match current design

---

## v1.0.0 — Initial Release (2026-02-13)

Complete redesign of HeatValve-6 floor heating valve controller.

### Hardware
- ESP32-S3 Super Mini with 3x DRV8837 H-bridge motor drivers
- 6 valve channels via GAQY212GSX optocoupler multiplexing (odd/even)
- MUX inverter: SN74LVC1G04DBVR (U10)
- INA219 high-side current sense (I2C, 0x40, 100mΩ shunt on MCOM)
- LMV358 dual op-amp tacho conditioning (non-inverting amplifier + Schmitt trigger)
- Tuning pads (R12_ALT, R_REF2_ALT) for prototype tacho calibration
- MT2492 3.3V step-down (3V3_MOT), AMS1117-3.3V LDO (3V3_LOG)
- USB-C power input with 220µF bulk capacitor
- Dallas 1-Wire temperature sensors (8 probes)
- WS2812 status LED with color-coded states
- RJ11/RJ10 connectors, HmIP-VDMOT compatible (pin 1 + pin 3)

### GPIO Assignment
| GPIO | Function |
|------|----------|
| GPIO2 | Motor MUX |
| GPIO3 | ENA1 (DRV #2 nSLEEP) |
| GPIO4 | ENA2 (DRV #3 nSLEEP) |
| GPIO5 | DIR2 (IN2) |
| GPIO6 | DIR1 (IN1) |
| GPIO7 | Tacho (LMV358 output) |
| GPIO8 | I2C SCL |
| GPIO9 | I2C SDA |
| GPIO10 | 1-Wire |
| GPIO11 | ENA0 (DRV #1 nSLEEP) |
| GPIO48 | WS2812 LED |
| GPIO1, 12, 13 | Spare |

### Software
- ESPHome-based firmware with modular YAML architecture
- 4 control profiles: Tanh, Linear, PID, Remote
- Current-based endstop detection with adaptive mean learning
- IIR low-pass filtered current measurement (INA219)
- Tacho revolution counting via LMV358 Schmitt trigger
- Hydraulic balancing mode
- Standalone operation with WS2812 status indication

### Documentation
- Full schematic documentation (analog, motor, controller, power)
- Net naming convention: M1+..M6+, MNODD, MNEVEN, MCOM
- CC BY-NC-SA 4.0 license
