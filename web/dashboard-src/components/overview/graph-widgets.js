import { component } from '../../core/component.js';
import { injectStyle } from '../../core/style.js';
import { getDashboardValue, subscribeDashboard, NZ } from '../../core/store.js';

const SVG_NS = 'http://www.w3.org/2000/svg';
// Wide viewBox scaled to 100% width with a uniform aspect ratio (meet) so axis
// text stays crisp and proportional instead of stretching with the column width.
const CHART_W = 480;
const CHART_H = 200;
const PAD_TOP = 14;
const PAD_RIGHT = 16;
const PAD_BOTTOM = 34;
const PAD_LEFT = 44;
const PLOT_W = CHART_W - PAD_LEFT - PAD_RIGHT;
const PLOT_H = CHART_H - PAD_TOP - PAD_BOTTOM;

// 24 h display window — fed by the device's server-side /history ring (sampled
// every 5 min, 288 slots). Entry shape:
//   [uptime_s, z0..z5, absorbing, flow_c, return_c, demand_pct]
const WINDOW_S = 24 * 3600;
const FLOW_INDEX = NZ + 2;     // 8
const RETURN_INDEX = NZ + 3;   // 9
const DEMAND_INDEX = NZ + 4;   // 10

// ========================================
// CSS
// ========================================
const css = `
.graph-widgets {
  display: grid;
  gap: 12px;
}

.graph-card {
  border: 1px solid var(--panel-border);
  border-radius: 16px;
  background: var(--panel-bg);
  padding: 10px 12px;
  box-shadow: var(--panel-shadow);
  height: 100%;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
}

.graph-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin-bottom: 8px;
  color: var(--accent);
  font-size: .75rem;
  text-transform: uppercase;
  letter-spacing: .75px;
  font-weight: 700;
}

.graph-head strong {
  color: var(--text-strong);
  font-size: .82rem;
}

.graph-legend {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 0 0 8px;
}

.graph-legend-item {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  color: var(--text-faint);
  font-size: .62rem;
  letter-spacing: .5px;
  text-transform: uppercase;
  font-weight: 700;
}

.graph-legend-dot {
  width: 8px;
  height: 8px;
  border-radius: 999px;
  box-shadow: 0 0 0 1px rgba(10, 20, 34, .45);
}

.graph-card svg {
  width: 100%;
  height: auto;
  flex: 1;
  display: block;
  border-radius: 10px;
  background: linear-gradient(180deg, rgba(138,80,143,.12), rgba(0,32,46,.4));
}

.graph-axis,
.graph-grid {
  vector-effect: non-scaling-stroke;
}

.graph-tick-label {
  fill: var(--chart-axis);
  font-size: 11px;
  letter-spacing: .4px;
}

.graph-axis-label {
  fill: var(--chart-axis);
  font-size: 9px;
  letter-spacing: .8px;
  text-transform: uppercase;
  opacity: .85;
}

.graph-empty {
  fill: var(--text-faint);
  font-size: 12px;
  letter-spacing: .3px;
}
`;

injectStyle('graph-widgets', css);

// ========================================
// TEMPLATE
// ========================================
const template = (ctx) => {
  if (ctx.variant === 'flow-return') {
    return '<div class="graph-widgets"><div class="graph-card"><div class="graph-head"><span>Flow / Return</span><strong class="gw-dt">---</strong></div><div class="graph-legend"><span class="graph-legend-item"><span class="graph-legend-dot" style="background:var(--series-warm)"></span>Flow</span><span class="graph-legend-item"><span class="graph-legend-dot" style="background:var(--series-cool)"></span>Return</span></div><svg class="gw-flow"></svg></div></div>';
  }
  if (ctx.variant === 'demand') {
    return '<div class="graph-widgets"><div class="graph-card"><div class="graph-head"><span>Demand Index</span><strong class="gw-demand-text">---</strong></div><svg class="gw-demand"></svg></div></div>';
  }
  return '<div class="graph-widgets"><div class="graph-card"><div class="graph-head"><span>Flow / Return</span><strong class="gw-dt">---</strong></div><div class="graph-legend"><span class="graph-legend-item"><span class="graph-legend-dot" style="background:var(--series-warm)"></span>Flow</span><span class="graph-legend-item"><span class="graph-legend-dot" style="background:var(--series-cool)"></span>Return</span></div><svg class="gw-flow"></svg></div><div class="graph-card"><div class="graph-head"><span>Demand Index</span><strong class="gw-demand-text">---</strong></div><svg class="gw-demand"></svg></div></div>';
};

function createSvgNode(tag, attrs, text) {
  const node = document.createElementNS(SVG_NS, tag);
  if (attrs) {
    Object.keys(attrs).forEach((name) => {
      node.setAttribute(name, attrs[name]);
    });
  }
  if (text != null) node.textContent = text;
  return node;
}

function formatTick(value, unit) {
  if (!Number.isFinite(value)) return '---';
  if (unit === '%') return Math.round(value) + '%';
  return value.toFixed(1) + 'C';
}

// Build {t, v} points for one value column of the history entries, skipping
// null/undefined samples (a sensor with no reading at that time).
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

function xAt(t, windowStart) {
  const ratio = (t - windowStart) / WINDOW_S;
  return PAD_LEFT + Math.max(0, Math.min(1, ratio)) * PLOT_W;
}

function linePath(points, windowStart, min, max) {
  if (!points.length) return '';
  const span = Math.max(0.001, max - min);
  let out = '';
  for (let i = 0; i < points.length; i++) {
    const x = xAt(points[i].t, windowStart);
    const y = PAD_TOP + (1 - (points[i].v - min) / span) * PLOT_H;
    out += (i ? ' L ' : 'M ') + x.toFixed(2) + ' ' + y.toFixed(2);
  }
  return out;
}

function areaPath(points, windowStart, min, max) {
  const line = linePath(points, windowStart, min, max);
  if (!line) return '';
  const baseline = (PAD_TOP + PLOT_H).toFixed(2);
  const xEnd = xAt(points[points.length - 1].t, windowStart).toFixed(2);
  const xStart = xAt(points[0].t, windowStart).toFixed(2);
  return line + ' L ' + xEnd + ' ' + baseline + ' L ' + xStart + ' ' + baseline + ' Z';
}

function getRange(pointsA, pointsB, unit) {
  const values = [];
  pointsA.forEach((p) => values.push(p.v));
  if (pointsB) pointsB.forEach((p) => values.push(p.v));
  if (!values.length) {
    return unit === '%' ? { min: 0, max: 100 } : { min: 0, max: 10 };
  }

  let min = Math.min.apply(null, values);
  let max = Math.max.apply(null, values);
  if (unit === '%') {
    min = 0;                       // demand anchored at 0
    max = Math.min(100, max);
  }
  if (min === max) {
    const delta = unit === '%' ? 5 : 0.5;
    min -= delta;
    max += delta;
  }
  const padding = (max - min) * 0.08;
  if (unit !== '%') min -= padding;
  max += padding;
  if (unit === '%') {
    min = Math.max(0, min);
    max = Math.min(100, max);
  }
  return { min, max };
}

function appendAxes(svg, min, max, unit, windowStart, uptime) {
  const axisColor = 'rgba(150,168,205,0.40)';
  const gridColor = 'rgba(150,168,205,0.16)';
  const yTickCount = 3;
  const xTicks = [24, 12, 0];   // hours ago

  svg.appendChild(createSvgNode('line', {
    x1: PAD_LEFT, y1: PAD_TOP, x2: PAD_LEFT, y2: PAD_TOP + PLOT_H,
    stroke: axisColor, 'stroke-width': '1', class: 'graph-axis'
  }));
  svg.appendChild(createSvgNode('line', {
    x1: PAD_LEFT, y1: PAD_TOP + PLOT_H, x2: PAD_LEFT + PLOT_W, y2: PAD_TOP + PLOT_H,
    stroke: axisColor, 'stroke-width': '1', class: 'graph-axis'
  }));

  for (let tick = 0; tick < yTickCount; tick++) {
    const ratio = yTickCount === 1 ? 0 : tick / (yTickCount - 1);
    const y = PAD_TOP + ratio * PLOT_H;
    const value = max - (max - min) * ratio;
    svg.appendChild(createSvgNode('line', {
      x1: PAD_LEFT, y1: y, x2: PAD_LEFT + PLOT_W, y2: y,
      stroke: gridColor, 'stroke-width': '1', class: 'graph-grid'
    }));
    svg.appendChild(createSvgNode('text', {
      x: PAD_LEFT - 6, y: y + 4, 'text-anchor': 'end', class: 'graph-tick-label'
    }, formatTick(value, unit)));
  }

  xTicks.forEach((hoursAgo) => {
    const x = xAt(uptime - hoursAgo * 3600, windowStart);
    svg.appendChild(createSvgNode('text', {
      x, y: CHART_H - 10,
      'text-anchor': hoursAgo === 24 ? 'start' : (hoursAgo === 0 ? 'end' : 'middle'),
      class: 'graph-tick-label'
    }, hoursAgo === 0 ? 'now' : '-' + hoursAgo + 'h'));
  });

  svg.appendChild(createSvgNode('text', {
    x: 8, y: PAD_TOP + PLOT_H / 2,
    transform: 'rotate(-90 8 ' + (PAD_TOP + PLOT_H / 2).toFixed(2) + ')',
    'text-anchor': 'middle', class: 'graph-axis-label'
  }, unit === '%' ? 'Demand' : 'Temp'));
}

function appendLine(svg, points, windowStart, min, max, color, width, fill) {
  const d = linePath(points, windowStart, min, max);
  if (!d) return;
  if (fill) {
    const area = createSvgNode('path', {
      d: areaPath(points, windowStart, min, max), fill, stroke: 'none'
    });
    svg.appendChild(area);
  }
  svg.appendChild(createSvgNode('path', {
    d, fill: 'none', stroke: color, 'stroke-width': String(width),
    'stroke-linecap': 'round', 'stroke-linejoin': 'round'
  }));
}

function renderSpark(svg, pointsA, colorA, pointsB, colorB, unit, windowStart, uptime, fillA) {
  svg.innerHTML = '';
  svg.setAttribute('viewBox', '0 0 ' + CHART_W + ' ' + CHART_H);
  svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');

  if (!pointsA.length && !(pointsB && pointsB.length)) {
    svg.appendChild(createSvgNode('text', {
      x: CHART_W / 2, y: CHART_H / 2, 'text-anchor': 'middle', class: 'graph-empty'
    }, 'Collecting history…'));
    return;
  }

  const range = getRange(pointsA, pointsB, unit);
  appendAxes(svg, range.min, range.max, unit, windowStart, uptime);

  appendLine(svg, pointsA, windowStart, range.min, range.max, colorA, 2.4, fillA);
  if (pointsB && pointsB.length) {
    appendLine(svg, pointsB, windowStart, range.min, range.max, colorB, 2);
  }
}

const FLOW_LINE = 'var(--series-warm)';
const RETURN_LINE = 'var(--series-cool)';
const DEMAND_LINE = 'var(--series-cool)';

function lastVal(points) {
  return points.length ? points[points.length - 1].v : null;
}

// ========================================
// COMPONENT
// ========================================
export default component({
  tag: 'graph-widgets',
  state: (props) => ({
    variant: (props && props.variant) || 'both'
  }),
  render: template,
  onMount(ctx, el) {
    const dtEl = el.querySelector('.gw-dt');
    const demandTextEl = el.querySelector('.gw-demand-text');
    const flowSvg = el.querySelector('.gw-flow');
    const demandSvg = el.querySelector('.gw-demand');

    function update() {
      const hist = getDashboardValue('zoneStateHistory');
      const entries = hist && Array.isArray(hist.entries) ? hist.entries : [];
      const uptime = (hist && hist.uptime_s) || (Number(Date.now() / 1000) | 0);
      const windowStart = uptime - WINDOW_S;

      const flow = seriesFromHistory(entries, FLOW_INDEX, windowStart);
      const ret = seriesFromHistory(entries, RETURN_INDEX, windowStart);
      const demand = seriesFromHistory(entries, DEMAND_INDEX, windowStart);

      if (dtEl && flowSvg) {
        const lf = lastVal(flow);
        const lr = lastVal(ret);
        dtEl.textContent = lf != null && lr != null ? (lf - lr).toFixed(1) + ' C' : '---';
        renderSpark(flowSvg, flow, FLOW_LINE, ret, RETURN_LINE, 'C', windowStart, uptime);
      }
      if (demandTextEl && demandSvg) {
        const ld = lastVal(demand);
        demandTextEl.textContent = ld != null ? Math.round(ld) + '%' : '---';
        renderSpark(demandSvg, demand, DEMAND_LINE, null, null, '%', windowStart, uptime, 'var(--series-cool-fill)');
      }
    }

    subscribeDashboard('zoneStateHistory', update);
    update();
  }
});
