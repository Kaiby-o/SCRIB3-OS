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
  App.tsx                        # Root router: / → OS, /device → DEVICE
  main.tsx                       # Entry point, font imports

  scrib3-os/                     # Professional platform
    styles/
      fonts.css                  # @font-face declarations
      tokens.ts                  # Design tokens (colours, type, spacing)
      os.css                     # CSS custom properties, utility classes
    config/
      dashboardConfig.ts         # Role → nav items, modules, header label
    components/
      DashboardLayout.tsx        # Single layout for all roles
      NavOverlay.tsx             # Fullscreen navigation with clip-path animations
      LoginDialog.tsx            # Auth dialog with custom shape SVG
      PillNav.tsx                # Top-centre pill navigation
      UserProfileCard.tsx        # User info card
      ClockDisplay.tsx           # Live local time
      ModulePanel.tsx            # Bento grid panel wrapper
      LogoScrib3.tsx             # SVG logo component
    pages/
      LandingPage.tsx            # / — laptop frame, enter button, burger menu
      DashboardPage.tsx          # /dashboard — role-gated
      ProfilePage.tsx            # /profile/:id
    hooks/
      useAuth.ts                 # Zustand auth store (signIn, signOut, role)
    lib/
      supabase.ts                # Supabase client

  scrib3-device/                 # Gamified admin layer (frozen)
    pages/                       # Dashboard, login, avatar creator
    components/                  # CRT shell, systems map, virtual office
    store/                       # Zustand stores
    hooks/                       # Canvas navigation
    lib/                         # Supabase client, sounds

public/
  assets/                        # SVGs (laptop frame, login shape, logo, icons)
  fonts/                         # Kaio (.woff2), Owners Wide (.otf), NT Stardust (.otf)

scripts/
  seed-users.ts                  # Interactive CLI to create seed users
  seed-now.ts                    # Direct seed with hardcoded users

supabase/
  migrations/                    # SQL migrations (profiles, RLS, support requests)
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

- **Ben Lydiatt** ([@Kaiby-o](https://github.com/Kaiby-o)) — VP Creative & Digital
- **CK** ([@CK42BB](https://github.com/CK42BB)) — Engineering

## License

Private — SCRIB3 internal use.
