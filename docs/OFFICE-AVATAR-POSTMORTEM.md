# Office & Avatar Creator — What Was Built and Why It Failed

> **Date:** 2026-03-29 | **Author:** Claude (for Ben's review)

---

## What Exists

### Virtual Office (`/office`)
- **Phaser 3** game engine running inside React
- **Two pre-composed PNG images** as the office background (office-layer1.png, office-layer2.png)
- **JSON collision grid** (28×14 tiles) for wall/furniture blocking
- **Multiplayer** via Supabase realtime presence (position broadcast at 10Hz)
- **Movement** with WASD/arrows, collision detection, camera follow
- **Remote players** rendered with lerp interpolation
- **Chat panel** connected to Supabase
- **Interaction system** with E-key proximity detection (desks, coffee machine, whiteboard, etc.)
- **Sitting state** and **emote system** (keys 1-5)
- **Minimap** camera in top-right

### Avatar Creator (`/device/avatar-creator`)
- **Layer-based compositing** from PNG spritesheets
- **Manifest.json** indexes all available layers: 9 bodies, 7 eyes, 20+ outfits (each with 6-10 color variants), 15+ hairstyles, 19 accessories
- **Asset pack**: LimeZu "Modern Interiors" character layers at `/public/assets/office/character-layers/`
- **Save to Supabase** `profiles.avatar_config` column

### Tilemap Attempt (disabled)
- **Generated Tiled JSON** (`office-map.json`) from a Node script
- **Two tilesets**: Room_Builder_32x32.png (76×113 tiles) and Interiors_32x32.png (16×1064 tiles)
- **Disabled** because tile IDs were estimated from visual inspection and produced garbage

---

## The Core Problem: Spritesheet Misunderstanding

The entire avatar system was built on a wrong assumption about the spritesheet format.

### What the code assumed
- Each spritesheet is a simple **3 columns × 4 rows** walk sheet (96×128 pixels)
- Frame size: **32×32 pixels**
- Row 0 = walk down (3 frames), Row 1 = walk left, Row 2 = walk right, Row 3 = walk up
- This is the **RPG Maker** standard format

### What the spritesheets actually are
- Each spritesheet is **1792×1312 pixels** (outfits/eyes/hair) or **1854×1312** (bodies)
- They contain **dozens of animation types**: idle, walk, sit, sleep, phone, pick up, lift, throw, hit, punch, stab, grab gun, shoot, hurt
- Row 0 has **4 idle direction frames** (front, right, back, left) — NOT 3 walk-down frames
- Rows 1-2 have **20+ frames** each for idle and walk animations with varying frame counts per row
- The frame grid is 32×32 but there are **56 columns × 41 rows** (2,296 frames per sheet)

### Why every fix failed
1. **Original code** extracted `(col × 32, row × 32)` assuming 3×4 layout — got wrong frames from a 56×41 sheet
2. **My RAF-based preview** had race conditions between image loading (async) and the animation draw loop (sync)
3. **Switching to useState** fixed reactivity but still extracted from wrong coordinates
4. **Reducing scale** just made the wrong extraction smaller — the fundamental source rectangle was always pulling from a tiny corner of a massive sheet
5. **The walk sheet builder** tiled the same idle frame 12 times — the saved avatar couldn't animate

The preview always showed "zoomed in top edge" because `drawImage(img, 0, 0, 32, 32, ...)` on a 1792px-wide sheet extracts just the top-left 32×32 pixels — which IS one character frame, but the character within that frame is a tiny ~16×20px figure with transparent padding. At scale 7 (224px canvas), you see a small character in a big empty box, or if the container clips it, just the top portion.

---

## What Was Attempted (Chronological)

### Session Start
1. **Restyled VirtualOffice** — replaced fragile right-side toolbar with top bar, applied SCRIB3 brand palette
2. **Restyled ChatPanel** — repositioned from hardcoded `top: 268px` to `bottom: 56px`, new design
3. **Restyled AvatarCreatorPage** — via subagent, changed fonts/colors/layout. Didn't touch rendering logic. This may have introduced subtle CSS issues.
4. **Modified AvatarGenerator.ts** — changed vector avatar proportions (head 10→8px, legs 6→8px). This affected the fallback vector system, not the layer system.

### Fix Attempts
5. **Fixed navigation** — back/save now go to `/office` instead of `/device`
6. **Fixed colors** — replaced all dark blue with black
7. **Disabled tilemap** — forced fallback to legacy pre-composed images
8. **Rewrote CompositedPreview** — switched from useRef to useState for images, hoping to fix reactivity. Didn't fix the visual issue.
9. **Fixed compositeWalkSheet** — changed from tiling single frame to extracting per-frame. Still used wrong source coordinates.
10. **Full rewrite from scratch** — 1100 lines → 274 lines. Simplified everything. Still extracted from (0,0) at 32×32 which was the same wrong approach.
11. **Reduced scale** — 7→4 for preview, 2.5→2 for thumbnails. Just made everything smaller without fixing the root cause.

---

## Files Involved

| File | Purpose | Status |
|------|---------|--------|
| `src/scrib3-device/pages/AvatarCreatorPage.tsx` | Avatar creator UI | Broken — wrong frame extraction |
| `src/scrib3-device/components/virtual-office/VirtualOffice.tsx` | Office React wrapper | Working but uses avatar system |
| `src/scrib3-device/components/virtual-office/ChatPanel.tsx` | In-office chat | Working |
| `src/scrib3-device/components/virtual-office/game/config.ts` | Phaser config | Working |
| `src/scrib3-device/components/virtual-office/game/scenes/BootScene.ts` | Asset loader | Working |
| `src/scrib3-device/components/virtual-office/game/scenes/OfficeScene.ts` | Main game scene | Working (legacy fallback) |
| `src/scrib3-device/components/virtual-office/game/systems/MovementSystem.ts` | WASD input | Working |
| `src/scrib3-device/components/virtual-office/game/systems/InteractionSystem.ts` | E-key objects | Working |
| `src/scrib3-device/components/virtual-office/game/systems/MultiplayerSystem.ts` | Supabase presence | Working |
| `src/scrib3-device/components/virtual-office/game/systems/AvatarGenerator.ts` | Vector avatar fallback | Working but ugly |
| `src/scrib3-device/components/virtual-office/game/systems/AvatarConfig.ts` | Avatar type defs | Working |
| `src/scrib3-device/components/virtual-office/game/entities/RemoteAvatar.ts` | Remote player sprites | Working |
| `src/scrib3-device/store/office.store.ts` | Zustand office state | Working |
| `src/scrib3-device/store/auth.store.ts` | DEVICE auth store | Working |
| `src/scrib3-os/pages/OfficePage.tsx` | OS-layer office wrapper | Working (email gate) |
| `public/assets/office/character-layers/manifest.json` | Layer index (65KB) | Working |
| `public/assets/office/character-layers/**/*.png` | ~200 spritesheet PNGs | Working (correct assets, wrong extraction) |
| `public/assets/office/office-layer1.png` | Pre-composed floor/walls | Working |
| `public/assets/office/office-layer2.png` | Pre-composed furniture | Working |
| `public/assets/office/office-collision.json` | Collision grid | Working |
| `public/assets/office/office-map.json` | Generated Tiled map | Broken (wrong tile IDs) |
| `public/assets/office/tilesets/*.png` | Room Builder + Interiors | Unused (tilemap disabled) |
| `scripts/generate-office-map.cjs` | Map generator | Produces broken output |

---

## Simpler Alternatives to Consider

### For the Office
1. **Keep the working Phaser foundation** — movement, multiplayer, collision, chat all work fine
2. **Use the pre-composed PNG images** — they already look good as a basic office
3. **Build a simple web-based tile editor** later when there's time to map tile IDs properly
4. **Or**: skip the custom map entirely and use a pre-made Tiled map from the LimeZu asset pack (they often include example maps)

### For the Avatar
1. **Use the 10 preset character spritesheets** already in `/public/assets/office/characters/` — these are simple 3×4 walk sheets that work perfectly with the existing Phaser animation system
2. **Simple picker UI**: show the 10 preset characters, let user pick one, done
3. **Phase the layer system later** — the layer-based compositing IS the right approach long-term, but it needs someone who can properly map the LimeZu spritesheet layout (frame offsets, animation rows, direction mapping)
4. **Or**: use a tool like TexturePacker or a custom script to extract just the walk frames from the large sheets into simple 96×128 sheets that match what the code expects

---

## What Works and Should Be Kept
- Supabase multiplayer presence system
- Movement + collision + interaction framework
- Chat panel
- Office store (Zustand)
- The route structure (`/office` with email gate)
- The pre-composed office images
- The 10 preset character sprites
