# Power Supply Schematic

## Overview

USB-C input with 2× 5.1kΩ on CC1/CC2 to GND (sink signature). Delivers 5V from any USB-C source (PD or non-PD) without a PD controller.
Two power paths: VBUS → MT2492 → 3V3 (all 3.3V loads), VBUS → ESP32 (via Schottky diode).
LED on 3V3 (power indicator). ESP32 power indicated by module LEDs.

## Block Diagram

```
                          HeatValve-6 Rev.2 : Power Supply
  ┌─────────────────────────────────────────────────────────────────────┐
  │                                                                     │
  │  USB-C (J1)  CC1,CC2 ──→ R1,R2 (5.1k to GND)                  │
  │       VBUS ───────────────┬──→ C1,C2 --──────┬──→ MT2492 (U3) ──→ 3V3 ══> All 3.3V loads
  │                           │                  │    (Sync Buck)   │   (DRV8215 VM+VCC,
  │                           │                  │    C3,C4 L1 C5,C6 │   I2C, 1-Wire, UART
  │                           │                  │    R3,R4 (FB)    │   pull-ups, nFAULT)
  │                           │                  │                  │  LED_PWR, R6
  │                           │                  │                  │
  │                           │                  └──→ D_5V (Schottky) ──→ VBUS_ESP ══> ESP32 5V pin
  │                           │                       (~0.3V drop → ~4.7V)     (module's LDO → 3.3V)
  │  GND ═══════════════════════════════════════════════════════════════╧══════> GND plane
  │                                                                     │
  └─────────────────────────────────────────────────────────────────────┘

  Signal flow: USB-C (5V) → VBUS → MT2492 → 3V3 (motors, logic, peripherals)
                                    → D_5V → ESP32 5V pin (~4.7V)
```

## Power Rails

| Rail | Voltage | Source | Purpose |
|------|---------|--------|---------|
| VBUS | 5V | USB-C (J1) direct | Main input rail |
| VBUS_ESP | ~4.7V | VBUS via D_5V (Schottky) | ESP32 module 5V pin (module's LDO → 3.3V) |
| 3V3 | 3.3V | MT2492 (synchronous switching) | 6x DRV8215 VM+VCC, I2C/UART/1-Wire pull-ups, nFAULT pull-up |

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
| R1 | 5.1kΩ | R0603 | CC1 (J1) | GND | Sink signature; source supplies 5V |
| R2 | 5.1kΩ | R0603 | CC2 (J1) | GND | Sink signature (both CC for plug orientation) |

Notes:
- 2× 5.1kΩ (Ra per USB Type-C) identifies the board as a 5V sink. Works with PD and non-PD sources; PD sources default to 5V when no PD negotiation occurs.
- D+/D- on J1 can be NC for power-only use.

### USB-C Input Filter

| Ref | Value | Footprint | Net From | Net To | Purpose |
|-----|-------|-----------|----------|--------|---------|
| C1 | 10uF | C0603 | VBUS | GND | VBUS LF decoupling near connector |
| C2 | 100nF | C0603 | VBUS | GND | VBUS HF decoupling near connector |

### MT2492 Synchronous Switching Regulator - 3V3 (U3)

Signal flow: **+5V → IN (5)** (with 10µF); **EN (4)** via 100kΩ to +5V; **BS (1) – 22nF – SW (6)**; **SW (6) → L1 (4.7µH) → 22µF + 22µF → 3V3**; **FB (3)**: R3 (115kΩ) from 3V3 to FB, R4 (25.5kΩ) from FB to GND.

| Pin | Net | Component/Connection |
|-----|-----|---------------------|
| 1 (BS) | BS | ← 22nF (C3) to SW (6) |
| 2 (GND) | GND | Ground |
| 3 (FB) | FB | R3 (115kΩ) ← 3V3; R4 (25.5kΩ) → GND |
| 4 (EN) | EN | ← VBUS via R5 (100kΩ) |
| 5 (IN) | VBUS | Input supply; 10µF (C4) to GND |
| 6 (SW) | SW | → L1 (4.7µH) → 3V3 (C5, C6 output) |

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
| C3 | 22nF | C0603 | BS (U3.1) | SW (U3.6) | Bootstrap cap |
| C4 | 10µF | C0603 | VBUS (U3.5 IN) | GND | Input decoupling |
| C5 | 22µF | C0805 | 3V3 | GND | Output bulk |
| C6 | 22µF | C0805 | 3V3 | GND | Output bulk |
| L1 | 4.7µH | 4x4mm or 6x6mm | SW (U3.6) | 3V3 | Buck inductor (≥2A sat) |
| R3 | 115kΩ | R0603 | 3V3 | FB (U3.3) | Feedback upper |
| R4 | 25.5kΩ | R0603 | FB (U3.3) | GND | Feedback lower |
| R5 | 100kΩ | R0603 | VBUS | EN (U3.4) | Enable pull-up |

Notes:
- **No Schottky diode needed** – MT2492 has internal synchronous MOSFET.
- Feedback: Vout = 0.6V × (1 + R3/R4) → 115k / 25.5k ≈ 3.31V.
- Bootstrap C3: 22nF between BS (1) and SW (6).
- L1: 4.7µH, ≥2A saturation current, low DCR.
  Recommended: Würth 744043004R7 (4x4mm, 2.4A, Aisler Lovely Library compatible)
  Alternative: Sunlord SWPA4030S4R7MT (4x3mm, 2A) or SWPA6045S4R7MT (6x6mm, 3A)

### Bulk Input Capacitor

| Ref | Value | Footprint | Net From | Net To | Purpose |
|-----|-------|-----------|----------|--------|---------|
| C7 | 220µF | SMD electrolytic 6.3mm | VBUS | GND | Bulk storage |

Notes:
- 220µF bulk + C1 (10µF) + C4 (10µF) + C2 (100nF) = ~240µF total on VBUS.
- Sufficient for motor startup transients (300mA peak) and ESP32 WiFi bursts (~350mA).
- MT2492 responds within ~10µs (600kHz switching): ΔV = 0.5A × 10µs / 240µF ≈ 21mV ripple.
- No separate bulk needed on 3V3 — output ceramics C5+C6 (2×22µF = 44µF) are adequate.
- C1 (10µF) + C2 (100nF) at USB-C connector provide local VBUS decoupling.
- 220µF avoids USB-C inrush issues (940µF could trip some USB sources on plug-in).

### ESP32 Backfeed Protection Diode (D_5V)

| Ref | Value | Footprint | Net From | Net To | Purpose |
|-----|-------|-----------|----------|--------|---------|
| D_5V | SS14 (1A/40V Schottky) | SMA (DO-214AC) | VBUS | VBUS_ESP (ESP32 5V pin) | Backfeed protection |

Notes:
- Schottky diode (~0.3V forward drop at 200mA) isolates board VBUS from ESP32 module's onboard USB-C.
- When programming via module USB while board is powered, current cannot backfeed between USB sources.
- ~4.7V is sufficient for module's onboard LDO (min Vin typically ~3.5V).
- 1A rating sufficient for ESP32-S3 peak consumption (~350mA WiFi burst). LCSC C2480 (Basic part).

### Power LED (3V3)

| Ref | Value | Footprint | Net From | Net To | Purpose |
|-----|-------|-----------|----------|--------|---------|
| LED_PWR | Green LED | 0603 | 3V3 | R6 | 3V3 rail power indicator |
| R6 | 1kΩ | R0603 | LED_PWR.K | GND | LED current limiter (~1.5mA) |

Notes:
- LED_PWR indicates 3V3 is present (MT2492 up); lights as soon as rail is active.
- Green LED at 1kΩ draws ~1.5mA (dim but visible, low power).
- ESP32 power: indicated by module's onboard LEDs.

## Power Sequencing

1. USB-C connected → source detects sink (5.1kΩ on CC) → VBUS rises to 5V
2. MT2492 starts → 3V3 available (~1ms); LED_PWR lights; DRV8215 VM+VCC, pull-ups, nFAULT powered
3. VBUS → D_5V → ESP32 5V pin (~4.7V) → module's onboard LDO → 3.3V → ESP32 boots

## Design Notes

- 2× 5.1kΩ on CC1/CC2 to GND: simple USB Type-C sink (Ra). Delivers 5V from any USB-C source (PD or non-PD) without a PD controller on the board. **PD chargers (sources with PD controller) are supported:** they detect the sink and supply default 5V when no PD negotiation occurs. No 9V/12V/20V request possible.
- ESP32 powered via VBUS through D_5V Schottky diode (~4.7V on module's 5V pin). Module's onboard LDO generates 3.3V for the ESP32.
- **Single 3V3 rail** from MT2492 buck converter supplies all 3.3V loads: 6x DRV8215 (VM and VCC tied together), I2C/UART/1-Wire pull-ups, nFAULT pull-up. No separate LDO needed — Rev.1's AMS1117 was required for noise-sensitive INA219/LMV358 analog circuits, which are removed in Rev.2.
- MT2492 (synchronous switching) provides efficient high-current 3V3 (96% efficiency, 2A capacity). Peak load ~315mA (300mA motor + 15mA logic/pull-ups).
- Both paths fed from VBUS, independent.
- D_5V prevents backfeed when programming via module's onboard USB-C while board is powered.

## BOM Summary (Power Section)

| Ref | Component | Value | Footprint | LCSC | Category |
|-----|-----------|-------|-----------|------|----------|
| J1 | USB-C connector | GT-USB-7010ASV or USB-TYPE-C-006 | USB-C / 6-pin | C2988369 / C2927026 | - |
| D_5V | Schottky diode | SS14 (1A/40V) | SMA (DO-214AC) | C2480 | Basic |
| U3 | Sync. switching reg. | MT2492 | SOT-23-6 | C89358 | - |
| L1 | Inductor | 4.7µH | 4x4mm SMD | TBD | TBD |
| LED_PWR | Green LED | 0603 | 0603 | TBD | TBD |
| C1 | Ceramic cap | 10µF | C0603 | TBD | Basic |
| C2 | Ceramic cap | 100nF | C0603 | C14663 | Basic |
| C3 | Ceramic cap | 22nF | C0603 | C21122 | Basic |
| C4 | Ceramic cap | 10µF | C0603 | TBD | Basic |
| C5 | Ceramic cap | 22µF | C0805 | C45783 | Basic |
| C6 | Ceramic cap | 22µF | C0805 | C45783 | Basic |
| C7 | Electrolytic | 220µF | 6.3mm | TBD | Extended |
| R1 | Resistor | 5.1kΩ | R0603 | C23186 | Basic |
| R2 | Resistor | 5.1kΩ | R0603 | C23186 | Basic |
| R3 | Resistor | 115kΩ | R0603 | C22783 | Basic |
| R4 | Resistor | 25.5kΩ | R0603 | C22920 | Basic |
| R5 | Resistor | 100kΩ | R0603 | C25803 | Basic |
| R6 | Resistor | 1kΩ | R0603 | C21190 | Basic |

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
| LED_PWR (green) | Würth WL-SMCW | 150060GS75000 | 0603 green LED |
| R1-R6 | Würth CRCW0603 | various | 0603 resistors |
| C (0603 MLCC) | Würth WCAP-CSGP | various | 0603 ceramics |
| C (0805 MLCC) | Würth WCAP-CSGP | various | 0805 ceramics |
| Pin headers | Würth WR-PHD | 61300411121 | 2.54mm male headers |

### Globally Sourced Parts (via Aisler's distributor network)

| Component | MPN | Manufacturer | Source |
|-----------|-----|--------------|--------|
| MT2492 | MT2492 | Aerosemi | LCSC (C89358) |
| DRV8215 | DRV8215RTER | Texas Instruments | Mouser/Digi-Key |
| GT-USB-7010ASV | GT-USB-7010ASV | G-Switch | LCSC (C2988369) |

### KiCad Project Setup

Install Aisler Lovely Library via KiCad PCM:
1. Open Plugin and Content Manager (PCM)
2. Add package server: https://packages.aisler.net
3. Install "Lovely Library" from Libraries tab
4. Use `PCM_` prefixed symbols for Aisler-optimized parts
