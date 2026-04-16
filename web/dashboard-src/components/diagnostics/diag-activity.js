import { component } from '../../core/component.js';
import { injectStyle } from '../../core/style.js';
import { getActivityLog, subscribeDashboard } from '../../core/store.js';

// ========================================
// CSS
// ========================================
const css = `
.diag-activity {
  background: var(--panel-bg-vibrant);
  border: 1px solid var(--panel-border);
  border-radius: 18px;
  padding: 18px;
  box-shadow: var(--panel-shadow);
}

.diag-activity .card-title {
  font-size: .84rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 1.1px;
  color: var(--accent);
  margin-bottom: 12px;
  padding-bottom: 10px;
  border-bottom: 1px solid var(--panel-border);
}

.diag-log {
  margin-top: 8px;
  max-height: 220px;
  overflow-y: auto;
  border-radius: 10px;
  background: var(--control-bg);
  border: 1px solid var(--control-border);
  padding: 4px 0;
  scrollbar-width: thin;
  scrollbar-color: rgba(83,168,255,.25) transparent;
}
.diag-log::-webkit-scrollbar { width: 5px; }
.diag-log::-webkit-scrollbar-thumb { background: rgba(83,168,255,.25); border-radius: 999px; }
.diag-log::-webkit-scrollbar-track { background: transparent; }

.diag-log-empty { color: var(--text-secondary); font-size: .78rem; text-align: center; padding: 16px; }
.diag-log-item { display: flex; gap: 8px; padding: 5px 10px; border-bottom: 1px solid rgba(255,255,255,.08); font-size: .78rem; line-height: 1.4; }
.diag-log-item:last-child { border-bottom: none; }
.diag-log-time { font-family: var(--mono); color: var(--accent); font-size: .7rem; white-space: nowrap; flex-shrink: 0; }
.diag-log-msg { color: var(--text-strong); opacity: .9; }
`;

injectStyle('diag-activity', css);

// ========================================
// TEMPLATE
// ========================================
const template = () => `
  <div class="diag-activity">
    <div class="card-title">General Activity / Log</div>
    <div class="diag-log"></div>
  </div>
`;

function renderLog(el, items) {
  if (!items || !items.length) {
    el.innerHTML = '<div class="diag-log-empty">No activity yet.</div>';
    return;
  }

  let html = '';
  for (let index = items.length - 1; index >= 0; index--) {
    html += '<div class="diag-log-item"><span class="diag-log-time">' +
      items[index].time +
      '</span><span class="diag-log-msg">' +
      items[index].msg +
      '</span></div>';
  }
  el.innerHTML = html;
}

// ========================================
// COMPONENT
// ========================================
export default component({
  tag: 'diag-activity',
  render: template,
  onMount(ctx, el) {
    const logEl = el.querySelector('.diag-log');

    function update() {
      renderLog(logEl, getActivityLog());
    }

    subscribeDashboard('activityLog', update);
    update();
  }
});