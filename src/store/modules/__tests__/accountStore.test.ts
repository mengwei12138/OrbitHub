import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { useAccountStore } from '../accountStore';

describe('useAccountStore', () => {
  describe('初始状态', () => {
    it('有正确的初始值', () => {
      const { result } = renderHook(() => useAccountStore());
      expect(result.current.searchKeyword).toBe('');
      expect(result.current.platformFilter).toBeNull();
      expect(result.current.statusFilter).toBeNull();
      expect(result.current.page).toBe(1);
      expect(result.current.pageSize).toBe(10);
    });
  });

  describe('setSearchKeyword', () => {
    it('可以设置搜索关键词', () => {
      const { result } = renderHook(() => useAccountStore());
      act(() => {
        result.current.setSearchKeyword('测试账号');
      });
      expect(result.current.searchKeyword).toBe('测试账号');
    });

    it('设置搜索关键词时重置 page', () => {
      const { result } = renderHook(() => useAccountStore());
      act(() => {
        result.current.setPage(5);
        result.current.setSearchKeyword('新搜索');
      });
      expect(result.current.page).toBe(1);
    });
  });

  describe('setPlatformFilter', () => {
    it('可以设置平台筛选', () => {
      const { result } = renderHook(() => useAccountStore());
      act(() => {
        result.current.setPlatformFilter('douyin');
      });
      expect(result.current.platformFilter).toBe('douyin');
    });

    it('可以清除平台筛选', () => {
      const { result } = renderHook(() => useAccountStore());
      act(() => {
        result.current.setPlatformFilter('douyin');
        result.current.setPlatformFilter(null);
      });
      expect(result.current.platformFilter).toBeNull();
    });

    it('设置平台筛选时重置 page', () => {
      const { result } = renderHook(() => useAccountStore());
      act(() => {
        result.current.setPage(3);
        result.current.setPlatformFilter('xiaohongshu');
      });
      expect(result.current.page).toBe(1);
    });
  });

  describe('setStatusFilter', () => {
    it('可以设置状态筛选', () => {
      const { result } = renderHook(() => useAccountStore());
      act(() => {
        result.current.setStatusFilter('online');
      });
      expect(result.current.statusFilter).toBe('online');
    });

    it('设置状态筛选时重置 page', () => {
      const { result } = renderHook(() => useAccountStore());
      act(() => {
        result.current.setPage(4);
        result.current.setStatusFilter('offline');
      });
      expect(result.current.page).toBe(1);
    });
  });

  describe('setPage', () => {
    it('可以设置页码', () => {
      const { result } = renderHook(() => useAccountStore());
      act(() => {
        result.current.setPage(10);
      });
      expect(result.current.page).toBe(10);
    });
  });

  describe('setPageSize', () => {
    it('可以设置每页条数', () => {
      const { result } = renderHook(() => useAccountStore());
      act(() => {
        result.current.setPageSize(20);
      });
      expect(result.current.pageSize).toBe(20);
    });

    it('设置每页条数时重置 page', () => {
      const { result } = renderHook(() => useAccountStore());
      act(() => {
        result.current.setPage(5);
        result.current.setPageSize(50);
      });
      expect(result.current.page).toBe(1);
    });
  });

  describe('reset', () => {
    it('可以重置所有状态', () => {
      const { result } = renderHook(() => useAccountStore());
      act(() => {
        result.current.setSearchKeyword('搜索词');
        result.current.setPlatformFilter('douyin');
        result.current.setStatusFilter('online');
        result.current.setPage(7);
        result.current.setPageSize(50);
        result.current.reset();
      });
      expect(result.current).toEqual({
        searchKeyword: '',
        platformFilter: null,
        statusFilter: null,
        page: 1,
        pageSize: 10,
        setSearchKeyword: result.current.setSearchKeyword,
        setPlatformFilter: result.current.setPlatformFilter,
        setStatusFilter: result.current.setStatusFilter,
        setPage: result.current.setPage,
        setPageSize: result.current.setPageSize,
        reset: result.current.reset,
      });
    });
  });
});
