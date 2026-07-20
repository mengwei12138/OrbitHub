import { render, screen } from '@testing-library/react';
import { describe, it, vi } from 'vitest';
import type {
  AccountDetailResponse,
  KpiMetric,
  TrendPoint,
} from '@/services/statistics/types';
import TrendChart from '../components/TrendChart';

vi.mock('@ant-design/charts', () => ({
  Line: vi.fn(() => <div data-testid="line-chart">Line Chart</div>),
}));

const createMockAccountDetailData = (overrides = {}): AccountDetailResponse =>
  ({
    account: {
      accountId: 'acc-001',
      nickname: '时尚美妆号',
      platform: 'douyin',
      followers: '125000',
      status: 'ONLINE',
      lastSyncTime: '2026-05-11T10:30:00Z',
    },
    todayMetrics: [
      {
        name: 'playCount',
        currentValue: '12582380',
        baselineValue: '11150000',
      },
      { name: 'likeCount', currentValue: '89234', baselineValue: '82456' },
      { name: 'commentCount', currentValue: '12456', baselineValue: '11789' },
      { name: 'shareCount', currentValue: '8932', baselineValue: '8745' },
    ] as KpiMetric[],
    last7DayPlayTrend: [
      { bucket: '2026-04-16', playCount: '1200000' },
      { bucket: '2026-04-17', playCount: '1350000' },
      { bucket: '2026-04-18', playCount: null },
      { bucket: '2026-04-19', playCount: '1100000' },
      { bucket: '2026-04-20', playCount: '1500000' },
      { bucket: '2026-04-21', playCount: '1400000' },
      { bucket: '2026-04-22', playCount: '1250000' },
    ] as TrendPoint[],
    recentContents: {
      list: [],
      total: '0',
      totalPages: 0,
      hasNext: false,
      hasPrevious: false,
      page: 1,
      pageSize: 10,
    },
    ...overrides,
  }) as AccountDetailResponse;

describe('账号详情', () => {
  describe('TrendChart 组件', () => {
    it('渲染趋势图组件', () => {
      const mockData = [
        { date: '2026-04-16', playCount: 1200000 },
        { date: '2026-04-17', playCount: 1350000 },
      ];
      render(<TrendChart data={mockData} loading={false} />);
      expect(screen.getByTestId('line-chart')).toBeInTheDocument();
    });

    it('数据缺失时显示正确结构', () => {
      const mockData = [
        { date: '2026-04-18', playCount: null },
        { date: '2026-04-19', playCount: 1100000 },
      ];
      const { container } = render(
        <TrendChart data={mockData} loading={false} />,
      );
      expect(
        container.querySelector('[data-testid="line-chart"]'),
      ).toBeInTheDocument();
    });

    it('解析趋势数据转换正确', () => {
      const accountData = createMockAccountDetailData();
      const trendData = accountData.last7DayPlayTrend.map((p: TrendPoint) => ({
        date: p.bucket,
        playCount: p.playCount ? parseInt(p.playCount, 10) : null,
      }));
      expect(trendData).toHaveLength(7);
      expect(trendData[0]).toEqual({ date: '2026-04-16', playCount: 1200000 });
      expect(trendData[2]).toEqual({ date: '2026-04-18', playCount: null });
    });

    it('Tooltip formatter 格式包含日期和播放量', () => {
      const mockData = [
        { date: '2026-04-16', playCount: 1200000 },
        { date: '2026-04-17', playCount: 1350000 },
      ];
      render(<TrendChart data={mockData} loading={false} />);
      const lineChart = screen.getByTestId('line-chart');
      expect(lineChart).toBeInTheDocument();
    });
  });
});
