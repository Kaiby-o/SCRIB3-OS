import Phaser from 'phaser';
import { bridge } from '../../PhaserBridge';

const MOVE_SPEED = 160;

export class MovementSystem {
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: Record<string, Phaser.Input.Keyboard.Key>;
  private enabled = true;
  private lastBroadcastX = 0;
  private lastBroadcastY = 0;
  private lastBroadcastTime = 0;
  private direction = 'down';
  private isMoving = false;
  private spriteKey = '';

  constructor(scene: Phaser.Scene) {
    if (scene.input.keyboard) {
      this.cursors = scene.input.keyboard.createCursorKeys();
      this.wasd = {
        W: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
        A: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
        S: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
        D: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
        E: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E),
      };
    }

    bridge.on('chat:focus', () => { this.enabled = false; });
    bridge.on('chat:blur', () => { this.enabled = true; });
  }

  setSpriteKey(key: string): void {
    this.spriteKey = key;
  }

  update(player: Phaser.Physics.Arcade.Sprite): void {
    if (!this.enabled || !player.body) return;

    const body = player.body as Phaser.Physics.Arcade.Body;
    body.setVelocity(0);

    let vx = 0;
    let vy = 0;

    const left = this.cursors?.left?.isDown || this.wasd?.A?.isDown;
    const right = this.cursors?.right?.isDown || this.wasd?.D?.isDown;
    const up = this.cursors?.up?.isDown || this.wasd?.W?.isDown;
    const down = this.cursors?.down?.isDown || this.wasd?.S?.isDown;

    if (left) { vx = -MOVE_SPEED; this.direction = 'left'; }
    else if (right) { vx = MOVE_SPEED; this.direction = 'right'; }

    if (up) { vy = -MOVE_SPEED; this.direction = 'up'; }
    else if (down) { vy = MOVE_SPEED; this.direction = 'down'; }

    // Diagonal normalization
    if (vx !== 0 && vy !== 0) {
      const factor = Math.SQRT1_2;
      vx *= factor;
      vy *= factor;
    }

    body.setVelocity(vx, vy);

    const moving = vx !== 0 || vy !== 0;

    // Handle animations if we have a Pipoya sprite key
    if (this.spriteKey) {
      if (moving) {
        const animKey = `${this.spriteKey}-walk-${this.direction}`;
        if (player.anims.currentAnim?.key !== animKey) {
          player.anims.play(animKey, true);
        }
        this.isMoving = true;
      } else if (this.isMoving) {
        // Stop animation, show idle frame
        player.anims.stop();
        const idleFrameMap: Record<string, number> = { down: 1, left: 4, right: 7, up: 10 };
        player.setFrame(idleFrameMap[this.direction] ?? 1);
        this.isMoving = false;
      }
    } else {
      // Fallback: simple frame-based direction (legacy avatar system)
      if (moving) {
        const frameMap: Record<string, number> = { down: 0, left: 1, right: 2, up: 3 };
        player.setFrame(frameMap[this.direction] ?? 0);
      }
    }

    // Broadcast position at 10Hz
    const now = Date.now();
    if (now - this.lastBroadcastTime > 100) {
      const px = Math.round(player.x);
      const py = Math.round(player.y);
      if (px !== this.lastBroadcastX || py !== this.lastBroadcastY) {
        this.lastBroadcastX = px;
        this.lastBroadcastY = py;
        this.lastBroadcastTime = now;
        bridge.emit('player:moved', { x: px, y: py, direction: this.direction });
      }
    }
  }

  isInteractPressed(): boolean {
    return this.enabled && (this.wasd?.E?.isDown ?? false);
  }

  getDirection(): string {
    return this.direction;
  }

  destroy(): void {
    bridge.off('chat:focus', () => {});
    bridge.off('chat:blur', () => {});
  }
}
