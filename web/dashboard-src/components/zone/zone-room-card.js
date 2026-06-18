import { component, subscribe } from '../../core/component.js';
import { injectStyle } from '../../core/style.js';
import { cardForm } from '../../core/ui-kit.js';
import { ev, es, getDashboardValue, setZoneName, subscribeDashboard, zoneTag } from '../../core/store.js';
import { key } from '../../utils/keys.js';
import { setZoneNumber, setZoneSelect, setZoneText } from '../../core/api.js';

// Mirror firmware default_wind_exposure(): wind exposure seeded from wall count.
const WIND_EXPOSURE_BY_WALLS = [0, 0.5, 0.7, 0.85, 1];
function seededWindExposure(wallCount) {
  return WIND_EXPOSURE_BY_WALLS[Math.min(wallCount, 4)];
}

// ========================================
// CSS
// ========================================
const css = `
.zone-room-card { height: 100%; }

.zone-room-card .wall-lbl-hint {
  font-size: .72rem;
  color: var(--text-faint);
  font-style: italic;
  margin: 2px 0 8px;
}
.zone-room-card .wall-lbl-hint::after { content: 'Select all that apply'; }

.zone-room-card .wall-btn-group {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 6px;
}

.zone-room-card .wall-btn {
  padding: 8px 4px;
  border: 1px solid var(--control-border);
  background: var(--control-bg);
  color: var(--text-secondary);
  border-radius: 8px;
  font-size: .79rem;
  font-weight: 700;
  letter-spacing: .3px;
  cursor: pointer;
  transition: background .12s ease, color .12s ease, border-color .12s ease, box-shadow .12s ease;
}

.zone-room-card .wall-btn:hover {
  border-color: var(--accent);
  box-shadow: 0 0 0 1px rgba(124,155,208,.2);
}

.zone-room-card .wall-btn.active {
  background: var(--accent);
  color: #fff;
  border-color: var(--accent);
}
`;

injectStyle('zone-room-card', css);

// ========================================
// TEMPLATE
// ========================================
const template = () => `
  <div class="ui-card zone-room-card">
    <div class="ui-card-title">Zone Settings</div>
    <div class="ui-row">
      <span class="ui-label">Friendly Name</span>
      <span class="ui-field"><input class="ui-input wide zr-friendly" maxlength="24" placeholder="e.g. Living Room"></span>
    </div>
    <div class="ui-row">
      <span class="ui-label">Zone Area (m²)</span>
      <span class="ui-field"><input class="ui-input zr-area" type="number" min="1" step="0.1" placeholder="m2"></span>
    </div>
    <div class="ui-row">
      <span class="ui-label">Pipe Spacing C-C (mm)</span>
      <span class="ui-field"><input class="ui-input zr-spacing" type="number" min="50" step="5" placeholder="200"></span>
    </div>
    <div class="ui-row">
      <span class="ui-label">Pipe Type</span>
      <span class="ui-field"><select class="ui-select zr-pipe">
        <option>PEX 16mm</option><option>PEX 12mm</option><option>PEX 14mm</option><option>PEX 17mm</option><option>PEX 18mm</option><option>PEX 20mm</option><option>ALUPEX 16mm</option><option>ALUPEX 20mm</option><option>Unknown</option>
      </select></span>
    </div>

    <div class="ui-section">Exterior Walls</div>
    <div class="wall-lbl-hint"></div>
    <div class="wall-btn-group">
      <button class="wall-btn" data-wall="None">None</button>
      <button class="wall-btn" data-wall="N">N</button>
      <button class="wall-btn" data-wall="S">S</button>
      <button class="wall-btn" data-wall="E">E</button>
      <button class="wall-btn" data-wall="W">W</button>
    </div>

    <div class="ui-divider"></div>
    <div class="ui-section">Forecast Preload</div>
    <div class="ui-row">
      <span class="ui-label">Wind Exposure</span>
      <span class="ui-field"><input class="ui-input zr-wind" type="number" min="0" max="1" step="0.05" placeholder="0.5"></span>
    </div>
    <div class="ui-row">
      <span class="ui-label">Solar Gain</span>
      <span class="ui-field"><input class="ui-input zr-solar" type="number" min="0" max="1" step="0.05" placeholder="0.3"></span>
    </div>
    <div class="ui-row">
      <span class="ui-label">Thermal Lead (h)</span>
      <span class="ui-field"><input class="ui-input zr-lead" type="number" min="0" max="48" step="1" placeholder="4"></span>
    </div>
    <div class="ui-note">Wind exposure (0–1) is auto-seeded from the exterior walls above — edit it for a sheltered or extra-exposed site. Solar (0–1) is the passive sun gain that reduces preload; Lead h is how far ahead to start charging the slab before a forecast cold/wind peak.</div>
  </div>
`;

// ========================================
// COMPONENT
// ========================================
export default component({
  tag: 'zone-room-card',
  render: template,
  onMount(ctx, el) {
    const nameEl = el.querySelector('.zr-friendly');
    const areaEl = el.querySelector('.zr-area');
    const spacingEl = el.querySelector('.zr-spacing');
    const pipeEl = el.querySelector('.zr-pipe');
    const wallBtns = el.querySelector('.wall-btn-group').querySelectorAll('.wall-btn');
    const windEl = el.querySelector('.zr-wind');
    const solarEl = el.querySelector('.zr-solar');
    const leadEl = el.querySelector('.zr-lead');

    function zone() {
      return getDashboardValue('selectedZone');
    }

    const form = cardForm(el);

    form.text(nameEl, { read: () => zoneTag(zone()) || '', commit: (v) => setZoneName(zone(), v) });
    form.num(areaEl, { read: () => ev(key.area(zone())), commit: (v) => setZoneNumber(zone(), 'zone_area_m2', v) });
    form.num(spacingEl, { read: () => ev(key.spacing(zone())), commit: (v) => setZoneNumber(zone(), 'zone_pipe_spacing_mm', v || 200) });
    form.select(pipeEl, { read: () => es(key.pipeType(zone())) || 'Unknown', commit: (v) => setZoneSelect(zone(), 'zone_pipe_type', v) });
    const windField = form.num(windEl, { read: () => ev(key.windExposure(zone())), commit: (v) => setZoneNumber(zone(), 'zone_wind_exposure', v) });
    form.num(solarEl, { read: () => ev(key.solarGain(zone())), commit: (v) => setZoneNumber(zone(), 'zone_solar_gain', v) });
    form.num(leadEl, { read: () => ev(key.thermalLeadH(zone())), commit: (v) => setZoneNumber(zone(), 'zone_thermal_lead_h', v) });

    // Exterior-wall buttons: a custom multi-select staged with the rest of the
    // form. Toggling walls re-seeds wind exposure (mirroring the firmware) and
    // stages that too, so Apply commits both together.
    let stagedWalls = [];
    function paintWalls() {
      wallBtns.forEach(btn => {
        const w = btn.dataset.wall;
        btn.classList.toggle('active', w === 'None' ? stagedWalls.length === 0 : stagedWalls.includes(w));
      });
    }
    const wallsField = form.custom({
      sync: () => {
        const raw = es(key.exteriorWalls(zone())) || 'None';
        stagedWalls = raw === 'None' ? [] : raw.split(',').filter(Boolean);
        paintWalls();
      },
      commit: () => setZoneText(zone(), 'zone_exterior_walls', stagedWalls.length ? stagedWalls.join(',') : 'None')
    });
    wallBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const w = btn.dataset.wall;
        let dirs = stagedWalls.slice();
        if (w === 'None') {
          dirs = [];
        } else {
          const idx = dirs.indexOf(w);
          if (idx >= 0) dirs.splice(idx, 1); else dirs.push(w);
        }
        stagedWalls = ['N', 'S', 'E', 'W'].filter(d => dirs.includes(d));
        paintWalls();
        wallsField.markDirty();
        // Re-seed wind exposure (staged) to match the new wall count.
        windEl.value = String(seededWindExposure(stagedWalls.length));
        windField.markDirty();
      });
    });

    function refreshIfSelectedZone(id) {
      const z = zone();
      if (
        id === key.area(z) || id === key.spacing(z) || id === key.pipeType(z) ||
        id === key.exteriorWalls(z) || id === key.windExposure(z) ||
        id === key.solarGain(z) || id === key.thermalLeadH(z)
      ) {
        form.refresh();
      }
    }

    // Switching zones abandons any pending edits and loads the new zone.
    subscribeDashboard('selectedZone', form.discard);
    subscribeDashboard('zoneNames', form.refresh);
    for (let z = 1; z <= 6; z++) {
      subscribe(key.area(z), refreshIfSelectedZone);
      subscribe(key.spacing(z), refreshIfSelectedZone);
      subscribe(key.pipeType(z), refreshIfSelectedZone);
      subscribe(key.exteriorWalls(z), refreshIfSelectedZone);
      subscribe(key.windExposure(z), refreshIfSelectedZone);
      subscribe(key.solarGain(z), refreshIfSelectedZone);
      subscribe(key.thermalLeadH(z), refreshIfSelectedZone);
    }
    form.refresh();
  }
});
