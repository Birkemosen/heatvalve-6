import { component } from '../../core/component.js';
import { injectStyle } from '../../core/style.js';
import { getDashboardValue, subscribeDashboard, NZ } from '../../core/store.js';
import { svgEl, smoothPath, attachTooltip } from '../../core/chart-kit.js';

// Wide viewBox scaled to 100% width with a uniform aspect ratio (meet) so axis
// text stays crisp and proportional instead of stretching with the column width.
const CHART_W = 1000;
const CHART_H = 180;  // match zone-state-timeline SVG height
const PAD_TOP = 14;
const PAD_RIGHT = 42;
const PAD_BOTTOM = 44;
const PAD_LEFT = 42;
const PLOT_W = CHART_W - PAD_LEFT - PAD_RIGHT;
const PLOT_H = CHART_H - PAD_TOP - PAD_BOTTOM;
const PLOT_B = PAD_TOP + PLOT_H;

// 24 h display window — fed by the device's server-side /history ring (sampled
// every 5 min, 288 slots). Entry shape:
//   [uptime_s, z0..z5, absorbing, flow_c, return_c, demand_pct]
const WINDOW_S = 24 * 3600;
const FLOW_INDEX = NZ + 2;     // 8
const RETURN_INDEX = NZ + 3;   // 9
const DEMAND_INDEX = NZ + 4;   // 10

const FLOW_LINE = 'var(--series-warm)';
const RETURN_LINE = 'var(--series-cool)';
const DEMAND_LINE = 'var(--series-solar)';

const css = `
.graph-widgets { display: grid; gap: 12px; }
.graph-widgets .chart-card svg {
  border-radius: 10px;
  background: linear-gradient(180deg, rgba(138,80,143,.10), rgba(0,32,46,.34));
}
.graph-widgets .gw-controls {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  margin: 2px 0 6px;
}
.graph-widgets .gw-toggle {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  border: 1px solid var(--control-border);
  background: var(--control-bg);
  color: var(--text-secondary);
  border-radius: 999px;
  padding: 4px 10px;
  font-size: .68rem;
  font-weight: 700;
  letter-spacing: .3px;
  cursor: pointer;
  transition: background .14s ease, border-color .14s ease, color .14s ease, opacity .14s ease;
}
.graph-widgets .gw-toggle::before {
  content: '';
  width: 9px;
  height: 9px;
  border-radius: 999px;
  border: 2px solid currentColor;
  background: color-mix(in srgb, currentColor 30%, transparent);
  flex-shrink: 0;
}
.graph-widgets .gw-toggle:hover {
  border-color: rgba(255,133,49,.44);
  color: var(--text-strong);
}
.graph-widgets .gw-toggle.is-off {
  opacity: .48;
  background: transparent;
}
.graph-widgets .gw-toggle[data-layer="flow"] { color: var(--series-warm); }
.graph-widgets .gw-toggle[data-layer="return"] { color: var(--series-cool); }
.graph-widgets .gw-toggle[data-layer="demand"] { color: var(--series-solar); }
`;
injectStyle('graph-widgets', css);

// ========================================
// TEMPLATE
// ========================================
const flowCard = () =>
  `<div class="chart-card"><div class="chart-head"><span class="chart-title">Flow / Return / Demand</span><span class="chart-sub gw-dt">—</span></div>` +
  `<div class="gw-controls" role="toolbar" aria-label="Flow chart layers">` +
    `<button type="button" class="gw-toggle" data-layer="flow" aria-pressed="true">Flow</button>` +
    `<button type="button" class="gw-toggle" data-layer="return" aria-pressed="true">Return</button>` +
    `<button type="button" class="gw-toggle" data-layer="demand" aria-pressed="true">Demand</button>` +
  `</div>` +
  `<svg class="gw-flow"></svg></div>`;

const demandCard = () =>
  `<div class="chart-card"><div class="chart-head"><span class="chart-title">Demand Index</span><span class="chart-sub gw-demand-text">—</span></div>` +
  `<svg class="gw-demand"></svg></div>`;

const template = (ctx) => {
  if (ctx.variant === 'flow-return') return `<div class="graph-widgets">${flowCard()}</div>`;
  if (ctx.variant === 'demand') return `<div class="graph-widgets">${demandCard()}</div>`;
  return `<div class="graph-widgets">${flowCard()}${demandCard()}</div>`;
};

// ========================================
// HELPERS
// ========================================
function fmtTick(value, unit) {
  if (!Number.isFinite(value)) return '—';
  return unit === '%' ? Math.round(value) + '%' : value.toFixed(1);
}

function fmtValue(value, unit) {
  if (!Number.isFinite(value)) return '—';
  return unit === '%' ? Math.round(value) + '%' : value.toFixed(1) + '°';
}

function seriesFromHistory(entries, valueIndex, windowStart) {
  const out = [];
  for (let i = 0; i < entries.length; i++) {
    const e = entries[i];
    if (!e || e[0] < windowStart) continue;
    const v = e[valueIndex];
    if (v == null || !Number.isFinite(v)) continue;
    out.push({ t: e[0], v });
  }
  return out;
}

const xForTime = (t, windowStart) => PAD_LEFT + Math.max(0, Math.min(1, (t - windowStart) / WINDOW_S)) * PLOT_W;

function drawHourlyAxis(svg, windowStart, uptime) {
  const nowEpoch = Number(Date.now() / 1000) | 0;
  const hourS = 3600;
  const firstHourEpoch = Math.ceil((nowEpoch - WINDOW_S) / hourS) * hourS;
  const lastHourEpoch = Math.floor(nowEpoch / hourS) * hourS;
  const currentHourEpoch = Math.floor(nowEpoch / hourS) * hourS;

  for (let epoch = firstHourEpoch; epoch <= lastHourEpoch; epoch += hourS) {
    const t = uptime - (nowEpoch - epoch);
    const x = xForTime(t, windowStart);
    const d = new Date(epoch * 1000);
    const isCurrent = epoch === currentHourEpoch;
    const y = PLOT_B + 16;
    svg.appendChild(svgEl('text', {
      x, y,
      'text-anchor': 'end',
      transform: `rotate(-45 ${x.toFixed(1)} ${y})`,
      class: 'chart-hour' + (isCurrent ? ' now' : ''),
    }, String(d.getHours()).padStart(2, '0')));
  }

  const nowX = xForTime(uptime, windowStart);
  svg.appendChild(svgEl('line', {
    x1: nowX, y1: PAD_TOP, x2: nowX, y2: PLOT_B,
    stroke: 'var(--series-solar)',
    'stroke-width': '1',
    'stroke-dasharray': '2 3',
    opacity: '.55',
    'vector-effect': 'non-scaling-stroke',
  }));
}

function getRange(seriesList) {
  const values = [];
  seriesList.forEach((s) => s.forEach((p) => values.push(p.v)));
  if (!values.length) return { min: 0, max: 10 };
  let min = Math.min(...values), max = Math.max(...values);
  if (min === max) { min -= 0.5; max += 0.5; }
  const pad = (max - min) * 0.1;
  min -= pad;
  max += pad;
  return { min, max };
}

function tempRangeFromDefs(defs, entries, windowStart) {
  const tempSeries = defs.filter((d) => d.unit === 'C')
    .map((d) => seriesFromHistory(entries, d.index, windowStart));
  return getRange(tempSeries);
}

// Draw combined history chart into `svg`, attach a hover tooltip on `card`.
// defs = [{ index, color, label, unit, width, fill }]. Returns teardown.
function drawChart(svg, card, defs, entries, windowStart, uptime) {
  svg.innerHTML = '';
  svg.setAttribute('viewBox', `0 0 ${CHART_W} ${CHART_H}`);
  svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');

  const seriesList = defs.map((d) => seriesFromHistory(entries, d.index, windowStart));
  if (!seriesList.some((s) => s.length)) {
    svg.appendChild(svgEl('text', { x: CHART_W / 2, y: CHART_H / 2, 'text-anchor': 'middle', class: 'chart-empty' }, 'Collecting history…'));
    return null;
  }

  const tempRange = tempRangeFromDefs(defs, entries, windowStart);
  const tempSpan = Math.max(0.001, tempRange.max - tempRange.min);
  const yTemp = (v) => PAD_TOP + (1 - (v - tempRange.min) / tempSpan) * PLOT_H;
  const yDemand = (v) => PAD_TOP + (1 - Math.max(0, Math.min(100, v)) / 100) * PLOT_H;
  const yFor = (d, v) => d.unit === '%' ? yDemand(v) : yTemp(v);

  // gridlines + left temperature ticks + right demand ticks
  for (let t = 0; t < 3; t++) {
    const r = t / 2;
    const y = PAD_TOP + r * PLOT_H;
    svg.appendChild(svgEl('line', { x1: PAD_LEFT, y1: y, x2: PAD_LEFT + PLOT_W, y2: y, class: 'chart-grid' }));
    if (defs.some((d) => d.unit === 'C')) {
      svg.appendChild(svgEl('text', { x: PAD_LEFT - 6, y: y + 4, 'text-anchor': 'end', class: 'chart-tick' },
        fmtTick(tempRange.max - tempSpan * r, 'C') + '°'));
    }
    if (defs.some((d) => d.unit === '%')) {
      svg.appendChild(svgEl('text', { x: PAD_LEFT + PLOT_W + 6, y: y + 4, 'text-anchor': 'start', class: 'chart-tick' },
        fmtTick(100 - 100 * r, '%')));
    }
  }
  svg.appendChild(svgEl('line', { x1: PAD_LEFT, y1: PLOT_B, x2: PAD_LEFT + PLOT_W, y2: PLOT_B, class: 'chart-axis' }));
  if (defs.some((d) => d.unit === 'C')) {
    svg.appendChild(svgEl('text', { x: 9, y: PAD_TOP + PLOT_H / 2,
      transform: `rotate(-90 9 ${(PAD_TOP + PLOT_H / 2).toFixed(1)})`, 'text-anchor': 'middle', class: 'chart-axis-label' }, 'Temp'));
  }
  if (defs.some((d) => d.unit === '%')) {
    svg.appendChild(svgEl('text', { x: CHART_W - 9, y: PAD_TOP + PLOT_H / 2,
      transform: `rotate(90 ${CHART_W - 9} ${(PAD_TOP + PLOT_H / 2).toFixed(1)})`, 'text-anchor': 'middle', class: 'chart-axis-label' }, 'Demand'));
  }

  drawHourlyAxis(svg, windowStart, uptime);

  // series (area fill first, then smooth line)
  defs.forEach((d, k) => {
    const pts = seriesList[k].map((p) => ({ x: xForTime(p.t, windowStart), y: yFor(d, p.v) }));
    if (!pts.length) return;
    const line = smoothPath(pts);
    if (d.fill) {
      svg.appendChild(svgEl('path', { d: line + ` L ${pts[pts.length - 1].x.toFixed(1)} ${PLOT_B} L ${pts[0].x.toFixed(1)} ${PLOT_B} Z`, fill: d.fill, stroke: 'none' }));
    }
    svg.appendChild(svgEl('path', { d: line, fill: 'none', stroke: d.color, 'stroke-width': String(d.width || 2.2), 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }));
  });

  // unified samples for the tooltip (align series on shared timestamps)
  const samples = [];
  for (let i = 0; i < entries.length; i++) {
    const e = entries[i];
    if (!e || e[0] < windowStart) continue;
    const vals = defs.map((d) => e[d.index]);
    if (vals.every((v) => v == null || !Number.isFinite(v))) continue;
    samples.push({ t: e[0], vals });
  }
  if (!samples.length) return null;

  const nowMs = Date.now();
  return attachTooltip(svg, card, {
    count: samples.length, plotTop: PAD_TOP, plotBottom: PLOT_B,
    xAt: (i) => xForTime(samples[i].t, windowStart),
    label: (i) => {
      const d = new Date(nowMs - (uptime - samples[i].t) * 1000);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    },
    dots: (i) => defs.map((d, k) => ({ y: yFor(d, samples[i].vals[k]), color: d.color }))
      .filter((_, k) => Number.isFinite(samples[i].vals[k])),
    rows: (i) => defs.map((d, k) => ({ color: d.color, label: d.label, value: fmtValue(samples[i].vals[k], d.unit) }))
      .filter((_, k) => Number.isFinite(samples[i].vals[k])),
  });
}

function lastVal(entries, index, windowStart) {
  const s = seriesFromHistory(entries, index, windowStart);
  return s.length ? s[s.length - 1].v : null;
}

// ========================================
// COMPONENT
// ========================================
export default component({
  tag: 'graph-widgets',
  state: (props) => ({ variant: (props && props.variant) || 'both' }),
  render: template,
  onMount(ctx, el) {
    const dtEl = el.querySelector('.gw-dt');
    const demandTextEl = el.querySelector('.gw-demand-text');
    const flowSvg = el.querySelector('.gw-flow');
    const demandSvg = el.querySelector('.gw-demand');
    const controls = Array.from(el.querySelectorAll('.gw-toggle'));
    const visible = { flow: true, return: true, demand: true };
    let flowTeardown = null, demandTeardown = null;

    function paintControls() {
      controls.forEach((btn) => {
        const layer = btn.dataset.layer;
        btn.classList.toggle('is-off', !visible[layer]);
        btn.setAttribute('aria-pressed', visible[layer] ? 'true' : 'false');
      });
    }

    function combinedDefs() {
      const defs = [];
      if (visible.flow) defs.push({ index: FLOW_INDEX, color: FLOW_LINE, label: 'Flow', unit: 'C', width: 2.4 });
      if (visible.return) defs.push({ index: RETURN_INDEX, color: RETURN_LINE, label: 'Return', unit: 'C', width: 2 });
      if (visible.demand) defs.push({ index: DEMAND_INDEX, color: DEMAND_LINE, label: 'Demand', unit: '%', width: 1.8, fill: 'rgba(255,193,77,.10)' });
      return defs;
    }

    function update() {
      const hist = getDashboardValue('zoneStateHistory');
      const entries = hist && Array.isArray(hist.entries) ? hist.entries : [];
      const uptime = (hist && hist.uptime_s) || (Number(Date.now() / 1000) | 0);
      const windowStart = uptime - WINDOW_S;

      if (flowSvg) {
        if (flowTeardown) flowTeardown();
        const lf = lastVal(entries, FLOW_INDEX, windowStart);
        const lr = lastVal(entries, RETURN_INDEX, windowStart);
        const ld = lastVal(entries, DEMAND_INDEX, windowStart);
        const parts = [];
        if (lf != null && lr != null) parts.push('Δ ' + (lf - lr).toFixed(1) + '°');
        if (ld != null) parts.push(Math.round(ld) + '%');
        dtEl.textContent = parts.length ? parts.join(' · ') : '—';
        flowTeardown = drawChart(flowSvg, flowSvg.closest('.chart-card'),
          combinedDefs(), entries, windowStart, uptime);
      }
      if (demandSvg) {
        if (demandTeardown) demandTeardown();
        const ld = lastVal(entries, DEMAND_INDEX, windowStart);
        demandTextEl.textContent = ld != null ? Math.round(ld) + '%' : '—';
        demandTeardown = drawChart(demandSvg, demandSvg.closest('.chart-card'),
          [{ index: DEMAND_INDEX, color: DEMAND_LINE, label: 'Demand', unit: '%', width: 2.2, fill: 'var(--series-cool-fill)' }],
          entries, windowStart, uptime);
      }
    }

    controls.forEach((btn) => {
      btn.addEventListener('click', () => {
        const layer = btn.dataset.layer;
        visible[layer] = !visible[layer];
        if (!visible.flow && !visible.return && !visible.demand) visible[layer] = true;
        paintControls();
        update();
      });
    });

    subscribeDashboard('zoneStateHistory', update);
    paintControls();
    update();
  }
});
