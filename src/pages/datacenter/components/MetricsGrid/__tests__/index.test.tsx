import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import MetricsGrid from '../index';

describe('MetricsGrid 组件', () => {
  const mockMetrics = [
    {
      key: 'play',
      title: '总播放量',
      value: '1,258,380',
      delta: '+12.5%',
      deltaType: 'up' as const,
      icon: '/images/icon-play.svg',
      iconBgColor: '#E6F7FF',
    },
    {
      key: 'like',
      title: '总点赞量',
      value: '89,234',
      delta: '-3.2%',
      deltaType: 'down' as const,
      icon: '/images/icon-like.svg',
      iconBgColor: '#FFF1F0',
    },
  ];

  it('正确渲染指标卡片', () => {
    render(<MetricsGrid metrics={mockMetrics} />);

    expect(screen.getByText('总播放量')).toBeInTheDocument();
    expect(screen.getByText('1,258,380')).toBeInTheDocument();
    expect(screen.getByText('+12.5%')).toBeInTheDocument();
  });

  it('正增长显示正确颜色', () => {
    render(<MetricsGrid metrics={[mockMetrics[0]]} />);

    const deltaElement = screen.getByText('+12.5%');
    expect(deltaElement.className).toContain('up');
  });

  it('负增长显示正确颜色', () => {
    render(<MetricsGrid metrics={[mockMetrics[1]]} />);

    const deltaElement = screen.getByText('-3.2%');
    expect(deltaElement.className).toContain('down');
  });

  it('渲染多个指标卡片', () => {
    const sixMetrics = [
      ...mockMetrics,
      {
        key: 'comment',
        title: '总评论量',
        value: '12,456',
        icon: '/images/icon-comment.svg',
        iconBgColor: '#F6FFED',
      },
    ];

    render(<MetricsGrid metrics={sixMetrics} />);

    expect(screen.getByText('总评论量')).toBeInTheDocument();
  });

  it('近7天时间筛选下环比文案为与前7天对比', () => {
    render(<MetricsGrid metrics={mockMetrics} timeRange="last7days" />);

    expect(screen.getAllByText('与前7天对比')).toHaveLength(2);
  });

  it('默认今日筛选下环比文案为较昨日', () => {
    render(<MetricsGrid metrics={mockMetrics} />);

    expect(screen.getAllByText('较昨日')).toHaveLength(2);
  });
});
