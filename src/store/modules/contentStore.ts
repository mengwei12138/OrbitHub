import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ContentListState {
  searchKeyword: string;
  platformFilter: string | null;
  contentTypeFilter: string | null;
  statusFilter: string | null;
  sortBy: string;
  page: number;
  pageSize: number;
  setSearchKeyword: (keyword: string) => void;
  setPlatformFilter: (platform: string | null) => void;
  setContentTypeFilter: (type: string | null) => void;
  setStatusFilter: (status: string | null) => void;
  setSortBy: (sortBy: string) => void;
  setPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;
  reset: () => void;
}

const initialState = {
  searchKeyword: '',
  platformFilter: null,
  contentTypeFilter: null,
  statusFilter: null,
  sortBy: 'createdAt',
  page: 1,
  pageSize: 10,
};

export const useContentStore = create<ContentListState>()(
  persist(
    (set) => ({
      ...initialState,

      setSearchKeyword: (searchKeyword) => set({ searchKeyword, page: 1 }),

      setPlatformFilter: (platformFilter) => set({ platformFilter, page: 1 }),

      setContentTypeFilter: (contentTypeFilter) =>
        set({ contentTypeFilter, page: 1 }),

      setStatusFilter: (statusFilter) => set({ statusFilter, page: 1 }),

      setSortBy: (sortBy) => set({ sortBy, page: 1 }),

      setPage: (page) => set({ page }),

      setPageSize: (pageSize) => set({ pageSize, page: 1 }),

      reset: () => set(initialState),
    }),
    { name: 'content-list-state' },
  ),
);
