import { component, mountComponent } from '../core/component.js';
import { injectStyle } from '../core/style.js';
import { getDashboardValue, subscribeDashboard } from '../core/store.js';
import { localize, subscribeLanguage } from '../core/i18n.js';

// =====================
// CSS
// =====================
const css = `
@import url("https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800&display=swap");

:root {
  /* ===========================================================
     Palette (sunset ramp, cool-dark → warm-light):
       #00202e #003f5c #2c4875 #8a508f #bc5090
       #ff6361 #ff8531 #ffa600 #ffd380
     Dark cool tones → surfaces/borders; orange → primary accent,
     purple → secondary/cool (no blue in the UI or charts); warm
     members → data series + states. Greens for "OK" status are kept
     (the palette has no green) for status legibility.
     =========================================================== */
  --accent: #ff8531;          /* orange — primary accent */
  --blue: #8a508f;            /* purple — secondary / cool accent (replaces blue) */
  /* Chart data series — orange (warm) + purple (cool), no blue. */
  --series-warm: #ff8531;
  --series-cool: #8a508f;
  --series-cool-fill: rgba(138,80,143,.16);
  --series-solar: #ffc14d;    /* gold — solar irradiance / current-hour highlight */
  /* Axis/tick label color — warm-neutral, legible on the dark panel. */
  --chart-axis: rgba(233,222,210,.82);
  --bg: #00202e;
  --surface: #003f5c;
  --card: #042a3b;
  --border: rgba(120,146,200,.22);
  --text: #FFFFFF;
  --text-strong: #FFF4E6;
  --text-secondary: rgba(255,239,224,.84);
  --muted: rgba(247,233,221,.74);
  --text-faint: rgba(229,216,222,.56);
  --text-on-accent: #00202e;
  --soft: rgba(124,155,208,.12);
  --panel-border: rgba(120,146,200,.28);
  --panel-bg: rgba(0,63,92,.40);
  --panel-bg-vibrant: rgba(0,63,92,.44);
  --panel-shadow: inset 0 1px 0 rgba(255,255,255,.03), 0 24px 60px rgba(0,0,0,.42);
  --state-ok: #79d17e;
  --state-warn: #ffa600;
  --state-danger: #ff6361;
  --state-disabled: #6E7E96;
  --control-bg: rgba(124,155,208,.10);
  --control-bg-hover: rgba(124,155,208,.16);
  --control-border: rgba(120,146,200,.30);
  --control-border-strong: rgba(120,146,200,.45);
  --viz-flow-low: #8a508f;
  --viz-flow-mid: #bc5090;
  --viz-flow-high: #ff8531;
  --viz-flow-hot: #ffa600;
  --viz-delta-low: #8a508f;
  --viz-delta-ok: #66BB6A;
  --viz-delta-high: #ff6361;
  --green: #79d17e;
  --red: #ff6361;
  --mono: "Montserrat", sans-serif;
  --side-w: 260px;
  --side-collapsed: 76px;
}

*, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
html { font-size: 12px; scroll-behavior: smooth; }
body {
  font-family: "Montserrat", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  background:
    radial-gradient(1400px 760px at 92% -14%, rgba(255,133,49,.12), transparent 56%),
    radial-gradient(1200px 820px at 18% -8%, rgba(138,80,143,.16), transparent 64%),
    var(--bg);
  color: var(--text);
  min-height: 100vh;
  line-height: 1.45;
  -webkit-font-smoothing: antialiased;
}

.app {
  display: block;
  min-height: 100vh;
}

.shell {
  padding: 18px;
  width: min(1320px, 100%);
  margin: 0 auto;
}

.sec {
  display: none;
  margin-bottom: 22px;
}

.sec.active {
  display: block;
}

.dashboard-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 14px;
  margin-top: 14px;
  align-items: stretch;
}

.overview-flow-return {
  display: flex;
  flex-direction: column;
}

.overview-flow-return > * {
  flex: 1;
}

.zone-layout,
.logs-layout {
  display: grid;
  gap: 14px;
}

/* Logs: main log stream (2/3) + stacked diagnostics column (1/3). */
.logs-layout {
  grid-template-columns: 2fr 1fr;
  align-items: start;
}

.logs-main-col,
.logs-side-col {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.zone-layout {
  grid-template-columns: 1fr 1fr 1fr;
  align-items: stretch;
}

.zone-detail-slot,
.zone-sensor-slot,
.zone-room-slot,
.zone-recovery-slot {
  display: flex;
}

.zone-detail-slot > *,
.zone-sensor-slot > *,
.zone-room-slot > *,
.zone-recovery-slot > * {
  flex: 1;
}

/* Middle column stacks the sensor (connectivity) and fault/relearn cards,
   stretching to match the Zone and Zone Settings columns' height. */
.zone-mid-col {
  display: flex;
  flex-direction: column;
  gap: 14px;
}
/* Slots grow to share the column's full height so the stack matches the Zone
   and Zone Settings columns (no gap left below the last card). */
.zone-mid-col > * { width: 100%; flex: 1 1 auto; }

/* Single row of 4 equal-height columns; cards stretch to fill via flex. */
.settings-layout {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 14px;
  align-items: stretch;
}
.settings-layout > * { display: flex; }
.settings-layout > * > * { flex: 1; }
/* Balancing card carries a 6-zone table — give it the full row below the four. */
.settings-balancing-slot { grid-column: 1 / -1; }

.ftr {
  text-align: center;
  color: var(--text-faint);
  padding: 20px;
  font-size: .72rem;
  letter-spacing: .8px;
}

.placeholder-card {
  background: var(--panel-bg);
  border: 1px solid var(--border);
  border-radius: 18px;
  padding: 20px;
  box-shadow: inset 0 1px 0 rgba(255,255,255,.03), 0 24px 60px rgba(0,0,0,.35);
}

.placeholder-card h3 {
  font-size: .84rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 1.1px;
  color: var(--accent);
  margin-bottom: 12px;
}

.placeholder-card p {
  color: var(--muted);
  font-size: .86rem;
}

@media (max-width: 1200px) {
  .settings-layout { grid-template-columns: 1fr 1fr; }
}

@media (max-width: 860px) {
  .zone-layout,
  .dashboard-grid,
  .settings-layout,
  .logs-layout { grid-template-columns: 1fr; }

  .zone-detail-slot {
    grid-column: 1;
  }
}

/* ============================
   GLOBAL INTERACTIVE STATES
   ============================ */

/* Consistent focus ring for all interactive elements */
button:focus-visible,
select:focus-visible,
input:focus-visible,
a:focus-visible {
  outline: 2px solid rgba(124,155,208,.72);
  outline-offset: 2px;
}

/* Disabled state for all buttons/inputs */
button:disabled,
input:disabled,
select:disabled {
  opacity: .40;
  cursor: not-allowed;
  pointer-events: none;
}

/* Gated card body: faded + non-interactive when its feature is disabled.
   The enable toggle stays outside this wrapper so it remains clickable. */
.gated-body {
  transition: opacity .2s ease;
}
.gated-body.is-disabled {
  opacity: .42;
  pointer-events: none;
  user-select: none;
}
`;

injectStyle('app-root', css);

// =====================
// TEMPLATE
// =====================
const template = (ctx) => `
  <div class="app">
    <main class="shell">
      <div class="hdr"></div>
      <section class="sec active" data-section="overview">
        <div class="overview-flow"></div>
        <div class="overview-forecast" style="margin-top:14px"></div>
        <div class="overview-timeline" style="margin-top:14px"></div>
        <div class="dashboard-grid">
          <div class="overview-flow-return"></div>
        </div>
      </section>
      <section class="sec" data-section="zones">
        <div class="zone-selector"></div>
        <div class="zone-layout">
          <div class="zone-detail-slot"></div>
          <div class="zone-mid-col">
            <div class="zone-sensor-slot"></div>
            <div class="zone-recovery-slot"></div>
          </div>
          <div class="zone-room-slot"></div>
        </div>
      </section>
      <section class="sec" data-section="settings">
        <div class="settings-layout">
          <div class="settings-manifold-slot"></div>
          <div class="settings-asgard-slot"></div>
          <div class="settings-motor-cal-slot"></div>
          <div class="settings-smart-heating-slot"></div>
          <div class="settings-balancing-slot"></div>
        </div>
      </section>
      <section class="sec" data-section="diagnostics">
        <div class="logs-layout">
          <div class="logs-main-col"></div>
          <div class="logs-side-col"></div>
        </div>
      </section>
      <div class="ftr" data-i18n="footer.product">HEATVALVE-6 · UFH CONTROLLER</div>
    </main>
  </div>
`;

// =====================
// COMPONENT
// =====================
component({
  tag: 'app-root',

  render: template,

  onMount(ctx, el) {
    el.querySelector('.hdr').appendChild(mountComponent('hv6-header'));
    el.querySelector('.overview-flow').appendChild(mountComponent('flow-diagram'));
    el.querySelector('.overview-forecast').appendChild(mountComponent('monitor-forecast-preview'));
    el.querySelector('.overview-timeline').appendChild(mountComponent('zone-state-timeline'));
    el.querySelector('.overview-flow-return').appendChild(mountComponent('graph-widgets', { variant: 'flow-return' }));

    el.querySelector('.zone-selector').appendChild(mountComponent('zone-grid'));
    el.querySelector('.zone-detail-slot').appendChild(mountComponent('zone-detail', { zone: getDashboardValue('selectedZone') }));
    // Middle column: sensor (connectivity) + fault/relearn, both following the selected zone.
    el.querySelector('.zone-sensor-slot').appendChild(mountComponent('zone-sensor-card'));
    el.querySelector('.zone-recovery-slot').appendChild(mountComponent('diag-zone-recovery-card'));
    el.querySelector('.zone-room-slot').appendChild(mountComponent('zone-room-card'));

    el.querySelector('.settings-manifold-slot').appendChild(mountComponent('settings-manifold-card'));
    el.querySelector('.settings-asgard-slot').appendChild(mountComponent('settings-asgard-card'));
    el.querySelector('.settings-motor-cal-slot').appendChild(mountComponent('settings-motor-calibration-card'));
    // Smart Heating: Preheat + Forecast combined into one card under Settings.
    el.querySelector('.settings-smart-heating-slot').appendChild(mountComponent('settings-smart-heating-card'));
    // Hydraulic balancing spans the full width below the 4-card row (per-zone table).
    el.querySelector('.settings-balancing-slot').appendChild(mountComponent('settings-balancing-card'));

    // Logs view: live device-log stream + general activity log (2/3) beside a stacked
    // diagnostics column (1/3) holding connectivity + device-level diagnostics +
    // motor control + device actions.
    const logsMain = el.querySelector('.logs-main-col');
    logsMain.appendChild(mountComponent('logs-view'));
    logsMain.appendChild(mountComponent('diag-activity'));
    const logsSide = el.querySelector('.logs-side-col');
    logsSide.appendChild(mountComponent('connectivity-card'));
    logsSide.appendChild(mountComponent('diag-system-card'));
    logsSide.appendChild(mountComponent('preheat-factors-card'));
    logsSide.appendChild(mountComponent('diag-zone-motor-card', { zone: getDashboardValue('selectedZone') || 1 }));
    logsSide.appendChild(mountComponent('settings-control-card'));
    logsSide.appendChild(mountComponent('diag-manual-badge'));
    logsSide.appendChild(mountComponent('diag-i2c'));

    const sectionNodes = el.querySelectorAll('.sec');

    function updateSection() {
      const section = getDashboardValue('section');
      sectionNodes.forEach((node) => {
        node.classList.toggle('active', node.getAttribute('data-section') === section);
      });
    }

    subscribeDashboard('section', updateSection);
    subscribeLanguage(() => localize(el));
    localize(el);
    updateSection();
  }
});
