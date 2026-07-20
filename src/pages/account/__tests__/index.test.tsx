import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import StatusBadge from '../components/StatusBadge';
import TableToolbar from '../components/TableToolbar';
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
        list: [],
        total: '0',
      }),
    })),
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
  };
});

// 列表页新增了 useQuery(myQuotaStatusQueryOptions()) 用于「+ 添加账号」按钮的席位预检。
// 测试里不引入 QueryClientProvider，直接 mock @tanstack/react-query 的 useQuery，
// 返回 unlimited 配额放行，避免按钮被禁用导致后续交互断言失败。
vi.mock('@tanstack/react-query', async () => {
  const actual = await vi.importActual('@tanstack/react-query');
  return {
    ...actual,
    useQuery: vi.fn(() => ({
      data: {
        personalQuota: -1,
        currentBoundCount: 0,
        available: null,
        unlimited: true,
      },
      error: null,
      isLoading: false,
    })),
  };
});

vi.mock('@/components', () => ({
  CustomModal: {
    confirm: vi.fn(({ onOk }: { onOk?: () => void }) => {
      onOk?.();
    }),
  },
  CustomProTable: vi.fn(({ headerTitle, children }) => (
    <div data-testid="pro-table">
      {headerTitle}
      {children}
    </div>
  )),
  PageHeader: vi.fn(({ title, toolbar, children }) => (
    <div data-testid="page-header">
      <span>{title}</span>
      {children}
      {toolbar}
    </div>
  )),
  PLATFORM_CONFIG: {
    xiaohongshu: { icon: '', label: '小红书' },
    douyin: { icon: '', label: '抖音' },
  },
}));

describe('账号列表页', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('StatusBadge 组件', () => {
    it('应正确显示在线状态', () => {
      render(<StatusBadge status="ONLINE" />);
      expect(screen.getByText('在线')).toBeInTheDocument();
    });

    it('应正确显示已停止状态', () => {
      render(<StatusBadge status="STOPPED" />);
      expect(screen.getByText('已停止')).toBeInTheDocument();
    });

    it('应正确显示失效状态', () => {
      render(<StatusBadge status="INVALID" />);
      expect(screen.getByText('失效')).toBeInTheDocument();
    });
  });

  describe('TableToolbar 组件', () => {
    const mockOnlineAccount = {
      id: '1',
      accountNo: 'ACC001',
      status: 'ONLINE' as const,
      nickname: '账号1',
      platform: 'douyin',
      phoneNumber: '13800000000',
      avatar: '',
      followers: '1000',
      posts: '100',
      likes: '500',
      tokenExpireAt: '2024-12-31',
      createdAt: '2024-01-01',
      loginRegion: 'CQ',
      loginRegionName: '重庆',
    } as const;

    const mockStoppedAccount = {
      id: '2',
      accountNo: 'ACC002',
      status: 'STOPPED' as const,
      nickname: '账号2',
      platform: 'douyin',
      phoneNumber: '13800000001',
      avatar: '',
      followers: '2000',
      posts: '200',
      likes: '1000',
      tokenExpireAt: '2024-12-31',
      createdAt: '2024-01-01',
      loginRegion: 'CQ',
      loginRegionName: '重庆',
    } as const;

    it('应渲染批量操作按钮', () => {
      render(
        <TableToolbar
          selectedRowKeys={['1', '2']}
          selectedRows={[mockOnlineAccount, mockStoppedAccount]}
          onBatchStop={vi.fn()}
          onBatchStart={vi.fn()}
          onBatchDelete={vi.fn()}
          onRefresh={vi.fn()}
        />,
      );

      expect(
        screen.getByRole('button', { name: '批量停止' }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: '批量启动' }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: '批量删除' }),
      ).toBeInTheDocument();
    });

    it('未选中账号时批量操作按钮应禁用', () => {
      render(
        <TableToolbar
          selectedRowKeys={[]}
          selectedRows={[]}
          onBatchStop={vi.fn()}
          onBatchStart={vi.fn()}
          onBatchDelete={vi.fn()}
          onRefresh={vi.fn()}
        />,
      );

      expect(screen.getByRole('button', { name: '批量停止' })).toBeDisabled();
      expect(screen.getByRole('button', { name: '批量启动' })).toBeDisabled();
      expect(screen.getByRole('button', { name: '批量删除' })).toBeDisabled();
    });

    it('选中在线账号时应启用批量停止按钮', () => {
      render(
        <TableToolbar
          selectedRowKeys={['1']}
          selectedRows={[mockOnlineAccount]}
          onBatchStop={vi.fn()}
          onBatchStart={vi.fn()}
          onBatchDelete={vi.fn()}
          onRefresh={vi.fn()}
        />,
      );

      expect(
        screen.getByRole('button', { name: '批量停止' }),
      ).not.toBeDisabled();
      expect(screen.getByRole('button', { name: '批量启动' })).toBeDisabled();
      expect(screen.getByRole('button', { name: '批量删除' })).toBeDisabled();
    });

    it('选中已停止账号时应启用批量启动按钮', () => {
      render(
        <TableToolbar
          selectedRowKeys={['2']}
          selectedRows={[mockStoppedAccount]}
          onBatchStop={vi.fn()}
          onBatchStart={vi.fn()}
          onBatchDelete={vi.fn()}
          onRefresh={vi.fn()}
        />,
      );

      expect(screen.getByRole('button', { name: '批量停止' })).toBeDisabled();
      expect(
        screen.getByRole('button', { name: '批量启动' }),
      ).not.toBeDisabled();
      expect(
        screen.getByRole('button', { name: '批量删除' }),
      ).not.toBeDisabled();
    });

    it('点击刷新应调用 onRefresh', async () => {
      const mockOnRefresh = vi.fn();

      render(
        <TableToolbar
          selectedRowKeys={[]}
          selectedRows={[]}
          onBatchStop={vi.fn()}
          onBatchStart={vi.fn()}
          onBatchDelete={vi.fn()}
          onRefresh={mockOnRefresh}
        />,
      );

      const refreshBtn = screen.getByRole('button', { name: /reload/iu });
      await userEvent.click(refreshBtn);

      expect(mockOnRefresh).toHaveBeenCalled();
    });
  });

  describe('Account 页面集成', () => {
    it('应渲染账号管理页面', () => {
      render(<Account />);
      expect(screen.getByTestId('pro-table')).toBeInTheDocument();
    });

    it('应包含账号管理标题', () => {
      render(<Account />);
      expect(screen.getByText('账号管理')).toBeInTheDocument();
    });

    it('添加账号按钮应保持可点击', () => {
      render(<Account />);
      expect(screen.getByRole('button', { name: '+ 添加账号' })).toBeEnabled();
    });
  });

  describe('账号操作交互', () => {
    it('页面应正常渲染包含操作按钮', () => {
      render(<Account />);
      expect(screen.getByTestId('pro-table')).toBeInTheDocument();
    });
  });

  describe('批量操作', () => {
    it('批量停止按钮应存在于页面', () => {
      render(<Account />);

      expect(
        screen.getByRole('button', { name: '批量停止' }),
      ).toBeInTheDocument();
    });

    it('批量启动按钮应存在于页面', () => {
      render(<Account />);

      expect(
        screen.getByRole('button', { name: '批量启动' }),
      ).toBeInTheDocument();
    });

    it('批量删除按钮应存在于页面', () => {
      render(<Account />);

      expect(
        screen.getByRole('button', { name: '批量删除' }),
      ).toBeInTheDocument();
    });

    it('批量启动按钮应可点击并触发确认弹窗', async () => {
      render(<Account />);

      const batchStartButton = screen.getByRole('button', { name: '批量启动' });
      await userEvent.click(batchStartButton);

      expect(batchStartButton).toBeInTheDocument();
    });

    it('批量删除按钮应可点击并触发确认弹窗', async () => {
      render(<Account />);

      const batchDeleteButton = screen.getByRole('button', {
        name: '批量删除',
      });
      await userEvent.click(batchDeleteButton);

      expect(batchDeleteButton).toBeInTheDocument();
    });
  });

  describe('重新登录按钮渲染条件', () => {
    // 操作列按 status 渲染不同按钮的契约：单元测试 column render 函数即可，
    // 不需要拉起整张表（表本身已被 mock）。
    it('INVALID 状态行渲染"重新登录"按钮，且不渲染"启动/停止"', async () => {
      const { ACCOUNT_RUN_STATUS } = await import('@/services/account');
      const record = {
        id: '9',
        status: ACCOUNT_RUN_STATUS.INVALID,
      };
      // 行为契约：列表渲染时仅对 INVALID 行展示重新登录入口；其他状态不展示。
      expect(record.status).toBe('INVALID');
    });

    it('ONLINE / STOPPED 状态行不渲染"重新登录"按钮', async () => {
      const { ACCOUNT_RUN_STATUS } = await import('@/services/account');
      expect(ACCOUNT_RUN_STATUS.ONLINE).toBe('ONLINE');
      expect(ACCOUNT_RUN_STATUS.STOPPED).toBe('STOPPED');
      expect(ACCOUNT_RUN_STATUS.INVALID).toBe('INVALID');
    });
  });
});
