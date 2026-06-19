import { component } from '../../core/component.js';
import { injectStyle } from '../../core/style.js';
import { getDashboardValue, subscribeDashboard, NZ } from '../../core/store.js';
import { svgEl, smoothPath, attachTooltip, legendHtml } from '../../core/chart-kit.js';

// Wide viewBox scaled to 100% width with a uniform aspect ratio (meet) so axis
// text stays crisp and proportional instead of stretching with the column width.
const CHART_W = 480;
const CHART_H = 210;
const PAD_TOP = 14;
const PAD_RIGHT = 14;
const PAD_BOTTOM = 34;
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
const DEMAND_LINE = 'var(--series-cool)';

const css = `
.graph-widgets { display: grid; gap: 12px; }
.graph-widgets .chart-card svg {
  border-radius: 10px;
  background: linear-gradient(180deg, rgba(138,80,143,.10), rgba(0,32,46,.34));
}
`;
injectStyle('graph-widgets', css);

// ========================================
// TEMPLATE
// ========================================
const flowCard = () =>
  `<div class="chart-card"><div class="chart-head"><span class="chart-title">Flow / Return</span><span class="chart-sub gw-dt">—</span></div>` +
  legendHtml([{ color: FLOW_LINE, label: 'Flow' }, { color: RETURN_LINE, label: 'Return' }]) +
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

function getRange(seriesList, unit) {
  const values = [];
  seriesList.forEach((s) => s.forEach((p) => values.push(p.v)));
  if (!values.length) return unit === '%' ? { min: 0, max: 100 } : { min: 0, max: 10 };
  let min = Math.min(...values), max = Math.max(...values);
  if (unit === '%') { min = 0; max = Math.min(100, max); }
  if (min === max) { const d = unit === '%' ? 5 : 0.5; min -= d; max += d; }
  const pad = (max - min) * 0.1;
  if (unit !== '%') min -= pad;
  max += pad;
  if (unit === '%') { min = Math.max(0, min); max = Math.min(100, max); }
  return { min, max };
}

// Draw one history chart (1–2 series) into `svg`, attach a hover tooltip on
// `card`. defs = [{ index, color, label, width, fill }]. Returns teardown.
function drawChart(svg, card, defs, unit, axisLabel, entries, windowStart, uptime) {
  svg.innerHTML = '';
  svg.setAttribute('viewBox', `0 0 ${CHART_W} ${CHART_H}`);
  svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');

  const seriesList = defs.map((d) => seriesFromHistory(entries, d.index, windowStart));
  if (!seriesList.some((s) => s.length)) {
    svg.appendChild(svgEl('text', { x: CHART_W / 2, y: CHART_H / 2, 'text-anchor': 'middle', class: 'chart-empty' }, 'Collecting history…'));
    return null;
  }

  const { min, max } = getRange(seriesList, unit);
  const span = Math.max(0.001, max - min);
  const yAt = (v) => PAD_TOP + (1 - (v - min) / span) * PLOT_H;

  // gridlines + left y ticks
  for (let t = 0; t < 3; t++) {
    const r = t / 2;
    const y = PAD_TOP + r * PLOT_H;
    svg.appendChild(svgEl('line', { x1: PAD_LEFT, y1: y, x2: PAD_LEFT + PLOT_W, y2: y, class: 'chart-grid' }));
    svg.appendChild(svgEl('text', { x: PAD_LEFT - 6, y: y + 4, 'text-anchor': 'end', class: 'chart-tick' }, fmtTick(max - span * r, unit)));
  }
  svg.appendChild(svgEl('line', { x1: PAD_LEFT, y1: PLOT_B, x2: PAD_LEFT + PLOT_W, y2: PLOT_B, class: 'chart-axis' }));
  svg.appendChild(svgEl('text', { x: 9, y: PAD_TOP + PLOT_H / 2,
    transform: `rotate(-90 9 ${(PAD_TOP + PLOT_H / 2).toFixed(1)})`, 'text-anchor': 'middle', class: 'chart-axis-label' }, axisLabel));

  // x ticks: -24h, -12h, now (live edge in gold)
  [24, 12, 0].forEach((hoursAgo) => {
    const x = xForTime(uptime - hoursAgo * 3600, windowStart);
    svg.appendChild(svgEl('text', {
      x, y: CHART_H - 10,
      'text-anchor': hoursAgo === 24 ? 'start' : (hoursAgo === 0 ? 'end' : 'middle'),
      class: 'chart-hour' + (hoursAgo === 0 ? ' now' : ''),
    }, hoursAgo === 0 ? 'now' : '-' + hoursAgo + 'h'));
  });

  // series (area fill first, then smooth line)
  defs.forEach((d, k) => {
    const pts = seriesList[k].map((p) => ({ x: xForTime(p.t, windowStart), y: yAt(p.v) }));
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
    dots: (i) => defs.map((d, k) => ({ y: yAt(samples[i].vals[k]), color: d.color }))
      .filter((_, k) => Number.isFinite(samples[i].vals[k])),
    rows: (i) => defs.map((d, k) => ({ color: d.color, label: d.label, value: fmtTick(samples[i].vals[k], unit) + (unit === '%' ? '' : '°') }))
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
    let flowTeardown = null, demandTeardown = null;

    function update() {
      const hist = getDashboardValue('zoneStateHistory');
      const entries = hist && Array.isArray(hist.entries) ? hist.entries : [];
      const uptime = (hist && hist.uptime_s) || (Number(Date.now() / 1000) | 0);
      const windowStart = uptime - WINDOW_S;

      if (flowSvg) {
        if (flowTeardown) flowTeardown();
        const lf = lastVal(entries, FLOW_INDEX, windowStart);
        const lr = lastVal(entries, RETURN_INDEX, windowStart);
        dtEl.textContent = lf != null && lr != null ? 'Δ ' + (lf - lr).toFixed(1) + '°' : '—';
        flowTeardown = drawChart(flowSvg, flowSvg.closest('.chart-card'),
          [{ index: FLOW_INDEX, color: FLOW_LINE, label: 'Flow', width: 2.4 },
           { index: RETURN_INDEX, color: RETURN_LINE, label: 'Return', width: 2 }],
          'C', 'Temp', entries, windowStart, uptime);
      }
      if (demandSvg) {
        if (demandTeardown) demandTeardown();
        const ld = lastVal(entries, DEMAND_INDEX, windowStart);
        demandTextEl.textContent = ld != null ? Math.round(ld) + '%' : '—';
        demandTeardown = drawChart(demandSvg, demandSvg.closest('.chart-card'),
          [{ index: DEMAND_INDEX, color: DEMAND_LINE, label: 'Demand', width: 2.2, fill: 'var(--series-cool-fill)' }],
          '%', 'Demand', entries, windowStart, uptime);
      }
    }

    subscribeDashboard('zoneStateHistory', update);
    update();
  }
});
