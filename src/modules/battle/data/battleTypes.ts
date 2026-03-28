// ===== Battle Types =====

import type { Fighter as BaseFighter, Move as BaseMove, FighterStats, StatusID as BaseStatusID } from './fighters';

// Re-export for convenience
export type Fighter = BaseFighter;
export type Move = BaseMove;
export type StatusID = BaseStatusID | 'dmg_reduction' | 'contractual' | 'calendar_blocked'
  | 'long_game_stored' | 'easing_curve_primed' | 'slow_burn_token'
  | 'evergreen_shield' | 'managed_expectations'
  | 'atk_up' | 'def_up' | 'spd_up' | 'atk_down' | 'def_down' | 'spd_down';

export interface ActiveStatus {
  id: StatusID;
  turnsRemaining: number;
  sourceValue?: number;
  sourceMove?: string;
}

export interface BattleFighter {
  // From Fighter
  id: string;
  name: string;
  role: string;
  email: string;
  timezone: string;
  roleColor: string;
  moves: BaseMove[];

  // Battle state
  currentHP: number;
  maxHP: number;
  stats: FighterStats;
  activeStatuses: ActiveStatus[];
  moveCooldowns: Record<string, number>;
  isFainted: boolean;
  isActive: boolean;
  lastMove: BaseMove | null;
  lastDefensiveMove: BaseMove | null;
  lastMoveDamageDealt: number;
  turnsSurvived: number;
  chargingPatience: boolean;
  slowBurnMultiplier: number | null;
  longGameStoredDamage: number;
  evergreenStoredDamage: number;
  embargoUseCount: number;
  damageReductionThisTurn: number;
}

export type BattlePhase =
  | 'INTRO' | 'PLAYER_TURN' | 'OPPONENT_TURN' | 'RESOLVING'
  | 'TEXT' | 'SWITCH_IN' | 'PARTY_MENU' | 'VICTORY' | 'DEFEAT' | 'FLED';

export interface TurnResult {
  attacker: BattleFighter;
  defender: BattleFighter;
  move: BaseMove;
  damage: number;
  isCrit: boolean;
  missed: boolean;
  messages: string[];
  defenderFainted: boolean;
}

export interface RoundResult {
  playerResult: TurnResult;
  opponentResult: TurnResult | null;
  statusMessages: string[];
  roundNumber: number;
}

export function initBattleFighter(fighter: BaseFighter): BattleFighter {
  return {
    id: fighter.id,
    name: fighter.name,
    role: fighter.role,
    email: fighter.email,
    timezone: fighter.timezone,
    roleColor: fighter.roleColor,
    moves: fighter.moves,
    currentHP: fighter.stats.hp,
    maxHP: fighter.stats.hp,
    stats: { ...fighter.stats },
    activeStatuses: [],
    moveCooldowns: Object.fromEntries(fighter.moves.map((m) => [m.id, 0])),
    isFainted: false,
    isActive: false,
    lastMove: null,
    lastDefensiveMove: null,
    lastMoveDamageDealt: 0,
    turnsSurvived: 0,
    chargingPatience: false,
    slowBurnMultiplier: null,
    longGameStoredDamage: 0,
    evergreenStoredDamage: 0,
    embargoUseCount: 0,
    damageReductionThisTurn: 0,
  };
}
