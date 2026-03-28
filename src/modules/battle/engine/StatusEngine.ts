// ===== Status Engine =====

import type { BattleFighter, StatusID } from '../data/battleTypes';

export function applyStatus(fighter: BattleFighter, statusId: StatusID, options: { duration?: number; sourceValue?: number; sourceMove?: string } = {}): BattleFighter {
  // Don't stack — reset timer if already active
  const existing = fighter.activeStatuses.find((s) => s.id === statusId);
  if (existing) {
    existing.turnsRemaining = options.duration ?? existing.turnsRemaining;
    if (options.sourceValue !== undefined) existing.sourceValue = options.sourceValue;
    return fighter;
  }
  fighter.activeStatuses.push({
    id: statusId,
    turnsRemaining: options.duration ?? 2,
    sourceValue: options.sourceValue,
    sourceMove: options.sourceMove,
  });
  return fighter;
}

export function clearStatus(fighter: BattleFighter, statusId: StatusID): BattleFighter {
  fighter.activeStatuses = fighter.activeStatuses.filter((s) => s.id !== statusId);
  return fighter;
}

export function clearOneDebuff(fighter: BattleFighter): BattleFighter {
  const debuffs: StatusID[] = ['burn', 'sleep', 'paralysis', 'confusion', 'slow', 'blind', 'stun', 'silenced', 'in_embargo', 'compound_debt', 'scandal', 'rumour', 'paper_cut', 'scope_creep', 'press_scrutiny', 'hit_piece_blowback', 'brand_violation', 'atk_down', 'def_down', 'spd_down'];
  const idx = fighter.activeStatuses.findIndex((s) => debuffs.includes(s.id));
  if (idx >= 0) fighter.activeStatuses.splice(idx, 1);
  return fighter;
}

export function clearAllDebuffs(fighter: BattleFighter): BattleFighter {
  const buffs: StatusID[] = ['atk_up', 'def_up', 'spd_up', 'dmg_reduction', 'slow_burn_token', 'evergreen_shield', 'long_game_stored', 'easing_curve_primed', 'managed_expectations'];
  fighter.activeStatuses = fighter.activeStatuses.filter((s) => buffs.includes(s.id));
  return fighter;
}

export function hasStatus(fighter: BattleFighter, statusId: StatusID): boolean {
  return fighter.activeStatuses.some((s) => s.id === statusId);
}

export function isIncapacitated(fighter: BattleFighter): { blocked: boolean; reason: string } {
  if (hasStatus(fighter, 'stun')) return { blocked: true, reason: `${fighter.name} is stunned!` };
  if (hasStatus(fighter, 'in_embargo')) return { blocked: true, reason: `${fighter.name} is under embargo!` };
  if (hasStatus(fighter, 'sleep')) return { blocked: true, reason: `${fighter.name} is asleep!` };
  if (hasStatus(fighter, 'calendar_blocked')) return { blocked: true, reason: `${fighter.name}'s calendar is blocked!` };
  return { blocked: false, reason: '' };
}

export function tickStatuses(fighter: BattleFighter): { updatedFighter: BattleFighter; tickMessages: string[] } {
  const messages: string[] = [];
  const toRemove: StatusID[] = [];

  for (const status of fighter.activeStatuses) {
    // DoT effects
    switch (status.id) {
      case 'burn': {
        const dmg = Math.floor(fighter.maxHP * 0.06);
        fighter.currentHP = Math.max(0, fighter.currentHP - dmg);
        messages.push(`${fighter.name} took ${dmg} burn damage!`);
        break;
      }
      case 'compound_debt': {
        const dmg = Math.floor(fighter.maxHP * 0.05);
        fighter.currentHP = Math.max(0, fighter.currentHP - dmg);
        messages.push(`${fighter.name} took ${dmg} from compound debt!`);
        break;
      }
      case 'scandal':
      case 'rumour': {
        const dmg = Math.floor(fighter.maxHP * 0.08);
        fighter.currentHP = Math.max(0, fighter.currentHP - dmg);
        messages.push(`${fighter.name} took ${dmg} from ${status.id}!`);
        break;
      }
      case 'paper_cut': {
        const dmg = Math.floor(fighter.maxHP * 0.05);
        fighter.currentHP = Math.max(0, fighter.currentHP - dmg);
        messages.push(`${fighter.name} took ${dmg} from paper cuts!`);
        break;
      }
      case 'scope_creep': {
        const baseDmg = 16; // moderate base
        const factor = status.sourceValue ?? 1;
        const dmg = Math.floor(baseDmg * factor);
        fighter.currentHP = Math.max(0, fighter.currentHP - dmg);
        messages.push(`Scope creep dealt ${dmg} damage!`);
        // Compound for next tick
        if (status.sourceValue) status.sourceValue = Math.min(status.sourceValue * 1.5, 3);
        break;
      }
      case 'sleep': {
        // Sleep drain for Haley's Calming Presence
        const dmg = Math.floor(fighter.maxHP * 0.05);
        fighter.currentHP = Math.max(0, fighter.currentHP - dmg);
        messages.push(`${fighter.name} lost ${dmg} HP while sleeping!`);
        break;
      }
    }

    // Decrement
    if (status.turnsRemaining !== 99) {
      status.turnsRemaining--;
      if (status.turnsRemaining <= 0) {
        toRemove.push(status.id);
        messages.push(`${fighter.name}'s ${status.id.replace(/_/g, ' ')} wore off.`);
      }
    }
  }

  fighter.activeStatuses = fighter.activeStatuses.filter((s) => !toRemove.includes(s.id));
  fighter.isFainted = fighter.currentHP <= 0;

  return { updatedFighter: fighter, tickMessages: messages };
}

export function getEffectiveStats(fighter: BattleFighter): { atk: number; def: number; spd: number; acc: number } {
  let atk = fighter.stats.atk;
  let def = fighter.stats.def;
  let spd = fighter.stats.spd;
  let acc = 0;

  for (const status of fighter.activeStatuses) {
    switch (status.id) {
      case 'atk_up': atk = Math.floor(atk * 1.15); break;
      case 'atk_down':
      case 'brand_violation': atk = Math.floor(atk * 0.80); break;
      case 'def_up': def = Math.floor(def * 1.15); break;
      case 'def_down': def = Math.floor(def * 0.80); break;
      case 'spd_up': spd = Math.floor(spd * 1.15); break;
      case 'spd_down':
      case 'slow': spd = Math.floor(spd * 0.80); break;
      case 'blind': acc -= 20; break;
      case 'confusion': acc -= 15; break;
      case 'paralysis': spd = Math.floor(spd * 0.5); break;
    }
  }

  return { atk, def, spd, acc };
}
