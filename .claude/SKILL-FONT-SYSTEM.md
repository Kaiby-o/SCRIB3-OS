# SKILL: Font System — Kaio, Owners Wide, NT Stardust

> **Domain:** Typography — Self-Hosted Font Loading & Feature Settings
> **Applies to:** SCRIB3-OS layer only
> **Critical rule:** These fonts are proprietary. Never link to Google Fonts or any CDN.

---

## Font Files

All fonts live in `public/fonts/`. File → weight mapping:

### Kaio (7 weights + variable)

| File | CSS Weight | Token Use |
|------|-----------|-----------|
| `Kaio-Light.woff2` | 300 | — |
| `Kaio-Regular.woff2` | 400 | — |
| `Kaio-Medium.woff2` | 500 | — |
| `Kaio-Bold.woff2` | 700 | — |
| `Kaio-Black.woff2` | 800 | `displayHero`, `displayDash` |
| `Kaio-Super.woff2` | 900 | `displayName` |
| `Kaio-Krilin.woff2` | 950 | — (reserve, heaviest weight) |
| `KaioVF.ttf` | 100–950 | Variable font fallback (not primary) |

**Strategy:** Use individual `.woff2` files per weight. The variable font (`KaioVF.ttf`) is available as a fallback but adds complexity with axis declarations. Use it only if bundle size becomes a concern.

### Owners Wide

| File | CSS Weight | Token Use |
|------|-----------|-----------|
| `OwnersWide-Regular.otf` | 400 | `body`, `bodySml`, `pillNav`, `time` |

Single weight only. If bold/italic are needed later, they'll require additional font files.

### NT Stardust

| File | CSS Weight | Token Use |
|------|-----------|-----------|
| `NTStardust-Regular.otf` | 400 | `meta` (tiny bandwidth/status labels) |

Single weight only.

---

## @font-face Declarations

File: `src/scrib3-os/styles/fonts.css`

```css
/* ===== KAIO ===== */

@font-face {
  font-family: 'Kaio';
  src: url('/fonts/Kaio-Light.woff2') format('woff2');
  font-weight: 300;
  font-display: swap;
}

@font-face {
  font-family: 'Kaio';
  src: url('/fonts/Kaio-Regular.woff2') format('woff2');
  font-weight: 400;
  font-display: swap;
}

@font-face {
  font-family: 'Kaio';
  src: url('/fonts/Kaio-Medium.woff2') format('woff2');
  font-weight: 500;
  font-display: swap;
}

@font-face {
  font-family: 'Kaio';
  src: url('/fonts/Kaio-Bold.woff2') format('woff2');
  font-weight: 700;
  font-display: swap;
}

@font-face {
  font-family: 'Kaio';
  src: url('/fonts/Kaio-Black.woff2') format('woff2');
  font-weight: 800;
  font-display: swap;
}

@font-face {
  font-family: 'Kaio';
  src: url('/fonts/Kaio-Super.woff2') format('woff2');
  font-weight: 900;
  font-display: swap;
}

@font-face {
  font-family: 'Kaio';
  src: url('/fonts/Kaio-Krilin.woff2') format('woff2');
  font-weight: 950;
  font-display: swap;
}

/* ===== OWNERS WIDE ===== */

@font-face {
  font-family: 'Owners Wide';
  src: url('/fonts/OwnersWide-Regular.otf') format('opentype');
  font-weight: 400;
  font-display: swap;
}

/* ===== NT STARDUST ===== */

@font-face {
  font-family: 'NT Stardust';
  src: url('/fonts/NTStardust-Regular.otf') format('opentype');
  font-weight: 400;
  font-display: swap;
}
```

### Import in main.tsx

```typescript
import './scrib3-os/styles/fonts.css'
```

This must be imported before any component that uses these fonts.

---

## OpenType Feature Settings

Kaio has specific OpenType features that must be enabled for correct rendering:

```css
/* Ordinals + Discretionary Ligatures — used on display text */
font-feature-settings: 'ordn' 1, 'dlig' 1;
```

| Feature | Code | Effect |
|---------|------|--------|
| Ordinals | `ordn` | Superscript ordinal suffixes (1st, 2nd) |
| Discretionary Ligatures | `dlig` | Alternate character combinations for display use |

**Where to apply:** All `displayHero` and `displayDash` token usage. Not needed on body text (Owners Wide).

### In Tailwind

Extend the config to include utility classes:

```typescript
// tailwind.config.ts
theme: {
  extend: {
    fontFamily: {
      kaio: ["'Kaio'", 'sans-serif'],
      owners: ["'Owners Wide'", 'sans-serif'],
      stardust: ["'NT Stardust'", 'sans-serif'],
    },
  },
}
```

For `font-feature-settings`, use inline style or a utility class:

```css
/* In a global CSS file or @layer utilities */
.font-features-display {
  font-feature-settings: 'ordn' 1, 'dlig' 1;
}
```

---

## Token → CSS Mapping

Reference for how typography tokens translate to CSS:

```css
/* displayHero */
.display-hero {
  font-family: 'Kaio', sans-serif;
  font-weight: 800;
  font-size: 80px;
  line-height: 0.9;
  letter-spacing: 0px;
  font-feature-settings: 'ordn' 1, 'dlig' 1;
  text-transform: uppercase;
}

/* displayDash */
.display-dash {
  font-family: 'Kaio', sans-serif;
  font-weight: 800;
  font-size: 30px;
  line-height: 0.88;
  font-feature-settings: 'ordn' 1, 'dlig' 1;
  text-transform: uppercase;
}

/* displayName */
.display-name {
  font-family: 'Kaio', sans-serif;
  font-weight: 900;
  font-size: 15px;
  line-height: 1.4;
  text-transform: uppercase;
}

/* body */
.body-text {
  font-family: 'Owners Wide', sans-serif;
  font-weight: 400;
  font-size: 20px;
  line-height: 1.1;
  letter-spacing: 1.6px;
}

/* bodySml */
.body-sml {
  font-family: 'Owners Wide', sans-serif;
  font-weight: 400;
  font-size: 16px;
  line-height: 1.4;
  letter-spacing: 0.96px;
}

/* pillNav */
.pill-nav {
  font-family: 'Owners Wide', sans-serif;
  font-weight: 400;
  font-size: 12.55px;
  line-height: 1.25;
  letter-spacing: 1.004px;
  text-transform: uppercase;
}

/* meta */
.meta-text {
  font-family: 'NT Stardust', sans-serif;
  font-weight: 400;
  font-size: 3.5px;
  letter-spacing: 0.13px;
}

/* time */
.time-text {
  font-family: 'Owners Wide', sans-serif;
  font-size: 18px;
  text-transform: lowercase;
  font-feature-settings: 'dlig' 1;
}
```

---

## Verification Checklist (Phase 1.7)

After loading fonts, render a test page that confirms:

1. **Kaio Black (800)** renders correctly — used for hero and nav labels
2. **Kaio Super (900)** renders correctly — used for profile names
3. **Owners Wide Regular** renders correctly — used for body text
4. **NT Stardust Regular** renders correctly — used for meta labels (very small)
5. **`font-feature-settings: 'ordn' 1, 'dlig' 1`** visibly changes Kaio rendering
6. **`text-transform: uppercase`** works on all Kaio usages
7. **Letter-spacing** matches Figma values (1.6px for body, 0.96px for bodySml, 1.004px for pillNav)
8. **Line-height** matches Figma (0.9 for hero, 0.88 for dash, 1.1 for body)
9. **No FOUT (Flash of Unstyled Text)** — `font-display: swap` ensures text renders immediately with fallback, then swaps

---

## Troubleshooting

| Symptom | Likely cause | Fix |
|---------|-------------|-----|
| Font doesn't load at all | Wrong path in `@font-face` `src` | Verify file exists at `public/fonts/<filename>` — Vite serves `/fonts/` from `public/` |
| Wrong weight renders | `font-weight` in `@font-face` doesn't match usage | Check weight mapping table above |
| OpenType features have no visible effect | Font doesn't contain those features, or browser doesn't support | Verify in Figma that the feature changes rendering. Test in Chrome DevTools Computed Styles. |
| `.otf` files don't load | Some older setups need explicit `format('opentype')` | Already specified in the declarations above |
| Variable font loads instead of static | Multiple `@font-face` with same family name, VF matches first | Don't declare a `@font-face` for the VF unless you're intentionally using it |
