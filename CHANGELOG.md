# Changelog

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
