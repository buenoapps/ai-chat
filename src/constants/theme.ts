/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import '@/global.css';

import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: '#11181C',
    background: '#ffffff',
    backgroundElement: '#F2F3F5',
    backgroundSelected: '#E6E8EB',
    textSecondary: '#60646C',
    tint: '#3c87f7',
    tintText: '#ffffff',
    border: '#E2E4E9',
    bubbleUser: '#3c87f7',
    bubbleUserText: '#ffffff',
    bubbleAssistant: '#F2F3F5',
    bubbleAssistantText: '#11181C',
    danger: '#E5484D',
    overlay: 'rgba(0,0,0,0.45)',
  },
  dark: {
    text: '#ECEDEE',
    background: '#000000',
    backgroundElement: '#1A1B1E',
    backgroundSelected: '#2A2C30',
    textSecondary: '#9BA1A6',
    tint: '#4f93f8',
    tintText: '#ffffff',
    border: '#26282C',
    bubbleUser: '#3c87f7',
    bubbleUserText: '#ffffff',
    bubbleAssistant: '#1F2023',
    bubbleAssistantText: '#ECEDEE',
    danger: '#FF6369',
    overlay: 'rgba(0,0,0,0.6)',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

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
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
