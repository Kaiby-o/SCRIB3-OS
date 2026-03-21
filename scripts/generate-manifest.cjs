#!/usr/bin/env node
/**
 * generate-manifest.cjs
 * Scans character-layer PNG directories and outputs manifest.json
 */

const fs = require('fs');
const path = require('path');

const BASE = path.join(__dirname, '..', 'public', 'assets', 'office', 'character-layers');

function pngs(dir) {
  const full = path.join(BASE, dir);
  if (!fs.existsSync(full)) return [];
  return fs.readdirSync(full).filter(f => f.endsWith('.png')).sort();
}

// ── Bodies ──
const bodies = pngs('bodies').map((file, i) => ({
  id: `body-${String(i + 1).padStart(2, '0')}`,
  file: `bodies/${file}`,
  label: `Skin ${i + 1}`,
}));

// ── Eyes ──
const eyes = pngs('eyes').map((file, i) => ({
  id: `eyes-${String(i + 1).padStart(2, '0')}`,
  file: `eyes/${file}`,
  label: `Eyes ${i + 1}`,
}));

// ── Outfits ── grouped by style number
const outfitLabels = {
  1: 'Basic Tee',
  2: 'Collared Shirt',
  3: 'Dress Shirt',
  4: 'Tank Top',
  5: 'V-Neck',
  6: 'Polo',
  7: 'Hoodie',
  8: 'Sweater',
  9: 'Jacket',
  10: 'Blazer',
  11: 'Vest',
  12: 'Lab Coat',
  13: 'Overalls',
  14: 'Uniform',
  15: 'Apron',
  16: 'Crop Top',
  17: 'Long Sleeve',
  18: 'Turtleneck',
  19: 'Cardigan',
  20: 'Flannel',
  21: 'Denim Jacket',
  22: 'Leather Jacket',
  23: 'Bomber',
  24: 'Parka',
  25: 'Raincoat',
  26: 'Suit Jacket',
  27: 'Dress',
  28: 'Jumpsuit',
  29: 'Athletic',
  30: 'Hawaiian Shirt',
  31: 'Poncho',
  32: 'Cape',
  33: 'Toga',
};

const outfitFiles = pngs('outfits');
const outfitMap = {};
for (const file of outfitFiles) {
  // Outfit_01_32x32_01.png → style=1, colorIndex=1
  const m = file.match(/Outfit_(\d+)_32x32_(\d+)\.png/);
  if (!m) continue;
  const style = parseInt(m[1], 10);
  const colorIdx = parseInt(m[2], 10);
  if (!outfitMap[style]) outfitMap[style] = [];
  outfitMap[style].push({
    id: `outfit-${String(style).padStart(2, '0')}-${String(colorIdx).padStart(2, '0')}`,
    file: `outfits/${file}`,
    colorIndex: colorIdx,
  });
}

const outfits = Object.keys(outfitMap)
  .map(Number)
  .sort((a, b) => a - b)
  .map(style => ({
    style,
    label: outfitLabels[style] || `Style ${style}`,
    variants: outfitMap[style].sort((a, b) => a.colorIndex - b.colorIndex),
  }));

// ── Hairstyles ── grouped by style number
const hairLabels = {
  1: 'Short Crop',
  2: 'Side Part',
  3: 'Spiky',
  4: 'Bowl Cut',
  5: 'Wavy',
  6: 'Long Straight',
  7: 'Ponytail',
  8: 'Pigtails',
  9: 'Bun',
  10: 'Afro',
  11: 'Braids',
  12: 'Mohawk',
  13: 'Undercut',
  14: 'Curly',
  15: 'Messy',
  16: 'Slicked Back',
  17: 'Bob',
  18: 'Pixie',
  19: 'Shaggy',
  20: 'Buzz Cut',
  21: 'Dreadlocks',
  22: 'Twin Tails',
  23: 'Side Shave',
  24: 'Bangs',
  25: 'Mullet',
  26: 'High Pony',
  27: 'Cornrows',
  28: 'Top Knot',
  29: 'Feathered',
};

const hairFiles = pngs('hairstyles');
const hairMap = {};
for (const file of hairFiles) {
  // Hairstyle_01_32x32_01.png → style=1, colorIndex=1
  const m = file.match(/Hairstyle_(\d+)_32x32_(\d+)\.png/);
  if (!m) continue;
  const style = parseInt(m[1], 10);
  const colorIdx = parseInt(m[2], 10);
  if (!hairMap[style]) hairMap[style] = [];
  hairMap[style].push({
    id: `hair-${String(style).padStart(2, '0')}-${String(colorIdx).padStart(2, '0')}`,
    file: `hairstyles/${file}`,
    colorIndex: colorIdx,
  });
}

const hairstyles = Object.keys(hairMap)
  .map(Number)
  .sort((a, b) => a - b)
  .map(style => ({
    style,
    label: hairLabels[style] || `Style ${style}`,
    variants: hairMap[style].sort((a, b) => a.colorIndex - b.colorIndex),
  }));

// ── Accessories ── grouped by style number, name extracted from filename
const accFiles = pngs('accessories');
const accMap = {};
for (const file of accFiles) {
  // Accessory_01_Ladybug_32x32_01.png → style=1, name=Ladybug, colorIndex=1
  const m = file.match(/Accessory_(\d+)_(.+?)_32x32_(\d+)\.png/);
  if (!m) continue;
  const style = parseInt(m[1], 10);
  const name = m[2].replace(/_/g, ' ');
  const colorIdx = parseInt(m[3], 10);
  if (!accMap[style]) accMap[style] = { name, variants: [] };
  accMap[style].variants.push({
    id: `acc-${String(style).padStart(2, '0')}-${String(colorIdx).padStart(2, '0')}`,
    file: `accessories/${file}`,
    colorIndex: colorIdx,
  });
}

const accessories = Object.keys(accMap)
  .map(Number)
  .sort((a, b) => a - b)
  .map(style => ({
    style,
    name: accMap[style].name,
    variants: accMap[style].variants.sort((a, b) => a.colorIndex - b.colorIndex),
  }));

// ── Write manifest ──
const manifest = { bodies, eyes, outfits, hairstyles, accessories };
const outPath = path.join(BASE, 'manifest.json');
fs.writeFileSync(outPath, JSON.stringify(manifest, null, 2));
console.log(`Wrote manifest.json with:`);
console.log(`  ${bodies.length} bodies`);
console.log(`  ${eyes.length} eyes`);
console.log(`  ${outfits.length} outfit styles (${outfitFiles.length} variants)`);
console.log(`  ${hairstyles.length} hairstyle styles (${hairFiles.length} variants)`);
console.log(`  ${accessories.length} accessory types (${accFiles.length} variants)`);
