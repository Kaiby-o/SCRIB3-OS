# Changelog

## 2026-03-26 — SCRIB3-OS Dashboard Content + Polish (Session 3)

### Build Fixes
- Fixed all TypeScript errors across OS and DEVICE layers (unused vars, type mismatches, erasableSyntaxOnly violations)
- Build now passes clean

### Dashboard Module Content
- Created `ModuleContent.tsx` — 19 content components for all 5 role dashboards
- **Team/Admin**: Active Projects (7 with progress), Task Queue (12 pending), Team Activity (live feed), Internal Comms (3 unread), Recent Files
- **Client**: My Projects (3 active), Deliverables (4 awaiting review), Timeline (milestones), Approvals (2 pending), Contact (account manager card)
- **Vendor**: Assigned Briefs (3 active), File Exchange (6 uploaded), Deadlines (4 upcoming), Invoice Status ($4,200 outstanding)
- **C-Suite**: Portfolio Overview (14 projects, 89% on track), Revenue ($142K Q1), Team Utilisation (76% avg), Client Health (8 active), Key Metrics (4-stat grid)
- **Admin**: System Overview (users, roles, RLS policies, OAuth status) — unique to admin role

### Admin Dashboard
- Admin now has its own distinct config (not just a copy of team)
- Admin-specific nav categories: SYSTEM (Users, Roles, Settings, Logs), DEVICE (Virtual Office, Avatar Creator)
- Admin-specific pill nav: Overview, Projects, Team, System

### Dashboard Polish
- Header: SCRIB3 text replaced with LogoScrib3 SVG component
- Header: Hamburger icon now uses consistent SVG (matches landing page)
- Sign-out button added (bottom-left, subtle hover reveal)
- Profile card expand button navigates to `/profile/:id`

### Profile Page Overhaul
- Horizontal avatar + name layout (editorial style)
- Role title mapping (admin → Administrator, csuite → Executive, etc.)
- 4-card info grid: Email, Experience, Status, Joined date
- XP progress bar with pink fill
- "This is your profile" indicator for own profile
- Auto-redirect to own profile when no ID provided
- Back button with hover interaction

### Dark Mode Toggle
- `useTheme.ts` — Zustand store with localStorage persistence
- FOUC prevention: inline `<script>` in `index.html` sets `data-theme` before React hydrates
- Dark/Light pill toggle in NavOverlay Layer 1 (top-left) with pink active state
- CSS custom properties already defined in `os.css` (`[data-theme="dark"]`) — now fully wired
- Pink accent unchanged in both modes (brand constant)
- Overlay backgrounds, profile card — fixed colours (not theme-responsive)

### Nav Overlay Sub-Item Navigation
- Sub-items now navigate to routes on click (closes overlay, navigates)
- Admin DEVICE sub-items route to `/device` and `/device/avatar-creator`
- Category heading label shown at top-centre of Layer 2
- All other sub-items currently route to `/dashboard` (ready for future page expansion)

### Client Onboarding Flow
- **`/clients`** — Client list page (team/admin/csuite gated)
  - 6 mock clients with status, contact, revenue, project counts
  - Filter pills: all, active, onboarding, completed, paused
  - Stats row: active count, onboarding count, total revenue, total projects
  - Table with hover states, status dots, company details
  - "+ New Client" button → `/clients/onboard`
- **`/clients/onboard`** — 4-step onboarding wizard
  - Phase stepper: Discovery → Agreement → Setup → Kickoff (mirrors DEVICE journey)
  - Discovery: company name, contact, industry, project brief, referral source
  - Agreement: engagement type, budget, MSA/SOW status
  - Setup: Slack channel, Notion hub, Drive folder, account lead
  - Kickoff: date, first deliverable, milestones, notes
  - Success screen with navigation pills
- Routes gated behind `AuthGuard` + `RoleGuard(['admin', 'team', 'csuite'])`
- Nav overlay "Client List" and "Onboarding" sub-items now route to `/clients` and `/clients/onboard`

### ✅ SESSION 3 COMPLETE

**Next planned work:**
- Figma screenshot comparison + pixel polish
- Connect onboarding form to Supabase (create client records)
- Consider: real-time data modules, notification system
- Sub-item routes: expand as new pages are built

---

## 2026-03-25 — SCRIB3-OS Rebuild (Session 1)

### Phase 0 — Migration
- Repo restructured: `src/scrib3-os/` (new) + `src/scrib3-device/` (frozen)
- Root router splits: `/` → OS, `/device` → DEVICE (admin only)
- All DEVICE internal navigation updated to `/device` prefix
- Build verified clean

### Phase 1 — Design Foundation
- Font files copied to `public/fonts/` (Kaio 7 weights, Owners Wide, NT Stardust)
- `@font-face` declarations in `src/scrib3-os/styles/fonts.css`
- Design tokens in `src/scrib3-os/styles/tokens.ts`
- Tailwind v4 integrated via `@tailwindcss/vite` plugin
- CSS custom properties for light/dark theming in `os.css`
- Typography utility classes: `text-display-hero`, `text-display-dash`, `text-body`, etc.

### Phase 2 — Shared Components
- `PillNav.tsx` — top-centre pill navigation bar
- `UserProfileCard.tsx` — dark bottom-left card (name, role, XP bar)
- `ClockDisplay.tsx` — live local time
- `ModulePanel.tsx` — bento grid panel wrapper with "Coming Soon" placeholder
- `NavOverlay.tsx` — 3-layer navigation (black overlay → pink sub-category), clip-path animations, escape key, body scroll lock. Context provided via `NavOverlayProvider` + `useNavOverlay` hook

### Phase 3 — Dashboard Core
- `dashboardConfig.ts` — full role config map (team, client, vendor, csuite, admin)
- `DashboardLayout.tsx` — single component, reads role from auth store, renders header + grid + profile card + clock + nav overlay. Zero duplication per role.

### Phase 4 — Auth & Routing (partial)
- `src/scrib3-os/lib/supabase.ts` — OS Supabase client (same project as DEVICE)
- `src/scrib3-os/hooks/useAuth.ts` — Zustand store with `signIn`, `signOut`, `init` (session persistence), role extraction from profiles table
- `AuthGuard.tsx` + `RoleGuard.tsx` — route protection components
- OS Login page wired to real Supabase auth
- Dashboard reads role from auth, renders appropriate config
- `/device` route gated behind `AuthGuard` + `RoleGuard(['admin'])`
- `scripts/seed-users.ts` — interactive CLI script to create 4 seed users (prompts for passwords, never hardcoded)

### Planning Artefacts
- `PLAN.md`, `PRD.md`
- `.claude/SKILL-DASHBOARD-VARIANTS.md`, `SKILL-RLS-SUPABASE.md`, `SKILL-NAV-OVERLAY.md`, `SKILL-FONT-SYSTEM.md`, `SKILL-DARK-MODE.md`

---

### Phase 4 (continued) — Seed & RLS
- SQL migration applied: `role`, `display_name`, `email` columns on profiles + updated CHECK constraint for both DEVICE and OS role values
- 4 users seeded via `scripts/seed-now.ts`: Ben (admin), Sixtyne (csuite), CK (team), Nick (csuite)
- Full login → role detection → role-specific dashboard verified (BEN LYDIATT / ADMIN)
- `get_user_role()` helper function created (SECURITY DEFINER)
- `project_members` join table created
- RLS enabled on profiles, projects, project_members, tasks
- 14 RLS policies applied (see `.claude/SKILL-RLS-SUPABASE.md`)

### Phase 6 — Polish
- CSS bleed investigated — confirmed as JPEG screenshot artifact, not actual CSS issue
- All computed backgrounds verified as correct `#EAF2D7`
- DEVICE layer CSS scoped correctly (body overrides via `body:has(.os-root)`)
- Final build passes clean (146 modules, 9.28s)

### ✅ SESSION 1 COMPLETE

**All 6 phases done.** The SCRIB3-OS shell is fully functional:
- Landing (`/`) → Login (`/login`) → Dashboard (`/dashboard`) with real Supabase auth
- Role-based dashboard layout driven by `dashboardConfig.ts`
- 3-layer NavOverlay with clip-path animations
- Profile card shows real user data from Supabase
- `/device` route admin-gated with RoleGuard
- RLS policies enforce data access per role

---

## 2026-03-25 — SCRIB3-OS Visual Refinement + Auth (Session 2)

### Landing Page Overhaul
- Laptop SVG frame (`public/assets/laptop-frame.svg`) as centred background image
- SCRIB3 text replaced with LogoScrib3 SVG component (`public/assets/logo-scrib3.svg`)
- ENTER button: 40% height reduction, hover → off-white, spacing matched to wordmark
- Content cluster: scaled 80%, shifted to sit centred on laptop screen
- Burger menu icon (`public/assets/icon-burger.svg`) top-right

### Nav Overlay Refinements
- Dark/Light toggle removed (dark mode deferred)
- Centre links: Kaio weight 800, 80px, 90% line-height, 16px gap
- Smaller text: Owners Wide font explicitly set
- Corner elements: 30% size increase
- Link spacing: doubled from 0 to 16px gap
- All four links (HOME, WORK, OUR TEAM, LET'S TALK) → https://scrib3.co/

### Login Dialog
- Custom login-shape SVG background (`public/assets/login-shape.svg`)
- Fixed 580px height — shape persists across sign-in / forgot-password views
- GM SCRIB3R heading + remember-me toggle: blue `#6E93C3`
- Laptop shrinks away when login opens (scale 0.3 transition)
- No drop shadow — clean cutout aesthetic
- All body text: Owners Wide font
- Forgot password: same dialog shape, content-only swap
- "Don't have an account? Get in Touch" footer

### Google OAuth
- `supabase.auth.signInWithOAuth({ provider: 'google' })` wired up
- Google Cloud OAuth client (Web application type) configured
- Consent screen branded as SCRIB3-OS with logo
- Callback URI: `https://dzufyjiczbgsvjyinpks.supabase.co/auth/v1/callback`

### ✅ SESSION 2 COMPLETE

**Next planned work:**
- Stakeholder journeys: client onboarding → client portals
- Dashboard content modules (bento grid, metrics)
- "Having Issues?" email form wiring
- Visual polish pass on dashboard
- Seed accounts: `ben.lydiat@scrib3.co` (admin), `sixtyne@scrib3.co` (csuite), `ck@scrib3.co` (team), `nick@scrib3.co` (csuite) — password: `Scrib3Dev2026!`

**Next session priorities:**
1. Visual refinement against Figma screenshots (page-by-page comparison)
2. Populate module panels with real placeholder content (charts, lists, cards)
3. Wire profile page to real data
4. Test all 5 role dashboard variants
5. Dark mode toggle functionality
6. Consider: sign-out button, session expiry handling

---

## 2026-03-22 — Unification Sprint (pre-OS rebuild)

### Migration (Phase 0)
- **Repo restructure:** Split codebase into `src/scrib3-os/` (new professional platform) and `src/scrib3-device/` (existing gamified admin layer)
- **All existing code preserved** under `src/scrib3-device/` — nothing deleted
- **Root router updated:** `/` → OS landing, `/login` → shared auth, `/dashboard` → OS dashboard, `/device` → DEVICE (admin only)
- **Internal DEVICE navigation updated:** all routes now prefix `/device` to stay within the admin layer
- **Build verified:** Vite build passes clean, no broken imports

### Planning Artefacts
- `PLAN.md` — 7-phase build plan with task order, dependencies, tech decisions, risks
- `PRD.md` — Full product requirements for SCRIB3-OS (roles, pages, user stories, modules, design constraints)
- `.claude/SKILL-DASHBOARD-VARIANTS.md` — Single `DashboardLayout` + role config pattern
- `.claude/SKILL-RLS-SUPABASE.md` — Supabase RLS policies for 5 roles
- `.claude/SKILL-NAV-OVERLAY.md` — 3-layer navigation overlay system
- `.claude/SKILL-FONT-SYSTEM.md` — Self-hosted font loading (Kaio, Owners Wide, NT Stardust)
- `.claude/SKILL-DARK-MODE.md` — CSS custom property theming (light/dark toggle)
- `CLAUDE.md` updated to document the two-layer architecture

---

## 2026-03-22 — Unification Sprint

### Session Summary
Merged SCRIB3-OS dashboard and SCRIB3 systems map into a single unified repo. Added virtual office with LimeZu environments and a layered character creation system.

### Added
- **GitHub repo** `SCRIB3-OS` under kaybo account, accessible to CK
- **Systems map integration** — D3-powered map accessible via MAP nav link, full-screen takeover with device chrome animation
- **Virtual office** — Phaser 3-based 2D pixel office using LimeZu Modern Interiors pre-composed room layers (Generic Home + Condominium)
- **Office UI** — Right-side toolbar (DEVICE, 1 ONLINE, EDIT AVATAR, CHAT), minimap, room labels, ESC to close
- **Layered character creator** — 432 individual layer PNGs from LimeZu Character Generator:
  - 9 body/skin tones (shown as colour swatches)
  - 7 eye styles
  - 33 outfit styles with colour variants
  - 29 hairstyle styles with colour variants
  - 19 accessory types with colour variants and conflict groups (HEAD/FACE/BODY slots)
- **Character compositing** — Canvas-based layer stacking (body → eyes → outfit → hairstyle → accessories)
- **Avatar persistence** — Composited spritesheet saved as base64 to Supabase `avatar_config`
- **Collision system** — JSON-based walkable/blocked tile grid derived from room layer transparency
- **Office interaction** — E/Space to interact with objects, WASD/arrows to move
- **Chat system** — In-office text chat panel
- **Multiplayer foundation** — Remote avatar sync infrastructure via Supabase presence

### Changed
- Nav bar: FILES → OFFICE link
- Dashboard: added MAP and OFFICE overlay transitions
- Camera zoom: 2x → 1.2x for wider office view
- Toolbar buttons: 160px width matching minimap

### Known Issues Carried Forward
- Character creator previews show partial/unclear character views due to LimeZu spritesheet layout (1792x1312 full animation sheets, non-RPG-Maker frame positions)
- Walk cycle compositor tiles single front-idle frame — needs proper direction frame mapping
- Save & Enter navigation occasionally fails (using window.location.href workaround)
- Office environment is fixed layout (two pre-composed rooms) — needs custom office design

### Architecture Decisions
- LimeZu pre-composed room images chosen over tile-by-tile JSON tilemap (the tilemap approach failed due to GID complexity)
- Character layers stored individually in public/ for browser-based compositing rather than server-side generation
- Accessory conflict groups implemented client-side (HEAD/FACE/BODY slots prevent overlapping items)

### Files Added/Modified (key)
- `public/assets/office/` — Office environment layers, collision data, character layer PNGs
- `src/pages/AvatarCreatorPage.tsx` — Full character creator
- `src/components/virtual-office/` — Phaser office, chat, toolbar
- `src/components/virtual-office/game/scenes/` — BootScene, OfficeScene
- `scripts/compose-office.cjs` — Room compositor
- `scripts/generate-manifest.cjs` — Character layer manifest generator

### Next Session Priorities
1. Fix character creator preview rendering (extract correct frames from animation sheets)
2. Map proper walk cycle frames from the 1792x1312 sheets for all 4 directions
3. Ensure Save & Enter reliably saves + navigates to office
4. Design a custom SCRIB3 office layout (not just LimeZu defaults)
5. Consider using the Character Generator 2.0 desktop app to export proper walk-cycle-only spritesheets per layer
