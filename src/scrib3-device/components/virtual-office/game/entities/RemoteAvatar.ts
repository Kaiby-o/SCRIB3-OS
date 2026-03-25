import Phaser from 'phaser';

const LERP_SPEED = 0.15;

export class RemoteAvatar {
  sprite: Phaser.GameObjects.Sprite;
  nameLabel: Phaser.GameObjects.Text;
  private targetX: number;
  private targetY: number;
  private targetDirection: string;
  private textureKey: string;
  private isMoving = false;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    textureKey: string,
    username: string,
    color: string,
  ) {
    this.targetX = x;
    this.targetY = y;
    this.targetDirection = 'down';
    this.textureKey = textureKey;

    this.sprite = scene.add.sprite(x, y, textureKey, 1);
    this.sprite.setDepth(5);

    this.nameLabel = scene.add.text(x, y - 20, username, {
      fontSize: '10px',
      fontFamily: "'JetBrains Mono', monospace",
      color: '#FFFFFF',
      backgroundColor: color + 'CC',
      padding: { x: 4, y: 2 },
      align: 'center',
    });
    this.nameLabel.setOrigin(0.5, 1);
    this.nameLabel.setDepth(6);
  }

  setTarget(x: number, y: number, direction: string): void {
    this.targetX = x;
    this.targetY = y;
    this.targetDirection = direction;
  }

  update(): void {
    const dx = this.targetX - this.sprite.x;
    const dy = this.targetY - this.sprite.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    // Lerp toward target
    this.sprite.x += dx * LERP_SPEED;
    this.sprite.y += dy * LERP_SPEED;

    // Animate based on movement
    const moving = dist > 2;

    if (moving) {
      const animKey = `${this.textureKey}-walk-${this.targetDirection}`;
      if (this.sprite.anims.currentAnim?.key !== animKey) {
        this.sprite.anims.play(animKey, true);
      }
      this.isMoving = true;
    } else if (this.isMoving) {
      this.sprite.anims.stop();
      const idleFrameMap: Record<string, number> = { down: 1, left: 4, right: 7, up: 10 };
      this.sprite.setFrame(idleFrameMap[this.targetDirection] ?? 1);
      this.isMoving = false;
    }

    // Update name label position
    this.nameLabel.setPosition(this.sprite.x, this.sprite.y - 20);
  }

  destroy(): void {
    this.sprite.destroy();
    this.nameLabel.destroy();
  }
}
