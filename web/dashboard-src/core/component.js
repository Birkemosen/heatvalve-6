// core/component.js

const C = {};              // registered components
const SUB = {};            // subscriptions

export function component(def) {
  C[def.tag] = def;
  return def;
}

export function mountComponent(tag, props) {
  const def = C[tag];
  if (!def) throw new Error('Component not found: ' + tag);

  // NO Object.assign (avoids allocation)
  const ctx = props || {};

  if (def.state) {
    const s = def.state(props || {});
    for (let k in s) ctx[k] = s[k];
  }

  if (def.methods) {
    for (let k in def.methods) {
      ctx[k] = def.methods[k];
    }
  }

  const wrapper = document.createElement('div');
  wrapper.innerHTML = def.render(ctx);
  const el = wrapper.firstElementChild;

  if (def.onMount) def.onMount(ctx, el);

  return el;
}

// =======================
// REACTIVITY (zero closure)
// =======================

export function subscribe(id, fn) {
  (SUB[id] ||= []).push(fn);
}

export function notify(id) {
  const list = SUB[id];
  if (!list) return;

  for (let i = 0; i < list.length; i++) {
    list[i](id);
  }
}