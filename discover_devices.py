#!/usr/bin/env python3
"""Discover ESPHome devices on the local network via mDNS (_esphomelib._tcp)."""
import sys
import time

try:
    from zeroconf import ServiceBrowser, Zeroconf
except ImportError:
    print("zeroconf not available — run from the ESPHome venv", file=sys.stderr)
    sys.exit(1)

timeout = float(sys.argv[1]) if len(sys.argv) > 1 else 5.0
found = {}


class Listener:
    def add_service(self, zc, service_type, name):
        info = zc.get_service_info(service_type, name)
        if info:
            found[name] = info.server.rstrip(".")

    def remove_service(self, *_):
        pass

    def update_service(self, *_):
        pass


zc = Zeroconf()
ServiceBrowser(zc, "_esphomelib._tcp.local.", Listener())
time.sleep(timeout)
zc.close()

for hostname in sorted(set(found.values())):
    print(hostname)
