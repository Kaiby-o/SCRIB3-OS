const AVATAR_COLORS = [
  '#E74C3C', '#3498DB', '#2ECC71', '#9B59B6',
  '#F39C12', '#1ABC9C', '#E67E22', '#34495E',
  '#D35400', '#8E44AD', '#16A085', '#C0392B',
];

const SKIN_TONES = ['#FDBCB4', '#E8B89D', '#D4956B', '#8D5524'];

function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function getInitials(username: string): string {
  const parts = username.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return username.slice(0, 2).toUpperCase();
}

export function getAvatarColor(userId: string): string {
  return AVATAR_COLORS[hashCode(userId) % AVATAR_COLORS.length];
}

/**
 * Generate a 4-direction avatar spritesheet on a canvas.
 * Returns a canvas with 4 frames (32x32 each) arranged horizontally:
 * [down, left, right, up]
 */
export function generateAvatarCanvas(
  userId: string,
  username: string,
): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  const size = 32;
  canvas.width = size * 4; // 4 frames
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  const color = getAvatarColor(userId);
  const hash = hashCode(userId);
  const skinTone = SKIN_TONES[hash % SKIN_TONES.length];
  const initials = getInitials(username);
  const darkerColor = darken(color, 30);

  // Draw 4 directional frames
  for (let frame = 0; frame < 4; frame++) {
    const ox = frame * size;
    drawCharacter(ctx, ox, 0, size, color, darkerColor, skinTone, initials, frame);
  }

  return canvas;
}

function drawCharacter(
  ctx: CanvasRenderingContext2D,
  ox: number, oy: number, size: number,
  bodyColor: string, darkColor: string, skinTone: string,
  initials: string, direction: number,
) {
  // Body (torso) — 16x14 centered
  const bx = ox + 8, by = oy + 14, bw = 16, bh = 14;
  ctx.fillStyle = bodyColor;
  ctx.fillRect(bx, by, bw, bh);

  // Shoulders
  ctx.fillStyle = darkColor;
  ctx.fillRect(bx, by, bw, 2);

  // Head — 12x12 centered above body
  const hx = ox + 10, hy = oy + 2, hw = 12, hh = 12;
  ctx.fillStyle = skinTone;
  ctx.fillRect(hx, hy, hw, hh);

  // Hair on top
  ctx.fillStyle = darkColor;
  ctx.fillRect(hx, hy, hw, 3);

  // Eyes (front-facing or side)
  ctx.fillStyle = '#222';
  if (direction === 0) {
    // Down — facing camera
    ctx.fillRect(hx + 3, hy + 5, 2, 2);
    ctx.fillRect(hx + 7, hy + 5, 2, 2);
  } else if (direction === 1) {
    // Left
    ctx.fillRect(hx + 2, hy + 5, 2, 2);
  } else if (direction === 2) {
    // Right
    ctx.fillRect(hx + 8, hy + 5, 2, 2);
  } else {
    // Up — back of head, no eyes, more hair
    ctx.fillStyle = darkColor;
    ctx.fillRect(hx, hy, hw, 6);
  }

  // Legs — 2 columns
  ctx.fillStyle = '#2C3E50';
  ctx.fillRect(bx + 2, by + bh, 5, 4);
  ctx.fillRect(bx + 9, by + bh, 5, 4);

  // Initials on torso (front-facing only)
  if (direction === 0) {
    ctx.fillStyle = '#FFF';
    ctx.font = 'bold 7px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(initials, ox + size / 2, by + bh / 2 + 1);
  }
}

function darken(hex: string, amount: number): string {
  const num = parseInt(hex.slice(1), 16);
  const r = Math.max(0, (num >> 16) - amount);
  const g = Math.max(0, ((num >> 8) & 0xff) - amount);
  const b = Math.max(0, (num & 0xff) - amount);
  return `#${(r << 16 | g << 8 | b).toString(16).padStart(6, '0')}`;
}
