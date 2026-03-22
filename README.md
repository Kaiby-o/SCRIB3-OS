# SCRIB3-OS

A retro-styled internal operating system for SCRIB3 — combining a dashboard interface, interactive systems map, virtual office, and layered character creator into one unified platform.

## Overview

SCRIB3-OS is built as a single React + TypeScript application with three main views:

| View | Description |
|------|-------------|
| **Dashboard (Device)** | Retro-tech instrument interface with modular panels, login, profile management |
| **Map** | Interactive D3-powered systems map showing SCRIB3's operational architecture |
| **Office** | 2D pixel-art virtual office (Phaser 3) where team members walk around as custom avatars |

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Game Engine**: Phaser 3 (virtual office)
- **Visualisation**: D3.js (systems map)
- **Auth/DB**: Supabase (authentication, profiles, avatar storage)
- **Styling**: CSS-in-JS with retro/pixel aesthetic
- **Assets**: LimeZu Modern Interiors tileset pack (environments + character layers)

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

## Project Structure

```
src/
  pages/
    LoginPage.tsx          # Auth flow
    DashboardPage.tsx      # Main device interface + overlay management
    AvatarCreatorPage.tsx  # Layered character customisation
  components/
    virtual-office/        # Phaser-based virtual office
      game/
        scenes/
          BootScene.ts     # Asset loading
          OfficeScene.ts   # Office world, player, collision
        systems/           # Movement, interaction, avatar config
        entities/          # Remote avatar sync
      VirtualOffice.tsx    # React wrapper for Phaser
      ChatPanel.tsx        # In-office text chat
    systems-map/           # D3 systems map module
  store/                   # Zustand stores (auth, office)
  lib/                     # Supabase client

public/assets/office/
  office-layer1.png        # Composited floor + walls (LimeZu)
  office-layer2.png        # Composited furniture overlay
  office-collision.json    # Walkable/blocked tile grid
  characters/              # Preset character spritesheets
  character-layers/        # Individual layer PNGs for character creator
    bodies/                # 9 skin tones
    eyes/                  # 7 eye styles
    outfits/               # 33 styles × multiple colours
    hairstyles/            # 29 styles × multiple colours
    accessories/           # 19 types × colour variants
    manifest.json          # Auto-generated asset catalogue

scripts/
  compose-office.cjs       # Composites LimeZu room layers into office images
  generate-manifest.cjs    # Scans character layers and builds manifest.json
```

## Known Issues / WIP (as of 2026-03-22)

- **Character creator preview**: The LimeZu layer spritesheets (1792x1312) contain ALL animations in a non-standard layout. Frame extraction at position (0,0) shows only partial character views. The preview compositor needs proper frame coordinate mapping for these sheets.
- **Walk cycle export**: The compositor currently tiles a single front-idle frame into all 12 cells of the 96x128 walk sheet. Proper walk animation requires identifying the exact frame positions for each direction in the full animation sheets.
- **Office environment**: Using pre-composed room images (Generic Home + Condominium). Works well visually but is a fixed layout. Future: custom tilemap editor or larger composed office.
- **Save & Enter flow**: Navigation from character creator to office sometimes fails silently. Uses `window.location.href` as workaround.

## Collaborators

- **Ben Lydiatt** ([@Kaiby-o](https://github.com/Kaiby-o))
- **CK** ([@CK42BB](https://github.com/CK42BB))

## License

Private — SCRIB3 internal use.
