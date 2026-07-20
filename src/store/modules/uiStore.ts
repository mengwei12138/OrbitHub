import { create } from 'zustand';

import type { UIState } from '../types';

export const useUIStore = create<UIState>()((set) => ({
  siderCollapsed: false,

  setSiderCollapsed: (siderCollapsed) => set({ siderCollapsed }),
}));
