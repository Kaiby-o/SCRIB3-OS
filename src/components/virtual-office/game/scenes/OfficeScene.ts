import Phaser from 'phaser';
import { bridge } from '../../PhaserBridge';
import { MovementSystem } from '../systems/MovementSystem';
import { InteractionSystem } from '../systems/InteractionSystem';
import { RemoteAvatar } from '../entities/RemoteAvatar';
import { CHARACTER_SPRITES } from './BootScene';
import type { AvatarConfig } from '../systems/AvatarConfig';
import type { RemoteUser } from '../../../../store/office.store';

const TILE_SIZE = 32;

interface CollisionJSON {
  width: number;
  height: number;
  tileSize: number;
  imageWidth: number;
  imageHeight: number;
  data: number[];
}

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

    // ---- LOAD COLLISION DATA ----
    const collisionData = this.cache.json.get('office-collision') as CollisionJSON;
    const mapWidth = collisionData.imageWidth;
    const mapHeight = collisionData.imageHeight;

    // ---- LAYER 1: floors + walls (below player) ----
    const layer1 = this.add.image(0, 0, 'office-layer1');
    layer1.setOrigin(0, 0);
    layer1.setDepth(0);

    // ---- LAYER 2: furniture (above player) ----
    const layer2 = this.add.image(0, 0, 'office-layer2');
    layer2.setOrigin(0, 0);
    layer2.setDepth(8);

    // ---- COLLISION BODIES ----
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

    // Refresh physics bodies after adding all blocks
    blockedGroup.refresh();

    // ---- PLAYER ----
    const savedSpriteKey = this.avatarConfig && typeof this.avatarConfig === 'object'
      ? (this.avatarConfig as Record<string, unknown>).spriteKey as string | undefined
      : undefined;

    if (savedSpriteKey && CHARACTER_SPRITES.includes(savedSpriteKey)) {
      this.playerSpriteKey = savedSpriteKey;
    } else {
      const spriteIndex = spriteIndexFromId(this.userId);
      this.playerSpriteKey = CHARACTER_SPRITES[spriteIndex];
    }

    // Spawn roughly in center of the left room (Generic Home)
    const spawnX = 7 * TILE_SIZE;
    const spawnY = 8 * TILE_SIZE;

    this.player = this.physics.add.sprite(spawnX, spawnY, this.playerSpriteKey, 1);
    this.player.setDepth(4);
    this.player.setSize(14, 14);
    this.player.setOffset(9, 16);
    this.player.setCollideWorldBounds(true);

    // Collision with blocked tiles
    this.physics.add.collider(this.player, blockedGroup);

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
    this.minimapCamera.startFollow(this.player, true, 1, 1);
    this.minimapCamera.ignore(this.nameLabel);

    // ---- ROOM LABELS ----
    const labelStyle: Phaser.Types.GameObjects.Text.TextStyle = {
      fontSize: '7px',
      fontFamily: "'JetBrains Mono', monospace",
      color: '#FFFFFF33',
      letterSpacing: 2,
    };
    const labels = [
      this.add.text(3 * TILE_SIZE, 3 * TILE_SIZE, 'WORK AREA', labelStyle).setDepth(1),
      this.add.text(3 * TILE_SIZE, 9 * TILE_SIZE, 'LOUNGE', labelStyle).setDepth(1),
      this.add.text(18 * TILE_SIZE, 4 * TILE_SIZE, 'RECEPTION', labelStyle).setDepth(1),
      this.add.text(18 * TILE_SIZE, 8 * TILE_SIZE, 'LOBBY', labelStyle).setDepth(1),
    ];
    for (const label of labels) {
      this.minimapCamera.ignore(label);
    }

    // ---- INPUT ----
    if (this.input.keyboard) {
      this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    }

    // ---- SYSTEMS ----
    this.movementSystem = new MovementSystem(this);
    this.movementSystem.setSpriteKey(this.playerSpriteKey);

    this.interactionSystem = new InteractionSystem(this);

    // Register some interactable objects at approximate positions
    this.interactionSystem.registerObject({
      id: 'desk-1', type: 'desk',
      x: 5 * TILE_SIZE, y: 5 * TILE_SIZE,
      width: TILE_SIZE * 2, height: TILE_SIZE,
    });
    this.interactionSystem.registerObject({
      id: 'desk-2', type: 'desk',
      x: 9 * TILE_SIZE, y: 5 * TILE_SIZE,
      width: TILE_SIZE * 2, height: TILE_SIZE,
    });
    this.interactionSystem.registerObject({
      id: 'meeting-1', type: 'meeting',
      x: 20 * TILE_SIZE, y: 6 * TILE_SIZE,
      width: TILE_SIZE * 3, height: TILE_SIZE * 2,
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
