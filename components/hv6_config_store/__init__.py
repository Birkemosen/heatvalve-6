# =============================================================================
# HV6 Config Store — ESPHome External Component
# =============================================================================
# Persists zone config, motor calibration, and control parameters to NVS.
# Adapted from lib/config_store/ for ESPHome Component lifecycle.
# =============================================================================

import esphome.codegen as cg
import esphome.config_validation as cv
from esphome.const import CONF_ID

CODEOWNERS = ["@birkemosen"]
# MQTT is optional; all MQTT-touching code in hv6_config_store.cpp is
# gated by #ifdef USE_MQTT. Listing it here as a hard dependency would
# force every firmware variant to link the MQTT client.
DEPENDENCIES = []

hv6_config_store_ns = cg.esphome_ns.namespace("hv6")
Hv6ConfigStore = hv6_config_store_ns.class_("Hv6ConfigStore", cg.Component)

CONFIG_SCHEMA = cv.Schema(
    {
        cv.GenerateID(): cv.declare_id(Hv6ConfigStore),
    }
).extend(cv.COMPONENT_SCHEMA)


async def to_code(config):
    var = cg.new_Pvariable(config[CONF_ID])
    await cg.register_component(var, config)
