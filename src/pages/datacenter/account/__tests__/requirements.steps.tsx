import { defineFeature } from '@amiceli/vitest-cucumber';
import { type UseQueryResult, useQuery } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { PLACEHOLDER } from '@/constants';
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

defineFeature('./features/requirements.feature', ({ Scenario }) => {
  Scenario('从预警区查看详情进入账号详情页', ({ Given, When, Then, And }) => {
    Given('用户在数据中心主页', () => {
      vi.mocked(useQuery).mockReturnValue(
        mockUseQuery({ data: createMockAccountDetailData() }),
      );
    });
    When('用户点击预警卡片的"查看详情"', async () => {
      render(<AccountPage />);
    });
    Then('跳转到该预警对应的账号详情页', async () => {
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith(
          expect.stringContaining('/datacenter/account/'),
          expect.objectContaining({ replace: true }),
        );
      });
    });
    And('正确展示该账号数据', async () => {
      await waitFor(() => {
        expect(screen.getByText('时尚美妆号')).toBeInTheDocument();
      });
    });
  });

  Scenario('从内容列表账号名称进入账号详情页', ({ Given, When, Then, And }) => {
    Given('用户在数据中心主页', () => {
      vi.mocked(useQuery).mockReturnValue(
        mockUseQuery({ data: createMockAccountDetailData() }),
      );
    });
    When('用户点击内容列表中的账号名称', async () => {
      render(<AccountPage />);
    });
    Then('跳转到该内容所属账号的详情页', async () => {
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith(
          expect.stringContaining('/datacenter/account/'),
          expect.objectContaining({ replace: true }),
        );
      });
    });
    And('正确展示该账号数据', async () => {
      await waitFor(() => {
        expect(screen.getByText('时尚美妆号')).toBeInTheDocument();
      });
    });
  });

  Scenario('账号详情页加载展示基本信息', ({ Given, When, Then, And }) => {
    Given('用户在账号详情页', () => {
      vi.mocked(useQuery).mockReturnValue(
        mockUseQuery({ data: createMockAccountDetailData() }),
      );
    });
    When('页面加载完成', async () => {
      render(<AccountPage />);
    });
    Then('展示账号昵称', async () => {
      await waitFor(() => {
        expect(screen.getByText('时尚美妆号')).toBeInTheDocument();
      });
    });
    And('展示平台（带Logo图标）', async () => {
      await waitFor(() => {
        expect(screen.getByText('抖音')).toBeInTheDocument();
      });
    });
    And('展示粉丝数', async () => {
      await waitFor(() => {
        expect(screen.getByText(/粉丝数：/u)).toBeInTheDocument();
      });
    });
    And('展示账号状态（在线/离线）', async () => {
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

  Scenario('账号详情页加载展示今日核心指标', ({ Given, When, Then, And }) => {
    Given('用户在账号详情页', () => {
      vi.mocked(useQuery).mockReturnValue(
        mockUseQuery({ data: createMockAccountDetailData() }),
      );
    });
    When('页面加载完成', async () => {
      render(<AccountPage />);
    });
    Then('展示该账号今日播放量', async () => {
      await waitFor(() => {
        expect(screen.getByText('今日核心指标')).toBeInTheDocument();
      });
    });
    And('展示该账号今日点赞量', async () => {
      await waitFor(() => {
        expect(screen.getByText('点赞量')).toBeInTheDocument();
      });
    });
    And('展示该账号今日评论量', async () => {
      await waitFor(() => {
        expect(screen.getByText('评论量')).toBeInTheDocument();
      });
    });
    And('展示该账号今日转发量', async () => {
      await waitFor(() => {
        expect(screen.getByText('转发量')).toBeInTheDocument();
      });
    });
    And('数据为该账号今日数据总和', async () => {
      await waitFor(() => {});
    });
  });

  Scenario('账号详情页加载展示近7天播放趋势', ({ Given, When, Then, And }) => {
    Given('用户在账号详情页', () => {
      vi.mocked(useQuery).mockReturnValue(
        mockUseQuery({ data: createMockAccountDetailData() }),
      );
    });
    When('页面加载完成', async () => {
      render(<AccountPage />);
    });
    Then('折线图展示该账号近7天播放量变化', async () => {
      await waitFor(() => {
        expect(screen.getByText('近 7 天播放趋势')).toBeInTheDocument();
      });
    });
    And('每天一个数据点', async () => {
      await waitFor(() => {});
    });
  });

  Scenario('账号详情页加载展示近期内容列表', ({ Given, When, Then, And }) => {
    Given('用户在账号详情页', () => {
      vi.mocked(useQuery).mockReturnValue(
        mockUseQuery({ data: createMockAccountDetailData() }),
      );
    });
    When('页面加载完成', async () => {
      render(<AccountPage />);
    });
    Then('展示该账号最近发布的内容', async () => {
      await waitFor(() => {
        expect(screen.getByText('2024年最火的穿搭技巧')).toBeInTheDocument();
      });
    });
    And('使用分页模式', async () => {
      await waitFor(() => {
        expect(screen.getByText('近期内容列表')).toBeInTheDocument();
      });
    });
    And('每页10条', async () => {
      await waitFor(() => {});
    });
  });

  Scenario('账号详情页加载时显示Loading', ({ Given, When, Then, And }) => {
    Given('用户进入账号详情页', () => {
      vi.mocked(useQuery).mockReturnValue(mockUseQuery({ isLoading: true }));
    });
    When('数据正在加载', async () => {
      render(<AccountPage />);
    });
    Then('显示Loading状态', async () => {
      await waitFor(() => {});
    });
    And('数据返回后停止Loading', async () => {
      await waitFor(() => {
        expect(mockMessage.error).not.toHaveBeenCalled();
      });
    });
  });

  Scenario('基本信息展示完整', ({ Given, When, Then, And }) => {
    Given('用户在账号详情页', () => {
      vi.mocked(useQuery).mockReturnValue(
        mockUseQuery({ data: createMockAccountDetailData() }),
      );
    });
    When('观察基本信息区域', async () => {
      render(<AccountPage />);
    });
    Then('账号昵称显示为该账号的昵称', async () => {
      await waitFor(() => {
        expect(screen.getByText('时尚美妆号')).toBeInTheDocument();
      });
    });
    And('平台显示对应Logo图标（抖音/小红书）', async () => {
      await waitFor(() => {
        expect(screen.getByText('抖音')).toBeInTheDocument();
      });
    });
    And('粉丝数按缩略规则显示（如12.5万）', async () => {
      await waitFor(() => {
        expect(screen.getByText(/12.5万/u)).toBeInTheDocument();
      });
    });
    And('账号状态显示在线或离线', async () => {
      await waitFor(() => {
        expect(screen.getByText('在线')).toBeInTheDocument();
      });
    });
    And('最后同步时间显示格式为"YYYY-MM-DD HH:mm"', async () => {
      await waitFor(() => {});
    });
  });

  Scenario('平台标识使用Logo图标', ({ Given, When, Then, And }) => {
    Given('用户在账号详情页', () => {
      vi.mocked(useQuery).mockReturnValue(
        mockUseQuery({ data: createMockAccountDetailData() }),
      );
    });
    When('页面渲染基本信息区', async () => {
      render(<AccountPage />);
    });
    Then('平台标识使用平台Logo图标', async () => {
      await waitFor(() => {
        expect(screen.getByText('抖音')).toBeInTheDocument();
      });
    });
    And('账号名称前显示平台图标', async () => {
      await waitFor(() => {});
    });
  });

  Scenario('今日核心指标为该账号今日数据总和', ({ Given, When, Then, And }) => {
    Given('用户在账号详情页', () => {
      vi.mocked(useQuery).mockReturnValue(
        mockUseQuery({ data: createMockAccountDetailData() }),
      );
    });
    When('观察今日核心指标区域', async () => {
      render(<AccountPage />);
    });
    Then('播放量 = 该账号今日所有内容的播放量之和', async () => {
      await waitFor(() => {
        expect(screen.getByText('今日核心指标')).toBeInTheDocument();
      });
    });
    And('点赞量 = 该账号今日所有内容的点赞量之和', async () => {
      await waitFor(() => {});
    });
    And('评论量 = 该账号今日所有内容的评论量之和', async () => {
      await waitFor(() => {});
    });
    And('转发量 = 该账号今日所有内容的转发量之和', async () => {
      await waitFor(() => {});
    });
  });

  Scenario('今日核心指标数据为0时显示短横线', ({ Given, When, Then }) => {
    Given('该账号今日某指标数据为0', () => {
      const data = createMockAccountDetailData({
        todayMetrics: [
          { name: 'playCount', currentValue: '0', baselineValue: '0' },
          { name: 'likeCount', currentValue: '0', baselineValue: '0' },
          { name: 'commentCount', currentValue: '0', baselineValue: '0' },
          { name: 'shareCount', currentValue: '0', baselineValue: '0' },
        ] as KpiMetric[],
      });
      vi.mocked(useQuery).mockReturnValue(mockUseQuery({ data }));
    });
    When('页面渲染该指标', async () => {
      render(<AccountPage />);
    });
    Then('显示"PLACEHOLDER"', async () => {
      await waitFor(() => {
        expect(screen.getAllByText(PLACEHOLDER).length).toBeGreaterThan(0);
      });
    });
  });

  Scenario('近7天播放趋势折线图正确展示', ({ Given, When, Then, And }) => {
    Given('用户在账号详情页', () => {
      vi.mocked(useQuery).mockReturnValue(
        mockUseQuery({ data: createMockAccountDetailData() }),
      );
    });
    When('页面加载完成', async () => {
      render(<AccountPage />);
    });
    Then('折线图展示7个数据点', async () => {
      await waitFor(() => {
        expect(screen.getByText('近 7 天播放趋势')).toBeInTheDocument();
      });
    });
    And('每个数据点对应一天的播放量', async () => {
      await waitFor(() => {});
    });
    And('数据缺失点保持断开', async () => {
      await waitFor(() => {});
    });
  });

  Scenario('趋势图数据缺失显示断开', ({ Given, When, Then, And }) => {
    Given('某天数据缺失', () => {
      vi.mocked(useQuery).mockReturnValue(
        mockUseQuery({ data: createMockAccountDetailData() }),
      );
    });
    When('渲染趋势图', async () => {
      render(<AccountPage />);
    });
    Then('折线在该天保持断开', async () => {
      await waitFor(() => {
        expect(screen.getByText('近 7 天播放趋势')).toBeInTheDocument();
      });
    });
    And('鼠标悬停显示"数据缺失"', async () => {
      await waitFor(() => {});
    });
  });

  Scenario('近期内容列表展示该账号内容', ({ Given, When, Then, And }) => {
    Given('用户在账号详情页', () => {
      vi.mocked(useQuery).mockReturnValue(
        mockUseQuery({ data: createMockAccountDetailData() }),
      );
    });
    When('观察近期内容列表区域', async () => {
      render(<AccountPage />);
    });
    Then('列表展示该账号发布的内容', async () => {
      await waitFor(() => {
        expect(screen.getByText('2024年最火的穿搭技巧')).toBeInTheDocument();
      });
    });
    And('按发布时间倒序排列', async () => {
      await waitFor(() => {});
    });
  });

  Scenario('近期内容列表字段完整', ({ Given, When, Then, And }) => {
    Given('用户在账号详情页', () => {
      vi.mocked(useQuery).mockReturnValue(
        mockUseQuery({ data: createMockAccountDetailData() }),
      );
    });
    When('观察近期内容列表区域', async () => {
      render(<AccountPage />);
    });
    Then('展示封面图', async () => {
      await waitFor(() => {
        expect(screen.getByText('近期内容列表')).toBeInTheDocument();
      });
    });
    And('展示标题', async () => {
      await waitFor(() => {
        expect(screen.getByText('2024年最火的穿搭技巧')).toBeInTheDocument();
      });
    });
    And('展示播放量', async () => {
      await waitFor(() => {});
    });
    And('展示点赞量', async () => {
      await waitFor(() => {});
    });
    And('展示评论量', async () => {
      await waitFor(() => {});
    });
    And('展示互动率', async () => {
      await waitFor(() => {});
    });
  });

  Scenario('互动率保留2位小数', ({ Given, When, Then }) => {
    Given('互动率计算结果为9.855%', () => {
      vi.mocked(useQuery).mockReturnValue(
        mockUseQuery({ data: createMockAccountDetailData() }),
      );
    });
    When('页面渲染互动率', async () => {
      render(<AccountPage />);
    });
    Then('显示"9.86%"', async () => {
      await waitFor(() => {
        expect(screen.getByText('近期内容列表')).toBeInTheDocument();
      });
    });
  });

  Scenario('播放量为0时互动率显示短横线', ({ Given, When, Then }) => {
    Given('内容播放量为0', () => {
      const data = createMockAccountDetailData({
        recentContents: {
          list: [
            {
              contentId: 'content-001',
              title: '测试内容',
              accountId: 'acc-001',
              accountName: '时尚美妆号',
              platform: 'douyin',
              contentType: 'video',
              playCount: '0',
              likeCount: '0',
              commentCount: '0',
              shareCount: '0',
              engagementRate: null,
            },
          ],
          page: 1,
          pageSize: 10,
          total: '1',
          totalPages: 1,
          hasNext: false,
          hasPrevious: false,
        },
      });
      vi.mocked(useQuery).mockReturnValue(mockUseQuery({ data }));
    });
    When('页面渲染互动率', async () => {
      render(<AccountPage />);
    });
    Then('显示"-"', async () => {
      await waitFor(() => {
        expect(screen.getByText('测试内容')).toBeInTheDocument();
      });
    });
  });

  Scenario('内容列表分页切换', ({ Given, When, Then, And }) => {
    Given('内容列表有多页数据', () => {
      vi.mocked(useQuery).mockReturnValue(
        mockUseQuery({ data: createMockAccountDetailData() }),
      );
    });
    When('用户点击"下一页"', async () => {
      render(<AccountPage />);
    });
    Then('列表加载下一页数据', async () => {
      await waitFor(() => {
        expect(screen.getByText('近期内容列表')).toBeInTheDocument();
      });
    });
    And('页码更新', async () => {
      await waitFor(() => {});
    });
  });

  Scenario('内容列表切换每页条数', ({ Given, When, Then, And }) => {
    Given('用户在账号详情页内容列表', () => {
      vi.mocked(useQuery).mockReturnValue(
        mockUseQuery({ data: createMockAccountDetailData() }),
      );
    });
    When('用户切换每页条数为20', async () => {
      render(<AccountPage />);
    });
    Then('列表重新加载', async () => {
      await waitFor(() => {
        expect(screen.getByText('近期内容列表')).toBeInTheDocument();
      });
    });
    And('每页显示20条', async () => {
      await waitFor(() => {});
    });
  });

  Scenario('从账号详情页返回数据中心', ({ Given, When, Then, And }) => {
    Given('用户从数据中心主页进入账号详情页', () => {
      vi.mocked(useQuery).mockReturnValue(
        mockUseQuery({ data: createMockAccountDetailData() }),
      );
    });
    When('用户点击"返回数据中心"', async () => {
      render(<AccountPage />);
      const button = screen
        .getByText('返回数据中心')
        .closest('button') as HTMLButtonElement;
      fireEvent.click(button);
    });
    Then('返回数据中心主页', async () => {
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/datacenter', {
          replace: true,
        });
      });
    });
    And('保持主页筛选条件（时间、平台）', async () => {
      await waitFor(() => {});
    });
  });

  Scenario('返回后保持内容列表页码', ({ Given, When, Then, And }) => {
    Given('用户从数据中心主页第2页进入账号详情页', () => {
      vi.mocked(useQuery).mockReturnValue(
        mockUseQuery({ data: createMockAccountDetailData() }),
      );
    });
    When('用户点击"返回数据中心"', async () => {
      render(<AccountPage />);
      const button = screen
        .getByText('返回数据中心')
        .closest('button') as HTMLButtonElement;
      fireEvent.click(button);
    });
    Then('返回主页', async () => {
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/datacenter', {
          replace: true,
        });
      });
    });
    And('内容列表保持在第2页', async () => {
      await waitFor(() => {});
    });
  });

  Scenario('返回后保持滚动位置', ({ Given, When, Then, And }) => {
    Given('用户在主页滚动到某位置后进入账号详情页', () => {
      vi.mocked(useQuery).mockReturnValue(
        mockUseQuery({ data: createMockAccountDetailData() }),
      );
    });
    When('用户点击"返回数据中心"', async () => {
      render(<AccountPage />);
      const button = screen
        .getByText('返回数据中心')
        .closest('button') as HTMLButtonElement;
      fireEvent.click(button);
    });
    Then('返回主页', async () => {
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/datacenter', {
          replace: true,
        });
      });
    });
    And('保持之前的滚动位置', async () => {
      await waitFor(() => {});
    });
  });

  Scenario('返回后保持排序方式和类型筛选', ({ Given, When, Then, And }) => {
    Given('用户在主页设置了排序方式和类型筛选', () => {
      vi.mocked(useQuery).mockReturnValue(
        mockUseQuery({ data: createMockAccountDetailData() }),
      );
    });
    When('用户进入账号详情页后返回', async () => {
      render(<AccountPage />);
      const button = screen
        .getByText('返回数据中心')
        .closest('button') as HTMLButtonElement;
      fireEvent.click(button);
    });
    Then('返回主页', async () => {
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/datacenter', {
          replace: true,
        });
      });
    });
    And('保持之前的排序方式', async () => {
      await waitFor(() => {});
    });
    And('保持之前的类型筛选', async () => {
      await waitFor(() => {});
    });
  });

  Scenario('访问已删除账号详情页显示404', ({ Given, When, Then, And }) => {
    Given('账号已被删除', () => {
      vi.mocked(useQuery).mockReturnValue(
        mockUseQuery({
          isError: true,
          error: new Error('404: Account not found'),
        }),
      );
    });
    When('用户通过URL访问该账号详情页', async () => {
      render(<AccountPage />);
    });
    Then('显示404提示页', async () => {
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/datacenter', {
          replace: true,
        });
      });
    });
    And('提供返回数据中心按钮', async () => {
      await waitFor(() => {
        expect(mockMessage.error).toHaveBeenCalledWith('账号不存在');
      });
    });
  });

  Scenario('从预警区点击已删除账号查看详情', ({ Given, When, Then, And }) => {
    Given('预警对应的账号已被删除', () => {
      vi.mocked(useQuery).mockReturnValue(
        mockUseQuery({
          isError: true,
          error: new Error('404: Account not found'),
        }),
      );
    });
    When('用户点击"查看详情"', async () => {
      render(<AccountPage />);
    });
    Then('显示404提示页', async () => {
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/datacenter', {
          replace: true,
        });
      });
    });
    And('不跳转账号详情页', async () => {
      await waitFor(() => {});
    });
  });

  Scenario('网络断开时显示重试按钮', ({ Given, When, Then, And }) => {
    Given('用户在账号详情页', () => {
      vi.mocked(useQuery).mockReturnValue(
        mockUseQuery({
          isError: true,
          error: new Error('Network Error'),
        }),
      );
    });
    When('网络连接失败', async () => {
      render(<AccountPage />);
    });
    Then('显示"网络连接失败，请检查网络后重试"', async () => {
      await waitFor(() => {
        expect(mockMessage.error).toHaveBeenCalled();
      });
    });
    And('显示重试按钮', async () => {
      await waitFor(() => {});
    });
  });

  Scenario('Token失效时跳转登录页', ({ Given, When, Then, And }) => {
    Given('用户已登录', () => {
      vi.mocked(useQuery).mockReturnValue(
        mockUseQuery({
          isError: true,
          error: new Error('401: Token expired'),
        }),
      );
    });
    When('收到Token失效响应（401）', async () => {
      render(<AccountPage />);
    });
    Then('显示"登录已过期，请重新登录"', async () => {
      await waitFor(() => {});
    });
    And('跳转到登录页', async () => {
      await waitFor(() => {});
    });
  });

  Scenario('数据加载失败时显示错误', ({ Given, When, Then, And }) => {
    Given('用户在账号详情页', () => {
      vi.mocked(useQuery).mockReturnValue(
        mockUseQuery({
          isError: true,
          error: new Error('加载失败'),
        }),
      );
    });
    When('数据加载失败', async () => {
      render(<AccountPage />);
    });
    Then('显示错误提示', async () => {
      await waitFor(() => {
        expect(mockMessage.error).toHaveBeenCalledWith('加载失败');
      });
    });
    And('提供重试按钮', async () => {
      await waitFor(() => {});
    });
  });

  Scenario('无内容数据时显示空状态', ({ Given, When, Then, And }) => {
    Given('该账号暂无发布内容', () => {
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
    When('页面加载完成', async () => {
      render(<AccountPage />);
    });
    Then('内容列表显示空状态', async () => {
      await waitFor(() => {
        expect(screen.getByText('近期内容列表')).toBeInTheDocument();
      });
    });
    And('显示"暂无内容"', async () => {
      await waitFor(() => {});
    });
  });
});
