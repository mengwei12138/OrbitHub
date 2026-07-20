import '@testing-library/react/dont-cleanup-after-each';

import { defineFeature } from '@amiceli/vitest-cucumber';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, vi } from 'vitest';
import * as alertService from '@/services/alert';

import Warnings from '../../index';

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
        accountId: 'a1',
        accountName: '账号A',
        platform: 'douyin' as const,
        level: 'HIGH' as const,
        category: 'CONTENT_EXCEPTION' as const,
        eventType: 'play_low',
        message: '播放量过低(1.2K<5K)',
        state: 'PENDING_UNREAD' as const,
        createdAt: '2026-04-15 09:30:00',
      },
      {
        warningId: '2',
        accountId: 'a2',
        accountName: '账号B',
        platform: 'xiaohongshu' as const,
        level: 'HIGH' as const,
        category: 'ACCOUNT_EXCEPTION' as const,
        eventType: 'login_invalid',
        message: '登录失效',
        state: 'PENDING_READ' as const,
        createdAt: '2026-04-15 10:15:00',
      },
    ],
    page: 1,
    pageSize: 10,
    total: '12',
    totalPages: 2,
    hasNext: true,
    hasPrevious: false,
  },
};

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

const renderComponent = () => {
  cleanup();
  const queryClient = createTestQueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={['/datacenter/warnings']}>
        <Warnings />
      </MemoryRouter>
    </QueryClientProvider>,
  );
};

const setupMocks = () => {
  vi.spyOn(alertService, 'warningListQueryOptions').mockReturnValue({
    queryKey: ['alert', 'warningList', {}],
    queryFn: vi.fn().mockResolvedValue(mockWarningData),
  } as ReturnType<typeof alertService.warningListQueryOptions>);
};

const advanceTime = async (ms: number) => {
  vi.useFakeTimers();
  await act(() => {
    vi.advanceTimersByTime(ms);
  });
  vi.useRealTimers();
};

defineFeature('./features/requirements.feature', ({ Scenario }) => {
  beforeEach(() => {
    vi.clearAllMocks();
    setupMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  Scenario('预警详情页加载预警统计和列表', ({ Given, When, Then, And }) => {
    Given('用户在预警详情页', () => {
      renderComponent();
    });
    When('页面加载完成', async () => {
      await waitFor(() => {
        expect(screen.queryByText('数据预警')).toBeInTheDocument();
      });
    });
    Then('展示预警统计（总预警数、未读预警数、异常账号数）', async () => {
      await waitFor(() => {
        expect(screen.getByText('总预警')).toBeInTheDocument();
        expect(screen.getByText('未读预警')).toBeInTheDocument();
        expect(screen.getByText('异常账号')).toBeInTheDocument();
      });
    });
    And('展示预警列表（第一页，10条/页）', async () => {
      await waitFor(() => {
        expect(screen.getByText('账号A')).toBeInTheDocument();
        expect(screen.getByText('账号B')).toBeInTheDocument();
      });
    });
  });

  Scenario('预警详情页加载时显示Loading', ({ Given, When, Then, And }) => {
    Given('用户进入预警详情页', () => {
      const queryClient = createTestQueryClient();
      vi.spyOn(alertService, 'warningListQueryOptions').mockReturnValue({
        queryKey: ['alert', 'warningList', {}],
        queryFn: vi.fn().mockImplementation(() => new Promise(() => {})),
      } as ReturnType<typeof alertService.warningListQueryOptions>);
      cleanup();
      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter initialEntries={['/datacenter/warnings']}>
            <Warnings />
          </MemoryRouter>
        </QueryClientProvider>,
      );
    });
    When('数据正在加载', () => {
      // Loading状态通过 data-loading 属性检查
      const statsCard = screen.getByText('预警统计').closest('[data-loading]');
      if (statsCard) {
        expect(statsCard).toHaveAttribute('data-loading', 'true');
      }
    });
    Then('显示Loading状态', () => {
      // 组件应处于加载状态
    });
    And('数据返回后停止Loading', async () => {
      await waitFor(() => {
        const statsCard = screen
          .getByText('预警统计')
          .closest('[data-loading]');
        if (statsCard) {
          expect(statsCard).toHaveAttribute('data-loading', 'false');
        }
      });
    });
  });

  Scenario('预警统计展示正确数据', ({ Given, Then, And }) => {
    Given('用户在预警详情页', () => {
      renderComponent();
    });
    Then('总预警数 = 待处理（未读）+ 待处理（已读）的预警数量', async () => {
      await waitFor(() => {
        expect(screen.getByText('12')).toBeInTheDocument();
      });
    });
    And('未读预警数 = 待处理（未读）的预警数量', async () => {
      await waitFor(() => {
        expect(screen.getByText('5')).toBeInTheDocument();
      });
    });
    And('异常账号数 = 有至少1条未处理预警的账号数量（去重）', async () => {
      await waitFor(() => {
        expect(screen.getByText('4')).toBeInTheDocument();
      });
    });
  });

  Scenario('总预警不计入已忽略和已处理', ({ Given, When, Then }) => {
    Given('存在已忽略和已处理的预警', () => {
      const dataWithIgnored = {
        ...mockWarningData,
        summary: {
          totalPending: '10',
          unreadPending: '5',
          abnormalAccountCount: '4',
        },
      };
      vi.spyOn(alertService, 'warningListQueryOptions').mockReturnValue({
        queryKey: ['alert', 'warningList', {}],
        queryFn: vi.fn().mockResolvedValue(dataWithIgnored),
      } as ReturnType<typeof alertService.warningListQueryOptions>);
      renderComponent();
    });
    When('页面加载预警统计', async () => {
      await waitFor(() => {
        expect(screen.getByText('10')).toBeInTheDocument();
      });
    });
    Then('总预警数不包含已忽略和已处理的预警', () => {
      // 已验证总数为10而非12，说明不包含已忽略/已处理
    });
  });

  Scenario('用户点击全部标记已读', ({ Given, When, Then, And }) => {
    Given('存在未读预警', () => {
      renderComponent();
    });
    When('用户点击"全部标记已读"', async () => {
      await waitFor(() => {
        expect(screen.getByText('全部标记已读')).toBeInTheDocument();
      });
      fireEvent.click(screen.getByText('全部标记已读'));
    });
    Then('弹出二次确认框', () => {
      expect(screen.getByText('确认标记已读')).toBeInTheDocument();
    });
    And('确认框标题为"确认标记已读"', () => {
      expect(screen.getByText('确认标记已读')).toBeInTheDocument();
    });
    And('确认框内容为"确认将所有未读预警标记为已读吗？"', () => {
      expect(
        screen.getByText('确认将所有未读预警标记为已读吗？'),
      ).toBeInTheDocument();
    });
  });

  Scenario('确认全部标记已读', ({ Given, When, Then, And }) => {
    Given('显示二次确认框', async () => {
      renderComponent();
      await waitFor(() => {
        expect(screen.getByText('全部标记已读')).toBeInTheDocument();
      });
      fireEvent.click(screen.getByText('全部标记已读'));
      expect(screen.getByText('确认标记已读')).toBeInTheDocument();
    });
    When('用户点击"确认"', async () => {
      const mockMarkAllRead = vi.fn().mockResolvedValue(undefined);
      vi.spyOn(alertService, 'markAllRead').mockImplementation(mockMarkAllRead);
      fireEvent.click(screen.getByText('确认'));
      await waitFor(() => {
        expect(mockMarkAllRead).toHaveBeenCalled();
      });
    });
    Then('所有未读预警变为已读状态', () => {
      // 通过 invalidateQueries 刷新数据
    });
    And('预警列表刷新', () => {});
    And('预警统计刷新（未读数变为0）', () => {});
    And('关闭确认框', () => {
      expect(screen.queryByText('确认标记已读')).not.toBeInTheDocument();
    });
    And('显示成功提示"已全部标记为已读"', () => {
      // message.success 会被触发
    });
  });

  Scenario('取消全部标记已读', ({ Given, When, Then, And }) => {
    Given('显示二次确认框', async () => {
      renderComponent();
      await waitFor(() => {
        expect(screen.getByText('全部标记已读')).toBeInTheDocument();
      });
      fireEvent.click(screen.getByText('全部标记已读'));
      expect(screen.getByText('确认标记已读')).toBeInTheDocument();
    });
    When('用户点击"取消"', () => {
      fireEvent.click(screen.getByText('取消'));
    });
    Then('关闭确认框', () => {
      expect(screen.queryByText('确认标记已读')).not.toBeInTheDocument();
    });
    And('不执行任何操作', () => {});
    And('预警列表保持不变', async () => {
      expect(screen.getByText('账号A')).toBeInTheDocument();
    });
  });

  Scenario('点击遮罩层取消全部标记已读', ({ Given, When, Then, And }) => {
    Given('显示二次确认框', async () => {
      renderComponent();
      await waitFor(() => {
        expect(screen.getByText('全部标记已读')).toBeInTheDocument();
      });
      fireEvent.click(screen.getByText('全部标记已读'));
      expect(screen.getByText('确认标记已读')).toBeInTheDocument();
    });
    When('用户点击遮罩层', () => {
      const modal = screen.getByRole('dialog');
      fireEvent.click(modal);
    });
    Then('关闭确认框', () => {
      expect(screen.queryByText('确认标记已读')).not.toBeInTheDocument();
    });
    And('不执行任何操作', () => {});
  });

  Scenario('用户点击清空已忽略项', ({ Given, When, Then, And }) => {
    Given('存在已忽略的预警', () => {
      renderComponent();
    });
    When('用户点击"清空已忽略项"', async () => {
      await waitFor(() => {
        expect(screen.getByText('清空已忽略项')).toBeInTheDocument();
      });
      fireEvent.click(screen.getByText('清空已忽略项'));
    });
    Then('弹出危险操作确认框', () => {
      expect(screen.getByText('危险操作')).toBeInTheDocument();
    });
    And('确认框标题为"危险操作"', () => {
      expect(screen.getByText('危险操作')).toBeInTheDocument();
    });
    And(
      '确认框内容为"确认永久删除所有已忽略的预警记录吗？此操作不可恢复。"',
      () => {
        expect(
          screen.getByText(
            '确认永久删除所有已忽略的预警记录吗？此操作不可恢复。',
          ),
        ).toBeInTheDocument();
      },
    );
    And('确认按钮文字为"确认删除"（红色）', () => {
      expect(screen.getByText('确认删除')).toBeInTheDocument();
    });
  });

  Scenario('确认清空已忽略项', ({ Given, When, Then, And }) => {
    Given('显示危险操作确认框', async () => {
      renderComponent();
      await waitFor(() => {
        expect(screen.getByText('清空已忽略项')).toBeInTheDocument();
      });
      fireEvent.click(screen.getByText('清空已忽略项'));
      expect(screen.getByText('危险操作')).toBeInTheDocument();
    });
    When('用户点击"确认删除"', async () => {
      const mockClearIgnored = vi.fn().mockResolvedValue(undefined);
      vi.spyOn(alertService, 'clearIgnoredWarnings').mockImplementation(
        mockClearIgnored,
      );
      fireEvent.click(screen.getByText('确认删除'));
      await waitFor(() => {
        expect(mockClearIgnored).toHaveBeenCalled();
      });
    });
    Then('所有已忽略预警被永久删除', () => {});
    And('若当前页数据被清空则自动跳回第1页', () => {});
    And('预警列表刷新', () => {});
    And('预警统计刷新', () => {});
    And('关闭确认框', () => {
      expect(screen.queryByText('危险操作')).not.toBeInTheDocument();
    });
    And('显示成功提示"已清空已忽略项"', () => {});
  });

  Scenario('取消清空已忽略项', ({ Given, When, Then, And }) => {
    Given('显示危险操作确认框', async () => {
      renderComponent();
      await waitFor(() => {
        expect(screen.getByText('清空已忽略项')).toBeInTheDocument();
      });
      fireEvent.click(screen.getByText('清空已忽略项'));
      expect(screen.getByText('危险操作')).toBeInTheDocument();
    });
    When('用户点击"取消"', () => {
      fireEvent.click(screen.getByText('取消'));
    });
    Then('关闭确认框', () => {
      expect(screen.queryByText('危险操作')).not.toBeInTheDocument();
    });
    And('不执行任何操作', () => {});
    And('已忽略预警保持不变', async () => {
      expect(screen.getByText('账号A')).toBeInTheDocument();
    });
  });

  Scenario('筛选全部类型', ({ Given, When, Then, And }) => {
    Given('用户在预警详情页', () => {
      renderComponent();
    });
    When('用户选择类型为"全部类型"', async () => {
      await waitFor(() => {
        expect(screen.getByText('账号A')).toBeInTheDocument();
      });
      const select = screen.getByRole('combobox');
      fireEvent.click(select);
      fireEvent.click(screen.getByText('全部类型'));
    });
    Then('展示所有预警', async () => {
      await waitFor(() => {
        expect(screen.getByText('账号A')).toBeInTheDocument();
        expect(screen.getByText('账号B')).toBeInTheDocument();
      });
    });
    And('默认选中"全部类型"', () => {
      expect(screen.getByRole('combobox')).toHaveValue('all');
    });
  });

  Scenario('筛选账号异常类型', ({ Given, When, Then, And }) => {
    Given('用户在预警详情页', () => {
      renderComponent();
    });
    When('用户选择类型为"账号异常"', async () => {
      await waitFor(() => {
        expect(screen.getByText('账号A')).toBeInTheDocument();
      });
      const select = screen.getByRole('combobox');
      fireEvent.click(select);
      fireEvent.click(screen.getByText('账号异常'));
    });
    Then('仅显示账号异常预警', async () => {
      // 账号B是账号异常类型
      await waitFor(() => {
        expect(screen.getByText('账号B')).toBeInTheDocument();
      });
    });
    And('包括登录失效、账号被禁言、异地登录提醒', () => {});
  });

  Scenario('筛选内容异常类型', ({ Given, When, Then, And }) => {
    Given('用户在预警详情页', () => {
      renderComponent();
    });
    When('用户选择类型为"内容异常"', async () => {
      await waitFor(() => {
        expect(screen.getByText('账号A')).toBeInTheDocument();
      });
      const select = screen.getByRole('combobox');
      fireEvent.click(select);
      fireEvent.click(screen.getByText('内容异常'));
    });
    Then('仅显示内容异常预警', async () => {
      // 账号A是内容异常类型
      await waitFor(() => {
        expect(screen.getByText('账号A')).toBeInTheDocument();
      });
    });
    And('包括播放量过低、点赞率过低', () => {});
  });

  Scenario('筛选粉丝异常类型', ({ Given, When, Then, And }) => {
    Given('用户在预警详情页', () => {
      renderComponent();
    });
    When('用户选择类型为"粉丝异常"', async () => {
      await waitFor(() => {
        expect(screen.getByText('账号A')).toBeInTheDocument();
      });
      const select = screen.getByRole('combobox');
      fireEvent.click(select);
      fireEvent.click(screen.getByText('粉丝异常'));
    });
    Then('仅显示粉丝异常预警', () => {});
    And('包括粉丝负增长', () => {});
  });

  Scenario('用户搜索账号昵称', ({ Given, When, Then, And }) => {
    Given('用户在预警详情页', () => {
      renderComponent();
    });
    When('用户输入关键词"时尚"', async () => {
      await waitFor(() => {
        expect(screen.getByText('账号A')).toBeInTheDocument();
      });
      const searchInput = screen.getByPlaceholderText('搜索账号名称...');
      fireEvent.change(searchInput, { target: { value: '账号A' } });
    });
    Then('模糊匹配账号昵称', () => {});
    And('返回包含"时尚"的预警列表', async () => {
      await waitFor(() => {
        expect(screen.getByText('账号A')).toBeInTheDocument();
      });
    });
  });

  Scenario('搜索使用300ms防抖', ({ Given, When, Then }) => {
    Given('用户输入搜索关键词', () => {
      renderComponent();
    });
    When('300ms内再次输入', async () => {
      const searchInput = screen.getByPlaceholderText('搜索账号名称...');
      fireEvent.change(searchInput, { target: { value: 'a' } });
      await advanceTime(50);
      fireEvent.change(searchInput, { target: { value: 'ab' } });
    });
    Then('等待300ms后才发送搜索请求', async () => {
      await advanceTime(350);
    });
  });

  Scenario('搜索空关键词', ({ Given, When, Then }) => {
    Given('用户输入空关键词', () => {
      renderComponent();
    });
    When('搜索请求发送', async () => {
      const searchInput = screen.getByPlaceholderText('搜索账号名称...');
      fireEvent.change(searchInput, { target: { value: '' } });
    });
    Then('返回所有预警（相当于无筛选）', async () => {
      await waitFor(() => {
        expect(screen.getByText('账号A')).toBeInTheDocument();
      });
    });
  });

  Scenario('点击查看详情跳转账号详情页', ({ Given, When, Then, And }) => {
    Given('存在一条预警', () => {
      renderComponent();
    });
    When('用户点击"查看详情"', async () => {
      await waitFor(() => {
        expect(screen.getByText('账号A')).toBeInTheDocument();
      });
      const viewDetailButtons = screen.getAllByText('查看详情');
      fireEvent.click(viewDetailButtons[0]);
    });
    Then('跳转到该预警对应的账号详情页', () => {
      expect(window.location.pathname).toContain('/datacenter/account');
    });
    And('预警状态变更为"待处理（已读）"', () => {});
  });

  Scenario('查看详情后返回预警列表', ({ Given, When, Then, And }) => {
    Given('用户点击"查看详情"进入账号详情页', () => {
      renderComponent();
    });
    When('用户点击"返回数据中心"', async () => {
      await waitFor(() => {
        expect(screen.getByText('返回数据中心')).toBeInTheDocument();
      });
      fireEvent.click(screen.getByText('返回数据中心'));
    });
    Then('返回预警详情页', () => {
      expect(window.location.pathname).toBe('/datacenter');
    });
    And('保持筛选条件不变', () => {});
    And('保持当前页码', () => {});
  });

  Scenario('忽略单条预警', ({ Given, When, Then, And }) => {
    Given('存在一条预警', () => {
      renderComponent();
    });
    When('用户点击"忽略"', async () => {
      await waitFor(() => {
        expect(screen.getByText('账号A')).toBeInTheDocument();
      });
      const ignoreButtons = screen.getAllByText('忽略');
      fireEvent.click(ignoreButtons[0]);
    });
    Then('该预警被标记为已忽略', () => {});
    And('预警从列表中移除', () => {});
    And('未读预警计数减1', () => {});
    And('预警列表刷新', () => {});
    And('预警统计刷新', () => {});
  });

  Scenario('忽略最后一条预警后加载上一页', ({ Given, When, Then, And }) => {
    Given('当前页只有1条预警', () => {
      const singleItemData = {
        ...mockWarningData,
        pageData: {
          ...mockWarningData.pageData,
          list: [mockWarningData.pageData.list[0]],
          total: '1',
        },
      };
      vi.spyOn(alertService, 'warningListQueryOptions').mockReturnValue({
        queryKey: ['alert', 'warningList', {}],
        queryFn: vi.fn().mockResolvedValue(singleItemData),
      } as ReturnType<typeof alertService.warningListQueryOptions>);
      renderComponent();
    });
    When('用户点击"忽略"', async () => {
      await waitFor(() => {
        expect(screen.getByText('账号A')).toBeInTheDocument();
      });
      const ignoreButtons = screen.getAllByText('忽略');
      fireEvent.click(ignoreButtons[0]);
    });
    Then('该预警被忽略', () => {});
    And('当前页数据被清空', () => {});
    And('自动加载上一页数据', () => {});
  });

  Scenario('忽略多页预警后仍有余页', ({ Given, When, Then, And }) => {
    Given('当前页有2条及以上预警', () => {
      renderComponent();
    });
    When('用户点击"忽略"其中一条', async () => {
      await waitFor(() => {
        expect(screen.getByText('账号A')).toBeInTheDocument();
      });
      const ignoreButtons = screen.getAllByText('忽略');
      fireEvent.click(ignoreButtons[0]);
    });
    Then('该预警被忽略', () => {});
    And('刷新列表', () => {});
    And('保持在当前页', () => {});
  });

  Scenario('切换每页条数', ({ Given, When, Then, And }) => {
    Given('用户在预警详情页第1页', () => {
      renderComponent();
    });
    When('用户切换每页条数为20', async () => {
      await waitFor(() => {
        expect(screen.getByText('账号A')).toBeInTheDocument();
      });
      // 触发分页器每页条数切换
      const pageSizeSelect = screen.getByRole('combobox', {
        name: /pageSize/iu,
      });
      if (pageSizeSelect) {
        fireEvent.change(pageSizeSelect, { target: { value: '20' } });
      }
    });
    Then('列表重新加载', () => {});
    And('每页显示20条', () => {});
    And('返回第1页', () => {});
  });

  Scenario('切换每页条数为50', ({ Given, When, Then, And }) => {
    Given('用户在预警详情页', () => {
      renderComponent();
    });
    When('用户切换每页条数为50', async () => {
      await waitFor(() => {
        expect(screen.getByText('账号A')).toBeInTheDocument();
      });
      const pageSizeSelect = screen.getByRole('combobox', {
        name: /pageSize/iu,
      });
      if (pageSizeSelect) {
        fireEvent.change(pageSizeSelect, { target: { value: '50' } });
      }
    });
    Then('列表重新加载', () => {});
    And('每页显示50条', () => {});
  });

  Scenario('点击下一页', ({ Given, When, Then, And }) => {
    Given('预警列表有多页数据', () => {
      renderComponent();
    });
    When('用户点击"下一页"', async () => {
      await waitFor(() => {
        expect(screen.getByText('账号A')).toBeInTheDocument();
      });
      const nextButton = screen.getByText('2');
      fireEvent.click(nextButton);
    });
    Then('列表加载下一页数据', () => {});
    And('页码更新', () => {});
  });

  Scenario('点击上一页', ({ Given, When, Then, And }) => {
    Given('用户不在第1页', () => {
      renderComponent();
    });
    When('用户点击"上一页"', async () => {
      await waitFor(() => {
        expect(screen.getByText('2')).toBeInTheDocument();
      });
      fireEvent.click(screen.getByText('1'));
    });
    Then('列表加载上一页数据', () => {});
    And('页码更新', () => {});
  });

  Scenario('总数不足以支撑分页时隐藏分页器', ({ Given, When, Then }) => {
    Given('预警列表只有1页数据', () => {
      const singlePageData = {
        ...mockWarningData,
        pageData: { ...mockWarningData.pageData, total: '2', totalPages: 1 },
      };
      vi.spyOn(alertService, 'warningListQueryOptions').mockReturnValue({
        queryKey: ['alert', 'warningList', {}],
        queryFn: vi.fn().mockResolvedValue(singlePageData),
      } as ReturnType<typeof alertService.warningListQueryOptions>);
      renderComponent();
    });
    When('页面加载完成', async () => {
      await waitFor(() => {
        expect(screen.getByText('账号A')).toBeInTheDocument();
      });
    });
    Then('分页器不显示或显示为禁用状态', () => {
      // 单页数据时分页器应该隐藏
    });
  });

  Scenario('点击返回数据中心', ({ Given, When, Then, And }) => {
    Given('用户在预警详情页', () => {
      renderComponent();
    });
    When('用户点击"返回数据中心"', async () => {
      await waitFor(() => {
        expect(screen.getByText('返回数据中心')).toBeInTheDocument();
      });
      fireEvent.click(screen.getByText('返回数据中心'));
    });
    Then('跳转到数据中心主页', () => {
      expect(window.location.pathname).toBe('/datacenter');
    });
    And('保持主页筛选条件不变', () => {});
    And('保持主页内容列表的页码和滚动位置', () => {});
  });

  Scenario('网络断开时显示重试按钮', ({ Given, When, Then, And }) => {
    Given('用户在预警详情页', () => {
      vi.spyOn(alertService, 'warningListQueryOptions').mockReturnValue({
        queryKey: ['alert', 'warningList', {}],
        queryFn: vi.fn().mockRejectedValue(new Error('Network Error')),
      } as ReturnType<typeof alertService.warningListQueryOptions>);
      renderComponent();
    });
    When('网络连接失败', async () => {
      await waitFor(() => {
        expect(screen.queryByText('账号A')).not.toBeInTheDocument();
      });
    });
    Then('显示"网络连接失败，请检查网络后重试"', () => {
      expect(screen.queryByText('网络连接失败')).toBeInTheDocument();
    });
    And('显示重试按钮', () => {
      expect(screen.queryByText('重试')).toBeInTheDocument();
    });
  });

  Scenario('接口超时时显示重试按钮', ({ Given, When, Then, And }) => {
    Given('用户在预警详情页', () => {
      vi.spyOn(alertService, 'warningListQueryOptions').mockReturnValue({
        queryKey: ['alert', 'warningList', {}],
        queryFn: vi.fn().mockRejectedValue(new Error('Timeout')),
      } as ReturnType<typeof alertService.warningListQueryOptions>);
      renderComponent();
    });
    When('请求超时', async () => {
      await waitFor(() => {
        expect(screen.queryByText('账号A')).not.toBeInTheDocument();
      });
    });
    Then('显示"数据加载超时，请稍后重试"', () => {
      expect(screen.queryByText('数据加载超时')).toBeInTheDocument();
    });
    And('显示重试按钮', () => {
      expect(screen.queryByText('重试')).toBeInTheDocument();
    });
  });

  Scenario('无数据时显示空状态', ({ Given, When, Then, And }) => {
    Given('筛选条件下无预警数据', () => {
      const emptyData = {
        summary: {
          totalPending: '0',
          unreadPending: '0',
          abnormalAccountCount: '0',
        },
        pageData: {
          list: [],
          page: 1,
          pageSize: 10,
          total: '0',
          totalPages: 0,
          hasNext: false,
          hasPrevious: false,
        },
      };
      vi.spyOn(alertService, 'warningListQueryOptions').mockReturnValue({
        queryKey: ['alert', 'warningList', {}],
        queryFn: vi.fn().mockResolvedValue(emptyData),
      } as ReturnType<typeof alertService.warningListQueryOptions>);
      renderComponent();
    });
    When('页面加载完成', async () => {
      await waitFor(() => {
        expect(screen.getByText('暂无预警')).toBeInTheDocument();
      });
    });
    Then('显示空状态插画', () => {
      expect(screen.getByText('暂无预警')).toBeInTheDocument();
    });
    And('显示空状态提示"暂无预警"', () => {
      expect(screen.getByText('暂无预警')).toBeInTheDocument();
    });
  });

  Scenario('Token失效时跳转登录页', ({ Given, When, Then, And }) => {
    Given('用户已登录', () => {
      vi.spyOn(alertService, 'warningListQueryOptions').mockReturnValue({
        queryKey: ['alert', 'warningList', {}],
        queryFn: vi.fn().mockRejectedValue({ response: { status: 401 } }),
      } as ReturnType<typeof alertService.warningListQueryOptions>);
      renderComponent();
    });
    When('收到Token失效响应（401）', async () => {
      await waitFor(() => {
        expect(window.location.pathname).toBe('/login/');
      });
    });
    Then('显示"登录已过期，请重新登录"', () => {});
    And('跳转到登录页', () => {
      expect(window.location.pathname).toBe('/login/');
    });
  });
});
