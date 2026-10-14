import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

const THEME_STORAGE_KEY = '@goodjob_theme_mode';

export interface ThemeColors {
  isDark: boolean;
  background: string;
  surface: string;
  surfaceLow: string;
  surfaceVariant: string;
  card: string;
  text: string;
  textPrimary: string;
  textSecondary: string;
  border: string;
  inputBg: string;
  primary: string;
  onPrimary: string;
  primaryLight: string;
  error: string;
  errorBg: string;
  success: string;
  successBg: string;
  warning: string;
  star: string;
  tabBarBg: string;
  tabBarBorder: string;
  statusBar: 'light-content' | 'dark-content';
}

export const lightColors: ThemeColors = {
  isDark: false,
  background: '#F9F9FB',
  surface: '#FFFFFF',
  surfaceLow: '#F3F3F5',
  surfaceVariant: '#E2E2E4',
  card: '#FFFFFF',
  text: '#111827',
  textPrimary: '#1A1C1D',
  textSecondary: '#6B7280',
  border: '#E5E7EB',
  inputBg: '#F9FAFB',
  primary: '#000000',
  onPrimary: '#FFFFFF',
  primaryLight: '#F3F4F6',
  error: '#DC2626',
  errorBg: '#FEE2E2',
  success: '#10B981',
  successBg: '#DCFCE7',
  warning: '#F59E0B',
  star: '#FBBF24',
  tabBarBg: '#FFFFFF',
  tabBarBorder: '#E5E7EB',
  statusBar: 'dark-content',
};

export const darkColors: ThemeColors = {
  isDark: true,
  background: '#121214',
  surface: '#1E1E22',
  surfaceLow: '#26262B',
  surfaceVariant: '#323238',
  card: '#1E1E22',
  text: '#F3F4F6',
  textPrimary: '#F9FAFB',
  textSecondary: '#9CA3AF',
  border: '#2E2E35',
  inputBg: '#26262B',
  primary: '#FFFFFF',
  onPrimary: '#000000',
  primaryLight: '#26262B',
  error: '#EF4444',
  errorBg: '#3F1E1E',
  success: '#10B981',
  successBg: '#064E3B',
  warning: '#FBBF24',
  star: '#FBBF24',
  tabBarBg: '#18181B',
  tabBarBorder: '#27272A',
  statusBar: 'light-content',
};

interface ThemeState {
  isDark: boolean;
  colors: ThemeColors;
  toggleTheme: () => Promise<void>;
  setTheme: (isDark: boolean) => Promise<void>;
  initTheme: () => Promise<void>;
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  isDark: false,
  colors: lightColors,
  toggleTheme: async () => {
    const nextDark = !get().isDark;
    set({
      isDark: nextDark,
      colors: nextDark ? darkColors : lightColors,
    });
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, nextDark ? 'dark' : 'light');
    } catch (e) {
      console.warn('Error saving theme preference:', e);
    }
  },
  setTheme: async (isDark: boolean) => {
    set({
      isDark,
      colors: isDark ? darkColors : lightColors,
    });
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, isDark ? 'dark' : 'light');
    } catch (e) {
      console.warn('Error saving theme preference:', e);
    }
  },
  initTheme: async () => {
    try {
      const saved = await AsyncStorage.getItem(THEME_STORAGE_KEY);
      if (saved === 'dark') {
        set({ isDark: true, colors: darkColors });
      } else if (saved === 'light') {
        set({ isDark: false, colors: lightColors });
      }
    } catch (e) {
      console.warn('Error reading theme preference:', e);
    }
  },
}));
