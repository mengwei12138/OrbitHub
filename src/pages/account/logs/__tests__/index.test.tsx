import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import type React from 'react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn(),
  useSearchParams: () => [new URLSearchParams(), vi.fn()],
}));

vi.mock('@/services/account', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/services/account')>();
  return {
    ...actual,
    useAccount: () => ({
      data: {
        id: '1',
        nickname: '美食探店号A',
        platform: '小红书',
        phoneNumber: '138****6789',
        status: 'ONLINE',
        followers: '125380',
      },
      isLoading: false,
      error: null,
    }),
    accountLogsQueryOptions: vi.fn(() => ({
      queryKey: ['account', 'logs'],
      queryFn: vi.fn().mockResolvedValue({
        list: [],
        total: '0',
      }),
    })),
  };
});

vi.mock('@/components', () => ({
  CustomProTable: vi.fn(() => <div data-testid="pro-table" />),
  CustomEmpty: vi.fn(() => <div>暂无日志记录</div>),
}));

import AccountLogsPage from '../index';

const createWrapper = () => {
  const queryClient = new QueryClient();
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('日志管理页', () => {
  it('应渲染日志管理页面', () => {
    render(<AccountLogsPage />, { wrapper: createWrapper() });
    expect(screen.getByText('操作日志')).toBeInTheDocument();
  });
});
