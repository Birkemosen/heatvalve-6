import { component, subscribe } from '../../core/component.js';
import { injectStyle } from '../../core/style.js';
import { cardForm } from '../../core/ui-kit.js';
import { es, getDashboardValue, subscribeDashboard, zoneLabel } from '../../core/store.js';
import { key } from '../../utils/keys.js';
import { setZoneSelect, setZoneText } from '../../core/api.js';
import { localize, subscribeLanguage, t } from '../../core/i18n.js';

// ========================================
// CSS
// ========================================
const css = `
.zone-sensor-card { height: 100%; }

.zone-sensor-card .ble-row {
  display: flex;
  gap: 6px;
  align-items: center;
  margin-top: 8px;
}
.zone-sensor-card .ble-row .ble-input {
  flex: 1;
  min-width: 0;
  border: 1px solid var(--control-border);
  background: var(--control-bg);
  color: var(--text);
  border-radius: 10px;
  padding: 9px 10px;
  font-size: .88rem;
  font-family: var(--mono);
  transition: border-color .15s ease;
}
.zone-sensor-card .ble-row .ble-input:focus {
  outline: 2px solid rgba(124,155,208,.6);
  outline-offset: 1px;
  border-color: rgba(124,155,208,.55);
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
  background: rgba(124,155,208,.12);
}
.zone-sensor-card .scan-msg {
  padding: 8px 10px;
  font-size: .8rem;
  color: var(--text-secondary);
  font-style: italic;
}
.zone-sensor-card .merge-visual {
  margin-top: 12px;
  padding: 12px;
  border: 1px solid rgba(255,133,49,.24);
  border-radius: 12px;
  background: rgba(255,133,49,.08);
}
.zone-sensor-card .merge-visual.is-solo {
  border-color: var(--panel-border);
  background: rgba(124,155,208,.07);
}
.zone-sensor-card .merge-rail {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
}
.zone-sensor-card .merge-pill {
  min-width: 0;
  padding: 8px 10px;
  border: 1px solid rgba(255,255,255,.14);
  border-radius: 10px;
  color: var(--text-strong);
  font-size: .82rem;
  font-weight: 800;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  background: rgba(0,32,46,.34);
}
.zone-sensor-card .merge-pill.secondary {
  border-color: rgba(138,80,143,.42);
}
.zone-sensor-card .merge-pill.primary {
  border-color: rgba(255,133,49,.52);
  color: var(--accent);
}
.zone-sensor-card .merge-link {
  width: 22px;
  height: 2px;
  flex: 0 0 22px;
  background: var(--accent);
  border-radius: 999px;
  position: relative;
  opacity: .9;
}
.zone-sensor-card .merge-link::before,
.zone-sensor-card .merge-link::after {
  content: '';
  position: absolute;
  top: -4px;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--accent);
  box-shadow: 0 0 12px rgba(255,133,49,.5);
}
.zone-sensor-card .merge-link::before { left: -1px; }
.zone-sensor-card .merge-link::after { right: -1px; }
.zone-sensor-card .merge-visual.is-solo .merge-link {
  background: rgba(120,146,200,.36);
}
.zone-sensor-card .merge-visual.is-solo .merge-link::before,
.zone-sensor-card .merge-visual.is-solo .merge-link::after {
  background: rgba(120,146,200,.42);
  box-shadow: none;
}
.zone-sensor-card .merge-caption {
  margin-top: 8px;
  color: var(--text-secondary);
  font-size: .74rem;
  line-height: 1.35;
}
`;

injectStyle('zone-sensor-card', css);

// ========================================
// TEMPLATE
// ========================================
const template = () => {
  let probeOptions = '<option value="None" data-i18n="common.none">None</option>';
  for (let probe = 1; probe <= 8; probe++) probeOptions += '<option value="Probe ' + probe + '">Probe ' + probe + '</option>';

  return `
    <div class="ui-card zone-sensor-card">
      <div class="ui-card-title" data-i18n="zone.sensor.title">Temperature Sensors / Connectivity</div>
      <div class="ui-row">
        <span class="ui-label" data-i18n="zone.sensor.returnSensor">Zone Return Temperature Sensor</span>
        <span class="ui-field"><select class="ui-select zs-probe">${probeOptions}</select></span>
      </div>
      <div class="ui-row">
        <span class="ui-label" data-i18n="zone.sensor.tempSource">Temperature Source</span>
        <span class="ui-field"><select class="ui-select zs-source"></select></span>
      </div>
      <div class="zs-row-ble">
        <div class="ui-section" data-i18n="zone.sensor.bleSensor">BLE Sensor</div>
        <div class="ui-note" data-i18n="zone.sensor.bleNote">Pair a nearby BTHome sensor (Shelly BLU H&T) or enter MAC manually.</div>
        <div class="ble-row">
          <input class="ble-input zs-ble" maxlength="17" placeholder="AA:BB:CC:DD:EE:FF">
          <button class="btn-scan zs-scan" data-i18n="zone.sensor.scan">Scan</button>
        </div>
        <div class="ble-scan-list zs-scan-list" style="display:none"></div>
      </div>
      <div class="ui-divider"></div>
      <div class="ui-row">
        <span class="ui-label"><span data-i18n="zone.sensor.mergeWith">Merge With Zone</span> <span class="ui-sublabel" data-i18n="zone.sensor.mergeHelp">merge into one room - mean temperature, valves open equally</span></span>
        <span class="ui-field"><select class="ui-select zs-sync"></select></span>
      </div>
      <div class="merge-visual is-solo" aria-live="polite">
        <div class="merge-rail"></div>
        <div class="merge-caption"></div>
      </div>
    </div>
  `;
};

function buildSyncOptions(selectEl, zone) {
  const current = selectEl.value;
  let html = '<option value="None" data-i18n="common.none">' + t('common.none') + '</option>';
  for (let z = 1; z <= 6; z++) {
    if (z === zone) continue;
    html += '<option value="Zone ' + z + '">' + t('common.zone') + ' ' + z + '</option>';
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
  const html =
    '<option value="Local Probe" data-i18n="zone.sensor.localProbe">' + t('zone.sensor.localProbe') + '</option>' +
    '<option value="BLE Sensor" data-i18n="zone.sensor.bleSource">' + t('zone.sensor.bleSource') + '</option>';
  if (selectEl.innerHTML !== html) {
    selectEl.innerHTML = html;
  }
  selectEl.value = value;
}

function zoneFromSyncValue(value) {
  const match = String(value || '').match(/\d+/);
  return match ? Number(match[0]) : 0;
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
    const mergeVisual = el.querySelector('.merge-visual');
    const mergeRail = el.querySelector('.merge-rail');
    const mergeCaption = el.querySelector('.merge-caption');
    let syncZone = 0;

    function selectedZone() {
      return getDashboardValue('selectedZone');
    }

    // BLE row visibility follows the *staged* source so picking "BLE Sensor"
    // reveals the field immediately, before Apply.
    function paintBleRow() {
      rowBle.style.display = sourceEl.value === 'BLE Sensor' ? '' : 'none';
    }

    function paintMergeVisual() {
      const zone = selectedZone();
      const target = zoneFromSyncValue(syncEl.value);
      const incoming = [];
      for (let z = 1; z <= 6; z++) {
        if (z !== zone && zoneFromSyncValue(es(key.syncTo(z))) === zone) incoming.push(z);
      }
      const follows = target > 0 && target !== zone;
      const grouped = follows || incoming.length > 0;
      mergeVisual.classList.toggle('is-solo', !grouped);
      if (!grouped) {
        mergeRail.innerHTML =
          '<span class="merge-pill primary">' + zoneLabel(zone) + '</span>' +
          '<span class="merge-link"></span>' +
          '<span class="merge-pill">' + t('zone.sensor.noMerge') + '</span>';
        mergeCaption.textContent = t('zone.sensor.soloCaption');
        return;
      }

      if (follows) {
        mergeRail.innerHTML =
          '<span class="merge-pill secondary">' + zoneLabel(zone) + '</span>' +
          '<span class="merge-link"></span>' +
          '<span class="merge-pill primary">' + zoneLabel(target) + '</span>';
        mergeCaption.textContent = t('zone.sensor.followsCaption', { zone: zoneLabel(zone), target: zoneLabel(target) });
        return;
      }

      let html = '<span class="merge-pill primary">' + zoneLabel(zone) + '</span>';
      for (const z of incoming) {
        html += '<span class="merge-link"></span><span class="merge-pill secondary">' + zoneLabel(z) + '</span>';
      }
      mergeRail.innerHTML = html;
      mergeCaption.textContent = t('zone.sensor.primaryCaption', {
        zone: zoneLabel(zone),
        zones: incoming.map(zoneLabel).join(', ')
      });
    }

    const form = cardForm(el);
    setSourceOptions(sourceEl, 'Local Probe');
    form.select(probeEl, { read: () => es(key.probe(selectedZone())) || undefined, commit: (v) => setZoneSelect(selectedZone(), 'zone_probe', v) });
    form.select(sourceEl, { read: () => sourceToUiValue(String(es(key.tempSource(selectedZone())) || '')), commit: (v) => setZoneSelect(selectedZone(), 'zone_temp_source', uiValueToApiValue(v)) });
    form.select(syncEl, { read: () => es(key.syncTo(selectedZone())) || 'None', commit: (v) => setZoneSelect(selectedZone(), 'zone_sync_to', v) });
    const bleField = form.text(bleEl, { read: () => es(key.ble(selectedZone())) || '', commit: (v) => setZoneText(selectedZone(), 'zone_ble_mac', v) });
    sourceEl.addEventListener('change', paintBleRow);
    syncEl.addEventListener('change', paintMergeVisual);

    function update() {
      const zone = selectedZone();
      if (syncZone !== zone) {
        buildSyncOptions(syncEl, zone);
        syncZone = zone;
        scanList.style.display = 'none';
        form.discard();   // drop staged edits from the previous zone
      } else {
        form.refresh();
      }
      paintBleRow();
      paintMergeVisual();
    }

    function updateIfSelectedZone(id) {
      const zone = selectedZone();
      if (
        id === key.probe(zone) ||
        id === key.tempSource(zone) ||
        id === key.syncTo(zone) ||
        id === key.ble(zone) ||
        /^select-zone_\d+_sync_to$/.test(id)
      ) {
        form.refresh();
        paintBleRow();
        paintMergeVisual();
      }
    }

    // BLE scan logic
    scanBtn.addEventListener('click', () => {
      if (scanBtn.disabled) return;
      scanBtn.disabled = true;
      scanBtn.textContent = '…';
      scanList.style.display = '';
      scanList.innerHTML = '<div class="scan-msg">' + t('zone.sensor.scanning') + '</div>';

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
          scanBtn.textContent = t('zone.sensor.scan');
          if (!data.ok || !data.sensors || data.sensors.length === 0) {
            scanList.innerHTML = '<div class="scan-msg">' + t('zone.sensor.noSensors') + '</div>';
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
            const age = s.age_s < 60
              ? t('common.secondsAgo', { value: s.age_s })
              : t('common.minutesAgo', { value: Math.round(s.age_s / 60) });
            let badge = '';
            if (mac === currentMac) badge = '<span class="ble-badge">' + t('zone.sensor.assignedThisZone') + '</span>';
            else if (s.zone > 0) badge = '<span class="ble-badge">' + t('zone.sensor.zoneBadge', { zone: s.zone }) + '</span>';
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
              <button class="btn-assign" data-mac="${mac}">${t('zone.sensor.assign')}</button>
            </div>`;
          }
          scanList.innerHTML = html;

          scanList.querySelectorAll('.btn-assign').forEach(btn => {
            btn.addEventListener('click', () => {
              bleEl.value = btn.dataset.mac;
              bleField.markDirty();   // staged — committed on Apply
              scanList.style.display = 'none';
            });
          });
        })
        .catch((err) => {
          clearTimeout(timeout);
          scanBtn.disabled = false;
          scanBtn.textContent = t('zone.sensor.scan');
          const msg = (err && err.name === 'AbortError')
            ? t('zone.sensor.scanTimeout')
            : t('zone.sensor.scanFailed');
          scanList.innerHTML = '<div class="scan-msg">' + msg + '</div>';
        });
    });

    subscribeDashboard('selectedZone', update);
    for (let zone = 1; zone <= 6; zone++) {
      subscribe(key.probe(zone), updateIfSelectedZone);
      subscribe(key.tempSource(zone), updateIfSelectedZone);
      subscribe(key.syncTo(zone), updateIfSelectedZone);
      subscribe(key.ble(zone), updateIfSelectedZone);
    }
    subscribeLanguage(() => {
      const sourceValue = sourceEl.value || 'Local Probe';
      const syncValue = syncEl.value || 'None';
      setSourceOptions(sourceEl, sourceValue);
      buildSyncOptions(syncEl, selectedZone());
      syncEl.value = syncValue;
      scanBtn.textContent = scanBtn.disabled ? scanBtn.textContent : t('zone.sensor.scan');
      localize(el);
      paintBleRow();
      paintMergeVisual();
    });
    localize(el);
    update();
  }
});
