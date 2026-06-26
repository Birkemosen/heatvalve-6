import { component, subscribe } from '../../core/component.js';
import { injectStyle } from '../../core/style.js';
import { es, ev } from '../../core/store.js';
import { gkey } from '../../utils/keys.js';
import { localize, subscribeLanguage, t } from '../../core/i18n.js';

const css = `
.asgard-bridge-status-card .bridge-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 10px;
}
.asgard-bridge-status-card .role-badge {
  font-size: .72rem;
  font-weight: 800;
  letter-spacing: .9px;
  text-transform: uppercase;
  padding: 3px 10px;
  border-radius: 8px;
  flex-shrink: 0;
}
.asgard-bridge-status-card .role-badge.master {
  background: rgba(45,110,45,.36);
  color: #CBFFD0;
  border: 1px solid rgba(100,255,100,.35);
}
.asgard-bridge-status-card .role-badge.slave {
  background: rgba(70,70,70,.28);
  color: #ADADAD;
  border: 1px solid rgba(150,150,150,.25);
}
.asgard-bridge-status-card .setpoint-box {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 12px 14px;
  border: 1px solid var(--control-border);
  border-radius: 12px;
  background: var(--control-bg);
  margin-bottom: 12px;
}
.asgard-bridge-status-card .setpoint-val {
  font-size: 1.6rem;
  font-weight: 800;
  letter-spacing: .3px;
  color: var(--accent);
  line-height: 1;
  font-family: var(--mono);
}
.asgard-bridge-status-card .status-grid {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  gap: 6px 14px;
  font-size: .82rem;
  color: var(--text-secondary);
}
.asgard-bridge-status-card .status-grid .val {
  color: var(--text);
  font-weight: 600;
  min-width: 0;
}
.asgard-bridge-status-card .status-grid .val.warn { color: #FFE9A0; }
`;

injectStyle('asgard-bridge-status-card', css);

const template = () => `
  <div class="ui-card asgard-bridge-status-card">
    <div class="bridge-head">
      <div class="ui-card-title" data-i18n="diagnostics.asgard.title">Bridge Status</div>
      <span class="role-badge slave">slave</span>
    </div>
    <div class="setpoint-box">
      <span class="setpoint-val ab-setpoint">—</span>
      <span class="ui-note" data-i18n="diagnostics.asgard.setpointNote">Recommended virtual thermostat setpoint, derived from enabled zone targets.</span>
    </div>
    <div class="status-grid">
      <span data-i18n="diagnostics.asgard.peer">Peer</span><span class="val ab-peer">n/a</span>
      <span data-i18n="diagnostics.asgard.lastPush">Last push</span><span class="val ab-push">—</span>
      <span data-i18n="diagnostics.asgard.zonesWeighted">Zones weighted</span><span class="val ab-zones">—</span>
      <span data-i18n="diagnostics.asgard.lastError">Last error</span><span class="val ab-error">—</span>
    </div>
  </div>
`;

export default component({
  tag: 'asgard-bridge-status-card',
  render: template,
  onMount(ctx, el) {
    const badge = el.querySelector('.role-badge');
    const peerEl = el.querySelector('.ab-peer');
    const pushEl = el.querySelector('.ab-push');
    const setpointEl = el.querySelector('.ab-setpoint');
    const zonesEl = el.querySelector('.ab-zones');
    const errorEl = el.querySelector('.ab-error');

    function update() {
      const role = es(gkey.asgardRole) || 'slave';
      badge.textContent = role;
      badge.className = 'role-badge ' + (role === 'master' ? 'master' : 'slave');

      const peer = es(gkey.asgardPeerStatus) || t('common.na');
      peerEl.textContent = peer;
      peerEl.classList.toggle('warn', peer === 'stale' || peer === 'unreachable');

      const pushC = ev(gkey.asgardLastPushC);
      const age = ev(gkey.asgardLastPushAgeS);
      if (pushC != null && Number.isFinite(pushC) && age != null) {
        const ageStr = age < 120
          ? t('diagnostics.asgard.ageSeconds', { value: Math.round(age) })
          : t('diagnostics.asgard.ageMinutes', { value: Math.round(age / 60) });
        pushEl.textContent = `${pushC.toFixed(2)}°C (${ageStr})`;
      } else {
        pushEl.textContent = '—';
      }

      const setpointC = ev(gkey.asgardSetpointC);
      setpointEl.textContent = (setpointC != null && Number.isFinite(setpointC))
        ? `${setpointC.toFixed(1)}°C`
        : '—';

      const local = ev(gkey.asgardLocalZones);
      const remote = ev(gkey.asgardPeerZones);
      zonesEl.textContent = (local != null) ? `${local} ${t('common.local')} + ${remote || 0} ${t('common.peer')}` : '—';

      const err = es(gkey.asgardLastError);
      errorEl.textContent = err || '—';
      errorEl.classList.toggle('warn', !!err);
    }

    [
      gkey.asgardRole,
      gkey.asgardPeerStatus,
      gkey.asgardLastPushC,
      gkey.asgardSetpointC,
      gkey.asgardLastPushAgeS,
      gkey.asgardLocalZones,
      gkey.asgardPeerZones,
      gkey.asgardLastError
    ].forEach((k) => subscribe(k, update));
    subscribeLanguage(() => { localize(el); update(); });
    localize(el);
    update();
  }
});
