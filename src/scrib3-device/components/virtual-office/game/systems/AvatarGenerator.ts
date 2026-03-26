import {
  type LegacyAvatarConfig,
  type HairStyle,
  type EyeStyle,
  type OutfitStyle,
  type Accessory,
  type PantsStyle,
  SKIN_TONES,
  OUTFIT_COLORS,
  seededAvatarConfig,
} from './AvatarConfig';

const S = 32; // Sprite size

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

function darken(hex: string, amt: number): string {
  const n = parseInt(hex.slice(1), 16);
  const r = Math.max(0, (n >> 16) - amt);
  const g = Math.max(0, ((n >> 8) & 0xff) - amt);
  const b = Math.max(0, (n & 0xff) - amt);
  return '#' + (r << 16 | g << 8 | b).toString(16).padStart(6, '0');
}

function lighten(hex: string, amt: number): string {
  const n = parseInt(hex.slice(1), 16);
  const r = Math.min(255, (n >> 16) + amt);
  const g = Math.min(255, ((n >> 8) & 0xff) + amt);
  const b = Math.min(255, (n & 0xff) + amt);
  return '#' + (r << 16 | g << 8 | b).toString(16).padStart(6, '0');
}

function px(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, color: string) {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w, h);
}

function getInitials(username: string): string {
  const parts = username.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return username.slice(0, 2).toUpperCase();
}

export function generateAvatarCanvas(
  userId: string,
  username: string,
  config?: LegacyAvatarConfig,
): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = S * 4;
  canvas.height = S;
  const ctx = canvas.getContext('2d')!;

  const cfg = config ?? seededAvatarConfig(userId);
  const skin = SKIN_TONES[cfg.skinTone] ?? SKIN_TONES[1];
  const skinShade = darken(skin, 25);
  const initials = getInitials(username);

  for (let dir = 0; dir < 4; dir++) {
    const ox = dir * S;
    drawAvatar(ctx, ox, cfg, skin, skinShade, initials, dir);
  }

  return canvas;
}

function drawAvatar(
  c: CanvasRenderingContext2D,
  ox: number,
  cfg: import('./AvatarConfig').LegacyAvatarConfig,
  skin: string,
  skinShade: string,
  initials: string,
  dir: number, // 0=down, 1=left, 2=right, 3=up
) {
  // Clear frame
  c.clearRect(ox, 0, S, S);

  // Body proportions (centered in 32x32):
  // Head: 10x10 at (11, 2)
  // Body: 12x10 at (10, 12)
  // Legs: two 4x6 columns

  // ── LEGS / PANTS ──
  drawLegs(c, ox, cfg.pantsStyle, cfg.pantsColor, skin, dir);

  // ── BODY / OUTFIT ──
  drawBody(c, ox, cfg.outfitStyle, cfg.outfitColor, initials, dir);

  // ── HEAD ──
  const hx = ox + 11, hy = 2;
  px(c, hx, hy, 10, 10, skin);
  // Chin shadow
  px(c, hx + 1, hy + 9, 8, 1, skinShade);

  // ── HAIR ──
  drawHairStyle(c, ox, cfg.hairStyle, cfg.hairColor, dir);

  // ── EYES ──
  drawEyeStyle(c, ox, cfg.eyeStyle, skin, dir);

  // ── ACCESSORY ──
  drawAcc(c, ox, cfg.accessory, cfg.outfitColor, dir);
}

// ── LEGS ──
function drawLegs(c: CanvasRenderingContext2D, ox: number, style: PantsStyle, color: string, skin: string, dir: number) {
  const lx = ox + 11, ly = 22;
  const dark = darken(color, 20);

  switch (style) {
    case 'jeans':
      px(c, lx, ly, 4, 6, color);
      px(c, lx + 6, ly, 4, 6, color);
      px(c, lx, ly, 4, 1, dark); // Waistband
      px(c, lx + 6, ly, 4, 1, dark);
      // Shoes
      px(c, lx, ly + 5, 4, 1, '#1A1A1A');
      px(c, lx + 6, ly + 5, 4, 1, '#1A1A1A');
      break;
    case 'trousers':
      px(c, lx, ly, 4, 6, color);
      px(c, lx + 6, ly, 4, 6, color);
      px(c, lx, ly, 10, 1, dark); // Belt
      px(c, lx + 4, ly, 2, 1, '#AAA'); // Buckle
      px(c, lx, ly + 5, 4, 1, '#222');
      px(c, lx + 6, ly + 5, 4, 1, '#222');
      break;
    case 'shorts':
      px(c, lx, ly, 4, 3, color);
      px(c, lx + 6, ly, 4, 3, color);
      px(c, lx, ly, 10, 1, dark);
      // Bare legs
      px(c, lx + 1, ly + 3, 2, 3, skin);
      px(c, lx + 7, ly + 3, 2, 3, skin);
      // Shoes
      px(c, lx, ly + 5, 4, 1, '#FFF');
      px(c, lx + 6, ly + 5, 4, 1, '#FFF');
      break;
    case 'skirt':
      px(c, lx - 1, ly, 12, 3, color);
      px(c, lx - 1, ly, 12, 1, dark);
      // Legs
      px(c, lx + 1, ly + 3, 2, 3, skin);
      px(c, lx + 7, ly + 3, 2, 3, skin);
      px(c, lx, ly + 5, 4, 1, '#222');
      px(c, lx + 6, ly + 5, 4, 1, '#222');
      break;
  }
  void dir;
}

// ── BODY ──
function drawBody(c: CanvasRenderingContext2D, ox: number, style: OutfitStyle, color: string, initials: string, dir: number) {
  const bx = ox + 10, by = 12, bw = 12, bh = 10;
  const dark = darken(color, 30);
  const light = lighten(color, 25);

  // Base body
  px(c, bx, by, bw, bh, color);

  switch (style) {
    case 'tshirt':
      px(c, bx + 3, by, 6, 1, dark); // Neckline
      px(c, bx - 2, by + 1, 3, 4, color); // Left sleeve
      px(c, bx + bw - 1, by + 1, 3, 4, color); // Right sleeve
      px(c, bx - 2, by + 5, 3, 1, dark); // Sleeve hem
      px(c, bx + bw - 1, by + 5, 3, 1, dark);
      break;
    case 'hoodie':
      px(c, bx + 2, by, 8, 2, dark); // Hood collar
      px(c, bx - 2, by + 1, 3, 6, color);
      px(c, bx + bw - 1, by + 1, 3, 6, color);
      px(c, bx + 3, by + 5, 6, 3, dark); // Front pocket
      px(c, bx, by + bh - 1, bw, 1, dark); // Bottom band
      break;
    case 'suit':
      px(c, bx + 5, by, 2, 1, '#FFF'); // Shirt collar
      px(c, bx + 5, by + 1, 2, 6, '#FFF'); // Shirt front
      px(c, bx + 1, by + 1, 4, 8, dark); // Left lapel
      px(c, bx + 7, by + 1, 4, 8, dark); // Right lapel
      px(c, bx + 5, by + 2, 2, 5, '#C0392B'); // Tie
      px(c, bx - 1, by + 1, 2, 6, color);
      px(c, bx + bw - 1, by + 1, 2, 6, color);
      break;
    case 'tank':
      px(c, bx + 2, by, 8, 1, dark); // Straps
      px(c, bx + 3, by, 1, 2, dark);
      px(c, bx + 8, by, 1, 2, dark);
      break;
    case 'polo':
      px(c, bx + 2, by, 8, 2, dark); // Collar
      px(c, bx + 4, by, 4, 2, light); // Collar opening
      px(c, bx - 2, by + 1, 3, 5, color);
      px(c, bx + bw - 1, by + 1, 3, 5, color);
      break;
    case 'jacket':
      px(c, bx + 5, by + 1, 2, 8, '#AAA'); // Zipper
      px(c, bx - 2, by + 1, 3, 7, color);
      px(c, bx + bw - 1, by + 1, 3, 7, color);
      px(c, bx, by, bw, 1, dark); // Collar
      px(c, bx - 2, by + 8, 3, 1, dark); // Cuff
      px(c, bx + bw - 1, by + 8, 3, 1, dark);
      break;
    case 'sweater':
      px(c, bx + 2, by, 8, 2, dark); // Ribbed collar
      px(c, bx - 2, by + 1, 3, 7, color);
      px(c, bx + bw - 1, by + 1, 3, 7, color);
      px(c, bx, by + bh - 2, bw, 2, dark); // Ribbed bottom
      break;
    case 'dress':
      px(c, bx + 3, by, 6, 1, dark); // Neckline
      px(c, bx - 1, by + bh - 2, bw + 2, 2, color); // Flare
      px(c, bx + 3, by + 5, 6, 1, darken(color, 15)); // Belt/waist
      break;
  }

  // Initials on front-facing
  if (dir === 0 && style !== 'suit') {
    c.fillStyle = 'rgba(255,255,255,0.7)';
    c.font = 'bold 6px monospace';
    c.textAlign = 'center';
    c.textBaseline = 'middle';
    c.fillText(initials, ox + S / 2, by + bh / 2);
  }
}

// ── HAIR ──
function drawHairStyle(c: CanvasRenderingContext2D, ox: number, style: HairStyle, color: string, dir: number) {
  const hx = ox + 11, hy = 2, hw = 10;
  const dark = darken(color, 25);

  c.fillStyle = color;

  switch (style) {
    case 'bald':
      // Subtle highlight
      px(c, hx + 3, hy, 4, 1, lighten(SKIN_TONES[1], 40));
      break;
    case 'buzz':
      px(c, hx, hy, hw, 2, color);
      if (dir === 3) px(c, hx, hy, hw, 5, color);
      break;
    case 'short':
      px(c, hx, hy, hw, 3, color);
      px(c, hx, hy, hw, 1, dark);
      if (dir === 1) px(c, hx + hw - 1, hy, 2, 4, color);
      if (dir === 2) px(c, hx - 1, hy, 2, 4, color);
      if (dir === 3) px(c, hx, hy, hw, 5, color);
      break;
    case 'long':
      px(c, hx, hy, hw, 4, color);
      px(c, hx, hy, hw, 1, dark);
      if (dir === 0) {
        px(c, hx - 1, hy + 3, 2, 7, color);
        px(c, hx + hw - 1, hy + 3, 2, 7, color);
      }
      if (dir === 1) px(c, hx + hw - 1, hy + 1, 3, 9, color);
      if (dir === 2) px(c, hx - 2, hy + 1, 3, 9, color);
      if (dir === 3) px(c, hx, hy, hw, 10, color);
      break;
    case 'mohawk':
      px(c, hx + 3, hy - 3, 4, 3, color);
      px(c, hx + 2, hy, 6, 2, color);
      px(c, hx + 3, hy - 3, 4, 1, dark);
      break;
    case 'curly':
      px(c, hx - 1, hy, hw + 2, 4, color);
      // Curly texture
      px(c, hx, hy, 2, 1, dark);
      px(c, hx + 4, hy, 2, 1, dark);
      px(c, hx + 8, hy, 2, 1, dark);
      px(c, hx - 1, hy + 2, 1, 1, dark);
      px(c, hx + hw, hy + 2, 1, 1, dark);
      if (dir === 3) px(c, hx - 1, hy, hw + 2, 7, color);
      break;
    case 'ponytail':
      px(c, hx, hy, hw, 3, color);
      px(c, hx, hy, hw, 1, dark);
      if (dir === 3 || dir === 1) {
        px(c, hx + hw - 1, hy + 4, 3, 2, color);
        px(c, hx + hw, hy + 6, 2, 5, color);
      }
      if (dir === 2) {
        px(c, hx - 2, hy + 4, 3, 2, color);
        px(c, hx - 2, hy + 6, 2, 5, color);
      }
      break;
    case 'afro':
      px(c, hx - 2, hy - 2, hw + 4, 6, color);
      px(c, hx - 3, hy, hw + 6, 5, color);
      px(c, hx - 2, hy - 2, hw + 4, 1, dark);
      if (dir === 3) px(c, hx - 3, hy - 2, hw + 6, 10, color);
      break;
    case 'messy':
      px(c, hx - 1, hy - 1, hw + 2, 4, color);
      // Messy strands
      px(c, hx, hy - 2, 2, 1, color);
      px(c, hx + 5, hy - 2, 3, 1, color);
      px(c, hx + hw, hy, 1, 2, color);
      px(c, hx - 1, hy, hw + 2, 1, dark);
      if (dir === 3) px(c, hx - 1, hy - 1, hw + 2, 6, color);
      break;
    case 'slicked':
      px(c, hx, hy, hw, 3, color);
      px(c, hx + 2, hy, 6, 1, lighten(color, 50)); // Shine
      if (dir === 3) px(c, hx, hy, hw, 5, color);
      break;
  }
}

// ── EYES ──
function drawEyeStyle(c: CanvasRenderingContext2D, ox: number, style: EyeStyle, _skin: string, dir: number) {
  const hx = ox + 11, hy = 2;
  if (dir === 3) return; // Back view

  const el = dir === 1 ? hx + 2 : dir === 2 ? hx + 6 : hx + 2; // Left eye x
  const er = hx + 6; // Right eye x (front only)

  if (dir === 0) {
    // Front face
    switch (style) {
      case 'normal':
        px(c, el, hy + 5, 2, 2, '#222');
        px(c, er, hy + 5, 2, 2, '#222');
        // Highlights
        px(c, el, hy + 5, 1, 1, '#555');
        px(c, er, hy + 5, 1, 1, '#555');
        break;
      case 'wide':
        px(c, el, hy + 4, 3, 3, '#FFF');
        px(c, er, hy + 4, 3, 3, '#FFF');
        px(c, el + 1, hy + 5, 2, 2, '#222');
        px(c, er + 1, hy + 5, 2, 2, '#222');
        break;
      case 'tired':
        px(c, el, hy + 6, 3, 1, '#222');
        px(c, er, hy + 6, 3, 1, '#222');
        px(c, el, hy + 7, 3, 1, darken(_skin, 30)); // Bags
        px(c, er, hy + 7, 3, 1, darken(_skin, 30));
        break;
      case 'heterochromia':
        px(c, el, hy + 5, 2, 2, '#2980B9');
        px(c, er, hy + 5, 2, 2, '#27AE60');
        break;
      case 'glasses':
        px(c, el, hy + 5, 2, 2, '#222');
        px(c, er, hy + 5, 2, 2, '#222');
        // Frames
        c.strokeStyle = '#888';
        c.lineWidth = 1;
        c.strokeRect(el - 0.5, hy + 3.5, 4, 4);
        c.strokeRect(er - 0.5, hy + 3.5, 4, 4);
        px(c, el + 3, hy + 5, 2, 1, '#888'); // Bridge
        break;
      case 'sunglasses':
        px(c, el - 1, hy + 4, 5, 3, '#111');
        px(c, er - 1, hy + 4, 5, 3, '#111');
        px(c, el + 3, hy + 5, 2, 1, '#111'); // Bridge
        // Glint
        px(c, el, hy + 4, 1, 1, '#444');
        px(c, er, hy + 4, 1, 1, '#444');
        break;
    }
    // Mouth
    px(c, hx + 4, hy + 8, 2, 1, darken(_skin, 40));
  } else {
    // Side view (single eye)
    const ex = dir === 1 ? hx + 2 : hx + 6;
    switch (style) {
      case 'sunglasses':
        px(c, ex - 1, hy + 4, 4, 3, '#111');
        px(c, ex, hy + 4, 1, 1, '#444');
        break;
      case 'glasses':
        px(c, ex, hy + 5, 2, 2, '#222');
        c.strokeStyle = '#888';
        c.lineWidth = 1;
        c.strokeRect(ex - 0.5, hy + 3.5, 4, 4);
        break;
      default:
        px(c, ex, hy + 5, 2, 2, '#222');
        break;
    }
  }
}

// ── ACCESSORY ──
function drawAcc(c: CanvasRenderingContext2D, ox: number, acc: Accessory, accent: string, dir: number) {
  const hx = ox + 11, hy = 2, hw = 10;

  switch (acc) {
    case 'none':
      break;
    case 'headphones':
      px(c, hx - 1, hy, hw + 2, 1, '#333'); // Band
      px(c, hx - 2, hy + 1, 3, 4, '#555'); // Left cup
      px(c, hx + hw - 1, hy + 1, 3, 4, '#555'); // Right cup
      px(c, hx - 2, hy + 2, 3, 2, '#777'); // Highlight
      px(c, hx + hw - 1, hy + 2, 3, 2, '#777');
      break;
    case 'hat':
      px(c, hx - 1, hy - 1, hw + 2, 3, accent);
      px(c, hx - 1, hy - 1, hw + 2, 1, darken(accent, 20));
      if (dir === 0) px(c, hx - 2, hy + 1, hw + 4, 1, accent); // Brim
      break;
    case 'scarf':
      px(c, ox + 9, 11, 14, 2, accent);
      if (dir === 0) px(c, ox + 10, 13, 3, 3, darken(accent, 15)); // Tail
      break;
    case 'badge':
      if (dir === 0) {
        px(c, ox + 11, 14, 3, 3, '#F1C40F');
        px(c, ox + 12, 15, 1, 1, '#FFF');
      }
      break;
    case 'earring':
      if (dir === 0) px(c, hx - 1, hy + 8, 1, 2, '#F1C40F');
      if (dir === 1) px(c, hx + hw, hy + 8, 1, 2, '#F1C40F');
      if (dir === 2) px(c, hx - 1, hy + 8, 1, 2, '#F1C40F');
      break;
  }
}
