import { create } from 'zustand';
import { CigaretteLog as ILogType } from '../types';

interface LogStore {
  logs: ILogType[];
  isLoading: boolean;
  error: string | null;

  // Actions
  setLogs: (logs: ILogType[]) => void;
  addLog: (log: ILogType) => void;
  removeLog: (id: string) => void;
  updateLog: (id: string, log: Partial<ILogType>) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearLogs: () => void;

  // Query actions
  getLogsByDate: (date: string) => ILogType[];
  getLogsInRange: (startTime: number, endTime: number) => ILogType[];
}

export const useLogStore = create<LogStore>((set, get) => ({
  logs: [],
  isLoading: false,
  error: null,

  setLogs: (logs) => set({ logs }),

  addLog: (log) => set((state) => ({
    logs: [...state.logs, log],
  })),

  removeLog: (id) => set((state) => ({
    logs: state.logs.filter((log) => log.id !== id),
  })),

  updateLog: (id, updates) => set((state) => ({
    logs: state.logs.map((log) =>
      log.id === id ? { ...log, ...updates, updatedAt: Date.now() } : log
    ),
  })),

  setLoading: (loading) => set({ isLoading: loading }),

  setError: (error) => set({ error }),

  clearLogs: () => set({ logs: [] }),

  getLogsByDate: (date: string) => {
    const state = get();
    const [year, month, day] = date.split('-').map(Number);
    const startOfDay = new Date(year, month - 1, day, 0, 0, 0).getTime();
    const endOfDay = new Date(year, month - 1, day, 23, 59, 59).getTime();

    return state.logs.filter(
      (log) => log.timestamp >= startOfDay && log.timestamp <= endOfDay
    );
  },

  getLogsInRange: (startTime: number, endTime: number) => {
    const state = get();
    return state.logs.filter(
      (log) => log.timestamp >= startTime && log.timestamp <= endTime
    );
  },
}));
