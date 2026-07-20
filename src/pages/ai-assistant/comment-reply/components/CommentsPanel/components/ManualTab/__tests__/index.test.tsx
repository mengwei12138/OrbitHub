import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';

import ManualTab from '../index';

const mockQueryOptions = vi.fn().mockReturnValue({
  queryKey: ['test'],
  queryFn: async () => ({
    list: [],
    total: 0,
  }),
});

const createWrapper = () => {
  const client = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
};

describe('ManualTab', () => {
  describe('筛选器', () => {
    it('应显示账号筛选下拉框', () => {
      const Wrapper = createWrapper();
      render(
        <ManualTab
          accountFilterOptions={[{ label: '全部', value: '' }]}
          queryOptions={mockQueryOptions}
        />,
        { wrapper: Wrapper },
      );

      const accountLabels = screen.getAllByText('账号');
      expect(accountLabels.length).toBeGreaterThan(0);
    });

    it('应显示类型筛选下拉框', () => {
      const Wrapper = createWrapper();
      render(
        <ManualTab
          accountFilterOptions={[{ label: '全部', value: '' }]}
          queryOptions={mockQueryOptions}
        />,
        { wrapper: Wrapper },
      );

      const typeLabels = screen.getAllByText('类型');
      expect(typeLabels.length).toBeGreaterThan(0);
    });

    it('应显示处理状态筛选下拉框', () => {
      const Wrapper = createWrapper();
      render(
        <ManualTab
          accountFilterOptions={[{ label: '全部', value: '' }]}
          queryOptions={mockQueryOptions}
        />,
        { wrapper: Wrapper },
      );

      const statusLabels = screen.getAllByText('处理状态');
      expect(statusLabels.length).toBeGreaterThan(0);
    });

    it('应显示搜索评论内容输入框', () => {
      const Wrapper = createWrapper();
      render(
        <ManualTab
          accountFilterOptions={[{ label: '全部', value: '' }]}
          queryOptions={mockQueryOptions}
        />,
        { wrapper: Wrapper },
      );

      const searchInput = document.querySelector(
        'input[placeholder="搜索评论内容"]',
      );
      expect(searchInput).toBeTruthy();
    });

    it('应显示重置和查询按钮', () => {
      const Wrapper = createWrapper();
      render(
        <ManualTab
          accountFilterOptions={[{ label: '全部', value: '' }]}
          queryOptions={mockQueryOptions}
        />,
        { wrapper: Wrapper },
      );

      const buttons = document.querySelectorAll('button');
      const buttonTexts = Array.from(buttons).map((b) =>
        b.textContent?.replace(/\s/gu, ''),
      );
      expect(buttonTexts).toContain('重置');
      expect(buttonTexts).toContain('查询');
    });
  });
});
