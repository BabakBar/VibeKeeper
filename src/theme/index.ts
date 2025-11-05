/**
 * VibeKeeper Theme System
 *
 * Centralized theme exports and theme provider
 */

import { lightColors, darkColors, ColorScheme } from './colors';
import { fontFamily, fontSize, fontWeight, lineHeight, textStyles, TextStyle } from './typography';
import { spacing, borderRadius, borderWidth, shadows, Shadow } from './spacing';

export interface Theme {
  colors: ColorScheme;
  fontFamily: typeof fontFamily;
  fontSize: typeof fontSize;
  fontWeight: typeof fontWeight;
  lineHeight: typeof lineHeight;
  textStyles: typeof textStyles;
  spacing: typeof spacing;
  borderRadius: typeof borderRadius;
  borderWidth: typeof borderWidth;
  shadows: typeof shadows;
  isDark: boolean;
}

export const lightTheme: Theme = {
  colors: lightColors,
  fontFamily,
  fontSize,
  fontWeight,
  lineHeight,
  textStyles,
  spacing,
  borderRadius,
  borderWidth,
  shadows,
  isDark: false,
};

export const darkTheme: Theme = {
  colors: darkColors,
  fontFamily,
  fontSize,
  fontWeight,
  lineHeight,
  textStyles,
  spacing,
  borderRadius,
  borderWidth,
  shadows,
  isDark: true,
};

// Re-export everything
export {
  lightColors,
  darkColors,
  fontFamily,
  fontSize,
  fontWeight,
  lineHeight,
  textStyles,
  spacing,
  borderRadius,
  borderWidth,
  shadows,
};

export type { ColorScheme, TextStyle, Shadow };
