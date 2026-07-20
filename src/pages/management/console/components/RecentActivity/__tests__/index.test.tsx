import { render, screen } from '@testing-library/react';
import RecentActivityTable from '../index';

vi.mock('@/components/CustomProTable', () => ({
  default: vi.fn(() => <div data-testid="pro-table" />),
}));

vi.mock('@/services/operation-log', () => ({
  operationLogsQueryOptions: () => ({
    queryKey: ['operation-log', 'list'],
    queryFn: vi.fn().mockResolvedValue({ list: [], total: 0 }),
  }),
}));

describe('RecentActivityTable', () => {
  it('应渲染表格容器', () => {
    render(<RecentActivityTable />);
    expect(screen.getByTestId('pro-table')).toBeInTheDocument();
  });
});
