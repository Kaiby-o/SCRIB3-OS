import Phaser from 'phaser';
import { bridge } from '../../PhaserBridge';
import { MovementSystem } from '../systems/MovementSystem';
import { InteractionSystem, type InteractableData } from '../systems/InteractionSystem';
import { RemoteAvatar } from '../entities/RemoteAvatar';
import { generateAvatarCanvas, getAvatarColor } from '../systems/AvatarGenerator';
import type { RemoteUser } from '../../../../store/office.store';

// 30x20 office map layout
const MAP_WIDTH = 30;
const MAP_HEIGHT = 20;
const TILE_SIZE = 32;

// Tile indices matching BootScene tilesheet
const V = 0;   // Void
const WF = 1;  // Wood floor
const CF = 2;  // Carpet
const TF = 3;  // Tile floor
const WH = 4;  // Wall horizontal
const WV = 5;  // Wall vertical
const CTL = 6; // Corner TL
const CTR = 7; // Corner TR
const CBL = 8; // Corner BL
const CBR = 9; // Corner BR
const DK = 10; // Desk
const CH = 11; // Chair
const SF = 12; // Sofa
const TB = 13; // Table
const PL = 14; // Plant
const WB = 15; // Whiteboard
const CM = 16; // Coffee machine
const BS = 17; // Bookshelf
const DR = 18; // Door
const WN = 19; // Window
const RG = 20; // Rug

// Floor layer
const FLOOR: number[][] = [
  [V,  V,  V,  V,  V,  V,  V,  V,  V,  V,  V,  V,  V,  V,  V,  V,  V,  V,  V,  V,  V,  V,  V,  V,  V,  V,  V,  V,  V,  V],
  [V,  TF, TF, TF, TF, TF, TF, TF, TF, TF, TF, TF, TF, TF, V,  CF, CF, CF, CF, CF, CF, CF, CF, CF, CF, CF, CF, CF, CF, V],
  [V,  TF, TF, TF, TF, TF, TF, TF, TF, TF, TF, TF, TF, TF, V,  CF, CF, CF, CF, CF, CF, CF, CF, CF, CF, CF, CF, CF, CF, V],
  [V,  TF, TF, TF, TF, TF, TF, TF, TF, TF, TF, TF, TF, TF, V,  CF, CF, CF, CF, CF, CF, CF, CF, CF, CF, CF, CF, CF, CF, V],
  [V,  TF, TF, TF, TF, TF, TF, TF, TF, TF, TF, TF, TF, TF, V,  CF, CF, CF, CF, CF, CF, CF, CF, CF, CF, CF, CF, CF, CF, V],
  [V,  TF, TF, TF, TF, TF, TF, TF, TF, TF, TF, TF, TF, TF, V,  CF, CF, CF, CF, CF, CF, CF, CF, CF, CF, CF, CF, CF, CF, V],
  [V,  V,  V,  V,  V,  DR, V,  V,  V,  V,  V,  V,  V,  V,  V,  V,  V,  V,  V,  DR, V,  V,  V,  V,  V,  V,  V,  V,  V,  V],
  [V,  WF, WF, WF, WF, WF, WF, WF, WF, WF, WF, WF, WF, WF, WF, WF, WF, WF, WF, WF, WF, WF, WF, WF, WF, WF, WF, WF, WF, V],
  [V,  WF, WF, WF, WF, WF, WF, WF, WF, WF, WF, WF, WF, WF, WF, WF, WF, WF, WF, WF, WF, WF, WF, WF, WF, WF, WF, WF, WF, V],
  [V,  WF, WF, WF, WF, WF, WF, WF, WF, WF, WF, WF, WF, WF, WF, WF, WF, WF, WF, WF, WF, WF, WF, WF, WF, WF, WF, WF, WF, V],
  [V,  WF, WF, WF, WF, WF, WF, WF, WF, WF, WF, RG, RG, RG, RG, RG, RG, RG, RG, WF, WF, WF, WF, WF, WF, WF, WF, WF, WF, V],
  [V,  WF, WF, WF, WF, WF, WF, WF, WF, WF, WF, RG, RG, RG, RG, RG, RG, RG, RG, WF, WF, WF, WF, WF, WF, WF, WF, WF, WF, V],
  [V,  WF, WF, WF, WF, WF, WF, WF, WF, WF, WF, WF, WF, WF, WF, WF, WF, WF, WF, WF, WF, WF, WF, WF, WF, WF, WF, WF, WF, V],
  [V,  V,  V,  V,  V,  V,  DR, V,  V,  V,  V,  V,  V,  V,  V,  V,  V,  V,  V,  V,  V,  V,  DR, V,  V,  V,  V,  V,  V,  V],
  [V,  CF, CF, CF, CF, CF, CF, CF, CF, CF, CF, CF, CF, CF, V,  TF, TF, TF, TF, TF, TF, TF, TF, TF, TF, TF, TF, TF, TF, V],
  [V,  CF, CF, CF, CF, CF, CF, CF, CF, CF, CF, CF, CF, CF, V,  TF, TF, TF, TF, TF, TF, TF, TF, TF, TF, TF, TF, TF, TF, V],
  [V,  CF, CF, CF, CF, CF, CF, CF, CF, CF, CF, CF, CF, CF, V,  TF, TF, TF, TF, TF, TF, TF, TF, TF, TF, TF, TF, TF, TF, V],
  [V,  CF, CF, CF, CF, CF, CF, CF, CF, CF, CF, CF, CF, CF, V,  TF, TF, TF, TF, TF, TF, TF, TF, TF, TF, TF, TF, TF, TF, V],
  [V,  CF, CF, CF, CF, CF, CF, CF, CF, CF, CF, CF, CF, CF, V,  TF, TF, TF, TF, TF, TF, TF, TF, TF, TF, TF, TF, TF, TF, V],
  [V,  V,  V,  V,  V,  V,  V,  V,  V,  V,  V,  V,  V,  V,  V,  V,  V,  V,  V,  V,  V,  V,  V,  V,  V,  V,  V,  V,  V,  V],
];

// Furniture/objects layer (0 = empty, drawn on top of floor)
const FURNITURE: number[][] = Array.from({ length: MAP_HEIGHT }, () => Array(MAP_WIDTH).fill(0));

// Place furniture
// Reception (top-left room)
FURNITURE[2][3] = DK;  // Reception desk
FURNITURE[2][4] = DK;
FURNITURE[3][1] = PL;
FURNITURE[3][12] = BS;

// Lounge (top-right room)
FURNITURE[2][16] = SF;
FURNITURE[2][17] = SF;
FURNITURE[3][16] = SF;
FURNITURE[3][17] = SF;
FURNITURE[2][20] = CM;
FURNITURE[4][20] = PL;
FURNITURE[4][27] = PL;

// Open plan desk rows (left side)
FURNITURE[8][2] = DK;  // desk-01
FURNITURE[8][3] = CH;
FURNITURE[9][2] = DK;  // desk-02
FURNITURE[9][3] = CH;
FURNITURE[11][2] = DK; // desk-03
FURNITURE[11][3] = CH;
FURNITURE[12][2] = DK; // desk-04
FURNITURE[12][3] = CH;

// Open plan desk rows (right side)
FURNITURE[8][27] = DK;  // desk-05
FURNITURE[8][26] = CH;
FURNITURE[9][27] = DK;  // desk-06
FURNITURE[9][26] = CH;
FURNITURE[11][27] = DK; // desk-07
FURNITURE[11][26] = CH;
FURNITURE[12][27] = DK; // desk-08
FURNITURE[12][26] = CH;

// Meeting room (bottom-left)
FURNITURE[15][4] = TB;
FURNITURE[15][5] = TB;
FURNITURE[15][6] = TB;
FURNITURE[15][7] = TB;
FURNITURE[14][4] = CH;
FURNITURE[14][7] = CH;
FURNITURE[16][4] = CH;
FURNITURE[16][7] = CH;
FURNITURE[17][1] = PL;

// Whiteboard area (bottom-right)
FURNITURE[14][17] = WB;
FURNITURE[14][20] = WB;
FURNITURE[17][28] = PL;
FURNITURE[17][15] = BS;

// Collision layer — 1 = blocked
const COLLISION: number[][] = Array.from({ length: MAP_HEIGHT }, (_, r) =>
  Array.from({ length: MAP_WIDTH }, (_, c) => {
    // Walls (void tiles at edges and dividers)
    if (FLOOR[r][c] === V && !(FLOOR[r][c] === V && r === 0)) return 1;
    // Furniture blocks movement (desks, tables, sofas, bookshelves, etc.)
    const f = FURNITURE[r][c];
    if (f === DK || f === TB || f === SF || f === BS || f === CM || f === WB || f === PL) return 1;
    return 0;
  })
);

// Interactable objects
const INTERACTABLES: InteractableData[] = [
  { id: 'desk-01', type: 'desk', x: 2 * 32 + 16, y: 8 * 32 + 16, width: 32, height: 32 },
  { id: 'desk-02', type: 'desk', x: 2 * 32 + 16, y: 9 * 32 + 16, width: 32, height: 32 },
  { id: 'desk-03', type: 'desk', x: 2 * 32 + 16, y: 11 * 32 + 16, width: 32, height: 32 },
  { id: 'desk-04', type: 'desk', x: 2 * 32 + 16, y: 12 * 32 + 16, width: 32, height: 32 },
  { id: 'desk-05', type: 'desk', x: 27 * 32 + 16, y: 8 * 32 + 16, width: 32, height: 32 },
  { id: 'desk-06', type: 'desk', x: 27 * 32 + 16, y: 9 * 32 + 16, width: 32, height: 32 },
  { id: 'desk-07', type: 'desk', x: 27 * 32 + 16, y: 11 * 32 + 16, width: 32, height: 32 },
  { id: 'desk-08', type: 'desk', x: 27 * 32 + 16, y: 12 * 32 + 16, width: 32, height: 32 },
  { id: 'coffee-01', type: 'coffee', x: 20 * 32 + 16, y: 2 * 32 + 16, width: 32, height: 32 },
  { id: 'whiteboard-01', type: 'whiteboard', x: 17 * 32 + 16, y: 14 * 32 + 16, width: 32, height: 32 },
  { id: 'whiteboard-02', type: 'whiteboard', x: 20 * 32 + 16, y: 14 * 32 + 16, width: 32, height: 32 },
  { id: 'meeting-01', type: 'meeting', x: 5.5 * 32 + 16, y: 15 * 32 + 16, width: 128, height: 32 },
];

export class OfficeScene extends Phaser.Scene {
  private player!: Phaser.Physics.Arcade.Sprite;
  private movementSystem!: MovementSystem;
  private interactionSystem!: InteractionSystem;
  private remoteAvatars: Map<string, RemoteAvatar> = new Map();
  private nameLabel!: Phaser.GameObjects.Text;
  private userId = '';
  private username = '';

  constructor() {
    super({ key: 'OfficeScene' });
  }

  create(): void {
    // Get user info from bridge
    const userInfo = (window as unknown as Record<string, unknown>).__OFFICE_USER__ as
      { userId: string; username: string } | undefined;
    this.userId = userInfo?.userId ?? 'local';
    this.username = userInfo?.username ?? 'Player';

    // Create tilemap from data
    const map = this.make.tilemap({
      data: FLOOR,
      tileWidth: TILE_SIZE,
      tileHeight: TILE_SIZE,
    });
    const tileset = map.addTilesetImage('office-tiles', 'office-tiles', TILE_SIZE, TILE_SIZE, 0, 0);
    if (!tileset) return;

    const floorLayer = map.createLayer(0, tileset, 0, 0);

    // Draw furniture on a separate layer
    const furnitureMap = this.make.tilemap({
      data: FURNITURE,
      tileWidth: TILE_SIZE,
      tileHeight: TILE_SIZE,
    });
    const furnitureTileset = furnitureMap.addTilesetImage('office-tiles', 'office-tiles', TILE_SIZE, TILE_SIZE, 0, 0);
    if (furnitureTileset) {
      const furnitureLayer = furnitureMap.createLayer(0, furnitureTileset, 0, 0);
      if (furnitureLayer) furnitureLayer.setDepth(2);
    }

    // Create collision layer
    const collisionMap = this.make.tilemap({
      data: COLLISION,
      tileWidth: TILE_SIZE,
      tileHeight: TILE_SIZE,
    });
    const collisionTileset = collisionMap.addTilesetImage('office-tiles', 'office-tiles', TILE_SIZE, TILE_SIZE, 0, 0);
    if (collisionTileset) {
      const collisionLayer = collisionMap.createLayer(0, collisionTileset, 0, 0);
      if (collisionLayer) {
        collisionLayer.setVisible(false);
        collisionLayer.setCollisionByExclusion([-1, 0]);

        // Generate avatar
        const avatarCanvas = generateAvatarCanvas(this.userId, this.username);
        if (!this.textures.exists('player-avatar')) {
          this.textures.addSpriteSheet('player-avatar', avatarCanvas, {
            frameWidth: 32,
            frameHeight: 32,
          });
        }

        // Spawn player in the open plan area
        const spawnX = 15 * TILE_SIZE;
        const spawnY = 10 * TILE_SIZE;
        this.player = this.physics.add.sprite(spawnX, spawnY, 'player-avatar', 0);
        this.player.setDepth(4);
        this.player.setSize(20, 20);
        this.player.setOffset(6, 10);
        this.player.setCollideWorldBounds(true);

        // Name label above player
        const color = getAvatarColor(this.userId);
        this.nameLabel = this.add.text(spawnX, spawnY - 24, this.username, {
          fontSize: '10px',
          fontFamily: "'JetBrains Mono', monospace",
          color: '#FFFFFF',
          backgroundColor: color + 'CC',
          padding: { x: 4, y: 2 },
          align: 'center',
        });
        this.nameLabel.setOrigin(0.5, 1);
        this.nameLabel.setDepth(6);

        // Collision
        this.physics.add.collider(this.player, collisionLayer);
      }
    }

    // Set world bounds
    this.physics.world.setBounds(0, 0, MAP_WIDTH * TILE_SIZE, MAP_HEIGHT * TILE_SIZE);

    // Camera
    this.cameras.main.setBounds(0, 0, MAP_WIDTH * TILE_SIZE, MAP_HEIGHT * TILE_SIZE);
    if (this.player) {
      this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    }
    this.cameras.main.setZoom(2);

    // Room labels
    this.addRoomLabel(7 * 32, 1 * 32, 'RECEPTION');
    this.addRoomLabel(20 * 32, 1 * 32, 'LOUNGE');
    this.addRoomLabel(14 * 32, 7.5 * 32, 'OPEN PLAN');
    this.addRoomLabel(5 * 32, 14 * 32, 'MEETING ROOM');
    this.addRoomLabel(20 * 32, 14 * 32, 'WHITEBOARD');

    // Systems
    this.movementSystem = new MovementSystem(this);
    this.interactionSystem = new InteractionSystem(this);

    // Register interactables
    for (const obj of INTERACTABLES) {
      this.interactionSystem.registerObject(obj);
    }

    // Listen for remote player updates
    bridge.on('presence:sync', (users: unknown) => {
      this.syncRemoteAvatars(users as Record<string, RemoteUser>);
    });

    bridge.on('presence:leave', (key: unknown) => {
      const userId = key as string;
      const avatar = this.remoteAvatars.get(userId);
      if (avatar) {
        avatar.destroy();
        this.remoteAvatars.delete(userId);
      }
    });

    // Notify React that scene is ready
    bridge.emit('scene:ready');
  }

  update(): void {
    if (!this.player) return;

    this.movementSystem.update(this.player);

    // Update name label position
    if (this.nameLabel) {
      this.nameLabel.setPosition(this.player.x, this.player.y - 24);
    }

    // Interaction system
    this.interactionSystem.update(
      this.player.x,
      this.player.y,
      this.movementSystem.isInteractPressed(),
    );

    // Update remote avatars
    for (const avatar of this.remoteAvatars.values()) {
      avatar.update();
    }

    // Broadcast position
    const moved = this.player.body && (
      (this.player.body as Phaser.Physics.Arcade.Body).velocity.x !== 0 ||
      (this.player.body as Phaser.Physics.Arcade.Body).velocity.y !== 0
    );
    if (moved) {
      bridge.emit('player:moved', {
        x: Math.round(this.player.x),
        y: Math.round(this.player.y),
        direction: this.movementSystem.getDirection(),
      });
    }
  }

  private syncRemoteAvatars(users: Record<string, RemoteUser>): void {
    // Update or create remote avatars
    for (const [uid, data] of Object.entries(users)) {
      if (uid === this.userId) continue;

      let avatar = this.remoteAvatars.get(uid);
      if (!avatar) {
        // Generate their avatar texture
        const canvas = generateAvatarCanvas(uid, data.username);
        const texKey = `avatar-${uid}`;
        if (!this.textures.exists(texKey)) {
          this.textures.addSpriteSheet(texKey, canvas, {
            frameWidth: 32,
            frameHeight: 32,
          });
        }
        avatar = new RemoteAvatar(
          this,
          data.x, data.y,
          texKey,
          data.username,
          data.color || getAvatarColor(uid),
        );
        this.remoteAvatars.set(uid, avatar);
      }

      avatar.setTarget(data.x, data.y, data.direction);
    }

    // Remove avatars no longer present
    for (const [uid, avatar] of this.remoteAvatars.entries()) {
      if (!users[uid]) {
        avatar.destroy();
        this.remoteAvatars.delete(uid);
      }
    }
  }

  private addRoomLabel(x: number, y: number, text: string): void {
    this.add.text(x, y, text, {
      fontSize: '8px',
      fontFamily: "'JetBrains Mono', monospace",
      color: '#FFFFFF44',
      letterSpacing: 2,
    }).setDepth(1);
  }
}
