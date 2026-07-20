import { defineFeature } from '@amiceli/vitest-cucumber';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useNavigate } from 'react-router-dom';
import { vi } from 'vitest';
import { historyRecordsQueryOptions } from '@/services/content';
import type {
  PlatformCode,
  PublishRecordListItem,
  PublishStatusCode,
} from '@/services/content/types';

import History from '..';

vi.mock('@/services/content', () => ({
  historyRecordsQueryOptions: vi.fn(() => ({
    queryKey: ['content', 'publish', 'records'],
    queryFn: vi.fn(),
  })),
}));

vi.mock('react-router-dom', () => ({
  useNavigate: vi.fn(() => vi.fn()),
}));

const mockPublishRecords: PublishRecordListItem[] = [
  {
    recordId: 'record-1',
    accountId: 'account-1',
    accountNickname: '抖音账号A',
    platform: 'douyin' as PlatformCode,
    contentMode: 'VIDEO',
    title: '测试视频标题1',
    captionExcerpt: '这是视频描述1...',
    coverUrl: 'https://example.com/cover1.jpg',
    publishedAt: '2024-01-15T10:00:00Z',
    status: 'PUBLISH_SUCCESS' as PublishStatusCode,
  },
  {
    recordId: 'record-2',
    accountId: 'account-2',
    accountNickname: '小红书账号A',
    platform: 'xiaohongshu' as PlatformCode,
    contentMode: 'IMAGE',
    title: '测试图文标题2',
    captionExcerpt: '这是图文描述2...',
    coverUrl: '',
    publishedAt: '2024-01-14T09:00:00Z',
    status: 'UNDER_REVIEW' as PublishStatusCode,
  },
  {
    recordId: 'record-3',
    accountId: 'account-3',
    accountNickname: '抖音账号B',
    platform: 'douyin' as PlatformCode,
    contentMode: 'VIDEO',
    title: '测试视频标题3',
    captionExcerpt: '这是视频描述3...',
    coverUrl: 'https://example.com/cover3.jpg',
    publishedAt: '2024-01-13T08:00:00Z',
    status: 'PUBLISH_FAILED' as PublishStatusCode,
  },
];

defineFeature('./features/requirements.feature', ({ Scenario }) => {
  beforeEach(() => {
    vi.clearAllMocks();
    (historyRecordsQueryOptions as ReturnType<typeof vi.fn>).mockReturnValue({
      queryKey: ['content', 'publish', 'records'],
      // request 拦截器已剥离 {code,success,data} 外壳，queryFn 直接 resolve 业务体。
      queryFn: vi.fn().mockResolvedValue({
        list: mockPublishRecords,
        page: 1,
        pageSize: 20,
        total: 3,
        totalPages: 1,
        hasNext: false,
        hasPrevious: false,
      }),
    });
  });

  Scenario('加载历史列表', ({ Given, When, Then, And }) => {
    Given('用户进入历史发布记录页', async () => {
      render(<History />);
    });
    When('页面加载时', async () => {
      await waitFor(() => {
        expect(screen.getByTestId('history-table')).toBeInTheDocument();
      });
    });
    Then('显示历史发布列表第 1 页', () => {
      const table = screen.getByTestId('history-table');
      expect(within(table).getByText('测试视频标题1')).toBeInTheDocument();
      expect(within(table).getByText('测试图文标题2')).toBeInTheDocument();
    });
    And('显示分页信息「共 X 条」', () => {
      expect(screen.getByText(/共 \d+ 条/iu)).toBeInTheDocument();
    });
  });

  Scenario('按时间范围筛选', ({ Given, When, Then, And }) => {
    Given('用户设置开始日期和结束日期', async () => {
      render(<History />);
      const startDateInput = screen.getByTestId('date-range-start');
      const endDateInput = screen.getByTestId('date-range-end');
      await userEvent.type(startDateInput, '2024-01-01');
      await userEvent.type(endDateInput, '2024-01-31');
    });
    When('点击「查询」按钮', async () => {
      const searchButton = screen.getByRole('button', { name: /查询/iu });
      await userEvent.click(searchButton);
    });
    Then('显示该时间范围内的发布记录', async () => {
      await waitFor(() => {
        expect(historyRecordsQueryOptions).toHaveBeenCalledWith(
          expect.objectContaining({
            startAt: expect.any(String),
            endAt: expect.any(String),
          }),
        );
      });
    });
    And('重置分页到第 1 页', async () => {
      await waitFor(() => {
        expect(historyRecordsQueryOptions).toHaveBeenCalledWith(
          expect.objectContaining({ page: 1 }),
        );
      });
    });
  });

  Scenario('按平台筛选-抖音', ({ Given, When, Then }) => {
    Given('用户选择平台「抖音」', async () => {
      render(<History />);
      const platformSelect = screen.getByTestId('platform-select');
      await userEvent.click(within(platformSelect).getByText('全部'));
      await userEvent.click(screen.getByText('抖音'));
    });
    When('点击「查询」按钮', async () => {
      const searchButton = screen.getByRole('button', { name: /查询/iu });
      await userEvent.click(searchButton);
    });
    Then('仅显示抖音平台的发布记录', async () => {
      await waitFor(() => {
        expect(historyRecordsQueryOptions).toHaveBeenCalledWith(
          expect.objectContaining({ platform: 'douyin' }),
        );
      });
    });
  });

  Scenario('按平台筛选-小红书', ({ Given, When, Then }) => {
    Given('用户选择平台「小红书」', async () => {
      render(<History />);
      const platformSelect = screen.getByTestId('platform-select');
      await userEvent.click(within(platformSelect).getByText('全部'));
      await userEvent.click(screen.getByText('小红书'));
    });
    When('点击「查询」按钮', async () => {
      const searchButton = screen.getByRole('button', { name: /查询/iu });
      await userEvent.click(searchButton);
    });
    Then('仅显示小红书平台的发布记录', async () => {
      await waitFor(() => {
        expect(historyRecordsQueryOptions).toHaveBeenCalledWith(
          expect.objectContaining({ platform: 'xiaohongshu' }),
        );
      });
    });
  });

  Scenario('按状态筛选-发布成功', ({ Given, When, Then }) => {
    Given('用户选择状态「发布成功」', async () => {
      render(<History />);
      const statusSelect = screen.getByTestId('status-select');
      await userEvent.click(within(statusSelect).getByText('全部'));
      await userEvent.click(screen.getByText('发布成功'));
    });
    When('点击「查询」按钮', async () => {
      const searchButton = screen.getByRole('button', { name: /查询/iu });
      await userEvent.click(searchButton);
    });
    Then('仅显示发布成功的记录', async () => {
      await waitFor(() => {
        expect(historyRecordsQueryOptions).toHaveBeenCalledWith(
          expect.objectContaining({ status: 'PUBLISH_SUCCESS' }),
        );
      });
    });
  });

  Scenario('按状态筛选-审核中', ({ Given, When, Then }) => {
    Given('用户选择状态「审核中」', async () => {
      render(<History />);
      const statusSelect = screen.getByTestId('status-select');
      await userEvent.click(within(statusSelect).getByText('全部'));
      await userEvent.click(screen.getByText('审核中'));
    });
    When('点击「查询」按钮', async () => {
      const searchButton = screen.getByRole('button', { name: /查询/iu });
      await userEvent.click(searchButton);
    });
    Then('仅显示审核中的记录', async () => {
      await waitFor(() => {
        expect(historyRecordsQueryOptions).toHaveBeenCalledWith(
          expect.objectContaining({ status: 'UNDER_REVIEW' }),
        );
      });
    });
  });

  Scenario('按状态筛选-发布失败', ({ Given, When, Then }) => {
    Given('用户选择状态「发布失败」', async () => {
      render(<History />);
      const statusSelect = screen.getByTestId('status-select');
      await userEvent.click(within(statusSelect).getByText('全部'));
      await userEvent.click(screen.getByText('发布失败'));
    });
    When('点击「查询」按钮', async () => {
      const searchButton = screen.getByRole('button', { name: /查询/iu });
      await userEvent.click(searchButton);
    });
    Then('仅显示发布失败的记录', async () => {
      await waitFor(() => {
        expect(historyRecordsQueryOptions).toHaveBeenCalledWith(
          expect.objectContaining({ status: 'PUBLISH_FAILED' }),
        );
      });
    });
  });

  Scenario('组合筛选', ({ Given, When, Then }) => {
    Given('用户设置时间范围、选择平台、选择状态', async () => {
      render(<History />);
      const startDateInput = screen.getByTestId('date-range-start');
      await userEvent.type(startDateInput, '2024-01-01');
      const platformSelect = screen.getByTestId('platform-select');
      await userEvent.click(within(platformSelect).getByText('全部'));
      await userEvent.click(screen.getByText('抖音'));
      const statusSelect = screen.getByTestId('status-select');
      await userEvent.click(within(statusSelect).getByText('全部'));
      await userEvent.click(screen.getByText('发布成功'));
    });
    When('点击「查询」按钮', async () => {
      const searchButton = screen.getByRole('button', { name: /查询/iu });
      await userEvent.click(searchButton);
    });
    Then('显示满足所有条件的记录', async () => {
      await waitFor(() => {
        expect(historyRecordsQueryOptions).toHaveBeenCalledWith(
          expect.objectContaining({
            platform: 'douyin',
            status: 'PUBLISH_SUCCESS',
            startAt: expect.any(String),
          }),
        );
      });
    });
  });

  Scenario('重置筛选条件', ({ Given, When, Then, And }) => {
    Given('用户已设置筛选条件', async () => {
      render(<History />);
      const platformSelect = screen.getByTestId('platform-select');
      await userEvent.click(within(platformSelect).getByText('全部'));
      await userEvent.click(screen.getByText('抖音'));
    });
    When('点击「重置」按钮', async () => {
      const resetButton = screen.getByRole('button', { name: /重置/iu });
      await userEvent.click(resetButton);
    });
    Then('时间范围恢复默认', () => {
      const startDateInput = screen.getByTestId('date-range-start');
      expect(startDateInput).toHaveValue('');
    });
    And('平台恢复「全部」', () => {
      const platformSelect = screen.getByTestId('platform-select');
      expect(within(platformSelect).getByText('全部')).toBeInTheDocument();
    });
    And('状态恢复「全部」', () => {
      const statusSelect = screen.getByTestId('status-select');
      expect(within(statusSelect).getByText('全部')).toBeInTheDocument();
    });
    And('列表重新加载', async () => {
      await waitFor(() => {
        expect(historyRecordsQueryOptions).toHaveBeenCalled();
      });
    });
  });

  Scenario('筛选无结果', ({ Given, When, Then, And }) => {
    Given('用户设置筛选条件', async () => {
      render(<History />);
      (historyRecordsQueryOptions as ReturnType<typeof vi.fn>).mockReturnValue({
        queryKey: ['content', 'publish', 'records'],
        queryFn: vi.fn().mockResolvedValue({
          list: [],
          page: 1,
          pageSize: 20,
          total: 0,
          totalPages: 0,
          hasNext: false,
          hasPrevious: false,
        }),
      });
    });
    When('点击「查询」按钮', async () => {
      const searchButton = screen.getByRole('button', { name: /查询/iu });
      await userEvent.click(searchButton);
    });
    And('没有满足条件的记录', async () => {
      await waitFor(() => {
        expect(screen.getByText(/没有搜索到发布记录/iu)).toBeInTheDocument();
      });
    });
    Then('显示空状态「没有搜索到发布记录」', () => {
      expect(screen.getByText(/没有搜索到发布记录/iu)).toBeInTheDocument();
    });
  });

  Scenario('分页导航-下一页', ({ Given, When, Then, And }) => {
    Given('当前在第 1 页', async () => {
      render(<History />);
      await waitFor(() => {
        expect(screen.getByTestId('history-table')).toBeInTheDocument();
      });
    });
    When('点击「下一页」', async () => {
      const nextButton = screen.getByRole('button', { name: /下一页/iu });
      await userEvent.click(nextButton);
    });
    Then('跳转到第 2 页', async () => {
      await waitFor(() => {
        expect(historyRecordsQueryOptions).toHaveBeenCalledWith(
          expect.objectContaining({ page: 2 }),
        );
      });
    });
    And('显示第 2 页数据', async () => {
      await waitFor(() => {
        expect(screen.getByTestId('history-table')).toBeInTheDocument();
      });
    });
  });

  Scenario('分页导航-上一页', ({ Given, When, Then, And }) => {
    Given('当前在第 2 页', async () => {
      render(<History />);
      const nextButton = screen.getByRole('button', { name: /下一页/iu });
      await userEvent.click(nextButton);
      await waitFor(() => {
        expect(historyRecordsQueryOptions).toHaveBeenCalledWith(
          expect.objectContaining({ page: 2 }),
        );
      });
    });
    When('点击「上一页」', async () => {
      const prevButton = screen.getByRole('button', { name: /上一页/iu });
      await userEvent.click(prevButton);
    });
    Then('跳转到第 1 页', async () => {
      await waitFor(() => {
        expect(historyRecordsQueryOptions).toHaveBeenCalledWith(
          expect.objectContaining({ page: 1 }),
        );
      });
    });
    And('显示第 1 页数据', async () => {
      await waitFor(() => {
        expect(screen.getByTestId('history-table')).toBeInTheDocument();
      });
    });
  });

  Scenario('分页导航-跳转指定页', ({ Given, When, Then, And }) => {
    Given('总页数大于 3 页', async () => {
      (historyRecordsQueryOptions as ReturnType<typeof vi.fn>).mockReturnValue({
        queryKey: ['content', 'publish', 'records'],
        queryFn: vi.fn().mockResolvedValue({
          list: mockPublishRecords,
          page: 1,
          pageSize: 20,
          total: 100,
          totalPages: 5,
          hasNext: true,
          hasPrevious: false,
        }),
      });
      render(<History />);
    });
    When('输入页码并回车', async () => {
      const pageInput = screen.getByTestId('page-input');
      await userEvent.clear(pageInput);
      await userEvent.type(pageInput, '3{enter}');
    });
    Then('跳转到指定页码', async () => {
      await waitFor(() => {
        expect(historyRecordsQueryOptions).toHaveBeenCalledWith(
          expect.objectContaining({ page: 3 }),
        );
      });
    });
    And('显示该页数据', async () => {
      await waitFor(() => {
        expect(screen.getByTestId('history-table')).toBeInTheDocument();
      });
    });
  });

  Scenario('查看发布详情', ({ Given, When, Then, And }) => {
    Given('历史列表显示正常', async () => {
      render(<History />);
      await waitFor(() => {
        expect(screen.getByTestId('history-table')).toBeInTheDocument();
      });
    });
    When('点击某条记录的「查看」按钮', async () => {
      const viewButton = screen.getByRole('button', { name: /查看/iu });
      await userEvent.click(viewButton);
    });
    Then('跳转到发布详情页', () => {
      const navigate = vi.mocked(useNavigate);
      expect(navigate).toHaveBeenCalledWith(
        expect.stringContaining('/content/detail'),
      );
    });
    And('显示该记录的详细信息', () => {
      expect(screen.getByTestId('detail-page')).toBeInTheDocument();
    });
  });

  Scenario('重新发布入口', ({ Given, When, Then, And }) => {
    Given('某条发布记录存在', async () => {
      render(<History />);
      await waitFor(() => {
        expect(screen.getByTestId('history-table')).toBeInTheDocument();
      });
    });
    When('点击该记录的「重发」按钮', async () => {
      const republishButton = screen.getByRole('button', { name: /重发/iu });
      await userEvent.click(republishButton);
    });
    Then('跳转到重新发布页', () => {
      const navigate = vi.mocked(useNavigate);
      expect(navigate).toHaveBeenCalledWith(
        expect.stringContaining('/content/republish'),
      );
    });
    And('携带该记录 ID 参数', () => {
      const navigate = vi.mocked(useNavigate);
      expect(navigate).toHaveBeenCalledWith(
        expect.stringContaining('recordId='),
      );
    });
  });

  Scenario('查看封面图', ({ Given, Then, And }) => {
    Given('历史列表包含发布记录', async () => {
      render(<History />);
      await waitFor(() => {
        expect(screen.getByTestId('history-table')).toBeInTheDocument();
      });
    });
    Then('每条记录显示封面缩略图', () => {
      const images = screen.getAllByRole('img');
      expect(images.length).toBeGreaterThan(0);
    });
    And('封面以首次发布时平台返回的为准', () => {
      const firstImage = screen.getAllByRole('img')[0];
      expect(firstImage).toHaveAttribute('src', expect.any(String));
    });
  });
});
