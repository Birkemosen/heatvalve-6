# HeatValve-6 Rev 2.1 electrical design review

## Scope and status

This directory is the editable KiCad 10 implementation of Rev 2.1. The schematic
is suitable for detailed electrical review. The PCB is a placement baseline, not
a fabrication release: copper routing and mechanical fit still need to be completed.

## Current sensing and protection

`RSH1` is 2.2 ohm, with `RSH2` as a DNP parallel tuning footprint. All six driver
returns join the `SHUNT` side; only one valve may be driven at a time. `R13` makes
the single connection from the quiet shunt ground pickup to the main ground plane.

The INA180A1 gain is 20 V/V:

| Motor current | Shunt voltage | INA180 output |
|---:|---:|---:|
| 30 mA | 66 mV | 1.32 V |
| 60 mA | 132 mV | 2.64 V |
| 75 mA | 165 mV | 3.30 V nominal |
| 100 mA | 220 mV | saturated below the 3.3 V rail |

Intentional ADC saturation above roughly 70–75 mA does not defeat force protection:
the LM339B force comparator reads the raw shunt node. The INA180 is powered from
3.3 V, and `R14` plus the BAT54S clamp limit ADC injection during transients.

`FLIM_PWM` is filtered, attenuated by 9.1k/1k, and buffered. Its nominal 0–3.3 V
PWM-DAC range becomes approximately 0–327 mV at `FLIM_REF`, corresponding to a
raw-shunt threshold range of 0–149 mA with the 2.2 ohm shunt.

## Fail-safe behavior

The 74HC74 power-on RC holds asynchronous clear active, so `DRIVE_PERMIT` starts
low. Firmware explicitly arms the latch with a low pulse on `LATCH_ARM_N`. A rising
overcurrent comparator edge clocks D=0, dropping `DRIVE_PERMIT`; `LATCH_STATE`
is the complementary fault indication. `R29` also pulls permit low if the latch
output is not actively valid.

Firmware must never rely on the hardware latch as the normal stop mechanism, and
must still enforce the one-motor-at-a-time constraint.

## External interfaces

- USB-C USB 2.0 UFP: 5.1k CC resistors, USBLC6-2SC6 ESD, 22 ohm data resistors.
- Six 4P4C jacks: pin 1 NC, pin 2 MOT_A, pin 3 MOT_B, pin 4 NC.
- Three shared OneWire connectors: pin 1 +3V3, pin 2 DQ, pin 3 GND; 33 ohm source
  resistor, 4.7k pull-up, and ESD diode.
- DNP I2C header: pin 1 GND, pin 2 +3V3, pin 3 SDA/GPIO1, pin 4 SCL/GPIO2, with
  DNP 2.2k pull-ups.

## PCB stack and placement intent

- Board: 120 x 75 mm, four layers, two 3.2 mm M3 mounting holes.
- Top: components and signal routing.
- Inner 1: continuous GND reference plane.
- Inner 2: +3V3_SYS distribution plane, split/necked as required around analog routing.
- Bottom: return/power routing and low-priority signals where needed.
- The ESP32 antenna bridges a 20 x 11.5 mm U-notch cut into the top board edge;
  the wider module keepout remains free of copper and parts.
- Six drivers form repeated lanes directly above their 4P4C connectors.
- Shunt/INA/tacho/latch circuitry occupies the right-center analog region.

## Release gates

1. Confirm enclosure, connector pitch, USB opening, board outline, and mounting holes.
2. Confirm exact purchasable MPNs for the buck inductor, shunt, terminal blocks,
   USB connector, LEDs, and all protection parts.
3. Route the shunt as a true star return and route two Kelvin traces directly from
   `RSH1` pads; do not sample the high-current copper elsewhere.
4. Route USB D+/D- as a short, length-matched 90 ohm differential pair over GND.
5. Route each WSON motor output with a narrow neck-down escape, then widen to at
   least 0.5 mm; add thermal/return vias according to the DRV8837 layout guidance.
6. Keep PWM, motor outputs, and buck switch node away from `SHUNT`, `TAC_IN`,
   `TACHO_AMP`, `FLIM_REF`, and ADC traces.
7. Fill planes, run final KiCad DRC with zero errors/unconnected items, inspect
   Gerbers and drill files, then perform an independent schematic/PCB review.
8. Prototype with one populated motor lane first; tune tacho and force threshold
   before populating all six lanes.

## Prototype validation

1. Current-limited USB supply: verify no unintended motor enable during ramp/reset.
2. Check 3.3 V regulation, ripple, thermal rise, and worst-case USB current.
3. Verify native USB programming and ESD-protected data integrity.
4. Calibrate ADC current at 10, 30, 60, and 75 mA; confirm harmless saturation above it.
5. Sweep `FLIM_PWM`, measure the raw-shunt trip threshold, and verify the latch trips
   with firmware stalled and stays tripped until explicitly re-armed.
6. Capture commutation ripple on multiple valves and tune C15/C16, gain, and hysteresis.
7. Verify end-stop detection in both directions and under low/high supply conditions.
8. Validate OneWire with three branches and worst-case cable lengths before final routing.
