import esphome.codegen as cg
import esphome.config_validation as cv
from esphome.components import web_server_base, sensor, text_sensor
from esphome.const import CONF_ID
import gzip
from esphome.core import CORE

DEPENDENCIES = ["web_server_base", "network"] 
AUTO_LOAD = ["web_server_base"]

CONF_WEB_SERVER_BASE_ID = "web_server_base_id"
CONF_DASHBOARD_JS = "dashboard_js"
CONF_ZONE_CONTROLLER_ID = "zone_controller_id"
CONF_WIFI_SIGNAL_ID = "wifi_signal_id"
CONF_FIRMWARE_VERSION_ID = "firmware_version_id"
CONF_IP_ADDRESS_ID = "ip_address_id"
CONF_CONNECTED_SSID_ID = "connected_ssid_id"
CONF_MAC_ADDRESS_ID = "mac_address_id"
CONF_VALVE_CONTROLLER_ID = "valve_controller_id"
CONF_CONFIG_STORE_ID = "config_store_id"
CONF_MANIFOLD_FLOW_ID = "manifold_flow_id"
CONF_MANIFOLD_RETURN_ID = "manifold_return_id"
CONF_ZONE_TEMP_IDS = "zone_temp_ids"
CONF_ZONE_VALVE_IDS = "zone_valve_ids"
CONF_ZONE_PREHEAT_IDS = "zone_preheat_ids"
CONF_MOTOR_OPEN_RIPPLE_IDS = "motor_open_ripple_ids"
CONF_MOTOR_CLOSE_RIPPLE_IDS = "motor_close_ripple_ids"
CONF_MOTOR_OPEN_FACTOR_IDS = "motor_open_factor_ids"
CONF_MOTOR_CLOSE_FACTOR_IDS = "motor_close_factor_ids"
CONF_PROBE_TEMP_IDS = "probe_temp_ids"
CONF_ZONE_STATE_IDS = "zone_state_ids"
CONF_MOTOR_FAULT_IDS = "motor_fault_ids"

hv6_dashboard_ns = cg.esphome_ns.namespace("hv6_dashboard")
hv6_ns = cg.esphome_ns.namespace("hv6")
HV6Dashboard = hv6_dashboard_ns.class_("HV6Dashboard", cg.Component)
Hv6ZoneController = hv6_ns.class_("Hv6ZoneController", cg.Component)
Hv6ValveController = hv6_ns.class_("Hv6ValveController", cg.Component)
Hv6ConfigStore = hv6_ns.class_("Hv6ConfigStore", cg.Component)

CONFIG_SCHEMA = cv.Schema(
    {
        cv.GenerateID(CONF_ID): cv.declare_id(HV6Dashboard),
        cv.GenerateID(CONF_WEB_SERVER_BASE_ID): cv.use_id(web_server_base.WebServerBase),
        cv.Required(CONF_ZONE_CONTROLLER_ID): cv.use_id(Hv6ZoneController),
        cv.Optional(CONF_VALVE_CONTROLLER_ID): cv.use_id(Hv6ValveController),
        cv.Optional(CONF_CONFIG_STORE_ID): cv.use_id(Hv6ConfigStore),
        cv.Optional(CONF_WIFI_SIGNAL_ID): cv.use_id(sensor.Sensor),
        cv.Optional(CONF_MANIFOLD_FLOW_ID): cv.use_id(sensor.Sensor),
        cv.Optional(CONF_MANIFOLD_RETURN_ID): cv.use_id(sensor.Sensor),
        cv.Optional(CONF_ZONE_TEMP_IDS): cv.All(
            cv.ensure_list(cv.use_id(sensor.Sensor)), cv.Length(max=6)
        ),
        cv.Optional(CONF_ZONE_VALVE_IDS): cv.All(
            cv.ensure_list(cv.use_id(sensor.Sensor)), cv.Length(max=6)
        ),
        cv.Optional(CONF_ZONE_PREHEAT_IDS): cv.All(
            cv.ensure_list(cv.use_id(sensor.Sensor)), cv.Length(max=6)
        ),
        cv.Optional(CONF_MOTOR_OPEN_RIPPLE_IDS): cv.All(
            cv.ensure_list(cv.use_id(sensor.Sensor)), cv.Length(max=6)
        ),
        cv.Optional(CONF_MOTOR_CLOSE_RIPPLE_IDS): cv.All(
            cv.ensure_list(cv.use_id(sensor.Sensor)), cv.Length(max=6)
        ),
        cv.Optional(CONF_MOTOR_OPEN_FACTOR_IDS): cv.All(
            cv.ensure_list(cv.use_id(sensor.Sensor)), cv.Length(max=6)
        ),
        cv.Optional(CONF_MOTOR_CLOSE_FACTOR_IDS): cv.All(
            cv.ensure_list(cv.use_id(sensor.Sensor)), cv.Length(max=6)
        ),
        cv.Optional(CONF_PROBE_TEMP_IDS): cv.All(
            cv.ensure_list(cv.use_id(sensor.Sensor)), cv.Length(max=8)
        ),
        cv.Optional(CONF_FIRMWARE_VERSION_ID): cv.use_id(text_sensor.TextSensor),
        cv.Optional(CONF_IP_ADDRESS_ID): cv.use_id(text_sensor.TextSensor),
        cv.Optional(CONF_CONNECTED_SSID_ID): cv.use_id(text_sensor.TextSensor),
        cv.Optional(CONF_MAC_ADDRESS_ID): cv.use_id(text_sensor.TextSensor),
        cv.Optional(CONF_ZONE_STATE_IDS): cv.All(
            cv.ensure_list(cv.use_id(text_sensor.TextSensor)), cv.Length(max=6)
        ),
        cv.Optional(CONF_MOTOR_FAULT_IDS): cv.All(
            cv.ensure_list(cv.use_id(text_sensor.TextSensor)), cv.Length(max=6)
        ),
        cv.Optional(CONF_DASHBOARD_JS): cv.file_,
    }
).extend(cv.COMPONENT_SCHEMA)

def _embed_gzip_as_progmem(symbol: str, file_path: str) -> None:
    with open(file_path, encoding="utf-8") as f:
        content = f.read()
    compressed = gzip.compress(content.encode("utf-8"), compresslevel=9)
    size = len(compressed)
    bytes_str = ", ".join(str(b) for b in compressed)
    cg.add_global(cg.RawExpression(
        f"const uint8_t {symbol}_DATA[{size}] PROGMEM = {{{bytes_str}}};"
    ))
    cg.add_global(cg.RawExpression(
        f"const size_t {symbol}_SIZE = {size};"
    ))

async def to_code(config):
    var = cg.new_Pvariable(config[CONF_ID])
    await cg.register_component(var, config)

    wsb = await cg.get_variable(config[CONF_WEB_SERVER_BASE_ID])
    cg.add(var.set_web_server_base(wsb))

    zone_ctrl = await cg.get_variable(config[CONF_ZONE_CONTROLLER_ID])
    cg.add(var.set_zone_controller(zone_ctrl))

    if CONF_VALVE_CONTROLLER_ID in config:
        valve_ctrl = await cg.get_variable(config[CONF_VALVE_CONTROLLER_ID])
        cg.add(var.set_valve_controller(valve_ctrl))

    if CONF_CONFIG_STORE_ID in config:
        cfg_store = await cg.get_variable(config[CONF_CONFIG_STORE_ID])
        cg.add(var.set_config_store(cfg_store))

    if CONF_WIFI_SIGNAL_ID in config:
        wifi_signal = await cg.get_variable(config[CONF_WIFI_SIGNAL_ID])
        cg.add(var.set_wifi_signal_sensor(wifi_signal))

    if CONF_MANIFOLD_FLOW_ID in config:
        flow = await cg.get_variable(config[CONF_MANIFOLD_FLOW_ID])
        cg.add(var.set_manifold_flow_sensor(flow))

    if CONF_MANIFOLD_RETURN_ID in config:
        ret = await cg.get_variable(config[CONF_MANIFOLD_RETURN_ID])
        cg.add(var.set_manifold_return_sensor(ret))

    if CONF_ZONE_TEMP_IDS in config:
        for i, s_id in enumerate(config[CONF_ZONE_TEMP_IDS]):
            s = await cg.get_variable(s_id)
            cg.add(var.set_zone_temp_sensor(i, s))

    if CONF_ZONE_VALVE_IDS in config:
        for i, s_id in enumerate(config[CONF_ZONE_VALVE_IDS]):
            s = await cg.get_variable(s_id)
            cg.add(var.set_zone_valve_sensor(i, s))

    if CONF_ZONE_PREHEAT_IDS in config:
        for i, s_id in enumerate(config[CONF_ZONE_PREHEAT_IDS]):
            s = await cg.get_variable(s_id)
            cg.add(var.set_zone_preheat_sensor(i, s))

    if CONF_MOTOR_OPEN_RIPPLE_IDS in config:
        for i, s_id in enumerate(config[CONF_MOTOR_OPEN_RIPPLE_IDS]):
            s = await cg.get_variable(s_id)
            cg.add(var.set_motor_open_ripple_sensor(i, s))

    if CONF_MOTOR_CLOSE_RIPPLE_IDS in config:
        for i, s_id in enumerate(config[CONF_MOTOR_CLOSE_RIPPLE_IDS]):
            s = await cg.get_variable(s_id)
            cg.add(var.set_motor_close_ripple_sensor(i, s))

    if CONF_MOTOR_OPEN_FACTOR_IDS in config:
        for i, s_id in enumerate(config[CONF_MOTOR_OPEN_FACTOR_IDS]):
            s = await cg.get_variable(s_id)
            cg.add(var.set_motor_open_factor_sensor(i, s))

    if CONF_MOTOR_CLOSE_FACTOR_IDS in config:
        for i, s_id in enumerate(config[CONF_MOTOR_CLOSE_FACTOR_IDS]):
            s = await cg.get_variable(s_id)
            cg.add(var.set_motor_close_factor_sensor(i, s))

    if CONF_PROBE_TEMP_IDS in config:
        for i, s_id in enumerate(config[CONF_PROBE_TEMP_IDS]):
            s = await cg.get_variable(s_id)
            cg.add(var.set_probe_temp_sensor(i, s))

    if CONF_FIRMWARE_VERSION_ID in config:
        fw_version = await cg.get_variable(config[CONF_FIRMWARE_VERSION_ID])
        cg.add(var.set_firmware_version_text(fw_version))

    if CONF_IP_ADDRESS_ID in config:
        ip = await cg.get_variable(config[CONF_IP_ADDRESS_ID])
        cg.add(var.set_ip_address_text(ip))

    if CONF_CONNECTED_SSID_ID in config:
        ssid = await cg.get_variable(config[CONF_CONNECTED_SSID_ID])
        cg.add(var.set_connected_ssid_text(ssid))

    if CONF_MAC_ADDRESS_ID in config:
        mac = await cg.get_variable(config[CONF_MAC_ADDRESS_ID])
        cg.add(var.set_mac_address_text(mac))

    if CONF_ZONE_STATE_IDS in config:
        for i, ts_id in enumerate(config[CONF_ZONE_STATE_IDS]):
            ts = await cg.get_variable(ts_id)
            cg.add(var.set_zone_state_sensor(i, ts))

    if CONF_MOTOR_FAULT_IDS in config:
        for i, ts_id in enumerate(config[CONF_MOTOR_FAULT_IDS]):
            ts = await cg.get_variable(ts_id)
            cg.add(var.set_motor_fault_sensor(i, ts))

    if CONF_DASHBOARD_JS in config:
        path = CORE.relative_config_path(config[CONF_DASHBOARD_JS])
        _embed_gzip_as_progmem("HV6_DASHBOARD_JS", path)
        cg.add_define("HV6_HAS_DASHBOARD_JS")
