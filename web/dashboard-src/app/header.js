import { component } from '../core/component.js';
import { injectStyle } from '../core/style.js';
import { getDashboardValue, subscribeDashboard, setSection } from '../core/store.js';
import { ev, es } from '../core/store.js';
import { fmtUp, fmtWifi } from '../utils/format.js';
import { gkey } from '../utils/keys.js';
import { subscribe } from '../core/component.js';

// ========================================
// CSS
// ========================================
const css = `
.topbar {
  position: static;
  margin-bottom: 14px;
  padding: 12px;
  border-radius: 18px;
  border: 1px solid var(--panel-border);
  background: var(--panel-bg-vibrant);
  box-shadow: var(--panel-shadow);
  display: grid;
  gap: 10px;
}

.topbar-head {
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 10px;
}

.top-brand {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  gap: 4px;
}

.brand-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.side-brand {
  color: var(--accent);
  font-family: var(--mono);
  font-size: 1.02rem;
  font-weight: 800;
  letter-spacing: 1.8px;
  text-transform: uppercase;
  white-space: nowrap;
}

.mode-pill {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 6px 10px;
  border-radius: 999px;
  border: 1px solid rgba(238,161,17,.35);
  background: rgba(238,161,17,.12);
  color: var(--accent);
  font-size: .66rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: .8px;
}

.top-menu {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 7px;
}

.menu-link {
  text-decoration: none;
  color: var(--text-secondary);
  border: 1px solid var(--control-border);
  background: linear-gradient(180deg, rgba(28,54,95,.54), rgba(19,38,70,.46));
  border-radius: 11px;
  padding: 10px 12px;
  font-size: .78rem;
  text-transform: uppercase;
  font-weight: 700;
  letter-spacing: .8px;
  transition: .2s ease;
}

.menu-link:hover {
  color: var(--text-strong);
  background: linear-gradient(180deg, rgba(42,76,132,.64), rgba(28,54,100,.54));
  border-color: rgba(120,168,255,.52);
}

.menu-link.active {
  color: var(--text-on-accent);
  border-color: var(--accent);
  background: var(--accent);
}

.top-meta {
  display: grid;
  justify-items: end;
  row-gap: 4px;
  color: var(--muted);
  font-size: .74rem;
}

.meta-row {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 10px;
}

.meta-chip {
  display: inline-flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  height: 34px;
  padding: 4px 10px;
  border-radius: 14px;
  border: 1px solid rgba(120,168,255,.32);
  background: linear-gradient(180deg, rgba(31,61,105,.52), rgba(18,36,68,.42));
}

.meta-chip-label {
  text-transform: uppercase;
  letter-spacing: .6px;
  font-size: 9px;
  font-weight: 700;
  line-height: 1;
  color: var(--text-secondary);
}

.meta-chip-value {
  font-size: 12px;
  font-weight: 800;
  line-height: 1;
  color: var(--text-strong);
}

.meta-chip-state.synced {
  color: var(--state-ok);
  border-color: rgba(121,209,126,.25);
  background: linear-gradient(180deg, rgba(20,52,34,.46), rgba(13,39,27,.36));
}

.meta-chip-state.saving {
  color: var(--state-warn);
  border-color: rgba(238,161,17,.35);
  background: linear-gradient(180deg, rgba(83,56,20,.46), rgba(58,37,12,.36));
}

.meta-chip-state.offline {
  color: var(--text-secondary);
  border-color: rgba(120,168,255,.24);
  background: linear-gradient(180deg, rgba(31,61,105,.34), rgba(18,36,68,.28));
}

.brand-fw {
  min-height: 12px;
  font-size: .62rem;
  letter-spacing: .7px;
  color: var(--text-secondary);
  font-family: var(--mono);
  text-transform: uppercase;
}

.top-dot {
  width: 10px;
  height: 10px;
  border-radius: 999px;
  background: var(--state-disabled);
  transition: .2s ease;
}

.top-dot.on {
  background: var(--blue);
  box-shadow: 0 0 12px rgba(83,168,255,.55);
}

@media (max-width: 860px) {
  .topbar-head { grid-template-columns: 1fr; }
  .top-brand { justify-content: center; flex-wrap: wrap; }
  .brand-row { justify-content: center; }
  .brand-fw { text-align: center; width: 100%; }
  .top-meta { justify-items: center; }
  .meta-row { justify-content: center; flex-wrap: wrap; }
  .top-menu { justify-content: center; }
}
`;

injectStyle('hv6-header', css);

// ========================================
// TEMPLATE
// ========================================
const template = () => `
  <header class="topbar">
    <div class="topbar-head">
      <div class="top-brand">
        <div class="brand-row">
          <div class="side-brand">HeatValve-6</div>
          <div class="mode-pill" id="hdr-mode"></div>
        </div>
        <span class="brand-fw" id="hdr-fw"></span>
      </div>
      <nav class="top-menu">
        <a href="#" class="menu-link active" data-section="overview">Dashboard</a>
        <a href="#" class="menu-link" data-section="zones">Zones</a>
        <a href="#" class="menu-link" data-section="diagnostics">Diagnostics</a>
        <a href="#" class="menu-link" data-section="settings">Settings</a>
      </nav>
      <div class="top-meta">
        <div class="meta-row">
          <div class="top-dot" id="hdr-dot"></div>
          <span id="hdr-sync" class="meta-chip meta-chip-state synced">Synced</span>
          <span class="meta-chip"><span class="meta-chip-label">Uptime</span><span class="meta-chip-value" id="hdr-up">---</span></span>
          <span class="meta-chip"><span class="meta-chip-label">WiFi</span><span class="meta-chip-value" id="hdr-wifi">---</span></span>
        </div>
      </div>
    </div>
  </header>
`;

// ========================================
// COMPONENT
// ========================================
export default component({
  tag: 'hv6-header',
  render: template,
  onMount(ctx, el) {
    const modeEl = el.querySelector('#hdr-mode');
    const dotEl = el.querySelector('#hdr-dot');
    const syncEl = el.querySelector('#hdr-sync');
    const upEl = el.querySelector('#hdr-up');
    const wifiEl = el.querySelector('#hdr-wifi');
    const fwEl = el.querySelector('#hdr-fw');
    const links = el.querySelectorAll('.menu-link');

    function updateSection() {
      const section = getDashboardValue('section');
      links.forEach((node) => {
        node.classList.toggle('active', node.getAttribute('data-section') === section);
      });
    }

    function updateMeta() {
      const live = getDashboardValue('live');
      const pendingWrites = getDashboardValue('pendingWrites');
      const mode = window.HV6_DASHBOARD_CONFIG && window.HV6_DASHBOARD_CONFIG.mock ?
        (window.HV6_DASHBOARD_CONFIG.mockLabel || 'Mock') :
        (live ? 'Live' : 'Offline');

      modeEl.textContent = mode;
      dotEl.classList.toggle('on', !!live);
      syncEl.textContent = pendingWrites > 0 ? 'Saving...' : (live ? 'Synced' : 'Offline');
      const syncState = pendingWrites > 0 ? 'saving' : (live ? 'synced' : 'offline');
      syncEl.className = 'meta-chip meta-chip-state ' + syncState;
      upEl.textContent = fmtUp(ev(gkey.uptime));
      wifiEl.textContent = fmtWifi(ev(gkey.wifi));
      const fw = getDashboardValue('firmwareVersion') || es(gkey.firmware);
      fwEl.textContent = fw ? 'FW ' + fw : '';
    }

    links.forEach((node) => {
      node.addEventListener('click', (event) => {
        event.preventDefault();
        setSection(node.getAttribute('data-section'));
      });
    });

    subscribeDashboard('section', updateSection);
    subscribeDashboard('live', updateMeta);
    subscribeDashboard('pendingWrites', updateMeta);
    subscribeDashboard('firmwareVersion', updateMeta);
    subscribe(gkey.uptime, updateMeta);
    subscribe(gkey.wifi, updateMeta);
    subscribe(gkey.firmware, updateMeta);
    updateSection();
    updateMeta();
  }
});