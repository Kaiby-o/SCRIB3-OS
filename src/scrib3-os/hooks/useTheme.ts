import { create } from 'zustand';

type Theme = 'light' | 'dark';

interface ThemeState {
  theme: Theme;
  toggle: () => void;
  set: (theme: Theme) => void;
}

export const useThemeStore = create<ThemeState>((set) => ({
  theme: (localStorage.getItem('scrib3-theme') as Theme) || 'light',

  toggle: () =>
    set((state) => {
      const next = state.theme === 'light' ? 'dark' : 'light';
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem('scrib3-theme', next);
      return { theme: next };
    }),

  set: (theme: Theme) => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('scrib3-theme', theme);
    set({ theme });
  },
}));
