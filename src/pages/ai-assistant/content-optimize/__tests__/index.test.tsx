import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, render, screen, within } from '@testing-library/react';
import { forwardRef, type ReactNode, useEffect, useState } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import request from '@/api/request';

vi.mock('@/api/request', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
  },
}));

const mockLowDataResult = {
  list: [],
  total: 0,
};

vi.mock('@/services/ai-assistant', () => ({
  lowDataContentsQueryOptions: vi.fn(() => ({
    queryKey: ['ai-assistant', 'content-optimize', 'low-data'],
    queryFn: vi.fn(() => Promise.resolve(mockLowDataResult)),
  })),
  useLowDataContents: vi.fn(() => ({
    data: { list: [], total: 0 },
    isLoading: false,
    isError: false,
    error: null,
    refetch: vi.fn(),
  })),
  useOptimizeThreshold: vi.fn(() => ({
    data: { viewMin: 500, likeRateMinPercent: 2 },
    isLoading: false,
    isError: false,
  })),
  useUpdateOptimizeThreshold: vi.fn(() => ({
    mutate: vi.fn(),
  })),
  useOptimizeContent: vi.fn(() => ({
    mutate: vi.fn(),
  })),
  useApplyOptimization: vi.fn(() => ({
    mutate: vi.fn(),
  })),
  useSubmitRepublish: vi.fn(() => ({
    mutate: vi.fn(),
  })),
  useRepublishTask: vi.fn(() => ({
    data: null,
  })),
  useCommentReplyAccounts: vi.fn(() => ({
    data: {
      list: [],
      page: 1,
      pageSize: 100,
      total: '0',
      totalPages: 0,
      hasNext: false,
      hasPrevious: false,
    },
    isLoading: false,
    isError: false,
  })),
}));

/** 勿 mock 整个 @/components（会加载全部 Pro 导出，CI 冷启动易超 5s），只替换 CustomProTable */
vi.mock('@/components/CustomProTable', () => ({
  default: forwardRef<
    unknown,
    {
      dataSource?: unknown[];
      queryOptions?: (pagination: { page: number; pageSize: number }) => {
        queryKey: unknown[];
        queryFn: () => Promise<{ list: unknown[]; total: number }>;
      };
      emptyContent?: ReactNode;
      toolbar?: { search?: ReactNode };
      loading?: boolean;
    }
  >(function ContentOptimizePageTestProTableMock(
    { toolbar, dataSource = [], queryOptions, emptyContent, loading },
    _ref,
  ) {
    const [hasError, setHasError] = useState(false);
    const rows = Array.isArray(dataSource) ? dataSource : [];

    useEffect(() => {
      if (queryOptions) {
        queryOptions({ page: 1, pageSize: 10 })
          .queryFn()
          .catch(() => setHasError(true));
      }
    }, [queryOptions]);

    return (
      <div data-testid="content-optimize-mock-pro-table">
        {toolbar?.search}
        {hasError ? (
          <>
            <div data-testid="low-data-error-result">Error</div>
            <button data-testid="low-data-retry-button">重试</button>
          </>
        ) : (
          <>
            {!loading && rows.length === 0 ? emptyContent : null}
            {loading && <div data-testid="low-data-loading" />}
          </>
        )}
      </div>
    );
  }),
}));

vi.mock('antd', async (importOriginal) => {
  const actual = await importOriginal<typeof import('antd')>();
  return {
    ...actual,
    message: {
      ...actual.message,
      useMessage: () => [
        {
          success: vi.fn(),
          error: vi.fn(),
          warning: vi.fn(),
          info: vi.fn(),
          open: vi.fn(),
          destroy: vi.fn(),
        },
        null,
      ],
    },
  };
});

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return {
    ...actual,
    useBlocker: vi.fn(() => ({
      state: 'unblocked',
      location: undefined,
      reset: vi.fn(),
      proceed: vi.fn(),
    })),
    useNavigate: () => vi.fn(),
  };
});

vi.mock('../components/AIOptimizeSuggestion', () => ({
  default: () => null,
}));

vi.mock('../components/RepublishSettings', () => ({
  default: () => null,
}));

import { useLowDataContents } from '@/services/ai-assistant';
import ContentOptimizePage from '../index';

const mockedGet = vi.mocked(request.get);
const mockedPut = vi.mocked(request.put);
const mockedUseLowDataContents = vi.mocked(useLowDataContents);

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
  return render(<ContentOptimizePage />, { wrapper: Wrapper });
};

const setupMock = (responses: Record<string, unknown>) => {
  mockedGet.mockImplementation((url: string) => {
    const matched = Object.entries(responses).find(([key]) =>
      url.includes(key),
    );
    return Promise.resolve(matched ? (matched[1] as never) : (null as never));
  });
};

describe('内容优化与重发布 - 主页面', () => {
  beforeEach(() => {
    mockedGet.mockReset();
    mockedPut.mockReset();
    mockedPut.mockResolvedValue(undefined as never);
    mockedUseLowDataContents.mockReset();
  });
  afterEach(() => {
    mockedGet.mockReset();
    mockedPut.mockReset();
    cleanup();
  });

  it('渲染页面标题与工具栏按钮', () => {
    setupMock({
      threshold: { viewMin: 500, likeRateMinPercent: 2 },
      'low-data': {
        list: [],
        page: 1,
        pageSize: 10,
        total: '0',
        totalPages: 0,
        hasNext: false,
        hasPrevious: false,
      },
    });
    renderPage();
    expect(screen.getByText('AI 内容优化与重发布')).toBeInTheDocument();
    const toolbar = screen.getByTestId('content-optimize-toolbar');
    expect(within(toolbar).getByText('标签库')).toBeInTheDocument();
    expect(within(toolbar).getByText('返回')).toBeInTheDocument();
  });

  it('低数据列表加载失败时显示错误与重试按钮', async () => {
    const { lowDataContentsQueryOptions } = await import(
      '@/services/ai-assistant'
    );
    vi.mocked(lowDataContentsQueryOptions).mockReturnValueOnce({
      queryKey: ['ai-assistant', 'content-optimize', 'low-data'],
      queryFn: vi.fn(() => Promise.reject(new Error('网络异常'))),
    } as never);
    const { unmount } = renderPage();
    await vi.waitFor(() => {
      expect(screen.getByTestId('low-data-error-result')).toBeInTheDocument();
    });
    expect(screen.getByTestId('low-data-retry-button')).toBeInTheDocument();
    unmount();
  });

  it('低数据列表为空时表格展示空态', async () => {
    setupMock({
      threshold: { viewMin: 500, likeRateMinPercent: 2 },
      'low-data': {
        list: [],
        page: 1,
        pageSize: 10,
        total: '0',
        totalPages: 0,
        hasNext: false,
        hasPrevious: false,
      },
    });
    renderPage();
    expect(await screen.findByText('暂无低数据内容')).toBeInTheDocument();
  });

  describe('页面离开确认弹窗', () => {
    it('点击返回按钮时无未保存更改则不弹出确认框', async () => {
      const { CustomModal } = await import('@/components');
      const modalSpy = vi.spyOn(CustomModal, 'confirm');
      setupMock({
        threshold: { viewMin: 500, likeRateMinPercent: 2 },
        'low-data': {
          list: [],
          page: 1,
          pageSize: 10,
          total: '0',
          totalPages: 0,
          hasNext: false,
          hasPrevious: false,
        },
      });
      renderPage();
      // 初始状态 isDirty = false，直接导航不弹窗
      const backButton = within(
        screen.getByTestId('content-optimize-toolbar'),
      ).getByText('返回');
      backButton.click();
      // 验证确认弹窗未被调用
      expect(modalSpy).not.toHaveBeenCalled();
    });

    it('点击标签库按钮时无未保存更改则不弹出确认框', async () => {
      const { CustomModal } = await import('@/components');
      const modalSpy = vi.spyOn(CustomModal, 'confirm');
      setupMock({
        threshold: { viewMin: 500, likeRateMinPercent: 2 },
        'low-data': {
          list: [],
          page: 1,
          pageSize: 10,
          total: '0',
          totalPages: 0,
          hasNext: false,
          hasPrevious: false,
        },
      });
      renderPage();
      // 初始状态 isDirty = false，直接导航不弹窗
      const tagsButton = within(
        screen.getByTestId('content-optimize-toolbar'),
      ).getByText('标签库');
      tagsButton.click();
      // 验证确认弹窗未被调用
      expect(modalSpy).not.toHaveBeenCalled();
    });
  });
});
