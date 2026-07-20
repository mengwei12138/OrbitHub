import { defineFeature } from '@amiceli/vitest-cucumber';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { accountLogsQueryOptions, useAccount } from '@/services/account';

import AccountLogsPage from '../index';

vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn(),
  useSearchParams: () => {
    const params = new URLSearchParams();
    params.set('accountId', '123');
    return [params];
  },
}));

vi.mock('@/services/account', () => ({
  useAccount: vi.fn(),
  accountLogsQueryOptions: vi.fn(),
}));

const mockAccount = {
  id: '123',
  platform: 'xiaohongshu',
  nickname: '测试账号',
  phoneNumber: '13800138000',
  status: 'ONLINE',
  followers: 1000,
};

const mockLogs = [
  {
    id: '1',
    accountId: '123',
    operation: 'LOGIN',
    description: '账号登录成功',
    createdAt: '2024-01-15T10:00:00Z',
  },
  {
    id: '2',
    accountId: '123',
    operation: 'START',
    description: '账号启动',
    createdAt: '2024-01-15T11:00:00Z',
  },
  {
    id: '3',
    accountId: '123',
    operation: 'STOP',
    description: '账号停止',
    createdAt: '2024-01-15T12:00:00Z',
  },
];

defineFeature('./features/test.feature', ({ Scenario }) => {
  Scenario('日志列表默认展示', ({ Given, When, Then }) => {
    Given('用户进入某账号日志页', async () => {
      vi.mocked(useAccount).mockReturnValue({
        data: mockAccount,
        isLoading: false,
      } as unknown as ReturnType<typeof useAccount>);
    });

    When('观察默认日志列表', async () => {
      vi.mocked(accountLogsQueryOptions).mockReturnValue({
        queryKey: ['accountLogs', '123'],
        queryFn: vi.fn(),
      } as unknown as ReturnType<typeof accountLogsQueryOptions>);
      render(<AccountLogsPage />);
    });

    Then('展示该账号操作日志（时间/类型/描述列）', async () => {
      await waitFor(() => {
        expect(screen.getByText('账号登录成功')).toBeInTheDocument();
        expect(screen.getByText('账号启动')).toBeInTheDocument();
        expect(screen.getByText('账号停止')).toBeInTheDocument();
      });
    });
  });

  Scenario('日志列表-日期筛选-自定义范围', ({ Given, When, Then, And }) => {
    Given('用户在日志页', async () => {
      vi.mocked(useAccount).mockReturnValue({
        data: mockAccount,
        isLoading: false,
      } as unknown as ReturnType<typeof useAccount>);
    });

    When('设置开始日期和结束日期', async () => {
      render(<AccountLogsPage />);
    });

    And('点击「查询」', async () => {
      const searchButton = screen.getByText('查询');
      fireEvent.click(searchButton);
    });

    Then('仅展示日期范围内的日志', async () => {
      await waitFor(() => {
        expect(accountLogsQueryOptions).toHaveBeenCalledWith(
          '123',
          expect.objectContaining({
            startDate: expect.any(String),
            endDate: expect.any(String),
          }),
        );
      });
    });
  });

  Scenario('日志列表-描述搜索-有结果', ({ Given, When, Then, And }) => {
    Given('日志页有日志', async () => {
      vi.mocked(useAccount).mockReturnValue({
        data: mockAccount,
        isLoading: false,
      } as unknown as ReturnType<typeof useAccount>);
      vi.mocked(accountLogsQueryOptions).mockReturnValue({
        queryKey: ['accountLogs', '123'],
        queryFn: vi.fn(),
        data: { list: mockLogs, total: 3 },
      } as unknown as ReturnType<typeof accountLogsQueryOptions>);
    });

    When('输入描述关键词「登录」', async () => {
      render(<AccountLogsPage />);
      const keywordInput = screen.getByPlaceholderText('搜索日志描述关键词…');
      fireEvent.change(keywordInput, { target: { value: '登录' } });
    });

    And('点击「查询」', async () => {
      const searchButton = screen.getByText('查询');
      fireEvent.click(searchButton);
    });

    Then('展示描述中含「登录」的日志', async () => {
      await waitFor(() => {
        expect(screen.getByText('账号登录成功')).toBeInTheDocument();
      });
    });
  });

  Scenario('日志列表-描述搜索-无结果', ({ Given, When, Then, And }) => {
    Given('日志页有日志', async () => {
      vi.mocked(useAccount).mockReturnValue({
        data: mockAccount,
        isLoading: false,
      } as unknown as ReturnType<typeof useAccount>);
      vi.mocked(accountLogsQueryOptions).mockReturnValue({
        queryKey: ['accountLogs', '123'],
        queryFn: vi.fn(),
        data: { list: [], total: 0 },
      } as unknown as ReturnType<typeof accountLogsQueryOptions>);
    });

    When('输入不存在关键词', async () => {
      render(<AccountLogsPage />);
      const keywordInput = screen.getByPlaceholderText('搜索日志描述关键词…');
      fireEvent.change(keywordInput, {
        target: { value: '不存在的关键词XYZ' },
      });
    });

    And('点击「查询」', async () => {
      const searchButton = screen.getByText('查询');
      fireEvent.click(searchButton);
    });

    Then('提示无匹配记录', async () => {
      await waitFor(() => {
        expect(screen.getByText('暂无日志记录')).toBeInTheDocument();
      });
    });
  });

  Scenario('日志列表-清空搜索', ({ Given, When, Then, And }) => {
    Given('已有关键词搜索结果', async () => {
      vi.mocked(useAccount).mockReturnValue({
        data: mockAccount,
        isLoading: false,
      } as unknown as ReturnType<typeof useAccount>);
    });

    When('点击「清空」', async () => {
      render(<AccountLogsPage />);
      const clearButton = screen.getByText('清空');
      fireEvent.click(clearButton);
    });

    Then('关键词清空', async () => {
      await waitFor(() => {
        const keywordInput = screen.getByPlaceholderText(
          '搜索日志描述关键词…',
        ) as HTMLInputElement;
        expect(keywordInput.value).toBe('');
      });
    });

    And('列表刷新', async () => {
      expect(accountLogsQueryOptions).toHaveBeenCalled();
    });
  });

  Scenario('日志列表-分页', ({ Given, When, Then, And }) => {
    Given('日志列表有多页', async () => {
      vi.mocked(useAccount).mockReturnValue({
        data: mockAccount,
        isLoading: false,
      } as unknown as ReturnType<typeof useAccount>);
      vi.mocked(accountLogsQueryOptions).mockReturnValue({
        queryKey: ['accountLogs', '123'],
        queryFn: vi.fn(),
        data: { list: mockLogs, total: 100 },
      } as unknown as ReturnType<typeof accountLogsQueryOptions>);
    });

    When('切换页码或每页条数', async () => {
      render(<AccountLogsPage />);
      const pageSizeSelect = screen.getByText('20条/页');
      fireEvent.click(pageSizeSelect);
    });

    Then('列表刷新', async () => {
      await waitFor(() => {
        expect(accountLogsQueryOptions).toHaveBeenCalled();
      });
    });

    And('分页信息更新', async () => {
      expect(screen.getByText('1')).toBeInTheDocument();
    });
  });

  Scenario('日志为空展示空态', ({ Given, When, Then }) => {
    Given('账号无日志', async () => {
      vi.mocked(useAccount).mockReturnValue({
        data: mockAccount,
        isLoading: false,
      } as unknown as ReturnType<typeof useAccount>);
      vi.mocked(accountLogsQueryOptions).mockReturnValue({
        queryKey: ['accountLogs', '123'],
        queryFn: vi.fn(),
        data: { list: [], total: 0 },
      } as unknown as ReturnType<typeof accountLogsQueryOptions>);
    });

    When('进入该账号日志页', async () => {
      render(<AccountLogsPage />);
    });

    Then('展示空态提示，如「暂无日志记录」', async () => {
      await waitFor(() => {
        expect(screen.getByText('暂无日志记录')).toBeInTheDocument();
      });
    });
  });
});
