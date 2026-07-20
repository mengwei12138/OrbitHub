import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import HistoryTab from '../index';

const mockQueryOptions = vi.fn().mockReturnValue({
  queryKey: ['test'],
  queryFn: async () => ({
    list: [],
    total: 0,
  }),
});

describe('HistoryTab', () => {
  describe('筛选器', () => {
    it('应显示账号筛选下拉框', () => {
      render(
        <HistoryTab
          accountFilterOptions={[{ label: '全部', value: '' }]}
          queryOptions={mockQueryOptions}
        />,
      );

      const accountLabels = screen.getAllByText('账号');
      expect(accountLabels.length).toBeGreaterThan(0);
    });

    it('应显示类型筛选下拉框', () => {
      render(
        <HistoryTab
          accountFilterOptions={[{ label: '全部', value: '' }]}
          queryOptions={mockQueryOptions}
        />,
      );

      const typeLabels = screen.getAllByText('类型');
      expect(typeLabels.length).toBeGreaterThan(0);
    });

    it('应显示处理状态筛选下拉框', () => {
      render(
        <HistoryTab
          accountFilterOptions={[{ label: '全部', value: '' }]}
          queryOptions={mockQueryOptions}
        />,
      );

      const statusLabels = screen.getAllByText('处理状态');
      expect(statusLabels.length).toBeGreaterThan(0);
    });

    it('应显示搜索评论内容输入框', () => {
      render(
        <HistoryTab
          accountFilterOptions={[{ label: '全部', value: '' }]}
          queryOptions={mockQueryOptions}
        />,
      );

      const searchInput = document.querySelector(
        'input[placeholder="搜索评论内容"]',
      );
      expect(searchInput).toBeTruthy();
    });

    it('应显示重置和查询按钮', () => {
      render(
        <HistoryTab
          accountFilterOptions={[{ label: '全部', value: '' }]}
          queryOptions={mockQueryOptions}
        />,
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
