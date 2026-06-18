import { component } from '../../core/component.js';
import { injectStyle } from '../../core/style.js';
import { getForecastHours, subscribeDashboard } from '../../core/store.js';

const SVG_NS = 'http://www.w3.org/2000/svg';
const PREVIEW_HOURS = 24;     // next 24 h of the 48 h cache
const COMPASS = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];

// chart geometry (viewBox units; CSS scales width to 100%)
const W = 1000, H = 260;
const PAD_L = 44, PAD_R = 46, PAD_T = 16, PAD_B = 52;
const PLOT_W = W - PAD_L - PAD_R;
const PLOT_H = H - PAD_T - PAD_B;

const TEMP_COLOR = 'var(--series-warm)';
const WIND_COLOR = 'var(--series-cool)';

// ========================================
// CSS
// ========================================
const css = `
.forecast-preview {
  background: var(--panel-bg-vibrant);
  border: 1px solid var(--panel-border);
  border-radius: 18px;
  padding: 18px;
  box-shadow: var(--panel-shadow);
}

.forecast-preview .card-title {
  font-size: .84rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 1.1px;
  color: var(--accent);
  margin-bottom: 12px;
  padding-bottom: 10px;
  border-bottom: 1px solid var(--panel-border);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.forecast-preview .fc-head-right { display: flex; align-items: center; gap: 12px; }
.forecast-preview .fc-legend { display: flex; gap: 10px; }
.forecast-preview .fc-legend-item {
  display: inline-flex; align-items: center; gap: 5px;
  font-size: .62rem; letter-spacing: .5px; text-transform: uppercase; font-weight: 700;
  color: var(--text-faint);
}
.forecast-preview .fc-legend-dot { width: 8px; height: 8px; border-radius: 999px; }

.forecast-preview .fc-badge {
  font-size: .68rem; font-weight: 800; letter-spacing: .8px; text-transform: uppercase;
  padding: 3px 9px; border-radius: 8px; flex-shrink: 0;
  background: rgba(70,70,70,.28); color: #ADADAD; border: 1px solid rgba(150,150,150,.25);
}
.forecast-preview .fc-badge.ok { background: rgba(45,110,45,.36); color: #CBFFD0; border-color: rgba(100,255,100,.35); }
.forecast-preview .fc-badge.stale { background: rgba(110,90,20,.36); color: #FFE9A0; border-color: rgba(255,200,50,.35); }

.forecast-preview .fc-empty { color: var(--text-secondary); font-size: .8rem; text-align: center; padding: 30px; }

.forecast-preview svg { width: 100%; height: auto; display: block; }
.forecast-preview .fc-grid { stroke: rgba(150,168,205,.16); stroke-width: 1; }
.forecast-preview .fc-axis { stroke: rgba(150,168,205,.40); stroke-width: 1; }
.forecast-preview .fc-tick { font-size: 11px; fill: var(--chart-axis); }
.forecast-preview .fc-hour { font-size: 12px; fill: var(--text-secondary); font-weight: 700; }
.forecast-preview .fc-dir  { font-size: 10px; fill: var(--accent); font-family: var(--mono); }
`;

injectStyle('forecast-preview', css);

const template = () => `
  <div class="forecast-preview">
    <div class="card-title">
      <span>Forecast (fetched)</span>
      <div class="fc-head-right">
        <div class="fc-legend">
          <span class="fc-legend-item"><span class="fc-legend-dot" style="background:${TEMP_COLOR}"></span>Temp</span>
          <span class="fc-legend-item"><span class="fc-legend-dot" style="background:${WIND_COLOR}"></span>Wind</span>
        </div>
        <span class="fc-badge">no data</span>
      </div>
    </div>
    <div class="fc-body"></div>
  </div>
`;

function compass(deg) {
  if (deg == null || Number.isNaN(deg)) return '';
  return COMPASS[Math.round(deg / 45) % 8];
}

function fmtHour(epoch) {
  return String(new Date(epoch * 1000).getHours()).padStart(2, '0');
}

function fmtAge(s) {
  if (s == null) return '';
  if (s < 90 * 60) return Math.round(s / 60) + ' min old';
  return Math.round(s / 3600) + ' h old';
}

function svg(tag, attrs, text) {
  const node = document.createElementNS(SVG_NS, tag);
  if (attrs) for (const k in attrs) node.setAttribute(k, attrs[k]);
  if (text != null) node.textContent = text;
  return node;
}

function niceRange(vals, fallbackMin, fallbackMax) {
  const f = vals.filter((v) => Number.isFinite(v));
  if (!f.length) return { min: fallbackMin, max: fallbackMax };
  let min = Math.min(...f), max = Math.max(...f);
  if (min === max) { min -= 1; max += 1; }
  const pad = (max - min) * 0.12;
  return { min: min - pad, max: max + pad };
}

function renderChart(data) {
  const hours = data.hours.slice(0, PREVIEW_HOURS);
  const temps = hours.map((h) => h[0]);
  const winds = hours.map((h) => h[1]);
  const tR = niceRange(temps, 0, 10);
  const wR = niceRange(winds.concat([0]), 0, 10);
  wR.min = 0;  // wind always anchored at 0

  const n = hours.length;
  const xAt = (i) => PAD_L + (n <= 1 ? 0 : (i / (n - 1)) * PLOT_W);
  const yTemp = (v) => PAD_T + (1 - (v - tR.min) / (tR.max - tR.min)) * PLOT_H;
  const yWind = (v) => PAD_T + (1 - (v - wR.min) / (wR.max - wR.min)) * PLOT_H;

  const s = svg('svg', { viewBox: '0 0 ' + W + ' ' + H, preserveAspectRatio: 'xMidYMid meet' });

  // horizontal grid + dual y tick labels (temp left, wind right)
  for (let t = 0; t < 3; t++) {
    const ratio = t / 2;
    const y = PAD_T + ratio * PLOT_H;
    s.appendChild(svg('line', { x1: PAD_L, y1: y, x2: PAD_L + PLOT_W, y2: y, class: 'fc-grid' }));
    s.appendChild(svg('text', { x: PAD_L - 6, y: y + 4, 'text-anchor': 'end', class: 'fc-tick' },
      (tR.max - (tR.max - tR.min) * ratio).toFixed(0) + '°'));
    s.appendChild(svg('text', { x: PAD_L + PLOT_W + 6, y: y + 4, 'text-anchor': 'start', class: 'fc-tick' },
      (wR.max - (wR.max - wR.min) * ratio).toFixed(0)));
  }
  // baseline axis
  s.appendChild(svg('line', { x1: PAD_L, y1: PAD_T + PLOT_H, x2: PAD_L + PLOT_W, y2: PAD_T + PLOT_H, class: 'fc-axis' }));

  // wind area + line
  let windPath = '';
  for (let i = 0; i < n; i++) windPath += (i ? ' L ' : 'M ') + xAt(i).toFixed(1) + ' ' + yWind(winds[i]).toFixed(1);
  const windArea = windPath + ' L ' + xAt(n - 1).toFixed(1) + ' ' + (PAD_T + PLOT_H) + ' L ' + xAt(0).toFixed(1) + ' ' + (PAD_T + PLOT_H) + ' Z';
  s.appendChild(svg('path', { d: windArea, fill: 'var(--series-cool-fill)' }));
  s.appendChild(svg('path', { d: windPath, fill: 'none', stroke: WIND_COLOR, 'stroke-width': '2.4', 'stroke-linejoin': 'round', 'stroke-linecap': 'round' }));

  // temp line
  let tempPath = '';
  for (let i = 0; i < n; i++) tempPath += (i ? ' L ' : 'M ') + xAt(i).toFixed(1) + ' ' + yTemp(temps[i]).toFixed(1);
  s.appendChild(svg('path', { d: tempPath, fill: 'none', stroke: TEMP_COLOR, 'stroke-width': '2.4', 'stroke-linejoin': 'round', 'stroke-linecap': 'round' }));

  // x labels every 3 h: hour + wind direction
  const stepLbl = n > 16 ? 3 : 2;
  for (let i = 0; i < n; i += stepLbl) {
    const x = xAt(i);
    const t = data.base_epoch + i * 3600;
    s.appendChild(svg('text', { x, y: PAD_T + PLOT_H + 18, 'text-anchor': 'middle', class: 'fc-hour' }, fmtHour(t)));
    s.appendChild(svg('text', { x, y: PAD_T + PLOT_H + 34, 'text-anchor': 'middle', class: 'fc-dir' }, compass(hours[i][2])));
  }

  return s;
}

// ========================================
// COMPONENT
// ========================================
export default component({
  tag: 'monitor-forecast-preview',
  render: template,
  onMount(ctx, el) {
    const badge = el.querySelector('.fc-badge');
    const body = el.querySelector('.fc-body');

    function update() {
      const data = getForecastHours();
      const hours = data && Array.isArray(data.hours) ? data.hours : [];
      const count = data ? (data.count || hours.length) : 0;

      if (!count || !hours.length || !data.base_epoch) {
        badge.textContent = 'no data';
        badge.className = 'fc-badge';
        body.innerHTML = '<div class="fc-empty">No forecast data fetched yet. Enable Forecast Preload in Settings and check the location.</div>';
        return;
      }

      const stale = (data.age_s || 0) > 3 * 3600;
      badge.textContent = fmtAge(data.age_s);
      badge.className = 'fc-badge ' + (stale ? 'stale' : 'ok');

      body.innerHTML = '';
      body.appendChild(renderChart(data));
    }

    subscribeDashboard('forecastHours', update);
    update();
  }
});
