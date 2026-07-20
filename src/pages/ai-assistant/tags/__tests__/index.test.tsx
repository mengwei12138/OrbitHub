import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import request from '@/api/request';

import TagsPage from '../index';

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
  return render(<TagsPage />, { wrapper: Wrapper });
};

describe('标签库', () => {
  beforeEach(() => {
    mockedGet.mockReset();
    mockedGet.mockImplementation((url: string) => {
      if (url.includes('/tags/stats')) {
        return Promise.resolve({
          categories: [
            { code: 'hot', count: 5 },
            { code: 'content', count: 4 },
            { code: 'emotion', count: 3 },
          ],
          disabled: 2,
        } as never);
      }
      if (url.includes('/tags/categories')) {
        return Promise.resolve({
          categories: [
            { code: 'hot', name: '热门推荐', isCustom: false },
            { code: 'content', name: '内容分类', isCustom: false },
            { code: 'emotion', name: '情感标签', isCustom: false },
          ],
        } as never);
      }
      if (url.includes('/ai-assistant/tags')) {
        return Promise.resolve({
          list: [],
          page: 1,
          pageSize: 10,
          total: '0',
          totalPages: 0,
          hasNext: false,
          hasPrevious: false,
        } as never);
      }
      return Promise.resolve(null as never);
    });
  });

  afterEach(() => {
    cleanup();
    mockedGet.mockReset();
  });

  it('渲染页面标题与概览', async () => {
    renderPage();
    expect(screen.getByText('标签库')).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText('标签概览')).toBeInTheDocument();
      expect(screen.getByText('5')).toBeInTheDocument();
      expect(screen.getByText('标签列表')).toBeInTheDocument();
    });
  });
});
