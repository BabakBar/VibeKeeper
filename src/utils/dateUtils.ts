/**
 * Date utility functions
 */

/**
 * Format date as YYYY-MM-DD
 */
export function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Format timestamp as readable string
 */
export function formatTime(timestamp: number): string {
  const date = new Date(timestamp);
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

/**
 * Format timestamp as full date time
 */
export function formatDateTime(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
}

/**
 * Get start of day timestamp
 */
export function getStartOfDay(date: Date = new Date()): number {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  return start.getTime();
}

/**
 * Get end of day timestamp
 */
export function getEndOfDay(date: Date = new Date()): number {
  const end = new Date(date);
  end.setHours(23, 59, 59, 999);
  return end.getTime();
}

/**
 * Get start of week timestamp
 */
export function getStartOfWeek(date: Date = new Date()): number {
  const start = new Date(date);
  const day = start.getDay();
  start.setDate(start.getDate() - day);
  start.setHours(0, 0, 0, 0);
  return start.getTime();
}

/**
 * Get end of week timestamp
 */
export function getEndOfWeek(date: Date = new Date()): number {
  const end = new Date(date);
  const day = end.getDay();
  end.setDate(end.getDate() + (6 - day));
  end.setHours(23, 59, 59, 999);
  return end.getTime();
}

/**
 * Get start of month timestamp
 */
export function getStartOfMonth(month: number = new Date().getMonth() + 1, year: number = new Date().getFullYear()): number {
  const start = new Date(year, month - 1, 1, 0, 0, 0, 0);
  return start.getTime();
}

/**
 * Get end of month timestamp
 */
export function getEndOfMonth(month: number = new Date().getMonth() + 1, year: number = new Date().getFullYear()): number {
  const end = new Date(year, month, 0, 23, 59, 59, 999);
  return end.getTime();
}

/**
 * Check if date is today
 */
export function isToday(timestamp: number): boolean {
  const date = new Date(timestamp);
  const today = new Date();
  return formatDate(date) === formatDate(today);
}

/**
 * Get days between two dates
 */
export function daysBetween(timestamp1: number, timestamp2: number): number {
  const date1 = new Date(timestamp1);
  const date2 = new Date(timestamp2);
  const diffTime = Math.abs(date2.getTime() - date1.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Get relative time string (e.g., "2 hours ago")
 */
export function getRelativeTime(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days === 1) return 'yesterday';
  if (days < 7) return `${days}d ago`;

  return formatDate(new Date(timestamp));
}
