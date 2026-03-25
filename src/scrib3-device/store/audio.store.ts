import { create } from 'zustand';

export type MuteMode = 'none' | 'sfx' | 'music' | 'all';

const STORAGE_KEY = 'scrib3-mute-mode';

interface AudioStore {
  muteMode: MuteMode;
  setMuteMode: (mode: MuteMode) => void;
}

export const useAudioStore = create<AudioStore>((set) => ({
  muteMode: (localStorage.getItem(STORAGE_KEY) as MuteMode) ?? 'none',
  setMuteMode: (mode) => {
    localStorage.setItem(STORAGE_KEY, mode);
    set({ muteMode: mode });
  },
}));
