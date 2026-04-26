# =============================================================================
# HV6 Zone Controller — ESPHome External Component
# =============================================================================
# Control algorithms (tanh/linear/PID), hydraulic balancing, failsafe logic.
# Ported from lib/zone_controller/ for ESPHome Component lifecycle.
# =============================================================================

import esphome.codegen as cg
import esphome.config_validation as cv
from esphome.const import CONF_ID
from esphome.components import sensor

CODEOWNERS = ["@birkemosen"]
# MQTT is optional; zigbee2mqtt subscription paths are #ifdef USE_MQTT
# gated. JSON is required for trace batches and for parsing z2m payloads.
DEPENDENCIES = ["json"]
AUTO_LOAD = ["hv6_config_store", "hv6_valve_controller"]

CONF_CONFIG_STORE_ID = "config_store_id"
CONF_VALVE_CONTROLLER_ID = "valve_controller_id"
CONF_CYCLE_INTERVAL = "cycle_interval"
CONF_PROBE_SENSORS = "probe_sensors"

hv6_ns = cg.esphome_ns.namespace("hv6")
Hv6ZoneController = hv6_ns.class_("Hv6ZoneController", cg.Component)
Hv6ConfigStore = hv6_ns.class_("Hv6ConfigStore", cg.Component)
Hv6ValveController = hv6_ns.class_("Hv6ValveController", cg.Component)

CONFIG_SCHEMA = cv.Schema(
    {
        cv.GenerateID(): cv.declare_id(Hv6ZoneController),
        cv.Required(CONF_CONFIG_STORE_ID): cv.use_id(Hv6ConfigStore),
        cv.Required(CONF_VALVE_CONTROLLER_ID): cv.use_id(Hv6ValveController),
        cv.Optional(CONF_CYCLE_INTERVAL, default="10s"): cv.positive_time_period_milliseconds,
        cv.Required(CONF_PROBE_SENSORS): cv.All(
            cv.ensure_list(cv.use_id(sensor.Sensor)), cv.Length(min=8, max=8)
        ),
    }
).extend(cv.COMPONENT_SCHEMA)


async def to_code(config):
    var = cg.new_Pvariable(config[CONF_ID])
    await cg.register_component(var, config)

    config_store = await cg.get_variable(config[CONF_CONFIG_STORE_ID])
    cg.add(var.set_config_store(config_store))

    valve_ctrl = await cg.get_variable(config[CONF_VALVE_CONTROLLER_ID])
    cg.add(var.set_valve_controller(valve_ctrl))

    cg.add(var.set_cycle_interval_ms(config[CONF_CYCLE_INTERVAL]))

    for i, sensor_id in enumerate(config[CONF_PROBE_SENSORS]):
        sens = await cg.get_variable(sensor_id)
        cg.add(var.set_probe_sensor(i, sens))
