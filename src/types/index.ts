// Cigarette Log Types
export interface CigaretteLog {
  id: string;
  timestamp: number; // Unix timestamp
  notes?: string;
  time?: string; // HH:mm format for when they smoked it
  createdAt: number;
  updatedAt: number;
}

// Statistics Types
export interface DailyStats {
  date: string; // YYYY-MM-DD
  total: number;
  cost: number;
}

export interface WeeklyStats {
  week: number;
  year: number;
  total: number;
  dailyBreakdown: DailyStats[];
  average: number;
  cost: number;
}

export interface MonthlyStats {
  month: number;
  year: number;
  total: number;
  dailyBreakdown: DailyStats[];
  weeklyBreakdown: WeeklyStats[];
  average: number;
  cost: number;
}

// Settings Types
export interface Settings {
  id: string;
  costPerCigarette: number; // in cents/smallest currency unit
  currencySymbol: string; // $ £ € ¥
  dailyGoal?: number;
  notificationsEnabled: boolean;
  createdAt: number;
  updatedAt: number;
}

// Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
