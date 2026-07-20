/**
 * 路由配置类型
 * 用于定义应用的路由结构
 */
export type RouteConfig = {
  /** 路由路径，如 '/account' */
  path?: string;
  /** 路由名称，用于菜单显示 */
  name?: string;
  /** 页面组件路径，如 '@/pages/account'，支持 @/ 别名 */
  component?: string;
  /** 布局组件路径，如 '@/layouts/Basic'，支持 @/ 别名 */
  layout?: string;
  /** 路由重定向目标路径，当路由有 children 且设置了 redirect 时，访问父路径会自动重定向到指定子路径 */
  redirect?: string;
  /** 按角色覆盖 redirect 的目标。命中角色优先于 redirect；未命中则回落到 redirect。
   *  当前用法：超管 → /management/console；租户管理员 → /management/admin-management；普通管理员 → /account。 */
  redirectByRole?: Record<string, string>;
  /** 在菜单中隐藏该路由 */
  hideInMenu?: boolean;
  /** 在面包屑中隐藏该路由 */
  hideInBreadcrumb?: boolean;
  /** 权限控制标识，与 access.ts 中的权限定义对应，false 表示不需要权限 */
  access?: string | false;
  /** 子路由配置 */
  children?: RouteConfig[];
  /** CSS 变量文件路径，匹配该路由及其所有子路由时会加载，如 '@/styles/variables-account.css' */
  cssVars?: string;
  /** 菜单图标路径，支持 @/ 别名，如 '@/images/menu-icons/icon-home.svg' */
  icon?: string;
};
