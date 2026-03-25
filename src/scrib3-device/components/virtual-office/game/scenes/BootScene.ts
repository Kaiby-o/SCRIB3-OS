import Phaser from 'phaser';
import { bridge } from '../../PhaserBridge';

// Character sprite keys used by other modules
export const CHARACTER_SPRITES: string[] = [
  'char-male-01', 'char-male-02', 'char-male-03', 'char-male-04', 'char-male-05',
  'char-female-01', 'char-female-02', 'char-female-03', 'char-female-04', 'char-female-05',
];

// Keep legacy alias so existing code referencing PIPOYA_SPRITES still works
export const PIPOYA_SPRITES = CHARACTER_SPRITES;

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload(): void {
    // ---- Pre-composed office images (served from public/) ----
    this.load.image('office-layer1', 'assets/office/office-layer1.png');
    this.load.image('office-layer2', 'assets/office/office-layer2.png');
    this.load.json('office-collision', 'assets/office/office-collision.json');

    // ---- Character spritesheets (from public/) ----
    const charFiles = [
      { key: 'char-male-01', file: 'Male 01-1.png' },
      { key: 'char-male-02', file: 'Male 02-1.png' },
      { key: 'char-male-03', file: 'Male 03-1.png' },
      { key: 'char-male-04', file: 'Male 04-1.png' },
      { key: 'char-male-05', file: 'Male 05-1.png' },
      { key: 'char-female-01', file: 'Female 01-1.png' },
      { key: 'char-female-02', file: 'Female 02-1.png' },
      { key: 'char-female-03', file: 'Female 03-1.png' },
      { key: 'char-female-04', file: 'Female 04-1.png' },
      { key: 'char-female-05', file: 'Female 05-1.png' },
    ];

    for (const { key, file } of charFiles) {
      this.load.spritesheet(key, `assets/office/characters/${file}`, {
        frameWidth: 32,
        frameHeight: 32,
      });
    }

    // Listen for custom avatar texture registrations
    bridge.on('register:avatar', (data: unknown) => {
      const { key, canvas } = data as { key: string; canvas: HTMLCanvasElement };
      if (!this.textures.exists(key)) {
        this.textures.addCanvas(key, canvas);
      }
    });

    // Loading bar
    const { width, height } = this.cameras.main;
    const barW = 200;
    const barH = 8;
    const barX = (width - barW) / 2;
    const barY = height / 2;

    const bg = this.add.rectangle(barX + barW / 2, barY, barW, barH, 0x222244);
    bg.setOrigin(0.5, 0.5);
    const fill = this.add.rectangle(barX, barY, 0, barH, 0x4488cc);
    fill.setOrigin(0, 0.5);

    this.load.on('progress', (value: number) => {
      fill.width = barW * value;
    });
  }

  create(): void {
    // Create walk animations for each character sprite
    for (const key of CHARACTER_SPRITES) {
      // Down walk: frames 0,1,2  (row 0)
      this.anims.create({
        key: `${key}-walk-down`,
        frames: this.anims.generateFrameNumbers(key, { start: 0, end: 2 }),
        frameRate: 8,
        repeat: -1,
      });
      // Left walk: frames 3,4,5  (row 1)
      this.anims.create({
        key: `${key}-walk-left`,
        frames: this.anims.generateFrameNumbers(key, { start: 3, end: 5 }),
        frameRate: 8,
        repeat: -1,
      });
      // Right walk: frames 6,7,8  (row 2)
      this.anims.create({
        key: `${key}-walk-right`,
        frames: this.anims.generateFrameNumbers(key, { start: 6, end: 8 }),
        frameRate: 8,
        repeat: -1,
      });
      // Up walk: frames 9,10,11  (row 3)
      this.anims.create({
        key: `${key}-walk-up`,
        frames: this.anims.generateFrameNumbers(key, { start: 9, end: 11 }),
        frameRate: 8,
        repeat: -1,
      });
    }

    this.scene.start('OfficeScene');
  }
}
