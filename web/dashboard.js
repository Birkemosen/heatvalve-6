// ===========================================================================
// HeatValve-6 Custom Dashboard
// ===========================================================================
(function () {
  "use strict";

  var NZ = 6;
  var E = {};
  var sse = null;
  var live = false;
  var reconnTimer = null;
  var mockTickTimer = null;
  var mockStep = 0;
  var selectedZone = 1;
  var HISTORY_MAX = 28;
  var historyFlow = [];
  var historyReturn = [];
  var historyMotor = [];
  var historyDemand = [];
  var lastHistorySampleAt = 0;
  var activityLog = [];
  var zoneLog = { 1: [], 2: [], 3: [], 4: [], 5: [], 6: [] };
  var prevZoneState = {};
  var prevZoneEnabled = {};
  var prevZoneTarget = {};
  var zoneFaultLatched = {};
  var zoneManualOverride = { 1: false, 2: false, 3: false, 4: false, 5: false, 6: false };
  var calibrationActive = false;
  var calibrationClearTimer = null;
  var prevDriversOn = null;
  var prevFaultOn = null;
  var i2cLastResult = 'No scan has been run yet.';
  var i2cScanActive = false;
  var i2cScanLines = [];
  var pendingWrites = 0;
  var BUTTON_ENTITY_NAMES = {
    i2c_scan: 'I2C Scan',
    dump_1wire_probe_diagnostics: 'Dump 1Wire Probe Diagnostics',
    reset_1wire_probe_map_reboot: 'Reset 1Wire Probe Map Reboot',
    motor_1_open_100_: 'Motor 1 Open Flow (100%)',
    motor_1_close_0_: 'Motor 1 Close Flow (0%)',
    motor_1_stop_now: 'Motor 1 Stop Now',
    motor_1_self_learn: 'Motor 1 Self-Learn',
    calibrate_all_motors: 'Calibrate All Motors',
    clear_motor_trace: 'Clear Motor Trace',
    restart: 'Restart'
  };
  var ENTITY_NAME_OVERRIDES = {
    switch: {
      motor_drivers_enabled: 'Motor Drivers Enabled'
    },
    number: {
      close_threshold_multiplier: 'Close Endstop Threshold',
      close_slope_threshold: 'Close Endstop Slope',
      close_slope_current_factor: 'Close Endstop Slope Floor',
      open_threshold_multiplier: 'Open Endstop Threshold',
      open_slope_threshold: 'Open Endstop Slope',
      open_slope_current_factor: 'Open Endstop Slope Floor',
      open_ripple_limit_factor: 'Open Endstop Ripple Limit',
      pin_engage_step: 'Pin Engage Step',
      pin_engage_margin: 'Pin Engage Margin'
    },
    select: {
      manifold_type: 'Manifold Type',
      manifold_flow_probe: 'Manifold Flow Probe',
      manifold_return_probe: 'Manifold Return Probe'
    },
    text: {
      mqtt_broker_host: 'MQTT Broker',
      mqtt_broker_port: 'MQTT Port',
      mqtt_broker_username: 'MQTT Username',
      mqtt_broker_password: 'MQTT Password'
    }
  };

  // Zone friendly names (persisted in localStorage)
  var zoneNames = [];
  (function loadZoneNames() {
    try { zoneNames = JSON.parse(localStorage.getItem('hv6_zone_names') || '[]'); } catch (e) {}
    while (zoneNames.length < NZ) zoneNames.push('');
  })();
  (function initZoneFaultLatched() {
    for (var z = 1; z <= NZ; z++) zoneFaultLatched[z] = false;
  })();
  function zoneName(z) { return 'Zone ' + z; }
  function zoneTag(z) { return zoneNames[z - 1] || ''; }
  function zoneLabel(z) { var t = zoneTag(z); return t ? 'Zone ' + z + ' · ' + t : 'Zone ' + z; }
  function setZoneName(z, name) {
    zoneNames[z - 1] = (name || '').trim();
    try { localStorage.setItem('hv6_zone_names', JSON.stringify(zoneNames)); } catch (e) {}
  }

  var runtimeConfig = getRuntimeConfig();
  var mockMode = runtimeConfig.mock;

  function $(s, c) { return (c || document).querySelector(s); }
  function h(id) { return document.getElementById(id); }

  function getRuntimeConfig() {
    var search = null;
    var pathname = window.location.pathname || "";
    try { search = new URLSearchParams(window.location.search || ""); } catch (e) {}
    var winCfg = window.HV6_DASHBOARD_CONFIG || {};
    return {
      mock: !!winCfg.mock || /mock-dashboard\.html$/i.test(pathname) || !!(search && (search.get("mock") === "1" || search.get("mock") === "true")),
      mockLabel: winCfg.mockLabel || "Mock",
      mockTickMs: Number(winCfg.mockTickMs) || 1500
    };
  }

  function cloneEntity(src) {
    var out = {};
    for (var k in src) if (Object.prototype.hasOwnProperty.call(src, k)) out[k] = src[k];
    return out;
  }

  function setEntity(id, patch) {
    var next = cloneEntity(E[id] || { id: id });
    next.id = id;
    for (var k in patch) if (Object.prototype.hasOwnProperty.call(patch, k)) next[k] = patch[k];
    if (typeof patch.value !== "undefined" && typeof patch.state === "undefined") {
      if (typeof next.value === "boolean") next.state = next.value ? "ON" : "OFF";
      else if (next.value != null) next.state = String(next.value);
    }
    E[id] = next;
    updateEntity(id);
  }

  function refreshAll() {
    Object.keys(E).forEach(updateEntity);
  }

  function round1(v) { return Math.round(Number(v) * 10) / 10; }
  function fmtT(v) { return v != null && !isNaN(v) ? Number(v).toFixed(1) : "---"; }
  function fmtV(v) { return v != null && !isNaN(v) ? Math.round(v) + "%" : "---"; }
  function fmtUp(s) {
    if (!s || isNaN(s)) return "---";
    s = Math.floor(s);
    var d = Math.floor(s / 86400), hr = Math.floor((s % 86400) / 3600), m = Math.floor((s % 3600) / 60);
    return d > 0 ? d + "d " + hr + "h " + m + "m" : hr > 0 ? hr + "h " + m + "m" : m + "m";
  }
  function fmtWifi(v) {
    if (v == null || isNaN(v)) return "---";
    v = Number(v);
    if (v > -50) return v + " dBm \u2590\u2590\u2590\u2590";
    if (v > -60) return v + " dBm \u2590\u2590\u2590\u2591";
    if (v > -70) return v + " dBm \u2590\u2590\u2591\u2591";
    if (v > -80) return v + " dBm \u2590\u2591\u2591\u2591";
    return v + " dBm \u2591\u2591\u2591\u2591";
  }

  function ev(id) {
    var e = E[id];
    if (!e) return null;
    if (e.value != null) return e.value;
    if (typeof e.state === 'number') return e.state;
    if (typeof e.state === 'string') {
      var s = e.state.trim();
      var n = Number(s);
      if (!isNaN(n)) return n;
      var m = s.match(/-?\d+(?:[\.,]\d+)?/);
      if (m) {
        var p = Number(String(m[0]).replace(',', '.'));
        if (!isNaN(p)) return p;
      }
    }
    return null;
  }
  function entityNameFromObjectId(domain, objectId) {
    var match;
    var overrides = ENTITY_NAME_OVERRIDES[domain];
    if (overrides && overrides[objectId]) return overrides[objectId];

    if (domain === 'climate') {
      match = objectId.match(/^zone_(\d+)$/);
      if (match) return 'Zone ' + match[1];
    }

    if (domain === 'switch') {
      match = objectId.match(/^zone_(\d+)_enabled$/);
      if (match) return 'Zone ' + match[1] + ' Enabled';
    }

    if (domain === 'number') {
      match = objectId.match(/^motor_(\d+)_target_position$/);
      if (match) return 'Motor ' + match[1] + ' Target Position';

      match = objectId.match(/^zone_(\d+)_area_m2$/);
      if (match) return 'Zone ' + match[1] + ' Area M2';

      match = objectId.match(/^zone_(\d+)_pipe_spacing_mm$/);
      if (match) return 'Zone ' + match[1] + ' Pipe Spacing Mm';
    }

    if (domain === 'select') {
      match = objectId.match(/^zone_(\d+)_(probe|pipe_type|temp_source|sync_to)$/);
      if (match) {
        return 'Zone ' + match[1] + ' ' + {
          probe: 'Probe',
          pipe_type: 'Pipe Type',
          temp_source: 'Temp Source',
          sync_to: 'Sync To'
        }[match[2]];
      }
    }

    if (domain === 'text') {
      match = objectId.match(/^zone_(\d+)_(zigbee_device|ble_mac|exterior_walls)$/);
      if (match) {
        return 'Zone ' + match[1] + ' ' + {
          zigbee_device: 'Zigbee Device',
          ble_mac: 'BLE MAC',
          exterior_walls: 'Exterior Walls'
        }[match[2]];
      }
    }

    return objectId;
  }
  function entityPath(domain, objectId) {
    return '/' + domain + '/' + encodeURIComponent(entityNameFromObjectId(domain, objectId));
  }
  function es(id) { var e = E[id]; return e ? e.state : ""; }
  function isOn(id) {
    var e = E[id];
    return !!e && (e.value === true || e.state === "ON" || e.value === "ON");
  }

  function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function mixColor(c1, c2, t) {
    var p = clamp(t, 0, 1);
    return "rgb(" +
      Math.round(lerp(c1[0], c2[0], p)) + "," +
      Math.round(lerp(c1[1], c2[1], p)) + "," +
      Math.round(lerp(c1[2], c2[2], p)) + ")";
  }

  function parseProbeIndex(label) {
    var m = String(label || "").match(/(\d+)/);
    return m ? Number(m[1]) : null;
  }

  function setInputValueIfIdle(id, value) {
    var el = h(id);
    if (!el || el === document.activeElement) return;
    el.value = value;
  }

  function stripAnsi(s) {
    return String(s || '').replace(/\x1B\[[0-9;]*m/g, '');
  }

  function handleI2CLogLine(msg) {
    var clean = stripAnsi(msg);
    if (clean.indexOf('I2C_SCAN:') === -1) return;

    if (clean.indexOf('I2C_SCAN: ----- begin -----') !== -1) {
      i2cScanActive = true;
      i2cScanLines = [clean];
      return;
    }

    if (i2cScanActive) {
      i2cScanLines.push(clean);
      if (clean.indexOf('I2C_SCAN: ----- end -----') !== -1) {
        i2cScanActive = false;
        setI2CResult(i2cScanLines.join('\n'));
      }
      return;
    }

    // Fallback for isolated scan lines if begin/end markers are not seen.
    setI2CResult(clean);
  }

  function normalizeButtonKey(value) {
    return String(value || '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '');
  }

  function localProbeAllowedForZone(z, probeLabel) {
    var zoneProbe = probeLabel != null ? probeLabel : es("select-zone_" + z + "_probe");
    var returnProbe = es("select-manifold_return_probe");
    var zi = parseProbeIndex(zoneProbe);
    var ri = parseProbeIndex(returnProbe);
    if (zi == null || ri == null) return true;
    return zi !== ri;
  }

  function detectZoneFromLog(msg) {
    var s = String(msg || '');
    var m = s.match(/zone[\s_\-]?(\d+)/i);
    if (m) return Number(m[1]);
    m = s.match(/motor[\s_\-]?(\d+)/i);
    if (m) return Number(m[1]);
    return null;
  }

  function zoneFaultEntityState(z) {
    var ids = [
      'binary_sensor-motor_' + z + '_fault',
      'binary_sensor-zone_' + z + '_motor_fault',
      'binary_sensor-zone_' + z + '_fault',
      'binary_sensor-motor' + z + '_fault',
      'text_sensor-motor_' + z + '_fault',
      'text_sensor-zone_' + z + '_motor_fault',
      'sensor-motor_' + z + '_fault'
    ];

    for (var i = 0; i < ids.length; i++) {
      var id = ids[i];
      var e = E[id];
      if (!e) continue;

      if (e.value === true || e.state === 'ON' || e.value === 'ON') return true;
      if (e.value === false || e.state === 'OFF' || e.value === 'OFF') return false;

      var t = String(e.state != null ? e.state : e.value != null ? e.value : '').trim().toUpperCase();
      if (!t) continue;
      if (t === 'NONE' || t === 'OK' || t === 'CLEAR' || t === 'CLEARED' || t === 'OFF') return false;
      if (t.indexOf('FAULT') !== -1 || t === 'TIMEOUT' || t === 'BLOCKED' || t === 'OVERCURRENT' || t === 'THERMAL' || t === 'OPEN_CIRCUIT') return true;
    }

    return null;
  }

  function zoneHasFault(z) {
    var sensorState = zoneFaultEntityState(z);
    if (sensorState != null) return sensorState;
    return !!zoneFaultLatched[z];
  }

  function updateZoneFaultVisual(z) {
    var card = document.querySelector('.zone-card[data-zone="' + z + '"]');
    var faultEl = h('zc-fault-' + z);
    var hasFault = zoneHasFault(z);

    if (card) card.classList.toggle('fault', hasFault);
    if (faultEl) faultEl.classList.toggle('show', hasFault);
  }

  function updateAllZoneFaultVisuals() {
    for (var z = 1; z <= NZ; z++) updateZoneFaultVisual(z);
    if (selectedZone >= 1 && selectedZone <= NZ) updateZonePanel();
  }

  function updateZoneFaultFromLog(msg, zone) {
    if (!(zone >= 1 && zone <= NZ)) return;
    var up = String(msg || '').toUpperCase();

    // Latch obvious failures so users can still see per-zone faults even if only global nFAULT exists.
    if (up.indexOf('FAULT') !== -1 || up.indexOf('FAILED') !== -1 || up.indexOf('TIMEOUT') !== -1 || up.indexOf('BLOCKED') !== -1) {
      zoneFaultLatched[zone] = true;
      updateZoneFaultVisual(zone);
      return;
    }

    // Clear latch on explicit successful completion for this zone.
    if (up.indexOf('CALIBRATION ZONE ' + zone + ' OK') !== -1 || up.indexOf('FAULT CLEARED') !== -1) {
      zoneFaultLatched[zone] = false;
      updateZoneFaultVisual(zone);
    }
  }

  function clearZoneFaultIndicators() {
    for (var z = 1; z <= NZ; z++) zoneFaultLatched[z] = false;
    updateAllZoneFaultVisuals();
    addActivity('Manual clear: zone fault indicators reset');
  }

  function setCalibrationActive(active) {
    calibrationActive = !!active;
    if (active && calibrationClearTimer) {
      clearTimeout(calibrationClearTimer);
      calibrationClearTimer = null;
    }
    updateZonePanel();
  }

  function scheduleCalibrationClear() {
    if (calibrationClearTimer) clearTimeout(calibrationClearTimer);
    calibrationClearTimer = setTimeout(function () {
      calibrationClearTimer = null;
      setCalibrationActive(false);
    }, 1200);
  }

  function updateCalibrationStateFromLog(msg) {
    var up = String(msg || '').toUpperCase();
    if (!up) return;

    if (up.indexOf('CALIBRATING ZONE ') !== -1 || up.indexOf('AUTO-START: ENABLING MOTOR DRIVERS AND CALIBRATING ALL ZONES') !== -1) {
      setCalibrationActive(true);
      return;
    }

    if (/CALIBRATION ZONE\s+\d+\s+OK/.test(up) || /CALIBRATION ZONE\s+\d+\s+FAILED/.test(up) || /CALIBRATION ZONE\s+\d+\s+SKIPPED/.test(up)) {
      scheduleCalibrationClear();
    }
  }

  function canIssueMotorUiCommand(zone) {
    if (!calibrationActive) return true;
    addActivity('Blocked UI motor command for ' + zoneLabel(zone) + ' while calibration is active', zone);
    return false;
  }

  function parseExteriorState(state) {
    var s = String(state || "").toUpperCase();
    if (!s || s === "NONE") return { none: true, N: false, E: false, S: false, W: false };
    return {
      none: false,
      N: s.indexOf("N") !== -1,
      E: s.indexOf("E") !== -1,
      S: s.indexOf("S") !== -1,
      W: s.indexOf("W") !== -1
    };
  }

  function build() {
    if (!$('meta[name="viewport"]')) {
      var meta = document.createElement("meta");
      meta.name = "viewport";
      meta.content = "width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no";
      document.head.appendChild(meta);
    }

    document.body.className = mockMode ? "mock-mode" : "";
    document.body.innerHTML = "";
    document.title = "HeatValve-6";

    var app = document.createElement("div");
    app.className = "app";
    app.innerHTML =
      '<main class="shell">' +
        '<header class="topbar">' +
          '<div class="topbar-head">' +
            '<div class="top-brand"><div class="side-brand">HEATVALVE-6</div>' + (mockMode ? '<div class="mode-pill mock">' + runtimeConfig.mockLabel + '</div>' : '') + '</div>' +
            '<nav class="menu top-menu">' +
              '<a href="#" class="menu-link active" data-sec="sec-overview" onclick="window._hv6.nav(\'sec-overview\');return false">Dashboard</a>' +
              '<a href="#" class="menu-link" data-sec="sec-diag" onclick="window._hv6.nav(\'sec-diag\');return false">Diagnostics</a>' +
              '<a href="#" class="menu-link" data-sec="sec-settings" onclick="window._hv6.nav(\'sec-settings\');return false">Settings</a>' +
            '</nav>' +
            '<div class="top-meta"><div class="dot" id="side-dot"></div><span id="side-sync" class="sync-state synced">Synced</span><span id="side-up"></span><span id="side-wifi"></span></div>' +
          '</div>' +
        '</header>' +
        '<div class="reconn" id="reconn">' + (mockMode ? 'MOCK MODE ACTIVE' : 'CONNECTION LOST - RECONNECTING...') + '</div>' +
        '<div class="zone-selector">' + buildZoneGrid() + '</div>' +
        '<div class="sec" id="sec-overview">' +
          '<div class="card flow-card">' + buildFlowDiagram() + '</div>' +
          '<div class="dashboard-grid">' +
            '<div class="card status-card"><div class="card-title">Status</div><table class="st">' +
              '<tr><td>Motor Drivers</td><td><div class="drv-toggle"><span id="sys-drv">---</span><div class="sw" id="sw-drv" onclick="window._hv6.tDrv()"></div></div></td></tr>' +
              '<tr><td>Motor Fault</td><td id="sys-fault">---</td></tr>' +
              '<tr><td>Connection</td><td id="sys-conn"><span class="dot" id="sys-dot"></span></td></tr>' +
            '</table></div>' +
            '<div class="card conn-card"><div class="card-title">Connectivity</div><table class="st">' +
              '<tr><td>IP Address</td><td id="sys-ip">---</td></tr>' +
              '<tr><td>SSID</td><td id="sys-ssid">---</td></tr>' +
              '<tr><td>MAC Address</td><td id="sys-mac">---</td></tr>' +
              '<tr><td>Uptime</td><td id="sys-up">---</td></tr>' +
            '</table></div>' +
          '</div>' +
        '</div>' +
        '<div class="sec" id="sec-zones"><div class="zone-main">' + buildZonePanel() + '</div></div>' +
        '<div class="sec" id="sec-diag">' + buildDiagBody() + '</div>' +
        '<div class="sec" id="sec-settings">' + buildConfigBody() + buildMotorBody() + buildControlBody() + buildMqttBody() + buildOTABody() + '</div>' +
        '<div class="ftr">HEATVALVE-6 · UFH CONTROLLER</div>' +
      '</main>';

    document.body.appendChild(app);
    window._hv6.nav("sec-overview");
    updateZonePanel();
    updateAllZoneFaultVisuals();
    updateSyncState();
  }

  function updateSyncState() {
    var el = h('side-sync');
    if (!el) return;
    if (pendingWrites > 0) {
      el.textContent = 'Saving...';
      el.className = 'sync-state saving';
      return;
    }
    el.textContent = mockMode ? 'Mock' : 'Synced';
    el.className = 'sync-state synced';
  }

  function buildZoneGrid() {
    var r = '<div class="zone-grid">';
    for (var z = 1; z <= NZ; z++) {
      r += '<div class="zone-card" data-zone="' + z + '" onclick="window._hv6.selZone(' + z + ')">' +
        '<div class="zc-label" id="zc-name-' + z + '">' + zoneLabel(z) + '</div>' +
        '<div class="zc-fault-pill" id="zc-fault-' + z + '">FAULT</div>' +
        '<div class="zc-temp" id="zc-temp-' + z + '">---</div>' +
        '<div class="zc-valve" id="zc-valve-' + z + '">---</div>' +
        '<div class="zc-badge" id="zc-state-' + z + '"></div>' +
      '</div>';
    }
    r += '</div>';
    return r;
  }

  function buildZonePanel() {
    var r = '<div class="zone-panels">';
    r += '<div class="zone-detail card">' +
      '<div class="zone-detail-head"><div class="zone-detail-title" id="zf-name">' + zoneLabel(1) + '</div><span class="badge unknown" id="zf-state">---</span></div>' +
      '<div class="target-control">' +
        '<div class="calib-lock" id="zf-cal-lock">Calibration running - motor commands are temporarily locked</div>' +
        '<div class="target-kicker">Target Temperature</div>' +
        '<div class="target-value" id="zf-set">---</div>' +
        '<div class="target-actions">' +
          '<button class="spb" id="zf-minus" onclick="window._hv6.adjSel(-0.5)">−</button>' +
          '<button class="spb" id="zf-plus" onclick="window._hv6.adjSel(0.5)">+</button>' +
        '</div>' +
        '<div class="target-hint">Use +/- to adjust target setpoint</div>' +
        '<div class="target-toggle"><span>Zone Enabled</span><div class="sw" id="zf-sw" onclick="window._hv6.tZoneSel()"></div></div>' +
        '<div class="target-toggle"><span>Manual Motor Override</span><div class="sw" id="zf-ovr" onclick="window._hv6.tOverrideSel()"></div></div>' +
        '<div class="btn-row override-actions" id="zf-ovr-actions">' +
          '<button class="btn accent" onclick="window._hv6.openMotor(selectedZone)">Open 100%</button>' +
          '<button class="btn accent" onclick="window._hv6.closeMotor(selectedZone)">Close 0%</button>' +
          '<button class="btn warn" onclick="window._hv6.stopMotor(selectedZone)">Stop</button>' +
        '</div>' +
      '</div>' +
      '<div class="zone-detail-grid">' +
        '<div class="zone-detail-stat"><span>Current Temperature</span><strong id="zf-temp">---</strong></div>' +
        '<div class="zone-detail-stat"><span>Current Return Temperature</span><strong id="zf-ret">---</strong></div>' +
        '<div class="zone-detail-stat"><span>Valve Opening</span><strong id="zf-valve">---</strong></div>' +
      '</div>' +
    '</div>';
    r += '<div class="card zone-sensor-card">' +
      '<div class="card-title">Temperature Sensors / Connectivity</div>' +
      '<div class="cfg-row"><span class="lbl">Zone Return Temperature Sensor</span><select class="sel" id="zf-probe" onchange="window._hv6.sProbe(this.value)"><option>Probe 1</option><option>Probe 2</option><option>Probe 3</option><option>Probe 4</option><option>Probe 5</option><option>Probe 6</option><option>Probe 7</option><option>Probe 8</option></select></div>' +
      '<div class="cfg-row"><span class="lbl">Temperature Source</span><select class="sel" id="zf-source" onchange="window._hv6.sSource(this.value)"><option>Local Probe</option><option>Zigbee MQTT</option><option>BLE Sensor</option></select></div>' +
      '<div class="cfg-row" id="zf-row-zigbee"><span class="lbl">Zigbee Device</span><input class="txt" id="zf-zigbee" onchange="window._hv6.sZigbee(this.value)" maxlength="47"></div>' +
      '<div class="cfg-row" id="zf-row-ble"><span class="lbl">BLE MAC</span><input class="txt" id="zf-ble" onchange="window._hv6.sBle(this.value)" maxlength="17" placeholder="AA:BB:CC:DD:EE:FF"></div>' +
      '<div class="cfg-row"><span class="lbl">Sync to Zone</span><select class="sel" id="zf-sync" onchange="window._hv6.sSync(this.value)"><option>None</option><option>Zone 1</option><option>Zone 2</option><option>Zone 3</option><option>Zone 4</option><option>Zone 5</option><option>Zone 6</option></select></div>' +
    '</div>';
    r += '<div class="card zone-room-card">' +
      '<div class="card-title">Room Settings</div>' +
      '<div class="cfg-row"><span class="lbl">Friendly Name</span><input class="txt" id="zf-friendly" maxlength="24" onchange="window._hv6.sName(this.value)" placeholder="e.g. Living Room"></div>' +
      '<div class="cfg-row"><span class="lbl">Zone Area</span><input class="txt" id="zf-area" type="number" min="1" step="0.1" onchange="window._hv6.sArea(this.value)" placeholder="m2"></div>' +
      '<div class="cfg-row"><span class="lbl">Pipe Spacing</span><input class="txt" id="zf-spacing" type="number" min="50" step="5" onchange="window._hv6.sSpacing(this.value)" placeholder="mm"></div>' +
      '<div class="cfg-row"><span class="lbl">Pipe Type</span><select class="sel" id="zf-pipe" onchange="window._hv6.sPipe(this.value)"><option>Unknown</option><option>PEX 16mm</option><option>PEX 20mm</option><option>PERT 16mm</option><option>PERT 20mm</option></select></div>' +
      '<div class="cfg-row"><span class="lbl">Exterior Walls</span><div class="ew-group" id="zf-ew">' +
        '<button class="ew-btn" data-dir="NONE" onclick="window._hv6.tEWSel(\'NONE\')">None</button>' +
        '<button class="ew-btn" data-dir="N" onclick="window._hv6.tEWSel(\'N\')"><svg viewBox="0 0 24 24"><path d="M12 3L5 15l7-4 7 4z" fill="currentColor"/></svg><span>N</span></button>' +
        '<button class="ew-btn" data-dir="E" onclick="window._hv6.tEWSel(\'E\')"><svg viewBox="0 0 24 24"><path d="M21 12L9 5l4 7-4 7z" fill="currentColor"/></svg><span>E</span></button>' +
        '<button class="ew-btn" data-dir="S" onclick="window._hv6.tEWSel(\'S\')"><svg viewBox="0 0 24 24"><path d="M12 21L19 9l-7 4-7-4z" fill="currentColor"/></svg><span>S</span></button>' +
        '<button class="ew-btn" data-dir="W" onclick="window._hv6.tEWSel(\'W\')"><svg viewBox="0 0 24 24"><path d="M3 12L15 19l-4-7 4-7z" fill="currentColor"/></svg><span>W</span></button>' +
      '</div></div>' +
    '</div>';
    r += '</div>';
    return r;
  }

  function buildGraphWidgets() {
    return '<div class="graph-grid">' +
      '<div class="graph-card"><div class="graph-head"><span>Flow / Return</span><strong id="gw-dt">---</strong></div><svg id="gw-flowret" viewBox="0 0 220 56" preserveAspectRatio="none"></svg></div>' +
      '<div class="graph-card"><div class="graph-head"><span>Motor Current</span><strong id="gw-motor-val">---</strong></div><svg id="gw-motor" viewBox="0 0 220 56" preserveAspectRatio="none"></svg></div>' +
      '<div class="graph-card"><div class="graph-head"><span>Demand Index</span><strong id="gw-demand-val">---</strong></div><svg id="gw-demand" viewBox="0 0 220 56" preserveAspectRatio="none"></svg></div>' +
    '</div>';
  }

  // ---- Flow diagram geometry constants ----
  var FD_ZY = [60, 126, 192, 258, 324, 390];
  var FD_MYC = 225;
  var FD_BX = 36, FD_BW = 160, FD_BH = 90;
  var FD_SX = FD_BX + FD_BW;
  var FD_EX = 720;
  var FD_SPREAD = 11;
  var FD_SRC_HW = 6;
  var FD_BG_DST_HW = 24;

  function fdRibbon(zIdx, hwSrc, hwDst) {
    var y0 = FD_MYC + (zIdx - 2.5) * FD_SPREAD;
    var y1 = FD_ZY[zIdx];
    var dx = FD_EX - FD_SX;
    var c1 = FD_SX + dx * 0.33;
    var c2 = FD_SX + dx * 0.67;
    return 'M' + FD_SX + ' ' + (y0 - hwSrc).toFixed(1) +
      ' C' + c1 + ' ' + (y0 - hwSrc).toFixed(1) + ' ' + c2 + ' ' + (y1 - hwDst).toFixed(1) + ' ' + FD_EX + ' ' + (y1 - hwDst).toFixed(1) +
      ' L' + FD_EX + ' ' + (y1 + hwDst).toFixed(1) +
      ' C' + c2 + ' ' + (y1 + hwDst).toFixed(1) + ' ' + c1 + ' ' + (y0 + hwSrc).toFixed(1) + ' ' + FD_SX + ' ' + (y0 + hwSrc).toFixed(1) +
      'Z';
  }

  function buildFlowDiagram() {
    var W = 1100, H = 460;
    var by = FD_MYC - FD_BH / 2;
    var lbW = FD_BX;
    var p = [];
    p.push('<svg viewBox="0 0 ' + W + ' ' + H + '" preserveAspectRatio="xMidYMid meet">');
    p.push('<defs>');
    p.push('<pattern id="fdots" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse"><circle cx="10" cy="10" r="1" fill="rgba(60,70,90,0.35)"/></pattern>');
    p.push('<radialGradient id="fglow" cx="18%" cy="42%" r="65%"><stop offset="0%" stop-color="rgba(238,161,17,0.12)"/><stop offset="100%" stop-color="transparent"/></radialGradient>');
    p.push('<linearGradient id="lbgrad" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stop-color="#A06808"/><stop offset="100%" stop-color="#EEA111"/></linearGradient>');
    for (var gz = 1; gz <= NZ; gz++) {
      p.push('<linearGradient id="rg' + gz + '" x1="0" y1="0" x2="1" y2="0">');
      p.push('<stop id="rgs' + gz + '" offset="0%" stop-color="#EEA111"/>');
      p.push('<stop id="rga' + gz + '" offset="100%" stop-color="#D48A0C"/>');
      p.push('</linearGradient>');
    }
    p.push('</defs>');
    p.push('<rect width="' + W + '" height="' + H + '" rx="22" fill="#141A27"/>');
    p.push('<rect width="' + W + '" height="' + H + '" rx="22" fill="url(#fdots)" opacity="0.45"/>');
    p.push('<rect width="' + W + '" height="' + H + '" rx="22" fill="url(#fglow)"/>');

    // Background shadow ribbons (dark, full capacity)
    for (var z = 1; z <= NZ; z++) {
      var bgD = fdRibbon(z - 1, FD_SRC_HW, FD_BG_DST_HW);
      p.push('<path d="' + bgD + '" fill="#1E2233" opacity="0.9"/>');
    }
    // Foreground active ribbons with gradient fill
    for (z = 1; z <= NZ; z++) {
      var fgD = fdRibbon(z - 1, FD_SRC_HW, FD_BG_DST_HW);
      p.push('<path id="fd-path-' + z + '" d="' + fgD + '" fill="url(#rg' + z + ')" opacity="1" style="transition:d .6s ease,opacity .4s ease"/>');
    }

    // Vertical accent bar at pipe endpoints
    p.push('<line x1="' + FD_EX + '" y1="36" x2="' + FD_EX + '" y2="' + (H - 36) + '" stroke="#EEA111" stroke-width="3" opacity="0.55"/>');

    // Left-edge bar (extends from left edge to source box, 5px gap)
    var lbGap = 5;
    var lbRight = FD_BX - lbGap;
    p.push('<rect x="0" y="' + by + '" width="' + lbRight + '" height="' + FD_BH + '" fill="url(#lbgrad)" rx="4"/>');

    // Orange source box
    p.push('<rect x="' + FD_BX + '" y="' + by + '" width="' + FD_BW + '" height="' + FD_BH + '" rx="6" fill="#EEA111"/>');
    p.push('<text x="' + (FD_BX + FD_BW / 2) + '" y="' + (FD_MYC - 10) + '" text-anchor="middle" font-size="20" font-weight="800" fill="#141A27" letter-spacing="2">FLOW</text>');
    p.push('<text id="fd-flow-temp" x="' + (FD_BX + FD_BW / 2) + '" y="' + (FD_MYC + 22) + '" text-anchor="middle" font-size="26" font-weight="800" fill="#141A27" font-family="var(--mono)">---</text>');

    // Return temp under box
    p.push('<text id="fd-ret-temp" x="' + (FD_BX + FD_BW / 2) + '" y="' + (by + FD_BH + 28) + '" text-anchor="middle" font-size="17" font-weight="700" fill="#53A8FF" font-family="var(--mono)">RET ---</text>');

    // Zone labels + temperature + valve %
    for (z = 1; z <= NZ; z++) {
      var lx = FD_EX + 22;
      var yy = FD_ZY[z - 1];
      p.push('<text id="fd-zn' + z + '" x="' + lx + '" y="' + (yy - 20) + '" font-size="14" fill="#5D6579" font-weight="700" letter-spacing="3">' + zoneLabel(z).toUpperCase() + '</text>');
      p.push('<text id="fd-zt' + z + '" x="' + lx + '" y="' + (yy + 18) + '" font-size="38" fill="#ECECEC" font-weight="700" font-family="var(--mono)">---°C</text>');
      p.push('<text id="fd-zv' + z + '" x="' + (lx + 210) + '" y="' + (yy + 18) + '" font-size="28" fill="#5D6579" font-weight="700" font-family="var(--mono)">---%</text>');
    }

    // Bottom-left: ΔT display
    p.push('<text x="36" y="' + (H - 52) + '" font-size="16" font-weight="700" fill="#5D6579" letter-spacing="3">\u0394T Flow\u2013Return</text>');
    p.push('<text id="fd-dt" x="36" y="' + (H - 16) + '" font-size="36" font-weight="800" fill="#EEA111" font-family="var(--mono)">---</text>');

    p.push('<text x="' + (W - 36) + '" y="' + (H - 14) + '" text-anchor="end" font-size="15" fill="#2B3243" font-weight="700" letter-spacing="6">UFH · 6 ZONES · HEATVALVE</text>');
    p.push('</svg>');
    return '<div class="flow-wrap">' + p.join('') + '</div>';
  }

  function buildProbeSelect(elId, entityId) {
    var o = "";
    for (var p = 1; p <= 8; p++) o += '<option>Probe ' + p + '</option>';
    return '<select class="sel" id="' + elId + '" onchange="window._hv6.sS(\'' + entityId + '\',this.value)">' + o + '</select>';
  }

  function buildTempSourceSelect(elId, entityId) {
    return '<select class="sel" id="' + elId + '" onchange="window._hv6.sS(\'' + entityId + '\',this.value)"><option>Local Probe</option><option>Zigbee MQTT</option><option>BLE Sensor</option></select>';
  }

  function buildConfigBody() {
    var m = '<div class="card manifold-card">';
    m += '<div class="card-title">Manifold Configuration</div>';
    m += '<div class="cfg-row"><span class="lbl">Manifold Type</span><select class="sel" id="cfg-mtype" onchange="window._hv6.sS(\'manifold_type\',this.value)"><option value="NO (Normally Open)">Normally Open (NO)</option><option value="NC (Normally Closed)">Normally Closed (NC)</option></select></div>';
    m += '<div class="cfg-row"><span class="lbl">Flow Probe</span><div class="cfg-probe-col">' + buildProbeSelect('cfg-fp', 'manifold_flow_probe') + '</div></div>';
    m += '<div class="cfg-row"><span class="lbl">Return Probe</span><div class="cfg-probe-col">' + buildProbeSelect('cfg-rp', 'manifold_return_probe') + '</div></div>';
    m += '</div>';

    var r = '<div class="card probe-overview-card">';
    r += '<div class="card-title">1-Wire Probe Overview</div>';
    r += '<div class="probe-ov-grid">';
    for (var p = 1; p <= 8; p++) {
      r += '<div class="probe-ov-card" id="cfg-probe-card-' + p + '">' +
        '<div class="probe-ov-head"><span class="probe-ov-name">Probe ' + p + '</span><span class="probe-ov-chip" id="cfg-probe-role-' + p + '">Unused</span></div>' +
        '<div class="probe-ov-temp" id="cfg-probe-temp-' + p + '">---</div>' +
      '</div>';
    }
    r += '</div>';
    r += '<div class="btn-row probe-action-row">' +
      '<button class="btn" onclick="if(confirm(\'Reset learned 1-Wire probe map and reboot?\'))window._hv6.pB(\'reset_1wire_probe_map_reboot\')">Reset 1-Wire Probe Map</button>' +
      '<button class="btn" onclick="window._hv6.pB(\'dump_1wire_probe_diagnostics\')">Dump 1-Wire Diagnostics</button>' +
    '</div>';
    r += '</div>';
    return m + r;
  }

  function buildControlBody() {
    return '<div class="card control-slim-card control-card">' +
      '<div class="btn-row"><button class="btn warn" onclick="if(confirm(\'Restart device?\'))window._hv6.pB(\'restart\')">Restart Device</button></div>' +
    '</div>';
  }

  function buildMotorBody() {
    function mnRow(label, id, min, max, step, entity, unit) {
      return '<div class="cfg-row"><span class="lbl">' + label + '</span><div class="mn-wrap">' +
        '<input type="number" class="mn-inp" id="' + id + '" min="' + min + '" max="' + max + '" step="' + step + '" onchange="window._hv6.sN(\'' + entity + '\',+this.value)">' +
        '<span class="mn-unit">' + unit + '</span></div></div>';
    }
    return '<div class="card motor-config-card">' +
      '<div class="card-title">Motor Configuration</div>' +
      '<div class="btn-row">' +
        '<button class="btn" onclick="window._hv6.pB(\'motor_1_self_learn\')">Self-Learn</button>' +
        '<button class="btn" onclick="window._hv6.pB(\'calibrate_all_motors\')">Calibrate All</button>' +
        '<button class="btn" onclick="window._hv6.pB(\'clear_motor_trace\')">Clear Trace</button>' +
      '</div>' +
      '<div class="cfg-section">Close Endstop Detection</div>' +
      mnRow('Current Threshold', 'mc-clf',  1.1, 3.0,  0.1,  'close_threshold_multiplier', '× mean') +
      mnRow('Slope Threshold',   'mc-cls',  0.1, 5.0,  0.05, 'close_slope_threshold',       'mA/s') +
      mnRow('Slope Floor',       'mc-clsf', 1.0, 2.5,  0.1,  'close_slope_current_factor',  '× mean') +
      '<div class="cfg-section">Open Endstop Detection</div>' +
      mnRow('Current Threshold', 'mc-opf',  1.1, 3.0,  0.1,  'open_threshold_multiplier',   '× mean') +
      mnRow('Slope Threshold',   'mc-ops',  0.05, 5.0, 0.05, 'open_slope_threshold',         'mA/s') +
      mnRow('Slope Floor',       'mc-opsf', 1.0, 2.5,  0.1,  'open_slope_current_factor',   '× mean') +
      mnRow('Ripple Limit',      'mc-rlf',  0,   2.0,  0.1,  'open_ripple_limit_factor',    '× learned') +
      '<div class="cfg-section">Calibration</div>' +
      mnRow('Pin Engage Step',   'mc-pes',  1.0, 10.0, 0.5,  'pin_engage_step',             'mA') +
      mnRow('Pin Engage Margin', 'mc-pem',  0,   200,  10,   'pin_engage_margin',           'ripples') +
    '</div>';
  }

  function buildMqttBody() {
    return '<div class="card mqtt-card"><div class="card-title">MQTT Broker</div>' +
      '<p class="cfg-hint">Override the compile-time MQTT broker settings. Leave fields empty to use firmware defaults. Changes require a reboot to take effect.</p>' +
      '<div class="cfg-row"><span class="lbl">Broker Host</span>' +
        '<input class="txt" id="cfg-mqtt-broker" onchange="window._hv6.sMqttBroker(this.value)" maxlength="63" placeholder="e.g. 192.168.1.100"></div>' +
      '<div class="cfg-row"><span class="lbl">Port</span>' +
        '<input class="txt" id="cfg-mqtt-port" onchange="window._hv6.sMqttPort(this.value)" maxlength="5" placeholder="1883"></div>' +
      '<div class="cfg-row"><span class="lbl">Username</span>' +
        '<input class="txt" id="cfg-mqtt-user" onchange="window._hv6.sMqttUser(this.value)" maxlength="47" placeholder=""></div>' +
      '<div class="cfg-row"><span class="lbl">Password</span>' +
        '<input class="txt" id="cfg-mqtt-pass" type="password" onchange="window._hv6.sMqttPass(this.value)" maxlength="47" placeholder=""></div>' +
      '<div class="btn-row"><button class="btn accent" onclick="if(confirm(\'Reboot to apply MQTT settings?\'))window._hv6.pB(\'restart\')">Reboot to Apply</button></div>' +
    '</div>';
  }

  function buildOTABody() {
    return '<div class="card ota-card"><div class="card-title">OTA Update</div>' +
      '<p class="cfg-hint">Select a compiled <code>.bin</code> firmware file to update the device over the air. The device reboots automatically after a successful upload.</p>' +
      '<div class="cfg-row"><span class="lbl">Firmware File</span>' +
        '<input type="file" class="ota-file-input" id="ota-file" accept=".bin,application/octet-stream"></div>' +
      '<div class="btn-row"><button class="btn accent" onclick="window._hv6.otaUpload()">Upload Firmware</button></div>' +
      '<div class="ota-progress-wrap" id="ota-status" style="display:none">' +
        '<div class="ota-progress"><div class="ota-bar" id="ota-bar"></div></div>' +
        '<span class="ota-pct" id="ota-pct">0%</span>' +
      '</div>' +
      '<div class="ota-msg" id="ota-msg"></div>' +
    '</div>';
  }

  function buildDiagBody() {
    var r = '<div class="diag-col">';

    r += '<div class="diag-2col"><div class="card diag-i2c-card"><div class="card-title">I2C Scan</div>' +
      '<div class="btn-row"><button class="btn" onclick="window._hv6.pB(\'i2c_scan\')">Run I2C Scan</button></div>' +
      '<pre class="diag-pre" id="dg-i2c-result">No scan has been run yet.</pre></div>';

    r += '<div class="card diag-activity-card"><div class="card-title">General Activity / Log</div>' +
      '<div class="btn-row"><button class="btn warn" onclick="if(confirm(\'Clear all zone fault indicators?\'))window._hv6.clearZoneFaults()">Clear Fault Indicators</button></div>' +
      '<div class="diag-log" id="dg-activity-log"><div class="diag-log-empty">No activity yet.</div></div></div></div>';

    r += '<div class="zone-diag-grid">';
    for (var z = 1; z <= NZ; z++) {
      r += '<div class="card zone-diag-card">' +
        '<div class="card-title">' + zoneLabel(z) + ' Diagnostics</div>' +
        '<table class="st st-tight">' +
          '<tr><td>State</td><td id="dz-state-' + z + '">---</td></tr>' +
          '<tr><td>Enabled</td><td id="dz-enabled-' + z + '">---</td></tr>' +
          '<tr><td>Temperature</td><td id="dz-temp-' + z + '">---</td></tr>' +
          '<tr><td>Zone Target</td><td id="dz-target-' + z + '">---</td></tr>' +
          '<tr><td>Motor Target</td><td id="dz-mtarget-' + z + '">---</td></tr>' +
          '<tr><td>Valve</td><td id="dz-valve-' + z + '">---</td></tr>' +
          '<tr><td>Learned Open</td><td id="dz-open-rp-' + z + '">---</td></tr>' +
          '<tr><td>Learned Close</td><td id="dz-close-rp-' + z + '">---</td></tr>' +
        '</table>' +
        '<div class="cfg-row"><span class="lbl">Set Motor Target</span><div class="mn-wrap"><input type="number" class="mn-inp" id="dz-mset-' + z + '" min="0" max="100" step="1" onchange="window._hv6.sMotor(' + z + ', this.value)"><span class="mn-unit">%</span></div></div>' +
        '<div class="btn-row">' +
          '<button class="btn accent" onclick="window._hv6.openMotor(' + z + ')">Open 100%</button>' +
          '<button class="btn accent" onclick="window._hv6.closeMotor(' + z + ')">Close 0%</button>' +
          '<button class="btn warn" onclick="window._hv6.stopMotor(' + z + ')">Stop</button>' +
        '</div>' +
        '<div class="diag-sub">Latest Zone Events</div>' +
        '<div class="diag-log" id="dz-log-' + z + '"><div class="diag-log-empty">No events yet.</div></div>' +
      '</div>';
    }

    r += '</div></div>';
    return r;
  }

  function connect() {
    if (sse) {
      try { sse.close(); } catch (e) {}
    }
    sse = new EventSource('/events');
    sse.addEventListener('state', function (e) {
      try {
        var d = JSON.parse(e.data);
        E[d.id] = d;
        setLive(true);
        updateEntity(d.id);
      } catch (x) {}
    });
    sse.addEventListener('ping', function () { setLive(true); });
    sse.addEventListener('log', function (e) {
      setLive(true);
      var msg = '';
      try {
        var d = JSON.parse(e.data || '{}');
        msg = d.message || d.msg || d.text || '';
      } catch (x) {
        msg = String(e.data || '');
      }
      msg = (msg || '').trim();
      if (!msg) return;
      updateCalibrationStateFromLog(msg);
      var z = detectZoneFromLog(msg);
      updateZoneFaultFromLog(msg, z);
      addActivity(msg, z && z >= 1 && z <= NZ ? z : null);
      handleI2CLogLine(msg);
    });
    sse.onerror = function () {
      setLive(false);
      scheduleReconnect();
    };
  }

  function scheduleReconnect() {
    if (reconnTimer || mockMode) return;
    reconnTimer = setTimeout(function () {
      reconnTimer = null;
      connect();
    }, 5000);
  }

  function setLive(v) {
    if (live === v) return;
    live = v;
    var dot = h('side-dot');
    var sysDot = h('sys-dot');
    var rc = h('reconn');
    var sc = h('sys-conn');
    if (dot) dot.className = v ? 'dot on' : 'dot';
    if (sysDot) sysDot.className = v ? 'dot on' : 'dot';
    if (rc) rc.className = v || mockMode ? 'reconn' : 'reconn show';
    if (sc) sc.innerHTML = v ? '<span style="color:#2ECC71">Connected</span>' : '<span style="color:#E74C3C">Disconnected</span>';
  }

  function updateEntity(id) {
    var m;
    m = id.match(/^sensor-zone_(\d+)_temperature$/);   if (m) { updateZoneTemp(+m[1]); updateFlowDiagram(); updateConfigProbeTemps(); }
    m = id.match(/^sensor-probe_(\d+)_temperature$/);  if (m) { updateConfigProbeTemps(); updateProbeOverview(); }
    m = id.match(/^sensor-zone_(\d+)_valve_position$/); if (m) { updateZoneValve(+m[1]); updateFlowDiagram(); }
    m = id.match(/^text_sensor-zone_(\d+)_state$/);     if (m) { updateZoneState(+m[1]); updateFlowDiagram(); }
    m = id.match(/^climate-zone_(\d+)$/);               if (m) updateZoneClimate(+m[1]);
    m = id.match(/^switch-zone_(\d+)_enabled$/);        if (m) { updateZoneEnabled(+m[1]); updateFlowDiagram(); }

    if (id === 'sensor-wifi_signal') updateWifi();
    if (id === 'sensor-uptime') updateUptime();
    if (id === 'text_sensor-ip_address' || id === 'text_sensor-connected_ssid' || id === 'text_sensor-mac_address') updateSysText();
    if (id === 'switch-motor_drivers_enabled') updateDrivers();
    if (id === 'binary_sensor-motor_fault') updateFault();
    m = id.match(/^binary_sensor-(?:motor_|zone_)(\d+)(?:_motor)?_fault$/);
    if (m) updateZoneFaultVisual(+m[1]);
    m = id.match(/^(?:text_sensor|sensor)-(?:motor_|zone_)(\d+)(?:_motor)?_fault$/);
    if (m) updateZoneFaultVisual(+m[1]);
    if (id === 'sensor-manifold_flow_temperature') { updateManifold(); updateFlowDiagram(); }
    if (id === 'sensor-manifold_return_temperature') { updateManifold(); updateFlowDiagram(); }
    if (id === 'select-manifold_type') updateManifoldType();
    if (/^number-motor_(\d+)_target_position$/.test(id)) { updateDiagPos(); updateMotorSettings(); }
    if (/^number-(close_|open_|pin_engage)/.test(id)) updateMotorSettings();
    if (id === 'sensor-motor_current') updateDiagCur();
    if (id === 'sensor-motor_1_ripple_count') updateDiagRip();
    if (/^sensor-motor_(\d+)_learned_open_ripples$/.test(id)) updateDiagLor();
    if (/^sensor-motor_(\d+)_learned_close_ripples$/.test(id)) updateDiagLcr();

    m = id.match(/^select-(.+)$/); if (m) updateSelect(m[1]);
    m = id.match(/^text-(.+)$/);   if (m) updateText(m[1]);
    m = id.match(/^number-zone_(\d+)_(area_m2|pipe_spacing_mm)$/);
    if (m && Number(m[1]) === selectedZone) updateZonePanel();

    updateZoneDiagnostics();
    maybeSampleHistory();
  }

  function updateZoneVal(z) {
    var v = ev('sensor-zone_' + z + '_valve_position');
    var valEl = h('zc-valve-' + z);
    if (valEl) valEl.textContent = fmtV(v);
    if (selectedZone === z) updateZonePanel();
  }

  function updateZoneCardState(z) {
    var st = (es('text_sensor-zone_' + z + '_state') || 'unknown').toUpperCase();
    var stateEl = h('zc-state-' + z);
    if (stateEl) {
      stateEl.className = 'zc-badge';
      if (st === 'DEMAND') stateEl.style.background = '#EEA111';
      else if (st === 'SATISFIED') stateEl.style.background = '#7fd489';
      else if (st === 'OVERHEATED') stateEl.style.background = '#ff6464';
      else stateEl.style.background = '#555';
    }
    updateZoneFaultVisual(z);
    if (selectedZone === z) updateZonePanel();
  }

  function updateZoneTemp(z) {
    var t = ev('sensor-zone_' + z + '_temperature');
    var nameEl = h('zc-temp-' + z);
    if (nameEl) nameEl.textContent = fmtT(t) + '°';
    if (selectedZone === z) updateZonePanel();
  }

  function updateZoneValve(z) { if (selectedZone === z) updateZonePanel(); }

  function updateZoneState(z) {
    var st = es('text_sensor-zone_' + z + '_state').toUpperCase();
    var en = isOn('switch-zone_' + z + '_enabled');
    if (prevZoneState[z] == null) prevZoneState[z] = st;
    else if (prevZoneState[z] !== st) {
      addActivity(zoneLabel(z) + ' state changed to ' + st, z);
      prevZoneState[z] = st;
    }
    if (prevZoneEnabled[z] == null) prevZoneEnabled[z] = en;
    else if (prevZoneEnabled[z] !== en) {
      addActivity(zoneLabel(z) + (en ? ' enabled' : ' disabled'), z);
      prevZoneEnabled[z] = en;
    }
    if (!en) {
      updateZoneCardState(z);
      if (selectedZone === z) updateZonePanel();
      return;
    }
    updateZoneCardState(z);
    if (selectedZone === z) updateZonePanel();
  }

  function updateZoneClimate(z) {
    var d = E['climate-zone_' + z];
    if (d && d.target_temperature != null) {
      var t = Number(d.target_temperature);
      if (prevZoneTarget[z] == null) prevZoneTarget[z] = t;
      else if (Math.abs(prevZoneTarget[z] - t) >= 0.1) {
        addActivity(zoneLabel(z) + ' target set to ' + t.toFixed(1) + '°C', z);
        prevZoneTarget[z] = t;
      }
    }
    if (d && selectedZone === z) updateZonePanel();
  }
  function updateZoneEnabled(z) { updateZoneState(z); if (selectedZone === z) updateZonePanel(); }

  function updateZoneMenuActive() {
    var isOnZonesPage = document.querySelector('.sec#sec-zones.active') !== null;
    document.querySelectorAll('.zone-card').forEach(function (card) {
      var z = Number(card.getAttribute('data-zone'));
      card.classList.toggle('active', isOnZonesPage && z === selectedZone);
    });
  }

  function zoneNumberValue(z, key) {
    var d = E['number-zone_' + z + '_' + key];
    return d && d.value != null && !isNaN(d.value) ? Number(d.value) : null;
  }

  function updateZonePanel() {
    var z = selectedZone;
    var st = es('text_sensor-zone_' + z + '_state').toUpperCase();
    var en = isOn('switch-zone_' + z + '_enabled');
    var t = ev('sensor-zone_' + z + '_temperature');
    var ret = ev('sensor-manifold_return_temperature');
    var v = ev('sensor-zone_' + z + '_valve_position');
    var c = E['climate-zone_' + z];

    var probe = E['select-zone_' + z + '_probe'];
    var source = E['select-zone_' + z + '_temp_source'];
    var sync = E['select-zone_' + z + '_sync_to'];
    var pipe = E['select-zone_' + z + '_pipe_type'];
    var zigbee = E['text-zone_' + z + '_zigbee_device'];
    var ble = E['text-zone_' + z + '_ble_mac'];
    var walls = E['text-zone_' + z + '_exterior_walls'];

    if (h('zf-name')) h('zf-name').textContent = zoneLabel(z);
    setInputValueIfIdle('zf-friendly', zoneNames[z - 1] || '');
    if (h('zf-temp')) h('zf-temp').textContent = fmtT(t) + '°C';
    if (h('zf-ret')) h('zf-ret').textContent = fmtT(ret) + '°C';
    if (h('zf-set')) h('zf-set').textContent = c && c.target_temperature != null ? Number(c.target_temperature).toFixed(1) + '°C' : '---';
    if (h('zf-valve')) {
      h('zf-valve').textContent = fmtV(v);
      var vv = v != null ? Number(v) : null;
      h('zf-valve').style.color = vv == null ? '' : vv < 30 ? '#42A5F5' : vv > 80 ? '#EF5350' : '#66BB6A';
    }
    if (h('zf-sw')) h('zf-sw').className = en ? 'sw on' : 'sw';
    if (h('zf-ovr')) h('zf-ovr').className = zoneManualOverride[z] ? 'sw on' : 'sw';
    if (h('zf-ovr-actions')) h('zf-ovr-actions').style.display = zoneManualOverride[z] ? 'flex' : 'none';
    if (h('zf-cal-lock')) h('zf-cal-lock').className = calibrationActive ? 'calib-lock show' : 'calib-lock';

    var lockCmds = calibrationActive;
    var minusBtn = h('zf-minus');
    var plusBtn = h('zf-plus');
    if (minusBtn) minusBtn.disabled = lockCmds;
    if (plusBtn) plusBtn.disabled = lockCmds;

    if (h('zf-ovr-actions')) {
      var oBtns = h('zf-ovr-actions').querySelectorAll('button');
      for (var bi = 0; bi < oBtns.length; bi++) oBtns[bi].disabled = lockCmds;
    }

    if (h('zf-probe') && probe) h('zf-probe').value = probe.state || 'Probe 1';

    var src = source ? (source.state || 'Local Probe') : 'Local Probe';
    var sourceSel = h('zf-source');
    if (sourceSel) {
      var localOption = Array.prototype.find.call(sourceSel.options, function (opt) { return opt.value === 'Local Probe'; });
      var allowLocal = localProbeAllowedForZone(z);
      if (localOption) {
        localOption.disabled = !allowLocal;
        localOption.hidden = !allowLocal;
      }
      if (!allowLocal && src === 'Local Probe') src = 'Zigbee MQTT';
      sourceSel.value = src;
    }
    if (h('zf-row-zigbee')) h('zf-row-zigbee').style.display = src === 'Zigbee MQTT' ? '' : 'none';
    if (h('zf-row-ble')) h('zf-row-ble').style.display = src === 'BLE Sensor' ? '' : 'none';

    if (h('zf-sync')) {
      var syncSel = h('zf-sync');
      for (var si = syncSel.options.length - 1; si >= 0; si--) syncSel.remove(si);
      var noneOpt = document.createElement('option'); noneOpt.value = 'None'; noneOpt.textContent = 'None'; syncSel.appendChild(noneOpt);
      for (var sj = 1; sj <= NZ; sj++) { if (sj === z) continue; var so = document.createElement('option'); so.value = 'Zone ' + sj; so.textContent = zoneLabel(sj); syncSel.appendChild(so); }
      syncSel.value = sync && sync.state ? sync.state : 'None';
    }
    if (zigbee && zigbee.state != null) setInputValueIfIdle('zf-zigbee', zigbee.state);
    if (ble && ble.state != null) setInputValueIfIdle('zf-ble', ble.state);
    setInputValueIfIdle('zf-area', zoneNumberValue(z, 'area_m2') != null ? zoneNumberValue(z, 'area_m2') : '');
    setInputValueIfIdle('zf-spacing', zoneNumberValue(z, 'pipe_spacing_mm') != null ? zoneNumberValue(z, 'pipe_spacing_mm') : '');
    if (h('zf-pipe')) h('zf-pipe').value = pipe && pipe.state ? pipe.state : 'Unknown';

    updateZoneExteriorWalls(walls ? (walls.state || '') : '');

    var badge = h('zf-state');
    if (!badge) return;
    badge.className = 'badge';
    if (zoneHasFault(z)) { badge.textContent = 'MOTOR FAULT'; badge.classList.add('fault'); return; }
    if (!en) { badge.textContent = 'DISABLED'; badge.classList.add('disabled'); return; }
    if (st === 'DEMAND') { badge.textContent = 'DEMAND'; badge.classList.add('demand'); return; }
    if (st === 'SATISFIED') { badge.textContent = 'SATISFIED'; badge.classList.add('satisfied'); return; }
    if (st === 'OVERHEATED') { badge.textContent = 'OVERHEATED'; badge.classList.add('overheated'); return; }
    badge.textContent = st || '---';
    badge.classList.add('unknown');
  }

  function updateWifi() {
    var v = ev('sensor-wifi_signal');
    if (h('sys-wifi')) h('sys-wifi').textContent = fmtWifi(v);
    if (h('side-wifi')) h('side-wifi').textContent = v != null ? Math.round(v) + ' dBm' : '';
  }

  function updateUptime() {
    var s = fmtUp(ev('sensor-uptime'));
    if (h('sys-up')) h('sys-up').textContent = s;
    if (h('side-up')) h('side-up').textContent = s;
  }

  function updateSysText() {
    if (h('sys-ip')) h('sys-ip').textContent = es('text_sensor-ip_address') || '---';
    if (h('sys-ssid')) h('sys-ssid').textContent = es('text_sensor-connected_ssid') || '---';
    if (h('sys-mac')) h('sys-mac').textContent = es('text_sensor-mac_address') || '---';
  }

  function updateDrivers() {
    var on = isOn('switch-motor_drivers_enabled');
    if (h('sw-drv')) h('sw-drv').className = on ? 'sw on' : 'sw';
    if (h('sys-drv')) h('sys-drv').textContent = on ? 'Enabled' : 'Disabled';
    if (prevDriversOn == null) prevDriversOn = on;
    else if (prevDriversOn !== on) {
      addActivity(on ? 'Motor drivers enabled' : 'Motor drivers disabled');
      prevDriversOn = on;
    }
  }

  function updateFault() {
    if (!h('sys-fault')) return;
    var fault = isOn('binary_sensor-motor_fault');
    h('sys-fault').innerHTML = fault ? '<span style="color:#E74C3C">⚠ FAULT</span>' : '<span style="color:#2ECC71">✓ OK</span>';
    if (prevFaultOn == null) prevFaultOn = fault;
    else if (prevFaultOn !== fault) {
      addActivity(fault ? 'Motor fault detected' : 'Motor fault cleared');
      prevFaultOn = fault;
    }
    updateAllZoneFaultVisuals();
  }

  function updateManifold() {
    var flow = ev('sensor-manifold_flow_temperature');
    var ret = ev('sensor-manifold_return_temperature');
    if (h('mf-flow')) h('mf-flow').textContent = fmtT(flow) + ' °C';
    if (h('mf-ret')) h('mf-ret').textContent = fmtT(ret) + ' °C';
    if (h('mf-dt')) h('mf-dt').textContent = flow != null && ret != null && !isNaN(flow) && !isNaN(ret) ? (flow - ret).toFixed(1) + ' °C' : '---';
  }

  function updateManifoldType() {
    var d = E['select-manifold_type'];
    if (h('mf-type') && d) {
      var s = d.state || '';
      h('mf-type').textContent = s.indexOf('NO') !== -1 ? 'Normally Open' : s.indexOf('NC') !== -1 ? 'Normally Closed' : (s || '---');
    }
    if (h('cfg-mtype') && d) {
      var sel = d.state || 'NC (Normally Closed)';
      if (sel === 'NC') sel = 'NC (Normally Closed)';
      if (sel === 'NO') sel = 'NO (Normally Open)';
      h('cfg-mtype').value = sel;
    }
  }

  function probeTempFromLabel(label) {
    var idx = parseProbeIndex(label);
    if (idx == null) return null;
    var v = ev('sensor-probe_' + idx + '_temperature');
    if (v == null) v = ev('sensor-zone_' + idx + '_temperature');
    return v;
  }

  function updateConfigProbeTemps() {
    var fp = E['select-manifold_flow_probe'];
    var rp = E['select-manifold_return_probe'];
    var ft = fp ? probeTempFromLabel(fp.state) : null;
    var rt = rp ? probeTempFromLabel(rp.state) : null;
    if (h('cfg-fp-temp')) h('cfg-fp-temp').textContent = fp && fp.state ? (fp.state + ' · ' + (ft != null ? fmtT(ft) + '°C' : '---')) : '---';
    if (h('cfg-rp-temp')) h('cfg-rp-temp').textContent = rp && rp.state ? (rp.state + ' · ' + (rt != null ? fmtT(rt) + '°C' : '---')) : '---';
    updateProbeOverview();
  }

  function updateProbeOverview() {
    var usage = {};
    var fp = es('select-manifold_flow_probe');
    var rp = es('select-manifold_return_probe');
    var fpi = parseProbeIndex(fp);
    var rpi = parseProbeIndex(rp);

    if (fpi != null) usage[fpi] = ['Flow'];
    if (rpi != null) {
      if (!usage[rpi]) usage[rpi] = [];
      usage[rpi].push('Return');
    }

    for (var z = 1; z <= NZ; z++) {
      var src = es('select-zone_' + z + '_temp_source');
      var zp = parseProbeIndex(es('select-zone_' + z + '_probe'));
      if (zp == null) continue;
      if (!usage[zp]) usage[zp] = [];
      usage[zp].push(src === 'Local Probe' ? ('Z' + z) : ('Z' + z + ' (cfg)'));
    }

    for (var p = 1; p <= 8; p++) {
      var temp = ev('sensor-probe_' + p + '_temperature');
      if (temp == null) temp = ev('sensor-zone_' + p + '_temperature');
      var card = h('cfg-probe-card-' + p);
      var tempEl = h('cfg-probe-temp-' + p);
      var roleEl = h('cfg-probe-role-' + p);
      var tags = usage[p] || [];
      var role = tags.length ? tags.join(' · ') : 'Unused';

      if (tempEl) tempEl.textContent = temp != null && !isNaN(temp) ? fmtT(temp) + '°C' : '---';
      if (roleEl) roleEl.textContent = role;
      if (roleEl) roleEl.className = tags.length ? 'probe-ov-chip used' : 'probe-ov-chip';
      if (card) card.className = tags.length ? 'probe-ov-card used' : 'probe-ov-card';
    }
  }

  function updateDiagPos() {
    var d = E['number-motor_1_target_position'];
    if (h('dg-pos') && d) h('dg-pos').textContent = fmtV(d.value);
    if (h('dg-slider') && d && d.value != null) h('dg-slider').value = Math.round(d.value);
    if (h('dg-slbl') && d && d.value != null) h('dg-slbl').textContent = Math.round(d.value) + '%';
  }

  function updateMotorSettings() {
    var d = E['number-motor_1_target_position'];
    if (d && d.value != null) {
      var slEl = h('mc-slider'); if (slEl && slEl !== document.activeElement) slEl.value = Math.round(d.value);
      var slLbl = h('mc-slbl'); if (slLbl) slLbl.textContent = Math.round(d.value) + '%';
    }
    function firstNum(ids) {
      for (var i = 0; i < ids.length; i++) {
        var v = ev(ids[i]);
        if (v != null && !isNaN(v)) return v;
      }
      return null;
    }
    function setInp(elId, entityIds) {
      var el = h(elId);
      if (!el || el === document.activeElement) return;
      var ids = Array.isArray(entityIds) ? entityIds : [entityIds];
      var v = firstNum(ids);
      if (v != null) el.value = v;
    }
    setInp('mc-clf',  ['number-close_threshold_multiplier', 'number-close_endstop_threshold']);
    setInp('mc-cls',  ['number-close_slope_threshold', 'number-close_endstop_slope']);
    setInp('mc-clsf', ['number-close_slope_current_factor', 'number-close_endstop_slope_floor']);
    setInp('mc-opf',  ['number-open_threshold_multiplier', 'number-open_endstop_threshold']);
    setInp('mc-ops',  ['number-open_slope_threshold', 'number-open_endstop_slope']);
    setInp('mc-opsf', ['number-open_slope_current_factor', 'number-open_endstop_slope_floor']);
    setInp('mc-rlf',  ['number-open_ripple_limit_factor', 'number-open_endstop_ripple_limit']);
    setInp('mc-pes',  'number-pin_engage_step');
    setInp('mc-pem',  'number-pin_engage_margin');
  }

  function updateDiagCur() { if (h('dg-cur')) h('dg-cur').textContent = ev('sensor-motor_current') != null ? Number(ev('sensor-motor_current')).toFixed(1) + ' mA' : '---'; }
  function updateDiagRip() { if (h('dg-rip')) h('dg-rip').textContent = ev('sensor-motor_1_ripple_count') != null ? Math.round(ev('sensor-motor_1_ripple_count')) : '---'; }
  function updateDiagLor() { if (h('dg-lor')) h('dg-lor').textContent = ev('sensor-motor_1_learned_open_ripples') != null ? Math.round(ev('sensor-motor_1_learned_open_ripples')) : '---'; }
  function updateDiagLcr() { if (h('dg-lcr')) h('dg-lcr').textContent = ev('sensor-motor_1_learned_close_ripples') != null ? Math.round(ev('sensor-motor_1_learned_close_ripples')) : '---'; }

  function timeStamp() {
    var d = new Date();
    return String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0') + ':' + String(d.getSeconds()).padStart(2, '0');
  }

  function renderLog(elId, items) {
    var el = h(elId);
    if (!el) return;
    if (!items || !items.length) {
      el.innerHTML = '<div class="diag-log-empty">No events yet.</div>';
      return;
    }
    var html = '';
    for (var i = items.length - 1; i >= 0; i--) {
      html += '<div class="diag-log-item"><span class="diag-log-time">' + items[i].time + '</span><span class="diag-log-msg">' + items[i].msg + '</span></div>';
    }
    el.innerHTML = html;
  }

  function addActivity(msg, zone) {
    var entry = { time: timeStamp(), msg: msg };
    activityLog.push(entry);
    if (activityLog.length > 60) activityLog.shift();
    if (zone && zoneLog[zone]) {
      zoneLog[zone].push(entry);
      if (zoneLog[zone].length > 8) zoneLog[zone].shift();
    }
    renderLog('dg-activity-log', activityLog);
    for (var z = 1; z <= NZ; z++) renderLog('dz-log-' + z, zoneLog[z]);
  }

  function setI2CResult(text) {
    i2cLastResult = text || 'No scan has been run yet.';
    if (h('dg-i2c-result')) h('dg-i2c-result').textContent = i2cLastResult;
  }

  function updateZoneDiagCard(z) {
    var st = es('text_sensor-zone_' + z + '_state') || '---';
    var en = isOn('switch-zone_' + z + '_enabled');
    var temp = ev('sensor-zone_' + z + '_temperature');
    var val = ev('sensor-zone_' + z + '_valve_position');
    var motorTarget = ev('number-motor_' + z + '_target_position');
    var learnedOpen = ev('sensor-motor_' + z + '_learned_open_ripples');
    var learnedClose = ev('sensor-motor_' + z + '_learned_close_ripples');
    var c = E['climate-zone_' + z];
    if (h('dz-state-' + z)) h('dz-state-' + z).textContent = st;
    if (h('dz-enabled-' + z)) h('dz-enabled-' + z).textContent = en ? 'Enabled' : 'Disabled';
    if (h('dz-temp-' + z)) h('dz-temp-' + z).textContent = fmtT(temp) + '°C';
    if (h('dz-target-' + z)) h('dz-target-' + z).textContent = c && c.target_temperature != null ? Number(c.target_temperature).toFixed(1) + '°C' : '---';
    if (h('dz-mtarget-' + z)) h('dz-mtarget-' + z).textContent = motorTarget != null && !isNaN(motorTarget) ? Math.round(motorTarget) + '%' : '---';
    if (h('dz-valve-' + z)) h('dz-valve-' + z).textContent = fmtV(val);
    if (h('dz-open-rp-' + z)) h('dz-open-rp-' + z).textContent = learnedOpen != null && !isNaN(learnedOpen) ? Math.round(learnedOpen) : '---';
    if (h('dz-close-rp-' + z)) h('dz-close-rp-' + z).textContent = learnedClose != null && !isNaN(learnedClose) ? Math.round(learnedClose) : '---';
    setInputValueIfIdle('dz-mset-' + z, motorTarget != null && !isNaN(motorTarget) ? Math.round(motorTarget) : '');
  }

  function updateZoneDiagnostics() {
    for (var z = 1; z <= NZ; z++) updateZoneDiagCard(z);
    if (h('dg-i2c-result')) h('dg-i2c-result').textContent = i2cLastResult;
  }

  function updateSelect(name) {
    var d = E['select-' + name];
    if (!d) return;
    var map = { manifold_flow_probe: 'cfg-fp', manifold_return_probe: 'cfg-rp', manifold_type: 'cfg-mtype' };
    for (var z = 1; z <= NZ; z++) {
      map['zone_' + z + '_probe'] = 'cfg-zp' + z;
      map['zone_' + z + '_temp_source'] = 'cfg-ts' + z;
      map['zone_' + z + '_sync_to'] = 'cfg-sync' + z;
    }
    if (map[name] && h(map[name]) && d.state) h(map[name]).value = d.state;
    if (name === 'manifold_flow_probe' || name === 'manifold_return_probe') updateConfigProbeTemps();
    if (name === 'manifold_flow_probe' || name === 'manifold_return_probe') updateProbeOverview();
    if (/^zone_\d+_probe$/.test(name) || /^zone_\d+_temp_source$/.test(name)) updateProbeOverview();
    if (/^zone_\d+_sync_to$/.test(name)) updateZonePanel();
    if (name === 'manifold_return_probe' || name === 'zone_' + selectedZone + '_probe' || name === 'zone_' + selectedZone + '_temp_source' || name === 'zone_' + selectedZone + '_pipe_type') updateZonePanel();
  }

  function updateText(name) {
    var d = E['text-' + name];
    if (!d) return;
    for (var z = 1; z <= NZ; z++) {
      if (name === 'zone_' + z + '_zigbee_device' && h('cfg-zd' + z) && d.state != null) h('cfg-zd' + z).value = d.state;
      if (name === 'zone_' + z + '_ble_mac' && h('cfg-bm' + z) && d.state != null) h('cfg-bm' + z).value = d.state;
    }
    var m = name.match(/^zone_(\d+)_exterior_walls$/);
    if (m) updateExteriorWalls(+m[1], d.state || '');
    if (name.indexOf('zone_' + selectedZone + '_') === 0) updateZonePanel();
    // MQTT broker settings
    if (name === 'mqtt_broker_host') setInputValueIfIdle('cfg-mqtt-broker', d.state || '');
    if (name === 'mqtt_broker_port') setInputValueIfIdle('cfg-mqtt-port', d.state || '');
    if (name === 'mqtt_broker_username') setInputValueIfIdle('cfg-mqtt-user', d.state || '');
    if (name === 'mqtt_broker_password') setInputValueIfIdle('cfg-mqtt-pass', d.state || '');
  }

  function updateExteriorWalls(z, state) {
    var grp = h('cfg-ew' + z);
    var parsed = parseExteriorState(state);
    if (grp) {
      var btns = grp.querySelectorAll('.ew-btn');
      for (var i = 0; i < btns.length; i++) {
        var dir = btns[i].getAttribute('data-dir');
        var active = dir === 'NONE' ? parsed.none : !!parsed[dir];
        btns[i].className = active ? 'ew-btn on' : 'ew-btn';
      }
    }
    if (z === selectedZone) updateZoneExteriorWalls(state);
  }

  function updateZoneExteriorWalls(state) {
    var grp = h('zf-ew');
    if (!grp) return;
    var parsed = parseExteriorState(state);
    var btns = grp.querySelectorAll('.ew-btn');
    for (var i = 0; i < btns.length; i++) {
      var dir = btns[i].getAttribute('data-dir');
      var active = dir === 'NONE' ? parsed.none : !!parsed[dir];
      btns[i].className = active ? 'ew-btn on' : 'ew-btn';
    }
  }

  function updateFlowDiagram() {
    var ft = ev('sensor-manifold_flow_temperature');
    var rt = ev('sensor-manifold_return_temperature');
    if (h('fd-flow-temp')) h('fd-flow-temp').textContent = ft != null ? fmtT(ft) + '°C' : '---';
    if (h('fd-ret-temp')) h('fd-ret-temp').textContent = 'RET ' + (rt != null ? fmtT(rt) + '°C' : '---');

    // Update ΔT with color coding
    var dtEl = h('fd-dt');
    if (dtEl) {
      if (ft != null && rt != null && !isNaN(ft) && !isNaN(rt)) {
        var dt = Number(ft) - Number(rt);
        dtEl.textContent = dt.toFixed(1) + '°C';
        dtEl.setAttribute('fill', dt < 3 ? '#42A5F5' : dt > 8 ? '#EF5350' : '#66BB6A');
      } else {
        dtEl.textContent = '---';
        dtEl.setAttribute('fill', '#5D6579');
      }
    }

    for (var z = 1; z <= NZ; z++) {
      var path = h('fd-path-' + z);
      var ztEl = h('fd-zt' + z);
      var zvEl = h('fd-zv' + z);
      var temp = ev('sensor-zone_' + z + '_temperature');
      var valve = ev('sensor-zone_' + z + '_valve_position');
      var state = es('text_sensor-zone_' + z + '_state').toUpperCase();
      var enabled = isOn('switch-zone_' + z + '_enabled');
      var vPct = (valve != null && !isNaN(valve)) ? Number(valve) / 100 : 0;

      if (ztEl) ztEl.textContent = temp != null ? fmtT(temp) + '°C' : '---';
      if (zvEl) {
        zvEl.textContent = valve != null ? Math.round(valve) + '%' : '---%';
        var vn = valve != null ? Number(valve) : null;
        var vc = vn == null ? '#5D6579' : vn < 30 ? '#42A5F5' : vn > 80 ? '#EF5350' : '#66BB6A';
        zvEl.setAttribute('fill', vc);
      }

      // Update per-zone ribbon gradient based on valve threshold color
      var gradStart = h('rga' + z);
      if (gradStart) gradStart.setAttribute('stop-color', valve != null ? (Number(valve) < 30 ? '#42A5F5' : Number(valve) > 80 ? '#EF5350' : '#66BB6A') : '#5D6579');

      // Update per-zone ribbon gradient end color based on temperature delta
      var gradStop = h('rgs' + z);
      if (gradStop && ft != null && temp != null) {
        var dT = Number(ft) - Number(temp);
        var cool = clamp((dT - 2) / 12, 0, 1);
        var endR = Math.round(lerp(238, 80, cool));
        var endG = Math.round(lerp(161, 140, cool));
        var endB = Math.round(lerp(17, 200, cool));
        gradStop.setAttribute('stop-color', 'rgb(' + endR + ',' + endG + ',' + endB + ')');
      }

      if (!path) continue;

      if (!enabled) {
        path.setAttribute('d', fdRibbon(z - 1, 1, 2));
        path.setAttribute('fill', '#2A2D38');
        path.setAttribute('opacity', '0.4');
      } else {
        var dstHW = Math.max(3, vPct * FD_BG_DST_HW);
        var srcHW = Math.max(1.5, vPct * FD_SRC_HW);
        path.setAttribute('d', fdRibbon(z - 1, srcHW, dstHW));
        path.setAttribute('fill', 'url(#rg' + z + ')');
        path.setAttribute('opacity', '1');
      }

      if (zvEl && !enabled) zvEl.setAttribute('fill', '#3A3C44');
      if (ztEl) ztEl.setAttribute('fill', enabled ? '#ECECEC' : '#4A4D55');
    }
  }

  function pushHistory(arr, value) {
    if (value == null || isNaN(value)) return;
    arr.push(Number(value));
    while (arr.length > HISTORY_MAX) arr.shift();
  }

  function maybeSampleHistory(force) {
    var now = Date.now();
    var demand = 0;
    var active = 0;
    for (var z = 1; z <= NZ; z++) {
      var v = ev('sensor-zone_' + z + '_valve_position');
      if (v != null && !isNaN(v)) {
        demand += Number(v);
        active += 1;
      }
    }
    if (!force && now - lastHistorySampleAt < 3200) return;
    lastHistorySampleAt = now;
    pushHistory(historyFlow, ev('sensor-manifold_flow_temperature'));
    pushHistory(historyReturn, ev('sensor-manifold_return_temperature'));
    pushHistory(historyMotor, ev('sensor-motor_current'));
    pushHistory(historyDemand, active ? demand / active : 0);
  }

  function linePath(values, width, height, pad) {
    if (!values.length) return '';
    var min = Math.min.apply(null, values);
    var max = Math.max.apply(null, values);
    var span = Math.max(0.001, max - min);
    var step = values.length > 1 ? (width - pad * 2) / (values.length - 1) : 0;
    var d = '';
    for (var i = 0; i < values.length; i++) {
      var x = pad + step * i;
      var y = height - pad - ((values[i] - min) / span) * (height - pad * 2);
      d += (i ? ' L ' : 'M ') + x.toFixed(2) + ' ' + y.toFixed(2);
    }
    return d;
  }

  function renderSpark(svgId, valuesA, colorA, valuesB, colorB) {
    var svg = h(svgId);
    if (!svg) return;
    svg.innerHTML = '';
    if (!valuesA.length && (!valuesB || !valuesB.length)) return;

    var pathA = linePath(valuesA, 220, 56, 5);
    if (pathA) {
      var p1 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      p1.setAttribute('d', pathA);
      p1.setAttribute('fill', 'none');
      p1.setAttribute('stroke', colorA);
      p1.setAttribute('stroke-width', '2.2');
      p1.setAttribute('stroke-linecap', 'round');
      svg.appendChild(p1);
    }

    if (valuesB && valuesB.length) {
      var pathB = linePath(valuesB, 220, 56, 5);
      if (pathB) {
        var p2 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        p2.setAttribute('d', pathB);
        p2.setAttribute('fill', 'none');
        p2.setAttribute('stroke', colorB || '#79d17e');
        p2.setAttribute('stroke-width', '2');
        p2.setAttribute('stroke-linecap', 'round');
        svg.appendChild(p2);
      }
    }
  }

  function renderGraphWidgets() {
    var flow = ev('sensor-manifold_flow_temperature');
    var ret = ev('sensor-manifold_return_temperature');
    var cur = ev('sensor-motor_current');
    var demand = historyDemand.length ? historyDemand[historyDemand.length - 1] : null;
    if (h('gw-dt')) h('gw-dt').textContent = flow != null && ret != null ? (Number(flow) - Number(ret)).toFixed(1) + ' C' : '---';
    if (h('gw-motor-val')) h('gw-motor-val').textContent = cur != null ? Number(cur).toFixed(1) + ' mA' : '---';
    if (h('gw-demand-val')) h('gw-demand-val').textContent = demand != null ? Math.round(demand) + '%' : '---';
    renderSpark('gw-flowret', historyFlow, '#EEA111', historyReturn, '#79d17e');
    renderSpark('gw-motor', historyMotor, '#ffffff');
    renderSpark('gw-demand', historyDemand, '#F4C56A');
  }

  function seedMockEntities() {
    setEntity('sensor-wifi_signal', { value: -58 });
    setEntity('sensor-uptime', { value: 18 * 3600 + 12 * 60 });
    setEntity('text_sensor-ip_address', { state: '192.168.1.86' });
    setEntity('text_sensor-connected_ssid', { state: 'MockLab' });
    setEntity('text_sensor-mac_address', { state: 'D8:3B:DA:12:34:56' });
    setEntity('switch-motor_drivers_enabled', { value: true });
    setEntity('binary_sensor-motor_fault', { value: false });
    setEntity('select-manifold_type', { state: 'NC (Normally Closed)' });
    setEntity('select-manifold_flow_probe', { state: 'Probe 1' });
    setEntity('select-manifold_return_probe', { state: 'Probe 2' });
    setEntity('number-motor_1_target_position', { value: 37 });
    setEntity('sensor-motor_current', { value: 21.4 });
    setEntity('sensor-motor_1_ripple_count', { value: 93 });
    setEntity('sensor-motor_1_learned_open_ripples', { value: 305 });
    setEntity('sensor-motor_1_learned_close_ripples', { value: 298 });
    setEntity('number-close_threshold_multiplier', { value: 1.8 });
    setEntity('number-close_slope_threshold', { value: 0.6 });
    setEntity('number-close_slope_current_factor', { value: 1.3 });
    setEntity('number-open_threshold_multiplier', { value: 1.2 });
    setEntity('number-open_slope_threshold', { value: 0.15 });
    setEntity('number-open_slope_current_factor', { value: 1.3 });
    setEntity('number-open_ripple_limit_factor', { value: 1.2 });
    setEntity('number-pin_engage_step', { value: 3.0 });
    setEntity('number-pin_engage_margin', { value: 50 });

    for (var z = 1; z <= NZ; z++) {
      var enabled = z !== 5;
      var target = round1(20 + z * 0.4);
      var temp = round1(target + (z % 3 === 0 ? 0.4 : -0.6 + z * 0.08));
      var valve = enabled ? Math.max(0, Math.min(100, 18 + z * 11)) : 0;
      var state = !enabled ? 'IDLE' : temp < target - 0.2 ? 'DEMAND' : (temp > target + 0.5 ? 'OVERHEATED' : 'SATISFIED');
      setEntity('climate-zone_' + z, { target_temperature: target, state: 'heat' });
      setEntity('sensor-zone_' + z + '_temperature', { value: temp });
      setEntity('sensor-zone_' + z + '_valve_position', { value: valve });
      setEntity('text_sensor-zone_' + z + '_state', { state: state });
      setEntity('switch-zone_' + z + '_enabled', { value: enabled });
      setEntity('select-zone_' + z + '_probe', { state: 'Probe ' + ((z % 6) + 1) });
      setEntity('select-zone_' + z + '_temp_source', { state: z % 2 ? 'Local Probe' : 'BLE Sensor' });
      setEntity('number-zone_' + z + '_area_m2', { value: round1(8 + z * 3.4) });
      setEntity('number-zone_' + z + '_pipe_spacing_mm', { value: [150, 200, 150, 100, 200, 150][z - 1] });
      setEntity('select-zone_' + z + '_pipe_type', { state: ['PEX 16mm', 'PEX 20mm', 'PERT 16mm', 'PEX 16mm', 'PERT 20mm', 'PEX 20mm'][z - 1] });
      setEntity('text-zone_' + z + '_zigbee_device', { state: 'zone_' + z + '_mock_sensor' });
      setEntity('text-zone_' + z + '_ble_mac', { state: 'AA:BB:CC:DD:EE:0' + z });
      setEntity('text-zone_' + z + '_exterior_walls', { state: ['N', 'E', 'S', 'W', 'NE', 'SW'][z - 1] || 'None' });
      setEntity('select-zone_' + z + '_sync_to', { state: 'None' });
    }

    for (var p = 1; p <= 8; p++) {
      var base = p <= NZ ? Number(ev('sensor-zone_' + p + '_temperature') || 21.0) : 21.0 + p * 0.1;
      setEntity('sensor-probe_' + p + '_temperature', { value: round1(base + (p % 2 ? 0.2 : -0.1)) });
    }

    setEntity('sensor-manifold_flow_temperature', { value: 33.9 });
    setEntity('sensor-manifold_return_temperature', { value: 30.8 });
  }

  function tickMock() {
    var uptime = Number(ev('sensor-uptime') || 0) + Math.max(1, Math.round(runtimeConfig.mockTickMs / 1000));
    var driverOn = isOn('switch-motor_drivers_enabled');
    var activeValves = 0;
    var sumValve = 0;
    var maxValve = 0;
    var targetPos = Number(ev('number-motor_1_target_position') || 0);

    mockStep += 1;
    setEntity('sensor-uptime', { value: uptime });
    setEntity('sensor-wifi_signal', { value: -56 - Math.round((1 + Math.sin(mockStep / 3)) * 5) });

    for (var z = 1; z <= NZ; z++) {
      var enabled = isOn('switch-zone_' + z + '_enabled');
      var climate = E['climate-zone_' + z] || {};
      var target = Number(climate.target_temperature != null ? climate.target_temperature : 21);
      var temp = Number(ev('sensor-zone_' + z + '_temperature') || target);
      var valve = Number(ev('sensor-zone_' + z + '_valve_position') || 0);
      var demand = enabled && driverOn && temp < target - 0.35;

      if (!enabled || !driverOn) valve = Math.max(0, valve - 18);
      else if (demand) valve = Math.min(100, valve + 8 + (z % 3));
      else valve = Math.max(0, valve - 6);

      temp = round1(temp + (demand ? 0.05 + valve / 2200 : -0.03 + valve / 3000) + Math.sin((mockStep + z * 2) / 6) * 0.04);
      setEntity('sensor-zone_' + z + '_temperature', { value: temp });
      setEntity('sensor-zone_' + z + '_valve_position', { value: Math.round(valve) });
      setEntity('text_sensor-zone_' + z + '_state', { state: !enabled ? 'IDLE' : demand ? 'DEMAND' : (temp > target + 0.5 ? 'OVERHEATED' : 'SATISFIED') });
      setEntity('sensor-probe_' + z + '_temperature', { value: round1(temp + Math.sin((mockStep + z) / 7) * 0.1) });

      if (enabled && valve > 0) {
        activeValves += 1;
        sumValve += valve;
        maxValve = Math.max(maxValve, valve);
      }
    }

    setEntity('sensor-manifold_flow_temperature', { value: round1((driverOn ? 29.5 + maxValve * 0.075 + activeValves * 0.18 : 26.2) + Math.sin(mockStep / 5) * 0.2) });
    setEntity('sensor-manifold_return_temperature', { value: round1(ev('sensor-manifold_flow_temperature') - (activeValves ? 2.1 + sumValve / Math.max(1, activeValves * 50) : 1.0)) });
    setEntity('sensor-probe_7_temperature', { value: round1((ev('sensor-manifold_return_temperature') || 28) - 0.4 + Math.sin(mockStep / 4) * 0.05) });
    setEntity('sensor-probe_8_temperature', { value: round1((ev('sensor-manifold_flow_temperature') || 31) + 0.2 + Math.cos(mockStep / 6) * 0.05) });
    setEntity('sensor-motor_current', { value: driverOn && targetPos > 0 ? round1(14 + (Math.sin(mockStep / 2) + 1) * 6 + targetPos * 0.08) : 0 });
    setEntity('sensor-motor_1_ripple_count', { value: driverOn && targetPos > 0 ? 80 + (mockStep % 27) : 0 });
    if (!driverOn) setEntity('binary_sensor-motor_fault', { value: false });

    maybeSampleHistory(true);
  }

  function startMock() {
    if (mockTickTimer) clearInterval(mockTickTimer);
    seedMockEntities();
    setI2CResult('No scan has been run yet.');
    refreshAll();
    maybeSampleHistory(true);
    setLive(true);
    mockTickTimer = setInterval(tickMock, runtimeConfig.mockTickMs);
  }

  function mockPostAPI(path) {
    var url;
    try { url = new URL(path, window.location.origin || 'http://localhost'); } catch (e) { return; }
    var parts = url.pathname.split('/').filter(Boolean);
    if (parts.length < 2) return;

    if (parts[0] === 'climate' && parts[1].indexOf('zone_') === 0) {
      var zone = Number(parts[1].replace('zone_', ''));
      setEntity('climate-zone_' + zone, { target_temperature: round1(Number(url.searchParams.get('target_temperature'))), state: 'heat' });
      return;
    }

    if (parts[0] === 'switch') {
      setEntity('switch-' + parts[1], { value: parts[2] === 'turn_on' });
      return;
    }

    if (parts[0] === 'button') {
      var buttonName = '';
      try { buttonName = decodeURIComponent(parts[1] || ''); } catch (e) { buttonName = parts[1] || ''; }
      var buttonKey = normalizeButtonKey(buttonName);
      if (buttonKey === 'motor_1_open_100') setEntity('number-motor_1_target_position', { value: 100 });
      if (buttonKey === 'motor_1_close_0' || buttonKey === 'motor_1_stop_now') setEntity('number-motor_1_target_position', { value: 0 });
      if (buttonKey === 'i2c_scan') {
        var mockRes = 'I2C scan complete\nFound devices: 0x3C, 0x44, 0x76';
        setI2CResult(mockRes);
        addActivity('I2C scan complete (mock)');
      }
      return;
    }

    if (parts[0] === 'select') { setEntity('select-' + parts[1], { state: url.searchParams.get('option') || '' }); return; }
    if (parts[0] === 'number') { setEntity('number-' + parts[1], { value: Number(url.searchParams.get('value')) }); return; }
    if (parts[0] === 'text') { setEntity('text-' + parts[1], { state: url.searchParams.get('value') || '' }); }
  }

  function postAPI(path) {
    if (mockMode) {
      mockPostAPI(path);
      pendingWrites = 0;
      updateSyncState();
      return;
    }
    pendingWrites += 1;
    updateSyncState();
    fetch(path, { method: 'POST' })
      .catch(function () {})
      .finally(function () {
        pendingWrites = Math.max(0, pendingWrites - 1);
        updateSyncState();
      });
  }

  window._hv6 = {
    nav: function (secId) {
      document.querySelectorAll('.sec').forEach(function (s) { s.classList.remove('active'); });
      document.querySelectorAll('.menu-link').forEach(function (a) { a.classList.toggle('active', a.getAttribute('data-sec') === secId); });
      var target = h(secId);
      if (target) { target.classList.add('active'); window.scrollTo(0, 0); }
      updateZoneMenuActive();
    },
    adj: function (z, delta) {
      var d = E['climate-zone_' + z];
      if (!d || d.target_temperature == null) return;
      var t = Math.min(30, Math.max(15, Number(d.target_temperature) + delta));
      setEntity('climate-zone_' + z, { target_temperature: round1(t) });
      postAPI(entityPath('climate', 'zone_' + z) + '/set?target_temperature=' + t);
    },
    adjSel: function (delta) { window._hv6.adj(selectedZone, delta); },
    tZone: function (z) {
      var on = isOn('switch-zone_' + z + '_enabled');
      setEntity('switch-zone_' + z + '_enabled', { value: !on });
      postAPI(entityPath('switch', 'zone_' + z + '_enabled') + '/' + (on ? 'turn_off' : 'turn_on'));
    },
    tZoneSel: function () { window._hv6.tZone(selectedZone); },
    selZone: function (z) {
      selectedZone = Math.max(1, Math.min(NZ, Number(z) || 1));
      updateZoneMenuActive();
      updateZonePanel();
      window._hv6.nav('sec-zones');
    },
    tDrv: function () {
      var on = isOn('switch-motor_drivers_enabled');
      setEntity('switch-motor_drivers_enabled', { value: !on });
      postAPI(entityPath('switch', 'motor_drivers_enabled') + '/' + (on ? 'turn_off' : 'turn_on'));
    },
    pickZone: function (z) {
      selectedZone = Math.max(1, Math.min(NZ, Number(z) || 1));
      document.querySelectorAll('.menu-link').forEach(function (a) { a.classList.remove('active'); });
      updateZoneMenuActive();
      updateZonePanel();
      window._hv6.selZone(selectedZone);
      window._hv6.nav('sec-zones');
    },
    tSide: function () {
      var side = h('side');
      var app = document.querySelector('.app');
      if (side) {
        side.classList.toggle('collapsed');
        if (app) app.classList.toggle('side-collapsed', side.classList.contains('collapsed'));
      }
    },
    pB: function (n) {
      if (n === 'i2c_scan') {
        i2cScanActive = false;
        i2cScanLines = [];
        setI2CResult('Scanning I2C bus...');
        addActivity('I2C scan started');
      }
      var buttonPath = '/button/' + encodeURIComponent(BUTTON_ENTITY_NAMES[n] || n);
      postAPI(buttonPath);
    },
    sS: function (n, v) {
      setEntity('select-' + n, { state: v });
      postAPI(entityPath('select', n) + '/set?option=' + encodeURIComponent(v));
    },
    sN: function (n, v) {
      var num = Number(v);
      if (!isNaN(num)) setEntity('number-' + n, { value: num });
      postAPI(entityPath('number', n) + '/set?value=' + v);
    },
    sT: function (n, v) {
      setEntity('text-' + n, { state: v });
      postAPI(entityPath('text', n) + '/set?value=' + encodeURIComponent(v));
    },
    sProbe: function (v) { window._hv6.sS('zone_' + selectedZone + '_probe', v); },
    sSource: function (v) {
      if (v === 'Local Probe' && !localProbeAllowedForZone(selectedZone)) {
        updateZonePanel();
        return;
      }
      window._hv6.sS('zone_' + selectedZone + '_temp_source', v);
    },
    sZigbee: function (v) { window._hv6.sT('zone_' + selectedZone + '_zigbee_device', v); },
    sBle: function (v) { window._hv6.sT('zone_' + selectedZone + '_ble_mac', v); },
    sSync: function (v) { window._hv6.sS('zone_' + selectedZone + '_sync_to', v); },
    sArea: function (v) { window._hv6.sN('zone_' + selectedZone + '_area_m2', Number(v)); },
    sName: function (v) {
      setZoneName(selectedZone, v);
      if (h('zf-name')) h('zf-name').textContent = zoneLabel(selectedZone);
      var zc = h('zc-name-' + selectedZone);
      if (zc) zc.textContent = zoneLabel(selectedZone);
      var fdLbl = h('fd-zn' + selectedZone);
      if (fdLbl) fdLbl.textContent = zoneLabel(selectedZone).toUpperCase();
    },
    sSpacing: function (v) { window._hv6.sN('zone_' + selectedZone + '_pipe_spacing_mm', Number(v)); },
    sPipe: function (v) { window._hv6.sS('zone_' + selectedZone + '_pipe_type', v); },
    sMqttBroker: function (v) { window._hv6.sT('mqtt_broker_host', v); },
    sMqttPort: function (v) { window._hv6.sT('mqtt_broker_port', v); },
    sMqttUser: function (v) { window._hv6.sT('mqtt_broker_username', v); },
    sMqttPass: function (v) { window._hv6.sT('mqtt_broker_password', v); },
    sMotor: function (z, v) {
      if (!canIssueMotorUiCommand(z)) return;
      var n = Number(v);
      if (isNaN(n)) return;
      n = Math.max(0, Math.min(100, Math.round(n)));
      setEntity('number-motor_' + z + '_target_position', { value: n });
      postAPI(entityPath('number', 'motor_' + z + '_target_position') + '/set?value=' + n);
    },
    openMotor: function (z) {
      if (!canIssueMotorUiCommand(z)) return;
      setEntity('number-motor_' + z + '_target_position', { value: 100 });
      postAPI('/button/' + encodeURIComponent('Zone ' + z + ' Open 100%'));
    },
    closeMotor: function (z) {
      if (!canIssueMotorUiCommand(z)) return;
      setEntity('number-motor_' + z + '_target_position', { value: 0 });
      postAPI('/button/' + encodeURIComponent('Zone ' + z + ' Close 0%'));
    },
    stopMotor: function (z) {
      if (!canIssueMotorUiCommand(z)) return;
      postAPI('/button/' + encodeURIComponent('Zone ' + z + ' Stop'));
    },
    tEWSel: function (dir) { window._hv6.tEW(selectedZone, dir); },
    otaUpload: function () {
      var fileEl = h('ota-file');
      if (!fileEl || !fileEl.files || !fileEl.files[0]) { alert('Please select a .bin firmware file first.'); return; }
      var f = fileEl.files[0];
      if (!confirm('Upload "' + f.name + '" (' + Math.round(f.size / 1024) + '\u00a0KB)?\n\nThe device will reboot after a successful upload.')) return;
      var statusEl = h('ota-status');
      var barEl = h('ota-bar');
      var pctEl = h('ota-pct');
      var msgEl = h('ota-msg');
      if (statusEl) statusEl.style.display = 'flex';
      if (barEl) barEl.style.width = '0%';
      if (pctEl) pctEl.textContent = '0%';
      if (msgEl) msgEl.textContent = '';
      if (mockMode) {
        var pct = 0;
        var iv = setInterval(function () {
          pct = Math.min(100, pct + 12);
          if (barEl) barEl.style.width = pct + '%';
          if (pctEl) pctEl.textContent = pct + '%';
          if (pct >= 100) { clearInterval(iv); if (statusEl) statusEl.style.display = 'none'; if (msgEl) msgEl.textContent = 'Upload complete (mock). Device would reboot now.'; }
        }, 200);
        return;
      }
      var xhr = new XMLHttpRequest();
      xhr.upload.onprogress = function (e) {
        if (!e.lengthComputable) return;
        var p = Math.round(e.loaded / e.total * 100);
        if (barEl) barEl.style.width = p + '%';
        if (pctEl) pctEl.textContent = p + '%';
      };
      xhr.onload = function () {
        if (statusEl) statusEl.style.display = 'none';
        if (msgEl) msgEl.textContent = xhr.status === 200 ? 'Upload complete. Device is rebooting\u2026' : 'Upload failed: ' + xhr.statusText + ' (' + xhr.status + ')';
      };
      xhr.onerror = function () {
        if (statusEl) statusEl.style.display = 'none';
        if (msgEl) msgEl.textContent = 'Upload failed. Check device connection.';
      };
      xhr.open('POST', '/update');
      xhr.setRequestHeader('Content-Type', 'application/octet-stream');
      xhr.send(f);
    },
    tEW: function (z, dir) {
      var cur = E['text-zone_' + z + '_exterior_walls'] ? (E['text-zone_' + z + '_exterior_walls'].state || '') : '';
      var parsed = parseExteriorState(cur);
      var wallPath = '/text/' + encodeURIComponent('Zone ' + z + ' Exterior Walls') + '/set?value=';
      if (dir === 'NONE') {
        setEntity('text-zone_' + z + '_exterior_walls', { state: 'None' });
        postAPI(wallPath + 'None');
        return;
      }
      var next = '';
      ['N', 'E', 'S', 'W'].forEach(function (d) {
        if (d === dir) {
          if (!parsed[d]) next += d;
        } else if (parsed[d]) {
          next += d;
        }
      });
      setEntity('text-zone_' + z + '_exterior_walls', { state: next || 'None' });
      postAPI(wallPath + encodeURIComponent(next || 'None'));
    },
    clearZoneFaults: function () {
      clearZoneFaultIndicators();
    },
    tOverrideSel: function () {
      zoneManualOverride[selectedZone] = !zoneManualOverride[selectedZone];
      addActivity((zoneManualOverride[selectedZone] ? 'Enabled' : 'Disabled') + ' manual override for ' + zoneLabel(selectedZone), selectedZone);
      updateZonePanel();
    }
  };

  function init() {
    build();
    if (mockMode) startMock();
    else connect();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
