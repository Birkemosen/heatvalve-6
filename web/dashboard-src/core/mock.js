// core/mock.js

import { setEntity, setLive, sampleHistory, setI2cResult, addActivity, setDashboardValue } from './store.js';
import { key, gkey } from '../utils/keys.js';

const ZONES = 6;
const PROBES = 8;

let timer = null;
let tick = 0;

const state = {
  temp: new Float32Array(ZONES),
  setpoint: new Float32Array(ZONES),
  valve: new Float32Array(ZONES),
  enabled: new Uint8Array(ZONES),
  driversEnabled: 1,
  fault: 0,
  manualMode: 0
};

function seed() {
  state.manualMode = 0;
  setDashboardValue('manualMode', false);
  for (let index = 0; index < ZONES; index++) {
    state.temp[index] = 20.5 + index * 0.4;
    state.setpoint[index] = 21.0 + (index % 3) * 0.5;
    state.valve[index] = 12 + index * 8;
    state.enabled[index] = index === 4 ? 0 : 1;

    const zone = index + 1;
    setEntity(key.temp(zone), { value: state.temp[index] });
    setEntity(key.setpoint(zone), { value: state.setpoint[index] });
    setEntity(key.valve(zone), { value: state.valve[index] });
    setEntity(key.state(zone), { state: state.valve[index] > 5 ? 'heating' : 'idle' });
    setEntity(key.enabled(zone), { value: !!state.enabled[index], state: state.enabled[index] ? 'on' : 'off' });
    setEntity(key.probe(zone), { state: 'Probe ' + zone });
    setEntity(key.tempSource(zone), { state: zone % 2 ? 'Local Probe' : 'BLE Sensor' });
    setEntity(key.syncTo(zone), { state: 'None' });
    setEntity(key.pipeType(zone), { state: 'PEX 16mm' });
    setEntity(key.area(zone), { value: 8 + zone * 3.5 });
    setEntity(key.spacing(zone), { value: [150, 200, 150, 100, 200, 150][index] });
    setEntity(key.zigbee(zone), { state: 'zone_' + zone + '_mock_sensor' });
    setEntity(key.ble(zone), { state: 'AA:BB:CC:DD:EE:0' + zone });
    setEntity(key.exteriorWalls(zone), { state: ['N', 'E', 'S', 'W', 'N,E', 'S,W'][index] });
  }

  for (let probe = 1; probe <= PROBES; probe++) {
    const zone = probe <= ZONES ? probe : ZONES;
    const value = state.temp[zone - 1] + (probe > ZONES ? 1 : 0.1 * probe);
    setEntity(key.probeTemp(probe), { value });
  }

  setEntity(gkey.flow, { value: 34.1 });
  setEntity(gkey.ret, { value: 30.4 });
  setEntity(gkey.uptime, { value: 18 * 3600 + 12 * 60 });
  setEntity(gkey.wifi, { value: -57 });
  setEntity(gkey.drivers, { value: true, state: 'on' });
  setEntity(gkey.fault, { value: false, state: 'off' });
  setEntity(gkey.ip, { state: '192.168.1.86' });
  setEntity(gkey.ssid, { state: 'MockLab' });
  setEntity(gkey.mac, { state: 'D8:3B:DA:12:34:56' });
  setEntity(gkey.firmware, { state: '0.5.x-mock' });
  setEntity(gkey.manifoldFlowProbe, { state: 'Probe 7' });
  setEntity(gkey.manifoldReturnProbe, { state: 'Probe 8' });
  setEntity(gkey.manifoldType, { state: 'NC (Normally Closed)' });
  setEntity(gkey.motorProfileDefault, { state: 'HmIP VdMot' });
  setEntity(gkey.closeThresholdMultiplier, { value: 1.7 });
  setEntity(gkey.closeSlopeThreshold, { value: 1.0 });
  setEntity(gkey.closeSlopeCurrentFactor, { value: 1.4 });
  setEntity(gkey.openThresholdMultiplier, { value: 1.7 });
  setEntity(gkey.openSlopeThreshold, { value: 0.8 });
  setEntity(gkey.openSlopeCurrentFactor, { value: 1.3 });
  setEntity(gkey.openRippleLimitFactor, { value: 1.0 });
  setEntity(gkey.genericRuntimeLimitSeconds, { value: 45 });
  setEntity(gkey.hmipRuntimeLimitSeconds, { value: 40 });
  setEntity(gkey.learnedFactorMinSamples, { value: 3 });
  setEntity(gkey.learnedFactorMaxDeviationPct, { value: 12 });
  sampleHistory(true);
}

function simulate() {
  tick += 1;
  setEntity(gkey.uptime, { value: (Number(Date.now() / 1000) | 0) });
  setEntity(gkey.wifi, { value: -55 - Math.round((1 + Math.sin(tick / 4)) * 6) });

  let openDemand = 0;
  let activeZones = 0;
  let maxValve = 0;

  for (let index = 0; index < ZONES; index++) {
    const zone = index + 1;
    const enabled = !!state.enabled[index];
    const current = state.temp[index];
    const setpoint = state.setpoint[index];
    const demand = enabled && state.driversEnabled && !state.manualMode && current < setpoint - 0.25;

    if (state.manualMode) {
      state.valve[index] = Math.max(0, state.valve[index]);
    } else if (!enabled || !state.driversEnabled) {
      state.valve[index] = Math.max(0, state.valve[index] - 6);
    } else if (demand) {
      state.valve[index] = Math.min(100, state.valve[index] + 7 + (zone % 3));
    } else {
      state.valve[index] = Math.max(0, state.valve[index] - 5);
    }

    const drift = demand ? 0.05 + state.valve[index] / 2200 : -0.03 + state.valve[index] / 3200;
    state.temp[index] = current + drift + Math.sin((tick + zone) / 5) * 0.04;

    if (enabled && state.valve[index] > 0) {
      openDemand += state.valve[index];
      activeZones += 1;
      maxValve = Math.max(maxValve, state.valve[index]);
    }

    setEntity(key.temp(zone), { value: state.temp[index] });
    setEntity(key.valve(zone), { value: Math.round(state.valve[index]) });
    setEntity(key.state(zone), { state: !enabled ? 'off' : demand ? 'heating' : 'idle' });
    setEntity(key.enabled(zone), { value: enabled, state: enabled ? 'on' : 'off' });
    setEntity(key.probeTemp(zone), { value: state.temp[index] + Math.sin((tick + zone) / 6) * 0.1 });
  }

  const flow = 29.5 + maxValve * 0.075 + activeZones * 0.18 + Math.sin(tick / 6) * 0.25;
  const ret = flow - (activeZones ? 2.1 + openDemand / Math.max(1, activeZones * 50) : 1.1);

  setEntity(gkey.flow, { value: Number(flow.toFixed(1)) });
  setEntity(gkey.ret, { value: Number(ret.toFixed(1)) });
  setEntity(key.probeTemp(7), { value: Number((ret - 0.4).toFixed(1)) });
  setEntity(key.probeTemp(8), { value: Number((flow + 0.2).toFixed(1)) });
  sampleHistory(true);
}

export function startMock() {
  if (timer) return;
  seed();
  setLive(true);
  timer = setInterval(simulate, 1200);
}

export function handleMockPost(path) {
  const url = new URL(path, 'http://localhost');
  const parts = url.pathname.split('/').filter(Boolean);

  if (parts[0] === 'zones' && parts[2] === 'setpoint') {
    const zone = Number(parts[1]);
    const value = Number(url.searchParams.get('setpoint_c'));
    if (zone >= 1 && zone <= ZONES && !Number.isNaN(value)) {
      state.setpoint[zone - 1] = value;
      setEntity(key.setpoint(zone), { value });
      addActivity('Zone ' + zone + ' setpoint set to ' + value.toFixed(1) + '°C', zone);
    }
    return;
  }

  if (parts[0] === 'zones' && parts[2] === 'enabled') {
    const zone = Number(parts[1]);
    const enabled = url.searchParams.get('enabled') === 'true';
    if (zone >= 1 && zone <= ZONES) {
      state.enabled[zone - 1] = enabled ? 1 : 0;
      setEntity(key.enabled(zone), { value: enabled, state: enabled ? 'on' : 'off' });
      addActivity('Zone ' + zone + (enabled ? ' enabled' : ' disabled'), zone);
    }
    return;
  }

  if (parts[0] === 'drivers' && parts[1] === 'enabled') {
    state.driversEnabled = url.searchParams.get('enabled') === 'true' ? 1 : 0;
    setEntity(gkey.drivers, { value: !!state.driversEnabled, state: state.driversEnabled ? 'on' : 'off' });
    addActivity(state.driversEnabled ? 'Motor drivers enabled' : 'Motor drivers disabled');
    return;
  }

  if (parts[0] === 'manual_mode') {
    const enabled = url.searchParams.get('enabled') === 'true';
    state.manualMode = enabled ? 1 : 0;
    setDashboardValue('manualMode', enabled);
    return;
  }

  if (parts[0] === 'motors' && parts[2] === 'target') {
    const zone = Number(parts[1]);
    const value = Number(url.searchParams.get('value') || '0');
    if (zone >= 1 && zone <= ZONES && !Number.isNaN(value)) {
      setEntity(key.motorTarget(zone), { value: Math.max(0, Math.min(100, Math.round(value))) });
      addActivity('Motor ' + zone + ' target set to ' + value + '%', zone);
    }
    return;
  }

  if (parts[0] === 'settings') {
    const setting = url.searchParams.get('key') || '';
    const value = url.searchParams.get('value') || '';
    const zone = Number(url.searchParams.get('zone') || '1');

    if (parts[1] === 'select') {
      if (setting === 'zone_probe') setEntity(key.probe(zone), { state: value });
      if (setting === 'zone_temp_source') setEntity(key.tempSource(zone), { state: value });
      if (setting === 'zone_sync_to') setEntity(key.syncTo(zone), { state: value });
      if (setting === 'zone_pipe_type') setEntity(key.pipeType(zone), { state: value });
      if (setting === 'manifold_type') setEntity(gkey.manifoldType, { state: value });
      if (setting === 'manifold_flow_probe') setEntity(gkey.manifoldFlowProbe, { state: value });
      if (setting === 'manifold_return_probe') setEntity(gkey.manifoldReturnProbe, { state: value });
      if (setting === 'motor_profile_default') setEntity(gkey.motorProfileDefault, { state: value });
      addActivity('Setting updated: ' + setting + ' = ' + value, zone);
      return;
    }

    if (parts[1] === 'text') {
      if (setting === 'zone_zigbee_device') setEntity(key.zigbee(zone), { state: value });
      if (setting === 'zone_ble_mac') setEntity(key.ble(zone), { state: value });
      if (setting === 'zone_exterior_walls') setEntity(key.exteriorWalls(zone), { state: value || 'None' });
      addActivity('Setting updated: ' + setting + ' = ' + value, zone);
      return;
    }

    if (parts[1] === 'number') {
      const numeric = Number(value);
      if (setting === 'zone_area_m2' && !Number.isNaN(numeric)) setEntity(key.area(zone), { value: numeric });
      if (setting === 'zone_pipe_spacing_mm' && !Number.isNaN(numeric)) setEntity(key.spacing(zone), { value: numeric });
      if (setting === 'close_threshold_multiplier' && !Number.isNaN(numeric)) setEntity(gkey.closeThresholdMultiplier, { value: numeric });
      if (setting === 'close_slope_threshold' && !Number.isNaN(numeric)) setEntity(gkey.closeSlopeThreshold, { value: numeric });
      if (setting === 'close_slope_current_factor' && !Number.isNaN(numeric)) setEntity(gkey.closeSlopeCurrentFactor, { value: numeric });
      if (setting === 'open_threshold_multiplier' && !Number.isNaN(numeric)) setEntity(gkey.openThresholdMultiplier, { value: numeric });
      if (setting === 'open_slope_threshold' && !Number.isNaN(numeric)) setEntity(gkey.openSlopeThreshold, { value: numeric });
      if (setting === 'open_slope_current_factor' && !Number.isNaN(numeric)) setEntity(gkey.openSlopeCurrentFactor, { value: numeric });
      if (setting === 'open_ripple_limit_factor' && !Number.isNaN(numeric)) setEntity(gkey.openRippleLimitFactor, { value: numeric });
      if (setting === 'generic_runtime_limit_seconds' && !Number.isNaN(numeric)) setEntity(gkey.genericRuntimeLimitSeconds, { value: numeric });
      if (setting === 'hmip_runtime_limit_seconds' && !Number.isNaN(numeric)) setEntity(gkey.hmipRuntimeLimitSeconds, { value: numeric });
      if (setting === 'learned_factor_min_samples' && !Number.isNaN(numeric)) setEntity(gkey.learnedFactorMinSamples, { value: numeric });
      if (setting === 'learned_factor_max_deviation_pct' && !Number.isNaN(numeric)) setEntity(gkey.learnedFactorMaxDeviationPct, { value: numeric });
      addActivity('Setting updated: ' + setting + ' = ' + value, zone);
      return;
    }
  }

  if (parts[0] === 'commands') {
    const command = url.searchParams.get('command');
    const zone = Number(url.searchParams.get('zone') || '0');
    
    if (command === 'i2c_scan') {
      setI2cResult('I2C_SCAN: ----- begin -----\nI2C_SCAN: found 0x3C\nI2C_SCAN: found 0x44\nI2C_SCAN: found 0x76\nI2C_SCAN: ----- end -----');
      addActivity('I2C scan complete');
      return;
    }
    
    if (command === 'reset_1wire_probe_map_reboot' || command === 'dump_1wire_probe_diagnostics' || command === 'restart') {
      addActivity('Command executed: ' + command);
      return;
    }

    // Motor control commands
    if (command === 'open_motor_timed' && zone >= 1 && zone <= ZONES) {
      const duration = Number(url.searchParams.get('duration_ms') || '10000');
      addActivity('Motor ' + zone + ' open timed for ' + duration + 'ms', zone);
      return;
    }

    if (command === 'close_motor_timed' && zone >= 1 && zone <= ZONES) {
      const duration = Number(url.searchParams.get('duration_ms') || '10000');
      addActivity('Motor ' + zone + ' close timed for ' + duration + 'ms', zone);
      return;
    }

    if (command === 'stop_motor' && zone >= 1 && zone <= ZONES) {
      addActivity('Motor ' + zone + ' stopped', zone);
      return;
    }

    // Motor recovery commands
    if (command === 'motor_reset_fault' && zone >= 1 && zone <= ZONES) {
      addActivity('Motor ' + zone + ' fault reset', zone);
      return;
    }

    if (command === 'motor_reset_learned_factors' && zone >= 1 && zone <= ZONES) {
      addActivity('Motor ' + zone + ' learned factors reset', zone);
      return;
    }

    if (command === 'motor_reset_and_relearn' && zone >= 1 && zone <= ZONES) {
      addActivity('Motor ' + zone + ' reset and relearn started', zone);
      return;
    }
  }
}

window.__hv6_mock = {
  setSetpoint(zone, value) {
    handleMockPost('/zones/' + zone + '/setpoint?setpoint_c=' + value);
  },
  toggleZone(zone) {
    const enabled = !state.enabled[zone - 1];
    handleMockPost('/zones/' + zone + '/enabled?enabled=' + (enabled ? 'true' : 'false'));
  }
};