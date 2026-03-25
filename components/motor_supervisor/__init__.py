import esphome.codegen as cg
import esphome.config_validation as cv
from esphome.components import binary_sensor, number, sensor
from esphome.const import CONF_ID

DEPENDENCIES = ["drv8215"]

motor_supervisor_ns = cg.esphome_ns.namespace("motor_supervisor")
MotorSupervisor = motor_supervisor_ns.class_("MotorSupervisor", cg.Component)

drv8215_ns = cg.esphome_ns.namespace("drv8215")
Drv8215 = drv8215_ns.class_("Drv8215")

CONF_MOTOR_1_ID = "motor_1_id"
CONF_MOTOR_2_ID = "motor_2_id"
CONF_MOTOR_3_ID = "motor_3_id"
CONF_MOTOR_4_ID = "motor_4_id"
CONF_MOTOR_5_ID = "motor_5_id"
CONF_MOTOR_6_ID = "motor_6_id"

CONF_IPROPI_VOLTAGE_ID = "ipropi_voltage_id"
CONF_NFAULT_ID = "nfault_id"

CONF_CURRENT_FACTOR_HIGH_ID = "current_factor_high_id"
CONF_LOW_CURRENT_THRESHOLD_ID = "low_current_threshold_id"
CONF_LOW_CURRENT_WINDOW_MS_ID = "low_current_window_ms_id"
CONF_MAX_RUNTIME_SECONDS_ID = "max_runtime_seconds_id"
CONF_PWM_BOOST_MS_ID = "pwm_boost_ms_id"
CONF_PWM_HOLD_DUTY_PERCENT_ID = "pwm_hold_duty_percent_id"
CONF_PWM_PERIOD_MS_ID = "pwm_period_ms_id"
CONF_CALIBRATION_MIN_TRAVEL_MS_ID = "calibration_min_travel_ms_id"
CONF_CALIBRATION_MAX_RETRIES_ID = "calibration_max_retries_id"
CONF_RELEARN_AFTER_MOVEMENTS_ID = "relearn_after_movements_id"
CONF_RELEARN_AFTER_HOURS_ID = "relearn_after_hours_id"
CONF_DRIFT_RELEARN_THRESHOLD_PERCENT_ID = "drift_relearn_threshold_percent_id"
CONF_PRESENCE_TEST_DURATION_MS_ID = "presence_test_duration_ms_id"

CONFIG_SCHEMA = cv.Schema(
    {
        cv.GenerateID(): cv.declare_id(MotorSupervisor),
        cv.Required(CONF_MOTOR_1_ID): cv.use_id(Drv8215),
        cv.Required(CONF_MOTOR_2_ID): cv.use_id(Drv8215),
        cv.Required(CONF_MOTOR_3_ID): cv.use_id(Drv8215),
        cv.Required(CONF_MOTOR_4_ID): cv.use_id(Drv8215),
        cv.Required(CONF_MOTOR_5_ID): cv.use_id(Drv8215),
        cv.Required(CONF_MOTOR_6_ID): cv.use_id(Drv8215),
        cv.Required(CONF_IPROPI_VOLTAGE_ID): cv.use_id(sensor.Sensor),
        cv.Required(CONF_NFAULT_ID): cv.use_id(binary_sensor.BinarySensor),
        cv.Required(CONF_CURRENT_FACTOR_HIGH_ID): cv.use_id(number.Number),
        cv.Required(CONF_LOW_CURRENT_THRESHOLD_ID): cv.use_id(number.Number),
        cv.Required(CONF_LOW_CURRENT_WINDOW_MS_ID): cv.use_id(number.Number),
        cv.Required(CONF_MAX_RUNTIME_SECONDS_ID): cv.use_id(number.Number),
        cv.Required(CONF_PWM_BOOST_MS_ID): cv.use_id(number.Number),
        cv.Required(CONF_PWM_HOLD_DUTY_PERCENT_ID): cv.use_id(number.Number),
        cv.Required(CONF_PWM_PERIOD_MS_ID): cv.use_id(number.Number),
        cv.Required(CONF_CALIBRATION_MIN_TRAVEL_MS_ID): cv.use_id(number.Number),
        cv.Required(CONF_CALIBRATION_MAX_RETRIES_ID): cv.use_id(number.Number),
        cv.Required(CONF_RELEARN_AFTER_MOVEMENTS_ID): cv.use_id(number.Number),
        cv.Required(CONF_RELEARN_AFTER_HOURS_ID): cv.use_id(number.Number),
        cv.Required(CONF_DRIFT_RELEARN_THRESHOLD_PERCENT_ID): cv.use_id(number.Number),
        cv.Required(CONF_PRESENCE_TEST_DURATION_MS_ID): cv.use_id(number.Number),
    }
).extend(cv.COMPONENT_SCHEMA)


async def to_code(config):
    var = cg.new_Pvariable(config[CONF_ID])
    await cg.register_component(var, config)

    drv1 = await cg.get_variable(config[CONF_MOTOR_1_ID])
    drv2 = await cg.get_variable(config[CONF_MOTOR_2_ID])
    drv3 = await cg.get_variable(config[CONF_MOTOR_3_ID])
    drv4 = await cg.get_variable(config[CONF_MOTOR_4_ID])
    drv5 = await cg.get_variable(config[CONF_MOTOR_5_ID])
    drv6 = await cg.get_variable(config[CONF_MOTOR_6_ID])

    cg.add(var.set_motor_1(drv1))
    cg.add(var.set_motor_2(drv2))
    cg.add(var.set_motor_3(drv3))
    cg.add(var.set_motor_4(drv4))
    cg.add(var.set_motor_5(drv5))
    cg.add(var.set_motor_6(drv6))

    ipropi_voltage = await cg.get_variable(config[CONF_IPROPI_VOLTAGE_ID])
    nfault = await cg.get_variable(config[CONF_NFAULT_ID])

    cg.add(var.set_ipropi_voltage_sensor(ipropi_voltage))
    cg.add(var.set_nfault_sensor(nfault))

    current_factor_high = await cg.get_variable(config[CONF_CURRENT_FACTOR_HIGH_ID])
    low_current_threshold = await cg.get_variable(config[CONF_LOW_CURRENT_THRESHOLD_ID])
    low_current_window_ms = await cg.get_variable(config[CONF_LOW_CURRENT_WINDOW_MS_ID])
    max_runtime_seconds = await cg.get_variable(config[CONF_MAX_RUNTIME_SECONDS_ID])
    pwm_boost_ms = await cg.get_variable(config[CONF_PWM_BOOST_MS_ID])
    pwm_hold_duty_percent = await cg.get_variable(config[CONF_PWM_HOLD_DUTY_PERCENT_ID])
    pwm_period_ms = await cg.get_variable(config[CONF_PWM_PERIOD_MS_ID])
    calibration_min_travel_ms = await cg.get_variable(config[CONF_CALIBRATION_MIN_TRAVEL_MS_ID])
    calibration_max_retries = await cg.get_variable(config[CONF_CALIBRATION_MAX_RETRIES_ID])
    relearn_after_movements = await cg.get_variable(config[CONF_RELEARN_AFTER_MOVEMENTS_ID])
    relearn_after_hours = await cg.get_variable(config[CONF_RELEARN_AFTER_HOURS_ID])
    drift_relearn_threshold_percent = await cg.get_variable(config[CONF_DRIFT_RELEARN_THRESHOLD_PERCENT_ID])
    presence_test_duration_ms = await cg.get_variable(config[CONF_PRESENCE_TEST_DURATION_MS_ID])

    cg.add(var.set_current_factor_high_number(current_factor_high))
    cg.add(var.set_low_current_threshold_number(low_current_threshold))
    cg.add(var.set_low_current_window_ms_number(low_current_window_ms))
    cg.add(var.set_max_runtime_seconds_number(max_runtime_seconds))
    cg.add(var.set_pwm_boost_ms_number(pwm_boost_ms))
    cg.add(var.set_pwm_hold_duty_percent_number(pwm_hold_duty_percent))
    cg.add(var.set_pwm_period_ms_number(pwm_period_ms))
    cg.add(var.set_calibration_min_travel_ms_number(calibration_min_travel_ms))
    cg.add(var.set_calibration_max_retries_number(calibration_max_retries))
    cg.add(var.set_relearn_after_movements_number(relearn_after_movements))
    cg.add(var.set_relearn_after_hours_number(relearn_after_hours))
    cg.add(var.set_drift_relearn_threshold_percent_number(drift_relearn_threshold_percent))
    cg.add(var.set_presence_test_duration_ms_number(presence_test_duration_ms))
