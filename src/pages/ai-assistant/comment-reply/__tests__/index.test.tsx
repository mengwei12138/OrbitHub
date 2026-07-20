import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import request from '@/api/request';

import CommentReplyPage from '../index';

vi.mock('@/api/request', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

const mockedGet = vi.mocked(request.get);

const renderPage = () => {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  });
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>
      <MemoryRouter>{children}</MemoryRouter>
    </QueryClientProvider>
  );
  return render(<CommentReplyPage />, { wrapper: Wrapper });
};

const emptyPageMeta = {
  page: 1,
  pageSize: 10,
  total: '0',
  totalPages: 0,
  hasNext: false,
  hasPrevious: false,
};

describe('评论 AI 自动回复', () => {
  beforeEach(() => {
    mockedGet.mockReset();
    mockedGet.mockImplementation((url: string) => {
      if (url.includes('dashboard/today')) {
        return Promise.resolve({
          autoReplyCount: 0,
          blockedCount: 0,
          humanReviewCount: 0,
        } as never);
      }
      if (url.includes('comment-reply/accounts')) {
        return Promise.resolve({
          list: [
            {
              accountId: '1',
              phoneNumber: '13800000000',
              platform: 'xiaohongshu',
              accountType: 'personal',
              nickname: '测试号',
              isOnline: true,
              capabilities: {},
            },
          ],
          ...emptyPageMeta,
          total: '1',
        } as never);
      }
      if (url.includes('comment-reply/pending')) {
        return Promise.resolve({ list: [], ...emptyPageMeta } as never);
      }
      if (url.includes('human-review')) {
        return Promise.resolve({ list: [], ...emptyPageMeta } as never);
      }
      if (url.includes('comment-reply/history')) {
        return Promise.resolve({ list: [], ...emptyPageMeta } as never);
      }
      if (url.includes('blocked-keywords')) {
        return Promise.resolve({ keywords: [] } as never);
      }
      if (url.includes('comment-reply/rules')) {
        return Promise.resolve({ rules: [] } as never);
      }
      if (url.includes('account-settings')) {
        return Promise.resolve({
          accountId: '1',
          autoReplyEnabled: true,
          scrapeIntervalSeconds: 300,
          humanInterventionForQuestion: true,
          humanInterventionForNegative: true,
        } as never);
      }
      return Promise.resolve(null as never);
    });
  });

  afterEach(() => {
    cleanup();
    mockedGet.mockReset();
  });

  it('渲染页面标题', async () => {
    renderPage();
    expect(screen.getByText('评论 AI 自动回复')).toBeInTheDocument();
    await waitFor(
      () => expect(screen.getByText('今日动态概览')).toBeInTheDocument(),
      { timeout: 15_000 },
    );
  }, 20_000);

  it('双接口均失败时展示重试入口', async () => {
    mockedGet.mockImplementation(() => Promise.reject(new Error('网络异常')));
    renderPage();
    await waitFor(
      () => expect(screen.getByText(/加载失败/u)).toBeInTheDocument(),
      { timeout: 15_000 },
    );
    const retryBtn = screen
      .getAllByRole('button')
      .find((b) => b.textContent?.replace(/\s+/gu, '').includes('重试'));
    expect(retryBtn).toBeTruthy();
  }, 20_000);
});
