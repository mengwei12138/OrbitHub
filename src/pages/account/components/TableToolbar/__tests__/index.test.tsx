import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { ACCOUNT_RUN_STATUS } from '@/services/account';
import type { AccountResponse } from '@/services/account/types';

import AccountTableToolbar from '../index';

const createMockAccount = (
  id: string,
  status: AccountResponse['status'],
): AccountResponse =>
  ({
    id,
    status,
    nickname: `账号 ${id}`,
    platform: 'douyin',
    phoneNumber: '13800000000',
    followers: 1000,
  }) as unknown as AccountResponse;

describe('AccountTableToolbar 组件', () => {
  const defaultProps = {
    selectedRowKeys: [] as string[],
    selectedRows: [] as AccountResponse[],
    onBatchStop: vi.fn(),
    onBatchStart: vi.fn(),
    onBatchDelete: vi.fn(),
    onRefresh: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('基础渲染', () => {
    it('应渲染批量操作按钮', () => {
      render(<AccountTableToolbar {...defaultProps} />);

      expect(screen.getByText('批量停止')).toBeInTheDocument();
      expect(screen.getByText('批量启动')).toBeInTheDocument();
      expect(screen.getByText('批量删除')).toBeInTheDocument();
    });

    it('应渲染已选中文案', () => {
      render(
        <AccountTableToolbar {...defaultProps} selectedRowKeys={['1', '2']} />,
      );

      expect(screen.getByText('已选')).toBeInTheDocument();
    });

    it('应渲染刷新按钮', () => {
      render(<AccountTableToolbar {...defaultProps} />);

      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
    });
  });

  describe('选中数量显示', () => {
    it('未选中时应显示数量为 0', () => {
      render(<AccountTableToolbar {...defaultProps} selectedRowKeys={[]} />);

      expect(screen.getByText('0')).toBeInTheDocument();
    });

    it('选中 1 个账号时应显示数量为 1', () => {
      render(<AccountTableToolbar {...defaultProps} selectedRowKeys={['1']} />);

      expect(screen.getByText('1')).toBeInTheDocument();
    });

    it('选中多个账号时应正确显示数量', () => {
      render(
        <AccountTableToolbar
          {...defaultProps}
          selectedRowKeys={['1', '2', '3']}
        />,
      );

      expect(screen.getByText('3')).toBeInTheDocument();
    });
  });

  describe('按钮禁用状态', () => {
    it('未选中账号时批量停止按钮应禁用', () => {
      render(<AccountTableToolbar {...defaultProps} selectedRowKeys={[]} />);

      const buttons = screen.getAllByRole('button');
      const stopButton = buttons.find((btn) => btn.textContent === '批量停止');
      expect(stopButton).toBeDisabled();
    });

    it('未选中账号时批量启动按钮应禁用', () => {
      render(<AccountTableToolbar {...defaultProps} selectedRowKeys={[]} />);

      const buttons = screen.getAllByRole('button');
      const startButton = buttons.find((btn) => btn.textContent === '批量启动');
      expect(startButton).toBeDisabled();
    });

    it('未选中账号时批量删除按钮应禁用', () => {
      render(<AccountTableToolbar {...defaultProps} selectedRowKeys={[]} />);

      const buttons = screen.getAllByRole('button');
      const deleteButton = buttons.find(
        (btn) => btn.textContent === '批量删除',
      );
      expect(deleteButton).toBeDisabled();
    });

    it('选中账号时批量停止按钮应启用', () => {
      render(
        <AccountTableToolbar
          {...defaultProps}
          selectedRowKeys={['1']}
          selectedRows={[createMockAccount('1', ACCOUNT_RUN_STATUS.ONLINE)]}
        />,
      );

      const buttons = screen.getAllByRole('button');
      const stopButton = buttons.find((btn) => btn.textContent === '批量停止');
      expect(stopButton).not.toBeDisabled();
    });

    it('选中账号时批量启动按钮应启用', () => {
      render(
        <AccountTableToolbar
          {...defaultProps}
          selectedRowKeys={['1']}
          selectedRows={[createMockAccount('1', ACCOUNT_RUN_STATUS.STOPPED)]}
        />,
      );

      const buttons = screen.getAllByRole('button');
      const startButton = buttons.find((btn) => btn.textContent === '批量启动');
      expect(startButton).not.toBeDisabled();
    });

    it('选中已停止账号时批量删除按钮应启用', () => {
      render(
        <AccountTableToolbar
          {...defaultProps}
          selectedRowKeys={['1']}
          selectedRows={[createMockAccount('1', ACCOUNT_RUN_STATUS.STOPPED)]}
        />,
      );

      const buttons = screen.getAllByRole('button');
      const deleteButton = buttons.find(
        (btn) => btn.textContent === '批量删除',
      );
      expect(deleteButton).not.toBeDisabled();
    });
  });

  describe('按钮点击事件', () => {
    it('点击批量停止应调用 onBatchStop', async () => {
      render(
        <AccountTableToolbar
          {...defaultProps}
          selectedRowKeys={['1']}
          selectedRows={[createMockAccount('1', ACCOUNT_RUN_STATUS.ONLINE)]}
        />,
      );

      await userEvent.click(screen.getByText('批量停止'));

      expect(defaultProps.onBatchStop).toHaveBeenCalledTimes(1);
    });

    it('点击批量启动应调用 onBatchStart', async () => {
      render(
        <AccountTableToolbar
          {...defaultProps}
          selectedRowKeys={['1']}
          selectedRows={[createMockAccount('1', ACCOUNT_RUN_STATUS.STOPPED)]}
        />,
      );

      await userEvent.click(screen.getByText('批量启动'));

      expect(defaultProps.onBatchStart).toHaveBeenCalledTimes(1);
    });

    it('点击批量删除应调用 onBatchDelete', async () => {
      render(
        <AccountTableToolbar
          {...defaultProps}
          selectedRowKeys={['1']}
          selectedRows={[createMockAccount('1', ACCOUNT_RUN_STATUS.STOPPED)]}
        />,
      );

      await userEvent.click(screen.getByText('批量删除'));

      expect(defaultProps.onBatchDelete).toHaveBeenCalledTimes(1);
    });

    it('点击刷新按钮应调用 onRefresh', async () => {
      render(<AccountTableToolbar {...defaultProps} />);

      const buttons = screen.getAllByRole('button');
      const reloadButton = buttons[buttons.length - 1];
      await userEvent.click(reloadButton);

      expect(defaultProps.onRefresh).toHaveBeenCalledTimes(1);
    });
  });

  describe('危险按钮样式', () => {
    it('批量删除按钮存在', () => {
      render(<AccountTableToolbar {...defaultProps} selectedRowKeys={['1']} />);

      expect(screen.getByText('批量删除')).toBeTruthy();
    });
  });
});
