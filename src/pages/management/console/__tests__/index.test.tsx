import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import ConsolePage from '../index';

vi.mock('@/components/CustomProTable', () => ({
  default: vi.fn(() => <div data-testid="pro-table" />),
}));

vi.mock('@/services/admin-tenant', () => ({
  tenantStatsQueryOptions: () => ({
    queryKey: ['admin-tenant', 'stats'],
    queryFn: vi.fn().mockResolvedValue({ total: 4, monthDelta: 0 }),
  }),
}));

vi.mock('@/services/operation-log', () => ({
  operationLogsQueryOptions: () => ({
    queryKey: ['operation-log', 'list'],
    queryFn: vi.fn().mockResolvedValue({ list: [], total: 0 }),
  }),
}));

function renderConsole() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });
  // 同步注入预取数据，让首次渲染就能看到 total=4
  queryClient.setQueryData(['admin-tenant', 'stats'], {
    total: 4,
    monthDelta: 0,
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <ConsolePage />
    </QueryClientProvider>,
  );
}

describe('ConsolePage', () => {
  it('应渲染页面标题', () => {
    renderConsole();
    expect(screen.getByText('控制台')).toBeInTheDocument();
  });

  it('应渲染刷新按钮', () => {
    renderConsole();
    expect(
      screen.getByRole('button', { name: /刷.?新/iu }),
    ).toBeInTheDocument();
  });

  it('应渲染运营看板区域', () => {
    renderConsole();
    expect(screen.getByText('运营看板')).toBeInTheDocument();
  });

  it('应渲染统计卡片', () => {
    renderConsole();
    expect(screen.getByText('总租户数')).toBeInTheDocument();
    expect(screen.getByText('4')).toBeInTheDocument();
  });

  it('应渲染最近动态区域', () => {
    renderConsole();
    expect(screen.getByText('最近动态')).toBeInTheDocument();
  });

  it('应渲染表格组件', () => {
    renderConsole();
    expect(screen.getByTestId('pro-table')).toBeInTheDocument();
  });
});
