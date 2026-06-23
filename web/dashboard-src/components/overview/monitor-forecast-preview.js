import { component } from '../../core/component.js';
import { getForecastHours, subscribeDashboard } from '../../core/store.js';
import { svgEl, smoothPath, niceRange, attachTooltip } from '../../core/chart-kit.js';
import { injectStyle } from '../../core/style.js';

const PREVIEW_HOURS = 48;        // two days from hours_[0] (00:00 local today)
const SOLAR_REF = 1000;          // W/m² mapped to full plot height (clear-sky ceiling)

const TEMP_COLOR = 'var(--series-warm)';
const WIND_COLOR = 'var(--series-cool)';
const SOLAR_COLOR = 'var(--series-solar)';
const WIND_ARROW_STEP = 2;       // draw every other hour to keep the plot readable

// chart geometry (viewBox units; CSS scales width to 100%)
const W = 1000, H = 220;
const PAD_L = 46, PAD_R = 52, PAD_T = 14, PAD_B = 44;
const PLOT_W = W - PAD_L - PAD_R;
const PLOT_H = H - PAD_T - PAD_B;
const PLOT_B = PAD_T + PLOT_H;   // baseline y

const css = `
.forecast-preview .fc-controls {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  margin: 2px 0 6px;
}
.forecast-preview .fc-toggle {
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
.forecast-preview .fc-toggle::before {
  content: '';
  width: 9px;
  height: 9px;
  border-radius: 999px;
  border: 2px solid currentColor;
  background: color-mix(in srgb, currentColor 30%, transparent);
  flex-shrink: 0;
}
.forecast-preview .fc-toggle:hover {
  border-color: rgba(255,133,49,.44);
  color: var(--text-strong);
}
.forecast-preview .fc-toggle.is-off {
  opacity: .48;
  background: transparent;
}
.forecast-preview .fc-toggle[data-layer="temp"] { color: var(--series-warm); }
.forecast-preview .fc-toggle[data-layer="wind"] { color: var(--series-cool); }
.forecast-preview .fc-toggle[data-layer="solar"] { color: var(--series-solar); }
.forecast-preview .fc-wind-guide {
  opacity: .34;
}
.forecast-preview .fc-wind-arrow {
  fill: var(--series-cool);
  stroke: rgba(4,18,28,.35);
  stroke-width: .28;
  stroke-linejoin: round;
  opacity: .76;
  vector-effect: non-scaling-stroke;
  filter: drop-shadow(0 0 2px rgba(188,80,144,.22));
}
.forecast-preview .fc-wind-arrow.now {
  fill: var(--series-solar);
}
`;

injectStyle('monitor-forecast-preview', css);

const template = () => `
  <div class="chart-card forecast-preview">
    <div class="chart-head">
      <span class="chart-title">Weather Forecast</span>
      <span class="chart-sub"></span>
    </div>
    <div class="fc-controls" role="toolbar" aria-label="Forecast chart layers">
      <button type="button" class="fc-toggle" data-layer="temp" aria-pressed="true">Temp</button>
      <button type="button" class="fc-toggle" data-layer="wind" aria-pressed="true">Wind + dir</button>
      <button type="button" class="fc-toggle" data-layer="solar" aria-pressed="true">Solar</button>
    </div>
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

function compassLabel(deg) {
  if (!Number.isFinite(Number(deg))) return '---';
  const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  return dirs[Math.round((((Number(deg) % 360) + 360) % 360) / 45) % 8];
}

function fmtDirection(deg) {
  if (!Number.isFinite(Number(deg))) return '---';
  const normalized = Math.round((((Number(deg) % 360) + 360) % 360));
  return compassLabel(normalized) + ' ' + normalized + '°';
}

function renderChart(data, visible) {
  const hours = data.hours.slice(0, PREVIEW_HOURS);
  const n = hours.length;
  const temps = hours.map((h) => h[0]);
  const winds = hours.map((h) => h[1]);
  const dirs = hours.map((h) => h[2]);
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
    if (visible.temp) {
      s.appendChild(svgEl('text', { x: PAD_L - 7, y: y + 4, 'text-anchor': 'end', class: 'chart-tick' },
        (tR.max - (tR.max - tR.min) * r).toFixed(0) + '°'));
    }
    if (visible.wind) {
      s.appendChild(svgEl('text', { x: PAD_L + PLOT_W + 7, y: y + 4, 'text-anchor': 'start', class: 'chart-tick' },
        (wMax - wMax * r).toFixed(0)));
    }
  }
  s.appendChild(svgEl('line', { x1: PAD_L, y1: PLOT_B, x2: PAD_L + PLOT_W, y2: PLOT_B, class: 'chart-axis' }));

  // axis unit labels
  if (visible.temp) {
    s.appendChild(svgEl('text', { x: 12, y: PAD_T + PLOT_H / 2,
      transform: `rotate(-90 12 ${(PAD_T + PLOT_H / 2).toFixed(1)})`, 'text-anchor': 'middle', class: 'chart-axis-label' }, '°C'));
  }
  if (visible.wind) {
    s.appendChild(svgEl('text', { x: W - 12, y: PAD_T + PLOT_H / 2,
      transform: `rotate(90 ${W - 12} ${(PAD_T + PLOT_H / 2).toFixed(1)})`, 'text-anchor': 'middle', class: 'chart-axis-label' }, 'm/s'));
  }

  // solar as a soft gold daylight area behind the lines (scaled to SOLAR_REF)
  if (visible.solar) {
    let solarArea = '';
    for (let i = 0; i < n; i++) solarArea += (i ? ' L ' : 'M ') + xAt(i).toFixed(1) + ' ' + ySolar(solars[i]).toFixed(1);
    if (solarArea) {
      solarArea += ` L ${xAt(n - 1).toFixed(1)} ${PLOT_B} L ${xAt(0).toFixed(1)} ${PLOT_B} Z`;
      s.appendChild(svgEl('path', { d: solarArea, fill: 'color-mix(in srgb, var(--series-solar) 18%, transparent)', stroke: 'none' }));
    }
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
    if (isNow) {
      s.appendChild(svgEl('line', { x1: lx, y1: PAD_T, x2: lx, y2: PLOT_B,
        stroke: 'var(--series-solar)', 'stroke-width': '1', 'stroke-dasharray': '2 3', opacity: '.55',
        'vector-effect': 'non-scaling-stroke' }));
      s.appendChild(svgEl('text', { x: lx + 4, y: PAD_T + 11, 'text-anchor': 'start',
        class: 'chart-hour now' }, 'now'));
    }
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

  if (visible.wind) {
    // Wind: a faint speed guide with direction arrows at every other hour.
    // Forecast wind_dir_deg is meteorological: direction the wind comes from.
    s.appendChild(svgEl('path', { d: smoothPath(winds.map((v, i) => ({ x: xAt(i), y: yWind(v) }))),
      class: 'fc-wind-guide', fill: 'none', stroke: WIND_COLOR, 'stroke-width': '1.5',
      'stroke-linejoin': 'round', 'stroke-linecap': 'round' }));
    const windArrowLayer = svgEl('g', { class: 'fc-wind-arrows', 'aria-label': 'Wind direction arrows' });
    for (let i = 0; i < n; i++) {
      if (i % WIND_ARROW_STEP !== 0 && i !== nowHour) continue;
      const dir = Number(dirs[i]);
      if (!Number.isFinite(dir)) continue;
      const x = xAt(i), y = yWind(winds[i]);
      windArrowLayer.appendChild(svgEl('path', {
        d: 'M -4.8 -1.1 L .7 -1.1 L .7 -3.6 L 5.6 0 L .7 3.6 L .7 1.1 L -4.8 1.1 Z',
        class: 'fc-wind-arrow' + (i === nowHour ? ' now' : ''),
        transform: `translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${(dir - 90).toFixed(1)})`,
      }));
    }
    s.appendChild(windArrowLayer);
  }

  if (visible.temp) {
    s.appendChild(svgEl('path', { d: smoothPath(temps.map((v, i) => ({ x: xAt(i), y: yTemp(v) }))),
      fill: 'none', stroke: TEMP_COLOR, 'stroke-width': '2.6', 'stroke-linejoin': 'round', 'stroke-linecap': 'round' }));
  }
  if (visible.solar) {
    s.appendChild(svgEl('path', { d: smoothPath(solars.map((v, i) => ({ x: xAt(i), y: ySolar(v) }))),
      fill: 'none', stroke: SOLAR_COLOR, 'stroke-width': '1.8', 'stroke-linejoin': 'round', 'stroke-linecap': 'round', opacity: '.85' }));
  }

  const dotFns = [];
  if (visible.temp) dotFns.push((i) => ({ y: yTemp(temps[i]), color: TEMP_COLOR }));
  if (visible.wind) dotFns.push((i) => ({ y: yWind(winds[i]), color: WIND_COLOR }));
  if (visible.solar) dotFns.push((i) => ({ y: ySolar(solars[i]), color: SOLAR_COLOR }));

  return {
    svg: s,
    model: {
      count: n, plotTop: PAD_T, plotBottom: PLOT_B,
      xAt,
      label: (i) => String(new Date((data.base_epoch + i * 3600) * 1000).getHours()).padStart(2, '0') + ':00',
      dots: (i) => dotFns.map((fn) => fn(i)),
      rows: (i) => {
        const rows = [];
        if (visible.temp) rows.push({ color: TEMP_COLOR, label: 'Temp', value: temps[i].toFixed(1) + '°' });
        if (visible.wind) {
          rows.push({ color: WIND_COLOR, label: 'Wind', value: winds[i].toFixed(1) + ' m/s' });
          rows.push({ color: WIND_COLOR, label: 'From', value: fmtDirection(dirs[i]) });
        }
        if (visible.solar) rows.push({ color: SOLAR_COLOR, label: 'Solar', value: Math.round(solars[i]) + ' W/m²' });
        return rows;
      },
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
    const controls = Array.from(el.querySelectorAll('.fc-toggle'));
    const visible = { temp: true, wind: true, solar: true };
    let teardown = null;

    function paintControls() {
      controls.forEach((btn) => {
        const layer = btn.dataset.layer;
        btn.classList.toggle('is-off', !visible[layer]);
        btn.setAttribute('aria-pressed', visible[layer] ? 'true' : 'false');
      });
    }

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
      const { svg, model } = renderChart(data, visible);
      body.appendChild(svg);
      teardown = attachTooltip(svg, card, model);
    }

    controls.forEach((btn) => {
      btn.addEventListener('click', () => {
        const layer = btn.dataset.layer;
        visible[layer] = !visible[layer];
        paintControls();
        update();
      });
    });

    subscribeDashboard('forecastHours', update);
    paintControls();
    update();
  }
});
