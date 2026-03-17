import esphome.codegen as cg
import esphome.config_validation as cv
from esphome.components import i2c
from esphome.const import CONF_ID

DEPENDENCIES = ["i2c"]
MULTI_CONF = True

drv8215_ns = cg.esphome_ns.namespace("drv8215")
Drv8215 = drv8215_ns.class_("Drv8215", cg.Component, i2c.I2CDevice)

CONF_MOTOR_NUM = "motor_num"

CONFIG_SCHEMA = (
    cv.Schema(
        {
            cv.GenerateID(): cv.declare_id(Drv8215),
            cv.Optional(CONF_MOTOR_NUM, default=0): cv.int_range(0, 6),
        }
    )
    .extend(cv.COMPONENT_SCHEMA)
    .extend(i2c.i2c_device_schema(0x30))
)


async def to_code(config):
    var = cg.new_Pvariable(config[CONF_ID])
    await cg.register_component(var, config)
    await i2c.register_i2c_device(var, config)
    cg.add(var.set_motor_num(config[CONF_MOTOR_NUM]))
