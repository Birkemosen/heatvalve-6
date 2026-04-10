# Motor Driver Schematic

## Overview

6x DRV8215 single H-bridge motor drivers, one per valve motor. Each motor has a dedicated
full H-bridge with bidirectional drive (OUT1, OUT2). All control via I2C bus (I2C_BC=1 mode).
No multiplexing, no optocouplers, no shared motor-negative path.

Assembly: Aisler (DRV8215RTER sourced from Mouser/Digikey).

## Block Diagram

```
                              HeatValve-6 Rev.2 : Motor Drivers
  ┌─────────────────────────────────────────────────────────────────────────────┐
  │                                                                             │
  │  ◄── 3V3 (from Power, MT2492) ═══════════════════════════════════╗     │
  │  ◄── GND ════════════════════════════════════════════════════════╗║     │
  │                                                                  ║║     │
  │  ◄── I2C_SCL (GPIO8) ──────────────────────────┐                ║║     │
  │  ◄── I2C_SDA (GPIO9) ─────────────────────────┐│                ║║     │
  │                                                ││                ║║  ║     │
  │       ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     ║║  ║     │
  │       │  DRV8215 #1  │  │  DRV8215 #2  │  │  DRV8215 #3  │     ║║  ║     │
  │       │  (U4)        │  │  (U5)        │  │  (U6)        │     ║║  ║     │
  │       │  Addr: 0x30  │  │  Addr: 0x31  │  │  Addr: 0x32  │     ║║  ║     │
  │       │  A1=L A0=L   │  │  A1=L A0=Z   │  │  A1=L A0=H   │     ║║  ║     │
  │       │              │  │              │  │              │     ║║  ║     │
  │       │  VM←3V3      │  │  VM←3V3      │  │  VM←3V3      │     ║║     │
  │       │  VCC←3V3     │  │  VCC←3V3     │  │  VCC←3V3     │     ║║     │
  │       │  SDA,SCL←I2C │  │  SDA,SCL←I2C │  │  SDA,SCL←I2C │     ║║     │
  │       │  OUT1──→J2   │  │  OUT1──→J3   │  │  OUT1──→J4   │     ║║     │
  │       │  OUT2──→J2   │  │  OUT2──→J3   │  │  OUT2──→J4   │     ║║     │
  │       └──────────────┘  └──────────────┘  └──────────────┘     ║║     │
  │                                                                  ║║     │
  │       ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     ║║     │
  │       │  DRV8215 #4  │  │  DRV8215 #5  │  │  DRV8215 #6  │     ║║     │
  │       │  (U7)        │  │  (U8)        │  │  (U9)        │     ║║     │
  │       │  Addr: 0x33  │  │  Addr: 0x34  │  │  Addr: 0x35  │     ║║     │
  │       │  A1=Z A0=L   │  │  A1=Z A0=Z   │  │  A1=Z A0=H   │     ║║     │
  │       │              │  │              │  │              │     ║║     │
  │       │  OUT1──→J5   │  │  OUT1──→J6   │  │  OUT1──→J7   │     ║║     │
  │       │  OUT2──→J5   │  │  OUT2──→J6   │  │  OUT2──→J7   │     ║║     │
  │       └──────────────┘  └──────────────┘  └──────────────┘     ║║     │
  │                                                                  ║║     │
   │  ◄── nSLEEP_ALL (GPIO6) ──→ shared nSLEEP on all 6 chips       ║║     │
  │  ◄── nFAULT_ALL (GPIO4) ←── wired-OR nFAULT from all 6 chips   ║║     │
   │  ◄── IPROPI_ADC (GPIO7) ←── shared R7 from all 6 IPROPI        ║║     │
   │  ◄── RC_OUT_ALL (DRV pin 3) ← shared R9 from all 6 pin 3 (DRV8214 only)║║ │
  │                                                                  ║║  ║     │
  └─────────────────────────────────────────────────────────────────────────────┘

  Signal flow: ESP32 I2C → DRV8215 registers → OUT1/OUT2 → Motor (via RJ11)
                ESP32 GPIO6 → shared nSLEEP (wake/sleep all chips)
               ESP32 GPIO4 ← wired-OR nFAULT (any chip fault)
                ESP32 GPIO7 (ADC) ← R7 (proportional motor current)
                RC_OUT_ALL is DRV pin 3 and is not used with DRV8215
```

## Architecture

Each DRV8215 is controlled entirely via I2C (I2C_BC=1). No GPIO needed for direction
or enable per motor. Only 2 GPIO for I2C bus (shared), plus 1 shared nSLEEP, 1 shared
nFAULT, and 1 ADC for IPROPI.

```
I2C bus (GPIO8 SCL, GPIO9 SDA) ──┬── DRV8215 #1 (0x30) ─── OUT1/OUT2 → Motor 1
                                  ├── DRV8215 #2 (0x31) ─── OUT1/OUT2 → Motor 2
                                  ├── DRV8215 #3 (0x32) ─── OUT1/OUT2 → Motor 3
                                  ├── DRV8215 #4 (0x33) ─── OUT1/OUT2 → Motor 4
                                  ├── DRV8215 #5 (0x34) ─── OUT1/OUT2 → Motor 5
                                  └── DRV8215 #6 (0x35) ─── OUT1/OUT2 → Motor 6

GPIO6 ────→ shared nSLEEP (all 6 chips)
GPIO4 ←──── wired-OR nFAULT (R8 pull-up to 3V3)
GPIO7 ←──── R7 (5.1kΩ to GND, all 6 IPROPI wire-OR)
RC_OUT_ALL ← R9 (all 6 DRV pin 3 lines wire-OR, relevant to DRV8214; NC on DRV8215)
```

Only one motor runs at a time (firmware-enforced invariant). Inactive motors are in
coast mode (I2C_EN_IN1=0), so their IPROPI output is zero. The active motor's current
appears on the shared R7 resistor as a voltage readable by ESP32 ADC.

## DRV8215 Motor Drivers (U4 through U9)

Texas Instruments DRV8215 - 4A peak single H-bridge motor driver with I2C control,
integrated current sensing (IPROPI), hardware stall detection, and speed/voltage regulation.

### DRV8215 Pin Connections (WQFN-16, 3×3mm)

| Pin | Name | Net (all 6 chips) | Connection |
|-----|------|-------------------|------------|
| 1 | IPROPI | IPROPI_BUS | → wire-OR to shared R7 (5.1kΩ) → GND |
| 2 | VCC | 3V3 | Logic supply (MT2492 output) |
| 3 | RSVD/RC_OUT | RC_OUT_ALL | → wire-OR to shared R9 (10kΩ pull-down) → GPIO3. NC on DRV8215; becomes RC_OUT on DRV8214 |
| 4 | nFAULT | nFAULT_ALL | Open-drain, wired-OR → R8 (10kΩ) → 3V3 |
| 5 | VM | 3V3 | Motor supply (MT2492 output) |
| 6 | OUT1 | Mx_OUT1 | → RJ11 connector pin 1 (motor positive) |
| 7 | GND | GND | Ground plane |
| 8 | OUT2 | Mx_OUT2 | → RJ11 connector pin 3 (motor negative) |
| 9 | A1 | (per chip) | I2C address select, tri-level |
| 10 | A0 | (per chip) | I2C address select, tri-level |
| 11 | nSLEEP | nSLEEP_ALL | ← GPIO2 (shared, active HIGH) |
| 12 | PH/IN2 | NC | Not used (I2C_BC=1, control via I2C) |
| 13 | EN/IN1 | NC | Not used (I2C_BC=1, control via I2C) |
| 14 | SDA | I2C_SDA | ← GPIO9 (shared I2C bus) |
| 15 | SCL | I2C_SCL | ← GPIO8 (shared I2C bus) |
| 16 | VREF | 3V3 (VCC) | Tied to VCC; with INT_VREF=1b internal 500mV is used. Per TI Figure 9-1 |
| PAD | GND | GND | Thermal pad → ground plane via vias |

Component: DRV8215RTER, WQFN-16 (3×3mm), Digikey 296-DRV8215RTER-ND (~€1.35/unit)

Notes:
- EN/IN1 and PH/IN2 pins are unused when I2C_BC=1. Internal pulldowns hold them LOW.
- VREF pin tied to VCC (3V3) per TI reference design (Figure 9-1). With INT_VREF=1b, internal
  500mV is used for stall detection; VREF pin voltage ignored. VCC bypass cap filters VREF.
  Leaving VREF floating (NC) is bad practice for analog inputs — can pick up noise.
- Pin 3 (RSVD) is NC on DRV8215. Trace to RC_OUT_ALL net is pre-routed for DRV8214 upgrade.
- nSLEEP has internal pulldown (~200kΩ); chip sleeps by default at power-up.

### I2C Address Configuration

Tri-level pins: GND (L), floating/Hi-Z (Z), VCC (H). 9 unique addresses possible.
We use 6 addresses for 6 motors.

| Motor | Chip | A1 Pin | A0 Pin | 8-bit Write | 7-bit (ESPHome) |
|-------|------|--------|--------|-------------|-----------------|
| 1 | U4 | GND | GND | 0x60 | 0x30 |
| 2 | U5 | GND | Hi-Z | 0x62 | 0x31 |
| 3 | U6 | GND | VCC | 0x64 | 0x32 |
| 4 | U7 | Hi-Z | GND | 0x66 | 0x33 |
| 5 | U8 | Hi-Z | Hi-Z | 0x68 | 0x34 |
| 6 | U9 | Hi-Z | VCC | 0x6A | 0x35 |

- A0/A1 Hi-Z = leave pin unconnected (internal bias: 10µA pullup to VCC + 90kΩ pulldown to GND)
- A0/A1 GND = connect directly to GND
- A0/A1 VCC = connect directly to VCC (3V3)
- Address pins are latched at power-up

### Per-Chip Address Pin Wiring

| Chip | A1 Connection | A0 Connection |
|------|---------------|---------------|
| U4 | Direct to GND | Direct to GND |
| U5 | Direct to GND | Unconnected (Hi-Z) |
| U6 | Direct to GND | Direct to VCC (3V3) |
| U7 | Unconnected (Hi-Z) | Direct to GND |
| U8 | Unconnected (Hi-Z) | Unconnected (Hi-Z) |
| U9 | Unconnected (Hi-Z) | Direct to VCC (3V3) |

### DRV8215 H-Bridge Truth Table (Phase-Enable mode, I2C_BC=1)

| nSLEEP | I2C_EN_IN1 | I2C_PH_IN2 | OUT1 | OUT2 | Function |
|--------|------------|------------|------|------|----------|
| 0 | X | X | Hi-Z | Hi-Z | Sleep (<100nA) |
| 1 | 0 | X | Hi-Z | Hi-Z | Coast (motor disconnected) |
| 1 | 1 | 0 | L | H | Reverse (close valve) |
| 1 | 1 | 1 | H | L | Forward (open valve) |

Brake: set I2C_EN_IN1=1, I2C_PH_IN2=0 with PMODE=0 (PWM mode variant).

### DRV8215 Decoupling (per driver, ×6)

3 caps per driver, sequentially numbered C8–C25:

| Driver | VM Bulk (10µF, C0603) | VM HF (100nF, C0402) | VCC HF (100nF, C0402) |
|--------|----------------------|-----------------------|-----------------------|
| U4 | C8 | C9 | C10 |
| U5 | C11 | C12 | C13 |
| U6 | C14 | C15 | C16 |
| U7 | C17 | C18 | C19 |
| U8 | C20 | C21 | C22 |
| U9 | C23 | C24 | C25 |

Notes:
- Place decoupling caps as close to DRV8215 VM and VCC pins as possible
- VM (pin 5) = 3V3 (from MT2492 buck converter)
- VCC (pin 2) = 3V3 (from MT2492 buck converter)
- GND pad (thermal) must connect to ground plane via multiple vias (≥4)

### IPROPI Current Sensing (Shared)

The DRV8215 includes an internal current mirror on the low-side FETs. The IPROPI pin
outputs a current proportional to the motor load current. An external resistor converts
this current to a voltage for ADC measurement.

All 6 IPROPI pins (pin 1) wire-OR to a single shared R7 resistor to GND.
Only the active motor outputs current on IPROPI; inactive motors in coast mode
(I2C_EN_IN1=0) have their low-side FETs off, so IPROPI output current is zero.
No isolation diodes needed: IPROPI is a current source output (high impedance when
inactive), not a voltage source.

```
DRV8215 #1 IPROPI (pin 1) ──┐
DRV8215 #2 IPROPI (pin 1) ──┤
DRV8215 #3 IPROPI (pin 1) ──┤
DRV8215 #4 IPROPI (pin 1) ──┼── IPROPI_BUS ── R7 (5.1kΩ) ── GND
DRV8215 #5 IPROPI (pin 1) ──┤                    │
DRV8215 #6 IPROPI (pin 1) ──┘                    └── GPIO1 (ADC)
```

| Ref | Value | Footprint | Net From | Net To | Purpose |
|-----|-------|-----------|----------|--------|---------|
| R7 | 5.1kΩ | R0603 | IPROPI_BUS | GND | Shared current sense resistor |

#### Optional RC Filter (Jumper-selectable)

To keep first hardware revision flexible, IPROPI includes an optional RC low-pass branch
that can be enabled later without PCB respin.

Default build: **bypass path ON**, **RC path OFF**.

```
IPROPI_BUS ---- SJ_IP_BYP (default: CLOSED) -------------------- GPIO1 (ADC)
      |
      +-- R_IPF (1.0k) --o-- SJ_IP_RC (default: OPEN) ---------- GPIO1 (ADC)
                         |
                        C_IPF (100nF)
                         |
                        GND
```

| Ref | Value | Footprint | Default | Purpose |
|-----|-------|-----------|---------|---------|
| SJ_IP_BYP | Solder jumper | 3-pad | Closed | Direct IPROPI path to ADC |
| R_IPF | 1.0kΩ | R0603 | Populated | RC series resistor (when filter enabled) |
| C_IPF | 100nF | C0603 | Populated | RC shunt capacitor to GND |
| SJ_IP_RC | Solder jumper | 3-pad | Open | Connect RC-filtered node to ADC |

Filter math (when RC path is enabled):

- `f_c = 1 / (2πRC) = 1 / (2π * 1k * 100nF) ≈ 1.59 kHz`
- HmIP-VDMOT ripple band (~15-35 Hz) is effectively unaffected:
  - Gain at 35 Hz: `~0.9998` (negligible attenuation)
- High-frequency switching/EMI is strongly attenuated:
  - Gain at 600 kHz (buck switching region): `~0.00265` (~ -51.5 dB)

Recommended usage:
- **Calibration/ripple characterization:** use bypass path (default)
- **If ADC noise appears in field tests:** switch to RC path

#### Current Mirror Gain Settings (CS_GAIN_SEL)

| CS_GAIN_SEL | AIPROPI (µA/A) | Current Range | OCP Limit | Low-side RDS(on) |
|-------------|----------------|---------------|-----------|------------------|
| 000b | 244 | 350mA - 2A | 4A | 145 mΩ |
| 010b | 1156 | 60mA - 350mA | 0.8A | 530 mΩ |
| 110b | 5320 | 10mA - 60mA | 0.16A | 2450 mΩ |

**Selected: CS_GAIN_SEL = 110b** (5320 µA/A) — optimal for HmIP-VDMOT motors
running at 20-60mA typical current. Provides best resolution at low currents.

#### RIPROPI Calculation

V_IPROPI = I_motor × AIPROPI × R7

R7 is set to 5.1kΩ as a headroom compromise for HmIP-VDMOT current profiles: still high
resolution in the 20-40mA operating range, with later saturation (~75mA instead of ~62mA).

| Motor Current | IPROPI Current | V_IPROPI (5.1kΩ) | ADC Reading (12-bit, 3.1V ref) |
|---------------|----------------|-------------------|-------------------------------|
| 10mA | 53.2µA | 0.27V | ~114 |
| 20mA | 106.4µA | 0.54V | ~227 |
| 40mA | 212.8µA | 1.09V | ~454 |
| 60mA | 319.2µA | 1.63V | ~681 |
| 80mA (stall) | 425.6µA | 2.17V | ~907 (clips near limit) |

Maximum IPROPI voltage: min(VM - 1.25V, 3.3V) = min(3.3 - 1.25, 3.3) = 2.05V.
At currents above ~75mA, IPROPI compresses/saturates near ~2.05V. This is acceptable for
HeatValve-6 because only one motor runs at a time and high-current protection is handled by
DRV8215 hardware (EN_STALL + OCP). IPROPI is used primarily for low-current profile tracking
and endstop trend detection in the normal operating range.

### nFAULT (Shared, Wired-OR)

All 6 nFAULT pins (pin 4, open-drain) connect to a single pull-up resistor.
Any chip asserting a fault pulls the line LOW.

| Ref | Value | Footprint | Net From | Net To | Purpose |
|-----|-------|-----------|----------|--------|---------|
| R8 | 10kΩ | R0603 | nFAULT_ALL | 3V3 | Shared nFAULT pull-up |

### nSLEEP (Shared)

All 6 nSLEEP pins (pin 11) connect to GPIO2. Assert HIGH to wake all chips,
LOW to put all in sleep mode (<100nA per chip).

### VREF Configuration

VREF pin (pin 16) tied to VCC (3V3) on all chips, per TI reference design (Figure 9-1).
With INT_VREF=1b (register default), the internal 500mV reference is used for stall
detection and the VREF pin voltage is ignored. No additional bypass cap needed — VREF
shares VCC's existing 100nF decoupling. Primary stall/endstop detection is software-based
via IPROPI ADC monitoring.

### RC_OUT (Shared, DRV8214 Future)

All 6 RSVD/RC_OUT pins (pin 3) connect to a shared pull-down resistor.
On DRV8215, pin 3 is reserved (Hi-Z) — the pull-down keeps RC_OUT_ALL stable at GND.
On DRV8214, RC_OUT pulses on each detected motor commutation ripple.

| Ref | Value | Footprint | Net From | Net To | Purpose |
|-----|-------|-----------|----------|--------|---------|
| R9 | 10kΩ | R0603 | RC_OUT_ALL | GND | Shared RC_OUT pull-down (DRV8214 ready) |

RC_OUT_ALL → GPIO3 (interrupt input for hardware ripple counting when using DRV8214).

## Stall / Endstop Detection

### Strategy: Software-Primary with Hardware Safety

HmIP-VDMOT motors have a gradual current profile (measured by
[VdMot Controller](https://github.com/Lenti84/VdMot_Controller/blob/master/system/actuators.md)):
- Free running: ~20-25mA
- Spindle contacts valve pin (~position 2600): +4-5mA step
- Linear compression phase: gradual increase
- Rubber compression (~position 6300+): steeper ramp to endstop

A fixed hardware threshold cannot distinguish these phases. Software monitoring of
IPROPI ADC gives detailed visibility into the current profile in the normal current range.

### Hardware OCP (Safety Ceiling)

DRV8215 built-in overcurrent protection (OCP) acts as a hard safety limit.
With CS_GAIN_SEL=110b: OCP triggers at 160mA — well above any normal operating
current. This prevents damage if motor is physically blocked or shorted.

EN_STALL enabled with INT_VREF=1b (500mV, ~94mA threshold) provides a secondary
hardware safety net. SMODE=1b reports stall via nFAULT but continues driving,
giving firmware time to react.

| Register | Bit | Value | Description |
|----------|-----|-------|-------------|
| CONFIG0 (0x09) | EN_STALL | 1b | Enable hardware stall detection (safety net) |
| CONFIG3 (0x0C) | SMODE | 1b | Report stall but continue driving |
| CONFIG3 (0x0C) | IMODE | 00b | No current regulation |
| CONFIG3 (0x0C) | INT_VREF | 1b | Internal 500mV reference (~94mA threshold) |
| CONFIG0-1 | TINRUSH | tunable | Startup blanking time |

### Software Stall Detection (Primary)

1. Motor starts → ESP32 samples IPROPI via ADC (GPIO1) at 100-1000 Hz
2. Firmware monitors current level and rate-of-change
3. Detect valve contact: current step of ~4-5mA above baseline
4. Detect endstop: sustained current above threshold (tunable in firmware)
5. Firmware stops motor by writing I2C_EN_IN1=0
6. nFAULT interrupt (GPIO4) as backup if hardware threshold is exceeded

## Software Ripple Counting (Optional)

Motor commutation creates periodic current ripples visible on IPROPI. By sampling at
high rate and filtering, motor position can be tracked without external sensors.

### Implementation

1. ESP32-S3 ADC in continuous DMA mode on GPIO1 (IPROPI_BUS)
2. Sample rate: 1-10 kHz (ESP32-S3 supports up to 83kHz per channel)
3. Software bandpass filter tuned to motor commutation frequency (~25-65 Hz)
4. Peak/zero-crossing counter for position tracking
5. Custom C++ ESPHome component required

### Ripple Signal Characteristics

HmIP-VDMOT motors have 2600-6300+ commutator steps per full stroke (~3 minutes).
At typical speed: ~15-35 steps/second = ~15-35 Hz ripple frequency.

With CS_GAIN_SEL=110b and R7=5.1kΩ, ripple amplitude at 20-40mA base current
is approximately 40-165mV peak-to-peak on the IPROPI_BUS — well within ESP32 ADC
resolution (0.76mV/LSB at 12-bit).

## Motor Connectors (5301-4P4C, 4-pin)

6× 5301-4P4C RJ11 connectors along the bottom edge of the PCB.
Motor cable has only two wires, to pin 1 and pin 3.

### RJ11 Pin Assignment (per connector)

| Pin | Net | Description |
|-----|-----|-------------|
| 1 | Mx_OUT1 | Motor positive (from DRV8215 OUT1, pin 6) |
| 2 | NC | Not connected |
| 3 | Mx_OUT2 | Motor negative (from DRV8215 OUT2, pin 8) |
| 4 | NC | Not connected |

Homematic HmIP-VDMOT compatible: motor uses only **pin 1 and pin 3**; pins 2 and 4 are NC.

### Motor Connector Assignments

| Ref | Motor | DRV8215 | OUT1 Net | OUT2 Net | I2C Addr (7-bit) |
|-----|-------|---------|----------|----------|------------------|
| J2 | Motor 1 | U4 | M1_OUT1 | M1_OUT2 | 0x30 |
| J3 | Motor 2 | U5 | M2_OUT1 | M2_OUT2 | 0x31 |
| J4 | Motor 3 | U6 | M3_OUT1 | M3_OUT2 | 0x32 |
| J5 | Motor 4 | U7 | M4_OUT1 | M4_OUT2 | 0x33 |
| J6 | Motor 5 | U8 | M5_OUT1 | M5_OUT2 | 0x34 |
| J7 | Motor 6 | U9 | M6_OUT1 | M6_OUT2 | 0x35 |

Each motor has its own dedicated H-bridge. Full bidirectional drive via OUT1/OUT2.

## I2C Motor Control Sequence

1. **Wake**: Assert nSLEEP_ALL HIGH (GPIO2). Wait tWAKE (~410µs).
2. **Configure** (once after boot, per chip):
   - Write CONFIG4 (0x0D): I2C_BC=1, PMODE=1 (Phase-Enable mode), I2C_EN_IN1=0
   - Write CONFIG3 (0x0C): IMODE=00b (no current regulation), SMODE=1b (stall report only), INT_VREF=1b
   - Write CONFIG0 (0x09): EN_STALL=1
   - Write RC_CTRL0 (0x11): CS_GAIN_SEL=110b (5320µA/A, 10-60mA range)
3. **Single-motor guard**: Ensure all motors are in coast before starting one motor.
4. **Start motor**: Write CONFIG4 (0x0D): I2C_EN_IN1=1, I2C_PH_IN2=direction
5. **Monitor**: Poll FAULT_STATUS (0x00) for STALL bit; read IPROPI via ADC
6. **Stop motor**: Write CONFIG4 (0x0D): I2C_EN_IN1=0 (coast mode)
7. **Sleep**: De-assert nSLEEP_ALL LOW (GPIO2) when all motors idle

## PCB Layout Notes

- Place each DRV8215 close to its RJ11 connector for short OUT1/OUT2 traces
- Spread DRV8215s along the bottom edge of PCB
- Keep motor power traces (OUT1, OUT2) ≥0.5mm wide
- VM and VCC decoupling caps directly adjacent to pins 5 and 2 respectively
- GND thermal pad: ≥4 thermal vias to internal ground plane
- I2C traces (SDA, SCL): route together, away from motor outputs (≥0.3mm clearance)
- IPROPI bus: short traces, star topology from R7 to each chip
- nFAULT and nSLEEP: can be thin traces (0.2mm, digital)
- 3V3 power feed: thick trace (≥0.75mm) or power plane for VM+VCC combined

## BOM Summary (Motor Section)

| Ref | Component | Value | Footprint | Source | Notes |
|-----|-----------|-------|-----------|--------|-------|
| U4 | DRV8215RTER | - | WQFN-16 (3×3mm) | Digikey 296-DRV8215RTER-ND | Motor 1, addr 0x30 |
| U5 | DRV8215RTER | - | WQFN-16 (3×3mm) | Digikey | Motor 2, addr 0x31 |
| U6 | DRV8215RTER | - | WQFN-16 (3×3mm) | Digikey | Motor 3, addr 0x32 |
| U7 | DRV8215RTER | - | WQFN-16 (3×3mm) | Digikey | Motor 4, addr 0x33 |
| U8 | DRV8215RTER | - | WQFN-16 (3×3mm) | Digikey | Motor 5, addr 0x34 |
| U9 | DRV8215RTER | - | WQFN-16 (3×3mm) | Digikey | Motor 6, addr 0x35 |
| R7 | Resistor | 5.1kΩ | R0603 | Aisler Lovely Lib | Shared IPROPI sense |
| R8 | Resistor | 10kΩ | R0603 | Aisler Lovely Lib | Shared nFAULT pull-up |
| R9 | Resistor | 10kΩ | R0603 | Aisler Lovely Lib | Shared RC_OUT pull-down (DRV8214 ready) |
| R_IPF | Resistor | 1.0kΩ | R0603 | Aisler Lovely Lib | Optional IPROPI RC filter series resistor |
| C8 | Ceramic cap | 10µF | C0603 | Aisler Lovely Lib | U4 VM bulk |
| C9 | Ceramic cap | 100nF | C0402 | Aisler Lovely Lib | U4 VM HF |
| C10 | Ceramic cap | 100nF | C0402 | Aisler Lovely Lib | U4 VCC HF |
| C11 | Ceramic cap | 10µF | C0603 | Aisler Lovely Lib | U5 VM bulk |
| C12 | Ceramic cap | 100nF | C0402 | Aisler Lovely Lib | U5 VM HF |
| C13 | Ceramic cap | 100nF | C0402 | Aisler Lovely Lib | U5 VCC HF |
| C14 | Ceramic cap | 10µF | C0603 | Aisler Lovely Lib | U6 VM bulk |
| C15 | Ceramic cap | 100nF | C0402 | Aisler Lovely Lib | U6 VM HF |
| C16 | Ceramic cap | 100nF | C0402 | Aisler Lovely Lib | U6 VCC HF |
| C17 | Ceramic cap | 10µF | C0603 | Aisler Lovely Lib | U7 VM bulk |
| C18 | Ceramic cap | 100nF | C0402 | Aisler Lovely Lib | U7 VM HF |
| C19 | Ceramic cap | 100nF | C0402 | Aisler Lovely Lib | U7 VCC HF |
| C20 | Ceramic cap | 10µF | C0603 | Aisler Lovely Lib | U8 VM bulk |
| C21 | Ceramic cap | 100nF | C0402 | Aisler Lovely Lib | U8 VM HF |
| C22 | Ceramic cap | 100nF | C0402 | Aisler Lovely Lib | U8 VCC HF |
| C23 | Ceramic cap | 10µF | C0603 | Aisler Lovely Lib | U9 VM bulk |
| C24 | Ceramic cap | 100nF | C0402 | Aisler Lovely Lib | U9 VM HF |
| C25 | Ceramic cap | 100nF | C0402 | Aisler Lovely Lib | U9 VCC HF |
| C_IPF | Ceramic cap | 100nF | C0603 | Aisler Lovely Lib | Optional IPROPI RC filter shunt cap |
| SJ_IP_BYP | Solder jumper | 3-pad | PCB jumper | - | IPROPI direct path (default closed) |
| SJ_IP_RC | Solder jumper | 3-pad | PCB jumper | - | IPROPI RC path (default open) |
| J2 | RJ11 5301-4P4C | - | Through-hole | TBD | Motor 1 connector |
| J3 | RJ11 5301-4P4C | - | Through-hole | TBD | Motor 2 connector |
| J4 | RJ11 5301-4P4C | - | Through-hole | TBD | Motor 3 connector |
| J5 | RJ11 5301-4P4C | - | Through-hole | TBD | Motor 4 connector |
| J6 | RJ11 5301-4P4C | - | Through-hole | TBD | Motor 5 connector |
| J7 | RJ11 5301-4P4C | - | Through-hole | TBD | Motor 6 connector |

## Components Removed vs Rev.1

The following components from Rev.1 are **no longer present**:

### Motor Driver Section
- 3x legacy H-bridge driver ICs + 9x decoupling caps
- 2x GAQY212GSX optocouplers
- 1x SN74LVC1G04 inverter + decoupling cap
- 2x 330Ω optocoupler drive resistors
- All MCOM, MNODD, MNEVEN nets removed

### Analog / Current Sensing Section
- INA219AIDR — I2C current sense amplifier
- 100mΩ (R2512) — current sense shunt resistor
- 2x 10Ω — INA219 input filter resistors
- LMV358 — dual op-amp, tacho conditioning
- ~12 resistors — tacho stage, MCOM divider, Vref divider, tuning pads
- ~4 caps — tacho filter/decoupling
- MCOM_SENSE, TACHO nets removed

**Total removed: 2 ICs + 1 shunt + ~17 passives (analog) + 3 ICs + 2 opto + ~12 passives (motor) ≈ 35 components**

## Future Upgrade: DRV8214

DRV8214RTER is pin-compatible with DRV8215RTER (same WQFN-16 3×3mm footprint).
Drop-in replacement that adds hardware ripple counting (sensorless position sensing).
**No PCB change required** — pin 3 (RC_OUT) is already routed to RC_OUT_ALL net with
R9 pull-down and GPIO3 interrupt input. Simply swap ICs and enable RC_EN via I2C register.
