import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { useThemeStore } from '../modules/themeStore';
import { useUIStore } from '../modules/uiStore';
import { useUserStore } from '../modules/userStore';

describe('Store 单元测试', () => {
  describe('useUserStore', () => {
    it('初始状态 token 为 null', () => {
      const { result } = renderHook(() => useUserStore());
      expect(result.current.token).toBeNull();
    });

    it('初始状态 userInfo 为 null', () => {
      const { result } = renderHook(() => useUserStore());
      expect(result.current.userInfo).toBeNull();
    });

    it('初始状态 permissions 为空数组', () => {
      const { result } = renderHook(() => useUserStore());
      expect(result.current.permissions).toEqual([]);
    });

    it('setToken 可以更新 token', () => {
      const { result } = renderHook(() => useUserStore());
      act(() => {
        result.current.setToken('test-token');
      });
      expect(result.current.token).toBe('test-token');
    });

    it('setUserInfo 可以更新用户信息', () => {
      const { result } = renderHook(() => useUserStore());
      const userInfo = { id: '1', username: 'test' };
      act(() => {
        result.current.setUserInfo(userInfo);
      });
      expect(result.current.userInfo).toEqual(userInfo);
    });

    it('setPermissions 可以更新权限', () => {
      const { result } = renderHook(() => useUserStore());
      const permissions = ['read', 'write'];
      act(() => {
        result.current.setPermissions(permissions);
      });
      expect(result.current.permissions).toEqual(permissions);
    });

    it('logout 可以清除所有状态', () => {
      const { result } = renderHook(() => useUserStore());
      act(() => {
        result.current.setToken('test-token');
        result.current.setUserInfo({ id: '1', username: 'test' });
        result.current.setPermissions(['read']);
      });
      act(() => {
        result.current.logout();
      });
      expect(result.current.token).toBeNull();
      expect(result.current.userInfo).toBeNull();
      expect(result.current.permissions).toEqual([]);
    });
  });

  describe('useThemeStore', () => {
    it('初始主题为 light', () => {
      const { result } = renderHook(() => useThemeStore());
      expect(result.current.theme).toBe('light');
    });

    it('初始语言为 zh-CN', () => {
      const { result } = renderHook(() => useThemeStore());
      expect(result.current.language).toBe('zh-CN');
    });

    it('setTheme 可以切换主题', () => {
      const { result } = renderHook(() => useThemeStore());
      act(() => {
        result.current.setTheme('dark');
      });
      expect(result.current.theme).toBe('dark');
    });

    it('setLanguage 可以切换语言', () => {
      const { result } = renderHook(() => useThemeStore());
      act(() => {
        result.current.setLanguage('en-US');
      });
      expect(result.current.language).toBe('en-US');
    });
  });

  describe('useUIStore', () => {
    it('初始状态 siderCollapsed 为 false', () => {
      const { result } = renderHook(() => useUIStore());
      expect(result.current.siderCollapsed).toBe(false);
    });

    it('setSiderCollapsed 可以切换侧栏状态', () => {
      const { result } = renderHook(() => useUIStore());
      act(() => {
        result.current.setSiderCollapsed(true);
      });
      expect(result.current.siderCollapsed).toBe(true);
    });
  });
});
