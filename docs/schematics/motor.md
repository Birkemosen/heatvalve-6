# Motor Driver Schematic

## Overview

3x DRV8837 single H-bridge motor drivers controlling 6 valve motors via
2x GAQY212GSX optocouplers (U6, U7) for odd/even motor multiplexing.
MUX inverter for N2: U10 (SN74LVC1G04DBVR). Tacho: see [Analog](analog.md) + [Controller](controller.md).

## Block Diagram

```
                              HeatValve-6 : Motor Drivers
  ┌─────────────────────────────────────────────────────────────────────────────┐
  │                                                                             │
  │  ◄── 3V3_MOT (from Power) ═══════════════════════════════════════════╗     │
  │  ◄── GND ═══════════════════════════════════════════════════════════╗║     │
  │                                                                     ║║     │
  │  ◄── DIR1 (GPIO6) ──────────────────────────┬───────────┬──────────>║║     │
  │  ◄── DIR2 (GPIO5) ──────────────────────────┤           │          ║║     │
  │                                              │           │          ║║     │
  │  ◄── ENA0 (GPIO11) ──→ nSLEEP  ┌───────────┴──┐  ┌────┴───────┐  ║║     │
  │                       ┌────────>│  DRV8837 #1  │  │ DRV8837 #2 │<─║║     │
  │  ◄── ENA1 (GPIO3) ──>│         │   (U_DRV1)   │  │  (U_DRV2)  │  ║║     │
  │  ◄── ENA2 (GPIO4) ──>│         │ VM,VCC=3V3_MOT│  │            │  ║║     │
  │                       │         └──┬────────┬──┘  └──┬──────┬──┘  ║║     │
  │                       │           M1+     M2+       M3+    M4+     ║║     │
  │                       │            │        │        │       │     ║║     │
  │                       │   ┌────────┴──┐     │  ┌─────┴─┐    │     ║║     │
  │                       │   │   J_M1    │     │  │ J_M3  │    │     ║║     │
  │                       │   │  Motor 1  │     │  │Motor 3│    │     ║║     │
  │                       │   │  (RJ11)   │     │  │(RJ11) │    │     ║║     │
  │                       │   └───────────┘     │  └───────┘    │     ║║     │
  │                       │            ┌────────┴──┐     ┌──────┴──┐  ║║     │
  │                       │            │   J_M2    │     │  J_M4   │  ║║     │
  │                       │            │  Motor 2  │     │ Motor 4 │  ║║     │
  │                       │            │  (RJ11)   │     │ (RJ11)  │  ║║     │
  │                       │            └───────────┘     └─────────┘  ║║     │
  │                       │                                           ║║     │
  │                       │   ┌────────────┐     ┌────────────┐       ║║     │
  │                       └──>│ DRV8837 #3 │     │  MUX Logic  │       ║║     │
  │                           │  (U_DRV3)  │     │  U10 inv    │       ║║     │
  │                           └──┬──────┬──┘     │  U6, U7     │       ║║     │
  │                             M5+    M6+       └──────┬──────┘       ║║     │
  │                              │       │              │              ║║     │
  │                    ┌─────────┴─┐ ┌───┴─────┐        │              ║║     │
  │                    │   J_M5    │ │  J_M6   │        │              ║║     │
  │                    │  Motor 5  │ │ Motor 6 │        │              ║║     │
  │                    │  (RJ11)   │ │ (RJ11)  │        │              ║║     │
  │                    └───────────┘ └─────────┘        │              ║║     │
  │                                                     │              ║║     │
  │  ◄── MUX (GPIO2) ──→ R16 ──→ U6 (N1) ──────────────>│              ║║     │
  │                       (odd motors)                   │              ║║     │
  │                  └──→ U10 ──→ R17 ──→ U7 (N2) ─────>│              ║║     │
  │                                (even motors)         │              ║║     │
  │                                                      │              ║║     │
  │    Motor negative paths:                             │              ║║     │
  │      Odd  motors (1,3,5) → MNODD → U6 ───┐          │              ║║     │
  │      Even motors (2,4,6) → MNEVEN → U7 ──┤          │              ║║     │
  │                                          ▼          │              ║║     │
  │                                        MCOM ─────>│══════>║══→ Analog: R_SHUNT
  │                                                           │       ║║     │
  │      (TACHO: see Analog + Controller sections)            │       ║║     │
  └─────────────────────────────────────────────────────────────────────────────┘

  Signal flow: ESP32 GPIOs → DRV8837 (direction/enable) → M1+..M6+ via RJ11
               MUX → Optocouplers → MNODD/MNEVEN → MCOM → Analog
               Tacho: MCOM → Analog (U5 LMV358) → TACHO → Controller GPIO
```

## Architecture

```
                        ┌──────────┐
 GPIO6 (DIR1) ─────────┤ IN1      │
 GPIO5 (DIR2) ─────────┤ IN2  OUT1├──→ Motor+ (via RJ11)
                        │     OUT2├──→ Motor- (to MNODD/MNEVEN)
 GPIO11 (ENA0) ────────┤ nSLEEP   │          ┌─────────────┐
                        │     VM   │←── 3V3_MOT │  GAQY212GSX  │
                        │     VCC  │←── 3V3_MOT │   U6 (N1)    │
                        │     GND  │──→ GND     │  LED ← MUX   │
                        └──────────┘         │  OUT → MCOM   │
                         DRV8837 #1          └─────────────┘
                                             U7 (N2) ← U10(inv) ← MUX
 (Same for DRV8837 #2: GPIO3/ENA1, and #3: GPIO4/ENA2)

 GPIO2 (MUX) ──────→ U6 (direct) and U7 (via U10 inverter); selects N1 (odd) or N2 (even)
 GPIO7 (TACHO) ←──── see Analog (U5 → R22/C23 → TACHO)
```

## Motor Multiplexing

Only ONE motor runs at a time. The MUX signal selects which optocoupler pair
connects the motor negative to the common return path.

| MUX | Active Path | Motors |
|-----|-------------|--------|
| HIGH | N1 (U6) | 1, 3, 5 (odd) |
| LOW | N2 (U7) | 2, 4, 6 (even) |

### Motor Mapping

| Motor | DRV8837 | nSLEEP GPIO | MUX State | RJ11 |
|-------|---------|-------------|-----------|------|
| 1 | #1 (U_DRV1) | GPIO11 | HIGH (odd) | J_M1 |
| 2 | #1 (U_DRV1) | GPIO11 | LOW (even) | J_M2 |
| 3 | #2 (U_DRV2) | GPIO3 | HIGH (odd) | J_M3 |
| 4 | #2 (U_DRV2) | GPIO3 | LOW (even) | J_M4 |
| 5 | #3 (U_DRV3) | GPIO4 | HIGH (odd) | J_M5 |
| 6 | #3 (U_DRV3) | GPIO4 | LOW (even) | J_M6 |

## DRV8837 Motor Drivers (U_DRV1, U_DRV2, U_DRV3)

Texas Instruments DRV8837 - 1.8A single H-bridge motor driver.

### DRV8837 Pin Connections (same for all 3)

| Pin | Name | Net (DRV1) | Net (DRV2) | Net (DRV3) |
|-----|------|------------|------------|------------|
| 1 | VM | 3V3_MOT | 3V3_MOT | 3V3_MOT |
| 2 | OUT1 | M1+ | M3+ | M5+ |
| 3 | OUT2 | M2+ | M4+ | M6+ |
| 4 | GND | GND | GND | GND |
| 5 | IN2 | MOTOR_DIR2 | MOTOR_DIR2 | MOTOR_DIR2 |
| 6 | IN1 | MOTOR_DIR1 | MOTOR_DIR1 | MOTOR_DIR1 |
| 7 | nSLEEP | MOTOR_ENA0 (GPIO11) | MOTOR_ENA1 (GPIO3) | MOTOR_ENA2 (GPIO4) |
| 8 | VCC | 3V3_MOT | 3V3_MOT | 3V3_MOT |
| PAD | GND | GND | GND | GND |

Component: DRV8837DSGR, WSON-8-EP (C527576, Extended, ~$0.69)

### DRV8837 Truth Table

| nSLEEP | IN1 | IN2 | OUT1 | OUT2 | Function |
|--------|-----|-----|------|------|----------|
| 0 | X | X | Hi-Z | Hi-Z | Sleep (low power) |
| 1 | 0 | 0 | Hi-Z | Hi-Z | Coast/Brake |
| 1 | 0 | 1 | L | H | Reverse (close) |
| 1 | 1 | 0 | H | L | Forward (open) |
| 1 | 1 | 1 | L | L | Brake |

### DRV8837 Decoupling (per driver)

| Ref | Value | Footprint | Net From | Net To | Purpose |
|-----|-------|-----------|----------|--------|---------|
| C_DRV1a | 100nF | C0603 | 3V3_MOT (VM) | GND | VM HF decoupling |
| C_DRV1b | 10µF | C0603 | 3V3_MOT (VM) | GND | VM bulk decoupling |
| C_DRV1c | 100nF | C0603 | 3V3_MOT (VCC) | GND | VCC HF decoupling |

Same for DRV2 (C_DRV2a/b/c) and DRV3 (C_DRV3a/b/c).

Notes:
- Place decoupling caps as close to DRV8837 pins as possible
- VM and VCC both connected to 3V3_MOT (motor supply rail)
- 10µF bulk cap shared between VM pins if space is tight
- GND pad must connect to ground plane via multiple vias

## GAQY212GSX Optocouplers (U6, U7)

PhotoMOS relays for motor negative rail switching (odd/even multiplexing).

### Optocoupler Pin Connections

#### U6 - N1 Path (Odd Motors: 1, 3, 5)

| Pin | Name | Net | Connection |
|-----|------|-----|------------|
| 1 | LED+ (Anode) | MUX_N1 | ← R16 (330Ω) ← MOTOR_MUX (GPIO2) |
| 2 | LED- (Cathode) | GND | Ground |
| 3 | OUT1 (Drain) | MNODD | Motor negative (odd) |
| 4 | OUT2 (Source) | MCOM | Common return → shunt → GND |

#### U7 - N2 Path (Even Motors: 2, 4, 6)

| Pin | Name | Net | Connection |
|-----|------|-----|------------|
| 1 | LED+ (Anode) | MUX_N2 | ← R17 (330Ω) ← U10 (SN74LVC1G04 output) |
| 2 | LED- (Cathode) | GND | Ground |
| 3 | OUT1 (Drain) | MNEVEN | Motor negative (even) |
| 4 | OUT2 (Source) | MCOM | Common return → shunt → GND |

Component: GAQY212GSX, SOP-4 (C2828931, Extended, ~$0.38)

### MUX Inverter for N2 (U10 – SN74LVC1G04DBVR)

Since MUX HIGH activates N1 (odd), N2 needs the inverse signal. Implemented with a single inverter gate:

```
GPIO2 (MUX) ──→ R16 (330Ω) ──→ U6 LED+ (direct, active HIGH → N1 on)
        │
        └──→ U10 (SN74LVC1G04) input A
                    │
                    output Y ──→ R17 (330Ω) ──→ U7 LED+ (inverted → N2 on when MUX LOW)
```

When MUX=HIGH: U10 output LOW → U7 LED off (N2 off), U6 LED on (N1 on).
When MUX=LOW: U10 output HIGH → U7 LED on (N2 on), U6 LED off (N1 off).

| Ref | Value | Footprint | Net From | Net To | Purpose |
|-----|-------|-----------|----------|--------|---------|
| U10 | SN74LVC1G04DBVR | SOT-23-5 | MOTOR_MUX (pin 2 A) | R17 (pin 4 Y) | Single inverter (MUX → N2 drive) |
| C22 | 100nF | C0603 | 3V3_MOT (U10 VCC) | GND | U10 decoupling |
| R16 | 330Ω | R0603 | MOTOR_MUX | U6.LED+ (pin 1) | N1 optocoupler drive (~8mA) |
| R17 | 330Ω | R0603 | U10.Y (pin 4) | U7.LED+ (pin 1) | N2 optocoupler drive |

U10 supply: VCC (pin 5) ← 3V3_MOT, GND (pin 3) ← GND. Input A (pin 2) ← MOTOR_MUX, output Y (pin 4) → R17.

## Motor Connectors (RJ11/RJ10, 4-pin)

6× RJ11 or RJ10 connectors (4 pins used) along the bottom edge of the PCB. Motor cable has only two wires, to pin 1 and pin 3.

### RJ11/RJ10 Pin Assignment (per connector)

| Pin | Net | Description |
|-----|-----|-------------|
| 1 | Mx+ | Motor positive (from DRV8837 OUT1/OUT2) |
| 2 | NC | Not connected |
| 3 | MNODD / MNEVEN | Motor negative (odd or even, per motor) |
| 4 | NC | Not connected |

Homematic HmIP-VDMOT compatible: motor uses only **pin 1 and pin 3**; pins 2 and 4 are NC.

### Motor Connector Assignments

| Ref | Motor | OUT+ Net | OUT- Net | DRV8837 |
|-----|-------|----------|----------|---------|
| J_M1 | Motor 1 | M1+ (DRV1.OUT1) | MNODD | #1 |
| J_M2 | Motor 2 | M2+ (DRV1.OUT2) | MNEVEN | #1 |
| J_M3 | Motor 3 | M3+ (DRV2.OUT1) | MNODD | #2 |
| J_M4 | Motor 4 | M4+ (DRV2.OUT2) | MNEVEN | #2 |
| J_M5 | Motor 5 | M5+ (DRV3.OUT1) | MNODD | #3 |
| J_M6 | Motor 6 | M6+ (DRV3.OUT2) | MNEVEN | #3 |

## MCOM to Analog Section

The common negative return from both optocouplers goes to the analog section:

```
U6.OUT2 (pin 4) ──┐
                  ├──→ MCOM ──→ R_SHUNT (analog section) ──→ GND
U7.OUT2 (pin 4) ──┘
```

- Trace width: ≥0.75mm (motor current up to 300mA peak)
- Keep trace short and direct to shunt resistor

## PCB Layout Notes

- Place DRV8837s close to their respective RJ11 connectors
- Spread DRV8837s along the bottom edge to minimize OUT trace length
- Keep motor power traces (M1+..M6+, MNODD, MNEVEN, MCOM) ≥0.5mm wide
- Neck-down to 0.254mm at DRV8837 OUT pads (WSON-8 pin pitch)
- Use teardrops at pad-to-trace transitions
- Motor control signals (DIR1, DIR2, ENA, MUX) can be 0.2mm (digital)
- Route digital control signals away from motor power traces (≥0.3mm clearance)
- GND plane under DRV8837 for thermal dissipation (thermal vias on exposed pad)
- 3V3_MOT power feed: thick trace (≥0.75mm) or power plane

## BOM Summary (Motor Section)

| Ref | Component | Value | Footprint | LCSC | Category |
|-----|-----------|-------|-----------|------|----------|
| U_DRV1 | DRV8837DSGR | - | WSON-8-EP | C527576 | Extended |
| U_DRV2 | DRV8837DSGR | - | WSON-8-EP | C527576 | Extended |
| U_DRV3 | DRV8837DSGR | - | WSON-8-EP | C527576 | Extended |
| U6 | GAQY212GSX | - | SOP-4 | C2828931 | Extended |
| U7 | GAQY212GSX | - | SOP-4 | C2828931 | Extended |
| U10 | SN74LVC1G04DBVR | - | SOT-23-5 | C7827 | Extended |
| C22 | Ceramic cap | 100nF | C0603 | C14663 | Basic |
| R16 | Resistor | 330Ω | R0603 | TBD | Basic |
| R17 | Resistor | 330Ω | R0603 | TBD | Basic |
| C_DRV1a | Ceramic cap | 100nF | C0603 | C14663 | Basic |
| C_DRV1b | Ceramic cap | 10µF | C0603 | TBD | Basic |
| C_DRV1c | Ceramic cap | 100nF | C0603 | C14663 | Basic |
| C_DRV2a | Ceramic cap | 100nF | C0603 | C14663 | Basic |
| C_DRV2b | Ceramic cap | 10µF | C0603 | TBD | Basic |
| C_DRV2c | Ceramic cap | 100nF | C0603 | C14663 | Basic |
| C_DRV3a | Ceramic cap | 100nF | C0603 | C14663 | Basic |
| C_DRV3b | Ceramic cap | 10µF | C0603 | TBD | Basic |
| C_DRV3c | Ceramic cap | 100nF | C0603 | C14663 | Basic |
| J_M1 | RJ11 6P4C | - | Through-hole | TBD | - |
| J_M2 | RJ11 6P4C | - | Through-hole | TBD | - |
| J_M3 | RJ11 6P4C | - | Through-hole | TBD | - |
| J_M4 | RJ11 6P4C | - | Through-hole | TBD | - |
| J_M5 | RJ11 6P4C | - | Through-hole | TBD | - |
| J_M6 | RJ11 6P4C | - | Through-hole | TBD | - |
