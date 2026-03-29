import Phaser from 'phaser';
import { bridge } from '../../PhaserBridge';
import { MovementSystem } from '../systems/MovementSystem';
import { InteractionSystem } from '../systems/InteractionSystem';
import { RemoteAvatar } from '../entities/RemoteAvatar';
import { CHARACTER_SPRITES } from './BootScene';
import { isLayerConfig, isPresetConfig } from '../systems/AvatarConfig';
import type { AvatarConfig } from '../systems/AvatarConfig';
import { useOfficeStore } from '../../../../store/office.store';
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
  private spaceKey!: Phaser.Input.Keyboard.Key;
  private emoteText: Phaser.GameObjects.Text | null = null;
  private emoteTimer: Phaser.Time.TimerEvent | null = null;

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

    // ---- TILEMAP SETUP ----
    let mapWidth: number;
    let mapHeight: number;
    let collisionLayer: Phaser.Tilemaps.TilemapLayer | null = null;

    const tilemapLoaded = this.cache.tilemap.has('office-map');

    if (tilemapLoaded) {
      const map = this.make.tilemap({ key: 'office-map' });

      // Add both tilesets
      const rbTileset = map.addTilesetImage('RoomBuilder', 'tileset-roombuilder');
      const intTileset = map.addTilesetImage('Interiors', 'tileset-interiors');
      const allTilesets = [rbTileset!, intTileset!].filter(Boolean);

      // Create tile layers with depth ordering
      const floorLayer = map.createLayer('floor', allTilesets);
      if (floorLayer) floorLayer.setDepth(0);

      const wallsLayer = map.createLayer('walls', allTilesets);
      if (wallsLayer) wallsLayer.setDepth(2);

      const furnitureBelowLayer = map.createLayer('furniture-below', allTilesets);
      if (furnitureBelowLayer) furnitureBelowLayer.setDepth(3);

      const furnitureAboveLayer = map.createLayer('furniture-above', allTilesets);
      if (furnitureAboveLayer) furnitureAboveLayer.setDepth(8);

      // Collision layer — set all non-zero tiles as collidable
      collisionLayer = map.createLayer('collision', allTilesets);
      if (collisionLayer) {
        collisionLayer.setVisible(false);
        collisionLayer.setCollisionByExclusion([-1, 0]);
      }

      mapWidth = map.widthInPixels;
      mapHeight = map.heightInPixels;

      // Load interactable objects from the objects layer
      this.interactionSystem = new InteractionSystem(this);
      this.interactionSystem.loadFromObjectLayer(map, 'objects');

      // Room labels from map data
      this.addRoomLabels(mapWidth, mapHeight);
    } else {
      // Fallback to legacy pre-composed images
      const collisionData = this.cache.json.get('office-collision') as {
        width: number; height: number; tileSize: number;
        imageWidth: number; imageHeight: number; data: number[];
      };
      mapWidth = collisionData.imageWidth;
      mapHeight = collisionData.imageHeight;

      const layer1 = this.add.image(0, 0, 'office-layer1');
      layer1.setOrigin(0, 0);
      layer1.setDepth(0);

      const layer2 = this.add.image(0, 0, 'office-layer2');
      layer2.setOrigin(0, 0);
      layer2.setDepth(8);

      const blockedGroup = this.physics.add.staticGroup();
      for (let ty = 0; ty < collisionData.height; ty++) {
        for (let tx = 0; tx < collisionData.width; tx++) {
          const idx = ty * collisionData.width + tx;
          if (collisionData.data[idx] === 1) {
            const bx = tx * TILE_SIZE + TILE_SIZE / 2;
            const by = ty * TILE_SIZE + TILE_SIZE / 2;
            const block = this.add.rectangle(bx, by, TILE_SIZE, TILE_SIZE);
            block.setVisible(false);
            blockedGroup.add(block);
          }
        }
      }
      blockedGroup.refresh();

      this.interactionSystem = new InteractionSystem(this);
      // Legacy manual interactable registration
      this.interactionSystem.registerObject({ id: 'desk-1', type: 'desk', x: 5 * TILE_SIZE, y: 5 * TILE_SIZE, width: TILE_SIZE * 2, height: TILE_SIZE });
      this.interactionSystem.registerObject({ id: 'desk-2', type: 'desk', x: 9 * TILE_SIZE, y: 5 * TILE_SIZE, width: TILE_SIZE * 2, height: TILE_SIZE });
      this.interactionSystem.registerObject({ id: 'meeting-1', type: 'meeting', x: 20 * TILE_SIZE, y: 6 * TILE_SIZE, width: TILE_SIZE * 3, height: TILE_SIZE * 2 });
    }

    // ---- PLAYER ----
    if (isLayerConfig(this.avatarConfig)) {
      const texKey = 'custom-avatar';
      if (!this.textures.exists(texKey)) {
        const img = new Image();
        img.src = this.avatarConfig.compositedSheet;
        img.onload = () => {
          const cvs = document.createElement('canvas');
          cvs.width = img.width;
          cvs.height = img.height;
          const cctx = cvs.getContext('2d')!;
          cctx.drawImage(img, 0, 0);
          if (!this.textures.exists(texKey)) {
            this.textures.addSpriteSheet(texKey, cvs as unknown as HTMLImageElement, { frameWidth: 32, frameHeight: 32 });
            this.createWalkAnimations(texKey);
            if (this.player) {
              this.player.setTexture(texKey, 1);
              this.playerSpriteKey = texKey;
              this.movementSystem.setSpriteKey(texKey);
            }
          }
        };
      }
      this.playerSpriteKey = texKey;
    } else if (isPresetConfig(this.avatarConfig) && CHARACTER_SPRITES.includes(this.avatarConfig.spriteKey)) {
      this.playerSpriteKey = this.avatarConfig.spriteKey;
    } else {
      const spriteIndex = spriteIndexFromId(this.userId);
      this.playerSpriteKey = CHARACTER_SPRITES[spriteIndex];
    }

    // Spawn in Reception area (tile 5,5 for tilemap, or left room for legacy)
    const spawnX = tilemapLoaded ? 5 * TILE_SIZE : 7 * TILE_SIZE;
    const spawnY = tilemapLoaded ? 5 * TILE_SIZE : 8 * TILE_SIZE;

    const initialTexture = this.textures.exists(this.playerSpriteKey)
      ? this.playerSpriteKey
      : CHARACTER_SPRITES[spriteIndexFromId(this.userId)];

    this.player = this.physics.add.sprite(spawnX, spawnY, initialTexture, 1);
    this.player.setDepth(4);
    this.player.setSize(14, 14);
    this.player.setOffset(9, 16);
    this.player.setCollideWorldBounds(true);

    // Collision with tile layer or static blocks
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
    this.physics.world.setBounds(0, 0, mapWidth, mapHeight);
    this.cameras.main.setBounds(0, 0, mapWidth, mapHeight);
    this.cameras.main.startFollow(this.player, true, 0.08, 0.08);
    this.cameras.main.setZoom(1.2);

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
    this.minimapCamera.startFollow(this.player, true, 1, 1);
    this.minimapCamera.ignore(this.nameLabel);

    // ---- INPUT ----
    if (this.input.keyboard) {
      this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

      // Emote keys 1-5
      for (let i = 1; i <= 5; i++) {
        const key = this.input.keyboard.addKey(48 + i); // KeyCodes for 1-5
        key.on('down', () => this.triggerEmote(i));
      }
    }

    // ---- MOVEMENT SYSTEM ----
    this.movementSystem = new MovementSystem(this);
    this.movementSystem.setSpriteKey(this.playerSpriteKey);

    // ---- INTERACTION HANDLER ----
    bridge.on('interaction:trigger', (data: unknown) => {
      const { objectId, objectType } = data as { objectId: string; objectType: string };
      this.handleInteraction(objectId, objectType);
    });

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
    const mmWConst = mmW;
    const mmMarginConst = mmMargin;
    this.scale.on('resize', (gameSize: Phaser.Structs.Size) => {
      this.minimapCamera.setPosition(
        gameSize.width - mmWConst - mmMarginConst,
        mmMarginConst,
      );
    });

    // Notify React that scene is ready
    bridge.emit('scene:ready');
  }

  update(): void {
    if (!this.player) return;

    // Movement (disabled when sitting)
    if (!this.isSitting) {
      this.movementSystem.update(this.player);
    }

    // Name label follows player
    if (this.nameLabel) {
      this.nameLabel.setPosition(this.player.x, this.player.y - 18);
    }

    // Emote bubble follows player
    if (this.emoteText) {
      this.emoteText.setPosition(this.player.x, this.player.y - 30);
    }

    // Interaction check
    const interactPressed = this.movementSystem.isInteractPressed() ||
      (this.spaceKey && Phaser.Input.Keyboard.JustDown(this.spaceKey));

    // If sitting, E/Space to stand up
    if (this.isSitting && interactPressed) {
      this.standUp();
    } else {
      this.interactionSystem.update(
        this.player.x,
        this.player.y,
        interactPressed,
      );
    }

    // Update remote avatars
    for (const avatar of this.remoteAvatars.values()) {
      avatar.update();
    }

    // Broadcast position
    const body = this.player.body as Phaser.Physics.Arcade.Body | null;
    if (body && (body.velocity.x !== 0 || body.velocity.y !== 0)) {
      bridge.emit('player:moved', {
        x: Math.round(this.player.x),
        y: Math.round(this.player.y),
        direction: this.movementSystem.getDirection(),
        isSitting: this.isSitting,
      });
    }
  }

  // ─── Interaction Handlers ──────────────────────────────────────
  private handleInteraction(id: string, type: string): void {
    switch (type) {
      case 'desk':
        this.sitDown(id);
        break;
      case 'coffee':
        this.showToast('\u2615 Grabbed a coffee!', 2000);
        break;
      case 'whiteboard':
        this.showToast('\ud83d\udcdd Shared notes coming soon', 2000);
        break;
      case 'bulletin':
        bridge.emit('navigate', '/culture');
        this.showToast('\ud83d\udccc Opening announcements...', 1500);
        break;
      case 'phone':
        this.showToast('\ud83d\udcde In a call...', 3000);
        bridge.emit('status:update', { status: 'on-call' });
        break;
      case 'meeting':
        this.showToast('\ud83e\udd1d Joined the meeting room', 2000);
        break;
      case 'easter_egg':
        this.showToast('\ud83d\udd13 Hacking the mainframe...', 3000);
        bridge.emit('easter:egg', { type: 'server-room' });
        break;
      default:
        this.showToast(`Interacted with ${id}`, 1500);
    }
  }

  private sitDown(_objectId: string): void {
    if (this.isSitting) return;
    this.isSitting = true;
    // Stop player velocity
    const body = this.player.body as Phaser.Physics.Arcade.Body;
    body.setVelocity(0, 0);
    // Show idle frame (seated = front-facing idle)
    this.player.setFrame(1);
    this.player.stop();
    // Broadcast status
    bridge.emit('player:moved', {
      x: Math.round(this.player.x),
      y: Math.round(this.player.y),
      direction: 'down',
      isSitting: true,
    });
    bridge.emit('status:update', { status: 'working' });
    this.showToast('\ud83d\udcbb Working at desk', 2000);
  }

  private standUp(): void {
    this.isSitting = false;
    bridge.emit('status:update', { status: 'online' });
    this.showToast('Stood up', 1000);
  }

  private showToast(message: string, duration: number): void {
    useOfficeStore.getState().setInteractionPrompt(message);
    setTimeout(() => {
      useOfficeStore.getState().setInteractionPrompt(null);
    }, duration);
  }

  // ─── Emotes ────────────────────────────────────────────────────
  private triggerEmote(num: number): void {
    const emotes = ['', '\ud83d\udc4b', '\u2615', '\ud83d\udcac', '\ud83c\udfa7', '\ud83d\udd25'];
    const emote = emotes[num];
    if (!emote) return;

    // Clear previous emote
    if (this.emoteText) this.emoteText.destroy();
    if (this.emoteTimer) this.emoteTimer.destroy();

    this.emoteText = this.add.text(this.player.x, this.player.y - 30, emote, {
      fontSize: '16px',
      align: 'center',
    });
    this.emoteText.setOrigin(0.5, 1);
    this.emoteText.setDepth(10);

    // Auto-dismiss after 3s
    this.emoteTimer = this.time.delayedCall(3000, () => {
      if (this.emoteText) {
        this.emoteText.destroy();
        this.emoteText = null;
      }
    });

    // Broadcast emote to other players
    bridge.emit('player:emote', { emote: num });
  }

  // ─── Room Labels ───────────────────────────────────────────────
  private addRoomLabels(_mapWidth: number, _mapHeight: number): void {
    const labelStyle: Phaser.Types.GameObjects.Text.TextStyle = {
      fontSize: '7px',
      fontFamily: "'JetBrains Mono', monospace",
      color: '#FFFFFF33',
      letterSpacing: 2,
    };
    const labels = [
      this.add.text(2 * TILE_SIZE, 2 * TILE_SIZE, 'RECEPTION', labelStyle).setDepth(1),
      this.add.text(22 * TILE_SIZE, 2 * TILE_SIZE, 'MEETING ROOM', labelStyle).setDepth(1),
      this.add.text(10 * TILE_SIZE, 12 * TILE_SIZE, 'OPEN PLAN', labelStyle).setDepth(1),
      this.add.text(2 * TILE_SIZE, 13 * TILE_SIZE, 'BREAK ROOM', labelStyle).setDepth(1),
      this.add.text(2 * TILE_SIZE, 22 * TILE_SIZE, 'PHONE BOOTH', labelStyle).setDepth(1),
      this.add.text(3 * TILE_SIZE, 26 * TILE_SIZE, 'EXECUTIVE WING', labelStyle).setDepth(1),
      this.add.text(28 * TILE_SIZE, 23 * TILE_SIZE, 'SERVER ROOM', labelStyle).setDepth(1),
    ];
    for (const label of labels) {
      if (this.minimapCamera) this.minimapCamera.ignore(label);
    }
  }

  // ─── Walk Animations ───────────────────────────────────────────
  private createWalkAnimations(key: string): void {
    if (this.anims.exists(`${key}-walk-down`)) return;
    this.anims.create({
      key: `${key}-walk-down`,
      frames: this.anims.generateFrameNumbers(key, { start: 0, end: 2 }),
      frameRate: 8, repeat: -1,
    });
    this.anims.create({
      key: `${key}-walk-left`,
      frames: this.anims.generateFrameNumbers(key, { start: 3, end: 5 }),
      frameRate: 8, repeat: -1,
    });
    this.anims.create({
      key: `${key}-walk-right`,
      frames: this.anims.generateFrameNumbers(key, { start: 6, end: 8 }),
      frameRate: 8, repeat: -1,
    });
    this.anims.create({
      key: `${key}-walk-up`,
      frames: this.anims.generateFrameNumbers(key, { start: 9, end: 11 }),
      frameRate: 8, repeat: -1,
    });
  }

  // ─── Remote Avatars ────────────────────────────────────────────
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
