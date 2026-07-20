import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { useContentStore } from '../contentStore';

describe('useContentStore', () => {
  describe('初始状态', () => {
    it('有正确的初始值', () => {
      const { result } = renderHook(() => useContentStore());
      expect(result.current.searchKeyword).toBe('');
      expect(result.current.platformFilter).toBeNull();
      expect(result.current.contentTypeFilter).toBeNull();
      expect(result.current.statusFilter).toBeNull();
      expect(result.current.sortBy).toBe('createdAt');
      expect(result.current.page).toBe(1);
      expect(result.current.pageSize).toBe(10);
    });
  });

  describe('setSearchKeyword', () => {
    it('可以设置搜索关键词', () => {
      const { result } = renderHook(() => useContentStore());
      act(() => {
        result.current.setSearchKeyword('视频标题');
      });
      expect(result.current.searchKeyword).toBe('视频标题');
    });

    it('设置搜索关键词时重置 page', () => {
      const { result } = renderHook(() => useContentStore());
      act(() => {
        result.current.setPage(5);
        result.current.setSearchKeyword('新搜索');
      });
      expect(result.current.page).toBe(1);
    });
  });

  describe('setPlatformFilter', () => {
    it('可以设置平台筛选', () => {
      const { result } = renderHook(() => useContentStore());
      act(() => {
        result.current.setPlatformFilter('douyin');
      });
      expect(result.current.platformFilter).toBe('douyin');
    });

    it('设置平台筛选时重置 page', () => {
      const { result } = renderHook(() => useContentStore());
      act(() => {
        result.current.setPage(3);
        result.current.setPlatformFilter('xiaohongshu');
      });
      expect(result.current.page).toBe(1);
    });
  });

  describe('setContentTypeFilter', () => {
    it('可以设置内容类型筛选', () => {
      const { result } = renderHook(() => useContentStore());
      act(() => {
        result.current.setContentTypeFilter('video');
      });
      expect(result.current.contentTypeFilter).toBe('video');
    });

    it('可以清除内容类型筛选', () => {
      const { result } = renderHook(() => useContentStore());
      act(() => {
        result.current.setContentTypeFilter('video');
        result.current.setContentTypeFilter(null);
      });
      expect(result.current.contentTypeFilter).toBeNull();
    });

    it('设置内容类型筛选时重置 page', () => {
      const { result } = renderHook(() => useContentStore());
      act(() => {
        result.current.setPage(4);
        result.current.setContentTypeFilter('image_text');
      });
      expect(result.current.page).toBe(1);
    });
  });

  describe('setStatusFilter', () => {
    it('可以设置状态筛选', () => {
      const { result } = renderHook(() => useContentStore());
      act(() => {
        result.current.setStatusFilter('published');
      });
      expect(result.current.statusFilter).toBe('published');
    });

    it('设置状态筛选时重置 page', () => {
      const { result } = renderHook(() => useContentStore());
      act(() => {
        result.current.setPage(6);
        result.current.setStatusFilter('draft');
      });
      expect(result.current.page).toBe(1);
    });
  });

  describe('setSortBy', () => {
    it('可以设置排序方式', () => {
      const { result } = renderHook(() => useContentStore());
      act(() => {
        result.current.setSortBy('playCount');
      });
      expect(result.current.sortBy).toBe('playCount');
    });

    it('设置排序方式时重置 page', () => {
      const { result } = renderHook(() => useContentStore());
      act(() => {
        result.current.setPage(2);
        result.current.setSortBy('likeCount');
      });
      expect(result.current.page).toBe(1);
    });
  });

  describe('setPage', () => {
    it('可以设置页码', () => {
      const { result } = renderHook(() => useContentStore());
      act(() => {
        result.current.setPage(8);
      });
      expect(result.current.page).toBe(8);
    });
  });

  describe('setPageSize', () => {
    it('可以设置每页条数', () => {
      const { result } = renderHook(() => useContentStore());
      act(() => {
        result.current.setPageSize(20);
      });
      expect(result.current.pageSize).toBe(20);
    });

    it('设置每页条数时重置 page', () => {
      const { result } = renderHook(() => useContentStore());
      act(() => {
        result.current.setPage(5);
        result.current.setPageSize(50);
      });
      expect(result.current.page).toBe(1);
    });
  });

  describe('reset', () => {
    it('可以重置所有状态', () => {
      const { result } = renderHook(() => useContentStore());
      act(() => {
        result.current.setSearchKeyword('搜索');
        result.current.setPlatformFilter('douyin');
        result.current.setContentTypeFilter('video');
        result.current.setStatusFilter('published');
        result.current.setSortBy('playCount');
        result.current.setPage(7);
        result.current.setPageSize(50);
        result.current.reset();
      });
      expect(result.current).toEqual({
        searchKeyword: '',
        platformFilter: null,
        contentTypeFilter: null,
        statusFilter: null,
        sortBy: 'createdAt',
        page: 1,
        pageSize: 10,
        setSearchKeyword: result.current.setSearchKeyword,
        setPlatformFilter: result.current.setPlatformFilter,
        setContentTypeFilter: result.current.setContentTypeFilter,
        setStatusFilter: result.current.setStatusFilter,
        setSortBy: result.current.setSortBy,
        setPage: result.current.setPage,
        setPageSize: result.current.setPageSize,
        reset: result.current.reset,
      });
    });
  });
});
