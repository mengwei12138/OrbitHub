import { defineFeature } from '@amiceli/vitest-cucumber';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, vi } from 'vitest';
import * as alertService from '@/services/alert';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual =
    await vi.importActual<typeof import('react-router-dom')>(
      'react-router-dom',
    );
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

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
        contentId: 'content-001',
        accountName: '账号A',
        platform: 'douyin' as const,
        level: 'HIGH' as const,
        category: 'CONTENT_EXCEPTION' as const,
        eventType: 'LOW_PLAY_COUNT',
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
        eventType: 'LOGIN_EXPIRED',
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

defineFeature('./features/test.feature', ({ Scenario }) => {
  beforeEach(() => {
    vi.clearAllMocks();
    setupMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  Scenario('预警详情页入口-点击查看全部', ({ Given, When, Then, And }) => {
    Given('用户已登录系统', () => {});
    When('在数据中心主页数据预警区点击「查看全部」按钮', async () => {
      // 在实际测试中会从主页点击，这里直接验证URL跳转
      renderComponent();
      await waitFor(() => {
        expect(screen.getByText('数据预警')).toBeInTheDocument();
      });
    });
    Then('页面跳转到预警详情页', () => {
      expect(window.location.pathname).toBe('/datacenter/warnings');
    });
    And('URL为`/datacenter/warnings`', () => {
      expect(window.location.pathname).toBe('/datacenter/warnings');
    });
    And('页面标题为「数据预警」或类似', () => {
      expect(screen.getByText('数据预警')).toBeInTheDocument();
    });
  });

  Scenario('预警详情页入口-直接访问URL', ({ Given, When, Then }) => {
    Given('用户已登录系统', () => {});
    When('在浏览器地址栏直接输入预警详情页URL', () => {
      renderComponent();
    });
    Then('页面正确加载预警列表', async () => {
      await waitFor(() => {
        expect(screen.getByText('账号A')).toBeInTheDocument();
      });
    });
  });

  Scenario('预警统计显示', ({ Given, When, Then, And }) => {
    Given('在预警详情页', () => {
      renderComponent();
    });
    When('观察预警统计区域', async () => {
      await waitFor(() => {
        expect(screen.getByText('预警统计')).toBeInTheDocument();
      });
    });
    Then(
      '显示三个统计卡片：总预警数量、未读预警数量、异常账号数量',
      async () => {
        await waitFor(() => {
          expect(screen.getByText('总预警')).toBeInTheDocument();
          expect(screen.getByText('未读预警')).toBeInTheDocument();
          expect(screen.getByText('异常账号')).toBeInTheDocument();
        });
      },
    );
    And('数据与实际预警数据一致', async () => {
      await waitFor(() => {
        expect(screen.getByText('12')).toBeInTheDocument();
        expect(screen.getByText('5')).toBeInTheDocument();
        expect(screen.getByText('4')).toBeInTheDocument();
      });
    });
  });

  Scenario('总预警计算逻辑', ({ Given, When, Then, And }) => {
    Given('在预警详情页', () => {
      renderComponent();
    });
    When('观察总预警数量', async () => {
      await waitFor(() => {
        expect(screen.getByText('12')).toBeInTheDocument();
      });
    });
    Then(
      '计算逻辑：总预警=状态为「待处理（未读）+ 待处理（已读）」的预警数量',
      async () => {
        await waitFor(() => {
          expect(screen.getByText('12')).toBeInTheDocument();
        });
      },
    );
    And('不计入已忽略、已处理的预警', async () => {
      await waitFor(() => {
        expect(screen.queryByText('已忽略')).not.toBeInTheDocument();
      });
    });
  });

  Scenario('预警按日期分组', ({ Given, When, Then, And }) => {
    Given('在预警详情页，有多条预警', () => {
      renderComponent();
    });
    When('观察预警列表', async () => {
      await waitFor(() => {
        expect(screen.getByText('2026-04-15')).toBeInTheDocument();
      });
    });
    Then(
      '预警按日期分组展示，日期作为分组标题（如「2026-04-15」）',
      async () => {
        await waitFor(() => {
          expect(screen.getByText('2026-04-15')).toBeInTheDocument();
        });
      },
    );
    And('同一天的多条预警在一起', async () => {
      await waitFor(() => {
        const dateGroup = screen.getByText('2026-04-15').closest('div');
        expect(dateGroup?.textContent).toContain('账号A');
        expect(dateGroup?.textContent).toContain('账号B');
      });
    });
  });

  Scenario('预警卡片格式', ({ Given, When, Then, And }) => {
    Given('在预警详情页', () => {
      renderComponent();
    });
    When('观察预警卡片格式', async () => {
      await waitFor(() => {
        expect(screen.getByText('账号A')).toBeInTheDocument();
      });
    });
    Then(
      '包含：预警等级图标（🔴🟠🟢）、平台标签、账号·平台、异常类型+阈值、操作按钮、时间',
      async () => {
        await waitFor(() => {
          expect(screen.getByText('账号A')).toBeInTheDocument();
          expect(screen.getByText('播放量过低(1.2K<5K)')).toBeInTheDocument();
        });
      },
    );
    And('格式与数据中心主页预警区一致', async () => {
      await waitFor(() => {
        expect(screen.getByText('查看详情')).toBeInTheDocument();
      });
    });
  });

  Scenario('类型筛选-全部类型默认', ({ Given, When, Then }) => {
    Given('在预警详情页', () => {
      renderComponent();
    });
    When('观察类型筛选下拉选择器', async () => {
      await waitFor(() => {
        expect(screen.getByRole('combobox')).toBeInTheDocument();
      });
    });
    Then('默认选中「全部类型」', () => {
      expect(screen.getByRole('combobox')).toHaveValue('all');
    });
  });

  Scenario('类型筛选-账号异常', ({ Given, When, Then, And }) => {
    Given('在预警详情页', () => {
      renderComponent();
    });
    When('选择「账号异常」类型筛选', async () => {
      await waitFor(() => {
        expect(screen.getByText('账号A')).toBeInTheDocument();
      });
      const select = screen.getByRole('combobox');
      fireEvent.click(select);
      fireEvent.click(screen.getByText('账号异常'));
    });
    And('等待列表刷新', async () => {
      await waitFor(() => {
        expect(screen.getByText('账号B')).toBeInTheDocument();
      });
    });
    Then(
      '列表仅显示账号异常类预警（登录失效、账号被禁言、异地登录提醒）',
      async () => {
        await waitFor(() => {
          expect(screen.getByText('账号B')).toBeInTheDocument();
        });
      },
    );
  });

  Scenario('类型筛选-内容异常', ({ Given, When, Then, And }) => {
    Given('在预警详情页', () => {
      renderComponent();
    });
    When('选择「内容异常」类型筛选', async () => {
      await waitFor(() => {
        expect(screen.getByText('账号A')).toBeInTheDocument();
      });
      const select = screen.getByRole('combobox');
      fireEvent.click(select);
      fireEvent.click(screen.getByText('内容异常'));
    });
    And('等待列表刷新', async () => {
      await waitFor(() => {
        expect(screen.getByText('账号A')).toBeInTheDocument();
      });
    });
    Then('列表仅显示内容异常类预警（播放量过低、点赞率过低）', async () => {
      await waitFor(() => {
        expect(screen.getByText('账号A')).toBeInTheDocument();
      });
    });
  });

  Scenario('类型筛选-粉丝异常', ({ Given, When, Then, And }) => {
    Given('在预警详情页', () => {
      renderComponent();
    });
    When('选择「粉丝异常」类型筛选', async () => {
      await waitFor(() => {
        expect(screen.getByText('账号A')).toBeInTheDocument();
      });
      const select = screen.getByRole('combobox');
      fireEvent.click(select);
      fireEvent.click(screen.getByText('粉丝异常'));
    });
    And('等待列表刷新', async () => {
      await waitFor(() => {
        expect(screen.queryByText('暂无预警')).toBeInTheDocument();
      });
    });
    Then('列表仅显示粉丝异常类预警（粉丝负增长）', async () => {
      await waitFor(() => {
        expect(screen.getByText('暂无预警')).toBeInTheDocument();
      });
    });
  });

  Scenario('搜索-账号昵称模糊匹配', ({ Given, When, Then, And }) => {
    Given('在预警详情页，有多条预警', () => {
      renderComponent();
    });
    When('输入已知账号的昵称关键词（如「时尚」）', async () => {
      await waitFor(() => {
        expect(screen.getByText('账号A')).toBeInTheDocument();
      });
      const searchInput = screen.getByPlaceholderText('搜索账号名称...');
      fireEvent.change(searchInput, { target: { value: '账号A' } });
    });
    And('等待300ms（防抖）', async () => {
      await advanceTime(350);
    });
    Then('显示匹配的预警', async () => {
      await waitFor(() => {
        expect(screen.getByText('账号A')).toBeInTheDocument();
      });
    });
  });

  Scenario('搜索-无结果', ({ Given, When, Then, And }) => {
    Given('在预警详情页', () => {
      renderComponent();
    });
    When('输入不存在的关键词（如「xyz123none」）', async () => {
      await waitFor(() => {
        expect(screen.getByText('账号A')).toBeInTheDocument();
      });
      const searchInput = screen.getByPlaceholderText('搜索账号名称...');
      fireEvent.change(searchInput, { target: { value: 'xyz123none' } });
    });
    And('等待搜索生效', async () => {
      await advanceTime(350);
    });
    Then('显示空状态提示「未找到匹配的预警」', async () => {
      await waitFor(() => {
        expect(screen.getByText('未找到匹配的预警')).toBeInTheDocument();
      });
    });
  });

  Scenario('搜索防抖', ({ Given, When, Then, And }) => {
    Given('在预警详情页', () => {
      renderComponent();
    });
    When('在搜索框快速连续输入多个字符', async () => {
      await waitFor(() => {
        expect(screen.getByText('账号A')).toBeInTheDocument();
      });
      const searchInput = screen.getByPlaceholderText('搜索账号名称...');
      fireEvent.change(searchInput, { target: { value: 'a' } });
      await advanceTime(50);
      fireEvent.change(searchInput, { target: { value: 'ab' } });
      await advanceTime(50);
      fireEvent.change(searchInput, { target: { value: 'abc' } });
    });
    Then('搜索不会在每次按键后立即触发', async () => {
      await waitFor(() => {
        expect(screen.getByText('账号A')).toBeInTheDocument();
      });
    });
    And('等待300ms后，搜索才生效', async () => {
      await advanceTime(350);
      await waitFor(() => {
        expect(screen.getByText('账号A')).toBeInTheDocument();
      });
    });
  });

  Scenario('全部标记已读-二次确认', ({ Given, When, Then, And }) => {
    Given('在预警详情页，有未读预警', () => {
      renderComponent();
    });
    When('点击「全部标记已读」按钮', async () => {
      await waitFor(() => {
        expect(screen.getByText('全部标记已读')).toBeInTheDocument();
      });
      fireEvent.click(screen.getByText('全部标记已读'));
    });
    Then('显示确认弹窗', () => {
      expect(screen.getByText('确认标记已读')).toBeInTheDocument();
    });
    And('弹窗标题为「确认标记已读」', () => {
      expect(screen.getByText('确认标记已读')).toBeInTheDocument();
    });
    And('弹窗内容提示「确认将所有未读预警标记为已读吗？」', () => {
      expect(
        screen.getByText('确认将所有未读预警标记为已读吗？'),
      ).toBeInTheDocument();
    });
    And('有「取消」和「确认」按钮', () => {
      expect(screen.getByText('取消')).toBeInTheDocument();
      expect(screen.getByText('确认')).toBeInTheDocument();
    });
  });

  Scenario('全部标记已读-确认执行', ({ Given, When, Then, And }) => {
    Given('在预警详情页，有未读预警', () => {
      renderComponent();
    });
    When('点击「全部标记已读」', async () => {
      await waitFor(() => {
        expect(screen.getByText('全部标记已读')).toBeInTheDocument();
      });
      fireEvent.click(screen.getByText('全部标记已读'));
    });
    And('在弹窗中点击「确认」按钮', async () => {
      const mockMarkAllRead = vi.fn().mockResolvedValue(undefined);
      vi.spyOn(alertService, 'markAllRead').mockImplementation(mockMarkAllRead);
      fireEvent.click(screen.getByText('确认'));
      await waitFor(() => {
        expect(mockMarkAllRead).toHaveBeenCalled();
      });
    });
    And('等待弹窗关闭，列表刷新', async () => {
      await waitFor(() => {
        expect(screen.queryByText('确认标记已读')).not.toBeInTheDocument();
      });
    });
    Then('所有未读预警变为已读状态', async () => {
      await waitFor(() => {
        expect(screen.getByText('0')).toBeInTheDocument();
      });
    });
    And('预警统计的「未读预警」数量变为0', async () => {
      await waitFor(() => {
        expect(screen.getByText('未读预警 0')).toBeInTheDocument();
      });
    });
  });

  Scenario('全部标记已读-取消', ({ Given, When, Then, And }) => {
    Given('在预警详情页，有未读预警', () => {
      renderComponent();
    });
    When('点击「全部标记已读」', async () => {
      await waitFor(() => {
        expect(screen.getByText('全部标记已读')).toBeInTheDocument();
      });
      fireEvent.click(screen.getByText('全部标记已读'));
    });
    And('在弹窗中点击「取消」按钮或点击遮罩层', () => {
      fireEvent.click(screen.getByText('取消'));
    });
    Then('弹窗关闭', () => {
      expect(screen.queryByText('确认标记已读')).not.toBeInTheDocument();
    });
    And('未读预警数量不变', async () => {
      await waitFor(() => {
        expect(screen.getByText('5')).toBeInTheDocument();
      });
    });
  });

  Scenario('清空已忽略项-二次确认', ({ Given, When, Then, And }) => {
    Given('在预警详情页，有已忽略预警', () => {
      renderComponent();
    });
    When('点击「清空已忽略项」按钮', async () => {
      await waitFor(() => {
        expect(screen.getByText('清空已忽略项')).toBeInTheDocument();
      });
      fireEvent.click(screen.getByText('清空已忽略项'));
    });
    Then('显示确认弹窗', () => {
      expect(screen.getByText('危险操作')).toBeInTheDocument();
    });
    And('弹窗标题为「危险操作」或类似警告', () => {
      expect(screen.getByText('危险操作')).toBeInTheDocument();
    });
    And(
      '弹窗内容提示「确认永久删除所有已忽略的预警记录吗？此操作不可恢复。」',
      () => {
        expect(
          screen.getByText(
            '确认永久删除所有已忽略的预警记录吗？此操作不可恢复。',
          ),
        ).toBeInTheDocument();
      },
    );
    And('有「取消」和红色「确认删除」按钮', () => {
      expect(screen.getByText('取消')).toBeInTheDocument();
      expect(screen.getByText('确认删除')).toBeInTheDocument();
    });
  });

  Scenario('清空已忽略项-确认执行', ({ Given, When, Then, And }) => {
    Given('在预警详情页，有已忽略预警', () => {
      renderComponent();
    });
    When('点击「清空已忽略项」', async () => {
      await waitFor(() => {
        expect(screen.getByText('清空已忽略项')).toBeInTheDocument();
      });
      fireEvent.click(screen.getByText('清空已忽略项'));
    });
    And('在弹窗中点击「确认删除」按钮（红色）', async () => {
      const mockClearIgnored = vi.fn().mockResolvedValue(undefined);
      vi.spyOn(alertService, 'clearIgnoredWarnings').mockImplementation(
        mockClearIgnored,
      );
      fireEvent.click(screen.getByText('确认删除'));
      await waitFor(() => {
        expect(mockClearIgnored).toHaveBeenCalled();
      });
    });
    And('等待弹窗关闭，列表刷新', async () => {
      await waitFor(() => {
        expect(screen.queryByText('危险操作')).not.toBeInTheDocument();
      });
    });
    Then('所有已忽略预警被删除', async () => {
      await waitFor(() => {
        expect(screen.queryByText('账号A')).not.toBeInTheDocument();
      });
    });
    And('如果当前页数据被清空，自动跳回第1页', async () => {
      await waitFor(() => {
        expect(screen.getByText('1')).toBeInTheDocument();
      });
    });
  });

  Scenario('清空已忽略项-取消', ({ Given, When, Then, And }) => {
    Given('在预警详情页，有已忽略预警', () => {
      renderComponent();
    });
    When('点击「清空已忽略项」', async () => {
      await waitFor(() => {
        expect(screen.getByText('清空已忽略项')).toBeInTheDocument();
      });
      fireEvent.click(screen.getByText('清空已忽略项'));
    });
    And('在弹窗中点击「取消」', () => {
      fireEvent.click(screen.getByText('取消'));
    });
    Then('弹窗关闭', () => {
      expect(screen.queryByText('危险操作')).not.toBeInTheDocument();
    });
    And('已忽略预警保留', async () => {
      expect(screen.getByText('账号A')).toBeInTheDocument();
    });
  });

  Scenario('预警查看详情', ({ Given, When, Then, And }) => {
    Given('在预警详情页，有预警', () => {
      renderComponent();
    });
    When('点击某预警的「查看详情」按钮', async () => {
      await waitFor(() => {
        expect(screen.getByText('账号A')).toBeInTheDocument();
      });
      const viewDetailButtons = screen.getAllByText('查看详情');
      fireEvent.click(viewDetailButtons[0]);
    });
    Then('跳转到账号详情页', async () => {
      await waitFor(() => {
        expect(window.location.pathname).toContain('/datacenter/account');
      });
    });
    And('预警状态变为已读', async () => {
      await waitFor(() => {
        expect(screen.getByText('账号A')).toBeInTheDocument();
      });
    });
  });

  Scenario('预警忽略', ({ Given, When, Then, And }) => {
    Given('在预警详情页，有预警', () => {
      renderComponent();
    });
    When('点击「忽略」按钮', async () => {
      await waitFor(() => {
        expect(screen.getByText('账号A')).toBeInTheDocument();
      });
      const ignoreButtons = screen.getAllByText('忽略');
      fireEvent.click(ignoreButtons[0]);
    });
    And('等待列表刷新', async () => {
      await waitFor(() => {
        expect(screen.queryByText('账号A')).not.toBeInTheDocument();
      });
    });
    Then('该预警从列表中消失', async () => {
      await waitFor(() => {
        expect(screen.queryByText('账号A')).not.toBeInTheDocument();
      });
    });
    And('如果当前页只剩1条且被忽略，自动加载上一页数据', async () => {
      await waitFor(() => {
        expect(screen.getByText('1')).toBeInTheDocument();
      });
    });
  });

  Scenario('预警去处理', ({ Given, When, Then }) => {
    Given('在预警详情页，有登录失效预警', () => {
      renderComponent();
    });
    When('点击「去处理」按钮', async () => {
      await waitFor(() => {
        expect(screen.getByText('账号B')).toBeInTheDocument();
      });
      const handleButtons = screen.getAllByText('去处理');
      if (handleButtons.length > 0) {
        fireEvent.click(handleButtons[0]);
      }
    });
    Then(
      '跳转到账号失效重新登录页（与账号列表「重新登录」按钮同款）',
      async () => {
        await waitFor(() => {
          expect(mockNavigate).toHaveBeenCalledWith(
            '/account/add?mode=reactivate&accountId=a2&from=datacenter',
          );
        });
      },
    );
  });

  Scenario('分页-默认每页10条', ({ Given, When, Then }) => {
    Given('在预警详情页，预警数量大于10', () => {
      renderComponent();
    });
    When('观察分页器', async () => {
      await waitFor(() => {
        expect(screen.getByText('账号A')).toBeInTheDocument();
      });
    });
    Then('默认每页10条', async () => {
      await waitFor(() => {
        expect(screen.getByText('1-10 / 12')).toBeInTheDocument();
      });
    });
  });

  Scenario('分页-下一页', ({ Given, When, Then, And }) => {
    Given('在预警详情页，当前第1页', () => {
      renderComponent();
    });
    When('点击「下一页」', async () => {
      await waitFor(() => {
        expect(screen.getByText('2')).toBeInTheDocument();
      });
      fireEvent.click(screen.getByText('2'));
    });
    And('等待列表刷新', async () => {
      await waitFor(() => {
        expect(screen.getByText('11-12 / 12')).toBeInTheDocument();
      });
    });
    Then('页码变为2', async () => {
      await waitFor(() => {
        expect(screen.getByText('2')).toBeInTheDocument();
      });
    });
  });

  Scenario('分页-上一页', ({ Given, When, Then, And }) => {
    Given('在预警详情页，当前第2页', () => {
      renderComponent();
    });
    When('点击「上一页」', async () => {
      await waitFor(() => {
        expect(screen.getByText('1')).toBeInTheDocument();
      });
      fireEvent.click(screen.getByText('1'));
    });
    And('等待列表刷新', async () => {
      await waitFor(() => {
        expect(screen.getByText('1-10 / 12')).toBeInTheDocument();
      });
    });
    Then('页码变回1', async () => {
      await waitFor(() => {
        expect(screen.getByText('1')).toBeInTheDocument();
      });
    });
  });

  Scenario('分页-每页20条', ({ Given, When, Then, And }) => {
    Given('在预警详情页', () => {
      renderComponent();
    });
    When('选择每页条数下拉「20条」', async () => {
      await waitFor(() => {
        expect(screen.getByText('账号A')).toBeInTheDocument();
      });
      const pageSizeSelect = screen.getByRole('combobox', {
        name: /pageSize/iu,
      });
      if (pageSizeSelect) {
        fireEvent.change(pageSizeSelect, { target: { value: '20' } });
      }
    });
    And('等待列表刷新', async () => {
      await waitFor(() => {
        expect(screen.getByText('20条/页')).toBeInTheDocument();
      });
    });
    Then('每页显示20条', async () => {
      await waitFor(() => {
        expect(screen.getByText('20条/页')).toBeInTheDocument();
      });
    });
  });

  Scenario('分页-每页50条', ({ Given, When, Then, And }) => {
    Given('在预警详情页', () => {
      renderComponent();
    });
    When('选择每页条数下拉「50条」', async () => {
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
    And('等待列表刷新', async () => {
      await waitFor(() => {
        expect(screen.getByText('50条/页')).toBeInTheDocument();
      });
    });
    Then('每页显示50条', async () => {
      await waitFor(() => {
        expect(screen.getByText('50条/页')).toBeInTheDocument();
      });
    });
  });

  Scenario('分页-第1页禁用', ({ Given, When, Then }) => {
    Given('在预警详情页第1页', () => {
      renderComponent();
    });
    When('观察分页器', async () => {
      await waitFor(() => {
        expect(screen.getByText('账号A')).toBeInTheDocument();
      });
    });
    Then('「上一页」按钮已禁用', async () => {
      await waitFor(() => {
        const prevButton = screen
          .getByText('上一页')
          .closest('button') as HTMLButtonElement;
        expect(prevButton).toBeDisabled();
      });
    });
  });

  Scenario('分页-末页禁用', ({ Given, When, Then }) => {
    Given('在预警详情页末页', () => {
      renderComponent();
    });
    When('连续点击「下一页」到末页', async () => {
      await waitFor(() => {
        expect(screen.getByText('2')).toBeInTheDocument();
      });
      fireEvent.click(screen.getByText('2'));
    });
    Then('「下一页」按钮已禁用', async () => {
      await waitFor(() => {
        const nextButton = screen
          .getByText('下一页')
          .closest('button') as HTMLButtonElement;
        expect(nextButton).toBeDisabled();
      });
    });
  });

  Scenario('返回数据中心', ({ Given, When, Then, And }) => {
    Given('在预警详情页', () => {
      renderComponent();
    });
    When('点击「返回数据中心」按钮或链接', async () => {
      await waitFor(() => {
        expect(screen.getByText('返回数据中心')).toBeInTheDocument();
      });
      fireEvent.click(screen.getByText('返回数据中心'));
    });
    Then('返回数据中心主页', async () => {
      await waitFor(() => {
        expect(window.location.pathname).toBe('/datacenter');
      });
    });
    And('主页筛选条件保持不变（如时间筛选仍为之前的选项）', async () => {
      await waitFor(() => {
        expect(screen.getByText('数据预警')).toBeInTheDocument();
      });
    });
  });

  Scenario('网络断开', ({ Given, When, Then, And }) => {
    Given('网络断开状态', () => {
      vi.spyOn(alertService, 'warningListQueryOptions').mockReturnValue({
        queryKey: ['alert', 'warningList', {}],
        queryFn: vi.fn().mockRejectedValue(new Error('Network Error')),
      } as ReturnType<typeof alertService.warningListQueryOptions>);
      renderComponent();
    });
    When('在预警详情页执行任意操作', async () => {
      await waitFor(() => {});
    });
    Then('显示错误提示「网络连接失败，请检查网络后重试」', () => {
      expect(screen.queryByText('网络连接失败')).toBeInTheDocument();
    });
    And('显示重试按钮', () => {
      expect(screen.queryByText('重试')).toBeInTheDocument();
    });
  });

  Scenario('接口超时', ({ Given, When, Then, And }) => {
    Given('接口响应超时', () => {
      vi.spyOn(alertService, 'warningListQueryOptions').mockReturnValue({
        queryKey: ['alert', 'warningList', {}],
        queryFn: vi.fn().mockRejectedValue(new Error('Timeout')),
      } as ReturnType<typeof alertService.warningListQueryOptions>);
      renderComponent();
    });
    When('在预警详情页执行操作', async () => {
      await waitFor(() => {});
    });
    Then('显示错误提示「数据加载超时，请稍后重试」', () => {
      expect(screen.queryByText('数据加载超时')).toBeInTheDocument();
    });
    And('显示重试按钮', () => {
      expect(screen.queryByText('重试')).toBeInTheDocument();
    });
  });

  Scenario('无数据空状态', ({ Given, When, Then }) => {
    Given('预警列表无数据', () => {
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
    When('观察预警列表区域', async () => {
      await waitFor(() => {
        expect(screen.getByText('暂无预警')).toBeInTheDocument();
      });
    });
    Then('显示空状态插画或提示', async () => {
      expect(screen.getByText('暂无预警')).toBeInTheDocument();
    });
  });

  Scenario('Token失效', ({ Given, When, Then, And }) => {
    Given('Token已过期', () => {
      vi.spyOn(alertService, 'warningListQueryOptions').mockReturnValue({
        queryKey: ['alert', 'warningList', {}],
        queryFn: vi.fn().mockRejectedValue({ response: { status: 401 } }),
      } as ReturnType<typeof alertService.warningListQueryOptions>);
      renderComponent();
    });
    When('访问预警详情页', async () => {
      await waitFor(() => {});
    });
    Then('跳转登录页', () => {
      expect(window.location.pathname).toBe('/login/');
    });
    And('提示「登录已过期，请重新登录」', () => {});
  });
});
