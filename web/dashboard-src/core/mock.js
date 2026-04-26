// core/mock.js

import { setEntity, setLive, sampleHistory, setI2cResult, addActivity, setDashboardValue, setZoneStateHistory, getDashboardValue } from './store.js';
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
    setEntity(key.tempSource(zone), { state: zone % 2 ? 'Local Probe' : 'BLE' });
    setEntity(key.syncTo(zone), { state: 'None' });
    setEntity(key.pipeType(zone), { state: 'PEX 16mm' });
    setEntity(key.area(zone), { value: 8 + zone * 3.5 });
    setEntity(key.spacing(zone), { value: [150, 200, 150, 100, 200, 150][index] });
    setEntity(key.zigbee(zone), { state: 'zone_' + zone + '_mock_sensor' });
    setEntity(key.ble(zone), { state: 'AA:BB:CC:DD:EE:0' + zone });
    setEntity(key.exteriorWalls(zone), { state: ['N', 'E', 'S', 'W', 'N,E', 'S,W'][index] });
    setEntity(key.preheatAdvance(zone), { value: 0.08 + (index * 0.03) });
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
  setEntity(gkey.relearnAfterMovements, { value: 2000 });
  setEntity(gkey.relearnAfterHours, { value: 168 });
  setEntity(gkey.learnedFactorMinSamples, { value: 3 });
  setEntity(gkey.learnedFactorMaxDeviationPct, { value: 12 });
  setEntity(gkey.simplePreheatEnabled, { state: 'on' });
  sampleHistory(true);

  // Generate 24 h of mock zone-state history (5-min intervals = 288 entries).
  const INTERVAL_S = 300;
  const NOW_S = (Number(Date.now() / 1000) | 0);
  const TOTAL = 288;
  // Zone 5 is disabled in mock; zone 4 always idle; others alternate heating/idle
  const patterns = [
    // zone 0: mostly heating with short idle gaps
    [5,5,5,6,5,5,5,5,6,6,5,5,5,5,5,6,5,5,5,5,5,6,6,5],
    // zone 1: mostly idle, some heating
    [6,6,5,5,6,6,6,5,5,6,6,6,5,5,6,6,6,6,5,5,6,6,5,5],
    // zone 2: heating then idle then heating
    [5,5,5,5,5,5,6,6,6,6,6,6,5,5,5,5,6,6,6,6,5,5,5,5],
    // zone 3: always idle
    [6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6],
    // zone 4: off (disabled)
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    // zone 5: mix of heating and idle
    [5,6,5,5,5,6,6,5,5,6,5,5,5,6,5,5,6,6,5,5,5,5,6,6],
  ];
  const mockEntries = [];
  for (let i = 0; i < TOTAL; i++) {
    const age_s = (TOTAL - 1 - i) * INTERVAL_S;
    const t = NOW_S - age_s;
    const hourIndex = Math.floor(i / 12) % 24;   // 12 entries per hour
    const states = patterns.map((p) => p[hourIndex % p.length]);
    mockEntries.push([t, ...states]);
  }
  setZoneStateHistory({ interval_s: INTERVAL_S, uptime_s: NOW_S, count: TOTAL, entries: mockEntries });
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
    const preheat = Math.max(0, (state.setpoint[index] - state.temp[index] - 0.15) * 0.22);
    setEntity(key.preheatAdvance(zone), { value: Number(preheat.toFixed(2)) });
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

  // Keep history uptime_s current so the timeline x-axis tracks wall time.
  const hist = getDashboardValue('zoneStateHistory');
  if (hist) hist.uptime_s = (Number(Date.now() / 1000) | 0);
}

export function startMock() {
  if (timer) return;
  seed();
  setLive(true);
  timer = setInterval(simulate, 1200);
}

export function handleMockPost(body) {
  const k = body.key || '';
  const v = body.value;
  const zone = body.zone || 0;

  if (k === 'zone_setpoint' && zone >= 1 && zone <= ZONES) {
    const value = Number(v);
    if (!Number.isNaN(value)) {
      state.setpoint[zone - 1] = value;
      setEntity(key.setpoint(zone), { value });
      addActivity('Zone ' + zone + ' setpoint set to ' + value.toFixed(1) + '°C', zone);
    }
    return;
  }

  if (k === 'zone_enabled' && zone >= 1 && zone <= ZONES) {
    const enabled = v > 0.5;
    state.enabled[zone - 1] = enabled ? 1 : 0;
    setEntity(key.enabled(zone), { value: enabled, state: enabled ? 'on' : 'off' });
    addActivity('Zone ' + zone + (enabled ? ' enabled' : ' disabled'), zone);
    return;
  }

  if (k === 'drivers_enabled') {
    const enabled = v > 0.5;
    state.driversEnabled = enabled ? 1 : 0;
    setEntity(gkey.drivers, { value: enabled, state: enabled ? 'on' : 'off' });
    addActivity(enabled ? 'Motor drivers enabled' : 'Motor drivers disabled');
    return;
  }

  if (k === 'manual_mode') {
    const enabled = v > 0.5;
    state.manualMode = enabled ? 1 : 0;
    setDashboardValue('manualMode', enabled);
    return;
  }

  if (k === 'motor_target' && zone >= 1 && zone <= ZONES) {
    const value = Number(v || 0);
    setEntity(key.motorTarget(zone), { value: Math.max(0, Math.min(100, Math.round(value))) });
    addActivity('Motor ' + zone + ' target set to ' + value + '%', zone);
    return;
  }

  if (k === 'command') {
    const cmd = String(v);

    if (cmd === 'i2c_scan') {
      setI2cResult('I2C_SCAN: ----- begin -----\nI2C_SCAN: found 0x3C\nI2C_SCAN: found 0x44\nI2C_SCAN: found 0x76\nI2C_SCAN: ----- end -----');
      addActivity('I2C scan complete');
      return;
    }

    if (cmd === 'calibrate_all_motors' || cmd === 'restart') {
      addActivity('Command executed: ' + cmd);
      return;
    }

    if (cmd === 'open_motor_timed' && zone >= 1 && zone <= ZONES) {
      addActivity('Motor ' + zone + ' open timed', zone);
      return;
    }
    if (cmd === 'close_motor_timed' && zone >= 1 && zone <= ZONES) {
      addActivity('Motor ' + zone + ' close timed', zone);
      return;
    }
    if (cmd === 'stop_motor' && zone >= 1 && zone <= ZONES) {
      addActivity('Motor ' + zone + ' stopped', zone);
      return;
    }
    if (cmd === 'motor_reset_fault' && zone >= 1 && zone <= ZONES) {
      addActivity('Motor ' + zone + ' fault reset', zone);
      return;
    }
    if (cmd === 'motor_reset_learned_factors' && zone >= 1 && zone <= ZONES) {
      addActivity('Motor ' + zone + ' learned factors reset', zone);
      return;
    }
    if (cmd === 'motor_reset_and_relearn' && zone >= 1 && zone <= ZONES) {
      addActivity('Motor ' + zone + ' reset and relearn started', zone);
      return;
    }
    return;
  }

  // Select settings (zone-scoped)
  if (k === 'zone_probe' && zone >= 1) { setEntity(key.probe(zone), { state: String(v) }); addActivity('Setting updated: ' + k + ' = ' + v, zone); return; }
  if (k === 'zone_temp_source' && zone >= 1) { setEntity(key.tempSource(zone), { state: String(v) }); addActivity('Setting updated: ' + k + ' = ' + v, zone); return; }
  if (k === 'zone_sync_to' && zone >= 1) { setEntity(key.syncTo(zone), { state: String(v) }); addActivity('Setting updated: ' + k + ' = ' + v, zone); return; }
  if (k === 'zone_pipe_type' && zone >= 1) { setEntity(key.pipeType(zone), { state: String(v) }); addActivity('Setting updated: ' + k + ' = ' + v, zone); return; }

  // Select settings (global)
  if (k === 'manifold_type') { setEntity(gkey.manifoldType, { state: String(v) }); addActivity('Setting updated: ' + k + ' = ' + v); return; }
  if (k === 'manifold_flow_probe') { setEntity(gkey.manifoldFlowProbe, { state: String(v) }); addActivity('Setting updated: ' + k + ' = ' + v); return; }
  if (k === 'manifold_return_probe') { setEntity(gkey.manifoldReturnProbe, { state: String(v) }); addActivity('Setting updated: ' + k + ' = ' + v); return; }
  if (k === 'motor_profile_default') { setEntity(gkey.motorProfileDefault, { state: String(v) }); addActivity('Setting updated: ' + k + ' = ' + v); return; }
  if (k === 'simple_preheat_enabled') { setEntity(gkey.simplePreheatEnabled, { state: String(v) }); addActivity('Setting updated: ' + k + ' = ' + v); return; }

  // Text settings
  if (k === 'zone_zigbee_device' && zone >= 1) { setEntity(key.zigbee(zone), { state: String(v) }); addActivity('Setting updated: ' + k + ' = ' + v, zone); return; }
  if (k === 'zone_ble_mac' && zone >= 1) { setEntity(key.ble(zone), { state: String(v) }); addActivity('Setting updated: ' + k + ' = ' + v, zone); return; }
  if (k === 'zone_exterior_walls' && zone >= 1) { setEntity(key.exteriorWalls(zone), { state: String(v) || 'None' }); addActivity('Setting updated: ' + k + ' = ' + v, zone); return; }

  // Number settings (zone)
  if (k === 'zone_area_m2' && zone >= 1) { setEntity(key.area(zone), { value: Number(v) }); addActivity('Setting updated: ' + k + ' = ' + v, zone); return; }
  if (k === 'zone_pipe_spacing_mm' && zone >= 1) { setEntity(key.spacing(zone), { value: Number(v) }); addActivity('Setting updated: ' + k + ' = ' + v, zone); return; }

  // Number settings (global motor calibration)
  const numMap = {
    close_threshold_multiplier: gkey.closeThresholdMultiplier,
    close_slope_threshold: gkey.closeSlopeThreshold,
    close_slope_current_factor: gkey.closeSlopeCurrentFactor,
    open_threshold_multiplier: gkey.openThresholdMultiplier,
    open_slope_threshold: gkey.openSlopeThreshold,
    open_slope_current_factor: gkey.openSlopeCurrentFactor,
    open_ripple_limit_factor: gkey.openRippleLimitFactor,
    generic_runtime_limit_seconds: gkey.genericRuntimeLimitSeconds,
    hmip_runtime_limit_seconds: gkey.hmipRuntimeLimitSeconds,
    relearn_after_movements: gkey.relearnAfterMovements,
    relearn_after_hours: gkey.relearnAfterHours,
    learned_factor_min_samples: gkey.learnedFactorMinSamples,
    learned_factor_max_deviation_pct: gkey.learnedFactorMaxDeviationPct
  };

  if (numMap[k]) {
    const numeric = Number(v);
    if (!Number.isNaN(numeric)) {
      setEntity(numMap[k], { value: numeric });
      addActivity('Setting updated: ' + k + ' = ' + v);
    }
    return;
  }
}

window.__hv6_mock = {
  setSetpoint(zone, value) {
    handleMockPost({ key: 'zone_setpoint', value, zone });
  },
  toggleZone(zone) {
    const enabled = !state.enabled[zone - 1];
    handleMockPost({ key: 'zone_enabled', value: enabled ? 1 : 0, zone });
  }
};