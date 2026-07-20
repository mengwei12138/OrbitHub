import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import type { UserState } from '../types';

const USER_STORAGE_KEY = 'user-storage';

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      token: null,
      userInfo: null,
      permissions: [],
      roles: [],

      setToken: (token) => set({ token }),

      setUserInfo: (userInfo) => set({ userInfo }),

      setPermissions: (permissions) => set({ permissions }),

      setRoles: (roles) => set({ roles }),

      setCredits: (credits) =>
        set((state) => ({
          userInfo: state.userInfo ? { ...state.userInfo, credits } : null,
        })),

      logout: () =>
        set({
          token: null,
          userInfo: null,
          permissions: [],
          roles: [],
        }),
    }),
    {
      name: USER_STORAGE_KEY,
      partialize: (state) => ({
        token: state.token,
        userInfo: state.userInfo,
        permissions: state.permissions,
        roles: state.roles,
      }),
    },
  ),
);

if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key === USER_STORAGE_KEY) {
      useUserStore.persist.rehydrate();
    }
  });
}
