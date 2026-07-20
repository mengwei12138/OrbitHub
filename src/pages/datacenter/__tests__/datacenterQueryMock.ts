import type { UseQueryResult } from '@tanstack/react-query';

export type DatacenterQueryRouterContext = {
  mockUseQuery: (overrides?: Record<string, unknown>) => UseQueryResult;
  getOverviewForTimeRange: (timeRange: string) => unknown;
  getAccountData: () => unknown;
  getWarningData: () => unknown;
  getTrendForTimeRange: (timeRange: string) => unknown;
  getContentsData: () => unknown;
};

/** 按 queryKey 分发数据中心主页及其子区域的 TanStack Query mock */
export function createDatacenterUseQueryImplementation(
  ctx: DatacenterQueryRouterContext,
) {
  return (options: { queryKey?: readonly unknown[] }): UseQueryResult => {
    const queryKey = options.queryKey ?? [];
    const [scope, resource, params] = queryKey;

    // 新键：数据中心账号下拉候选池（datacenter-account-options-endpoint）
    if (scope === 'statistics' && resource === 'accountOptions') {
      return ctx.mockUseQuery({ data: ctx.getAccountData() });
    }
    // 旧键：兼容历史 BDD 步骤；当前页面已不再调用 accountListQueryOptions，留作 no-op 安全网
    if (scope === 'account' && resource === 'list') {
      return ctx.mockUseQuery({ data: ctx.getAccountData() });
    }
    if (scope === 'statistics' && resource === 'overview') {
      const tr =
        (params as { timeRange?: string } | undefined)?.timeRange ?? 'today';
      return ctx.mockUseQuery({ data: ctx.getOverviewForTimeRange(tr) });
    }
    if (scope === 'alert' && resource === 'warningList') {
      return ctx.mockUseQuery({ data: ctx.getWarningData() });
    }
    if (scope === 'statistics' && resource === 'playTrend') {
      const tr =
        (params as { timeRange?: string } | undefined)?.timeRange ?? 'today';
      return ctx.mockUseQuery({ data: ctx.getTrendForTimeRange(tr) });
    }
    if (scope === 'statistics' && resource === 'contents') {
      return ctx.mockUseQuery({ data: ctx.getContentsData() });
    }
    return ctx.mockUseQuery();
  };
}
