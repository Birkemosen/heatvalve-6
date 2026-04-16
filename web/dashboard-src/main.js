import { mountComponent } from './core/component.js';
import { connect } from './core/sse.js';


// register components (side-effect imports)
import './app/header.js';
import './components/overview/status-card.js';
import './components/overview/connectivity-card.js';
import './components/overview/graph-widgets.js';
import './components/zone/zone-grid.js';
import './components/zone/zone-card.js';
import './components/zone/zone-detail.js';
import './components/zone/zone-sensor-card.js';
import './components/zone/zone-room-card.js';
import './components/overview/flow-diagram.js';
import './components/diagnostics/diag-i2c.js';
import './components/diagnostics/diag-zone.js';
import './components/diagnostics/diag-activity.js';
import './components/diagnostics/diag-manual-badge.js';
import './components/diagnostics/diag-zone-motor-card.js';
import './components/diagnostics/diag-zone-recovery-card.js';
import './components/settings/settings-manifold-card.js';
import './components/settings/settings-control-card.js';
import './components/settings/settings-motor-calibration-card.js';

// root
import './app/app-root.js';

// boot
function boot() {
  const root = document.getElementById('app');
  if (!root) throw new Error('Dashboard root #app not found');
  
  root.innerHTML = '';
  root.appendChild(mountComponent('app-root'));

  // start SSE AFTER UI exists
  connect(); // mock or real
}

// run
boot();