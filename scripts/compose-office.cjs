/**
 * compose-office.cjs
 * Composites LimeZu pre-built room PNGs into a combined office image.
 * Outputs:
 *   public/assets/office/office-layer1.png  (floors + walls — render below player)
 *   public/assets/office/office-layer2.png  (furniture  — render above player)
 *   public/assets/office/office-collision.json
 *
 * Run:  node scripts/compose-office.cjs
 */

const { createCanvas, loadImage } = require('canvas');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const DESIGNS = path.join(ROOT, 'src/assets/office/tilesets/limezu_raw/6_Home_Designs');
const OUT_DIR = path.join(ROOT, 'public/assets/office');

const TILE = 32;

async function main() {
  // --- Load source images ---
  const homeL1 = await loadImage(path.join(DESIGNS, 'Generic_Home_Designs/32x32/Generic_Home_1_Layer_1_32x32.png'));
  const homeL2 = await loadImage(path.join(DESIGNS, 'Generic_Home_Designs/32x32/Generic_Home_1_Layer_2_32x32.png'));
  const condoL1 = await loadImage(path.join(DESIGNS, 'Condominium_Designs/32x32/Condominium_Design_layer_1_32x32.png'));
  const condoL2 = await loadImage(path.join(DESIGNS, 'Condominium_Designs/32x32/Condominium_Design_layer_2_32x32.png'));

  // Layout: Generic Home on the left, Condominium on the right
  // Both are 448px wide. Heights differ (428 vs 352).
  // Use max height, center the shorter one vertically.
  const totalW = homeL1.width + condoL1.width; // 896
  const totalH = Math.max(homeL1.height, condoL1.height); // 428

  const condoOffsetY = Math.floor((totalH - condoL1.height) / 2); // center vertically

  // --- Compose Layer 1 (floors + walls) ---
  const c1 = createCanvas(totalW, totalH);
  const ctx1 = c1.getContext('2d');
  ctx1.drawImage(homeL1, 0, 0);
  ctx1.drawImage(condoL1, homeL1.width, condoOffsetY);

  // --- Compose Layer 2 (furniture / above-player) ---
  const c2 = createCanvas(totalW, totalH);
  const ctx2 = c2.getContext('2d');
  ctx2.drawImage(homeL2, 0, 0);
  ctx2.drawImage(condoL2, homeL1.width, condoOffsetY);

  // --- Write PNGs ---
  fs.mkdirSync(OUT_DIR, { recursive: true });

  fs.writeFileSync(path.join(OUT_DIR, 'office-layer1.png'), c1.toBuffer('image/png'));
  console.log('Wrote office-layer1.png', totalW, 'x', totalH);

  fs.writeFileSync(path.join(OUT_DIR, 'office-layer2.png'), c2.toBuffer('image/png'));
  console.log('Wrote office-layer2.png', totalW, 'x', totalH);

  // --- Generate collision data ---
  // Read layer1 pixel data to determine walkable vs blocked.
  // Transparent pixels = out-of-bounds (blocked).
  // We'll also mark a 1-tile border around the entire image as blocked.
  const imgData = ctx1.getImageData(0, 0, totalW, totalH);
  const pixels = imgData.data; // RGBA

  const tilesW = Math.ceil(totalW / TILE);
  const tilesH = Math.ceil(totalH / TILE);
  const collision = new Array(tilesW * tilesH).fill(0);

  for (let ty = 0; ty < tilesH; ty++) {
    for (let tx = 0; tx < tilesW; tx++) {
      const idx = ty * tilesW + tx;

      // Sample several points in this tile to determine if it's walkable
      let transparentCount = 0;
      let totalSamples = 0;

      for (let sy = 0; sy < TILE; sy += 4) {
        for (let sx = 0; sx < TILE; sx += 4) {
          const px = tx * TILE + sx;
          const py = ty * TILE + sy;
          if (px >= totalW || py >= totalH) {
            transparentCount++;
            totalSamples++;
            continue;
          }
          const pi = (py * totalW + px) * 4;
          const alpha = pixels[pi + 3];
          if (alpha < 30) transparentCount++;
          totalSamples++;
        }
      }

      // If more than 60% of samples are transparent, mark as blocked (out of bounds)
      if (transparentCount / totalSamples > 0.6) {
        collision[idx] = 1;
      }
    }
  }

  // Also mark the outer border walls as blocked (top 2 rows, bottom row, left col, right col)
  // Walk through and block tiles that are clearly wall pixels (non-transparent, non-floor).
  // For simplicity: block the outer 1-tile perimeter of non-transparent areas
  // and any tile in the top 3 rows that has content (walls).
  for (let tx = 0; tx < tilesW; tx++) {
    // Top 2 rows
    for (let row = 0; row < 2; row++) {
      const idx = row * tilesW + tx;
      if (collision[idx] === 0) collision[idx] = 1; // walls at top
    }
    // Bottom row
    const bottomIdx = (tilesH - 1) * tilesW + tx;
    if (collision[bottomIdx] === 0) collision[bottomIdx] = 1;
  }
  for (let ty = 0; ty < tilesH; ty++) {
    // Left col
    const leftIdx = ty * tilesW;
    if (collision[leftIdx] === 0) collision[leftIdx] = 1;
    // Right col of each room section
    // Left room right edge (tile 13 = 448/32 - 1)
    const midIdx = ty * tilesW + 13;
    if (midIdx < collision.length && collision[midIdx] === 0) collision[midIdx] = 1;
    // Right edge
    const rightIdx = ty * tilesW + (tilesW - 1);
    if (collision[rightIdx] === 0) collision[rightIdx] = 1;
  }

  // Create a doorway/opening between the two rooms at the connection point
  // Open a 2-tile-wide passage at the seam (tile column 14, around middle height)
  const seamCol = 14; // first column of the condo side
  const midRow = Math.floor(tilesH / 2);
  for (let r = midRow - 2; r <= midRow + 1; r++) {
    if (r >= 0 && r < tilesH) {
      // Open the wall columns at the seam
      collision[r * tilesW + 13] = 0;
      collision[r * tilesW + seamCol] = 0;
    }
  }

  const collisionData = {
    width: tilesW,
    height: tilesH,
    tileSize: TILE,
    imageWidth: totalW,
    imageHeight: totalH,
    data: collision,
  };

  fs.writeFileSync(
    path.join(OUT_DIR, 'office-collision.json'),
    JSON.stringify(collisionData, null, 2),
  );
  console.log('Wrote office-collision.json', tilesW, 'x', tilesH, 'tiles');
  console.log('Done!');
}

main().catch(err => { console.error(err); process.exit(1); });
