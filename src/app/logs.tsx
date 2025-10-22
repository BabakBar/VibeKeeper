import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  TextInput,
  Modal,
  StyleSheet,
} from 'react-native';
import { useRouter, useSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { useLogStore } from '../stores/logStore';
import { LogService } from '../services/logService';
import { formatDate, formatTime, getRelativeTime } from '../utils/dateUtils';

export default function LogsScreen() {
  const router = useRouter();
  const params = useSearchParams();
  const [selectedDate, setSelectedDate] = useState(formatDate(new Date()));
  const [showAddModal, setShowAddModal] = useState(params.mode === 'add');
  const [notes, setNotes] = useState('');
  const [time, setTime] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const logs = useLogStore((state) => state.logs);
  const logsForDate = useLogStore((state) => state.getLogsByDate(selectedDate));

  useFocusEffect(
    useCallback(() => {
      // Refresh logs
    }, [])
  );

  const handleAddLog = async () => {
    try {
      setIsLoading(true);

      let timestamp = new Date().getTime();
      if (time) {
        const [hours, minutes] = time.split(':').map(Number);
        const newDate = new Date();
        newDate.setHours(hours, minutes, 0, 0);
        timestamp = newDate.getTime();
      }

      await LogService.addLog({
        timestamp,
        notes: notes || undefined,
        time: time || undefined,
      });

      setNotes('');
      setTime('');
      setShowAddModal(false);
      Alert.alert('Success', 'Log added successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to add log');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteLog = (logId: string) => {
    Alert.alert('Delete', 'Are you sure?', [
      {
        text: 'Cancel',
        onPress: () => {},
      },
      {
        text: 'Delete',
        onPress: async () => {
          try {
            await LogService.deleteLog(logId);
            Alert.alert('Success', 'Log deleted');
          } catch (error) {
            Alert.alert('Error', 'Failed to delete log');
          }
        },
      },
    ]);
  };

  const previousDate = () => {
    const date = new Date(selectedDate);
    date.setDate(date.getDate() - 1);
    setSelectedDate(formatDate(date));
  };

  const nextDate = () => {
    const date = new Date(selectedDate);
    date.setDate(date.getDate() + 1);
    setSelectedDate(formatDate(date));
  };

  const goToToday = () => {
    setSelectedDate(formatDate(new Date()));
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Logs</Text>
      </View>

      {/* Date Navigation */}
      <View style={styles.dateNav}>
        <TouchableOpacity onPress={previousDate} style={styles.navButton}>
          <Text style={styles.navButtonText}>← Prev</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={goToToday} style={styles.dateCenter}>
          <Text style={styles.dateText}>{selectedDate}</Text>
          <Text style={styles.dateCigarettes}>
            {logsForDate.length} cigarettes
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={nextDate} style={styles.navButton}>
          <Text style={styles.navButtonText}>Next →</Text>
        </TouchableOpacity>
      </View>

      {/* Logs List */}
      <ScrollView style={styles.logsList}>
        {logsForDate.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No logs for this date</Text>
          </View>
        ) : (
          logsForDate.map((log) => (
            <View key={log.id} style={styles.logItem}>
              <View style={styles.logItemContent}>
                <Text style={styles.logItemTime}>{formatTime(log.timestamp)}</Text>
                {log.notes && (
                  <Text style={styles.logItemNotes}>{log.notes}</Text>
                )}
                <Text style={styles.logItemRelative}>
                  {getRelativeTime(log.timestamp)}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => handleDeleteLog(log.id)}
                style={styles.deleteButton}
              >
                <Text style={styles.deleteButtonText}>×</Text>
              </TouchableOpacity>
            </View>
          ))
        )}
      </ScrollView>

      {/* Add Button */}
      <TouchableOpacity
        onPress={() => setShowAddModal(true)}
        style={styles.addButton}
      >
        <Text style={styles.addButtonText}>+ Add Log</Text>
      </TouchableOpacity>

      {/* Add Log Modal */}
      <Modal visible={showAddModal} animationType="slide" presentationStyle="formSheet">
        <View style={styles.modal}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Add Log</Text>
            <TouchableOpacity onPress={() => setShowAddModal(false)}>
              <Text style={styles.modalClose}>Done</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Time (HH:mm)</Text>
              <TextInput
                placeholder="14:30"
                value={time}
                onChangeText={setTime}
                style={styles.formInput}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Notes (optional)</Text>
              <TextInput
                placeholder="Add any notes..."
                value={notes}
                onChangeText={setNotes}
                multiline
                numberOfLines={4}
                style={[styles.formInput, styles.formInputMulti]}
              />
            </View>

            <TouchableOpacity
              onPress={handleAddLog}
              disabled={isLoading}
              style={styles.submitButton}
            >
              <Text style={styles.submitButtonText}>
                {isLoading ? 'Adding...' : 'Add Log'}
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  dateNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: '#f3f4f6',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  navButton: {
    paddingHorizontal: 8,
  },
  navButtonText: {
    color: '#3b82f6',
    fontWeight: 'bold',
  },
  dateCenter: {
    flex: 1,
    alignItems: 'center',
  },
  dateText: {
    color: '#1f2937',
    fontWeight: '600',
  },
  dateCigarettes: {
    color: '#4b5563',
    fontSize: 12,
    marginTop: 2,
  },
  logsList: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
  },
  emptyText: {
    color: '#9ca3af',
    fontSize: 16,
  },
  logItem: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logItemContent: {
    flex: 1,
  },
  logItemTime: {
    color: '#1f2937',
    fontWeight: '600',
  },
  logItemNotes: {
    color: '#4b5563',
    fontSize: 12,
    marginTop: 4,
  },
  logItemRelative: {
    color: '#9ca3af',
    fontSize: 10,
    marginTop: 4,
  },
  deleteButton: {
    marginLeft: 8,
    paddingHorizontal: 8,
  },
  deleteButtonText: {
    color: '#ef4444',
    fontWeight: 'bold',
    fontSize: 20,
  },
  addButton: {
    backgroundColor: '#3b82f6',
    marginHorizontal: 16,
    marginBottom: 16,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  modal: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalHeader: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalClose: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  modalContent: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  formGroup: {
    marginBottom: 16,
  },
  formLabel: {
    color: '#1f2937',
    fontWeight: '600',
    marginBottom: 8,
  },
  formInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#f3f4f6',
  },
  formInputMulti: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: '#3b82f6',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
