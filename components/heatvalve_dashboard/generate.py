#!/usr/bin/env python3
"""Generate gzipped C header from dashboard HTML source."""
import gzip
import os
import sys

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))


def generate_header(source_path, output_path, var_name, len_name):
    with open(source_path, "r", encoding="utf-8") as f:
        content = f.read()

    compressed = gzip.compress(content.encode("utf-8"), compresslevel=9)

    hex_array = ", ".join(f"0x{byte:02x}" for byte in compressed)

    with open(output_path, "w", encoding="utf-8") as f:
        f.write("#pragma once\n")
        f.write(f"// Auto-generated from {os.path.basename(source_path)}\n")
        f.write(f"// Original size: {len(content)} bytes\n")
        f.write(f"// Compressed size: {len(compressed)} bytes\n\n")
        f.write(f"static const uint8_t {var_name}[] = {{\n")

        line_width = 16
        for i in range(0, len(compressed), line_width):
            chunk = compressed[i : i + line_width]
            hex_line = ", ".join(f"0x{byte:02x}" for byte in chunk)
            f.write(f"  {hex_line},\n")

        f.write("};\n\n")
        f.write(f"static const size_t {len_name} = {len(compressed)};\n")

    print(f"Generated {output_path}")
    print(f"  Source: {len(content)} bytes -> Compressed: {len(compressed)} bytes")


if __name__ == "__main__":
    generate_header(
        os.path.join(SCRIPT_DIR, "dashboard_source.html"),
        os.path.join(SCRIPT_DIR, "dashboard_html.h"),
        "DASHBOARD_HTML_GZ",
        "DASHBOARD_HTML_GZ_LEN",
    )
