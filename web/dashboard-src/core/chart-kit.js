// =============================================================================
// chart-kit — shared visual language for the dashboard's time-series charts.
// =============================================================================
// One look for every graph: a dark card with an accent bar before the uppercase
// title, a centered legend with circular markers, subtle gridlines, smooth
// lines, a gold "current hour" tick, and a hover tooltip. Components compose the
// helpers below and reuse the injected `.chart-*` classes so they all match.
// =============================================================================

import { injectStyle } from './style.js';

export const SVG_NS = 'http://www.w3.org/2000/svg';

const css = `
.chart-card {
  border: 1px solid var(--panel-border);
  border-radius: 16px;
  background: var(--panel-bg-vibrant);
  padding: 14px 16px;
  box-shadow: var(--panel-shadow);
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  position: relative;        /* tooltip anchor */
}

.chart-head {
  display: flex;
  align-items: center;
  gap: 9px;
  margin-bottom: 4px;
}
.chart-head::before {
  content: '';
  width: 4px;
  height: 13px;
  border-radius: 2px;
  background: var(--accent);
  flex-shrink: 0;
}
.chart-title {
  color: var(--accent);
  font-size: .74rem;
  font-weight: 800;
  letter-spacing: 1.4px;
  text-transform: uppercase;
}
.chart-head .chart-sub {
  margin-left: auto;
  color: var(--text-faint);
  font-size: .7rem;
  font-weight: 600;
  letter-spacing: .4px;
}

.chart-legend {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
  margin: 2px 0 6px;
}
.chart-legend-item {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: var(--text-secondary);
  font-size: .68rem;
  font-weight: 600;
  letter-spacing: .3px;
}
.chart-legend-marker {
  width: 11px;
  height: 11px;
  border-radius: 999px;
  border: 2px solid currentColor;
  background: color-mix(in srgb, currentColor 32%, transparent);
  flex-shrink: 0;
}

.chart-card svg { width: 100%; height: auto; display: block; overflow: visible; }
.chart-grid { stroke: rgba(150,168,205,.14); stroke-width: 1; vector-effect: non-scaling-stroke; }
.chart-axis { stroke: rgba(150,168,205,.34); stroke-width: 1; vector-effect: non-scaling-stroke; }
.chart-tick { fill: var(--chart-axis); font-size: 11px; opacity: .85; }
.chart-axis-label {
  fill: var(--chart-axis); font-size: 9px; letter-spacing: .8px;
  text-transform: uppercase; opacity: .75;
}
/* Time labels use tabular Montserrat digits: equal width, no slashed zero. */
.chart-hour {
  fill: rgba(202,219,248,.78);
  font-family: "Montserrat", sans-serif;
  font-size: 9px;
  font-weight: 500;
  font-variant-numeric: tabular-nums lining-nums;
  font-feature-settings: "tnum" 1, "lnum" 1;
  letter-spacing: 0;
}
.chart-hour.now { fill: var(--series-solar); }
.chart-hour.day2 { fill: rgba(202,219,248,.5); }
.chart-empty { fill: var(--text-faint); font-size: 12px; letter-spacing: .3px; }

/* hover cursor + tooltip */
.chart-cursor-line { stroke: rgba(233,222,210,.45); stroke-width: 1; stroke-dasharray: 3 3; vector-effect: non-scaling-stroke; }
.chart-cursor-dot { stroke: var(--card); stroke-width: 1.5; }
.chart-tooltip {
  position: absolute;
  pointer-events: none;
  z-index: 20;
  background: var(--overlay-bg);
  border: 1px solid var(--panel-border);
  border-radius: 8px;
  padding: 7px 9px;
  font-size: .7rem;
  color: var(--text-strong);
  box-shadow: 0 8px 24px rgba(0,0,0,.5);
  white-space: nowrap;
  opacity: 0;
  transition: opacity .1s ease;
}
.chart-tooltip.show { opacity: 1; }
.chart-tooltip .tt-time { font-weight: 800; letter-spacing: .4px; margin-bottom: 4px; color: var(--text-strong); }
.chart-tooltip .tt-row { display: flex; align-items: center; gap: 6px; line-height: 1.5; }
.chart-tooltip .tt-swatch { width: 9px; height: 9px; border-radius: 2px; flex-shrink: 0; }
.chart-tooltip .tt-val { margin-left: auto; font-variant-numeric: tabular-nums; font-weight: 700; }
`;

injectStyle('chart-kit', css);

// --- SVG helpers -------------------------------------------------------------

export function svgEl(tag, attrs, text) {
  const node = document.createElementNS(SVG_NS, tag);
  if (attrs) for (const k in attrs) node.setAttribute(k, attrs[k]);
  if (text != null) node.textContent = text;
  return node;
}

/// Smooth (Catmull-Rom → cubic-bezier) path through points [{x,y}].
export function smoothPath(pts) {
  if (!pts.length) return '';
  if (pts.length < 3) return 'M ' + pts.map((p) => `${p.x.toFixed(2)} ${p.y.toFixed(2)}`).join(' L ');
  const t = 0.16;  // tension
  let d = `M ${pts[0].x.toFixed(2)} ${pts[0].y.toFixed(2)}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2;
    const c1x = p1.x + (p2.x - p0.x) * t, c1y = p1.y + (p2.y - p0.y) * t;
    const c2x = p2.x - (p3.x - p1.x) * t, c2y = p2.y - (p3.y - p1.y) * t;
    d += ` C ${c1x.toFixed(2)} ${c1y.toFixed(2)}, ${c2x.toFixed(2)} ${c2y.toFixed(2)}, ${p2.x.toFixed(2)} ${p2.y.toFixed(2)}`;
  }
  return d;
}

/// Padded min/max for an array of numbers; falls back when empty/flat.
export function niceRange(values, fbMin, fbMax) {
  const f = values.filter((v) => Number.isFinite(v));
  if (!f.length) return { min: fbMin, max: fbMax };
  let min = Math.min(...f), max = Math.max(...f);
  if (min === max) { min -= 1; max += 1; }
  const pad = (max - min) * 0.12;
  return { min: min - pad, max: max + pad };
}

// --- Hover tooltip -----------------------------------------------------------
// model = {
//   count, plotTop, plotBottom,
//   xAt(i)   -> viewBox x for sample i,
//   label(i) -> tooltip heading string (e.g. "08:00"),
//   dots(i)  -> [{ y, color }] marker positions for sample i,
//   rows(i)  -> [{ color, label, value }] tooltip rows,
// }
// Returns a teardown function. `host` must be the position:relative card.
export function attachTooltip(svg, host, model) {
  const tip = document.createElement('div');
  tip.className = 'chart-tooltip';
  host.appendChild(tip);

  const cursor = svgEl('g', { class: 'chart-cursor', style: 'display:none' });
  const vline = svgEl('line', { class: 'chart-cursor-line', y1: model.plotTop, y2: model.plotBottom });
  cursor.appendChild(vline);
  const dotNodes = [];
  svg.appendChild(cursor);

  function nearestIndex(vbx) {
    let best = 0, bestD = Infinity;
    for (let i = 0; i < model.count; i++) {
      const d = Math.abs(vbx - model.xAt(i));
      if (d < bestD) { bestD = d; best = i; }
    }
    return best;
  }

  function toViewBox(evt) {
    const ctm = svg.getScreenCTM();
    if (!ctm) return null;
    const pt = svg.createSVGPoint();
    pt.x = evt.clientX; pt.y = evt.clientY;
    return pt.matrixTransform(ctm.inverse());
  }

  function move(evt) {
    if (!model.count) return;
    const vb = toViewBox(evt);
    if (!vb) return;
    const i = nearestIndex(vb.x);
    const x = model.xAt(i);

    vline.setAttribute('x1', x); vline.setAttribute('x2', x);
    const dots = model.dots(i);
    while (dotNodes.length < dots.length) {
      const c = svgEl('circle', { class: 'chart-cursor-dot', r: 3.4 });
      cursor.appendChild(c); dotNodes.push(c);
    }
    dotNodes.forEach((node, k) => {
      if (k < dots.length) {
        node.setAttribute('cx', x); node.setAttribute('cy', dots[k].y);
        node.setAttribute('fill', dots[k].color); node.style.display = '';
      } else node.style.display = 'none';
    });
    cursor.style.display = '';

    const rows = model.rows(i).map((r) =>
      `<div class="tt-row"><span class="tt-swatch" style="background:${r.color}"></span>${r.label}<span class="tt-val">${r.value}</span></div>`
    ).join('');
    tip.innerHTML = `<div class="tt-time">${model.label(i)}</div>${rows}`;
    tip.classList.add('show');

    const hr = host.getBoundingClientRect();
    let left = evt.clientX - hr.left + 14;
    if (left + tip.offsetWidth > hr.width - 6) left = evt.clientX - hr.left - tip.offsetWidth - 14;
    tip.style.left = Math.max(6, left) + 'px';
    tip.style.top = Math.max(6, evt.clientY - hr.top + 12) + 'px';
  }

  function leave() { tip.classList.remove('show'); cursor.style.display = 'none'; }

  svg.addEventListener('pointermove', move);
  svg.addEventListener('pointerleave', leave);
  return () => {
    svg.removeEventListener('pointermove', move);
    svg.removeEventListener('pointerleave', leave);
    tip.remove();
  };
}

/// Build a legend row of circular-marker items. items = [{ color, label }].
export function legendHtml(items) {
  return `<div class="chart-legend">` + items.map((it) =>
    `<span class="chart-legend-item" style="color:${it.color}"><span class="chart-legend-marker"></span>` +
    `<span style="color:var(--text-secondary)">${it.label}</span></span>`
  ).join('') + `</div>`;
}
