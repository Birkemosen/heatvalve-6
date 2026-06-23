import { component } from '../../core/component.js';
import { getForecastHours, subscribeDashboard } from '../../core/store.js';
import { svgEl, smoothPath, niceRange, attachTooltip, legendHtml } from '../../core/chart-kit.js';

const PREVIEW_HOURS = 48;        // two days from hours_[0] (00:00 local today)
const SOLAR_REF = 1000;          // W/m² mapped to full plot height (clear-sky ceiling)

const TEMP_COLOR = 'var(--series-warm)';
const WIND_COLOR = 'var(--series-cool)';
const SOLAR_COLOR = 'var(--series-solar)';

// chart geometry (viewBox units; CSS scales width to 100%)
const W = 1000, H = 300;
const PAD_L = 46, PAD_R = 52, PAD_T = 16, PAD_B = 56;
const PLOT_W = W - PAD_L - PAD_R;
const PLOT_H = H - PAD_T - PAD_B;
const PLOT_B = PAD_T + PLOT_H;   // baseline y

const template = () => `
  <div class="chart-card forecast-preview">
    <div class="chart-head">
      <span class="chart-title">Weather Forecast</span>
      <span class="chart-sub"></span>
    </div>
    ${legendHtml([
      { color: TEMP_COLOR, label: 'Temp (°C)' },
      { color: WIND_COLOR, label: 'Wind (m/s)' },
      { color: SOLAR_COLOR, label: 'Solar (W/m²)' },
    ])}
    <div class="fc-body"></div>
  </div>
`;

function fmtFetchTime(epoch) {
  if (!epoch) return 'No data';
  if (epoch < 1600000000) return 'Clock syncing…';   // ESP clock not SNTP-synced yet
  const d = new Date(epoch * 1000);
  const hhmm = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const now = new Date();
  const sameDay = d.getFullYear() === now.getFullYear() &&
                  d.getMonth() === now.getMonth() && d.getDate() === now.getDate();
  return 'Updated ' + (sameDay ? hhmm
    : d.toLocaleDateString([], { month: 'short', day: 'numeric' }) + ' ' + hhmm);
}

function renderChart(data) {
  const hours = data.hours.slice(0, PREVIEW_HOURS);
  const n = hours.length;
  const temps = hours.map((h) => h[0]);
  const winds = hours.map((h) => h[1]);
  const solars = hours.map((h) => h[3] || 0);

  const tR = niceRange(temps, 0, 10);
  const wMax = Math.max(2, ...winds) * 1.15;

  const xAt = (i) => PAD_L + (n <= 1 ? 0 : (i / (n - 1)) * PLOT_W);
  const yTemp = (v) => PAD_T + (1 - (v - tR.min) / (tR.max - tR.min)) * PLOT_H;
  const yWind = (v) => PAD_T + (1 - v / wMax) * PLOT_H;
  const ySolar = (v) => PAD_T + (1 - Math.max(0, Math.min(1, v / SOLAR_REF))) * PLOT_H;

  const s = svgEl('svg', { viewBox: `0 0 ${W} ${H}`, preserveAspectRatio: 'xMidYMid meet' });

  // horizontal gridlines + dual y-axis ticks (°C left, m/s right)
  for (let t = 0; t < 4; t++) {
    const r = t / 3;
    const y = PAD_T + r * PLOT_H;
    s.appendChild(svgEl('line', { x1: PAD_L, y1: y, x2: PAD_L + PLOT_W, y2: y, class: 'chart-grid' }));
    s.appendChild(svgEl('text', { x: PAD_L - 7, y: y + 4, 'text-anchor': 'end', class: 'chart-tick' },
      (tR.max - (tR.max - tR.min) * r).toFixed(0) + '°'));
    s.appendChild(svgEl('text', { x: PAD_L + PLOT_W + 7, y: y + 4, 'text-anchor': 'start', class: 'chart-tick' },
      (wMax - wMax * r).toFixed(0)));
  }
  s.appendChild(svgEl('line', { x1: PAD_L, y1: PLOT_B, x2: PAD_L + PLOT_W, y2: PLOT_B, class: 'chart-axis' }));

  // axis unit labels
  s.appendChild(svgEl('text', { x: 12, y: PAD_T + PLOT_H / 2,
    transform: `rotate(-90 12 ${(PAD_T + PLOT_H / 2).toFixed(1)})`, 'text-anchor': 'middle', class: 'chart-axis-label' }, '°C'));
  s.appendChild(svgEl('text', { x: W - 12, y: PAD_T + PLOT_H / 2,
    transform: `rotate(90 ${W - 12} ${(PAD_T + PLOT_H / 2).toFixed(1)})`, 'text-anchor': 'middle', class: 'chart-axis-label' }, 'm/s'));

  // solar as a soft gold daylight area behind the lines (scaled to SOLAR_REF)
  let solarArea = '';
  for (let i = 0; i < n; i++) solarArea += (i ? ' L ' : 'M ') + xAt(i).toFixed(1) + ' ' + ySolar(solars[i]).toFixed(1);
  if (solarArea) {
    solarArea += ` L ${xAt(n - 1).toFixed(1)} ${PLOT_B} L ${xAt(0).toFixed(1)} ${PLOT_B} Z`;
    s.appendChild(svgEl('path', { d: solarArea, fill: 'color-mix(in srgb, var(--series-solar) 18%, transparent)', stroke: 'none' }));
  }

  // hourly x-axis labels, slanted -45° (non-bold; matches the timeline). The live
  // hour is gold; next-day hours are faded with a "+1d" marker at the boundary.
  const nowHour = data.base_epoch ? Math.floor((Date.now() / 1000 - data.base_epoch) / 3600) : -1;
  const baseDay = new Date(data.base_epoch * 1000).getDate();
  let midnightIdx = -1;
  for (let i = 0; i < n; i++) {
    const d = new Date((data.base_epoch + i * 3600) * 1000);
    const isNow = i === nowHour;
    const day2 = d.getDate() !== baseDay;
    if (day2 && midnightIdx < 0 && d.getHours() === 0) midnightIdx = i;
    const lx = xAt(i), ly = PLOT_B + 13;
    s.appendChild(svgEl('text', {
      x: lx, y: ly, 'text-anchor': 'end',
      transform: `rotate(-45 ${lx.toFixed(1)} ${ly})`,
      class: 'chart-hour' + (isNow ? ' now' : (day2 ? ' day2' : '')),
    }, String(d.getHours()).padStart(2, '0')));
    if (isNow) s.appendChild(svgEl('line', { x1: lx, y1: PAD_T, x2: lx, y2: PLOT_B,
      stroke: 'var(--series-solar)', 'stroke-width': '1', 'stroke-dasharray': '2 3', opacity: '.55',
      'vector-effect': 'non-scaling-stroke' }));
  }
  // next-day boundary: faint divider + "+1d" tag
  if (midnightIdx > 0) {
    const mx = xAt(midnightIdx);
    s.appendChild(svgEl('line', { x1: mx, y1: PAD_T, x2: mx, y2: PLOT_B,
      stroke: 'rgba(202,219,248,.26)', 'stroke-width': '1', 'stroke-dasharray': '4 4',
      'vector-effect': 'non-scaling-stroke' }));
    s.appendChild(svgEl('text', { x: mx + 4, y: PAD_T + 11, 'text-anchor': 'start',
      class: 'chart-hour day2' }, '+1d'));
  }

  // smooth series lines
  s.appendChild(svgEl('path', { d: smoothPath(winds.map((v, i) => ({ x: xAt(i), y: yWind(v) }))),
    fill: 'none', stroke: WIND_COLOR, 'stroke-width': '2.2', 'stroke-linejoin': 'round', 'stroke-linecap': 'round' }));
  s.appendChild(svgEl('path', { d: smoothPath(temps.map((v, i) => ({ x: xAt(i), y: yTemp(v) }))),
    fill: 'none', stroke: TEMP_COLOR, 'stroke-width': '2.6', 'stroke-linejoin': 'round', 'stroke-linecap': 'round' }));
  s.appendChild(svgEl('path', { d: smoothPath(solars.map((v, i) => ({ x: xAt(i), y: ySolar(v) }))),
    fill: 'none', stroke: SOLAR_COLOR, 'stroke-width': '1.8', 'stroke-linejoin': 'round', 'stroke-linecap': 'round', opacity: '.85' }));

  return {
    svg: s,
    model: {
      count: n, plotTop: PAD_T, plotBottom: PLOT_B,
      xAt,
      label: (i) => String(new Date((data.base_epoch + i * 3600) * 1000).getHours()).padStart(2, '0') + ':00',
      dots: (i) => [
        { y: yTemp(temps[i]), color: TEMP_COLOR },
        { y: yWind(winds[i]), color: WIND_COLOR },
        { y: ySolar(solars[i]), color: SOLAR_COLOR },
      ],
      rows: (i) => [
        { color: TEMP_COLOR, label: 'Temp', value: temps[i].toFixed(1) + '°' },
        { color: WIND_COLOR, label: 'Wind', value: winds[i].toFixed(1) + ' m/s' },
        { color: SOLAR_COLOR, label: 'Solar', value: Math.round(solars[i]) + ' W/m²' },
      ],
    },
  };
}

export default component({
  tag: 'monitor-forecast-preview',
  render: template,
  onMount(ctx, el) {
    const sub = el.querySelector('.chart-sub');
    const body = el.querySelector('.fc-body');
    const card = el.matches('.forecast-preview') ? el : el.querySelector('.forecast-preview');
    let teardown = null;

    function update() {
      if (teardown) { teardown(); teardown = null; }
      const data = getForecastHours();
      const hours = data && Array.isArray(data.hours) ? data.hours : [];
      const count = data ? (data.count || hours.length) : 0;

      if (!count || !hours.length || !data.base_epoch) {
        sub.textContent = 'No data';
        body.innerHTML = '<div style="color:var(--text-secondary);font-size:.8rem;text-align:center;padding:34px">No forecast fetched yet. Enable Forecast Preload in Settings and check the location.</div>';
        return;
      }

      sub.textContent = fmtFetchTime(data.fetch_epoch);
      body.innerHTML = '';
      const { svg, model } = renderChart(data);
      body.appendChild(svg);
      teardown = attachTooltip(svg, card, model);
    }

    subscribeDashboard('forecastHours', update);
    update();
  }
});
