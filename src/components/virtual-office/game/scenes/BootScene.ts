import Phaser from 'phaser';
import { bridge } from '../../PhaserBridge';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload(): void {
    // Generate tilesheet programmatically
    this.generateTilesheet();

    // Listen for avatar textures to register
    bridge.on('register:avatar', (data: unknown) => {
      const { key, canvas } = data as { key: string; canvas: HTMLCanvasElement };
      if (!this.textures.exists(key)) {
        this.textures.addCanvas(key, canvas);
      }
    });
  }

  create(): void {
    this.scene.start('OfficeScene');
  }

  private generateTilesheet(): void {
    const tileSize = 32;
    const cols = 10;
    const rows = 4;
    const canvas = document.createElement('canvas');
    canvas.width = cols * tileSize;
    canvas.height = rows * tileSize;
    const ctx = canvas.getContext('2d')!;

    // Tile index reference:
    // 0: void/empty, 1: wood floor, 2: carpet floor, 3: tile floor
    // 4: wall horizontal, 5: wall vertical, 6: wall corner TL, 7: wall corner TR
    // 8: wall corner BL, 9: wall corner BR
    // 10: desk, 11: chair, 12: sofa, 13: table, 14: plant
    // 15: whiteboard, 16: coffee machine, 17: bookshelf, 18: door
    // 19: window horizontal, 20: rug, 21: wall end bottom
    // 22: counter, 23: printer, 24: wall T-junction

    const tiles: Record<number, (cx: CanvasRenderingContext2D, x: number, y: number, s: number) => void> = {
      0: (c, x, y, s) => { c.fillStyle = '#0D0D1A'; c.fillRect(x, y, s, s); },
      1: (c, x, y, s) => { // Wood floor
        c.fillStyle = '#8B7355'; c.fillRect(x, y, s, s);
        c.fillStyle = '#7A6548'; c.fillRect(x, y + 8, s, 2); c.fillRect(x, y + 22, s, 2);
        c.fillStyle = '#9C836A'; c.fillRect(x + 4, y, 2, s);
      },
      2: (c, x, y, s) => { // Carpet
        c.fillStyle = '#4A5568'; c.fillRect(x, y, s, s);
        c.fillStyle = '#4F5B6F'; c.fillRect(x + 2, y + 2, 4, 4); c.fillRect(x + 16, y + 14, 4, 4);
      },
      3: (c, x, y, s) => { // Tile floor
        c.fillStyle = '#CBD5E0'; c.fillRect(x, y, s, s);
        c.strokeStyle = '#A0AEC0'; c.lineWidth = 1;
        c.strokeRect(x + 0.5, y + 0.5, s - 1, s - 1);
        c.strokeRect(x + s / 2, y, 0, s);
      },
      4: (c, x, y, s) => { // Wall horizontal
        c.fillStyle = '#2D3748'; c.fillRect(x, y, s, s);
        c.fillStyle = '#4A5568'; c.fillRect(x, y + 4, s, s - 8);
        c.fillStyle = '#1A202C'; c.fillRect(x, y, s, 4); c.fillRect(x, y + s - 4, s, 4);
      },
      5: (c, x, y, s) => { // Wall vertical
        c.fillStyle = '#2D3748'; c.fillRect(x, y, s, s);
        c.fillStyle = '#4A5568'; c.fillRect(x + 4, y, s - 8, s);
        c.fillStyle = '#1A202C'; c.fillRect(x, y, 4, s); c.fillRect(x + s - 4, y, 4, s);
      },
      6: (c, x, y, s) => { // Corner TL
        c.fillStyle = '#1A202C'; c.fillRect(x, y, s, s);
        c.fillStyle = '#4A5568'; c.fillRect(x + 4, y + 4, s - 4, s - 4);
      },
      7: (c, x, y, s) => { // Corner TR
        c.fillStyle = '#1A202C'; c.fillRect(x, y, s, s);
        c.fillStyle = '#4A5568'; c.fillRect(x, y + 4, s - 4, s - 4);
      },
      8: (c, x, y, s) => { // Corner BL
        c.fillStyle = '#1A202C'; c.fillRect(x, y, s, s);
        c.fillStyle = '#4A5568'; c.fillRect(x + 4, y, s - 4, s - 4);
      },
      9: (c, x, y, s) => { // Corner BR
        c.fillStyle = '#1A202C'; c.fillRect(x, y, s, s);
        c.fillStyle = '#4A5568'; c.fillRect(x, y, s - 4, s - 4);
      },
      10: (c, x, y, s) => { // Desk
        c.fillStyle = '#8B7355'; c.fillRect(x, y, s, s);
        c.fillStyle = '#A0845C'; c.fillRect(x + 2, y + 2, s - 4, s - 8);
        c.fillStyle = '#6B5842'; c.fillRect(x + 4, y + s - 6, 4, 6); c.fillRect(x + s - 8, y + s - 6, 4, 6);
        // Monitor on desk
        c.fillStyle = '#2D3748'; c.fillRect(x + 8, y + 4, 16, 12);
        c.fillStyle = '#4299E1'; c.fillRect(x + 10, y + 6, 12, 8);
        c.fillStyle = '#2D3748'; c.fillRect(x + 14, y + 16, 4, 2);
      },
      11: (c, x, y, s) => { // Chair
        c.fillStyle = '#1A202C'; c.fillRect(x + 8, y + 8, 16, 16);
        c.fillStyle = '#2B6CB0'; c.fillRect(x + 10, y + 10, 12, 12);
        c.fillStyle = '#1A202C'; c.fillRect(x + 8, y + 24, 2, 4); c.fillRect(x + 22, y + 24, 2, 4);
      },
      12: (c, x, y, s) => { // Sofa
        c.fillStyle = '#553C9A'; c.fillRect(x + 2, y + 6, s - 4, s - 8);
        c.fillStyle = '#6B46C1'; c.fillRect(x + 4, y + 10, s - 8, s - 14);
        c.fillStyle = '#44337A'; c.fillRect(x + 2, y + 6, s - 4, 4);
      },
      13: (c, x, y, s) => { // Table
        c.fillStyle = '#8B7355'; c.fillRect(x + 4, y + 4, s - 8, s - 8);
        c.fillStyle = '#A0845C'; c.fillRect(x + 6, y + 6, s - 12, s - 12);
        c.fillStyle = '#6B5842';
        c.fillRect(x + 4, y + 4, 2, 2); c.fillRect(x + s - 6, y + 4, 2, 2);
        c.fillRect(x + 4, y + s - 6, 2, 2); c.fillRect(x + s - 6, y + s - 6, 2, 2);
      },
      14: (c, x, y, s) => { // Plant
        c.fillStyle = '#8B7355'; c.fillRect(x + 10, y + 18, 12, 12);
        c.fillStyle = '#A0845C'; c.fillRect(x + 12, y + 18, 8, 10);
        c.fillStyle = '#38A169'; c.beginPath();
        c.arc(x + 16, y + 14, 10, 0, Math.PI * 2); c.fill();
        c.fillStyle = '#2F855A'; c.beginPath();
        c.arc(x + 12, y + 12, 6, 0, Math.PI * 2); c.fill();
        c.arc(x + 20, y + 10, 5, 0, Math.PI * 2); c.fill();
      },
      15: (c, x, y, s) => { // Whiteboard
        c.fillStyle = '#E2E8F0'; c.fillRect(x + 2, y + 2, s - 4, s - 6);
        c.fillStyle = '#A0AEC0'; c.fillRect(x + 2, y + 2, s - 4, 3);
        c.strokeStyle = '#CBD5E0'; c.lineWidth = 1;
        c.strokeRect(x + 4, y + 8, s - 8, s - 14);
        // Marker lines
        c.strokeStyle = '#E53E3E'; c.beginPath();
        c.moveTo(x + 8, y + 12); c.lineTo(x + 20, y + 12); c.stroke();
        c.strokeStyle = '#3182CE'; c.beginPath();
        c.moveTo(x + 8, y + 18); c.lineTo(x + 24, y + 18); c.stroke();
      },
      16: (c, x, y, s) => { // Coffee machine
        c.fillStyle = '#2D3748'; c.fillRect(x + 6, y + 4, 20, 24);
        c.fillStyle = '#4A5568'; c.fillRect(x + 8, y + 6, 16, 14);
        c.fillStyle = '#FC8181'; c.fillRect(x + 10, y + 8, 4, 4); // Button
        c.fillStyle = '#1A202C'; c.fillRect(x + 10, y + 22, 12, 6); // Drip tray
      },
      17: (c, x, y, s) => { // Bookshelf
        c.fillStyle = '#744210'; c.fillRect(x + 2, y, s - 4, s);
        c.fillStyle = '#975A16'; c.fillRect(x + 4, y + 2, s - 8, 8);
        c.fillRect(x + 4, y + 12, s - 8, 8);
        c.fillRect(x + 4, y + 22, s - 8, 8);
        // Books
        c.fillStyle = '#E53E3E'; c.fillRect(x + 6, y + 3, 3, 6);
        c.fillStyle = '#3182CE'; c.fillRect(x + 10, y + 3, 3, 6);
        c.fillStyle = '#38A169'; c.fillRect(x + 14, y + 13, 3, 6);
        c.fillStyle = '#D69E2E'; c.fillRect(x + 6, y + 23, 3, 6);
      },
      18: (c, x, y, s) => { // Door
        c.fillStyle = '#8B7355'; c.fillRect(x, y, s, s);
        c.fillStyle = '#D69E2E'; c.fillRect(x + 4, y + 2, s - 8, s - 4);
        c.fillStyle = '#B7791F'; c.fillRect(x + s - 10, y + 14, 3, 3); // Handle
      },
      19: (c, x, y, s) => { // Window
        c.fillStyle = '#2D3748'; c.fillRect(x, y, s, s);
        c.fillStyle = '#63B3ED'; c.fillRect(x + 4, y + 4, s - 8, s - 8);
        c.fillStyle = '#2D3748'; c.fillRect(x + s / 2 - 1, y + 4, 2, s - 8);
        c.fillRect(x + 4, y + s / 2 - 1, s - 8, 2);
      },
      20: (c, x, y, s) => { // Rug
        c.fillStyle = '#9B2C2C'; c.fillRect(x, y, s, s);
        c.fillStyle = '#C53030'; c.fillRect(x + 4, y + 4, s - 8, s - 8);
        c.fillStyle = '#E53E3E'; c.fillRect(x + 8, y + 8, s - 16, s - 16);
      },
    };

    for (let i = 0; i < cols * rows; i++) {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const x = col * tileSize;
      const y = row * tileSize;
      const drawFn = tiles[i];
      if (drawFn) {
        drawFn(ctx, x, y, tileSize);
      } else {
        ctx.fillStyle = '#0D0D1A';
        ctx.fillRect(x, y, tileSize, tileSize);
      }
    }

    this.textures.addCanvas('office-tiles', canvas);
  }
}
