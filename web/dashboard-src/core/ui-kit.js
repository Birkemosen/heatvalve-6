// core/ui-kit.js
// Shared design language for editable config cards (Settings + Zones).
// One canonical set of classes so every card renders identical section
// headers, inline label-left / control-right rows, dividers and controls.
// Read-only Monitor/Logs cards intentionally do NOT use this kit.

import { injectStyle } from './style.js';

const css = `
/* ---- Card panel ---- */
.ui-card {
  background: var(--panel-bg-vibrant);
  border: 1px solid var(--panel-border);
  border-radius: 18px;
  padding: 18px 20px;
  box-shadow: var(--panel-shadow);
  box-sizing: border-box;
}

/* ---- Titles & section headers ---- */
.ui-card-title {
  font-size: .84rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 1.1px;
  color: var(--accent);
  margin: 0 0 6px;
  padding-bottom: 10px;
  border-bottom: 1px solid var(--panel-border);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}
.ui-title-text { display: inline-flex; align-items: center; }

/* ---- Help badge: a "?" chip with a hover/focus explanation tooltip ---- */
.help-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 15px;
  height: 15px;
  margin-left: 7px;
  border-radius: 999px;
  border: 1px solid var(--control-border);
  color: var(--text-faint);
  font-size: .6rem;
  font-weight: 700;
  font-family: inherit;
  text-transform: none;
  letter-spacing: 0;
  cursor: help;
  position: relative;
  flex-shrink: 0;
}
.help-badge:hover, .help-badge:focus-visible { color: var(--accent); border-color: var(--accent); outline: none; }
.help-badge .help-tip {
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  width: max-content;
  max-width: 240px;
  background: rgba(4,18,28,.97);
  border: 1px solid var(--panel-border);
  border-radius: 8px;
  padding: 8px 10px;
  font-size: .72rem;
  font-weight: 500;
  line-height: 1.45;
  color: var(--text-secondary);
  text-transform: none;
  letter-spacing: .2px;
  text-align: left;
  white-space: normal;
  box-shadow: 0 8px 24px rgba(0,0,0,.5);
  opacity: 0;
  pointer-events: none;
  transition: opacity .12s ease;
  z-index: 60;
}
.help-badge:hover .help-tip, .help-badge:focus-visible .help-tip { opacity: 1; }

.ui-section {
  color: var(--text-secondary);
  font-size: .7rem;
  font-weight: 700;
  letter-spacing: 1.6px;
  text-transform: uppercase;
  margin: 16px 0 2px;
}

/* ---- Row: label left, control right, divider below ---- */
.ui-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 11px 0;
  border-bottom: 1px solid rgba(255,255,255,.07);
}
.ui-row:last-child { border-bottom: none; }

.ui-label {
  color: var(--text);
  font-size: .9rem;
  font-weight: 600;
  line-height: 1.25;
  min-width: 0;
}
.ui-sublabel {
  display: block;
  color: var(--text-faint);
  font-size: .72rem;
  font-weight: 500;
  font-style: italic;
  margin-top: 2px;
}

.ui-field {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  gap: 8px;
}

/* ---- Controls ---- */
.ui-input {
  width: 96px;
  box-sizing: border-box;
  text-align: right;
  border: 1px solid var(--control-border);
  background: var(--control-bg);
  color: var(--text);
  border-radius: 10px;
  padding: 8px 10px;
  font-size: .88rem;
  font-family: var(--mono);
  transition: border-color .15s ease;
}
.ui-input.wide { width: 180px; text-align: left; font-family: inherit; }

.ui-select {
  min-width: 160px;
  max-width: 240px;
  box-sizing: border-box;
  border: 1px solid var(--control-border);
  background: var(--control-bg);
  color: var(--text);
  border-radius: 10px;
  padding: 8px 10px;
  font-size: .88rem;
  transition: border-color .15s ease;
}

.ui-input:focus,
.ui-select:focus {
  outline: 2px solid rgba(124,155,208,.6);
  outline-offset: 1px;
  border-color: rgba(124,155,208,.55);
}

.ui-unit { color: var(--text-faint); font-size: .72rem; font-weight: 600; }

/* ---- Numeric stepper (− value +) ----
   The value reads as plain text (flat, no input chrome) between the buttons;
   double-clicking it reveals the editable input. */
.ui-stepper { display: inline-flex; align-items: center; gap: 6px; }
.ui-stepper .ui-input {
  width: 54px;
  text-align: center;
  border-color: transparent;
  background: transparent;
  color: var(--accent);
  font-size: 1.04rem;
  font-weight: 700;
  cursor: default;
  -moz-appearance: textfield;
}
.ui-stepper .ui-input.editing {
  border-color: var(--control-border);
  background: var(--control-bg);
  color: var(--text);
  cursor: text;
}
.ui-stepper .ui-input::-webkit-outer-spin-button,
.ui-stepper .ui-input::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
.ui-step-btn {
  width: 32px;
  height: 34px;
  flex-shrink: 0;
  border: 1px solid var(--control-border);
  background: var(--control-bg);
  color: var(--text);
  border-radius: 9px;
  cursor: pointer;
  font-size: 1.15rem;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background .15s ease, border-color .15s ease, color .15s ease;
}
.ui-step-btn:hover { border-color: var(--accent); color: var(--accent); background: var(--control-bg-hover); }
.ui-step-btn:active { transform: translateY(1px); }

/* ---- Unsaved-changes banner (sits under the card title) ---- */
.ui-form-banner {
  display: none;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin: 0 0 6px;
  padding: 8px 12px;
  border-radius: 10px;
  background: rgba(255,166,0,.12);
  border: 1px solid rgba(255,166,0,.42);
}
.ui-form-banner.show { display: flex; }
.ui-form-banner-msg { color: var(--state-warn); font-size: .76rem; font-weight: 700; }
.ui-form-banner-btns { display: flex; gap: 8px; flex-shrink: 0; }
.ui-form-discard,
.ui-form-apply {
  border-radius: 8px;
  padding: 5px 14px;
  font-size: .76rem;
  font-weight: 700;
  cursor: pointer;
  border: 1px solid var(--control-border);
  transition: .15s ease;
}
.ui-form-discard { background: transparent; color: var(--text-secondary); }
.ui-form-discard:hover { color: var(--text); border-color: var(--text-secondary); }
.ui-form-apply { background: var(--accent); color: #042a3b; border-color: var(--accent); }
.ui-form-apply:hover { filter: brightness(1.08); }

/* ---- Green pill toggle (canonical) ---- */
.ui-toggle {
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
.ui-toggle::after {
  content: '';
  position: absolute;
  top: 3px;
  left: 3px;
  width: 18px;
  height: 18px;
  background: #efe6dd;
  border-radius: 999px;
  transition: transform .2s ease;
}
.ui-toggle.on { background: rgba(121,209,126,.25); border-color: rgba(121,209,126,.5); }
.ui-toggle.on::after { transform: translateX(22px); background: #042a3b; }

/* ---- Notes & dividers ---- */
.ui-note {
  color: var(--text-secondary);
  font-size: .75rem;
  line-height: 1.4;
  margin-top: 8px;
}
.ui-divider {
  border: 0;
  border-top: 1px dashed var(--panel-border);
  margin: 14px 0 2px;
}

/* ---- Buttons (device actions / recovery) ---- */
.ui-btn-row { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 12px; }
.ui-btn {
  flex: 1;
  min-width: 120px;
  border: 1px solid var(--control-border);
  background: var(--control-bg);
  color: var(--text-strong);
  border-radius: 10px;
  padding: 9px 14px;
  cursor: pointer;
  font-weight: 700;
  font-size: .82rem;
  transition: .18s ease;
}
.ui-btn:hover { background: var(--control-bg-hover); border-color: rgba(120,146,200,.52); }
.ui-btn.warn { border-color: rgba(255,118,118,.5); background: rgba(255,118,118,.2); color: #FFD9D9; }
.ui-btn.warn:hover { background: rgba(255,100,100,.3); border-color: rgba(255,100,100,.6); }

@media (max-width: 520px) {
  .ui-row { align-items: flex-start; flex-direction: column; gap: 6px; }
  .ui-field { align-self: stretch; }
  .ui-input, .ui-select { width: 100%; max-width: none; }
  .ui-stepper { width: 100%; }
  .ui-stepper .ui-input { flex: 1; width: auto; }
}
`;

injectStyle('ui-kit', css);

// Render a "?" help chip whose tooltip shows `text` on hover/focus. Drop it
// inside a `.ui-title-text` span next to a card title.
export function helpBadge(text) {
  const safe = String(text).replace(/"/g, '&quot;');
  return `<span class="help-badge" tabindex="0" role="img" aria-label="${safe}">?` +
    `<span class="help-tip">${text}</span></span>`;
}

// Magnitude-aware step: the increment follows the size of the number so big
// values move in big jumps and small values stay fine-grained. Below 1000 the
// field keeps its declared precision (e.g. 168 → ±1, 1.70 → ±0.10); from 1000
// up it scales to one order of magnitude below the value (2000 → ±100).
export function dynamicStep(value, baseStep) {
  const a = Math.abs(Number(value));
  if (!Number.isFinite(a) || a < 1000) return baseStep;
  return Math.pow(10, Math.floor(Math.log10(a)) - 1);
}

function decimalsOf(step) {
  const s = String(step);
  const i = s.indexOf('.');
  return i < 0 ? 0 : s.length - i - 1;
}

// cardForm — per-card staged-save controller.
//
// Edits to registered controls are staged locally (nothing is written to the
// device) and an "Unsaved changes" banner appears under the card title with
// Apply / Discard. Only on Apply are the staged values committed via each
// field's commit() callback. Incoming device state refreshes a control only
// while it is NOT dirty, so a pending edit is never clobbered.
//
// Field types: num (with − / + stepper + double-click-to-edit), text, select,
// toggle (green pill), and custom (caller-managed control, e.g. wall buttons).
export function cardForm(el, opts = {}) {
  const titleEl = el.querySelector(opts.title || '.ui-card-title');
  const banner = document.createElement('div');
  banner.className = 'ui-form-banner';
  banner.innerHTML =
    '<span class="ui-form-banner-msg">Unsaved changes</span>' +
    '<span class="ui-form-banner-btns">' +
      '<button type="button" class="ui-form-discard">Discard</button>' +
      '<button type="button" class="ui-form-apply">Apply</button>' +
    '</span>';
  if (titleEl) titleEl.insertAdjacentElement('afterend', banner);
  else el.insertAdjacentElement('afterbegin', banner);

  const fields = [];
  const refreshBanner = () => banner.classList.toggle('show', fields.some(f => f.dirty));
  const mark = (field, v) => { field.dirty = v; refreshBanner(); };

  function attach(field) {
    field.markDirty = () => mark(field, true);
    fields.push(field);
    return field;
  }

  function num(input, cfg) {
    const field = { dirty: false, input };
    const baseStep = cfg.baseStep != null ? cfg.baseStep : (parseFloat(input.step) || 1);
    const decimals = decimalsOf(baseStep);
    const lo = cfg.min != null ? cfg.min : (input.min !== '' ? parseFloat(input.min) : -Infinity);
    const hi = cfg.max != null ? cfg.max : (input.max !== '' ? parseFloat(input.max) : Infinity);
    const fmt = (v) => decimals > 0 ? Number(v).toFixed(decimals) : String(Math.round(Number(v)));

    if (!cfg.nostep) {
      const stepper = document.createElement('div');
      stepper.className = 'ui-stepper';
      input.parentNode.insertBefore(stepper, input);
      const dec = document.createElement('button');
      dec.type = 'button'; dec.className = 'ui-step-btn'; dec.textContent = '−'; dec.tabIndex = -1; dec.setAttribute('aria-label', 'decrease');
      const inc = document.createElement('button');
      inc.type = 'button'; inc.className = 'ui-step-btn'; inc.textContent = '+'; inc.tabIndex = -1; inc.setAttribute('aria-label', 'increase');
      stepper.appendChild(dec); stepper.appendChild(input); stepper.appendChild(inc);
      input.readOnly = true;

      const nudge = (dir) => {
        if (input.disabled) return;
        let b = parseFloat(input.value);
        if (!Number.isFinite(b)) b = parseFloat(input.placeholder);
        if (!Number.isFinite(b)) b = 0;
        const next = Math.min(hi, Math.max(lo, b + dir * dynamicStep(b, baseStep)));
        input.value = fmt(next);
        mark(field, true);
      };
      dec.addEventListener('click', () => nudge(-1));
      inc.addEventListener('click', () => nudge(1));
      input.addEventListener('dblclick', () => {
        if (input.disabled) return;
        input.readOnly = false; input.classList.add('editing'); input.focus(); input.select();
      });
      input.addEventListener('blur', () => { input.readOnly = true; input.classList.remove('editing'); });
      input.addEventListener('keydown', (e) => { if (e.key === 'Enter') input.blur(); });
    }
    input.addEventListener('input', () => mark(field, true));

    field.sync = () => {
      const v = cfg.read();
      input.value = (v != null && Number.isFinite(Number(v))) ? fmt(v) : '';
    };
    field.commit = () => {
      const v = parseFloat(input.value);
      if (!Number.isFinite(v)) return;
      cfg.commit(Math.min(hi, Math.max(lo, v)));
    };
    return attach(field);
  }

  function text(input, cfg) {
    const field = { dirty: false, input };
    input.addEventListener('input', () => mark(field, true));
    field.sync = () => { const v = cfg.read(); input.value = v != null ? v : ''; };
    field.commit = () => cfg.commit(input.value.trim());
    return attach(field);
  }

  function select(sel, cfg) {
    const field = { dirty: false, input: sel };
    sel.addEventListener('change', () => mark(field, true));
    field.sync = () => { const v = cfg.read(); if (v != null) sel.value = v; };
    field.commit = () => cfg.commit(sel.value);
    return attach(field);
  }

  function toggle(btn, cfg) {
    const field = { dirty: false, input: btn, staged: false };
    const row = btn.closest('.ui-row');
    const paint = () => {
      btn.classList.toggle('on', field.staged);
      if (row) row.classList.toggle('is-on', field.staged);
      btn.setAttribute('aria-checked', field.staged ? 'true' : 'false');
      // onChange lets the card react to the *staged* value (e.g. un-gate a body
      // section the instant the toggle flips, before Apply).
      if (cfg.onChange) cfg.onChange(field.staged);
    };
    btn.addEventListener('click', () => { field.staged = !field.staged; mark(field, true); paint(); });
    field.sync = () => { field.staged = !!cfg.read(); paint(); };
    field.commit = () => cfg.commit(field.staged);
    return attach(field);
  }

  // Caller-managed control. Provide sync()/commit(); call .markDirty() on edit.
  function custom(cfg) {
    const field = { dirty: false, sync: cfg.sync, commit: cfg.commit };
    return attach(field);
  }

  const refresh = () => fields.forEach(f => { if (!f.dirty && f.sync) f.sync(); });
  const apply = () => {
    fields.forEach(f => { if (f.dirty) { if (f.commit) f.commit(); f.dirty = false; } });
    refreshBanner();
    if (opts.onApply) opts.onApply();
  };
  const discard = () => {
    fields.forEach(f => { f.dirty = false; if (f.sync) f.sync(); });
    refreshBanner();
    if (opts.onDiscard) opts.onDiscard();
  };

  banner.querySelector('.ui-form-apply').addEventListener('click', apply);
  banner.querySelector('.ui-form-discard').addEventListener('click', discard);

  return { num, text, select, toggle, custom, refresh, apply, discard, isDirty: () => fields.some(f => f.dirty) };
}
