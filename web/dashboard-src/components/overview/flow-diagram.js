import { component, subscribe } from '../../core/component.js';
import { ev, es, isEntityOn, subscribeDashboard, zoneTag } from '../../core/store.js';
import { fmtT, fmtV } from '../../utils/format.js';
import { injectStyle } from '../../core/style.js';
import { key, gkey } from '../../utils/keys.js';

const ZONES = 6;

const COLOR_DISABLED = '#6E7E96';
const COLOR_EMPTY = '#5C6B85';
const COLOR_FLOW_LOW = '#8a508f';
const COLOR_FLOW_MID = '#BC5090';
const COLOR_FLOW_HIGH = '#FF8531';
const COLOR_FLOW_HOT = '#FFA600';
const COLOR_RETURN = '#8a508f';
const COLOR_ZONE_ON = '#FFEAD2';
const COLOR_ZONE_OFF = '#6E7E96';
const COLOR_FRIENDLY_ON = '#C7B6CE';
const COLOR_FRIENDLY_OFF = '#5C6B85';
const COLOR_COL_HEAD = '#A38FB0';
const COLOR_DT_LABEL = '#9A86A8';
const COLOR_DT_LOW = '#8a508f';
const COLOR_DT_OK = '#66BB6A';
const COLOR_DT_HIGH = '#FF6361';

const DESKTOP = {
  w: 1160, h: 310,
  boxX: 452, boxY: 34, boxW: 256, boxH: 68,
  topBarY: 0, topBarH: 24,
  srcY: 102, fanY: 158, zoneY: 232,
  zoneXs: [92, 286, 480, 674, 868, 1062],
  srcSpread: 15, bgDstHW: 28, srcHW: 7,
};

const MOBILE = {
  w: 760, h: 340,
  boxX: 38, boxY: 132, boxW: 142, boxH: 72,
  srcX: 180, endX: 386, nameX: 446, midY: 168,
  zoneYs: [58, 104, 150, 196, 242, 288],
  spread: 8, bgDstHW: 15, srcHW: 4,
};

const css = `
.flow-wrap {
  width: 100%;
  border-radius: 18px;
  overflow: hidden;
  border: 1px solid var(--panel-border);
  box-shadow: var(--panel-shadow);
  background: #042a3b;
}

.flow-svg {
  width: 100%;
  height: auto;
  display: block;
}

.flow-svg-mobile { display: none; }

.flow-zone-hit {
  transition: opacity .2s ease;
}

.flow-ribbon {
  transition: d .6s ease, opacity .35s ease;
}

.flow-metric {
  font-family: var(--mono);
  font-weight: 800;
}

@media (max-width: 760px) {
  .flow-svg-desktop { display: none; }
  .flow-svg-mobile { display: block; }
}
`;

injectStyle('flow-diagram', css);

function compactFriendlyName(zone, limit) {
  const text = String(zoneTag(zone) || '').trim();
  if (!text) return '';
  const upper = text.toUpperCase();
  return upper.length > limit ? upper.slice(0, Math.max(1, limit - 1)) + '…' : upper;
}

function parseProbeIndex(label) {
  if (!label) return null;
  const match = String(label).match(/(\d+)/);
  if (!match) return null;
  const probe = Number(match[1]);
  return Number.isFinite(probe) && probe >= 1 && probe <= 8 ? probe : null;
}

function flowColorByPercent(pct, enabled) {
  if (!enabled) return COLOR_DISABLED;
  if (pct == null || Number.isNaN(pct)) return COLOR_EMPTY;
  if (pct < 0.15) return COLOR_FLOW_LOW;
  if (pct < 0.4) return COLOR_FLOW_MID;
  if (pct < 0.7) return COLOR_FLOW_HIGH;
  return COLOR_FLOW_HOT;
}

function bgDefs(layout) {
  const dir = layout === 'desktop' ? '0 1' : '1 0';
  const p = [];
  p.push('<defs>');
  p.push('<pattern id="' + layout + '-fdots" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse"><circle cx="10" cy="10" r="1" fill="rgba(92,138,196,0.26)"/></pattern>');
  p.push('<radialGradient id="' + layout + '-fglow" cx="32%" cy="18%" r="78%"><stop offset="0%" stop-color="rgba(122,167,206,0.18)"/><stop offset="52%" stop-color="rgba(240,121,91,0.08)"/><stop offset="100%" stop-color="transparent"/></radialGradient>');
  p.push('<linearGradient id="' + layout + '-boxgrad" x1="0" y1="0" x2="' + dir.split(' ')[0] + '" y2="' + dir.split(' ')[1] + '"><stop offset="0%" stop-color="#9E4A18"/><stop offset="100%" stop-color="#ff8531"/></linearGradient>');
  for (let z = 1; z <= ZONES; z++) {
    p.push('<linearGradient id="' + layout + '-rg' + z + '" x1="0" y1="0" x2="' + dir.split(' ')[0] + '" y2="' + dir.split(' ')[1] + '">');
    p.push('<stop id="' + layout + '-rgs' + z + '" offset="0%" stop-color="#ff8531"/>');
    p.push('<stop id="' + layout + '-rga' + z + '" offset="100%" stop-color="#8a508f"/>');
    p.push('</linearGradient>');
  }
  p.push('</defs>');
  return p.join('');
}

function desktopRibbon(zIdx, hwSrc, hwDst) {
  const x0 = DESKTOP.boxX + DESKTOP.boxW / 2 + (zIdx - 2.5) * DESKTOP.srcSpread;
  const y0 = DESKTOP.srcY;
  const x1 = DESKTOP.zoneXs[zIdx];
  const y1 = DESKTOP.zoneY - 20;
  const c1y = DESKTOP.fanY;
  const c2y = DESKTOP.fanY + 34;
  return 'M' + (x0 - hwSrc).toFixed(1) + ' ' + y0 +
    ' C' + (x0 - hwSrc).toFixed(1) + ' ' + c1y + ' ' + (x1 - hwDst).toFixed(1) + ' ' + c2y + ' ' + (x1 - hwDst).toFixed(1) + ' ' + y1 +
    ' L' + (x1 + hwDst).toFixed(1) + ' ' + y1 +
    ' C' + (x1 + hwDst).toFixed(1) + ' ' + c2y + ' ' + (x0 + hwSrc).toFixed(1) + ' ' + c1y + ' ' + (x0 + hwSrc).toFixed(1) + ' ' + y0 +
    'Z';
}

function mobileRibbon(zIdx, hwSrc, hwDst) {
  const y0 = MOBILE.midY + (zIdx - 2.5) * MOBILE.spread;
  const y1 = MOBILE.zoneYs[zIdx];
  const dx = MOBILE.endX - MOBILE.srcX;
  const c1 = MOBILE.srcX + dx * 0.34;
  const c2 = MOBILE.srcX + dx * 0.70;
  return 'M' + MOBILE.srcX + ' ' + (y0 - hwSrc).toFixed(1) +
    ' C' + c1 + ' ' + (y0 - hwSrc).toFixed(1) + ' ' + c2 + ' ' + (y1 - hwDst).toFixed(1) + ' ' + MOBILE.endX + ' ' + (y1 - hwDst).toFixed(1) +
    ' L' + MOBILE.endX + ' ' + (y1 + hwDst).toFixed(1) +
    ' C' + c2 + ' ' + (y1 + hwDst).toFixed(1) + ' ' + c1 + ' ' + (y0 + hwSrc).toFixed(1) + ' ' + MOBILE.srcX + ' ' + (y0 + hwSrc).toFixed(1) +
    'Z';
}

function background(w, h, layout) {
  return '<rect width="' + w + '" height="' + h + '" rx="22" fill="#042a3b"/>' +
    '<rect width="' + w + '" height="' + h + '" rx="22" fill="url(#' + layout + '-fdots)" opacity="0.48"/>' +
    '<rect width="' + w + '" height="' + h + '" rx="22" fill="url(#' + layout + '-fglow)"/>';
}

function sourceBox(layout) {
  const g = layout === 'desktop' ? DESKTOP : MOBILE;
  const labelY = layout === 'desktop' ? g.boxY + 27 : g.boxY + 29;
  const valueY = layout === 'desktop' ? g.boxY + 56 : g.boxY + 58;
  return '<rect x="' + g.boxX + '" y="' + g.boxY + '" width="' + g.boxW + '" height="' + g.boxH + '" rx="7" fill="#ff8531"/>' +
    '<text x="' + (g.boxX + g.boxW / 2) + '" y="' + labelY + '" text-anchor="middle" font-size="' + (layout === 'desktop' ? 18 : 17) + '" font-weight="800" fill="#00202e" letter-spacing="2">FLOW</text>' +
    '<text id="' + layout + '-fd-flow-temp" class="flow-metric" x="' + (g.boxX + g.boxW / 2) + '" y="' + valueY + '" text-anchor="middle" font-size="' + (layout === 'desktop' ? 26 : 24) + '" fill="#00202e">---</text>';
}

function desktopSvg() {
  const p = [];
  const W = DESKTOP.w, H = DESKTOP.h;
  const lineY = DESKTOP.zoneY - 20;
  p.push('<svg class="flow-svg flow-svg-desktop" viewBox="0 5 ' + W + ' ' + (H - 5) + '" preserveAspectRatio="xMidYMid meet">');
  p.push(bgDefs('desktop'));
  p.push(background(W, H, 'desktop'));
  p.push('<rect x="' + DESKTOP.boxX + '" y="' + DESKTOP.topBarY + '" width="' + DESKTOP.boxW + '" height="' + DESKTOP.topBarH + '" fill="url(#desktop-boxgrad)" rx="5"/>');
  p.push(sourceBox('desktop'));
  p.push('<text id="desktop-fd-ret-temp" x="' + (DESKTOP.boxX + DESKTOP.boxW + 24) + '" y="' + (DESKTOP.boxY + 20) + '" font-size="15" font-weight="800" fill="#8a508f" font-family="var(--mono)">RET ---</text>');
  p.push('<text x="' + (DESKTOP.boxX + DESKTOP.boxW + 24) + '" y="' + (DESKTOP.boxY + 42) + '" font-size="12" font-weight="800" fill="' + COLOR_DT_LABEL + '" letter-spacing="2">ΔT FLOW-RETURN</text>');
  p.push('<text id="desktop-fd-dt" x="' + (DESKTOP.boxX + DESKTOP.boxW + 24) + '" y="' + (DESKTOP.boxY + 65) + '" class="flow-metric" font-size="22" fill="#ff8531">---</text>');

  for (let z = 1; z <= ZONES; z++) p.push('<path d="' + desktopRibbon(z - 1, DESKTOP.srcHW, DESKTOP.bgDstHW) + '" fill="#062a3a" opacity="0.86"/>');
  for (let z = 1; z <= ZONES; z++) p.push('<path id="desktop-fd-path-' + z + '" class="flow-ribbon" d="' + desktopRibbon(z - 1, DESKTOP.srcHW, DESKTOP.bgDstHW) + '" fill="url(#desktop-rg' + z + ')" opacity="1"/>');

  p.push('<line x1="54" y1="' + lineY + '" x2="' + (W - 54) + '" y2="' + lineY + '" stroke="#ff8531" stroke-width="2" opacity=".42"/>');
  for (let z = 1; z <= ZONES; z++) {
    const x = DESKTOP.zoneXs[z - 1];
    p.push('<g class="flow-zone-hit">');
    p.push('<line x1="' + x + '" y1="' + (lineY - 8) + '" x2="' + x + '" y2="' + (lineY + 8) + '" stroke="#ff8531" stroke-width="2" opacity=".5"/>');
    p.push('<text id="desktop-fd-zn' + z + '" x="' + x + '" y="' + (lineY - 13) + '" text-anchor="middle" font-size="13" fill="#FFEAD2" font-weight="800" letter-spacing="1.8">Z' + z + '</text>');
    p.push('<text id="desktop-fd-zf' + z + '" x="' + x + '" y="' + (lineY + 20) + '" text-anchor="middle" font-size="9.5" fill="#B6A6C0" font-weight="700" letter-spacing=".8">---</text>');
    p.push('<text id="desktop-fd-zsp' + z + '" x="' + x + '" y="' + (lineY + 20) + '" text-anchor="middle" font-size="9" fill="' + COLOR_FRIENDLY_OFF + '" font-weight="600" font-family="var(--mono)"></text>');
    p.push('<text id="desktop-fd-zt' + z + '" x="' + x + '" y="' + (lineY + 42) + '" text-anchor="middle" class="flow-metric" font-size="15" fill="#F6ECE0">---°C</text>');
    p.push('<text id="desktop-fd-zv' + z + '" x="' + (x - 28) + '" y="' + (lineY + 61) + '" text-anchor="middle" class="flow-metric" font-size="13" fill="#C7B7D0">---%</text>');
    p.push('<text id="desktop-fd-zr' + z + '" x="' + (x + 28) + '" y="' + (lineY + 61) + '" text-anchor="middle" class="flow-metric" font-size="13" fill="#C7B7D0">---</text>');
    p.push('</g>');
  }
  p.push('</svg>');
  return p.join('');
}

function mobileSvg() {
  const p = [];
  const W = MOBILE.w, H = MOBILE.h;
  p.push('<svg class="flow-svg flow-svg-mobile" viewBox="0 0 ' + W + ' ' + H + '" preserveAspectRatio="xMidYMid meet">');
  p.push(bgDefs('mobile'));
  p.push(background(W, H, 'mobile'));
  p.push('<rect x="0" y="' + MOBILE.boxY + '" width="' + (MOBILE.boxX - 6) + '" height="' + MOBILE.boxH + '" fill="url(#mobile-boxgrad)" rx="4"/>');
  p.push(sourceBox('mobile'));

  for (let z = 1; z <= ZONES; z++) p.push('<path d="' + mobileRibbon(z - 1, MOBILE.srcHW, MOBILE.bgDstHW) + '" fill="#062a3a" opacity="0.86"/>');
  for (let z = 1; z <= ZONES; z++) p.push('<path id="mobile-fd-path-' + z + '" class="flow-ribbon" d="' + mobileRibbon(z - 1, MOBILE.srcHW, MOBILE.bgDstHW) + '" fill="url(#mobile-rg' + z + ')" opacity="1"/>');
  p.push('<rect x="' + (MOBILE.boxX + 9) + '" y="' + (MOBILE.boxY + MOBILE.boxH + 9) + '" width="' + (MOBILE.boxW - 18) + '" height="60" rx="8" fill="rgba(4,42,59,.64)"/>');
  p.push('<text id="mobile-fd-ret-temp" x="' + (MOBILE.boxX + MOBILE.boxW / 2) + '" y="' + (MOBILE.boxY + MOBILE.boxH + 27) + '" text-anchor="middle" font-size="12.5" font-weight="800" fill="#8a508f" font-family="var(--mono)">RET ---</text>');
  p.push('<text x="' + (MOBILE.boxX + MOBILE.boxW / 2) + '" y="' + (MOBILE.boxY + MOBILE.boxH + 43) + '" text-anchor="middle" font-size="9.5" font-weight="800" fill="' + COLOR_DT_LABEL + '" letter-spacing="1.1">ΔT FLOW-RETURN</text>');
  p.push('<text id="mobile-fd-dt" x="' + (MOBILE.boxX + MOBILE.boxW / 2) + '" y="' + (MOBILE.boxY + MOBILE.boxH + 63) + '" text-anchor="middle" class="flow-metric" font-size="19" fill="#ff8531">---</text>');
  p.push('<line x1="' + MOBILE.endX + '" y1="34" x2="' + MOBILE.endX + '" y2="' + (H - 34) + '" stroke="#ff8531" stroke-width="2" opacity=".48"/>');

  p.push('<text x="506" y="30" font-size="10" fill="' + COLOR_COL_HEAD + '" font-weight="700" letter-spacing="1.5">TEMP</text>');
  p.push('<text x="592" y="30" font-size="10" fill="' + COLOR_COL_HEAD + '" font-weight="700" letter-spacing="1.5">FLOW</text>');
  p.push('<text x="678" y="30" font-size="10" fill="' + COLOR_COL_HEAD + '" font-weight="700" letter-spacing="1.5">RET</text>');
  for (let z = 1; z <= ZONES; z++) {
    const y = MOBILE.zoneYs[z - 1];
    p.push('<line x1="' + (MOBILE.endX - 8) + '" y1="' + y + '" x2="' + (MOBILE.endX + 8) + '" y2="' + y + '" stroke="#ff8531" stroke-width="2" opacity=".5"/>');
    p.push('<text id="mobile-fd-zn' + z + '" x="' + (MOBILE.endX - 14) + '" y="' + (y + 4) + '" text-anchor="end" font-size="12" fill="#FFEAD2" font-weight="800" letter-spacing="1.4">Z' + z + '</text>');
    p.push('<text id="mobile-fd-zf' + z + '" x="' + MOBILE.nameX + '" y="' + (y - 8) + '" text-anchor="middle" font-size="9" fill="#B6A6C0" font-weight="700" letter-spacing=".7">---</text>');
    p.push('<text id="mobile-fd-zsp' + z + '" x="' + MOBILE.nameX + '" y="' + (y + 7) + '" text-anchor="middle" font-size="8.5" fill="' + COLOR_FRIENDLY_OFF + '" font-weight="600" font-family="var(--mono)"></text>');
    p.push('<text id="mobile-fd-zt' + z + '" x="506" y="' + (y + 4) + '" class="flow-metric" font-size="13.5" fill="#F6ECE0">---°C</text>');
    p.push('<text id="mobile-fd-zv' + z + '" x="592" y="' + (y + 4) + '" class="flow-metric" font-size="13.5" fill="#C7B7D0">---%</text>');
    p.push('<text id="mobile-fd-zr' + z + '" x="678" y="' + (y + 4) + '" class="flow-metric" font-size="13.5" fill="#C7B7D0">---</text>');
  }
  p.push('</svg>');
  return p.join('');
}

const template = () => '<div class="flow-wrap">' + desktopSvg() + mobileSvg() + '</div>';

component({
  tag: 'flow-diagram',
  render: template,
  onMount(ctx, el) {
    const layouts = ['desktop', 'mobile'];
    const refs = {};
    layouts.forEach((layout) => {
      refs[layout] = {
        flowEl: el.querySelector('#' + layout + '-fd-flow-temp'),
        retEl: el.querySelector('#' + layout + '-fd-ret-temp'),
        dtEl: el.querySelector('#' + layout + '-fd-dt'),
        zones: new Array(ZONES + 1)
      };
      for (let zone = 1; zone <= ZONES; zone++) {
        refs[layout].zones[zone] = {
          textTemp: el.querySelector('#' + layout + '-fd-zt' + zone),
          textSetpoint: el.querySelector('#' + layout + '-fd-zsp' + zone),
          textFlow: el.querySelector('#' + layout + '-fd-zv' + zone),
          textRet: el.querySelector('#' + layout + '-fd-zr' + zone),
          label: el.querySelector('#' + layout + '-fd-zn' + zone),
          friendly: el.querySelector('#' + layout + '-fd-zf' + zone),
          path: el.querySelector('#' + layout + '-fd-path-' + zone)
        };
      }
    });

    function setText(node, value) {
      if (node) node.textContent = value;
    }

    function updateLayout(layout, flow, ret, dt, dtColor) {
      const r = refs[layout];
      setText(r.flowEl, fmtT(flow));
      setText(r.retEl, 'RET ' + fmtT(ret));
      setText(r.dtEl, dt == null ? '---' : dt.toFixed(1) + '°C');
      if (r.dtEl) r.dtEl.setAttribute('fill', dtColor);
    }

    function updateZoneLayout(layout, zone, data) {
      const zoneRefs = refs[layout].zones[zone];
      if (!zoneRefs) return;

      const { enabled, pct, temp, setpoint, valve, returnTemp, hasReturn } = data;
      const tag = compactFriendlyName(zone, layout === 'desktop' ? 11 : 12);
      const tempStr = fmtT(temp);
      const setpointStr = setpoint != null ? fmtT(setpoint) : '';

      setText(zoneRefs.label, 'Z' + zone);
      setText(zoneRefs.friendly, layout === 'desktop'
        ? ((tag || '---') + (setpointStr ? ' (' + setpointStr + ')' : ''))
        : (tag || '---'));
      setText(zoneRefs.textTemp, tempStr);
      setText(zoneRefs.textSetpoint, layout === 'desktop' ? '' : (setpointStr ? '(' + setpointStr + ')' : ''));
      setText(zoneRefs.textFlow, fmtV(valve));
      setText(zoneRefs.textRet, hasReturn ? fmtT(returnTemp) : '---');

      zoneRefs.label.setAttribute('fill', enabled ? COLOR_ZONE_ON : COLOR_ZONE_OFF);
      zoneRefs.friendly.setAttribute('fill', enabled ? COLOR_FRIENDLY_ON : COLOR_FRIENDLY_OFF);
      zoneRefs.textSetpoint.setAttribute('fill', enabled ? COLOR_FRIENDLY_ON : COLOR_FRIENDLY_OFF);
      zoneRefs.textFlow.setAttribute('fill', flowColorByPercent(pct, enabled));
      zoneRefs.textRet.setAttribute('fill', hasReturn && enabled ? COLOR_RETURN : COLOR_EMPTY);

      const path = zoneRefs.path;
      if (!enabled) {
        path.setAttribute('d', layout === 'desktop'
          ? desktopRibbon(zone - 1, 1, 2)
          : mobileRibbon(zone - 1, 1, 2));
        path.setAttribute('fill', '#062a3a');
        path.setAttribute('opacity', '0.38');
      } else {
        const cfg = layout === 'desktop' ? DESKTOP : MOBILE;
        const dstHW = Math.max(2.5, pct * cfg.bgDstHW);
        const srcHW = Math.max(1.3, pct * cfg.srcHW);
        path.setAttribute('d', layout === 'desktop'
          ? desktopRibbon(zone - 1, srcHW, dstHW)
          : mobileRibbon(zone - 1, srcHW, dstHW));
        path.setAttribute('fill', 'url(#' + layout + '-rg' + zone + ')');
        path.setAttribute('opacity', '1');
      }
    }

    function update() {
      const flow = ev(gkey.flow);
      const ret = ev(gkey.ret);
      const dt = flow != null && ret != null ? Number(flow) - Number(ret) : null;
      const dtColor = dt == null ? COLOR_DT_LOW : (dt < 3 ? COLOR_DT_LOW : dt > 8 ? COLOR_DT_HIGH : COLOR_DT_OK);
      layouts.forEach((layout) => updateLayout(layout, flow, ret, dt, dtColor));

      for (let zone = 1; zone <= ZONES; zone++) {
        const temp = ev(key.temp(zone));
        const setpoint = ev(key.setpoint(zone));
        const valve = ev(key.valve(zone));
        const enabled = isEntityOn(key.enabled(zone));
        const source = String(es(key.tempSource(zone)) || 'Local Probe');
        const probe = parseProbeIndex(es(key.probe(zone)) || '');
        const returnTemp = probe ? ev(key.probeTemp(probe)) : null;
        const hasReturn = source !== 'Local Probe' && returnTemp != null && !Number.isNaN(Number(returnTemp));
        const pct = valve != null ? Math.max(0, Math.min(100, Number(valve))) / 100 : 0;
        const data = { enabled, pct, temp, setpoint, valve, returnTemp, hasReturn };
        layouts.forEach((layout) => updateZoneLayout(layout, zone, data));
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
