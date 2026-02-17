# Controller Schematic

## Overview

ESP32-S3 Super Mini module with I2C bus, UART header, 1-Wire bus supporting 8 probes,
and WS2812 RGB status LED. Connects to Power, Analog, and Motor sections.

## Block Diagram

```
                        HeatValve-6 : Controller
  ┌───────────────────────────────────────────────────────────────────────┐
  │                                                                       │
  │  ◄── VBUS (from Power) ── D_5V (Schottky) ──┐                        │
  │  ◄── 3V3_LOG (from Power) ────────────────┐ │                        │
  │  ◄── GND ─────────────────────────────────┐│ │                        │
  │                                            ││ │                        │
  │            ┌────────────────────────┐      ││ │                        │
  │            │    ESP32-S3 Super Mini │      ││ │                        │
  │            │        (U_ESP)        │      ││ │                        │
  │            │                        │  5V,GND                        │
  │            │  GPIO2  (MUX)     ────>│────────────────────────────────>│─→ Motor: MUX
  │            │  GPIO11 (ENA0)    ────>│────────────────────────────────>│─→ Motor: nSLEEP #1
  │            │  GPIO3  (ENA1)    ────>│────────────────────────────────>│─→ Motor: nSLEEP #2
  │            │  GPIO4  (ENA2)    ────>│────────────────────────────────>│─→ Motor: nSLEEP #3
  │            │  GPIO6  (DIR1)    ────>│────────────────────────────────>│─→ Motor: IN1
  │            │  GPIO5  (DIR2)    ────>│────────────────────────────────>│─→ Motor: IN2
  │            │  GPIO7  (TACHO)   <────│<───────────────────────────────<│─← Analog: TACHO (U5)
  │            │                        │                                 │
  │            │  GPIO9  (I2C_SDA) <──>│──┬── R20 (4.7k)── 3V3 ────────────>│─→ Analog: INA219
  │            │  GPIO8  (I2C_SCL) ───>│──┤── R21 (4.7k)── 3V3   ┌────────┐  │
  │            │                        │  └────────────────│ J_I2C  │  │
  │            │  GPIO43 (UART TX) ───>│── R18 (470) ── 3V3 ─┐   │ (1x4)  │  │
  │            │  GPIO44 (UART RX) <───│── R19 (470) ── 3V3  │   └────────┘  │
  │            │                        │              │   ┌────────┐   │
  │            │                        │              └───│ J_UART │   │
  │            │  GPIO10 (1-Wire)  <──>│── R_OW ── 3V3     │ (1x4)  │   │
  │            │                        │    │             └────────┘   │
  │            │                        │    │  C10  D_1W               │
  │            │                        │    │             ┌──────────┐ │
  │            │                        │    └─────────────│  J_1W    │ │
  │            │                        │                  │ 8 probes │ │
  │            │  GPIO48 (WS2812)  ───>│──→ [RGB LED]     └──────────┘ │
  │            │                        │   (on module)                 │
  │            └────────────────────────┘                               │
  │                    C_ESP1/C_ESP2 (decoupling)                       │
  │                                                                     │
  └───────────────────────────────────────────────────────────────────────┘

  Connections:  ══> Power section (VBUS via D_5V → ESP32 5V, 3V3_LOG for pull-ups, GND)
                ──> Motor section (MUX, DIR1/2, ENA0-2)
                <── Analog section (TACHO from U5)
                ──> Analog section (I2C_SDA, I2C_SCL)
                ──> External headers (J_I2C, J_UART, J_1W)
```

## ESP32-S3 Super Mini Module (U_ESP)

The ESP32-S3 Super Mini is a pre-built module with onboard USB-C, antenna, flash,
PSRAM, and 3.3V regulator. Powered via 5V pin through a Schottky diode from VBUS.

### Module Power

| Pin | Net | Connection |
|-----|-----|------------|
| 5V | VBUS_ESP | ← VBUS via D_5V Schottky diode (~4.7V) |
| 3V3 | - | NOT connected externally (module's onboard LDO generates 3.3V from 5V pin) |
| GND | GND | Ground plane |

### Backfeed Protection Diode

| Ref | Value | Footprint | Net From | Net To | Purpose |
|-----|-------|-----------|----------|--------|---------|
| D_5V | SS14 (1A/40V Schottky) | SMA (DO-214AC) | VBUS | VBUS_ESP (ESP32 5V pin) | Prevents backfeed when module USB-C is connected for programming |

Notes:
- D_5V Schottky diode (~0.3V drop at 200mA) isolates board VBUS from module's onboard USB.
- When both USBs are connected, current cannot flow between the two 5V sources.
- Module's onboard LDO (typically ME6211, min Vin ~3.5V) works fine at ~4.7V.
- 1A rating sufficient for ESP32-S3 peak consumption (~350mA WiFi burst).
- 3V3_LOG (AMS1117) powers I2C pull-ups, UART pull-ups, 1-Wire, and INA219/LMV358 — NOT the ESP32.
- Module's onboard USB-C remains available for programming/debugging.

### GPIO Assignments

| GPIO | Net | Direction | Function | Section |
|------|-----|-----------|----------|---------|
| GPIO2 | MOTOR_MUX | OUT | Mux: HIGH=N1 (odd), LOW=N2 (even) | Motor |
| GPIO3 | MOTOR_ENA1 | OUT | DRV8837 #2 nSLEEP (Motor 3+4) | Motor |
| GPIO4 | MOTOR_ENA2 | OUT | DRV8837 #3 nSLEEP (Motor 5+6) | Motor |
| GPIO5 | MOTOR_DIR2 | OUT | IN2 on all DRV8837 (direction) | Motor |
| GPIO6 | MOTOR_DIR1 | OUT | IN1 on all DRV8837 (direction) | Motor |
| GPIO7 | TACHO | IN | Tacho input (software inverted) | Analog |
| GPIO8 | I2C_SCL | OUT | I2C Clock (shared bus) | Analog/Ext |
| GPIO9 | I2C_SDA | I/O | I2C Data (shared bus) | Analog/Ext |
| GPIO10 | ONEWIRE | I/O | 1-Wire bus (8 probes) | Controller |
| GPIO11 | MOTOR_ENA0 | OUT | DRV8837 #1 nSLEEP (Motor 1+2) | Motor |
| GPIO48 | WS2812_DATA | OUT | Status LED data | Controller |

Notes:
- GPIO3 is a strapping pin (boot mode). Pull-up/down may be needed for reliable boot.
  DRV8837 nSLEEP has internal pull-down, which keeps GPIO3 LOW at boot (OK for ESP32-S3).
- GPIO1, GPIO12, GPIO13 are spare — available for expansion header or future use.

## Tacho Input (GPIO7)

TACHO signal from [Analog § Tacho from MCOM](analog.md#tacho-from-mcom) (U5 LMV358 OUTB → R22 330Ω + C23 100nF). The series filter is in the **analog section** (R22/C23), so the TACHO net arrives pre-filtered at GPIO7.

f_c = 1/(2π × 330Ω × 100nF) ≈ **4.8 kHz** — well above tacho frequency (~1–200 Hz).

Notes:
- ESPHome GPIO config uses `inverted: true` for tacho input
- No hardware inverter needed (software inverted)
- Filter components R22/C23 are documented in [Analog § Component list](analog.md#component-list-tacho-conditioning)

## I2C Bus

Shared bus for INA219 (analog section) and external expansion.

### I2C Pull-up Resistors

| Ref | Value | Footprint | Net From | Net To | Purpose |
|-----|-------|-----------|----------|--------|---------|
| R20 | 4.7kΩ | R0603 | I2C_SDA | 3V3_LOG | SDA pull-up |
| R21 | 4.7kΩ | R0603 | I2C_SCL | 3V3_LOG | SCL pull-up |

### I2C External Header (J_I2C)

Standard 2.54mm pin header for external I2C devices (displays, sensors).

| Pin | Net | Description |
|-----|-----|-------------|
| 1 | GND | Ground |
| 2 | 3V3_LOG | 3.3V supply |
| 3 | I2C_SDA | I2C Data |
| 4 | I2C_SCL | I2C Clock |

Component: 1x4 2.54mm male pin header (C2337)

### I2C Devices on Bus

| Address | Device | Section |
|---------|--------|---------|
| 0x40 | INA219 | Analog |
| (ext) | Display/sensors | External via J_I2C |

## UART Header (J_UART)

Standard 2.54mm pin header for debug/expansion.

| Pin | Net | Description |
|-----|-----|-------------|
| 1 | GND | Ground |
| 2 | 3V3_LOG | 3.3V supply |
| 3 | TX (GPIO43) | UART TX |
| 4 | RX (GPIO44) | UART RX |

Component: 1x4 2.54mm male pin header (C2337)

### UART Pull-up Resistors

| Ref | Value | Footprint | Net From | Net To | Purpose |
|-----|-------|-----------|----------|--------|---------|
| R18 | 470Ω | R0603 | UART_TX | 3V3_LOG | TX pull-up |
| R19 | 470Ω | R0603 | UART_RX | 3V3_LOG | RX pull-up |

## 1-Wire Bus (8-Probe Support)

Single 1-Wire bus on GPIO10 with support for 8 Dallas temperature probes.
Each probe needs 3 wires: GND, DATA (1-Wire), VCC (3V3_LOG).

### 1-Wire Pull-up

| Ref | Value | Footprint | Net From | Net To | Purpose |
|-----|-------|-----------|----------|--------|---------|
| R_OW | 4.7kΩ | R0603 | ONEWIRE | 3V3_LOG | 1-Wire bus pull-up |

### 1-Wire Connector (J_1W)

2x12 pin header (2.54mm) providing 8 probe connections with shared power.

```
Pin layout (2x12 header, top view):
 ┌──────────────────────────────────────────────┐
 │ GND  GND  GND  GND  GND  GND  GND  GND  GND │  Row 1 (odd pins 1-17, first 9)
 │ 1W   1W   1W   1W   1W   1W   1W   1W   3V3 │  Row 2 (even pins 2-18)
 └──────────────────────────────────────────────┘
    P1   P2   P3   P4   P5   P6   P7   P8  PWR
```

Alternatively, use a **3-row header approach** (simplest wiring per probe):

### Option A: 3x 1x9 pin headers (recommended)

Three parallel rows of 9 pins each:

| Row | Net | Pins | Description |
|-----|-----|------|-------------|
| Row 1 | GND | 9 pins | Ground for each probe + 1 spare |
| Row 2 | ONEWIRE | 9 pins | 1-Wire data for each probe + 1 spare |
| Row 3 | 3V3_LOG | 9 pins | Power for each probe + 1 spare |

Each probe connects to 3 vertically aligned pins (GND, DATA, VCC).
This enables direct plug-in of standard 3-pin 1-Wire probe cables.

| Ref | Component | Footprint | Qty | Purpose |
|-----|-----------|-----------|-----|---------|
| J_1W_GND | 1x9 pin header | 2.54mm | 1 | GND row |
| J_1W_DATA | 1x9 pin header | 2.54mm | 1 | 1-Wire data row |
| J_1W_VCC | 1x9 pin header | 2.54mm | 1 | 3V3 power row |

### Option B: 3-pin screw terminals / JST-XH

8x JST-XH 3-pin connectors (polarized, harder to misconnect):

| Ref | Component | Footprint | Qty | Purpose |
|-----|-----------|-----------|-----|---------|
| J_1W_1..8 | JST-XH 3-pin | B3B-XH-A | 8 | Per-probe connector |

Note: Option B uses more board space but is more robust for field wiring.

### 1-Wire Decoupling

| Ref | Value | Footprint | Net From | Net To | Purpose |
|-----|-------|-----------|----------|--------|---------|
| C10 | 100nF | C0603 | 3V3_LOG (at J_1W) | GND | 1-Wire power decoupling |

### 1-Wire ESD Protection (optional)

| Ref | Value | Footprint | Net From | Net To | Purpose |
|-----|-------|-----------|----------|--------|---------|
| D_1W | TVS diode | SOD-323 | ONEWIRE | GND | ESD protection for long cable runs |

Notes:
- All 8 probes share the single 1-Wire bus (each DS18B20 has unique ROM ID)
- Maximum cable length ~50m with proper pull-up (4.7kΩ at 3.3V)
- For cable runs >10m, consider lowering R_OW to 2.2kΩ or adding active pull-up
- 100nF decoupling at connector prevents noise injection from probe cables

## WS2812 Status LED

On-module WS2812 connected to GPIO48. No external components needed.

### Status LED Color Codes

| Color | Pattern | Meaning |
|-------|---------|---------|
| Green | Solid | Normal, connected to HA |
| Green | Breathing | Standalone mode |
| Blue | Flashing | Booting / WiFi connecting |
| Cyan | Solid | Motor running |
| Yellow | Solid | Warning (sensor offline) |
| Orange | Flashing | No 1-Wire sensors |
| Red | Solid | Error (API disconnected) |
| Red | Flashing | Critical (stall/overcurrent) |
| Purple | Solid | Calibration in progress |
| White | Flash | Command received |

## 3V3_LOG Local Decoupling

| Ref | Value | Footprint | Net From | Net To | Purpose |
|-----|-------|-----------|----------|--------|---------|
| C_ESP1 | 100nF | C0603 | 3V3_LOG (controller area) | GND | HF decoupling for I2C/UART/1-Wire pull-ups |
| C_ESP2 | 10µF | C0603 | 3V3_LOG (controller area) | GND | Bulk decoupling for local 3V3_LOG loads |

Note: ESP32 module has its own onboard decoupling on 5V input and internal 3.3V rail.

## Connections to Other Sections

### → Power Section
- VBUS → D_5V → ESP32 5V pin (module power)
- 3V3_LOG (I2C/UART/1-Wire pull-ups, local decoupling)
- GND

### → Motor Section
- MOTOR_MUX (GPIO2)
- MOTOR_DIR1 (GPIO6)
- MOTOR_DIR2 (GPIO5)
- MOTOR_ENA0 (GPIO11)
- MOTOR_ENA1 (GPIO3)
- MOTOR_ENA2 (GPIO4)

### → Analog Section
- TACHO (GPIO7) ← from U5.OUTB via R22/C23 (software inverted)
- I2C_SDA (GPIO9)
- I2C_SCL (GPIO8)

## BOM Summary (Controller Section)

| Ref | Component | Value | Footprint | LCSC | Category |
|-----|-----------|-------|-----------|------|----------|
| U_ESP | ESP32-S3 Super Mini | Module | - | - | Manual |
| D_5V | Schottky diode | SS14 (1A/40V) | SMA (DO-214AC) | C2480 | Basic |
| R18 | Resistor | 470Ω | R0603 | C23179 | Basic |
| R19 | Resistor | 470Ω | R0603 | C23179 | Basic |
| R20 | Resistor | 4.7kΩ | R0603 | C23162 | Basic |
| R21 | Resistor | 4.7kΩ | R0603 | C23162 | Basic |
| R_OW | Resistor | 4.7kΩ | R0603 | C23162 | Basic |
| C10 | Ceramic cap | 100nF | C0603 | C14663 | Basic |
| C_ESP1 | Ceramic cap | 100nF | C0603 | C14663 | Basic |
| C_ESP2 | Ceramic cap | 10µF | C0603 | TBD | Basic |
| D_1W | TVS diode (opt) | PESD1CAN | SOD-323 | TBD | TBD |
| J_I2C | Pin header | 1x4 | 2.54mm | C2337 | Basic |
| J_UART | Pin header | 1x4 | 2.54mm | C2337 | Basic |
| J_1W_GND | Pin header | 1x9 | 2.54mm | TBD | Basic |
| J_1W_DATA | Pin header | 1x9 | 2.54mm | TBD | Basic |
| J_1W_VCC | Pin header | 1x9 | 2.54mm | TBD | Basic |
