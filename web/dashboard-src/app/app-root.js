import { component, mountComponent } from '../core/component.js';
import { injectStyle } from '../core/style.js';
import { getDashboardValue, subscribeDashboard } from '../core/store.js';

// =====================
// CSS
// =====================
const css = `
@import url("https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800&display=swap");

:root {
  --accent: #EEA111;
  --blue: #53A8FF;
  --bg: #0E1A2C;
  --surface: #132744;
  --card: #0F213C;
  --border: rgba(120,168,255,.24);
  --text: #FFFFFF;
  --text-strong: #F3F8FF;
  --text-secondary: rgba(214,228,255,.86);
  --muted: rgba(214,228,255,.78);
  --text-faint: rgba(191,211,245,.58);
  --text-on-accent: #101C30;
  --soft: rgba(132,180,255,.12);
  --panel-border: rgba(120,168,255,.28);
  --panel-bg: linear-gradient(180deg, rgba(20,44,79,.42), rgba(13,31,58,.36));
  --panel-bg-vibrant: radial-gradient(900px 300px at 90% -40%, rgba(83,168,255,.18), transparent 62%), linear-gradient(180deg, rgba(20,44,79,.44), rgba(13,31,58,.38));
  --panel-shadow: inset 0 1px 0 rgba(255,255,255,.03), 0 24px 60px rgba(0,0,0,.35);
  --state-ok: #79d17e;
  --state-warn: #f2c77b;
  --state-danger: #ff7676;
  --state-disabled: #7D8BA7;
  --control-bg: rgba(83,168,255,.1);
  --control-bg-hover: rgba(83,168,255,.16);
  --control-border: rgba(120,168,255,.32);
  --control-border-strong: rgba(120,168,255,.45);
  --viz-flow-low: #8FCBFF;
  --viz-flow-mid: #BCDFFF;
  --viz-flow-high: #E4D092;
  --viz-flow-hot: #F2B74C;
  --viz-delta-low: #42A5F5;
  --viz-delta-ok: #66BB6A;
  --viz-delta-high: #EF5350;
  --green: #79d17e;
  --red: #ff6464;
  --mono: "Montserrat", sans-serif;
  --side-w: 260px;
  --side-collapsed: 76px;
}

*, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
html { font-size: 16px; scroll-behavior: smooth; }
body {
  font-family: "Montserrat", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  background:
    radial-gradient(1400px 760px at 92% -14%, rgba(238,161,17,.12), transparent 56%),
    radial-gradient(1200px 820px at 18% -8%, rgba(83,168,255,.2), transparent 64%),
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
  grid-template-columns: 1.2fr .8fr .8fr;
  gap: 14px;
  margin-top: 14px;
}

.zone-layout,
.diag-layout,
.settings-layout {
  display: grid;
  gap: 14px;
}

.zone-layout {
  grid-template-columns: 1fr 1fr;
}

.zone-right-stack {
  display: grid;
  gap: 14px;
}

.settings-layout {
  grid-template-columns: 1.15fr .85fr;
}

.ftr {
  text-align: center;
  color: var(--text-faint);
  padding: 20px;
  font-size: .72rem;
  letter-spacing: .8px;
}

.placeholder-card {
  background: linear-gradient(180deg, rgba(20,44,79,.42), rgba(13,31,58,.36));
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

@media (max-width: 1080px) {
  .dashboard-grid { grid-template-columns: 1fr 1fr; }
}

@media (max-width: 860px) {
  .zone-layout,
  .dashboard-grid,
  .settings-layout { grid-template-columns: 1fr; }
}

/* ============================
   GLOBAL INTERACTIVE STATES
   ============================ */

/* Consistent focus ring for all interactive elements */
button:focus-visible,
select:focus-visible,
input:focus-visible,
a:focus-visible {
  outline: 2px solid rgba(83,168,255,.72);
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
        <div class="dashboard-grid">
          <div class="overview-status"></div>
          <div class="overview-connectivity"></div>
          <div class="overview-graphs"></div>
        </div>
      </section>
      <section class="sec" data-section="zones">
        <div class="zone-selector"></div>
        <div class="zone-layout">
          <div class="zone-detail-slot"></div>
          <div class="zone-right-stack">
            <div class="zone-sensor-slot"></div>
            <div class="zone-room-slot"></div>
          </div>
        </div>
      </section>
      <section class="sec" data-section="diagnostics">
        <div class="diag-manual-badge-slot"></div>
        <div class="diag-layout"></div>
      </section>
      <section class="sec" data-section="settings">
        <div class="settings-layout">
          <div class="settings-manifold-slot"></div>
          <div class="settings-control-slot"></div>
          <div class="settings-motor-cal-slot"></div>
        </div>
      </section>
      <div class="ftr">HEATVALVE-6 · UFH CONTROLLER</div>
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
    el.querySelector('.overview-status').appendChild(mountComponent('status-card'));
    el.querySelector('.overview-connectivity').appendChild(mountComponent('connectivity-card'));
    el.querySelector('.overview-graphs').appendChild(mountComponent('graph-widgets'));
    el.querySelector('.zone-selector').appendChild(mountComponent('zone-grid'));
    el.querySelector('.zone-detail-slot').appendChild(mountComponent('zone-detail', { zone: getDashboardValue('selectedZone') }));
    el.querySelector('.zone-sensor-slot').appendChild(mountComponent('zone-sensor-card'));
    el.querySelector('.zone-room-slot').appendChild(mountComponent('zone-room-card'));

    el.querySelector('.settings-manifold-slot').appendChild(mountComponent('settings-manifold-card'));
    el.querySelector('.settings-control-slot').appendChild(mountComponent('settings-control-card'));
    el.querySelector('.settings-motor-cal-slot').appendChild(mountComponent('settings-motor-calibration-card'));

    el.querySelector('.diag-manual-badge-slot').appendChild(mountComponent('diag-manual-badge'));

    const diagLayout = el.querySelector('.diag-layout');
    diagLayout.appendChild(mountComponent('diag-i2c'));
    diagLayout.appendChild(mountComponent('diag-activity'));
    diagLayout.appendChild(mountComponent('diag-zone'));

    // Mount per-zone diagnostic motor and recovery cards
    const selectedZone = getDashboardValue('selectedZone') || 1;
    diagLayout.appendChild(mountComponent('diag-zone-motor-card', { zone: selectedZone }));
    diagLayout.appendChild(mountComponent('diag-zone-recovery-card', { zone: selectedZone }));

    const sectionNodes = el.querySelectorAll('.sec');

    function updateSection() {
      const section = getDashboardValue('section');
      sectionNodes.forEach((node) => {
        node.classList.toggle('active', node.getAttribute('data-section') === section);
      });
    }

    subscribeDashboard('section', updateSection);
    updateSection();
  }
});