import { component } from '../../core/component.js';
import { injectStyle } from '../../core/style.js';
import { getDeviceLog, clearDeviceLog, subscribeDashboard } from '../../core/store.js';
import { localize, subscribeLanguage, t } from '../../core/i18n.js';

// ========================================
// ESPHome log levels → label + color
// 1=ERROR 2=WARN 3=INFO 4=CONFIG 5=DEBUG 6=VERBOSE 7=VERY_VERBOSE
// ========================================
const LEVELS = {
  1: { label: 'E', color: '#ff6361' },
  2: { label: 'W', color: '#ffd380' },
  3: { label: 'I', color: '#79d17e' },
  4: { label: 'C', color: '#7aa7ce' },
  5: { label: 'D', color: 'rgba(214,228,255,.7)' },
  6: { label: 'V', color: 'rgba(214,228,255,.5)' },
  7: { label: 'VV', color: 'rgba(214,228,255,.4)' },
};

// ========================================
// CSS
// ========================================
const css = `
.logs-view {
  background: var(--panel-bg-vibrant);
  border: 1px solid var(--panel-border);
  border-radius: 18px;
  padding: 18px;
  box-shadow: var(--panel-shadow);
}

.logs-view .card-title {
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

.logs-view .actions { display: flex; gap: 6px; }
.logs-view .btn {
  border: 1px solid var(--control-border);
  background: var(--control-bg);
  color: var(--text-secondary);
  border-radius: 8px;
  padding: 4px 10px;
  font-size: .68rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: .6px;
  cursor: pointer;
}
.logs-view .btn:hover { color: var(--text-strong); background: var(--control-bg-hover); }
.logs-view .btn.on { color: var(--text-on-accent); border-color: var(--accent); background: var(--accent); }

.logs-stream {
  margin-top: 4px;
  height: 420px;
  overflow-y: auto;
  border-radius: 10px;
  background: rgba(8,18,34,.55);
  border: 1px solid var(--control-border);
  padding: 6px 0;
  font-family: var(--mono);
  scrollbar-width: thin;
  scrollbar-color: rgba(124,155,208,.25) transparent;
}
.logs-stream::-webkit-scrollbar { width: 6px; }
.logs-stream::-webkit-scrollbar-thumb { background: rgba(124,155,208,.25); border-radius: 999px; }

.logs-empty { color: var(--text-secondary); font-size: .78rem; text-align: center; padding: 24px; }

.log-line {
  display: grid;
  grid-template-columns: 20px 104px 1fr;
  gap: 8px;
  padding: 3px 12px;
  font-size: .84rem;
  line-height: 1.5;
  white-space: pre-wrap;
  word-break: break-word;
}
.log-line .lv { font-weight: 800; text-align: center; }
.log-line .tag { color: var(--accent); opacity: .85; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.log-line .msg { color: var(--text-strong); opacity: .92; }
`;

injectStyle('logs-view', css);

// ========================================
// TEMPLATE
// ========================================
const template = () => `
  <div class="logs-view">
    <div class="card-title">
      <span data-i18n="logs.deviceLogs">Device Logs</span>
      <div class="actions">
        <button class="btn pause-btn" type="button" data-i18n="logs.pause">Pause</button>
        <button class="btn clear-btn" type="button" data-i18n="logs.clear">Clear</button>
      </div>
    </div>
    <div class="logs-stream"></div>
  </div>
`;

function lineHtml(line) {
  const lvl = LEVELS[line.level] || { label: '?', color: 'var(--text-secondary)' };
  const tag = escapeHtml(line.tag || '');
  const msg = escapeHtml(line.msg || '');
  return '<div class="log-line">' +
    '<span class="lv" style="color:' + lvl.color + '">' + lvl.label + '</span>' +
    '<span class="tag">' + tag + '</span>' +
    '<span class="msg">' + msg + '</span></div>';
}

function escapeHtml(s) {
  return String(s).replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
}

// ========================================
// COMPONENT
// ========================================
export default component({
  tag: 'logs-view',
  render: template,
  onMount(ctx, el) {
    const streamEl = el.querySelector('.logs-stream');
    const pauseBtn = el.querySelector('.pause-btn');
    const clearBtn = el.querySelector('.clear-btn');
    let paused = false;

    function update() {
      if (paused) return;
      const items = getDeviceLog();
      if (!items || !items.length) {
        streamEl.innerHTML = '<div class="logs-empty">' + t('logs.waiting') + '</div>';
        return;
      }
      // Stick to the bottom only if the user is already near it.
      const atBottom = streamEl.scrollHeight - streamEl.scrollTop - streamEl.clientHeight < 40;
      streamEl.innerHTML = items.map(lineHtml).join('');
      if (atBottom) streamEl.scrollTop = streamEl.scrollHeight;
    }

    pauseBtn.addEventListener('click', () => {
      paused = !paused;
      pauseBtn.textContent = paused ? t('logs.resume') : t('logs.pause');
      pauseBtn.classList.toggle('on', paused);
      if (!paused) update();
    });

    clearBtn.addEventListener('click', () => {
      // Visual clear only — keeps the seq cursor so the stream resumes cleanly.
      clearDeviceLog();
    });

    subscribeDashboard('deviceLog', update);
    subscribeLanguage(() => {
      localize(el);
      pauseBtn.textContent = paused ? t('logs.resume') : t('logs.pause');
      update();
    });
    localize(el);
    update();
  }
});
