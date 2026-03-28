// ===== Damage Calculator =====

import { DAMAGE_VALUES, ACCURACY_BASE, CRIT_CHANCE, CRIT_MULTIPLIER, type DamageTier } from '../data/battleConfig';
import type { BattleFighter, Move } from '../data/battleTypes';
import { getEffectiveStats } from '../engine/StatusEngine';

export interface DamageResult {
  damage: number;
  isCrit: boolean;
  missed: boolean;
}

export function calculateDamage(
  attacker: BattleFighter,
  defender: BattleFighter,
  move: Move,
  rng: () => number,
): DamageResult {
  const tier = (move.damage ?? 'none') as DamageTier;
  const baseRange = DAMAGE_VALUES[tier];
  if (!baseRange || typeof baseRange === 'number') return { damage: 0, isCrit: false, missed: false };

  const range = baseRange as { min: number; max: number };
  let damage = range.min + Math.floor(rng() * (range.max - range.min + 1));

  // ATK/DEF modifiers
  const atkStats = getEffectiveStats(attacker);
  const defStats = getEffectiveStats(defender);
  damage = Math.floor(damage * (atkStats.atk / 80));

  // bypassDefensiveBuffs (e.g. All Hands) — ignore defender buffs
  if (!move.effect?.bypassDefensiveBuffs) {
    damage = Math.floor(damage / (defStats.def / 80));
  }

  // CK Slow Burn multiplier
  if (attacker.slowBurnMultiplier && move.category !== 'defensive') {
    damage = Math.floor(damage * attacker.slowBurnMultiplier);
    // Token consumed by engine after damage calc
  }

  // Nick Patience of a Fisherman charge
  if (attacker.chargingPatience) {
    damage = Math.floor(damage * 1.5);
    // Flag cleared by engine after damage calc
  }

  // Elena Managed Expectations — 35% proportional reduction
  const managedExp = defender.activeStatuses.find((s) => s.id === 'managed_expectations');
  if (managedExp) {
    damage = Math.floor(damage * 0.65);
  }

  // Damage reduction from defensive statuses
  const dmgReduction = defender.activeStatuses.find((s) => s.id === 'dmg_reduction');
  if (dmgReduction && !move.effect?.bypassDefensiveBuffs) {
    damage = Math.floor(damage * (1 - (dmgReduction.sourceValue ?? 0.3)));
  }

  // Luke Evergreen shield — 25% reduction, store 10%
  const evergreenShield = defender.activeStatuses.find((s) => s.id === 'evergreen_shield');
  if (evergreenShield) {
    const original = damage;
    damage = Math.floor(damage * 0.75);
    defender.evergreenStoredDamage += Math.floor(original * 0.10);
  }

  // Crit check
  const isCrit = rng() * 100 < CRIT_CHANCE;
  if (isCrit) damage = Math.floor(damage * CRIT_MULTIPLIER);

  // Accuracy check
  const acc = ACCURACY_BASE + (atkStats.acc ?? 0) - (defStats.acc ?? 0);
  if (rng() * 100 > acc) return { damage: 0, isCrit: false, missed: true };

  return { damage: Math.max(1, damage), isCrit, missed: false };
}
