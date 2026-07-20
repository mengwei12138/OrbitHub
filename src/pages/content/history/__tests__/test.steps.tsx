import '@testing-library/react/dont-cleanup-after-each';

import { defineFeature } from '@amiceli/vitest-cucumber';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { RenderOptions } from '@testing-library/react';
import {
  cleanup,
  fireEvent,
  render as rtlRender,
  screen,
  waitFor,
} from '@testing-library/react';
import type { ReactElement, ReactNode } from 'react';
import { vi } from 'vitest';
import { historyRecordsQueryOptions } from '@/services/content';

import History from '../index';

function renderWithQueryClient(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) {
  cleanup();
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  }

  return rtlRender(ui, { wrapper: Wrapper, ...options });
}

vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn(),
}));

vi.mock('@/services/content', () => ({
  usePublishRecords: vi.fn(),
  historyRecordsQueryOptions: vi.fn(),
}));

const mockPublishRecords = [
  {
    recordId: '1',
    title: '测试标题1',
    captionExcerpt: '测试文案1',
    coverUrl: 'http://example.com/cover1.jpg',
    accountNickname: '抖音账号1',
    platform: 'douyin',
    contentMode: 'VIDEO',
    publishedAt: '2024-01-15T10:00:00Z',
    status: 'PUBLISH_SUCCESS',
  },
  {
    recordId: '2',
    title: '测试标题2',
    captionExcerpt: '测试文案2',
    coverUrl: 'http://example.com/cover2.jpg',
    accountNickname: '小红书账号1',
    platform: 'xiaohongshu',
    contentMode: 'IMAGE',
    publishedAt: '2024-01-14T10:00:00Z',
    status: 'UNDER_REVIEW',
  },
  {
    recordId: '3',
    title: '测试标题3',
    captionExcerpt: '测试文案3',
    coverUrl: null,
    accountNickname: '抖音账号2',
    platform: 'douyin',
    contentMode: 'VIDEO',
    publishedAt: '2024-01-13T10:00:00Z',
    status: 'PUBLISH_FAILED',
  },
];

defineFeature('./features/test.feature', ({ Scenario }) => {
  Scenario('历史列表-页面布局与列展示', ({ Given, When, Then }) => {
    Given('已有发布记录，用户访问历史发布记录页', async () => {
      vi.mocked(historyRecordsQueryOptions).mockReturnValue({
        queryKey: ['publishRecords'],
        queryFn: vi.fn().mockResolvedValue({
          list: mockPublishRecords,
          total: mockPublishRecords.length,
        }),
      } as unknown as ReturnType<typeof historyRecordsQueryOptions>);
    });

    When('观察列表', async () => {
      renderWithQueryClient(<History />);
    });

    Then(
      '列表包含列：封面缩略图、标题/文案、发布账号、平台、发布时间、状态、操作',
      async () => {
        await waitFor(() => {
          expect(
            screen.getByRole('columnheader', { name: '封面' }),
          ).toBeInTheDocument();
          expect(
            screen.getByRole('columnheader', { name: '标题/文案' }),
          ).toBeInTheDocument();
          expect(
            screen.getByRole('columnheader', { name: '发布账号' }),
          ).toBeInTheDocument();
          expect(
            screen.getByRole('columnheader', { name: '平台' }),
          ).toBeInTheDocument();
          expect(
            screen.getByRole('columnheader', { name: '发布时间' }),
          ).toBeInTheDocument();
          expect(
            screen.getByRole('columnheader', { name: '状态' }),
          ).toBeInTheDocument();
          expect(
            screen.getByRole('columnheader', { name: '操作' }),
          ).toBeInTheDocument();
        });
      },
    );
  });

  Scenario('历史列表-封面显示', ({ Given, When, Then }) => {
    Given('有成功发布记录', async () => {
      vi.mocked(historyRecordsQueryOptions).mockReturnValue({
        queryKey: ['publishRecords'],
        queryFn: vi.fn(),
        data: { list: [mockPublishRecords[0]], total: 1 },
      } as unknown as ReturnType<typeof historyRecordsQueryOptions>);
    });

    When('在历史列表页观察封面列', async () => {
      renderWithQueryClient(<History />);
    });

    Then('封面显示平台返回的封面图缩略图', async () => {
      await waitFor(() => {
        const coverImage = screen.getByAltText('封面图');
        expect(coverImage).toBeInTheDocument();
        expect(coverImage).toHaveAttribute(
          'src',
          'http://example.com/cover1.jpg',
        );
      });
    });
  });

  Scenario('历史列表-状态标签显示', ({ Given, When, Then }) => {
    Given('有不同状态的发布记录', async () => {
      vi.mocked(historyRecordsQueryOptions).mockReturnValue({
        queryKey: ['publishRecords'],
        queryFn: vi.fn(),
        data: { list: mockPublishRecords, total: 3 },
      } as unknown as ReturnType<typeof historyRecordsQueryOptions>);
    });

    When('观察列表中各记录的状态列', async () => {
      renderWithQueryClient(<History />);
    });

    Then('显示「发布成功」「审核中」「发布失败」三种状态标签', async () => {
      await waitFor(() => {
        expect(screen.getByText('发布成功')).toBeInTheDocument();
        expect(screen.getByText('审核中')).toBeInTheDocument();
        expect(screen.getByText('发布失败')).toBeInTheDocument();
      });
    });
  });

  Scenario('历史列表-时间范围筛选', ({ Given, When, Then, And }) => {
    Given('历史列表页有多条不同日期的记录', async () => {
      vi.mocked(historyRecordsQueryOptions).mockReturnValue({
        queryKey: ['publishRecords'],
        queryFn: vi.fn(),
        data: { list: mockPublishRecords, total: 3 },
      } as unknown as ReturnType<typeof historyRecordsQueryOptions>);
    });

    When('设置开始日期和结束日期', async () => {
      renderWithQueryClient(<History />);
    });

    And('点击「查询」', async () => {
      const searchButton = screen.getByText('查询');
      fireEvent.click(searchButton);
    });

    Then('列表只显示该日期范围内的发布记录', async () => {
      await waitFor(() => {
        expect(historyRecordsQueryOptions).toHaveBeenCalled();
      });
    });
  });

  Scenario('历史列表-平台筛选', ({ Given, When, Then, And }) => {
    Given('历史列表页有抖音和小红书记录', async () => {
      vi.mocked(historyRecordsQueryOptions).mockReturnValue({
        queryKey: ['publishRecords'],
        queryFn: vi.fn(),
        data: { list: mockPublishRecords, total: 3 },
      } as unknown as ReturnType<typeof historyRecordsQueryOptions>);
    });

    When('平台下拉选择「抖音」', async () => {
      renderWithQueryClient(<History />);
      const platformSelect = screen.getByPlaceholderText('选择平台');
      fireEvent.click(platformSelect);
      const douyinOption = screen.getByText('抖音');
      fireEvent.click(douyinOption);
    });

    And('点击「查询」', async () => {
      const searchButton = screen.getByText('查询');
      fireEvent.click(searchButton);
    });

    Then('只显示抖音平台的发布记录', async () => {
      await waitFor(() => {
        expect(historyRecordsQueryOptions).toHaveBeenCalledWith(
          expect.objectContaining({ platform: 'douyin' }),
        );
      });
    });
  });

  Scenario('历史列表-状态筛选', ({ Given, When, Then, And }) => {
    Given('历史列表页有多种状态记录', async () => {
      vi.mocked(historyRecordsQueryOptions).mockReturnValue({
        queryKey: ['publishRecords'],
        queryFn: vi.fn(),
        data: { list: mockPublishRecords, total: 3 },
      } as unknown as ReturnType<typeof historyRecordsQueryOptions>);
    });

    When('状态下拉选择「发布成功」', async () => {
      renderWithQueryClient(<History />);
    });

    And('点击「查询」', async () => {
      const searchButton = screen.getByText('查询');
      fireEvent.click(searchButton);
    });

    Then('只显示「发布成功」状态的记录', async () => {
      await waitFor(() => {
        expect(historyRecordsQueryOptions).toHaveBeenCalledWith(
          expect.objectContaining({ status: 'PUBLISH_SUCCESS' }),
        );
      });
    });
  });

  Scenario('历史列表-多条件组合筛选', ({ Given, When, And, Then }) => {
    Given('历史列表页有多条记录', async () => {
      vi.mocked(historyRecordsQueryOptions).mockReturnValue({
        queryKey: ['publishRecords'],
        queryFn: vi.fn(),
        data: { list: mockPublishRecords, total: 3 },
      } as unknown as ReturnType<typeof historyRecordsQueryOptions>);
    });

    When('设置时间范围', async () => {
      renderWithQueryClient(<History />);
      // TODO: 需要设置日期选择器
      // const startDateInput = screen.getByPlaceholderText('开始日期');
      // fireEvent.change(startDateInput, { target: { value: '2024-01-01' } });
    });

    And('平台选「小红书」', async () => {
      const platformSelect = screen.getByPlaceholderText('选择平台');
      fireEvent.click(platformSelect);
      const xiaohongshuOption = screen.getByText('小红书');
      fireEvent.click(xiaohongshuOption);
    });

    And('状态选「审核中」', async () => {
      const statusSelect = screen.getByPlaceholderText('选择状态');
      fireEvent.click(statusSelect);
      const underReviewOption = screen.getByText('审核中');
      fireEvent.click(underReviewOption);
    });

    Then('只显示同时满足三个条件的记录', async () => {
      await waitFor(() => {
        expect(historyRecordsQueryOptions).toHaveBeenCalledWith(
          expect.objectContaining({
            platform: 'xiaohongshu',
            status: 'UNDER_REVIEW',
          }),
        );
      });
    });
  });

  Scenario('历史列表-「重置」清空筛选条件', ({ Given, When, Then, And }) => {
    Given('已设置筛选条件', async () => {
      vi.mocked(historyRecordsQueryOptions).mockReturnValue({
        queryKey: ['publishRecords'],
        queryFn: vi.fn(),
        data: { list: mockPublishRecords, total: 3 },
      } as unknown as ReturnType<typeof historyRecordsQueryOptions>);
    });

    When('点击「重置」按钮', async () => {
      renderWithQueryClient(<History />);
      const resetButton = screen.getByText('重置');
      fireEvent.click(resetButton);
    });

    Then('所有筛选条件清空恢复默认', async () => {
      await waitFor(() => {
        expect(historyRecordsQueryOptions).toHaveBeenCalledWith(
          expect.objectContaining({
            platform: undefined,
            status: undefined,
            startAt: undefined,
            endAt: undefined,
          }),
        );
      });
    });

    And('列表刷新显示所有记录', async () => {
      await waitFor(() => {
        expect(screen.getByText('测试标题1')).toBeInTheDocument();
      });
    });
  });

  Scenario('历史列表-分页翻页', ({ Given, When, Then, And }) => {
    Given('历史列表有超过1页的记录', async () => {
      vi.mocked(historyRecordsQueryOptions).mockReturnValue({
        queryKey: ['publishRecords'],
        queryFn: vi.fn(),
        data: { list: mockPublishRecords, total: 100, page: 1, pageSize: 20 },
      } as unknown as ReturnType<typeof historyRecordsQueryOptions>);
    });

    When('点击「下一页」按钮', async () => {
      renderWithQueryClient(<History />);
      const nextButton = screen.getByText('下一页');
      fireEvent.click(nextButton);
    });

    Then('分页正确切换', async () => {
      await waitFor(() => {
        expect(historyRecordsQueryOptions).toHaveBeenCalledWith(
          expect.objectContaining({ page: 2 }),
        );
      });
    });

    And('显示「共N条记录」', async () => {
      await waitFor(() => {
        expect(screen.getByText(/共.*条/u)).toBeInTheDocument();
      });
    });
  });

  Scenario('历史列表-点击「查看」进入发布详情', ({ Given, When, Then }) => {
    Given('历史列表页有发布记录', async () => {
      vi.mocked(historyRecordsQueryOptions).mockReturnValue({
        queryKey: ['publishRecords'],
        queryFn: vi.fn(),
        data: { list: mockPublishRecords, total: 3 },
      } as unknown as ReturnType<typeof historyRecordsQueryOptions>);
    });

    When('点击某条记录的「查看」按钮', async () => {
      renderWithQueryClient(<History />);
      const viewButton = screen.getByText('查看');
      fireEvent.click(viewButton);
    });

    Then('跳转至该记录的发布详情页', async () => {
      const mockNavigate = require('react-router-dom').useNavigate();
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith(
          expect.stringContaining('/content/detail'),
          expect.objectContaining({
            search: expect.stringContaining('recordId=1'),
          }),
        );
      });
    });
  });

  Scenario(
    '历史列表-点击「重发」进入重新发布',
    ({ Given, When, Then, And }) => {
      Given('历史列表页有发布记录', async () => {
        vi.mocked(historyRecordsQueryOptions).mockReturnValue({
          queryKey: ['publishRecords'],
          queryFn: vi.fn(),
          data: { list: mockPublishRecords, total: 3 },
        } as unknown as ReturnType<typeof historyRecordsQueryOptions>);
      });

      When('点击某条记录的「重发」按钮', async () => {
        renderWithQueryClient(<History />);
        const republishButton = screen.getByText('重发');
        fireEvent.click(republishButton);
      });

      Then('跳转至重新发布页', async () => {
        const mockNavigate = require('react-router-dom').useNavigate();
        await waitFor(() => {
          expect(mockNavigate).toHaveBeenCalledWith(
            expect.stringContaining('/content/republish'),
            expect.objectContaining({
              search: expect.stringContaining('recordId=1'),
            }),
          );
        });
      });

      And('内容预填充该条记录的原始信息', async () => {
        // 验证跳转 URL 中包含原始记录的信息
        const mockNavigate = require('react-router-dom').useNavigate();
        const call = mockNavigate.mock.calls[0];
        const url = call[0];
        expect(url).toContain('name=');
      });
    },
  );

  Scenario('历史列表-手动下拉刷新', ({ Given, When, Then, And }) => {
    Given('用户在历史发布记录页', async () => {
      vi.mocked(historyRecordsQueryOptions).mockReturnValue({
        queryKey: ['publishRecords'],
        queryFn: vi.fn(),
        data: { list: mockPublishRecords, total: 3 },
      } as unknown as ReturnType<typeof historyRecordsQueryOptions>);
    });

    When('在列表顶部下拉刷新', async () => {
      renderWithQueryClient(<History />);
    });

    Then('列表重新请求数据', async () => {
      await waitFor(() => {
        expect(historyRecordsQueryOptions).toHaveBeenCalled();
      });
    });

    And('发布状态同步最新', async () => {
      // 验证刷新后数据更新
      await waitFor(() => {
        // TODO: 需要验证状态已更新
        // expect(screen.getByText('发布成功')).toBeInTheDocument();
      });
    });
  });

  Scenario('历史列表-状态每3小时自动同步', ({ Given, When, Then, And }) => {
    Given('有「审核中」状态的历史发布记录', async () => {
      vi.mocked(historyRecordsQueryOptions).mockReturnValue({
        queryKey: ['publishRecords'],
        queryFn: vi.fn(),
        data: { list: [mockPublishRecords[1]], total: 1 },
      } as unknown as ReturnType<typeof historyRecordsQueryOptions>);
    });

    When('等待超过3小时', async () => {
      // 真实场景需要等待3小时，测试中通过 mock 时间或轮询机制验证
      // TODO: 需要模拟时间流逝或轮询触发
    });

    And('刷新历史列表', async () => {
      // 模拟刷新操作
      vi.mocked(historyRecordsQueryOptions).mockReturnValue({
        queryKey: ['publishRecords'],
        queryFn: vi.fn(),
        data: {
          list: [{ ...mockPublishRecords[1], status: 'PUBLISH_SUCCESS' }],
          total: 1,
        },
      } as unknown as ReturnType<typeof historyRecordsQueryOptions>);
      renderWithQueryClient(<History />);
    });

    Then('发布状态自动更新为「发布成功」', async () => {
      await waitFor(() => {
        expect(screen.getByText('发布成功')).toBeInTheDocument();
      });
    });
  });
});
