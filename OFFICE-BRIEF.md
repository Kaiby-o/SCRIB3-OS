# SCRIB3 Virtual Office — Claude Chat Build Brief
**Version:** 1.0 | **Date:** 2026-03-28 | **Author:** Ben Lydiat (VP Creative)
**Status:** Enhancement of existing Phaser 3 foundation

---

## 1. Vision

A lightweight, multiplayer virtual office where SCRIB3 team members can walk around, sit at desks, interact with objects, and see who's online — embedded within SCRIB3-OS at the `/device` route. Think "Animal Crossing office meets Slack status." Not a full game — a visual representation of who's doing what, with light interactivity.

---

## 2. What Already Exists (Do NOT Rebuild)

### 2.1 Core Architecture
- **Phaser 3.90.0** game engine running inside React 19
- **Supabase real-time** presence sync (positions broadcast every 100-200ms)
- **Zustand** state management for office state
- **React Router** integration at `/device` and `/device/avatar-creator`

### 2.2 Working Systems

| System | Status | Location |
|--------|--------|----------|
| Player movement (WASD + arrows) | ✅ Working | `MovementSystem.ts` |
| Walk animations (4 directions) | ✅ Working | `OfficeScene.ts` |
| Collision detection (tile-based) | ✅ Working | `OfficeScene.ts` |
| Camera follow with easing | ✅ Working | `OfficeScene.ts` |
| Multiplayer presence sync | ✅ Working | `MultiplayerSystem.ts` |
| Remote player rendering + interpolation | ✅ Working | `RemoteAvatar.ts` |
| Avatar creator (layer-based compositing) | ✅ Working | `AvatarCreatorPage.tsx` |
| Avatar save/load to Supabase | ✅ Working | `AvatarCreatorPage.tsx` |
| Chat panel (basic) | ⚠️ Partial | `ChatPanel.tsx` |
| Interaction system (framework) | ⚠️ Framework only | `InteractionSystem.ts` |
| Minimap | ⚠️ Stub only | `OfficeScene.ts` |

### 2.3 File Structure
```
src/scrib3-device/
  pages/
    DashboardPage.tsx          ← Main DEVICE UI shell
    AvatarCreatorPage.tsx      ← Layer-based avatar creator (1,114 lines)
  components/virtual-office/
    VirtualOffice.tsx           ← React wrapper for Phaser game
    PhaserBridge.ts             ← Event bus between React ↔ Phaser
    ChatPanel.tsx               ← In-game chat UI
    game/
      config.ts                 ← Phaser config (800×600, CANVAS renderer)
      BootScene.ts              ← Asset preloader with loading bar
      OfficeScene.ts            ← Main game scene
    systems/
      MultiplayerSystem.ts      ← Supabase presence tracking
      MovementSystem.ts         ← Input handling + animation selection
      InteractionSystem.ts      ← Object interaction (E key, distance check)
    avatar/
      AvatarGenerator.ts        ← Canvas sprite generation
      AvatarConfig.ts           ← Type definitions + colour palettes
      RemoteAvatar.ts           ← Remote player sprite rendering

public/assets/office/
  office-layer1.png             ← Floor/wall background (REPLACE THIS)
  office-layer2.png             ← Furniture overlay (REPLACE THIS)
  office-collision.json         ← Tile collision data (UPDATE THIS)
  characters/                   ← 10 preset character spritesheets (32×32)
  character-layers/
    manifest.json               ← 65KB index of all avatar layers
    bodies/                     ← 9 skin tone body spritesheets
    eyes/                       ← 7 eye style spritesheets
    outfits/                    ← Multiple outfit styles with colour variants
    hairstyles/                 ← 10+ hairstyle/colour combos
    accessories/                ← Glasses, hats, etc.
```

### 2.4 Avatar Config Storage
```typescript
// Saved to profiles.avatar_config in Supabase
interface LayerAvatarConfig {
  type: 'layer';
  body: string;       // "body-01"
  eyes: string;       // "eyes-03"
  outfit: string;     // "outfit-05-02"
  hairstyle: string;  // "hair-12-04"
  accessories: string[];
  compositedSheet: string; // base64 PNG — 96×128 walk sheet (3 cols × 4 rows)
}
```

### 2.5 Game Config
```typescript
// Current Phaser settings
{
  type: Phaser.CANVAS,
  width: 800,
  height: 600,
  physics: { arcade: { gravity: { y: 0 } } },
  pixelArt: true,
  zoom: 1.2,
  tileSize: 32, // 32×32 pixel tiles
  playerCollisionBox: { width: 14, height: 14, offset: { x: 9, y: 16 } },
  spawnPoint: { x: 7 * 32, y: 8 * 32 } // left room
}
```

---

## 3. What Needs Building

### 3.1 PRIORITY 1 — Proper Tile-Based Office Map

**Problem:** The current office is two static PNGs with a JSON collision overlay. It looks flat, has no depth, no rooms, no character.

**Solution:** Create a proper tile-based map using **Tiled Map Editor** (https://www.mapeditor.org/).

**Requirements:**
- Export as JSON (not TMX) — Phaser 3 loads Tiled JSON natively
- **Map size:** ~40×30 tiles (1280×960 pixels at 32px tiles)
- **Tileset:** Use a modern office pixel art tileset (16-bit style, consistent with SCRIB3 aesthetic)
- **Layers required:**
  1. `floor` — carpet, wood, tiles
  2. `walls` — walls, windows, doors
  3. `furniture-below` — desks, chairs (below player)
  4. `furniture-above` — shelves, lights (above player, for depth)
  5. `collision` — collision tiles (invisible layer)
  6. `objects` — interactive objects (Tiled object layer)

**Room layout suggestion:**
```
┌─────────────────────────────────────┐
│  RECEPTION        │  MEETING ROOM   │
│  (spawn point)    │  (4 chairs)     │
│                   │                 │
├───────┬───────────┼─────────────────┤
│ BREAK │  OPEN PLAN WORKSPACE        │
│ ROOM  │  (8 desks, 2 rows of 4)    │
│       │                             │
├───────┤                             │
│ PHONE │  ┌─────┐  ┌─────┐          │
│ BOOTH │  │desk │  │desk │          │
│       │  └─────┘  └─────┘          │
├───────┴─────────────────────────────┤
│  EXECUTIVE WING    │  SERVER ROOM   │
│  (3 corner offices)│  (easter egg)  │
└────────────────────┴────────────────┘
```

**Loading in Phaser:**
```typescript
// In BootScene.ts
this.load.tilemapTiledJSON('office-map', '/assets/office/office-map.json');
this.load.image('office-tiles', '/assets/office/office-tileset.png');

// In OfficeScene.ts
const map = this.make.tilemap({ key: 'office-map' });
const tileset = map.addTilesetImage('office-tileset', 'office-tiles');
const floorLayer = map.createLayer('floor', tileset);
const wallLayer = map.createLayer('walls', tileset);
wallLayer.setCollisionByProperty({ collides: true });
this.physics.add.collider(this.player, wallLayer);
```

---

### 3.2 PRIORITY 2 — Interactive Objects

**Problem:** `InteractionSystem.ts` has a full framework for E-key interactions with distance checks, but no objects are ever registered.

**Solution:** Register objects from the Tiled object layer and connect them to actions.

**Interactive objects needed:**

| Object | Type | Action on E-key |
|--------|------|-----------------|
| Desk | `desk` | "Sit down" — plays sitting animation, shows status "Working at desk" |
| Meeting room door | `door` | "Enter meeting" — teleports to meeting room area |
| Whiteboard | `whiteboard` | Opens shared notes (connects to chat or notepad) |
| Coffee machine | `coffee` | Plays animation, shows toast "☕ Grabbed a coffee" |
| Bulletin board | `bulletin` | Opens announcements/culture page |
| Phone booth | `phone` | Shows "In a call" status to other players |
| Server room | `easter_egg` | Easter egg — plays battle mode music for 3 seconds |

**Registration in OfficeScene.ts:**
```typescript
// After creating the map
const objectLayer = map.getObjectLayer('objects');
objectLayer.objects.forEach(obj => {
  this.interactionSystem.registerObject({
    id: obj.name,
    type: obj.type,
    x: obj.x,
    y: obj.y,
    width: obj.width,
    height: obj.height,
    prompt: `Press E to ${obj.properties?.action ?? 'interact'}`,
    onInteract: () => this.handleInteraction(obj.type, obj.name),
  });
});
```

---

### 3.3 PRIORITY 3 — Auto-Sprite from Profile Photo

**Problem:** Users must manually pick body/eyes/outfit/hair layers. No option to auto-generate from their profile photo.

**Solution:** Add a "Generate from Photo" button as the FIRST step in the avatar creator flow. Use Canvas API to convert a user's Supabase avatar into a pixel art walk sheet.

**Algorithm:**
1. Load user's avatar from `profiles.avatar_url` (Supabase Storage)
2. Draw to canvas at 32×32 resolution
3. Apply pixelation (nearest-neighbor downscale)
4. Apply posterization (reduce to 8-12 colours using median-cut)
5. Extract dominant colours for skin tone, hair, clothing
6. Map to closest available avatar layers (body tone → closest body, hair colour → closest hairstyle)
7. Pre-select those layers in the manual editor
8. User can then fine-tune manually

**Canvas pipeline:**
```typescript
async function generateFromPhoto(photoUrl: string): Promise<Partial<LayerAvatarConfig>> {
  const img = await loadImage(photoUrl);
  const canvas = document.createElement('canvas');
  canvas.width = 32; canvas.height = 32;
  const ctx = canvas.getContext('2d')!;

  // Downscale with pixelation
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(img, 0, 0, 32, 32);

  // Extract dominant colours
  const imageData = ctx.getImageData(0, 0, 32, 32);
  const palette = medianCutQuantize(imageData.data, 8);

  // Map to closest body/hair/outfit layers
  const skinTone = findClosestBodyLayer(palette.skin);
  const hairColor = findClosestHairLayer(palette.hair);

  return { body: skinTone, hairstyle: hairColor };
}
```

**User flow:**
1. "Generate from Photo" button (uses their existing Supabase avatar)
2. Shows pixelated preview + auto-selected layers
3. User can accept or manually adjust each layer
4. Proceeds to normal save flow

---

### 3.4 PRIORITY 4 — Sitting Animations & Emotes

**Sitting:**
- When player interacts with a desk, switch to sitting sprite frame
- Player cannot move while sitting (disable MovementSystem input)
- Press E again to stand up
- Supabase presence broadcasts `isSitting: true` so remote players see it

**Emotes (nice to have):**
- Number keys 1-5 trigger emote bubbles above player head
- 1 = 👋 Wave, 2 = ☕ Coffee, 3 = 💬 Typing, 4 = 🎧 Headphones, 5 = 🔥 Fire
- Emote visible to all players via Supabase broadcast
- Auto-dismiss after 3 seconds

---

### 3.5 Chat Integration

**Port from OS ChatPage.tsx:**
The OS layer already has a full chat system with:
- Supabase real-time subscriptions
- Channel-based messaging
- @mention autocomplete
- Emoji reactions
- File attachments (UI ready)

**For the office chat:**
- Reuse the same `chat_messages` Supabase table
- Add a `#office` channel for proximity-based chat
- ChatPanel.tsx should be enhanced to use the same patterns as ChatPage.tsx
- Messages from users in the same "room" (based on tile position) appear in local chat
- Global messages go to the existing channel system

---

## 4. Tech Constraints

- **DO NOT** replace Phaser 3 — it's working fine as the game engine
- **DO NOT** rebuild the avatar creator from scratch — enhance it
- **DO NOT** use WorkAdventure — we're building our own lighter solution
- **DO** keep the existing Supabase real-time presence pattern
- **DO** use Tiled Map Editor for map creation (free, exports to Phaser-compatible JSON)
- **DO** keep the pixel art aesthetic consistent (32×32 tiles, 16-bit style)
- **DO** ensure the office works on the existing `/device` route

---

## 5. Existing Dependencies

```json
{
  "phaser": "^3.90.0",
  "react": "^19.2.4",
  "zustand": "^5.0.11",
  "@supabase/supabase-js": "^2.99.1",
  "vite": "^8.0.6"
}
```

No additional dependencies should be needed. Canvas API handles sprite generation. Tiled JSON is loaded natively by Phaser.

---

## 6. Acceptance Criteria

1. **Map:** Proper tile-based office with at least 5 distinct rooms, walls, furniture, and depth layers
2. **Interactions:** At least 4 interactive object types (desk, whiteboard, coffee machine, bulletin board)
3. **Auto-sprite:** "Generate from Photo" option that pre-selects avatar layers based on user's profile picture
4. **Sitting:** Players can sit at desks, visible to other players
5. **Chat:** Office chat connected to same Supabase tables as OS chat
6. **Performance:** Maintains 60fps with up to 10 simultaneous players

---

## 7. Files to Modify

| File | Change |
|------|--------|
| `BootScene.ts` | Load Tiled JSON map + tileset instead of static PNGs |
| `OfficeScene.ts` | Create tile layers, register collision, register interactive objects |
| `InteractionSystem.ts` | Add interaction handlers for each object type |
| `AvatarCreatorPage.tsx` | Add "Generate from Photo" button + Canvas pipeline |
| `MovementSystem.ts` | Add sitting state (disable input when seated) |
| `MultiplayerSystem.ts` | Broadcast sitting/emote state |
| `RemoteAvatar.ts` | Render sitting frame + emote bubbles for remote players |
| `ChatPanel.tsx` | Connect to Supabase chat_messages table |

**New files needed:**
| File | Purpose |
|------|---------|
| `public/assets/office/office-map.json` | Tiled map export |
| `public/assets/office/office-tileset.png` | Tileset spritesheet |
| `src/scrib3-device/avatar/PhotoToSprite.ts` | Auto-sprite generation from photo |

---

## 8. Reference Materials

- **Current avatar layers manifest:** `/public/assets/office/character-layers/manifest.json` (65KB)
- **Existing collision format:** `/public/assets/office/office-collision.json`
- **SCRIB3 brand colours:** Off-white `#EAF2D7`, Black `#000`, Pink `#D7ABC5`, Blue `#6E93C3`
- **Tile size:** 32×32 pixels throughout
- **Sprite sheets:** 96×128 walk sheets (3 columns × 4 rows = 12 frames)

---

*This brief describes enhancements to an existing, working Phaser 3 virtual office. The foundation is solid — we need better maps, interactive objects, auto-sprite generation, and chat integration.*
