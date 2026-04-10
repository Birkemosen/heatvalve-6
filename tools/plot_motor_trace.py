#!/usr/bin/env python3
"""
Plot HeatValve motor trace JSON as interactive HTML.

Input sample fields:
  t = milliseconds since trace start
  r = ripple count
  i = motor current in mA
  a = raw ADC
  p = drive on/off (0/1)

Usage:
  python3 tools/plot_motor_trace.py traces/motor_trace_20260404_171933.json
  python3 tools/plot_motor_trace.py traces/motor_trace_20260404_171933.json --all-segments
  python3 tools/plot_motor_trace.py traces/motor_trace_20260404_171933.json --spike-ma 30
"""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path
from statistics import mean

import plotly.graph_objects as go
from plotly.subplots import make_subplots


REQUIRED_FIELDS = ("t", "r", "i", "a", "p")


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Plot HeatValve motor trace JSON")
    parser.add_argument("input", help="Path to motor_trace_*.json file")
    parser.add_argument(
        "--output",
        default=None,
        help="Output HTML path (default: same as input with .html extension)",
    )
    parser.add_argument(
        "--all-segments",
        action="store_true",
        help="Plot all segments split by time resets (default: largest segment only)",
    )
    parser.add_argument(
        "--spike-ma",
        type=float,
        default=30.0,
        help="Highlight current spikes >= this threshold in mA (default: 30.0)",
    )
    return parser.parse_args()


def load_samples(path: Path) -> list[dict[str, int | float]]:
    try:
        payload = json.loads(path.read_text())
    except Exception as exc:
        raise RuntimeError(f"Failed to parse JSON: {exc}") from exc

    if not isinstance(payload, list):
        raise RuntimeError("JSON root must be a list")

    samples: list[dict[str, int | float]] = []
    for row in payload:
        if not isinstance(row, dict):
            continue

        if any(field not in row for field in REQUIRED_FIELDS):
            continue

        try:
            sample = {
                "t": int(row["t"]),
                "r": int(row["r"]),
                "i": float(row["i"]),
                "a": int(row["a"]),
                "p": int(row["p"]),
            }
        except (TypeError, ValueError):
            continue

        samples.append(sample)

    if not samples:
        raise RuntimeError("No valid samples found in input")

    return samples


def dedupe_preserve_order(samples: list[dict[str, int | float]]) -> list[dict[str, int | float]]:
    deduped: list[dict[str, int | float]] = []
    seen: set[tuple[int, int, float, int, int]] = set()

    for sample in samples:
        key = (
            int(sample["t"]),
            int(sample["r"]),
            float(sample["i"]),
            int(sample["a"]),
            int(sample["p"]),
        )
        if key in seen:
            continue
        seen.add(key)
        deduped.append(sample)

    return deduped


def split_segments(samples: list[dict[str, int | float]]) -> list[list[dict[str, int | float]]]:
    if not samples:
        return []

    segments: list[list[dict[str, int | float]]] = [[samples[0]]]
    last_t = int(samples[0]["t"])

    for sample in samples[1:]:
        t_now = int(sample["t"])
        if t_now < last_t:
            segments.append([sample])
        else:
            segments[-1].append(sample)
        last_t = t_now

    return [segment for segment in segments if segment]


def build_figure(segment: list[dict[str, int | float]], segment_idx: int, spike_ma: float) -> go.Figure:
    x_time = [int(s["t"]) for s in segment]
    ripple = [int(s["r"]) for s in segment]
    current_ma = [float(s["i"]) for s in segment]
    adc = [int(s["a"]) for s in segment]
    drive_on = [int(s["p"]) for s in segment]

    fig = make_subplots(
        rows=3,
        cols=1,
        shared_xaxes=True,
        vertical_spacing=0.06,
        subplot_titles=(
            f"Segment {segment_idx}: Ripple Count (r)",
            "Current (i) and ADC (a)",
            "Drive Enable (p)",
        ),
        specs=[[{}], [{"secondary_y": True}], [{}]],
    )

    fig.add_trace(go.Scatter(x=x_time, y=ripple, mode="lines", name="ripple_count"), row=1, col=1)

    fig.add_trace(go.Scatter(x=x_time, y=current_ma, mode="lines", name="current_mA"), row=2, col=1, secondary_y=False)

    fig.add_trace(go.Scatter(x=x_time, y=adc, mode="lines", name="adc_raw"), row=2, col=1, secondary_y=True)

    fig.add_trace(
        go.Scatter(x=x_time, y=drive_on, mode="lines", line_shape="hv", name="drive_on"),
        row=3,
        col=1,
    )

    spike_x = [int(s["t"]) for s in segment if float(s["i"]) >= spike_ma]
    spike_y = [float(s["i"]) for s in segment if float(s["i"]) >= spike_ma]
    if spike_x:
        fig.add_trace(
            go.Scatter(
                x=spike_x,
                y=spike_y,
                mode="markers",
                marker={"size": 7, "symbol": "x"},
                name=f"spikes >= {spike_ma:.1f} mA",
            ),
            row=2,
            col=1,
            secondary_y=False,
        )

    fig.update_xaxes(title_text="time (ms)", row=3, col=1)
    fig.update_yaxes(title_text="ripple count", row=1, col=1)
    fig.update_yaxes(title_text="current (mA)", row=2, col=1, secondary_y=False)
    fig.update_yaxes(title_text="adc raw", row=2, col=1, secondary_y=True)
    fig.update_yaxes(title_text="drive_on (0/1)", row=3, col=1, range=[-0.1, 1.1])

    fig.update_layout(
        height=980,
        title="HeatValve Motor Trace",
        legend={"orientation": "h"},
        hovermode="x unified",
    )

    return fig


def summarize_segment(segment: list[dict[str, int | float]]) -> dict[str, float | int]:
    currents = [float(s["i"]) for s in segment]
    ripples = [int(s["r"]) for s in segment]
    drives = [1 if int(s["p"]) else 0 for s in segment]
    t_start = int(segment[0]["t"])
    t_end = int(segment[-1]["t"])

    return {
        "samples": len(segment),
        "duration_ms": max(0, t_end - t_start),
        "i_min": min(currents),
        "i_avg": mean(currents),
        "i_max": max(currents),
        "r_min": min(ripples),
        "r_max": max(ripples),
        "drive_pct": mean(drives) * 100.0,
    }


def write_segment_plot(
    segment: list[dict[str, int | float]],
    segment_idx: int,
    out_path: Path,
    spike_ma: float,
) -> None:
    fig = build_figure(segment, segment_idx, spike_ma)
    fig.write_html(str(out_path), include_plotlyjs="cdn")


def main() -> int:
    args = parse_args()
    input_path = Path(args.input)

    if not input_path.exists():
        print(f"Input file does not exist: {input_path}")
        return 2

    output_path = Path(args.output) if args.output else input_path.with_suffix(".html")

    try:
        samples = load_samples(input_path)
        samples = dedupe_preserve_order(samples)
        segments = split_segments(samples)
    except RuntimeError as exc:
        print(f"Error: {exc}")
        return 2

    if not segments:
        print("No segments were produced from input")
        return 2

    if args.all_segments:
        for idx, segment in enumerate(segments):
            seg_out = output_path.with_name(f"{output_path.stem}_seg{idx}{output_path.suffix}")
            write_segment_plot(segment, idx, seg_out, args.spike_ma)
            summary = summarize_segment(segment)
            print(
                f"Wrote {seg_out} | seg={idx} samples={summary['samples']} "
                f"duration_ms={summary['duration_ms']} i_max={summary['i_max']:.1f}"
            )
    else:
        largest_idx = max(range(len(segments)), key=lambda i: len(segments[i]))
        segment = segments[largest_idx]
        write_segment_plot(segment, largest_idx, output_path, args.spike_ma)

        summary = summarize_segment(segment)
        print(f"Wrote {output_path}")
        print(
            f"Segment {largest_idx}: samples={summary['samples']} duration_ms={summary['duration_ms']} "
            f"i(min/avg/max)={summary['i_min']:.1f}/{summary['i_avg']:.1f}/{summary['i_max']:.1f} "
            f"r(min/max)={summary['r_min']}/{summary['r_max']} drive={summary['drive_pct']:.1f}%"
        )

    return 0


if __name__ == "__main__":
    sys.exit(main())
