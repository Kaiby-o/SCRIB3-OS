// ===== Battle Types =====

export type StatusID =
  | 'burn' | 'sleep' | 'paralysis' | 'confusion' | 'slow' | 'blind'
  | 'stun' | 'silenced' | 'in_embargo' | 'compound_debt' | 'scandal'
  | 'rumour' | 'paper_cut' | 'scope_creep' | 'press_scrutiny'
  | 'hit_piece_blowback' | 'brand_violation'
  | 'atk_up' | 'def_up' | 'spd_up' | 'atk_down' | 'def_down' | 'spd_down'
  | 'dmg_reduction' | 'contractual' | 'calendar_blocked'
  | 'long_game_stored' | 'easing_curve_primed' | 'slow_burn_token'
  | 'evergreen_shield' | 'managed_expectations';

export interface ActiveStatus {
  id: StatusID;
  turnsRemaining: number;
  sourceValue?: number;
  sourceMove?: string;
}

export interface Fighter {
  id: string;
  name: string;
  title: string;
  role: string;
  statTier: string;
  roleColor: string;
  moves: Move[];
}

export interface Move {
  id: string;
  name: string;
  category: 'special' | 'basic' | 'defensive';
  damage: string; // DamageTier
  cooldown: number;
  description: string;
  narrativeOnUse: string;
  narrativeOnHit?: string;
  effect?: MoveEffect;
}

export interface MoveEffect {
  status?: StatusID;
  statusDuration?: number;
  statusValue?: number;
  selfStatus?: StatusID;
  selfStatusDuration?: number;
  selfHealPercent?: number;
  bypassCounters?: boolean;
  bypassDefensiveBuffs?: boolean;
  dmgReductionPercent?: number;
  special?: string; // custom effect handler ID
}

export interface BattleFighter extends Fighter {
  currentHP: number;
  maxHP: number;
  stats: { hp: number; atk: number; def: number; spd: number };
  activeStatuses: ActiveStatus[];
  moveCooldowns: Record<string, number>;
  isFainted: boolean;
  isActive: boolean;
  lastMove: Move | null;
  lastDefensiveMove: Move | null;
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
  move: Move;
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

export function initBattleFighter(fighter: Fighter, stats: { hp: number; atk: number; def: number; spd: number }): BattleFighter {
  return {
    ...fighter,
    currentHP: stats.hp,
    maxHP: stats.hp,
    stats: { ...stats },
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
