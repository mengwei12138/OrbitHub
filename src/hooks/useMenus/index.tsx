import type { MenuDataItem } from '@ant-design/pro-components';
import { useMemo } from 'react';
import access from '@/access';
import routesConfig from '@/routes/config';
import { useUserStore } from '@/store/modules/userStore';
import { FIGMA_ICON_MENU_SIZE } from '@/styles/common/vars';

/**
 * PRD §2.3：父菜单名按角色映射。同一 path 下，超管看到 "超管中心"，租户管理员看到 "后台管理"。
 * 路由 config 内 name 仅作类型层默认值，最终展示以此映射为准。
 */
const ROLE_MENU_NAME_OVERRIDES: Record<string, Record<string, string>> = {
  '/management': {
    PLATFORM_ADMIN: '超管中心',
    TENANT_ADMIN: '后台管理',
  },
};

const applyRoleMenuNameOverrides = (
  items: MenuDataItem[],
  roles: string[],
): MenuDataItem[] =>
  items.map((item) => {
    const override = item.path
      ? ROLE_MENU_NAME_OVERRIDES[item.path]
      : undefined;
    const matchedName = override
      ? roles.map((role) => override[role]).find((name) => !!name)
      : undefined;
    return {
      ...item,
      ...(matchedName ? { name: matchedName } : {}),
      ...(item.children
        ? { children: applyRoleMenuNameOverrides(item.children, roles) }
        : {}),
    };
  });

const iconModules = import.meta.glob('/src/images/menu-icons/*.svg', {
  query: '?url',
  import: 'default',
  eager: true,
}) as Record<string, string>;

/**
 * 根据路由配置的 icon 路径渲染菜单图标
 * icon 路径（如 '@/images/menu-icons/icon-home.svg'）可直接作为 glob key 查找
 * （glob key 经 vite-plugin-glob-alias 插件处理后已为 @/ 前缀）
 */
const renderMenuIcon = (
  icon: string | undefined,
  alt: string,
): React.ReactNode => {
  if (!icon) return undefined;
  return (
    <img
      src={iconModules[icon]}
      width={FIGMA_ICON_MENU_SIZE}
      height={FIGMA_ICON_MENU_SIZE}
      alt={alt}
    />
  );
};

/**
 * 将路由配置转换为菜单数据
 * 递归处理路由树，过滤权限、隐藏菜单项，生成 ProLayout 所需的 MenuDataItem 数组
 */
export const toMenuData = (
  routes: typeof routesConfig,
  parentAccess?: string | false,
): MenuDataItem[] => {
  const result: MenuDataItem[] = [];

  for (const r of routes) {
    // 跳过纯重定向路由（无 children 的 redirect）
    if (r.redirect && !r.children) continue;

    // 权限过滤：有 access 标记时调用 access()——dev 模式的放行策略由 access() 内部按
    // role: / 权限码分别决定（PRD §2.3 的角色侧边栏 dev 也需生效）。
    const routeAccess = r.access === undefined ? parentAccess : r.access;
    if (typeof routeAccess === 'string') {
      if (!access(routeAccess)) continue;
    }

    // 隐藏菜单项
    if (r.hideInMenu) continue;

    if (r.children) {
      const childrenData = toMenuData(r.children, routeAccess);
      if (r.name) {
        result.push({
          path: r.path,
          name: r.name,
          children: childrenData,
          icon: renderMenuIcon(r.icon, r.name),
        });
      } else {
        result.push(...childrenData);
      }
    } else if (r.path && r.name) {
      result.push({
        path: r.path,
        name: r.name,
        icon: renderMenuIcon(r.icon, r.name),
      });
    }
  }

  return result;
};

const useMenus = (): MenuDataItem[] => {
  // 订阅 permissions / roles：登录或权限更新时必须重算可见菜单。
  // toMenuData 内部通过 access() 读 store 快照，对 React 来说是"隐式"依赖，
  // 显式列在 deps 数组里告诉 React 这次 memo 必须随之失效。
  const permissions = useUserStore((s) => s.permissions);
  const roles = useUserStore((s) => s.roles);
  // biome-ignore lint/correctness/useExhaustiveDependencies: permissions/roles 是隐式依赖（access() 通过 store 快照消费），需作为失效触发器
  return useMemo(
    () => applyRoleMenuNameOverrides(toMenuData(routesConfig), roles),
    [permissions, roles],
  );
};

export default useMenus;
