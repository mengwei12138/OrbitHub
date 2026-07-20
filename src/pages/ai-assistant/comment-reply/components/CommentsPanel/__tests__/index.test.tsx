import { render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import CommentsPanel from '../index';

const mockQueryOptions = vi.fn().mockReturnValue({
  queryKey: ['test'],
  queryFn: async () => ({
    list: [],
    total: 0,
  }),
});

const baseProps = {
  tab: 'pending' as const,
  onTabChange: vi.fn(),
  stats: { pending: 0, humanReview: 0 },
  pendingQueryOptions: mockQueryOptions,
  humanQueryOptions: mockQueryOptions,
  historyQueryOptions: mockQueryOptions,
  accountFilterOptions: [{ label: '全部', value: '' }],
  onAutoReply: vi.fn(),
  onManualReplySubmit: vi.fn(),
  onDelete: vi.fn(),
  onHumanConfirm: vi.fn(),
  onHumanSkip: vi.fn(),
};

describe('CommentsPanel', () => {
  describe('Tab 切换', () => {
    it('应显示三个 Tab', () => {
      render(<CommentsPanel {...baseProps} />);

      const tabs = document.querySelectorAll('[class*="_tabItem_"]');
      expect(tabs.length).toBe(3);
    });

    it('应显示待回复评论 Tab', () => {
      render(<CommentsPanel {...baseProps} />);

      const tabNames = Array.from(
        document.querySelectorAll('[class*="_tabItem_"]'),
      ).map((t) => t.textContent);
      expect(tabNames.some((name) => name?.includes('待回复评论'))).toBe(true);
    });

    it('应显示待人工处理 Tab', () => {
      render(<CommentsPanel {...baseProps} />);

      const tabNames = Array.from(
        document.querySelectorAll('[class*="_tabItem_"]'),
      ).map((t) => t.textContent);
      expect(tabNames.some((name) => name?.includes('待人工处理'))).toBe(true);
    });

    it('应显示回复记录 Tab', () => {
      render(<CommentsPanel {...baseProps} />);

      const tabNames = Array.from(
        document.querySelectorAll('[class*="_tabItem_"]'),
      ).map((t) => t.textContent);
      expect(tabNames.some((name) => name?.includes('回复记录'))).toBe(true);
    });

    it('应显示 badge 数字', () => {
      render(
        <CommentsPanel {...baseProps} stats={{ pending: 5, humanReview: 3 }} />,
      );

      const badges = document.querySelectorAll('[class*="_badge_"]');
      expect(badges.length).toBeGreaterThan(0);
    });
  });

  describe('内容区', () => {
    it('默认显示 PendingTab', () => {
      render(<CommentsPanel {...baseProps} />);

      const filterLabels = document.querySelectorAll(
        '[class*="_filterLabel_"]',
      );
      expect(filterLabels.length).toBeGreaterThan(0);
    });
  });
});
