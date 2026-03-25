# Controller Schematic

## Overview

ESP32-S3 Super Mini module with I2C bus (6x DRV8215 motor drivers + expansion),
UART header, 1-Wire bus supporting 8 probes, circulation pump relay output,
and WS2812 RGB status LED. 5 free GPIOs exposed as solder pads for expansion.
Connects to Power and Motor sections. Rev.2 uses only I2C for motor control,
freeing 8 GPIO compared to Rev.1.

## Block Diagram

```
                        HeatValve-6 Rev.2 : Controller
  ┌───────────────────────────────────────────────────────────────────────┐
  │                                                                       │
  │  ◄── VBUS (from Power) ── D_5V (Schottky) ──┐                        │
  │  ◄── 3V3 (from Power) ────────────────┐ │                        │
  │  ◄── GND ─────────────────────────────────┐│ │                        │
  │                                            ││ │                        │
  │            ┌────────────────────────┐      ││ │                        │
  │            │    ESP32-S3 Super Mini │      ││ │                        │
  │            │        (U_ESP)        │      ││ │                        │
  │            │                        │  5V,GND                        │
  │            │  GPIO1  (IPROPI_ADC)←──│←── IPROPI_BUS (from Motor)      │
  │            │  GPIO2  (nSLEEP)  ────>│──→ nSLEEP_ALL (to Motor, 6x)   │
  │            │  GPIO3  (RC_OUT)  <────│←── RC_OUT_ALL (from Motor, 6x)  │
  │            │  GPIO4  (nFAULT)  <────│←── nFAULT_ALL (from Motor, 6x) │
  │            │                        │                                 │
  │            │  GPIO5  (PUMP_CTRL)───>│──R10(10k)─┐  ┌─────────┐       │
  │            │                        │            Q1 │  K1     │       │
  │            │                        │  D1(1N4148)│  │  Relay  │       │
  │            │                        │  VBUS──┬───┘  │COM NO──│─→J_PUMP│
  │            │                        │        └coil──┘         │       │
  │            │                        │                                 │
  │            │  GPIO9  (I2C_SDA) <──>│──┬── R20 (3.3k)── 3V3 ──────>│─→ Motor: 6x DRV8215
  │            │  GPIO8  (I2C_SCL) ───>│──┤── R21 (3.3k)── 3V3  ┌────┐│
  │            │                        │  └─────────────────│J_I2C││
  │            │  GPIO43 (UART TX) ───>│── R18 (470) ── 3V3 │(1x4)││
  │            │  GPIO44 (UART RX) <───│── R19 (470) ── 3V3 └────┘│
  │            │                        │              ┌────────┐   │
  │            │                        │              │ J_UART │   │
  │            │  GPIO10 (1-Wire)  <──>│── R_OW ── 3V3 │ (1x4)  │   │
  │            │                        │    │          └────────┘   │
  │            │                        │    │  C10  D_1W            │
  │            │                        │    │          ┌──────────┐ │
  │            │                        │    └──────────│  J_1W    │ │
  │            │                        │               │ 8 probes │ │
  │            │  GPIO48 (WS2812)  ───>│──→ [RGB LED]  └──────────┘ │
  │            │                        │   (on module)              │
  │            └────────────────────────┘                            │
  │                    C_ESP1/C_ESP2 (decoupling)                    │
  │                                                                  │
  │  Expansion pads (J_EXP): GND, 3V3, GPIO6, GPIO7,               │
  │                           GPIO11, GPIO12, GPIO13                 │
  │                                                                  │
  └───────────────────────────────────────────────────────────────────────┘

  Connections:  ══> Power section (VBUS via D_5V → ESP32 5V, 3V3 from MT2492 for pull-ups, GND)
                ──> Motor section (I2C_SDA, I2C_SCL, nSLEEP_ALL, nFAULT_ALL, IPROPI_ADC)
                ──> Pump relay (K1 via Q1)
                ──> External headers (J_I2C, J_UART, J_1W)
                ──> Expansion pads (J_EXP: 5 GPIO + GND + 3V3)
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
- 3V3 (MT2492) powers I2C pull-ups, UART pull-ups, 1-Wire, nFAULT pull-up, and DRV8215 VM+VCC — NOT the ESP32.
- Module's onboard USB-C remains available for programming/debugging.

### GPIO Assignments

| GPIO | Net | Direction | Function | Section |
|------|-----|-----------|----------|---------|
| GPIO1 | IPROPI_ADC | IN (ADC) | DRV8215 current sense analog input | Motor |
| GPIO2 | nSLEEP_ALL | OUT | Shared nSLEEP for all 6x DRV8215 | Motor |
| GPIO3 | RC_OUT_ALL | IN (INT) | Shared RC_OUT from all 6x pin 3 (DRV8214 ready, NC on DRV8215) | Motor |
| GPIO4 | nFAULT_ALL | IN | Wired-OR nFAULT from all 6x DRV8215 | Motor |
| GPIO8 | I2C_SCL | OUT | I2C Clock (shared bus) | Motor/Ext |
| GPIO9 | I2C_SDA | I/O | I2C Data (shared bus) | Motor/Ext |
| GPIO10 | ONEWIRE | I/O | 1-Wire bus (8 probes) | Controller |
| GPIO5 | PUMP_CTRL | OUT | Circulation pump relay control | Controller |
| GPIO48 | WS2812_DATA | OUT | Status LED data | Controller |

Notes:
- GPIO6, GPIO7, GPIO11, GPIO12, GPIO13 are **freed** — exposed as solder pads for future expansion.
- GPIO3 allocated for RC_OUT_ALL (DRV8214 ripple count). On DRV8215 boards, R9 pull-down holds it LOW.
- GPIO5 drives circulation pump relay via Q1 MOSFET.
- GPIO1 must be ADC-capable (ESP32-S3: ADC1_CH0).

### GPIO Comparison (Rev.1 → Rev.2)

| GPIO | Rev.1 Function | Rev.2 Function | Change |
|------|----------------|----------------|--------|
| GPIO1 | spare | **IPROPI_ADC** | New: analog current sense |
| GPIO2 | MOTOR_MUX | **nSLEEP_ALL** | Repurposed: MUX → shared sleep |
| GPIO3 | MOTOR_ENA1 (nSLEEP #2) | **RC_OUT_ALL** | Repurposed: motor enable → RC_OUT (DRV8214 ready) |
| GPIO4 | MOTOR_ENA2 (nSLEEP #3) | **nFAULT_ALL** | Repurposed: motor enable → fault |
| GPIO5 | MOTOR_DIR2 (IN2) | **PUMP_CTRL** | Repurposed: motor dir → pump relay |
| GPIO6 | MOTOR_DIR1 (IN1) | **FREE** | Freed |
| GPIO7 | TACHO (LMV358 output) | **FREE** | Freed |
| GPIO8 | I2C_SCL | I2C_SCL | Unchanged |
| GPIO9 | I2C_SDA | I2C_SDA | Unchanged |
| GPIO10 | ONEWIRE | ONEWIRE | Unchanged |
| GPIO11 | MOTOR_ENA0 (nSLEEP #1) | **FREE** | Freed |
| GPIO12 | spare | **FREE** | Still free |
| GPIO13 | spare | **FREE** | Still free |
| GPIO48 | WS2812_DATA | WS2812_DATA | Unchanged |

**Result: 5 GPIO freed** (GPIO6-7, GPIO11-13). Exposed as solder pads for future expansion.

## I2C Bus

Shared bus for 6x DRV8215 motor drivers and external expansion.

### I2C Pull-up Resistors

| Ref | Value | Footprint | Net From | Net To | Purpose |
|-----|-------|-----------|----------|--------|---------|
| R20 | 3.3kΩ | R0603 | I2C_SDA | 3V3 | SDA pull-up |
| R21 | 3.3kΩ | R0603 | I2C_SCL | 3V3 | SCL pull-up |

Note: DRV8215 datasheet recommends 2.2kΩ pull-ups on A0/A1 address pins (not needed
when pins are tied directly to GND/VCC or left floating). The I2C bus pull-ups at 3.3kΩ
are adequate for the bus length and capacitance in this design (~30pF total with 6 devices).

### I2C External Header (J_I2C)

Standard 2.54mm pin header for external I2C devices (displays, sensors).

| Pin | Net | Description |
|-----|-----|-------------|
| 1 | GND | Ground |
| 2 | 3V3 | 3.3V supply |
| 3 | I2C_SDA | I2C Data |
| 4 | I2C_SCL | I2C Clock |

Component: 1x4 2.54mm male pin header (C2337)

### I2C Devices on Bus

| Address (7-bit) | Device | Section |
|-----------------|--------|---------|
| 0x30 | DRV8215 #1 (Motor 1) | Motor |
| 0x31 | DRV8215 #2 (Motor 2) | Motor |
| 0x32 | DRV8215 #3 (Motor 3) | Motor |
| 0x33 | DRV8215 #4 (Motor 4) | Motor |
| 0x34 | DRV8215 #5 (Motor 5) | Motor |
| 0x35 | DRV8215 #6 (Motor 6) | Motor |
| (ext) | Display/sensors | External via J_I2C |

Note: INA219 (Rev.1 address 0x40) is **removed** in Rev.2. Address range 0x40-0x4F
is now free for external devices.

## UART Header (J_UART)

Standard 2.54mm pin header for debug/expansion.

| Pin | Net | Description |
|-----|-----|-------------|
| 1 | GND | Ground |
| 2 | 3V3 | 3.3V supply |
| 3 | TX (GPIO43) | UART TX |
| 4 | RX (GPIO44) | UART RX |

Component: 1x4 2.54mm male pin header (C2337)

### UART Pull-up Resistors

| Ref | Value | Footprint | Net From | Net To | Purpose |
|-----|-------|-----------|----------|--------|---------|
| R18 | 470Ω | R0603 | UART_TX | 3V3 | TX pull-up |
| R19 | 470Ω | R0603 | UART_RX | 3V3 | RX pull-up |

## 1-Wire Bus (8-Probe Support)

Single 1-Wire bus on GPIO10 with support for 8 Dallas temperature probes.
Each probe needs 3 wires: GND, DATA (1-Wire), VCC (3V3).

### 1-Wire Pull-up

| Ref | Value | Footprint | Net From | Net To | Purpose |
|-----|-------|-----------|----------|--------|---------|
| R_OW | 4.7kΩ | R0603 | ONEWIRE | 3V3 | 1-Wire bus pull-up |

### 1-Wire Connectors (J_1W_A / J_1W_B / J_1W_C)

3× KF350-3P screw terminals (3.5mm pitch). All probes share the same 1-Wire bus —
each terminal provides parallel GND, DATA, VCC for 2-3 probes.

| Ref | Positions | Probes | Pin 1 | Pin 2 | Pin 3 |
|-----|-----------|--------|-------|-------|-------|
| J_1W_A | 3-pin | Probe 1-3 | GND | ONEWIRE | 3V3 |
| J_1W_B | 3-pin | Probe 4-6 | GND | ONEWIRE | 3V3 |
| J_1W_C | 3-pin | Probe 7-8 + spare | GND | ONEWIRE | 3V3 |

All GND, ONEWIRE, and 3V3 pins are connected in parallel on the PCB.
Multiple probe wires can be twisted together and clamped in a single screw position.

| Ref | Component | Footprint | Qty | Purpose |
|-----|-----------|-----------|-----|---------|
| J_1W_A | KF350-3P | 3.5mm pitch, 3-pin | 1 | Probe 1-3 |
| J_1W_B | KF350-3P | 3.5mm pitch, 3-pin | 1 | Probe 4-6 |
| J_1W_C | KF350-3P | 3.5mm pitch, 3-pin | 1 | Probe 7-8 + spare |

### 1-Wire Decoupling

| Ref | Value | Footprint | Net From | Net To | Purpose |
|-----|-------|-----------|----------|--------|---------|
| C10 | 100nF | C0603 | 3V3 (at J_1W) | GND | 1-Wire power decoupling |

### 1-Wire ESD Protection (optional)

| Ref | Value | Footprint | Net From | Net To | Purpose |
|-----|-------|-----------|----------|--------|---------|
| D_1W | TVS diode | SOD-323 | ONEWIRE | GND | ESD protection for long cable runs |

Notes:
- All 8 probes share the single 1-Wire bus (each DS18B20 has unique ROM ID)
- Maximum cable length ~50m with proper pull-up (4.7kΩ at 3.3V)
- For cable runs >10m, consider lowering R_OW to 2.2kΩ or adding active pull-up
- 100nF decoupling at connector prevents noise injection from probe cables

## Circulation Pump Output

GPIO5 drives a 5V relay via N-channel MOSFET for on/off control of the circulation pump.
Relay provides galvanic isolation — no mains voltage on the PCB.

### Circuit

```
 GPIO5 ──┬── Q1 Gate (2N7002)      K1 Relay
         │                          ┌─────────┐
       R10(10kΩ)                    │ ┌─┐     │
         │          Q1 Drain ──────→│ │ │coil  │──→ VBUS (5V)
        GND         Q1 Source ─→ GND│ └─┘     │
                                    │  ↑ D1   │
                    D1 anode ──────→│  │flyback│
                    D1 cathode ────→│──┘      │
                                    │         │
                                    │ COM ●───│──→ J_PUMP pin 1
                                    │ NO  ●───│──→ J_PUMP pin 2
                                    └─────────┘
```

### Components

| Ref | Value | Footprint | Net From | Net To | Purpose |
|-----|-------|-----------|----------|--------|---------|
| Q1 | 2N7002 (N-ch MOSFET) | SOT-23 | GPIO5 (gate) | K1 coil (drain) | Low-side relay driver |
| R10 | 10kΩ | R0603 | Q1 gate | GND | Gate pull-down — keeps pump OFF during ESP32 boot/reset |
| D1 | 1N4148 | SOD-323 | Q1 drain (anode) | VBUS (cathode) | Flyback protection for relay coil |
| K1 | 5V SPST-NO relay | Through-hole | VBUS → coil → Q1 drain | COM/NO → J_PUMP | Pump switching (galvanic isolation) |
| J_PUMP | KF350-2P screw terminal | 3.5mm pitch, 2-pin | K1 COM | K1 NO | Pump wire connection (dry contact) |

Notes:
- 2N7002 Vgs(th) ~1.0–2.5V — fully on at 3.3V GPIO drive. Rdson ~2Ω at Vgs=2.5V.
- Relay coil current 40mA from VBUS (5V). Well within 2N7002's 300mA rating.
- R10 pull-down ensures relay stays OFF while ESP32 GPIO is floating (boot, deep sleep, reset).
- D1 clamps inductive kickback from relay coil when Q1 turns off.
- J_PUMP (KF350-2P) provides dry contact output (COM + NO) — screw pump wires directly in.
- For 230V AC pumps: wire through external contactor or use relay contacts directly (check relay rating).
- Relay contacts (G5NB-1A-E-DC5V) rated 5A/250VAC. Keep creepage/clearance and safety rules for mains wiring.

### Relay Selection

| Parameter | Value |
|-----------|-------|
| Part | G5NB-1A-E-DC5V (OMRON) |
| LCSC | C48746 |
| Coil voltage | 5VDC |
| Coil resistance | 125Ω (40mA, 200mW) |
| Contact config | SPST-NO |
| Contact rating | 5A/250VAC |
| Footprint | Through-hole, 20.4 × 7mm |
| Certifications | UL/CSA/VDE, EN61010 reinforced insulation |

## GPIO Expansion Pads

Unpopulated solder pads exposing 5 free GPIOs plus power for future use.
Pads are 2.54mm pitch, compatible with standard pin headers if needed later.

### Pad Layout

| Pad | Net | Description |
|-----|-----|-------------|
| 1 | GND | Ground |
| 2 | 3V3 | 3.3V supply |
| 3 | GPIO6 | Free GPIO (ADC/touch capable) |
| 4 | GPIO7 | Free GPIO (ADC/touch capable) |
| 5 | GPIO11 | Free GPIO |
| 6 | GPIO12 | Free GPIO |
| 7 | GPIO13 | Free GPIO |

Notes:
- Solder pads only — no headers populated. Solder wires or pin headers as needed.
- All GPIOs are directly connected to ESP32-S3 with no series resistors or protection.
- Possible uses: I2C display, extra sensors, external buttons, analog input, PWM output.
- GND + 3V3 pads provide power for whatever is connected.

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

## 3V3 Local Decoupling

| Ref | Value | Footprint | Net From | Net To | Purpose |
|-----|-------|-----------|----------|--------|---------|
| C_ESP1 | 100nF | C0603 | 3V3 (controller area) | GND | HF decoupling for I2C/UART/1-Wire pull-ups |
| C_ESP2 | 10µF | C0603 | 3V3 (controller area) | GND | Bulk decoupling for local 3V3 loads |

Note: ESP32 module has its own onboard decoupling on 5V input and internal 3.3V rail.
3V3 is supplied by the MT2492 buck converter (single rail for all 3.3V loads).

## Connections to Other Sections

### → Power Section
- VBUS → D_5V → ESP32 5V pin (module power)
- 3V3 (I2C/UART/1-Wire pull-ups, nFAULT pull-up, DRV8215 VM+VCC, local decoupling)
- GND

### → Motor Section (via I2C + 4 GPIO)
- I2C_SDA (GPIO9) ↔ 6x DRV8215 SDA pins
- I2C_SCL (GPIO8) → 6x DRV8215 SCL pins
- nSLEEP_ALL (GPIO2) → 6x DRV8215 nSLEEP pins (shared wake/sleep)
- RC_OUT_ALL (GPIO3) ← 6x DRV8215 pin 3 (wire-OR, DRV8214 ripple count ready)
- nFAULT_ALL (GPIO4) ← 6x DRV8215 nFAULT pins (wired-OR, open-drain)
- IPROPI_ADC (GPIO1) ← shared R7 voltage (analog current sense)

### → Pump
- PUMP_CTRL (GPIO5) → Q1 gate → K1 relay → J_PUMP screw terminal (dry contact)

### → Expansion Pads (J_EXP)
- 5 free GPIOs (GPIO6, GPIO7, GPIO11, GPIO12, GPIO13) + GND + 3V3
- Unpopulated solder pads — solder headers or wires as needed

## BOM Summary (Controller Section)

| Ref | Component | Value | Footprint | LCSC | Category |
|-----|-----------|-------|-----------|------|----------|
| U_ESP | ESP32-S3 Super Mini | Module | - | - | Manual |
| D_5V | Schottky diode | SS14 (1A/40V) | SMA (DO-214AC) | C2480 | Basic |
| Q1 | N-ch MOSFET | 2N7002 | SOT-23 | C8545 | Basic |
| R10 | Resistor | 10kΩ | R0603 | C25804 | Basic |
| R18 | Resistor | 470Ω | R0603 | C23179 | Basic |
| R19 | Resistor | 470Ω | R0603 | C23179 | Basic |
| R20 | Resistor | 3.3kΩ | R0603 | TBD | Basic |
| R21 | Resistor | 3.3kΩ | R0603 | TBD | Basic |
| R_OW | Resistor | 4.7kΩ | R0603 | C23162 | Basic |
| D1 | Switching diode | 1N4148 | SOD-323 | C81598 | Basic |
| C10 | Ceramic cap | 100nF | C0603 | C14663 | Basic |
| C_ESP1 | Ceramic cap | 100nF | C0603 | C14663 | Basic |
| C_ESP2 | Ceramic cap | 10µF | C0603 | TBD | Basic |
| D_1W | TVS diode (opt) | PESD1CAN | SOD-323 | TBD | TBD |
| K1 | Relay | G5NB-1A-E-DC5V (OMRON) | TH 20.4×7mm | C48746 | Basic |
| J_I2C | Pin header | 1x4 | 2.54mm | C2337 | Basic |
| J_UART | Pin header | 1x4 | 2.54mm | C2337 | Basic |
| J_PUMP | Screw terminal | KF350-3.5-2P | 3.5mm pitch | C474892 | Basic |
| J_1W_A | Screw terminal | KF350-3.5-3P | 3.5mm pitch | C474893 | Basic |
| J_1W_B | Screw terminal | KF350-3.5-3P | 3.5mm pitch | C474893 | Basic |
| J_1W_C | Screw terminal | KF350-3.5-3P | 3.5mm pitch | C474893 | Basic |
| J_EXP | Solder pads | 7-pad | 2.54mm | - | PCB |
