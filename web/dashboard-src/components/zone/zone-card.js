import { component, subscribe } from '../../core/component.js';
import { injectStyle } from '../../core/style.js';
import { ev, es, getDashboardValue, isEntityOn, setSelectedZone, subscribeDashboard, zoneLabel, zoneTag } from '../../core/store.js';
import { fmtT } from '../../utils/format.js';
import { key } from '../../utils/keys.js';

// ========================================
// CSS (scoped by class)
// ========================================
const css = `
.zone-card {
	display: grid;
	grid-template-rows: auto auto auto;
	gap: 2px;
	padding: 7px 10px;
	border-radius: 12px;
	border: 1px solid var(--panel-border);
	border-left: 3px solid rgba(120,168,255,.45);
	background: var(--panel-bg);
	cursor: pointer;
	transition: .18s ease;
	min-width: 0;
	overflow: hidden;
}
.zone-card:hover {
	border-color: rgba(83,168,255,.42);
	border-left-color: rgba(83,168,255,.7);
	background: linear-gradient(180deg, rgba(28,58,103,.52), rgba(18,39,72,.46));
}
.zone-card.active {
	border-color: rgba(238,161,17,.44);
	border-left-color: rgba(238,161,17,.84);
	background: linear-gradient(180deg, rgba(238,161,17,.12), rgba(238,161,17,.04));
}

.zone-card.disabled {
	opacity: .72;
	border-left-color: rgba(120,168,255,.35);
}

.zone-card.zs-heating { border-left-color: #EEA111; }
.zone-card.zs-idle { border-left-color: #53A8FF; }
.zone-card.zs-off { border-left-color: rgba(120,168,255,.4); }

.zone-card .zc-state-row {
	display: flex;
	align-items: center;
	gap: 5px;
	line-height: 1;
}

.zone-card .zc-dot {
	width: 6px;
	height: 6px;
	border-radius: 50%;
	flex-shrink: 0;
	background: rgba(120,168,255,.4);
}

.zone-card .zc-state-label {
	font-size: 12px;
	font-weight: 700;
	text-transform: uppercase;
	letter-spacing: .55px;
	color: var(--text-secondary);
}

.zone-card .zc-zone-name {
	font-size: 14px;
	font-weight: 800;
	line-height: 1;
	color: var(--text-strong);
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
}

.zone-card .zc-friendly {
	font-size: 12px;
	font-weight: 600;
	line-height: 1.1;
	color: var(--text-secondary);
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
}
`;
injectStyle('zone-card', css);

// ========================================
// TEMPLATE
// ========================================
const template = (ctx) => `
	<div class="zone-card" data-zone="${ctx.zone}">
		<div class="zc-state-row"><span class="zc-dot"></span><span class="zc-state-label">---</span></div>
		<div class="zc-zone-name">${zoneLabel(ctx.zone)}</div>
		<div class="zc-friendly">${zoneTag(ctx.zone) || '---'}</div>
	</div>
`;

// ========================================
// COMPONENT
// ========================================
export default component({
	tag: 'zone-card',
	state: (props) => ({
		zone: props.zone,
	}),
	render: template,
		onMount(ctx, el) {
			const zone = ctx.zone;
			const tempKey = key.temp(zone);
			const stateKey = key.state(zone);
			const enabledKey = key.enabled(zone);
			const stateEl = el.querySelector('.zc-state-label');
			const dotEl = el.querySelector('.zc-dot');
			const nameEl = el.querySelector('.zc-zone-name');
			const friendlyEl = el.querySelector('.zc-friendly');

			function update() {
				const enabled = isEntityOn(enabledKey);
				const state = String(es(stateKey) || '').toUpperCase() || 'OFF';
				const active = getDashboardValue('selectedZone') === zone;
				const friendlyTag = zoneTag(zone);

				nameEl.textContent = zoneLabel(zone);
				friendlyEl.textContent = friendlyTag || fmtT(ev(tempKey));
				stateEl.textContent = enabled ? state : 'OFF';

				const displayState = enabled ? state : 'OFF';
				const stateColor =
					displayState === 'HEATING' ? '#f2c77b' :
					displayState === 'IDLE'    ? '#79d17e' :
					displayState === 'FAULT'   ? '#ff7676' :
					'#7D8BA7';
				const dotColor =
					displayState === 'HEATING' ? '#EEA111' :
					displayState === 'IDLE'    ? '#79d17e' :
					displayState === 'FAULT'   ? '#ff6464' :
					'rgba(120,168,255,.35)';
				stateEl.style.color = stateColor;
				dotEl.style.background = dotColor;
				dotEl.style.boxShadow =
					displayState === 'HEATING' ? '0 0 5px rgba(238,161,17,.6)' :
					displayState === 'FAULT'   ? '0 0 5px rgba(255,100,100,.6)' :
					'';
				el.classList.toggle('active', active);
				el.classList.toggle('disabled', !enabled);
				el.classList.toggle('zs-heating', enabled && state === 'HEATING');
				el.classList.toggle('zs-idle', enabled && state !== 'HEATING');
				el.classList.toggle('zs-off', !enabled);
			}

			el.addEventListener('click', () => {
				setSelectedZone(zone);
			});

			subscribe(tempKey, update);
			subscribe(stateKey, update);
			subscribe(enabledKey, update);
			subscribeDashboard('selectedZone', update);
			subscribeDashboard('zoneNames', update);
			update();
		}
});
