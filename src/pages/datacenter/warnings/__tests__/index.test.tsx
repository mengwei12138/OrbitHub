import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import * as alertService from '@/services/alert';

import Warnings from '../index';

const mockWarningData = {
  summary: {
    totalPending: '12',
    unreadPending: '5',
    abnormalAccountCount: '4',
  },
  pageData: {
    list: [
      {
        warningId: '1',
        accountId: 'a1',
        accountName: '账号A',
        platform: 'douyin' as const,
        level: 'HIGH' as const,
        category: 'CONTENT_EXCEPTION' as const,
        eventType: 'play_low',
        message: '播放量过低(1.2K<5K)',
        state: 'PENDING_UNREAD' as const,
        createdAt: '2026-04-15 09:30:00',
      },
      {
        warningId: '2',
        accountId: 'a2',
        accountName: '账号B',
        platform: 'xiaohongshu' as const,
        level: 'HIGH' as const,
        category: 'ACCOUNT_EXCEPTION' as const,
        eventType: 'login_invalid',
        message: '登录失效',
        state: 'PENDING_READ' as const,
        createdAt: '2026-04-15 10:15:00',
      },
    ],
    page: 1,
    pageSize: 10,
    total: '12',
    totalPages: 2,
    hasNext: true,
    hasPrevious: false,
  },
};

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

const renderComponent = (entry: string = '/datacenter/warnings') => {
  const queryClient = createTestQueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[entry]}>
        <Warnings />
      </MemoryRouter>
    </QueryClientProvider>,
  );
};

describe('预警详情页', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('页面渲染', () => {
    it('正确渲染页面标题', () => {
      renderComponent();
      expect(screen.getByText('数据预警')).toBeInTheDocument();
    });

    it('显示返回按钮', () => {
      renderComponent();
      expect(screen.getByText('返回数据中心')).toBeInTheDocument();
    });

    it('显示预警统计区域', async () => {
      vi.spyOn(alertService, 'warningListQueryOptions').mockImplementation(
        () => ({
          queryKey: ['alert', 'warningList', {}],
          queryFn: vi.fn().mockResolvedValue(mockWarningData),
        }),
      );
      renderComponent();
      await waitFor(() => {
        expect(screen.getByText('预警统计')).toBeInTheDocument();
      });
    });

    it('显示批量操作按钮', async () => {
      vi.spyOn(alertService, 'warningListQueryOptions').mockImplementation(
        () => ({
          queryKey: ['alert', 'warningList', {}],
          queryFn: vi.fn().mockResolvedValue(mockWarningData),
        }),
      );
      renderComponent();
      await waitFor(() => {
        expect(screen.getByText('全部标记已读')).toBeInTheDocument();
      });
    });
  });

  describe('全部标记已读', () => {
    it('点击全部标记已读按钮', async () => {
      vi.spyOn(alertService, 'warningListQueryOptions').mockImplementation(
        () => ({
          queryKey: ['alert', 'warningList', {}],
          queryFn: vi.fn().mockResolvedValue(mockWarningData),
        }),
      );
      renderComponent();
      await waitFor(() => {
        expect(screen.getByText('全部标记已读')).toBeInTheDocument();
      });
      const button = screen.getByText('全部标记已读');
      expect(button).toBeInTheDocument();
    });
  });

  describe('返回数据中心', () => {
    it('点击返回按钮存在', () => {
      renderComponent();
      const backButton = screen.getByText('返回数据中心');
      expect(backButton).toBeInTheDocument();
    });
  });

  describe('URL platform 过滤（dev 验收 2026-06-05 端到端补丁）', () => {
    it('platform=douyin 时 warningListQueryOptions 收到 platform=douyin', async () => {
      const spy = vi
        .spyOn(alertService, 'warningListQueryOptions')
        .mockImplementation(() => ({
          queryKey: ['alert', 'warningList', {}],
          queryFn: vi.fn().mockResolvedValue(mockWarningData),
        }));
      renderComponent('/datacenter/warnings?platform=douyin');
      await waitFor(() => {
        expect(spy).toHaveBeenCalledWith(
          expect.objectContaining({ platform: 'douyin' }),
        );
      });
    });

    it('platform=xiaohongshu 时 warningListQueryOptions 收到 platform=xiaohongshu', async () => {
      const spy = vi
        .spyOn(alertService, 'warningListQueryOptions')
        .mockImplementation(() => ({
          queryKey: ['alert', 'warningList', {}],
          queryFn: vi.fn().mockResolvedValue(mockWarningData),
        }));
      renderComponent('/datacenter/warnings?platform=xiaohongshu');
      await waitFor(() => {
        expect(spy).toHaveBeenCalledWith(
          expect.objectContaining({ platform: 'xiaohongshu' }),
        );
      });
    });

    it('platform=all 时 warningListQueryOptions 收到 platform=all（service 内部会拆掉，不下发 query）', async () => {
      const spy = vi
        .spyOn(alertService, 'warningListQueryOptions')
        .mockImplementation(() => ({
          queryKey: ['alert', 'warningList', {}],
          queryFn: vi.fn().mockResolvedValue(mockWarningData),
        }));
      renderComponent('/datacenter/warnings?platform=all');
      await waitFor(() => {
        expect(spy).toHaveBeenCalledWith(
          expect.objectContaining({ platform: 'all' }),
        );
      });
    });

    it('URL 缺省 platform 时按 all 处理（不渲染 Tag）', async () => {
      vi.spyOn(alertService, 'warningListQueryOptions').mockImplementation(
        () => ({
          queryKey: ['alert', 'warningList', {}],
          queryFn: vi.fn().mockResolvedValue(mockWarningData),
        }),
      );
      renderComponent('/datacenter/warnings');
      await waitFor(() => {
        expect(screen.getByText('返回数据中心')).toBeInTheDocument();
      });
      expect(screen.queryByTestId('platform-filter-tag')).toBeNull();
    });

    it('platform=douyin 时 PageHeader 渲染「正在查看：抖音预警」Tag', async () => {
      vi.spyOn(alertService, 'warningListQueryOptions').mockImplementation(
        () => ({
          queryKey: ['alert', 'warningList', {}],
          queryFn: vi.fn().mockResolvedValue(mockWarningData),
        }),
      );
      renderComponent('/datacenter/warnings?platform=douyin');
      const tag = await screen.findByTestId('platform-filter-tag');
      expect(tag).toHaveTextContent('正在查看：抖音预警');
    });

    it('platform=xiaohongshu 时 Tag 文案为「正在查看：小红书预警」', async () => {
      vi.spyOn(alertService, 'warningListQueryOptions').mockImplementation(
        () => ({
          queryKey: ['alert', 'warningList', {}],
          queryFn: vi.fn().mockResolvedValue(mockWarningData),
        }),
      );
      renderComponent('/datacenter/warnings?platform=xiaohongshu');
      const tag = await screen.findByTestId('platform-filter-tag');
      expect(tag).toHaveTextContent('正在查看：小红书预警');
    });

    it('非法 platform 值（如 weibo）回退为 all、不渲染 Tag', async () => {
      vi.spyOn(alertService, 'warningListQueryOptions').mockImplementation(
        () => ({
          queryKey: ['alert', 'warningList', {}],
          queryFn: vi.fn().mockResolvedValue(mockWarningData),
        }),
      );
      renderComponent('/datacenter/warnings?platform=weibo');
      await waitFor(() => {
        expect(screen.getByText('返回数据中心')).toBeInTheDocument();
      });
      expect(screen.queryByTestId('platform-filter-tag')).toBeNull();
    });
  });
});
