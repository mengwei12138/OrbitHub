import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { APP_TITLE } from '@/constants';
import routesConfig from '@/routes/config';

interface BreadcrumbItem {
  path: string;
  name: string;
  hideInBreadcrumb?: boolean;
}

const routeToRegex = (path: string): string => {
  return path.replace(/\*/gu, '.*').replace(/:[^/]+/gu, '([^/]+)');
};

const isMatch = (pattern: string, path: string): boolean => {
  if (pattern === path) return true;
  const regex = new RegExp(`^${routeToRegex(pattern)}$`, 'u');
  return regex.test(path);
};

const findBreadcrumbItems = (
  routes: typeof routesConfig,
  targetPath: string,
  parents: BreadcrumbItem[] = [],
): BreadcrumbItem[] | null => {
  for (const route of routes) {
    const currentParents =
      route.name && route.path
        ? [
            ...parents,
            {
              path: route.path,
              name: route.name,
              hideInBreadcrumb: route.hideInBreadcrumb,
            },
          ]
        : [...parents];

    if (route.path && isMatch(route.path, targetPath) && route.name) {
      return currentParents;
    }

    if (route.children) {
      const childResult = findBreadcrumbItems(
        route.children,
        targetPath,
        currentParents,
      );
      if (childResult) {
        return childResult;
      }
    }
  }
  return null;
};

const useBreadcrumbItems = (): BreadcrumbItem[] => {
  const location = useLocation();

  return useMemo(() => {
    const result = findBreadcrumbItems(routesConfig, location.pathname);
    if (result) {
      const filtered = result.filter((item) => !item.hideInBreadcrumb);
      return [{ path: '/', name: APP_TITLE }, ...filtered];
    }

    return [{ path: '/', name: APP_TITLE }];
  }, [location.pathname]);
};

export type { BreadcrumbItem };

export default useBreadcrumbItems;
