import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  cleanup,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import type { ReactNode } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import request from '@/api/request';

import MessageReplyPage from '../index';

vi.mock('@/api/request', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

const mockedGet = vi.mocked(request.get);
const mockedPut = vi.mocked(request.put);
const mockedPost = vi.mocked(request.post);

const emptyPageMeta = {
  page: 1,
  pageSize: 10,
  total: '0',
  totalPages: 0,
  hasNext: false,
  hasPrevious: false,
};

const accountSnapshot = (
  id: string,
  nickname: string,
  platform: 'douyin' | 'xiaohongshu',
) => ({
  accountId: id,
  phoneNumber: '13800000000',
  platform,
  accountType: 'personal',
  nickname,
  isOnline: true,
  capabilities: {},
});

const renderPage = () => {
  const client = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
        staleTime: Number.POSITIVE_INFINITY,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
      },
      mutations: { retry: false },
    },
  });
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>
      <MemoryRouter>{children}</MemoryRouter>
    </QueryClientProvider>
  );
  return render(<MessageReplyPage />, { wrapper: Wrapper });
};

describe('私信 AI 自动回复', () => {
  beforeEach(() => {
    mockedGet.mockReset();
    mockedPut.mockReset();
    mockedPost.mockReset();
    mockedPut.mockResolvedValue(undefined as never);
    mockedPost.mockResolvedValue(undefined as never);
    mockedGet.mockImplementation((url: string) => {
      if (url.includes('message-reply/accounts')) {
        return Promise.resolve({
          list: [
            accountSnapshot('1', '账号一', 'douyin'),
            accountSnapshot('2', '账号二', 'xiaohongshu'),
            accountSnapshot('3', '账号三', 'douyin'),
          ],
          ...emptyPageMeta,
          total: '3',
        } as never);
      }
      if (url.includes('message-reply/scrape-settings')) {
        return Promise.resolve({
          autoReplyEnabled: true,
          scrapeIntervalSeconds: 300,
          scrapeTypes: ['ALL'],
        } as never);
      }
      if (url.includes('message-reply/categories')) {
        return Promise.resolve({ categories: [] } as never);
      }
      if (url.includes('message-reply/rules')) {
        return Promise.resolve({ rules: [] } as never);
      }
      if (url.includes('message-reply/pending')) {
        return Promise.resolve({ list: [], ...emptyPageMeta } as never);
      }
      if (url.includes('message-reply/history')) {
        return Promise.resolve({ list: [], ...emptyPageMeta } as never);
      }
      return Promise.resolve(null as never);
    });
  });

  afterEach(() => {
    mockedGet.mockReset();
    mockedPut.mockReset();
    mockedPost.mockReset();
    cleanup();
  });

  it('渲染页面标题', async () => {
    renderPage();
    expect(screen.getByText('私信 AI 自动回复')).toBeInTheDocument();
    await waitFor(() =>
      expect(screen.getByText('账号选择')).toBeInTheDocument(),
    );
  }, 15000);

  it('渲染账号列表', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('账号一')).toBeInTheDocument();
      expect(screen.getByText('账号二')).toBeInTheDocument();
      expect(screen.getByText('账号三')).toBeInTheDocument();
    });
  }, 15000);

  it('渲染抓取设置组件', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('抓取设置')).toBeInTheDocument();
      expect(screen.getByText('抓取频率：')).toBeInTheDocument();
      expect(screen.getByText('私信类型：')).toBeInTheDocument();
    });
  });

  it('渲染分类规则设置组件', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('分类与回复规则')).toBeInTheDocument();
      expect(screen.getByText('自动回复开关')).toBeInTheDocument();
      expect(screen.getByText('关键词匹配')).toBeInTheDocument();
      expect(screen.getByText('回复模板')).toBeInTheDocument();
    });
  });

  it('渲染消息面板组件', async () => {
    renderPage();
    await waitFor(() =>
      expect(screen.getByText('待处理私信')).toBeInTheDocument(),
    );
  });

  it('渲染工具栏按钮', async () => {
    renderPage();
    const toolbar = await screen.findByTestId('message-reply-toolbar');
    expect(within(toolbar).getByText('立即抓取')).toBeInTheDocument();
    expect(within(toolbar).getByText('返回')).toBeInTheDocument();
  });

  it('接口失败时展示契约提示', async () => {
    mockedGet.mockImplementation(() => Promise.reject(new Error('网络异常')));
    renderPage();
    await waitFor(() =>
      expect(
        screen.getByText(/私信接口在本期契约中可能返回 HTTP 501/u),
      ).toBeInTheDocument(),
    );
  });
});
