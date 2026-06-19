# Rev 2.1 current, BEMF, engagement, and position model

## Purpose

Rev 2.1 separates force measurement from motion measurement:

- `ADC_CURRENT` measures shared-shunt motor current for load, engagement, jam,
  and force protection.
- `ADC_BEMF` measures the selected motor's differential generated voltage.
- `TACHO_EDGE` provides hardware-timed candidate commutation edges to PCNT.

Current ripple alone is not accepted as proof of rotation because PWM/current-decay
activity can continue while a rotor is stalled. BEMF is weak at startup and standstill,
so neither signal is sufficient alone.

## Mechanical landmarks

Closing motion is divided into four regions:

```text
OPEN ENDSTOP -> FREE TRAVEL -> PIN ENGAGEMENT -> MODULATION STROKE -> CLOSED ENDSTOP
```

The useful flow-control range is the loaded stroke between pin engagement and the
closed endstop. Free travel does not provide useful proportional flow control.

Persist per valve and per direction:

- open-endstop count;
- pin-engagement count and uncertainty;
- closed-endstop count;
- free-running and loaded current distributions;
- engagement peak, duration, and impulse;
- normal commutation-period distribution;
- opening/closing backlash compensation;
- learned modulation-stroke count.

The position estimate is incremental and therefore invalid after an unclean reset
until the valve is homed. Every verified endpoint re-synchronizes the count.

## Pin-engagement recognition

Pin engagement is a landmark, not an endstop. Confirm it only when all of the following
occur after startup blanking:

1. Current rises significantly above the learned free-running distribution.
2. Qualified BEMF/commutation evidence continues through the event.
3. Position advances by a minimum number of accepted commutation edges.
4. Current subsequently settles into the learned loaded-stroke distribution.
5. The candidate count lies inside a plausible window learned from earlier cycles.

Do not confirm engagement at the initial current peak. Confirm it retrospectively after
the settle and continued-motion conditions are satisfied.

## Candidate tacho qualification

PCNT edges are candidates. Firmware accepts an edge as position only when:

- the selected BEMF channel matches the active motor;
- the edge is outside direction-change and switching blanking windows;
- raw differential BEMF indicates rotation;
- its interval is inside the learned physical cadence window;
- the interval does not match PWM or coast-sampling frequency;
- it is not a duplicate inside the minimum-period guard.

If continuous-drive BEMF is contaminated, command a short coast window by driving both
DRV8837 inputs low, wait for recirculation current to decay, sample `ADC_BEMF`, then
resume drive. Coast duration and sample delay are prototype-tuned values, not schematic
constants.

## Endstop and fault classification

| Observation | Classification | Action |
|---|---|---|
| Temporary current peak, tacho continues, current settles | Pin engagement | Record candidate landmark; continue |
| Tacho stops, current elevated, position near learned endpoint | Normal endstop | Stop and re-zero endpoint |
| Tacho stops, current elevated, position mid-stroke | Jam/obstruction | Stop, latch firmware fault, do not relearn |
| Tacho stops, current low | Open circuit/disconnected motor | Stop and report wiring fault |
| Candidate pulses continue but raw BEMF says stationary | Switching/noise false edges | Reject counts; stop as abnormal stall |
| Current exceeds hardware limit | Destructive force/short | Asynchronous latch removes `DRIVE_PERMIT` |
| Runtime exceeds hard cap | Detection failure | Stop unconditionally |

Normal endstop detection requires prior confirmed rotation and loss of motion for
multiple expected commutation periods. One missing edge is not an endstop.

## Flow mapping

For closing-direction counts increasing from engagement to closed:

```text
flow_fraction = 1 - (position - P_ENGAGE) / (P_CLOSED - P_ENGAGE)
target_count  = P_CLOSED - requested_flow * (P_CLOSED - P_ENGAGE)
```

Clamp the result to the learned modulation stroke. A 100% command may use a small
release margin on the open side of `P_ENGAGE`; a fully-open service/calibration command
continues to the open endstop. Compensate directional backlash or approach precision
targets from a consistent direction.

## Prototype gate

Do not release the PCB measurement values or production thresholds until simultaneous
oscilloscope/ADC captures demonstrate separation among startup, engagement, loaded
travel, closed stop, open stop, obstruction, and disconnected-motor cases across the
intended actuator population and supply range.

Background references:

- [TI: sensorless position control for brushed DC motors](https://e2e.ti.com/support/motor-drivers-group/motor-drivers/f/motor-drivers-forum/1333922/drv8234-how-can-i-implement-sensorless-position-control-for-bdc)
- [VdMot Controller: separate current and back-EMF measurement](https://github.com/Lenti84/VdMot_Controller)
- [SOLO: limits of back-EMF sensorless estimation](https://www.solomotorcontrollers.com/blog/sensorless/)
