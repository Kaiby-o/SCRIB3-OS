import { create } from 'zustand';

export type Aesthetic = 'cyberpunk' | 'clean';

const STORAGE_KEY = 'scrib3-aesthetic';

interface SettingsStore {
  aesthetic: Aesthetic;
  setAesthetic: (a: Aesthetic) => void;
}

function applyAesthetic(a: Aesthetic) {
  document.documentElement.classList.toggle('clean-mode', a === 'clean');
}

const saved = (localStorage.getItem(STORAGE_KEY) as Aesthetic) ?? 'cyberpunk';
applyAesthetic(saved);

export const useSettingsStore = create<SettingsStore>((set) => ({
  aesthetic: saved,
  setAesthetic: (aesthetic) => {
    localStorage.setItem(STORAGE_KEY, aesthetic);
    applyAesthetic(aesthetic);
    set({ aesthetic });
  },
}));
