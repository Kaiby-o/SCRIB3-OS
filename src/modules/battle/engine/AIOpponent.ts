// ===== AI Opponent =====
// Tier 1 AI: weighted random move selection

import type { BattleFighter, Move } from '../data/battleTypes';
import { getAvailableMoves } from './CooldownTracker';
import { hasStatus } from './StatusEngine';
import { weightedPick, randPick } from '../utils/rng';

export function selectAIMove(fighter: BattleFighter, opponent: BattleFighter, rng: () => number): Move {
  const available = getAvailableMoves(fighter);
  if (available.length === 0) return fighter.moves[0]; // fallback

  // Silenced check — can't use special
  const usable = hasStatus(fighter, 'silenced')
    ? available.filter((m) => m.category !== 'special')
    : available;

  if (usable.length === 0) return fighter.moves[0];

  // CK override: prioritise Creative Direction if available
  if (fighter.id === 'ck') {
    const cd = usable.find((m) => m.id === 'creative_direction');
    if (cd) return cd;
  }

  const specials = usable.filter((m) => m.category === 'special');
  const basics = usable.filter((m) => m.category === 'basic');
  const defensives = usable.filter((m) => m.category === 'defensive');

  const opponentHpPct = opponent.currentHP / opponent.maxHP;
  const ownHpPct = fighter.currentHP / fighter.maxHP;
  const hasNegativeStatus = fighter.activeStatuses.some((s) =>
    ['burn', 'confusion', 'slow', 'blind', 'paralysis', 'compound_debt', 'scandal', 'paper_cut'].includes(s.id)
  );

  // Weighted selection per spec: 40/30/15/15
  const choices: { item: Move; weight: number }[] = [];

  // Special: 40% if available and opponent HP > 50%
  if (specials.length > 0 && opponentHpPct > 0.5) {
    choices.push({ item: randPick(rng, specials), weight: 40 });
  } else if (specials.length > 0) {
    choices.push({ item: randPick(rng, specials), weight: 20 });
  }

  // Basic: 30%
  if (basics.length > 0) {
    choices.push({ item: randPick(rng, basics), weight: 30 });
  }

  // Defensive: 15% normally, higher if low HP or has debuff
  if (defensives.length > 0) {
    const defWeight = (ownHpPct < 0.4 || hasNegativeStatus) ? 35 : 15;
    choices.push({ item: randPick(rng, defensives), weight: defWeight });
  }

  // Random: 15%
  choices.push({ item: randPick(rng, usable), weight: 15 });

  return weightedPick(rng, choices);
}
