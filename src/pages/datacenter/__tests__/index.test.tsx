import { type UseQueryResult, useQuery } from '@tanstack/react-query';
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../components/PlayTrendChart', () => ({
  default: () => null,
}));

import {
  accountOptionsQueryOptions,
  type ContentsQueryParams,
  contentsQueryOptions,
  type PageContentPerformanceResponse,
  playTrendQueryOptions,
} from '@/services/statistics';

import DataCentre from '../index';

import {
  createMockAccountData,
  createMockContentsData,
  createMockOverviewData,
  createMockTrendData,
  createMockWarningData,
} from './datacenterMockFixtures';
import { createDatacenterUseQueryImplementation } from './datacenterQueryMock';
import { fireClickContentPerformanceAccountLink } from './datacenterTestDom';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
  useSearchParams: () => [new URLSearchParams(), vi.fn()],
  useLocation: () => ({ pathname: '/datacenter' }),
}));

vi.mock('@/services/statistics', () => ({
  overviewQueryOptions: vi.fn((params: unknown) => ({
    queryKey: ['statistics', 'overview', params],
    queryFn: vi.fn(),
  })),
  playTrendQueryOptions: vi.fn((params: unknown) => ({
    queryKey: ['statistics', 'playTrend', params],
    queryFn: vi.fn(),
  })),
  contentsQueryOptions: vi.fn((params: unknown) => ({
    queryKey: ['statistics', 'contents', params],
    queryFn: vi.fn(),
  })),
  accountOptionsQueryOptions: vi.fn((params: unknown) => ({
    queryKey: ['statistics', 'accountOptions', params],
    queryFn: vi.fn(),
  })),
}));

vi.mock('@/services/alert', () => ({
  warningListQueryOptions: vi.fn((params: unknown) => ({
    queryKey: ['alert', 'warningList', params],
    queryFn: vi.fn(),
  })),
  ignoreWarning: vi.fn(),
  invalidateWarningRelated: vi.fn(),
}));

vi.mock('antd', async () => {
  const actual = await vi.importActual('antd');
  return {
    ...actual,
    message: {
      success: vi.fn(),
      error: vi.fn(),
      warning: vi.fn(),
      info: vi.fn(),
    },
  };
});

vi.mock('@tanstack/react-query', () => ({
  useQuery: vi.fn(),
  useQueryClient: vi.fn(() => ({
    invalidateQueries: vi.fn(),
  })),
}));

const mockRefetch = vi.fn();

const mockUseQuery = (
  overrides: Record<string, unknown> = {},
): UseQueryResult =>
  ({
    data: undefined,
    isLoading: false,
    isFetching: false,
    isError: false,
    error: null,
    refetch: mockRefetch,
    ...overrides,
  }) as unknown as UseQueryResult;

const compactPlayCount125kPayload = createMockContentsData({
  list: [
    {
      contentId: '1',
      title: '测试内容',
      accountId: 'acc-001',
      accountName: '时尚美妆号',
      platform: 'douyin',
      contentType: 'video',
      playCount: '125000',
      likeCount: '8900',
      commentCount: '1200',
      shareCount: '560',
      engagementRate: '8.56',
    },
  ],
}) as PageContentPerformanceResponse;

const compactPlayCount125mPayload = createMockContentsData({
  list: [
    {
      contentId: '2',
      title: '大播放量内容',
      accountId: 'acc-001',
      accountName: '时尚美妆号',
      platform: 'douyin',
      contentType: 'video',
      playCount: '125000000',
      likeCount: '8900',
      commentCount: '1200',
      shareCount: '560',
      engagementRate: '0.01',
    },
  ],
}) as PageContentPerformanceResponse;

describe('数据中心页面', () => {
  afterEach(() => {
    vi.mocked(useQuery).mockReset();
    vi.mocked(contentsQueryOptions).mockReset();
    cleanup();
  });

  beforeEach(() => {
    mockRefetch.mockClear();
    mockNavigate.mockClear();
    vi.mocked(useQuery).mockReset();
    vi.mocked(contentsQueryOptions).mockImplementation(
      (params: ContentsQueryParams) => ({
        queryKey: ['statistics', 'contents', params],
        queryFn: async (): Promise<PageContentPerformanceResponse> => ({
          list: [],
          page: 1,
          pageSize: 10,
          total: '0',
          totalPages: 0,
          hasNext: false,
          hasPrevious: false,
        }),
      }),
    );
  });

  it('近7天时间筛选下六宫格环比文案为与前7天对比', async () => {
    vi.mocked(useQuery).mockImplementation(
      createDatacenterUseQueryImplementation({
        mockUseQuery,
        getOverviewForTimeRange: (tr) =>
          createMockOverviewData({ timeRange: tr }),
        getAccountData: () => createMockAccountData(),
        getWarningData: () => createMockWarningData(),
        getTrendForTimeRange: (tr) => {
          const granularity =
            tr === 'today' ? 'hour' : tr === 'thisYear' ? 'month' : 'day';
          return createMockTrendData({ granularity });
        },
        getContentsData: () => createMockContentsData(),
      }),
    );

    render(<DataCentre />);

    await waitFor(() => {
      expect(screen.getByText('总播放量')).toBeInTheDocument();
    });

    const timeLabel = screen.getByText('时间');
    const selector = timeLabel.nextElementSibling?.querySelector(
      '.ant-select-selector',
    ) as HTMLElement | null;
    if (selector) {
      fireEvent.mouseDown(selector);
    }

    await waitFor(() => {
      const options = screen.getAllByText('近7天');
      fireEvent.click(options[options.length - 1]);
    });

    await waitFor(() => {
      expect(screen.getAllByText('与前7天对比').length).toBeGreaterThan(0);
    });
  }, 15000);

  it('内容表现列表点击账号名称跳转账号详情', async () => {
    vi.mocked(contentsQueryOptions).mockImplementation(
      (params: ContentsQueryParams) => ({
        queryKey: ['statistics', 'contents', params],
        queryFn: async (): Promise<PageContentPerformanceResponse> =>
          createMockContentsData() as PageContentPerformanceResponse,
      }),
    );

    vi.mocked(useQuery).mockImplementation(
      createDatacenterUseQueryImplementation({
        mockUseQuery,
        getOverviewForTimeRange: (tr) =>
          createMockOverviewData({ timeRange: tr }),
        getAccountData: () => createMockAccountData(),
        getWarningData: () => createMockWarningData(),
        getTrendForTimeRange: (tr) => {
          const granularity =
            tr === 'today' ? 'hour' : tr === 'thisYear' ? 'month' : 'day';
          return createMockTrendData({ granularity });
        },
        getContentsData: () => createMockContentsData(),
      }),
    );

    render(<DataCentre />);

    await waitFor(() => {
      expect(screen.getByText('12.5万')).toBeInTheDocument();
    });

    await fireClickContentPerformanceAccountLink('时尚美妆号');

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith(
        '/datacenter/account/acc-001?from=datacenter',
      );
    });
  });

  it('需求验收 requirements.feature：播放量 12000 在列表显示为 1.2万', async () => {
    const payload = createMockContentsData({
      list: [
        {
          contentId: '1',
          title: '测试内容',
          accountId: 'acc-001',
          accountName: '时尚美妆号',
          platform: 'douyin',
          contentType: 'video',
          playCount: '12000',
          likeCount: '8900',
          commentCount: '1200',
          shareCount: '560',
          engagementRate: '8.56',
        },
      ],
    }) as PageContentPerformanceResponse;

    vi.mocked(contentsQueryOptions).mockImplementation(
      (params: ContentsQueryParams) => ({
        queryKey: ['statistics', 'contents', params],
        queryFn: async (): Promise<PageContentPerformanceResponse> => payload,
      }),
    );

    vi.mocked(useQuery).mockImplementation(
      createDatacenterUseQueryImplementation({
        mockUseQuery,
        getOverviewForTimeRange: (tr) =>
          createMockOverviewData({ timeRange: tr }),
        getAccountData: () => createMockAccountData(),
        getWarningData: () => createMockWarningData(),
        getTrendForTimeRange: (tr) => {
          const granularity =
            tr === 'today' ? 'hour' : tr === 'thisYear' ? 'month' : 'day';
          return createMockTrendData({ granularity });
        },
        getContentsData: () => payload,
      }),
    );

    render(<DataCentre />);

    await waitFor(() => {
      expect(screen.getByText('1.2万')).toBeInTheDocument();
    });
  });

  it('需求验收 requirements.feature：播放量 1.2亿 在列表显示为 1.2亿', async () => {
    const payload = createMockContentsData({
      list: [
        {
          contentId: '1',
          title: '测试内容',
          accountId: 'acc-001',
          accountName: '时尚美妆号',
          platform: 'douyin',
          contentType: 'video',
          playCount: '120000000',
          likeCount: '8900',
          commentCount: '1200',
          shareCount: '560',
          engagementRate: '8.56',
        },
      ],
    }) as PageContentPerformanceResponse;

    vi.mocked(contentsQueryOptions).mockImplementation(
      (params: ContentsQueryParams) => ({
        queryKey: ['statistics', 'contents', params],
        queryFn: async (): Promise<PageContentPerformanceResponse> => payload,
      }),
    );

    vi.mocked(useQuery).mockImplementation(
      createDatacenterUseQueryImplementation({
        mockUseQuery,
        getOverviewForTimeRange: (tr) =>
          createMockOverviewData({ timeRange: tr }),
        getAccountData: () => createMockAccountData(),
        getWarningData: () => createMockWarningData(),
        getTrendForTimeRange: (tr) => {
          const granularity =
            tr === 'today' ? 'hour' : tr === 'thisYear' ? 'month' : 'day';
          return createMockTrendData({ granularity });
        },
        getContentsData: () => payload,
      }),
    );

    render(<DataCentre />);

    await waitFor(() => {
      expect(screen.getByText('1.2亿')).toBeInTheDocument();
    });
  });

  it('测试验收 test.feature：播放量超过万显示缩略 — 12.5万', async () => {
    vi.mocked(contentsQueryOptions).mockImplementation(
      (params: ContentsQueryParams) => ({
        queryKey: ['statistics', 'contents', params],
        queryFn: async (): Promise<PageContentPerformanceResponse> =>
          compactPlayCount125kPayload,
      }),
    );

    vi.mocked(useQuery).mockImplementation(
      createDatacenterUseQueryImplementation({
        mockUseQuery,
        getOverviewForTimeRange: (tr) =>
          createMockOverviewData({ timeRange: tr }),
        getAccountData: () => createMockAccountData(),
        getWarningData: () => createMockWarningData(),
        getTrendForTimeRange: (tr) => {
          const granularity =
            tr === 'today' ? 'hour' : tr === 'thisYear' ? 'month' : 'day';
          return createMockTrendData({ granularity });
        },
        getContentsData: () => compactPlayCount125kPayload,
      }),
    );

    render(<DataCentre />);

    await waitFor(() => {
      expect(screen.getByText('12.5万')).toBeInTheDocument();
    });
  });

  it('测试验收 test.feature：播放量超过万显示缩略 — 1.3亿', async () => {
    vi.mocked(contentsQueryOptions).mockImplementation(
      (params: ContentsQueryParams) => ({
        queryKey: ['statistics', 'contents', params],
        queryFn: async (): Promise<PageContentPerformanceResponse> =>
          compactPlayCount125mPayload,
      }),
    );

    vi.mocked(useQuery).mockImplementation(
      createDatacenterUseQueryImplementation({
        mockUseQuery,
        getOverviewForTimeRange: (tr) =>
          createMockOverviewData({ timeRange: tr }),
        getAccountData: () => createMockAccountData(),
        getWarningData: () => createMockWarningData(),
        getTrendForTimeRange: (tr) => {
          const granularity =
            tr === 'today' ? 'hour' : tr === 'thisYear' ? 'month' : 'day';
          return createMockTrendData({ granularity });
        },
        getContentsData: () => compactPlayCount125mPayload,
      }),
    );

    render(<DataCentre />);

    await waitFor(() => {
      expect(screen.getByText('1.3亿')).toBeInTheDocument();
    });
  });

  it('账号下拉走数据中心专属候选池接口，platform 参数透传', async () => {
    const accountOptionsQueryOptionsMock = vi.mocked(
      accountOptionsQueryOptions,
    );

    vi.mocked(useQuery).mockImplementation(
      createDatacenterUseQueryImplementation({
        mockUseQuery,
        getOverviewForTimeRange: (tr) =>
          createMockOverviewData({ timeRange: tr }),
        getAccountData: () => createMockAccountData(),
        getWarningData: () => createMockWarningData(),
        getTrendForTimeRange: (tr) => {
          const granularity =
            tr === 'today' ? 'hour' : tr === 'thisYear' ? 'month' : 'day';
          return createMockTrendData({ granularity });
        },
        getContentsData: () => createMockContentsData(),
      }),
    );

    render(<DataCentre />);

    await waitFor(() => {
      // 与同 controller 其他读接口共享一把尺：走 datacenter/accounts/options 而非通用 /accounts
      expect(accountOptionsQueryOptionsMock).toHaveBeenCalledWith(
        expect.objectContaining({ platform: expect.anything() }),
      );
      // SHALL NOT 再使用通用账号管理接口的 pageSize 模式
      const callArgs = accountOptionsQueryOptionsMock.mock.calls.flat();
      callArgs.forEach((arg) => {
        if (arg && typeof arg === 'object') {
          expect(arg).not.toHaveProperty('pageSize');
        }
      });
    });
  });

  it('localStorage 持久化的 savedAccountId 不在候选池内时回退到候选池首项', async () => {
    // GIVEN: localStorage 中存有一个不在候选池内的 accountId（如老的 / 已删除的账号）
    const STORAGE_KEY = 'datacenter_trend_account_id';
    localStorage.setItem(STORAGE_KEY, 'acc-deleted');

    const playTrendQueryOptionsMock = vi.mocked(playTrendQueryOptions);

    vi.mocked(useQuery).mockImplementation(
      createDatacenterUseQueryImplementation({
        mockUseQuery,
        getOverviewForTimeRange: (tr) =>
          createMockOverviewData({ timeRange: tr }),
        getAccountData: () => createMockAccountData(),
        getWarningData: () => createMockWarningData(),
        getTrendForTimeRange: (tr) => {
          const granularity =
            tr === 'today' ? 'hour' : tr === 'thisYear' ? 'month' : 'day';
          return createMockTrendData({ granularity });
        },
        getContentsData: () => createMockContentsData(),
      }),
    );

    render(<DataCentre />);

    await waitFor(() => {
      // 趋势 query 最终 accountId 应回退到候选池首项 acc-001，而不是 'acc-deleted'
      const accountIdsUsed = playTrendQueryOptionsMock.mock.calls
        .map(
          (args: unknown[]) => (args[0] as { accountId?: string })?.accountId,
        )
        .filter(Boolean);
      expect(accountIdsUsed).toContain('acc-001');
      expect(accountIdsUsed[accountIdsUsed.length - 1]).toBe('acc-001');
    });

    localStorage.removeItem(STORAGE_KEY);
  });

  it('趋势查询返回 40401（账号已不可见）时清掉 localStorage 并回退候选池首项', async () => {
    const STORAGE_KEY = 'datacenter_trend_account_id';
    localStorage.setItem(STORAGE_KEY, 'acc-001');

    const errWith404 = new Error('账号不存在或无权访问') as Error & {
      code?: number;
    };
    errWith404.code = 40401;

    vi.mocked(useQuery).mockImplementation((options) => {
      const queryKey =
        (options as { queryKey?: readonly unknown[] }).queryKey ?? [];
      const [scope, resource] = queryKey;
      if (scope === 'statistics' && resource === 'accountOptions') {
        return mockUseQuery({
          data: [
            {
              id: 'acc-fallback',
              nickname: '回退首项',
              platform: 'douyin',
              status: 'ONLINE',
              avatar: null,
            },
            {
              id: 'acc-001',
              nickname: '原选中',
              platform: 'douyin',
              status: 'ONLINE',
              avatar: null,
            },
          ],
        });
      }
      if (scope === 'statistics' && resource === 'playTrend') {
        return mockUseQuery({ error: errWith404, isError: true });
      }
      if (scope === 'statistics' && resource === 'overview') {
        return mockUseQuery({ data: createMockOverviewData() });
      }
      if (scope === 'alert' && resource === 'warningList') {
        return mockUseQuery({ data: createMockWarningData() });
      }
      if (scope === 'statistics' && resource === 'contents') {
        return mockUseQuery({ data: createMockContentsData() });
      }
      return mockUseQuery();
    });

    render(<DataCentre />);

    await waitFor(() => {
      // localStorage 应被清掉
      expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
    });
  });
});
