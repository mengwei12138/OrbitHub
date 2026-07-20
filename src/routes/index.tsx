import { lazy, useEffect } from 'react';
import type { RouteObject } from 'react-router-dom';
import { Navigate, useLocation, useRoutes } from 'react-router-dom';
import MenuAccess from '@/components/MenuAccess';
import routesConfig from './config';
import type { RouteConfig } from './types';

export type { RouteConfig };

/**
 * 使用 import.meta.glob 在编译时收集所有页面、布局、样式模块
 * Vite 会在构建时将这些模块打包为独立 chunk，实现正确的代码分割
 * 注意：glob 产物的 key 经 vite-plugin-glob-alias 插件处理后为 @/ 前缀
 */
const pageModules = import.meta.glob<{ default: React.ComponentType }>(
  '/src/pages/**/index.tsx',
);
const layoutModules = import.meta.glob<{ default: React.ComponentType }>(
  '/src/layouts/*/index.tsx',
);
const cssModules = import.meta.glob<void>('/src/styles/**/*.css');

/**
 * 将路由配置中的 CSS 路径补全为 glob key
 * 路径转换规则：'@/styles/account/vars' → '@/styles/account/vars.css'
 */
const toCssKey = (modulePath: string): string =>
  modulePath.endsWith('.css') ? modulePath : `${modulePath}.css`;

/**
 * 从 glob 模块映射中查找并返回懒加载组件
 * modulePath 直接拼接 suffix 即可匹配 glob key（插件已将 key 重写为 @/ 前缀）
 */
const lazyLoad = (
  modules: Record<string, () => Promise<{ default: React.ComponentType }>>,
  modulePath: string,
  suffix: string,
) => {
  const key = `${modulePath}/${suffix}`;
  const loader = modules[key];
  if (!loader) {
    console.warn(`[路由] 未找到模块: ${key}，可用模块:`, Object.keys(modules));
    return lazy(() =>
      Promise.resolve({
        default: () => <div>模块未找到: {modulePath}</div>,
      }),
    );
  }
  return lazy(loader);
};

export const joinPath = (parent: string, child: string): string => {
  if (child === '*') return '*';
  if (child.startsWith('/')) return child;
  if (parent === '/') return `/${child}`;
  return `${parent}/${child}`;
};

export const toRouteChildren = (
  routes: RouteConfig[],
  parentPath?: string,
  parentLayout?: string,
  parentAccess?: string | false,
): RouteObject[] =>
  routes.flatMap((r) => {
    const currentPath = parentPath
      ? joinPath(parentPath, r.path || '')
      : r.path;
    const hasLayout = !!r.layout || !!parentLayout;
    const layoutPath = r.layout || parentLayout;
    const access = r.access === undefined ? parentAccess : r.access;

    if (r.layout && r.children) {
      const LazyLayout = lazyLoad(layoutModules, r.layout, 'index.tsx');
      const layoutChildren = toRouteChildren(
        r.children,
        currentPath,
        layoutPath,
        access,
      );

      // 父路由有 redirect 时，生成 index route 重定向到指定子路径
      if (r.redirect) {
        layoutChildren.unshift({
          index: true as const,
          element: <Navigate to={r.redirect} replace />,
        } as RouteObject);
      }

      return [
        {
          path: currentPath,
          element: <LazyLayout />,
          children: layoutChildren,
        },
      ];
    }

    if (r.redirect && !r.children) {
      return [
        {
          path: currentPath,
          element: <Navigate to={r.redirect} replace />,
        },
      ];
    }

    if (r.component) {
      const LazyComponent = lazyLoad(pageModules, r.component, 'index.tsx');

      const parentElement =
        typeof access === 'string' ? (
          <MenuAccess access={access} key="with-access">
            <LazyComponent />
          </MenuAccess>
        ) : (
          <LazyComponent key="without-access" />
        );

      // 有 children 时，父路由和子路由展开为平级路由（独立页面，非嵌套 Outlet）
      if (r.children) {
        return [
          { path: currentPath, element: parentElement },
          ...toRouteChildren(
            r.children,
            currentPath,
            hasLayout ? layoutPath : undefined,
            access,
          ),
        ];
      }

      return [{ path: currentPath, element: parentElement }];
    }

    if (r.children) {
      return toRouteChildren(
        r.children,
        currentPath,
        hasLayout ? layoutPath : undefined,
        access,
      );
    }

    return [{ path: currentPath }];
  });

/**
 * 收集路由配置中所有 cssVars 路径
 * 会递归收集当前路由及其所有子路由的 cssVars
 * @param routes 路由配置数组
 * @returns 去重后的 cssVars 路径数组
 */
export const collectCssVars = (routes: RouteConfig[]): string[] => {
  const result: string[] = [];
  for (const r of routes) {
    if (r.cssVars && !result.includes(r.cssVars)) {
      result.push(r.cssVars);
    }
    if (r.children) {
      result.push(...collectCssVars(r.children));
    }
  }
  return result;
};

/** 已加载的 CSS 变量文件路径集合，用于避免重复加载 */
const loadedCssVars = new Set<string>();

/**
 * CSS 变量加载器组件
 * 根据当前路由路径，从路由配置中查找匹配的路由及其子路由的 cssVars
 * 并动态加载对应的 CSS 文件
 */
const CssVarsLoader: React.FC<{ routes: RouteConfig[] }> = ({ routes }) => {
  const location = useLocation();

  useEffect(() => {
    const currentPath = location.pathname;
    const cssVarsToLoad: string[] = [];

    // 遍历路由配置，查找匹配的路由及其子路由的 cssVars
    const findCssVars = (routeList: RouteConfig[], parentPath?: string) => {
      for (const route of routeList) {
        const fullPath = parentPath
          ? joinPath(parentPath, route.path || '')
          : route.path;

        // 检查当前路由路径是否匹配（或为子路由的前缀）
        if (
          fullPath &&
          (currentPath === fullPath || currentPath.startsWith(`${fullPath}/`))
        ) {
          if (route.cssVars && !loadedCssVars.has(route.cssVars)) {
            cssVarsToLoad.push(route.cssVars);
          }
        }

        // 递归检查子路由
        if (route.children) {
          findCssVars(route.children, fullPath);
        }
      }
    };

    findCssVars(routes);

    // 动态加载 CSS 文件
    for (const cssVar of cssVarsToLoad) {
      if (!loadedCssVars.has(cssVar)) {
        const cssKey = toCssKey(cssVar);
        const cssLoader = cssModules[cssKey];
        if (cssLoader) {
          cssLoader();
        } else {
          console.warn(`[路由] 未找到 CSS 模块: ${cssKey}`);
        }
        loadedCssVars.add(cssVar);
      }
    }
  }, [location.pathname, routes]);

  return null;
};

export const layoutRoute: { path: string } = {
  path: '/',
};

export const appChildren = toRouteChildren(routesConfig);

export const AppRoutes: React.FC = () => {
  return (
    <>
      <CssVarsLoader routes={routesConfig} />
      {useRoutes(appChildren)}
    </>
  );
};
