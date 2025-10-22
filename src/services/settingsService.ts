import { db } from '../db';
import { settings as settingsTable } from '../db/schema';
import { useSettingsStore } from '../stores/settingsStore';
import { Settings } from '../types';
import { eq } from 'drizzle-orm';

const SETTINGS_ID = 'default_settings';

/**
 * SettingsService handles all settings operations
 */
export class SettingsService {
  /**
   * Load settings from database
   */
  static async loadSettings(): Promise<Settings> {
    try {
      useSettingsStore.setState({ isLoading: true, error: null });

      // Try to fetch existing settings
      let settings = await db
        .select()
        .from(settingsTable)
        .where(eq(settingsTable.id, SETTINGS_ID))
        .all() as any[];

      // If no settings exist, create default ones
      if (!settings || settings.length === 0) {
        settings = await this.createDefaultSettings();
      }

      const formattedSettings: Settings = {
        id: settings[0].id,
        costPerCigarette: settings[0].cost_per_cigarette,
        currencySymbol: settings[0].currency_symbol,
        dailyGoal: settings[0].daily_goal || undefined,
        notificationsEnabled: settings[0].notifications_enabled === 1,
        createdAt: settings[0].created_at,
        updatedAt: settings[0].updated_at,
      };

      useSettingsStore.setState({ settings: formattedSettings });
      return formattedSettings;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load settings';
      useSettingsStore.setState({ error: errorMessage });
      throw error;
    } finally {
      useSettingsStore.setState({ isLoading: false });
    }
  }

  /**
   * Create default settings
   */
  private static async createDefaultSettings(): Promise<any[]> {
    const now = Date.now();

    await db.insert(settingsTable).values({
      id: SETTINGS_ID,
      cost_per_cigarette: 0.5,
      currency_symbol: '$',
      daily_goal: null,
      notifications_enabled: 1,
      created_at: now,
      updated_at: now,
    } as any);

    return db
      .select()
      .from(settingsTable)
      .where(eq(settingsTable.id, SETTINGS_ID))
      .all() as Promise<any[]>;
  }

  /**
   * Update settings
   */
  static async updateSettings(
    updates: Partial<Settings>
  ): Promise<Settings> {
    try {
      useSettingsStore.setState({ isLoading: true, error: null });

      const now = Date.now();

      // Update in database
      await db
        .update(settingsTable)
        .set({
          cost_per_cigarette: updates.costPerCigarette,
          currency_symbol: updates.currencySymbol,
          daily_goal: updates.dailyGoal || null,
          notifications_enabled: updates.notificationsEnabled ? 1 : 0,
          updated_at: now,
        } as any)
        .where(eq(settingsTable.id, SETTINGS_ID))
        .run();

      // Get updated settings
      const result = await db
        .select()
        .from(settingsTable)
        .where(eq(settingsTable.id, SETTINGS_ID))
        .all() as any[];

      const formattedSettings: Settings = {
        id: result[0].id,
        costPerCigarette: result[0].cost_per_cigarette,
        currencySymbol: result[0].currency_symbol,
        dailyGoal: result[0].daily_goal || undefined,
        notificationsEnabled: result[0].notifications_enabled === 1,
        createdAt: result[0].created_at,
        updatedAt: result[0].updated_at,
      };

      useSettingsStore.setState({ settings: formattedSettings });
      return formattedSettings;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update settings';
      useSettingsStore.setState({ error: errorMessage });
      throw error;
    } finally {
      useSettingsStore.setState({ isLoading: false });
    }
  }

  /**
   * Update a single setting value
   */
  static async updateSetting(
    key: keyof Settings,
    value: any
  ): Promise<Settings> {
    const currentSettings = useSettingsStore.getState().settings;
    if (!currentSettings) {
      throw new Error('Settings not loaded');
    }

    const updates: Partial<Settings> = { [key]: value };
    return this.updateSettings(updates);
  }

  /**
   * Reset to default settings
   */
  static async resetSettings(): Promise<Settings> {
    const now = Date.now();

    await db
      .update(settingsTable)
      .set({
        cost_per_cigarette: 0.5,
        currency_symbol: '$',
        daily_goal: null,
        notifications_enabled: 1,
        updated_at: now,
      } as any)
      .where(eq(settingsTable.id, SETTINGS_ID))
      .run();

    return this.loadSettings();
  }
}
