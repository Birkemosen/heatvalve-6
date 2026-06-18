# HeatValve-6 Rev 2.1 hardware

Editable KiCad 10 design for the USB-C-powered, six-channel DRV8837 HeatValve controller.

## Design state

- Schematic: complete first electrical-review revision; KiCad ERC reports 0 errors.
- PCB: compact four-layer 120 x 75 mm placement review with 103 electrical
  footprints, two M3 holes, an antenna notch, GND/+3V3 inner planes, and an
  intentionally unrouted ratsnest.
- Fabrication status: **not released**. Routing, mechanical confirmation, and final
  footprint/availability review are still required.
- Prototype tuning: tacho filter/gain, force threshold, and optional parallel shunt.

## Generate and validate

```bash
PYTHONPATH=/private/tmp/kicad_pydeps HOME=/private/tmp \
  python3 hardware/heatvalve-6-rev2.1/generate_kicad.py

kicad-cli sch erc \
  --output hardware/heatvalve-6-rev2.1/erc.rpt \
  hardware/heatvalve-6-rev2.1/heatvalve-6-rev2.1.kicad_sch

/Applications/KiCad/KiCad.app/Contents/Frameworks/Python.framework/Versions/3.9/bin/python3.9 \
  hardware/heatvalve-6-rev2.1/generate_pcb.py

kicad-cli pcb drc \
  --output hardware/heatvalve-6-rev2.1/drc.rpt \
  hardware/heatvalve-6-rev2.1/heatvalve-6-rev2.1.kicad_pcb
```

The committed `.kicad_sch` is usable without the Python generator dependency.

## Important design decisions

- Motors and logic operate from the MT2492-generated 3.3 V rail.
- Only one motor may run at a time.
- All DRV8837 ground returns meet at `SHUNT`; `RSH1` is the only normal return to system ground.
- INA180A1 provides x20 current gain. Its 3.3 V supply inherently bounds the normal output.
- `R14`, `C13`, and `D5` provide additional ADC filtering and rail clamp protection.
- The hardware force-limit comparator reads the raw Kelvin shunt and remains effective if the ADC path saturates.
- The latch powers up with `DRIVE_PERMIT` low and must be explicitly armed by firmware.
- Three OneWire connectors share GPIO42. The DNP I2C header uses GPIO1/GPIO2.
- Motor jacks use the center pair: pin 2 `MOT_A`, pin 3 `MOT_B`.

See `design-review.md` for calculations, interfaces, and the remaining release gates.
