# Virtual Office Implementation Plan

## Phase 1: Tile-Based Office Map
- Create `scripts/generate-office-map.js` — Node script that outputs valid Tiled JSON
- Map size: 40×30 tiles (1280×960px)
- Tilesets: Room_Builder_32x32.png (firstgid=1, 76 cols, 8588 tiles) + Interiors_32x32.png (firstgid=8589, 16 cols, 17024 tiles)
- Layers: floor, walls, furniture-below (depth < player), furniture-above (depth > player), collision
- Object layer: interactables (desks, whiteboard, coffee, bulletin, phone booth, meeting, server room)
- Rooms: Reception (spawn), Open Plan, Meeting Room, Break Room, Phone Booth, Executive Wing, Server Room

## Phase 2: Update BootScene + OfficeScene
- BootScene: Load tilemapTiledJSON + tileset images instead of static PNGs
- OfficeScene: Create layers from tilemap, set collision from layer, load objects from object layer
- Update map bounds, spawn point, camera follow

## Phase 3: Interaction Handlers
- Desk: Sit/stand toggle, "Working at desk" status
- Whiteboard: Open toast "Shared notes coming soon"
- Coffee Machine: Play animation toast "Grabbed a coffee"
- Bulletin Board: Navigate to culture hub
- Phone Booth: "In a call" status
- Meeting Room: Teleport to meeting area
- Server Room: Easter egg — battle music for 3 seconds

## Phase 4: Sitting State + Emotes
- MovementSystem: Disable input when seated, E to stand
- MultiplayerSystem: Broadcast isSitting + emote
- RemoteAvatar: Render seated frame + emote bubble
- Number keys 1-5 for emotes (wave, coffee, typing, headphones, fire)

## Phase 5: Build, Verify, Commit, Merge, Push
