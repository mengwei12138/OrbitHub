import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { PLACEHOLDER } from '@/constants';
import type { PublishRecordMetricsSnapshotData } from '@/services/content/types';
import { formatDateTimeMinute } from '@/utils/date';
import PerformanceCard from '../components/PerformanceCard';
import PublishInfoCard from '../components/PublishInfoCard';

const mockPublishInfo = {
  accountNickname: '测试账号',
  platform: 'douyin' as const,
  publishedAt: '2026-04-30T12:57:41.847Z',
  platformPublishedAt: '2026-04-30T13:00:00.000Z',
  status: 'PUBLISH_SUCCESS' as const,
  stage: 'PUBLISHED' as const,
  coverUrl: 'https://example.com/cover.jpg',
};

const mockMetricsData: PublishRecordMetricsSnapshotData = {
  recordId: '123',
  viewCount: '10000',
  likeCount: '500',
  commentCount: '100',
  shareCount: '50',
  collectCount: '200',
  newFollowersCount: '200',
  engagementRatePercent: '6.5',
  syncedAt: '2026-04-30T14:30:00.000Z',
  metricsSyncStopped: false,
};

describe('发布详情-日期格式验证', () => {
  describe('formatDateTimeMinute', () => {
    it('应格式化为 YYYY-MM-DD HH:mm（无秒）', () => {
      expect(formatDateTimeMinute('2026-04-30T12:57:41.847Z')).toBe(
        '2026-04-30 20:57',
      );
    });

    it('应正确处理 ISO 字符串', () => {
      const result = formatDateTimeMinute('2026-04-30T12:57:41.847Z');
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/u);
    });
  });

  describe('PublishInfoCard-发布时间格式', () => {
    it('发布时间应格式化为 YYYY-MM-DD HH:mm', () => {
      render(<PublishInfoCard data={mockPublishInfo} />);
      expect(screen.getByText(/2026-04-30 20:57/u)).toBeInTheDocument();
    });

    it('平台发布时间应格式化为 YYYY-MM-DD HH:mm', () => {
      render(<PublishInfoCard data={mockPublishInfo} />);
      expect(screen.getByText(/2026-04-30 21:00/u)).toBeInTheDocument();
    });

    it('publishedAt 为空时应显示占位符', () => {
      const dataWithoutPublishedAt = {
        accountNickname: '测试账号',
        platform: 'douyin' as const,
        publishedAt: undefined as unknown as string,
        status: 'PUBLISH_SUCCESS' as const,
        stage: 'PUBLISHED' as const,
      };
      render(<PublishInfoCard data={dataWithoutPublishedAt} />);
      expect(screen.getAllByText(PLACEHOLDER).length).toBeGreaterThan(0);
    });

    it('platformPublishedAt 为空时不应显示平台发布时间', () => {
      const dataWithoutPlatformTime = {
        accountNickname: '测试账号',
        platform: 'douyin' as const,
        publishedAt: '2026-04-30T12:57:41.847Z',
        status: 'PUBLISH_SUCCESS' as const,
        stage: 'PUBLISHED' as const,
      };
      render(<PublishInfoCard data={dataWithoutPlatformTime} />);
      expect(screen.queryByText(/平台发布时间/u)).not.toBeInTheDocument();
    });
  });

  describe('PerformanceCard-最后同步时间格式', () => {
    it('最后同步时间应格式化为 YYYY-MM-DD HH:mm', () => {
      render(<PerformanceCard data={mockMetricsData} />);
      expect(
        screen.getByText(/最后同步：2026-04-30 22:30/u),
      ).toBeInTheDocument();
    });

    it('syncedAt 为空时应显示占位符', () => {
      const dataWithoutSyncedAt: PublishRecordMetricsSnapshotData = {
        recordId: '123',
        viewCount: '10000',
        likeCount: '500',
        commentCount: '100',
        shareCount: '50',
        collectCount: '200',
        newFollowersCount: '200',
        engagementRatePercent: '6.5',
        syncedAt: undefined as unknown as string,
        metricsSyncStopped: false,
      };
      render(<PerformanceCard data={dataWithoutSyncedAt} />);
      expect(
        screen.getByText(new RegExp(`最后同步：${PLACEHOLDER}`, 'u')),
      ).toBeInTheDocument();
    });
  });
});
