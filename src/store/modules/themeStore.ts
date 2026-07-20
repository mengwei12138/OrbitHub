import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import type { ThemeState } from '../types';

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: 'light',
      language: 'zh-CN',

      setTheme: (theme) => set({ theme }),

      setLanguage: (language) => set({ language }),
    }),
    {
      name: 'theme-storage',
    },
  ),
);
