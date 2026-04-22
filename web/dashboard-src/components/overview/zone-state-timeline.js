import { component } from '../../core/component.js';
import { injectStyle } from '../../core/style.js';
import { getDashboardValue, subscribeDashboard, zoneLabel, NZ } from '../../core/store.js';

// ========================================
// State palette
// Code → { label, color }
// Matches ZoneDisplayState enum in hv6_types.h
// 0xFF (255) = unknown/empty slot → transparent
// ========================================
const STATE_PALETTE = {
  0:   { label: 'Off',             color: '#2e3f5c' },
  1:   { label: 'Manual',          color: '#4ecdc4' },
  2:   { label: 'Calibrating',     color: '#f2c77b' },
  3:   { label: 'Wait Cal.',        color: '#8ab0d4' },
  4:   { label: 'Wait Temp',       color: '#8ab0d4' },
  5:   { label: 'Heating',         color: '#EEA111' },
  6:   { label: 'Idle',            color: '#53A8FF' },
  7:   { label: 'Overheated',      color: '#ff6464' },
  255: { label: '',                color: 'transparent' },
};

const WINDOW_S   = 24 * 3600;  // 24 h display window
const ROW_H      = 18;
const ROW_GAP    = 4;
const LABEL_W    = 54;
const AXIS_H     = 20;
const PAD_TOP    = 4;
const CHART_H    = NZ * (ROW_H + ROW_GAP) - ROW_GAP + PAD_TOP + AXIS_H;

// ========================================
// CSS
// ========================================
const css = `
.timeline-card {
  border: 1px solid var(--panel-border);
  border-radius: 16px;
  background: var(--panel-bg);
  padding: 10px 12px;
  box-shadow: var(--panel-shadow);
}

.timeline-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin-bottom: 10px;
  color: var(--accent);
  font-size: .75rem;
  text-transform: uppercase;
  letter-spacing: .75px;
  font-weight: 700;
}

.timeline-head strong {
  color: var(--text-faint);
  font-size: .70rem;
  font-weight: 500;
  letter-spacing: .4px;
  text-transform: none;
}

.timeline-svg {
  width: 100%;
  display: block;
  border-radius: 10px;
  overflow: visible;
}

.timeline-empty {
  color: var(--text-faint);
  font-size: .78rem;
  padding: 12px 0;
  text-align: center;
  letter-spacing: .3px;
}

.timeline-legend {
  display: flex;
  flex-wrap: wrap;
  gap: 6px 14px;
  margin-top: 10px;
}

.tl-legend-item {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: .67rem;
  color: var(--text-secondary);
  letter-spacing: .3px;
}

.tl-legend-dot {
  width: 9px;
  height: 9px;
  border-radius: 2px;
  flex-shrink: 0;
}
`;

injectStyle('zone-state-timeline', css);

// ========================================
// TEMPLATE
// ========================================
const template = () => `
  <div class="timeline-card">
    <div class="timeline-head">
      <span>Zone State History</span>
      <strong>24 h</strong>
    </div>
    <div class="tl-body"></div>
    <div class="timeline-legend"></div>
  </div>
`;

// ========================================
// SVG RENDERER
// ========================================

function renderTimeline(histData, currentUptimeS) {
  if (!histData || !histData.entries || histData.entries.length === 0) {
    return null;   // caller will show empty state
  }

  const entries = histData.entries;
  const uptime  = histData.uptime_s || currentUptimeS || 0;

  // Determine the start of the visible window (24 h back from now).
  const windowStart = uptime - WINDOW_S;

  // SVG viewBox: width is 1000 units (scalable), height fixed.
  const SVG_W    = 1000;
  const chartW   = SVG_W - LABEL_W;

  function tToX(t_s) {
    const age = (t_s - windowStart) / WINDOW_S;
    return LABEL_W + Math.max(0, Math.min(1, age)) * chartW;
  }

  const ns = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(ns, 'svg');
  svg.setAttribute('viewBox', '0 0 ' + SVG_W + ' ' + CHART_H);
  svg.classList.add('timeline-svg');

  // ── Background strip ──────────────────────────────────────────
  const bg = document.createElementNS(ns, 'rect');
  bg.setAttribute('x', LABEL_W);
  bg.setAttribute('y', PAD_TOP);
  bg.setAttribute('width', chartW);
  bg.setAttribute('height', CHART_H - PAD_TOP - AXIS_H);
  bg.setAttribute('fill', 'rgba(10,24,46,0.55)');
  bg.setAttribute('rx', '4');
  svg.appendChild(bg);

  // ── Grid lines at 6 h intervals ───────────────────────────────
  const TICK_INTERVALS = [6, 12, 18, 24];
  for (const h of TICK_INTERVALS) {
    const t = uptime - h * 3600;
    const x = tToX(t);
    const line = document.createElementNS(ns, 'line');
    line.setAttribute('x1', x);
    line.setAttribute('y1', PAD_TOP);
    line.setAttribute('x2', x);
    line.setAttribute('y2', CHART_H - AXIS_H);
    line.setAttribute('stroke', 'rgba(120,168,255,.12)');
    line.setAttribute('stroke-width', '1');
    svg.appendChild(line);
  }

  // ── Zone rows ─────────────────────────────────────────────────
  for (let zi = 0; zi < NZ; zi++) {
    const y = PAD_TOP + zi * (ROW_H + ROW_GAP);

    // Row background (subtle)
    const rowBg = document.createElementNS(ns, 'rect');
    rowBg.setAttribute('x', LABEL_W);
    rowBg.setAttribute('y', y);
    rowBg.setAttribute('width', chartW);
    rowBg.setAttribute('height', ROW_H);
    rowBg.setAttribute('fill', zi % 2 === 0
      ? 'rgba(83,168,255,0.03)'
      : 'rgba(83,168,255,0.00)');
    svg.appendChild(rowBg);

    // Zone label
    const label = document.createElementNS(ns, 'text');
    label.setAttribute('x', LABEL_W - 4);
    label.setAttribute('y', y + ROW_H / 2 + 1);
    label.setAttribute('text-anchor', 'end');
    label.setAttribute('dominant-baseline', 'middle');
    label.setAttribute('fill', 'rgba(191,211,245,.65)');
    label.setAttribute('font-size', '9.5');
    label.setAttribute('font-family', 'Montserrat, sans-serif');
    label.setAttribute('font-weight', '600');
    label.textContent = 'Z' + (zi + 1);
    svg.appendChild(label);

    // Collect entries for this zone, filtered to the visible window.
    // Each entry: [uptime_s, z0..z5], so zone zi is at index zi+1.
    const zEntries = entries
      .filter((e) => e[0] >= windowStart)
      .map((e) => ({ t: e[0], state: e[zi + 1] }));

    if (zEntries.length === 0) continue;

    // Run-length encode and draw segments.
    let segStart = zEntries[0].t;
    let segState = zEntries[0].state;

    const drawSeg = (t0, t1, stateCode) => {
      if (stateCode === 255) return;  // unknown → skip
      const palette = STATE_PALETTE[stateCode] || STATE_PALETTE[255];
      if (palette.color === 'transparent') return;
      const x0 = tToX(t0);
      const x1 = tToX(t1);
      const w  = Math.max(1, x1 - x0);
      const rect = document.createElementNS(ns, 'rect');
      rect.setAttribute('x', x0);
      rect.setAttribute('y', y + 1);
      rect.setAttribute('width', w);
      rect.setAttribute('height', ROW_H - 2);
      rect.setAttribute('fill', palette.color);
      rect.setAttribute('rx', '2');
      rect.setAttribute('opacity', '0.88');
      svg.appendChild(rect);
    };

    for (let i = 1; i < zEntries.length; i++) {
      const cur = zEntries[i];
      if (cur.state !== segState) {
        drawSeg(segStart, cur.t, segState);
        segStart = cur.t;
        segState = cur.state;
      }
    }
    // Final segment extends to "now" (uptime).
    drawSeg(segStart, uptime, segState);
  }

  // ── Time axis labels ──────────────────────────────────────────
  const AXIS_Y = CHART_H - AXIS_H + 14;
  const axisLabels = [
    { label: '24h', hoursAgo: 24 },
    { label: '18h', hoursAgo: 18 },
    { label: '12h', hoursAgo: 12 },
    { label: '6h',  hoursAgo: 6  },
    { label: 'now', hoursAgo: 0  },
  ];
  for (const al of axisLabels) {
    const t = uptime - al.hoursAgo * 3600;
    const x = tToX(t);
    const lbl = document.createElementNS(ns, 'text');
    lbl.setAttribute('x', x);
    lbl.setAttribute('y', AXIS_Y);
    lbl.setAttribute('text-anchor', al.hoursAgo === 0 ? 'end' : 'middle');
    lbl.setAttribute('fill', 'rgba(191,211,245,.45)');
    lbl.setAttribute('font-size', '9');
    lbl.setAttribute('font-family', 'Montserrat, sans-serif');
    lbl.textContent = al.label;
    svg.appendChild(lbl);
  }

  return svg;
}

// ========================================
// LEGEND
// ========================================
function renderLegend(el) {
  el.innerHTML = '';
  const shown = [
    { code: 5, ...STATE_PALETTE[5] },
    { code: 6, ...STATE_PALETTE[6] },
    { code: 0, ...STATE_PALETTE[0] },
    { code: 1, ...STATE_PALETTE[1] },
    { code: 7, ...STATE_PALETTE[7] },
    { code: 2, ...STATE_PALETTE[2] },
  ];
  for (const item of shown) {
    const div = document.createElement('div');
    div.className = 'tl-legend-item';
    div.innerHTML =
      '<span class="tl-legend-dot" style="background:' + item.color + '"></span>' +
      item.label;
    el.appendChild(div);
  }
}

// ========================================
// COMPONENT
// ========================================
export default component({
  tag: 'zone-state-timeline',
  render: template,
  onMount(ctx, el) {
    const body   = el.querySelector('.tl-body');
    const legend = el.querySelector('.timeline-legend');

    renderLegend(legend);

    function update() {
      const hist = getDashboardValue('zoneStateHistory');
      const uptimeS = (() => {
        // Use wall-clock time if uptime not available from entity store.
        const raw = getDashboardValue && getDashboardValue('zoneStateHistory');
        return (raw && raw.uptime_s) || (Number(Date.now() / 1000) | 0);
      })();

      body.innerHTML = '';

      if (!hist || !hist.entries || hist.entries.length === 0) {
        const empty = document.createElement('div');
        empty.className = 'timeline-empty';
        empty.textContent = 'No history yet — data accumulates every 5 minutes.';
        body.appendChild(empty);
        return;
      }

      const svgEl = renderTimeline(hist, uptimeS);
      if (svgEl) {
        body.appendChild(svgEl);
      }
    }

    subscribeDashboard('zoneStateHistory', update);
    subscribeDashboard('zoneNames', update);
    update();
  }
});
