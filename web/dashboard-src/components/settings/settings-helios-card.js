import { component, subscribe } from '../../core/component.js';
import { injectStyle } from '../../core/style.js';
import { es, ev, isEntityOn, setEntity } from '../../core/store.js';
import { setGlobalSelect, setGlobalNumber, postSet } from '../../core/api.js';
import { gkey } from '../../utils/keys.js';

// ========================================
// CSS
// ========================================
const css = `
.settings-helios-card {
  background: var(--panel-bg-vibrant);
  border: 1px solid var(--panel-border);
  border-radius: 18px;
  padding: 20px;
  box-shadow: var(--panel-shadow);
}

.settings-helios-card .card-title {
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

.settings-helios-card .helios-status-badge {
  font-size: .72rem;
  font-weight: 800;
  letter-spacing: .9px;
  text-transform: uppercase;
  padding: 3px 10px;
  border-radius: 8px;
  flex-shrink: 0;
}

.settings-helios-card .helios-status-badge.active {
  background: rgba(45,110,45,.36);
  color: #CBFFD0;
  border: 1px solid rgba(100,255,100,.35);
}

.settings-helios-card .helios-status-badge.degraded {
  background: rgba(110,90,20,.36);
  color: #FFE9A0;
  border: 1px solid rgba(255,200,50,.35);
}

.settings-helios-card .helios-status-badge.offline {
  background: rgba(70,70,70,.28);
  color: #ADADAD;
  border: 1px solid rgba(150,150,150,.25);
}

.settings-helios-card .cfg-row {
  display: grid;
  grid-template-columns: 1fr;
  gap: 6px;
  margin-bottom: 12px;
}

.settings-helios-card .lbl {
  color: var(--text-secondary);
  font-size: .78rem;
  font-weight: 700;
  letter-spacing: .45px;
  text-transform: uppercase;
  line-height: 1.2;
}

.settings-helios-card .inp {
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

.settings-helios-card .inp:focus {
  outline: 2px solid rgba(83,168,255,.6);
  outline-offset: 1px;
  border-color: rgba(83,168,255,.55);
}

.settings-helios-card .row-2col {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
  margin-bottom: 12px;
  align-items: start;
}

.settings-helios-card .row-2col .cfg-row {
  margin-bottom: 0;
}

.settings-helios-card .enable-row {
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

.settings-helios-card .enable-label {
  font-size: .88rem;
  font-weight: 700;
  color: var(--text);
}

.settings-helios-card .enable-row.is-on {
  border-color: rgba(100,255,100,.4);
  background: rgba(45,110,45,.2);
}

.settings-helios-card .enable-toggle {
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

.settings-helios-card .enable-toggle::after {
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

.settings-helios-card .enable-row.is-on .enable-toggle {
  background: rgba(121, 209, 126, 0.25);
  border-color: rgba(121, 209, 126, 0.5);
}

.settings-helios-card .enable-row.is-on .enable-toggle::after {
  transform: translateX(22px);
  background: #0f213c;
}

.settings-helios-card .section-title {
  color: var(--text-secondary);
  font-size: .76rem;
  font-weight: 700;
  letter-spacing: .8px;
  text-transform: uppercase;
  margin: 16px 0 10px;
}

.settings-helios-card .note {
  color: var(--text-secondary);
  font-size: .75rem;
  margin-top: 4px;
  line-height: 1.4;
}

@media (max-width: 980px) {
  .settings-helios-card .row-2col {
    grid-template-columns: 1fr;
    gap: 10px;
  }

  .settings-helios-card .row-2col .cfg-row {
    margin-bottom: 0;
  }
}
`;

injectStyle('settings-helios-card', css);

// ========================================
// TEMPLATE
// ========================================
const template = () => `
  <div class="settings-helios-card">
    <div class="card-title">
      <span>Helios Integration</span>
      <span class="helios-status-badge offline">offline</span>
    </div>

    <div class="enable-row is-off">
      <span class="enable-label">Integration enabled</span>
      <div class="enable-toggle" role="switch" aria-label="Toggle Helios integration"></div>
    </div>

    <div class="section-title">Connection</div>
    <div class="cfg-row">
      <span class="lbl">Host</span>
      <input class="inp sh-host" type="text" placeholder="192.168.1.x or hostname" maxlength="63" />
    </div>
    <div class="row-2col">
      <div class="cfg-row">
        <span class="lbl">Port</span>
        <input class="inp sh-port" type="number" min="1" max="65535" step="1" placeholder="8080" />
      </div>
      <div class="cfg-row">
        <span class="lbl">Controller ID</span>
        <input class="inp sh-cid" type="text" maxlength="32" />
        <span class="note sh-cid-note">Leave blank to use device ID</span>
      </div>
    </div>

    <div class="section-title">Timing</div>
    <div class="row-2col">
      <div class="cfg-row">
        <span class="lbl">Poll interval (s)</span>
        <input class="inp sh-poll" type="number" min="5" max="3600" step="1" placeholder="30" />
      </div>
      <div class="cfg-row">
        <span class="lbl">Stale after (s)</span>
        <input class="inp sh-stale" type="number" min="10" max="86400" step="1" placeholder="600" />
        <span class="note">Clear Helios commands when no contact for this long</span>
      </div>
    </div>
  </div>
`;

// ========================================
// COMPONENT
// ========================================
export default component({
  tag: 'settings-helios-card',
  render: template,
  onMount(ctx, el) {
    const badge    = el.querySelector('.helios-status-badge');
    const enableRow = el.querySelector('.enable-row');
    const toggleBtn = el.querySelector('.enable-toggle');
    const hostEl   = el.querySelector('.sh-host');
    const portEl   = el.querySelector('.sh-port');
    const cidEl    = el.querySelector('.sh-cid');
    const cidNote  = el.querySelector('.sh-cid-note');
    const pollEl   = el.querySelector('.sh-poll');
    const staleEl  = el.querySelector('.sh-stale');

    // --- status badge ---
    function updateStatus() {
      const status = es(gkey.heliosStatus) || 'offline';
      badge.textContent = status;
      badge.className = 'helios-status-badge ' + status;
    }

    // --- enable toggle ---
    function updateEnable() {
      const on = isEntityOn(gkey.heliosEnabled);
      enableRow.classList.toggle('is-on', on);
      enableRow.classList.toggle('is-off', !on);
      toggleBtn.setAttribute('aria-checked', on ? 'true' : 'false');
    }

    toggleBtn.addEventListener('click', () => {
      const next = !isEntityOn(gkey.heliosEnabled);
      setEntity(gkey.heliosEnabled, { state: next ? 'on' : 'off' });
      setGlobalSelect('helios_enabled', next ? 'on' : 'off');
    });

    // --- config inputs: send immediately on blur/change ---
    hostEl.addEventListener('blur', () => {
      const v = hostEl.value.trim();
      setEntity(gkey.heliosHost, { state: v });
      postSet({ key: 'helios_host', value: v });
    });

    cidEl.addEventListener('blur', () => {
      const v = cidEl.value.trim();
      setEntity(gkey.heliosControllerId, { state: v });
      postSet({ key: 'helios_controller_id', value: v });
    });

    portEl.addEventListener('blur', () => {
      const v = parseInt(portEl.value, 10);
      if (v >= 1 && v <= 65535) {
        setEntity(gkey.heliosPort, { value: v });
        setGlobalNumber('helios_port', v);
      }
    });

    pollEl.addEventListener('blur', () => {
      const v = parseInt(pollEl.value, 10);
      if (v >= 5 && v <= 3600) {
        setEntity(gkey.heliosPollIntervalS, { value: v });
        setGlobalNumber('helios_poll_interval_s', v);
      }
    });

    staleEl.addEventListener('blur', () => {
      const v = parseInt(staleEl.value, 10);
      if (v >= 10 && v <= 86400) {
        setEntity(gkey.heliosStaleAfterS, { value: v });
        setGlobalNumber('helios_stale_after_s', v);
      }
    });

    // --- populate inputs from store ---
    function populateInputs() {
      const host   = es(gkey.heliosHost);
      const cid    = es(gkey.heliosControllerId);
      const devId  = es(gkey.heliosDeviceId) || 'heatvalve-6';
      const port   = ev(gkey.heliosPort);
      const poll   = ev(gkey.heliosPollIntervalS);
      const stale  = ev(gkey.heliosStaleAfterS);
      if (document.activeElement !== hostEl  && host  != null) hostEl.value  = host;
      if (document.activeElement !== cidEl) {
        if (cid != null) cidEl.value = cid;
        cidEl.placeholder = devId;
        cidNote.textContent = 'Leave blank to use device ID: ' + devId;
      }
      if (document.activeElement !== portEl  && port  != null) portEl.value  = port || 8080;
      if (document.activeElement !== pollEl  && poll  != null) pollEl.value  = poll || 30;
      if (document.activeElement !== staleEl && stale != null) staleEl.value = stale || 600;
    }

    subscribe(gkey.heliosStatus,        updateStatus);
    subscribe(gkey.heliosEnabled,       updateEnable);
    subscribe(gkey.heliosHost,          populateInputs);
    subscribe(gkey.heliosControllerId,  populateInputs);
    subscribe(gkey.heliosDeviceId,      populateInputs);
    subscribe(gkey.heliosPort,          populateInputs);
    subscribe(gkey.heliosPollIntervalS, populateInputs);
    subscribe(gkey.heliosStaleAfterS,   populateInputs);

    updateStatus();
    updateEnable();
    populateInputs();
  }
});
