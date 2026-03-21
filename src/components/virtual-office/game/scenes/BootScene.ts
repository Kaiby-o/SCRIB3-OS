import Phaser from 'phaser';
import { bridge } from '../../PhaserBridge';

// Pipoya sprite imports — we import a selection of sprites for random assignment
// Each spritesheet is 96x128 (3 cols x 4 rows of 32x32 frames)
// Row layout: 0=Down, 1=Left, 2=Right, 3=Up  (3 walk frames each)
import male01 from '../../../../assets/office/characters/Male 01-1.png';
import male02 from '../../../../assets/office/characters/Male 02-1.png';
import male03 from '../../../../assets/office/characters/Male 03-1.png';
import male04 from '../../../../assets/office/characters/Male 04-1.png';
import male05 from '../../../../assets/office/characters/Male 05-1.png';
import male06 from '../../../../assets/office/characters/Male 06-1.png';
import male07 from '../../../../assets/office/characters/Male 07-1.png';
import male08 from '../../../../assets/office/characters/Male 08-1.png';
import female01 from '../../../../assets/office/characters/Female 01-1.png';
import female02 from '../../../../assets/office/characters/Female 02-1.png';
import female03 from '../../../../assets/office/characters/Female 03-1.png';
import female04 from '../../../../assets/office/characters/Female 04-1.png';
import female05 from '../../../../assets/office/characters/Female 05-1.png';
import female06 from '../../../../assets/office/characters/Female 06-1.png';
import female07 from '../../../../assets/office/characters/Female 07-1.png';
import female08 from '../../../../assets/office/characters/Female 08-1.png';

export const PIPOYA_SPRITES: string[] = [
  male01, male02, male03, male04, male05, male06, male07, male08,
  female01, female02, female03, female04, female05, female06, female07, female08,
];

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload(): void {
    // Generate tilesheet programmatically with proper pixel art
    this.generateTilesheet();

    // Preload all Pipoya character sprites
    PIPOYA_SPRITES.forEach((url, i) => {
      this.load.spritesheet(`pipoya-${i}`, url, {
        frameWidth: 32,
        frameHeight: 32,
      });
    });

    // Listen for avatar textures to register
    bridge.on('register:avatar', (data: unknown) => {
      const { key, canvas } = data as { key: string; canvas: HTMLCanvasElement };
      if (!this.textures.exists(key)) {
        this.textures.addCanvas(key, canvas);
      }
    });
  }

  create(): void {
    // Create walk animations for each Pipoya sprite
    PIPOYA_SPRITES.forEach((_, i) => {
      const key = `pipoya-${i}`;
      // Down walk: frames 0,1,2
      this.anims.create({
        key: `${key}-walk-down`,
        frames: this.anims.generateFrameNumbers(key, { start: 0, end: 2 }),
        frameRate: 6,
        repeat: -1,
      });
      // Left walk: frames 3,4,5
      this.anims.create({
        key: `${key}-walk-left`,
        frames: this.anims.generateFrameNumbers(key, { start: 3, end: 5 }),
        frameRate: 6,
        repeat: -1,
      });
      // Right walk: frames 6,7,8
      this.anims.create({
        key: `${key}-walk-right`,
        frames: this.anims.generateFrameNumbers(key, { start: 6, end: 8 }),
        frameRate: 6,
        repeat: -1,
      });
      // Up walk: frames 9,10,11
      this.anims.create({
        key: `${key}-walk-up`,
        frames: this.anims.generateFrameNumbers(key, { start: 9, end: 11 }),
        frameRate: 6,
        repeat: -1,
      });
    });

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

    // Endesga-32 inspired palette for consistent pixel art look
    const PAL = {
      void:       '#0D0D1A',
      // Floors
      woodBase:   '#A77B5B',
      woodLight:  '#C9956B',
      woodDark:   '#8A5D3B',
      woodLine:   '#6D4830',
      carpetBase: '#3D4F6F',
      carpetLight:'#4D6080',
      carpetDark: '#2E3E5A',
      tileBase:   '#C8D0D8',
      tileLine:   '#A0AAB4',
      tileLight:  '#DDE3E9',
      // Walls
      wallBase:   '#3A4466',
      wallFace:   '#4E5A80',
      wallTop:    '#2A3352',
      wallEdge:   '#1E2640',
      wallHilit:  '#5C6A90',
      // Furniture wood
      deskTop:    '#B8935A',
      deskFrame:  '#8B6B3A',
      deskDark:   '#6D5030',
      // Tech
      monitor:    '#1E2640',
      screen:     '#4488CC',
      screenGlow: '#66AAEE',
      // Fabric
      sofaBase:   '#6B3FA0',
      sofaLight:  '#8B5FC0',
      sofaDark:   '#4D2880',
      // Metal/dark
      metalDark:  '#2A2A3A',
      metalBase:  '#3A3A50',
      metalLight: '#5A5A70',
      // Accent
      red:        '#CC3333',
      green:      '#44AA44',
      greenDark:  '#338833',
      greenLight: '#66CC66',
      blue:       '#3366BB',
      yellow:     '#DDAA33',
      white:      '#E8E8F0',
      offwhite:   '#D0D0DA',
      brown:      '#7A5030',
      brownDark:  '#5A3820',
      brownLight: '#9A7050',
      rugBase:    '#8B2020',
      rugMid:     '#AA3333',
      rugLight:   '#CC5555',
      skyBlue:    '#88BBEE',
      doorGold:   '#CCAA44',
      doorBrown:  '#AA8844',
    };

    // Helper: draw pixel with optional dithering
    const px = (x: number, y: number, w: number, h: number, color: string) => {
      ctx.fillStyle = color;
      ctx.fillRect(x, y, w, h);
    };

    // Checkerboard dither between two colors
    const dither = (x0: number, y0: number, w: number, h: number, c1: string, c2: string) => {
      for (let dy = 0; dy < h; dy++) {
        for (let dx = 0; dx < w; dx++) {
          ctx.fillStyle = (dx + dy) % 2 === 0 ? c1 : c2;
          ctx.fillRect(x0 + dx, y0 + dy, 1, 1);
        }
      }
    };

    const tiles: Record<number, (x: number, y: number, s: number) => void> = {
      // 0: Void
      0: (x, y, s) => { px(x, y, s, s, PAL.void); },

      // 1: Wood floor — planks with grain lines and subtle variation
      1: (x, y, s) => {
        px(x, y, s, s, PAL.woodBase);
        // Plank lines
        px(x, y + 7, s, 1, PAL.woodDark);
        px(x, y + 15, s, 1, PAL.woodLine);
        px(x, y + 23, s, 1, PAL.woodDark);
        // Grain highlights
        px(x + 4, y + 1, 1, 6, PAL.woodLight);
        px(x + 12, y + 9, 1, 5, PAL.woodLight);
        px(x + 22, y + 17, 1, 5, PAL.woodLight);
        px(x + 8, y + 25, 1, 5, PAL.woodLight);
        // Knot
        px(x + 20, y + 3, 2, 2, PAL.woodDark);
        // Edge detail
        px(x, y + 8, s, 1, PAL.woodLight);
        px(x, y + 16, s, 1, PAL.woodLight);
      },

      // 2: Carpet — subtle woven texture
      2: (x, y, s) => {
        px(x, y, s, s, PAL.carpetBase);
        // Woven texture via dithering
        dither(x + 2, y + 2, 4, 4, PAL.carpetLight, PAL.carpetBase);
        dither(x + 14, y + 10, 4, 4, PAL.carpetLight, PAL.carpetBase);
        dither(x + 24, y + 6, 4, 4, PAL.carpetDark, PAL.carpetBase);
        dither(x + 8, y + 20, 4, 4, PAL.carpetDark, PAL.carpetBase);
        dither(x + 20, y + 22, 4, 4, PAL.carpetLight, PAL.carpetBase);
      },

      // 3: Tile floor — clean grid
      3: (x, y, s) => {
        px(x, y, s, s, PAL.tileBase);
        // Grid lines
        px(x, y, s, 1, PAL.tileLine);
        px(x, y, 1, s, PAL.tileLine);
        px(x + 15, y, 1, s, PAL.tileLine);
        // Highlight edge (light source top-left)
        px(x + 1, y + 1, 14, 1, PAL.tileLight);
        px(x + 1, y + 1, 1, 14, PAL.tileLight);
        px(x + 16, y + 1, 14, 1, PAL.tileLight);
        px(x + 16, y + 1, 1, 14, PAL.tileLight);
      },

      // 4: Wall horizontal — thick wall with shadow/highlight
      4: (x, y, s) => {
        px(x, y, s, s, PAL.wallBase);
        // Top edge (highlight)
        px(x, y, s, 2, PAL.wallHilit);
        // Face
        px(x, y + 2, s, s - 6, PAL.wallFace);
        // Bottom edge (shadow)
        px(x, y + s - 4, s, 4, PAL.wallTop);
        // Brick lines
        px(x, y + 8, s, 1, PAL.wallBase);
        px(x + 16, y + 4, 1, 4, PAL.wallBase);
        px(x + 8, y + 9, 1, 4, PAL.wallBase);
      },

      // 5: Wall vertical
      5: (x, y, s) => {
        px(x, y, s, s, PAL.wallBase);
        px(x, y, 2, s, PAL.wallHilit);
        px(x + 2, y, s - 6, s, PAL.wallFace);
        px(x + s - 4, y, 4, s, PAL.wallTop);
        px(x + 8, y, 1, s, PAL.wallBase);
        px(x + 4, y + 16, 4, 1, PAL.wallBase);
      },

      // 6: Corner TL
      6: (x, y, s) => {
        px(x, y, s, s, PAL.wallEdge);
        px(x + 4, y + 4, s - 4, s - 4, PAL.wallFace);
        px(x, y, s, 2, PAL.wallHilit);
        px(x, y, 2, s, PAL.wallHilit);
      },

      // 7: Corner TR
      7: (x, y, s) => {
        px(x, y, s, s, PAL.wallEdge);
        px(x, y + 4, s - 4, s - 4, PAL.wallFace);
        px(x, y, s, 2, PAL.wallHilit);
        px(x + s - 4, y, 4, s, PAL.wallTop);
      },

      // 8: Corner BL
      8: (x, y, s) => {
        px(x, y, s, s, PAL.wallEdge);
        px(x + 4, y, s - 4, s - 4, PAL.wallFace);
        px(x, y, 2, s, PAL.wallHilit);
        px(x, y + s - 4, s, 4, PAL.wallTop);
      },

      // 9: Corner BR
      9: (x, y, s) => {
        px(x, y, s, s, PAL.wallEdge);
        px(x, y, s - 4, s - 4, PAL.wallFace);
        px(x + s - 4, y, 4, s, PAL.wallTop);
        px(x, y + s - 4, s, 4, PAL.wallTop);
      },

      // 10: Desk with monitor — isometric feel
      10: (x, y, s) => {
        // Desk surface
        px(x + 1, y + 6, s - 2, 14, PAL.deskTop);
        px(x + 1, y + 6, s - 2, 2, PAL.woodLight); // highlight edge
        px(x + 1, y + 18, s - 2, 2, PAL.deskFrame); // front lip
        // Legs
        px(x + 3, y + 20, 3, 10, PAL.deskFrame);
        px(x + s - 6, y + 20, 3, 10, PAL.deskFrame);
        px(x + 3, y + 20, 3, 1, PAL.deskDark);
        px(x + s - 6, y + 20, 3, 1, PAL.deskDark);
        // Monitor
        px(x + 8, y + 1, 16, 12, PAL.monitor);
        px(x + 10, y + 2, 12, 9, PAL.screen);
        // Screen glow pixels
        px(x + 11, y + 3, 4, 1, PAL.screenGlow);
        px(x + 17, y + 5, 3, 1, PAL.screenGlow);
        px(x + 12, y + 7, 5, 1, PAL.screenGlow);
        // Stand
        px(x + 14, y + 13, 4, 2, PAL.metalDark);
        px(x + 12, y + 15, 8, 1, PAL.metalBase);
      },

      // 11: Office chair — top-down view
      11: (x, y, s) => {
        // Wheels (star base)
        px(x + 8, y + 26, 2, 4, PAL.metalDark);
        px(x + 22, y + 26, 2, 4, PAL.metalDark);
        px(x + 15, y + 28, 2, 4, PAL.metalDark);
        // Pole
        px(x + 14, y + 22, 4, 6, PAL.metalBase);
        // Seat
        px(x + 6, y + 10, 20, 14, PAL.sofaBase);
        px(x + 8, y + 12, 16, 10, PAL.sofaLight);
        // Back
        px(x + 8, y + 4, 16, 8, PAL.sofaDark);
        px(x + 10, y + 5, 12, 5, PAL.sofaBase);
        // Armrests
        px(x + 4, y + 10, 4, 12, PAL.sofaDark);
        px(x + 24, y + 10, 4, 12, PAL.sofaDark);
      },

      // 12: Sofa
      12: (x, y, s) => {
        // Base
        px(x + 1, y + 8, s - 2, s - 10, PAL.sofaBase);
        // Back
        px(x + 1, y + 6, s - 2, 6, PAL.sofaDark);
        px(x + 3, y + 7, s - 6, 4, PAL.sofaBase);
        // Cushions
        px(x + 3, y + 14, 12, 10, PAL.sofaLight);
        px(x + 17, y + 14, 12, 10, PAL.sofaLight);
        // Cushion divide
        px(x + 15, y + 14, 2, 10, PAL.sofaBase);
        // Armrests
        px(x + 1, y + 10, 3, 14, PAL.sofaDark);
        px(x + s - 4, y + 10, 3, 14, PAL.sofaDark);
        // Shadow
        px(x + 1, y + s - 2, s - 2, 2, PAL.sofaDark);
      },

      // 13: Table
      13: (x, y, s) => {
        // Surface
        px(x + 2, y + 4, s - 4, s - 8, PAL.deskTop);
        px(x + 2, y + 4, s - 4, 2, PAL.woodLight);
        px(x + 2, y + s - 6, s - 4, 2, PAL.deskFrame);
        // Legs
        px(x + 4, y + s - 4, 3, 4, PAL.deskDark);
        px(x + s - 7, y + s - 4, 3, 4, PAL.deskDark);
        // Surface detail
        px(x + 10, y + 8, 12, 1, PAL.woodDark);
      },

      // 14: Potted plant
      14: (x, y, s) => {
        // Pot
        px(x + 10, y + 20, 12, 10, PAL.brown);
        px(x + 11, y + 20, 10, 2, PAL.brownLight); // rim
        px(x + 11, y + 22, 10, 6, PAL.brownDark);  // shadow side
        px(x + 12, y + 22, 8, 6, PAL.brown);
        // Soil
        px(x + 12, y + 20, 8, 2, PAL.brownDark);
        // Leaves (top-down bush)
        px(x + 8, y + 6, 16, 16, PAL.green);
        px(x + 6, y + 8, 20, 12, PAL.green);
        // Leaf shading
        px(x + 10, y + 8, 6, 4, PAL.greenLight);
        px(x + 16, y + 12, 6, 4, PAL.greenDark);
        px(x + 8, y + 14, 4, 4, PAL.greenDark);
        // Highlight dots
        px(x + 12, y + 7, 2, 2, PAL.greenLight);
        px(x + 20, y + 10, 2, 2, PAL.greenLight);
      },

      // 15: Whiteboard
      15: (x, y, s) => {
        // Frame
        px(x + 1, y + 2, s - 2, s - 4, PAL.metalBase);
        // Board surface
        px(x + 3, y + 4, s - 6, s - 8, PAL.white);
        px(x + 3, y + 4, s - 6, 2, PAL.offwhite); // top edge
        // Tray
        px(x + 3, y + s - 6, s - 6, 2, PAL.metalLight);
        // Marker lines
        px(x + 6, y + 8, 14, 1, PAL.red);
        px(x + 6, y + 12, 18, 1, PAL.blue);
        px(x + 8, y + 16, 10, 1, PAL.green);
        // Marker dots (erased area)
        dither(x + 16, y + 14, 6, 6, PAL.white, PAL.offwhite);
      },

      // 16: Coffee machine
      16: (x, y, s) => {
        // Body
        px(x + 6, y + 4, 20, 24, PAL.metalDark);
        px(x + 8, y + 6, 16, 12, PAL.metalBase);
        // Display
        px(x + 10, y + 7, 8, 4, PAL.screenGlow);
        px(x + 10, y + 7, 8, 1, PAL.screen);
        // Buttons
        px(x + 10, y + 14, 3, 2, PAL.red);
        px(x + 15, y + 14, 3, 2, PAL.green);
        // Drip area
        px(x + 10, y + 20, 12, 6, PAL.metalBase);
        px(x + 12, y + 21, 8, 4, PAL.metalDark);
        // Cup
        px(x + 13, y + 22, 6, 3, PAL.white);
        // Top
        px(x + 6, y + 4, 20, 2, PAL.metalLight);
      },

      // 17: Bookshelf
      17: (x, y, s) => {
        // Frame
        px(x + 2, y, s - 4, s, PAL.brownDark);
        // Shelves
        px(x + 4, y + 2, s - 8, 8, PAL.brown);
        px(x + 4, y + 12, s - 8, 8, PAL.brown);
        px(x + 4, y + 22, s - 8, 8, PAL.brown);
        // Shelf edges
        px(x + 4, y + 10, s - 8, 2, PAL.brownLight);
        px(x + 4, y + 20, s - 8, 2, PAL.brownLight);
        px(x + 4, y + 30, s - 8, 2, PAL.brownLight);
        // Books (row 1)
        px(x + 5, y + 3, 3, 6, PAL.red);
        px(x + 9, y + 3, 3, 6, PAL.blue);
        px(x + 13, y + 4, 2, 5, PAL.green);
        px(x + 16, y + 3, 3, 6, PAL.yellow);
        px(x + 20, y + 4, 3, 5, '#8844AA');
        // Books (row 2)
        px(x + 5, y + 13, 4, 6, PAL.blue);
        px(x + 10, y + 13, 2, 6, PAL.red);
        px(x + 14, y + 14, 3, 5, PAL.yellow);
        px(x + 18, y + 13, 4, 6, PAL.green);
        // Books (row 3)
        px(x + 5, y + 23, 3, 6, PAL.yellow);
        px(x + 9, y + 24, 3, 5, '#AA4444');
        px(x + 14, y + 23, 3, 6, PAL.blue);
        px(x + 19, y + 24, 3, 5, PAL.green);
      },

      // 18: Door
      18: (x, y, s) => {
        // Frame
        px(x, y, s, s, PAL.deskFrame);
        // Door panel
        px(x + 4, y + 2, s - 8, s - 3, PAL.doorBrown);
        // Panels
        px(x + 6, y + 4, s - 12, 10, PAL.doorGold);
        px(x + 7, y + 5, s - 14, 8, PAL.deskTop);
        px(x + 6, y + 18, s - 12, 8, PAL.doorGold);
        px(x + 7, y + 19, s - 14, 6, PAL.deskTop);
        // Handle
        px(x + s - 10, y + 14, 3, 3, PAL.yellow);
        px(x + s - 9, y + 15, 1, 1, PAL.white);
      },

      // 19: Window
      19: (x, y, s) => {
        // Frame
        px(x, y, s, s, PAL.wallFace);
        // Glass
        px(x + 3, y + 3, s - 6, s - 6, PAL.skyBlue);
        // Cross frame
        px(x + s / 2 - 1, y + 3, 2, s - 6, PAL.wallBase);
        px(x + 3, y + s / 2 - 1, s - 6, 2, PAL.wallBase);
        // Glass highlights
        px(x + 5, y + 5, 3, 6, '#AADDFF');
        px(x + s / 2 + 2, y + 5, 2, 4, '#AADDFF');
        // Clouds
        px(x + 7, y + 8, 4, 2, '#CCDDEE');
        px(x + s / 2 + 3, y + 12, 5, 2, '#CCDDEE');
      },

      // 20: Rug/carpet accent
      20: (x, y, s) => {
        px(x, y, s, s, PAL.rugBase);
        // Border pattern
        px(x + 2, y + 2, s - 4, s - 4, PAL.rugMid);
        px(x + 4, y + 4, s - 8, s - 8, PAL.rugLight);
        px(x + 6, y + 6, s - 12, s - 12, PAL.rugMid);
        // Center diamond
        px(x + 12, y + 10, 8, 12, PAL.rugBase);
        px(x + 14, y + 12, 4, 8, PAL.yellow);
        // Corner accents
        px(x + 4, y + 4, 3, 3, PAL.yellow);
        px(x + s - 7, y + 4, 3, 3, PAL.yellow);
        px(x + 4, y + s - 7, 3, 3, PAL.yellow);
        px(x + s - 7, y + s - 7, 3, 3, PAL.yellow);
      },
    };

    for (let i = 0; i < cols * rows; i++) {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const x = col * tileSize;
      const y = row * tileSize;
      const drawFn = tiles[i];
      if (drawFn) {
        drawFn(x, y, tileSize);
      } else {
        ctx.fillStyle = PAL.void;
        ctx.fillRect(x, y, tileSize, tileSize);
      }
    }

    this.textures.addCanvas('office-tiles', canvas);
  }
}
