// core/mock.js

import { setEntity, ev, setLive, sampleHistory, setI2cResult, addActivity, setDashboardValue, setZoneStateHistory, getDashboardValue, setForecastHours, appendDeviceLog } from './store.js';
import { key, gkey } from '../utils/keys.js';

const ZONES = 6;
const PROBES = 8;

let timer = null;
let tick = 0;
let mockLogSeq = 1;

// Rotating sample log lines so the mock Logs view looks alive.
const MOCK_LOG_SAMPLES = [
  [3, 'hv6_zone', 'Control cycle: 4 zones heating, house avg 21.3°C'],
  [3, 'hv6_valve', 'Motor 2 reached open endstop (ripples=412)'],
  [5, 'hv6_ripple', 'ADC DMA buffer drained, 2048 samples'],
  [3, 'hv6_forecast', 'Forecast updated: 48 hours from Open-Meteo'],
  [2, 'hv6_zone', 'Zone 5 disabled — skipping control'],
  [3, 'hv6_asgard', 'Pushed z1 thermostat 21.4°C to Asgard'],
];

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
    setEntity(key.ble(zone), { state: 'AA:BB:CC:DD:EE:0' + zone });
    setEntity(key.name(zone), { state: ['Living Room', 'Kitchen', 'Bedroom', 'Bathroom', 'Office', 'Hallway'][index] || '' });
    setEntity(key.exteriorWalls(zone), { state: ['N', 'E', 'S', 'W', 'N,E', 'S,W'][index] });
    setEntity(key.windExposure(zone), { value: [0.5, 0.5, 0.5, 0.5, 0.7, 0.7][index] });
    setEntity(key.solarGain(zone), { value: 0.3 });
    setEntity(key.thermalLeadH(zone), { value: 4 });
    setEntity(key.preheatAdvance(zone), { value: 0.08 + (index * 0.03) });
    // Adaptive balancing telemetry: prior, learned multiplier, effective, error.
    const sf = [0.62, 0.78, 1.0, 0.55, 0.88, 0.7][index];
    const ad = [1.08, 0.95, 1.0, 1.15, 0.9, 1.02][index];
    setEntity(key.staticFactor(zone), { value: sf });
    setEntity(key.balanceAdapt(zone), { value: ad });
    setEntity(key.balanceFactor(zone), { value: Math.min(1, sf * ad) });
    setEntity(key.adaptErr(zone), { value: [0.12, -0.05, 0.0, 0.22, -0.10, 0.03][index] });
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
  setEntity(gkey.balanceMode, { state: 'Adaptive' });
  setEntity(gkey.adaptIntervalS, { value: 3600 });
  setEntity(gkey.adaptStep, { value: 0.02 });
  setEntity(gkey.adaptMin, { value: 0.5 });
  setEntity(gkey.adaptMax, { value: 1.5 });
  setEntity(gkey.minZoneFlowPct, { value: 15 });
  setEntity(gkey.minimumFlowAlways, { state: 'off' });
  setEntity(gkey.cpuLoadCore0, { value: 18.5 });
  setEntity(gkey.cpuLoadCore1, { value: 7.2 });
  setEntity(gkey.freeInternalKb, { value: 142 });
  setEntity(gkey.freePsramKb, { value: 7800 });
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
    // Mock a couple of absorption episodes (~3 h and ~9 h ago) so the band shows.
    const hoursAgo = age_s / 3600;
    const absorbing = (hoursAgo > 2.5 && hoursAgo < 3.5) || (hoursAgo > 8.5 && hoursAgo < 9.5) ? 1 : 0;
    // Mock flow/return/demand so the 24 h graphs have data: more heating zones →
    // higher demand, warmer flow, wider flow/return delta.
    const heating = states.filter((s) => s === 5).length;
    const demandPct = Math.round(Math.min(100, heating * 15 + Math.abs(Math.sin(i / 8)) * 6));
    const flowC = Number((30 + heating * 1.4 + Math.sin(i / 11) * 1.5).toFixed(1));
    const returnC = Number((flowC - (1.4 + heating * 0.35)).toFixed(1));
    mockEntries.push([t, ...states, absorbing, flowC, returnC, demandPct]);
  }
  setZoneStateHistory({ interval_s: INTERVAL_S, uptime_s: NOW_S, count: TOTAL, entries: mockEntries });

  // Mock fetched forecast (48 h): cold front with a wind spike ~12 h out.
  const fcHours = [];
  for (let i = 0; i < 48; i++) {
    const temp = 6 - 3 * Math.sin(i / 24 * Math.PI) - (i > 10 && i < 20 ? 2 : 0);
    const wind = 4 + (i > 8 && i < 18 ? 9 * Math.exp(-Math.pow(i - 13, 2) / 12) : 0) + Math.sin(i / 5);
    const dir = (220 + i * 4) % 360;
    // Solar bell peaking ~midday each day (W/m²), zero overnight.
    const hod = i % 24;
    const solar = Math.max(0, Math.round(820 * Math.sin((hod - 6) / 12 * Math.PI)));
    fcHours.push([Number(temp.toFixed(1)), Number(Math.max(0, wind).toFixed(1)), Math.round(dir), solar]);
  }
  // Anchor at local midnight so the mock reflects the full-day view (device
  // anchors hours_[0] at 00:00 local). fetch_epoch ≈ 8 min ago.
  const d0 = new Date(NOW_S * 1000); d0.setHours(0, 0, 0, 0);
  const dayStart = Math.floor(d0.getTime() / 1000);
  setForecastHours({ base_epoch: dayStart, age_s: 8 * 60, fetch_epoch: NOW_S - 8 * 60, count: 48, hours: fcHours });

  // Seed the device-log stream with a few lines.
  seedMockLogs(6);
}

function seedMockLogs(n) {
  const lines = [];
  for (let i = 0; i < n; i++) {
    const s = MOCK_LOG_SAMPLES[mockLogSeq % MOCK_LOG_SAMPLES.length];
    lines.push([mockLogSeq, s[0], s[1], s[2]]);
    mockLogSeq++;
  }
  appendDeviceLog(lines, mockLogSeq);
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

  // Emit a mock log line every few ticks so the Logs view looks live.
  if (tick % 3 === 0) seedMockLogs(1);
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
    if (cmd === 'dump_task_stats') {
      addActivity('Task stats dumped to device log (mock)');
      return;
    }
    if (cmd === 'reset_balancing') {
      for (let z = 1; z <= ZONES; z++) {
        setEntity(key.balanceAdapt(z), { value: 1.0 });
        setEntity(key.balanceFactor(z), { value: ev(key.staticFactor(z)) ?? 1.0 });
        setEntity(key.adaptErr(z), { value: null });
      }
      addActivity('Adaptive balancing reset');
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
  if (k === 'minimum_flow_always') { setEntity(gkey.minimumFlowAlways, { state: String(v) }); addActivity('Setting updated: ' + k + ' = ' + v); return; }
  if (k === 'balance_mode') { setEntity(gkey.balanceMode, { state: String(v) }); addActivity('Setting updated: ' + k + ' = ' + v); return; }

  // Text settings
  if (k === 'zone_name' && zone >= 1) { setEntity(key.name(zone), { state: String(v) }); addActivity('Setting updated: ' + k + ' = ' + v, zone); return; }
  if (k === 'zone_ble_mac' && zone >= 1) { setEntity(key.ble(zone), { state: String(v) }); addActivity('Setting updated: ' + k + ' = ' + v, zone); return; }
  if (k === 'zone_exterior_walls' && zone >= 1) {
    const walls = String(v) || 'None';
    setEntity(key.exteriorWalls(zone), { state: walls });
    // Mirror the firmware: re-seed wind exposure from the wall count.
    const count = walls === 'None' ? 0 : walls.split(',').filter(Boolean).length;
    const seeded = [0, 0.5, 0.7, 0.85, 1][Math.min(count, 4)];
    setEntity(key.windExposure(zone), { value: seeded });
    addActivity('Setting updated: ' + k + ' = ' + v, zone);
    return;
  }

  // Number settings (zone)
  if (k === 'zone_area_m2' && zone >= 1) { setEntity(key.area(zone), { value: Number(v) }); addActivity('Setting updated: ' + k + ' = ' + v, zone); return; }
  if (k === 'zone_pipe_spacing_mm' && zone >= 1) { setEntity(key.spacing(zone), { value: Number(v) }); addActivity('Setting updated: ' + k + ' = ' + v, zone); return; }
  if (k === 'zone_wind_exposure' && zone >= 1) { setEntity(key.windExposure(zone), { value: Number(v) }); addActivity('Setting updated: ' + k + ' = ' + v, zone); return; }
  if (k === 'zone_solar_gain' && zone >= 1) { setEntity(key.solarGain(zone), { value: Number(v) }); addActivity('Setting updated: ' + k + ' = ' + v, zone); return; }
  if (k === 'zone_thermal_lead_h' && zone >= 1) { setEntity(key.thermalLeadH(zone), { value: Number(v) }); addActivity('Setting updated: ' + k + ' = ' + v, zone); return; }

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
    learned_factor_max_deviation_pct: gkey.learnedFactorMaxDeviationPct,
    adapt_interval_s: gkey.adaptIntervalS,
    adapt_step: gkey.adaptStep,
    adapt_min: gkey.adaptMin,
    adapt_max: gkey.adaptMax,
    min_zone_flow_pct: gkey.minZoneFlowPct
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
