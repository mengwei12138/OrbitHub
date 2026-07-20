import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import PendingTab from '../index';

const accountOpts = [{ label: '全部', value: '' }];

const mockQueryOptions = vi.fn().mockReturnValue({
  queryKey: ['test'],
  queryFn: async () => ({
    list: [],
    total: 0,
  }),
});

describe('PendingTab', () => {
  describe('筛选器', () => {
    it('应显示账号筛选下拉框', () => {
      render(
        <PendingTab
          accountFilterOptions={accountOpts}
          queryOptions={mockQueryOptions}
        />,
      );

      const accountLabels = screen.getAllByText('账号');
      expect(accountLabels.length).toBeGreaterThan(0);
    });
  });
});
