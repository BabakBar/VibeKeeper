import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  TextInput,
  StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { useSettingsStore } from '../stores/settingsStore';
import { SettingsService } from '../services/settingsService';

export default function SettingsScreen() {
  const router = useRouter();
  const settings = useSettingsStore((state) => state.settings);
  const [costPerCigarette, setCostPerCigarette] = useState(
    (settings?.costPerCigarette ?? 0.5).toString()
  );
  const [currencySymbol, setCurrencySymbol] = useState(
    settings?.currencySymbol ?? '$'
  );
  const [dailyGoal, setDailyGoal] = useState(
    settings?.dailyGoal?.toString() ?? ''
  );
  const [isLoading, setIsLoading] = useState(false);

  useFocusEffect(
    useCallback(() => {
      if (settings) {
        setCostPerCigarette((settings.costPerCigarette ?? 0.5).toString());
        setCurrencySymbol(settings.currencySymbol ?? '$');
        setDailyGoal(settings.dailyGoal?.toString() ?? '');
      }
    }, [settings])
  );

  const handleSaveSettings = async () => {
    try {
      setIsLoading(true);

      await SettingsService.updateSettings({
        costPerCigarette: parseFloat(costPerCigarette) || 0.5,
        currencySymbol,
        dailyGoal: dailyGoal ? parseInt(dailyGoal) : undefined,
      });

      Alert.alert('Success', 'Settings saved');
    } catch (error) {
      Alert.alert('Error', 'Failed to save settings');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    Alert.alert('Reset', 'Reset all settings to defaults?', [
      {
        text: 'Cancel',
        onPress: () => {},
      },
      {
        text: 'Reset',
        onPress: async () => {
          try {
            await SettingsService.resetSettings();
            Alert.alert('Success', 'Settings reset to defaults');
          } catch (error) {
            Alert.alert('Error', 'Failed to reset settings');
          }
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Settings</Text>
      </View>

      <ScrollView style={styles.content}>
        {/* Pricing Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Pricing</Text>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Cost per Cigarette</Text>
            <View style={styles.costRow}>
              <TextInput
                placeholder="0.50"
                value={costPerCigarette}
                onChangeText={setCostPerCigarette}
                keyboardType="decimal-pad"
                style={[styles.input, styles.costInput]}
              />
              <TextInput
                placeholder="$"
                value={currencySymbol}
                onChangeText={setCurrencySymbol}
                maxLength={1}
                style={[styles.input, styles.currencyInput]}
              />
            </View>
            <Text style={styles.hint}>
              Example: {currencySymbol || '$'}
              {parseFloat(costPerCigarette) || 0.5}
            </Text>
          </View>
        </View>

        {/* Goals Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Goals</Text>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Daily Goal (optional)</Text>
            <TextInput
              placeholder="Leave empty for no limit"
              value={dailyGoal}
              onChangeText={setDailyGoal}
              keyboardType="number-pad"
              style={styles.input}
            />
            <Text style={styles.hint}>Set a target number of cigarettes per day</Text>
          </View>
        </View>

        {/* About Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>

          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>VibeKeeper</Text>
            <Text style={styles.infoDescription}>
              Privacy-first cigarette consumption tracker
            </Text>
            <Text style={styles.infoVersion}>Version 1.0.0</Text>
            <Text style={styles.infoNote}>
              All data is stored locally on your device. No cloud sync required.
            </Text>
          </View>
        </View>

        {/* Data Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data</Text>

          <TouchableOpacity onPress={handleReset} style={styles.dangerButton}>
            <Text style={styles.dangerButtonText}>Reset to Defaults</Text>
          </TouchableOpacity>
        </View>

        {/* Save Button */}
        <TouchableOpacity
          onPress={handleSaveSettings}
          disabled={isLoading}
          style={styles.saveButton}
        >
          <Text style={styles.saveButtonText}>
            {isLoading ? 'Saving...' : 'Save Settings'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    backgroundColor: '#10b981',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    color: '#1f2937',
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 16,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    color: '#374151',
    fontWeight: '600',
    marginBottom: 8,
  },
  costRow: {
    flexDirection: 'row',
    gap: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#f3f4f6',
  },
  costInput: {
    flex: 1,
  },
  currencyInput: {
    width: 50,
    textAlign: 'center',
  },
  hint: {
    color: '#9ca3af',
    fontSize: 12,
    marginTop: 8,
  },
  infoCard: {
    backgroundColor: '#f3f4f6',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  infoTitle: {
    color: '#374151',
    fontWeight: '600',
    marginBottom: 8,
  },
  infoDescription: {
    color: '#4b5563',
    fontSize: 13,
  },
  infoVersion: {
    color: '#4b5563',
    fontSize: 12,
    marginTop: 8,
  },
  infoNote: {
    color: '#9ca3af',
    fontSize: 11,
    marginTop: 8,
    fontStyle: 'italic',
  },
  dangerButton: {
    backgroundColor: '#fee2e2',
    borderWidth: 1,
    borderColor: '#fca5a5',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  dangerButtonText: {
    color: '#b91c1c',
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: '#10b981',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 24,
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
