import { render, screen } from '@testing-library/react';
import StatsBoard from '../index';

vi.mock('@/components/CustomProTable', () => ({
  default: vi.fn(() => <div data-testid="pro-table" />),
}));

describe('StatsBoard', () => {
  const mockStats = [
    { value: 4, label: '总租户数', delta: '较上月 +1' },
    { value: 128, label: '总账号数', delta: '较上月 +12' },
    { value: 1056, label: '今日内容发布量', delta: '较昨日 +56' },
    { value: '98.5%', label: '系统健康度' },
  ];

  it('应渲染所有统计卡片', () => {
    render(<StatsBoard stats={mockStats} />);
    expect(screen.getByText('总租户数')).toBeInTheDocument();
    expect(screen.getByText('总账号数')).toBeInTheDocument();
    expect(screen.getByText('今日内容发布量')).toBeInTheDocument();
    expect(screen.getByText('系统健康度')).toBeInTheDocument();
  });

  it('应渲染统计数值', () => {
    render(<StatsBoard stats={mockStats} />);
    expect(screen.getByText('4')).toBeInTheDocument();
    expect(screen.getByText('128')).toBeInTheDocument();
    expect(screen.getByText('1056')).toBeInTheDocument();
    expect(screen.getByText('98.5%')).toBeInTheDocument();
  });

  it('应渲染变化值', () => {
    render(<StatsBoard stats={mockStats} />);
    expect(screen.getByText('较上月 +1')).toBeInTheDocument();
    expect(screen.getByText('较上月 +12')).toBeInTheDocument();
    expect(screen.getByText('较昨日 +56')).toBeInTheDocument();
  });

  it('应渲染图标', () => {
    render(<StatsBoard stats={mockStats} />);
    const icons = document.querySelectorAll('svg');
    expect(icons.length).toBeGreaterThan(0);
  });
});
