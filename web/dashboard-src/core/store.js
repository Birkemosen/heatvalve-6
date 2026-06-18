// core/store.js

import { notify, subscribe } from './component.js';

export const NZ = 6;
export const HISTORY_MAX = 28;
export const E = Object.create(null);

const zoneNames = loadZoneNames();

const D = {
  section: 'overview',
  selectedZone: 1,
  live: false,
  pendingWrites: 0,
  lastWriteAt: 0,
  firmwareVersion: '',
  i2cResult: 'No scan has been run yet.',
  activityLog: [],
  zoneLog: createZoneLog(),
  historyFlow: [],
  historyReturn: [],
  historyDemand: [],
  lastHistoryAt: 0,
  zoneNames,
  manualMode: false,
  zoneStateHistory: null,   // { interval_s, uptime_s, count, entries: [[uptime_s,z0..z5,absorbing],...] }
  deviceLog: [],            // [{ seq, level, tag, msg }] live device log lines (newest last)
  deviceLogSeq: 0,          // highest seq seen → passed as ?since= to /logs
  forecastHours: null,      // { base_epoch, age_s, count, hours: [[temp_c, wind_ms, wind_dir_deg],...] }
};

export const DEVICE_LOG_MAX = 300;

function createZoneLog() {
  const out = Object.create(null);
  for (let zone = 1; zone <= NZ; zone++) out[zone] = [];
  return out;
}

function loadZoneNames() {
  let values = [];
  try {
    values = JSON.parse(localStorage.getItem('hv6_zone_names') || '[]');
  } catch (error) {
    values = [];
  }
  while (values.length < NZ) values.push('');
  return values.slice(0, NZ);
}

function persistZoneNames() {
  try {
    localStorage.setItem('hv6_zone_names', JSON.stringify(D.zoneNames));
  } catch (error) {
    // Ignore localStorage failures in constrained/mock environments.
  }
}

function dashboardKey(key) {
  return '$dashboard:' + key;
}

function normalizeZone(zone) {
  return Math.max(1, Math.min(NZ, Number(zone) || 1));
}

function toNumber(value) {
  if (value == null) return null;
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;
  if (typeof value === 'string') {
    const direct = Number(value);
    if (!Number.isNaN(direct)) return direct;
    const match = value.match(/-?\d+(?:[\.,]\d+)?/);
    if (match) {
      const parsed = Number(String(match[0]).replace(',', '.'));
      return Number.isNaN(parsed) ? null : parsed;
    }
  }
  return null;
}

export function ev(id) {
  const entity = E[id];
  if (!entity) return null;
  if (entity.v != null) return entity.v;
  if (entity.value != null) return entity.value;
  return toNumber(entity.s != null ? entity.s : entity.state);
}

export function es(id) {
  const entity = E[id];
  if (!entity) return '';
  if (entity.s != null) return entity.s;
  if (entity.state != null) return entity.state;
  if (entity.v === true) return 'ON';
  if (entity.v === false) return 'OFF';
  if (entity.value === true) return 'ON';
  if (entity.value === false) return 'OFF';
  return '';
}

export function isOnState(value) {
  if (value === true) return true;
  if (value === false) return false;
  return String(value || '').toLowerCase() === 'on';
}

export function isEntityOn(id) {
  return isOnState(es(id));
}

export function setEntity(id, patch) {
  let entity = E[id];

  if (!entity) {
    entity = E[id] = { v: null, s: null };
  }

  if ('v' in patch) {
    entity.v = patch.v;
    entity.value = patch.v;
  }
  if ('value' in patch) {
    entity.v = patch.value;
    entity.value = patch.value;
  }
  if ('s' in patch) {
    entity.s = patch.s;
    entity.state = patch.s;
  }
  if ('state' in patch) {
    entity.s = patch.state;
    entity.state = patch.state;
  }

  for (const key in patch) {
    if (key === 'v' || key === 'value' || key === 's' || key === 'state') continue;
    entity[key] = patch[key];
  }

  notify(id);

  if (id === 'text_sensor-firmware_version') {
    setDashboardValue('firmwareVersion', es(id) || '');
  }

  // Bridge device-side friendly zone names (text-zone_<n>_name) into D.zoneNames
  // so the existing zoneTag/zoneLabel consumers stay in sync without changes.
  // Only act on a real change — this runs for every entity on every 1 Hz poll.
  if (id.startsWith('text-zone_') && id.endsWith('_name')) {
    const n = parseInt(id.slice(10, -5), 10);
    if (n >= 1 && n <= NZ) {
      const v = es(id) || '';
      if (D.zoneNames[n - 1] !== v) {
        D.zoneNames[n - 1] = v;
        persistZoneNames();  // keep the load-time cache fresh from the device
        notify(dashboardKey('zoneNames'));
      }
    }
  }
}

export function subscribeDashboard(key, fn) {
  subscribe(dashboardKey(key), fn);
}

export function getDashboardValue(key) {
  return D[key];
}

export function setDashboardValue(key, value) {
  D[key] = value;
  notify(dashboardKey(key));
}

export function setSection(section) {
  if (D.section === section) return;
  D.section = section;
  notify(dashboardKey('section'));
}

export function setSelectedZone(zone) {
  const next = normalizeZone(zone);
  if (D.selectedZone === next) return;
  D.selectedZone = next;
  notify(dashboardKey('selectedZone'));
}

export function setLive(value) {
  const next = !!value;
  if (D.live === next) return;
  D.live = next;
  notify(dashboardKey('live'));
}

export function beginPendingWrite() {
  D.pendingWrites += 1;
  notify(dashboardKey('pendingWrites'));
}

export function endPendingWrite() {
  D.pendingWrites = Math.max(0, D.pendingWrites - 1);
  D.lastWriteAt = Date.now();
  notify(dashboardKey('pendingWrites'));
}

export function shouldSuppressStateUpdate() {
  if (D.pendingWrites > 0) return true;
  return (Date.now() - D.lastWriteAt) < 2000;
}

// Zone names are device-persistent: the UI commits via api.applyZoneName() →
// POST /settings/text(zone_name), and the device echo flows back through the
// text-zone_<n>_name bridge in setEntity() above (which updates D.zoneNames).

export function zoneTag(zone) {
  return D.zoneNames[normalizeZone(zone) - 1] || '';
}

export function zoneLabel(zone) {
  const index = normalizeZone(zone);
  const tag = zoneTag(index);
  return tag ? 'Zone ' + index + ' · ' + tag : 'Zone ' + index;
}

export function setI2cResult(text) {
  D.i2cResult = text || 'No scan has been run yet.';
  notify(dashboardKey('i2cResult'));
}

export function addActivity(message, zone) {
  const entry = {
    time: timeStamp(),
    msg: String(message || '')
  };

  D.activityLog.push(entry);
  while (D.activityLog.length > 60) D.activityLog.shift();

  if (zone >= 1 && zone <= NZ) {
    const bucket = D.zoneLog[zone];
    bucket.push(entry);
    while (bucket.length > 8) bucket.shift();
    notify(dashboardKey('zoneLog:' + zone));
  }

  notify(dashboardKey('activityLog'));
}

export function getActivityLog(zone) {
  if (zone >= 1 && zone <= NZ) return D.zoneLog[zone];
  return D.activityLog;
}

export function pushHistory(key, value) {
  const target = D[key];
  if (!Array.isArray(target)) return;
  const numeric = toNumber(value);
  if (numeric == null) return;
  target.push(numeric);
  while (target.length > HISTORY_MAX) target.shift();
  notify(dashboardKey(key));
}

export function sampleHistory(force) {
  const now = Date.now();
  if (!force && now - D.lastHistoryAt < 3200) return;
  D.lastHistoryAt = now;

  let demand = 0;
  let active = 0;
  for (let zone = 1; zone <= NZ; zone++) {
    const valve = ev('sensor-zone_' + zone + '_valve_pct');
    if (valve != null) {
      demand += valve;
      active += 1;
    }
  }

  pushHistory('historyFlow', ev('sensor-manifold_flow_temperature'));
  pushHistory('historyReturn', ev('sensor-manifold_return_temperature'));
  pushHistory('historyDemand', active ? demand / active : 0);
}

function timeStamp() {
  const value = new Date();
  return String(value.getHours()).padStart(2, '0') + ':' +
    String(value.getMinutes()).padStart(2, '0') + ':' +
    String(value.getSeconds()).padStart(2, '0');
}

export function setZoneStateHistory(data) {
  D.zoneStateHistory = data || null;
  notify(dashboardKey('zoneStateHistory'));
}

// ---- live device log (fed by GET /api/hv6/v1/logs) ----

export function getDeviceLogSeq() {
  return D.deviceLogSeq;
}

export function appendDeviceLog(lines, nextSeq) {
  if (Array.isArray(lines) && lines.length) {
    for (const l of lines) {
      // Wire shape: [seq, level, tag, msg]
      D.deviceLog.push({ seq: l[0], level: l[1], tag: l[2], msg: l[3] });
      if (l[0] > D.deviceLogSeq) D.deviceLogSeq = l[0];
    }
    while (D.deviceLog.length > DEVICE_LOG_MAX) D.deviceLog.shift();
    notify(dashboardKey('deviceLog'));
  }
  if (typeof nextSeq === 'number' && nextSeq > D.deviceLogSeq) {
    // next_seq is the firmware's running counter; never re-request seqs we've seen.
    D.deviceLogSeq = nextSeq - 1;
  }
}

export function getDeviceLog() {
  return D.deviceLog;
}

export function clearDeviceLog() {
  D.deviceLog = [];
  notify(dashboardKey('deviceLog'));
}

// ---- fetched forecast preview (GET /api/hv6/v1/forecast) ----

export function setForecastHours(data) {
  D.forecastHours = data || null;
  notify(dashboardKey('forecastHours'));
}

export function getForecastHours() {
  return D.forecastHours;
}