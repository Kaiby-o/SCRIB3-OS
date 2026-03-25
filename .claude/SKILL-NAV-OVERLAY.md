# SKILL: Nav Overlay — 3-Layer Navigation System

> **Domain:** UI Interaction — Full-Screen Overlay Navigation
> **Applies to:** SCRIB3-OS layer only
> **Core component:** `<NavOverlay>` with `layer: 0 | 1 | 2` state machine

---

## Overview

The navigation system is a 3-layer overlay that expands from specific origin points with mechanical clip-path animations. It is the primary navigation for SCRIB3-OS — not a sidebar, not a dropdown, not a drawer.

---

## Layer States

```
Layer 0 — Dashboard (default)
  └── User clicks ≡ hamburger (top-right)
       └── Layer 1 — Full-screen black overlay
            └── User clicks a category label
                 └── Layer 2 — Full-screen pink sub-category overlay
```

### State Machine

```typescript
type NavLayer = 0 | 1 | 2

interface NavState {
  layer: NavLayer
  selectedCategory: string | null
  // Origin coordinates for Layer 2 animation (captured on category click)
  categoryOrigin: { x: number; y: number } | null
}
```

**Transitions:**
| From | Action | To |
|------|--------|----|
| 0 | Click `≡` | 1 |
| 1 | Click `×` or press `Escape` | 0 |
| 1 | Click category label | 2 |
| 2 | Click back arrow or press `Escape` | 1 |
| 2 | Click `×` | 0 (close everything) |

---

## Layer 0 — Dashboard Default

Not a separate component. This is the absence of overlay. The dashboard is visible with:

- **Top-left:** SCRIB3 logo
- **Top-centre:** `<PillNav>` bar
- **Top-right:** `≡` hamburger icon (triggers Layer 1)
- **Bottom-left:** `<UserProfileCard>` + `<ClockDisplay>`

The `≡` icon:
```css
/* Hamburger — three horizontal lines, Owners Wide weight */
.hamburger {
  font-family: 'Owners Wide', sans-serif;
  font-size: 24px;
  color: #000000;
  cursor: pointer;
  /* Position: fixed top-right within page padding */
  position: fixed;
  top: 30px;
  right: 40px;
  z-index: 50;
}
```

---

## Layer 1 — Black Full-Screen Overlay

**Trigger:** Click `≡`
**Animation origin:** Top-right corner of viewport
**Background:** `#000000` (S3 Black)
**Z-index:** 60 (above dashboard, below Layer 2)

### Layout

```
┌──────────────────────────────────────────────┐
│ [DARK/LIGHT toggle]                    [×]   │
│                                              │
│                                              │
│              TEAM                             │
│              UNITS                            │
│              CLIENTS                          │
│              PROJECTS                         │
│              CULTURE                          │
│              TOOLS                            │
│                                              │
│                                              │
│ [Having Issues? ___________]    Social Links  │
└──────────────────────────────────────────────┘
```

### Elements

**Category labels (centre):**
- Font: Kaio Black (weight 800)
- Size: 30px (`displayDash` token) — or larger if viewport allows. Match Figma.
- Colour: `#EAF2D7` (off-white text on black)
- Transform: uppercase
- `font-feature-settings: 'ordn' 1, 'dlig' 1`
- Spacing: tight vertical stack, `line-height: 0.88`
- Each label is clickable → transitions to Layer 2
- Capture click coordinates (`getBoundingClientRect()`) for Layer 2 origin

**Dark/Light toggle (top-left):**
- Pill-shaped container: `border-radius: 75.641px`, `border: 1px solid #EAF2D7`
- Two states: DARK (default) / LIGHT
- Active state fill: `#D7ABC5` (S3 Pink)
- Inactive state: transparent with off-white border
- Font: Owners Wide, `pillNav` token size
- On toggle: swap CSS custom properties (see SKILL-DARK-MODE.md when created)

**Close button (top-right):**
- `×` character or SVG cross
- Colour: `#EAF2D7`
- Position: fixed top-right, same position as the `≡` hamburger
- Click → transition to Layer 0

**"Having Issues?" input (bottom-left):**
- Pill-shaped: `border-radius: 75.641px`, `border: 1px solid #EAF2D7`
- Background: transparent
- Placeholder text: "Having Issues?" in Owners Wide, off-white
- Input type: email
- This is a support contact form — functionality TBD, shell only for now

**Social links (bottom-right):**
- Font: Owners Wide, `bodySml` token
- Colour: `#EAF2D7`
- Horizontal row of social platform links

---

## Layer 2 — Pink Sub-Category Overlay

**Trigger:** Click a category label in Layer 1
**Animation origin:** Position of the clicked label (captured coordinates)
**Background:** `#D7ABC5` (S3 Pink)
**Z-index:** 70 (above Layer 1)

### Layout

```
┌──────────────────────────────────────────────┐
│ [← Back]                               [×]   │
│                                              │
│                                              │
│              Directory                        │
│              Profiles                         │
│              Activity                         │
│                                              │
│                                              │
│                                              │
└──────────────────────────────────────────────┘
```

### Elements

**Sub-item labels (centre):**
- Font: Kaio Black (weight 800), same `displayDash` size
- Colour: `#000000` (black text on pink)
- Transform: uppercase
- Vertical stack, same layout as Layer 1 categories
- Each is a navigation link → navigate to route, close all overlays (Layer → 0)

**Back arrow (top-left):**
- `←` arrow or SVG chevron
- Colour: `#000000`
- Click → transition to Layer 1

**Close button (top-right):**
- `×` — same as Layer 1 but in `#000000`
- Click → transition to Layer 0 (close everything)

---

## Animation Specification

### Clip-Path Expansion

Both Layer 1 and Layer 2 use clip-path to expand from their origin point to full viewport.

```css
/* Starting state — collapsed to origin point */
.overlay-enter {
  clip-path: circle(0% at var(--origin-x) var(--origin-y));
}

/* Expanded state — full viewport */
.overlay-active {
  clip-path: circle(150% at var(--origin-x) var(--origin-y));
}
```

**Layer 1 origin:** `--origin-x: calc(100% - 40px); --origin-y: 30px;` (top-right, hamburger position)

**Layer 2 origin:** Dynamic — set via JS from the clicked category label's bounding rect centre.

### Easing & Duration

```css
.overlay {
  transition: clip-path 400ms cubic-bezier(0.22, 0.61, 0.36, 1);
}
```

**Mechanical cubic-bezier** — not `ease-in-out`. The motion should feel like a physical mechanism opening, not a UI panel fading.

- Duration: **400ms** for both open and close
- Close animation reverses the clip-path (circle shrinks back to origin)

### Alternative: Scale Transform

If clip-path causes performance issues (unlikely in modern browsers), fall back to:

```css
.overlay-enter {
  transform: scale(0);
  transform-origin: var(--origin-x) var(--origin-y);
  opacity: 0;
}

.overlay-active {
  transform: scale(1);
  opacity: 1;
  transition: transform 400ms cubic-bezier(0.22, 0.61, 0.36, 1),
              opacity 200ms ease;
}
```

Prefer clip-path — it gives a cleaner circular reveal.

---

## Component Structure

```typescript
interface NavOverlayProps {
  categories: NavCategory[]  // From dashboardConfig.ts
}

export function NavOverlay({ categories }: NavOverlayProps) {
  const [state, setState] = useState<NavState>({
    layer: 0,
    selectedCategory: null,
    categoryOrigin: null,
  })

  // Escape key handler
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setState(prev => ({
          ...prev,
          layer: prev.layer === 2 ? 1 : 0,
          selectedCategory: prev.layer === 2 ? null : prev.selectedCategory,
        }))
      }
    }
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [])

  const openLayer1 = () => setState({ layer: 1, selectedCategory: null, categoryOrigin: null })
  const closeAll = () => setState({ layer: 0, selectedCategory: null, categoryOrigin: null })

  const selectCategory = (label: string, e: React.MouseEvent) => {
    const rect = (e.target as HTMLElement).getBoundingClientRect()
    setState({
      layer: 2,
      selectedCategory: label,
      categoryOrigin: { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 },
    })
  }

  const backToLayer1 = () => setState(prev => ({ ...prev, layer: 1, selectedCategory: null }))

  // ... render Layer 1 and Layer 2 based on state.layer
}
```

---

## Keyboard & Accessibility

- `Escape` closes current layer (2 → 1 → 0)
- Focus trap: when Layer 1 or 2 is open, tab navigation stays within the overlay
- `aria-expanded` on hamburger button reflects overlay state
- `role="dialog"` on overlay containers
- Category labels are `<button>` elements, not `<div>` with onClick
- Body scroll locked when any overlay is open (`overflow: hidden` on `<body>`)

---

## Common Mistakes

| Mistake | Correct approach |
|---------|-----------------|
| Using `opacity` instead of `clip-path` | Clip-path gives the circular reveal effect from the origin point |
| Hardcoding category labels in the component | Categories come from `dashboardConfig.ts` via props |
| Separate overlay components per layer | One `<NavOverlay>` component with layer state |
| Using `ease-in-out` easing | Mechanical cubic-bezier only |
| Forgetting to capture click coordinates for Layer 2 | `getBoundingClientRect()` on the clicked label |
| Not locking body scroll | Add `overflow: hidden` to body when overlay is open |
