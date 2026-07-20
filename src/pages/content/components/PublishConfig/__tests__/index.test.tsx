import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import PublishConfig from '../index';

vi.mock('@/components', () => ({
  PlatformIcon: vi.fn(() => <span data-testid="platform-icon" />),
}));

type Platform = 'douyin' | 'xiaohongshu';

const mockAccounts: Array<{
  id: string;
  name: string;
  phone: string;
  platform: Platform;
  status: 'online' | 'stopped';
}> = Array.from({ length: 15 }, (_, i) => ({
  id: `account-${i + 1}`,
  name: `账号${i + 1}`,
  phone: `138****${String(i + 1).padStart(4, '0')}`,
  platform: (i % 2 === 0 ? 'douyin' : 'xiaohongshu') as Platform,
  status: 'online' as const,
}));

describe('PublishConfig', () => {
  describe('滚动加载更多', () => {
    it('渲染所有传入的账号', () => {
      const accounts = mockAccounts.slice(0, 10);
      const onAccountChange = vi.fn();

      render(
        <PublishConfig
          selectedPlatform="all"
          onPlatformChange={vi.fn()}
          accounts={accounts}
          selectedAccountIds={[]}
          onAccountChange={onAccountChange}
          hasMore={true}
          isExpanded={true}
          onToggleExpand={vi.fn()}
          isLoadingMore={false}
          onLoadMore={vi.fn()}
        />,
      );

      const accountItems = screen.getAllByTestId(/account-item-/u);
      expect(accountItems.length).toBe(10);
    });

    it('滚动到底部时触发 onLoadMore', () => {
      const accounts = mockAccounts.slice(0, 10);
      const onLoadMore = vi.fn();

      render(
        <PublishConfig
          selectedPlatform="all"
          onPlatformChange={vi.fn()}
          accounts={accounts}
          selectedAccountIds={[]}
          onAccountChange={vi.fn()}
          hasMore={true}
          isExpanded={true}
          onToggleExpand={vi.fn()}
          isLoadingMore={false}
          onLoadMore={onLoadMore}
        />,
      );

      const accountList = screen.getByTestId('account-list');
      Object.defineProperty(accountList, 'scrollHeight', { value: 1000 });
      Object.defineProperty(accountList, 'scrollTop', { value: 950 });
      Object.defineProperty(accountList, 'clientHeight', { value: 100 });

      fireEvent.scroll(accountList);

      expect(onLoadMore).toHaveBeenCalledTimes(1);
    });

    it('滚动未到底部时不触发 onLoadMore', () => {
      const accounts = mockAccounts.slice(0, 10);
      const onLoadMore = vi.fn();

      render(
        <PublishConfig
          selectedPlatform="all"
          onPlatformChange={vi.fn()}
          accounts={accounts}
          selectedAccountIds={[]}
          onAccountChange={vi.fn()}
          hasMore={true}
          isExpanded={true}
          onToggleExpand={vi.fn()}
          isLoadingMore={false}
          onLoadMore={onLoadMore}
        />,
      );

      const accountList = screen.getByTestId('account-list');
      Object.defineProperty(accountList, 'scrollHeight', { value: 1000 });
      Object.defineProperty(accountList, 'scrollTop', { value: 0 });
      Object.defineProperty(accountList, 'clientHeight', { value: 100 });

      fireEvent.scroll(accountList);

      expect(onLoadMore).not.toHaveBeenCalled();
    });

    it('加载中状态时不触发 onLoadMore', () => {
      const accounts = mockAccounts.slice(0, 10);
      const onLoadMore = vi.fn();

      render(
        <PublishConfig
          selectedPlatform="all"
          onPlatformChange={vi.fn()}
          accounts={accounts}
          selectedAccountIds={[]}
          onAccountChange={vi.fn()}
          hasMore={true}
          isExpanded={true}
          onToggleExpand={vi.fn()}
          isLoadingMore={true}
          onLoadMore={onLoadMore}
        />,
      );

      const accountList = screen.getByTestId('account-list');
      Object.defineProperty(accountList, 'scrollHeight', { value: 1000 });
      Object.defineProperty(accountList, 'scrollTop', { value: 900 });
      Object.defineProperty(accountList, 'clientHeight', { value: 100 });

      fireEvent.scroll(accountList);

      expect(onLoadMore).not.toHaveBeenCalled();
    });

    it('显示加载中状态', () => {
      const accounts = mockAccounts.slice(0, 10);

      render(
        <PublishConfig
          selectedPlatform="all"
          onPlatformChange={vi.fn()}
          accounts={accounts}
          selectedAccountIds={[]}
          onAccountChange={vi.fn()}
          hasMore={true}
          isExpanded={true}
          onToggleExpand={vi.fn()}
          isLoadingMore={true}
          onLoadMore={vi.fn()}
        />,
      );

      expect(screen.getByText('加载中...')).toBeInTheDocument();
    });

    it('无更多时不显示更多按钮', () => {
      const accounts = mockAccounts.slice(0, 3);

      render(
        <PublishConfig
          selectedPlatform="all"
          onPlatformChange={vi.fn()}
          accounts={accounts}
          selectedAccountIds={[]}
          onAccountChange={vi.fn()}
          hasMore={false}
          isExpanded={false}
          onToggleExpand={vi.fn()}
          isLoadingMore={false}
          onLoadMore={vi.fn()}
        />,
      );

      expect(screen.queryByText('更多')).not.toBeInTheDocument();
      expect(screen.queryByText('收起')).not.toBeInTheDocument();
    });

    it('无更多时不显示加载中状态', () => {
      const accounts = mockAccounts.slice(0, 3);

      render(
        <PublishConfig
          selectedPlatform="all"
          onPlatformChange={vi.fn()}
          accounts={accounts}
          selectedAccountIds={[]}
          onAccountChange={vi.fn()}
          hasMore={false}
          isExpanded={true}
          onToggleExpand={vi.fn()}
          isLoadingMore={false}
          onLoadMore={vi.fn()}
        />,
      );

      expect(screen.queryByText('加载中...')).not.toBeInTheDocument();
    });

    it('hasMore 为 true 时显示更多按钮', () => {
      const accounts = mockAccounts.slice(0, 10);

      render(
        <PublishConfig
          selectedPlatform="all"
          onPlatformChange={vi.fn()}
          accounts={accounts}
          selectedAccountIds={[]}
          onAccountChange={vi.fn()}
          hasMore={true}
          isExpanded={false}
          onToggleExpand={vi.fn()}
          isLoadingMore={false}
          onLoadMore={vi.fn()}
        />,
      );

      expect(screen.getByText('更多')).toBeInTheDocument();
    });

    it('isExpanded 为 true 时显示收起按钮', () => {
      const accounts = mockAccounts.slice(0, 10);

      render(
        <PublishConfig
          selectedPlatform="all"
          onPlatformChange={vi.fn()}
          accounts={accounts}
          selectedAccountIds={[]}
          onAccountChange={vi.fn()}
          hasMore={true}
          isExpanded={true}
          onToggleExpand={vi.fn()}
          isLoadingMore={false}
          onLoadMore={vi.fn()}
        />,
      );

      expect(screen.getByText('收起')).toBeInTheDocument();
    });
  });
});
