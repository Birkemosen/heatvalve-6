#!/usr/bin/env python3
"""Generate the initial HeatValve-6 Rev 2.1 four-layer PCB.

Run with KiCad's bundled Python so the pcbnew module exactly matches KiCad.
The schematic remains the source of truth for components and connectivity.
"""

from pathlib import Path
import subprocess
import tempfile
import xml.etree.ElementTree as ET

import pcbnew


ROOT = Path(__file__).resolve().parent
SCHEMATIC = ROOT / "heatvalve-6-rev2.1.kicad_sch"
OUTPUT = ROOT / "heatvalve-6-rev2.1.kicad_pcb"
CLI = "/opt/homebrew/bin/kicad-cli"
FP_ROOT = Path("/Applications/KiCad/KiCad.app/Contents/SharedSupport/footprints")

W, H = 120.0, 75.0
ANTENNA_NOTCH = (45.0, 0.0, 65.0, 11.5)


def mm(x, y):
    return pcbnew.VECTOR2I_MM(float(x), float(y))


def export_netlist():
    path = Path(tempfile.gettempdir()) / "heatvalve-6-rev2.1.xml"
    subprocess.run(
        [CLI, "sch", "export", "netlist", "--format", "kicadxml",
         "--output", str(path), str(SCHEMATIC)],
        check=True,
    )
    return ET.parse(path).getroot()


def parse_netlist(root):
    components = {}
    for node in root.find("components"):
        components[node.attrib["ref"]] = {
            "value": node.findtext("value") or "",
            "footprint": node.findtext("footprint") or "",
        }

    nets = {}
    pin_net = {}
    for node in root.find("nets"):
        name = node.attrib["name"]
        nets[name] = int(node.attrib["code"])
        for pin in node.findall("node"):
            pin_net[(pin.attrib["ref"], pin.attrib["pin"])] = name
    return components, nets, pin_net


def placements():
    p = {
        # Top/service region. The ESP antenna bridges the routed board notch.
        "J1": (10, 5, 180), "U2": (18, 8, 0),
        "SW1": (27, 5, 0), "SW2": (27, 13, 0),
        "J8": (90, 5, 180), "J9": (103, 5, 180),
        "J10": (103, 17, 180), "J11": (80, 19, 90),
        "D6": (110, 19, 0),

        # Power supply and MCU.
        "F1": (4, 16, 0), "U3": (12, 28, 0), "L1": (21, 28, 0),
        "FB1": (29, 28, 0), "U1": (55, 18, 0),

        # Status and shared sensing/protection region.
        "D1": (39, 35, 0), "D2": (44, 35, 0),
        "D3": (49, 35, 0), "D4": (54, 35, 0),
        "U9": (60, 34, 0), "U10": (76, 29, 0),
        "U11": (89, 29, 0), "U12": (102, 29, 0),
        "RSH1": (39, 40, 0), "RSH2": (45, 40, 0),
        "D5": (51, 40, 0),
    }

    # Six identical motor lanes: driver above its connector, local bypass nearby.
    xs = [17, 34, 51, 68, 85, 102]
    for index, x in enumerate(xs, 1):
        p[f"U{20 + index}"] = (x, 48, 0)
        # User-facing jack opening points toward the bottom board edge.
        p[f"J{1 + index}"] = (x, 57, 0)
        p[f"C{28 + 2 * index}"] = (x - 4, 44, 0)
        p[f"C{29 + 2 * index}"] = (x + 4, 44, 0)

    # Remaining passives are grouped on compact, manufacturable grids.
    groups = [
        (["R1", "R2", "R3", "R4", "C1", "C2", "C4", "C5", "C6"], 3, 21, 4.0),
        (["R5", "R6", "R7", "R8", "C7", "C8", "C9", "C10", "C11", "C12"], 3, 35, 4.0),
        (["R9", "R10", "R11", "R12", "R13", "R14", "C13", "C14", "C15", "C16"], 64, 36, 3.6),
        (["R15", "R16", "R17", "R18", "R19", "R20", "R21", "R22", "R23", "C17"], 82, 36, 3.6),
        (["R24", "R25", "R26", "R27", "R28", "R29", "C19", "C20", "C21"], 100, 36, 3.0),
        (["R40", "R41", "R42", "R43"], 87, 23, 3.8),
    ]
    for refs, x0, y0, pitch in groups:
        for i, ref in enumerate(refs):
            p[ref] = (x0 + (i % 5) * pitch, y0 + (i // 5) * 3.2, 0)
    # The electrolytic needs substantially more courtyard than the grid parts.
    p["C3"] = (36, 27, 0)
    p["C18"] = (80, 41, 0)
    return p


def load_footprint(lib_id):
    library, name = lib_id.split(":", 1)
    fp = pcbnew.FootprintLoad(str(FP_ROOT / f"{library}.pretty"), name)
    if fp is None:
        raise RuntimeError(f"Cannot load footprint {lib_id}")
    return fp


def add_edge(board, a, b):
    item = pcbnew.PCB_SHAPE(board)
    item.SetShape(pcbnew.SHAPE_T_SEGMENT)
    item.SetLayer(pcbnew.Edge_Cuts)
    item.SetStart(mm(*a))
    item.SetEnd(mm(*b))
    item.SetWidth(pcbnew.FromMM(0.1))
    board.Add(item)


def add_text(board, text, pos, size=1.2, layer=pcbnew.F_SilkS):
    item = pcbnew.PCB_TEXT(board)
    item.SetText(text)
    item.SetPosition(mm(*pos))
    item.SetLayer(layer)
    item.SetTextSize(mm(size, size))
    item.SetTextThickness(pcbnew.FromMM(0.18))
    board.Add(item)


def add_track(board, net, start, end, width=0.25, layer=pcbnew.F_Cu):
    track = pcbnew.PCB_TRACK(board)
    track.SetNet(net)
    track.SetLayer(layer)
    track.SetWidth(pcbnew.FromMM(width))
    track.SetStart(start)
    track.SetEnd(end)
    board.Add(track)


def route_orthogonal(board, net, start, end, width=0.25, layer=pcbnew.F_Cu, mid_y=None):
    if mid_y is None:
        mid_y = (pcbnew.ToMM(start.y) + pcbnew.ToMM(end.y)) / 2
    a = mm(pcbnew.ToMM(start.x), mid_y)
    b = mm(pcbnew.ToMM(end.x), mid_y)
    add_track(board, net, start, a, width, layer)
    add_track(board, net, a, b, width, layer)
    add_track(board, net, b, end, width, layer)


def add_zone(board, net, layer):
    zone = pcbnew.ZONE(board)
    zone.SetNet(net)
    zone.SetLayer(layer)
    zone.SetLocalClearance(pcbnew.FromMM(0.25))
    outline = zone.Outline()
    outline.NewOutline()
    for x, y in ((0.5, 0.5), (W - 0.5, 0.5), (W - 0.5, H - 0.5),
                 (0.5, H - 0.5), (0.5, 0.5)):
        outline.Append(pcbnew.FromMM(x), pcbnew.FromMM(y))
    board.Add(zone)


def generate():
    root = export_netlist()
    components, net_codes, pin_net = parse_netlist(root)
    pos = placements()
    missing = sorted(set(components) - set(pos))
    if missing:
        raise RuntimeError(f"Missing placement for: {', '.join(missing)}")

    board = pcbnew.BOARD()
    board.SetCopperLayerCount(4)
    settings = board.GetDesignSettings()
    settings.SetCustomTrackWidth(pcbnew.FromMM(0.25))
    settings.SetCustomViaSize(pcbnew.FromMM(0.65))
    settings.SetCustomViaDrill(pcbnew.FromMM(0.3))
    settings.UseCustomTrackViaSize(True)
    settings.m_MinThroughDrill = pcbnew.FromMM(0.2)
    settings.m_SolderMaskMinWidth = pcbnew.FromMM(0.05)

    net_items = {}
    for name, code in sorted(net_codes.items(), key=lambda pair: pair[1]):
        item = pcbnew.NETINFO_ITEM(board, name, code)
        board.Add(item)
        net_items[name] = item

    def named_net(name):
        """Global labels exported by KiCad XML normally carry a leading '/'."""
        return net_items.get(name) or net_items.get("/" + name)

    footprints = {}
    for ref in sorted(components):
        data = components[ref]
        fp = load_footprint(data["footprint"])
        fp.SetReference(ref)
        fp.SetValue(data["value"])
        # Compact production silkscreen uses functional labels; references
        # remain available on fabrication/assembly layers.
        fp.Reference().SetVisible(False)
        x, y, rotation = pos[ref]
        fp.SetPosition(mm(x, y))
        fp.SetOrientationDegrees(rotation)
        if ref == "U1":
            # The stock module silkscreen touches the intentional antenna
            # notch. Keep the full outline on F.Fab instead of clipping silk.
            for graphic in fp.GraphicalItems():
                if graphic.GetLayer() == pcbnew.F_SilkS:
                    graphic.SetLayer(pcbnew.F_Fab)
        board.Add(fp)
        footprints[ref] = fp
        for pad in fp.Pads():
            name = pin_net.get((ref, pad.GetNumber()))
            if name:
                pad.SetNet(net_items[name])

    # Two mounting holes flank the compact connector/electronics envelope.
    for ref, xy in zip(("H1", "H2"), ((4, 71), (116, 71))):
        fp = load_footprint("MountingHole:MountingHole_3.2mm_M3")
        fp.SetReference(ref)
        fp.SetValue("M3")
        fp.SetPosition(mm(*xy))
        fp.Reference().SetVisible(False)
        board.Add(fp)

    # External U-notch removes all PCB material beneath the module antenna.
    nx1, _, nx2, ny2 = ANTENNA_NOTCH
    outline = (
        ((0, 0), (nx1, 0)), ((nx1, 0), (nx1, ny2)),
        ((nx1, ny2), (nx2, ny2)), ((nx2, ny2), (nx2, 0)),
        ((nx2, 0), (W, 0)), ((W, 0), (W, H)),
        ((W, H), (0, H)), ((0, H), (0, 0)),
    )
    for a, b in outline:
        add_edge(board, a, b)

    add_text(board, "HEATVALVE-6 REV 2.1", (60, 72.5), 1.1)
    for i, x in enumerate((17, 34, 51, 68, 85, 102), 1):
        add_text(board, f"V{i}", (x, 52), 0.8)
    add_text(board, "RESET", (27, 8.5), 0.8)
    add_text(board, "BOOT", (27, 16.5), 0.8)
    add_text(board, "1-WIRE", (95, 11), 0.8)
    add_text(board, "I2C DNP", (80, 14), 0.8)

    # Routing is intentionally left as a ratsnest at this review milestone.
    # The 0.5 mm-pitch WSON motor outputs require neck-down escapes and vias;
    # speculative straight tracks can create plausible-looking hidden shorts.

    # Solid internal reference planes. They are deliberately on separate inner
    # layers so motor return current cannot share the analog Kelvin path.
    ground = named_net("GND")
    rail_3v3 = named_net("+3V3_SYS")
    if ground:
        add_zone(board, ground, pcbnew.In1_Cu)
    if rail_3v3:
        add_zone(board, rail_3v3, pcbnew.In2_Cu)

    title = board.GetTitleBlock()
    title.SetTitle("HeatValve-6 Rev 2.1")
    title.SetRevision("2.1")
    title.SetCompany("HeatValve-6")
    title.SetComment(0, "INITIAL PLACEMENT - NOT RELEASED FOR FABRICATION")

    pcbnew.SaveBoard(str(OUTPUT), board)
    print(f"Wrote {OUTPUT}")
    print(f"Placed {len(footprints)} electrical footprints + 2 mounting holes")


if __name__ == "__main__":
    generate()
