import type { QueryClient } from '@tanstack/react-query';

/**
 * 忽略 / 标记已读 / 清空已忽略 后必须刷新的两套 cache：
 * - `['alert']`：预警列表与汇总（warnings 详情页自带 stats）
 * - `['statistics', 'overview']`：dashboard WarningZone 顶部的 总预警 / 未读 / 异常账号
 *
 * 历史上只 invalidate `['alert']`，导致 dashboard 三个数字不刷新。
 */
export const invalidateWarningRelated = (queryClient: QueryClient): void => {
  queryClient.invalidateQueries({ queryKey: ['alert'] });
  queryClient.invalidateQueries({ queryKey: ['statistics', 'overview'] });
};
