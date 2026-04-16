import { component, subscribe } from '../../core/component.js';
import { injectStyle } from '../../core/style.js';
import { ev, es } from '../../core/store.js';
import { fmtUp } from '../../utils/format.js';
import { gkey } from '../../utils/keys.js';

// ========================================
// CSS
// ========================================
const css = `
.connectivity-card {
  background: var(--panel-bg);
  border: 1px solid var(--panel-border);
  border-radius: 18px;
  padding: 20px;
  box-shadow: var(--panel-shadow);
}

.connectivity-card .card-title {
  font-size: .84rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 1.1px;
  color: var(--accent);
  margin-bottom: 12px;
  padding-bottom: 10px;
  border-bottom: 1px solid var(--panel-border);
}

.connectivity-card .st { width: 100%; border-collapse: collapse; }
.connectivity-card .st td { padding: 10px 0; font-size: .88rem; }
.connectivity-card .st td:first-child { color: var(--text-secondary); width: 48%; }
.connectivity-card .st td:last-child { text-align: right; font-weight: 700; color: var(--text-strong); }
.connectivity-card .st tr:not(:last-child) td { border-bottom: 1px solid rgba(255,255,255,.07); }
`;

injectStyle('connectivity-card', css);

// ========================================
// TEMPLATE
// ========================================
const template = () => `
  <div class="connectivity-card">
    <div class="card-title">Connectivity</div>
    <table class="st">
      <tr><td>IP Address</td><td class="cc-ip">---</td></tr>
      <tr><td>SSID</td><td class="cc-ssid">---</td></tr>
      <tr><td>MAC Address</td><td class="cc-mac">---</td></tr>
      <tr><td>Uptime</td><td class="cc-up">---</td></tr>
    </table>
  </div>
`;

// ========================================
// COMPONENT
// ========================================
export default component({
  tag: 'connectivity-card',
  render: template,
  onMount(ctx, el) {
    const ipEl = el.querySelector('.cc-ip');
    const ssidEl = el.querySelector('.cc-ssid');
    const macEl = el.querySelector('.cc-mac');
    const upEl = el.querySelector('.cc-up');

    function update() {
      ipEl.textContent = es(gkey.ip) || '---';
      ssidEl.textContent = es(gkey.ssid) || '---';
      macEl.textContent = es(gkey.mac) || '---';
      upEl.textContent = fmtUp(ev(gkey.uptime));
    }

    subscribe(gkey.ip, update);
    subscribe(gkey.ssid, update);
    subscribe(gkey.mac, update);
    subscribe(gkey.uptime, update);
    update();
  }
});