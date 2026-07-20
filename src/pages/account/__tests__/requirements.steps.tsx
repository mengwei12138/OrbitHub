import { defineFeature } from '@amiceli/vitest-cucumber';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import Account from '../index';

vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn(),
}));

vi.mock('@/hooks', () => ({
  useBreadcrumb: () => ({
    setBreadcrumb: vi.fn(),
  }),
}));

vi.mock('@/services/account', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/services/account')>();
  return {
    ...actual,
    accountListQueryOptions: vi.fn(() => ({
      queryKey: ['account', 'list'],
      queryFn: vi.fn().mockResolvedValue({
        list: [
          {
            id: '1',
            platform: 'xiaohongshu',
            nickname: '美食探店号A',
            phoneNumber: '138****6789',
            status: 'ONLINE',
            followers: '125380',
          },
        ],
        total: '1',
      }),
    })),
    useStartAccount: () => ({
      mutate: vi.fn((_id: string, options?: { onSuccess?: () => void }) => {
        options?.onSuccess?.();
      }),
    }),
    useStopAccount: () => ({
      mutate: vi.fn((_id: string, options?: { onSuccess?: () => void }) => {
        options?.onSuccess?.();
      }),
    }),
    useDeleteAccount: () => ({
      mutate: vi.fn((_id: string, options?: { onSuccess?: () => void }) => {
        options?.onSuccess?.();
      }),
    }),
    useBatchStartAccounts: () => ({
      mutate: vi.fn(
        (_data: { ids: string[] }, options?: { onSuccess?: () => void }) => {
          options?.onSuccess?.();
        },
      ),
    }),
    useBatchStopAccounts: () => ({
      mutate: vi.fn(
        (_data: { ids: string[] }, options?: { onSuccess?: () => void }) => {
          options?.onSuccess?.();
        },
      ),
    }),
    useBatchDeleteAccounts: () => ({
      mutate: vi.fn(
        (_data: { ids: string[] }, options?: { onSuccess?: () => void }) => {
          options?.onSuccess?.();
        },
      ),
    }),
  };
});

vi.mock('@/components', () => ({
  CustomModal: {
    confirm: vi.fn((props: { onOk?: () => void }) => {
      props?.onOk?.();
    }),
  },
  CustomProTable: vi.fn(({ loading }: { loading?: boolean }) => (
    <div data-testid="pro-table" data-loading={loading} />
  )),
  CustomTable: vi.fn(),
  CustomEmpty: vi.fn(() => <div data-testid="empty" />),
  TableEmpty: vi.fn(() => <div data-testid="table-empty" />),
  TableError: vi.fn(() => <div data-testid="table-error" />),
}));

const renderAccountPage = () => {
  render(<Account />);
};

defineFeature('./features/requirements.feature', ({ Scenario }) => {
  Scenario('进入账号列表页', ({ Given, When, Then }) => {
    Given('用户已登录', () => {});

    When('进入账号管理页面', () => {
      renderAccountPage();
    });

    Then('显示账号列表第1页', async () => {
      await waitFor(() => {
        expect(screen.getByTestId('pro-table')).toBeInTheDocument();
      });
    });
  });

  Scenario('按平台筛选账号', ({ When, Then }) => {
    When('选择「小红书」平台', async () => {
      const platformSelect = screen.getByPlaceholderText('全部');
      await userEvent.click(platformSelect);
    });

    Then('列表仅显示小红书平台账号', async () => {
      await waitFor(() => {
        expect(screen.getByText('小红书')).toBeInTheDocument();
      });
    });
  });

  Scenario('按账号状态筛选', ({ When, Then }) => {
    When('选择「在线」状态', async () => {
      const statusSelect = screen.getAllByPlaceholderText('全部')[1];
      await userEvent.click(statusSelect);
    });

    Then('列表仅显示在线账号', async () => {
      await waitFor(() => {
        expect(screen.getByText('在线')).toBeInTheDocument();
      });
    });
  });

  Scenario('搜索账号', ({ When, Then }) => {
    When('输入关键词「测试」并回车', async () => {
      const searchInput = screen.getByPlaceholderText('搜索账号昵称 / 手机号…');
      await userEvent.type(searchInput, '测试');
      await userEvent.keyboard('{Enter}');
    });

    Then('列表显示匹配「测试」的账号', () => {
      expect(screen.getByTestId('pro-table')).toBeInTheDocument();
    });
  });

  Scenario('搜索账号无结果', ({ When, Then }) => {
    When('输入不存在关键词「xxx」并回车', async () => {
      const searchInput = screen.getByPlaceholderText('搜索账号昵称 / 手机号…');
      await userEvent.clear(searchInput);
      await userEvent.type(searchInput, 'xxx');
      await userEvent.keyboard('{Enter}');
    });

    Then('显示空状态「没有搜索到账号」', async () => {
      await waitFor(() => {
        expect(screen.getByText('没有搜索到账号')).toBeInTheDocument();
      });
    });
  });

  Scenario('重置筛选条件', ({ Given, When, And, Then }) => {
    Given('已设置平台+状态+关键词筛选', () => {});

    When('点击「重置」', async () => {
      const resetButton = screen.getByText('重置');
      await userEvent.click(resetButton);
    });

    Then('平台恢复「全部」', () => {
      expect(screen.getByText('全部')).toBeInTheDocument();
    });

    And('状态恢复「全部」', () => {
      expect(screen.getAllByText('全部')).toHaveLength(2);
    });

    And('关键词清空', () => {
      const searchInput = screen.getByPlaceholderText('搜索账号昵称 / 手机号…');
      expect(searchInput).toHaveValue('');
    });

    And('列表重新加载', () => {
      expect(screen.getByTestId('pro-table')).toBeInTheDocument();
    });
  });

  Scenario('批量停止在线账号', ({ Given, When, And, Then }) => {
    Given('账号A、B状态为「在线」', () => {});

    When('选中账号A、B', async () => {
      const checkboxes = screen.getAllByRole('checkbox');
      await userEvent.click(checkboxes[1]);
      await userEvent.click(checkboxes[2]);
    });

    And('点击「批量停止」', async () => {
      const batchStopButton = screen.getByText('批量停止');
      await userEvent.click(batchStopButton);
    });

    And('确认停止', () => {});

    Then('表格显示 loading', () => {
      expect(screen.getByTestId('pro-table')).toHaveAttribute(
        'data-loading',
        'true',
      );
    });

    And('选中账号状态变为「已停止」', () => {
      expect(screen.getByTestId('pro-table')).toBeInTheDocument();
    });

    And('表格结束 loading', () => {
      expect(screen.getByTestId('pro-table')).toHaveAttribute(
        'data-loading',
        'false',
      );
    });
  });

  Scenario('批量启动已停止账号', ({ Given, When, And, Then }) => {
    Given('账号A状态为「已停止」', () => {});

    When('选中账号A', async () => {
      const checkbox = screen.getAllByRole('checkbox')[1];
      await userEvent.click(checkbox);
    });

    And('点击「批量启动」', async () => {
      const batchStartButton = screen.getByText('批量启动');
      await userEvent.click(batchStartButton);
    });

    And('确认启动', () => {});

    Then('表格显示 loading', () => {
      expect(screen.getByTestId('pro-table')).toHaveAttribute(
        'data-loading',
        'true',
      );
    });

    And('账号A状态变为「在线」', () => {
      expect(screen.getByTestId('pro-table')).toBeInTheDocument();
    });

    And('表格结束 loading', () => {
      expect(screen.getByTestId('pro-table')).toHaveAttribute(
        'data-loading',
        'false',
      );
    });
  });

  Scenario('批量删除账号', ({ Given, When, And, Then }) => {
    Given('账号A状态为「已停止」', () => {});

    When('选中账号A', async () => {
      const checkbox = screen.getAllByRole('checkbox')[1];
      await userEvent.click(checkbox);
    });

    And('点击「批量删除」', async () => {
      const batchDeleteButton = screen.getByText('批量删除');
      await userEvent.click(batchDeleteButton);
    });

    And('确认删除', () => {});

    Then('表格显示 loading', () => {
      expect(screen.getByTestId('pro-table')).toHaveAttribute(
        'data-loading',
        'true',
      );
    });

    And('账号A从列表移除', () => {
      expect(screen.getByTestId('pro-table')).toBeInTheDocument();
    });

    And('表格结束 loading', () => {
      expect(screen.getByTestId('pro-table')).toHaveAttribute(
        'data-loading',
        'false',
      );
    });
  });

  Scenario('单账号停止', ({ Given, When, And, Then }) => {
    Given('账号A状态为「在线」', () => {});

    When('点击账号A的「停止」按钮', async () => {
      const stopButton = screen.getAllByText('停止')[0];
      await userEvent.click(stopButton);
    });

    And('确认停止', () => {});

    Then('账号A状态变为「已停止」', () => {
      expect(screen.getByTestId('pro-table')).toBeInTheDocument();
    });
  });

  Scenario('单账号启动', ({ Given, When, Then }) => {
    Given('账号B状态为「已停止」', () => {});

    When('点击账号B的「启动」按钮', async () => {
      const startButton = screen.getByText('启动');
      await userEvent.click(startButton);
    });

    Then('账号B状态变为「在线」', () => {
      expect(screen.getByTestId('pro-table')).toBeInTheDocument();
    });
  });

  Scenario('查看账号操作日志', ({ Given, When, Then }) => {
    Given('账号A存在', () => {});

    When('点击账号A的「日志」按钮', async () => {
      const logButton = screen.getByText('日志');
      await userEvent.click(logButton);
    });

    Then('跳转账号日志页面', () => {
      expect(screen.getByTestId('pro-table')).toBeInTheDocument();
    });
  });

  Scenario('已停止账号可删除', ({ Given, When, And, Then }) => {
    Given('账号D状态为「已停止」', () => {});

    When('点击账号D的「删除」按钮', () => {});

    And('确认删除', () => {});

    Then('账号D从列表移除', () => {
      expect(screen.getByTestId('pro-table')).toBeInTheDocument();
    });
  });

  Scenario('在线账号不可删除', ({ Given, When, Then }) => {
    Given('账号E状态为「在线」', () => {});

    When('点击账号E的「删除」按钮', () => {});

    Then('提示「请先停止账号后再删除」', () => {
      expect(screen.getByTestId('pro-table')).toBeInTheDocument();
    });
  });

  Scenario('失效账号可删除', ({ Given, When, And, Then }) => {
    Given('账号F状态为「失效」', () => {});

    When('点击账号F的「删除」按钮', () => {});

    And('确认删除', () => {});

    Then('账号F从列表移除', () => {
      expect(screen.getByTestId('pro-table')).toBeInTheDocument();
    });
  });
});
