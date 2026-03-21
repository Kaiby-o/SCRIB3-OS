import {
  type AvatarConfig,
  type HairStyle,
  type EyeStyle,
  type OutfitStyle,
  type Accessory,
  type PantsStyle,
  SKIN_TONES,
  OUTFIT_COLORS,
  seededAvatarConfig,
} from './AvatarConfig';

const SIZE = 32;

export function getAvatarColor(userId: string): string {
  return OUTFIT_COLORS[hashCode(userId) % OUTFIT_COLORS.length];
}

function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function darken(hex: string, amount: number): string {
  const num = parseInt(hex.slice(1), 16);
  const r = Math.max(0, (num >> 16) - amount);
  const g = Math.max(0, ((num >> 8) & 0xff) - amount);
  const b = Math.max(0, (num & 0xff) - amount);
  return `#${(r << 16 | g << 8 | b).toString(16).padStart(6, '0')}`;
}

function lighten(hex: string, amount: number): string {
  const num = parseInt(hex.slice(1), 16);
  const r = Math.min(255, (num >> 16) + amount);
  const g = Math.min(255, ((num >> 8) & 0xff) + amount);
  const b = Math.min(255, (num & 0xff) + amount);
  return `#${(r << 16 | g << 8 | b).toString(16).padStart(6, '0')}`;
}

/**
 * Generate a 4-direction avatar spritesheet.
 * If no config provided, generates a seeded default from userId.
 */
export function generateAvatarCanvas(
  userId: string,
  username: string,
  config?: AvatarConfig,
): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = SIZE * 4;
  canvas.height = SIZE;
  const ctx = canvas.getContext('2d')!;

  const cfg = config ?? seededAvatarConfig(userId);
  const skin = SKIN_TONES[cfg.skinTone] ?? SKIN_TONES[1];
  const initials = getInitials(username);

  for (let dir = 0; dir < 4; dir++) {
    const ox = dir * SIZE;
    drawAvatar(ctx, ox, 0, cfg, skin, initials, dir);
  }

  return canvas;
}

function getInitials(username: string): string {
  const parts = username.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return username.slice(0, 2).toUpperCase();
}

function drawAvatar(
  ctx: CanvasRenderingContext2D,
  ox: number, oy: number,
  cfg: AvatarConfig,
  skin: string,
  initials: string,
  direction: number, // 0=down, 1=left, 2=right, 3=up
) {
  // === LEGS ===
  drawPants(ctx, ox, oy, cfg.pantsStyle, cfg.pantsColor, direction);

  // === BODY / OUTFIT ===
  drawOutfit(ctx, ox, oy, cfg.outfitStyle, cfg.outfitColor, initials, direction);

  // === HEAD ===
  drawHead(ctx, ox, oy, skin, direction);

  // === HAIR ===
  drawHair(ctx, ox, oy, cfg.hairStyle, cfg.hairColor, direction);

  // === EYES ===
  drawEyes(ctx, ox, oy, cfg.eyeStyle, direction);

  // === ACCESSORY ===
  drawAccessory(ctx, ox, oy, cfg.accessory, cfg.outfitColor, direction);
}

// ── HEAD ──
function drawHead(ctx: CanvasRenderingContext2D, ox: number, oy: number, skin: string, dir: number) {
  const hx = ox + 10, hy = oy + 2, hw = 12, hh = 12;
  ctx.fillStyle = skin;
  ctx.fillRect(hx, hy, hw, hh);
  // Ear on side views
  if (dir === 1) { ctx.fillRect(hx + hw, hy + 4, 2, 4); }
  if (dir === 2) { ctx.fillRect(hx - 2, hy + 4, 2, 4); }
}

// ── EYES ──
function drawEyes(ctx: CanvasRenderingContext2D, ox: number, oy: number, style: EyeStyle, dir: number) {
  const hx = ox + 10, hy = oy + 2;
  if (dir === 3) return; // Back of head

  if (dir === 0) { // Front
    switch (style) {
      case 'normal':
        ctx.fillStyle = '#222';
        ctx.fillRect(hx + 2, hy + 5, 2, 2);
        ctx.fillRect(hx + 8, hy + 5, 2, 2);
        break;
      case 'wide':
        ctx.fillStyle = '#222';
        ctx.fillRect(hx + 2, hy + 4, 3, 3);
        ctx.fillRect(hx + 7, hy + 4, 3, 3);
        ctx.fillStyle = '#FFF';
        ctx.fillRect(hx + 3, hy + 4, 1, 1);
        ctx.fillRect(hx + 8, hy + 4, 1, 1);
        break;
      case 'tired':
        ctx.fillStyle = '#222';
        ctx.fillRect(hx + 2, hy + 6, 3, 1);
        ctx.fillRect(hx + 7, hy + 6, 3, 1);
        ctx.fillStyle = '#666';
        ctx.fillRect(hx + 2, hy + 7, 3, 1);
        ctx.fillRect(hx + 7, hy + 7, 3, 1);
        break;
      case 'heterochromia':
        ctx.fillStyle = '#2980B9';
        ctx.fillRect(hx + 2, hy + 5, 2, 2);
        ctx.fillStyle = '#27AE60';
        ctx.fillRect(hx + 8, hy + 5, 2, 2);
        break;
      case 'glasses':
        ctx.fillStyle = '#222';
        ctx.fillRect(hx + 2, hy + 5, 2, 2);
        ctx.fillRect(hx + 8, hy + 5, 2, 2);
        // Frames
        ctx.strokeStyle = '#555';
        ctx.lineWidth = 1;
        ctx.strokeRect(hx + 1, hy + 4, 4, 4);
        ctx.strokeRect(hx + 7, hy + 4, 4, 4);
        ctx.fillStyle = '#555';
        ctx.fillRect(hx + 5, hy + 5, 2, 1); // Bridge
        break;
      case 'sunglasses':
        ctx.fillStyle = '#1A1A1A';
        ctx.fillRect(hx + 1, hy + 4, 4, 3);
        ctx.fillRect(hx + 7, hy + 4, 4, 3);
        ctx.fillRect(hx + 5, hy + 5, 2, 1);
        ctx.fillStyle = '#333';
        ctx.fillRect(hx + 2, hy + 5, 2, 1);
        ctx.fillRect(hx + 8, hy + 5, 2, 1);
        break;
    }
  } else {
    // Side view
    const ex = dir === 1 ? hx + 2 : hx + 8;
    if (style === 'sunglasses') {
      ctx.fillStyle = '#1A1A1A';
      ctx.fillRect(ex, hy + 4, 3, 3);
    } else if (style === 'glasses') {
      ctx.fillStyle = '#222';
      ctx.fillRect(ex, hy + 5, 2, 2);
      ctx.strokeStyle = '#555';
      ctx.lineWidth = 1;
      ctx.strokeRect(ex - 1, hy + 4, 4, 4);
    } else {
      ctx.fillStyle = '#222';
      ctx.fillRect(ex, hy + 5, 2, 2);
    }
  }
}

// ── HAIR ──
function drawHair(ctx: CanvasRenderingContext2D, ox: number, oy: number, style: HairStyle, color: string, dir: number) {
  const hx = ox + 10, hy = oy + 2, hw = 12;
  const dark = darken(color, 20);

  ctx.fillStyle = color;

  switch (style) {
    case 'bald':
      // Just a subtle shine
      ctx.fillStyle = lighten(SKIN_TONES[1], 30);
      ctx.fillRect(hx + 4, hy, 4, 1);
      break;
    case 'short':
      ctx.fillRect(hx, hy, hw, 3);
      if (dir !== 3) { ctx.fillStyle = dark; ctx.fillRect(hx, hy, hw, 1); }
      if (dir === 3) ctx.fillRect(hx, hy, hw, 5);
      break;
    case 'buzz':
      ctx.fillRect(hx, hy, hw, 2);
      if (dir === 3) ctx.fillRect(hx, hy, hw, 4);
      break;
    case 'long':
      ctx.fillRect(hx, hy, hw, 4);
      if (dir === 0) {
        ctx.fillRect(hx - 1, hy + 2, 2, 8);
        ctx.fillRect(hx + hw - 1, hy + 2, 2, 8);
      }
      if (dir === 3) ctx.fillRect(hx, hy, hw, 10);
      if (dir === 1) { ctx.fillRect(hx + hw, hy, 2, 10); ctx.fillRect(hx, hy, hw, 4); }
      if (dir === 2) { ctx.fillRect(hx - 2, hy, 2, 10); ctx.fillRect(hx, hy, hw, 4); }
      break;
    case 'mohawk':
      ctx.fillRect(hx + 4, hy - 2, 4, 2);
      ctx.fillRect(hx + 3, hy, 6, 3);
      ctx.fillStyle = dark;
      ctx.fillRect(hx + 4, hy - 2, 4, 1);
      break;
    case 'curly':
      ctx.fillRect(hx - 1, hy, hw + 2, 4);
      ctx.fillStyle = dark;
      ctx.fillRect(hx, hy, 2, 1); ctx.fillRect(hx + 4, hy, 2, 1);
      ctx.fillRect(hx + 8, hy, 2, 1);
      if (dir === 3) { ctx.fillStyle = color; ctx.fillRect(hx - 1, hy, hw + 2, 6); }
      break;
    case 'ponytail':
      ctx.fillRect(hx, hy, hw, 3);
      if (dir === 3) {
        ctx.fillRect(hx + 3, hy + 3, 6, 2);
        ctx.fillRect(hx + 4, hy + 5, 4, 6);
      }
      if (dir === 2) {
        ctx.fillRect(hx - 2, hy + 4, 3, 6);
      }
      if (dir === 1) {
        ctx.fillRect(hx + hw, hy + 4, 3, 6);
      }
      break;
    case 'afro':
      ctx.fillRect(hx - 2, hy - 2, hw + 4, 5);
      ctx.fillRect(hx - 3, hy, hw + 6, 6);
      ctx.fillStyle = dark;
      ctx.fillRect(hx - 2, hy - 2, hw + 4, 1);
      if (dir === 3) { ctx.fillStyle = color; ctx.fillRect(hx - 3, hy - 2, hw + 6, 10); }
      break;
    case 'messy':
      ctx.fillRect(hx - 1, hy - 1, hw + 2, 4);
      ctx.fillStyle = dark;
      ctx.fillRect(hx + 1, hy - 1, 2, 1);
      ctx.fillRect(hx + 6, hy - 1, 3, 1);
      ctx.fillRect(hx + 10, hy, 2, 1);
      if (dir === 3) { ctx.fillStyle = color; ctx.fillRect(hx - 1, hy - 1, hw + 2, 6); }
      break;
    case 'slicked':
      ctx.fillRect(hx, hy, hw, 3);
      ctx.fillStyle = lighten(color, 40);
      ctx.fillRect(hx + 2, hy, 8, 1);
      if (dir === 3) { ctx.fillStyle = color; ctx.fillRect(hx, hy, hw, 5); }
      break;
  }
}

// ── OUTFIT ──
function drawOutfit(
  ctx: CanvasRenderingContext2D, ox: number, oy: number,
  style: OutfitStyle, color: string, initials: string, dir: number,
) {
  const bx = ox + 8, by = oy + 14, bw = 16, bh = 14;
  const dark = darken(color, 30);
  const light = lighten(color, 20);

  ctx.fillStyle = color;
  ctx.fillRect(bx, by, bw, bh);

  switch (style) {
    case 'tshirt':
      ctx.fillStyle = dark;
      ctx.fillRect(bx, by, bw, 2); // Collar
      // Sleeves
      ctx.fillStyle = color;
      ctx.fillRect(bx - 2, by + 2, 3, 4);
      ctx.fillRect(bx + bw - 1, by + 2, 3, 4);
      break;
    case 'hoodie':
      ctx.fillStyle = dark;
      ctx.fillRect(bx, by, bw, 2);
      // Hood behind head
      if (dir === 0) {
        ctx.fillStyle = dark;
        ctx.fillRect(bx + 4, by - 2, 8, 3);
      }
      // Pocket
      ctx.fillStyle = dark;
      ctx.fillRect(bx + 4, by + 8, 8, 3);
      // Sleeves
      ctx.fillStyle = color;
      ctx.fillRect(bx - 2, by + 2, 3, 6);
      ctx.fillRect(bx + bw - 1, by + 2, 3, 6);
      break;
    case 'suit':
      ctx.fillStyle = dark;
      ctx.fillRect(bx, by, bw, 2);
      // Lapels
      ctx.fillStyle = dark;
      ctx.fillRect(bx + 2, by + 2, 3, 6);
      ctx.fillRect(bx + bw - 5, by + 2, 3, 6);
      // Tie
      ctx.fillStyle = '#C0392B';
      ctx.fillRect(bx + 7, by + 2, 2, 8);
      // Sleeves
      ctx.fillRect(bx - 2, by + 2, 3, 6);
      ctx.fillRect(bx + bw - 1, by + 2, 3, 6);
      break;
    case 'tank':
      ctx.fillStyle = dark;
      ctx.fillRect(bx + 2, by, 12, 1);
      break;
    case 'polo':
      ctx.fillStyle = dark;
      ctx.fillRect(bx, by, bw, 3); // Collar
      ctx.fillStyle = light;
      ctx.fillRect(bx + 6, by, 4, 3); // Collar opening
      ctx.fillStyle = color;
      ctx.fillRect(bx - 2, by + 2, 3, 5);
      ctx.fillRect(bx + bw - 1, by + 2, 3, 5);
      break;
    case 'jacket':
      ctx.fillStyle = dark;
      ctx.fillRect(bx, by, bw, 2);
      // Zip line
      ctx.fillStyle = '#AAA';
      ctx.fillRect(bx + 7, by + 2, 1, bh - 2);
      // Sleeves
      ctx.fillStyle = color;
      ctx.fillRect(bx - 2, by + 2, 3, 6);
      ctx.fillRect(bx + bw - 1, by + 2, 3, 6);
      break;
    case 'sweater':
      ctx.fillStyle = dark;
      ctx.fillRect(bx, by, bw, 3); // Ribbed collar
      ctx.fillStyle = light;
      ctx.fillRect(bx, by + bh - 2, bw, 2); // Ribbed bottom
      ctx.fillStyle = color;
      ctx.fillRect(bx - 2, by + 2, 3, 6);
      ctx.fillRect(bx + bw - 1, by + 2, 3, 6);
      break;
    case 'dress':
      ctx.fillStyle = color;
      ctx.fillRect(bx - 1, by + 8, bw + 2, bh - 4);
      ctx.fillStyle = dark;
      ctx.fillRect(bx, by, bw, 2);
      ctx.fillRect(bx + 4, by + 6, 8, 1); // Belt
      break;
  }

  // Initials on front
  if (dir === 0 && style !== 'suit') {
    ctx.fillStyle = '#FFF';
    ctx.font = 'bold 7px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(initials, ox + SIZE / 2, by + bh / 2 + 1);
  }
}

// ── PANTS ──
function drawPants(
  ctx: CanvasRenderingContext2D, ox: number, oy: number,
  style: PantsStyle, color: string, _dir: number,
) {
  const bx = ox + 10, by = oy + 28;
  const dark = darken(color, 15);

  ctx.fillStyle = color;

  switch (style) {
    case 'jeans':
      ctx.fillRect(bx, by, 5, 4);
      ctx.fillRect(bx + 7, by, 5, 4);
      ctx.fillStyle = dark;
      ctx.fillRect(bx + 5, by, 2, 4); // Gap
      break;
    case 'shorts':
      ctx.fillRect(bx, by, 5, 2);
      ctx.fillRect(bx + 7, by, 5, 2);
      ctx.fillStyle = dark;
      ctx.fillRect(bx + 5, by, 2, 2);
      // Bare legs below
      ctx.fillStyle = SKIN_TONES[1];
      ctx.fillRect(bx + 1, by + 2, 3, 2);
      ctx.fillRect(bx + 8, by + 2, 3, 2);
      break;
    case 'trousers':
      ctx.fillRect(bx, by, 5, 4);
      ctx.fillRect(bx + 7, by, 5, 4);
      ctx.fillStyle = dark;
      ctx.fillRect(bx, by, 12, 1); // Belt line
      ctx.fillRect(bx + 5, by + 1, 2, 3);
      break;
    case 'skirt':
      ctx.fillRect(bx - 1, by, 14, 2);
      ctx.fillStyle = dark;
      ctx.fillRect(bx - 1, by, 14, 1);
      // Legs below
      ctx.fillStyle = SKIN_TONES[1];
      ctx.fillRect(bx + 1, by + 2, 3, 2);
      ctx.fillRect(bx + 8, by + 2, 3, 2);
      break;
  }
}

// ── ACCESSORY ──
function drawAccessory(
  ctx: CanvasRenderingContext2D, ox: number, oy: number,
  accessory: Accessory, accentColor: string, dir: number,
) {
  const hx = ox + 10, hy = oy + 2, hw = 12;

  switch (accessory) {
    case 'none':
      break;
    case 'headphones':
      ctx.fillStyle = '#333';
      ctx.fillRect(hx - 1, hy - 1, 1, 6);
      ctx.fillRect(hx + hw, hy - 1, 1, 6);
      ctx.fillRect(hx - 1, hy - 1, hw + 2, 1);
      // Ear cups
      ctx.fillStyle = '#555';
      ctx.fillRect(hx - 2, hy + 2, 3, 4);
      ctx.fillRect(hx + hw - 1, hy + 2, 3, 4);
      break;
    case 'hat':
      ctx.fillStyle = accentColor;
      ctx.fillRect(hx - 2, hy - 1, hw + 4, 3);
      ctx.fillStyle = darken(accentColor, 20);
      ctx.fillRect(hx, hy - 3, hw, 3);
      if (dir === 0) {
        ctx.fillStyle = accentColor;
        ctx.fillRect(hx - 3, hy + 1, hw + 6, 1); // Brim
      }
      break;
    case 'scarf':
      ctx.fillStyle = accentColor;
      if (dir === 0) {
        ctx.fillRect(ox + 8, oy + 13, 16, 3);
        ctx.fillStyle = darken(accentColor, 20);
        ctx.fillRect(ox + 10, oy + 15, 3, 4); // Dangling end
      } else {
        ctx.fillRect(ox + 8, oy + 13, 16, 2);
      }
      break;
    case 'badge':
      if (dir === 0) {
        ctx.fillStyle = '#F1C40F';
        ctx.fillRect(ox + 10, oy + 16, 4, 4);
        ctx.fillStyle = '#D4AC0D';
        ctx.fillRect(ox + 11, oy + 17, 2, 2);
      }
      break;
    case 'earring':
      if (dir === 0) {
        ctx.fillStyle = '#F1C40F';
        ctx.fillRect(hx - 1, hy + 8, 2, 2);
      }
      if (dir === 1) {
        ctx.fillStyle = '#F1C40F';
        ctx.fillRect(hx + hw + 1, hy + 8, 2, 2);
      }
      break;
  }
}
