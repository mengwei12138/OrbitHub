import { describe, expect, it, vi } from 'vitest';
import type { RouteConfig } from '@/routes/types';

vi.mock('@/access', () => ({
  default: vi.fn((code: string) => code === 'admin'),
}));

vi.mock('@/constants', () => ({
  ENABLE_ACCESS_CHECK: true,
}));

vi.mock('@/styles/common/vars', () => ({
  FIGMA_ICON_MENU_SIZE: 16,
}));

import { toMenuData } from '../index';

describe('useMenus - toMenuData', () => {
  it('跳过纯重定向路由', () => {
    const routes: RouteConfig[] = [
      { path: '/old', redirect: '/new' },
      { path: '/home', name: '首页', component: '@/pages/home' },
    ];
    const result = toMenuData(routes);
    expect(result.find((r) => r.path === '/old')).toBeUndefined();
    expect(result.find((r) => r.path === '/home')).toBeDefined();
  });

  it('保留有 children 的 redirect 路由', () => {
    const routes: RouteConfig[] = [
      {
        path: '/',
        redirect: '/home',
        children: [{ path: '/home', name: '首页', component: '@/pages/home' }],
      },
    ];
    const result = toMenuData(routes);
    expect(result.find((r) => r.path === '/home')).toBeDefined();
  });

  it('保持父子关系', () => {
    const routes: RouteConfig[] = [
      {
        path: '/parent',
        name: '父菜单',
        children: [
          { path: '/parent/child1', name: '子菜单1', component: '@/pages/c1' },
          { path: '/parent/child2', name: '子菜单2', component: '@/pages/c2' },
        ],
      },
    ];
    const result = toMenuData(routes);
    const parent = result.find((r) => r.path === '/parent');
    expect(parent).toBeDefined();
    expect(parent?.children).toHaveLength(2);
    expect(parent?.children?.[0]?.path).toBe('/parent/child1');
  });

  it('隐藏 hideInMenu 的路由', () => {
    const routes: RouteConfig[] = [
      { path: '/home', name: '首页', component: '@/pages/home' },
      {
        path: '/hidden',
        name: '隐藏',
        hideInMenu: true,
        component: '@/pages/h',
      },
    ];
    const result = toMenuData(routes);
    expect(result).toHaveLength(1);
    expect(result[0]?.path).toBe('/home');
  });

  it('隐藏 hideInMenu 的子路由', () => {
    const routes: RouteConfig[] = [
      {
        path: '/parent',
        name: '父菜单',
        children: [
          { path: '/parent/child1', name: '子菜单1', component: '@/pages/c1' },
          {
            path: '/parent/child2',
            name: '子菜单2',
            hideInMenu: true,
            component: '@/pages/c2',
          },
        ],
      },
    ];
    const result = toMenuData(routes);
    const parent = result.find((r) => r.path === '/parent');
    expect(parent?.children).toHaveLength(1);
    expect(parent?.children?.[0]?.path).toBe('/parent/child1');
  });

  it('无 name 的父路由展开子路由到同级', () => {
    const routes: RouteConfig[] = [
      {
        path: '/',
        children: [
          { path: '/home', name: '首页', component: '@/pages/home' },
          { path: '/about', name: '关于', component: '@/pages/about' },
        ],
      },
    ];
    const result = toMenuData(routes);
    expect(result).toHaveLength(2);
    expect(result[0]?.path).toBe('/home');
    expect(result[1]?.path).toBe('/about');
  });

  it('权限过滤：无权限的路由被跳过', () => {
    const routes: RouteConfig[] = [
      { path: '/admin', name: '管理', access: 'admin', component: '@/pages/a' },
      { path: '/user', name: '用户', access: 'user', component: '@/pages/u' },
    ];
    const result = toMenuData(routes);
    expect(result).toHaveLength(1);
    expect(result[0]?.path).toBe('/admin');
  });

  it('权限继承：子路由继承父路由的 access', () => {
    const routes: RouteConfig[] = [
      {
        path: '/section',
        name: '区域',
        access: 'user',
        children: [
          { path: '/section/page', name: '页面', component: '@/pages/p' },
        ],
      },
    ];
    const result = toMenuData(routes);
    expect(result).toHaveLength(0);
  });

  it('access 为 false 时跳过权限检查', () => {
    const routes: RouteConfig[] = [
      { path: '/public', name: '公开', access: false, component: '@/pages/p' },
    ];
    const result = toMenuData(routes);
    expect(result).toHaveLength(1);
    expect(result[0]?.path).toBe('/public');
  });

  it('无 path 或无 name 的叶子路由不生成菜单项', () => {
    const routes: RouteConfig[] = [
      { path: '/no-name', component: '@/pages/no-name' },
      { name: '无路径', component: '@/pages/no-path' },
    ];
    const result = toMenuData(routes);
    expect(result).toHaveLength(0);
  });

  it('有 icon 时生成图标元素', () => {
    const routes: RouteConfig[] = [
      {
        path: '/home',
        name: '首页',
        icon: '@/images/menu-icons/icon-home.svg',
      },
    ];
    const result = toMenuData(routes);
    expect(result[0]?.icon).toBeDefined();
  });

  it('无 icon 时 icon 为 undefined', () => {
    const routes: RouteConfig[] = [
      { path: '/home', name: '首页', component: '@/pages/home' },
    ];
    const result = toMenuData(routes);
    expect(result[0]?.icon).toBeUndefined();
  });
});
