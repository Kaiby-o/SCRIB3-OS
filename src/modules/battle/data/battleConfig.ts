// ===== SCRIB3 Battle Config =====
// Stat tiers, damage values, and core constants

export const ROLE_STAT_TIERS: Record<string, { hp: number; atk: number; def: number; spd: number }> = {
  FOUNDER:    { hp: 240, atk: 85,  def: 80,  spd: 70  },
  VP:         { hp: 220, atk: 90,  def: 75,  spd: 75  },
  CCO:        { hp: 230, atk: 88,  def: 78,  spd: 73  },
  DIRECTOR:   { hp: 200, atk: 85,  def: 70,  spd: 80  },
  SENIOR:     { hp: 190, atk: 80,  def: 65,  spd: 85  },
  MANAGER:    { hp: 180, atk: 78,  def: 60,  spd: 88  },
  SPECIALIST: { hp: 170, atk: 82,  def: 55,  spd: 90  },
  ADVISOR:    { hp: 195, atk: 88,  def: 58,  spd: 84  },
};

export type DamageTier = 'none' | 'low' | 'moderate' | 'moderate_high' | 'high';

export const DAMAGE_VALUES: Record<DamageTier, { min: number; max: number } | 0> = {
  none:          0,
  low:           { min: 8,  max: 14 },
  moderate:      { min: 16, max: 26 },
  moderate_high: { min: 22, max: 34 },
  high:          { min: 28, max: 42 },
};

export const ACCURACY_BASE = 90;
export const CRIT_CHANCE = 6.25;
export const CRIT_MULTIPLIER = 1.5;

export const STATUS_DURATION_DEFAULTS: Record<string, number> = {
  burn: 3,
  sleep: 2,
  paralysis: 2,
  confusion: 2,
  slow: 2,
  blind: 2,
  stun: 1,
  silenced: 2,
  in_embargo: 1,
  compound_debt: 3,
  scandal: 3,
  rumour: 3,
  paper_cut: 3,
  scope_creep: 3,
  press_scrutiny: 2,
  hit_piece_blowback: 2,
  brand_violation: 2,
  atk_up: 2,
  def_up: 2,
  spd_up: 2,
  atk_down: 2,
  def_down: 2,
  spd_down: 2,
  dmg_reduction: 1,
  contractual: 2,
  calendar_blocked: 1,
  long_game_stored: 1,
  easing_curve_primed: 1,
  slow_burn_token: 99,
  evergreen_shield: 1,
};

// Sprite base URL
export const SPRITE_BASE = 'https://dzufyjiczbgsvjyinpks.supabase.co/storage/v1/object/public/Sprites';

// Battle level (cosmetic)
export const FIGHTER_LEVEL = 50;
