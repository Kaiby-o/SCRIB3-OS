# SKILL-HARDWARE-CHROME.md — CSS/SVG Hardware Detail Rendering
**Expertise Level:** Expert  
**Domain:** Browser-native hardware UI simulation — no image assets required  
**Context:** SCRIB3-OS device aesthetic: white + blush/pink, ruggedised field device, CRT screen, exposed hardware

---

## 1. Design System Foundation

The SCRIB3-OS hardware aesthetic draws from:
- Ruggedised field devices (Toughbook, military handhelds)
- Scientific instrumentation (oscilloscopes, spectrum analysers)
- 90s industrial computing hardware
- The specific reference device: white chassis, blush/pink accents, exposed screw heads, knobs, barcodes

Every UI surface should read as **manufactured**, not designed. There is no decoration for its own sake — every visual element implies function.

---

## 2. CSS Custom Properties — Full Hardware Token Set

```css
:root {
  /* Chassis */
  --hw-white: #F2EDE8;
  --hw-white-dark: #E6E0D8;  /* recessed surfaces */
  --hw-white-light: #FAF7F4; /* raised surfaces */
  --hw-blush: #E8A49C;
  --hw-blush-dark: #D4908A;
  --hw-blush-light: #F0BCB6;
  --hw-chrome: #C8C0B8;
  --hw-chrome-dark: #9C9490;
  --hw-chrome-light: #DCD8D4;
  --hw-dark: #1A1A1A;
  --hw-dark-mid: #2A2A2A;

  /* Screen */
  --crt-green: #39FF14;
  --crt-amber: #FFB000;
  --crt-dim: #1A2A1A;

  /* Status */
  --status-ok: #39FF14;
  --status-warn: #FFB000;
  --status-err: #FF3B3B;

  /* Geometry */
  --hw-corner-radius: 8px;
  --hw-panel-gap: 8px;
  --hw-screw-size: 12px;
  --hw-border-width: 2px;
  --hw-bevel-width: 1px;

  /* Shadows */
  --hw-raised-shadow: 
    inset 0 1px 0 var(--hw-white-light),
    inset 0 -1px 0 var(--hw-chrome),
    0 2px 4px rgba(0,0,0,0.2);
  --hw-inset-shadow:
    inset 0 2px 4px rgba(0,0,0,0.3),
    inset 0 1px 0 rgba(0,0,0,0.1);
  --hw-screen-shadow:
    inset 0 0 0 3px #111,
    inset 0 0 0 4px var(--hw-chrome-dark),
    0 4px 12px rgba(0,0,0,0.5);
}
```

---

## 3. Component Library

### 3.1 Screw Head

Visible screw heads at panel corners and joints — a critical hardware authenticity signal.

```css
.hw-screw {
  width: var(--hw-screw-size);
  height: var(--hw-screw-size);
  border-radius: 50%;
  background: radial-gradient(
    circle at 35% 35%,
    var(--hw-chrome-light) 0%,
    var(--hw-chrome) 40%,
    var(--hw-chrome-dark) 100%
  );
  box-shadow:
    0 1px 2px rgba(0,0,0,0.3),
    inset 0 1px 0 rgba(255,255,255,0.3);
  position: relative;
  flex-shrink: 0;
}

/* Phillips cross */
.hw-screw::before,
.hw-screw::after {
  content: '';
  position: absolute;
  background: rgba(0,0,0,0.4);
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
.hw-screw::before {
  width: 55%;
  height: 2px;
}
.hw-screw::after {
  width: 2px;
  height: 55%;
}

/* Slot head variant */
.hw-screw.slot::before { width: 60%; height: 2px; }
.hw-screw.slot::after  { display: none; }

/* Sizes */
.hw-screw.sm { --hw-screw-size: 8px; }
.hw-screw.lg { --hw-screw-size: 16px; }
```

**React component:**
```tsx
function Screw({ type = 'phillips', size = 'md', className = '' }) {
  return <div className={`hw-screw ${type} ${size} ${className}`} aria-hidden="true" />;
}
```

### 3.2 Panel with Corner Screws

Standard panel frame with 4 corner screws — the base of all modules:

```css
.hw-panel {
  position: relative;
  background: var(--hw-white);
  border-radius: var(--hw-corner-radius);
  padding: 20px;
  box-shadow: var(--hw-raised-shadow);
  border: var(--hw-bevel-width) solid var(--hw-chrome);
}

/* Corner screw positioning helper */
.hw-panel .screw-tl { position: absolute; top: 6px; left: 6px; }
.hw-panel .screw-tr { position: absolute; top: 6px; right: 6px; }
.hw-panel .screw-bl { position: absolute; bottom: 6px; left: 6px; }
.hw-panel .screw-br { position: absolute; bottom: 6px; right: 6px; }
```

```tsx
function HWPanel({ children, className = '' }) {
  return (
    <div className={`hw-panel ${className}`}>
      <Screw className="screw-tl" />
      <Screw className="screw-tr" />
      <Screw className="screw-bl" />
      <Screw className="screw-br" />
      {children}
    </div>
  );
}
```

### 3.3 Bevelled Edge Treatment

```css
.hw-bevel {
  background: var(--hw-white);
  border: 1px solid var(--hw-chrome-dark);
  box-shadow:
    inset 0 1px 0 var(--hw-white-light),
    inset 1px 0 0 var(--hw-white-light),
    inset 0 -1px 0 var(--hw-chrome),
    inset -1px 0 0 var(--hw-chrome);
}

/* Deep bevel for recessed areas */
.hw-bevel-inset {
  background: var(--hw-white-dark);
  box-shadow:
    inset 0 2px 3px rgba(0,0,0,0.15),
    inset 0 1px 0 rgba(0,0,0,0.1);
  border: 1px solid var(--hw-chrome-dark);
}
```

### 3.4 Screen Bezel

The CRT screen surround — critical for hardware authenticity:

```css
.hw-screen-bezel {
  position: relative;
  border-radius: 10px;
  background: #111;
  padding: 4px;
  box-shadow:
    inset 0 0 0 2px #0A0A0A,
    inset 0 0 0 4px var(--hw-chrome-dark),
    0 6px 16px rgba(0,0,0,0.6),
    0 2px 4px rgba(0,0,0,0.4);
}

.hw-screen-bezel::before {
  content: '';
  position: absolute;
  inset: 4px;
  border-radius: 6px;
  box-shadow: inset 0 0 0 1px rgba(255,255,255,0.05);
  pointer-events: none;
  z-index: 1;
}
```

### 3.5 Barcode Strip (SVG)

Decorative barcodes — rendered via SVG data URI or inline SVG:

```typescript
// Generate barcode-like SVG pattern (decorative, not real EAN/QR)
function generateBarcode(width = 120, height = 24, seed = 42): string {
  const bars: string[] = [];
  let x = 0;
  const rng = (n: number) => ((n * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff;
  
  while (x < width) {
    const barWidth = Math.floor(rng(seed + x) * 3) + 1; // 1–3px bars
    const isBlack = Math.floor(rng(seed + x + 1) * 2) === 0;
    if (isBlack) {
      bars.push(`<rect x="${x}" y="0" width="${barWidth}" height="${height}" fill="#1A1A1A"/>`);
    }
    x += barWidth;
  }
  
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
    <rect width="${width}" height="${height}" fill="#F2EDE8"/>
    ${bars.join('')}
  </svg>`;
}

// Use as background-image:
// background-image: url("data:image/svg+xml,...encodedSVG...");
```

CSS barcode strip using repeating-linear-gradient (simpler, no JS):
```css
.hw-barcode {
  height: 24px;
  background-image: repeating-linear-gradient(
    to right,
    #1A1A1A 0px, #1A1A1A 2px,
    transparent 2px, transparent 4px,
    #1A1A1A 4px, #1A1A1A 5px,
    transparent 5px, transparent 8px,
    #1A1A1A 8px, #1A1A1A 10px,
    transparent 10px, transparent 13px,
    #1A1A1A 13px, #1A1A1A 14px,
    transparent 14px, transparent 18px,
    #1A1A1A 18px, #1A1A1A 21px,
    transparent 21px, transparent 24px,
    #1A1A1A 24px, #1A1A1A 25px,
    transparent 25px, transparent 30px
  );
  /* Repeat at ~30px for variety */
}
```

### 3.6 Speaker Grille

```css
.hw-speaker-grille {
  background-image: repeating-linear-gradient(
    to bottom,
    rgba(0,0,0,0.15) 0px,
    rgba(0,0,0,0.15) 1px,
    transparent 1px,
    transparent 4px
  );
  border-left: 1px solid rgba(0,0,0,0.1);
  border-right: 1px solid rgba(0,0,0,0.1);
  /* Combine with vertical lines: */
  background-image:
    repeating-linear-gradient(
      to bottom,
      rgba(0,0,0,0.12) 0px, rgba(0,0,0,0.12) 1px,
      transparent 1px, transparent 4px
    ),
    repeating-linear-gradient(
      to right,
      rgba(0,0,0,0.06) 0px, rgba(0,0,0,0.06) 1px,
      transparent 1px, transparent 8px
    );
}
```

### 3.7 Indicator Light

```css
.hw-indicator {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--hw-blush);
  box-shadow: 0 0 4px var(--hw-blush);
  position: relative;
}

/* Active state — green, pulsing */
.hw-indicator.active {
  background: var(--status-ok);
  box-shadow: 0 0 6px var(--status-ok), 0 0 12px rgba(57,255,20,0.4);
  animation: indicator-pulse 2s ease-in-out infinite;
}

/* Error state */
.hw-indicator.error {
  background: var(--status-err);
  box-shadow: 0 0 6px var(--status-err);
  animation: indicator-blink 0.5s step-end infinite;
}

@keyframes indicator-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

@keyframes indicator-blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}
```

### 3.8 Embossed Label

Text that appears pressed into the chassis surface:

```css
.hw-label-embossed {
  font-family: 'Share Tech Mono', monospace;
  font-size: 10px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--hw-white-dark);
  text-shadow:
    0 1px 0 var(--hw-white-light),
    0 -1px 0 rgba(0,0,0,0.15);
}
```

### 3.9 Raised Button (Function Keys)

```css
.hw-button {
  background: linear-gradient(
    to bottom,
    var(--hw-white-light) 0%,
    var(--hw-white) 40%,
    var(--hw-white-dark) 100%
  );
  border: 1px solid var(--hw-chrome-dark);
  border-radius: 4px;
  box-shadow:
    0 3px 0 var(--hw-chrome-dark),
    0 4px 4px rgba(0,0,0,0.2),
    inset 0 1px 0 var(--hw-white-light);
  cursor: pointer;
  transition: transform 0.05s, box-shadow 0.05s;
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--hw-chrome-dark);
}

.hw-button:active {
  transform: translateY(2px);
  box-shadow:
    0 1px 0 var(--hw-chrome-dark),
    0 2px 2px rgba(0,0,0,0.15),
    inset 0 1px 2px rgba(0,0,0,0.1);
}
```

### 3.10 Toggle Switch

```css
.hw-toggle {
  position: relative;
  width: 32px;
  height: 16px;
  background: var(--hw-white-dark);
  border: 1px solid var(--hw-chrome-dark);
  border-radius: 2px;
  box-shadow: var(--hw-inset-shadow);
  cursor: pointer;
}

.hw-toggle::after {
  content: '';
  position: absolute;
  top: 2px;
  left: 2px;
  width: 10px;
  height: 10px;
  background: linear-gradient(to bottom, var(--hw-white-light), var(--hw-chrome));
  border-radius: 1px;
  box-shadow: 0 1px 2px rgba(0,0,0,0.3);
  transition: transform 0.15s cubic-bezier(0.25, 0, 0, 1);
}

.hw-toggle.on::after {
  transform: translateX(16px);
}

.hw-toggle.on {
  background: rgba(57, 255, 20, 0.1);
  border-color: var(--crt-green);
}
```

### 3.11 Rotary Knob

Rendered as CSS (reference: AUX-CTRL.png dial):

```css
.hw-knob {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: radial-gradient(
    circle at 35% 30%,
    #3A3A3A 0%,
    #1A1A1A 60%,
    #0A0A0A 100%
  );
  border: 3px solid var(--hw-chrome);
  box-shadow:
    0 4px 8px rgba(0,0,0,0.5),
    inset 0 1px 0 rgba(255,255,255,0.15),
    inset 0 -1px 0 rgba(0,0,0,0.4);
  position: relative;
  cursor: pointer;
}

/* Position indicator tick */
.hw-knob::after {
  content: '';
  position: absolute;
  top: 6px;
  left: 50%;
  transform: translateX(-50%);
  width: 2px;
  height: 8px;
  background: var(--hw-blush);
  border-radius: 1px;
}

/* Knob ring markings (outer ring) */
.hw-knob-ring {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  border: 1px solid rgba(200,192,184,0.4);
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: conic-gradient(
    from 225deg,
    var(--hw-chrome-dark) 0deg 4deg,
    transparent 4deg 30deg
  );
  /* Creates tick marks around the ring */
}
```

### 3.12 Card Slot (Login Card Receiver)

The slot at the bottom of the primary device into which the data module inserts:

```css
.hw-card-slot {
  width: 60%;
  height: 8px;
  background: #0A0A0A;
  border-radius: 2px;
  margin: 0 auto;
  position: relative;
  box-shadow:
    inset 0 2px 4px rgba(0,0,0,0.8),
    0 1px 0 var(--hw-chrome-dark);
}

/* Slot lips */
.hw-card-slot::before,
.hw-card-slot::after {
  content: '';
  position: absolute;
  top: -4px;
  width: 20px;
  height: 4px;
  background: var(--hw-white-dark);
  box-shadow: inset 0 2px 3px rgba(0,0,0,0.2);
}
.hw-card-slot::before { left: 0; }
.hw-card-slot::after  { right: 0; }

/* Active (card accepted) state */
.hw-card-slot.active {
  box-shadow:
    inset 0 2px 4px rgba(0,0,0,0.8),
    0 0 8px rgba(232,164,156,0.4);
  border: 1px solid var(--hw-blush);
}
```

---

## 4. Data Module Card (Login Screen)

Full card composition matching `CRT-ENTRY.png`:

```css
.data-module-card {
  /* Landscape hardware card */
  width: 640px;
  height: 300px;
  background: var(--hw-white);
  border-radius: 12px;
  border: 2px solid var(--hw-chrome);
  box-shadow:
    var(--hw-raised-shadow),
    0 12px 40px rgba(0,0,0,0.4);
  position: relative;
  display: grid;
  grid-template-columns: 60px 1fr 200px 80px;
  gap: 0;
  overflow: hidden;
}

/* Left contact strip (gold SIM-style contacts) */
.module-contacts {
  background: #B8960C;
  width: 16px;
  height: 80%;
  margin: auto 0;
  border-radius: 2px;
  background: repeating-linear-gradient(
    to bottom,
    #C8A020 0px,
    #C8A020 6px,
    #8A6A08 6px,
    #8A6A08 8px,
    #C8A020 8px,
    #C8A020 14px,
    transparent 14px,
    transparent 16px
  );
  box-shadow: 0 0 2px rgba(0,0,0,0.3);
}

/* Right blush cartridge tab */
.module-tab {
  background: var(--hw-blush);
  width: 40px;
  height: 60%;
  border-radius: 0 8px 8px 0;
  align-self: center;
  position: relative;
  box-shadow: 2px 0 4px rgba(0,0,0,0.2);
}

/* Header row */
.module-header {
  font-family: 'Share Tech Mono', monospace;
  font-size: 22px;
  font-weight: 400;
  letter-spacing: 0.08em;
  color: var(--hw-dark);
}

.module-sub {
  font-family: 'JetBrains Mono', monospace;
  font-size: 10px;
  letter-spacing: 0.15em;
  color: var(--hw-chrome-dark);
  text-transform: uppercase;
}

/* Form fields on card */
.module-field-label {
  font-family: 'JetBrains Mono', monospace;
  font-size: 9px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--hw-chrome-dark);
  display: flex;
  align-items: center;
  gap: 6px;
}

.module-field-label::after {
  content: '';
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--hw-blush);
  flex-shrink: 0;
}

.module-input {
  width: 100%;
  background: var(--hw-dark);
  border: none;
  border-radius: 2px;
  padding: 8px 10px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 13px;
  color: var(--crt-green);
  caret-color: var(--crt-green);
  outline: none;
  letter-spacing: 0.06em;
  box-shadow: var(--hw-inset-shadow);
}

.module-input:focus {
  box-shadow: var(--hw-inset-shadow), 0 0 0 1px var(--crt-green);
}
```

---

## 5. Typography Rules

```css
/* Hardware UI typography — all monospace, all caps labels */

.hw-label {
  font-family: 'Share Tech Mono', monospace;
  font-size: 11px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--hw-chrome-dark);
}

.hw-value {
  font-family: 'JetBrains Mono', monospace;
  font-size: 13px;
  letter-spacing: 0.06em;
  color: var(--hw-dark);
}

.hw-terminal {
  font-family: 'JetBrains Mono', monospace;
  font-size: 12px;
  letter-spacing: 0.04em;
  color: var(--crt-green);
  line-height: 1.6;
}

/* Measurement ruler strip (decorative) */
.hw-ruler {
  height: 12px;
  background-image: repeating-linear-gradient(
    to right,
    var(--hw-chrome-dark) 0px,
    var(--hw-chrome-dark) 1px,
    transparent 1px,
    transparent 4px,
    var(--hw-chrome-dark) 4px,
    var(--hw-chrome-dark) 5px,
    transparent 5px,
    transparent 9px,
    var(--hw-chrome-dark) 9px,
    var(--hw-chrome-dark) 10px,
    transparent 10px,
    transparent 19px,
    var(--hw-chrome-dark) 19px,
    var(--hw-chrome-dark) 20px,
    transparent 20px,
    transparent 29px,
    var(--hw-chrome-dark) 29px,
    var(--hw-chrome-dark) 30px,
    transparent 30px,
    transparent 39px
  );
  opacity: 0.4;
}
```

---

## 6. Panel Layout Grid (Device Canvas)

```css
/* The outer device frame */
.device-unit {
  background: var(--hw-white);
  border-radius: 16px;
  border: 2px solid var(--hw-chrome-dark);
  box-shadow:
    var(--hw-raised-shadow),
    0 20px 60px rgba(0,0,0,0.4);
  position: relative;
}

/* The screen area within the device */
.device-screen-area {
  background: #0A0A0A;
  border-radius: 8px;
  overflow: hidden;
  border: 3px solid #0A0A0A;
  box-shadow: var(--hw-screen-shadow);
}

/* Control area below screen */
.device-controls {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px 16px;
  border-top: 1px solid var(--hw-chrome-dark);
}
```

---

## 7. Animation — Hardware Interactions

### Button Press
```css
.hw-button { transition: transform 60ms, box-shadow 60ms; }
.hw-button:active {
  transform: translateY(2px);
  /* Reduce shadow to simulate physical depression */
}
```

### Toggle Flip
```css
.hw-toggle::after { transition: transform 120ms cubic-bezier(0.25, 0, 0, 1); }
```

### Indicator Light Boot Sequence
```javascript
async function bootIndicatorSequence(indicators) {
  for (const indicator of indicators) {
    indicator.classList.remove('active', 'error');
    indicator.style.background = '#333'; // dark
    await sleep(50);
    indicator.style.background = 'var(--hw-blush)'; // test flash
    await sleep(100);
    indicator.style.background = 'var(--status-ok)'; // online
    indicator.classList.add('active');
    await sleep(80);
  }
}
```

---

## 8. Component Inventory Checklist

Use this as a build checklist — every screen/module in SCRIB3-OS should include:

- [ ] **4× corner screws** — all panels
- [ ] **Bevelled edge** — all panels
- [ ] **Screen bezel** — all screen modules
- [ ] **Barcode strip** — primary unit, data module card
- [ ] **Indicator light(s)** — per module (shows active state)
- [ ] **Module ID label** (embossed) — each hardware panel
- [ ] **Speaker grille** — primary unit chassis
- [ ] **Card slot** — primary unit bottom edge
- [ ] **Ruler strip** — data module card
- [ ] **Logo mark** — SCRIB3 mark on primary unit
- [ ] **Knob** (rendered CSS) — primary unit control area
- [ ] **Function buttons** — primary unit control row

---
*SKILL-HARDWARE-CHROME.md — End*
