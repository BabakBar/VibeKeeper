import { create } from 'zustand';
import { Settings } from '../types';

interface SettingsStore {
  settings: Settings | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  setSettings: (settings: Settings) => void;
  updateSettings: (updates: Partial<Settings>) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  // Getters
  getCostPerCigarette: () => number;
  getCurrencySymbol: () => string;
  getDailyGoal: () => number | undefined;
  isNotificationsEnabled: () => boolean;
}

export const useSettingsStore = create<SettingsStore>((set, get) => ({
  settings: null,
  isLoading: false,
  error: null,

  setSettings: (settings) => set({ settings }),

  updateSettings: (updates) => set((state) => {
    if (!state.settings) return state;
    return {
      settings: {
        ...state.settings,
        ...updates,
        updatedAt: Date.now(),
      },
    };
  }),

  setLoading: (loading) => set({ isLoading: loading }),

  setError: (error) => set({ error }),

  getCostPerCigarette: () => {
    const state = get();
    return state.settings?.costPerCigarette ?? 7.5;
  },

  getCurrencySymbol: () => {
    const state = get();
    return state.settings?.currencySymbol ?? '€';
  },

  getDailyGoal: () => {
    const state = get();
    return state.settings?.dailyGoal;
  },

  isNotificationsEnabled: () => {
    const state = get();
    return state.settings?.notificationsEnabled ?? true;
  },
}));
