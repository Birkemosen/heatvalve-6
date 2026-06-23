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
	border-left: 3px solid rgba(120,146,200,.45);
	background: var(--panel-bg);
	cursor: pointer;
	transition: .18s ease;
	min-width: 0;
	overflow: hidden;
}
.zone-card:hover {
	border-color: rgba(124,155,208,.42);
	border-left-color: rgba(124,155,208,.7);
	background: linear-gradient(180deg, rgba(28,58,103,.52), rgba(18,39,72,.46));
}
.zone-card.active {
	border-color: rgba(255,133,49,.44);
	border-left-color: rgba(255,133,49,.84);
	background: linear-gradient(180deg, rgba(255,133,49,.12), rgba(255,133,49,.04));
}

.zone-card.disabled {
	opacity: .72;
	border-left-color: rgba(120,146,200,.35);
}

.zone-card.zs-heating { border-left-color: #ff8531; }
.zone-card.zs-idle { border-left-color: #8a508f; }
.zone-card.zs-fault { border-left-color: #ff6361; }
.zone-card.zs-off { border-left-color: rgba(120,146,200,.4); }

.zone-card .zc-state-row {
	display: flex;
	align-items: center;
	gap: 5px;
	line-height: 1;
	min-width: 0;
}

.zone-card .zc-dot {
	width: 6px;
	height: 6px;
	border-radius: 50%;
	flex-shrink: 0;
	background: rgba(120,146,200,.4);
}

.zone-card .zc-state-label {
	font-size: 12px;
	font-weight: 700;
	text-transform: uppercase;
	letter-spacing: .55px;
	color: var(--text-secondary);
	min-width: 0;
	overflow: hidden;
	text-overflow: ellipsis;
}

.zone-card .zc-link {
	margin-left: auto;
	padding: 1px 6px 2px;
	border-radius: 999px;
	border: 1px solid rgba(255,133,49,.44);
	background: rgba(255,133,49,.12);
	color: var(--accent);
	font-size: 9px;
	font-weight: 800;
	line-height: 1.2;
	letter-spacing: .55px;
	white-space: nowrap;
}
.zone-card .zc-link[hidden] { display: none; }

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
		<div class="zc-state-row"><span class="zc-dot"></span><span class="zc-state-label">---</span><span class="zc-link" hidden>LINK</span></div>
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
			const linkEl = el.querySelector('.zc-link');
			const nameEl = el.querySelector('.zc-zone-name');
			const friendlyEl = el.querySelector('.zc-friendly');

			function syncTarget(value) {
				const match = String(value || '').match(/\d+/);
				return match ? Number(match[0]) : 0;
			}

			function update() {
				const enabled = isEntityOn(enabledKey);
				const rawState = String(es(stateKey) || '').toUpperCase() || 'OFF';
				// A persisted motor fault (cleared via the Faults & Relearn card)
				// promotes the card to FAULT even if the FSM has moved on.
				const lastFault = String(es(key.motorLastFault(zone)) || '').toUpperCase();
				const hasFault = lastFault && lastFault !== 'NONE' && lastFault !== 'OK';
				const state = (enabled && (rawState === 'FAULT' || hasFault)) ? 'FAULT' : rawState;
				const active = getDashboardValue('selectedZone') === zone;
				const friendlyTag = zoneTag(zone);

				nameEl.textContent = zoneLabel(zone);
				friendlyEl.textContent = friendlyTag || fmtT(ev(tempKey));
				stateEl.textContent = enabled ? state : 'OFF';
				const ownTarget = syncTarget(es(key.syncTo(zone)));
				const linkedFrom = [];
				for (let z = 1; z <= 6; z++) {
					if (z !== zone && syncTarget(es(key.syncTo(z))) === zone) {
						linkedFrom.push(z);
					}
				}
				const hasLink = (ownTarget > 0 && ownTarget !== zone) || linkedFrom.length > 0;
				linkEl.hidden = !hasLink;
				linkEl.textContent = ownTarget > 0 && ownTarget !== zone
					? ('LINK Z' + ownTarget)
					: (linkedFrom.length > 1 ? ('GROUP +' + linkedFrom.length) : ('LINK Z' + linkedFrom[0]));
				const linkTitle = ownTarget > 0 && ownTarget !== zone
					? ('Grouped with ' + zoneLabel(ownTarget))
					: (linkedFrom.length > 0 ? ('Grouped with ' + linkedFrom.map(zoneLabel).join(', ')) : '');
				el.title = hasFault ? ('Fault: ' + lastFault) : linkTitle;

				const displayState = enabled ? state : 'OFF';
				const stateColor =
					displayState === 'HEATING' ? '#ffd380' :
					displayState === 'IDLE'    ? '#79d17e' :
					displayState === 'FAULT'   ? '#ff6361' :
					'#6E7E96';
				const dotColor =
					displayState === 'HEATING' ? '#ff8531' :
					displayState === 'IDLE'    ? '#79d17e' :
					displayState === 'FAULT'   ? '#ff6361' :
					'rgba(120,146,200,.35)';
				stateEl.style.color = stateColor;
				dotEl.style.background = dotColor;
				dotEl.style.boxShadow =
					displayState === 'HEATING' ? '0 0 5px rgba(255,133,49,.6)' :
					displayState === 'FAULT'   ? '0 0 5px rgba(255,100,100,.6)' :
					'';
				el.classList.toggle('active', active);
				el.classList.toggle('disabled', !enabled);
				el.classList.toggle('zs-heating', enabled && displayState === 'HEATING');
				el.classList.toggle('zs-fault', enabled && displayState === 'FAULT');
				el.classList.toggle('zs-idle', enabled && displayState !== 'HEATING' && displayState !== 'FAULT');
				el.classList.toggle('zs-off', !enabled);
			}

			el.addEventListener('click', () => {
				setSelectedZone(zone);
			});

			subscribe(tempKey, update);
			subscribe(stateKey, update);
			subscribe(enabledKey, update);
			subscribe(key.motorLastFault(zone), update);
			for (let z = 1; z <= 6; z++) subscribe(key.syncTo(z), update);
			subscribeDashboard('selectedZone', update);
			subscribeDashboard('zoneNames', update);
			update();
		}
});
