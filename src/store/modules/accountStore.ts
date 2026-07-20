import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AccountListState {
  searchKeyword: string;
  platformFilter: string | null;
  statusFilter: string | null;
  page: number;
  pageSize: number;
  setSearchKeyword: (keyword: string) => void;
  setPlatformFilter: (platform: string | null) => void;
  setStatusFilter: (status: string | null) => void;
  setPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;
  reset: () => void;
}

const initialState = {
  searchKeyword: '',
  platformFilter: null,
  statusFilter: null,
  page: 1,
  pageSize: 10,
};

export const useAccountStore = create<AccountListState>()(
  persist(
    (set) => ({
      ...initialState,

      setSearchKeyword: (searchKeyword) => set({ searchKeyword, page: 1 }),

      setPlatformFilter: (platformFilter) => set({ platformFilter, page: 1 }),

      setStatusFilter: (statusFilter) => set({ statusFilter, page: 1 }),

      setPage: (page) => set({ page }),

      setPageSize: (pageSize) => set({ pageSize, page: 1 }),

      reset: () => set(initialState),
    }),
    { name: 'account-list-state' },
  ),
);
