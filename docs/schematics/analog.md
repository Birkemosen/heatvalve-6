# Analog / Current Sensing Schematic

## Overview

INA219 high-side current sense amplifier replaces the previous discrete circuit
(AD8628 + LM224 + passive network). Measures motor current via I2C for endstop detection.

## Block Diagram

```
                         HeatValve-6 : Analog / Current Sensing
  ┌───────────────────────────────────────────────────────────────────────┐
  │                                                                       │
  │  ◄── 3V3_LOG (from Power) ────────────────────────-┐                  │
  │  ◄── GND ─────────────────────────────────────────┐│                  │
  │                                                    ││                  │
  │  ◄── MCOM (from Motor) ──┐                     ││                  │
  │                               │                    ││                  │
  │                        ┌──────┴──────┐             ││                  │
  │                        │   R_SHUNT   │             ││                  │
  │                        │  (100mΩ)    │  R7,R8,C11 (input filter)       │
  │                        │   R2512     │             ││                  │
  │                        └──┬───────┬──┘             ││                  │
  │                    IN+ ←──┤       ├──→ IN-         ││                  │
  │                     ┌─────┘       └─────┐          ││                  │
  │                     │                   │          ││                  │
  │                ┌────┴───────────────────┴────┐     ││                  │
  │                │         INA219              │     ││                  │
  │                │          (U1)               │     ││                  │
  │                │     SOIC-8, 0x40            │ VS──┘│                  │
  │                │                             │ GND──┘                  │
  │                │  SDA ──────────────────────>│──────────────────────>│─→ Controller: I2C_SDA
  │                │  SCL ──────────────────────>│──────────────────────>│─→ Controller: I2C_SCL
  │                └─────────────────────────────┘                       │
  │                          C12 (decoupling)                             │
  │                                                                       │
  │  Tacho: MCOM ──→ U5 (LMV358 SOIC-8) ──→ R22/C23 ──→ TACHO ──→ Controller GPIO7
  │                                                                       │
  │                     MCOM_SENSE ──→ GND                           │
  │                                                                       │
  └───────────────────────────────────────────────────────────────────────┘

  Signal flow: Motor current → MCOM → R_SHUNT → GND
                                  │              │
                              INA219 IN+     INA219 IN-
                                  │
                              I2C → ESP32 (current reading for endstop detection)

  Tacho: MCOM (back-EMF/commutator pulses) → U5 (LMV358) conditioning → TACHO → Controller GPIO7 (software inverted)
```

### What INA219 Replaces

| Removed Component | Function | Replaced By |
|-------------------|----------|-------------|
| U8 (LM224) | Quad op-amp, voltage divider buffer (current path) | INA219 internal PGA. Tacho uses LMV358 (U5, dual op-amp SOIC-8): MCOM → U5 → TACHO (see § Tacho from MCOM). |
| U9 (AD8628) | Precision op-amp, current amplifier | INA219 internal amplifier |
| R17-R31 | Gain/divider resistor network (~15 pcs) | INA219 + 1 shunt resistor |
| C14-C16 | Filter capacitors | INA219 internal filtering |

Savings: ~$5-7 in component cost, ~15 fewer components, simpler PCB routing.

## INA219 Current Sense Amplifier (U1)

Texas Instruments INA219 - bidirectional high-side current/power monitor with I2C.

### INA219 Pin Connections

| Pin | Name | Net | Connection |
|-----|------|-----|------------|
| 1 | A1 | GND | Address bit 1 → GND (A1=0) |
| 2 | A0 | GND | Address bit 0 → GND (A0=0) → Addr 0x40 |
| 3 | SDA | I2C_SDA | ← ESP32 GPIO9 (via shared I2C bus) |
| 4 | SCL | I2C_SCL | ← ESP32 GPIO8 (via shared I2C bus) |
| 5 | VS | 3V3_LOG | Supply voltage |
| 6 | GND | GND | Ground |
| 7 | IN- | MCOM_SENSE | After shunt, via R8 (filter) |
| 8 | IN+ | MCOM | Before shunt (motor side), via R7 (filter) |

Component: INA219AIDR, SOIC-8 (C982452, Extended, ~$0.63)

### I2C Address Configuration

| A1 | A0 | Address |
|----|------|---------|
| GND | GND | 0x40 (default) |
| GND | VS | 0x41 |
| VS | GND | 0x44 |
| VS | VS | 0x45 |

Using default 0x40 (both address pins to GND).

## Shunt Resistor

High-side current measurement via shunt in the motor common return path (MCOM).

### Shunt Selection

| Parameter | Value | Notes |
|-----------|-------|-------|
| Motor running current | ~50-100 mA typical | HmIP-VDMOT valve motors |
| Motor stall current | ~150-300 mA | Endstop detection threshold |
| Shunt resistance | 100 mΩ (0.1Ω) | Standard INA219 value |
| Max voltage drop | 30 mV @ 300mA | Negligible for motor operation |
| Power dissipation | 9 mW @ 300mA | Minimal heating |

| Ref | Value | Footprint | Net From | Net To | Purpose |
|-----|-------|-----------|----------|--------|---------|
| R_SHUNT | 100mΩ ±1% | R2512 | MCOM | MCOM_SENSE | Current sense shunt (replaces R13 1Ω) |

### INA219 Input Filter (R7, R8, C11)

Reduces HF noise on the sense lines; keep series resistors small so they don't affect DC accuracy.

| Ref | Value | Footprint | Net From | Net To | Purpose |
|-----|-------|-----------|----------|--------|---------|
| R7 | 10Ω | R0603 | MCOM (shunt side) | U1.VIN+ (pin 8) | IN+ series filter |
| R8 | 10Ω | R0603 | U1.VIN- (pin 7) | MCOM_SENSE | IN- series filter |
| C11 | 100nF | C0603 | VIN+ (pin 8) | VIN- (pin 7) | Differential HF filter |

Notes:
- R2512 footprint for shunt: low thermal resistance and high power rating (1W)
- 1% tolerance for accurate current measurement
- Kelvin connection (4-wire sense) recommended for best accuracy
- Use thick traces (≥1mm) to/from shunt pads

### Shunt Placement

```
DRV8837 OUT1/OUT2 ──→ Motor ──→ Optocoupler ──→ MCOM
                                                     │
                                              ┌──────┤
                                              │  R_SHUNT (0.1Ω)
                                              │      │
                                    INA219 IN+ ──── INA219 IN-
                                                     │
                                                    GND
```

The shunt is placed in the common negative return path (MCOM → GND).
All motor current flows through this single shunt, regardless of which motor is active.

## Tacho from MCOM

Tacho is derived on the controller from the motor common return (MCOM) using back-EMF/commutator pulse detection. We use **LMV358** (U5, dual op-amp, SOIC-8, LCSC C2923376): rail-to-rail output, 2.7–5 V, same pinout as LM358.

### U5 LMV358 Pinout (SOIC-8)

| Pin | Name | Net | Connection |
|-----|------|-----|------------|
| 1 | OUTA | - | Stage A output |
| 2 | INA- | - | Stage A inverting input |
| 3 | INA+ | - | Stage A non-inverting input |
| 4 | VSS | **GND** | Ground |
| 5 | INB+ | - | Stage B non-inverting input |
| 6 | INB- | - | Stage B inverting input |
| 7 | OUTB | TACHO | Stage B output = TACHO |
| 8 | VDD | **3V3_LOG** | Supply (+ C14 100nF decoupling to GND) |

### Circuit (two stages)

```
                         Stage A                              Stage B
                    (non-inv. amplifier)                  (Schmitt trigger)

                        ┌────────┐                          ┌────────┐
  MCOM ── R14 ──┬──→│3 INA+  │                    ┌──→│5 INB+  │
              4.7k  │   │        │    R12              │    │        │
            R15 ┤C15   │2 INA- ├←── 680Ω ──┐        │    │6 INB-  │←── Vref (1.65V)
           4.7k│220nF │        │           │  OUTA   │    │        │    R_REF1/R_REF2/C13
              │  │     │1 OUTA ├───────────┴────┬───┤    │7 OUTB ├──┬── R22 (330Ω) ── TACHO
             GND GND   └────────┘  R13     │    R9  R11   └────────┘  │              C23(100nF)
                                   2.7k    │    1k  1MΩ              R10               │
                                   │       │    │    │                1k              GND
                                  GND      └────┘    └── OUTB        │
                                                                     GND

  Supply: pin 8 (VDD) ← 3V3_LOG,  pin 4 (VSS) ← GND
          C14 (100nF) from VDD to GND near U5
```

**Stage A (pins 3, 2, 1) — Non-inverting amplifier:**
- INA+ (pin 3): voltage divider R14/R15 from MCOM, with C15 (220nF) as input LP filter. f_c = 1/(2π × R14 × C15) ≈ **154 Hz**. V_INA+ = MCOM × R15/(R14+R15) = MCOM / 2.
- INA- (pin 2): R13 (2.7kΩ) to GND, R12 (680Ω) feedback from OUTA (pin 1).
- Gain = 1 + R12/R13 = 1 + 680/2700 ≈ **1.25**.
- Stage A output ≈ 0.625 × MCOM. Scales back-EMF pulses to safe levels within 3.3 V supply.
- **R12_ALT** (parallel pad, default NC): populate to increase gain. See [Tuning Pads](#tuning-pads-r12_alt-r_ref2_alt).

**Stage B (pins 5, 6, 7) — Schmitt trigger / comparator:**
- INB+ (pin 5): from OUTA via R9 (1kΩ), plus R11 (1MΩ) positive feedback from OUTB (pin 7) → hysteresis.
- INB- (pin 6): **Vref = 1.65V** from voltage divider R_REF1/R_REF2 + C13 (see below). **R_REF2_ALT** (parallel pad, default NC): populate to lower Vref. See [Tuning Pads](#tuning-pads-r12_alt-r_ref2_alt).
- OUTB (pin 7) → R10 (1kΩ) pull-down to GND. Output also → R22 (330Ω series) + C23 (100nF to GND) = **TACHO**.
- Hysteresis ≈ Vswing × R9/(R9 + R11) ≈ 3.3 × 1k/1001k ≈ **3.3 mV** — small, for noise rejection.

**Vref for Stage B (INB- threshold):**
```
3V3_LOG ── R_REF1 (10kΩ) ──┬── U5 pin 6 (INB-)
                            │
                       C13 (100nF)
                            │
           R_REF2 (10kΩ) ──┘
                            │
                           GND
```
- Vref = 3.3 × R_REF2/(R_REF1 + R_REF2) = **1.65V** (midpoint, comparator threshold).
- C13 (100nF) filters noise on the reference.
- No buffer needed: LMV358 input bias current is negligible vs. divider current (~165µA).
- Vref is internal to the analog section only (not routed to ESP32).

### Component list (tacho conditioning)

| Ref | Value | Footprint | Net From | Net To | Purpose |
|-----|-------|-----------|----------|--------|---------|
| U5 | LMV358 | SOIC-8 | - | - | Dual op-amp, tacho conditioning (LCSC C2923376) |
| R14 | 4.7kΩ | R0603 | MCOM | U5.3 (INA+) | Input divider (top) |
| R15 | 4.7kΩ | R0603 | U5.3 (INA+) | GND | Input divider (bottom), V_INA+ = MCOM/2 |
| C15 | 220nF | C0603 | U5.3 (INA+) | GND | Input LP filter; f_c ≈ 154 Hz with R14 |
| R12 | 680Ω | R0603 | U5.1 (OUTA) | U5.2 (INA-) | Stage A feedback |
| R12_ALT | NC (tuning) | R0603 | U5.1 (OUTA) | U5.2 (INA-) | **Parallel with R12.** Populate to adjust gain. See § Tuning Pads |
| R13 | 2.7kΩ | R0603 | U5.2 (INA-) | GND | Stage A ground reference (sets gain) |
| R9 | 1kΩ | R0603 | U5.1 (OUTA) | U5.5 (INB+) | Stage B input from Stage A |
| R11 | 1MΩ | R0603 | U5.7 (OUTB) | U5.5 (INB+) | Hysteresis (positive feedback) |
| R10 | 1kΩ | R0603 | U5.7 (OUTB) | GND | Output pull-down |
| R22 | 330Ω | R0603 | U5.7 (OUTB) | TACHO | Series output filter (ESD + LP) |
| C23 | 100nF | C0603 | TACHO | GND | Output LP filter for TACHO |
| C14 | 100nF | C0603 | U5.8 (VDD) | GND | VDD decoupling |
| R_REF1 | 10kΩ | R0603 | 3V3_LOG | U5.6 (INB-) | Vref divider (top) |
| R_REF2 | 10kΩ | R0603 | U5.6 (INB-) | GND | Vref divider (bottom), Vref = 1.65V |
| R_REF2_ALT | NC (tuning) | R0603 | U5.6 (INB-) | GND | **Parallel with R_REF2.** Populate to lower Vref. See § Tuning Pads |
| C13 | 100nF | C0603 | U5.6 (INB-) | GND | Vref noise filter |

### Op-amp alternatives (same SOIC-8 pinout, drop-in)

| Part | Supply | Output | Notes |
|------|--------|--------|-------|
| **LMV358** | 2.7–5 V | Rail-to-rail | **Selected.** Full swing at 3.3 V, LCSC C2923376 |
| LM358 | 3–32 V | Not RRO (Voh ≈ V+−1.5 V) | Cheaper; at 3.3 V, Voh ≈ 1.8 V — marginal |
| TLV9062 | 1.8–5.5 V | RRIO | Better specs, slightly more expensive |
| MCP6002 | 1.8–6 V | RRIO | Low power alternative |

### Tuning Pads (R12_ALT, R_REF2_ALT)

Two extra 0603 pads for empirical tuning of tacho sensitivity without layout changes.
Both are **default NC** (not populated). The tacho circuit detects commutator-switching transients
on MCOM (inductive kickback spikes). If the pulses are too weak to trigger Stage B,
populate these pads to adjust gain and/or threshold.

Background: The tacho circuit counts commutator steps on MCOM for position tracking
(2600–6300+ steps per stroke). Back-EMF signals from HmIP-VDMOT motors can be small
(80mV–2.75V depending on measurement point and conditions). Our circuit measures transient
spikes on the shared return path, which are typically larger than steady-state BEMF, but
may still need tuning.

**R12_ALT — Stage A gain adjustment (parallel with R12):**

```
U5.1 (OUTA) ──┬── R12 (680Ω) ──┬── U5.2 (INA-)
               └── R12_ALT (NC) ┘
```

| R12 | R12_ALT | Effective R | Gain (1+R/R13) | Net gain | Use case |
|-----|---------|-------------|----------------|----------|----------|
| 680Ω | NC | 680Ω | 1.25× | 0.63× | Default |
| 680Ω | 680Ω | 340Ω | 1.13× | 0.56× | Lower gain (unlikely needed) |
| **15kΩ** (swap R12) | NC | 15kΩ | 6.56× | 3.28× | High gain if pulses are weak |
| **15kΩ** (swap R12) | 15kΩ | 7.5kΩ | 3.78× | 1.89× | Trim back from high gain |
| **15kΩ** (swap R12) | 10kΩ | 6kΩ | 3.22× | 1.61× | Fine-tune down |

Tuning procedure: If default gain is insufficient, desolder R12 (680Ω), replace with 15kΩ.
Then use R12_ALT to fine-tune gain downward if needed.

**R_REF2_ALT — Vref threshold adjustment (parallel with R_REF2):**

```
3V3_LOG ── R_REF1 (10kΩ) ──┬── U5 pin 6 (INB-)
                            │
                       C13 (100nF)
                            │
           R_REF2 (10kΩ) ──┤
          R_REF2_ALT (NC) ──┘
                            │
                           GND
```

| R_REF2 | R_REF2_ALT | Effective R | Vref | Min. pulse @ 0.63× | Min. pulse @ 3.28× |
|--------|------------|-------------|------|---------------------|---------------------|
| 10kΩ | NC | 10kΩ | 1.65V | 2.63V | 0.50V |
| 10kΩ | 10kΩ | 5kΩ | 1.10V | 1.75V | 0.34V |
| 10kΩ | 4.7kΩ | 3.2kΩ | 0.80V | 1.27V | 0.24V |
| 10kΩ | 2.2kΩ | 1.8kΩ | 0.49V | 0.78V | 0.15V |

Tuning procedure: Simply solder R_REF2_ALT to lower threshold — no desoldering needed.

**Recommended first-prototype test sequence:**
1. Build with default values (R12=680Ω, R_REF2=10kΩ, both _ALT pads NC)
2. Connect oscilloscope to MCOM and U5 pin 1 (OUTA) during motor operation
3. If OUTA peaks don't reach 1.65V: populate R_REF2_ALT (start with 10kΩ → Vref=1.1V)
4. If still insufficient: swap R12 to 15kΩ for higher gain
5. Fine-tune with R12_ALT and R_REF2_ALT values as needed

### Net output

- **TACHO** (from U5 pin 7, OUTB) → R22 (330Ω series) + C23 (100nF LP to GND) → TACHO net → Controller GPIO7. ESPHome: `inverted: true`.

## INA219 Support Components

| Ref | Value | Footprint | Net From | Net To | Purpose |
|-----|-------|-----------|----------|--------|---------|
| C12 | 100nF | C0603 | 3V3_LOG (U1.VS) | GND | VS decoupling |
| R7 | 10Ω | R0603 | MCOM | U1.VIN+ (pin 8) | IN+ filter |
| R8 | 10Ω | R0603 | U1.VIN- (pin 7) | MCOM_SENSE | IN- filter |
| C11 | 100nF | C0603 | VIN+ (pin 8) | VIN- (pin 7) | Differential input filter |

## INA219 Configuration (ESPHome)

```yaml
sensor:
  - platform: ina219
    address: 0x40
    shunt_resistance: 0.1 ohm
    max_current: 0.5A
    current:
      name: "Motor Current"
      id: motor_current
      accuracy_decimals: 1
      unit_of_measurement: "mA"
      filters:
        - multiply: 1000  # Convert A to mA
    power:
      name: "Motor Power"
      id: motor_power
      accuracy_decimals: 2
    bus_voltage:
      name: "Motor Bus Voltage"
      id: motor_bus_voltage
      accuracy_decimals: 2
    shunt_voltage:
      name: "Motor Shunt Voltage"
      id: motor_shunt_voltage
      accuracy_decimals: 4
    update_interval: 50ms  # 20Hz for responsive endstop detection
```

### Software Changes Needed

The `motor_driver.yaml` needs updating to use INA219 instead of ADC:

1. **Remove** ADC sensor definitions (`adc_current_pin`, `adc_ref_pin`)
2. **Add** INA219 sensor platform (as above)
3. **Update** current reading in 10ms interval:
   - Replace `id(${id_prefix}motor_current_adc).state` with `id(motor_current).state`
   - Remove reference voltage subtraction (INA219 measures differential internally)
   - Remove `current_gain` parameter (INA219 calibrates automatically)
4. **Free** GPIO1, GPIO12, GPIO13 for other use (or leave unconnected)

### Performance Comparison

| Parameter | Old (AD8628 + ADC) | New (INA219) |
|-----------|-------------------|--------------|
| Resolution | 12-bit ESP32 ADC (~0.8mV) | 12-bit INA219 (~10µV shunt) |
| Noise | Susceptible to ADC noise | Differential, lower noise |
| Sample rate | 100Hz (10ms interval) | Up to 100Hz (configurable) |
| Accuracy | Dependent on op-amp gain tolerance | ±1% calibrated |
| Components | ~18 (2 ICs + 16 passives) | 3 (1 IC + 1 shunt + 2 caps) |
| PCB area | Large (analog routing critical) | Small (SOIC-8 + R2512) |

## Net Connections

### Inputs (from Motor section)
- MCOM: Motor common negative return (before shunt)

### Outputs
- MCOM_SENSE: After shunt, connects to GND plane
- TACHO: (from U5 pin 7, OUTB) → R22 (330Ω) + C23 (100nF LP) → TACHO net → Controller GPIO7

### I2C Bus (shared with Controller)
- I2C_SDA: Bidirectional data
- I2C_SCL: Clock

### Power (from Power section)
- 3V3_LOG: Supply for INA219
- GND: Ground plane

## PCB Layout Notes

- Place INA219 close to shunt resistor (minimize trace length between IN+/IN-)
- Keep IN+/IN- traces parallel and close together (differential pair)
- Route I2C traces away from motor power traces
- Place decoupling cap (C12) close to INA219 VS pin
- Shunt resistor should be on the same layer as INA219 for short Kelvin connections
- GND plane under INA219 for noise shielding
- Place U5 (LMV358) near MCOM; keep tacho input trace short and away from motor power
- Place R12_ALT pads parallel with R12, close to U5 (same nets: OUTA ↔ INA-)
- Place R_REF2_ALT pads parallel with R_REF2, close to U5 pin 6 (same nets: INB- ↔ GND)

## BOM Summary (Analog Section)

| Ref | Component | Value | Footprint | LCSC | Category |
|-----|-----------|-------|-----------|------|----------|
| U1 | INA219AIDR | - | SOIC-8 | C982452 | Extended |
| U5 | LMV358 (dual op-amp) | - | SOIC-8 | C2923376 | Basic |
| R_SHUNT | Shunt resistor | 100mΩ ±1% | R2512 | C25942 | Basic |
| R7 | Resistor | 10Ω | R0603 | TBD | Basic |
| R8 | Resistor | 10Ω | R0603 | TBD | Basic |
| R9 | Resistor | 1kΩ | R0603 | TBD | Basic |
| R10 | Resistor | 1kΩ | R0603 | TBD | Basic |
| R11 | Resistor | 1MΩ | R0603 | TBD | Basic |
| R12 | Resistor | 680Ω | R0603 | TBD | Basic |
| R13 | Resistor | 2.7kΩ | R0603 | TBD | Basic |
| R14 | Resistor | 4.7kΩ | R0603 | TBD | Basic |
| R15 | Resistor | 4.7kΩ | R0603 | TBD | Basic |
| R12_ALT | Resistor (tuning) | NC | R0603 | - | Parallel R12, default NC |
| R22 | Resistor | 330Ω | R0603 | TBD | Basic |
| C11 | Ceramic cap | 100nF | C0603 | C14663 | Basic |
| C12 | Ceramic cap | 100nF | C0603 | C14663 | Basic |
| C13 | Ceramic cap | 100nF | C0603 | C14663 | Basic |
| C14 | Ceramic cap | 100nF | C0603 | C14663 | Basic |
| C15 | Ceramic cap | 220nF | C0603 | TBD | Basic |
| C23 | Ceramic cap | 100nF | C0603 | C14663 | Basic |
| R_REF1 | Resistor | 10kΩ | R0603 | TBD | Basic |
| R_REF2 | Resistor | 10kΩ | R0603 | TBD | Basic |
| R_REF2_ALT | Resistor (tuning) | NC | R0603 | - | Parallel R_REF2, default NC |
