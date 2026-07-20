import { defineFeature } from '@amiceli/vitest-cucumber';
import { type UseQueryResult, useQuery } from '@tanstack/react-query';
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { vi } from 'vitest';
import { PLACEHOLDER } from '@/constants';
import { ignoreWarning } from '@/services/alert';
import {
  contentsQueryOptions,
  type PageContentPerformanceResponse,
} from '@/services/statistics';

vi.mock('../components/PlayTrendChart', () => ({
  default: () => null,
}));

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
const mockRefetch = vi.fn();

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

const advanceTime = async (ms: number) => {
  vi.useFakeTimers();
  await act(() => {
    vi.advanceTimersByTime(ms);
  });
  vi.useRealTimers();
};

defineFeature('./features/test.feature', ({ Scenario }) => {
  Scenario('今日时间筛选默认选中', ({ Given, When, Then }) => {
    Given('用户已登录系统', () => {
      vi.mocked(useQuery).mockReturnValue(mockUseQuery());
    });
    When('进入数据中心主页', async () => {
      render(<DataCentre />);
    });
    Then('默认选中「今日」时间筛选', async () => {
      await waitFor(() => {
        expect(screen.getByText('今日')).toBeInTheDocument();
      });
    });
  });

  Scenario('近7天时间筛选', ({ Given, When, Then, And }) => {
    Given('用户已登录系统', () => {
      vi.mocked(useQuery).mockReset();
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
    });
    When('选择「近7天」时间筛选', async () => {
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
    });
    Then('时间范围为过去7天（含今天）', async () => {
      await waitFor(() => {
        expect(mockRefetch).toHaveBeenCalled();
      });
    });
    And('环比为与前7天对比', async () => {
      await waitFor(() => {
        expect(screen.getAllByText('与前7天对比').length).toBeGreaterThan(0);
      });
    });
  });

  Scenario('近30天时间筛选', ({ Given, When, Then }) => {
    Given('用户已登录系统', () => {
      vi.mocked(useQuery).mockReturnValue(mockUseQuery());
    });
    When('选择「近30天」时间筛选', async () => {
      render(<DataCentre />);
      const button = screen.getByText('近30天');
      fireEvent.click(button);
    });
    Then('时间范围为过去30天（含今天）', async () => {
      await waitFor(() => {
        expect(mockRefetch).toHaveBeenCalled();
      });
    });
  });

  Scenario('今年时间筛选', ({ Given, When, Then, And }) => {
    Given('用户已登录系统', () => {
      vi.mocked(useQuery).mockReturnValue(mockUseQuery());
    });
    When('选择「今年」时间筛选', async () => {
      render(<DataCentre />);
      const button = screen.getByText('今年');
      fireEvent.click(button);
    });
    Then('时间范围为今年1月1日~今天', async () => {
      await waitFor(() => {
        expect(mockRefetch).toHaveBeenCalled();
      });
    });
    And('显示同比（与去年同期对比）', async () => {});
  });

  Scenario('今日时间筛选数据正确性', ({ Given, When, Then, And }) => {
    Given('用户已登录系统，时间筛选选中「今日」', () => {
      const data = createMockOverviewData({ timeRange: 'today' });
      vi.mocked(useQuery).mockReturnValue(mockUseQuery({ data }));
    });
    When('观察六宫格指标卡数据', async () => {
      render(<DataCentre />);
    });
    Then('数据为当日数据（00:00:00~23:59:59）', async () => {
      await waitFor(() => {
        expect(screen.getByText('总播放量')).toBeInTheDocument();
      });
    });
    And('每个指标的环比与昨日同时段对比', async () => {});
  });

  Scenario('平台筛选默认全部', ({ Given, When, Then, And }) => {
    Given('用户已登录系统', () => {
      vi.mocked(useQuery).mockReturnValue(mockUseQuery());
    });
    When('进入数据中心主页', async () => {
      render(<DataCentre />);
    });
    Then('默认选中「全部平台」', async () => {
      await waitFor(() => {
        expect(screen.getByText('全部平台')).toBeInTheDocument();
      });
    });
    And('等待数据加载完成', async () => {
      await waitFor(() => {
        expect(screen.getByText('总播放量')).toBeInTheDocument();
      });
    });
  });

  Scenario('平台筛选-抖音', ({ Given, When, Then, And }) => {
    Given('用户已登录系统，有抖音和小红书账号', () => {
      const data = createMockOverviewData({ platform: 'douyin' });
      vi.mocked(useQuery).mockReturnValue(mockUseQuery({ data }));
    });
    When('选择「抖音」平台筛选', async () => {
      render(<DataCentre />);
      const button = screen.getByText('抖音');
      fireEvent.click(button);
    });
    Then('六宫格数据仅包含抖音账号的汇总数据', async () => {
      await waitFor(() => {
        expect(mockRefetch).toHaveBeenCalled();
      });
    });
    And('数据预警区仅显示抖音账号的预警', async () => {});
  });

  Scenario('平台筛选-小红书', ({ Given, When, Then }) => {
    Given('用户已登录系统，有抖音和小红书账号', () => {
      vi.mocked(useQuery).mockReturnValue(mockUseQuery());
    });
    When('选择「小红书」平台筛选', async () => {
      render(<DataCentre />);
      const button = screen.getByText('小红书');
      fireEvent.click(button);
    });
    Then('六宫格数据仅包含小红书账号的汇总数据', async () => {
      await waitFor(() => {
        expect(mockRefetch).toHaveBeenCalled();
      });
    });
  });

  Scenario('平台筛选-组合时间联动', ({ Given, When, Then, And }) => {
    Given('用户已登录系统', () => {
      vi.mocked(useQuery).mockReturnValue(mockUseQuery());
    });
    When('设置时间筛选为「近7天」', async () => {
      render(<DataCentre />);
      const button = screen.getByText('近7天');
      fireEvent.click(button);
    });
    And('设置平台筛选为「抖音」', async () => {
      const button = screen.getByText('抖音');
      fireEvent.click(button);
    });
    Then('六宫格数据为近7天内抖音账号的汇总数据', async () => {
      await waitFor(() => {
        expect(mockRefetch).toHaveBeenCalled();
      });
    });
  });

  Scenario('跨天数据临界-六宫格骨架屏', ({ Given, When, Then, And }) => {
    Given('在凌晨00:00-00:30时段', () => {
      vi.mocked(useQuery).mockReturnValue(mockUseQuery({ isLoading: true }));
    });
    When('访问数据中心主页', async () => {
      render(<DataCentre />);
    });
    Then('六宫格显示骨架屏（灰色块+脉冲动画）', async () => {
      await waitFor(() => {});
    });
    And('不显示「-」或「0」或具体数字', async () => {
      expect(screen.queryByText('总播放量')).not.toBeInTheDocument();
    });
  });

  Scenario('跨天数据延迟提示', ({ Given, When, Then, And }) => {
    Given('在凌晨00:00后新数据未返回', () => {
      vi.mocked(useQuery).mockReturnValue(mockUseQuery());
    });
    When('访问数据中心主页', async () => {
      render(<DataCentre />);
    });
    Then('显示轻提示「数据更新中，当前显示昨日数据」', async () => {
      await waitFor(() => {
        expect(mockMessage.info).toHaveBeenCalledWith(
          '数据更新中，当前显示昨日数据',
        );
      });
    });
    And('等待新数据返回后，提示消失，六宫格正常显示', async () => {});
  });

  Scenario('平台筛选后无数据', ({ Given, When, Then, And }) => {
    Given('存在一个没有账号的平台', () => {
      const data = createMockOverviewData({ metrics: [] });
      vi.mocked(useQuery).mockReturnValue(mockUseQuery({ data }));
    });
    When('选择该平台进行筛选', async () => {
      render(<DataCentre />);
    });
    Then('六宫格显示「-」或空状态提示', async () => {
      await waitFor(() => {
        expect(screen.getByText(PLACEHOLDER)).toBeInTheDocument();
      });
    });
    And('数据预警区显示「暂无预警」', async () => {
      await waitFor(() => {
        expect(screen.getByText('暂无预警')).toBeInTheDocument();
      });
    });
  });

  Scenario('刷新按钮-Loading状态', ({ Given, When, Then, And }) => {
    Given('用户已登录系统', () => {
      vi.mocked(useQuery).mockReturnValue(mockUseQuery());
    });
    When('点击「刷新」按钮', async () => {
      render(<DataCentre />);
      const button = screen
        .getByText('刷新')
        .closest('button') as HTMLButtonElement;
      fireEvent.click(button);
    });
    Then('按钮文字从「刷新」变为「刷新中...」', async () => {
      await waitFor(() => {
        expect(screen.getByText('刷新中...')).toBeInTheDocument();
      });
    });
    And('按钮显示旋转图标，按钮不可再次点击（禁用状态）', async () => {
      const button = screen
        .getByText('刷新中...')
        .closest('button') as HTMLButtonElement;
      expect(button).toBeDisabled();
    });
  });

  Scenario('刷新按钮-完成后恢复', ({ Given, When, Then, And }) => {
    Given('用户已登录系统', () => {
      vi.mocked(useQuery).mockReturnValue(mockUseQuery());
    });
    When('点击刷新按钮', async () => {
      render(<DataCentre />);
      const button = screen
        .getByText('刷新')
        .closest('button') as HTMLButtonElement;
      fireEvent.click(button);
    });
    And('等待刷新操作完成', async () => {
      await waitFor(() => {
        expect(screen.getByText('刷新')).toBeInTheDocument();
      });
    });
    Then('按钮文字恢复为「刷新」，按钮可再次点击', async () => {
      const button = screen
        .getByText('刷新')
        .closest('button') as HTMLButtonElement;
      expect(button).not.toBeDisabled();
    });
    And('页面右上角「上次刷新时间」更新为当前时间', async () => {
      await waitFor(() => {
        expect(screen.getByText(/上次刷新/u)).toBeInTheDocument();
      });
    });
  });

  Scenario('刷新保持筛选条件', ({ Given, When, Then, And }) => {
    Given(
      '用户已登录系统，已设置时间筛选为「近7天」和平台筛选为「抖音」',
      () => {
        vi.mocked(useQuery).mockReturnValue(mockUseQuery());
      },
    );
    When('点击刷新按钮', async () => {
      render(<DataCentre />);
      const button = screen
        .getByText('刷新')
        .closest('button') as HTMLButtonElement;
      fireEvent.click(button);
    });
    And('等待刷新完成', async () => {
      await waitFor(() => {
        expect(screen.getByText('刷新')).toBeInTheDocument();
      });
    });
    Then('时间筛选仍为「近7天」', async () => {
      await waitFor(() => {
        expect(screen.getByText('近7天')).toBeInTheDocument();
      });
    });
    And('平台筛选仍为「抖音」', async () => {
      expect(screen.getByText('抖音')).toBeInTheDocument();
    });
  });

  Scenario('刷新全页面刷新', ({ Given, When, Then, And }) => {
    Given('用户已登录系统，当前有数据展示', () => {
      vi.mocked(useQuery).mockReturnValue(mockUseQuery());
    });
    When('点击刷新按钮', async () => {
      render(<DataCentre />);
      const button = screen
        .getByText('刷新')
        .closest('button') as HTMLButtonElement;
      fireEvent.click(button);
    });
    And('等待刷新完成', async () => {
      await waitFor(() => {
        expect(screen.getByText('刷新')).toBeInTheDocument();
      });
    });
    Then('数据预警区数据已刷新', async () => {
      expect(mockRefetch).toHaveBeenCalled();
    });
    And('六宫格指标卡数据已刷新', async () => {
      expect(mockRefetch).toHaveBeenCalled();
    });
    And('播放趋势图数据已刷新', async () => {
      expect(mockRefetch).toHaveBeenCalled();
    });
    And('内容表现列表数据已刷新', async () => {
      expect(mockRefetch).toHaveBeenCalled();
    });
  });

  Scenario('刷新请求失败', ({ Given, When, Then, And }) => {
    Given('用户已登录系统，网络异常', () => {
      const data = createMockOverviewData();
      vi.mocked(useQuery).mockReturnValue(
        mockUseQuery({
          data,
          isError: true,
          error: new Error('Network Error'),
        }),
      );
    });
    When('点击刷新按钮', async () => {
      render(<DataCentre />);
      const button = screen
        .getByText('刷新')
        .closest('button') as HTMLButtonElement;
      fireEvent.click(button);
    });
    Then('Toast提示「刷新失败，请稍后重试」', async () => {
      await waitFor(() => {
        expect(mockMessage.error).toHaveBeenCalledWith('刷新失败，请稍后重试');
      });
    });
    And('按钮恢复可点击状态', async () => {
      await waitFor(() => {
        const refreshBtn = screen
          .getByText('刷新')
          .closest('button') as HTMLButtonElement;
        expect(refreshBtn).not.toBeDisabled();
      });
    });
    And('数据保留刷新前的旧数据', async () => {
      await waitFor(() => {
        expect(screen.getByText('总播放量')).toBeInTheDocument();
      });
    });
  });

  Scenario('刷新中趋势图蒙层', ({ Given, When, Then, And }) => {
    Given('用户已登录系统', () => {
      vi.mocked(useQuery).mockReturnValue(mockUseQuery());
    });
    When('点击刷新按钮', async () => {
      render(<DataCentre />);
      const button = screen
        .getByText('刷新')
        .closest('button') as HTMLButtonElement;
      fireEvent.click(button);
    });
    And('立即观察趋势图区域', async () => {
      await waitFor(() => {
        const loadingOverlay = screen.queryByTestId('trend-loading-overlay');
        expect(loadingOverlay).toBeInTheDocument();
      });
    });
    Then('趋势图显示旧数据+半透明Loading蒙层（不清空现有数据）', async () => {
      await waitFor(() => {
        expect(screen.getByText('播放趋势')).toBeInTheDocument();
      });
    });
    And('等待数据加载完成，蒙层消失', async () => {
      await waitFor(() => {
        expect(screen.getByText('刷新')).toBeInTheDocument();
      });
    });
  });

  Scenario('自动刷新-每5分钟', ({ Given, When, Then, And }) => {
    Given('用户已登录系统，停留在页面', () => {
      vi.mocked(useQuery).mockReturnValue(mockUseQuery());
    });
    When('等待5分钟', async () => {
      vi.useFakeTimers();
      await act(async () => {
        vi.advanceTimersByTime(5 * 60 * 1000);
      });
      vi.useRealTimers();
    });
    Then('数据预警区的预警数量和卡片数据自动刷新', async () => {
      expect(mockRefetch).toHaveBeenCalledTimes(1);
    });
    And('六宫格指标卡数据自动刷新', async () => {
      expect(mockRefetch).toHaveBeenCalledTimes(2);
    });
  });

  Scenario('自动刷新-页面隐藏暂停', ({ Given, When, Then, And }) => {
    Given('用户已登录系统', () => {
      vi.mocked(useQuery).mockReturnValue(mockUseQuery());
    });
    When('切换到其他浏览器标签页', async () => {
      Object.defineProperty(document, 'hidden', {
        value: true,
        writable: true,
      });
      document.dispatchEvent(new Event('visibilitychange'));
    });
    And('等待5分钟', async () => {
      vi.useFakeTimers();
      await act(async () => {
        vi.advanceTimersByTime(5 * 60 * 1000);
      });
      vi.useRealTimers();
    });
    Then('自动刷新定时器在页面隐藏期间暂停执行（不刷新数据）', async () => {
      expect(mockRefetch).not.toHaveBeenCalled();
      Object.defineProperty(document, 'hidden', {
        value: false,
        writable: true,
      });
    });
    And('页面恢复可见后，定时器继续运行', async () => {
      document.dispatchEvent(new Event('visibilitychange'));
      vi.useFakeTimers();
      await act(async () => {
        vi.advanceTimersByTime(5 * 60 * 1000);
      });
      vi.useRealTimers();
      expect(mockRefetch).toHaveBeenCalled();
    });
  });

  Scenario('自动刷新-页面重新可见立即刷新', ({ Given, When, Then, And }) => {
    Given('用户已登录系统', () => {
      vi.mocked(useQuery).mockReturnValue(mockUseQuery());
    });
    When('切换到其他标签页', async () => {
      Object.defineProperty(document, 'hidden', {
        value: true,
        writable: true,
      });
      document.dispatchEvent(new Event('visibilitychange'));
    });
    And('等待1分钟后，切换回数据中心标签页', async () => {
      vi.useFakeTimers();
      await act(async () => {
        vi.advanceTimersByTime(60 * 1000);
      });
      Object.defineProperty(document, 'hidden', {
        value: false,
        writable: true,
      });
      document.dispatchEvent(new Event('visibilitychange'));
      vi.useRealTimers();
    });
    Then('页面立即执行一次刷新', async () => {
      expect(mockRefetch).toHaveBeenCalled();
    });
    And('数据已更新，且定时器重新启动', async () => {
      vi.useFakeTimers();
      await act(async () => {
        vi.advanceTimersByTime(5 * 60 * 1000);
      });
      vi.useRealTimers();
      expect(mockRefetch).toHaveBeenCalledTimes(2);
    });
  });

  Scenario('自动刷新不影响趋势图', ({ Given, When, Then, And }) => {
    Given('用户已登录系统，趋势图有数据', () => {
      vi.mocked(useQuery).mockReturnValue(mockUseQuery());
    });
    When('等待自动刷新触发（5分钟）', async () => {
      vi.useFakeTimers();
      await act(async () => {
        vi.advanceTimersByTime(5 * 60 * 1000);
      });
      vi.useRealTimers();
    });
    Then('自动刷新只刷新数据预警区和六宫格', async () => {
      expect(mockRefetch).toHaveBeenCalled();
    });
    And(
      '播放趋势图保持原有数据和账号选中状态，不受自动刷新影响',
      async () => {},
    );
  });

  Scenario('自动刷新不影响内容列表', ({ Given, When, Then, And }) => {
    Given('用户已登录系统，内容列表有数据', () => {
      vi.mocked(useQuery).mockReturnValue(mockUseQuery());
    });
    When('等待自动刷新触发', async () => {
      vi.useFakeTimers();
      await act(async () => {
        vi.advanceTimersByTime(5 * 60 * 1000);
      });
      vi.useRealTimers();
    });
    Then('自动刷新只刷新数据预警区和六宫格', async () => {
      expect(mockRefetch).toHaveBeenCalled();
    });
    And('内容表现列表保持原有筛选条件、排序方式和页码', async () => {});
  });

  Scenario('操作中暂停自动刷新', ({ Given, When, Then, And }) => {
    Given('用户已登录系统，正在进行筛选操作', () => {
      vi.mocked(useQuery).mockReturnValue(mockUseQuery());
    });
    When('快速点击时间筛选选项（触发筛选操作）', async () => {
      render(<DataCentre />);
    });
    And(
      '在筛选操作后立即（300ms内）等待自动刷新定时器应该触发的时间点',
      async () => {
        vi.useFakeTimers();
        await act(async () => {
          vi.advanceTimersByTime(300);
        });
        vi.useRealTimers();
      },
    );
    Then('自动刷新暂停本次周期', async () => {
      expect(mockRefetch).not.toHaveBeenCalled();
    });
    And('操作结束后（防抖300ms后），自动刷新定时器恢复', async () => {
      vi.useFakeTimers();
      await act(async () => {
        vi.advanceTimersByTime(5 * 60 * 1000);
      });
      vi.useRealTimers();
      expect(mockRefetch).toHaveBeenCalled();
    });
  });

  Scenario('Loading状态暂停自动刷新', ({ Given, When, Then }) => {
    Given('用户已登录系统，内容列表加载中', () => {
      vi.mocked(useQuery).mockReturnValue(mockUseQuery({ isLoading: true }));
    });
    When('在Loading期间，等待自动刷新定时器应该触发的时间点', async () => {
      render(<DataCentre />);
      vi.useFakeTimers();
      await act(async () => {
        vi.advanceTimersByTime(5 * 60 * 1000);
      });
      vi.useRealTimers();
    });
    Then('自动刷新暂停，不在列表Loading时刷新数据', async () => {
      expect(mockRefetch).not.toHaveBeenCalled();
    });
  });

  Scenario('预警区默认展示最近3条', ({ Given, When, Then, And }) => {
    Given('用户已登录系统，有多条预警', () => {
      const data = createMockWarningData();
      vi.mocked(useQuery).mockReturnValue(mockUseQuery({ data }));
    });
    When('进入数据中心主页', async () => {
      render(<DataCentre />);
    });
    Then('默认展示最近3条预警卡片', async () => {
      await waitFor(() => {
        expect(screen.getByText('时尚美妆号')).toBeInTheDocument();
      });
    });
    And('预警按时间倒序排列（最新在前）', async () => {});
  });

  Scenario('预警区统计显示', ({ Given, When, Then }) => {
    Given('用户已登录系统', () => {
      const overviewData = createMockOverviewData();
      const warningData = createMockWarningData();
      vi.mocked(useQuery)
        .mockReturnValueOnce(mockUseQuery({ data: overviewData }))
        .mockReturnValueOnce(mockUseQuery({ data: warningData }))
        .mockReturnValueOnce(mockUseQuery({ data: createMockTrendData() }))
        .mockReturnValueOnce(mockUseQuery({ data: createMockContentsData() }))
        .mockReturnValueOnce(mockUseQuery({ data: createMockAccountData() }));
    });
    When('观察数据预警区标题', async () => {
      render(<DataCentre />);
    });
    Then(
      '显示格式为「🔴 数据预警 总预警 N · 未读 N · 异常账号 N」',
      async () => {
        await waitFor(() => {
          expect(screen.getByText(/总预警 12/u)).toBeInTheDocument();
          expect(screen.getByText(/未读 5/u)).toBeInTheDocument();
          expect(screen.getByText(/异常账号 4/u)).toBeInTheDocument();
        });
      },
    );
  });

  Scenario('预警卡片格式-红色高风险', ({ Given, When, Then }) => {
    Given('有🔴红色预警（登录失效/账号被禁言/异地登录）', () => {
      const warningData = createMockWarningData({
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
          ],
          page: 1,
          pageSize: 3,
          total: '1',
          totalPages: 1,
          hasNext: false,
          hasPrevious: false,
        },
      });
      vi.mocked(useQuery).mockReturnValue(mockUseQuery({ data: warningData }));
    });
    When('找到任意一条🔴红色预警卡片', async () => {
      render(<DataCentre />);
    });
    Then(
      '卡片包含：🔴红色图标、平台标签（灰色圆角背景）、账号·平台名称、异常类型+阈值、操作按钮（查看详情/去处理）、时间',
      async () => {
        await waitFor(() => {
          expect(screen.getByText('时尚美妆号')).toBeInTheDocument();
          expect(screen.getByText('登录已失效')).toBeInTheDocument();
        });
      },
    );
  });

  Scenario('预警卡片格式-橙色关注', ({ Given, When, Then, And }) => {
    Given('有🟠橙色预警（播放量过低/点赞率过低/粉丝负增长）', () => {
      const warningData = createMockWarningData({
        pageData: {
          list: [
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
          ],
          page: 1,
          pageSize: 3,
          total: '1',
          totalPages: 1,
          hasNext: false,
          hasPrevious: false,
        },
      });
      vi.mocked(useQuery).mockReturnValue(mockUseQuery({ data: warningData }));
    });
    When('找到任意一条🟠橙色预警卡片', async () => {
      render(<DataCentre />);
    });
    Then('卡片显示🟠橙色图标', async () => {
      await waitFor(() => {
        expect(screen.getByText('生活笔记')).toBeInTheDocument();
      });
    });
    And('卡片格式与红色预警一致', async () => {});
  });

  Scenario('预警卡片格式-绿色正常', ({ Given, When, Then }) => {
    Given('有🟢绿色预警', () => {
      const warningData = createMockWarningData({
        pageData: {
          list: [
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
          total: '1',
          totalPages: 1,
          hasNext: false,
          hasPrevious: false,
        },
      });
      vi.mocked(useQuery).mockReturnValue(mockUseQuery({ data: warningData }));
    });
    When('观察绿色预警卡片', async () => {
      render(<DataCentre />);
    });
    Then('卡片显示🟢绿色图标', async () => {
      await waitFor(() => {
        expect(screen.getByText('科技评测')).toBeInTheDocument();
      });
    });
  });

  Scenario('预警卡片高度自适应', ({ Given, When, Then }) => {
    Given('预警数量1-3条', () => {
      const warningData = createMockWarningData({
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
          ],
          page: 1,
          pageSize: 3,
          total: '1',
          totalPages: 1,
          hasNext: false,
          hasPrevious: false,
        },
      });
      vi.mocked(useQuery).mockReturnValue(mockUseQuery({ data: warningData }));
    });
    When('进入数据中心主页', async () => {
      render(<DataCentre />);
    });
    Then('预警区高度根据卡片数量自适应（卡片越多高度越高）', async () => {});
  });

  Scenario('无预警时显示占位容器', ({ Given, When, Then, And }) => {
    Given('没有任何预警数据', () => {
      const warningData = createMockWarningData({
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
      });
      const overviewData = createMockOverviewData({
        warningSummary: {
          totalPending: '0',
          unreadPending: '0',
          abnormalAccountCount: '0',
        },
      });
      vi.mocked(useQuery)
        .mockReturnValueOnce(mockUseQuery({ data: overviewData }))
        .mockReturnValueOnce(mockUseQuery({ data: warningData }))
        .mockReturnValueOnce(mockUseQuery({ data: createMockTrendData() }))
        .mockReturnValueOnce(mockUseQuery({ data: createMockContentsData() }))
        .mockReturnValueOnce(mockUseQuery({ data: createMockAccountData() }));
    });
    When('访问数据中心主页', async () => {
      render(<DataCentre />);
    });
    Then('保留标题头「总预警 0 · 未读 0 · 异常账号 0」', async () => {
      await waitFor(() => {
        expect(screen.getByText(/总预警 0/u)).toBeInTheDocument();
      });
    });
    And('内容区显示「暂无预警」占位容器（高度约60px）', async () => {
      await waitFor(() => {
        expect(screen.getByText('暂无预警')).toBeInTheDocument();
      });
    });
  });

  Scenario('预警数量超过3条', ({ Given, When, Then, And }) => {
    Given('预警数量大于3条', () => {
      const warningData = createMockWarningData();
      vi.mocked(useQuery).mockReturnValue(mockUseQuery({ data: warningData }));
    });
    When('进入数据中心主页', async () => {
      render(<DataCentre />);
    });
    Then('固定展示3条预警卡片', async () => {
      await waitFor(() => {
        expect(screen.getByText('时尚美妆号')).toBeInTheDocument();
      });
    });
    And('底部显示「查看全部」按钮，点击可查看更多', async () => {
      await waitFor(() => {
        expect(screen.getByText('查看全部')).toBeInTheDocument();
      });
    });
  });

  Scenario('平台标签样式', ({ Given, When, Then, And }) => {
    Given('在数据预警区', () => {
      vi.mocked(useQuery).mockReturnValue(mockUseQuery());
    });
    When('观察预警卡片的平台标识', async () => {
      render(<DataCentre />);
    });
    Then('使用文字标签「抖音」或「小红书」', async () => {
      await waitFor(() => {
        expect(screen.getByText('抖音')).toBeInTheDocument();
      });
    });
    And('标签有灰色背景圆角样式', async () => {});
  });

  Scenario('预警时间显示格式', ({ Given, When, Then }) => {
    Given('有预警数据', () => {
      const warningData = createMockWarningData();
      vi.mocked(useQuery).mockReturnValue(mockUseQuery({ data: warningData }));
    });
    When('观察预警卡片的时间显示', async () => {
      render(<DataCentre />);
    });
    Then('时间格式为「月-日 时:分」（如「04-15 09:30」）', async () => {
      await waitFor(() => {
        expect(screen.getByText(/04-22/u)).toBeInTheDocument();
      });
    });
  });

  Scenario('已删除账号预警不展示', ({ Given, When, Then }) => {
    Given('有已删除账号产生的预警', () => {
      vi.mocked(useQuery).mockReturnValue(mockUseQuery());
    });
    When('访问数据中心主页', async () => {
      render(<DataCentre />);
    });
    Then('已删除账号的预警不显示（后端直接过滤）', async () => {});
  });

  Scenario('预警查看详情-跳转账号详情页', ({ Given, When, Then, And }) => {
    Given('有待处理预警', () => {
      vi.mocked(useQuery).mockReturnValue(mockUseQuery());
    });
    When('点击该预警卡片的「查看详情」按钮', async () => {
      render(<DataCentre />);
      const button = screen
        .getByText('查看详情')
        .closest('button') as HTMLButtonElement;
      fireEvent.click(button);
    });
    Then('页面跳转到账号详情页（URL应包含账号ID）', async () => {
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith(
          '/datacenter/account/acc-001?from=datacenter',
        );
      });
    });
    And('页面显示该账号的详情信息', async () => {
      await waitFor(() => {
        expect(screen.getByText('账号详情')).toBeInTheDocument();
      });
    });
    And('返回数据中心主页后，该预警状态从「未读」变为「已读」', async () => {
      await waitFor(() => {
        expect(screen.getByText(/未读 \d+/u)).toHaveTextContent('未读 4');
      });
    });
  });

  Scenario('预警忽略', ({ Given, When, Then, And }) => {
    Given('有待处理预警（未读或已读均可）', () => {
      vi.mocked(useQuery).mockReturnValue(mockUseQuery());
      vi.mocked(ignoreWarning).mockResolvedValue({
        warningId: '1',
        oldState: 'PENDING_UNREAD',
        newState: 'IGNORED',
      });
    });
    When('点击该预警卡片的「忽略」按钮', async () => {
      render(<DataCentre />);
      const button = screen
        .getByText('忽略')
        .closest('button') as HTMLButtonElement;
      fireEvent.click(button);
    });
    And('等待列表刷新', async () => {
      await waitFor(() => {
        expect(ignoreWarning).toHaveBeenCalledWith('1');
      });
    });
    Then('预警卡片消失或状态更新', async () => {
      await waitFor(() => {
        expect(screen.queryByText('时尚美妆号')).not.toBeInTheDocument();
      });
    });
    And('预警区标题的「未读」数量减少', async () => {
      await waitFor(() => {
        expect(screen.getByText(/未读 \d+/u)).toHaveTextContent('未读 4');
      });
    });
    And('该预警不再出现在预警列表中', async () => {
      expect(screen.queryByText('登录已失效')).not.toBeInTheDocument();
    });
  });

  Scenario('预警去处理-登录失效', ({ Given, When, Then }) => {
    Given('有「登录失效」类型的预警', () => {
      vi.mocked(useQuery).mockReturnValue(mockUseQuery());
    });
    When('点击该预警卡片的「去处理」按钮', async () => {
      render(<DataCentre />);
      const button = screen
        .getByText('去处理')
        .closest('button') as HTMLButtonElement;
      fireEvent.click(button);
    });
    Then(
      '页面跳转到账号失效重新登录页（与账号列表「重新登录」按钮同款）',
      async () => {
        await waitFor(() => {
          expect(mockNavigate).toHaveBeenCalledWith(
            '/account/add?mode=reactivate&accountId=acc-001&from=datacenter',
          );
        });
      },
    );
  });

  Scenario('预警去处理-播放量过低', ({ Given, When, Then, And }) => {
    Given('有「播放量过低」类型的预警', () => {
      vi.mocked(useQuery).mockReturnValue(mockUseQuery());
    });
    When('点击「去处理」按钮', async () => {
      render(<DataCentre />);
      const button = screen
        .getByText('去处理')
        .closest('button') as HTMLButtonElement;
      fireEvent.click(button);
    });
    Then('页面跳转到内容发布页面', async () => {
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith(
          expect.stringContaining('/content/publish'),
        );
      });
    });
    And('跳转URL包含republish参数和from=datacenter参数', async () => {
      await waitFor(() => {
        const lastCall =
          mockNavigate.mock.calls[mockNavigate.mock.calls.length - 1];
        expect(lastCall[0]).toContain('from=datacenter');
      });
    });
  });

  Scenario('预警去处理-粉丝负增长', ({ Given, When, Then, And }) => {
    Given('有「粉丝负增长」类型的预警', () => {
      vi.mocked(useQuery).mockReturnValue(mockUseQuery());
    });
    When('点击「去处理」按钮', async () => {
      render(<DataCentre />);
      const button = screen
        .getByText('去处理')
        .closest('button') as HTMLButtonElement;
      fireEvent.click(button);
    });
    Then('页面跳转到账号详情页', async () => {
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith(
          expect.stringContaining('/datacenter/account/'),
        );
      });
    });
    And('跳转URL包含from=datacenter参数', async () => {
      await waitFor(() => {
        const lastCall =
          mockNavigate.mock.calls[mockNavigate.mock.calls.length - 1];
        expect(lastCall[0]).toContain('from=datacenter');
      });
    });
  });

  Scenario('预警去处理-异地登录', ({ Given, When, Then, And }) => {
    Given('有「异地登录提醒」类型的预警', () => {
      vi.mocked(useQuery).mockReturnValue(mockUseQuery());
    });
    When('点击「去处理」按钮', async () => {
      render(<DataCentre />);
      const button = screen
        .getByText('去处理')
        .closest('button') as HTMLButtonElement;
      fireEvent.click(button);
    });
    Then('页面跳转到账号详情页', async () => {
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith(
          expect.stringContaining('/account/detail/'),
        );
      });
    });
    And('跳转URL包含tab=security参数', async () => {
      await waitFor(() => {
        const lastCall =
          mockNavigate.mock.calls[mockNavigate.mock.calls.length - 1];
        expect(lastCall[0]).toContain('tab=security');
      });
    });
  });

  Scenario('预警去处理-账号被禁言', ({ Given, When, Then, And }) => {
    Given('有「账号被禁言」类型的预警', () => {
      vi.mocked(useQuery).mockReturnValue(mockUseQuery());
    });
    When('点击「去处理」按钮', async () => {
      render(<DataCentre />);
      const button = screen
        .getByText('去处理')
        .closest('button') as HTMLButtonElement;
      fireEvent.click(button);
    });
    Then('页面跳转到账号详情页', async () => {
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith(
          expect.stringContaining('/account/detail/'),
        );
      });
    });
    And('跳转URL包含from=datacenter参数', async () => {
      await waitFor(() => {
        const lastCall =
          mockNavigate.mock.calls[mockNavigate.mock.calls.length - 1];
        expect(lastCall[0]).toContain('from=datacenter');
      });
    });
  });

  Scenario('从处理页面返回刷新预警', ({ Given, When, Then, And }) => {
    Given('用户已登录系统', () => {
      vi.mocked(useQuery).mockReturnValue(mockUseQuery());
    });
    When('在数据预警区点击某预警的「去处理」按钮', async () => {
      render(<DataCentre />);
    });
    And('在处理页面完成处理操作（如重新扫码登录）', async () => {
      mockNavigate('/datacenter');
    });
    And('点击返回数据中心', async () => {
      mockNavigate('/datacenter');
    });
    Then('返回主页后列表自动刷新', async () => {
      await waitFor(() => {
        expect(mockRefetch).toHaveBeenCalled();
      });
    });
    And('预警列表已更新（如登录失效预警消失）', async () => {
      await waitFor(() => {
        expect(screen.getByText('数据预警')).toBeInTheDocument();
      });
    });
  });

  Scenario('查看全部跳转', ({ Given, When, Then }) => {
    Given('用户已登录系统', () => {
      vi.mocked(useQuery).mockReturnValue(mockUseQuery());
    });
    When('点击「查看全部」按钮', async () => {
      render(<DataCentre />);
      const button = screen
        .getByText('查看全部')
        .closest('button') as HTMLButtonElement;
      fireEvent.click(button);
    });
    Then('页面跳转到预警详情页', async () => {
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/datacenter/warnings');
      });
    });
  });

  Scenario('播放量恰好等于500不触发预警', ({ Given, When, Then }) => {
    Given('某内容播放量恰好为500', () => {
      vi.mocked(useQuery).mockReturnValue(mockUseQuery());
    });
    When('观察是否触发「播放量过低」预警', async () => {
      render(<DataCentre />);
    });
    Then('不触发预警（PRD规则：播放量<500才触发，=500不触发）', async () => {});
  });

  Scenario('播放量499触发预警', ({ Given, When, Then }) => {
    Given('某内容播放量恰好为499', () => {
      vi.mocked(useQuery).mockReturnValue(mockUseQuery());
    });
    When('等待系统检测（通常有延迟）', async () => {
      render(<DataCentre />);
    });
    Then('触发「播放量过低」预警（显示1.2K<5K类似格式）', async () => {});
  });

  Scenario('点赞率恰好等于2%不触发预警', ({ Given, When, Then }) => {
    Given('某内容点赞率恰好为2%（点赞数/播放量=0.02）', () => {
      vi.mocked(useQuery).mockReturnValue(mockUseQuery());
    });
    When('观察是否触发预警', async () => {
      render(<DataCentre />);
    });
    Then('不触发预警（PRD规则：点赞率<2%才触发，=2%不触发）', async () => {});
  });

  Scenario('点赞率1.99%触发预警', ({ Given, When, Then }) => {
    Given('某内容点赞率恰好为1.99%', () => {
      vi.mocked(useQuery).mockReturnValue(mockUseQuery());
    });
    When('等待系统检测', async () => {
      render(<DataCentre />);
    });
    Then('触发「点赞率过低」预警', async () => {});
  });

  Scenario('粉丝日环比恰好-5%不触发', ({ Given, When, Then }) => {
    Given('账号日粉丝环比下降恰好5%', () => {
      vi.mocked(useQuery).mockReturnValue(mockUseQuery());
    });
    When('观察是否触发预警', async () => {
      render(<DataCentre />);
    });
    Then('不触发预警（PRD规则：日环比下降>-5%不触发）', async () => {});
  });

  Scenario('粉丝日环比-6%触发预警', ({ Given, When, Then }) => {
    Given('账号日粉丝环比下降恰好6%', () => {
      vi.mocked(useQuery).mockReturnValue(mockUseQuery());
    });
    When('等待系统检测', async () => {
      render(<DataCentre />);
    });
    Then('触发「粉丝负增长」预警', async () => {});
  });

  Scenario('已读预警忽略操作', ({ Given, When, Then, And }) => {
    Given('预警状态为「待处理（已读）」', () => {
      vi.mocked(useQuery).mockReturnValue(mockUseQuery());
      vi.mocked(ignoreWarning).mockResolvedValue({
        warningId: '3',
        oldState: 'PENDING_READ',
        newState: 'IGNORED',
      });
    });
    When('点击该已读预警的「忽略」按钮', async () => {
      render(<DataCentre />);
      const button = screen
        .getByText('忽略')
        .closest('button') as HTMLButtonElement;
      fireEvent.click(button);
    });
    And('等待列表刷新', async () => {
      await waitFor(() => {
        expect(ignoreWarning).toHaveBeenCalledWith('3');
      });
    });
    Then('预警状态变为已忽略，从未读计数中移除', async () => {
      await waitFor(() => {
        expect(screen.queryByText('科技评测')).not.toBeInTheDocument();
      });
    });
  });

  Scenario('多规则同时触发-优先级', ({ Given, When, Then, And }) => {
    Given('一条内容同时满足「播放量过低」和「点赞率过低」', () => {
      vi.mocked(useQuery).mockReturnValue(mockUseQuery());
    });
    When('观察预警列表', async () => {
      render(<DataCentre />);
    });
    Then('只显示一条预警', async () => {});
    And('以最高等级展示（红色>橙色）', async () => {});
  });

  Scenario('橙色+橙色同时触发', ({ Given, When, Then }) => {
    Given('一条内容同时触发播放量过低和点赞率过低', () => {
      vi.mocked(useQuery).mockReturnValue(mockUseQuery());
    });
    When('观察预警列表', async () => {
      render(<DataCentre />);
    });
    Then('只显示一条橙色预警（不重复展示）', async () => {});
  });

  Scenario('已处理预警不展示', ({ Given, When, Then, And }) => {
    Given('预警已处理', () => {
      const warningData = createMockWarningData({
        pageData: {
          list: [],
          page: 1,
          pageSize: 3,
          total: '0',
          totalPages: 0,
          hasNext: false,
          hasPrevious: false,
        },
      });
      vi.mocked(useQuery).mockReturnValue(mockUseQuery({ data: warningData }));
    });
    When('在数据中心主页点击某预警的「去处理」', async () => {
      render(<DataCentre />);
    });
    And('完成处理操作（如重新登录）', async () => {});
    And('返回数据中心主页', async () => {});
    Then('该预警不在列表中展示（已处理预警不显示）', async () => {
      await waitFor(() => {
        expect(screen.getByText('暂无预警')).toBeInTheDocument();
      });
    });
  });

  Scenario('六宫格默认展示6个指标', ({ Given, When, Then, And }) => {
    Given('用户已登录系统', () => {
      vi.mocked(useQuery).mockReturnValue(mockUseQuery());
    });
    When('进入数据中心主页', async () => {
      render(<DataCentre />);
    });
    Then(
      '确认展示6个指标卡：总播放量、总点赞量、总评论量、总转发量、新增粉丝、私信量',
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
    And('6个卡片整齐排列', async () => {
      await waitFor(() => {
        const cards = screen.getAllByTestId('metric-card');
        expect(cards.length).toBe(6);
      });
    });
  });

  Scenario('六宫格指标计算正确', ({ Given, When, Then }) => {
    Given('用户已登录系统', () => {
      const data = createMockOverviewData({
        metrics: [
          { name: 'play', currentValue: '12582380', baselineValue: '11150000' },
          { name: 'like', currentValue: '89234', baselineValue: '82456' },
          { name: 'comment', currentValue: '12456', baselineValue: '11789' },
          { name: 'share', currentValue: '8932', baselineValue: '8745' },
          { name: 'fans', currentValue: '3456', baselineValue: '2987' },
          { name: 'message', currentValue: '2134', baselineValue: '2160' },
        ],
      });
      vi.mocked(useQuery).mockReturnValue(mockUseQuery({ data }));
    });
    When('观察六宫格数据', async () => {
      render(<DataCentre />);
    });
    Then('六宫格数据=当前筛选条件下所有账号数据之和', async () => {
      await waitFor(() => {
        expect(screen.getByText('总播放量')).toBeInTheDocument();
        expect(screen.getByText('12582380')).toBeInTheDocument();
      });
    });
  });

  Scenario('正增长率显示绿色', ({ Given, When, Then, And }) => {
    Given('数据正增长', () => {
      const data = createMockOverviewData({
        metrics: [
          { name: 'play', currentValue: '20000000', baselineValue: '10000000' },
          { name: 'like', currentValue: '89234', baselineValue: '82456' },
          { name: 'comment', currentValue: '12456', baselineValue: '11789' },
          { name: 'share', currentValue: '8932', baselineValue: '8745' },
          { name: 'fans', currentValue: '3456', baselineValue: '2987' },
          { name: 'message', currentValue: '2134', baselineValue: '2160' },
        ],
      });
      vi.mocked(useQuery).mockReturnValue(mockUseQuery({ data }));
    });
    When('找到任意一个显示正增长的指标卡', async () => {
      render(<DataCentre />);
    });
    Then('显示绿色▲图标', async () => {
      await waitFor(() => {
        const greenIcons = screen.getAllByText('▲');
        expect(greenIcons.length).toBeGreaterThan(0);
      });
    });
    And('增长率为正值格式「+X.X%」', async () => {
      await waitFor(() => {
        expect(screen.getByText(/\+100\.0%/u)).toBeInTheDocument();
      });
    });
  });

  Scenario('负增长率显示红色', ({ Given, When, Then, And }) => {
    Given('数据负增长', () => {
      const data = createMockOverviewData({
        metrics: [
          { name: 'play', currentValue: '8000000', baselineValue: '10000000' },
          { name: 'like', currentValue: '89234', baselineValue: '82456' },
          { name: 'comment', currentValue: '12456', baselineValue: '11789' },
          { name: 'share', currentValue: '8932', baselineValue: '8745' },
          { name: 'fans', currentValue: '3456', baselineValue: '2987' },
          { name: 'message', currentValue: '2134', baselineValue: '2160' },
        ],
      });
      vi.mocked(useQuery).mockReturnValue(mockUseQuery({ data }));
    });
    When('找到任意一个显示负增长的指标卡', async () => {
      render(<DataCentre />);
    });
    Then('显示红色▼图标', async () => {
      await waitFor(() => {
        const redIcons = screen.getAllByText('▼');
        expect(redIcons.length).toBeGreaterThan(0);
      });
    });
    And('增长率为负值格式「-X.X%」', async () => {
      await waitFor(() => {
        expect(screen.getByText(/-20\.0%/u)).toBeInTheDocument();
      });
    });
  });

  Scenario('冷启动-单零场景', ({ Given, When, Then }) => {
    Given('当前值大于0，对比值（上期）为0', () => {
      const data = createMockOverviewData({
        metrics: [
          { name: 'play', currentValue: '1000', baselineValue: '0' },
          { name: 'like', currentValue: '89234', baselineValue: '82456' },
          { name: 'comment', currentValue: '12456', baselineValue: '11789' },
          { name: 'share', currentValue: '8932', baselineValue: '8745' },
          { name: 'fans', currentValue: '3456', baselineValue: '2987' },
          { name: 'message', currentValue: '2134', baselineValue: '2160' },
        ],
      });
      vi.mocked(useQuery).mockReturnValue(mockUseQuery({ data }));
    });
    When('观察该指标增长率', async () => {
      render(<DataCentre />);
    });
    Then('显示「▲ +100%」，绿色', async () => {
      await waitFor(() => {
        expect(screen.getByText(/\+100\.0%/u)).toBeInTheDocument();
      });
    });
  });

  Scenario('冷启动-双零场景', ({ Given, When, Then }) => {
    Given('当前值和对比值都为0', () => {
      const data = createMockOverviewData({
        metrics: [
          { name: 'play', currentValue: '0', baselineValue: '0' },
          { name: 'like', currentValue: '89234', baselineValue: '82456' },
          { name: 'comment', currentValue: '12456', baselineValue: '11789' },
          { name: 'share', currentValue: '8932', baselineValue: '8745' },
          { name: 'fans', currentValue: '3456', baselineValue: '2987' },
          { name: 'message', currentValue: '2134', baselineValue: '2160' },
        ],
      });
      vi.mocked(useQuery).mockReturnValue(mockUseQuery({ data }));
    });
    When('观察该指标增长率', async () => {
      render(<DataCentre />);
    });
    Then('显示「—」', async () => {
      await waitFor(() => {
        expect(screen.getByText(PLACEHOLDER)).toBeInTheDocument();
      });
    });
  });

  Scenario('冷启动-数据清零', ({ Given, When, Then }) => {
    Given('当前值为0，但对比值大于0（数据被清零）', () => {
      const data = createMockOverviewData({
        metrics: [
          { name: 'play', currentValue: '0', baselineValue: '10000' },
          { name: 'like', currentValue: '89234', baselineValue: '82456' },
          { name: 'comment', currentValue: '12456', baselineValue: '11789' },
          { name: 'share', currentValue: '8932', baselineValue: '8745' },
          { name: 'fans', currentValue: '3456', baselineValue: '2987' },
          { name: 'message', currentValue: '2134', baselineValue: '2160' },
        ],
      });
      vi.mocked(useQuery).mockReturnValue(mockUseQuery({ data }));
    });
    When('观察该指标增长率', async () => {
      render(<DataCentre />);
    });
    Then('显示「▼ -100%」，红色', async () => {
      await waitFor(() => {
        expect(screen.getByText(/-100\.0%/u)).toBeInTheDocument();
      });
    });
  });

  Scenario('数值缩略-万', ({ Given, When, Then }) => {
    Given('播放量在1万~1亿之间', () => {
      const data = createMockOverviewData({
        metrics: [
          { name: 'play', currentValue: '12500000', baselineValue: '10000000' },
          { name: 'like', currentValue: '89234', baselineValue: '82456' },
          { name: 'comment', currentValue: '12456', baselineValue: '11789' },
          { name: 'share', currentValue: '8932', baselineValue: '8745' },
          { name: 'fans', currentValue: '3456', baselineValue: '2987' },
          { name: 'message', currentValue: '2134', baselineValue: '2160' },
        ],
      });
      vi.mocked(useQuery).mockReturnValue(mockUseQuery({ data }));
    });
    When('观察播放量指标卡', async () => {
      render(<DataCentre />);
    });
    Then('显示格式为「X.X万」（如「12.5万」）', async () => {
      await waitFor(() => {
        expect(screen.getByText('1250.0万')).toBeInTheDocument();
      });
    });
  });

  Scenario('数值缩略-亿', ({ Given, When, Then }) => {
    Given('播放量超过1亿', () => {
      const data = createMockOverviewData({
        metrics: [
          {
            name: 'play',
            currentValue: '125000000',
            baselineValue: '100000000',
          },
          { name: 'like', currentValue: '89234', baselineValue: '82456' },
          { name: 'comment', currentValue: '12456', baselineValue: '11789' },
          { name: 'share', currentValue: '8932', baselineValue: '8745' },
          { name: 'fans', currentValue: '3456', baselineValue: '2987' },
          { name: 'message', currentValue: '2134', baselineValue: '2160' },
        ],
      });
      vi.mocked(useQuery).mockReturnValue(mockUseQuery({ data }));
    });
    When('观察播放量指标卡', async () => {
      render(<DataCentre />);
    });
    Then('显示格式为「X.X亿」', async () => {
      await waitFor(() => {
        expect(screen.getByText('1.3亿')).toBeInTheDocument();
      });
    });
  });

  Scenario('数据为0显示', ({ Given, When, Then }) => {
    Given('某指标数据为0', () => {
      const data = createMockOverviewData({
        metrics: [
          { name: 'play', currentValue: '0', baselineValue: '0' },
          { name: 'like', currentValue: '89234', baselineValue: '82456' },
          { name: 'comment', currentValue: '12456', baselineValue: '11789' },
          { name: 'share', currentValue: '8932', baselineValue: '8745' },
          { name: 'fans', currentValue: '3456', baselineValue: '2987' },
          { name: 'message', currentValue: '2134', baselineValue: '2160' },
        ],
      });
      vi.mocked(useQuery).mockReturnValue(mockUseQuery({ data }));
    });
    When('观察该指标卡', async () => {
      render(<DataCentre />);
    });
    Then('指标数值显示「-」', async () => {
      await waitFor(() => {
        expect(screen.getByText(PLACEHOLDER)).toBeInTheDocument();
      });
    });
  });

  Scenario('已删除账号不统计', ({ Given, When, Then, And }) => {
    Given('有已删除账号数据', () => {
      const data = createMockOverviewData({
        metrics: [
          { name: 'play', currentValue: '12582380', baselineValue: '11150000' },
          { name: 'like', currentValue: '89234', baselineValue: '82456' },
          { name: 'comment', currentValue: '12456', baselineValue: '11789' },
          { name: 'share', currentValue: '8932', baselineValue: '8745' },
          { name: 'fans', currentValue: '3456', baselineValue: '2987' },
          { name: 'message', currentValue: '2134', baselineValue: '2160' },
        ],
      });
      vi.mocked(useQuery).mockReturnValue(mockUseQuery({ data }));
    });
    When('观察六宫格数据', async () => {
      render(<DataCentre />);
    });
    Then('已删除账号的数据不纳入统计', async () => {
      await waitFor(() => {
        expect(screen.getByText('总播放量')).toBeInTheDocument();
      });
    });
    And('六宫格数据仅包含现有账号数据', async () => {
      await waitFor(() => {
        expect(screen.queryByText('已删除账号')).not.toBeInTheDocument();
      });
    });
  });

  Scenario('趋势图默认展示', ({ Given, When, Then, And }) => {
    Given('用户已登录系统', () => {
      vi.mocked(useQuery).mockReturnValue(mockUseQuery());
    });
    When('进入数据中心主页', async () => {
      render(<DataCentre />);
    });
    Then('折线图正确展示', async () => {
      await waitFor(() => {
        expect(screen.getByText('播放趋势')).toBeInTheDocument();
      });
    });
    And('X轴为时间，Y轴为播放量', async () => {});
  });

  Scenario('账号下拉选择器', ({ Given, When, Then, And }) => {
    Given('用户已登录系统', () => {
      vi.mocked(useQuery).mockReturnValue(mockUseQuery());
    });
    When('点击账号下拉选择器，展开账号列表', async () => {
      render(<DataCentre />);
    });
    Then('列表显示用户有权限的所有账号', async () => {
      await waitFor(() => {
        expect(screen.getByText('时尚美妆号')).toBeInTheDocument();
      });
    });
    And('账号按创建时间倒序排序（最新添加的排在最前面）', async () => {});
  });

  Scenario('趋势图默认选中-localStorage记忆', ({ Given, When, Then }) => {
    Given('用户已登录系统，之前选中过某账号', () => {
      localStorage.setItem('datacenter_trend_account_id', 'acc-002');
      vi.mocked(useQuery).mockReturnValue(mockUseQuery());
    });
    When('刷新页面（或重新访问）', async () => {
      render(<DataCentre />);
    });
    Then('趋势图自动选中账号B（localStorage记忆）', async () => {
      await waitFor(() => {
        expect(screen.getByText('生活笔记')).toBeInTheDocument();
      });
    });
  });

  Scenario('趋势图默认选中-无记忆', ({ Given, When, Then }) => {
    Given('用户已登录系统，无localStorage记忆', () => {
      localStorage.removeItem('datacenter_trend_account_id');
      vi.mocked(useQuery).mockReturnValue(mockUseQuery());
    });
    When('访问数据中心主页', async () => {
      render(<DataCentre />);
    });
    Then('趋势图选中候选池中第一个账号（按创建时间倒序的第一个）', async () => {
      await waitFor(() => {
        expect(screen.getByText('时尚美妆号')).toBeInTheDocument();
      });
    });
  });

  Scenario('切换账号刷新趋势图', ({ Given, When, Then, And }) => {
    Given('用户已登录系统', () => {
      vi.mocked(useQuery).mockReturnValue(mockUseQuery());
    });
    When('在趋势图区域点击账号下拉选择器，选择账号A', async () => {
      render(<DataCentre />);
    });
    And('再次点击下拉选择器，选择账号B', async () => {});
    Then('趋势图区域显示Loading骨架屏', async () => {
      await waitFor(() => {
        expect(mockRefetch).toHaveBeenCalled();
      });
    });
    And('等待数据加载完成，折线图更新为账号B的数据', async () => {});
  });

  Scenario('无账号数据显示空状态', ({ Given, When, Then }) => {
    Given('用户无任何账号权限', () => {
      const accountData = {
        list: [],
        page: 1,
        pageSize: 10,
        total: '0',
        totalPages: 0,
        hasNext: false,
        hasPrevious: false,
      };
      vi.mocked(useQuery).mockReturnValue(
        mockUseQuery({ data: { accountData } }),
      );
    });
    When('访问数据中心主页', async () => {
      render(<DataCentre />);
    });
    Then('播放趋势图区域显示「暂无账号数据」空状态提示', async () => {
      await waitFor(() => {
        expect(screen.getByText('暂无账号数据')).toBeInTheDocument();
      });
    });
  });

  Scenario('已删除账号不显示', ({ Given, When, Then }) => {
    Given('有已删除账号', () => {
      vi.mocked(useQuery).mockReturnValue(mockUseQuery());
    });
    When('点击账号下拉选择器', async () => {
      render(<DataCentre />);
    });
    Then('已删除账号不在列表中显示', async () => {
      await waitFor(() => {
        expect(screen.getByText('时尚美妆号')).toBeInTheDocument();
        expect(screen.queryByText('已删除账号')).not.toBeInTheDocument();
      });
    });
  });

  Scenario('粒度-今日默认按小时', ({ Given, When, Then, And }) => {
    Given('全局时间选择「今日」', () => {
      const overviewData = createMockOverviewData({ timeRange: 'today' });
      const trendData = createMockTrendData({ granularity: 'hour' });
      vi.mocked(useQuery)
        .mockReturnValueOnce(mockUseQuery({ data: overviewData }))
        .mockReturnValueOnce(mockUseQuery({ data: createMockWarningData() }))
        .mockReturnValueOnce(mockUseQuery({ data: trendData }))
        .mockReturnValueOnce(mockUseQuery({ data: createMockContentsData() }))
        .mockReturnValueOnce(mockUseQuery({ data: createMockAccountData() }));
    });
    When('观察趋势图区域右上角的粒度切换按钮', async () => {
      render(<DataCentre />);
    });
    Then('默认选中「按小时」', async () => {
      await waitFor(() => {
        expect(screen.getByText('按小时')).toBeInTheDocument();
      });
    });
    And('可用粒度为「按小时」和「按日」', async () => {});
  });

  Scenario('粒度-近7天默认按日', ({ Given, When, Then, And }) => {
    Given('全局时间选择「近7天」', () => {
      const overviewData = createMockOverviewData({ timeRange: 'last7days' });
      const trendData = createMockTrendData({ granularity: 'day' });
      vi.mocked(useQuery)
        .mockReturnValueOnce(mockUseQuery({ data: overviewData }))
        .mockReturnValueOnce(mockUseQuery({ data: createMockWarningData() }))
        .mockReturnValueOnce(mockUseQuery({ data: trendData }))
        .mockReturnValueOnce(mockUseQuery({ data: createMockContentsData() }))
        .mockReturnValueOnce(mockUseQuery({ data: createMockAccountData() }));
    });
    When('观察粒度切换按钮', async () => {
      render(<DataCentre />);
    });
    Then('默认选中「按日」', async () => {
      await waitFor(() => {
        expect(screen.getByText('按日')).toBeInTheDocument();
      });
    });
    And('可用粒度仅为「按日」', async () => {});
  });

  Scenario('粒度-近30天默认按日', ({ Given, When, Then, And }) => {
    Given('全局时间选择「近30天」', () => {
      const overviewData = createMockOverviewData({ timeRange: 'last30days' });
      const trendData = createMockTrendData({ granularity: 'day' });
      vi.mocked(useQuery)
        .mockReturnValueOnce(mockUseQuery({ data: overviewData }))
        .mockReturnValueOnce(mockUseQuery({ data: createMockWarningData() }))
        .mockReturnValueOnce(mockUseQuery({ data: trendData }))
        .mockReturnValueOnce(mockUseQuery({ data: createMockContentsData() }))
        .mockReturnValueOnce(mockUseQuery({ data: createMockAccountData() }));
    });
    When('观察粒度切换按钮', async () => {
      render(<DataCentre />);
    });
    Then('默认选中「按日」', async () => {
      await waitFor(() => {
        expect(screen.getByText('按日')).toBeInTheDocument();
      });
    });
    And('可用粒度为「按日」和「按周」', async () => {});
  });

  Scenario('粒度-今年默认按月', ({ Given, When, Then, And }) => {
    Given('全局时间选择「今年」', () => {
      const overviewData = createMockOverviewData({ timeRange: 'thisYear' });
      const trendData = createMockTrendData({ granularity: 'month' });
      vi.mocked(useQuery)
        .mockReturnValueOnce(mockUseQuery({ data: overviewData }))
        .mockReturnValueOnce(mockUseQuery({ data: createMockWarningData() }))
        .mockReturnValueOnce(mockUseQuery({ data: trendData }))
        .mockReturnValueOnce(mockUseQuery({ data: createMockContentsData() }))
        .mockReturnValueOnce(mockUseQuery({ data: createMockAccountData() }));
    });
    When('观察粒度切换按钮', async () => {
      render(<DataCentre />);
    });
    Then('默认选中「按月」', async () => {
      await waitFor(() => {
        expect(screen.getByText('按月')).toBeInTheDocument();
      });
    });
    And('可用粒度仅为「按月」', async () => {});
  });

  Scenario('切换全局时间粒度重置', ({ Given, When, Then }) => {
    Given('全局时间「今日」，粒度为「按日」', () => {
      const overviewData = createMockOverviewData({ timeRange: 'today' });
      const trendData = createMockTrendData({ granularity: 'day' });
      vi.mocked(useQuery)
        .mockReturnValueOnce(mockUseQuery({ data: overviewData }))
        .mockReturnValueOnce(mockUseQuery({ data: createMockWarningData() }))
        .mockReturnValueOnce(mockUseQuery({ data: trendData }))
        .mockReturnValueOnce(mockUseQuery({ data: createMockContentsData() }))
        .mockReturnValueOnce(mockUseQuery({ data: createMockAccountData() }));
    });
    When('将时间筛选切换为「近7天」', async () => {
      render(<DataCentre />);
    });
    Then('粒度自动重置为默认值「按日」', async () => {
      await waitFor(() => {
        expect(screen.getByText('按日')).toBeInTheDocument();
      });
    });
  });

  Scenario('今日+按日粒度显示1个点', ({ Given, When, Then }) => {
    Given('全局时间「今日」，手动切换到「按日」粒度', () => {
      vi.mocked(useQuery).mockReturnValue(mockUseQuery());
    });
    When('观察趋势图折线', async () => {
      render(<DataCentre />);
    });
    Then('折线图只展示1个数据点（今日总播放量）', async () => {});
  });

  Scenario('今日+按日粒度轻提示', ({ Given, When, Then }) => {
    Given('全局时间「今日」，粒度为「按日」', () => {
      vi.mocked(useQuery).mockReturnValue(mockUseQuery());
    });
    When('观察趋势图区域', async () => {
      render(<DataCentre />);
    });
    Then(
      '显示轻提示「当前粒度仅显示1个数据点，建议切换到按小时查看」',
      async () => {
        await waitFor(() => {
          expect(mockMessage.info).toHaveBeenCalledWith(
            '当前粒度仅显示1个数据点，建议切换到按小时查看',
          );
        });
      },
    );
  });

  Scenario('数据缺失-单点断开', ({ Given, When, Then, And }) => {
    Given('某时间点数据缺失', () => {
      const trendData = createMockTrendData({
        points: [
          { bucket: '2026-04-22 00:00', playCount: '1200' },
          { bucket: '2026-04-22 01:00', playCount: null },
          { bucket: '2026-04-22 02:00', playCount: '1350' },
        ],
      });
      vi.mocked(useQuery).mockReturnValue(mockUseQuery({ data: trendData }));
    });
    When('观察该点折线状态', async () => {
      render(<DataCentre />);
    });
    Then('折线在该点断开（不连接到0或其他数据点）', async () => {});
    And('鼠标悬停到该缺失点显示tooltip提示「数据缺失」', async () => {});
  });

  Scenario('数据缺失-连续断开', ({ Given, When, Then, And }) => {
    Given('连续多个时间点数据缺失', () => {
      const trendData = createMockTrendData({
        points: [
          { bucket: '2026-04-22 00:00', playCount: '1200' },
          { bucket: '2026-04-22 01:00', playCount: null },
          { bucket: '2026-04-22 02:00', playCount: null },
          { bucket: '2026-04-22 03:00', playCount: '1500' },
        ],
      });
      vi.mocked(useQuery).mockReturnValue(mockUseQuery({ data: trendData }));
    });
    When('观察折线状态', async () => {
      render(<DataCentre />);
    });
    Then('折线在缺失区域断开，显示缺口', async () => {});
    And('悬停到缺口区域显示「数据缺失」提示', async () => {});
  });

  Scenario('鼠标悬停显示数值', ({ Given, When, Then }) => {
    Given('趋势图有数据', () => {
      vi.mocked(useQuery).mockReturnValue(mockUseQuery());
    });
    When('鼠标悬停到任意数据点', async () => {
      render(<DataCentre />);
    });
    Then('显示tooltip，包含具体播放量数值', async () => {});
  });

  Scenario('时间筛选不影响预警区', ({ Given, When, Then, And }) => {
    Given('有多条预警', () => {
      const warningData = createMockWarningData();
      const overviewData = createMockOverviewData();
      vi.mocked(useQuery)
        .mockReturnValueOnce(mockUseQuery({ data: overviewData }))
        .mockReturnValueOnce(mockUseQuery({ data: warningData }))
        .mockReturnValueOnce(mockUseQuery({ data: createMockTrendData() }))
        .mockReturnValueOnce(mockUseQuery({ data: createMockContentsData() }))
        .mockReturnValueOnce(mockUseQuery({ data: createMockAccountData() }));
    });
    When('将时间筛选从「今日」切换为「近7天」', async () => {
      render(<DataCentre />);
      const button = screen.getByText('近7天');
      fireEvent.click(button);
    });
    And('等待数据刷新完成', async () => {
      await waitFor(() => {
        expect(screen.getByText('数据预警')).toBeInTheDocument();
      });
    });
    Then(
      '预警数量和预警列表内容不变（预警是实时异常，不受时间筛选影响）',
      async () => {
        await waitFor(() => {
          expect(screen.getByText(/总预警 12/u)).toBeInTheDocument();
        });
      },
    );
  });

  Scenario('平台筛选不影响预警区', ({ Given, When, Then, And }) => {
    Given('有多条预警', () => {
      const warningData = createMockWarningData();
      const overviewData = createMockOverviewData();
      vi.mocked(useQuery)
        .mockReturnValueOnce(mockUseQuery({ data: overviewData }))
        .mockReturnValueOnce(mockUseQuery({ data: warningData }))
        .mockReturnValueOnce(mockUseQuery({ data: createMockTrendData() }))
        .mockReturnValueOnce(mockUseQuery({ data: createMockContentsData() }))
        .mockReturnValueOnce(mockUseQuery({ data: createMockAccountData() }));
    });
    When('将平台筛选从「全部平台」切换为「抖音」', async () => {
      render(<DataCentre />);
      const button = screen.getByText('抖音');
      fireEvent.click(button);
    });
    And('等待数据刷新完成', async () => {
      await waitFor(() => {
        expect(screen.getByText('数据预警')).toBeInTheDocument();
      });
    });
    Then('预警列表仍显示所有平台的预警（不受平台筛选影响）', async () => {
      await waitFor(() => {
        expect(screen.getByText(/总预警 12/u)).toBeInTheDocument();
      });
    });
  });

  Scenario('预警区不受组合筛选影响', ({ Given, When, Then, And }) => {
    Given('有多条预警', () => {
      const warningData = createMockWarningData();
      const overviewData = createMockOverviewData();
      vi.mocked(useQuery)
        .mockReturnValueOnce(mockUseQuery({ data: overviewData }))
        .mockReturnValueOnce(mockUseQuery({ data: warningData }))
        .mockReturnValueOnce(mockUseQuery({ data: createMockTrendData() }))
        .mockReturnValueOnce(mockUseQuery({ data: createMockContentsData() }))
        .mockReturnValueOnce(mockUseQuery({ data: createMockAccountData() }));
    });
    When('将时间筛选设置为「今年」，平台筛选设置为「小红书」', async () => {
      render(<DataCentre />);
      const yearButton = screen.getByText('今年');
      fireEvent.click(yearButton);
      const xhsButton = screen.getByText('小红书');
      fireEvent.click(xhsButton);
    });
    And('等待数据刷新完成', async () => {
      await waitFor(() => {
        expect(screen.getByText('数据预警')).toBeInTheDocument();
      });
    });
    Then('预警列表仍显示所有预警（不受时间和平台筛选影响）', async () => {
      await waitFor(() => {
        expect(screen.getByText(/总预警 12/u)).toBeInTheDocument();
      });
    });
    And('预警统计数量不变', async () => {
      await waitFor(() => {
        expect(screen.getByText(/未读 5/u)).toBeInTheDocument();
      });
    });
  });

  Scenario('红色+橙色同时触发-只展示红色', ({ Given, When, Then, And }) => {
    Given('一条内容同时触发登录失效（红）和播放量过低（橙）', () => {
      const warningData = createMockWarningData({
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
          ],
          page: 1,
          pageSize: 3,
          total: '1',
          totalPages: 1,
          hasNext: false,
          hasPrevious: false,
        },
      });
      vi.mocked(useQuery).mockReturnValue(mockUseQuery({ data: warningData }));
    });
    When('观察数据预警区', async () => {
      render(<DataCentre />);
    });
    Then('只显示一条预警，且预警等级为🔴红色', async () => {
      await waitFor(() => {
        expect(screen.getByText('登录已失效')).toBeInTheDocument();
      });
    });
    And('预警详情为登录失效（红色等级）', async () => {});
  });

  Scenario('橙色+橙色同时触发-只展示一条', ({ Given, When, Then }) => {
    Given('一条内容同时触发播放量过低（橙色）和点赞率过低（橙色）', () => {
      vi.mocked(useQuery).mockReturnValue(mockUseQuery());
    });
    When('观察预警列表', async () => {
      render(<DataCentre />);
    });
    Then('只显示一条橙色预警，不是两条分开的预警', async () => {});
  });

  Scenario('三种预警等级同时触发-红色优先', ({ Given, When, Then }) => {
    Given(
      '一条内容同时触发登录失效（红）、播放量过低（橙）、粉丝负增长（橙）',
      () => {
        vi.mocked(useQuery).mockReturnValue(mockUseQuery());
      },
    );
    When('观察数据预警区', async () => {
      render(<DataCentre />);
    });
    Then('只显示一条预警，等级为🔴红色（最高优先级）', async () => {});
  });

  Scenario('预警优先级-红色排在最前面', ({ Given, When, Then }) => {
    Given('同时存在账号异常类预警（红色）和内容异常类预警（橙色）', () => {
      vi.mocked(useQuery).mockReturnValue(mockUseQuery());
    });
    When('观察预警排序', async () => {
      render(<DataCentre />);
    });
    Then('红色预警排在最前面（时间相同时，按优先级排序）', async () => {});
  });

  Scenario('内容列表默认展示', ({ Given, When, Then }) => {
    Given('用户已登录系统', () => {
      vi.mocked(useQuery).mockReturnValue(mockUseQuery());
    });
    When('进入数据中心主页', async () => {
      render(<DataCentre />);
    });
    Then(
      '表格列包含：封面、标题/文案、账号（可点击）、平台、播放量、点赞量、评论量、转发量、互动率',
      async () => {
        await waitFor(() => {
          expect(screen.getByText('封面')).toBeInTheDocument();
          expect(screen.getByText('标题/文案')).toBeInTheDocument();
          expect(screen.getByText('账号')).toBeInTheDocument();
          expect(screen.getByText('平台')).toBeInTheDocument();
          expect(screen.getByText('播放量')).toBeInTheDocument();
          expect(screen.getByText('点赞量')).toBeInTheDocument();
          expect(screen.getByText('评论量')).toBeInTheDocument();
          expect(screen.getByText('转发量')).toBeInTheDocument();
          expect(screen.getByText('互动率')).toBeInTheDocument();
        });
      },
    );
  });

  Scenario('类型筛选-全部默认', ({ Given, When, Then }) => {
    Given('用户已登录系统', () => {
      vi.mocked(useQuery).mockReturnValue(mockUseQuery());
    });
    When('进入数据中心主页', async () => {
      render(<DataCentre />);
    });
    Then('类型筛选Tab默认选中「全部」', async () => {
      await waitFor(() => {
        expect(screen.getByText('全部')).toBeInTheDocument();
      });
    });
  });

  Scenario('类型筛选-视频', ({ Given, When, Then, And }) => {
    Given('用户已登录系统', () => {
      vi.mocked(useQuery).mockReturnValue(mockUseQuery());
    });
    When('点击「视频」Tab', async () => {
      render(<DataCentre />);
      const tab = screen
        .getByText('视频')
        .closest('.ant-tabs-tab') as HTMLElement;
      fireEvent.click(tab);
    });
    And('等待列表刷新（300ms防抖）', async () => {
      await advanceTime(400);
    });
    Then('列表仅展示视频类型内容', async () => {
      await waitFor(() => {
        expect(mockRefetch).toHaveBeenCalled();
      });
    });
  });

  Scenario('类型筛选-图文', ({ Given, When, Then, And }) => {
    Given('用户已登录系统', () => {
      vi.mocked(useQuery).mockReturnValue(mockUseQuery());
    });
    When('点击「图文」Tab', async () => {
      render(<DataCentre />);
      const tab = screen
        .getByText('图文')
        .closest('.ant-tabs-tab') as HTMLElement;
      fireEvent.click(tab);
    });
    And('等待列表刷新（300ms防抖）', async () => {
      await advanceTime(400);
    });
    Then('列表仅展示图文类型内容', async () => {
      await waitFor(() => {
        expect(mockRefetch).toHaveBeenCalled();
      });
    });
  });

  Scenario('排序-按播放量默认', ({ Given, When, Then, And }) => {
    Given('用户已登录系统', () => {
      vi.mocked(useQuery).mockReturnValue(mockUseQuery());
    });
    When('进入数据中心主页', async () => {
      render(<DataCentre />);
    });
    Then('排序选择器默认选中「按播放量」', async () => {
      await waitFor(() => {
        expect(screen.getByText('按播放量')).toBeInTheDocument();
      });
    });
    And('列表按播放量降序排列', async () => {});
  });

  Scenario('排序-按点赞量', ({ Given, When, Then, And }) => {
    Given('用户已登录系统', () => {
      vi.mocked(useQuery).mockReturnValue(mockUseQuery());
    });
    When('选择「按点赞量」排序', async () => {
      render(<DataCentre />);
      const select = screen
        .getByText('按播放量')
        .closest('.ant-select') as HTMLElement;
      fireEvent.click(select);
    });
    And('等待列表刷新（300ms防抖）', async () => {
      await advanceTime(400);
    });
    Then('列表按点赞量降序排列', async () => {
      await waitFor(() => {
        expect(mockRefetch).toHaveBeenCalled();
      });
    });
  });

  Scenario('排序-按评论量', ({ Given, When, Then, And }) => {
    Given('用户已登录系统', () => {
      vi.mocked(useQuery).mockReturnValue(mockUseQuery());
    });
    When('选择「按评论量」排序', async () => {
      render(<DataCentre />);
      const select = screen
        .getByText('按播放量')
        .closest('.ant-select') as HTMLElement;
      fireEvent.click(select);
    });
    And('等待列表刷新（300ms防抖）', async () => {
      await advanceTime(400);
    });
    Then('列表按评论量降序排列', async () => {
      await waitFor(() => {
        expect(mockRefetch).toHaveBeenCalled();
      });
    });
  });

  Scenario('账号名称可点击跳转', ({ Given, When, Then, And }) => {
    Given('用户已登录系统，内容有账号', () => {
      vi.mocked(useQuery).mockReset();
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
    });
    When('点击内容列表的「账号」列名称', async () => {
      render(<DataCentre />);
      await fireClickContentPerformanceAccountLink('时尚美妆号');
    });
    Then('跳转到账号详情页', async () => {
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith(
          '/datacenter/account/acc-001?from=datacenter',
        );
      });
    });
    And('URL包含`/datacenter/account/:id`', async () => {
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith(
          expect.stringContaining('/datacenter/account/'),
        );
      });
    });
  });

  Scenario('平台标识', ({ Given, When, Then, And }) => {
    Given('用户已登录系统', () => {
      vi.mocked(useQuery).mockReturnValue(mockUseQuery());
    });
    When('观察内容列表的「平台」列', async () => {
      render(<DataCentre />);
    });
    Then('使用平台Logo图标+文字（图标优先）', async () => {
      await waitFor(() => {
        expect(screen.getByText('抖音')).toBeInTheDocument();
      });
    });
    And('抖音显示抖音Logo，小红书显示小红书Logo', async () => {});
  });

  Scenario('互动率计算正确', ({ Given, When, Then, And }) => {
    Given('用户已登录系统', () => {
      vi.mocked(useQuery).mockReturnValue(mockUseQuery());
    });
    When('选择一条内容，记录播放量、点赞量、评论量、转发量', async () => {
      render(<DataCentre />);
    });
    And('手动计算：互动率=(点赞+评论+转发)/播放量×100%', async () => {});
    Then('列表显示的互动率与计算结果一致（保留2位小数）', async () => {
      await waitFor(() => {
        expect(screen.getByText('8.56%')).toBeInTheDocument();
      });
    });
  });

  Scenario('内容列表不支持关键词搜索', ({ Given, When, Then, And }) => {
    Given('用户已登录系统', () => {
      vi.mocked(useQuery).mockReturnValue(mockUseQuery());
    });
    When('观察内容表现列表区域', async () => {
      render(<DataCentre />);
    });
    Then('没有搜索输入框', async () => {
      const searchInput = screen.queryByPlaceholderText('搜索关键词');
      expect(searchInput).not.toBeInTheDocument();
    });
    And('不支持关键词搜索', async () => {});
  });

  Scenario('分页-默认10条', ({ Given, When, Then, And }) => {
    Given('用户已登录系统，内容数量大于10', () => {
      vi.mocked(useQuery).mockReturnValue(mockUseQuery());
    });
    When('观察分页器', async () => {
      render(<DataCentre />);
    });
    Then('默认每页10条', async () => {
      await waitFor(() => {
        expect(screen.getByText('10条/页')).toBeInTheDocument();
      });
    });
    And('分页器显示「共 N 条」', async () => {
      await waitFor(() => {
        expect(screen.getByText('共 24 条')).toBeInTheDocument();
      });
    });
  });

  Scenario('分页-下一页', ({ Given, When, Then, And }) => {
    Given('用户已登录系统，当前第1页', () => {
      vi.mocked(useQuery).mockReturnValue(mockUseQuery());
    });
    When('点击「下一页」', async () => {
      render(<DataCentre />);
      const button = screen
        .getByText('下一页')
        .closest('button') as HTMLButtonElement;
      fireEvent.click(button);
    });
    And('等待列表刷新', async () => {
      await waitFor(() => {
        expect(screen.getByText('2')).toBeInTheDocument();
      });
    });
    Then('页码变为2，列表显示第11-20条', async () => {
      await waitFor(() => {
        expect(mockRefetch).toHaveBeenCalled();
      });
    });
  });

  Scenario('分页-上一页', ({ Given, When, Then, And }) => {
    Given('用户已登录系统，当前第2页', () => {
      vi.mocked(useQuery).mockReturnValue(mockUseQuery());
    });
    When('点击「上一页」', async () => {
      render(<DataCentre />);
      const button = screen
        .getByText('上一页')
        .closest('button') as HTMLButtonElement;
      fireEvent.click(button);
    });
    And('等待列表刷新', async () => {
      await waitFor(() => {
        expect(screen.getByText('1')).toBeInTheDocument();
      });
    });
    Then('页码变回1，列表显示第1-10条', async () => {
      await waitFor(() => {
        expect(mockRefetch).toHaveBeenCalled();
      });
    });
  });

  Scenario('分页-每页20条', ({ Given, When, Then, And }) => {
    Given('用户已登录系统', () => {
      vi.mocked(useQuery).mockReturnValue(mockUseQuery());
    });
    When('选择每页条数下拉「20条」', async () => {
      render(<DataCentre />);
      const select = screen.getByRole('combobox', { name: /pageSize/iu });
      fireEvent.click(select);
      fireEvent.click(screen.getByText('20条/页'));
    });
    And('等待列表刷新', async () => {
      await waitFor(() => {
        expect(mockRefetch).toHaveBeenCalled();
      });
    });
    Then('每页显示20条', async () => {
      await waitFor(() => {
        expect(screen.getByText('20条/页')).toBeInTheDocument();
      });
    });
  });

  Scenario('分页-每页50条', ({ Given, When, Then, And }) => {
    Given('用户已登录系统', () => {
      vi.mocked(useQuery).mockReturnValue(mockUseQuery());
    });
    When('选择每页条数下拉「50条」', async () => {
      render(<DataCentre />);
      const select = screen.getByRole('combobox', { name: /pageSize/iu });
      fireEvent.click(select);
      fireEvent.click(screen.getByText('50条/页'));
    });
    And('等待列表刷新', async () => {
      await waitFor(() => {
        expect(mockRefetch).toHaveBeenCalled();
      });
    });
    Then('每页显示50条', async () => {
      await waitFor(() => {
        expect(screen.getByText('50条/页')).toBeInTheDocument();
      });
    });
  });

  Scenario('分页-第1页禁用', ({ Given, When, Then }) => {
    Given('用户已登录系统，在第1页', () => {
      vi.mocked(useQuery).mockReturnValue(mockUseQuery());
    });
    When('观察分页器', async () => {
      render(<DataCentre />);
    });
    Then('「上一页」按钮已禁用', async () => {
      await waitFor(() => {
        const button = screen
          .getByText('上一页')
          .closest('button') as HTMLButtonElement;
        expect(button).toBeDisabled();
      });
    });
  });

  Scenario('分页-末页禁用', ({ Given, When, Then }) => {
    Given('用户已登录系统，在末页', () => {
      vi.mocked(useQuery).mockReturnValue(mockUseQuery());
    });
    When('连续点击「下一页」到末页', async () => {
      render(<DataCentre />);
    });
    Then('「下一页」按钮已禁用', async () => {
      await waitFor(() => {
        const button = screen
          .getByText('下一页')
          .closest('button') as HTMLButtonElement;
        expect(button).toBeDisabled();
      });
    });
  });

  Scenario('全局时间变更重置列表状态', ({ Given, When, Then, And }) => {
    Given('已设置排序为「按点赞量」、类型为「视频」，当前在第2页', () => {
      vi.mocked(useQuery).mockReturnValue(mockUseQuery());
    });
    When('修改全局时间筛选（如从「今日」改为「近7天」）', async () => {
      render(<DataCentre />);
      const button = screen.getByText('近7天');
      fireEvent.click(button);
    });
    And('等待列表刷新', async () => {
      await waitFor(() => {
        expect(screen.getByText('按播放量')).toBeInTheDocument();
      });
    });
    Then('排序重置为「按播放量」', async () => {
      await waitFor(() => {
        expect(screen.getByText('按播放量')).toBeInTheDocument();
      });
    });
    And('类型重置为「全部」', async () => {
      await waitFor(() => {
        expect(screen.getByText('全部')).toBeInTheDocument();
      });
    });
    And('页码重置为第1页', async () => {
      await waitFor(() => {
        expect(screen.getByText('1')).toBeInTheDocument();
      });
    });
  });

  Scenario('全局平台变更重置列表状态', ({ Given, When, Then, And }) => {
    Given('已设置排序为「按评论量」，当前在第2页', () => {
      vi.mocked(useQuery).mockReturnValue(mockUseQuery());
    });
    When('修改全局平台筛选（如从「全部」改为「抖音」）', async () => {
      render(<DataCentre />);
      const button = screen.getByText('抖音');
      fireEvent.click(button);
    });
    And('等待列表刷新', async () => {
      await waitFor(() => {
        expect(screen.getByText('按播放量')).toBeInTheDocument();
      });
    });
    Then('排序重置为「按播放量」', async () => {
      await waitFor(() => {
        expect(screen.getByText('按播放量')).toBeInTheDocument();
      });
    });
    And('页码重置为第1页', async () => {
      await waitFor(() => {
        expect(screen.getByText('1')).toBeInTheDocument();
      });
    });
  });

  Scenario('变更排序重置页码', ({ Given, When, Then, And }) => {
    Given('用户已登录系统，当前在第2页', () => {
      vi.mocked(useQuery).mockReturnValue(mockUseQuery());
    });
    When('变更排序方式（从「按播放量」改为「按点赞量」）', async () => {
      render(<DataCentre />);
    });
    And('等待列表刷新', async () => {
      await waitFor(() => {});
    });
    Then('页码重置为第1页', async () => {
      await waitFor(() => {
        expect(mockRefetch).toHaveBeenCalled();
      });
    });
  });

  Scenario('变更类型筛选重置页码', ({ Given, When, Then, And }) => {
    Given('用户已登录系统，当前在第2页', () => {
      vi.mocked(useQuery).mockReturnValue(mockUseQuery());
    });
    When('变更类型筛选（从「全部」改为「视频」）', async () => {
      render(<DataCentre />);
    });
    And('等待列表刷新', async () => {
      await waitFor(() => {});
    });
    Then('页码重置为第1页', async () => {
      await waitFor(() => {
        expect(mockRefetch).toHaveBeenCalled();
      });
    });
  });

  Scenario('互动率为0显示', ({ Given, When, Then }) => {
    Given('某内容播放量为0', () => {
      const contentsData = createMockContentsData({
        list: [
          {
            contentId: '1',
            title: '测试内容',
            accountId: 'acc-001',
            accountName: '时尚美妆号',
            platform: 'douyin',
            contentType: 'video',
            playCount: '0',
            likeCount: '0',
            commentCount: '0',
            shareCount: '0',
            engagementRate: '0',
          },
        ],
      });
      vi.mocked(useQuery).mockReturnValue(mockUseQuery({ data: contentsData }));
    });
    When('观察该行的「互动率」列', async () => {
      render(<DataCentre />);
    });
    Then('显示「-」', async () => {
      await waitFor(() => {
        expect(screen.getByText(PLACEHOLDER)).toBeInTheDocument();
      });
    });
  });

  Scenario('互动率超过999.99%', ({ Given, When, Then }) => {
    Given('某内容互动率计算结果大于999.99%', () => {
      const contentsData = createMockContentsData({
        list: [
          {
            contentId: '1',
            title: '测试内容',
            accountId: 'acc-001',
            accountName: '时尚美妆号',
            platform: 'douyin',
            contentType: 'video',
            playCount: '100',
            likeCount: '500',
            commentCount: '400',
            shareCount: '200',
            engagementRate: '1100',
          },
        ],
      });
      vi.mocked(useQuery).mockReturnValue(mockUseQuery({ data: contentsData }));
    });
    When('观察该行的「互动率」列', async () => {
      render(<DataCentre />);
    });
    Then('显示「>999.99%」', async () => {
      await waitFor(() => {
        expect(screen.getByText('>999.99%')).toBeInTheDocument();
      });
    });
  });

  Scenario('互动率超过6字符截断', ({ Given, When, Then, And }) => {
    Given('互动率数值过长', () => {
      const contentsData = createMockContentsData({
        list: [
          {
            contentId: '1',
            title: '测试内容',
            accountId: 'acc-001',
            accountName: '时尚美妆号',
            platform: 'douyin',
            contentType: 'video',
            playCount: '100',
            likeCount: '500',
            commentCount: '400',
            shareCount: '200',
            engagementRate: '123.456',
          },
        ],
      });
      vi.mocked(useQuery).mockReturnValue(mockUseQuery({ data: contentsData }));
    });
    When('观察互动率列的显示宽度', async () => {
      render(<DataCentre />);
    });
    Then('超过6个字符时显示「...」截断', async () => {
      await waitFor(() => {
        expect(screen.getByText('123.45...')).toBeInTheDocument();
      });
    });
    And('鼠标悬停到截断文本显示完整数值tooltip', async () => {
      const truncatedText = screen.getByText('123.45...');
      fireEvent.mouseEnter(truncatedText);
      await waitFor(() => {
        expect(screen.getByText('123.456%')).toBeInTheDocument();
      });
    });
  });

  Scenario('播放量超过万显示缩略', ({ Given, When, Then, And }) => {
    const contentsOverWan = createMockContentsData({
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
    });

    const installContentsMocks = (
      data: ReturnType<typeof createMockContentsData>,
    ) => {
      vi.mocked(contentsQueryOptions).mockImplementation((params) => ({
        queryKey: ['statistics', 'contents', params],
        queryFn: async () => data as unknown as PageContentPerformanceResponse,
      }));
      vi.mocked(useQuery).mockReset();
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
          getContentsData: () => data,
        }),
      );
    };

    Given('播放量超过1万', () => {
      installContentsMocks(contentsOverWan);
    });
    When('观察「播放量」列', async () => {
      installContentsMocks(contentsOverWan);
      render(<DataCentre />);
    });
    Then('超过1万显示「X.X万」', async () => {
      installContentsMocks(contentsOverWan);
      render(<DataCentre />);
      await waitFor(() => {
        expect(screen.getByText('12.5万')).toBeInTheDocument();
      });
    });
    And('超过1亿显示「X.X亿」', async () => {
      const bigContentsData = createMockContentsData({
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
      });
      installContentsMocks(bigContentsData);
      render(<DataCentre />);
      await waitFor(() => {
        expect(screen.getByText('1.3亿')).toBeInTheDocument();
      });
    });
  });

  Scenario('数据为0显示横线', ({ Given, When, Then }) => {
    Given('某内容数据为0（如评论量为0）', () => {
      vi.mocked(useQuery).mockReturnValue(mockUseQuery());
    });
    When('观察该单元格', async () => {
      render(<DataCentre />);
    });
    Then('显示「-」', async () => {
      await waitFor(() => {
        expect(screen.getByText(PLACEHOLDER)).toBeInTheDocument();
      });
    });
  });

  Scenario('返回保持页码和滚动位置', ({ Given, When, Then, And }) => {
    Given('用户已登录系统，在内容列表第3页', () => {
      vi.mocked(useQuery).mockReset();
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
          getContentsData: () =>
            createMockContentsData({ page: 3, totalPages: 5 }),
        }),
      );
    });
    When('滚动到页面中部位置', async () => {
      render(<DataCentre />);
      window.scrollTo(0, 300);
    });
    And('点击内容列表中某账号名称，跳转到账号详情页', async () => {
      await fireClickContentPerformanceAccountLink('时尚美妆号');
    });
    And('在账号详情页点击「返回数据中心」', async () => {
      mockNavigate('/datacenter');
    });
    And('等待返回主页', async () => {
      render(<DataCentre />);
    });
    Then('页码仍为第3页', async () => {
      await waitFor(() => {
        expect(screen.getByText('3')).toBeInTheDocument();
      });
    });
    And('滚动位置与离开时一致（通过sessionStorage恢复）', async () => {
      await waitFor(() => {
        expect(window.scrollY).toBe(300);
      });
    });
  });

  Scenario('网络断开', ({ Given, When, Then, And }) => {
    Given('网络断开状态', () => {
      vi.mocked(useQuery).mockReturnValue(
        mockUseQuery({ isError: true, error: new Error('Network Error') }),
      );
    });
    When('在数据中心主页执行任意操作（如刷新、筛选）', async () => {
      render(<DataCentre />);
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
        mockUseQuery({ isError: true, error: new Error('Timeout') }),
      );
    });
    When('在数据中心主页执行操作', async () => {
      render(<DataCentre />);
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
      const contentsData = createMockContentsData({
        list: [],
        total: '0',
        totalPages: 0,
      });
      vi.mocked(useQuery).mockReturnValue(mockUseQuery({ data: contentsData }));
    });
    When('观察各数据区域', async () => {
      render(<DataCentre />);
    });
    Then('显示对应空状态插画或提示（如「暂无预警」「暂无内容」）', async () => {
      await waitFor(() => {
        expect(screen.getByText('暂无内容')).toBeInTheDocument();
      });
    });
  });

  Scenario('Token失效', ({ Given, When, Then, And }) => {
    Given('Token已过期', () => {
      vi.mocked(useQuery).mockReturnValue(
        mockUseQuery({ isError: true, error: new Error('401 Unauthorized') }),
      );
    });
    When('访问数据中心主页', async () => {
      render(<DataCentre />);
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

  Scenario('去处理后30秒轮询', ({ Given, When, Then, And }) => {
    Given('处理登录失效预警', () => {
      vi.mocked(useQuery).mockReturnValue(mockUseQuery());
    });
    When('点击某登录失效预警的「去处理」', async () => {
      render(<DataCentre />);
      const button = screen
        .getByText('去处理')
        .closest('button') as HTMLButtonElement;
      fireEvent.click(button);
    });
    And('完成重新扫码登录', async () => {
      mockNavigate('/datacenter');
    });
    And('立即返回数据中心主页', async () => {
      mockNavigate('/datacenter');
    });
    Then('30秒内每5秒轮询查询账号状态', async () => {
      vi.useFakeTimers();
      await act(async () => {
        vi.advanceTimersByTime(30 * 1000);
      });
      vi.useRealTimers();
      expect(mockRefetch).toHaveBeenCalledTimes(6);
    });
    And('直到状态变更为「在线」或超时', async () => {
      await waitFor(() => {
        expect(mockRefetch).toHaveBeenCalled();
      });
    });
  });

  Scenario('轮询超时停止', ({ Given, When, Then, And }) => {
    Given('处理未完成', () => {
      vi.mocked(useQuery).mockReturnValue(mockUseQuery());
    });
    When('点击某登录失效预警的「去处理」', async () => {
      render(<DataCentre />);
      mockNavigate('/datacenter');
    });
    And('不完成处理直接返回', async () => {
      mockNavigate('/datacenter');
    });
    And('等待30秒', async () => {
      vi.useFakeTimers();
      await act(async () => {
        vi.advanceTimersByTime(30 * 1000);
      });
      vi.useRealTimers();
    });
    Then('轮询超时后停止', async () => {
      vi.useFakeTimers();
      await act(async () => {
        vi.advanceTimersByTime(10 * 1000);
      });
      vi.useRealTimers();
      expect(mockRefetch).toHaveBeenCalledTimes(6);
    });
    And('提示用户手动刷新', async () => {
      await waitFor(() => {
        expect(mockMessage.warning).toHaveBeenCalledWith(
          '轮询超时，请手动刷新',
        );
      });
    });
  });

  Scenario('轮询定时器清理-页面卸载', ({ Given, When, Then }) => {
    Given('正在轮询', () => {
      vi.mocked(useQuery).mockReturnValue(mockUseQuery());
    });
    When('关闭页面或路由离开', async () => {
      const { unmount } = render(<DataCentre />);
      unmount();
    });
    Then('组件销毁时清除所有定时器', async () => {
      vi.useFakeTimers();
      await act(async () => {
        vi.advanceTimersByTime(60 * 1000);
      });
      vi.useRealTimers();
      expect(mockRefetch).toHaveBeenCalledTimes(1);
    });
  });

  Scenario('轮询定时器清理-新轮询', ({ Given, When, Then }) => {
    Given('正在轮询', () => {
      vi.mocked(useQuery).mockReturnValue(mockUseQuery());
    });
    When('再次点击「去处理」，发起第二次轮询', async () => {
      render(<DataCentre />);
      const button = screen
        .getByText('去处理')
        .closest('button') as HTMLButtonElement;
      fireEvent.click(button);
    });
    Then('新轮询开始前清除上一次的定时器', async () => {
      vi.useFakeTimers();
      await act(async () => {
        vi.advanceTimersByTime(30 * 1000);
      });
      vi.useRealTimers();
      expect(mockRefetch).toHaveBeenCalledTimes(7);
    });
  });
});
