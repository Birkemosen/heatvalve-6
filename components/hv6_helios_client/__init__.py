import esphome.codegen as cg
import esphome.config_validation as cv
from esphome.const import CONF_ID

DEPENDENCIES = ["network"]
AUTO_LOAD = []

CONF_ZONE_CONTROLLER_ID = "zone_controller_id"
CONF_CONFIG_STORE_ID = "config_store_id"
CONF_TIME_ID = "time_id"

hv6_helios_client_ns = cg.esphome_ns.namespace("hv6_helios_client")
hv6_ns = cg.esphome_ns.namespace("hv6")
Hv6HeliosClient = hv6_helios_client_ns.class_("Hv6HeliosClient", cg.Component)
Hv6ZoneController = hv6_ns.class_("Hv6ZoneController", cg.Component)
Hv6ConfigStore = hv6_ns.class_("Hv6ConfigStore", cg.Component)

CONFIG_SCHEMA = cv.Schema(
    {
        cv.GenerateID(CONF_ID): cv.declare_id(Hv6HeliosClient),
        cv.Required(CONF_ZONE_CONTROLLER_ID): cv.use_id(Hv6ZoneController),
        cv.Required(CONF_CONFIG_STORE_ID): cv.use_id(Hv6ConfigStore),
        cv.Optional(CONF_TIME_ID): cv.use_id(cg.esphome_ns.class_("RealTimeClock")),
    }
).extend(cv.COMPONENT_SCHEMA)


async def to_code(config):
    var = cg.new_Pvariable(config[CONF_ID])
    await cg.register_component(var, config)

    zone_ctrl = await cg.get_variable(config[CONF_ZONE_CONTROLLER_ID])
    cg.add(var.set_zone_controller(zone_ctrl))

    config_store = await cg.get_variable(config[CONF_CONFIG_STORE_ID])
    cg.add(var.set_config_store(config_store))

    if CONF_TIME_ID in config:
        time_comp = await cg.get_variable(config[CONF_TIME_ID])
        cg.add(var.set_time_component(time_comp))
