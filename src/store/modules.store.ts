import { create } from 'zustand';

interface ModulesStore {
  activeModules: string[];
  activateModule: (moduleId: string) => void;
  deactivateModule: (moduleId: string) => void;
}

export const useModulesStore = create<ModulesStore>((set) => ({
  activeModules: [],

  activateModule: (moduleId: string) =>
    set((state) => ({
      activeModules: state.activeModules.includes(moduleId)
        ? state.activeModules
        : [...state.activeModules, moduleId],
    })),

  deactivateModule: (moduleId: string) =>
    set((state) => ({
      activeModules: state.activeModules.filter((id) => id !== moduleId),
    })),
}));
