import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import AccountSelector from '../index';

const mockQueryOptions = vi.fn().mockReturnValue({
  queryKey: ['test'],
  queryFn: async () => ({
    list: [],
    total: 0,
  }),
});

const createWrapper = () => {
  const queryClient = new QueryClient();
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('AccountSelector', () => {
  describe('渲染', () => {
    it('应显示标题', () => {
      render(<AccountSelector queryOptions={mockQueryOptions} />, {
        wrapper: createWrapper(),
      });

      const title = document.querySelector('[class*="_title_"]');
      expect(title?.textContent).toBe('账号选择');
    });

    it('应显示副标题', () => {
      render(<AccountSelector queryOptions={mockQueryOptions} />, {
        wrapper: createWrapper(),
      });

      const subTitle = document.querySelector('[class*="_subTitle_"]');
      expect(subTitle?.textContent).toBe('（当前仅展示在线账号）');
    });

    it('应显示搜索框', () => {
      render(<AccountSelector queryOptions={mockQueryOptions} />, {
        wrapper: createWrapper(),
      });

      const searchInput = document.querySelector(
        'input[placeholder="搜索账号..."]',
      );
      expect(searchInput).toBeTruthy();
    });

    it('应显示平台标签', () => {
      render(<AccountSelector queryOptions={mockQueryOptions} />, {
        wrapper: createWrapper(),
      });

      const tags = document.querySelectorAll('.ant-tag');
      expect(tags.length).toBeGreaterThan(0);
    });

    it('应显示表格', () => {
      render(<AccountSelector queryOptions={mockQueryOptions} />, {
        wrapper: createWrapper(),
      });

      const table = document.querySelector('.ant-table');
      expect(table).toBeTruthy();
    });
  });

  describe('选中状态', () => {
    it('应支持传入 selectedIds 属性', () => {
      render(
        <AccountSelector
          queryOptions={mockQueryOptions}
          selectedIds={['1', '2']}
        />,
        { wrapper: createWrapper() },
      );

      const wrapper = document.querySelector('[class*="_wrapper_"]');
      expect(wrapper).toBeTruthy();
    });
  });
});
