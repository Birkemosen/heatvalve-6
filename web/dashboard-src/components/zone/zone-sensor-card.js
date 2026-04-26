import { component, subscribe } from '../../core/component.js';
import { injectStyle } from '../../core/style.js';
import { es, getDashboardValue, subscribeDashboard } from '../../core/store.js';
import { key, gkey } from '../../utils/keys.js';
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
      <div class="cfg-row zs-row-zigbee">
        <span class="lbl">MQTT Device</span>
        <input class="txt zs-zigbee" maxlength="47" placeholder="zone_x_sensor">
      </div>
      <div class="cfg-row zs-row-ble">
        <span class="lbl">BLE MAC</span>
        <input class="txt zs-ble" maxlength="17" placeholder="AA:BB:CC:DD:EE:FF">
      </div>
      <div class="cfg-row">
        <span class="lbl">Sync To Zone</span>
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

function getVariant() {
  const raw = String(es(gkey.deviceVariant) || '').toLowerCase();
  if (raw === 'mqtt') return 'mqtt';
  if (raw === 'ble') return 'ble';
  return 'local';
}

function getVariantSourceLabel(variant) {
  if (variant === 'mqtt') return 'MQTT';
  if (variant === 'ble') return 'BLE';
  return 'Local Probe';
}

function sourceToUiValue(source, variant) {
  if (source === 'Local Probe') return 'Local Probe';
  if ((source === 'MQTT' || source === 'Zigbee MQTT' || source === 'MQTT Sensor' || source === 'MQTT Variant') && variant === 'mqtt') return 'MQTT';
  if ((source === 'BLE' || source === 'BLE Sensor' || source === 'BLE Variant') && variant === 'ble') return 'BLE';
  return 'Local Probe';
}

function uiValueToApiValue(value, variant) {
  if (value === 'Local Probe') return 'Local Probe';
  if (variant === 'mqtt') return 'MQTT';
  if (variant === 'ble') return 'BLE';
  return 'Local Probe';
}

function setSourceOptions(selectEl, variant, value) {
  const variantLabel = getVariantSourceLabel(variant);
  const html = variant === 'local'
    ? '<option>Local Probe</option>'
    : '<option>Local Probe</option><option>' + variantLabel + '</option>';
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
    const zigbeeEl = el.querySelector('.zs-zigbee');
    const bleEl = el.querySelector('.zs-ble');
    const syncEl = el.querySelector('.zs-sync');
    const rowZigbee = el.querySelector('.zs-row-zigbee');
    const rowBle = el.querySelector('.zs-row-ble');
    const autoDefaultApplied = new Set();
    let syncZone = 0;

    function selectedZone() {
      return getDashboardValue('selectedZone');
    }

    function update() {
      const zone = selectedZone();
      if (syncZone !== zone) {
        buildSyncOptions(syncEl, zone);
        syncZone = zone;
      }

      const probe = es(key.probe(zone));
      const variant = getVariant();
      const sourceRaw = String(es(key.tempSource(zone)) || '');
      const sourceUi = sourceToUiValue(sourceRaw, variant);
      const syncTo = es(key.syncTo(zone)) || 'None';
      const zigbee = es(key.zigbee(zone)) || '';
      const ble = es(key.ble(zone)) || '';

      if (probe) probeEl.value = probe;
      setSourceOptions(sourceEl, variant, sourceUi);
      syncEl.value = syncTo;
      if (document.activeElement !== zigbeeEl) zigbeeEl.value = zigbee;
      if (document.activeElement !== bleEl) bleEl.value = ble;
      rowZigbee.style.display = variant === 'mqtt' && sourceUi === 'MQTT' ? '' : 'none';
      rowBle.style.display = variant === 'ble' && sourceUi === 'BLE' ? '' : 'none';

      // One-time auto-default: if a zone still uses Local Probe, switch to the active firmware variant source.
      if (!autoDefaultApplied.has(zone) && variant !== 'local' && sourceRaw === 'Local Probe') {
        autoDefaultApplied.add(zone);
        setZoneSelect(zone, 'zone_temp_source', uiValueToApiValue(getVariantSourceLabel(variant), variant));
      }
    }

    function updateIfSelectedZone(id) {
      const zone = selectedZone();
      if (
        id === key.probe(zone) ||
        id === key.tempSource(zone) ||
        id === key.syncTo(zone) ||
        id === key.zigbee(zone) ||
        id === key.ble(zone) ||
        id === gkey.deviceVariant
      ) {
        update();
      }
    }

    probeEl.addEventListener('change', () => {
      setZoneSelect(selectedZone(), 'zone_probe', probeEl.value);
    });
    sourceEl.addEventListener('change', () => {
      const variant = getVariant();
      setZoneSelect(selectedZone(), 'zone_temp_source', uiValueToApiValue(sourceEl.value, variant));
    });
    syncEl.addEventListener('change', () => {
      setZoneSelect(selectedZone(), 'zone_sync_to', syncEl.value);
    });
    zigbeeEl.addEventListener('change', () => {
      setZoneText(selectedZone(), 'zone_zigbee_device', zigbeeEl.value);
    });
    bleEl.addEventListener('change', () => {
      setZoneText(selectedZone(), 'zone_ble_mac', bleEl.value);
    });

    subscribeDashboard('selectedZone', update);
    for (let zone = 1; zone <= 6; zone++) {
      subscribe(key.probe(zone), updateIfSelectedZone);
      subscribe(key.tempSource(zone), updateIfSelectedZone);
      subscribe(key.syncTo(zone), updateIfSelectedZone);
      subscribe(key.zigbee(zone), updateIfSelectedZone);
      subscribe(key.ble(zone), updateIfSelectedZone);
    }
    subscribe(gkey.deviceVariant, update);
    update();
  }
});
