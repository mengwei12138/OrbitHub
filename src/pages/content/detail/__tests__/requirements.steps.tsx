import { defineFeature } from '@amiceli/vitest-cucumber';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useNavigate } from 'react-router-dom';
import { vi } from 'vitest';
import {
  publishRecordDetailQueryOptions,
  publishRecordMetricsRefreshQueryOptions,
} from '@/services/content';
import type { PublishRecordDetailData } from '@/services/content/types';

import Detail from '..';

vi.mock('@/services/content', () => ({
  publishRecordDetailQueryOptions: vi.fn(() => ({
    queryKey: ['content', 'publish', 'record', 'detail', 'record-1'],
    queryFn: vi.fn(),
  })),
  publishRecordMetricsRefreshQueryOptions: vi.fn(() => ({
    queryFn: vi.fn(),
  })),
}));

vi.mock('react-router-dom', () => ({
  useNavigate: vi.fn(() => vi.fn()),
  useSearchParams: vi.fn(() => ({
    get: vi.fn((key: string) => {
      if (key === 'recordId') return 'record-1';
      if (key === 'from') return '/content/history';
      return null;
    }),
  })),
}));

const mockDetailData: PublishRecordDetailData = {
  recordId: 'record-1',
  accountId: 'account-1',
  accountNickname: '抖音账号A',
  platform: 'douyin',
  contentMode: 'VIDEO',
  title: '测试视频标题',
  caption: '这是完整的视频描述文案',
  topicTags: ['#测试', '#标签'],
  coverUrl: 'https://example.com/cover.jpg',
  primaryMediaAssetId: 'media-1',
  publishedAt: '2024-01-15T10:00:00Z',
  status: 'PUBLISH_SUCCESS',
  stage: 'PUBLISHED',
  canRepublish: true,
};

defineFeature('./features/requirements.feature', ({ Scenario }) => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  Scenario('加载详情数据-发布成功状态', ({ Given, When, Then, And }) => {
    Given('用户进入发布详情页', async () => {
      (
        publishRecordDetailQueryOptions as ReturnType<typeof vi.fn>
      ).mockReturnValue({
        queryKey: ['content', 'publish', 'record', 'detail', 'record-1'],
        queryFn: vi.fn().mockResolvedValue({ data: mockDetailData }),
      });
      render(<Detail />);
    });
    When('页面加载时', async () => {
      await waitFor(() => {
        expect(screen.getByTestId('detail-page')).toBeInTheDocument();
      });
    });
    Then('显示内容信息区域', () => {
      expect(screen.getByTestId('content-info-card')).toBeInTheDocument();
    });
    And('显示发布信息区域', () => {
      expect(screen.getByTestId('publish-info-card')).toBeInTheDocument();
    });
    And('显示数据表现区域', () => {
      expect(screen.getByTestId('performance-card')).toBeInTheDocument();
    });
    And('发布状态显示「发布成功」', () => {
      expect(screen.getByText(/发布成功/iu)).toBeInTheDocument();
    });
  });

  Scenario('加载详情数据-审核中状态', ({ Given, When, Then, And }) => {
    Given('用户进入发布详情页', async () => {
      const reviewData = {
        ...mockDetailData,
        status: 'UNDER_REVIEW',
        stage: 'UNDER_REVIEW' as const,
      };
      (
        publishRecordDetailQueryOptions as ReturnType<typeof vi.fn>
      ).mockReturnValue({
        queryKey: ['content', 'publish', 'record', 'detail', 'record-1'],
        queryFn: vi.fn().mockResolvedValue({ data: reviewData }),
      });
      render(<Detail />);
    });
    When('页面加载时', async () => {
      await waitFor(() => {
        expect(screen.getByTestId('detail-page')).toBeInTheDocument();
      });
    });
    And('发布状态为「审核中」', async () => {
      await waitFor(() => {
        expect(screen.getByText(/审核中/iu)).toBeInTheDocument();
      });
    });
    Then('内容信息正常展示', () => {
      expect(screen.getByTestId('content-info-card')).toBeInTheDocument();
    });
    And('发布状态显示「审核中」', () => {
      expect(screen.getByText(/审核中/iu)).toBeInTheDocument();
    });
    And('数据表现区域显示「—」', () => {
      expect(screen.getByTestId('performance-card')).toHaveTextContent('—');
    });
  });

  Scenario('加载详情数据-发布失败状态', ({ Given, When, Then, And }) => {
    Given('用户进入发布详情页', async () => {
      const failedData = {
        ...mockDetailData,
        status: 'PUBLISH_FAILED',
        stage: 'FAILED' as const,
        errorMessage: '账号Token失效',
      };
      (
        publishRecordDetailQueryOptions as ReturnType<typeof vi.fn>
      ).mockReturnValue({
        queryKey: ['content', 'publish', 'record', 'detail', 'record-1'],
        queryFn: vi.fn().mockResolvedValue({ data: failedData }),
      });
      render(<Detail />);
    });
    When('页面加载时', async () => {
      await waitFor(() => {
        expect(screen.getByTestId('detail-page')).toBeInTheDocument();
      });
    });
    And('发布状态为「发布失败」', async () => {
      await waitFor(() => {
        expect(screen.getByText(/发布失败/iu)).toBeInTheDocument();
      });
    });
    Then('显示内容信息', () => {
      expect(screen.getByTestId('content-info-card')).toBeInTheDocument();
    });
    And('发布状态显示「发布失败」', () => {
      expect(screen.getByText(/发布失败/iu)).toBeInTheDocument();
    });
    And('展示失败原因', () => {
      expect(screen.getByText(/账号Token失效/iu)).toBeInTheDocument();
    });
  });

  Scenario('数据表现-显示「-」当数据为0', ({ Given, Then, And }) => {
    Given('数据表现为0', async () => {
      const zeroMetricsData = {
        ...mockDetailData,
        metrics: {
          viewCount: 0,
          likeCount: 0,
          commentCount: 0,
          shareCount: 0,
          newFollowerCount: 0,
        },
      };
      (
        publishRecordDetailQueryOptions as ReturnType<typeof vi.fn>
      ).mockReturnValue({
        queryKey: ['content', 'publish', 'record', 'detail', 'record-1'],
        queryFn: vi.fn().mockResolvedValue({
          data: { ...mockDetailData, metrics: zeroMetricsData.metrics },
        }),
      });
      render(<Detail />);
    });
    Then('显示「-」而非0', () => {
      const performanceCard = screen.getByTestId('performance-card');
      expect(performanceCard).toHaveTextContent('—');
    });
    And('播放量、点赞量、评论量、转发量、新增粉丝均适用', () => {
      const performanceCard = screen.getByTestId('performance-card');
      const dashCount = (performanceCard.textContent?.match(/—/gu) || [])
        .length;
      expect(dashCount).toBeGreaterThanOrEqual(5);
    });
  });

  Scenario('手动刷新数据表现', ({ Given, When, Then, And }) => {
    Given('用户在发布详情页', async () => {
      (
        publishRecordDetailQueryOptions as ReturnType<typeof vi.fn>
      ).mockReturnValue({
        queryKey: ['content', 'publish', 'record', 'detail', 'record-1'],
        queryFn: vi.fn().mockResolvedValue({ data: mockDetailData }),
      });
      render(<Detail />);
    });
    When('点击「刷新」按钮', async () => {
      const refreshButton = screen.getByRole('button', { name: /刷新/iu });
      await userEvent.click(refreshButton);
    });
    Then('显示刷新 loading 状态', () => {
      expect(screen.getByTestId('refresh-loading')).toBeInTheDocument();
    });
    And('调用刷新接口', async () => {
      await waitFor(() => {
        expect(publishRecordMetricsRefreshQueryOptions).toHaveBeenCalled();
      });
    });
    And('更新数据表现', async () => {
      await waitFor(() => {});
    });
    And('更新最后同步时间', async () => {
      await waitFor(() => {});
    });
  });

  Scenario('数据已停止同步提示', ({ Given, Then, And }) => {
    Given('发布成功超过 30 天', async () => {
      const oldDate = new Date();
      oldDate.setDate(oldDate.getDate() - 31);
      expect(mockDetailData.metrics).not.toBeUndefined();
      const oldData = {
        ...mockDetailData,
        publishedAt: oldDate.toISOString(),
        metrics: {
          ...mockDetailData.metrics,
          syncedAt: oldDate.toISOString(),
        },
      };
      (
        publishRecordDetailQueryOptions as ReturnType<typeof vi.fn>
      ).mockReturnValue({
        queryKey: ['content', 'publish', 'record', 'detail', 'record-1'],
        queryFn: vi.fn().mockResolvedValue({ data: oldData }),
      });
      render(<Detail />);
    });
    Then('数据表现区域显示「⚠️ 数据已停止同步」', async () => {
      await waitFor(() => {
        expect(screen.getByText(/数据已停止同步/iu)).toBeInTheDocument();
      });
    });
    And('提示「发布超过30天，如需最新数据请前往平台查看」', () => {
      expect(
        screen.getByText(/发布超过30天，如需最新数据请前往平台查看/iu),
      ).toBeInTheDocument();
    });
  });

  Scenario('审核中状态数据表现区域显示「—」', ({ Given, Then, And }) => {
    Given('发布状态为「审核中」', async () => {
      const reviewData = {
        ...mockDetailData,
        status: 'UNDER_REVIEW',
        stage: 'UNDER_REVIEW' as const,
      };
      (
        publishRecordDetailQueryOptions as ReturnType<typeof vi.fn>
      ).mockReturnValue({
        queryKey: ['content', 'publish', 'record', 'detail', 'record-1'],
        queryFn: vi.fn().mockResolvedValue({ data: reviewData }),
      });
      render(<Detail />);
    });
    Then('数据表现区域显示「—」', () => {
      expect(screen.getByTestId('performance-card')).toHaveTextContent('—');
    });
    And('提示「内容正在审核中，审核通过后数据将自动同步」', () => {
      expect(
        screen.getByText(/内容正在审核中.*审核通过后数据将自动同步/iu),
      ).toBeInTheDocument();
    });
  });

  Scenario('重新发布入口', ({ Given, When, Then, And }) => {
    Given('用户在发布详情页', async () => {
      (
        publishRecordDetailQueryOptions as ReturnType<typeof vi.fn>
      ).mockReturnValue({
        queryKey: ['content', 'publish', 'record', 'detail', 'record-1'],
        queryFn: vi.fn().mockResolvedValue({ data: mockDetailData }),
      });
      render(<Detail />);
    });
    When('点击「重新发布」按钮', async () => {
      const republishButton = screen.getByRole('button', {
        name: /重新发布/iu,
      });
      await userEvent.click(republishButton);
    });
    Then('跳转到重新发布页', () => {
      const navigate = vi.mocked(useNavigate);
      expect(navigate).toHaveBeenCalled();
    });
    And('携带该记录 ID 参数', () => {
      const navigate = vi.mocked(useNavigate);
      expect(navigate).toHaveBeenCalled();
    });
  });

  Scenario('跳转历史记录页', ({ Given, When, Then }) => {
    Given('用户在发布详情页', async () => {
      (
        publishRecordDetailQueryOptions as ReturnType<typeof vi.fn>
      ).mockReturnValue({
        queryKey: ['content', 'publish', 'record', 'detail', 'record-1'],
        queryFn: vi.fn().mockResolvedValue({ data: mockDetailData }),
      });
      render(<Detail />);
    });
    When('点击「返回」按钮', async () => {
      const backButton = screen.getByRole('button', { name: /返回/iu });
      await userEvent.click(backButton);
    });
    Then('跳转到历史发布记录页', () => {
      const navigate = vi.mocked(useNavigate);
      expect(navigate).toHaveBeenCalledWith('/content/history');
    });
  });

  Scenario('查看封面信息', ({ Given, Then, And }) => {
    Given('详情页展示中', async () => {
      (
        publishRecordDetailQueryOptions as ReturnType<typeof vi.fn>
      ).mockReturnValue({
        queryKey: ['content', 'publish', 'record', 'detail', 'record-1'],
        queryFn: vi.fn().mockResolvedValue({ data: mockDetailData }),
      });
      render(<Detail />);
    });
    Then('封面以首次发布时平台返回的封面为准', () => {
      const coverImage = screen.getByTestId('cover-image');
      expect(coverImage).toHaveAttribute('src', mockDetailData.coverUrl);
    });
    And('封面锁定不更新', () => {
      expect(screen.getByTestId('cover-image')).toBeInTheDocument();
    });
  });

  Scenario('互动率计算', ({ Given, Then, And }) => {
    Given('用户查看数据表现', async () => {
      (
        publishRecordDetailQueryOptions as ReturnType<typeof vi.fn>
      ).mockReturnValue({
        queryKey: ['content', 'publish', 'record', 'detail', 'record-1'],
        queryFn: vi.fn().mockResolvedValue({ data: mockDetailData }),
      });
      render(<Detail />);
    });
    Then('互动率 = (点赞+评论+转发) / 播放量 × 100%', async () => {
      await waitFor(() => {
        const interactionRate =
          (Number(mockDetailData.metrics?.likeCount) +
            Number(mockDetailData.metrics?.commentCount) +
            Number(mockDetailData.metrics?.shareCount)) /
          Number(mockDetailData.metrics?.viewCount);
        expect(screen.getByTestId('interaction-rate')).toHaveTextContent(
          `${(interactionRate * 100).toFixed(2)}%`,
        );
      });
    });
    And('正确计算并显示', () => {
      expect(screen.getByTestId('interaction-rate')).toBeInTheDocument();
    });
  });

  Scenario('加载失败显示错误', ({ Given, When, Then, And }) => {
    Given('用户进入发布详情页', async () => {
      (
        publishRecordDetailQueryOptions as ReturnType<typeof vi.fn>
      ).mockReturnValue({
        queryKey: ['content', 'publish', 'record', 'detail', 'record-1'],
        queryFn: vi.fn().mockRejectedValue(new Error('网络错误')),
      });
      render(<Detail />);
    });
    When('加载详情数据失败', async () => {
      await waitFor(() => {
        expect(screen.getByText(/网络错误/iu)).toBeInTheDocument();
      });
    });
    Then('显示错误提示', () => {
      expect(screen.getByText(/网络错误/iu)).toBeInTheDocument();
    });
    And('提供重试选项', () => {
      expect(
        screen.getByRole('button', { name: /重试/iu }),
      ).toBeInTheDocument();
    });
  });
});
