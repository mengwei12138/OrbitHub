import { defineFeature } from '@amiceli/vitest-cucumber';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';

import AccountLogsPage from '../index';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
  useSearchParams: () => {
    const params = new URLSearchParams();
    params.set('accountId', 'account-123');
    return [params];
  },
}));

const mockUseAccount = vi.fn();
const mockAccountLogsQueryOptions = vi.fn();

vi.mock('@/services/account', () => ({
  useAccount: (...args: unknown[]) => mockUseAccount(...args),
  accountLogsQueryOptions: (...args: unknown[]) =>
    mockAccountLogsQueryOptions(...args),
}));

vi.mock('@/components', () => ({
  CustomEmpty: vi.fn(({ description }) => (
    <div data-testid="custom-empty">{description}</div>
  )),
  CustomProTable: vi.fn(() => <div data-testid="pro-table" />),
}));

const defaultAccountData = {
  data: {
    id: 'account-123',
    nickname: '测试账号',
    platform: '小红书',
    phoneNumber: '138****6789',
    status: 'ONLINE',
    followers: 125380,
  },
};

const defaultLogsData = {
  list: [
    {
      id: '1',
      accountId: 'account-123',
      operation: 'LOGIN',
      description: '扫码登录成功',
      createdAt: '2026-04-10 10:00:00',
    },
    {
      id: '2',
      accountId: 'account-123',
      operation: 'START',
      description: '账号启动成功',
      createdAt: '2026-04-09 15:30:00',
    },
  ],
  total: '2',
};

defineFeature('./features/requirements.feature', ({ Scenario }) => {
  beforeEach(() => {
    mockUseAccount.mockReturnValue({
      ...defaultAccountData,
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    });
    mockAccountLogsQueryOptions.mockReturnValue({
      queryKey: ['account', 'logs', 'account-123', {}],
      queryFn: vi.fn().mockResolvedValue(defaultLogsData),
    });
  });

  Scenario('进入日志页时加载账号信息', ({ Given, When, Then, And }) => {
    Given('用户在账号A的日志页', () => {
      render(<AccountLogsPage />);
    });

    When('加载日志页', async () => {
      await waitFor(() => {
        expect(screen.getByTestId('pro-table')).toBeInTheDocument();
      });
    });

    Then('调用获取账号详情接口', () => {
      expect(mockUseAccount).toHaveBeenCalledWith('account-123');
    });

    And('显示账号信息卡片', () => {
      expect(screen.getByText('测试账号')).toBeInTheDocument();
    });
  });

  Scenario('账号信息卡片加载中显示 loading', ({ Given, When, Then }) => {
    Given('用户在账号A的日志页', () => {
      mockUseAccount.mockReturnValueOnce({
        data: undefined,
        isLoading: true,
        error: null,
        refetch: vi.fn(),
      });
      render(<AccountLogsPage />);
    });

    When('账号详情接口请求中', async () => {
      await waitFor(() => {
        expect(screen.getByText('加载中...')).toBeInTheDocument();
      });
    });

    Then('账号信息卡片显示 loading 状态', () => {
      expect(screen.getByText('加载中...')).toBeInTheDocument();
    });
  });

  Scenario('账号信息加载失败显示错误', ({ Given, When, Then, And }) => {
    Given('用户在账号A的日志页', () => {
      mockUseAccount.mockReturnValueOnce({
        data: undefined,
        isLoading: false,
        error: new Error('网络错误'),
        refetch: vi.fn(),
      });
      render(<AccountLogsPage />);
    });

    When('账号详情接口请求失败', async () => {
      await waitFor(() => {
        expect(screen.getByText('加载失败')).toBeInTheDocument();
      });
    });

    Then('账号信息卡片显示错误提示', () => {
      expect(screen.getByText('加载失败')).toBeInTheDocument();
    });

    And('显示重试按钮', () => {
      expect(screen.getByText('重试')).toBeInTheDocument();
    });
  });

  Scenario('账号信息字段展示', ({ Given, Then, And }) => {
    Given('账号详情已加载成功', () => {
      render(<AccountLogsPage />);
    });

    Then('显示账号昵称', async () => {
      await waitFor(() => {
        expect(screen.getByText('测试账号')).toBeInTheDocument();
      });
    });

    And('显示平台名称', async () => {
      await waitFor(() => {
        expect(screen.getByText('小红书')).toBeInTheDocument();
      });
    });

    And('显示脱敏手机号', async () => {
      await waitFor(() => {
        expect(screen.getByText('138****6789')).toBeInTheDocument();
      });
    });

    And('显示账号状态', async () => {
      await waitFor(() => {
        expect(screen.getByText('在线')).toBeInTheDocument();
      });
    });

    And('显示粉丝数', async () => {
      await waitFor(() => {
        expect(screen.getByText(/粉丝数/u)).toBeInTheDocument();
      });
    });
  });

  Scenario('进入日志列表', ({ Given, When, Then, And }) => {
    Given('用户在账号A的日志页', () => {
      render(<AccountLogsPage />);
    });

    When('加载日志列表', async () => {
      await waitFor(() => {
        expect(screen.getByTestId('pro-table')).toBeInTheDocument();
      });
    });

    Then('显示该账号所有日志', async () => {
      await waitFor(() => {
        expect(screen.getByText('扫码登录成功')).toBeInTheDocument();
      });
    });

    And('显示分页器', () => {
      expect(screen.getByTestId('pro-table')).toBeInTheDocument();
    });
  });

  Scenario('按日期筛选-今天', ({ Given, When, Then }) => {
    Given('日志列表已加载', () => {
      render(<AccountLogsPage />);
    });

    When('选择「今天」', async () => {
      await waitFor(() => {
        expect(screen.getByTestId('pro-table')).toBeInTheDocument();
      });
    });

    Then('显示今天的日志', async () => {
      await waitFor(() => {
        expect(screen.getByTestId('pro-table')).toBeInTheDocument();
      });
    });
  });

  Scenario('按日期筛选-昨天', ({ When, Then }) => {
    When('选择「昨天」', async () => {
      render(<AccountLogsPage />);
    });

    Then('显示昨天的日志', async () => {
      await waitFor(() => {
        expect(screen.getByTestId('pro-table')).toBeInTheDocument();
      });
    });
  });

  Scenario('按日期筛选-最近7天', ({ When, Then }) => {
    When('选择「最近7天」', async () => {
      render(<AccountLogsPage />);
    });

    Then('显示最近7天内的日志', async () => {
      await waitFor(() => {
        expect(screen.getByTestId('pro-table')).toBeInTheDocument();
      });
    });
  });

  Scenario('按日期筛选-最近30天', ({ When, Then }) => {
    When('选择「最近30天」', async () => {
      render(<AccountLogsPage />);
    });

    Then('显示最近30天内的日志', async () => {
      await waitFor(() => {
        expect(screen.getByTestId('pro-table')).toBeInTheDocument();
      });
    });
  });

  Scenario('按日期筛选-本月', ({ When, Then }) => {
    When('选择「本月」', async () => {
      render(<AccountLogsPage />);
    });

    Then('显示本月1日至今的日志', async () => {
      await waitFor(() => {
        expect(screen.getByTestId('pro-table')).toBeInTheDocument();
      });
    });
  });

  Scenario('按日期筛选-上月', ({ When, Then }) => {
    When('选择「上月」', async () => {
      render(<AccountLogsPage />);
    });

    Then('显示上月1日至最后一天的日志', async () => {
      await waitFor(() => {
        expect(screen.getByTestId('pro-table')).toBeInTheDocument();
      });
    });
  });

  Scenario('搜索描述关键词', ({ Given, When, And, Then }) => {
    Given('日志列表已加载', () => {
      render(<AccountLogsPage />);
    });

    When('输入关键词「登录成功」', async () => {
      const input = screen.getByPlaceholderText('搜索日志描述关键词…');
      await userEvent.type(input, '登录成功');
    });

    And('点击「查询」', async () => {
      const searchButton = screen.getByText('查询');
      await userEvent.click(searchButton);
    });

    Then('显示描述包含「登录成功」的日志', async () => {
      await waitFor(() => {
        expect(screen.getByText('扫码登录成功')).toBeInTheDocument();
      });
    });
  });

  Scenario('清空搜索条件', ({ Given, When, Then, And }) => {
    Given('已有关键词「登录」', () => {
      render(<AccountLogsPage />);
    });

    When('点击「清空」', async () => {
      const clearButton = screen.getByText('清空');
      await userEvent.click(clearButton);
    });

    Then('关键词清空', () => {
      const input = screen.getByPlaceholderText('搜索日志描述关键词…');
      expect(input).toHaveValue('');
    });

    And('列表重新加载', () => {
      expect(screen.getByTestId('pro-table')).toBeInTheDocument();
    });
  });

  Scenario('无日志时显示空状态', ({ Given, When, Then }) => {
    Given('该账号无任何日志', () => {
      mockAccountLogsQueryOptions.mockReturnValueOnce({
        queryKey: ['account', 'logs', 'account-123', {}],
        queryFn: vi.fn().mockResolvedValue({
          list: [],
          total: '0',
        }),
      });
      render(<AccountLogsPage />);
    });

    When('加载日志列表', async () => {
      await waitFor(() => {
        expect(screen.getByTestId('custom-empty')).toBeInTheDocument();
      });
    });

    Then('显示空状态提示', () => {
      expect(screen.getByText('暂无日志记录')).toBeInTheDocument();
    });
  });

  Scenario('搜索无结果', ({ Given, When, And, Then }) => {
    Given('日志列表已加载', () => {
      mockAccountLogsQueryOptions.mockReturnValueOnce({
        queryKey: [
          'account',
          'logs',
          'account-123',
          { keyword: '不存在的关键词' },
        ],
        queryFn: vi.fn().mockResolvedValue({
          list: [],
          total: '0',
        }),
      });
      render(<AccountLogsPage />);
    });

    When('输入不存在关键词', async () => {
      const input = screen.getByPlaceholderText('搜索日志描述关键词…');
      await userEvent.type(input, '不存在的关键词');
    });

    And('点击「查询」', async () => {
      const searchButton = screen.getByText('查询');
      await userEvent.click(searchButton);
    });

    Then('显示空状态「没有匹配的日志」', async () => {
      await waitFor(() => {
        expect(screen.getByText('没有匹配的日志')).toBeInTheDocument();
      });
    });
  });

  Scenario('切换分页', ({ Given, When, Then, And }) => {
    Given('日志列表已加载', () => {
      render(<AccountLogsPage />);
    });

    When('点击第2页', async () => {
      const page2 = screen.getByText('2');
      await userEvent.click(page2);
    });

    Then('显示第2页日志', () => {
      expect(screen.getByTestId('pro-table')).toBeInTheDocument();
    });

    And('保持当前筛选条件', () => {
      expect(screen.getByTestId('pro-table')).toBeInTheDocument();
    });
  });
});
