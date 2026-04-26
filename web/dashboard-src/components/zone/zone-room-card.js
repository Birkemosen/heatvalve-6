import { component, subscribe } from '../../core/component.js';
import { injectStyle } from '../../core/style.js';
import { ev, es, getDashboardValue, setZoneName, subscribeDashboard, zoneTag } from '../../core/store.js';
import { key } from '../../utils/keys.js';
import { setZoneNumber, setZoneSelect, setZoneText } from '../../core/api.js';

// ========================================
// CSS
// ========================================
const css = `
.zone-room-card {
  background: var(--panel-bg-vibrant);
  border: 1px solid var(--panel-border);
  border-radius: 18px;
  padding: 18px;
  box-shadow: var(--panel-shadow);
}

.zone-room-card .card-title {
  font-size: .84rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 1.1px;
  color: var(--accent);
  margin-bottom: 12px;
  padding-bottom: 10px;
  border-bottom: 1px solid var(--panel-border);
}

.zone-room-card .cfg-row {
  display: grid;
  grid-template-columns: 1fr;
  gap: 6px;
  margin-bottom: 12px;
}

.zone-room-card .cfg-row.two-col {
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.zone-room-card .cfg-row > div {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

@media (max-width: 480px) {
  .zone-room-card .cfg-row.two-col {
    grid-template-columns: 1fr;
  }
}

.zone-room-card .lbl {
  color: var(--text-secondary);
  font-size: .78rem;
  font-weight: 700;
  letter-spacing: .45px;
  text-transform: uppercase;
}

.zone-room-card .txt,
.zone-room-card .sel {
  width: 100%;
  border: 1px solid var(--control-border);
  background: var(--control-bg);
  color: var(--text);
  border-radius: 10px;
  padding: 9px 10px;
  font-size: .88rem;
  transition: border-color .15s ease;
}

.zone-room-card .txt:focus,
.zone-room-card .sel:focus {
  outline: 2px solid rgba(83,168,255,.6);
  outline-offset: 1px;
  border-color: rgba(83,168,255,.55);
}

.zone-room-card .wall-lbl-hint {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: .75rem;
  color: var(--text-secondary);
  margin-top: -4px;
  margin-bottom: 8px;
}

.zone-room-card .wall-lbl-hint::after {
  content: 'Select all that apply';
  font-style: italic;
}

.zone-room-card .wall-btn-group {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
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
  box-shadow: 0 0 0 1px rgba(83,168,255,.2);
}

.zone-room-card .wall-btn.active {
  background: var(--accent);
  color: #fff;
  border-color: var(--accent);
}

.zone-room-card .wall-btn[data-wall="None"] {
  grid-column: 1 / -1;
}
`;

injectStyle('zone-room-card', css);

// ========================================
// TEMPLATE
// ========================================
const template = () => `
  <div class="zone-room-card">
    <div class="card-title">Zone Settings</div>
    <div class="cfg-row"><span class="lbl">Friendly Name</span><input class="txt zr-friendly" maxlength="24" placeholder="e.g. Living Room"></div>
    <div class="cfg-row two-col">
      <div><span class="lbl">Zone Area</span><input class="txt zr-area" type="number" min="1" step="0.1" placeholder="m2"></div>
      <div><span class="lbl">Pipe Spacing C-C</span><input class="txt zr-spacing" type="number" min="50" step="5" placeholder="200"></div>
    </div>
    <div class="cfg-row"><span class="lbl">Pipe Type</span>
      <select class="sel zr-pipe">
        <option>PEX 16mm</option><option>PEX 12mm</option><option>PEX 14mm</option><option>PEX 17mm</option><option>PEX 18mm</option><option>PEX 20mm</option><option>ALUPEX 16mm</option><option>ALUPEX 20mm</option><option>Unknown</option>
      </select>
    </div>
    <div class="cfg-row">
      <span class="lbl">Exterior Walls</span>
      <div class="wall-btn-group">
        <button class="wall-btn" data-wall="None">None</button>
        <button class="wall-btn" data-wall="N">N</button>
        <button class="wall-btn" data-wall="S">S</button>
        <button class="wall-btn" data-wall="E">E</button>
        <button class="wall-btn" data-wall="W">W</button>
      </div>
    </div>
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
    const wallBtns = el.querySelectorAll('.wall-btn');

    function zone() {
      return getDashboardValue('selectedZone');
    }

    function update() {
      const z = zone();
      if (document.activeElement !== nameEl) nameEl.value = zoneTag(z) || '';
      if (document.activeElement !== areaEl) areaEl.value = ev(key.area(z)) != null ? String(ev(key.area(z))) : '';
      if (document.activeElement !== spacingEl) spacingEl.value = ev(key.spacing(z)) != null ? String(ev(key.spacing(z))) : '';
      pipeEl.value = es(key.pipeType(z)) || 'Unknown';
      const rawWalls = es(key.exteriorWalls(z)) || 'None';
      const activeDirs = rawWalls === 'None' ? [] : rawWalls.split(',').filter(Boolean);
      wallBtns.forEach(btn => {
        const w = btn.dataset.wall;
        btn.classList.toggle('active', w === 'None' ? activeDirs.length === 0 : activeDirs.includes(w));
      });
    }

    function updateIfSelectedZone(id) {
      const z = zone();
      if (
        id === key.area(z) ||
        id === key.spacing(z) ||
        id === key.pipeType(z) ||
        id === key.exteriorWalls(z)
      ) {
        update();
      }
    }

    nameEl.addEventListener('change', () => {
      setZoneName(zone(), nameEl.value);
    });
    areaEl.addEventListener('change', () => {
      setZoneNumber(zone(), 'zone_area_m2', areaEl.value);
    });
    spacingEl.addEventListener('change', () => {
      setZoneNumber(zone(), 'zone_pipe_spacing_mm', spacingEl.value || '200');
    });
    pipeEl.addEventListener('change', () => {
      setZoneSelect(zone(), 'zone_pipe_type', pipeEl.value);
    });
    wallBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const w = btn.dataset.wall;
        const rawWalls = es(key.exteriorWalls(zone())) || 'None';
        let dirs = rawWalls === 'None' ? [] : rawWalls.split(',').filter(Boolean);
        if (w === 'None') {
          dirs = [];
        } else {
          const idx = dirs.indexOf(w);
          if (idx >= 0) dirs.splice(idx, 1); else dirs.push(w);
        }
        const ordered = ['N', 'S', 'E', 'W'].filter(d => dirs.includes(d));
        setZoneText(zone(), 'zone_exterior_walls', ordered.length ? ordered.join(',') : 'None');
      });
    });

    subscribeDashboard('selectedZone', update);
    subscribeDashboard('zoneNames', update);
    for (let z = 1; z <= 6; z++) {
      subscribe(key.area(z), updateIfSelectedZone);
      subscribe(key.spacing(z), updateIfSelectedZone);
      subscribe(key.pipeType(z), updateIfSelectedZone);
      subscribe(key.exteriorWalls(z), updateIfSelectedZone);
    }
    update();
  }
});
