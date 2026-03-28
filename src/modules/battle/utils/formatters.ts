// ===== Battle Formatters =====

export function hpPercent(current: number, max: number): number {
  return Math.max(0, Math.min(100, Math.round((current / max) * 100)));
}

export function hpLevel(current: number, max: number): 'high' | 'mid' | 'low' {
  const pct = hpPercent(current, max);
  if (pct > 50) return 'high';
  if (pct > 25) return 'mid';
  return 'low';
}

export function damageDots(tier: string): string {
  switch (tier) {
    case 'low': return '●○○○';
    case 'moderate': return '●●○○';
    case 'moderate_high': return '●●●○';
    case 'high': return '●●●●';
    default: return '○○○○';
  }
}

export function spritePath(id: string, side: 'front' | 'back'): string {
  return `https://dzufyjiczbgsvjyinpks.supabase.co/storage/v1/object/public/Sprites/${side}/${id}-${side}.png`;
}

export function statusBadgeText(statusId: string): string {
  const map: Record<string, string> = {
    burn: 'BRN', sleep: 'SLP', paralysis: 'PAR', confusion: 'CNF',
    slow: 'SLW', blind: 'BLD', stun: 'STN', silenced: 'SLC',
    in_embargo: 'EMB', compound_debt: 'DBT', scandal: 'SCN',
    rumour: 'RMR', paper_cut: 'CUT', scope_creep: 'SCP',
    press_scrutiny: 'PSC', hit_piece_blowback: 'HIT', brand_violation: 'BRV',
    atk_up: 'ATK↑', def_up: 'DEF↑', spd_up: 'SPD↑',
    atk_down: 'ATK↓', def_down: 'DEF↓', spd_down: 'SPD↓',
    dmg_reduction: 'SHD', contractual: 'CTR', calendar_blocked: 'BLK',
    long_game_stored: 'LNG', easing_curve_primed: 'EAS',
    slow_burn_token: '???', evergreen_shield: 'EVG',
    managed_expectations: 'MGD',
  };
  return map[statusId] ?? statusId.slice(0, 3).toUpperCase();
}
