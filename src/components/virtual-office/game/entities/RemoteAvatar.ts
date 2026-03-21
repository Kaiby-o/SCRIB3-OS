import Phaser from 'phaser';

const LERP_SPEED = 0.15;

export class RemoteAvatar {
  sprite: Phaser.GameObjects.Sprite;
  nameLabel: Phaser.GameObjects.Text;
  private targetX: number;
  private targetY: number;
  private targetDirection: string;

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

    this.sprite = scene.add.sprite(x, y, textureKey, 0);
    this.sprite.setDepth(5);

    this.nameLabel = scene.add.text(x, y - 24, username, {
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
    // Lerp toward target
    this.sprite.x += (this.targetX - this.sprite.x) * LERP_SPEED;
    this.sprite.y += (this.targetY - this.sprite.y) * LERP_SPEED;

    // Update frame
    const frameMap: Record<string, number> = { down: 0, left: 1, right: 2, up: 3 };
    this.sprite.setFrame(frameMap[this.targetDirection] ?? 0);

    // Update name label position
    this.nameLabel.setPosition(this.sprite.x, this.sprite.y - 24);
  }

  destroy(): void {
    this.sprite.destroy();
    this.nameLabel.destroy();
  }
}
