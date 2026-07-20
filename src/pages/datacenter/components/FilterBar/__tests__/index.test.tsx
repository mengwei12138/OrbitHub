import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import FilterBar from '../index';

describe('FilterBar 组件', () => {
  it('正确渲染时间筛选和平台筛选标签', () => {
    render(
      <FilterBar
        timeRange="today"
        platform="all"
        onTimeRangeChange={vi.fn()}
        onPlatformChange={vi.fn()}
      />,
    );

    expect(screen.getByText('时间')).toBeInTheDocument();
    expect(screen.getByText('平台')).toBeInTheDocument();
  });

  it('正确渲染两个选择器', () => {
    render(
      <FilterBar
        timeRange="today"
        platform="all"
        onTimeRangeChange={vi.fn()}
        onPlatformChange={vi.fn()}
      />,
    );

    const selects = screen.getAllByRole('combobox');
    expect(selects).toHaveLength(2);
  });
});
