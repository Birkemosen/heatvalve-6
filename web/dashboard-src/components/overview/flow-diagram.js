import { component, subscribe } from '../../core/component.js';
import { ev, es, isEntityOn, subscribeDashboard, zoneTag } from '../../core/store.js';
import { fmtT, fmtV } from '../../utils/format.js';
import { injectStyle } from '../../core/style.js';
import { key, gkey } from '../../utils/keys.js';

// =======================
// CSS (scoped by class)
// =======================
const css = `
.flow-wrap {
  width: 100%;
  border-radius: 18px;
  overflow: hidden;
  border: 1px solid var(--panel-border);
  box-shadow: var(--panel-shadow);
}

.flow-svg {
  width: 100%;
  height: auto;
}

.flow-line {
  stroke-dasharray: 6;
  animation: flow 1s linear infinite;
}

@keyframes flow {
  from { stroke-dashoffset: 0; }
  to   { stroke-dashoffset: -12; }
}

.return-line {
  stroke: #42a5f5;
  stroke-width: 4;
}

.valve {
  transition: height 0.3s ease, y 0.3s ease, fill 0.3s ease;
}

.label {
  font-size: 10px;
  fill: #ccc;
}

.flow-temp,
.ret-temp {
  font-size: 10px;
  fill: #ccc;
}
`;

// inject once
injectStyle('flow-diagram', css);

const ZONES = 6;

// =======================
// TEMPLATE
// =======================
// ---- Flow diagram geometry constants ----
var FD_ZY = [60, 126, 192, 258, 324, 390];
var FD_MYC = 225;
var FD_BX = 36, FD_BW = 160, FD_BH = 90;
var FD_SX = FD_BX + FD_BW;
var FD_EX = 640;
var FD_SPREAD = 11;
var FD_SRC_HW = 6;
var FD_BG_DST_HW = 24;
var FD_COL_ZONE_X = FD_EX + 20;
var FD_COL_TEMP_X = FD_EX + 200;
var FD_COL_FLOW_X = FD_EX + 360;
var FD_COL_RET_X = FD_EX + 420;
var FD_COLOR_DISABLED = '#7D8BA7';
var FD_COLOR_EMPTY = '#6C7892';
var FD_COLOR_FLOW_LOW = '#8FCBFF';
var FD_COLOR_FLOW_MID = '#BCDFFF';
var FD_COLOR_FLOW_HIGH = '#E4D092';
var FD_COLOR_FLOW_HOT = '#F2B74C';
var FD_COLOR_RETURN = '#8FCBFF';
var FD_COLOR_ZONE_ON = '#D8E7FF';
var FD_COLOR_ZONE_OFF = '#7D8BA7';
var FD_COLOR_FRIENDLY_ON = '#B7CBF0';
var FD_COLOR_FRIENDLY_OFF = '#6C7892';
var FD_COLOR_COL_HEAD = '#A3B6D9';
var FD_COLOR_DT_LABEL = '#8EA4CD';
var FD_COLOR_DT_LOW = '#42A5F5';
var FD_COLOR_DT_OK = '#66BB6A';
var FD_COLOR_DT_HIGH = '#EF5350';

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

function parseProbeIndex(label) {
  if (!label) return null;
  const match = String(label).match(/(\d+)/);
  if (!match) return null;
  const probe = Number(match[1]);
  return Number.isFinite(probe) && probe >= 1 && probe <= 8 ? probe : null;
}

function compactFriendlyName(zone) {
  const text = String(zoneTag(zone) || '').trim();
  if (!text) return '';
  const upper = text.toUpperCase();
  return upper.length > 18 ? upper.slice(0, 17) + '…' : upper;
}

function flowColorByPercent(pct, enabled) {
  if (!enabled) return FD_COLOR_DISABLED;
  if (pct == null || Number.isNaN(pct)) return FD_COLOR_EMPTY;
  if (pct < 0.15) return FD_COLOR_FLOW_LOW;
  if (pct < 0.4) return FD_COLOR_FLOW_MID;
  if (pct < 0.7) return FD_COLOR_FLOW_HIGH;
  return FD_COLOR_FLOW_HOT;
}

function buildFlowDiagram() {
  var W = 1160, H = 460;
    var by = FD_MYC - FD_BH / 2;
    var p = [];
    p.push('<svg viewBox="0 0 ' + W + ' ' + H + '" preserveAspectRatio="xMidYMid meet">');
    p.push('<defs>');
    p.push('<pattern id="fdots" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse"><circle cx="10" cy="10" r="1" fill="rgba(92,138,196,0.26)"/></pattern>');
    p.push('<radialGradient id="fglow" cx="22%" cy="34%" r="72%"><stop offset="0%" stop-color="rgba(83,168,255,0.2)"/><stop offset="48%" stop-color="rgba(238,161,17,0.1)"/><stop offset="100%" stop-color="transparent"/></radialGradient>');
    p.push('<linearGradient id="lbgrad" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stop-color="#A06808"/><stop offset="100%" stop-color="#EEA111"/></linearGradient>');
    for (var gz = 1; gz <= ZONES; gz++) {
      p.push('<linearGradient id="rg' + gz + '" x1="0" y1="0" x2="1" y2="0">');
      p.push('<stop id="rgs' + gz + '" offset="0%" stop-color="#EEA111"/>');
      p.push('<stop id="rga' + gz + '" offset="100%" stop-color="#53A8FF"/>');
      p.push('</linearGradient>');
    }
    p.push('</defs>');
    p.push('<rect width="' + W + '" height="' + H + '" rx="22" fill="#0F213C"/>');
    p.push('<rect width="' + W + '" height="' + H + '" rx="22" fill="url(#fdots)" opacity="0.5"/>');
    p.push('<rect width="' + W + '" height="' + H + '" rx="22" fill="url(#fglow)"/>');

    // Background shadow ribbons (dark, full capacity)
    for (var z = 1; z <= ZONES; z++) {
      var bgD = fdRibbon(z - 1, FD_SRC_HW, FD_BG_DST_HW);
      p.push('<path d="' + bgD + '" fill="#1E2233" opacity="0.9"/>');
    }
    // Foreground active ribbons with gradient fill
    for (z = 1; z <= ZONES; z++) {
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

    // Zone columns header
    p.push('<text x="' + FD_COL_ZONE_X + '" y="34" font-size="11" fill="' + FD_COLOR_COL_HEAD + '" font-weight="700" letter-spacing="2">ZONE</text>');
    p.push('<text x="' + FD_COL_TEMP_X + '" y="34" font-size="11" fill="' + FD_COLOR_COL_HEAD + '" font-weight="700" letter-spacing="2">TEMP</text>');
    p.push('<text x="' + FD_COL_FLOW_X + '" y="34" font-size="11" fill="' + FD_COLOR_COL_HEAD + '" font-weight="700" letter-spacing="2">FLOW</text>');
    p.push('<text x="' + FD_COL_RET_X + '" y="34" font-size="11" fill="' + FD_COLOR_COL_HEAD + '" font-weight="700" letter-spacing="2">RET</text>');

    // Zone labels + friendly name + temperature + flow% + return temperature
    for (z = 1; z <= ZONES; z++) {
      var yy = FD_ZY[z - 1];
      p.push('<text id="fd-zn' + z + '" x="' + FD_COL_ZONE_X + '" y="' + (yy + 2) + '" font-size="14" fill="#CFE0FF" font-weight="700" letter-spacing="2">ZONE ' + z + '</text>');
      p.push('<text id="fd-zf' + z + '" x="' + FD_COL_ZONE_X + '" y="' + (yy + 18) + '" font-size="11" fill="#A8BCE3" font-weight="700" letter-spacing="1">---</text>');
      p.push('<text id="fd-zsp' + z + '" x="' + (FD_COL_ZONE_X + 82) + '" y="' + (yy + 18) + '" font-size="11" fill="' + FD_COLOR_FRIENDLY_OFF + '" font-weight="600" font-family="var(--mono)"></text>');
      p.push('<text id="fd-zt' + z + '" x="' + FD_COL_TEMP_X + '" y="' + (yy + 10) + '" font-size="16" fill="#ECECEC" font-weight="700" font-family="var(--mono)">---°C</text>');
      p.push('<text id="fd-zv' + z + '" x="' + FD_COL_FLOW_X + '" y="' + (yy + 10) + '" font-size="16" fill="#AEC0E6" font-weight="700" font-family="var(--mono)">---%</text>');
      p.push('<text id="fd-zr' + z + '" x="' + FD_COL_RET_X + '" y="' + (yy + 10) + '" font-size="16" fill="#AEC0E6" font-weight="700" font-family="var(--mono)">---</text>');
    }

    // Bottom-left: Delta-T display
    p.push('<text x="36" y="' + (H - 52) + '" font-size="16" font-weight="700" fill="' + FD_COLOR_DT_LABEL + '" letter-spacing="3">ΔT Flow-Return</text>');
    p.push('<text id="fd-dt" x="36" y="' + (H - 16) + '" font-size="36" font-weight="800" fill="#EEA111" font-family="var(--mono)">---</text>');

    p.push('<text x="' + (W - 36) + '" y="' + (H - 14) + '" text-anchor="end" font-size="15" fill="#2B3243" font-weight="700" letter-spacing="6">UFH - ' + ZONES + ' ZONES - HEATVALVE</text>');
    p.push('</svg>');
    return '<div class="flow-wrap">' + p.join('') + '</div>';
}

const template = () => `<div class="flow-wrap">${buildFlowDiagram()}</div>`;

// =======================
// COMPONENT
// =======================

component({
  tag: 'flow-diagram',

  render: template,

  onMount(ctx, el) {
    const refs = {
      flowEl: el.querySelector('#fd-flow-temp'),
      retEl: el.querySelector('#fd-ret-temp'),
      dtEl: el.querySelector('#fd-dt'),
      zones: new Array(ZONES + 1)
    };

    for (let zone = 1; zone <= ZONES; zone++) {
      refs.zones[zone] = {
        textTemp: el.querySelector('#fd-zt' + zone),
        textSetpoint: el.querySelector('#fd-zsp' + zone),
        textFlow: el.querySelector('#fd-zv' + zone),
        textRet: el.querySelector('#fd-zr' + zone),
        label: el.querySelector('#fd-zn' + zone),
        friendly: el.querySelector('#fd-zf' + zone),
        path: el.querySelector('#fd-path-' + zone)
      };
    }

    function update() {
      const flow = ev(gkey.flow);
      const ret = ev(gkey.ret);
      const flowEl = refs.flowEl;
      const retEl = refs.retEl;
      const dtEl = refs.dtEl;

      flowEl.textContent = fmtT(flow);
      retEl.textContent = 'RET ' + fmtT(ret);
      if (flow != null && ret != null) {
        const dt = Number(flow) - Number(ret);
        dtEl.textContent = dt.toFixed(1) + '°C';
        dtEl.setAttribute('fill', dt < 3 ? FD_COLOR_DT_LOW : dt > 8 ? FD_COLOR_DT_HIGH : FD_COLOR_DT_OK);
      } else {
        dtEl.textContent = '---';
      }

      for (let zone = 1; zone <= ZONES; zone++) {
        const temp = ev(key.temp(zone));
        const setpoint = ev(key.setpoint(zone));
        const valve = ev(key.valve(zone));
        const enabled = isEntityOn(key.enabled(zone));
        const source = String(es(key.tempSource(zone)) || 'Local Probe');
        const probe = parseProbeIndex(es(key.probe(zone)) || '');
        const returnTemp = probe ? ev(key.probeTemp(probe)) : null;
        const zoneRefs = refs.zones[zone];
        const textTemp = zoneRefs.textTemp;
        const textSetpoint = zoneRefs.textSetpoint;
        const textFlow = zoneRefs.textFlow;
        const textRet = zoneRefs.textRet;
        const label = zoneRefs.label;
        const friendly = zoneRefs.friendly;
        const path = zoneRefs.path;
        const pct = valve != null ? Math.max(0, Math.min(100, Number(valve))) / 100 : 0;

        label.textContent = 'ZONE ' + zone;
        const tag = compactFriendlyName(zone);
        friendly.textContent = tag || '---';
        label.setAttribute('fill', enabled ? FD_COLOR_ZONE_ON : FD_COLOR_ZONE_OFF);
        friendly.setAttribute('fill', enabled ? FD_COLOR_FRIENDLY_ON : FD_COLOR_FRIENDLY_OFF);
        textSetpoint.setAttribute('fill', enabled ? FD_COLOR_FRIENDLY_ON : FD_COLOR_FRIENDLY_OFF);
        const fnWidth = friendly.getComputedTextLength ? friendly.getComputedTextLength() : 0;
        textSetpoint.setAttribute('x', String(FD_COL_ZONE_X + fnWidth + 8));
        const tempStr = fmtT(temp);
        const setpointStr = setpoint != null ? fmtT(setpoint) : null;
        textTemp.textContent = tempStr;
        textSetpoint.textContent = setpointStr ? '(' + setpointStr + ')' : '';
        textFlow.textContent = fmtV(valve);
        textFlow.setAttribute('fill', flowColorByPercent(pct, enabled));
        if (source !== 'Local Probe' && returnTemp != null && !Number.isNaN(Number(returnTemp))) {
          textRet.textContent = fmtT(returnTemp);
          textRet.setAttribute('fill', enabled ? FD_COLOR_RETURN : FD_COLOR_DISABLED);
        } else {
          textRet.textContent = '---';
          textRet.setAttribute('fill', FD_COLOR_EMPTY);
        }
        if (!enabled) {
          path.setAttribute('d', fdRibbon(zone - 1, 1, 2));
          path.setAttribute('fill', '#2A2D38');
          path.setAttribute('opacity', '0.4');
        } else {
          const dstHW = Math.max(3, pct * FD_BG_DST_HW);
          const srcHW = Math.max(1.5, pct * FD_SRC_HW);
          path.setAttribute('d', fdRibbon(zone - 1, srcHW, dstHW));
          path.setAttribute('fill', 'url(#rg' + zone + ')');
          path.setAttribute('opacity', '1');
        }
      }
    }

    subscribe(gkey.flow, update);
    subscribe(gkey.ret, update);
    subscribeDashboard('zoneNames', update);
    for (let zone = 1; zone <= ZONES; zone++) {
      subscribe(key.temp(zone), update);
      subscribe(key.setpoint(zone), update);
      subscribe(key.valve(zone), update);
      subscribe(key.enabled(zone), update);
      subscribe(key.probe(zone), update);
      subscribe(key.tempSource(zone), update);
    }
    for (let probe = 1; probe <= 8; probe++) subscribe(key.probeTemp(probe), update);
    update();
  }
});
