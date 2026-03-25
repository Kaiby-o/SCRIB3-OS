# SCRIB3-OS Build Plan

> **Version:** 1.1 | **Date:** 2026-03-25 | **Author:** Ben Lydiatt + Claude
> **Status:** ALL PHASES COMPLETE + SESSION 2 VISUAL REFINEMENT DONE
> **Last session:** 2026-03-25 (Session 2). Landing page overhauled (laptop SVG, logo, login dialog with shape). Google OAuth working. Next: stakeholder journeys (client onboarding → portals), dashboard modules, visual polish.

---

## Recovery Preamble

If you're a fresh Claude instance picking this up: read this file first, then `CLAUDE.md`, then `PRD.md`. Check the CHANGELOG.md for the last completed task. The codebase has two layers:

- **`src/scrib3-os/`** — The new professional platform (this plan)
- **`src/scrib3-device/`** — The existing gamified CRT admin layer (frozen, don't touch)

The root router splits traffic: `/` → OS, `/device` → DEVICE (admin only).

---

## Architecture Overview

```
scrib3-os/
├── public/
│   └── fonts/                    # Kaio, Owners Wide, NT Stardust (.woff2, .otf)
├── src/
│   ├── main.tsx                  # Root — imports fonts.css, mounts <App>
│   ├── App.tsx                   # Root router: / → OS, /device → DEVICE
│   ├── scrib3-os/                # ← NEW (this plan)
│   │   ├── styles/
│   │   │   ├── fonts.css         # @font-face declarations
│   │   │   ├── tokens.ts         # All design tokens (colours, type, spacing, radius)
│   │   │   └── tailwind.ts       # Tailwind config extension (uses tokens.ts)
│   │   ├── config/
│   │   │   └── dashboardConfig.ts # Role → nav items, modules, header label
│   │   ├── components/
│   │   │   ├── DashboardLayout.tsx # Single layout — all roles use this
│   │   │   ├── NavOverlay.tsx     # 3-layer nav (0: bar, 1: fullscreen, 2: subcategory)
│   │   │   ├── UserProfileCard.tsx # Dark pill card (bottom-left)
│   │   │   ├── PillNav.tsx        # Top centre pill navigation bar
│   │   │   ├── ModulePanel.tsx    # Generic bento grid panel wrapper
│   │   │   └── ClockDisplay.tsx   # Local time (bottom-left)
│   │   ├── pages/
│   │   │   ├── LandingPage.tsx    # / — public, no auth
│   │   │   ├── LoginPage.tsx      # /login — shared auth
│   │   │   ├── DashboardPage.tsx  # /dashboard — role-gated
│   │   │   └── ProfilePage.tsx    # /profile/:id — team member view
│   │   ├── hooks/
│   │   │   ├── useAuth.ts         # Supabase auth wrapper
│   │   │   └── useRole.ts         # Role extraction from JWT/profile
│   │   └── lib/
│   │       └── supabase.ts        # Supabase client (reuses existing creds)
│   └── scrib3-device/             # ← MIGRATED existing code (frozen)
│       ├── pages/
│       ├── components/
│       ├── store/
│       ├── hooks/
│       └── lib/
```

---

## Phase 0 — Migration & Scaffolding

**Goal:** Restructure the repo without breaking anything. No new features.

| # | Task | Dependencies | Est. |
|---|------|-------------|------|
| 0.1 | Create `src/scrib3-device/` directory | None | 5m |
| 0.2 | Move all existing `src/pages/`, `src/components/`, `src/store/`, `src/hooks/`, `src/lib/` into `src/scrib3-device/` | 0.1 | 10m |
| 0.3 | Update all internal imports in `src/scrib3-device/` to reflect new paths | 0.2 | 20m |
| 0.4 | Create `src/scrib3-os/` directory structure (styles/, config/, components/, pages/, hooks/, lib/) | 0.2 | 5m |
| 0.5 | Update `src/App.tsx` root router: `/` → OS landing, `/device` → DEVICE shell | 0.3, 0.4 | 10m |
| 0.6 | Verify `npm run dev` and `npm run build` pass with zero errors | 0.5 | 10m |
| 0.7 | Update `CLAUDE.md` to document the split | 0.6 | 5m |
| 0.8 | Update `CHANGELOG.md` | 0.7 | 5m |

**Exit criteria:** All existing DEVICE functionality works at `/device`. The OS routes are empty shells. Build passes.

---

## Phase 1 — Design Foundation

**Goal:** Fonts loaded, tokens defined, Tailwind extended, base components styled.

| # | Task | Dependencies | Est. |
|---|------|-------------|------|
| 1.1 | Copy font files to `public/fonts/` (Kaio .woff2 variants, KaioVF.ttf, OwnersWide-Regular.otf, NTStardust-Regular.otf) | Phase 0 | 5m |
| 1.2 | Write `src/scrib3-os/styles/fonts.css` with `@font-face` declarations (Kaio weight-mapped, Owners Wide, NT Stardust) | 1.1 | 15m |
| 1.3 | Import `fonts.css` in `main.tsx` | 1.2 | 2m |
| 1.4 | Write `src/scrib3-os/styles/tokens.ts` — colours, typography, radius, spacing (exact values from kickoff doc) | Phase 0 | 10m |
| 1.5 | Install Tailwind CSS + PostCSS + autoprefixer, configure for `src/scrib3-os/` only | Phase 0 | 10m |
| 1.6 | Extend `tailwind.config.ts` with custom tokens (colours, fonts, radii, spacing) | 1.4, 1.5 | 10m |
| 1.7 | Build a test page that renders every token (all font weights, colour swatches, radii, spacing) — verify against Figma screenshot | 1.3, 1.6 | 15m |

**Exit criteria:** Fonts render correctly at all weights. Token values match Figma. Tailwind classes use custom tokens.

---

## Phase 2 — Shared Components

**Goal:** Build the shared UI primitives that every page needs.

| # | Task | Dependencies | Est. |
|---|------|-------------|------|
| 2.1 | `PillNav.tsx` — top centre navigation bar (pill-shaped buttons, Owners Wide, uppercase, bordered) | Phase 1 | 20m |
| 2.2 | `UserProfileCard.tsx` — dark bottom-left card (avatar, name in Kaio:Super, role in Owners Wide, XP bar, play button) | Phase 1 | 25m |
| 2.3 | `ClockDisplay.tsx` — local time, Owners Wide 18px, lowercase, `'dlig' 1` | Phase 1 | 10m |
| 2.4 | `ModulePanel.tsx` — generic bento grid card (translucent bg, black border, 10.258px radius) | Phase 1 | 10m |
| 2.5 | `NavOverlay.tsx` — 3-layer nav system (see spec below) | Phase 1 | 45m |

### NavOverlay Spec (Task 2.5)

**State:** `layer: 0 | 1 | 2`, `selectedCategory: string | null`

**Layer 0 (default):** Hamburger `≡` icon top-right. No overlay visible.

**Layer 1 (triggered by `≡`):**
- Full-screen overlay, bg `#000000`, origin top-right
- Giant Kaio:Black labels centred: role-dependent categories from `dashboardConfig.ts`
- DARK/LIGHT toggle top-left (pill, pink active state)
- Close `×` top-right
- "Having Issues?" email input bottom-left (pill-shaped, off-white border on black)
- Social links bottom-right (Owners Wide)
- Animation: clip-path expanding from top-right, mechanical cubic-bezier, ~400ms

**Layer 2 (triggered by clicking a category):**
- Full-screen overlay, bg `#D7ABC5` (pink), origin from clicked label
- Sub-items for selected category in Kaio:Black
- Back arrow → returns to Layer 1
- Animation: clip-path expanding from label position, ~400ms

**Exit criteria:** All shared components render correctly in isolation. NavOverlay transitions work on all three layers.

---

## Phase 3 — Dashboard Core

**Goal:** One `DashboardLayout.tsx` component serving all roles via config.

| # | Task | Dependencies | Est. |
|---|------|-------------|------|
| 3.1 | Write `dashboardConfig.ts` — role → { navItems, modules, headerLabel, categories } map | Phase 1 | 15m |
| 3.2 | Build `DashboardLayout.tsx` — reads role from auth, pulls config, renders: top bar (logo + PillNav + hamburger), module grid, profile card, clock | 2.1–2.5, 3.1 | 30m |
| 3.3 | Build `DashboardPage.tsx` — auth gate, role extraction, renders `<DashboardLayout>` | 3.2 | 15m |
| 3.4 | Static CSS Grid for module panels — 5 panels per Figma example, layout varies by role | 3.2, 2.4 | 20m |

**Exit criteria:** `/dashboard` renders a role-appropriate layout. Changing role in DB changes the visible layout. Single component, zero duplication.

---

## Phase 4 — Auth & Routing

**Goal:** Full auth flow with role-based routing.

| # | Task | Dependencies | Est. |
|---|------|-------------|------|
| 4.1 | Supabase auth setup — reuse existing project, add `role` column to profiles table if not present | Phase 0 | 10m |
| 4.2 | RLS policies for role-based access (see SKILL-RLS-SUPABASE.md) | 4.1 | 20m |
| 4.3 | `LoginPage.tsx` — email/password form, Supabase signIn, redirect to `/dashboard` | Phase 1 | 20m |
| 4.4 | Auth guard HOC/wrapper — redirects unauthenticated users to `/login` | 4.1 | 10m |
| 4.5 | Role guard — `/device` only accessible to `admin` role | 4.4 | 10m |
| 4.6 | Write `scripts/seed-users.ts` — CLI script to create the 4 seed accounts (passwords provided at runtime, not hardcoded) | 4.1 | 15m |
| 4.7 | Root router: `/` → Landing, `/login` → Login, `/dashboard` → Dashboard (auth-gated), `/device` → DEVICE (admin-gated), `/profile/:id` → Profile | 4.4, 4.5 | 15m |

**Exit criteria:** Login works. Role-based redirect works. Admin can access `/device`. Non-admin gets 403 on `/device`. Seed script creates accounts.

---

## Phase 5 — Pages

**Goal:** Build out each page shell. Content is placeholder until Figma screenshots are provided.

| # | Task | Dependencies | Est. |
|---|------|-------------|------|
| 5.1 | `LandingPage.tsx` — public landing page, SCRIB3 branding, links to `/login` | Phase 1 | 20m |
| 5.2 | Team dashboard modules — populate 5 panels with role-specific placeholder content | Phase 3 | 15m |
| 5.3 | Client dashboard modules | Phase 3 | 15m |
| 5.4 | Vendor dashboard modules | Phase 3 | 15m |
| 5.5 | C-Suite dashboard modules | Phase 3 | 15m |
| 5.6 | `ProfilePage.tsx` — team member profile view (`/profile/:id`) | Phase 1 | 20m |
| 5.7 | Admin DEVICE access — `/device` route loads existing SCRIB3-DEVICE shell | Phase 0 | 10m |

**Exit criteria:** All 9 pages from the kickoff doc are navigable. Content is placeholder shells awaiting Figma reference.

---

## Phase 6 — Polish & Verification

| # | Task | Dependencies | Est. |
|---|------|-------------|------|
| 6.1 | Cross-browser test (Chrome, Firefox, Safari) | Phase 5 | 20m |
| 6.2 | Responsive check (desktop-first, flag mobile issues) | Phase 5 | 15m |
| 6.3 | Verify all tokens match Figma (colour, type, spacing, radius) | Phase 5 | 10m |
| 6.4 | Verify DEVICE layer still works at `/device` | Phase 5 | 10m |
| 6.5 | Update README.md with new architecture | Phase 5 | 10m |
| 6.6 | Final CHANGELOG.md entry | 6.5 | 5m |

---

## Phase Order & Dependencies

```
Phase 0 (Migration)
  └── Phase 1 (Design Foundation)
       ├── Phase 2 (Shared Components)
       │    └── Phase 3 (Dashboard Core)
       │         └── Phase 5 (Pages)
       └── Phase 4 (Auth & Routing)
            └── Phase 5 (Pages)
                 └── Phase 6 (Polish)
```

Phases 2 and 4 can run in parallel after Phase 1. Phase 5 requires both.

---

## Tech Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| CSS framework (OS layer) | Tailwind CSS | Kickoff doc specifies it. Keep DEVICE layer untouched (no Tailwind there). |
| Font loading | Self-hosted `@font-face` in `public/fonts/` | Fonts are proprietary — not on Google Fonts or any CDN. |
| Kaio weight strategy | Use individual .woff2 files per weight, NOT the variable font | Variable fonts require axis declarations; individual weights are simpler and the kickoff doc provides per-weight files. If filesize becomes an issue, swap to VF later. |
| Dashboard layout | Single `DashboardLayout.tsx` + `dashboardConfig.ts` map | Kickoff doc hard rule: never duplicate the layout per role. |
| State management | Zustand (existing) | Already in the project. No new state lib needed. |
| Supabase auth | Reuse existing project | Kickoff doc specifies reuse. `role` column added to profiles table. |
| Drag-and-drop grid | NOT today | Kickoff doc explicitly says static grid only. Phase 2 (future) will use `react-grid-layout`. |
| Animation library | None — CSS transitions + clip-path | Kickoff doc says no additional animation libraries. |
| Dark/light mode | Toggle in NavOverlay Layer 1 | Kickoff doc shows it. Implement as CSS custom property swap. Store preference in localStorage + Supabase. |

---

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Font files don't render correctly (weight mapping, OpenType features) | High — typography is the #1 brand differentiator | Test every weight + `font-feature-settings` in Phase 1.7 before building any components |
| Existing DEVICE imports break during migration | High — regression | Run full build after every migration step (Phase 0.6). Git commit after each successful step. |
| Tailwind conflicts with existing CSS (DEVICE layer) | Medium | Scope Tailwind to `src/scrib3-os/` only via `content` config. DEVICE layer uses its own styles. |
| Supabase schema changes break DEVICE | Medium | Only ADD columns (e.g., `role`). Never modify or delete existing columns. |
| NavOverlay clip-path animation performance | Low | clip-path is GPU-composited in modern browsers. If issues, fall back to transform + opacity. |
| Role config grows unwieldy | Low | `dashboardConfig.ts` is a flat map. Each role is one object. Easy to extend. |

---

## Out of Scope (Explicit)

- Drag-and-drop dashboard grid (future Phase 2)
- Character creator bugs (LimeZu frame extraction)
- Walk cycle compositor
- Save & Enter navigation bug
- Custom SCRIB3 office layout
- Gamification system (XP, badges, leaderboard) — preserved in DEVICE, not duplicated in OS
- Real data modules (actual project data, file delivery, approvals) — placeholder content only
- Mobile-first responsive design — desktop-first, flag mobile issues
- Vercel deployment — localhost first

---

## Session Resumption Protocol

When starting a new session on this project:

1. Read `PLAN.md` (this file)
2. Read `CLAUDE.md`
3. Check `CHANGELOG.md` for the last completed entry
4. Run `npm run build` to verify current state
5. Report: (a) current phase, (b) last completed task, (c) next task
6. Wait for Ben's confirmation before building
