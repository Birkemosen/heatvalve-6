import { component, subscribe } from '../../core/component.js';
import { injectStyle } from '../../core/style.js';
import { es, ev, isEntityOn, setEntity } from '../../core/store.js';
import { setGlobalSelect, setGlobalNumber, setGlobalText } from '../../core/api.js';
import { gkey } from '../../utils/keys.js';

// ========================================
// CSS — reuses the helios card visual language
// ========================================
const css = `
.settings-asgard-card {
  background: var(--panel-bg-vibrant);
  border: 1px solid var(--panel-border);
  border-radius: 18px;
  padding: 20px;
  box-shadow: var(--panel-shadow);
}

.settings-asgard-card .card-title {
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

.settings-asgard-card .asgard-role-badge {
  font-size: .72rem;
  font-weight: 800;
  letter-spacing: .9px;
  text-transform: uppercase;
  padding: 3px 10px;
  border-radius: 8px;
  flex-shrink: 0;
}

.settings-asgard-card .asgard-role-badge.master {
  background: rgba(45,110,45,.36);
  color: #CBFFD0;
  border: 1px solid rgba(100,255,100,.35);
}

.settings-asgard-card .asgard-role-badge.slave {
  background: rgba(70,70,70,.28);
  color: #ADADAD;
  border: 1px solid rgba(150,150,150,.25);
}

.settings-asgard-card .cfg-row {
  display: grid;
  grid-template-columns: 1fr;
  gap: 6px;
  margin-bottom: 12px;
}

.settings-asgard-card .lbl {
  color: var(--text-secondary);
  font-size: .78rem;
  font-weight: 700;
  letter-spacing: .45px;
  text-transform: uppercase;
  line-height: 1.2;
}

.settings-asgard-card .inp {
  width: 100%;
  box-sizing: border-box;
  border: 1px solid var(--control-border);
  background: var(--control-bg);
  color: var(--text);
  border-radius: 10px;
  padding: 9px 10px;
  font-size: .88rem;
  transition: border-color .15s ease;
}

.settings-asgard-card .inp:focus {
  outline: 2px solid rgba(83,168,255,.6);
  outline-offset: 1px;
  border-color: rgba(83,168,255,.55);
}

.settings-asgard-card .row-2col {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
  margin-bottom: 12px;
  align-items: start;
}

.settings-asgard-card .row-2col .cfg-row {
  margin-bottom: 0;
}

.settings-asgard-card .enable-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 14px;
  padding: 10px 14px;
  border: 1px solid var(--control-border);
  border-radius: 12px;
  background: var(--control-bg);
}

.settings-asgard-card .enable-label {
  font-size: .88rem;
  font-weight: 700;
  color: var(--text);
}

.settings-asgard-card .enable-row.is-on {
  border-color: rgba(100,255,100,.4);
  background: rgba(45,110,45,.2);
}

.settings-asgard-card .enable-toggle {
  width: 48px;
  height: 26px;
  border-radius: 999px;
  background: var(--control-bg-hover);
  position: relative;
  cursor: pointer;
  border: 1px solid var(--control-border);
  transition: background .2s ease, border-color .2s ease;
  flex-shrink: 0;
}

.settings-asgard-card .enable-toggle::after {
  content: '';
  position: absolute;
  top: 3px;
  left: 3px;
  width: 18px;
  height: 18px;
  background: #dbe8ff;
  border-radius: 999px;
  transition: transform .2s ease;
}

.settings-asgard-card .enable-row.is-on .enable-toggle {
  background: rgba(121, 209, 126, 0.25);
  border-color: rgba(121, 209, 126, 0.5);
}

.settings-asgard-card .enable-row.is-on .enable-toggle::after {
  transform: translateX(22px);
  background: #0f213c;
}

.settings-asgard-card .section-title {
  color: var(--text-secondary);
  font-size: .76rem;
  font-weight: 700;
  letter-spacing: .8px;
  text-transform: uppercase;
  margin: 16px 0 10px;
}

.settings-asgard-card .note {
  color: var(--text-secondary);
  font-size: .75rem;
  margin-top: 4px;
  line-height: 1.4;
}

.settings-asgard-card .setpoint-box {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 12px 14px;
  border: 1px solid var(--control-border);
  border-radius: 12px;
  background: var(--control-bg);
}

.settings-asgard-card .setpoint-box .note {
  margin-top: 0;
}

.settings-asgard-card .setpoint-val {
  font-size: 1.6rem;
  font-weight: 800;
  letter-spacing: .3px;
  color: var(--accent);
  line-height: 1;
}

.settings-asgard-card .status-grid {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 4px 14px;
  font-size: .82rem;
  color: var(--text-secondary);
}

.settings-asgard-card .status-grid .val {
  color: var(--text);
  font-weight: 600;
}

.settings-asgard-card .status-grid .val.warn {
  color: #FFE9A0;
}

@media (max-width: 980px) {
  .settings-asgard-card .row-2col {
    grid-template-columns: 1fr;
    gap: 10px;
  }

  .settings-asgard-card .row-2col .cfg-row {
    margin-bottom: 0;
  }
}
`;

injectStyle('settings-asgard-card', css);

// ========================================
// TEMPLATE
// ========================================
const template = () => `
  <div class="settings-asgard-card">
    <div class="card-title">
      <span>Asgard / Ecodan Bridge</span>
      <span class="asgard-role-badge slave">slave</span>
    </div>

    <div class="enable-row is-off">
      <span class="enable-label">Bridge enabled</span>
      <div class="enable-toggle sa-enable" role="switch" aria-label="Toggle Asgard bridge"></div>
    </div>

    <div class="enable-row is-off">
      <span class="enable-label">Coordinator (pushes to Asgard)</span>
      <div class="enable-toggle sa-coord" role="switch" aria-label="Toggle coordinator role"></div>
    </div>

    <div class="section-title">Asgard</div>
    <div class="row-2col">
      <div class="cfg-row">
        <span class="lbl">Host</span>
        <input class="inp sa-host" type="text" placeholder="ecodan-heatpump.local" maxlength="63" />
      </div>
      <div class="cfg-row">
        <span class="lbl">Port</span>
        <input class="inp sa-port" type="number" min="1" max="65535" step="1" placeholder="80" />
      </div>
    </div>
    <div class="cfg-row">
      <span class="lbl">Number entity</span>
      <input class="inp sa-entity" type="text" maxlength="47" placeholder="virtual_thermostat_input_z1" />
      <span class="note">Asgard REST object_id receiving the weighted house temperature</span>
    </div>

    <div class="section-title">Peer board</div>
    <div class="row-2col">
      <div class="cfg-row">
        <span class="lbl">Peer host</span>
        <input class="inp sa-peer" type="text" placeholder="empty = single board" maxlength="63" />
      </div>
      <div class="cfg-row">
        <span class="lbl">Push interval (s)</span>
        <input class="inp sa-interval" type="number" min="5" max="3600" step="1" placeholder="30" />
      </div>
    </div>

    <div class="section-title">Recommended setpoint</div>
    <div class="setpoint-box">
      <span class="setpoint-val sa-st-setpoint">—</span>
      <span class="note">Fixed value to set as the virtual thermostat setpoint in Asgard — the area-weighted target of all enabled zones (derived from static zone settings, not live status).</span>
    </div>

    <div class="section-title">Status</div>
    <div class="status-grid">
      <span>Peer</span><span class="val sa-st-peer">n/a</span>
      <span>Last push</span><span class="val sa-st-push">—</span>
      <span>Zones weighted</span><span class="val sa-st-zones">—</span>
      <span>Last error</span><span class="val sa-st-err">—</span>
    </div>
  </div>
`;

// ========================================
// COMPONENT
// ========================================
export default component({
  tag: 'settings-asgard-card',
  render: template,
  onMount(ctx, el) {
    const badge     = el.querySelector('.asgard-role-badge');
    const enableRow = el.querySelector('.sa-enable').closest('.enable-row');
    const coordRow  = el.querySelector('.sa-coord').closest('.enable-row');
    const enableBtn = el.querySelector('.sa-enable');
    const coordBtn  = el.querySelector('.sa-coord');
    const hostEl    = el.querySelector('.sa-host');
    const portEl    = el.querySelector('.sa-port');
    const entityEl  = el.querySelector('.sa-entity');
    const peerEl    = el.querySelector('.sa-peer');
    const intervalEl = el.querySelector('.sa-interval');
    const stPeer    = el.querySelector('.sa-st-peer');
    const stPush    = el.querySelector('.sa-st-push');
    const stSetpoint = el.querySelector('.sa-st-setpoint');
    const stZones   = el.querySelector('.sa-st-zones');
    const stErr     = el.querySelector('.sa-st-err');

    function bindToggle(btn, row, key, settingKey, label) {
      btn.addEventListener('click', () => {
        const current = isEntityOn(key);
        const nextState = current ? 'off' : 'on';
        setEntity(key, { state: nextState });
        setGlobalSelect(settingKey, nextState)
          .catch(err => {
            console.error(`[Asgard] Failed to update ${label}:`, err);
            setEntity(key, { state: current ? 'on' : 'off' });
          });
      });
      return () => {
        const on = isEntityOn(key);
        row.classList.toggle('is-on', on);
        row.classList.toggle('is-off', !on);
        btn.setAttribute('aria-checked', on ? 'true' : 'false');
      };
    }

    const updateEnable = bindToggle(enableBtn, enableRow, gkey.asgardEnabled, 'asgard_enabled', 'enabled');
    const updateCoord  = bindToggle(coordBtn, coordRow, gkey.asgardCoordinator, 'asgard_coordinator', 'coordinator');

    function bindText(input, key, settingKey) {
      input.addEventListener('blur', () => {
        const v = input.value.trim();
        setEntity(key, { state: v });
        setGlobalText(settingKey, v)
          .catch(err => console.error(`[Asgard] Failed to update ${settingKey}:`, err));
      });
    }

    bindText(hostEl, gkey.asgardHost, 'asgard_host');
    bindText(entityEl, gkey.asgardEntityName, 'asgard_entity_name');
    bindText(peerEl, gkey.asgardPeerHost, 'asgard_peer_host');

    portEl.addEventListener('blur', () => {
      const v = parseInt(portEl.value, 10);
      if (v >= 1 && v <= 65535) {
        setEntity(gkey.asgardPort, { value: v });
        setGlobalNumber('asgard_port', v)
          .catch(err => console.error('[Asgard] Failed to update port:', err));
      }
    });

    intervalEl.addEventListener('blur', () => {
      const v = parseInt(intervalEl.value, 10);
      if (v >= 5 && v <= 3600) {
        setEntity(gkey.asgardPushIntervalS, { value: v });
        setGlobalNumber('asgard_push_interval_s', v)
          .catch(err => console.error('[Asgard] Failed to update push_interval_s:', err));
      }
    });

    function updateStatus() {
      const role = es(gkey.asgardRole) || 'slave';
      badge.textContent = role;
      badge.className = 'asgard-role-badge ' + (role === 'master' ? 'master' : 'slave');

      const peer = es(gkey.asgardPeerStatus) || 'n/a';
      stPeer.textContent = peer;
      stPeer.classList.toggle('warn', peer === 'stale' || peer === 'unreachable');

      const pushC = ev(gkey.asgardLastPushC);
      const age = ev(gkey.asgardLastPushAgeS);
      if (pushC != null && Number.isFinite(pushC) && age != null) {
        const ageStr = age < 120 ? `${Math.round(age)}s ago` : `${Math.round(age / 60)}m ago`;
        stPush.textContent = `${pushC.toFixed(2)}°C (${ageStr})`;
      } else {
        stPush.textContent = '—';
      }

      const setpointC = ev(gkey.asgardSetpointC);
      stSetpoint.textContent = (setpointC != null && Number.isFinite(setpointC))
        ? `${setpointC.toFixed(1)}°C`
        : '—';

      const local = ev(gkey.asgardLocalZones);
      const remote = ev(gkey.asgardPeerZones);
      stZones.textContent = (local != null) ? `${local} local + ${remote || 0} peer` : '—';

      const err = es(gkey.asgardLastError);
      stErr.textContent = err || '—';
      stErr.classList.toggle('warn', !!err);
    }

    function populateInputs() {
      const host = es(gkey.asgardHost);
      const entity = es(gkey.asgardEntityName);
      const peer = es(gkey.asgardPeerHost);
      const port = ev(gkey.asgardPort);
      const interval = ev(gkey.asgardPushIntervalS);
      if (document.activeElement !== hostEl && host != null) hostEl.value = host;
      if (document.activeElement !== entityEl && entity != null) entityEl.value = entity;
      if (document.activeElement !== peerEl && peer != null) peerEl.value = peer;
      if (document.activeElement !== portEl && port != null) portEl.value = port || 80;
      if (document.activeElement !== intervalEl && interval != null) intervalEl.value = interval || 30;
    }

    subscribe(gkey.asgardEnabled,       updateEnable);
    subscribe(gkey.asgardCoordinator,   updateCoord);
    subscribe(gkey.asgardRole,          updateStatus);
    subscribe(gkey.asgardPeerStatus,    updateStatus);
    subscribe(gkey.asgardLastPushC,     updateStatus);
    subscribe(gkey.asgardSetpointC,     updateStatus);
    subscribe(gkey.asgardLastPushAgeS,  updateStatus);
    subscribe(gkey.asgardLocalZones,    updateStatus);
    subscribe(gkey.asgardPeerZones,     updateStatus);
    subscribe(gkey.asgardLastError,     updateStatus);
    subscribe(gkey.asgardHost,          populateInputs);
    subscribe(gkey.asgardEntityName,    populateInputs);
    subscribe(gkey.asgardPeerHost,      populateInputs);
    subscribe(gkey.asgardPort,          populateInputs);
    subscribe(gkey.asgardPushIntervalS, populateInputs);

    updateEnable();
    updateCoord();
    updateStatus();
    populateInputs();
  }
});
