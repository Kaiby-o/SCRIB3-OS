#!/usr/bin/env node
/**
 * generate-office-map.cjs
 * Generates a valid Tiled-format JSON map for the SCRIB3 Virtual Office.
 * Uses Room_Builder_32x32.png for structure and Interiors_32x32.png for furniture.
 *
 * Run: node scripts/generate-office-map.cjs
 * Output: public/assets/office/office-map.json
 */

const fs = require('fs');
const path = require('path');

// ─── Tileset Constants ─────────────────────────────────────────────
const TILE_SIZE = 32;
const MAP_W = 40; // tiles
const MAP_H = 30; // tiles

// Room_Builder: 76 cols × 113 rows = 8588 tiles, firstgid = 1
const RB_COLS = 76;
const RB_FIRSTGID = 1;
const rb = (row, col) => RB_FIRSTGID + row * RB_COLS + col;

// Interiors: 16 cols × 1064 rows = 17024 tiles, firstgid = 8589
const INT_COLS = 16;
const INT_FIRSTGID = 8589;
const int = (row, col) => INT_FIRSTGID + row * INT_COLS + col;

// ─── Tile Definitions (from visual inspection of tilesets) ─────────
// Room_Builder tiles
const TILES = {
  // Floors — wood plank light (row ~8-9 area in Room_Builder)
  FLOOR_WOOD_1: rb(8, 1),
  FLOOR_WOOD_2: rb(8, 2),
  FLOOR_WOOD_3: rb(8, 3),
  FLOOR_WOOD_4: rb(9, 1),
  FLOOR_WOOD_5: rb(9, 2),
  FLOOR_WOOD_6: rb(9, 3),

  // Floors — carpet/tile (row ~14-15 area)
  FLOOR_CARPET_1: rb(14, 1),
  FLOOR_CARPET_2: rb(14, 2),
  FLOOR_CARPET_3: rb(14, 3),
  FLOOR_CARPET_4: rb(15, 1),
  FLOOR_CARPET_5: rb(15, 2),
  FLOOR_CARPET_6: rb(15, 3),

  // Floors — stone/tile (row ~12 area)
  FLOOR_TILE_1: rb(12, 1),
  FLOOR_TILE_2: rb(12, 2),
  FLOOR_TILE_3: rb(12, 3),
  FLOOR_TILE_4: rb(13, 1),

  // Walls — top edge (row ~0-2)
  WALL_TOP_L: rb(0, 0),
  WALL_TOP: rb(0, 1),
  WALL_TOP_R: rb(0, 2),
  WALL_MID_L: rb(1, 0),
  WALL_MID: rb(1, 1),
  WALL_MID_R: rb(1, 2),
  WALL_BOT_L: rb(2, 0),
  WALL_BOT: rb(2, 1),
  WALL_BOT_R: rb(2, 2),

  // Wall face (visible wall surface below top edge, ~row 3-4)
  WALL_FACE_L: rb(3, 0),
  WALL_FACE: rb(3, 1),
  WALL_FACE_R: rb(3, 2),

  // Interior wall variants (row ~38-42)
  IWALL_H: rb(38, 1),  // horizontal interior wall
  IWALL_V: rb(38, 0),  // vertical interior wall

  // Interiors tileset — furniture
  // Desks (approximate positions in Interiors sheet)
  DESK_L: int(48, 0),
  DESK_M: int(48, 1),
  DESK_R: int(48, 2),
  DESK_BOTTOM: int(49, 0),

  // Chairs
  CHAIR_DOWN: int(50, 0),
  CHAIR_UP: int(50, 1),
  CHAIR_LEFT: int(50, 2),
  CHAIR_RIGHT: int(50, 3),

  // Office equipment
  COMPUTER_L: int(52, 0),
  COMPUTER_R: int(52, 1),
  MONITOR: int(52, 2),
  KEYBOARD: int(53, 0),

  // Kitchen / break room
  COFFEE_MACHINE: int(200, 0),
  FRIDGE_TOP: int(196, 0),
  FRIDGE_BOT: int(197, 0),
  COUNTER_L: int(198, 0),
  COUNTER_M: int(198, 1),
  COUNTER_R: int(198, 2),
  SINK: int(199, 1),
  MICROWAVE: int(199, 2),

  // Meeting / whiteboard
  WHITEBOARD_TL: int(100, 0),
  WHITEBOARD_TR: int(100, 1),
  WHITEBOARD_BL: int(101, 0),
  WHITEBOARD_BR: int(101, 1),

  // Couch / lounge
  COUCH_L: int(60, 0),
  COUCH_M: int(60, 1),
  COUCH_R: int(60, 2),

  // Table
  TABLE_TL: int(56, 0),
  TABLE_TR: int(56, 1),
  TABLE_BL: int(57, 0),
  TABLE_BR: int(57, 1),

  // Plants / decor
  PLANT_1: int(120, 0),
  PLANT_2: int(120, 1),
  PLANT_3: int(121, 0),
  BOOKSHELF_T: int(80, 0),
  BOOKSHELF_B: int(81, 0),

  // Bulletin board
  BULLETIN_T: int(102, 0),
  BULLETIN_B: int(103, 0),

  // Server rack
  SERVER_T: int(160, 0),
  SERVER_B: int(161, 0),

  // Rug / carpet decor
  RUG_TL: int(140, 0),
  RUG_TR: int(140, 1),
  RUG_BL: int(141, 0),
  RUG_BR: int(141, 1),

  // Phone
  PHONE: int(170, 0),

  // Door
  DOOR: rb(4, 3),
};

// ─── Helper: create empty tile grid ────────────────────────────────
function grid(fill = 0) {
  return new Array(MAP_W * MAP_H).fill(fill);
}

function set(data, x, y, tile) {
  if (x >= 0 && x < MAP_W && y >= 0 && y < MAP_H) {
    data[y * MAP_W + x] = tile;
  }
}

function fillRect(data, x, y, w, h, tile) {
  for (let dy = 0; dy < h; dy++) {
    for (let dx = 0; dx < w; dx++) {
      set(data, x + dx, y + dy, tile);
    }
  }
}

function fillRectPattern(data, x, y, w, h, tiles) {
  for (let dy = 0; dy < h; dy++) {
    for (let dx = 0; dx < w; dx++) {
      const tile = tiles[(dy * w + dx) % tiles.length];
      set(data, x + dx, y + dy, tile);
    }
  }
}

function hLine(data, x, y, len, tile) {
  for (let i = 0; i < len; i++) set(data, x + i, y, tile);
}

function vLine(data, x, y, len, tile) {
  for (let i = 0; i < len; i++) set(data, x, y + i, tile);
}

// ─── Room Layout ───────────────────────────────────────────────────
// 40×30 grid
//
// ┌──────────────────┬────────────────────┐
// │   RECEPTION      │   MEETING ROOM     │  rows 0-9
// │   (spawn: 5,5)   │   (table, chairs)  │
// │                  │                    │
// ├────────┬─────────┴────────────────────┤
// │ BREAK  │   OPEN PLAN WORKSPACE        │  rows 10-20
// │ ROOM   │   (8 desks, 2 rows of 4)    │
// │        │                              │
// ├────────┤                              │
// │ PHONE  │                              │
// │ BOOTH  │                              │
// ├────────┴──────────┬───────────────────┤
// │  EXEC WING        │  SERVER ROOM      │  rows 21-29
// │  (3 corner desks) │  (easter egg)     │
// └───────────────────┴───────────────────┘

// ─── Build Layers ──────────────────────────────────────────────────

// FLOOR LAYER
const floor = grid(0);

// Reception — wood floor (0,0 to 19,9)
fillRect(floor, 1, 1, 18, 8, TILES.FLOOR_WOOD_1);

// Meeting Room — carpet (20,0 to 39,9)
fillRect(floor, 21, 1, 18, 8, TILES.FLOOR_CARPET_1);

// Break Room — tile floor (0,10 to 7,20)
fillRect(floor, 1, 11, 6, 9, TILES.FLOOR_TILE_1);

// Open Plan — wood floor (8,10 to 39,20)
fillRect(floor, 9, 11, 30, 9, TILES.FLOOR_WOOD_2);

// Phone Booth — carpet (0,21 to 7,24)
fillRect(floor, 1, 21, 6, 3, TILES.FLOOR_CARPET_2);

// Exec Wing — wood floor (0,25 to 25,29)
fillRect(floor, 1, 25, 24, 4, TILES.FLOOR_WOOD_3);

// Server Room — tile (26,21 to 39,29)
fillRect(floor, 27, 22, 12, 7, TILES.FLOOR_TILE_2);

// Corridors / doorways
fillRect(floor, 19, 1, 2, 8, TILES.FLOOR_WOOD_1); // Reception-Meeting connection
fillRect(floor, 7, 11, 2, 9, TILES.FLOOR_WOOD_1); // Break-Open connection
fillRect(floor, 1, 10, 38, 1, TILES.FLOOR_WOOD_4); // Horizontal corridor
fillRect(floor, 1, 20, 38, 2, TILES.FLOOR_WOOD_4); // Horizontal corridor lower
fillRect(floor, 25, 11, 1, 18, TILES.FLOOR_WOOD_4); // Vertical corridor

// WALLS LAYER
const walls = grid(0);

// Outer walls
hLine(walls, 0, 0, MAP_W, TILES.WALL_TOP);     // Top
hLine(walls, 0, MAP_H - 1, MAP_W, TILES.WALL_BOT); // Bottom
vLine(walls, 0, 0, MAP_H, TILES.WALL_MID_L);   // Left
vLine(walls, MAP_W - 1, 0, MAP_H, TILES.WALL_MID_R); // Right

// Corners
set(walls, 0, 0, TILES.WALL_TOP_L);
set(walls, MAP_W - 1, 0, TILES.WALL_TOP_R);
set(walls, 0, MAP_H - 1, TILES.WALL_BOT_L);
set(walls, MAP_W - 1, MAP_H - 1, TILES.WALL_BOT_R);

// Interior walls — Reception/Meeting divider
vLine(walls, 20, 0, 4, TILES.IWALL_V);
// Gap for door at y=4-5
vLine(walls, 20, 6, 4, TILES.IWALL_V);

// Reception/Break Room - horizontal wall at y=10
hLine(walls, 0, 10, 8, TILES.IWALL_H);
// Gap for door at x=8
hLine(walls, 9, 10, 31, TILES.IWALL_H);

// Meeting Room / Open Plan - horizontal wall at y=10 (continued)
// Already covered above

// Break Room left wall (already outer wall)
// Break Room / Phone Booth divider
hLine(walls, 0, 20, 4, TILES.IWALL_H);
// Gap for door
hLine(walls, 5, 20, 3, TILES.IWALL_H);

// Break/Phone right wall
vLine(walls, 8, 10, 11, TILES.IWALL_V);
// Gap at y=15 for door to open plan
set(walls, 8, 15, 0);
set(walls, 8, 16, 0);

// Phone Booth / Exec divider
hLine(walls, 0, 24, 8, TILES.IWALL_H);

// Exec Wing / Server Room divider
vLine(walls, 26, 21, 9, TILES.IWALL_V);
// Gap at y=25 for door
set(walls, 26, 25, 0);
set(walls, 26, 26, 0);

// Lower horizontal wall
hLine(walls, 0, 21, 8, TILES.IWALL_H);
hLine(walls, 26, 21, 14, TILES.IWALL_H);
// Connect vertical corridor
hLine(walls, 8, 21, 18, 0); // Clear corridor area

// FURNITURE BELOW (renders below player, depth < player)
const furnitureBelow = grid(0);

// Reception — welcome desk
set(furnitureBelow, 5, 3, TILES.DESK_L);
set(furnitureBelow, 6, 3, TILES.DESK_M);
set(furnitureBelow, 7, 3, TILES.DESK_R);
set(furnitureBelow, 6, 4, TILES.CHAIR_DOWN);

// Reception — couch
set(furnitureBelow, 12, 7, TILES.COUCH_L);
set(furnitureBelow, 13, 7, TILES.COUCH_M);
set(furnitureBelow, 14, 7, TILES.COUCH_R);

// Reception — coffee table
set(furnitureBelow, 12, 5, TILES.TABLE_TL);
set(furnitureBelow, 13, 5, TILES.TABLE_TR);

// Meeting Room — conference table (center)
fillRect(furnitureBelow, 27, 3, 4, 2, TILES.TABLE_TL);
set(furnitureBelow, 27, 3, TILES.TABLE_TL);
set(furnitureBelow, 28, 3, TILES.TABLE_TR);
set(furnitureBelow, 27, 4, TILES.TABLE_BL);
set(furnitureBelow, 28, 4, TILES.TABLE_BR);
set(furnitureBelow, 29, 3, TILES.TABLE_TL);
set(furnitureBelow, 30, 3, TILES.TABLE_TR);
set(furnitureBelow, 29, 4, TILES.TABLE_BL);
set(furnitureBelow, 30, 4, TILES.TABLE_BR);
// Chairs around meeting table
set(furnitureBelow, 27, 2, TILES.CHAIR_DOWN);
set(furnitureBelow, 29, 2, TILES.CHAIR_DOWN);
set(furnitureBelow, 31, 2, TILES.CHAIR_DOWN);
set(furnitureBelow, 27, 5, TILES.CHAIR_UP);
set(furnitureBelow, 29, 5, TILES.CHAIR_UP);
set(furnitureBelow, 31, 5, TILES.CHAIR_UP);
set(furnitureBelow, 26, 3, TILES.CHAIR_RIGHT);
set(furnitureBelow, 32, 4, TILES.CHAIR_LEFT);

// Open Plan — 8 desks in 2 rows of 4
for (let i = 0; i < 4; i++) {
  const dx = 12 + i * 4;
  // Row 1
  set(furnitureBelow, dx, 13, TILES.DESK_L);
  set(furnitureBelow, dx + 1, 13, TILES.DESK_R);
  set(furnitureBelow, dx, 14, TILES.CHAIR_DOWN);
  set(furnitureBelow, dx + 1, 14, TILES.COMPUTER_L);
  // Row 2
  set(furnitureBelow, dx, 17, TILES.DESK_L);
  set(furnitureBelow, dx + 1, 17, TILES.DESK_R);
  set(furnitureBelow, dx, 18, TILES.CHAIR_DOWN);
  set(furnitureBelow, dx + 1, 18, TILES.COMPUTER_R);
}

// Break Room — counter + coffee machine
hLine(furnitureBelow, 1, 12, 4, TILES.COUNTER_M);
set(furnitureBelow, 1, 12, TILES.COUNTER_L);
set(furnitureBelow, 4, 12, TILES.COUNTER_R);
set(furnitureBelow, 2, 11, TILES.COFFEE_MACHINE);
set(furnitureBelow, 4, 11, TILES.MICROWAVE);
set(furnitureBelow, 5, 12, TILES.SINK);
set(furnitureBelow, 6, 11, TILES.FRIDGE_TOP);
set(furnitureBelow, 6, 12, TILES.FRIDGE_BOT);
// Break room table
set(furnitureBelow, 3, 15, TILES.TABLE_TL);
set(furnitureBelow, 4, 15, TILES.TABLE_TR);
set(furnitureBelow, 3, 16, TILES.TABLE_BL);
set(furnitureBelow, 4, 16, TILES.TABLE_BR);
set(furnitureBelow, 2, 15, TILES.CHAIR_RIGHT);
set(furnitureBelow, 5, 16, TILES.CHAIR_LEFT);

// Phone Booth — chair + phone
set(furnitureBelow, 3, 22, TILES.CHAIR_DOWN);
set(furnitureBelow, 4, 22, TILES.PHONE);

// Exec Wing — 3 corner office desks
for (let i = 0; i < 3; i++) {
  const ex = 3 + i * 7;
  set(furnitureBelow, ex, 27, TILES.DESK_L);
  set(furnitureBelow, ex + 1, 27, TILES.DESK_R);
  set(furnitureBelow, ex + 1, 27, TILES.COMPUTER_L);
  set(furnitureBelow, ex, 28, TILES.CHAIR_DOWN);
}

// Server Room — racks
for (let i = 0; i < 4; i++) {
  set(furnitureBelow, 29 + i * 2, 23, TILES.SERVER_T);
  set(furnitureBelow, 29 + i * 2, 24, TILES.SERVER_B);
}

// FURNITURE ABOVE (renders above player for depth effect)
const furnitureAbove = grid(0);

// Meeting Room — whiteboard on wall
set(furnitureAbove, 28, 1, TILES.WHITEBOARD_TL);
set(furnitureAbove, 29, 1, TILES.WHITEBOARD_TR);

// Bulletin board in reception
set(furnitureAbove, 2, 1, TILES.BULLETIN_T);

// Bookshelves on exec wing wall
set(furnitureAbove, 1, 25, TILES.BOOKSHELF_T);
set(furnitureAbove, 2, 25, TILES.BOOKSHELF_T);

// Plants scattered
set(furnitureAbove, 18, 1, TILES.PLANT_1);
set(furnitureAbove, 38, 1, TILES.PLANT_2);
set(furnitureAbove, 1, 9, TILES.PLANT_3);
set(furnitureAbove, 38, 9, TILES.PLANT_1);
set(furnitureAbove, 1, 19, TILES.PLANT_2);
set(furnitureAbove, 38, 19, TILES.PLANT_1);

// COLLISION LAYER (1 = blocked, 0 = passable)
const collision = grid(0);

// Outer walls — all blocked
hLine(collision, 0, 0, MAP_W, 1);
hLine(collision, 0, MAP_H - 1, MAP_W, 1);
vLine(collision, 0, 0, MAP_H, 1);
vLine(collision, MAP_W - 1, 0, MAP_H, 1);

// Interior walls — copy from walls layer (any non-zero = collision)
for (let i = 0; i < walls.length; i++) {
  if (walls[i] !== 0) collision[i] = 1;
}

// Furniture collision — desks, tables, counters, servers, bookshelves
// Reception desk
fillRect(collision, 5, 3, 3, 1, 1);
// Meeting table
fillRect(collision, 27, 3, 4, 2, 1);
// Open Plan desks
for (let i = 0; i < 4; i++) {
  const dx = 12 + i * 4;
  fillRect(collision, dx, 13, 2, 1, 1);
  fillRect(collision, dx, 17, 2, 1, 1);
}
// Break room counter
hLine(collision, 1, 12, 5, 1);
hLine(collision, 1, 11, 7, 1); // items on counter + fridge
// Break room table
fillRect(collision, 3, 15, 2, 2, 1);
// Exec desks
for (let i = 0; i < 3; i++) {
  const ex = 3 + i * 7;
  fillRect(collision, ex, 27, 2, 1, 1);
}
// Server racks
for (let i = 0; i < 4; i++) {
  fillRect(collision, 29 + i * 2, 23, 1, 2, 1);
}
// Couches
fillRect(collision, 12, 7, 3, 1, 1);
// Coffee table
fillRect(collision, 12, 5, 2, 1, 1);

// ─── Object Layer (interactables) ──────────────────────────────────
let nextObjId = 1;
const objects = [];

function addObject(name, type, x, y, w, h, action) {
  objects.push({
    id: nextObjId++,
    name,
    type: '',
    x: x * TILE_SIZE,
    y: y * TILE_SIZE,
    width: w * TILE_SIZE,
    height: h * TILE_SIZE,
    rotation: 0,
    visible: true,
    properties: [
      { name: 'type', type: 'string', value: type },
      { name: 'action', type: 'string', value: action },
    ],
  });
}

// Reception desk
addObject('desk-reception', 'desk', 5, 3, 3, 2, 'sit down');

// Meeting table chairs
addObject('meeting-1', 'meeting', 26, 2, 8, 5, 'join meeting');

// Whiteboard
addObject('whiteboard-1', 'whiteboard', 28, 1, 2, 1, 'view notes');

// Open Plan desks (8 desks)
for (let i = 0; i < 4; i++) {
  const dx = 12 + i * 4;
  addObject(`desk-op-${i * 2 + 1}`, 'desk', dx, 13, 2, 2, 'sit down');
  addObject(`desk-op-${i * 2 + 2}`, 'desk', dx, 17, 2, 2, 'sit down');
}

// Coffee machine
addObject('coffee-1', 'coffee', 2, 11, 1, 1, 'grab coffee');

// Bulletin board
addObject('bulletin-1', 'bulletin', 2, 1, 1, 1, 'read announcements');

// Phone booth
addObject('phone-1', 'phone', 3, 22, 2, 1, 'make a call');

// Break room table
addObject('break-table', 'desk', 3, 15, 2, 2, 'sit down');

// Exec desks
for (let i = 0; i < 3; i++) {
  addObject(`desk-exec-${i + 1}`, 'desk', 3 + i * 7, 27, 2, 2, 'sit down');
}

// Server room
addObject('server-room', 'easter_egg', 29, 23, 8, 2, 'hack the mainframe');

// ─── Assemble Tiled JSON ───────────────────────────────────────────
const tiledMap = {
  compressionlevel: -1,
  height: MAP_H,
  width: MAP_W,
  infinite: false,
  orientation: 'orthogonal',
  renderorder: 'right-down',
  tiledversion: '1.10.2',
  tileheight: TILE_SIZE,
  tilewidth: TILE_SIZE,
  type: 'map',
  version: '1.10',
  nextlayerid: 7,
  nextobjectid: nextObjId,
  properties: [],

  tilesets: [
    {
      firstgid: RB_FIRSTGID,
      name: 'RoomBuilder',
      image: 'tilesets/Room_Builder_32x32.png',
      imagewidth: 2432,
      imageheight: 3616,
      columns: RB_COLS,
      margin: 0,
      spacing: 0,
      tilecount: 8588,
      tilewidth: TILE_SIZE,
      tileheight: TILE_SIZE,
    },
    {
      firstgid: INT_FIRSTGID,
      name: 'Interiors',
      image: 'tilesets/Interiors_32x32.png',
      imagewidth: 512,
      imageheight: 34048,
      columns: INT_COLS,
      margin: 0,
      spacing: 0,
      tilecount: 17024,
      tilewidth: TILE_SIZE,
      tileheight: TILE_SIZE,
    },
  ],

  layers: [
    {
      id: 1,
      name: 'floor',
      type: 'tilelayer',
      visible: true,
      opacity: 1,
      x: 0,
      y: 0,
      width: MAP_W,
      height: MAP_H,
      data: floor,
    },
    {
      id: 2,
      name: 'walls',
      type: 'tilelayer',
      visible: true,
      opacity: 1,
      x: 0,
      y: 0,
      width: MAP_W,
      height: MAP_H,
      data: walls,
    },
    {
      id: 3,
      name: 'furniture-below',
      type: 'tilelayer',
      visible: true,
      opacity: 1,
      x: 0,
      y: 0,
      width: MAP_W,
      height: MAP_H,
      data: furnitureBelow,
    },
    {
      id: 4,
      name: 'furniture-above',
      type: 'tilelayer',
      visible: true,
      opacity: 1,
      x: 0,
      y: 0,
      width: MAP_W,
      height: MAP_H,
      data: furnitureAbove,
    },
    {
      id: 5,
      name: 'collision',
      type: 'tilelayer',
      visible: false,
      opacity: 1,
      x: 0,
      y: 0,
      width: MAP_W,
      height: MAP_H,
      data: collision,
      properties: [
        { name: 'collision', type: 'bool', value: true },
      ],
    },
    {
      id: 6,
      name: 'objects',
      type: 'objectgroup',
      visible: true,
      opacity: 1,
      x: 0,
      y: 0,
      draworder: 'topdown',
      objects,
    },
  ],
};

// ─── Write output ──────────────────────────────────────────────────
const outPath = path.join(__dirname, '..', 'public', 'assets', 'office', 'office-map.json');
fs.writeFileSync(outPath, JSON.stringify(tiledMap, null, 2));
console.log(`Office map written to ${outPath}`);
console.log(`Map: ${MAP_W}x${MAP_H} tiles (${MAP_W * TILE_SIZE}x${MAP_H * TILE_SIZE}px)`);
console.log(`Layers: ${tiledMap.layers.length} (floor, walls, furniture-below, furniture-above, collision, objects)`);
console.log(`Objects: ${objects.length} interactables`);
