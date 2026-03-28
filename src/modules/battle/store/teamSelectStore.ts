// ===== Team Select Store =====

import { create } from 'zustand';
import type { Fighter } from '../data/battleTypes';

interface TeamSelectState {
  roster: Fighter[];
  playerTeam: Fighter[];
  opponentTeam: Fighter[];
  difficulty: 'easy' | 'normal' | 'hard';
  setRoster: (roster: Fighter[]) => void;
  addToTeam: (fighter: Fighter) => void;
  removeFromTeam: (fighterId: string) => void;
  reorderTeam: (fromIdx: number, toIdx: number) => void;
  setDifficulty: (d: 'easy' | 'normal' | 'hard') => void;
  generateOpponentTeam: () => void;
  randomTeam: () => void;
  confirmTeams: () => boolean;
  reset: () => void;
}

export const useTeamSelectStore = create<TeamSelectState>((set, get) => ({
  roster: [],
  playerTeam: [],
  opponentTeam: [],
  difficulty: 'normal',

  setRoster: (roster) => set({ roster }),

  addToTeam: (fighter) => {
    const { playerTeam } = get();
    if (playerTeam.length >= 6) return;
    if (playerTeam.find((f) => f.id === fighter.id)) return;
    set({ playerTeam: [...playerTeam, fighter] });
  },

  removeFromTeam: (fighterId) => {
    set((s) => ({ playerTeam: s.playerTeam.filter((f) => f.id !== fighterId) }));
  },

  reorderTeam: (fromIdx, toIdx) => {
    const team = [...get().playerTeam];
    const [moved] = team.splice(fromIdx, 1);
    team.splice(toIdx, 0, moved);
    set({ playerTeam: team });
  },

  setDifficulty: (difficulty) => set({ difficulty }),

  generateOpponentTeam: () => {
    const { roster, playerTeam, difficulty } = get();
    const available = roster.filter((f) => !playerTeam.find((p) => p.id === f.id));
    const count = difficulty === 'easy' ? 3 : 6;
    const shuffled = [...available].sort(() => Math.random() - 0.5);
    set({ opponentTeam: shuffled.slice(0, Math.min(count, shuffled.length)) });
  },

  randomTeam: () => {
    const { roster } = get();
    const shuffled = [...roster].sort(() => Math.random() - 0.5);
    set({ playerTeam: shuffled.slice(0, 6) });
  },

  confirmTeams: () => {
    const { playerTeam } = get();
    return playerTeam.length >= 1;
  },

  reset: () => set({ playerTeam: [], opponentTeam: [], difficulty: 'normal' }),
}));
