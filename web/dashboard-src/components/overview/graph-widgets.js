import { component } from '../../core/component.js';
import { injectStyle } from '../../core/style.js';
import { getDashboardValue, subscribeDashboard } from '../../core/store.js';

const SVG_NS = 'http://www.w3.org/2000/svg';
const CHART_W = 220;
const CHART_H = 132;
const PAD_TOP = 10;
const PAD_RIGHT = 10;
const PAD_BOTTOM = 24;
const PAD_LEFT = 34;
const PLOT_W = CHART_W - PAD_LEFT - PAD_RIGHT;
const PLOT_H = CHART_H - PAD_TOP - PAD_BOTTOM;
const HISTORY_WINDOW_MINUTES = 360;

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
  height: 132px;
  flex: 1;
  min-height: 132px;
  display: block;
  border-radius: 10px;
  background: linear-gradient(180deg, rgba(83,168,255,.12), rgba(15,33,60,.4));
}

.graph-axis,
.graph-grid {
  vector-effect: non-scaling-stroke;
}

.graph-tick-label {
  fill: var(--text-faint);
  font-size: 8px;
  letter-spacing: .4px;
}

.graph-axis-label {
  fill: var(--text-faint);
  font-size: 6px;
  letter-spacing: .8px;
  text-transform: uppercase;
  opacity: .7;
}
`;

injectStyle('graph-widgets', css);

// ========================================
// TEMPLATE
// ========================================
const template = (ctx) => {
  if (ctx.variant === 'flow-return') {
    return '<div class="graph-widgets"><div class="graph-card"><div class="graph-head"><span>Flow / Return</span><strong class="gw-dt">---</strong></div><div class="graph-legend"><span class="graph-legend-item"><span class="graph-legend-dot" style="background:var(--accent)"></span>Flow</span><span class="graph-legend-item"><span class="graph-legend-dot" style="background:var(--blue)"></span>Return</span></div><svg class="gw-flow"></svg></div></div>';
  }
  if (ctx.variant === 'demand') {
    return '<div class="graph-widgets"><div class="graph-card"><div class="graph-head"><span>Demand Index</span><strong class="gw-demand-text">---</strong></div><svg class="gw-demand"></svg></div></div>';
  }
  return '<div class="graph-widgets"><div class="graph-card"><div class="graph-head"><span>Flow / Return</span><strong class="gw-dt">---</strong></div><div class="graph-legend"><span class="graph-legend-item"><span class="graph-legend-dot" style="background:var(--accent)"></span>Flow</span><span class="graph-legend-item"><span class="graph-legend-dot" style="background:var(--blue)"></span>Return</span></div><svg class="gw-flow"></svg></div><div class="graph-card"><div class="graph-head"><span>Demand Index</span><strong class="gw-demand-text">---</strong></div><svg class="gw-demand"></svg></div></div>';
};

function linePath(values, min, max) {
  if (!values.length) return '';
  const span = Math.max(0.001, max - min);
  const step = values.length > 1 ? PLOT_W / (values.length - 1) : 0;
  let out = '';
  for (let index = 0; index < values.length; index++) {
    const x = PAD_LEFT + step * index;
    const y = PAD_TOP + (1 - (values[index] - min) / span) * PLOT_H;
    out += (index ? ' L ' : 'M ') + x.toFixed(2) + ' ' + y.toFixed(2);
  }
  return out;
}

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

function formatTimeLabel(minutes) {
  if (minutes <= 0) return 'now';
  if (minutes >= 60) return '-' + Math.round(minutes / 60) + 'h';
  return '-' + Math.round(minutes) + 'm';
}

function appendAxes(svg, min, max, unit) {
  const axisColor = 'rgba(143, 176, 230, 0.42)';
  const gridColor = 'rgba(143, 176, 230, 0.16)';
  const yTickCount = 3;
  const xTicks = [
    { x: PAD_LEFT, ratio: 0 },
    { x: PAD_LEFT + PLOT_W / 2, ratio: 0.5 },
    { x: PAD_LEFT + PLOT_W, ratio: 1 }
  ];

  svg.appendChild(createSvgNode('line', {
    x1: PAD_LEFT,
    y1: PAD_TOP,
    x2: PAD_LEFT,
    y2: PAD_TOP + PLOT_H,
    stroke: axisColor,
    'stroke-width': '1',
    class: 'graph-axis'
  }));
  svg.appendChild(createSvgNode('line', {
    x1: PAD_LEFT,
    y1: PAD_TOP + PLOT_H,
    x2: PAD_LEFT + PLOT_W,
    y2: PAD_TOP + PLOT_H,
    stroke: axisColor,
    'stroke-width': '1',
    class: 'graph-axis'
  }));

  for (let tick = 0; tick < yTickCount; tick++) {
    const ratio = yTickCount === 1 ? 0 : tick / (yTickCount - 1);
    const y = PAD_TOP + ratio * PLOT_H;
    const value = max - (max - min) * ratio;
    svg.appendChild(createSvgNode('line', {
      x1: PAD_LEFT,
      y1: y,
      x2: PAD_LEFT + PLOT_W,
      y2: y,
      stroke: gridColor,
      'stroke-width': '1',
      class: 'graph-grid'
    }));
    svg.appendChild(createSvgNode('text', {
      x: PAD_LEFT - 5,
      y: y + 3,
      'text-anchor': 'end',
      class: 'graph-tick-label'
    }, formatTick(value, unit)));
  }

  xTicks.forEach((tick) => {
    const minutes = HISTORY_WINDOW_MINUTES * (1 - tick.ratio);
    svg.appendChild(createSvgNode('text', {
      x: tick.x,
      y: CHART_H - 6,
      'text-anchor': tick.ratio === 0 ? 'start' : (tick.ratio === 1 ? 'end' : 'middle'),
      class: 'graph-tick-label'
    }, formatTimeLabel(minutes)));
  });

  svg.appendChild(createSvgNode('text', {
    x: 5,
    y: PAD_TOP + PLOT_H / 2,
    transform: 'rotate(-90 5 ' + (PAD_TOP + PLOT_H / 2).toFixed(2) + ')',
    'text-anchor': 'middle',
    class: 'graph-axis-label'
  }, unit === '%' ? 'Demand' : 'Temp'));
}

function getRange(valuesA, valuesB, unit) {
  const values = valuesA.concat(valuesB || []).filter((value) => Number.isFinite(value));
  if (!values.length) {
    return unit === '%' ? { min: 0, max: 100 } : { min: 0, max: 10 };
  }

  let min = Math.min.apply(null, values);
  let max = Math.max.apply(null, values);
  if (unit === '%') {
    min = Math.max(0, min);
    max = Math.min(100, max);
  }
  if (min === max) {
    const delta = unit === '%' ? 5 : 0.5;
    min -= delta;
    max += delta;
  }
  const padding = (max - min) * 0.08;
  min -= padding;
  max += padding;
  if (unit === '%') {
    min = Math.max(0, min);
    max = Math.min(100, max);
  }
  return { min, max };
}

function renderSpark(svg, valuesA, colorA, valuesB, colorB, unit) {
  svg.innerHTML = '';
  svg.setAttribute('viewBox', '0 0 ' + CHART_W + ' ' + CHART_H);
  svg.setAttribute('preserveAspectRatio', 'none');

  const range = getRange(valuesA, valuesB, unit);
  appendAxes(svg, range.min, range.max, unit);

  const pathA = linePath(valuesA, range.min, range.max);
  if (pathA) {
    const p1 = document.createElementNS(SVG_NS, 'path');
    p1.setAttribute('d', pathA);
    p1.setAttribute('fill', 'none');
    p1.setAttribute('stroke', colorA);
    p1.setAttribute('stroke-width', '2.2');
    p1.setAttribute('stroke-linecap', 'round');
    p1.setAttribute('stroke-linejoin', 'round');
    svg.appendChild(p1);
  }
  const pathB = valuesB && valuesB.length ? linePath(valuesB, range.min, range.max) : '';
  if (pathB) {
    const p2 = document.createElementNS(SVG_NS, 'path');
    p2.setAttribute('d', pathB);
    p2.setAttribute('fill', 'none');
    p2.setAttribute('stroke', colorB);
    p2.setAttribute('stroke-width', '2');
    p2.setAttribute('stroke-linecap', 'round');
    p2.setAttribute('stroke-linejoin', 'round');
    svg.appendChild(p2);
  }
}

const FLOW_LINE = 'var(--accent)';
const RETURN_LINE = 'var(--blue)';
const DEMAND_LINE = 'var(--blue)';

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
      const flow = getDashboardValue('historyFlow');
      const ret = getDashboardValue('historyReturn');
      const demand = getDashboardValue('historyDemand');
      const lastFlow = flow.length ? flow[flow.length - 1] : null;
      const lastRet = ret.length ? ret[ret.length - 1] : null;
      const lastDemand = demand.length ? demand[demand.length - 1] : null;

      if (dtEl && flowSvg) {
        dtEl.textContent = lastFlow != null && lastRet != null ? (lastFlow - lastRet).toFixed(1) + ' C' : '---';
        renderSpark(flowSvg, flow, FLOW_LINE, ret, RETURN_LINE, 'C');
      }
      if (demandTextEl && demandSvg) {
        demandTextEl.textContent = lastDemand != null ? Math.round(lastDemand) + '%' : '---';
        renderSpark(demandSvg, demand, DEMAND_LINE, null, null, '%');
      }
    }

    subscribeDashboard('historyFlow', update);
    subscribeDashboard('historyReturn', update);
    subscribeDashboard('historyDemand', update);
    update();
  }
});