/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native';
import { Palette } from '@/constants/palettes';

const tintColorLight = '#1447e6';
const tintColorDark = '#fff';

export const Colors = {
  light: {
    text: '#17142b',
    background: '#f7f6fc',
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
    primary: '#6a45f5',
    muted: '#6b6785',
    mutedIcon: '#6b6785',
    border: '#e7e4f3',
    inputBorder: 'rgba(0,0,0,0.3)',
    placeholder: 'gray',
    danger: '#dc2626',
    success: '#059669',
    link: '#6a45f5',
    surface: '#ffffff',
    cancelButton: '#e7e4f3',
    bar: '#ffffff',
  },
  dark: {
    text: '#f4f2ff',
    background: '#0b0914',
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
    primary: '#9a7fff',
    muted: '#a29dc0',
    mutedIcon: '#a29dc0',
    border: '#2c2848',
    inputBorder: 'rgba(255,255,255,0.3)',
    placeholder: '#9BA1A6',
    danger: '#f87171',
    success: '#34d399',
    link: '#9a7fff',
    surface: '#1b1830',
    cancelButton: '#2c2848',
    bar: '#100e1d',
  },
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});

/** The light or dark colours with a palette's brand colour applied. */
export const buildTheme = (scheme: 'light' | 'dark', palette: Palette) => {
  const base = Colors[scheme];
  if (scheme === 'dark') {
    return {
      ...base,
      background: palette.ink[950],
      primary: palette.primary[400],
      link: palette.primary[400],
      border: palette.ink[700],
      surface: palette.ink[800],
      cancelButton: palette.ink[700],
      bar: palette.ink[900],
    };
  }
  return {
    ...base,
    background: palette.canvas,
    primary: palette.primary[600],
    link: palette.primary[600],
    tint: palette.primary[600],
    border: palette.border,
    cancelButton: palette.border,
  };
};
