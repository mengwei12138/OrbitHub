import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { PLACEHOLDER } from '@/constants';
import type { PublishRecordMetricsSnapshotData } from '@/services/content/types';

import PerformanceCard from '../index';

const mockPerformanceData: PublishRecordMetricsSnapshotData = {
  recordId: '123',
  viewCount: '10000',
  likeCount: '500',
  commentCount: '100',
  shareCount: '50',
  collectCount: '200',
  newFollowersCount: '200',
  engagementRatePercent: '6.5',
  syncedAt: '2026-03-09 15:30',
  metricsSyncStopped: false,
};

describe('PerformanceCard 组件', () => {
  it('应正确渲染数据表现标题', () => {
    render(<PerformanceCard data={mockPerformanceData} />);
    expect(screen.getByText('数据表现')).toBeInTheDocument();
  });

  it('应正确渲染最后同步时间', () => {
    render(<PerformanceCard data={mockPerformanceData} />);
    expect(screen.getByText(/最后同步：/u)).toBeInTheDocument();
  });

  it('应正确渲染播放量', () => {
    render(<PerformanceCard data={mockPerformanceData} />);
    expect(screen.getAllByText('播放量').length).toBeGreaterThan(0);
  });

  it('应正确渲染指标数值', () => {
    render(<PerformanceCard data={mockPerformanceData} />);
    expect(screen.getByText('10000')).toBeInTheDocument();
  });

  it(`待审核状态应显示${PLACEHOLDER}`, () => {
    const pendingData: PublishRecordMetricsSnapshotData = {
      ...mockPerformanceData,
      viewCount: undefined,
      likeCount: undefined,
      commentCount: undefined,
      shareCount: undefined,
      collectCount: undefined,
      newFollowersCount: undefined,
      engagementRatePercent: undefined,
    };
    render(<PerformanceCard data={pendingData} isPendingReview />);
    expect(screen.getAllByText(PLACEHOLDER).length).toBeGreaterThan(0);
  });

  it('应显示停止同步tips', () => {
    const stoppedData: PublishRecordMetricsSnapshotData = {
      ...mockPerformanceData,
      metricsSyncStopped: true,
    };
    render(<PerformanceCard data={stoppedData} />);
    expect(screen.getByText(/数据已停止同步/u)).toBeInTheDocument();
  });
});
