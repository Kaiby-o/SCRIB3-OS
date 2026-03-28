// ===== Cooldown Tracker =====

import type { BattleFighter } from '../data/battleTypes';

export function decrementCooldowns(fighter: BattleFighter): BattleFighter {
  for (const moveId in fighter.moveCooldowns) {
    if (fighter.moveCooldowns[moveId] > 0) {
      fighter.moveCooldowns[moveId]--;
    }
  }
  return fighter;
}

export function isOnCooldown(fighter: BattleFighter, moveId: string): boolean {
  return (fighter.moveCooldowns[moveId] ?? 0) > 0;
}

export function setCooldown(fighter: BattleFighter, moveId: string, turns: number): BattleFighter {
  fighter.moveCooldowns[moveId] = turns;
  return fighter;
}

export function getAvailableMoves(fighter: BattleFighter): typeof fighter.moves {
  return fighter.moves.filter((m) => !isOnCooldown(fighter, m.id));
}
