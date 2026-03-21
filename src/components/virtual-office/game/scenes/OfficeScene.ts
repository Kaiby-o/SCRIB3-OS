import Phaser from 'phaser';
import { bridge } from '../../PhaserBridge';
import { MovementSystem } from '../systems/MovementSystem';
import { InteractionSystem } from '../systems/InteractionSystem';
import { RemoteAvatar } from '../entities/RemoteAvatar';
import { CHARACTER_SPRITES } from './BootScene';
import type { AvatarConfig } from '../systems/AvatarConfig';
import type { RemoteUser } from '../../../../store/office.store';

const TILE_SIZE = 32;

/** Pick a deterministic character sprite index from a userId */
function spriteIndexFromId(userId: string): number {
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = ((hash << 5) - hash) + userId.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash) % CHARACTER_SPRITES.length;
}

/** Simple color picker from a user ID for name labels */
function getColorFromId(userId: string): string {
  const colors = [
    '#E74C3C', '#3498DB', '#2ECC71', '#9B59B6',
    '#F39C12', '#1ABC9C', '#E67E22', '#34495E',
    '#D35400', '#8E44AD', '#16A085', '#C0392B',
  ];
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = ((hash << 5) - hash) + userId.charCodeAt(i);
    hash |= 0;
  }
  return colors[Math.abs(hash) % colors.length];
}

export class OfficeScene extends Phaser.Scene {
  private player!: Phaser.Physics.Arcade.Sprite;
  private movementSystem!: MovementSystem;
  private interactionSystem!: InteractionSystem;
  private remoteAvatars: Map<string, RemoteAvatar> = new Map();
  private nameLabel!: Phaser.GameObjects.Text;
  private minimapCamera!: Phaser.Cameras.Scene2D.Camera;
  private userId = '';
  private username = '';
  private avatarConfig?: AvatarConfig;
  private playerSpriteKey = '';
  private isSitting = false;
  private interactKey!: Phaser.Input.Keyboard.Key;
  private spaceKey!: Phaser.Input.Keyboard.Key;

  constructor() {
    super({ key: 'OfficeScene' });
  }

  create(): void {
    // Get user info passed from React
    const userInfo = (window as unknown as Record<string, unknown>).__OFFICE_USER__ as
      { userId: string; username: string; avatarConfig?: AvatarConfig } | undefined;
    this.userId = userInfo?.userId ?? 'local';
    this.username = userInfo?.username ?? 'Player';
    this.avatarConfig = userInfo?.avatarConfig;

    // ---- TILEMAP ----
    const map = this.make.tilemap({ key: 'office-map' });

    // Add tileset images (name must match the "name" field in the JSON tilesets array)
    const floorsTileset = map.addTilesetImage('floors', 'floors');
    const wallsTileset = map.addTilesetImage('walls', 'walls');
    const genericTileset = map.addTilesetImage('generic', 'generic');

    if (!floorsTileset || !wallsTileset || !genericTileset) {
      console.error('Failed to load tilesets');
      return;
    }

    const allTilesets = [floorsTileset, wallsTileset, genericTileset];

    // Create layers in draw order
    const floorLayer = map.createLayer('floor', allTilesets);
    const wallsLayer = map.createLayer('walls', allTilesets);
    const furnitureLayer = map.createLayer('furniture', allTilesets);
    const aboveLayer = map.createLayer('above', allTilesets);
    const collisionLayer = map.createLayer('collision', allTilesets);

    // Set depths
    if (floorLayer) floorLayer.setDepth(0);
    if (wallsLayer) wallsLayer.setDepth(1);
    if (furnitureLayer) furnitureLayer.setDepth(2);
    if (aboveLayer) aboveLayer.setDepth(8); // Above player

    // Set up collision layer
    if (collisionLayer) {
      collisionLayer.setVisible(false);
      collisionLayer.setCollisionByExclusion([-1, 0]);
    }

    // ---- PLAYER ----
    const spriteIndex = spriteIndexFromId(this.userId);
    this.playerSpriteKey = CHARACTER_SPRITES[spriteIndex];

    // Spawn in the open plan area (center of map)
    const spawnX = 20 * TILE_SIZE;
    const spawnY = 22 * TILE_SIZE;

    this.player = this.physics.add.sprite(spawnX, spawnY, this.playerSpriteKey, 1);
    this.player.setDepth(4);
    this.player.setSize(14, 14);
    this.player.setOffset(9, 16);
    this.player.setCollideWorldBounds(true);

    // Collision with the collision layer
    if (collisionLayer) {
      this.physics.add.collider(this.player, collisionLayer);
    }

    // ---- NAME LABEL ----
    const color = getColorFromId(this.userId);
    this.nameLabel = this.add.text(spawnX, spawnY - 18, this.username, {
      fontSize: '9px',
      fontFamily: "'JetBrains Mono', monospace",
      color: '#FFFFFF',
      backgroundColor: color + 'CC',
      padding: { x: 3, y: 1 },
      align: 'center',
    });
    this.nameLabel.setOrigin(0.5, 1);
    this.nameLabel.setDepth(6);

    // ---- WORLD & CAMERA ----
    const mapWidth = map.widthInPixels;
    const mapHeight = map.heightInPixels;

    this.physics.world.setBounds(0, 0, mapWidth, mapHeight);
    this.cameras.main.setBounds(0, 0, mapWidth, mapHeight);
    this.cameras.main.startFollow(this.player, true, 0.08, 0.08);
    this.cameras.main.setZoom(2);

    // ---- MINIMAP ----
    const mmW = 160;
    const mmH = 120;
    const mmMargin = 10;
    this.minimapCamera = this.cameras.add(
      this.scale.width - mmW - mmMargin,
      mmMargin,
      mmW,
      mmH,
    );
    this.minimapCamera.setBounds(0, 0, mapWidth, mapHeight);
    this.minimapCamera.setZoom(mmW / mapWidth);
    this.minimapCamera.setBackgroundColor(0x1a1a2e);
    this.minimapCamera.setAlpha(0.85);
    // Minimap follows player
    this.minimapCamera.startFollow(this.player, true, 1, 1);
    // Ignore name labels in minimap
    this.minimapCamera.ignore(this.nameLabel);

    // ---- ROOM LABELS ----
    const labelStyle: Phaser.Types.GameObjects.Text.TextStyle = {
      fontSize: '7px',
      fontFamily: "'JetBrains Mono', monospace",
      color: '#FFFFFF33',
      letterSpacing: 2,
    };
    const labels = [
      this.add.text(6 * 32, 4 * 32, 'KITCHEN', labelStyle).setDepth(1),
      this.add.text(29 * 32, 2 * 32, 'CONFERENCE', labelStyle).setDepth(1),
      this.add.text(12 * 32, 14 * 32, 'OPEN PLAN', labelStyle).setDepth(1),
      this.add.text(30 * 32, 22 * 32, 'MANAGER', labelStyle).setDepth(1),
      this.add.text(14 * 32, 26 * 32, 'RECEPTION', labelStyle).setDepth(1),
    ];
    // Ignore labels in minimap
    for (const label of labels) {
      this.minimapCamera.ignore(label);
    }

    // ---- INPUT ----
    if (this.input.keyboard) {
      this.interactKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
      this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    }

    // ---- SYSTEMS ----
    this.movementSystem = new MovementSystem(this);
    this.movementSystem.setSpriteKey(this.playerSpriteKey);

    this.interactionSystem = new InteractionSystem(this);

    // Load interactables from the tilemap object layer
    this.interactionSystem.loadFromObjectLayer(map, 'interactables');

    // ---- MULTIPLAYER LISTENERS ----
    bridge.on('presence:sync', (users: unknown) => {
      this.syncRemoteAvatars(users as Record<string, RemoteUser>);
    });

    bridge.on('presence:leave', (key: unknown) => {
      const uid = key as string;
      const avatar = this.remoteAvatars.get(uid);
      if (avatar) {
        avatar.destroy();
        this.remoteAvatars.delete(uid);
      }
    });

    // ---- HANDLE RESIZE ----
    this.scale.on('resize', (gameSize: Phaser.Structs.Size) => {
      // Reposition minimap
      this.minimapCamera.setPosition(
        gameSize.width - mmW - mmMargin,
        mmMargin,
      );
    });

    // Notify React that scene is ready
    bridge.emit('scene:ready');
  }

  update(): void {
    if (!this.player) return;

    // ---- MOVEMENT ----
    if (!this.isSitting) {
      this.movementSystem.update(this.player);
    }

    // ---- NAME LABEL ----
    if (this.nameLabel) {
      this.nameLabel.setPosition(this.player.x, this.player.y - 18);
    }

    // ---- INTERACTION ----
    const interactPressed = this.movementSystem.isInteractPressed() ||
      (this.spaceKey && Phaser.Input.Keyboard.JustDown(this.spaceKey));

    this.interactionSystem.update(
      this.player.x,
      this.player.y,
      interactPressed,
    );

    // Handle sit/stand toggle when interacting with a desk
    if (interactPressed) {
      // Listen for sit toggle (handled via bridge event from InteractionSystem)
      // For now, toggle sitting state when E is pressed near a desk
    }

    // ---- REMOTE AVATARS ----
    for (const avatar of this.remoteAvatars.values()) {
      avatar.update();
    }

    // ---- BROADCAST POSITION ----
    const body = this.player.body as Phaser.Physics.Arcade.Body | null;
    if (body && (body.velocity.x !== 0 || body.velocity.y !== 0)) {
      bridge.emit('player:moved', {
        x: Math.round(this.player.x),
        y: Math.round(this.player.y),
        direction: this.movementSystem.getDirection(),
      });
    }
  }

  private syncRemoteAvatars(users: Record<string, RemoteUser>): void {
    for (const [uid, data] of Object.entries(users)) {
      if (uid === this.userId) continue;

      let avatar = this.remoteAvatars.get(uid);
      if (!avatar) {
        const si = spriteIndexFromId(uid);
        const texKey = CHARACTER_SPRITES[si];
        const col = getColorFromId(uid);

        avatar = new RemoteAvatar(
          this,
          data.x, data.y,
          texKey,
          data.username,
          data.color || col,
        );
        this.remoteAvatars.set(uid, avatar);

        // Hide remote name labels from minimap
        if (this.minimapCamera) {
          this.minimapCamera.ignore(avatar.nameLabel);
        }
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
}
