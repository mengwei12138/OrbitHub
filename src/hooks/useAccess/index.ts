import checkAccess from '@/access';
import { useUserStore } from '@/store/modules/userStore';

/**
 * 订阅 user store 的 permissions / roles 变化以保证按钮级权限组件随登录态实时刷新。
 * 直接调用 access() 而非内联 includes，使权限判定语义与路由级 MenuAccess 完全一致。
 */
const useAccess = (path: string): boolean => {
  // 订阅维度精确到 permissions + roles 两个字段，避免 userInfo 等无关字段变更触发重渲。
  useUserStore((s) => s.permissions);
  useUserStore((s) => s.roles);
  return checkAccess(path);
};

export default useAccess;
