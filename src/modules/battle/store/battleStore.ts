// ===== Battle Store =====

import { create } from 'zustand';
import type { BattleFighter, BattlePhase, Move, Fighter, RoundResult } from '../data/battleTypes';
import { initBattleFighter } from '../data/battleTypes';
import { ROLE_STAT_TIERS } from '../data/battleConfig';
import { resolveRound } from '../engine/BattleEngine';
import { selectAIMove } from '../engine/AIOpponent';
import { createRNG } from '../utils/rng';

interface BattleState {
  phase: BattlePhase;
  playerTeam: BattleFighter[];
  opponentTeam: BattleFighter[];
  activePlayer: BattleFighter | null;
  activeOpponent: BattleFighter | null;
  roundNumber: number;
  textQueue: string[];
  currentText: string;
  lastRoundResult: RoundResult | null;
  rng: () => number;
  battleSpeed: 'normal' | 'fast';

  initBattle: (playerFighters: Fighter[], opponentFighters: Fighter[]) => void;
  selectMove: (move: Move) => void;
  advanceText: () => void;
  switchFighter: (index: number) => void;
  flee: () => boolean;
  setPhase: (phase: BattlePhase) => void;
  setBattleSpeed: (speed: 'normal' | 'fast') => void;
  reset: () => void;
}

function toBattleFighter(f: Fighter): BattleFighter {
  const tier = ROLE_STAT_TIERS[f.statTier] ?? ROLE_STAT_TIERS.SPECIALIST;
  return initBattleFighter(f, tier);
}

export const useBattleStore = create<BattleState>((set, get) => ({
  phase: 'INTRO',
  playerTeam: [],
  opponentTeam: [],
  activePlayer: null,
  activeOpponent: null,
  roundNumber: 0,
  textQueue: [],
  currentText: '',
  lastRoundResult: null,
  rng: createRNG(Date.now()),
  battleSpeed: 'normal',

  initBattle: (playerFighters, opponentFighters) => {
    const pTeam = playerFighters.map(toBattleFighter);
    const oTeam = opponentFighters.map(toBattleFighter);
    pTeam[0].isActive = true;
    oTeam[0].isActive = true;

    set({
      phase: 'INTRO',
      playerTeam: pTeam,
      opponentTeam: oTeam,
      activePlayer: pTeam[0],
      activeOpponent: oTeam[0],
      roundNumber: 0,
      rng: createRNG(Date.now()),
      textQueue: [
        `${oTeam[0].name} wants to battle!`,
        `Go, ${pTeam[0].name}!`,
      ],
      currentText: `${oTeam[0].name} wants to battle!`,
    });
  },

  selectMove: (move) => {
    const { activePlayer, activeOpponent, rng, roundNumber } = get();
    if (!activePlayer || !activeOpponent) return;

    // AI selects move
    const opponentMove = selectAIMove(activeOpponent, activePlayer, rng);

    // Resolve round
    const result = resolveRound(activePlayer, activeOpponent, move, opponentMove, rng, roundNumber + 1);

    // Collect all messages
    const messages = [
      ...result.playerResult.messages,
      ...(result.opponentResult?.messages ?? []),
      ...result.statusMessages,
    ];

    // Check for faint → switch or victory/defeat
    let nextPhase: BattlePhase = 'TEXT';

    if (activeOpponent.isFainted) {
      const nextOpp = get().opponentTeam.find((f) => !f.isFainted && f.id !== activeOpponent.id);
      if (!nextOpp) {
        nextPhase = 'VICTORY';
        messages.push('You won the battle!');
      } else {
        nextOpp.isActive = true;
        messages.push(`${nextOpp.name} is sent out!`);
        set({ activeOpponent: nextOpp });
      }
    }

    if (activePlayer.isFainted) {
      const nextPlayer = get().playerTeam.find((f) => !f.isFainted && f.id !== activePlayer.id);
      if (!nextPlayer) {
        nextPhase = 'DEFEAT';
        messages.push('All your fighters fainted...');
      } else {
        nextPhase = 'PARTY_MENU';
        messages.push(`${activePlayer.name} fainted! Choose your next fighter.`);
      }
    }

    set({
      roundNumber: roundNumber + 1,
      lastRoundResult: result,
      textQueue: messages,
      currentText: messages[0] ?? '',
      phase: nextPhase,
    });
  },

  advanceText: () => {
    const { textQueue, phase } = get();
    if (textQueue.length <= 1) {
      set({ textQueue: [], currentText: '' });
      if (phase === 'TEXT' || phase === 'INTRO') {
        set({ phase: 'PLAYER_TURN' });
      }
      return;
    }
    const next = textQueue.slice(1);
    set({ textQueue: next, currentText: next[0] });
  },

  switchFighter: (index) => {
    const { playerTeam } = get();
    const fighter = playerTeam[index];
    if (!fighter || fighter.isFainted) return;

    // Deactivate current
    playerTeam.forEach((f) => (f.isActive = false));
    fighter.isActive = true;

    set({
      activePlayer: fighter,
      phase: 'TEXT',
      textQueue: [`Go, ${fighter.name}!`],
      currentText: `Go, ${fighter.name}!`,
    });
  },

  flee: () => {
    const { rng } = get();
    if (rng() < 0.5) {
      set({ phase: 'FLED', textQueue: ['Got away safely!'], currentText: 'Got away safely!' });
      return true;
    }
    set({ textQueue: ["Can't escape!"], currentText: "Can't escape!", phase: 'TEXT' });
    return false;
  },

  setPhase: (phase) => set({ phase }),
  setBattleSpeed: (battleSpeed) => set({ battleSpeed }),
  reset: () => set({ phase: 'INTRO', playerTeam: [], opponentTeam: [], activePlayer: null, activeOpponent: null, roundNumber: 0, textQueue: [], currentText: '', lastRoundResult: null }),
}));
