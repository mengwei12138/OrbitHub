import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@ant-design/charts', () => ({
  Line: vi.fn(() => <div data-testid="line-chart">Line Chart</div>),
}));

import PlayTrendChart from '../index';

describe('PlayTrendChart 组件', () => {
  it('正确渲染标题', () => {
    render(<PlayTrendChart data={[]} />);

    expect(screen.getByText('播放趋势')).toBeInTheDocument();
  });

  it('正确渲染账号标签', () => {
    render(<PlayTrendChart data={[]} />);

    expect(screen.getByText('账号')).toBeInTheDocument();
  });

  it('正确渲染图表区域', () => {
    render(<PlayTrendChart data={[]} />);

    expect(screen.getByTestId('line-chart')).toBeInTheDocument();
  });
});
