# =============================================================================
# HV6 Valve Controller — ESPHome External Component
# =============================================================================
# 6x DRV8215 I2C motor drivers with current-sense endstop detection.
# Ported from lib/valve_controller/ for ESPHome Component lifecycle.
# =============================================================================

import esphome.codegen as cg
import esphome.config_validation as cv
from esphome.const import CONF_ID
from esphome.components import i2c, sensor
from esphome.components.esp32 import include_builtin_idf_component

CODEOWNERS = ["@birkemosen"]
DEPENDENCIES = ["i2c"]
AUTO_LOAD = ["hv6_config_store"]

CONF_CONFIG_STORE_ID = "config_store_id"
CONF_I2C_ID = "i2c_id"
CONF_NSLEEP_PIN = "nsleep_pin"
CONF_NFAULT_PIN = "nfault_pin"
CONF_IPROPI_PIN = "ipropi_pin"
CONF_CURRENT_SENSE = "current_sense"
CONF_MOTOR_ADDRESSES = "motor_addresses"

hv6_ns = cg.esphome_ns.namespace("hv6")
Hv6ValveController = hv6_ns.class_("Hv6ValveController", cg.Component)
Hv6ConfigStore = hv6_ns.class_("Hv6ConfigStore", cg.Component)

CONFIG_SCHEMA = cv.Schema(
    {
        cv.GenerateID(): cv.declare_id(Hv6ValveController),
        cv.Required(CONF_CONFIG_STORE_ID): cv.use_id(Hv6ConfigStore),
        cv.Required(CONF_I2C_ID): cv.use_id(i2c.I2CBus),
        cv.Required(CONF_NSLEEP_PIN): cv.int_,
        cv.Required(CONF_NFAULT_PIN): cv.int_,
        cv.Required(CONF_IPROPI_PIN): cv.int_,
        cv.Optional(CONF_CURRENT_SENSE): cv.use_id(sensor.Sensor),
        cv.Required(CONF_MOTOR_ADDRESSES): cv.All(
            cv.ensure_list(cv.hex_uint8_t), cv.Length(min=6, max=6)
        ),
    }
).extend(cv.COMPONENT_SCHEMA)


async def to_code(config):
    include_builtin_idf_component("esp_adc")
    include_builtin_idf_component("driver")

    var = cg.new_Pvariable(config[CONF_ID])
    await cg.register_component(var, config)

    config_store = await cg.get_variable(config[CONF_CONFIG_STORE_ID])
    cg.add(var.set_config_store(config_store))

    i2c_bus = await cg.get_variable(config[CONF_I2C_ID])
    cg.add(var.set_i2c_bus(i2c_bus))

    cg.add(var.set_nsleep_pin(config[CONF_NSLEEP_PIN]))
    cg.add(var.set_nfault_pin(config[CONF_NFAULT_PIN]))
    cg.add(var.set_ipropi_pin(config[CONF_IPROPI_PIN]))

    if CONF_CURRENT_SENSE in config:
        current_sensor = await cg.get_variable(config[CONF_CURRENT_SENSE])
        cg.add(var.set_current_sensor(current_sensor))

    for i, addr in enumerate(config[CONF_MOTOR_ADDRESSES]):
        cg.add(var.set_motor_address(i, addr))
