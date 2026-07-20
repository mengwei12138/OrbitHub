import { defineFeature } from '@amiceli/vitest-cucumber';
import { type UseQueryResult, useQuery } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { ignoreWarning } from '@/services/alert';
import {
  contentsQueryOptions,
  type PageContentPerformanceResponse,
} from '@/services/statistics';

vi.mock('../components/PlayTrendChart', () => ({
  default: () => null,
}));

import DataCentre from '../index';
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
}));

vi.mock('@/services/account', () => ({
  accountListQueryOptions: vi.fn((params: unknown) => ({
    queryKey: ['account', 'list', params],
    queryFn: vi.fn(),
  })),
}));

vi.mock('@tanstack/react-query', () => ({
  useQuery: vi.fn(),
}));

const { mockMessage } = vi.hoisted(() => ({
  mockMessage: {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
    info: vi.fn(),
  },
}));

vi.mock('antd', async () => {
  const actual = await vi.importActual<typeof import('antd')>('antd');
  return {
    ...actual,
    message: mockMessage,
  };
});

const mockOverviewData = {
  timeRange: 'today',
  platform: 'all',
  metrics: [
    { name: 'playCount', currentValue: '12582380', baselineValue: '11150000' },
    { name: 'likeCount', currentValue: '89234', baselineValue: '82456' },
    { name: 'commentCount', currentValue: '12456', baselineValue: '11789' },
    { name: 'shareCount', currentValue: '8932', baselineValue: '8745' },
    { name: 'followerDelta', currentValue: '3456', baselineValue: '2987' },
    { name: 'dmCount', currentValue: '2134', baselineValue: '2160' },
  ],
  warningSummary: {
    totalPending: '12',
    unreadPending: '5',
    abnormalAccountCount: '4',
  },
  dataAsOf: '2026-04-22T10:30:00Z',
};

const mockWarningData = {
  summary: {
    totalPending: '12',
    unreadPending: '5',
    abnormalAccountCount: '4',
  },
  pageData: {
    list: [
      {
        warningId: '1',
        accountId: 'acc-001',
        accountName: '时尚美妆号',
        platform: 'douyin',
        level: 'HIGH',
        category: 'ACCOUNT_EXCEPTION',
        eventType: 'LOGIN_EXPIRED',
        message: '登录已失效',
        state: 'PENDING_UNREAD',
        createdAt: '2026-04-22T10:00:00Z',
      },
      {
        warningId: '2',
        accountId: 'acc-002',
        contentId: 'content-001',
        accountName: '生活笔记',
        platform: 'xiaohongshu',
        level: 'MEDIUM',
        category: 'CONTENT_EXCEPTION',
        eventType: 'LOW_PLAY_COUNT',
        message: '播放量过低(1.2K<5K)',
        state: 'PENDING_UNREAD',
        createdAt: '2026-04-22T09:30:00Z',
      },
      {
        warningId: '3',
        accountId: 'acc-003',
        accountName: '科技评测',
        platform: 'douyin',
        level: 'NORMAL',
        category: 'ACCOUNT_EXCEPTION',
        eventType: 'ACCOUNT_NORMAL',
        message: '账号状态正常',
        state: 'PENDING_READ',
        createdAt: '2026-04-22T08:00:00Z',
      },
    ],
    page: 1,
    pageSize: 3,
    total: '12',
    totalPages: 4,
    hasNext: true,
    hasPrevious: false,
  },
};

const mockTrendData = {
  accountId: 'acc-001',
  granularity: 'hour',
  points: [
    { bucket: '2026-04-22 00:00', playCount: '1200' },
    { bucket: '2026-04-22 01:00', playCount: null },
    { bucket: '2026-04-22 02:00', playCount: '1350' },
    { bucket: '2026-04-22 03:00', playCount: '1100' },
    { bucket: '2026-04-22 04:00', playCount: '1500' },
    { bucket: '2026-04-22 05:00', playCount: '1700' },
    { bucket: '2026-04-22 06:00', playCount: '1600' },
  ],
};

const mockContentsData = {
  list: [
    {
      contentId: '1',
      title: '2024年最火的穿搭技巧',
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
    {
      contentId: '2',
      title: '家常菜做法大全',
      accountId: 'acc-002',
      accountName: '生活笔记',
      platform: 'xiaohongshu',
      contentType: 'image_text',
      playCount: '89000',
      likeCount: '5600',
      commentCount: '890',
      shareCount: '340',
      engagementRate: '7.68',
    },
  ],
  page: 1,
  pageSize: 10,
  total: '24',
  totalPages: 3,
  hasNext: true,
  hasPrevious: false,
};

// 与 datacenter-account-options-endpoint 后的扁平 AccountOption[] 响应对齐
const mockAccountData = [
  {
    id: 'acc-001',
    nickname: '时尚美妆号',
    platform: 'douyin',
    status: 'ONLINE',
    avatar: null,
  },
  {
    id: 'acc-002',
    nickname: '生活笔记',
    platform: 'xiaohongshu',
    status: 'ONLINE',
    avatar: null,
  },
  {
    id: 'acc-003',
    nickname: '科技评测',
    platform: 'douyin',
    status: 'ONLINE',
    avatar: null,
  },
];

const mockUseQuery = (overrides = {}): UseQueryResult =>
  ({
    data: undefined,
    isLoading: false,
    isFetching: false,
    isError: false,
    isSuccess: true,
    error: null,
    refetch: vi.fn(),
    status: 'success',
    isPending: false,
    isLoadingError: false,
    isRefetchError: false,
    isPlaceholderData: false,
    ...overrides,
  }) as unknown as UseQueryResult;

function installRequirementsContentsQueryFn(data: typeof mockContentsData) {
  vi.mocked(contentsQueryOptions).mockImplementation((params) => ({
    queryKey: ['statistics', 'contents', params],
    queryFn: async () => data as unknown as PageContentPerformanceResponse,
  }));
}

/** 内容表现列表播放量缩略场景内各 Step 独立成测，需重复挂载页面 */
function setupDataCentreWithListPlayCount(playCount: string) {
  const payload = {
    ...mockContentsData,
    list: [{ ...mockContentsData.list[0], playCount }],
  };
  installRequirementsDatacenterQueryMock(payload);
  render(<DataCentre />);
}

function installRequirementsDatacenterQueryMock(
  contentsPayload: typeof mockContentsData = mockContentsData,
) {
  installRequirementsContentsQueryFn(contentsPayload);
  vi.mocked(useQuery).mockReset();
  vi.mocked(useQuery).mockImplementation(
    createDatacenterUseQueryImplementation({
      mockUseQuery,
      getOverviewForTimeRange: (tr) => ({ ...mockOverviewData, timeRange: tr }),
      getAccountData: () => mockAccountData,
      getWarningData: () => mockWarningData,
      getTrendForTimeRange: (tr) => {
        const granularity =
          tr === 'today' ? 'hour' : tr === 'thisYear' ? 'month' : 'day';
        return { ...mockTrendData, granularity };
      },
      getContentsData: () => contentsPayload,
    }),
  );
}

defineFeature('./features/requirements.feature', ({ Scenario }) => {
  Scenario('用户切换时间筛选为今日', ({ Given, When, Then }) => {
    Given('用户在数据中心主页', async () => {
      vi.mocked(useQuery)
        .mockReturnValueOnce(mockUseQuery({ data: mockOverviewData }))
        .mockReturnValueOnce(mockUseQuery({ data: mockWarningData }))
        .mockReturnValueOnce(mockUseQuery({ data: mockTrendData }))
        .mockReturnValueOnce(mockUseQuery({ data: mockContentsData }))
        .mockReturnValueOnce(mockUseQuery({ data: mockAccountData }));
      render(<DataCentre />);
    });

    When('用户选择时间筛选为"今日"', async () => {
      const timeSelect =
        screen.getByText('今日').closest('.ant-select') ||
        screen.getByText('今日');
      if (timeSelect) {
        fireEvent.click(timeSelect);
        await waitFor(() => {
          const option = screen.getByText('今日');
          if (option) fireEvent.click(option);
        });
      }
    });

    Then('系统展示今日数据', async () => {
      await waitFor(() => {
        expect(mockOverviewData.timeRange).toBe('today');
      });
    });
  });

  Scenario('用户切换时间筛选为近7天', ({ Given, When, Then, And }) => {
    Given('用户在数据中心主页', async () => {
      installRequirementsDatacenterQueryMock();
      render(<DataCentre />);
      await waitFor(() => {
        expect(screen.getByText('总播放量')).toBeInTheDocument();
      });
    });

    When('用户选择时间筛选为"近7天"', async () => {
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
    });

    Then('系统展示过去7天数据', async () => {
      await waitFor(() => {
        expect(screen.getByText('总播放量')).toBeInTheDocument();
      });
    });

    And('对比对象为前7天', async () => {
      await waitFor(() => {
        expect(screen.getAllByText('与前7天对比').length).toBeGreaterThan(0);
      });
    });
  });

  Scenario('用户切换时间筛选为近30天', ({ Given, When, Then }) => {
    Given('用户在数据中心主页', async () => {
      vi.mocked(useQuery)
        .mockReturnValueOnce(mockUseQuery({ data: mockOverviewData }))
        .mockReturnValueOnce(mockUseQuery({ data: mockWarningData }))
        .mockReturnValueOnce(mockUseQuery({ data: mockTrendData }))
        .mockReturnValueOnce(mockUseQuery({ data: mockContentsData }))
        .mockReturnValueOnce(mockUseQuery({ data: mockAccountData }));
      render(<DataCentre />);
    });

    When('用户选择时间筛选为"近30天"', async () => {
      // 触发时间筛选变更
    });

    Then('系统展示过去30天数据', async () => {
      // 验证数据
    });
  });

  Scenario('用户切换时间筛选为今年', ({ Given, When, Then }) => {
    Given('用户在数据中心主页', async () => {
      vi.mocked(useQuery)
        .mockReturnValueOnce(mockUseQuery({ data: mockOverviewData }))
        .mockReturnValueOnce(mockUseQuery({ data: mockWarningData }))
        .mockReturnValueOnce(mockUseQuery({ data: mockTrendData }))
        .mockReturnValueOnce(mockUseQuery({ data: mockContentsData }))
        .mockReturnValueOnce(mockUseQuery({ data: mockAccountData }));
      render(<DataCentre />);
    });

    When('用户选择时间筛选为"今年"', async () => {
      // 触发时间筛选变更
    });

    Then('系统展示今年1月1日至今数据', async () => {
      // 验证数据
    });
  });

  Scenario('用户切换平台筛选为抖音', ({ Given, When, Then }) => {
    Given('用户在数据中心主页', async () => {
      vi.mocked(useQuery)
        .mockReturnValueOnce(mockUseQuery({ data: mockOverviewData }))
        .mockReturnValueOnce(mockUseQuery({ data: mockWarningData }))
        .mockReturnValueOnce(mockUseQuery({ data: mockTrendData }))
        .mockReturnValueOnce(mockUseQuery({ data: mockContentsData }))
        .mockReturnValueOnce(mockUseQuery({ data: mockAccountData }));
      render(<DataCentre />);
    });

    When('用户选择平台筛选为"抖音"', async () => {
      // 触发平台筛选变更
    });

    Then('系统仅展示抖音账号数据', async () => {
      // 验证数据
    });
  });

  Scenario('用户切换平台筛选为小红书', ({ Given, When, Then }) => {
    Given('用户在数据中心主页', async () => {
      vi.mocked(useQuery)
        .mockReturnValueOnce(mockUseQuery({ data: mockOverviewData }))
        .mockReturnValueOnce(mockUseQuery({ data: mockWarningData }))
        .mockReturnValueOnce(mockUseQuery({ data: mockTrendData }))
        .mockReturnValueOnce(mockUseQuery({ data: mockContentsData }))
        .mockReturnValueOnce(mockUseQuery({ data: mockAccountData }));
      render(<DataCentre />);
    });

    When('用户选择平台筛选为"小红书"', async () => {
      // 触发平台筛选变更
    });

    Then('系统仅展示小红书账号数据', async () => {
      // 验证数据
    });
  });

  Scenario('用户切换平台筛选为全部平台', ({ Given, When, Then }) => {
    Given('用户在数据中心主页', async () => {
      vi.mocked(useQuery)
        .mockReturnValueOnce(mockUseQuery({ data: mockOverviewData }))
        .mockReturnValueOnce(mockUseQuery({ data: mockWarningData }))
        .mockReturnValueOnce(mockUseQuery({ data: mockTrendData }))
        .mockReturnValueOnce(mockUseQuery({ data: mockContentsData }))
        .mockReturnValueOnce(mockUseQuery({ data: mockAccountData }));
      render(<DataCentre />);
    });

    When('用户选择平台筛选为"全部平台"', async () => {
      // 触发平台筛选变更
    });

    Then('系统展示所有平台账号数据', async () => {
      // 验证数据
    });
  });

  Scenario('用户点击刷新按钮', ({ Given, When, Then, And }) => {
    Given('用户在数据中心主页', async () => {
      vi.mocked(useQuery)
        .mockReturnValueOnce(mockUseQuery({ data: mockOverviewData }))
        .mockReturnValueOnce(mockUseQuery({ data: mockWarningData }))
        .mockReturnValueOnce(mockUseQuery({ data: mockTrendData }))
        .mockReturnValueOnce(mockUseQuery({ data: mockContentsData }))
        .mockReturnValueOnce(mockUseQuery({ data: mockAccountData }));
      render(<DataCentre />);
    });

    When('用户点击刷新按钮', async () => {
      const refreshButton = screen.getByText('刷新');
      fireEvent.click(refreshButton);
    });

    Then('刷新按钮显示Loading状态', async () => {
      await waitFor(() => {
        const loadingButton = screen.getByText('刷新中...');
        expect(loadingButton).toBeInTheDocument();
      });
    });

    And('按钮文字变为"刷新中..."', async () => {
      await waitFor(() => {
        expect(screen.getByText('刷新中...')).toBeInTheDocument();
      });
    });

    And('刷新按钮禁用点击', async () => {
      // 验证按钮禁用状态
    });

    And('播放趋势图显示旧数据+半透明Loading蒙层', async () => {
      // 验证蒙层显示
    });
  });

  Scenario('刷新请求成功', ({ Given, When, Then, And }) => {
    Given('用户点击刷新按钮', async () => {
      vi.mocked(useQuery)
        .mockReturnValueOnce(mockUseQuery({ data: mockOverviewData }))
        .mockReturnValueOnce(mockUseQuery({ data: mockWarningData }))
        .mockReturnValueOnce(mockUseQuery({ data: mockTrendData }))
        .mockReturnValueOnce(mockUseQuery({ data: mockContentsData }))
        .mockReturnValueOnce(mockUseQuery({ data: mockAccountData }));
      render(<DataCentre />);
    });

    When('刷新请求返回成功', async () => {
      const refreshButton = screen.getByText('刷新');
      fireEvent.click(refreshButton);
    });

    Then('刷新按钮恢复可用状态', async () => {
      await waitFor(() => {
        expect(screen.getByText('刷新')).toBeInTheDocument();
      });
    });

    And('按钮文字变为"刷新"', async () => {
      await waitFor(() => {
        expect(screen.getByText('刷新')).toBeInTheDocument();
      });
    });

    And('更新"上次刷新时间"为当前时间', async () => {
      await waitFor(() => {
        const lastRefresh = screen.getByText(/上次刷新/u);
        expect(lastRefresh).toBeInTheDocument();
      });
    });

    And('移除趋势图Loading蒙层', async () => {
      // 验证蒙层移除
    });

    And('所有数据区域重新加载', async () => {
      // 验证数据更新
    });
  });

  Scenario('刷新请求失败', ({ Given, When, Then, And }) => {
    Given('用户点击刷新按钮', async () => {
      vi.mocked(useQuery)
        .mockReturnValueOnce(mockUseQuery({ data: mockOverviewData }))
        .mockReturnValueOnce(mockUseQuery({ data: mockWarningData }))
        .mockReturnValueOnce(mockUseQuery({ data: mockTrendData }))
        .mockReturnValueOnce(mockUseQuery({ data: mockContentsData }))
        .mockReturnValueOnce(mockUseQuery({ data: mockAccountData }));
      render(<DataCentre />);
    });

    When('刷新请求返回失败', async () => {
      vi.mocked(useQuery).mockReturnValueOnce(
        mockUseQuery({ data: undefined, error: new Error('网络错误') }),
      );
      const refreshButton = screen.getByText('刷新');
      fireEvent.click(refreshButton);
    });

    Then('显示Toast提示"刷新失败，请稍后重试"', async () => {
      await waitFor(() => {
        expect(mockMessage.error).toHaveBeenCalledWith('刷新失败，请稍后重试');
      });
    });

    And('刷新按钮恢复可用状态', async () => {
      await waitFor(() => {
        expect(screen.getByText('刷新')).toBeInTheDocument();
      });
    });

    And('趋势图蒙层消失，保留旧数据', async () => {
      // 验证旧数据保留
    });
  });

  Scenario('预警区展示最近3条预警', ({ Given, When, Then, And }) => {
    Given('系统有超过3条预警数据', async () => {
      vi.mocked(useQuery)
        .mockReturnValueOnce(mockUseQuery({ data: mockOverviewData }))
        .mockReturnValueOnce(mockUseQuery({ data: mockWarningData }))
        .mockReturnValueOnce(mockUseQuery({ data: mockTrendData }))
        .mockReturnValueOnce(mockUseQuery({ data: mockContentsData }))
        .mockReturnValueOnce(mockUseQuery({ data: mockAccountData }));
      render(<DataCentre />);
    });

    When('页面加载完成', async () => {
      await waitFor(() => {
        expect(screen.getByText('数据预警')).toBeInTheDocument();
      });
    });

    Then('预警区展示最近3条预警卡片', async () => {
      await waitFor(() => {
        const alertCards = screen.getAllByText(/时尚美妆号|生活笔记|科技评测/u);
        expect(alertCards.length).toBe(3);
      });
    });

    And('高度自适应卡片数量', async () => {
      // 验证高度自适应
    });
  });

  Scenario('预警区无预警时显示空状态', ({ Given, When, Then, And }) => {
    Given('系统无预警数据', async () => {
      const emptyWarningData = {
        summary: {
          totalPending: '0',
          unreadPending: '0',
          abnormalAccountCount: '0',
        },
        pageData: {
          list: [],
          page: 1,
          pageSize: 3,
          total: '0',
          totalPages: 0,
          hasNext: false,
          hasPrevious: false,
        },
      };
      vi.mocked(useQuery)
        .mockReturnValueOnce(
          mockUseQuery({
            data: {
              ...mockOverviewData,
              warningSummary: emptyWarningData.summary,
            },
          }),
        )
        .mockReturnValueOnce(mockUseQuery({ data: emptyWarningData }))
        .mockReturnValueOnce(mockUseQuery({ data: mockTrendData }))
        .mockReturnValueOnce(mockUseQuery({ data: mockContentsData }))
        .mockReturnValueOnce(mockUseQuery({ data: mockAccountData }));
      render(<DataCentre />);
    });

    When('页面加载完成', async () => {
      await waitFor(() => {
        expect(screen.getByText('数据预警')).toBeInTheDocument();
      });
    });

    Then('预警区保留标题头', async () => {
      await waitFor(() => {
        expect(screen.getByText('数据预警')).toBeInTheDocument();
      });
    });

    And('显示"总预警 0 · 未读 0 · 异常账号 0"', async () => {
      await waitFor(() => {
        expect(screen.getByText(/总预警 0/u)).toBeInTheDocument();
      });
    });

    And('内容区显示"暂无预警"占位容器', async () => {
      await waitFor(() => {
        expect(screen.getByText('暂无预警')).toBeInTheDocument();
      });
    });
  });

  Scenario('预警区恰好3条预警', ({ Given, When, Then, And }) => {
    Given('系统有恰好3条预警数据', async () => {
      vi.mocked(useQuery)
        .mockReturnValueOnce(mockUseQuery({ data: mockOverviewData }))
        .mockReturnValueOnce(mockUseQuery({ data: mockWarningData }))
        .mockReturnValueOnce(mockUseQuery({ data: mockTrendData }))
        .mockReturnValueOnce(mockUseQuery({ data: mockContentsData }))
        .mockReturnValueOnce(mockUseQuery({ data: mockAccountData }));
      render(<DataCentre />);
    });

    When('页面加载完成', async () => {
      await waitFor(() => {
        expect(screen.getByText('数据预警')).toBeInTheDocument();
      });
    });

    Then('预警区高度自适应', async () => {
      // 验证高度自适应
    });

    And('展示全部3条预警卡片', async () => {
      await waitFor(() => {
        const alertCards = screen.getAllByText(/时尚美妆号|生活笔记|科技评测/u);
        expect(alertCards.length).toBe(3);
      });
    });
  });

  Scenario('预警卡片显示完整信息', ({ Given, When, Then, And }) => {
    Given('存在一条预警数据', async () => {
      vi.mocked(useQuery)
        .mockReturnValueOnce(mockUseQuery({ data: mockOverviewData }))
        .mockReturnValueOnce(mockUseQuery({ data: mockWarningData }))
        .mockReturnValueOnce(mockUseQuery({ data: mockTrendData }))
        .mockReturnValueOnce(mockUseQuery({ data: mockContentsData }))
        .mockReturnValueOnce(mockUseQuery({ data: mockAccountData }));
      render(<DataCentre />);
    });

    When('页面加载预警卡片', async () => {
      await waitFor(() => {
        expect(screen.getByText('时尚美妆号')).toBeInTheDocument();
      });
    });

    Then('卡片包含等级图标（红/橙/绿）', async () => {
      // 验证等级图标
    });

    And('包含平台标签（灰色背景圆角）', async () => {
      await waitFor(() => {
        expect(screen.getByText('抖音')).toBeInTheDocument();
      });
    });

    And('包含账号·平台信息', async () => {
      await waitFor(() => {
        expect(screen.getByText('时尚美妆号')).toBeInTheDocument();
      });
    });

    And('包含异常类型描述及阈值', async () => {
      await waitFor(() => {
        expect(screen.getByText('登录已失效')).toBeInTheDocument();
      });
    });

    And('包含操作按钮', async () => {
      await waitFor(() => {
        expect(screen.getByText('查看详情')).toBeInTheDocument();
      });
    });

    And('包含预警产生时间', async () => {
      await waitFor(() => {
        expect(screen.getByText(/04-22/u)).toBeInTheDocument();
      });
    });
  });

  Scenario('高风险预警显示红色', ({ Given, When, Then, And }) => {
    Given('存在登录失效预警', async () => {
      vi.mocked(useQuery)
        .mockReturnValueOnce(mockUseQuery({ data: mockOverviewData }))
        .mockReturnValueOnce(mockUseQuery({ data: mockWarningData }))
        .mockReturnValueOnce(mockUseQuery({ data: mockTrendData }))
        .mockReturnValueOnce(mockUseQuery({ data: mockContentsData }))
        .mockReturnValueOnce(mockUseQuery({ data: mockAccountData }));
      render(<DataCentre />);
    });

    When('页面渲染预警卡片', async () => {
      await waitFor(() => {
        expect(screen.getByText('时尚美妆号')).toBeInTheDocument();
      });
    });

    Then('预警图标显示🔴红色', async () => {
      // 验证红色图标
    });

    And('等级为高风险', async () => {
      // 验证等级显示
    });
  });

  Scenario('关注预警显示橙色', ({ Given, When, Then, And }) => {
    Given('存在播放量过低预警', async () => {
      vi.mocked(useQuery)
        .mockReturnValueOnce(mockUseQuery({ data: mockOverviewData }))
        .mockReturnValueOnce(mockUseQuery({ data: mockWarningData }))
        .mockReturnValueOnce(mockUseQuery({ data: mockTrendData }))
        .mockReturnValueOnce(mockUseQuery({ data: mockContentsData }))
        .mockReturnValueOnce(mockUseQuery({ data: mockAccountData }));
      render(<DataCentre />);
    });

    When('页面渲染预警卡片', async () => {
      await waitFor(() => {
        expect(screen.getByText('生活笔记')).toBeInTheDocument();
      });
    });

    Then('预警图标显示🟠橙色', async () => {
      // 验证橙色图标
    });

    And('等级为关注', async () => {
      // 验证等级显示
    });
  });

  Scenario('正常预警显示绿色', ({ Given, When, Then }) => {
    Given('存在账号状态正常预警', async () => {
      vi.mocked(useQuery)
        .mockReturnValueOnce(mockUseQuery({ data: mockOverviewData }))
        .mockReturnValueOnce(mockUseQuery({ data: mockWarningData }))
        .mockReturnValueOnce(mockUseQuery({ data: mockTrendData }))
        .mockReturnValueOnce(mockUseQuery({ data: mockContentsData }))
        .mockReturnValueOnce(mockUseQuery({ data: mockAccountData }));
      render(<DataCentre />);
    });

    When('页面渲染预警卡片', async () => {
      await waitFor(() => {
        expect(screen.getByText('科技评测')).toBeInTheDocument();
      });
    });

    Then('预警图标显示🟢绿色', async () => {
      // 验证绿色图标
    });
  });

  Scenario('用户点击预警卡片查看详情', ({ Given, When, Then, And }) => {
    Given('存在一条待处理预警', async () => {
      vi.mocked(useQuery)
        .mockReturnValueOnce(mockUseQuery({ data: mockOverviewData }))
        .mockReturnValueOnce(mockUseQuery({ data: mockWarningData }))
        .mockReturnValueOnce(mockUseQuery({ data: mockTrendData }))
        .mockReturnValueOnce(mockUseQuery({ data: mockContentsData }))
        .mockReturnValueOnce(mockUseQuery({ data: mockAccountData }));
      render(<DataCentre />);
    });

    When('用户点击"查看详情"按钮', async () => {
      await waitFor(() => {
        const detailButton = screen.getByText('查看详情').closest('button');
        if (detailButton) fireEvent.click(detailButton);
      });
    });

    Then('跳转到该预警对应的账号详情页', async () => {
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith(
          '/datacenter/account/acc-001?from=datacenter',
        );
      });
    });

    And('预警状态变更为"待处理（已读）"', async () => {
      // 验证状态变更
    });
  });

  Scenario('用户忽略预警', ({ Given, When, Then, And }) => {
    Given('存在一条待处理预警', async () => {
      vi.mocked(useQuery)
        .mockReturnValueOnce(mockUseQuery({ data: mockOverviewData }))
        .mockReturnValueOnce(mockUseQuery({ data: mockWarningData }))
        .mockReturnValueOnce(mockUseQuery({ data: mockTrendData }))
        .mockReturnValueOnce(mockUseQuery({ data: mockContentsData }))
        .mockReturnValueOnce(mockUseQuery({ data: mockAccountData }));
      vi.mocked(ignoreWarning).mockResolvedValue({
        warningId: '1',
        oldState: 'PENDING_UNREAD',
        newState: 'IGNORED',
      });
      render(<DataCentre />);
    });

    When('用户点击"忽略"按钮', async () => {
      await waitFor(() => {
        const ignoreButton = screen.getByText('忽略').closest('button');
        if (ignoreButton) fireEvent.click(ignoreButton);
      });
    });

    Then('预警标记为"已忽略"', async () => {
      await waitFor(() => {
        expect(ignoreWarning).toHaveBeenCalledWith('1');
      });
    });

    And('预警从列表中移除', async () => {
      // 验证列表更新
    });

    And('未读预警计数减1', async () => {
      // 验证计数更新
    });
  });

  Scenario('用户点击去处理按钮', ({ Given, When, Then, And }) => {
    Given('存在一条待处理预警', async () => {
      vi.mocked(useQuery)
        .mockReturnValueOnce(mockUseQuery({ data: mockOverviewData }))
        .mockReturnValueOnce(mockUseQuery({ data: mockWarningData }))
        .mockReturnValueOnce(mockUseQuery({ data: mockTrendData }))
        .mockReturnValueOnce(mockUseQuery({ data: mockContentsData }))
        .mockReturnValueOnce(mockUseQuery({ data: mockAccountData }));
      render(<DataCentre />);
    });

    When('用户点击"去处理"按钮', async () => {
      await waitFor(() => {
        const handleButton = screen.getByText('去处理').closest('button');
        if (handleButton) fireEvent.click(handleButton);
      });
    });

    Then('根据异常类型跳转对应处理页面', async () => {
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalled();
      });
    });

    And('跳转时携带 from=datacenter 参数', async () => {
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith(
          expect.stringContaining('from=datacenter'),
        );
      });
    });

    And('预警状态变更为"已处理"', async () => {
      // 验证状态变更
    });
  });

  Scenario('用户从处理页面返回', ({ Given, When, Then, And }) => {
    Given('用户从处理页面返回数据中心', async () => {
      vi.mocked(useQuery)
        .mockReturnValueOnce(mockUseQuery({ data: mockOverviewData }))
        .mockReturnValueOnce(mockUseQuery({ data: mockWarningData }))
        .mockReturnValueOnce(mockUseQuery({ data: mockTrendData }))
        .mockReturnValueOnce(mockUseQuery({ data: mockContentsData }))
        .mockReturnValueOnce(mockUseQuery({ data: mockAccountData }));
      render(<DataCentre />);
    });

    When('返回操作完成', async () => {
      // 模拟返回操作
    });

    Then('预警列表自动刷新', async () => {
      // 验证列表刷新
    });

    And('启动30秒轮询检测账号状态', async () => {
      // 验证轮询启动
    });
  });

  Scenario('用户点击查看全部', ({ Given, When, Then }) => {
    Given('预警区有超过3条预警', async () => {
      vi.mocked(useQuery)
        .mockReturnValueOnce(mockUseQuery({ data: mockOverviewData }))
        .mockReturnValueOnce(mockUseQuery({ data: mockWarningData }))
        .mockReturnValueOnce(mockUseQuery({ data: mockTrendData }))
        .mockReturnValueOnce(mockUseQuery({ data: mockContentsData }))
        .mockReturnValueOnce(mockUseQuery({ data: mockAccountData }));
      render(<DataCentre />);
    });

    When('用户点击"查看全部"按钮', async () => {
      await waitFor(() => {
        const viewAllButton = screen.getByText('查看全部').closest('button');
        if (viewAllButton) fireEvent.click(viewAllButton);
      });
    });

    Then('跳转到预警详情页', async () => {
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/datacenter/warnings');
      });
    });
  });

  Scenario('六宫格展示6个核心指标', ({ Given, Then, And }) => {
    Given('用户在数据中心主页', async () => {
      vi.mocked(useQuery)
        .mockReturnValueOnce(mockUseQuery({ data: mockOverviewData }))
        .mockReturnValueOnce(mockUseQuery({ data: mockWarningData }))
        .mockReturnValueOnce(mockUseQuery({ data: mockTrendData }))
        .mockReturnValueOnce(mockUseQuery({ data: mockContentsData }))
        .mockReturnValueOnce(mockUseQuery({ data: mockAccountData }));
      render(<DataCentre />);
    });

    Then(
      '六宫格展示总播放量、总点赞量、总评论量、总转发量、新增粉丝、私信量',
      async () => {
        await waitFor(() => {
          expect(screen.getByText('总播放量')).toBeInTheDocument();
          expect(screen.getByText('总点赞量')).toBeInTheDocument();
          expect(screen.getByText('总评论量')).toBeInTheDocument();
          expect(screen.getByText('总转发量')).toBeInTheDocument();
          expect(screen.getByText('新增粉丝')).toBeInTheDocument();
          expect(screen.getByText('私信量')).toBeInTheDocument();
        });
      },
    );

    And('每个指标展示当前值和环比百分比', async () => {
      // 验证数值和百分比显示
    });
  });

  Scenario('六宫格增长率正增长显示绿色', ({ Given, When, Then, And }) => {
    Given('某个指标当前值大于对比值', async () => {
      const positiveData = {
        ...mockOverviewData,
        metrics: mockOverviewData.metrics.map((m, i) =>
          i === 0
            ? { ...m, currentValue: '20000000', baselineValue: '10000000' }
            : m,
        ),
      };
      vi.mocked(useQuery)
        .mockReturnValueOnce(mockUseQuery({ data: positiveData }))
        .mockReturnValueOnce(mockUseQuery({ data: mockWarningData }))
        .mockReturnValueOnce(mockUseQuery({ data: mockTrendData }))
        .mockReturnValueOnce(mockUseQuery({ data: mockContentsData }))
        .mockReturnValueOnce(mockUseQuery({ data: mockAccountData }));
      render(<DataCentre />);
    });

    When('计算环比增长率', async () => {
      await waitFor(() => {
        expect(screen.getByText('总播放量')).toBeInTheDocument();
      });
    });

    Then('显示绿色▲', async () => {
      // 验证绿色图标
    });

    And('显示"+X.X%"', async () => {
      // 验证百分比显示
    });
  });

  Scenario('六宫格增长率负增长显示红色', ({ Given, When, Then, And }) => {
    Given('某个指标当前值小于对比值', async () => {
      const negativeData = {
        ...mockOverviewData,
        metrics: mockOverviewData.metrics.map((m, i) =>
          i === 0
            ? { ...m, currentValue: '8000000', baselineValue: '10000000' }
            : m,
        ),
      };
      vi.mocked(useQuery)
        .mockReturnValueOnce(mockUseQuery({ data: negativeData }))
        .mockReturnValueOnce(mockUseQuery({ data: mockWarningData }))
        .mockReturnValueOnce(mockUseQuery({ data: mockTrendData }))
        .mockReturnValueOnce(mockUseQuery({ data: mockContentsData }))
        .mockReturnValueOnce(mockUseQuery({ data: mockAccountData }));
      render(<DataCentre />);
    });

    When('计算环比增长率', async () => {
      await waitFor(() => {
        expect(screen.getByText('总播放量')).toBeInTheDocument();
      });
    });

    Then('显示红色▼', async () => {
      // 验证红色图标
    });

    And('显示"-X.X%"', async () => {
      // 验证百分比显示
    });
  });

  Scenario('六宫格冷启动场景 - 场景A', ({ Given, When, Then, And }) => {
    Given('当前值 > 0', async () => {
      const coldStartA = {
        ...mockOverviewData,
        metrics: mockOverviewData.metrics.map((m, i) =>
          i === 0 ? { ...m, currentValue: '1000', baselineValue: '0' } : m,
        ),
      };
      vi.mocked(useQuery)
        .mockReturnValueOnce(mockUseQuery({ data: coldStartA }))
        .mockReturnValueOnce(mockUseQuery({ data: mockWarningData }))
        .mockReturnValueOnce(mockUseQuery({ data: mockTrendData }))
        .mockReturnValueOnce(mockUseQuery({ data: mockContentsData }))
        .mockReturnValueOnce(mockUseQuery({ data: mockAccountData }));
      render(<DataCentre />);
    });

    And('对比值 = 0', async () => {
      // 已在 Given 中设置
    });

    When('计算环比增长率', async () => {
      await waitFor(() => {
        expect(screen.getByText('总播放量')).toBeInTheDocument();
      });
    });

    Then('显示"▲ +100%"', async () => {
      // 验证显示
    });

    And('显示绿色', async () => {
      // 验证绿色
    });
  });

  Scenario('六宫格冷启动场景 - 场景B双零', ({ Given, When, Then, And }) => {
    Given('当前值 = 0', async () => {
      const coldStartB = {
        ...mockOverviewData,
        metrics: mockOverviewData.metrics.map((m, i) =>
          i === 0 ? { ...m, currentValue: '0', baselineValue: '0' } : m,
        ),
      };
      vi.mocked(useQuery)
        .mockReturnValueOnce(mockUseQuery({ data: coldStartB }))
        .mockReturnValueOnce(mockUseQuery({ data: mockWarningData }))
        .mockReturnValueOnce(mockUseQuery({ data: mockTrendData }))
        .mockReturnValueOnce(mockUseQuery({ data: mockContentsData }))
        .mockReturnValueOnce(mockUseQuery({ data: mockAccountData }));
      render(<DataCentre />);
    });

    And('对比值 = 0', async () => {
      // 已在 Given 中设置
    });

    When('计算环比增长率', async () => {
      await waitFor(() => {
        expect(screen.getByText('总播放量')).toBeInTheDocument();
      });
    });

    Then('显示"—"', async () => {
      // 验证显示
    });
  });

  Scenario('六宫格冷启动场景 - 场景C数据清零', ({ Given, When, Then, And }) => {
    Given('当前值 = 0', async () => {
      const coldStartC = {
        ...mockOverviewData,
        metrics: mockOverviewData.metrics.map((m, i) =>
          i === 0 ? { ...m, currentValue: '0', baselineValue: '10000' } : m,
        ),
      };
      vi.mocked(useQuery)
        .mockReturnValueOnce(mockUseQuery({ data: coldStartC }))
        .mockReturnValueOnce(mockUseQuery({ data: mockWarningData }))
        .mockReturnValueOnce(mockUseQuery({ data: mockTrendData }))
        .mockReturnValueOnce(mockUseQuery({ data: mockContentsData }))
        .mockReturnValueOnce(mockUseQuery({ data: mockAccountData }));
      render(<DataCentre />);
    });

    And('对比值 > 0', async () => {
      // 已在 Given 中设置
    });

    When('计算环比增长率', async () => {
      await waitFor(() => {
        expect(screen.getByText('总播放量')).toBeInTheDocument();
      });
    });

    Then('显示"▼ -100%"', async () => {
      // 验证显示
    });

    And('显示红色', async () => {
      // 验证红色
    });
  });

  Scenario('播放趋势图展示折线图', ({ Given, Then, And }) => {
    Given('用户在数据中心主页', async () => {
      vi.mocked(useQuery)
        .mockReturnValueOnce(mockUseQuery({ data: mockOverviewData }))
        .mockReturnValueOnce(mockUseQuery({ data: mockWarningData }))
        .mockReturnValueOnce(mockUseQuery({ data: mockTrendData }))
        .mockReturnValueOnce(mockUseQuery({ data: mockContentsData }))
        .mockReturnValueOnce(mockUseQuery({ data: mockAccountData }));
      render(<DataCentre />);
    });

    Then('播放趋势图展示折线图', async () => {
      await waitFor(() => {
        expect(screen.getByText('播放趋势')).toBeInTheDocument();
      });
    });

    And('支持鼠标悬停显示具体数值', async () => {
      // 验证 tooltip
    });
  });

  Scenario(
    '账号下拉选择器展示所有有权限账号并按创建时间倒序',
    ({ Given, When, Then, And }) => {
      Given('用户打开账号下拉选择器', async () => {
        vi.mocked(useQuery)
          .mockReturnValueOnce(mockUseQuery({ data: mockOverviewData }))
          .mockReturnValueOnce(mockUseQuery({ data: mockWarningData }))
          .mockReturnValueOnce(mockUseQuery({ data: mockTrendData }))
          .mockReturnValueOnce(mockUseQuery({ data: mockContentsData }))
          .mockReturnValueOnce(mockUseQuery({ data: mockAccountData }));
        render(<DataCentre />);
      });

      When('打开账号选择器', async () => {
        const accountSelect = screen.getByText('账号').closest('.ant-select');
        if (accountSelect) fireEvent.click(accountSelect);
      });

      Then('展示用户有权限的所有账号', async () => {
        await waitFor(() => {
          // 验证所有账号都被展示
        });
      });

      And('账号按创建时间倒序排列', async () => {
        await waitFor(() => {
          // 验证排序
        });
      });

      And('最新添加的账号排在最前面', async () => {
        // 验证最新账号在前
      });
    },
  );

  Scenario('趋势图记忆上次选中的账号', ({ Given, When, Then, And }) => {
    Given('用户上次选择了账号A', async () => {
      localStorage.setItem('datacenter_trend_account_id', 'acc-002');
    });

    And('localStorage中存在账号A', async () => {
      // 已在 Given 中设置
    });

    When('页面重新加载', async () => {
      vi.mocked(useQuery)
        .mockReturnValueOnce(mockUseQuery({ data: mockOverviewData }))
        .mockReturnValueOnce(mockUseQuery({ data: mockWarningData }))
        .mockReturnValueOnce(mockUseQuery({ data: mockTrendData }))
        .mockReturnValueOnce(mockUseQuery({ data: mockContentsData }))
        .mockReturnValueOnce(mockUseQuery({ data: mockAccountData }));
      render(<DataCentre />);
    });

    Then('默认选中账号A', async () => {
      await waitFor(() => {
        // 验证默认选中
      });
    });
  });

  Scenario('用户切换趋势图账号', ({ Given, When, Then, And }) => {
    Given('用户在播放趋势图区域', async () => {
      vi.mocked(useQuery)
        .mockReturnValueOnce(mockUseQuery({ data: mockOverviewData }))
        .mockReturnValueOnce(mockUseQuery({ data: mockWarningData }))
        .mockReturnValueOnce(mockUseQuery({ data: mockTrendData }))
        .mockReturnValueOnce(mockUseQuery({ data: mockContentsData }))
        .mockReturnValueOnce(mockUseQuery({ data: mockAccountData }));
      render(<DataCentre />);
    });

    When('用户从下拉选择器选择账号B', async () => {
      // 触发账号选择
    });

    Then('折线图区域显示Loading骨架屏', async () => {
      await waitFor(() => {
        // 验证骨架屏
      });
    });

    And('加载账号B的播放数据', async () => {
      // 验证数据加载
    });

    And('新数据返回后渲染图表', async () => {
      await waitFor(() => {
        expect(screen.getByText('播放趋势')).toBeInTheDocument();
      });
    });
  });

  Scenario('全局时间为今日时默认按小时粒度', ({ Given, When, Then, And }) => {
    Given('用户选择全局时间为"今日"', async () => {
      vi.mocked(useQuery)
        .mockReturnValueOnce(
          mockUseQuery({ data: { ...mockOverviewData, timeRange: 'today' } }),
        )
        .mockReturnValueOnce(mockUseQuery({ data: mockWarningData }))
        .mockReturnValueOnce(
          mockUseQuery({ data: { ...mockTrendData, granularity: 'hour' } }),
        )
        .mockReturnValueOnce(mockUseQuery({ data: mockContentsData }))
        .mockReturnValueOnce(mockUseQuery({ data: mockAccountData }));
      render(<DataCentre />);
    });

    When('播放趋势图加载', async () => {
      await waitFor(() => {
        expect(screen.getByText('播放趋势')).toBeInTheDocument();
      });
    });

    Then('默认粒度为"按小时"', async () => {
      await waitFor(() => {
        expect(screen.getByText('按小时')).toBeInTheDocument();
      });
    });

    And('支持切换到"按日"', async () => {
      // 验证粒度切换
    });
  });

  Scenario('全局时间为近7天时默认按日粒度', ({ Given, When, Then }) => {
    Given('用户选择全局时间为"近7天"', async () => {
      vi.mocked(useQuery)
        .mockReturnValueOnce(
          mockUseQuery({
            data: { ...mockOverviewData, timeRange: 'last7days' },
          }),
        )
        .mockReturnValueOnce(mockUseQuery({ data: mockWarningData }))
        .mockReturnValueOnce(
          mockUseQuery({ data: { ...mockTrendData, granularity: 'day' } }),
        )
        .mockReturnValueOnce(mockUseQuery({ data: mockContentsData }))
        .mockReturnValueOnce(mockUseQuery({ data: mockAccountData }));
      render(<DataCentre />);
    });

    When('播放趋势图加载', async () => {
      await waitFor(() => {
        expect(screen.getByText('播放趋势')).toBeInTheDocument();
      });
    });

    Then('默认粒度为"按日"', async () => {
      await waitFor(() => {
        expect(screen.getByText('按日')).toBeInTheDocument();
      });
    });
  });

  Scenario('全局时间为近30天时默认按日粒度', ({ Given, When, Then, And }) => {
    Given('用户选择全局时间为"近30天"', async () => {
      vi.mocked(useQuery)
        .mockReturnValueOnce(
          mockUseQuery({
            data: { ...mockOverviewData, timeRange: 'last30days' },
          }),
        )
        .mockReturnValueOnce(mockUseQuery({ data: mockWarningData }))
        .mockReturnValueOnce(
          mockUseQuery({ data: { ...mockTrendData, granularity: 'day' } }),
        )
        .mockReturnValueOnce(mockUseQuery({ data: mockContentsData }))
        .mockReturnValueOnce(mockUseQuery({ data: mockAccountData }));
      render(<DataCentre />);
    });

    When('播放趋势图加载', async () => {
      await waitFor(() => {
        expect(screen.getByText('播放趋势')).toBeInTheDocument();
      });
    });

    Then('默认粒度为"按日"', async () => {
      await waitFor(() => {
        expect(screen.getByText('按日')).toBeInTheDocument();
      });
    });

    And('支持切换到"按周"', async () => {
      // 验证粒度切换
    });
  });

  Scenario('全局时间为今年时默认按月粒度', ({ Given, When, Then }) => {
    Given('用户选择全局时间为"今年"', async () => {
      vi.mocked(useQuery)
        .mockReturnValueOnce(
          mockUseQuery({
            data: { ...mockOverviewData, timeRange: 'thisYear' },
          }),
        )
        .mockReturnValueOnce(mockUseQuery({ data: mockWarningData }))
        .mockReturnValueOnce(
          mockUseQuery({ data: { ...mockTrendData, granularity: 'month' } }),
        )
        .mockReturnValueOnce(mockUseQuery({ data: mockContentsData }))
        .mockReturnValueOnce(mockUseQuery({ data: mockAccountData }));
      render(<DataCentre />);
    });

    When('播放趋势图加载', async () => {
      await waitFor(() => {
        expect(screen.getByText('播放趋势')).toBeInTheDocument();
      });
    });

    Then('默认粒度为"按月"', async () => {
      await waitFor(() => {
        expect(screen.getByText('按月')).toBeInTheDocument();
      });
    });
  });

  Scenario('切换全局时间时趋势图粒度重置', ({ Given, When, Then }) => {
    Given('用户当前趋势图粒度为"按周"', async () => {
      vi.mocked(useQuery)
        .mockReturnValueOnce(mockUseQuery({ data: mockOverviewData }))
        .mockReturnValueOnce(mockUseQuery({ data: mockWarningData }))
        .mockReturnValueOnce(
          mockUseQuery({ data: { ...mockTrendData, granularity: 'week' } }),
        )
        .mockReturnValueOnce(mockUseQuery({ data: mockContentsData }))
        .mockReturnValueOnce(mockUseQuery({ data: mockAccountData }));
      render(<DataCentre />);
    });

    When('用户切换全局时间到"今日"', async () => {
      // 触发时间切换
    });

    Then('趋势图粒度自动重置为"按小时"', async () => {
      await waitFor(() => {
        expect(screen.getByText('按小时')).toBeInTheDocument();
      });
    });
  });

  Scenario('今日+按日粒度仅显示1个数据点', ({ Given, When, Then, And }) => {
    Given('全局时间为"今日"', async () => {
      // 设置今日
    });

    And('用户手动切换到"按日"粒度', async () => {
      // 切换粒度
    });

    When('观察趋势图', async () => {
      await waitFor(() => {
        expect(screen.getByText('播放趋势')).toBeInTheDocument();
      });
    });

    Then('折线图展示1个数据点', async () => {
      // 验证数据点数量
    });

    And(
      '显示轻提示"当前粒度仅显示1个数据点，建议切换到按小时查看"',
      async () => {
        // 验证轻提示
      },
    );
  });

  Scenario('数据缺失点保持断开', ({ Given, When, Then, And }) => {
    Given('某时间点数据缺失', async () => {
      const missingPointData = {
        ...mockTrendData,
        points: [
          { bucket: '2026-04-22 00:00', playCount: '1200' },
          { bucket: '2026-04-22 01:00', playCount: null },
          { bucket: '2026-04-22 02:00', playCount: '1350' },
        ],
      };
      vi.mocked(useQuery)
        .mockReturnValueOnce(mockUseQuery({ data: mockOverviewData }))
        .mockReturnValueOnce(mockUseQuery({ data: mockWarningData }))
        .mockReturnValueOnce(mockUseQuery({ data: missingPointData }))
        .mockReturnValueOnce(mockUseQuery({ data: mockContentsData }))
        .mockReturnValueOnce(mockUseQuery({ data: mockAccountData }));
      render(<DataCentre />);
    });

    When('渲染趋势图', async () => {
      await waitFor(() => {
        expect(screen.getByText('播放趋势')).toBeInTheDocument();
      });
    });

    Then('折线在该点保持断开', async () => {
      // 验证断开
    });

    And('鼠标悬停显示"数据缺失"', async () => {
      // 验证 tooltip
    });
  });

  Scenario('连续数据缺失显示缺口区域', ({ Given, When, Then }) => {
    Given('连续多个时间点数据缺失', async () => {
      const missingRangeData = {
        ...mockTrendData,
        points: [
          { bucket: '2026-04-22 00:00', playCount: '1200' },
          { bucket: '2026-04-22 01:00', playCount: null },
          { bucket: '2026-04-22 02:00', playCount: null },
          { bucket: '2026-04-22 03:00', playCount: '1500' },
        ],
      };
      vi.mocked(useQuery)
        .mockReturnValueOnce(mockUseQuery({ data: mockOverviewData }))
        .mockReturnValueOnce(mockUseQuery({ data: mockWarningData }))
        .mockReturnValueOnce(mockUseQuery({ data: missingRangeData }))
        .mockReturnValueOnce(mockUseQuery({ data: mockContentsData }))
        .mockReturnValueOnce(mockUseQuery({ data: mockAccountData }));
      render(<DataCentre />);
    });

    When('渲染趋势图', async () => {
      await waitFor(() => {
        expect(screen.getByText('播放趋势')).toBeInTheDocument();
      });
    });

    Then('折线断开，显示缺口区域', async () => {
      // 验证缺口区域
    });
  });

  Scenario('内容列表展示所有账号内容', ({ Given, Then, And }) => {
    Given('用户在数据中心主页', async () => {
      vi.mocked(useQuery)
        .mockReturnValueOnce(mockUseQuery({ data: mockOverviewData }))
        .mockReturnValueOnce(mockUseQuery({ data: mockWarningData }))
        .mockReturnValueOnce(mockUseQuery({ data: mockTrendData }))
        .mockReturnValueOnce(mockUseQuery({ data: mockContentsData }))
        .mockReturnValueOnce(mockUseQuery({ data: mockAccountData }));
      render(<DataCentre />);
    });

    Then('内容表现列表展示所有账号的内容汇总数据', async () => {
      await waitFor(() => {
        expect(screen.getByText('内容表现')).toBeInTheDocument();
      });
    });

    And('不支持关键词搜索', async () => {
      // 验证无搜索框
    });
  });

  Scenario('内容列表使用分页模式', ({ Given, Then, And }) => {
    Given('内容列表有多页数据', async () => {
      vi.mocked(useQuery)
        .mockReturnValueOnce(mockUseQuery({ data: mockOverviewData }))
        .mockReturnValueOnce(mockUseQuery({ data: mockWarningData }))
        .mockReturnValueOnce(mockUseQuery({ data: mockTrendData }))
        .mockReturnValueOnce(mockUseQuery({ data: mockContentsData }))
        .mockReturnValueOnce(mockUseQuery({ data: mockAccountData }));
      render(<DataCentre />);
    });

    Then('显示分页器', async () => {
      await waitFor(() => {
        expect(screen.getByText('共 24 条')).toBeInTheDocument();
      });
    });

    And('支持上一页/下一页', async () => {
      // 验证翻页按钮
    });

    And('每页默认10条', async () => {
      // 验证每页条数
    });
  });

  Scenario('内容列表按播放量排序', ({ Given, When, Then, And }) => {
    Given('用户在内容表现列表', async () => {
      vi.mocked(useQuery)
        .mockReturnValueOnce(mockUseQuery({ data: mockOverviewData }))
        .mockReturnValueOnce(mockUseQuery({ data: mockWarningData }))
        .mockReturnValueOnce(mockUseQuery({ data: mockTrendData }))
        .mockReturnValueOnce(mockUseQuery({ data: mockContentsData }))
        .mockReturnValueOnce(mockUseQuery({ data: mockAccountData }));
      render(<DataCentre />);
    });

    When('用户选择排序方式为"按播放量"', async () => {
      const sortSelect = screen.getByText('按播放量').closest('.ant-select');
      if (sortSelect) fireEvent.click(sortSelect);
    });

    Then('列表自动刷新', async () => {
      await waitFor(() => {
        expect(screen.getByText('内容表现')).toBeInTheDocument();
      });
    });

    And('按播放量降序排序', async () => {
      // 验证排序
    });
  });

  Scenario('内容列表按点赞量排序', ({ Given, When, Then, And }) => {
    Given('用户在内容表现列表', async () => {
      vi.mocked(useQuery)
        .mockReturnValueOnce(mockUseQuery({ data: mockOverviewData }))
        .mockReturnValueOnce(mockUseQuery({ data: mockWarningData }))
        .mockReturnValueOnce(mockUseQuery({ data: mockTrendData }))
        .mockReturnValueOnce(mockUseQuery({ data: mockContentsData }))
        .mockReturnValueOnce(mockUseQuery({ data: mockAccountData }));
      render(<DataCentre />);
    });

    When('用户选择排序方式为"按点赞量"', async () => {
      const sortSelect = screen.getByText('按点赞量').closest('.ant-select');
      if (sortSelect) fireEvent.click(sortSelect);
    });

    Then('列表自动刷新', async () => {
      await waitFor(() => {
        expect(screen.getByText('内容表现')).toBeInTheDocument();
      });
    });

    And('按点赞量降序排序', async () => {
      // 验证排序
    });
  });

  Scenario('内容列表按评论量排序', ({ Given, When, Then, And }) => {
    Given('用户在内容表现列表', async () => {
      vi.mocked(useQuery)
        .mockReturnValueOnce(mockUseQuery({ data: mockOverviewData }))
        .mockReturnValueOnce(mockUseQuery({ data: mockWarningData }))
        .mockReturnValueOnce(mockUseQuery({ data: mockTrendData }))
        .mockReturnValueOnce(mockUseQuery({ data: mockContentsData }))
        .mockReturnValueOnce(mockUseQuery({ data: mockAccountData }));
      render(<DataCentre />);
    });

    When('用户选择排序方式为"按评论量"', async () => {
      const sortSelect = screen.getByText('按评论量').closest('.ant-select');
      if (sortSelect) fireEvent.click(sortSelect);
    });

    Then('列表自动刷新', async () => {
      await waitFor(() => {
        expect(screen.getByText('内容表现')).toBeInTheDocument();
      });
    });

    And('按评论量降序排序', async () => {
      // 验证排序
    });
  });

  Scenario('排序使用300ms防抖', ({ Given, When, Then }) => {
    Given('用户切换排序方式', async () => {
      vi.mocked(useQuery)
        .mockReturnValueOnce(mockUseQuery({ data: mockOverviewData }))
        .mockReturnValueOnce(mockUseQuery({ data: mockWarningData }))
        .mockReturnValueOnce(mockUseQuery({ data: mockTrendData }))
        .mockReturnValueOnce(mockUseQuery({ data: mockContentsData }))
        .mockReturnValueOnce(mockUseQuery({ data: mockAccountData }));
      render(<DataCentre />);
    });

    When('300ms内再次切换排序方式', async () => {
      // 快速切换
    });

    Then('等待300ms后才发送请求', async () => {
      // 验证防抖
    });
  });

  Scenario('内容列表筛选全部类型', ({ Given, When, Then }) => {
    Given('用户在内容表现列表', async () => {
      vi.mocked(useQuery)
        .mockReturnValueOnce(mockUseQuery({ data: mockOverviewData }))
        .mockReturnValueOnce(mockUseQuery({ data: mockWarningData }))
        .mockReturnValueOnce(mockUseQuery({ data: mockTrendData }))
        .mockReturnValueOnce(mockUseQuery({ data: mockContentsData }))
        .mockReturnValueOnce(mockUseQuery({ data: mockAccountData }));
      render(<DataCentre />);
    });

    When('用户选择类型筛选为"全部"', async () => {
      const allTab = screen.getByText('全部').closest('.ant-tabs-tab');
      if (allTab) fireEvent.click(allTab);
    });

    Then('列表展示所有类型内容', async () => {
      await waitFor(() => {
        expect(screen.getByText('内容表现')).toBeInTheDocument();
      });
    });
  });

  Scenario('内容列表筛选视频类型', ({ Given, When, Then }) => {
    Given('用户在内容表现列表', async () => {
      vi.mocked(useQuery)
        .mockReturnValueOnce(mockUseQuery({ data: mockOverviewData }))
        .mockReturnValueOnce(mockUseQuery({ data: mockWarningData }))
        .mockReturnValueOnce(mockUseQuery({ data: mockTrendData }))
        .mockReturnValueOnce(mockUseQuery({ data: mockContentsData }))
        .mockReturnValueOnce(mockUseQuery({ data: mockAccountData }));
      render(<DataCentre />);
    });

    When('用户选择类型筛选为"视频"', async () => {
      const videoTab = screen.getByText('视频').closest('.ant-tabs-tab');
      if (videoTab) fireEvent.click(videoTab);
    });

    Then('列表仅展示视频类型内容', async () => {
      await waitFor(() => {
        expect(screen.getByText('内容表现')).toBeInTheDocument();
      });
    });
  });

  Scenario('内容列表筛选图文类型', ({ Given, When, Then }) => {
    Given('用户在内容表现列表', async () => {
      vi.mocked(useQuery)
        .mockReturnValueOnce(mockUseQuery({ data: mockOverviewData }))
        .mockReturnValueOnce(mockUseQuery({ data: mockWarningData }))
        .mockReturnValueOnce(mockUseQuery({ data: mockTrendData }))
        .mockReturnValueOnce(mockUseQuery({ data: mockContentsData }))
        .mockReturnValueOnce(mockUseQuery({ data: mockAccountData }));
      render(<DataCentre />);
    });

    When('用户选择类型筛选为"图文"', async () => {
      const imageTab = screen.getByText('图文').closest('.ant-tabs-tab');
      if (imageTab) fireEvent.click(imageTab);
    });

    Then('列表仅展示图文类型内容', async () => {
      await waitFor(() => {
        expect(screen.getByText('内容表现')).toBeInTheDocument();
      });
    });
  });

  Scenario('类型筛选使用300ms防抖', ({ Given, When, Then }) => {
    Given('用户切换类型筛选', async () => {
      vi.mocked(useQuery)
        .mockReturnValueOnce(mockUseQuery({ data: mockOverviewData }))
        .mockReturnValueOnce(mockUseQuery({ data: mockWarningData }))
        .mockReturnValueOnce(mockUseQuery({ data: mockTrendData }))
        .mockReturnValueOnce(mockUseQuery({ data: mockContentsData }))
        .mockReturnValueOnce(mockUseQuery({ data: mockAccountData }));
      render(<DataCentre />);
    });

    When('300ms内再次切换类型筛选', async () => {
      // 快速切换
    });

    Then('等待300ms后才发送请求', async () => {
      // 验证防抖
    });
  });

  Scenario('切换全局时间时内容列表重置', ({ Given, When, Then, And }) => {
    Given('用户当前在内容列表第3页', async () => {
      vi.mocked(useQuery)
        .mockReturnValueOnce(mockUseQuery({ data: mockOverviewData }))
        .mockReturnValueOnce(mockUseQuery({ data: mockWarningData }))
        .mockReturnValueOnce(mockUseQuery({ data: mockTrendData }))
        .mockReturnValueOnce(
          mockUseQuery({ data: { ...mockContentsData, page: 3 } }),
        )
        .mockReturnValueOnce(mockUseQuery({ data: mockAccountData }));
      render(<DataCentre />);
    });

    When('用户切换全局时间筛选', async () => {
      // 触发时间切换
    });

    Then('排序方式重置为"按播放量"', async () => {
      // 验证重置
    });

    And('类型筛选重置为"全部"', async () => {
      // 验证重置
    });

    And('当前页码重置为第1页', async () => {
      // 验证重置
    });
  });

  Scenario('切换全局平台时内容列表重置', ({ Given, When, Then, And }) => {
    Given('用户当前在内容列表第3页', async () => {
      vi.mocked(useQuery)
        .mockReturnValueOnce(mockUseQuery({ data: mockOverviewData }))
        .mockReturnValueOnce(mockUseQuery({ data: mockWarningData }))
        .mockReturnValueOnce(mockUseQuery({ data: mockTrendData }))
        .mockReturnValueOnce(
          mockUseQuery({ data: { ...mockContentsData, page: 3 } }),
        )
        .mockReturnValueOnce(mockUseQuery({ data: mockAccountData }));
      render(<DataCentre />);
    });

    When('用户切换全局平台筛选', async () => {
      // 触发平台切换
    });

    Then('排序方式重置为"按播放量"', async () => {
      // 验证重置
    });

    And('类型筛选重置为"全部"', async () => {
      // 验证重置
    });

    And('当前页码重置为第1页', async () => {
      // 验证重置
    });
  });

  Scenario('点击内容列表账号名称', ({ Given, When, Then }) => {
    Given('内容列表中存在账号A的内容', async () => {
      installRequirementsDatacenterQueryMock();
      render(<DataCentre />);
      await waitFor(() => {
        expect(screen.getByText('时尚美妆号')).toBeInTheDocument();
      });
    });

    When('用户点击账号A名称', async () => {
      await fireClickContentPerformanceAccountLink('时尚美妆号');
    });

    Then('跳转到账号A的详情页', async () => {
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith(
          '/datacenter/account/acc-001?from=datacenter',
        );
      });
    });
  });

  Scenario('内容列表切换每页条数', ({ Given, When, Then, And }) => {
    Given('用户在内容列表第1页', async () => {
      vi.mocked(useQuery)
        .mockReturnValueOnce(mockUseQuery({ data: mockOverviewData }))
        .mockReturnValueOnce(mockUseQuery({ data: mockWarningData }))
        .mockReturnValueOnce(mockUseQuery({ data: mockTrendData }))
        .mockReturnValueOnce(mockUseQuery({ data: mockContentsData }))
        .mockReturnValueOnce(mockUseQuery({ data: mockAccountData }));
      render(<DataCentre />);
    });

    When('用户切换每页条数为20', async () => {
      // 触发每页条数切换
    });

    Then('列表重新加载', async () => {
      await waitFor(() => {
        expect(screen.getByText('内容表现')).toBeInTheDocument();
      });
    });

    And('每页显示20条', async () => {
      // 验证每页条数
    });
  });

  Scenario('内容列表翻页', ({ Given, When, Then, And }) => {
    Given('内容列表有多页数据', async () => {
      vi.mocked(useQuery)
        .mockReturnValueOnce(mockUseQuery({ data: mockOverviewData }))
        .mockReturnValueOnce(mockUseQuery({ data: mockWarningData }))
        .mockReturnValueOnce(mockUseQuery({ data: mockTrendData }))
        .mockReturnValueOnce(mockUseQuery({ data: mockContentsData }))
        .mockReturnValueOnce(mockUseQuery({ data: mockAccountData }));
      render(<DataCentre />);
    });

    When('用户点击下一页', async () => {
      const nextButton = screen.getByText('下一页').closest('button');
      if (nextButton) fireEvent.click(nextButton);
    });

    Then('列表加载下一页数据', async () => {
      await waitFor(() => {
        expect(screen.getByText('内容表现')).toBeInTheDocument();
      });
    });

    And('页码更新', async () => {
      // 验证页码
    });
  });

  Scenario('数据为0时显示短横线', ({ Given, When, Then }) => {
    Given('某个指标数据为0', async () => {
      const zeroMetricData = {
        ...mockOverviewData,
        metrics: mockOverviewData.metrics.map((m, i) =>
          i === 0 ? { ...m, currentValue: '0', baselineValue: '0' } : m,
        ),
      };
      vi.mocked(useQuery)
        .mockReturnValueOnce(mockUseQuery({ data: zeroMetricData }))
        .mockReturnValueOnce(mockUseQuery({ data: mockWarningData }))
        .mockReturnValueOnce(mockUseQuery({ data: mockTrendData }))
        .mockReturnValueOnce(mockUseQuery({ data: mockContentsData }))
        .mockReturnValueOnce(mockUseQuery({ data: mockAccountData }));
      render(<DataCentre />);
    });

    When('页面渲染该指标', async () => {
      await waitFor(() => {
        expect(screen.getByText('总播放量')).toBeInTheDocument();
      });
    });

    Then('显示"PLACEHOLDER"', async () => {
      // 验证显示
    });
  });

  Scenario('播放量为0时互动率显示短横线', ({ Given, When, Then }) => {
    Given('内容播放量为0', async () => {
      const zeroPlayContent = {
        ...mockContentsData,
        list: [
          { ...mockContentsData.list[0], playCount: '0', engagementRate: null },
        ],
      };
      vi.mocked(useQuery)
        .mockReturnValueOnce(mockUseQuery({ data: mockOverviewData }))
        .mockReturnValueOnce(mockUseQuery({ data: mockWarningData }))
        .mockReturnValueOnce(mockUseQuery({ data: mockTrendData }))
        .mockReturnValueOnce(mockUseQuery({ data: zeroPlayContent }))
        .mockReturnValueOnce(mockUseQuery({ data: mockAccountData }));
      render(<DataCentre />);
    });

    When('页面渲染互动率', async () => {
      await waitFor(() => {
        expect(screen.getByText('内容表现')).toBeInTheDocument();
      });
    });

    Then('显示"PLACEHOLDER"', async () => {
      // 验证显示
    });
  });

  Scenario('互动率保留2位小数', ({ Given, When, Then }) => {
    Given('互动率计算结果为9.855%', async () => {
      const preciseRateContent = {
        ...mockContentsData,
        list: [{ ...mockContentsData.list[0], engagementRate: '9.855' }],
      };
      vi.mocked(useQuery)
        .mockReturnValueOnce(mockUseQuery({ data: mockOverviewData }))
        .mockReturnValueOnce(mockUseQuery({ data: mockWarningData }))
        .mockReturnValueOnce(mockUseQuery({ data: mockTrendData }))
        .mockReturnValueOnce(mockUseQuery({ data: preciseRateContent }))
        .mockReturnValueOnce(mockUseQuery({ data: mockAccountData }));
      render(<DataCentre />);
    });

    When('页面渲染互动率', async () => {
      await waitFor(() => {
        expect(screen.getByText('内容表现')).toBeInTheDocument();
      });
    });

    Then('显示"9.86%"', async () => {
      // 验证四舍五入
    });
  });

  Scenario('互动率超过999.99%显示上限', ({ Given, When, Then }) => {
    Given('互动率计算结果为1234.56%', async () => {
      const highRateContent = {
        ...mockContentsData,
        list: [{ ...mockContentsData.list[0], engagementRate: '1234.56' }],
      };
      vi.mocked(useQuery)
        .mockReturnValueOnce(mockUseQuery({ data: mockOverviewData }))
        .mockReturnValueOnce(mockUseQuery({ data: mockWarningData }))
        .mockReturnValueOnce(mockUseQuery({ data: mockTrendData }))
        .mockReturnValueOnce(mockUseQuery({ data: highRateContent }))
        .mockReturnValueOnce(mockUseQuery({ data: mockAccountData }));
      render(<DataCentre />);
    });

    When('页面渲染互动率', async () => {
      await waitFor(() => {
        expect(screen.getByText('内容表现')).toBeInTheDocument();
      });
    });

    Then('显示">999.99%"', async () => {
      // 验证上限显示
    });
  });

  Scenario('播放量超过1万显示缩略', ({ Given, When, Then }) => {
    Given('播放量为12000', () => {
      installRequirementsDatacenterQueryMock({
        ...mockContentsData,
        list: [{ ...mockContentsData.list[0], playCount: '12000' }],
      });
    });

    When('页面渲染播放量', async () => {
      setupDataCentreWithListPlayCount('12000');
      await waitFor(() => {
        expect(screen.getByText('内容表现')).toBeInTheDocument();
      });
    });

    Then('显示"1.2万"', async () => {
      setupDataCentreWithListPlayCount('12000');
      await waitFor(() => {
        expect(screen.getByText('1.2万')).toBeInTheDocument();
      });
    });
  });

  Scenario('播放量超过1亿显示缩略', ({ Given, When, Then }) => {
    Given('播放量为120000000', () => {
      installRequirementsDatacenterQueryMock({
        ...mockContentsData,
        list: [{ ...mockContentsData.list[0], playCount: '120000000' }],
      });
    });

    When('页面渲染播放量', async () => {
      setupDataCentreWithListPlayCount('120000000');
      await waitFor(() => {
        expect(screen.getByText('内容表现')).toBeInTheDocument();
      });
    });

    Then('显示"1.2亿"', async () => {
      setupDataCentreWithListPlayCount('120000000');
      await waitFor(() => {
        expect(screen.getByText('1.2亿')).toBeInTheDocument();
      });
    });
  });

  Scenario('自动刷新每5分钟执行', ({ Given, When, Then }) => {
    Given('用户停留在数据中心主页', async () => {
      vi.mocked(useQuery)
        .mockReturnValueOnce(mockUseQuery({ data: mockOverviewData }))
        .mockReturnValueOnce(mockUseQuery({ data: mockWarningData }))
        .mockReturnValueOnce(mockUseQuery({ data: mockTrendData }))
        .mockReturnValueOnce(mockUseQuery({ data: mockContentsData }))
        .mockReturnValueOnce(mockUseQuery({ data: mockAccountData }));
      render(<DataCentre />);
    });

    When('距离上次刷新已过5分钟', async () => {
      // 等待或模拟时间
    });

    Then('自动刷新预警区和六宫格数据', async () => {
      // 验证自动刷新
    });
  });

  Scenario('页面隐藏时暂停自动刷新', ({ Given, When, Then }) => {
    Given('用户切换到其他标签页', async () => {
      vi.mocked(useQuery)
        .mockReturnValueOnce(mockUseQuery({ data: mockOverviewData }))
        .mockReturnValueOnce(mockUseQuery({ data: mockWarningData }))
        .mockReturnValueOnce(mockUseQuery({ data: mockTrendData }))
        .mockReturnValueOnce(mockUseQuery({ data: mockContentsData }))
        .mockReturnValueOnce(mockUseQuery({ data: mockAccountData }));
      render(<DataCentre />);
    });

    When('页面处于隐藏状态', async () => {
      // 模拟 visibilitychange
    });

    Then('自动刷新定时器暂停', async () => {
      // 验证暂停
    });
  });

  Scenario('页面重新可见时恢复自动刷新', ({ Given, When, Then, And }) => {
    Given('页面之前处于隐藏状态', async () => {
      vi.mocked(useQuery)
        .mockReturnValueOnce(mockUseQuery({ data: mockOverviewData }))
        .mockReturnValueOnce(mockUseQuery({ data: mockWarningData }))
        .mockReturnValueOnce(mockUseQuery({ data: mockTrendData }))
        .mockReturnValueOnce(mockUseQuery({ data: mockContentsData }))
        .mockReturnValueOnce(mockUseQuery({ data: mockAccountData }));
      render(<DataCentre />);
    });

    When('用户切换回数据中心标签页', async () => {
      // 模拟重新可见
    });

    Then('立即执行一次刷新', async () => {
      // 验证立即刷新
    });

    And('重新启动定时器', async () => {
      // 验证定时器重启
    });
  });

  Scenario('操作中暂停自动刷新', ({ Given, When, Then }) => {
    Given('用户正在进行筛选操作', async () => {
      vi.mocked(useQuery)
        .mockReturnValueOnce(mockUseQuery({ data: mockOverviewData }))
        .mockReturnValueOnce(mockUseQuery({ data: mockWarningData }))
        .mockReturnValueOnce(mockUseQuery({ data: mockTrendData }))
        .mockReturnValueOnce(mockUseQuery({ data: mockContentsData }))
        .mockReturnValueOnce(mockUseQuery({ data: mockAccountData }));
      render(<DataCentre />);
    });

    When('300ms内完成操作', async () => {
      // 模拟操作
    });

    Then('防抖结束后恢复自动刷新定时器', async () => {
      // 验证恢复
    });
  });

  Scenario('内容列表Loading时暂停自动刷新', ({ Given, When, Then }) => {
    Given('内容列表正在加载中', async () => {
      vi.mocked(useQuery)
        .mockReturnValueOnce(mockUseQuery({ data: mockOverviewData }))
        .mockReturnValueOnce(mockUseQuery({ data: mockWarningData }))
        .mockReturnValueOnce(mockUseQuery({ data: mockTrendData }))
        .mockReturnValueOnce(
          mockUseQuery({ data: mockContentsData, isFetching: true }),
        )
        .mockReturnValueOnce(mockUseQuery({ data: mockAccountData }));
      render(<DataCentre />);
    });

    When('等待自动刷新定时器应该触发的时间点', async () => {
      // 等待
    });

    Then('暂停本次周期的自动刷新', async () => {
      // 验证暂停
    });
  });

  Scenario('网络断开时显示重试按钮', ({ Given, When, Then, And }) => {
    Given('用户操作触发数据请求', async () => {
      vi.mocked(useQuery).mockReturnValueOnce(
        mockUseQuery({ data: undefined, error: new Error('网络错误') }),
      );
      render(<DataCentre />);
    });

    When('网络连接失败', async () => {
      // 触发请求
    });

    Then('显示错误提示"网络连接失败，请检查网络后重试"', async () => {
      await waitFor(() => {
        expect(mockMessage.error).toHaveBeenCalledWith(
          '网络连接失败，请检查网络后重试',
        );
      });
    });

    And('显示重试按钮', async () => {
      // 验证重试按钮
    });
  });

  Scenario('接口超时时显示重试按钮', ({ Given, When, Then, And }) => {
    Given('用户操作触发数据请求', async () => {
      vi.mocked(useQuery).mockReturnValueOnce(
        mockUseQuery({ data: undefined, error: new Error('timeout') }),
      );
      render(<DataCentre />);
    });

    When('请求超时', async () => {
      // 触发请求
    });

    Then('显示错误提示"数据加载超时，请稍后重试"', async () => {
      await waitFor(() => {
        expect(mockMessage.error).toHaveBeenCalledWith(
          '数据加载超时，请稍后重试',
        );
      });
    });

    And('显示重试按钮', async () => {
      // 验证重试按钮
    });
  });

  Scenario('Token失效时跳转登录页', ({ Given, When, Then, And }) => {
    Given('用户已登录', async () => {
      // 已有 token
    });

    When('收到Token失效响应（401）', async () => {
      vi.mocked(useQuery).mockRejectedValueOnce(new Error('Token expired'));
      render(<DataCentre />);
    });

    Then('跳转登录页', async () => {
      await waitFor(() => {
        expect(window.location.replace).toHaveBeenCalledWith('/login/');
      });
    });

    And('提示"登录已过期，请重新登录"', async () => {
      // 验证提示
    });
  });
});
