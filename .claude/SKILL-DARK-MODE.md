# SKILL: Dark Mode — CSS Custom Property Theming

> **Domain:** Theming — Light/Dark Mode Toggle
> **Applies to:** SCRIB3-OS layer only
> **Trigger:** DARK/LIGHT pill toggle in NavOverlay Layer 1

---

## Overview

SCRIB3-OS has two colour modes. Light mode is the default (off-white background). Dark mode inverts the primary surfaces. The toggle lives in the NavOverlay Layer 1 (top-left pill).

The palette is only 3 colours — the mode swap is about which surfaces use which colour, not adding new colours.

---

## Colour Assignments by Mode

| Token | Light Mode (default) | Dark Mode |
|-------|---------------------|-----------|
| `--bg-primary` | `#EAF2D7` (off-white) | `#000000` (black) |
| `--bg-surface` | `rgba(234,242,215,0.2)` | `rgba(234,242,215,0.08)` |
| `--text-primary` | `#000000` | `#EAF2D7` |
| `--border-default` | `#000000` | `#EAF2D7` |
| `--accent` | `#D7ABC5` (pink) | `#D7ABC5` (pink — unchanged) |
| `--text-on-accent` | `#000000` | `#000000` |

**Pink never changes.** It's the constant accent across both modes.

---

## CSS Custom Properties

Declare in `src/scrib3-os/styles/theme.css` (imported after `fonts.css`):

```css
:root,
[data-theme="light"] {
  --bg-primary: #EAF2D7;
  --bg-surface: rgba(234, 242, 215, 0.2);
  --text-primary: #000000;
  --border-default: #000000;
  --accent: #D7ABC5;
  --text-on-accent: #000000;
  --text-on-dark: #EAF2D7;
}

[data-theme="dark"] {
  --bg-primary: #000000;
  --bg-surface: rgba(234, 242, 215, 0.08);
  --text-primary: #EAF2D7;
  --border-default: #EAF2D7;
  --accent: #D7ABC5;
  --text-on-accent: #000000;
  --text-on-dark: #EAF2D7;
}
```

### Application

Set `data-theme` on the `<html>` element:

```typescript
document.documentElement.setAttribute('data-theme', theme)
```

---

## Tailwind Integration

Extend `tailwind.config.ts` to use CSS custom properties:

```typescript
theme: {
  extend: {
    colors: {
      primary: 'var(--bg-primary)',
      surface: 'var(--bg-surface)',
      textPrimary: 'var(--text-primary)',
      borderDefault: 'var(--border-default)',
      accent: 'var(--accent)',
    },
  },
}
```

Usage in components:
```html
<div class="bg-primary text-textPrimary border-borderDefault">
```

These classes automatically respond to the `data-theme` attribute — no conditional class logic needed.

---

## What Does NOT Change in Dark Mode

| Element | Reason |
|---------|--------|
| Pink accent (`#D7ABC5`) | Brand constant |
| NavOverlay Layer 1 background | Always `#000000` regardless of mode |
| NavOverlay Layer 2 background | Always `#D7ABC5` regardless of mode |
| UserProfileCard background | Always `#000000` (dark card in both modes) |
| Text on UserProfileCard | Always `#EAF2D7` (off-white on dark card) |

The overlays and profile card have fixed colours because they're designed as branded surfaces, not theme-responsive containers.

---

## Toggle Component

The toggle lives in NavOverlay Layer 1 (top-left):

```typescript
interface ThemeToggleProps {
  className?: string
}

export function ThemeToggle({ className }: ThemeToggleProps) {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    // Read from localStorage on mount
    return (localStorage.getItem('scrib3-theme') as 'light' | 'dark') || 'light'
  })

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('scrib3-theme', theme)
  }, [theme])

  const toggle = () => setTheme(prev => prev === 'light' ? 'dark' : 'light')

  return (
    <button
      onClick={toggle}
      className={/* pill shape, border, active state uses pink */}
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      <span className={theme === 'dark' ? 'active' : ''}>DARK</span>
      <span className={theme === 'light' ? 'active' : ''}>LIGHT</span>
    </button>
  )
}
```

### Toggle Styling

```css
/* Pill container */
.theme-toggle {
  display: flex;
  border: 1px solid #EAF2D7;          /* Always off-white border (on black overlay) */
  border-radius: 75.641px;            /* pill radius token */
  overflow: hidden;
}

/* Each option */
.theme-toggle span {
  padding: 6px 16px;
  font-family: 'Owners Wide', sans-serif;
  font-size: 12.55px;
  letter-spacing: 1.004px;
  text-transform: uppercase;
  color: #EAF2D7;
  cursor: pointer;
  transition: background-color 200ms cubic-bezier(0.22, 0.61, 0.36, 1);
}

/* Active state */
.theme-toggle span.active {
  background-color: #D7ABC5;           /* S3 Pink */
  color: #000000;
}
```

---

## Persistence

| Layer | Storage | Behaviour |
|-------|---------|-----------|
| Local | `localStorage.scrib3-theme` | Immediate, survives refresh |
| Remote | `profiles.theme_preference` (Supabase) | Future — sync across devices |

For Phase 1, localStorage only. Supabase persistence is a future enhancement.

### Initialisation Order

1. On page load, check `localStorage.getItem('scrib3-theme')`
2. If present, apply immediately (before first paint if possible — inline script in `index.html`)
3. If absent, default to `'light'`

To prevent FOUC (Flash of Unstyled Content), add a blocking script in `index.html`:

```html
<script>
  const t = localStorage.getItem('scrib3-theme') || 'light';
  document.documentElement.setAttribute('data-theme', t);
</script>
```

This runs before React hydration, preventing a flash of light mode when the user prefers dark.

---

## Rules

- Never use raw hex values in component styles — always reference CSS custom properties
- Pink is constant across modes — never conditionally change it
- Overlay backgrounds are fixed — they don't respond to theme
- UserProfileCard is always dark — it doesn't respond to theme
- Test both modes on every component during build
- The toggle is only visible in NavOverlay Layer 1 — no floating toggle button on the dashboard
