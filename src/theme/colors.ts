/**
 * VibeKeeper Color System
 *
 * Defines all colors used in the app for light and dark modes
 */

export const lightColors = {
  // Brand
  primary: '#ef4444',
  primaryLight: '#fecaca',
  primaryDark: '#b91c1c',

  // Backgrounds
  background: '#ffffff',
  surface: '#f3f4f6',
  surfaceVariant: '#e5e7eb',

  // Text
  text: '#1f2937',
  textSecondary: '#4b5563',
  textTertiary: '#9ca3af',
  textInverse: '#ffffff',

  // Semantic
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3b82f6',

  // UI Elements
  border: '#d1d5db',
  divider: '#e5e7eb',
  disabled: '#d1d5db',
  placeholder: '#9ca3af',

  // Overlays
  overlay: 'rgba(0, 0, 0, 0.5)',
  scrim: 'rgba(0, 0, 0, 0.3)',
};

export const darkColors = {
  // Brand
  primary: '#f87171',
  primaryLight: '#fca5a5',
  primaryDark: '#ef4444',

  // Backgrounds
  background: '#171717',
  surface: '#262626',
  surfaceVariant: '#404040',

  // Text
  text: '#f5f5f5',
  textSecondary: '#d4d4d4',
  textTertiary: '#a3a3a3',
  textInverse: '#171717',

  // Semantic
  success: '#34d399',
  warning: '#fbbf24',
  error: '#f87171',
  info: '#60a5fa',

  // UI Elements
  border: '#525252',
  divider: '#404040',
  disabled: '#525252',
  placeholder: '#737373',

  // Overlays
  overlay: 'rgba(0, 0, 0, 0.7)',
  scrim: 'rgba(0, 0, 0, 0.5)',
};

export type ColorScheme = typeof lightColors;
