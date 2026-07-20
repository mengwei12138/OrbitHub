import { describe, expect, it } from 'vitest';
import { collectCssVars, joinPath } from '../index';
import type { RouteConfig } from '../types';

describe('routes', () => {
  describe('joinPath', () => {
    it('子路径以 / 开头直接返回子路径', () => {
      expect(joinPath('/parent', '/child')).toBe('/child');
    });

    it('父路径为 / 时返回 / + 子路径', () => {
      expect(joinPath('/', 'child')).toBe('/child');
    });

    it('普通情况拼接父子路径', () => {
      expect(joinPath('/parent', 'child')).toBe('/parent/child');
    });

    it('处理空子路径', () => {
      expect(joinPath('/parent', '')).toBe('/parent/');
    });

    it('通配符 * 直接返回 *', () => {
      expect(joinPath('/parent', '*')).toBe('*');
    });
  });

  describe('collectCssVars', () => {
    it('收集单层路由的 cssVars', () => {
      const routes: RouteConfig[] = [
        { path: '/home', cssVars: '@/styles/home/vars' },
        { path: '/about' },
      ];
      const result = collectCssVars(routes);
      expect(result).toEqual(['@/styles/home/vars']);
    });

    it('递归收集嵌套路由的 cssVars', () => {
      const routes: RouteConfig[] = [
        {
          path: '/account',
          cssVars: '@/styles/account/vars',
          children: [
            {
              path: '/account/detail',
              cssVars: '@/styles/account-detail/vars',
            },
            { path: '/account/logs' },
          ],
        },
      ];
      const result = collectCssVars(routes);
      expect(result).toEqual([
        '@/styles/account/vars',
        '@/styles/account-detail/vars',
      ]);
    });

    it('去重相同的 cssVars 路径', () => {
      const routes: RouteConfig[] = [
        { path: '/a', cssVars: '@/styles/shared/vars' },
        { path: '/b', cssVars: '@/styles/shared/vars' },
      ];
      const result = collectCssVars(routes);
      expect(result).toEqual(['@/styles/shared/vars']);
    });

    it('无 cssVars 时返回空数组', () => {
      const routes: RouteConfig[] = [
        { path: '/home' },
        { path: '/about', children: [{ path: '/about/team' }] },
      ];
      const result = collectCssVars(routes);
      expect(result).toEqual([]);
    });

    it('多层嵌套递归收集', () => {
      const routes: RouteConfig[] = [
        {
          path: '/a',
          cssVars: '@/styles/a/vars',
          children: [
            {
              path: '/a/b',
              cssVars: '@/styles/b/vars',
              children: [{ path: '/a/b/c', cssVars: '@/styles/c/vars' }],
            },
          ],
        },
      ];
      const result = collectCssVars(routes);
      expect(result).toEqual([
        '@/styles/a/vars',
        '@/styles/b/vars',
        '@/styles/c/vars',
      ]);
    });
  });
});
