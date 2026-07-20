import { defineFeature } from '@amiceli/vitest-cucumber';
import { useQuery } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import {
  CONTENT_MODE_CODE,
  PUBLISH_STATUS_CODE,
  type PublishRecordDetailData,
} from '@/services/content/types';
import Detail from '../index';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
  useSearchParams: () => [
    new URLSearchParams({ recordId: '123', from: '/content/history' }),
  ],
}));

vi.mock('@/services/content', () => ({
  publishRecordDetailQueryOptions: vi.fn(() => ({
    queryKey: ['content', 'publish', 'record', 'detail', '123'],
    queryFn: vi.fn(),
  })),
  useRefreshMetrics: vi.fn(() => ({
    mutate: vi.fn(),
    mutateAsync: vi.fn(),
    isPending: false,
  })),
  PUBLISH_STATUS_CODE,
}));

vi.mock('@tanstack/react-query', () => ({
  useQuery: vi.fn(),
}));

const createMockDetailData = (
  overrides: Partial<PublishRecordDetailData> = {},
): PublishRecordDetailData => ({
  recordId: '123',
  contentMode: CONTENT_MODE_CODE.IMAGE,
  title: '测试标题',
  caption: '测试文案',
  topicTags: ['#测试'],
  platform: 'douyin',
  accountId: 'acc-1',
  accountNickname: '测试账号',
  stage: 'PUBLISHED',
  status: PUBLISH_STATUS_CODE.PUBLISH_SUCCESS,
  publishedAt: '2026-04-01T10:00:00Z',
  metrics: {
    recordId: '123',
    viewCount: '1000',
    likeCount: '100',
    commentCount: '10',
    shareCount: '5',
    collectCount: '3',
    newFollowersCount: '20',
    engagementRatePercent: '11.5',
    syncedAt: '2026-05-07T10:00:00Z',
    metricsSyncStopped: false,
  },
  canRepublish: true,
  ...overrides,
});

const mockUseQuery = (data: PublishRecordDetailData | undefined) => {
  vi.mocked(useQuery).mockReturnValue({
    data,
    isLoading: false,
  } as unknown as ReturnType<typeof useQuery>);
};

defineFeature('./features/test.feature', ({ Scenario }) => {
  Scenario('发布详情-内容信息区展示', ({ Given, When, Then }) => {
    Given('用户已进入某条发布记录详情页', async () => {
      const mockData = createMockDetailData();
      mockUseQuery(mockData);
      render(<Detail />);
    });

    When('观察「内容信息」区域', async () => {
      await waitFor(() => {
        expect(screen.getByText('内容信息')).toBeInTheDocument();
      });
    });

    Then('显示标题、文案、标签、内容形式', async () => {
      await waitFor(() => {
        expect(screen.getByText('测试标题')).toBeInTheDocument();
        expect(screen.getByText('测试文案')).toBeInTheDocument();
        expect(screen.getByText('#测试')).toBeInTheDocument();
        expect(screen.getByText('图文')).toBeInTheDocument();
      });
    });
  });

  Scenario('发布详情-发布信息区展示', ({ Given, When, Then }) => {
    Given('用户已在发布详情页', async () => {
      const mockData = createMockDetailData();
      mockUseQuery(mockData);
      render(<Detail />);
    });

    When('观察「发布信息」区域', async () => {
      await waitFor(() => {
        expect(screen.getByText('发布信息')).toBeInTheDocument();
      });
    });

    Then('显示发布账号、发布时间、发布状态、发布方式、封面', async () => {
      await waitFor(() => {
        expect(screen.getByText(/测试账号/u)).toBeInTheDocument();
        expect(screen.getByText('发布成功')).toBeInTheDocument();
        expect(screen.getByText('抖音')).toBeInTheDocument();
      });
    });
  });

  Scenario('发布详情-审核中状态提示', ({ Given, When, Then }) => {
    Given('用户进入一条「审核中」状态的发布记录详情', async () => {
      const mockData = createMockDetailData({
        status: PUBLISH_STATUS_CODE.UNDER_REVIEW,
      });
      mockUseQuery(mockData);
      render(<Detail />);
    });

    When('观察「发布信息」区域', async () => {
      await waitFor(() => {
        expect(screen.getByText('发布信息')).toBeInTheDocument();
      });
    });

    Then('显示「内容已提交至平台，正在等待平台审核」提示', async () => {
      await waitFor(() => {
        expect(
          screen.getByText(/内容已提交至平台，正在等待平台审核/u),
        ).toBeInTheDocument();
      });
    });
  });

  Scenario(
    '发布详情-数据表现区展示（审核中）',
    ({ Given, When, Then, And }) => {
      Given('用户进入「审核中」状态发布记录详情', async () => {
        const mockData = createMockDetailData({
          status: PUBLISH_STATUS_CODE.UNDER_REVIEW,
          metrics: undefined,
        });
        mockUseQuery(mockData);
        render(<Detail />);
      });

      When('观察「数据表现」区域', async () => {
        await waitFor(() => {
          expect(screen.getByText('数据表现')).toBeInTheDocument();
        });
      });

      Then('播放量、点赞量等均显示「-」', async () => {
        await waitFor(() => {
          const dashElements = screen.getAllByText('--');
          expect(dashElements.length).toBeGreaterThan(0);
        });
      });

      And('区域底部提示「内容审核中」', async () => {
        await waitFor(() => {
          expect(screen.getByText(/内容正在平台审核中/u)).toBeInTheDocument();
        });
      });
    },
  );

  Scenario('发布详情-数据为0时显示「-」', ({ Given, When, Then }) => {
    Given('用户进入一条「发布成功」记录详情，该记录播放量为0', async () => {
      const mockData = createMockDetailData({
        metrics: {
          recordId: '123',
          viewCount: '0',
          likeCount: '0',
          commentCount: '0',
          shareCount: '0',
          collectCount: '0',
          newFollowersCount: '0',
          engagementRatePercent: '0',
          syncedAt: '2026-05-07T10:00:00Z',
          metricsSyncStopped: false,
        },
      });
      mockUseQuery(mockData);
      render(<Detail />);
    });

    When('观察数据表现各指标', async () => {
      await waitFor(() => {
        expect(screen.getByText('数据表现')).toBeInTheDocument();
      });
    });

    Then('数据为0的指标显示「-」', async () => {
      await waitFor(() => {
        const dashElements = screen.getAllByText('--');
        expect(dashElements.length).toBeGreaterThan(0);
      });
    });
  });

  Scenario('发布详情-有数据时正常显示数值', ({ Given, When, Then, And }) => {
    Given('用户进入一条「发布成功」记录详情，有播放量数据', async () => {
      const mockData = createMockDetailData({
        metrics: {
          recordId: '123',
          viewCount: '1000',
          likeCount: '100',
          commentCount: '10',
          shareCount: '5',
          collectCount: '3',
          newFollowersCount: '20',
          engagementRatePercent: '11.5',
          syncedAt: '2026-05-07T10:00:00Z',
          metricsSyncStopped: false,
        },
      });
      mockUseQuery(mockData);
      render(<Detail />);
    });

    When('观察数据表现各指标', async () => {
      await waitFor(() => {
        expect(screen.getByText('数据表现')).toBeInTheDocument();
      });
    });

    Then('播放量等显示实际数字值', async () => {
      await waitFor(() => {
        expect(screen.getByText('1000')).toBeInTheDocument();
        expect(screen.getByText('100')).toBeInTheDocument();
      });
    });

    And('互动率按公式计算后显示百分比', async () => {
      await waitFor(() => {
        expect(screen.getByText('11.5')).toBeInTheDocument();
      });
    });
  });

  Scenario('发布详情-互动率计算正确', ({ Given, When, Then }) => {
    Given('用户进入有互动数据的发布详情', async () => {
      const mockData = createMockDetailData({
        metrics: {
          recordId: '123',
          viewCount: '1000',
          likeCount: '100',
          commentCount: '10',
          shareCount: '5',
          collectCount: '3',
          newFollowersCount: '20',
          engagementRatePercent: '11.5',
          syncedAt: '2026-05-07T10:00:00Z',
          metricsSyncStopped: false,
        },
      });
      mockUseQuery(mockData);
      render(<Detail />);
    });

    When('查看互动率数值', async () => {
      await waitFor(() => {
        expect(screen.getByText('数据表现')).toBeInTheDocument();
      });
    });

    Then('互动率 = (点赞+评论+转发) / 播放量 × 100%', async () => {
      await waitFor(() => {
        const expectedRate = ((100 + 10 + 5) / 1000) * 100;
        expect(screen.getByText(expectedRate.toString())).toBeInTheDocument();
      });
    });
  });

  Scenario(
    '发布详情-「刷新」按钮手动拉取数据',
    ({ Given, When, Then, And }) => {
      Given('用户已在发布详情页（发布成功30天内）', async () => {
        const mockData = createMockDetailData();
        mockUseQuery(mockData);
        render(<Detail />);
      });

      When('点击页面右上角「刷新」按钮', async () => {
        await waitFor(() => {
          expect(screen.getByText('刷新')).toBeInTheDocument();
        });
        const refreshButton = screen.getByText('刷新');
        await userEvent.click(refreshButton);
      });

      Then('立即请求最新数据', async () => {
        const { useRefreshMetrics } = require('@/services/content');
        await waitFor(() => {
          expect(useRefreshMetrics).toHaveBeenCalledWith('123');
        });
      });

      And('数据表现区更新', async () => {
        await waitFor(() => {
          expect(screen.getByText('数据表现')).toBeInTheDocument();
        });
      });
    },
  );

  Scenario('发布详情-30天后停止同步提示', ({ Given, When, Then }) => {
    Given('用户进入一条发布成功超过30天的记录详情', async () => {
      const mockData = createMockDetailData({
        metrics: {
          recordId: '123',
          viewCount: '1000',
          likeCount: '100',
          commentCount: '10',
          shareCount: '5',
          collectCount: '3',
          newFollowersCount: '20',
          engagementRatePercent: '11.5',
          syncedAt: '2026-04-01T10:00:00Z',
          metricsSyncStopped: true,
          metricsSyncStopReason: 'RETENTION_EXPIRED',
        },
      });
      mockUseQuery(mockData);
      render(<Detail />);
    });

    When('观察数据表现区域', async () => {
      await waitFor(() => {
        expect(screen.getByText('数据表现')).toBeInTheDocument();
      });
    });

    Then('显示「数据已停止同步」提示', async () => {
      await waitFor(() => {
        expect(screen.getByText(/数据已停止同步/u)).toBeInTheDocument();
      });
    });
  });

  Scenario(
    '发布详情-页面只有「重新发布」和「关闭」按钮',
    ({ Given, When, Then }) => {
      Given('用户已在发布详情页', async () => {
        const mockData = createMockDetailData({ canRepublish: true });
        mockUseQuery(mockData);
        render(<Detail />);
      });

      When('观察页面底部按钮区', async () => {
        await waitFor(() => {
          expect(screen.getByText('关闭')).toBeInTheDocument();
          expect(screen.getByText('重新发布')).toBeInTheDocument();
        });
      });

      Then('只显示「重新发布」和「关闭」两个按钮', async () => {
        await waitFor(() => {
          const closeButton = screen.getByText('关闭');
          const republishButton = screen.getByText('重新发布');
          expect(closeButton).toBeInTheDocument();
          expect(republishButton).toBeInTheDocument();
        });
      });
    },
  );

  Scenario('发布详情-点击「重新发布」跳转', ({ Given, When, Then, And }) => {
    Given('用户已在发布详情页', async () => {
      const mockData = createMockDetailData({
        canRepublish: true,
        title: '测试标题',
      });
      mockUseQuery(mockData);
      render(<Detail />);
    });

    When('点击「重新发布」按钮', async () => {
      await waitFor(() => {
        expect(screen.getByText('重新发布')).toBeInTheDocument();
      });
      const republishButton = screen.getByText('重新发布');
      await userEvent.click(republishButton);
    });

    Then('跳转至重新发布页', async () => {
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalled();
      });
    });

    And('内容预填充当前记录信息', async () => {
      const navigateCall = mockNavigate.mock.calls[0];
      const url = navigateCall[0];
      expect(url).toContain('/content/republish');
      expect(url).toContain('recordId=123');
    });
  });

  Scenario('发布详情-点击「关闭」返回历史列表', ({ Given, When, Then }) => {
    Given('用户已在发布详情页', async () => {
      const mockData = createMockDetailData();
      mockUseQuery(mockData);
      render(<Detail />);
    });

    When('点击「关闭」按钮', async () => {
      await waitFor(() => {
        expect(screen.getByText('关闭')).toBeInTheDocument();
      });
      const closeButton = screen.getByText('关闭');
      await userEvent.click(closeButton);
    });

    Then('返回历史发布记录列表页', async () => {
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/content/history');
      });
    });
  });
});
