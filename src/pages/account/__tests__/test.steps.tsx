import { defineFeature } from '@amiceli/vitest-cucumber';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import {
  accountRunStatusCanDelete,
  useAccountList,
  useBatchDeleteAccounts,
  useBatchStartAccounts,
  useBatchStopAccounts,
  useDeleteAccount,
  useStartAccount,
  useStopAccount,
} from '@/services/account';

import Account from '../index';

vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn(),
}));

vi.mock('@/hooks', () => ({
  useBreadcrumb: () => ({
    setBreadcrumb: vi.fn(),
  }),
}));

vi.mock('@/services/account', () => ({
  useAccountList: vi.fn(),
  useStartAccount: () => ({
    mutate: vi.fn(),
  }),
  useStopAccount: () => ({
    mutate: vi.fn(),
  }),
  useDeleteAccount: () => ({
    mutate: vi.fn(),
  }),
  useBatchStartAccounts: () => ({
    mutate: vi.fn(),
  }),
  useBatchStopAccounts: () => ({
    mutate: vi.fn(),
  }),
  useBatchDeleteAccounts: () => ({
    mutate: vi.fn(),
  }),
  ACCOUNT_RUN_STATUS: {
    ONLINE: 'ONLINE',
    STOPPED: 'STOPPED',
    EXPIRED: 'EXPIRED',
  },
  accountRunStatusCanDelete: vi.fn((status: string) => status === 'STOPPED'),
}));

const mockMessage = {
  success: vi.fn(),
  error: vi.fn(),
  warning: vi.fn(),
};

vi.mock('antd', async () => {
  const actual = await vi.importActual('antd');
  return {
    ...actual,
    message: mockMessage,
  };
});

const mockAccountList = [
  {
    id: '1',
    platform: 'xiaohongshu',
    nickname: '测试账号A',
    phoneNumber: '13800138000',
    status: 'ONLINE',
    followers: 1000,
  },
  {
    id: '2',
    platform: 'douyin',
    nickname: '测试账号B',
    phoneNumber: '13800138001',
    status: 'STOPPED',
    followers: 2000,
  },
  {
    id: '3',
    platform: 'xiaohongshu',
    nickname: '测试账号C',
    phoneNumber: '13800138002',
    status: 'ONLINE',
    followers: 3000,
  },
];

defineFeature('./features/test.feature', ({ Scenario }) => {
  Scenario('账号列表默认展示', ({ Given, When, Then }) => {
    Given('用户已登录', async () => {
      vi.mocked(useAccountList).mockReturnValue({
        data: { list: mockAccountList, total: 2 },
        isLoading: false,
      } as unknown as ReturnType<typeof useAccountList>);
    });

    When('进入账号管理页面', async () => {
      render(<Account />);
    });

    Then('显示账号列表第1页', async () => {
      await waitFor(() => {
        expect(screen.getByText('测试账号A')).toBeInTheDocument();
      });
    });
  });

  Scenario('账号列表分页-切换页码', ({ Given, When, Then }) => {
    Given('账号列表有多页数据', async () => {
      vi.mocked(useAccountList).mockReturnValue({
        data: { list: mockAccountList, total: 100 },
        isLoading: false,
      } as unknown as ReturnType<typeof useAccountList>);
    });

    When('点击「下一页」', async () => {
      const nextButton = screen.getByText('下一页');
      fireEvent.click(nextButton);
    });

    Then('列表刷新为对应页数据', async () => {
      await waitFor(() => {
        expect(useAccountList).toHaveBeenCalled();
      });
    });
  });

  Scenario('账号列表分页-切换每页条数', ({ Given, When, Then }) => {
    Given('账号列表有数据', async () => {
      vi.mocked(useAccountList).mockReturnValue({
        data: { list: mockAccountList, total: 50 },
        isLoading: false,
      } as unknown as ReturnType<typeof useAccountList>);
    });

    When('选择每页条数下拉「20条」', async () => {
      const pageSizeSelect = screen.getByText('20条/页');
      fireEvent.click(pageSizeSelect);
    });

    Then('列表刷新，每页显示20条数据', async () => {
      await waitFor(() => {
        expect(useAccountList).toHaveBeenCalled();
      });
    });
  });

  Scenario('按平台筛选账号', ({ Given, When, Then, And }) => {
    Given('账号列表有多个平台账号', async () => {
      vi.mocked(useAccountList).mockReturnValue({
        data: { list: mockAccountList, total: 2 },
        isLoading: false,
      } as unknown as ReturnType<typeof useAccountList>);
    });

    When('选择「小红书」平台', async () => {
      const platformSelect = screen.getByPlaceholderText('全部');
      fireEvent.click(platformSelect);
    });

    And('点击「查询」', async () => {
      const searchButton = screen.getByText('查询');
      fireEvent.click(searchButton);
    });

    Then('列表仅展示小红书平台账号', async () => {
      await waitFor(() => {
        expect(useAccountList).toHaveBeenCalledWith(
          expect.objectContaining({ platform: 'xiaohongshu' }),
        );
      });
    });
  });

  Scenario('按账号状态筛选', ({ Given, When, Then, And }) => {
    Given('账号列表有各状态账号', async () => {
      vi.mocked(useAccountList).mockReturnValue({
        data: { list: mockAccountList, total: 2 },
        isLoading: false,
      } as unknown as ReturnType<typeof useAccountList>);
    });

    When('选择「在线」状态', async () => {
      const statusSelect = screen.getByPlaceholderText('全部');
      fireEvent.click(statusSelect);
    });

    And('点击「查询」', async () => {
      const searchButton = screen.getByText('查询');
      fireEvent.click(searchButton);
    });

    Then('列表仅显示在线账号', async () => {
      await waitFor(() => {
        expect(useAccountList).toHaveBeenCalledWith(
          expect.objectContaining({ status: 'ONLINE' }),
        );
      });
    });
  });

  Scenario('搜索账号', ({ Given, When, Then, And }) => {
    Given('存在账号「测试账号」', async () => {
      vi.mocked(useAccountList).mockReturnValue({
        data: { list: [mockAccountList[0]], total: 1 },
        isLoading: false,
      } as unknown as ReturnType<typeof useAccountList>);
    });

    When('输入关键词「测试」', async () => {
      const searchInput = screen.getByPlaceholderText('搜索账号昵称 / 手机号…');
      fireEvent.change(searchInput, { target: { value: '测试' } });
    });

    And('按回车或点击「查询」', async () => {
      const searchButton = screen.getByText('查询');
      fireEvent.click(searchButton);
    });

    Then('列表显示匹配「测试」的账号', async () => {
      await waitFor(() => {
        expect(useAccountList).toHaveBeenCalledWith(
          expect.objectContaining({ keyword: '测试' }),
        );
      });
    });
  });

  Scenario('搜索账号无结果', ({ Given, When, Then, And }) => {
    Given('账号列表有数据', async () => {
      vi.mocked(useAccountList).mockReturnValue({
        data: { list: [], total: 0 },
        isLoading: false,
      } as unknown as ReturnType<typeof useAccountList>);
    });

    When('输入不存在关键词「不存在账号XYZ」', async () => {
      const searchInput = screen.getByPlaceholderText('搜索账号昵称 / 手机号…');
      fireEvent.change(searchInput, { target: { value: '不存在账号XYZ' } });
    });

    And('点击「查询」', async () => {
      const searchButton = screen.getByText('查询');
      fireEvent.click(searchButton);
    });

    Then('显示空状态「没有搜索到账号」', async () => {
      await waitFor(() => {
        expect(screen.getByText('没有搜索到账号')).toBeInTheDocument();
      });
    });
  });

  Scenario('刷新按钮', ({ Given, When, Then }) => {
    Given('账号列表有数据', async () => {
      vi.mocked(useAccountList).mockReturnValue({
        data: { list: mockAccountList, total: 2 },
        isLoading: false,
      } as unknown as ReturnType<typeof useAccountList>);
    });

    When('点击「刷新」按钮', async () => {
      const refreshButton = screen.getByText('刷新');
      fireEvent.click(refreshButton);
    });

    Then('列表重新请求，回到第1页', async () => {
      await waitFor(() => {
        expect(useAccountList).toHaveBeenCalledWith(
          expect.objectContaining({ page: 1 }),
        );
      });
    });
  });

  Scenario('批量停止在线账号', ({ Given, When, Then, And }) => {
    Given('账号A、B状态为「在线」', async () => {
      vi.mocked(useAccountList).mockReturnValue({
        data: {
          list: [
            { ...mockAccountList[0], status: 'ONLINE' },
            { ...mockAccountList[1], status: 'ONLINE' },
          ],
          total: 2,
        },
        isLoading: false,
      } as unknown as ReturnType<typeof useAccountList>);
    });

    When('选中账号A、B', async () => {
      const checkboxes = screen.getAllByRole('checkbox');
      fireEvent.click(checkboxes[1]);
      fireEvent.click(checkboxes[2]);
    });

    And('点击「批量停止」', async () => {
      const batchStopButton = screen.getByText('批量停止');
      fireEvent.click(batchStopButton);
    });

    And('确认停止', async () => {
      const confirmButton = screen.getByText('确认');
      fireEvent.click(confirmButton);
    });

    Then('选中账号状态变为「已停止」', async () => {
      await waitFor(() => {
        expect(useBatchStopAccounts).toHaveBeenCalled();
      });
    });
  });

  Scenario('批量启动已停止账号', ({ Given, When, Then, And }) => {
    Given('账号A状态为「已停止」', async () => {
      vi.mocked(useAccountList).mockReturnValue({
        data: {
          list: [{ ...mockAccountList[0], status: 'STOPPED' }],
          total: 1,
        },
        isLoading: false,
      } as unknown as ReturnType<typeof useAccountList>);
    });

    When('选中账号A', async () => {
      const checkbox = screen.getAllByRole('checkbox')[1];
      fireEvent.click(checkbox);
    });

    And('点击「批量启动」', async () => {
      const batchStartButton = screen.getByText('批量启动');
      fireEvent.click(batchStartButton);
    });

    And('确认启动', async () => {
      const confirmButton = screen.getByText('确认');
      fireEvent.click(confirmButton);
    });

    Then('账号A状态变为「在线」', async () => {
      await waitFor(() => {
        expect(useBatchStartAccounts).toHaveBeenCalled();
      });
    });
  });

  Scenario('批量删除账号', ({ Given, When, Then, And }) => {
    Given('账号A状态为「已停止」', async () => {
      vi.mocked(useAccountList).mockReturnValue({
        data: {
          list: [{ ...mockAccountList[0], status: 'STOPPED' }],
          total: 1,
        },
        isLoading: false,
      } as unknown as ReturnType<typeof useAccountList>);
    });

    When('选中账号A', async () => {
      const checkbox = screen.getAllByRole('checkbox')[1];
      fireEvent.click(checkbox);
    });

    And('点击「批量删除」', async () => {
      const batchDeleteButton = screen.getByText('批量删除');
      fireEvent.click(batchDeleteButton);
    });

    And('确认删除', async () => {
      const confirmButton = screen.getByText('确认');
      fireEvent.click(confirmButton);
    });

    Then('账号A从列表移除', async () => {
      await waitFor(() => {
        expect(useBatchDeleteAccounts).toHaveBeenCalled();
      });
    });
  });

  Scenario('单账号停止', ({ Given, When, Then, And }) => {
    Given('账号A状态为「在线」', async () => {
      vi.mocked(useAccountList).mockReturnValue({
        data: {
          list: [{ ...mockAccountList[0], status: 'ONLINE' }],
          total: 1,
        },
        isLoading: false,
      } as unknown as ReturnType<typeof useAccountList>);
    });

    When('点击账号A的「停止」按钮', async () => {
      const stopButton = screen.getByText('停止');
      fireEvent.click(stopButton);
    });

    And('确认停止', async () => {
      const confirmButton = screen.getByText('确认');
      fireEvent.click(confirmButton);
    });

    Then('账号A状态变为「已停止」', async () => {
      await waitFor(() => {
        expect(useStopAccount).toHaveBeenCalled();
      });
    });
  });

  Scenario('单账号启动', ({ Given, When, Then }) => {
    Given('账号B状态为「已停止」', async () => {
      vi.mocked(useAccountList).mockReturnValue({
        data: {
          list: [{ ...mockAccountList[0], status: 'STOPPED' }],
          total: 1,
        },
        isLoading: false,
      } as unknown as ReturnType<typeof useAccountList>);
    });

    When('点击账号B的「启动」按钮', async () => {
      const startButton = screen.getByText('启动');
      fireEvent.click(startButton);
    });

    Then('账号B状态变为「在线」', async () => {
      await waitFor(() => {
        expect(useStartAccount).toHaveBeenCalled();
      });
    });
  });

  Scenario('查看账号操作日志', ({ Given, When, Then }) => {
    Given('账号列表有数据', async () => {
      vi.mocked(useAccountList).mockReturnValue({
        data: { list: mockAccountList, total: 2 },
        isLoading: false,
      } as unknown as ReturnType<typeof useAccountList>);
    });

    When('点击某账号的「日志」按钮', async () => {
      const logButton = screen.getByText('日志');
      fireEvent.click(logButton);
    });

    Then('跳转账号日志页面', async () => {
      await waitFor(() => {
        expect(screen.getByText('日志')).toBeInTheDocument();
      });
    });
  });

  Scenario('已停止账号可删除', ({ Given, When, Then, And }) => {
    Given('账号D状态为「已停止」', async () => {
      vi.mocked(useAccountList).mockReturnValue({
        data: {
          list: [{ ...mockAccountList[0], id: 'D', status: 'STOPPED' }],
          total: 1,
        },
        isLoading: false,
      } as unknown as ReturnType<typeof useAccountList>);
      vi.mocked(accountRunStatusCanDelete).mockReturnValue(true);
    });

    When('点击账号D的「删除」按钮', async () => {
      vi.mocked(useDeleteAccount).mockReturnValue({
        mutate: vi.fn(),
      } as unknown as ReturnType<typeof useDeleteAccount>);
    });

    And('确认删除', async () => {
      const confirmButton = screen.getByText('确认');
      fireEvent.click(confirmButton);
    });

    Then('账号D从列表移除', async () => {
      await waitFor(() => {
        expect(useDeleteAccount).toHaveBeenCalled();
      });
    });
  });

  Scenario('在线账号不可删除', ({ Given, When, Then }) => {
    Given('账号E状态为「在线」', async () => {
      vi.mocked(useAccountList).mockReturnValue({
        data: {
          list: [{ ...mockAccountList[0], id: 'E', status: 'ONLINE' }],
          total: 1,
        },
        isLoading: false,
      } as unknown as ReturnType<typeof useAccountList>);
      vi.mocked(accountRunStatusCanDelete).mockReturnValue(false);
    });

    When('点击账号E的「删除」按钮', async () => {});

    Then('提示「请先停止账号后再删除」', async () => {
      await waitFor(() => {
        expect(mockMessage.warning).toHaveBeenCalledWith(
          '请先停止账号后再删除',
        );
      });
    });
  });

  Scenario('失效账号不可直接删除', ({ Given, When, Then }) => {
    Given('账号F状态为「失效」', async () => {
      vi.mocked(useAccountList).mockReturnValue({
        data: {
          list: [{ ...mockAccountList[0], id: 'F', status: 'EXPIRED' }],
          total: 1,
        },
        isLoading: false,
      } as unknown as ReturnType<typeof useAccountList>);
      vi.mocked(accountRunStatusCanDelete).mockReturnValue(false);
    });

    When('点击账号F的「删除」按钮', async () => {});

    Then('提示需先扫码恢复再停止再删除', async () => {
      await waitFor(() => {
        expect(mockMessage.warning).toHaveBeenCalled();
      });
    });
  });

  Scenario('列表为空展示空态', ({ Given, When, Then, And }) => {
    Given('没有任何账号', async () => {
      vi.mocked(useAccountList).mockReturnValue({
        data: { list: [], total: 0 },
        isLoading: false,
      } as unknown as ReturnType<typeof useAccountList>);
    });

    When('进入账号列表页', async () => {
      render(<Account />);
    });

    Then('展示空图标+「暂无账号」提示', async () => {
      await waitFor(() => {
        expect(screen.getByText('暂无账号')).toBeInTheDocument();
      });
    });

    And('显示「+ Add Account」CTA按钮', async () => {
      expect(screen.getByText('+ Add Account')).toBeInTheDocument();
    });
  });

  Scenario('网络异常-列表请求失败', ({ Given, When, Then, And }) => {
    Given('网络断开', async () => {
      vi.mocked(useAccountList).mockReturnValue({
        data: undefined,
        isLoading: false,
        error: new Error('Network Error'),
      } as unknown as ReturnType<typeof useAccountList>);
    });

    When('访问账号列表页', async () => {
      render(<Account />);
    });

    Then('展示红色警告图标+「Loading failed」提示', async () => {
      await waitFor(() => {
        expect(screen.getByText('Loading failed')).toBeInTheDocument();
      });
    });

    And('显示「Reload」按钮', async () => {
      expect(screen.getByText('Reload')).toBeInTheDocument();
    });
  });

  Scenario('Token失效跳转登录', ({ Given, When, Then }) => {
    Given('Token已过期', async () => {
      vi.mocked(useAccountList).mockReturnValue({
        data: undefined,
        isLoading: false,
        error: { response: { status: 401 } },
      } as unknown as ReturnType<typeof useAccountList>);
    });

    When('执行业务操作', async () => {});

    Then('跳转登录页或提示登录状态已失效', async () => {
      await waitFor(() => {
        expect(mockMessage.error).toHaveBeenCalled();
      });
    });
  });

  Scenario('批量操作-全选状态', ({ Given, When, Then, And }) => {
    Given('账号列表有数据', async () => {
      vi.mocked(useAccountList).mockReturnValue({
        data: { list: mockAccountList, total: 3 },
        isLoading: false,
      } as unknown as ReturnType<typeof useAccountList>);
    });

    When('勾选「本页全选」复选框', async () => {
      const selectAllCheckbox = screen.getAllByRole('checkbox')[0];
      fireEvent.click(selectAllCheckbox);
    });

    Then('当前页所有账号行被勾选', async () => {
      await waitFor(() => {
        const checkboxes = screen.getAllByRole(
          'checkbox',
        ) as HTMLInputElement[];
        const dataCheckboxes = checkboxes.slice(1);
        expect(dataCheckboxes.every((cb) => cb.checked)).toBe(true);
      });
    });

    And('批量操作按钮可用', async () => {
      expect(screen.getByText('批量停止')).not.toBeDisabled();
    });
  });

  Scenario('批量操作-取消全选', ({ Given, When, Then }) => {
    Given('已全选本页', async () => {
      vi.mocked(useAccountList).mockReturnValue({
        data: { list: mockAccountList, total: 3 },
        isLoading: false,
      } as unknown as ReturnType<typeof useAccountList>);
    });

    When('取消勾选「本页全选」复选框', async () => {
      const selectAllCheckbox = screen.getAllByRole('checkbox')[0];
      fireEvent.click(selectAllCheckbox);
    });

    Then('当前页所有账号行取消勾选', async () => {
      await waitFor(() => {
        const checkboxes = screen.getAllByRole(
          'checkbox',
        ) as HTMLInputElement[];
        const dataCheckboxes = checkboxes.slice(1);
        expect(dataCheckboxes.every((cb) => !cb.checked)).toBe(true);
      });
    });
  });
});
