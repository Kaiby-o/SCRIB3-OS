/** Layer-based avatar config (from character generator spritesheets) */
export interface LayerAvatarConfig {
  body: string;              // e.g. "body-01"
  eyes: string;              // e.g. "eyes-03"
  outfit: string;            // e.g. "outfit-05-02"
  hairstyle: string;         // e.g. "hair-12-04"
  accessories: string[];     // e.g. ["acc-03-01", "acc-15-02"]
  compositedSheet: string;   // base64 data URL of the final 96x128 spritesheet
  spriteKey?: string;        // legacy: preset character key
}

/** Legacy programmatic avatar config */
export interface LegacyAvatarConfig {
  skinTone: number;       // 0-7 index into SKIN_TONES
  hairStyle: HairStyle;
  hairColor: string;      // hex
  eyeStyle: EyeStyle;
  outfitStyle: OutfitStyle;
  outfitColor: string;    // hex
  accessory: Accessory;
  pantsStyle: PantsStyle;
  pantsColor: string;     // hex
}

/** Preset-only avatar config (just a sprite key selection) */
export interface PresetAvatarConfig {
  spriteKey: string;
}

export type AvatarConfig = LayerAvatarConfig | LegacyAvatarConfig | PresetAvatarConfig;

/** Type guard: check if config is the new layer-based system */
export function isLayerConfig(cfg: AvatarConfig | null | undefined): cfg is LayerAvatarConfig {
  return !!cfg && typeof cfg === 'object' && 'compositedSheet' in cfg && typeof (cfg as LayerAvatarConfig).compositedSheet === 'string';
}

/** Type guard: check if config is a preset sprite key */
export function isPresetConfig(cfg: AvatarConfig | null | undefined): cfg is PresetAvatarConfig {
  return !!cfg && typeof cfg === 'object' && 'spriteKey' in cfg && !('compositedSheet' in cfg);
}

export type HairStyle = 'short' | 'long' | 'mohawk' | 'buzz' | 'curly' | 'ponytail' | 'bald' | 'afro' | 'messy' | 'slicked';
export type EyeStyle = 'normal' | 'glasses' | 'sunglasses' | 'heterochromia' | 'tired' | 'wide';
export type OutfitStyle = 'tshirt' | 'hoodie' | 'suit' | 'tank' | 'polo' | 'jacket' | 'sweater' | 'dress';
export type Accessory = 'none' | 'headphones' | 'hat' | 'scarf' | 'badge' | 'earring';
export type PantsStyle = 'jeans' | 'shorts' | 'trousers' | 'skirt';

export const SKIN_TONES = [
  '#FDEBD0', '#FDBCB4', '#E8B89D', '#D4A574',
  '#C68642', '#8D5524', '#5C3A1E', '#3B2506',
];

export const HAIR_COLORS = [
  '#1A1A1A', '#3B2F2F', '#8B6914', '#C0392B',
  '#95A5A6', '#ECF0F1', '#2980B9', '#E91E8B',
  '#27AE60', '#8E44AD', '#E67E22', '#1ABC9C',
];

export const OUTFIT_COLORS = [
  '#E74C3C', '#3498DB', '#2ECC71', '#9B59B6',
  '#F39C12', '#1ABC9C', '#E67E22', '#34495E',
  '#D35400', '#8E44AD', '#16A085', '#C0392B',
];

export const PANTS_COLORS = [
  '#2C3E50', '#1A252F', '#4A5568', '#8B7355',
  '#2D3748', '#1E3A5F', '#5D4E37', '#3D3D3D',
];

export const HAIR_STYLES: { key: HairStyle; label: string }[] = [
  { key: 'short', label: 'Short' },
  { key: 'long', label: 'Long' },
  { key: 'mohawk', label: 'Mohawk' },
  { key: 'buzz', label: 'Buzz' },
  { key: 'curly', label: 'Curly' },
  { key: 'ponytail', label: 'Ponytail' },
  { key: 'bald', label: 'Bald' },
  { key: 'afro', label: 'Afro' },
  { key: 'messy', label: 'Messy' },
  { key: 'slicked', label: 'Slicked' },
];

export const EYE_STYLES: { key: EyeStyle; label: string }[] = [
  { key: 'normal', label: 'Normal' },
  { key: 'glasses', label: 'Glasses' },
  { key: 'sunglasses', label: 'Shades' },
  { key: 'heterochromia', label: 'Hetero' },
  { key: 'tired', label: 'Tired' },
  { key: 'wide', label: 'Wide' },
];

export const OUTFIT_STYLES: { key: OutfitStyle; label: string }[] = [
  { key: 'tshirt', label: 'T-Shirt' },
  { key: 'hoodie', label: 'Hoodie' },
  { key: 'suit', label: 'Suit' },
  { key: 'tank', label: 'Tank Top' },
  { key: 'polo', label: 'Polo' },
  { key: 'jacket', label: 'Jacket' },
  { key: 'sweater', label: 'Sweater' },
  { key: 'dress', label: 'Dress' },
];

export const ACCESSORIES: { key: Accessory; label: string }[] = [
  { key: 'none', label: 'None' },
  { key: 'headphones', label: 'Headphones' },
  { key: 'hat', label: 'Hat' },
  { key: 'scarf', label: 'Scarf' },
  { key: 'badge', label: 'Badge' },
  { key: 'earring', label: 'Earring' },
];

export const PANTS_STYLES: { key: PantsStyle; label: string }[] = [
  { key: 'jeans', label: 'Jeans' },
  { key: 'shorts', label: 'Shorts' },
  { key: 'trousers', label: 'Trousers' },
  { key: 'skirt', label: 'Skirt' },
];

export function defaultAvatarConfig(): LegacyAvatarConfig {
  return {
    skinTone: 1,
    hairStyle: 'short',
    hairColor: '#1A1A1A',
    eyeStyle: 'normal',
    outfitStyle: 'tshirt',
    outfitColor: '#3498DB',
    accessory: 'none',
    pantsStyle: 'jeans',
    pantsColor: '#2C3E50',
  };
}

/** Seed avatar config from a userId hash (gives deterministic defaults) */
export function seededAvatarConfig(userId: string): LegacyAvatarConfig {
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = ((hash << 5) - hash) + userId.charCodeAt(i);
    hash |= 0;
  }
  hash = Math.abs(hash);

  return {
    skinTone: hash % SKIN_TONES.length,
    hairStyle: HAIR_STYLES[hash % HAIR_STYLES.length].key,
    hairColor: HAIR_COLORS[(hash >> 4) % HAIR_COLORS.length],
    eyeStyle: 'normal',
    outfitStyle: OUTFIT_STYLES[(hash >> 8) % OUTFIT_STYLES.length].key,
    outfitColor: OUTFIT_COLORS[(hash >> 12) % OUTFIT_COLORS.length],
    accessory: 'none',
    pantsStyle: 'jeans',
    pantsColor: PANTS_COLORS[(hash >> 16) % PANTS_COLORS.length],
  };
}
