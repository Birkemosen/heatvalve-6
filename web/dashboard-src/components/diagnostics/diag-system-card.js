import { component, subscribe } from '../../core/component.js';
import { injectStyle } from '../../core/style.js';
import { ev } from '../../core/store.js';
import { dumpTaskStats } from '../../core/api.js';
import { gkey } from '../../utils/keys.js';

// ========================================
// CSS — mirrors the manifold card's stat-grid language
// ========================================
const css = `
.diag-system-card .sys-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px 20px;
  margin-top: 4px;
}
.diag-system-card .sys-cell { display: flex; flex-direction: column; gap: 4px; }
.diag-system-card .sys-label {
  color: var(--text-secondary); font-size: .64rem; font-weight: 700;
  text-transform: uppercase; letter-spacing: 1px;
}
.diag-system-card .sys-value {
  font-family: var(--mono); font-size: 1.5rem; font-weight: 800;
  color: var(--text-strong); line-height: 1;
}
.diag-system-card .sys-value.warn { color: #FFB4B4; }
.diag-system-card .sys-bar {
  height: 4px; border-radius: 3px; margin-top: 6px;
  background: var(--control-bg-hover); overflow: hidden;
}
.diag-system-card .sys-bar > i {
  display: block; height: 100%; width: 0%;
  background: linear-gradient(90deg, #6FCF97, #F2C94C, #EB5757);
  background-size: 300% 100%; background-position: 0% 0;
  transition: width .4s ease;
}
.diag-system-card .sys-dump { width: 100%; margin-top: 14px; }
`;

injectStyle('diag-system-card', css);

// ========================================
// TEMPLATE
// ========================================
const template = () => `
  <div class="ui-card diag-system-card">
    <div class="ui-card-title"><span>System</span></div>
    <div class="sys-grid">
      <div class="sys-cell">
        <div class="sys-label">CPU Core 0</div>
        <div class="sys-value" data-k="cpu0">—</div>
        <div class="sys-bar"><i data-bar="cpu0"></i></div>
      </div>
      <div class="sys-cell">
        <div class="sys-label">CPU Core 1</div>
        <div class="sys-value" data-k="cpu1">—</div>
        <div class="sys-bar"><i data-bar="cpu1"></i></div>
      </div>
      <div class="sys-cell">
        <div class="sys-label">Free Heap (int)</div>
        <div class="sys-value" data-k="heap">—</div>
      </div>
      <div class="sys-cell">
        <div class="sys-label">Free PSRAM</div>
        <div class="sys-value" data-k="psram">—</div>
      </div>
    </div>
    <button class="ui-btn sys-dump" type="button">Dump task stats to log</button>
    <div class="ui-note">Per-core load is sampled every 2&nbsp;s. "Dump task stats" logs every task's CPU% and stack headroom to the device log above — use it to find what saturates a core.</div>
  </div>
`;

// ========================================
// COMPONENT
// ========================================
export default component({
  tag: 'diag-system-card',
  render: template,
  onMount(ctx, el) {
    const cpu0El = el.querySelector('[data-k="cpu0"]');
    const cpu1El = el.querySelector('[data-k="cpu1"]');
    const heapEl = el.querySelector('[data-k="heap"]');
    const psramEl = el.querySelector('[data-k="psram"]');
    const bar0 = el.querySelector('[data-bar="cpu0"]');
    const bar1 = el.querySelector('[data-bar="cpu1"]');

    const setCpu = (valEl, barEl, v) => {
      if (v == null || !Number.isFinite(Number(v))) {
        valEl.textContent = '—';
        valEl.classList.remove('warn');
        barEl.style.width = '0%';
        return;
      }
      const pct = Math.max(0, Math.min(100, Number(v)));
      valEl.textContent = pct.toFixed(0) + '%';
      valEl.classList.toggle('warn', pct >= 90);
      barEl.style.width = pct + '%';
      // Shift the gradient so the bar reddens as load climbs.
      barEl.style.backgroundPosition = pct + '% 0';
    };
    const setKb = (valEl, v, warnBelow) => {
      if (v == null || !Number.isFinite(Number(v))) { valEl.textContent = '—'; return; }
      const kb = Number(v);
      valEl.textContent = kb + ' KB';
      valEl.classList.toggle('warn', warnBelow != null && kb < warnBelow);
    };

    const update = () => {
      setCpu(cpu0El, bar0, ev(gkey.cpuLoadCore0));
      setCpu(cpu1El, bar1, ev(gkey.cpuLoadCore1));
      setKb(heapEl, ev(gkey.freeInternalKb), 48);   // < 48 KB internal = forecast guard floor
      setKb(psramEl, ev(gkey.freePsramKb), null);
    };

    el.querySelector('.sys-dump').addEventListener('click', () => {
      dumpTaskStats().catch((err) => console.error('[System] dump failed:', err));
    });

    subscribe(gkey.cpuLoadCore0, update);
    subscribe(gkey.cpuLoadCore1, update);
    subscribe(gkey.freeInternalKb, update);
    subscribe(gkey.freePsramKb, update);
    update();
  }
});
