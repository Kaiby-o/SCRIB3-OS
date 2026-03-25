# SCRIB3-OS

## What This Is

This repo contains **two layers** of the SCRIB3 internal platform:

### SCRIB3-OS (`src/scrib3-os/`)
The professional-facing operating platform. Editorial-corporate design with a warm organic palette (off-white, black, pink). Role-based dashboards for team, clients, vendors, and C-suite. Built with Tailwind CSS.

### SCRIB3-DEVICE (`src/scrib3-device/`)
The original gamified admin layer. Militarised sci-fi field device aesthetic with CRT monitors, hardware chrome, and Phaser-based virtual office. Admin-only access at `/device`. **Frozen — do not modify unless explicitly asked.**

## Current Phase
SCRIB3-OS rebuild — **All 6 phases complete.** Shell is functional with auth, landing page, login, Google OAuth, role-based dashboards. Next: stakeholder journeys (client onboarding → client portals), dashboard content modules, visual polish. See `PLAN.md` for full history.

## Routing
- `/` → OS landing (public)
- `/login` → Shared auth
- `/dashboard` → OS role-gated dashboard
- `/profile/:id` → OS team profile
- `/device` → DEVICE layer (admin only)
- `/device/avatar-creator` → DEVICE avatar creator (admin only)

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

## Key Artefacts
- `PLAN.md` — Full build plan with phases, dependencies, risks
- `PRD.md` — Product requirements for SCRIB3-OS

### Skill Files — OS Layer
- `.claude/SKILL-DASHBOARD-VARIANTS.md` — Single layout component + role config pattern
- `.claude/SKILL-RLS-SUPABASE.md` — Row Level Security policies for 5 roles
- `.claude/SKILL-NAV-OVERLAY.md` — 3-layer navigation overlay system
- `.claude/SKILL-FONT-SYSTEM.md` — Font loading, weight mapping, OpenType features
- `.claude/SKILL-DARK-MODE.md` — CSS custom property theming

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
