# SCRIB3-OS

The professional operating platform for SCRIB3 — a role-based internal hub for team, clients, vendors, and leadership, built with a distinctive editorial-organic design language.

## Overview

SCRIB3-OS is a React + TypeScript platform with two layers:

| Layer | Route | Description |
|-------|-------|-------------|
| **OS** | `/` | Professional platform — landing, login, role-based dashboards, client portals |
| **DEVICE** | `/device` | Gamified admin layer — retro CRT interface, virtual office, systems map (admin only) |

## Tech Stack

- **Frontend**: React 19 + TypeScript + Vite 8
- **Styling**: Tailwind CSS v4 (OS layer), custom CSS (DEVICE layer)
- **State**: Zustand
- **Auth/DB**: Supabase (email/password + Google OAuth, RLS, profiles)
- **Fonts**: Kaio (7 weights), Owners Wide, NT Stardust — self-hosted
- **Game Engine**: Phaser 3 (DEVICE virtual office only)
- **Visualisation**: D3.js (DEVICE systems map only)

## Design Language

Three-colour palette with an editorial-organic aesthetic:

| Token | Hex | Usage |
|-------|-----|-------|
| Off-white | `#EAF2D7` | Backgrounds, body text on dark |
| Black | `#000000` | Text, UI chrome |
| Pink | `#D7ABC5` | Accents, CTAs, interactive elements |
| Blue | `#6E93C3` | Secondary accent (headings, toggles) |

Custom brand SVGs (laptop frame, login shape, logo) define the visual identity — hand-drawn, cutout aesthetic throughout.

## Getting Started

```bash
npm install
npm run dev
```

Navigate to `http://localhost:5173`

### Environment Variables

Create a `.env` file:
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Seed Users

To seed test users (requires service role key):
```bash
set SUPABASE_URL=your_supabase_url
set SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
npx tsx scripts/seed-users.ts
```

## Project Structure

```
src/
  App.tsx                        # Root router — 24 routes
  main.tsx                       # Entry point, font imports

  scrib3-os/                     # Professional platform
    styles/
      fonts.css                  # @font-face declarations
      tokens.ts                  # Design tokens (colours, type, spacing)
      os.css                     # CSS custom properties, Tailwind v4, utility classes
    config/
      dashboardConfig.ts         # Role → nav items, modules, grid layout
    components/
      DashboardLayout.tsx        # Single layout for all 5 roles
      NavOverlay.tsx             # 3-layer fullscreen nav with clip-path animations
      FloatingWidget.tsx         # Persistent bottom pill (avatar, XP, quick links)
      AuthGuard.tsx              # Auth + role guards, renders floating widget
      LoginDialog.tsx            # Auth dialog with custom shape SVG
      PillNav.tsx                # Top-centre pill navigation
      UserProfileCard.tsx        # User info card
      ClockDisplay.tsx           # Live local time
      ModulePanel.tsx            # Bento grid panel wrapper
      LogoScrib3.tsx             # SVG logo component
      modules/
        ModuleContent.tsx        # 19 module content components (all 5 roles)
    pages/
      LandingPage.tsx            # /
      DashboardPage.tsx          # /dashboard
      ProfilePage.tsx            # /profile/:id
      TeamDirectoryPage.tsx      # /team
      TeamProfilePage.tsx        # /team/:id
      ProfDevPage.tsx            # /pd/:id
      ClientListPage.tsx         # /clients
      ClientOnboardPage.tsx      # /clients/onboard
      ClientHubPage.tsx          # /clients/:slug/hub
      ClientPortalPage.tsx       # /portal/:slug
      ProjectRegistryPage.tsx    # /projects
      UnitDashboardsPage.tsx     # /units
      FinanceOverviewPage.tsx    # /finance
      FinanceDetailPage.tsx      # /finance/:slug
      VendorManagementPage.tsx   # /vendors
      VendorOnboardPage.tsx      # /vendors/onboard
      PreAlignmentPage.tsx       # /pre-alignment
      BandwidthPage.tsx          # /bandwidth
      ScopeWatchPage.tsx         # /scope-watch
      WhatGoodLooksLikePage.tsx  # /resources/what-good-looks-like
      CultureHubPage.tsx         # /culture
      ToolsDirectoryPage.tsx     # /tools
    hooks/
      useAuth.ts                 # Zustand auth store
      useTheme.ts                # Dark/light mode (localStorage + data-theme)
    lib/
      supabase.ts                # Supabase client
      engagementHealth.ts        # 6 clients, health tiers, SOW simulator
      bandwidth.ts               # 7 estimates, digest builder
      vendors.ts                 # 5 vendors, 5 invoices
      scopeWatch.ts              # 9 entries, SOW clause refs
      team.ts                    # 29-person roster
      clients.ts                 # 6 priority clients, full MD schema
      projects.ts                # 10 projects
      xp.ts                      # 5 levels, 16 events

  scrib3-device/                 # Gamified admin layer (frozen)
    pages/                       # Dashboard, avatar creator
    components/                  # CRT shell, systems map, virtual office
    store/                       # Zustand stores
    hooks/                       # Canvas navigation
    lib/                         # Supabase client

public/
  assets/                        # SVGs, office layers, character PNGs
  fonts/                         # Kaio (.woff2), Owners Wide (.otf), NT Stardust (.otf)
```

## Auth & Roles

Five roles with distinct dashboard configurations:

| Role | Access | Description |
|------|--------|-------------|
| `admin` | Full | All modules + DEVICE layer access |
| `csuite` | Leadership | Strategy, financials, high-level metrics |
| `team` | Internal | Project work, tasks, collaboration tools |
| `client` | External | Project status, deliverables, communication |
| `vendor` | External | Briefs, submissions, payments |

Google OAuth and email/password authentication via Supabase. Row-level security enforces data access per role.

## Collaborators

- **Ben Lydiat** ([@Kaiby-o](https://github.com/Kaiby-o)) — VP Creative & Digital
- **CK** ([@CK42BB](https://github.com/CK42BB)) — Engineering

## License

Private — SCRIB3 internal use.
