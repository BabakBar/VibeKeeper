/**
 * Unit tests for settingsStore (Zustand)
 *
 * Tests store actions, getters, and state updates
 * Verifies immutability and default value handling
 */

import { useSettingsStore } from '../../../src/stores/settingsStore';
import { Settings } from '../../../src/types';
import { createMockSettings } from '../../helpers/mockData';
import { resetStores } from '../../helpers/testUtils';

describe('useSettingsStore', () => {
  beforeEach(() => {
    resetStores();
  });

  describe('initial state', () => {
    it('has null settings initially', () => {
      const state = useSettingsStore.getState();
      expect(state.settings).toBeNull();
    });

    it('has isLoading false initially', () => {
      const state = useSettingsStore.getState();
      expect(state.isLoading).toBe(false);
    });

    it('has error null initially', () => {
      const state = useSettingsStore.getState();
      expect(state.error).toBeNull();
    });
  });

  describe('setSettings', () => {
    it('sets settings object', () => {
      const settings = createMockSettings();
      useSettingsStore.getState().setSettings(settings);

      expect(useSettingsStore.getState().settings).toEqual(settings);
    });

    it('replaces existing settings', () => {
      const settings1 = createMockSettings({ costPerCigarette: 0.5 });
      const settings2 = createMockSettings({ costPerCigarette: 1.0 });

      useSettingsStore.getState().setSettings(settings1);
      expect(useSettingsStore.getState().settings?.costPerCigarette).toBe(0.5);

      useSettingsStore.getState().setSettings(settings2);
      expect(useSettingsStore.getState().settings?.costPerCigarette).toBe(1.0);
    });

    it('stores full settings object', () => {
      const settings = createMockSettings({
        costPerCigarette: 0.75,
        currencySymbol: '€',
        dailyGoal: 5,
        notificationsEnabled: false,
      });

      useSettingsStore.getState().setSettings(settings);
      const stored = useSettingsStore.getState().settings;

      expect(stored).toBeDefined();
      expect(stored?.costPerCigarette).toBe(0.75);
      expect(stored?.currencySymbol).toBe('€');
      expect(stored?.dailyGoal).toBe(5);
      expect(stored?.notificationsEnabled).toBe(false);
    });
  });

  describe('updateSettings', () => {
    it('updates single setting property', () => {
      const settings = createMockSettings({ costPerCigarette: 0.5 });
      useSettingsStore.getState().setSettings(settings);

      useSettingsStore.getState().updateSettings({ costPerCigarette: 1.0 });

      const updated = useSettingsStore.getState().settings;
      expect(updated?.costPerCigarette).toBe(1.0);
    });

    it('preserves other properties when updating', () => {
      const settings = createMockSettings({
        costPerCigarette: 0.5,
        currencySymbol: '$',
        dailyGoal: 10,
      });
      useSettingsStore.getState().setSettings(settings);

      useSettingsStore.getState().updateSettings({ costPerCigarette: 1.0 });

      const updated = useSettingsStore.getState().settings;
      expect(updated?.costPerCigarette).toBe(1.0);
      expect(updated?.currencySymbol).toBe('$');
      expect(updated?.dailyGoal).toBe(10);
    });

    it('updates multiple properties at once', () => {
      const settings = createMockSettings();
      useSettingsStore.getState().setSettings(settings);

      useSettingsStore.getState().updateSettings({
        costPerCigarette: 2.0,
        currencySymbol: '£',
        notificationsEnabled: false,
      });

      const updated = useSettingsStore.getState().settings;
      expect(updated?.costPerCigarette).toBe(2.0);
      expect(updated?.currencySymbol).toBe('£');
      expect(updated?.notificationsEnabled).toBe(false);
    });

    it('updates updatedAt timestamp on change', () => {
      const settings = createMockSettings();
      useSettingsStore.getState().setSettings(settings);
      const oldUpdatedAt = settings.updatedAt;

      jest.advanceTimersByTime(100);

      useSettingsStore.getState().updateSettings({ costPerCigarette: 1.0 });

      const updated = useSettingsStore.getState().settings;
      expect(updated?.updatedAt).toBeGreaterThan(oldUpdatedAt);
    });

    it('maintains immutability when updating', () => {
      const settings = createMockSettings();
      useSettingsStore.getState().setSettings(settings);

      const settingsBefore = useSettingsStore.getState().settings;
      useSettingsStore.getState().updateSettings({ costPerCigarette: 1.0 });
      const settingsAfter = useSettingsStore.getState().settings;

      expect(settingsBefore).not.toBe(settingsAfter);
    });

    it('does nothing if settings is null', () => {
      // Settings is null initially
      useSettingsStore.getState().updateSettings({ costPerCigarette: 1.0 });

      expect(useSettingsStore.getState().settings).toBeNull();
    });

    it('does not mutate original object', () => {
      const settings = createMockSettings({ costPerCigarette: 0.5 });
      useSettingsStore.getState().setSettings(settings);

      useSettingsStore.getState().updateSettings({ costPerCigarette: 1.0 });

      expect(settings.costPerCigarette).toBe(0.5); // Original unchanged
    });

    it('preserves id and createdAt', () => {
      const settings = createMockSettings({
        costPerCigarette: 0.5,
      });
      useSettingsStore.getState().setSettings(settings);

      useSettingsStore.getState().updateSettings({ costPerCigarette: 1.0 });

      const updated = useSettingsStore.getState().settings;
      expect(updated?.id).toBe(settings.id);
      expect(updated?.createdAt).toBe(settings.createdAt);
    });
  });

  describe('setLoading', () => {
    it('sets loading state to true', () => {
      useSettingsStore.getState().setLoading(true);
      expect(useSettingsStore.getState().isLoading).toBe(true);
    });

    it('sets loading state to false', () => {
      useSettingsStore.getState().setLoading(true);
      useSettingsStore.getState().setLoading(false);
      expect(useSettingsStore.getState().isLoading).toBe(false);
    });

    it('does not affect settings', () => {
      const settings = createMockSettings();
      useSettingsStore.getState().setSettings(settings);

      useSettingsStore.getState().setLoading(true);
      expect(useSettingsStore.getState().settings).toEqual(settings);
    });
  });

  describe('setError', () => {
    it('sets error message', () => {
      useSettingsStore.getState().setError('Test error');
      expect(useSettingsStore.getState().error).toBe('Test error');
    });

    it('clears error with null', () => {
      useSettingsStore.getState().setError('Test error');
      useSettingsStore.getState().setError(null);
      expect(useSettingsStore.getState().error).toBeNull();
    });

    it('does not affect settings', () => {
      const settings = createMockSettings();
      useSettingsStore.getState().setSettings(settings);

      useSettingsStore.getState().setError('Some error');
      expect(useSettingsStore.getState().settings).toEqual(settings);
    });
  });

  describe('getCostPerCigarette (getter)', () => {
    it('returns cost from settings', () => {
      const settings = createMockSettings({ costPerCigarette: 0.75 });
      useSettingsStore.getState().setSettings(settings);

      const cost = useSettingsStore.getState().getCostPerCigarette();
      expect(cost).toBe(0.75);
    });

    it('returns default 0.5 when settings is null', () => {
      // Settings is null initially
      const cost = useSettingsStore.getState().getCostPerCigarette();
      expect(cost).toBe(0.5);
    });

    it('returns default 0.5 when costPerCigarette is undefined', () => {
      // Create settings without costPerCigarette property
      const settings = createMockSettings();
      const settingsWithoutCost: Settings = {
        ...settings,
        costPerCigarette: undefined as any,
      };
      useSettingsStore.getState().setSettings(settingsWithoutCost);

      const cost = useSettingsStore.getState().getCostPerCigarette();
      expect(cost).toBe(0.5);
    });

    it('handles zero cost', () => {
      const settings = createMockSettings({ costPerCigarette: 0 });
      useSettingsStore.getState().setSettings(settings);

      const cost = useSettingsStore.getState().getCostPerCigarette();
      expect(cost).toBe(0);
    });

    it('handles large cost values', () => {
      const settings = createMockSettings({ costPerCigarette: 10.5 });
      useSettingsStore.getState().setSettings(settings);

      const cost = useSettingsStore.getState().getCostPerCigarette();
      expect(cost).toBe(10.5);
    });
  });

  describe('getCurrencySymbol (getter)', () => {
    it('returns currency symbol from settings', () => {
      const settings = createMockSettings({ currencySymbol: '€' });
      useSettingsStore.getState().setSettings(settings);

      const symbol = useSettingsStore.getState().getCurrencySymbol();
      expect(symbol).toBe('€');
    });

    it('returns default $ when settings is null', () => {
      const symbol = useSettingsStore.getState().getCurrencySymbol();
      expect(symbol).toBe('$');
    });

    it('returns default $ when currencySymbol is undefined', () => {
      const settings = createMockSettings();
      const settingsWithoutSymbol: Settings = {
        ...settings,
        currencySymbol: undefined as any,
      };
      useSettingsStore.getState().setSettings(settingsWithoutSymbol);

      const symbol = useSettingsStore.getState().getCurrencySymbol();
      expect(symbol).toBe('$');
    });

    it('handles different currency symbols', () => {
      const symbols = ['$', '€', '£', '¥'];

      symbols.forEach(symbol => {
        resetStores();
        const settings = createMockSettings({ currencySymbol: symbol });
        useSettingsStore.getState().setSettings(settings);

        expect(useSettingsStore.getState().getCurrencySymbol()).toBe(symbol);
      });
    });
  });

  describe('getDailyGoal (getter)', () => {
    it('returns daily goal from settings', () => {
      const settings = createMockSettings({ dailyGoal: 5 });
      useSettingsStore.getState().setSettings(settings);

      const goal = useSettingsStore.getState().getDailyGoal();
      expect(goal).toBe(5);
    });

    it('returns undefined when settings is null', () => {
      const goal = useSettingsStore.getState().getDailyGoal();
      expect(goal).toBeUndefined();
    });

    it('returns undefined when dailyGoal is not set', () => {
      const settings = createMockSettings({ dailyGoal: undefined });
      useSettingsStore.getState().setSettings(settings);

      const goal = useSettingsStore.getState().getDailyGoal();
      expect(goal).toBeUndefined();
    });

    it('handles zero daily goal', () => {
      const settings = createMockSettings({ dailyGoal: 0 });
      useSettingsStore.getState().setSettings(settings);

      const goal = useSettingsStore.getState().getDailyGoal();
      expect(goal).toBe(0);
    });

    it('handles large daily goal values', () => {
      const settings = createMockSettings({ dailyGoal: 100 });
      useSettingsStore.getState().setSettings(settings);

      const goal = useSettingsStore.getState().getDailyGoal();
      expect(goal).toBe(100);
    });
  });

  describe('isNotificationsEnabled (getter)', () => {
    it('returns true when notifications enabled', () => {
      const settings = createMockSettings({ notificationsEnabled: true });
      useSettingsStore.getState().setSettings(settings);

      const enabled = useSettingsStore.getState().isNotificationsEnabled();
      expect(enabled).toBe(true);
    });

    it('returns false when notifications disabled', () => {
      const settings = createMockSettings({ notificationsEnabled: false });
      useSettingsStore.getState().setSettings(settings);

      const enabled = useSettingsStore.getState().isNotificationsEnabled();
      expect(enabled).toBe(false);
    });

    it('returns true (default) when settings is null', () => {
      const enabled = useSettingsStore.getState().isNotificationsEnabled();
      expect(enabled).toBe(true);
    });

    it('returns true (default) when notificationsEnabled is undefined', () => {
      const settings = createMockSettings();
      const settingsWithoutNotifications: Settings = {
        ...settings,
        notificationsEnabled: undefined as any,
      };
      useSettingsStore.getState().setSettings(settingsWithoutNotifications);

      const enabled = useSettingsStore.getState().isNotificationsEnabled();
      expect(enabled).toBe(true);
    });
  });

  describe('getter interaction', () => {
    it('all getters work together', () => {
      const settings = createMockSettings({
        costPerCigarette: 1.5,
        currencySymbol: '£',
        dailyGoal: 8,
        notificationsEnabled: false,
      });
      useSettingsStore.getState().setSettings(settings);

      const state = useSettingsStore.getState();
      expect(state.getCostPerCigarette()).toBe(1.5);
      expect(state.getCurrencySymbol()).toBe('£');
      expect(state.getDailyGoal()).toBe(8);
      expect(state.isNotificationsEnabled()).toBe(false);
    });

    it('getters reflect updates immediately', () => {
      const settings = createMockSettings({ costPerCigarette: 0.5 });
      useSettingsStore.getState().setSettings(settings);

      expect(useSettingsStore.getState().getCostPerCigarette()).toBe(0.5);

      useSettingsStore.getState().updateSettings({ costPerCigarette: 2.0 });

      expect(useSettingsStore.getState().getCostPerCigarette()).toBe(2.0);
    });
  });

  describe('state isolation between tests', () => {
    it('resetStores clears all state', () => {
      const settings = createMockSettings();
      useSettingsStore.getState().setSettings(settings);
      useSettingsStore.getState().setLoading(true);
      useSettingsStore.getState().setError('Test error');

      resetStores();

      const state = useSettingsStore.getState();
      expect(state.settings).toBeNull();
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
    });
  });

  describe('complex state scenarios', () => {
    it('handles loading, error, and settings together', () => {
      const settings = createMockSettings();

      useSettingsStore.getState().setLoading(true);
      useSettingsStore.getState().setError(null);

      useSettingsStore.getState().setSettings(settings);
      useSettingsStore.getState().setLoading(false);

      const state = useSettingsStore.getState();
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
      expect(state.settings).toEqual(settings);
    });

    it('recovers from error state', () => {
      useSettingsStore.getState().setError('Initial error');
      const settings = createMockSettings();

      useSettingsStore.getState().setSettings(settings);
      useSettingsStore.getState().setError(null);

      const state = useSettingsStore.getState();
      expect(state.error).toBeNull();
      expect(state.settings).toEqual(settings);
    });
  });
});
