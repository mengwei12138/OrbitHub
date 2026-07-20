import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type {
  ContentType,
  SortBy,
} from '@/pages/datacenter/components/ContentTable/types';
import type { Granularity } from '@/pages/datacenter/components/PlayTrendChart/types';

export type TimeRange = 'today' | 'last7days' | 'last30days' | 'thisYear';
export type Platform = 'all' | 'douyin' | 'xiaohongshu';

export interface ContentTablePersistState {
  timeRange: TimeRange;
  platform: Platform;
  contentType: ContentType;
  sortBy: SortBy;
  page: number;
  scrollTop: number;
}

export interface PlayTrendPersistState {
  granularity: Granularity;
}

interface DataCenterState {
  contentTable: ContentTablePersistState;
  playTrend: PlayTrendPersistState;
  setTimeRange: (timeRange: TimeRange) => void;
  setPlatform: (platform: Platform) => void;
  setContentType: (contentType: ContentType) => void;
  setSortBy: (sortBy: SortBy) => void;
  setPage: (page: number) => void;
  setScrollTop: (scrollTop: number) => void;
  setGranularity: (granularity: Granularity) => void;
  resetContentTable: () => void;
}

const initialContentTable: ContentTablePersistState = {
  timeRange: 'today',
  platform: 'all',
  contentType: 'all',
  sortBy: 'playCount',
  page: 1,
  scrollTop: 0,
};

const initialPlayTrend: PlayTrendPersistState = {
  granularity: 'hour',
};

export const useDataCenterStore = create<DataCenterState>()(
  persist(
    (set) => ({
      contentTable: initialContentTable,
      playTrend: initialPlayTrend,

      setTimeRange: (timeRange) => {
        const granularityMap: Record<TimeRange, Granularity> = {
          today: 'hour',
          last7days: 'day',
          last30days: 'day',
          thisYear: 'month',
        };
        return set((state) => ({
          contentTable: {
            ...state.contentTable,
            timeRange,
            page: 1,
            scrollTop: 0,
          },
          playTrend: {
            ...state.playTrend,
            granularity: granularityMap[timeRange],
          },
        }));
      },

      setPlatform: (platform) =>
        set((state) => ({
          contentTable: {
            ...state.contentTable,
            platform,
            page: 1,
            scrollTop: 0,
          },
        })),

      setContentType: (contentType) =>
        set((state) => ({
          contentTable: {
            ...state.contentTable,
            contentType,
            page: 1,
            scrollTop: 0,
          },
        })),

      setSortBy: (sortBy) =>
        set((state) => ({
          contentTable: {
            ...state.contentTable,
            sortBy,
            page: 1,
            scrollTop: 0,
          },
        })),

      setPage: (page) =>
        set((state) => ({
          contentTable: { ...state.contentTable, page },
        })),

      setScrollTop: (scrollTop) =>
        set((state) => ({
          contentTable: { ...state.contentTable, scrollTop },
        })),

      setGranularity: (granularity) =>
        set((state) => ({
          playTrend: {
            ...state.playTrend,
            granularity,
          },
        })),

      resetContentTable: () => set({ contentTable: initialContentTable }),
    }),
    {
      name: 'datacenter_state',
      storage: createJSONStorage(() => sessionStorage),
      // timeRange / platform 不持久化：每次打开/刷新都恢复默认值（今日 + 全部平台）
      partialize: (state) => ({
        contentTable: {
          contentType: state.contentTable.contentType,
          sortBy: state.contentTable.sortBy,
          page: state.contentTable.page,
          scrollTop: state.contentTable.scrollTop,
        },
        playTrend: {
          granularity: state.playTrend.granularity,
        },
      }),
      // 默认 merge 是顶层浅合并；对嵌套对象做一层合并，避免持久化对象整体覆盖掉初始值里被排除的字段
      merge: (persisted, current) => {
        const p = (persisted ?? {}) as Partial<DataCenterState>;
        return {
          ...current,
          contentTable: {
            ...current.contentTable,
            ...(p.contentTable ?? {}),
          },
          playTrend: {
            ...current.playTrend,
            ...(p.playTrend ?? {}),
          },
        };
      },
    },
  ),
);
