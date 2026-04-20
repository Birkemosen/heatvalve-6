# Helios-6 UI Design System

Design guideline for the Helios-6 dashboard UI. All values are derived from the HV6 reference implementation and should be treated as the canonical source of truth.

---

## Foundations

### Color Palette

All colors are defined as CSS custom properties on `:root`.

| Token | Value | Usage |
|---|---|---|
| `--accent` | `#EEA111` | Primary accent, active states, highlights |
| `--bg` | `#161616` | Page background |
| `--surface` | `#1C1C1C` | Raised surface (sidebar, panels) |
| `--card` | `#141A27` | Card base color |
| `--border` | `#2D2D2D` | Default border |
| `--text` | `#FFFFFF` | Primary text |
| `--muted` | `rgba(255,255,255,.63)` | Secondary / label text |
| `--soft` | `rgba(255,255,255,.1)` | Subtle fills |
| `--green` | `#79d17e` | Success, idle, satisfied states |
| `--red` | `#ff6464` | Error, fault, overheat states |
| `--mono` | `"Montserrat", sans-serif` | Font family token |

#### Semantic state colors

These are used for zone state indicators and left-border accents on zone cards.

| State | Color |
|---|---|
| Heating / Demand | `#EEA111` (accent) |
| Idle / Satisfied | `#79d17e` (green) |
| Overheat / Fault | `#ff6464` (red) |
| Manual override | `#53A8FF` |
| Calibrating | `#a78bfa` |
| Waiting | `#f59e0b` |
| Off / Disabled | `#4a4a4a` |

#### Accent shades used inline

Accent at different opacities for backgrounds and borders:

- Border active: `rgba(238,161,17,.40)`
- Border subtle: `rgba(238,161,17,.18)`
- Fill light: `rgba(238,161,17,.08)`
- Fill medium: `rgba(238,161,17,.12–.22)`
- Glow shadow: `rgba(238,161,17,.25)`

---

### Typography

**Font**: `Montserrat` (Google Fonts), weights 400 / 500 / 600 / 700 / 800.  
Fallback stack: `-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`

```css
@import url("https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800&display=swap");
```

**Base**: `font-size: 16px`, `line-height: 1.45`, `-webkit-font-smoothing: antialiased`

#### Type scale

| Role | Size | Weight | Transform | Spacing |
|---|---|---|---|---|
| Section title | `1.34rem` | 800 | — | `letter-spacing: .8px` |
| Zone detail title | `1.12rem` | 700 | — | — |
| Card title | `.84rem` | 800 | uppercase | `1.1px` |
| Body / table | `.88rem` | 500/600 | — | — |
| Label / muted | `.72–.78rem` | 600–700 | uppercase | `.7–1px` |
| Micro / chip label | `.62–.65rem` | 700–800 | uppercase | `.6–.8px` |
| Brand name | `1.02rem` | 800 | uppercase | `1.8px` |
| Large stat value | `1.64rem` | 800 | — | `-.5px` |
| Target temperature | `2.2rem` | 800 | — | — |
| Probe temp (mono) | `1.02rem` | 800 | — | — |

Card titles are always `--accent` colored, uppercased, with a bottom border separator.

---

## Spacing

The spacing system uses a loose 4 px base. Common values:

| Token | Value | Where |
|---|---|---|
| `gap-xs` | `6–8px` | Tight element groups |
| `gap-sm` | `10–12px` | Card internals, chip rows |
| `gap-md` | `14px` | Grid gaps, section spacing |
| `gap-lg` | `18–20px` | Card padding, section margins |
| `gap-xl` | `22–24px` | Section bottom margin |

### Card padding

- Standard card: `padding: 20px`
- Compact card (diagnostics): `padding: 16px`
- Slim card (control strip): `padding: 12px 16px`
- Mini card (zone card): `padding: 7px 10px`

### Shell / page padding

- Desktop: `padding: 18px`
- Mobile (≤720px): `padding: 12px`
- Max content width: `min(1320px, 100%)`

---

## Border Radius

| Context | Radius |
|---|---|
| Page card (standard) | `18px` |
| Topbar / surface panel | `14px` |
| Stat card / sub-card | `12px` |
| Zone card | `12px` |
| Graph card | `16px` |
| Button (pill) | `999px` |
| Button (square) | `10px` |
| Badge | `999px` |
| Input / select | `10px` |
| Chip (meta) | `12–14px` |
| Toggle switch | `999px` |
| Progress bar | `999px` |
| Code block | `10px` |
| Mobile (≤560px) cards | `14px` |

---

## Shadows & Depth

Cards use layered shadows to convey depth on the dark background:

```css
/* Standard card */
box-shadow:
  inset 0 1px 0 rgba(255,255,255,.03),
  0 24px 60px rgba(0,0,0,.35);

/* Topbar */
box-shadow: 0 18px 36px rgba(0,0,0,.26);

/* Stat card */
box-shadow:
  inset 0 1px 0 rgba(255,255,255,.02),
  0 8px 24px rgba(0,0,0,.2);

/* Active menu link */
box-shadow: 0 10px 26px rgba(238,161,17,.25);
```

The `inset 0 1px 0 rgba(255,255,255,.03)` inner highlight is applied consistently on cards to simulate a glass-like top edge.

---

## Backgrounds & Gradients

### Page background
```css
background: radial-gradient(
  1400px 800px at 85% -12%,
  rgba(238,161,17,.1),
  transparent 58%
), var(--bg);
```

### Standard card
```css
background: linear-gradient(180deg, rgba(20,26,39,.98), rgba(18,22,33,.95));
```

### Zone detail card (highlight variant)
```css
background:
  radial-gradient(500px 180px at 90% -40%, rgba(238,161,17,.16), transparent 60%),
  linear-gradient(180deg, rgba(20,26,39,.98), rgba(18,22,33,.95));
```

### Accent-tinted card
```css
background: linear-gradient(180deg, rgba(238,161,17,.08), rgba(238,161,17,.03));
border: 1px solid rgba(238,161,17,.24);
```

### Zone card
```css
background: linear-gradient(180deg, rgba(20,26,39,.72), rgba(17,22,35,.60));
```

All cards have `border: 1px solid rgba(255,255,255,.08)` as the default subtle border.

---

## Layout Structure

### Shell

```
<body>
  <div class="shell">         ← max-width container, centered, padded
    <div class="topbar">      ← header bar with brand, nav, meta chips
    <div class="sec">         ← page section (overview / zone / settings / diagnostics)
      ...content...
    </div>
  </div>
</body>
```

### Topbar

- Grid: `grid-template-columns: auto 1fr auto` (brand | menu | meta)
- Nav links: pill-style `.menu-link`, active state uses solid accent fill
- Meta chips: fixed-height `34px` info badges (uptime, wifi, sync state)

### Dashboard grid

```css
.dashboard-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
}
```

### Zone grid

```css
.zone-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 8px;
}
```

### Zone panels (detail)

```css
.zone-panels {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
}
```

### Bento / stat row

```css
.bento {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}
```

### Settings section

Three-column grid with explicit named placements for each card type. Collapses to two columns at ≤1080px.

### Graph grid

```css
.graph-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}
```

---

## Components

### Card

Base component for all content containers.

```css
.card {
  background: linear-gradient(180deg, rgba(20,26,39,.98), rgba(18,22,33,.95));
  border: 1px solid rgba(255,255,255,.08);
  border-radius: 18px;
  padding: 20px;
  box-shadow: inset 0 1px 0 rgba(255,255,255,.03), 0 24px 60px rgba(0,0,0,.35);
}
```

Card title: `.card-title` — accent color, uppercase, `letter-spacing: 1.1px`, bottom border `rgba(255,255,255,.08)`, `margin-bottom: 12px`, `padding-bottom: 10px`.

### Zone card

Compact interactive tile in the zone grid.

- `border-left: 3px solid` — state-driven color (see semantic state colors)
- Three rows: state indicator row, zone ID, friendly name
- Active: accent border + subtle accent fill
- Disabled: `opacity: .62`, forced muted border-left `#575d66`

### Stat card (bento)

```css
.stat-card {
  border-radius: 12px;
  padding: 16px 12px;
  /* centered label above large value */
}
```

- `.stat-label`: `0.65rem`, uppercase, muted
- `.stat-value`: `1.64rem`, 800 weight, Montserrat, `letter-spacing: -.5px`
- `.stat-unit`: `0.62rem`, muted

### Badges

Pill-shaped status indicators.

```css
.badge { border-radius: 999px; padding: 4px 10px; font-size: .62rem; font-weight: 800; text-transform: uppercase; letter-spacing: .8px; }
```

| Variant | Background | Color |
|---|---|---|
| default | `rgba(255,255,255,.08)` | `--muted` |
| demand | `rgba(238,161,17,.22)` | `--accent` |
| satisfied | `rgba(121,209,126,.2)` | `--green` |
| overheated | `rgba(255,100,100,.2)` | `--red` |
| fault | `rgba(255,100,100,.22)` + border | `#ff8f8f` |

### Buttons

```css
.btn {
  border-radius: 999px;
  padding: 10px 15px;
  font-size: .82rem;
  font-weight: 700;
  border: 1px solid rgba(255,255,255,.12);
  background: rgba(255,255,255,.03);
  color: var(--text);
}
```

| Variant | Style |
|---|---|
| default | Ghost — light border, near-transparent fill |
| `.accent` | Solid accent fill, dark text `#1b1b1b` |
| `.warn` | Red text `#ff7a7a`, red-tinted border |

Hover: border transitions to `rgba(238,161,17,.45)`.

Square step buttons (`.spb`): `38×38px`, `border-radius: 10px`.

### Inputs & Selects

```css
background: rgba(20,26,39,.8);
border: 1px solid rgba(255,255,255,.12);
border-radius: 10px;
padding: 9px 11px;
font-size: .84rem;
```

Focus: `border-color: rgba(238,161,17,.6)`.  
Default width: `220px` (collapses to 100% on mobile ≤560px).

### Toggle switch

```css
.sw { width: 48px; height: 26px; border-radius: 999px; background: #2b2b2b; }
.sw.on { background: var(--accent); }
/* thumb: 20×20px, white off / dark on */
```

### Progress / value bar

```css
.vbar { height: 7px; border-radius: 999px; background: rgba(255,255,255,.08); }
.vbar .fill { background: linear-gradient(90deg, #f4be58, var(--accent)); transition: width .6s ease; }
```

### Status dot

```css
.dot { width: 10px; height: 10px; border-radius: 999px; background: #5f5f5f; }
.dot.on { background: #7fd489; box-shadow: 0 0 12px rgba(127,212,137,.6); }
```

Zone card micro-dot (`.zc-dot`): `6×6px`.

### Meta chip (topbar)

```css
height: 34px;
padding: 4px 10px;
border-radius: 14px;
border: 1px solid rgba(120,168,255,.28);
background: linear-gradient(180deg, rgba(25,42,79,.48), rgba(17,28,54,.36));
```

Two-line layout: label (`8px`, uppercase, muted) over value (`12px`, 800 weight).

### Config row

Used in settings panels for label + control pairs.

```css
.cfg-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 0;
  border-bottom: 1px solid rgba(255,255,255,.08);
}
```

### Notification / info note

```css
.cfg-note {
  padding: 12px 14px;
  border-radius: 14px;
  border: 1px solid rgba(238,161,17,.18);
  background: linear-gradient(180deg, rgba(238,161,17,.08), rgba(238,161,17,.03));
  color: rgba(255,245,226,.82);
  font-size: .77rem;
  line-height: 1.5;
}
```

---

## Motion

Transitions use `ease` with short durations.

| Context | Duration |
|---|---|
| Color / border hover | `0.18–0.2s ease` |
| Switch thumb | `0.2s ease` |
| Progress bar fill | `0.6s ease` |
| Section fade-in | `0.28s ease` |

Section entrance animation:
```css
@keyframes fadeIn {
  from { opacity: .2; transform: translateY(8px); }
  to   { opacity: 1;  transform: translateY(0); }
}
```

---

## Responsive Breakpoints

| Breakpoint | Layout changes |
|---|---|
| `≤1080px` | Graph grid → 2 col; zone grid → 3 col; diag grid → 2 col; settings → 2 col |
| `≤860px` | Topbar stacks vertically; zone panels → 1 col; probe grid → 2 col |
| `≤720px` | Shell padding → 12px; dashboard grid → 1 col; graph grid → 1 col |
| `≤600px` | Zone grid → 3 col |
| `≤560px` | Zone grid → 2 col; nav menu → 1 col; inputs → full width; card radius → 14px |

---

## Design Principles

1. **Dark-first** — all design decisions start from the dark background. Light elements are defined by controlled opacity layers, not raw white.
2. **Depth through gradients** — cards use subtle linear gradients (top lighter, bottom darker) with an inner top-edge highlight to simulate physical depth.
3. **Accent as signal** — the golden accent (`#EEA111`) is reserved for active states, live data, and primary actions. It should never be decorative.
4. **Uppercase for labels** — all labels, card titles, and status text use `text-transform: uppercase` with generous `letter-spacing` (`.7–1.1px`) to distinguish metadata from live values.
5. **Monospaced for numbers** — all dynamic numeric values (temperatures, percentages, counters) use Montserrat 800 weight with `letter-spacing: -.5px` to feel data-dense.
6. **State through color, not icons alone** — zone states are expressed through left-border colors, dot colors, and badge variants consistently across all views.
7. **No decorative shadows** — box shadows serve a functional purpose (depth, focus, glow for active elements). Glow effects are reserved for actively-on status indicators.
