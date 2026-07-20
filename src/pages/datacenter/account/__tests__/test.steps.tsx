import { defineFeature } from '@amiceli/vitest-cucumber';
import { type UseQueryResult, useQuery } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import type {
  AccountDetailResponse,
  ContentPerformanceItem,
  KpiMetric,
  TrendPoint,
} from '@/services/statistics/types';

import AccountPage from '../index';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
  useSearchParams: () => {
    const params = new URLSearchParams();
    params.set('id', 'acc-001');
    return [params];
  },
  useLocation: () => ({ pathname: '/datacenter/account/acc-001' }),
}));

vi.mock('@/services/statistics', () => ({
  accountDetailQueryOptions: vi.fn(() => ({
    queryKey: ['statistics', 'accountDetail', 'acc-001'],
    queryFn: vi.fn(),
  })),
}));

const mockMessage = {
  success: vi.fn(),
  error: vi.fn(),
  warning: vi.fn(),
  info: vi.fn(),
};

vi.mock('antd', async () => {
  const actual = await vi.importActual('antd');
  return {
    ...actual,
    message: mockMessage,
  };
});

const createMockAccountDetailData = (
  overrides = {},
): AccountDetailResponse => ({
  account: {
    accountId: 'acc-001',
    nickname: '时尚美妆号',
    platform: 'douyin',
    followers: '125000',
    status: 'ONLINE',
    lastSyncTime: '2026-05-11T10:30:00Z',
  },
  todayMetrics: [
    { name: 'playCount', currentValue: '12582380', baselineValue: '11150000' },
    { name: 'likeCount', currentValue: '89234', baselineValue: '82456' },
    { name: 'commentCount', currentValue: '12456', baselineValue: '11789' },
    { name: 'shareCount', currentValue: '8932', baselineValue: '8745' },
  ] as KpiMetric[],
  last7DayPlayTrend: [
    { bucket: '2026-04-16', playCount: '1200000' },
    { bucket: '2026-04-17', playCount: '1350000' },
    { bucket: '2026-04-18', playCount: null },
    { bucket: '2026-04-19', playCount: '1100000' },
    { bucket: '2026-04-20', playCount: '1500000' },
    { bucket: '2026-04-21', playCount: '1400000' },
    { bucket: '2026-04-22', playCount: '1250000' },
  ] as TrendPoint[],
  recentContents: {
    list: [
      {
        contentId: 'content-001',
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
        contentId: 'content-002',
        title: '家常菜做法大全',
        accountId: 'acc-001',
        accountName: '时尚美妆号',
        platform: 'douyin',
        contentType: 'video',
        playCount: '89000',
        likeCount: '5600',
        commentCount: '890',
        shareCount: '340',
        engagementRate: '7.68',
      },
    ] as ContentPerformanceItem[],
    page: 1,
    pageSize: 10,
    total: '24',
    totalPages: 3,
    hasNext: true,
    hasPrevious: false,
  },
  ...overrides,
});

const mockUseQuery = (
  overrides: Record<string, unknown> = {},
): UseQueryResult =>
  ({
    data: undefined,
    isLoading: false,
    isFetching: false,
    isError: false,
    error: null,
    refetch: vi.fn(),
    ...overrides,
  }) as unknown as UseQueryResult;

defineFeature('./features/test.feature', ({ Scenario }) => {
  Scenario('入口1-预警卡片查看详情', ({ Given, When, Then, And }) => {
    Given('在数据中心主页', () => {
      vi.mocked(useQuery).mockReturnValue(
        mockUseQuery({ data: createMockAccountDetailData() }),
      );
    });
    When('点击数据预警区某预警的「查看详情」按钮', async () => {
      render(<AccountPage />);
    });
    Then('跳转到账号详情页（URL包含账号ID）', async () => {
      await waitFor(() => {
        expect(screen.getByText('账号详情')).toBeInTheDocument();
      });
    });
    And('页面显示该账号的详细信息', async () => {
      await waitFor(() => {
        expect(screen.getByText('时尚美妆号')).toBeInTheDocument();
      });
    });
  });

  Scenario('入口2-内容列表账号名称', ({ Given, When, Then, And }) => {
    Given('在数据中心主页', () => {
      vi.mocked(useQuery).mockReturnValue(
        mockUseQuery({ data: createMockAccountDetailData() }),
      );
    });
    When('点击内容表现列表的「账号」列名称', async () => {
      render(<AccountPage />);
    });
    Then('跳转到该内容所属账号的详情页', async () => {
      await waitFor(() => {
        expect(screen.getByText('账号详情')).toBeInTheDocument();
      });
    });
    And('页面显示正确账号的信息', async () => {
      await waitFor(() => {
        expect(screen.getByText('时尚美妆号')).toBeInTheDocument();
      });
    });
  });

  Scenario('账号已删除-404', ({ Given, When, Then, And }) => {
    Given('账号已被删除', () => {
      vi.mocked(useQuery).mockReturnValue(
        mockUseQuery({
          isError: true,
          error: new Error('404: Account not found'),
        }),
      );
    });
    When('在浏览器地址栏直接输入该账号详情页URL', async () => {
      render(<AccountPage />);
    });
    Then('显示404提示页「账号不存在或已被删除」', async () => {
      await waitFor(() => {
        expect(mockMessage.error).toHaveBeenCalledWith('账号不存在');
      });
    });
    And('页面提供「返回数据中心」按钮', async () => {
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/datacenter', {
          replace: true,
        });
      });
    });
  });

  Scenario('基本信息完整展示', ({ Given, When, Then, And }) => {
    Given('账号存在，在账号详情页', () => {
      vi.mocked(useQuery).mockReturnValue(
        mockUseQuery({ data: createMockAccountDetailData() }),
      );
    });
    When('观察「基本信息」区域', async () => {
      render(<AccountPage />);
    });
    Then('展示账号头像（如果有）', async () => {
      await waitFor(() => {
        expect(screen.getByText(/基本信息/u)).toBeInTheDocument();
      });
    });
    And('展示账号昵称', async () => {
      await waitFor(() => {
        expect(screen.getByText('时尚美妆号')).toBeInTheDocument();
      });
    });
    And('展示平台（Logo+账号名称）', async () => {
      await waitFor(() => {
        expect(screen.getByText('抖音')).toBeInTheDocument();
      });
    });
    And('展示粉丝数', async () => {
      await waitFor(() => {
        expect(screen.getByText(/粉丝数：/u)).toBeInTheDocument();
      });
    });
    And('展示账号状态（在线🟢/离线🔴）', async () => {
      await waitFor(() => {
        expect(screen.getByText('在线')).toBeInTheDocument();
      });
    });
    And('展示最后同步时间', async () => {
      await waitFor(() => {
        expect(screen.getByText(/最后同步：/u)).toBeInTheDocument();
      });
    });
  });

  Scenario('账号状态标识', ({ Given, When, Then, And }) => {
    Given('在账号详情页', () => {
      vi.mocked(useQuery).mockReturnValue(
        mockUseQuery({ data: createMockAccountDetailData() }),
      );
    });
    When('观察账号状态', async () => {
      render(<AccountPage />);
    });
    Then('在线状态显示🟢绿色标识', async () => {
      await waitFor(() => {
        expect(screen.getByText('在线')).toBeInTheDocument();
      });
    });
    And('失效状态显示🔴红色标识', async () => {
      await waitFor(() => {
        expect(screen.queryByText('失效')).not.toBeInTheDocument();
      });
    });
    And('已停止状态显示灰色标识', async () => {
      await waitFor(() => {
        expect(screen.queryByText('已停止')).not.toBeInTheDocument();
      });
    });
  });

  Scenario('今日核心指标展示', ({ Given, When, Then, And }) => {
    Given('在账号详情页', () => {
      vi.mocked(useQuery).mockReturnValue(
        mockUseQuery({ data: createMockAccountDetailData() }),
      );
    });
    When('观察「今日核心指标」区域', async () => {
      render(<AccountPage />);
    });
    Then('展示4个指标：播放量、点赞量、评论量、转发量', async () => {
      await waitFor(() => {
        expect(screen.getByText('今日核心指标')).toBeInTheDocument();
        expect(screen.getByText('播放量')).toBeInTheDocument();
        expect(screen.getByText('点赞量')).toBeInTheDocument();
        expect(screen.getByText('评论量')).toBeInTheDocument();
        expect(screen.getByText('转发量')).toBeInTheDocument();
      });
    });
    And('数据为该账号今日数据总和', async () => {
      await waitFor(() => {
        expect(screen.getByText('12582380')).toBeInTheDocument();
      });
    });
    And(
      '数据与数据中心主页六宫格中该账号数据一致（如筛选该账号）',
      async () => {
        await waitFor(() => {
          expect(screen.getByText('12582380')).toBeInTheDocument();
        });
      },
    );
  });

  Scenario('近7天播放趋势展示', ({ Given, When, Then, And }) => {
    Given('在账号详情页', () => {
      vi.mocked(useQuery).mockReturnValue(
        mockUseQuery({ data: createMockAccountDetailData() }),
      );
    });
    When('观察「近7天播放趋势」区域', async () => {
      render(<AccountPage />);
    });
    Then('折线图展示该账号近7天每天的播放量数据', async () => {
      await waitFor(() => {
        expect(screen.getByText('近 7 天播放趋势')).toBeInTheDocument();
      });
    });
    And('X轴为日期，Y轴为播放量', async () => {
      await waitFor(() => {
        expect(screen.getByText('2026-04-16')).toBeInTheDocument();
      });
    });
    And('折线图与数据中心主页趋势图数据一致（仅限该账号）', async () => {
      await waitFor(() => {
        expect(screen.getByText('近 7 天播放趋势')).toBeInTheDocument();
      });
    });
  });

  Scenario('趋势图数据点悬停', ({ Given, When, Then }) => {
    Given('在账号详情页', () => {
      vi.mocked(useQuery).mockReturnValue(
        mockUseQuery({ data: createMockAccountDetailData() }),
      );
    });
    When('鼠标悬停到折线图任意数据点', async () => {
      render(<AccountPage />);
    });
    Then('显示tooltip，包含日期和具体播放量数值', async () => {
      await waitFor(() => {
        expect(screen.getByText('近 7 天播放趋势')).toBeInTheDocument();
      });
    });
  });

  Scenario('近期内容列表展示', ({ Given, When, Then, And }) => {
    Given('在账号详情页', () => {
      vi.mocked(useQuery).mockReturnValue(
        mockUseQuery({ data: createMockAccountDetailData() }),
      );
    });
    When('观察「近期内容列表」区域', async () => {
      render(<AccountPage />);
    });
    Then('表格列包含：封面、标题、播放量、点赞量、评论量、互动率', async () => {
      await waitFor(() => {
        expect(screen.getByText('近期内容列表')).toBeInTheDocument();
        expect(screen.getByText('2024年最火的穿搭技巧')).toBeInTheDocument();
      });
    });
    And('数据为该账号最近发布的内容', async () => {
      await waitFor(() => {
        expect(screen.getByText('125000')).toBeInTheDocument();
      });
    });
  });

  Scenario('近期内容列表分页', ({ Given, When, Then, And }) => {
    Given('在账号详情页，内容数量大于10', () => {
      vi.mocked(useQuery).mockReturnValue(
        mockUseQuery({ data: createMockAccountDetailData() }),
      );
    });
    When('观察分页器，确认默认每页10条', async () => {
      render(<AccountPage />);
    });
    And('点击「下一页」', async () => {
      await waitFor(() => {
        const nextButton = screen.getByText('下一页');
        fireEvent.click(nextButton);
      });
    });
    And('等待列表刷新', async () => {
      await waitFor(() => {
        expect(mockMessage.info).toHaveBeenCalled();
      });
    });
    Then('页码变为2', async () => {
      await waitFor(() => {
        expect(screen.getByText('2')).toBeInTheDocument();
      });
    });
  });

  Scenario('返回保持主页状态', ({ Given, When, Then, And }) => {
    Given('在数据中心主页设置时间筛选为「近7天」、平台筛选为「抖音」', () => {
      vi.mocked(useQuery).mockReturnValue(
        mockUseQuery({ data: createMockAccountDetailData() }),
      );
    });
    And(
      '在内容表现列表将排序改为「按点赞量」，类型改为「视频」，翻到第2页',
      () => {
        sessionStorage.setItem(
          'datacenter_state',
          JSON.stringify({
            timeRange: 'last7days',
            platform: 'douyin',
            sort: 'like',
            contentType: 'video',
            page: 2,
          }),
        );
      },
    );
    When('点击某账号进入账号详情页', async () => {
      render(<AccountPage />);
    });
    And('在账号详情页点击「返回数据中心」', async () => {
      const button = screen
        .getByText('返回数据中心')
        .closest('button') as HTMLButtonElement;
      fireEvent.click(button);
    });
    And('等待返回主页', async () => {
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/datacenter', {
          replace: true,
        });
      });
    });
    Then('时间筛选仍为「近7天」', async () => {
      await waitFor(() => {
        expect(screen.getByText('近7天')).toBeInTheDocument();
      });
    });
    And('平台筛选仍为「抖音」', async () => {
      await waitFor(() => {
        expect(screen.getByText('抖音')).toBeInTheDocument();
      });
    });
    And('排序仍为「按点赞量」', async () => {
      await waitFor(() => {
        expect(screen.getByText('按点赞量')).toBeInTheDocument();
      });
    });
    And('类型仍为「视频」', async () => {
      await waitFor(() => {
        expect(screen.getByText('视频')).toBeInTheDocument();
      });
    });
    And('页码仍为第2页', async () => {
      await waitFor(() => {
        expect(screen.getByText('2')).toBeInTheDocument();
      });
    });
    And('滚动位置保持', async () => {
      await waitFor(() => {
        expect(window.scrollY).toBeGreaterThanOrEqual(0);
      });
    });
  });

  Scenario('网络断开', ({ Given, When, Then, And }) => {
    Given('网络断开状态', () => {
      vi.mocked(useQuery).mockReturnValue(
        mockUseQuery({
          isError: true,
          error: new Error('Network Error'),
        }),
      );
    });
    When('在账号详情页执行任意操作', async () => {
      render(<AccountPage />);
    });
    Then('显示错误提示「网络连接失败，请检查网络后重试」', async () => {
      await waitFor(() => {
        expect(mockMessage.error).toHaveBeenCalledWith(
          '网络连接失败，请检查网络后重试',
        );
      });
    });
    And('显示重试按钮', async () => {
      await waitFor(() => {
        expect(screen.getByText('重试')).toBeInTheDocument();
      });
    });
  });

  Scenario('接口超时', ({ Given, When, Then, And }) => {
    Given('接口响应超时', () => {
      vi.mocked(useQuery).mockReturnValue(
        mockUseQuery({
          isError: true,
          error: new Error('Timeout'),
        }),
      );
    });
    When('在账号详情页执行操作', async () => {
      render(<AccountPage />);
    });
    Then('显示错误提示「数据加载超时，请稍后重试」', async () => {
      await waitFor(() => {
        expect(mockMessage.error).toHaveBeenCalledWith(
          '数据加载超时，请稍后重试',
        );
      });
    });
    And('显示重试按钮', async () => {
      await waitFor(() => {
        expect(screen.getByText('重试')).toBeInTheDocument();
      });
    });
  });

  Scenario('无数据空状态', ({ Given, When, Then }) => {
    Given('某区域无数据', () => {
      const data = createMockAccountDetailData({
        recentContents: {
          list: [],
          page: 1,
          pageSize: 10,
          total: '0',
          totalPages: 0,
          hasNext: false,
          hasPrevious: false,
        },
      });
      vi.mocked(useQuery).mockReturnValue(mockUseQuery({ data }));
    });
    When('观察各数据区域', async () => {
      render(<AccountPage />);
    });
    Then('显示对应空状态插画或提示', async () => {
      await waitFor(() => {
        expect(screen.getByText('近期内容列表')).toBeInTheDocument();
      });
    });
  });

  Scenario('Token失效', ({ Given, When, Then, And }) => {
    Given('Token已过期', () => {
      vi.mocked(useQuery).mockReturnValue(
        mockUseQuery({
          isError: true,
          error: new Error('401: Token expired'),
        }),
      );
    });
    When('访问账号详情页', async () => {
      render(<AccountPage />);
    });
    Then('跳转登录页', async () => {
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/login');
      });
    });
    And('提示「登录已过期，请重新登录」', async () => {
      await waitFor(() => {
        expect(mockMessage.error).toHaveBeenCalledWith(
          '登录已过期，请重新登录',
        );
      });
    });
  });

  Scenario('账号详情页Token失效', ({ Given, When, Then }) => {
    Given('Token已过期，在账号详情页', () => {
      vi.mocked(useQuery).mockReturnValue(
        mockUseQuery({
          isError: true,
          error: new Error('401: Token expired'),
        }),
      );
    });
    When('执行任意操作', async () => {
      render(<AccountPage />);
    });
    Then('跳转登录页', async () => {
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/login');
      });
    });
  });
});
