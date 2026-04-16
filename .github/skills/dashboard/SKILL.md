---
name: modular-esp-dashboard-architecture
description: >
	Modular dashboard architecture for ESP32-S3 based UFH PCBs based on a central
	store and static UI with dynamic updates, with a lightweight component-based
	design and no frameworks, optimized for performance and low resource usage.
---

# Skill: Building a Modular, ESP-Optimized Dashboard (HV6 Architecture)

## Overview

This skill demonstrates how to design and implement a modular, framework-free dashboard system optimized for ESPHome devices, using:
- A custom lightweight component system
- A centralized reactive store
- Server-Sent Events (SSE) for real-time updates
- A build pipeline producing a single optimized bundle

The architecture is designed for low memory usage, minimal allocations, and high UI responsiveness on constrained devices like ESP32/ESP8266.

---

## Core Principles

### 1. No Frameworks

Avoid heavy frameworks (Vue/React). Instead:
- Use plain JavaScript
- Build a minimal component runtime
- Control allocations explicitly

### 2. Single Source of Truth

All runtime data flows through a centralized store:

```text
SSE -> store -> notify -> components update DOM
```

### 3. Zero/Low Allocation Updates

- No re-rendering templates
- No object creation in update loops
- No closures per subscription

### 4. Static Composition, Dynamic Updates

- Components mount once
- Only text/attributes update afterward

## Project Structure

```text
web/
	dashboard.js              (bundled output)

	dashboard-src/
		main.js                 (entry point)

		core/
			component.js          (component system)
			store.js              (reactive store)
			sse.js                (SSE / mock switch)
			mock.js               (offline simulator)
			style.js              (CSS injection)

		utils/
			format.js             (display formatting)
			keys.js               (entity key builders)
			dom.js                (optional DOM helpers)

		components/
			header.js
			zone-card.js
			zone-grid.js
			flow-diagram.js

		app/
			app-root.js           (layout root)
```

## Component Model

Each component is defined as a Single-File Component (SFC)-style JS module:

```js
// components/zone-card.js
component({
	tag: 'zone-card',

	render: (ctx) => `<div>...</div>`,

	onMount(ctx, el) {
		// cache DOM
		// subscribe to store
		// update DOM directly
	}
});
```

### Key Characteristics

- `render()` returns static HTML string
- `onMount()` binds logic and subscriptions
- No re-rendering
- DOM nodes are cached once

## Reactive Store

Minimal entity store:

```js
E[id] = { v: value, s: state };
```

Helpers:

```js
ev(id); // value
es(id); // state
```

Updates:

```js
setEntity(id, patch);
// mutate
// notify subscribers
```

## Data Flow

Real mode:

```text
ESP API (SSE)
	-> sse.js
	-> setEntity()
	-> notify()
	-> component updates
```

Mock mode:

```text
mock.js (interval simulation)
	-> setEntity()
	-> notify()
	-> UI updates
```

## Build Strategy

Using a single bundled file:

```sh
esbuild main.js --bundle --minify --format=iife
```

Output:

```text
web/dashboard.js
```

Why:
- Single HTTP request
- Smaller flash footprint
- No runtime module system

---

## Performance Optimizations

### Avoid

- `.bind()` in subscriptions
- `innerHTML` re-renders
- Dynamic object creation
- Repeated `querySelector`

### Prefer

- Cached DOM references
- Static update functions
- Typed arrays for animation
- Centralized key builders

---

## Mocking Strategy

Dashboard supports offline mode:

```js
window.HV6_DASHBOARD_CONFIG = {
	mock: true
};
```

This enables:
- Simulated temperatures
- Valve movement
- Full UI testing without hardware

## Result

This architecture produces a dashboard that is:
- Fast (minimal CPU usage)
- Predictable (explicit data flow)
- Small (optimized bundle size)
- ESP-compatible (low memory + no framework)
- Modular (component-based structure)

---

## When to Use This Pattern

Use this approach when:
- Targeting embedded devices (ESP32/ESP8266)
- Needing real-time dashboards (SSE/WebSocket)
- Minimizing dependencies is critical
- Performance and determinism matter more than DX

---

## Summary

This modular system replaces traditional frontend frameworks with a purpose-built runtime tailored for embedded environments, delivering:
- Full control over performance
- Scalable component architecture
- Real-time responsiveness
- Production-ready simplicity