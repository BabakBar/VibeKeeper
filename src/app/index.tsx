import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { useRouter } from 'expo-router';
import { useLogStore } from '../stores/logStore';
import { useSettingsStore } from '../stores/settingsStore';
import { LogService } from '../services/logService';
import { StatisticsService } from '../services/statisticsService';
import { formatDate, formatTime, getRelativeTime } from '../utils/dateUtils';

export default function HomeScreen() {
  const router = useRouter();
  const [todayStats, setTodayStats] = useState({ total: 0, cost: 0 });
  const [summary, setSummary] = useState<any>(null);
  const [recentLogs, setRecentLogs] = useState<any[]>([]);

  const logs = useLogStore((state) => state.logs);
  const settings = useSettingsStore((state) => state.settings);

  const updateStats = useCallback(() => {
    const today = formatDate(new Date());
    const todayStats = StatisticsService.getDailyStats(today);
    setTodayStats(todayStats);

    const summary = StatisticsService.getSummaryStats();
    setSummary(summary);

    const sortedLogs = [...logs]
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 3);
    setRecentLogs(sortedLogs);
  }, [logs]);

  useFocusEffect(
    useCallback(() => {
      updateStats();
    }, [updateStats])
  );

  const handleQuickAdd = async () => {
    try {
      await LogService.quickLog();
      updateStats();
    } catch (error) {
      Alert.alert('Error', 'Failed to log cigarette');
    }
  };

  const handleDecrement = async () => {
    try {
      // Get today's logs sorted by timestamp (most recent first)
      const today = formatDate(new Date());
      const todayLogs = LogService.getLogsByDate(today)
        .sort((a, b) => b.timestamp - a.timestamp);

      if (todayLogs.length === 0) {
        Alert.alert('No logs', 'No cigarettes logged today to remove');
        return;
      }

      // Delete the most recent log from today
      await LogService.deleteLog(todayLogs[0].id);
      updateStats();
    } catch (error) {
      Alert.alert('Error', 'Failed to remove cigarette');
    }
  };

  const handleDetailedLog = () => {
    router.push('/logs?mode=add');
  };

  const formatCost = (cost: number) => {
    return `${settings?.currencySymbol || '$'}${cost.toFixed(2)}`;
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
        <Text style={styles.headerTitle}>VibeKeeper</Text>
        <Text style={styles.headerSubtitle}>Track your progress</Text>
      </View>

      {/* Today's Stats Card */}
      <View style={styles.statsCard}>
        <Text style={styles.statsTitle}>Today's Progress</Text>
        <View style={styles.statsRow}>
          <View>
            <Text style={styles.statsBig}>{todayStats.total}</Text>
            <Text style={styles.statsLabel}>cigarettes</Text>
          </View>
          <View style={styles.statsRight}>
            <Text style={styles.statsCost}>{formatCost(todayStats.cost)}</Text>
            <Text style={styles.statsLabel}>spent</Text>
          </View>
        </View>
      </View>

      {/* Quick Action Buttons */}
      <View style={styles.buttonGroup}>
        {/* Counter Display */}
        <View style={styles.counterDisplay}>
          <Text style={styles.counterLabel}>Today</Text>
          <Text style={styles.counterValue}>{todayStats.total}</Text>
        </View>

        {/* +/- Buttons Row */}
        <View style={styles.counterButtonsRow}>
          <TouchableOpacity
            onPress={handleDecrement}
            style={styles.counterButton}
          >
            <Text style={styles.counterButtonText}>-</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleQuickAdd}
            style={[styles.counterButton, styles.counterButtonPlus]}
          >
            <Text style={[styles.counterButtonText, styles.counterButtonTextPlus]}>+</Text>
          </TouchableOpacity>
        </View>

        {/* Secondary Action */}
        <TouchableOpacity
          onPress={handleDetailedLog}
          style={styles.secondaryButton}
        >
          <Text style={styles.buttonTextSecondary}>Add with Details</Text>
        </TouchableOpacity>
      </View>

      {/* Summary Stats */}
      {summary && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Summary</Text>
          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Total Logged</Text>
              <Text style={styles.summaryValue}>{summary.totalLogs}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Total Cost</Text>
              <Text style={styles.summaryValue}>
                {formatCost(summary.totalCost)}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Daily Average</Text>
              <Text style={styles.summaryValue}>
                {summary.averagePerDay.toFixed(1)}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Streak</Text>
              <Text style={styles.summaryValue}>
                {StatisticsService.getStreak()} days
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* Recent Logs */}
      {recentLogs.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Logs</Text>
          {recentLogs.map((log) => (
            <View key={log.id} style={styles.logItem}>
              <View style={styles.logContent}>
                <Text style={styles.logTime}>
                  {getRelativeTime(log.timestamp)}
                </Text>
                {log.notes && (
                  <Text style={styles.logNotes}>{log.notes}</Text>
                )}
              </View>
              <Text style={styles.logTimestamp}>{formatTime(log.timestamp)}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Navigation Footer */}
      <View style={styles.footer}>
        <TouchableOpacity
          onPress={() => router.push('/logs')}
          style={styles.footerButton}
        >
          <Text style={styles.footerText}>📋 Logs</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push('/settings')}
          style={styles.footerButton}
        >
          <Text style={styles.footerText}>⚙️ Settings</Text>
        </TouchableOpacity>
      </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#ef4444',
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    backgroundColor: '#ef4444',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  headerSubtitle: {
    color: '#fecaca',
    fontSize: 16,
  },
  statsCard: {
    marginHorizontal: 16,
    marginTop: 16,
    padding: 16,
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  statsTitle: {
    color: '#4b5563',
    fontWeight: '600',
    fontSize: 16,
    marginBottom: 12,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statsBig: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#ef4444',
  },
  statsLabel: {
    color: '#4b5563',
    marginTop: 4,
  },
  statsRight: {
    alignItems: 'flex-end',
  },
  statsCost: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  buttonGroup: {
    marginHorizontal: 16,
    marginTop: 24,
    gap: 16,
  },
  counterDisplay: {
    backgroundColor: '#f3f4f6',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e5e7eb',
  },
  counterLabel: {
    fontSize: 16,
    color: '#6b7280',
    fontWeight: '600',
    marginBottom: 8,
  },
  counterValue: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#ef4444',
  },
  counterButtonsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  counterButton: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#d1d5db',
    minHeight: 80,
  },
  counterButtonPlus: {
    backgroundColor: '#ef4444',
    borderColor: '#dc2626',
  },
  counterButtonText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  counterButtonTextPlus: {
    color: '#fff',
  },
  secondaryButton: {
    backgroundColor: '#e5e7eb',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonTextSecondary: {
    color: '#1f2937',
    fontWeight: '600',
    fontSize: 14,
  },
  section: {
    marginHorizontal: 16,
    marginTop: 24,
  },
  sectionTitle: {
    color: '#1f2937',
    fontWeight: '600',
    fontSize: 18,
    marginBottom: 12,
  },
  summaryCard: {
    backgroundColor: '#f3f4f6',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  summaryLabel: {
    color: '#4b5563',
    fontSize: 15,
  },
  summaryValue: {
    fontWeight: '600',
    color: '#1f2937',
    fontSize: 15,
  },
  logItem: {
    backgroundColor: '#f3f4f6',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logContent: {
    flex: 1,
  },
  logTime: {
    color: '#4b5563',
    fontSize: 12,
  },
  logNotes: {
    color: '#1f2937',
    marginTop: 4,
  },
  logTimestamp: {
    color: '#9ca3af',
    fontSize: 12,
    marginLeft: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 20,
    paddingBottom: 24,
    backgroundColor: '#f3f4f6',
    marginTop: 32,
    gap: 16,
  },
  footerButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginHorizontal: 8,
    minHeight: 44,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  footerText: {
    color: '#1f2937',
    fontWeight: '600',
    fontSize: 16,
  },
});
