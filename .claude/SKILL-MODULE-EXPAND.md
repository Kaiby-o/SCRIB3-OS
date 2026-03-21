# SKILL-MODULE-EXPAND.md — Modular Screen Expansion Animation System
**Expertise Level:** PhD  
**Domain:** Hardware module reveal animations, mechanical UI choreography, z-depth panel systems, 60fps CSS/JS animation architecture  
**Target Environment:** Browser-native (CSS transitions + Web Animations API + JS orchestration; no GSAP required but GSAP paths documented)

---

## CORE PHILOSOPHY

The expansion system must feel like physical hardware being connected, not software panels sliding in. The mental model is: each module exists behind the primary unit, physically docked but inactive. Activating a module means it physically emerges — hinged, slotted, or railed — from behind the primary chassis. The primary unit never moves. Modules dock to it.

Key mechanical metaphors to reference:
- **Magnetic snap:** Final micro-movement as connector seats
- **Mechanical reveal:** Graduated emergence with physical resistance feel
- **Layered z-depth:** Modules stack at defined z-intervals; stacking order is visible as parallax offset during animation
- **Hardware port:** Each module has a visible connection point that meets the primary unit

---

## 1. ARCHITECTURE OVERVIEW

### 1.1 Coordinate System

The primary device unit is the origin. All modules reference it.

```
                    [MOD-03: Timeline — slides UP]
                           ↑
[MOD-04: Comms]  ←  [PRIMARY UNIT]  →  [MOD-02: Files]
[MOD-01: Tasks]  ←                  →  [MOD-05: Approvals]
                           ↓
                    [MOD-06: Leaderboard — slides DOWN]
```

Modules on the same axis are stacked: left-1 (MOD-01) and left-2 (MOD-04) occupy the same axis but different z/offset positions.

### 1.2 State Machine

```typescript
type ModuleState = 'docked' | 'emerging' | 'active' | 'retracting' | 'background';

interface ModuleConfig {
  id: string;
  direction: 'left' | 'right' | 'top' | 'bottom';
  slot: 1 | 2; // Primary or secondary on same axis
  width: number; // px
  height: number; // px — typically matches primary unit height
  zIndex: number; // Lower than primary (100)
}

// Module registry
const MODULES: ModuleConfig[] = [
  { id: 'MOD-01', direction: 'left',   slot: 1, width: 320, height: 560, zIndex: 80 },
  { id: 'MOD-02', direction: 'right',  slot: 1, width: 320, height: 560, zIndex: 80 },
  { id: 'MOD-03', direction: 'top',    slot: 1, width: 700, height: 280, zIndex: 75 },
  { id: 'MOD-04', direction: 'left',   slot: 2, width: 280, height: 560, zIndex: 70 },
  { id: 'MOD-05', direction: 'right',  slot: 2, width: 280, height: 560, zIndex: 70 },
  { id: 'MOD-06', direction: 'bottom', slot: 1, width: 700, height: 240, zIndex: 75 },
];
```

---

## 2. CSS FOUNDATION

### 2.1 Module Positioning (CSS)

```css
.device-array {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  /* The array must be wide enough to accommodate all modules + primary */
  width: 100vw;
  height: 100vh;
  overflow: visible; /* Modules exist outside viewport origin before expansion */
}

.primary-unit {
  position: relative;
  z-index: 100;
  /* Fixed size — reference images ~700px × 560px */
  width: 700px;
  height: 560px;
  flex-shrink: 0;
}

.module-panel {
  position: absolute;
  /* Start docked behind primary unit */
  transition: none; /* JS controls transitions */
  will-change: transform, opacity;
  /* Hardware acceleration */
  transform: translateZ(0);
  backface-visibility: hidden;
}

/* Left-axis modules */
.module-panel[data-direction="left"] {
  right: calc(100% - 2px); /* 2px overlap for connector aesthetic */
  top: 0;
}

/* Right-axis modules */  
.module-panel[data-direction="right"] {
  left: calc(100% - 2px);
  top: 0;
}

/* Top-axis modules */
.module-panel[data-direction="top"] {
  bottom: calc(100% - 2px);
  left: 50%;
  transform-origin: bottom center;
}

/* Bottom-axis modules */
.module-panel[data-direction="bottom"] {
  top: calc(100% - 2px);
  left: 50%;
  transform-origin: top center;
}
```

### 2.2 Docked State (hidden behind primary)

```css
/* All modules start in docked state */
.module-panel--docked {
  /* Left modules: hidden behind primary, offset right */
  --docked-x-left: calc(100% - 8px);
  --docked-x-right: calc(-100% + 8px);
  
  opacity: 0;
  pointer-events: none;
  z-index: 50; /* Below primary */
}

.module-panel[data-direction="left"].module-panel--docked {
  transform: translateX(var(--docked-x-left));
}

.module-panel[data-direction="right"].module-panel--docked {
  transform: translateX(var(--docked-x-right));
}

.module-panel[data-direction="top"].module-panel--docked {
  transform: translateY(100%) translateX(-50%);
}

.module-panel[data-direction="bottom"].module-panel--docked {
  transform: translateY(-100%) translateX(-50%);
}
```

---

## 3. ANIMATION SYSTEM — WEB ANIMATIONS API

### 3.1 Core Timing Functions

```javascript
// Mechanical easing — NOT smooth curves. Physical resistance + snap.
const EASING = {
  // Standard mechanical emerge: slow start (weight), fast travel, decelerate to seat
  emerge: 'cubic-bezier(0.25, 0.0, 0.1, 1.0)',
  
  // Magnetic snap: accelerate toward end (approaching magnet)
  magnetSnap: 'cubic-bezier(0.4, 0.0, 0.8, 1.0)',
  
  // Retract: fast pullback, slight bounce as it clears
  retract: 'cubic-bezier(0.7, 0.0, 1.0, 0.8)',
  
  // Seat: the final micro-movement as connector locks
  seat: 'cubic-bezier(0.0, 0.0, 0.2, 1.4)', // Slight overshoot
};
```

### 3.2 Module Emerge Animation (Left/Right)

```javascript
async function emergeModule(moduleEl, direction, options = {}) {
  const duration = options.duration ?? 420; // ms
  const delay = options.delay ?? 0;
  
  // Phase 1: Main travel (80% of duration)
  // Phase 2: Magnetic snap + seat (20% of duration)
  
  const travelDuration = duration * 0.8;
  const snapDuration = duration * 0.2;
  
  const isLeft = direction === 'left';
  const isTop = direction === 'top';
  const isBottom = direction === 'bottom';
  
  // Set initial state
  if (isLeft || direction === 'right') {
    moduleEl.style.transform = isLeft 
      ? `translateX(calc(100% - 8px))` 
      : `translateX(calc(-100% + 8px))`;
  } else {
    moduleEl.style.transform = isTop 
      ? `translateY(100%) translateX(-50%)` 
      : `translateY(-100%) translateX(-50%)`;
  }
  moduleEl.style.opacity = '0';
  moduleEl.style.pointerEvents = 'none';
  moduleEl.style.zIndex = options.zIndex ?? '80';
  moduleEl.classList.remove('module-panel--docked');
  
  await sleep(delay);
  
  // Phase 1: Travel out from behind primary
  const travelTarget = isLeft ? 'translateX(-12px)'  // Slight overshoot left
    : direction === 'right' ? 'translateX(12px)'       // Slight overshoot right
    : isTop ? 'translateY(-12px) translateX(-50%)'
    : 'translateY(12px) translateX(-50%)';
  
  const travel = moduleEl.animate([
    { transform: moduleEl.style.transform, opacity: '0' },
    { transform: travelTarget, opacity: '1', offset: 0.3 },
    { transform: travelTarget, opacity: '1' }
  ], {
    duration: travelDuration,
    easing: EASING.emerge,
    fill: 'forwards'
  });
  
  await travel.finished;
  
  // Phase 2: Magnetic snap to final position (0 offset)
  const finalTarget = isLeft ? 'translateX(0)'
    : direction === 'right' ? 'translateX(0)'
    : isTop ? 'translateY(0) translateX(-50%)'
    : 'translateY(0) translateX(-50%)';
  
  const snap = moduleEl.animate([
    { transform: travelTarget },
    { transform: finalTarget }
  ], {
    duration: snapDuration,
    easing: EASING.seat,
    fill: 'forwards'
  });
  
  await snap.finished;
  
  // Trigger connection sound effect (optional)
  playMechanicalSnap();
  
  // Enable interaction
  moduleEl.style.pointerEvents = 'auto';
  moduleEl.classList.add('module-panel--active');
  
  // Power on the module screen
  await modulePowerOn(moduleEl);
}
```

### 3.3 Module Retract Animation

```javascript
async function retractModule(moduleEl, direction, options = {}) {
  const duration = options.duration ?? 320;
  
  moduleEl.style.pointerEvents = 'none';
  moduleEl.classList.remove('module-panel--active');
  
  // Phase 1: Screen powers off
  await modulePowerOff(moduleEl);
  
  // Phase 2: Physical retraction
  const isLeft = direction === 'left';
  const isTop = direction === 'top';
  const isBottom = direction === 'bottom';
  
  const retractTarget = isLeft ? `translateX(calc(100% - 8px))`
    : direction === 'right' ? `translateX(calc(-100% + 8px))`
    : isTop ? `translateY(100%) translateX(-50%)`
    : `translateY(-100%) translateX(-50%)`;
  
  const retract = moduleEl.animate([
    { transform: 'translateX(0)', opacity: '1' },
    { opacity: '0.6', offset: 0.7 },
    { transform: retractTarget, opacity: '0' }
  ], {
    duration,
    easing: EASING.retract,
    fill: 'forwards'
  });
  
  await retract.finished;
  moduleEl.classList.add('module-panel--docked');
}
```

### 3.4 Module Screen Power On/Off

```javascript
async function modulePowerOn(moduleEl) {
  const screen = moduleEl.querySelector('.module-screen');
  if (!screen) return;
  
  // Horizontal line expand (CRT power-on)
  screen.animate([
    { clipPath: 'inset(50% 0 50% 0)', opacity: '0.3', filter: 'brightness(2)' },
    { clipPath: 'inset(30% 0 30% 0)', opacity: '0.7', filter: 'brightness(1.5)', offset: 0.3 },
    { clipPath: 'inset(0% 0 0% 0)', opacity: '1', filter: 'brightness(1)' }
  ], {
    duration: 250,
    easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
    fill: 'forwards'
  });
  
  await sleep(250);
}

async function modulePowerOff(moduleEl) {
  const screen = moduleEl.querySelector('.module-screen');
  if (!screen) return;
  
  screen.animate([
    { clipPath: 'inset(0% 0 0% 0)', opacity: '1' },
    { clipPath: 'inset(49% 0 49% 0)', opacity: '0.3', filter: 'brightness(2)' },
    { clipPath: 'inset(50% 0 50% 0)', opacity: '0', filter: 'brightness(0)' }
  ], {
    duration: 120,
    easing: 'ease-in',
    fill: 'forwards'
  });
  
  await sleep(120);
}
```

---

## 4. CARTRIDGE INSERT ANIMATION

### 4.1 Concept
The login data module card sits landscape, below the primary device. On form submit, it translates up into the card slot, accompanied by a mechanical resistance feel and final click-seat.

```javascript
async function cartridgeInsert(cardEl, slotEl, options = {}) {
  const slotRect = slotEl.getBoundingClientRect();
  const cardRect = cardEl.getBoundingClientRect();
  
  // Calculate translation needed to align card with slot
  const targetY = slotRect.top - cardRect.bottom + slotRect.height;
  const targetX = (slotRect.left + slotRect.width / 2) - (cardRect.left + cardRect.width / 2);
  
  // Phase 1: Lift and align (card moves to slot alignment)
  await cardEl.animate([
    { transform: 'translateX(0) translateY(0) rotate(0deg)' },
    { 
      transform: `translateX(${targetX}px) translateY(${targetY * 0.3}px) rotate(0deg)`,
      offset: 0.3
    },
    { 
      transform: `translateX(${targetX}px) translateY(${targetY * 0.7}px)`,
      offset: 0.7
    }
  ], {
    duration: 600,
    easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
    fill: 'forwards'
  }).finished;
  
  // Phase 2: Insert with resistance (slower, like pushing against spring)
  await cardEl.animate([
    { transform: `translateX(${targetX}px) translateY(${targetY * 0.7}px)` },
    { transform: `translateX(${targetX}px) translateY(${targetY * 0.95}px)` }
  ], {
    duration: 300,
    easing: 'cubic-bezier(0.6, 0.0, 0.8, 1.0)', // Heavy resistance
    fill: 'forwards'
  }).finished;
  
  // Phase 3: Click-seat (final snap to position + bounce)
  await cardEl.animate([
    { transform: `translateX(${targetX}px) translateY(${targetY * 0.95}px)` },
    { transform: `translateX(${targetX}px) translateY(${targetY + 4}px)` }, // Overshoot
    { transform: `translateX(${targetX}px) translateY(${targetY}px)` }       // Settle
  ], {
    duration: 200,
    easing: EASING.seat,
    fill: 'forwards'
  }).finished;
  
  // Slot LED lights up
  slotEl.classList.add('slot--occupied');
  playCardInsert();
  
  // Trigger boot sequence
  await sleep(200);
  return true;
}
```

### 4.2 Cartridge Reject (error state)

```javascript
async function cartridgeReject(cardEl) {
  // Eject animation: card shoots outward with bounce
  const currentTransform = new DOMMatrix(getComputedStyle(cardEl).transform);
  
  await cardEl.animate([
    { transform: `${cardEl.style.transform}` },
    { transform: `${cardEl.style.transform} translateY(20px)`, offset: 0.1 },
    { transform: `${cardEl.style.transform} translateY(-80px)`, offset: 0.5 },
    { transform: `${cardEl.style.transform} translateY(-60px)`, offset: 0.7 },
    { transform: `${cardEl.style.transform} translateY(-80px)`, offset: 0.8 },
    { transform: `${cardEl.style.transform} translateY(0)` }
  ], {
    duration: 600,
    easing: 'cubic-bezier(0.4, 0, 0.6, 1)',
    fill: 'forwards'
  }).finished;
  
  // Flash error on card
  cardEl.classList.add('card--error');
  playCardReject();
  
  await sleep(800);
  cardEl.classList.remove('card--error');
}
```

---

## 5. SIMULTANEOUS MODULE ORCHESTRATION

### 5.1 Multi-Module Choreography

When navigating to a feature that requires multiple modules, stagger their emergence:

```javascript
class ModuleOrchestrator {
  constructor() {
    this.activeModules = new Map(); // id → { el, direction, state }
    this.maxSimultaneous = 3;
  }

  async activateModule(id) {
    const config = MODULES.find(m => m.id === id);
    if (!config) return;
    
    // Check simultaneous limit
    if (this.activeModules.size >= this.maxSimultaneous) {
      // Retract the least-recently-used module
      const lruId = [...this.activeModules.keys()][0];
      await this.deactivateModule(lruId);
    }
    
    const moduleEl = document.querySelector(`[data-module-id="${id}"]`);
    if (!moduleEl) return;
    
    this.activeModules.set(id, { el: moduleEl, direction: config.direction, activatedAt: Date.now() });
    
    await emergeModule(moduleEl, config.direction, {
      zIndex: config.zIndex,
      delay: 0
    });
  }

  async deactivateModule(id) {
    const module = this.activeModules.get(id);
    if (!module) return;
    
    await retractModule(module.el, module.direction);
    this.activeModules.delete(id);
  }

  async activateGroup(ids) {
    // Stagger multiple modules
    const configs = ids.map(id => MODULES.find(m => m.id === id)).filter(Boolean);
    
    const promises = configs.map((config, i) => {
      const moduleEl = document.querySelector(`[data-module-id="${config.id}"]`);
      return emergeModule(moduleEl, config.direction, {
        zIndex: config.zIndex,
        delay: i * 80 // 80ms stagger
      });
    });
    
    await Promise.all(promises);
  }
}
```

---

## 6. Z-DEPTH PARALLAX

For visual depth when multiple modules are active, apply a subtle parallax offset:

```css
.primary-unit {
  transform: translateZ(0);
  box-shadow: -8px 0 24px rgba(0,0,0,0.3), 8px 0 24px rgba(0,0,0,0.3);
}

/* Active modules cast shadow toward primary */
.module-panel--active[data-direction="left"] {
  box-shadow: 4px 0 16px rgba(0,0,0,0.2);
}

.module-panel--active[data-direction="right"] {
  box-shadow: -4px 0 16px rgba(0,0,0,0.2);
}

/* Background modules (behind an active module on same axis) */
.module-panel--background {
  filter: brightness(0.85);
  transform: translateX(calc(-100% + 24px)); /* Peek out behind active */
}
```

---

## 7. MECHANICAL CONNECTOR VISUAL

Each module has a physical connector strip where it meets the primary unit:

```css
.module-connector {
  position: absolute;
  width: 12px;
  background: repeating-linear-gradient(
    to bottom,
    #C8C8C8 0px, #C8C8C8 2px,
    #F0EDE8 2px, #F0EDE8 4px
  );
  /* Gold contact strip like the cartridge */
}

.module-panel[data-direction="left"] .module-connector {
  right: 0;
  top: 20%;
  height: 60%;
  border-radius: 0 2px 2px 0;
}

.module-panel[data-direction="right"] .module-connector {
  left: 0;
  top: 20%;
  height: 60%;
  border-radius: 2px 0 0 2px;
}

/* Connector LED — off when docked, green when active */
.module-connector::after {
  content: '';
  position: absolute;
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: #1A1A1A;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  transition: background 200ms, box-shadow 200ms;
}

.module-panel--active .module-connector::after {
  background: var(--color-phosphor-green, #39FF14);
  box-shadow: 0 0 6px var(--color-phosphor-green, #39FF14);
}
```

---

## 8. REACT INTEGRATION

```tsx
// ModuleExpansion.tsx
import { useEffect, useRef } from 'react';
import { useModulesStore } from '@/store/modules.store';
import { emergeModule, retractModule } from '@/lib/moduleAnimations';

export function ModulePanel({ moduleId, direction, zIndex, children }) {
  const ref = useRef<HTMLDivElement>(null);
  const isActive = useModulesStore(s => s.activeModules.includes(moduleId));
  const prevActive = useRef(false);
  
  useEffect(() => {
    if (!ref.current) return;
    
    if (isActive && !prevActive.current) {
      emergeModule(ref.current, direction, { zIndex });
    } else if (!isActive && prevActive.current) {
      retractModule(ref.current, direction);
    }
    
    prevActive.current = isActive;
  }, [isActive]);
  
  return (
    <div
      ref={ref}
      className="module-panel module-panel--docked"
      data-module-id={moduleId}
      data-direction={direction}
    >
      <div className="module-screen">
        {children}
      </div>
      <div className="module-connector" aria-hidden="true" />
    </div>
  );
}
```

---

## 9. PERFORMANCE CHECKLIST

- [ ] All animated properties: `transform` and `opacity` only — compositor thread, no layout/paint
- [ ] `will-change: transform, opacity` on all module panels (set before animation starts, remove after)
- [ ] `backface-visibility: hidden` on all panels (forces GPU layer)
- [ ] Maximum 3 panels animating simultaneously — enforce in orchestrator
- [ ] Module content lazy-loaded: don't render module children until `emerging` state
- [ ] `clipPath` used for screen reveal only — not as an ongoing animation property
- [ ] Test at 60fps on: Chrome DevTools CPU 4x throttle, Safari, and Firefox
- [ ] `ResizeObserver` on device array to recalculate positions if window resizes mid-session

---

## 10. SOUND DESIGN (OPTIONAL BUT RECOMMENDED)

```javascript
// Web Audio API mechanical sounds
class MechanicalSFX {
  constructor() {
    this.ctx = null; // Lazy init — requires user interaction first
  }

  init() {
    if (this.ctx) return;
    this.ctx = new AudioContext();
  }

  _playClick(frequency = 200, duration = 0.05) {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.frequency.setValueAtTime(frequency, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(frequency * 0.1, this.ctx.currentTime + duration);
    gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
    osc.start();
    osc.stop(this.ctx.currentTime + duration);
  }

  snap() { this._playClick(400, 0.04); }     // Module magnetic snap
  insert() { this._playClick(180, 0.12); }   // Cartridge insert
  reject() { this._playClick(120, 0.08); }   // Card reject
  boot() { /* multi-tone boot chord */ }
}

export const sfx = new MechanicalSFX();
// Call sfx.init() on first user click
```
