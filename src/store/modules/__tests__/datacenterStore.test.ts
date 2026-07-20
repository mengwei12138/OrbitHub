import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { useDataCenterStore } from '../datacenterStore';

describe('useDataCenterStore', () => {
  describe('初始状态', () => {
    it('contentTable 有正确的初始值', () => {
      const { result } = renderHook(() => useDataCenterStore());
      expect(result.current.contentTable).toEqual({
        timeRange: 'today',
        platform: 'all',
        contentType: 'all',
        sortBy: 'playCount',
        page: 1,
        scrollTop: 0,
      });
    });
  });

  describe('setTimeRange', () => {
    it('可以设置时间范围', () => {
      const { result } = renderHook(() => useDataCenterStore());
      act(() => {
        result.current.setTimeRange('last7days');
      });
      expect(result.current.contentTable.timeRange).toBe('last7days');
    });

    it('设置时间范围时重置 page 和 scrollTop', () => {
      const { result } = renderHook(() => useDataCenterStore());
      act(() => {
        result.current.setPage(3);
        result.current.setScrollTop(100);
        result.current.setTimeRange('last7days');
      });
      expect(result.current.contentTable.page).toBe(1);
      expect(result.current.contentTable.scrollTop).toBe(0);
    });
  });

  describe('setPlatform', () => {
    it('可以设置平台筛选', () => {
      const { result } = renderHook(() => useDataCenterStore());
      act(() => {
        result.current.setPlatform('douyin');
      });
      expect(result.current.contentTable.platform).toBe('douyin');
    });

    it('设置平台时重置 page 和 scrollTop', () => {
      const { result } = renderHook(() => useDataCenterStore());
      act(() => {
        result.current.setPage(5);
        result.current.setScrollTop(200);
        result.current.setPlatform('xiaohongshu');
      });
      expect(result.current.contentTable.page).toBe(1);
      expect(result.current.contentTable.scrollTop).toBe(0);
    });
  });

  describe('setContentType', () => {
    it('可以设置内容类型', () => {
      const { result } = renderHook(() => useDataCenterStore());
      act(() => {
        result.current.setContentType('video');
      });
      expect(result.current.contentTable.contentType).toBe('video');
    });

    it('设置内容类型时重置 page 和 scrollTop', () => {
      const { result } = renderHook(() => useDataCenterStore());
      act(() => {
        result.current.setPage(2);
        result.current.setScrollTop(150);
        result.current.setContentType('image_text');
      });
      expect(result.current.contentTable.page).toBe(1);
      expect(result.current.contentTable.scrollTop).toBe(0);
    });
  });

  describe('setSortBy', () => {
    it('可以设置排序方式', () => {
      const { result } = renderHook(() => useDataCenterStore());
      act(() => {
        result.current.setSortBy('likeCount');
      });
      expect(result.current.contentTable.sortBy).toBe('likeCount');
    });

    it('设置排序时重置 page 和 scrollTop', () => {
      const { result } = renderHook(() => useDataCenterStore());
      act(() => {
        result.current.setPage(4);
        result.current.setScrollTop(300);
        result.current.setSortBy('commentCount');
      });
      expect(result.current.contentTable.page).toBe(1);
      expect(result.current.contentTable.scrollTop).toBe(0);
    });
  });

  describe('setPage', () => {
    it('可以设置页码', () => {
      const { result } = renderHook(() => useDataCenterStore());
      act(() => {
        result.current.setPage(3);
      });
      expect(result.current.contentTable.page).toBe(3);
    });

    it('设置页码不改变 scrollTop', () => {
      const { result } = renderHook(() => useDataCenterStore());
      act(() => {
        result.current.setScrollTop(250);
        result.current.setPage(5);
      });
      expect(result.current.contentTable.scrollTop).toBe(250);
    });
  });

  describe('setScrollTop', () => {
    it('可以设置滚动位置', () => {
      const { result } = renderHook(() => useDataCenterStore());
      act(() => {
        result.current.setScrollTop(500);
      });
      expect(result.current.contentTable.scrollTop).toBe(500);
    });
  });

  describe('resetContentTable', () => {
    it('可以重置所有状态', () => {
      const { result } = renderHook(() => useDataCenterStore());
      act(() => {
        result.current.setTimeRange('last30days');
        result.current.setPlatform('douyin');
        result.current.setContentType('video');
        result.current.setSortBy('likeCount');
        result.current.setPage(5);
        result.current.setScrollTop(400);
        result.current.resetContentTable();
      });
      expect(result.current.contentTable).toEqual({
        timeRange: 'today',
        platform: 'all',
        contentType: 'all',
        sortBy: 'playCount',
        page: 1,
        scrollTop: 0,
      });
    });
  });
});
