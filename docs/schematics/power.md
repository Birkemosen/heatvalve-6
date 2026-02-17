# Power Supply Schematic

## Overview

USB-C input with 2× 5.1kΩ on CC1/CC2 to GND (sink signature). Delivers 5V from any USB-C source (PD or non-PD) without a PD controller.
Dual 3.3V rails: switching (motor) and linear (logic) for noise isolation.
LED on 3V3_MOT (motor rail power indicator). 3V3_LOG/ESP32 power indicated by ESP32 module LEDs.

## Block Diagram

```
                          HeatValve-6 : Power Supply
  ┌─────────────────────────────────────────────────────────────────────┐
  │                                                                     │
  │  USB-C (J1)  CC1,CC2 ──→ R_CC1,R_CC2 (5.1k to GND)                  │
  │       VBUS ───────────────┬──→ C19,C21 ──────┬──→ MT2492 (U3) ──→ 3V3_MOT ══> Motor Section
  │                           │                  │    (Sync Buck)   │   (3.3V)
  │                           │                  │    C5,C6 L1 C7,C8 │  LED_MOT
  │                           │                  │    R6,R7 (FB)    │  R_LED_MOT
  │                           │                  └──→ C1,C2 ──→ AMS1117 (U2) ──→ C3,C4 ──→ 3V3_LOG ══> Controller
  │                           │                       (Linear)    (3.3V, ESP32 LEDs)
  │  GND ═══════════════════════════════════════════════════════════════╧══════> GND plane
  │                                                                     │
  └─────────────────────────────────────────────────────────────────────┘

  Signal flow: USB-C (5V) → VBUS → MT2492 → 3V3_MOT (motors)
                                    → AMS1117 → 3V3_LOG (logic/analog)
```

## Power Rails

| Rail | Voltage | Source | Purpose |
|------|---------|--------|---------|
| VBUS | 5V | USB-C (J1) direct | Main input rail |
| 3V3_MOT | 3.3V | MT2492 (synchronous switching) | Motor drivers, optocouplers |
| 3V3_LOG | 3.3V | AMS1117 (linear) | ESP32, INA219, I2C, 1-Wire |

## Net List

### USB-C Connector (J1)

| Pin | Net | Description |
|-----|-----|-------------|
| VBUS | VBUS | USB 5V power |
| CC1 | CC1 | Configuration channel 1 |
| CC2 | CC2 | Configuration channel 2 |
| D+  | D+ | USB data (to ESP32 via module) |
| D-  | D- | USB data (to ESP32 via module) |
| GND | GND | Ground |
| SHIELD | GND | Shield to ground |

Component: GT-USB-7010ASV (C2988369) or DEALON USB-TYPE-C-006 (C2927026) for 6-pin power-only.

### USB-C Sink Signature (CC pull-down)

| Ref | Value | Footprint | Net From | Net To | Purpose |
|-----|-------|-----------|----------|--------|---------|
| R_CC1 | 5.1kΩ | R0603 | CC1 (J1) | GND | Sink signature; source supplies 5V |
| R_CC2 | 5.1kΩ | R0603 | CC2 (J1) | GND | Sink signature (both CC for plug orientation) |

Notes:
- 2× 5.1kΩ (Ra per USB Type-C) identifies the board as a 5V sink. Works with PD and non-PD sources; PD sources default to 5V when no PD negotiation occurs.
- D+/D- on J1 can be NC for power-only use.

### USB-C Input Filter

| Ref | Value | Footprint | Net From | Net To | Purpose |
|-----|-------|-----------|----------|--------|---------|
| C21 | 100nF | C0603 | VBUS | GND | VBUS HF decoupling near connector |

### MT2492 Synchronous Switching Regulator - 3V3_MOT (U3)

Signal flow: **+5V → IN (5)** (with 10µF); **EN (4)** via 100kΩ to +5V; **BS (1) – 22nF – SW (6)**; **SW (6) → L1 (4.7µH) → 22µF + 22µF → 3V3_MOT**; **FB (3)**: R6 (115kΩ) from 3V3 to FB, R7 (25.5kΩ) from FB to GND.

| Pin | Net | Component/Connection |
|-----|-----|---------------------|
| 1 (BS) | BS | ← 22nF (C6) to SW (6) |
| 2 (GND) | GND | Ground |
| 3 (FB) | FB_MOT | R6 (115kΩ) ← 3V3_MOT; R7 (25.5kΩ) → GND |
| 4 (EN) | EN | ← VBUS via R8 (100kΩ) |
| 5 (IN) | VBUS | Input supply; 10µF (C5) to GND |
| 6 (SW) | SW | → L1 (4.7µH) → 3V3_MOT (C7, C8 output) |

Component: MT2492, SOT-23-6 ([C89358](https://www.lcsc.com/datasheet/C89358.pdf)), XI'AN Aerosemi Tech

Key specs:
- Input: 4.5V - 16V
- Output: 2A max
- Switching frequency: 600kHz
- Efficiency: up to 96%
- Synchronous rectification (no external Schottky diode needed)
- PWM/PFM auto-mode switching
- Overcurrent protection with hiccup mode
- Thermal shutdown

### MT2492 Support Components

| Ref | Value | Footprint | Net From | Net To | Purpose |
|-----|-------|-----------|----------|--------|---------|
| C5 | 10µF | C0603 | VBUS (U3.5 IN) | GND | Input decoupling |
| C6 | 22nF | C0603 | BS (U3.1) | SW (U3.6) | Bootstrap cap |
| C7 | 22µF | C0805 | 3V3_MOT | GND | Output bulk |
| C8 | 22µF | C0805 | 3V3_MOT | GND | Output bulk |
| L1 | 4.7µH | 4x4mm or 6x6mm | SW (U3.6) | 3V3_MOT | Buck inductor (≥2A sat) |
| R6 | 115kΩ | R0603 | 3V3_MOT | FB_MOT (U3.3) | Feedback upper |
| R7 | 25.5kΩ | R0603 | FB_MOT (U3.3) | GND | Feedback lower |
| R8 | 100kΩ | R0603 | VBUS | EN (U3.4) | Enable pull-up |

Notes:
- **No Schottky diode needed** – MT2492 has internal synchronous MOSFET.
- Feedback: Vout = 0.6V × (1 + R6/R7) → 115k / 25.5k ≈ 3.31V.
- Bootstrap C6: 22nF between BS (1) and SW (6).
- L1: 4.7µH, ≥2A saturation current, low DCR.
  Recommended: Würth 744043004R7 (4x4mm, 2.4A, Aisler Lovely Library compatible)
  Alternative: Sunlord SWPA4030S4R7MT (4x3mm, 2A) or SWPA6045S4R7MT (6x6mm, 3A)

### AMS1117-3.3 Linear Regulator - 3V3_LOG (U2)

Signal flow: **5V (VBUS) → C1 (10µF) → C2 (100nF) → VIN (pin 3)**; **VOUT (pin 4/TAB) → C3 (100nF) → C4 (22µF) → 3V3_LOG**. No series diode needed (USB-C is polarized).

| Pin | Net | Component/Connection |
|-----|-----|---------------------|
| 1 (GND/ADJ) | GND | Ground |
| 2 (VOUT) | 3V3_LOG | Regulated output |
| 3 (VIN) | VBUS | From VBUS via C1, C2 (input filter) |
| 4 (TAB) | 3V3_LOG | Tab connected to output |

Component: AMS1117-3.3, SOT-223 (C6186, Basic)

### AMS1117 Input Capacitors

| Ref | Value | Footprint | Net From | Net To | Purpose |
|-----|-------|-----------|----------|--------|---------|
| C1 | 10µF | C0603 | VBUS (U2.3) | GND | Input bulk |
| C2 | 100nF | C0603 | VBUS (U2.3) | GND | Input HF decoupling |

### AMS1117 Output Capacitors

| Ref | Value | Footprint | Net From | Net To | Purpose |
|-----|-------|-----------|----------|--------|---------|
| C3 | 100nF | C0603 | 3V3_LOG (U2.2/4) | GND | Output HF decoupling |
| C4 | 22µF | C0805 | 3V3_LOG (U2.2/4) | GND | Output stability |

### Bulk Input Capacitor

| Ref | Value | Footprint | Net From | Net To | Purpose |
|-----|-------|-----------|----------|--------|---------|
| C19 | 220µF | SMD electrolytic 6.3mm | VBUS | GND | Bulk storage |

Notes:
- 220µF bulk + existing ceramics (C1 10µF, C5 10µF, C21 100nF) = ~240µF total on VBUS.
- Sufficient for motor startup transients (300mA peak) and ESP32 WiFi bursts (~350mA).
- MT2492 responds within ~10µs (600kHz switching): ΔV = 0.5A × 10µs / 240µF ≈ 21mV ripple.
- No separate bulk needed on 3V3_MOT — output ceramics C7+C8 (2×22µF = 44µF) are adequate.
- 220µF avoids USB-C inrush issues (940µF could trip some USB sources on plug-in).

### Motor rail power LED (3V3_MOT)

| Ref | Value | Footprint | Net From | Net To | Purpose |
|-----|-------|-----------|----------|--------|---------|
| LED_MOT | Green LED | 0603 | 3V3_MOT | R_LED_MOT | Motor rail power indicator |
| R_LED_MOT | 1kΩ | R0603 | LED_MOT.K | GND | LED current limiter (~1.5mA) |

Notes:
- LED_MOT indicates 3V3_MOT is present (MT2492 up); lights as soon as motor rail is up.
- Green LED at 1kΩ draws ~1.5mA (dim but visible, low power).
- 3V3_LOG/ESP32 power: use the LEDs on the ESP32 module (no separate board LED on 3V3_LOG).

## Power Sequencing

1. USB-C connected → source detects sink (5.1kΩ on CC) → VBUS rises to 5V
2. MT2492 starts → 3V3_MOT available (~1ms); LED_MOT lights
3. AMS1117 starts → 3V3_LOG available (~1ms)
4. ESP32 boots from 3V3_LOG (module LEDs indicate logic power/activity)

## Design Notes

- 2× 5.1kΩ on CC1/CC2 to GND: simple USB Type-C sink (Ra). Delivers 5V from any USB-C source (PD or non-PD) without a PD controller on the board. **PD chargers (sources with PD controller) are supported:** they detect the sink and supply default 5V when no PD negotiation occurs. No 9V/12V/20V request possible.
- AMS1117 (linear) provides clean 3V3 for analog (INA219) and digital (ESP32).
- MT2492 (synchronous switching) provides efficient high-current 3V3 for motors (96% efficiency).
- Both regulators fed from VBUS, independent paths.
- No power path MOSFETs needed (single USB-C source).

## BOM Summary (Power Section)

| Ref | Component | Value | Footprint | LCSC | Category |
|-----|-----------|-------|-----------|------|----------|
| J1 | USB-C connector | GT-USB-7010ASV or USB-TYPE-C-006 | USB-C / 6-pin | C2988369 / C2927026 | - |
| U2 | Linear regulator | AMS1117-3.3 | SOT-223 | C6186 | Basic |
| U3 | Sync. switching reg. | MT2492 | SOT-23-6 | C89358 | - |
| L1 | Inductor | 4.7µH | 4x4mm SMD | TBD | TBD |
| LED_MOT | Green LED | 0603 | 0603 | TBD | TBD |
| C1 | Ceramic cap | 10µF | C0603 | C96446 | Basic |
| C2 | Ceramic cap | 100nF | C0603 | C14663 | Basic |
| C3 | Ceramic cap | 100nF | C0603 | C14663 | Basic |
| C4 | Ceramic cap | 22µF | C0603 | C59461 | Basic |
| C5 | Ceramic cap | 10µF | C0603 | TBD | Basic |
| C6 | Ceramic cap | 22nF | C0603 | C21122 | Basic |
| C7 | Ceramic cap | 22µF | C0805 | C45783 | Basic |
| C8 | Ceramic cap | 22µF | C0805 | C45783 | Basic |
| C19 | Electrolytic | 220µF | 6.3mm | TBD | Extended |
| C21 | Ceramic cap | 100nF | C0603 | C14663 | Basic |
| R_CC1 | Resistor | 5.1kΩ | R0603 | C23186 | Basic |
| R_CC2 | Resistor | 5.1kΩ | R0603 | C23186 | Basic |
| R6 | Resistor | 115kΩ | R0603 | C22783 | Basic |
| R7 | Resistor | 25.5kΩ | R0603 | C22920 | Basic |
| R8 | Resistor | 100kΩ | R0603 | C25803 | Basic |
| R_LED_MOT | Resistor | 1kΩ | R0603 | C21190 | Basic |

## Aisler.net Assembly Notes

Aisler's "Amazing Assembly" service sources components from worldwide distributors
(Mouser, Digi-Key, Farnell, Arrow, LCSC). Upload your KiCad project with proper
MPN (Manufacturer Part Number) in the BOM for automatic pricing and sourcing.

### Aisler Lovely Library Compatible Parts (preferred)

These parts are from Würth Elektronik / Diotec and are in Aisler's curated library
(eligible for PCBA discounts):

| Component | Lovely Library Part | MPN | Notes |
|-----------|-------------------|-----|-------|
| L1 (inductor) | Würth WE-TPC | 744043004R7 | 4.7µH, 4x4mm, 2.4A |
| LED_MOT (green) | Würth WL-SMCW | 150060GS75000 | 0603 green LED |
| R_CC1, R_CC2, R_LED_MOT, R6, R7, R8 | Würth CRCW0603 | various | 0603 resistors |
| C (0603 MLCC) | Würth WCAP-CSGP | various | 0603 ceramics |
| C (0805 MLCC) | Würth WCAP-CSGP | various | 0805 ceramics |
| Pin headers | Würth WR-PHD | 61300411121 | 2.54mm male headers |

### Globally Sourced Parts (via Aisler's distributor network)

| Component | MPN | Manufacturer | Source |
|-----------|-----|--------------|--------|
| MT2492 | MT2492 | Aerosemi | LCSC (C89358) |
| AMS1117-3.3 | AMS1117-3.3 | AMS | LCSC/Mouser |
| INA219 | INA219AIDR | Texas Instruments | Mouser/Digi-Key |
| DRV8837 | DRV8837DSGR | Texas Instruments | Mouser/Digi-Key |
| GAQY212GSX | GAQY212GSX | Panasonic | Mouser/Digi-Key |
| GT-USB-7010ASV | GT-USB-7010ASV | G-Switch | LCSC (C2988369) |

### KiCad Project Setup

Install Aisler Lovely Library via KiCad PCM:
1. Open Plugin and Content Manager (PCM)
2. Add package server: https://packages.aisler.net
3. Install "Lovely Library" from Libraries tab
4. Use `PCM_` prefixed symbols for Aisler-optimized parts
