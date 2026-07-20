import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render } from '@testing-library/react';
import type React from 'react';
import { describe, expect, it, vi } from 'vitest';

import OperationLogPage from '../index';

vi.mock('@/services/operation-log', () => ({
  operationLogsQueryOptions: vi.fn().mockReturnValue({
    queryKey: ['operation-log', 'list', {}],
    queryFn: vi.fn().mockResolvedValue({
      list: [],
      page: 1,
      pageSize: 10,
      total: 0,
    }),
  }),
  OPERATION_LOG_OPERATION_TYPE_VALUE_ENUM: {},
}));

vi.mock('@/services/admin-tenant', () => ({
  tenantListQueryOptions: vi.fn().mockReturnValue({
    queryKey: ['admin-tenant', 'list', { page: 1, pageSize: 1000 }],
    queryFn: vi.fn().mockResolvedValue({ list: [], total: 0 }),
  }),
}));

vi.mock('@/services/admin-user', () => ({
  userListQueryOptions: vi.fn().mockReturnValue({
    queryKey: ['admin-user', 'list', { page: 1, pageSize: 1000 }],
    queryFn: vi.fn().mockResolvedValue({ list: [], total: 0 }),
  }),
}));

vi.mock('@/components', () => ({
  CustomEmpty: vi.fn(() => <div>暂无操作日志</div>),
  CustomProTable: vi.fn(() => <div>ProTable</div>),
}));

const renderWithClient = (ui: React.ReactElement) => {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(<QueryClientProvider client={qc}>{ui}</QueryClientProvider>);
};

describe('OperationLogPage', () => {
  it('renders without crashing', () => {
    const { container } = renderWithClient(<OperationLogPage />);
    expect(container).toBeTruthy();
  });

  it('renders the page title', () => {
    const { getByText } = renderWithClient(<OperationLogPage />);
    expect(getByText('操作日志')).toBeTruthy();
  });

  it('renders CustomProTable component', () => {
    const { getByText } = renderWithClient(<OperationLogPage />);
    expect(getByText('ProTable')).toBeTruthy();
  });
});
