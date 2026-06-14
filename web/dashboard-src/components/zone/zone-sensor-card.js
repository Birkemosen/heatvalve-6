import { component, subscribe } from '../../core/component.js';
import { injectStyle } from '../../core/style.js';
import { es, getDashboardValue, subscribeDashboard } from '../../core/store.js';
import { key } from '../../utils/keys.js';
import { setZoneSelect, setZoneText } from '../../core/api.js';

// ========================================
// CSS
// ========================================
const css = `
.zone-sensor-card {
  background: var(--panel-bg-vibrant);
  border: 1px solid var(--panel-border);
  border-radius: 18px;
  padding: 20px;
  box-shadow: var(--panel-shadow);
  height: 100%;
  box-sizing: border-box;
}

.zone-sensor-card .card-title {
  font-size: .84rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 1.1px;
  color: var(--accent);
  margin-bottom: 12px;
  padding-bottom: 10px;
  border-bottom: 1px solid var(--panel-border);
}

.zone-sensor-card .cfg-row {
  display: grid;
  grid-template-columns: 1fr;
  gap: 6px;
  margin-bottom: 10px;
}

.zone-sensor-card .lbl {
  color: var(--text-secondary);
  font-size: .78rem;
  font-weight: 700;
  letter-spacing: .45px;
  text-transform: uppercase;
}

.zone-sensor-card .lbl-help {
  margin-top: -2px;
  color: var(--text-faint);
  font-size: .74rem;
  font-style: italic;
}

.zone-sensor-card .sel,
.zone-sensor-card .txt {
  width: 100%;
  border: 1px solid var(--control-border);
  background: var(--control-bg);
  color: var(--text);
  border-radius: 10px;
  padding: 9px 10px;
  font-size: .88rem;
  transition: border-color .15s ease;
}

.zone-sensor-card .sel:focus,
.zone-sensor-card .txt:focus {
  outline: 2px solid rgba(83,168,255,.6);
  outline-offset: 1px;
  border-color: rgba(83,168,255,.55);
}

.zone-sensor-card .ble-row {
  display: flex;
  gap: 6px;
  align-items: center;
}
.zone-sensor-card .ble-row .txt {
  flex: 1;
}
.zone-sensor-card .btn-scan {
  flex-shrink: 0;
  padding: 9px 13px;
  border-radius: 10px;
  border: 1px solid var(--control-border);
  background: var(--control-bg);
  color: var(--accent);
  font-size: .82rem;
  font-weight: 700;
  cursor: pointer;
  white-space: nowrap;
}
.zone-sensor-card .btn-scan:disabled {
  opacity: .5;
  cursor: default;
}
.zone-sensor-card .ble-scan-list {
  margin-top: 6px;
  border: 1px solid var(--panel-border);
  border-radius: 10px;
  overflow: hidden;
}
.zone-sensor-card .ble-scan-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 10px;
  font-size: .82rem;
  gap: 8px;
  border-bottom: 1px solid var(--panel-border);
}
.zone-sensor-card .ble-scan-item:last-child { border-bottom: none; }
.zone-sensor-card .ble-scan-item .ble-mac {
  font-family: monospace;
  color: var(--text);
  font-size: .8rem;
}
.zone-sensor-card .ble-scan-item .ble-meta {
  color: var(--text-secondary);
  font-size: .75rem;
}
.zone-sensor-card .ble-scan-item .ble-badge {
  color: var(--text-faint);
  font-size: .72rem;
  font-style: italic;
}
.zone-sensor-card .btn-assign {
  padding: 5px 11px;
  border-radius: 8px;
  border: 1px solid var(--accent);
  background: transparent;
  color: var(--accent);
  font-size: .78rem;
  font-weight: 700;
  cursor: pointer;
  white-space: nowrap;
}
.zone-sensor-card .btn-assign:hover {
  background: rgba(83,168,255,.12);
}
.zone-sensor-card .scan-msg {
  padding: 8px 10px;
  font-size: .8rem;
  color: var(--text-secondary);
  font-style: italic;
}
`;

injectStyle('zone-sensor-card', css);

// ========================================
// TEMPLATE
// ========================================
const template = () => {
  let probeOptions = '<option>None</option>';
  for (let probe = 1; probe <= 8; probe++) probeOptions += '<option>Probe ' + probe + '</option>';

  return `
    <div class="zone-sensor-card">
      <div class="card-title">Temperature Sensors / Connectivity</div>
      <div class="cfg-row">
        <span class="lbl">Zone Return Temperature Sensor</span>
        <select class="sel zs-probe">${probeOptions}</select>
      </div>
      <div class="cfg-row">
        <span class="lbl">Temperature Source</span>
        <select class="sel zs-source"></select>
      </div>
      <div class="cfg-row zs-row-ble">
        <span class="lbl">BLE Sensor</span>
        <span class="lbl-help">Pair a nearby BTHome sensor (Shelly BLU H&T) or enter MAC manually.</span>
        <div class="ble-row">
          <input class="txt zs-ble" maxlength="17" placeholder="AA:BB:CC:DD:EE:FF">
          <button class="btn-scan zs-scan">Scan</button>
        </div>
        <div class="ble-scan-list zs-scan-list" style="display:none"></div>
      </div>
      <div class="cfg-row">
        <span class="lbl">Sync To Zone</span>
        <span class="lbl-help">Mirror target and control state from another zone.</span>
        <select class="sel zs-sync"></select>
      </div>
    </div>
  `;
};

function buildSyncOptions(selectEl, zone) {
  const current = selectEl.value;
  let html = '<option>None</option>';
  for (let z = 1; z <= 6; z++) {
    if (z === zone) continue;
    html += '<option>Zone ' + z + '</option>';
  }
  selectEl.innerHTML = html;
  selectEl.value = current || 'None';
}

function sourceToUiValue(source) {
  if (source === 'BLE' || source === 'BLE Sensor') return 'BLE Sensor';
  return 'Local Probe';
}

function uiValueToApiValue(value) {
  if (value === 'BLE Sensor') return 'BLE';
  return 'Local Probe';
}

function setSourceOptions(selectEl, value) {
  const html = '<option>Local Probe</option><option>BLE Sensor</option>';
  if (selectEl.innerHTML !== html) {
    selectEl.innerHTML = html;
  }
  selectEl.value = value;
}

// ========================================
// COMPONENT
// ========================================
export default component({
  tag: 'zone-sensor-card',
  render: template,
  onMount(ctx, el) {
    const probeEl = el.querySelector('.zs-probe');
    const sourceEl = el.querySelector('.zs-source');
    const bleEl = el.querySelector('.zs-ble');
    const syncEl = el.querySelector('.zs-sync');
    const rowBle = el.querySelector('.zs-row-ble');
    const scanBtn = el.querySelector('.zs-scan');
    const scanList = el.querySelector('.zs-scan-list');
    let syncZone = 0;

    function selectedZone() {
      return getDashboardValue('selectedZone');
    }

    function update() {
      const zone = selectedZone();
      if (syncZone !== zone) {
        buildSyncOptions(syncEl, zone);
        syncZone = zone;
        scanList.style.display = 'none';
      }

      const probe = es(key.probe(zone));
      const sourceRaw = String(es(key.tempSource(zone)) || '');
      const sourceUi = sourceToUiValue(sourceRaw);
      const syncTo = es(key.syncTo(zone)) || 'None';
      const ble = es(key.ble(zone)) || '';

      if (probe) probeEl.value = probe;
      setSourceOptions(sourceEl, sourceUi);
      syncEl.value = syncTo;
      if (document.activeElement !== bleEl) bleEl.value = ble;
      rowBle.style.display = sourceUi === 'BLE Sensor' ? '' : 'none';
    }

    function updateIfSelectedZone(id) {
      const zone = selectedZone();
      if (
        id === key.probe(zone) ||
        id === key.tempSource(zone) ||
        id === key.syncTo(zone) ||
        id === key.ble(zone)
      ) {
        update();
      }
    }

    // BLE scan logic
    scanBtn.addEventListener('click', () => {
      if (scanBtn.disabled) return;
      scanBtn.disabled = true;
      scanBtn.textContent = '…';
      scanList.style.display = '';
      scanList.innerHTML = '<div class="scan-msg">Scanning…</div>';

      const ctrl = new AbortController();
      const timeout = setTimeout(() => ctrl.abort(), 8000);

      fetch('/api/hv6/v1/ble-scan', { cache: 'no-store', signal: ctrl.signal })
        .then(r => {
          if (!r.ok) throw new Error('HTTP ' + r.status);
          return r.json();
        })
        .then(data => {
          clearTimeout(timeout);
          scanBtn.disabled = false;
          scanBtn.textContent = 'Scan';
          if (!data.ok || !data.sensors || data.sensors.length === 0) {
            scanList.innerHTML = '<div class="scan-msg">No BTHome sensors found nearby. Make sure sensors have fresh batteries and are within range.</div>';
            return;
          }
          const zone = selectedZone();
          const currentMac = (es(key.ble(zone)) || '').toUpperCase();
          const esc = (str) => String(str).replace(/[&<>"']/g, (c) =>
            ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
          let html = '';
          for (const s of data.sensors) {
            const mac = s.mac.toUpperCase();
            const name = s.name ? esc(s.name) : '';
            const temp = s.temp_c != null ? s.temp_c.toFixed(1) + '°C' : '—';
            const rssi = s.rssi != null ? s.rssi + ' dBm' : '';
            const age = s.age_s < 60 ? s.age_s + 's ago' : Math.round(s.age_s / 60) + 'm ago';
            let badge = '';
            if (mac === currentMac) badge = '<span class="ble-badge">assigned to this zone</span>';
            else if (s.zone > 0) badge = '<span class="ble-badge">zone ' + s.zone + '</span>';
            // Name as primary line when known, MAC as secondary; MAC alone otherwise.
            const title = name
              ? `<div class="ble-mac">${name}</div><div class="ble-meta">${mac}</div>`
              : `<div class="ble-mac">${mac}</div>`;
            html += `<div class="ble-scan-item">
              <div>
                ${title}
                <div class="ble-meta">${temp} &nbsp;${rssi} &nbsp;${age}</div>
                ${badge}
              </div>
              <button class="btn-assign" data-mac="${mac}">Assign</button>
            </div>`;
          }
          scanList.innerHTML = html;

          scanList.querySelectorAll('.btn-assign').forEach(btn => {
            btn.addEventListener('click', () => {
              const mac = btn.dataset.mac;
              bleEl.value = mac;
              setZoneText(zone, 'zone_ble_mac', mac);
              scanList.style.display = 'none';
            });
          });
        })
        .catch((err) => {
          clearTimeout(timeout);
          scanBtn.disabled = false;
          scanBtn.textContent = 'Scan';
          const msg = (err && err.name === 'AbortError')
            ? 'Scan timed out — device busy or BLE not responding. Try again.'
            : 'Scan failed. Check device connectivity.';
          scanList.innerHTML = '<div class="scan-msg">' + msg + '</div>';
        });
    });

    probeEl.addEventListener('change', () => {
      setZoneSelect(selectedZone(), 'zone_probe', probeEl.value);
    });
    sourceEl.addEventListener('change', () => {
      setZoneSelect(selectedZone(), 'zone_temp_source', uiValueToApiValue(sourceEl.value));
    });
    syncEl.addEventListener('change', () => {
      setZoneSelect(selectedZone(), 'zone_sync_to', syncEl.value);
    });
    bleEl.addEventListener('change', () => {
      setZoneText(selectedZone(), 'zone_ble_mac', bleEl.value);
    });

    subscribeDashboard('selectedZone', update);
    for (let zone = 1; zone <= 6; zone++) {
      subscribe(key.probe(zone), updateIfSelectedZone);
      subscribe(key.tempSource(zone), updateIfSelectedZone);
      subscribe(key.syncTo(zone), updateIfSelectedZone);
      subscribe(key.ble(zone), updateIfSelectedZone);
    }
    update();
  }
});
