#!/usr/bin/env python3
"""
Motor Trace Capture — HeatValve-6
Subscribes to the live MQTT motor trace stream and saves a JSON file when the
motor stops. Run this before triggering calibration or a motor movement.

Usage:
  python3 tools/capture_motor_trace.py
  python3 tools/capture_motor_trace.py --host 192.168.10.52 --user birkelab-mqtt --password <pw>
  python3 tools/capture_motor_trace.py --output traces/  # save to custom directory

Dependencies:
  pip install paho-mqtt
"""

import argparse
import json
import sys
import time
from datetime import datetime
from pathlib import Path


def parse_args():
    p = argparse.ArgumentParser(description="Capture HeatValve-6 motor trace to JSON")
    p.add_argument("--host",     default="192.168.10.52", help="MQTT broker host")
    p.add_argument("--port",     type=int, default=1883,  help="MQTT broker port")
    p.add_argument("--user",     default="birkelab-mqtt", help="MQTT username")
    p.add_argument("--password", default="",              help="MQTT password")
    p.add_argument("--prefix",   default="heatvalve-6",  help="ESPHome MQTT topic prefix")
    p.add_argument("--output",   default=".",             help="Directory to save JSON files")
    p.add_argument("--idle-timeout", type=float, default=5.0,
                   help="Seconds of no new data before saving (default: 5)")
    return p.parse_args()


def main():
    args = parse_args()

    try:
        import paho.mqtt.client as mqtt
    except ImportError:
        print("ERROR: paho-mqtt not installed. Run: pip install paho-mqtt")
        sys.exit(1)

    output_dir = Path(args.output)
    output_dir.mkdir(parents=True, exist_ok=True)

    # Accumulated samples across all batches
    accumulated: list[dict] = []
    last_data_time: float = 0.0
    capturing = False
    save_pending = False

    trace_topics = [
        f"{args.prefix}/sensor/motor_trace_stream/state",
        f"{args.prefix}/text_sensor/motor_trace_stream/state",
    ]

    def save_trace():
        nonlocal accumulated, capturing, save_pending
        if not accumulated:
            capturing = False
            save_pending = False
            return

        ts = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = output_dir / f"motor_trace_{ts}.json"
        with open(filename, "w") as f:
            json.dump(accumulated, f)

        print(f"Saved {len(accumulated)} samples → {filename}")
        accumulated.clear()
        capturing = False
        save_pending = False

    def on_connect(client, userdata, flags, rc, *_extra):
        if rc == 0:
            print(f"Connected to {args.host}:{args.port}")
            for topic in trace_topics:
                client.subscribe(topic)
            print("Waiting for motor movement…\n")
        else:
            print(f"MQTT connect failed: rc={rc}")
            sys.exit(1)

    def on_message(client, userdata, msg):
        nonlocal accumulated, last_data_time, capturing, save_pending

        if msg.topic not in trace_topics:
            return

        payload = msg.payload.decode("utf-8", errors="replace").strip()
        if not payload or payload in ("No trace data", "Trace cleared"):
            return

        try:
            batch: list[dict] = json.loads(payload)
        except json.JSONDecodeError:
            return

        if not batch:
            return

        if not capturing:
            print("▶  Capturing…")
            capturing = True

        accumulated.extend(batch)
        last_data_time = time.monotonic()
        save_pending = True

    # Support both paho-mqtt < 2.0 and >= 2.0
    try:
        client = mqtt.Client(mqtt.CallbackAPIVersion.VERSION2)
    except AttributeError:
        client = mqtt.Client()
    if args.user:
        client.username_pw_set(args.user, args.password)

    client.on_connect = on_connect
    client.on_message = on_message

    try:
        client.connect(args.host, args.port, keepalive=60)
    except Exception as e:
        print(f"Cannot connect to {args.host}:{args.port}: {e}")
        sys.exit(1)

    client.loop_start()

    try:
        while True:
            time.sleep(0.5)
            if save_pending and last_data_time > 0:
                elapsed = time.monotonic() - last_data_time
                if elapsed >= args.idle_timeout:
                    save_trace()
                    print("Waiting for next motor movement…\n")
    except KeyboardInterrupt:
        if save_pending:
            save_trace()
        client.loop_stop()
        client.disconnect()


if __name__ == "__main__":
    main()
