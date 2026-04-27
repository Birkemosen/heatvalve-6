import { component } from '../../core/component.js';
import { injectStyle } from '../../core/style.js';
import { getDashboardValue, subscribeDashboard } from '../../core/store.js';

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

.graph-card svg {
  width: 100%;
  height: 56px;
  display: block;
  border-radius: 10px;
  background: linear-gradient(180deg, rgba(83,168,255,.12), rgba(15,33,60,.4));
}
`;

injectStyle('graph-widgets', css);

// ========================================
// TEMPLATE
// ========================================
const template = (ctx) => {
  if (ctx.variant === 'flow-return') {
    return '<div class="graph-widgets"><div class="graph-card"><div class="graph-head"><span>Flow / Return</span><strong class="gw-dt">---</strong></div><svg class="gw-flow"></svg></div></div>';
  }
  if (ctx.variant === 'demand') {
    return '<div class="graph-widgets"><div class="graph-card"><div class="graph-head"><span>Demand Index</span><strong class="gw-demand-text">---</strong></div><svg class="gw-demand"></svg></div></div>';
  }
  return '<div class="graph-widgets"><div class="graph-card"><div class="graph-head"><span>Flow / Return</span><strong class="gw-dt">---</strong></div><svg class="gw-flow"></svg></div><div class="graph-card"><div class="graph-head"><span>Demand Index</span><strong class="gw-demand-text">---</strong></div><svg class="gw-demand"></svg></div></div>';
};

function linePath(values, width, height, pad) {
  if (!values.length) return '';
  const min = Math.min.apply(null, values);
  const max = Math.max.apply(null, values);
  const span = Math.max(0.001, max - min);
  const step = values.length > 1 ? (width - pad * 2) / (values.length - 1) : 0;
  let out = '';
  for (let index = 0; index < values.length; index++) {
    const x = pad + step * index;
    const y = height - pad - ((values[index] - min) / span) * (height - pad * 2);
    out += (index ? ' L ' : 'M ') + x.toFixed(2) + ' ' + y.toFixed(2);
  }
  return out;
}

function renderSpark(svg, valuesA, colorA, valuesB, colorB) {
  svg.innerHTML = '';
  const pathA = linePath(valuesA, 220, 56, 5);
  if (pathA) {
    const p1 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    p1.setAttribute('d', pathA);
    p1.setAttribute('fill', 'none');
    p1.setAttribute('stroke', colorA);
    p1.setAttribute('stroke-width', '2.2');
    p1.setAttribute('stroke-linecap', 'round');
    svg.appendChild(p1);
  }
  const pathB = valuesB && valuesB.length ? linePath(valuesB, 220, 56, 5) : '';
  if (pathB) {
    const p2 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    p2.setAttribute('d', pathB);
    p2.setAttribute('fill', 'none');
    p2.setAttribute('stroke', colorB);
    p2.setAttribute('stroke-width', '2');
    p2.setAttribute('stroke-linecap', 'round');
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
        renderSpark(flowSvg, flow, FLOW_LINE, ret, RETURN_LINE);
      }
      if (demandTextEl && demandSvg) {
        demandTextEl.textContent = lastDemand != null ? Math.round(lastDemand) + '%' : '---';
        renderSpark(demandSvg, demand, DEMAND_LINE);
      }
    }

    subscribeDashboard('historyFlow', update);
    subscribeDashboard('historyReturn', update);
    subscribeDashboard('historyDemand', update);
    update();
  }
});