# SKILL-CRT.md — CRT Monitor Aesthetics for Browser Interfaces
**Expertise Level:** Expert / PhD-equivalent  
**Domain:** CSS + SVG + JS CRT simulation, browser-native only  
**No canvas dependency** unless explicitly unavoidable

---

## 1. Mental Model

A real CRT monitor works through:
1. **Electron beam** scanning horizontal lines top-to-bottom (scanlines)
2. **Phosphor persistence** — pixels glow and decay slowly (bloom/glow + trail)
3. **Mask/aperture grille** — the physical dot or slot pattern behind the glass
4. **Signal degradation** — noise, chroma aberration, sync issues from the signal chain
5. **Glass curvature** — the screen bows outward; edges distort slightly
6. **Ambient bleed** — the screen colour bleeds onto the bezel

Simulating these in browser = layering CSS filters, pseudo-elements, SVG filters, and timed JS perturbations. Each layer is independent. You compose them to taste.

---

## 2. Core Effect Stack

Apply these as composable CSS classes on a `.crt-screen` wrapper. Each is opt-in.

### 2.1 Scanlines

**Method 1 — CSS (preferred, zero DOM overhead):**
```css
.crt-scanlines::after {
  content: '';
  position: absolute;
  inset: 0;
  background: repeating-linear-gradient(
    to bottom,
    transparent 0px,
    transparent 2px,
    rgba(0, 0, 0, 0.18) 2px,
    rgba(0, 0, 0, 0.18) 4px
  );
  pointer-events: none;
  z-index: 10;
}
```

**Tuning:**
- Line density: change the `4px` repeat interval. 3px = fine pitch (high-res CRT), 6px = coarse (consumer TV)
- Opacity: `0.12`–`0.25` range. Above 0.3 feels heavy. Below 0.1 is invisible.
- Animated version (rolling scanline band):
```css
@keyframes scanroll {
  from { background-position: 0 0; }
  to   { background-position: 0 100px; }
}
.crt-scanlines-animated::after {
  animation: scanroll 8s linear infinite;
}
```

**Method 2 — SVG filter (for RGB sub-pixel simulation):**
```svg
<filter id="crt-mask">
  <feTile in="SourceGraphic" />
  <feComposite operator="in" />
</filter>
```
Use sparingly — feTile is expensive.

### 2.2 Phosphor Glow

**CSS filter approach:**
```css
.crt-glow {
  filter: 
    brightness(1.1)
    contrast(1.05)
    drop-shadow(0 0 4px var(--crt-green))
    drop-shadow(0 0 12px var(--crt-green))
    drop-shadow(0 0 24px rgba(57, 255, 20, 0.3));
}
```

**Text-specific glow (more performant — apply to text nodes, not containers):**
```css
.crt-text-glow {
  color: var(--crt-green);
  text-shadow:
    0 0 4px var(--crt-green),
    0 0 10px rgba(57, 255, 20, 0.6),
    0 0 20px rgba(57, 255, 20, 0.3);
}
```

**Amber mode:**
```css
.crt-amber .crt-text-glow {
  color: var(--crt-amber);
  text-shadow:
    0 0 4px var(--crt-amber),
    0 0 10px rgba(255, 176, 0, 0.6),
    0 0 20px rgba(255, 176, 0, 0.3);
}
```

**Phosphor persistence (afterglow):**
True phosphor decay requires canvas. CSS approximation:
```css
.crt-text {
  transition: opacity 80ms ease-out, text-shadow 120ms ease-out;
}
.crt-text.fading {
  opacity: 0.6;
  text-shadow: 0 0 8px var(--crt-green), 0 0 20px rgba(57,255,20,0.2);
}
```
Toggle `.fading` on text change via JS for a convincing persistence effect.

### 2.3 Screen Curvature (Barrel Distortion)

Pure CSS approach using `perspective` + `transform`:
```css
.crt-curved {
  border-radius: 8px / 12px; /* horizontal / vertical — slight barrel suggestion */
  overflow: hidden;
}
.crt-curved-screen {
  transform: perspective(800px) rotateX(0.5deg) rotateY(0deg);
  /* subtle — don't overdo */
}
```

SVG filter for actual barrel distortion (more realistic, higher cost):
```svg
<filter id="barrel-distort">
  <feDisplacementMap in="SourceGraphic" scale="8" xChannelSelector="R" yChannelSelector="G">
    <feFuncR type="gamma" amplitude="1" exponent="0.5" offset="0"/>
  </feDisplacementMap>
</filter>
```
Apply via `filter: url(#barrel-distort)` on `.crt-screen`. Performance: acceptable on Chromium, test on Safari.

### 2.4 Vignette (Edge Darkening)

```css
.crt-vignette::before {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(
    ellipse at center,
    transparent 55%,
    rgba(0, 0, 0, 0.6) 100%
  );
  pointer-events: none;
  z-index: 9;
  border-radius: inherit;
}
```

### 2.5 Signal Noise / Static

**Method 1 — CSS animation (low-cost, looping grain):**
```css
@keyframes noise {
  0%   { transform: translate(0, 0); }
  10%  { transform: translate(-2%, -3%); }
  20%  { transform: translate(3%, 2%); }
  30%  { transform: translate(-1%, 4%); }
  40%  { transform: translate(2%, -1%); }
  50%  { transform: translate(-3%, 3%); }
  60%  { transform: translate(1%, -2%); }
  70%  { transform: translate(-2%, 1%); }
  80%  { transform: translate(3%, -3%); }
  90%  { transform: translate(-1%, 2%); }
  100% { transform: translate(0, 0); }
}

.crt-noise::after {
  content: '';
  position: absolute;
  inset: -50%;
  width: 200%;
  height: 200%;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.08'/%3E%3C/svg%3E");
  animation: noise 0.3s steps(1) infinite;
  pointer-events: none;
  z-index: 11;
  opacity: 0.06;
}
```

**Method 2 — JS canvas-to-dataURL (for burst noise on transitions only):**
```javascript
function generateNoiseFrame(width = 300, height = 200, opacity = 0.08) {
  const canvas = document.createElement('canvas');
  canvas.width = width; canvas.height = height;
  const ctx = canvas.getContext('2d');
  const imageData = ctx.createImageData(width, height);
  for (let i = 0; i < imageData.data.length; i += 4) {
    const v = Math.random() * 255;
    imageData.data[i] = v;
    imageData.data[i+1] = v;
    imageData.data[i+2] = v;
    imageData.data[i+3] = opacity * 255;
  }
  ctx.putImageData(imageData, 0, 0);
  return canvas.toDataURL();
}
// Use only for transition burst frames — not continuous animation
```

### 2.6 Horizontal Sync Distortion (Signal Glitch)

Simulates horizontal sync errors — lines shift left/right momentarily:
```css
@keyframes hsync {
  0%   { clip-path: inset(0 0 98% 0); transform: translateX(0); }
  15%  { clip-path: inset(30% 0 68% 0); transform: translateX(4px); }
  15.1%{ clip-path: inset(30% 0 68% 0); transform: translateX(-2px); }
  30%  { clip-path: inset(0 0 0 0); transform: translateX(0); }
  100% { clip-path: inset(0 0 0 0); transform: translateX(0); }
}

.crt-glitch-layer {
  position: absolute;
  inset: 0;
  background: inherit;
  animation: hsync 0.15s steps(1) forwards;
  pointer-events: none;
}
```
Inject `.crt-glitch-layer` into `.crt-screen` via JS on state transitions, remove after animation completes.

---

## 3. Power-On Sequence

Full screen power-on (boot from black):

```css
@keyframes crt-power-on {
  0%   { 
    filter: brightness(0) contrast(1);
    transform: scaleY(0.02) scaleX(0.95);
  }
  8%   { 
    filter: brightness(3) contrast(1.5);
    transform: scaleY(0.02) scaleX(1);
  }
  15%  { 
    filter: brightness(1.5) contrast(1.2);
    transform: scaleY(1) scaleX(1);
  }
  20%  { filter: brightness(0.8) contrast(1); }
  25%  { filter: brightness(1.2) contrast(1.1); }
  30%  { filter: brightness(1) contrast(1); }
  100% { filter: brightness(1) contrast(1); }
}

.crt-screen.powering-on {
  animation: crt-power-on 0.6s cubic-bezier(0.25, 0, 0, 1) forwards;
}
```

This simulates: horizontal line expanding vertically (the beam warming), bright flash, then settling.

---

## 4. Screen Flicker

Subtle, non-distracting flicker on idle (authentically CRT — 60Hz refresh visible in low light):

```css
@keyframes crt-flicker {
  0%   { opacity: 1; }
  92%  { opacity: 1; }
  93%  { opacity: 0.94; }
  94%  { opacity: 1; }
  97%  { opacity: 1; }
  98%  { opacity: 0.97; }
  100% { opacity: 1; }
}

.crt-flicker {
  animation: crt-flicker 4s steps(1, end) infinite;
}
```

For state-change flicker (more aggressive, one-shot):
```css
@keyframes crt-flicker-burst {
  0%   { opacity: 1; }
  10%  { opacity: 0.6; }
  20%  { opacity: 1; }
  30%  { opacity: 0.8; }
  40%  { opacity: 1; }
  50%  { opacity: 0.7; }
  60%  { opacity: 1; }
  70%  { opacity: 0.9; }
  100% { opacity: 1; }
}
.crt-flicker-burst {
  animation: crt-flicker-burst 0.3s steps(1) forwards;
}
```

---

## 5. Typewriter / Terminal Text Reveal

### 5.1 CSS-only (width animation — monospace required):
```css
.typewriter {
  font-family: 'JetBrains Mono', monospace;
  white-space: nowrap;
  overflow: hidden;
  border-right: 2px solid var(--crt-green); /* cursor */
  width: 0;
  animation: 
    typing 1.5s steps(30, end) forwards,
    blink-cursor 0.8s step-end infinite;
}

@keyframes typing {
  from { width: 0; }
  to   { width: 100%; }
}

@keyframes blink-cursor {
  from, to { border-color: transparent; }
  50%      { border-color: var(--crt-green); }
}
```
**Limitation:** Requires fixed known string length for steps count. For dynamic content, use JS.

### 5.2 JS Typewriter (dynamic content):
```javascript
async function typewrite(el, text, speed = 40, glowClass = 'crt-text-glow') {
  el.textContent = '';
  el.classList.add(glowClass);
  for (const char of text) {
    el.textContent += char;
    await new Promise(r => setTimeout(r, speed));
  }
}

// Sequential lines:
async function typewriteLines(container, lines, speed = 35) {
  for (const line of lines) {
    const el = document.createElement('div');
    el.className = 'terminal-line';
    container.appendChild(el);
    await typewrite(el, line, speed);
    await new Promise(r => setTimeout(r, 80)); // pause between lines
  }
}
```

---

## 6. Screen Reflection / Glass Layer

```css
.crt-glass::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.04) 0%,
    transparent 40%,
    transparent 60%,
    rgba(255, 255, 255, 0.02) 100%
  );
  pointer-events: none;
  z-index: 12;
}
```

---

## 7. Chromatic Aberration (RGB Fringe)

Simulates colour channel misalignment on old glass:

```css
.crt-aberration {
  position: relative;
}
.crt-aberration::before,
.crt-aberration::after {
  content: attr(data-text);
  position: absolute;
  top: 0; left: 0;
  width: 100%; height: 100%;
  pointer-events: none;
}
.crt-aberration::before {
  color: rgba(255, 0, 0, 0.15);
  transform: translateX(-1.5px);
  mix-blend-mode: screen;
}
.crt-aberration::after {
  color: rgba(0, 0, 255, 0.15);
  transform: translateX(1.5px);
  mix-blend-mode: screen;
}
```
Note: Requires `data-text` attribute matching text content. Use sparingly — on headers or alert text, not body.

---

## 8. Ambient Screen Bleed (Bezel Glow)

The screen colour bleeds onto the device bezel:

```css
.device-bezel {
  position: relative;
}
.device-bezel::after {
  content: '';
  position: absolute;
  inset: -8px;
  border-radius: inherit;
  background: transparent;
  box-shadow: 
    inset 0 0 20px rgba(57, 255, 20, 0.08),
    0 0 30px rgba(57, 255, 20, 0.06),
    0 0 60px rgba(57, 255, 20, 0.03);
  pointer-events: none;
  z-index: -1;
}
```

---

## 9. Performance Guidelines

| Effect | Cost | Notes |
|---|---|---|
| CSS scanlines | Very low | Use `::after` pseudo, no DOM node |
| CSS glow (text-shadow) | Low–medium | Limit shadow layers to 3 max |
| `filter: drop-shadow` on containers | Medium | Forces GPU layer; can cause stacking context issues |
| SVG feTurbulence (continuous) | High | Use only on transitions, remove after |
| Canvas noise (burst) | Low (one-shot) | Generate once per transition, not per frame |
| CSS flicker (opacity) | Very low | GPU composited |
| Chromatic aberration (`::before/after`) | Low | Avoid on rapidly updating text |

**Critical:** Do not apply `filter` to elements with many descendants — it forces a new stacking context and can break `z-index` behaviour. Apply to leaf nodes or isolated containers.

**GPU hint where needed:**
```css
.crt-screen {
  will-change: transform, filter;
  transform: translateZ(0); /* force GPU layer */
}
```

---

## 10. Full Composition Example

```css
.crt-screen {
  position: relative;
  background: var(--hw-dark);
  border-radius: 6px;
  overflow: hidden;
  transform: translateZ(0);
}

/* Layer order (z-index):
   1. Content
   8. Scanlines overlay
   9. Vignette
   10. Noise
   11. Glass reflection
   12. Glitch (transient)
*/
```

Apply classes:
- `.crt-scanlines` — always on
- `.crt-glow` — on text containers
- `.crt-vignette` — always on
- `.crt-noise` — on transitions or always at low opacity
- `.crt-glass` — always on
- `.crt-flicker` — always on (subtle timing)
- `.crt-curved` — on the screen frame, not the content div
- `.crt-aberration` — on key headings only
- `.crt-glitch-layer` — inject/remove on state transitions

---

## 11. SCRIB3-OS Specific Config

```css
:root {
  --crt-green: #39FF14;
  --crt-amber: #FFB000;
  --crt-dim: #1A2A1A;
  --crt-scanline-opacity: 0.15;
  --crt-glow-intensity: 0.6;
  --crt-flicker-duration: 4s;
}

/* Mode toggle — JS sets this on .crt-screen */
.crt-screen[data-mode="green"] { --crt-primary: var(--crt-green); }
.crt-screen[data-mode="amber"] { --crt-primary: var(--crt-amber); }
```

Default mode: green for TEAM, amber for CLIENT, green for CONTRACTOR.

---
*SKILL-CRT.md — End*
