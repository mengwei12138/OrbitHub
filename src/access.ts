import { ENABLE_ACCESS_CHECK } from '@/constants';
import { useUserStore } from '@/store/modules/userStore';

/**
 * 路由 / 按钮级权限判定。
 *
 * 入参语义（与路由配置里 `access` 字段、`<Access path="...">` 的 `path` 共用同一个字符串）：
 * - `admin:tenant:list` 等"模块:资源:动作"码 → 在 `useUserStore.permissions` 集合里查找
 * - `role:PLATFORM_ADMIN` / `role:TENANT_ADMIN` / `role:NORMAL_ADMIN`
 *     → 用于 PRD §2.3 不同角色看到不同侧边栏（例如 /management/tenant-admin 只给超管看，
 *       /management/admin-management 只给租户管理员看；两者后端权限码相同，无法靠码区分）
 * - 任意逗号分隔列表 → 任一命中即视为有权限（OR 语义）
 *
 * 缺省（未登录或 permissions/roles 都为空）一律拒绝。
 *
 * `ENABLE_ACCESS_CHECK=false`（dev 默认）只放行 `admin:*` 等权限码，不放行 `role:*`——
 * 后者是 PRD §2.3 的产品行为（按角色看不同侧边栏），开发环境同样需要生效。
 */
const access = (code: string): boolean => {
  if (!code) return true;

  const { permissions, roles } = useUserStore.getState();

  const tokens = code
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean);
  return tokens.some((token) => {
    if (token.startsWith('role:')) {
      return roles.includes(token.slice('role:'.length));
    }
    if (!ENABLE_ACCESS_CHECK) return true;
    return permissions.includes(token);
  });
};

export default access;
