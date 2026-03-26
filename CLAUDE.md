# SCRIB3-OS

## What This Is

This repo contains **two layers** of the SCRIB3 internal platform:

### SCRIB3-OS (`src/scrib3-os/`)
The professional-facing operating platform. Editorial-corporate design with a warm organic palette (off-white, black, pink). Role-based dashboards for team, clients, vendors, and C-suite. Built with Tailwind CSS.

### SCRIB3-DEVICE (`src/scrib3-device/`)
The original gamified admin layer. Militarised sci-fi field device aesthetic with CRT monitors, hardware chrome, and Phaser-based virtual office. Admin-only access at `/device`. **Frozen — do not modify unless explicitly asked.**

## Current Phase
SCRIB3-OS — **Phases 1–6 shell complete (Plan v4 integrated).** All 5 red priorities built (Engagement Health, Bandwidth, Vendor/Invoice, Pre-Alignment, Scope Watch). 24 routes, 11 data layers, mock data throughout. **Next: Supabase wiring sprint, mobile accessibility (Phase 3.5), drag-and-drop dashboards (Phase 5).**

## Routing (24 routes)

### Public
- `/` → OS landing page
- `/login` → Redirects to `/`

### Auth-Gated (all roles)
- `/dashboard` → Role-gated dashboard (5 variants)
- `/profile/:id` → Basic profile (Supabase-connected)
- `/portal/:slug` → Client-facing branded portal

### Auth-Gated (admin, team, csuite)
- `/team` → Team directory (29 members, filterable)
- `/team/:id` → Full team profile (bio, skills, clients, projects)
- `/pd/:id` → Professional development tracker (4 tabs)
- `/clients` → Client list + management
- `/clients/onboard` → Client onboarding wizard (4 phases)
- `/clients/:slug/hub` → Internal client hub (5 tabs)
- `/projects` → Project registry (10 projects, filterable)
- `/units` → Unit dashboards (5 units)
- `/finance` → Engagement health overview (6 clients)
- `/finance/:slug` → Per-client Gantt + SOW forecast simulator
- `/vendors` → Vendor + invoice management (tabbed)
- `/vendors/onboard` → Vendor onboarding form
- `/pre-alignment` → Mandatory project alignment (17 fields)
- `/bandwidth` → Bandwidth estimates (digest + submit form)
- `/scope-watch` → Scope watch entries (expandable cards)
- `/resources/what-good-looks-like` → Quality standards library (10 sections)
- `/culture` → Culture hub (principles, leaderboard, XP, culture book)
- `/tools` → Tools directory (13 tools)

### Admin Only
- `/device` → DEVICE layer
- `/device/avatar-creator` → DEVICE avatar creator

## Team
- **Ben (Kaiby-o)** — VP Creative & Digital at SCRIB3, EU timezone, product owner
- **CK (CK42BB)** — collaborator, US evening timezone, uses Claude Code. Picks up where Ben leaves off. CHANGELOG.md updated on every push.

## Architecture
- **Stack**: React 19 + TypeScript, Vite 8, Zustand (state), Supabase (auth, DB, realtime)
- **OS layer**: Tailwind CSS, role-based `DashboardLayout` + `dashboardConfig.ts`
- **DEVICE layer**: Custom CSS (CRT/hardware), Phaser 3, D3.js systems map
- **Fonts (OS)**: Kaio (7 weights), Owners Wide, NT Stardust — self-hosted in `public/fonts/`
- **Colours (OS)**: Off-white `#EAF2D7`, Black `#000000`, Pink `#D7ABC5`, Blue accent `#6E93C3` — core palette
- **Auth**: Supabase email/password + Google OAuth. Roles: team, client, vendor, csuite, admin
- **RLS**: Row-level security on profiles table. Seed script at `scripts/seed-users.ts`
- **Dark mode**: CSS custom properties via `data-theme` attribute, FOUC prevention in `index.html`
- **Floating widget**: Persistent bottom pill on all auth pages (avatar, XP, bandwidth, 8 quick links)

## Data Layers (all mock — Supabase wiring pending)
- `src/scrib3-os/lib/engagementHealth.ts` — 6 priority clients, health tiers, SOW forecast simulator
- `src/scrib3-os/lib/bandwidth.ts` — 7 team member estimates, digest builder, capacity tracking
- `src/scrib3-os/lib/vendors.ts` — 5 vendors, 5 invoices, onboarding status, invoice flow
- `src/scrib3-os/lib/scopeWatch.ts` — 9 scope watch entries across 5 clients
- `src/scrib3-os/lib/team.ts` — Full 29-person roster with all Plan v4 fields
- `src/scrib3-os/lib/clients.ts` — 6 priority client profiles with full MD schema
- `src/scrib3-os/lib/projects.ts` — 10 projects with alignment/brief status
- `src/scrib3-os/lib/xp.ts` — 5 levels, 16 XP events, quick links

## Key Artefacts
- `PLAN.md` — Full build plan with phases, dependencies, risks
- `PRD.md` — Product requirements for SCRIB3-OS

### Skill Files — OS Layer
- `.claude/SKILL-DASHBOARD-VARIANTS.md` — Single layout component + role config pattern
- `.claude/SKILL-RLS-SUPABASE.md` — Row Level Security policies for 5 roles
- `.claude/SKILL-NAV-OVERLAY.md` — 3-layer navigation overlay system
- `.claude/SKILL-FONT-SYSTEM.md` — Font loading, weight mapping, OpenType features
- `.claude/SKILL-DARK-MODE.md` — CSS custom property theming
- `.claude/SKILL-ENGAGEMENT-HEALTH.md` — Finance calculator, health tiers, SOW simulator
- `.claude/SKILL-VENDOR-PORTAL.md` — Vendor onboarding, invoice flow, Camila routing
- `.claude/SKILL-CLIENT-MD-GENERATION.md` — Client MD file schema, data source mapping
- `.claude/SKILL-PD-SYSTEM.md` — PD tracker architecture, 3 layers, access controls

### Skill Files — DEVICE Layer (preserved)
- `.claude/SCRIB3-OS-PRD.md` — Original DEVICE PRD (superseded by `PRD.md` for OS)
- `.claude/SKILL-CRT.md` — CRT monitor aesthetics
- `.claude/SKILL-GAMIFICATION.md` — XP, levels, badges
- `.claude/SKILL-HARDWARE-CHROME.md` — CSS hardware UI components
- `.claude/SKILL-MODULE-EXPAND.md` — Module expansion animations
- `.claude/SKILL-REALTIME-PATTERNS.md` — Supabase realtime patterns

## Hard Rules
- **One `DashboardLayout.tsx`** — never duplicate per role
- **Role config in `dashboardConfig.ts`** — not scattered in components
- **All design tokens in `tokens.ts`** + Tailwind extension — no hardcoded hex values
- **DEVICE layer is frozen** — do not touch `src/scrib3-device/` unless explicitly asked
- **Never skip the plan** — read `PLAN.md` first, confirm phase, then build
- **On context compaction** — re-read `PLAN.md` immediately, resume from last incomplete task

## Conventions — OS Layer
- Editorial-corporate aesthetic (NOT SaaS template, NOT brutalist, NOT technopunk)
- Three-colour palette only: off-white, black, pink
- Kaio for display text (uppercase, `font-feature-settings: 'ordn' 1, 'dlig' 1`)
- Owners Wide for body text
- Mechanical easing curves (`cubic-bezier`, no `ease-in-out`)
- No drop shadows, no glassmorphism, no decorative elements
- Roles: `admin`, `team`, `csuite`, `client`, `vendor`
