# =============================================================================
# HV6 Web API — ESPHome External Component
# =============================================================================
# Scaffold component for dedicated dashboard/API HTTP handlers.
# Initial implementation only wires dependencies and lifecycle hooks.
# =============================================================================

import esphome.codegen as cg
import esphome.config_validation as cv
from esphome.const import CONF_ID
from esphome.components.esp32 import include_builtin_idf_component
import gzip
from esphome.core import CORE

CODEOWNERS = ["@birkemosen"]
AUTO_LOAD = ["hv6_config_store", "hv6_valve_controller", "hv6_zone_controller"]

CONF_CONFIG_STORE_ID = "config_store_id"
CONF_VALVE_CONTROLLER_ID = "valve_controller_id"
CONF_ZONE_CONTROLLER_ID = "zone_controller_id"
CONF_DASHBOARD_JS = "dashboard_js"
CONF_DASHBOARD_CSS = "dashboard_css"

hv6_ns = cg.esphome_ns.namespace("hv6")
Hv6WebApi = hv6_ns.class_("Hv6WebApi", cg.Component)
Hv6ConfigStore = hv6_ns.class_("Hv6ConfigStore", cg.Component)
Hv6ValveController = hv6_ns.class_("Hv6ValveController", cg.Component)
Hv6ZoneController = hv6_ns.class_("Hv6ZoneController", cg.Component)

CONFIG_SCHEMA = cv.Schema(
    {
        cv.GenerateID(): cv.declare_id(Hv6WebApi),
        cv.Required(CONF_CONFIG_STORE_ID): cv.use_id(Hv6ConfigStore),
        cv.Required(CONF_VALVE_CONTROLLER_ID): cv.use_id(Hv6ValveController),
        cv.Required(CONF_ZONE_CONTROLLER_ID): cv.use_id(Hv6ZoneController),
        cv.Optional(CONF_DASHBOARD_JS): cv.file_,
        cv.Optional(CONF_DASHBOARD_CSS): cv.file_,
    }
).extend(cv.COMPONENT_SCHEMA)


def _embed_gzip_as_progmem(symbol: str, file_path: str) -> None:
    with open(file_path, encoding="utf-8") as f:
        content = f.read()
    compressed = gzip.compress(content.encode("utf-8"))
    size = len(compressed)
    bytes_str = ", ".join(str(b) for b in compressed)
    cg.add_global(cg.RawExpression(
           f"const uint8_t {symbol}_DATA[{size}] PROGMEM = {{{bytes_str}}}"
    ))
    cg.add_global(cg.RawExpression(
           f"const size_t {symbol}_SIZE = {size}"
    ))


async def to_code(config):
    include_builtin_idf_component("esp_http_server")

    var = cg.new_Pvariable(config[CONF_ID])
    await cg.register_component(var, config)

    config_store = await cg.get_variable(config[CONF_CONFIG_STORE_ID])
    cg.add(var.set_config_store(config_store))

    valve_ctrl = await cg.get_variable(config[CONF_VALVE_CONTROLLER_ID])
    cg.add(var.set_valve_controller(valve_ctrl))

    zone_ctrl = await cg.get_variable(config[CONF_ZONE_CONTROLLER_ID])
    cg.add(var.set_zone_controller(zone_ctrl))

    if CONF_DASHBOARD_JS in config:
        path = CORE.relative_config_path(config[CONF_DASHBOARD_JS])
        _embed_gzip_as_progmem("HV6_DASHBOARD_JS", path)
        cg.add_define("HV6_HAS_DASHBOARD")

    if CONF_DASHBOARD_CSS in config:
        path = CORE.relative_config_path(config[CONF_DASHBOARD_CSS])
        _embed_gzip_as_progmem("HV6_DASHBOARD_CSS", path)
