import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

const customProTableMock = vi.fn();
const reviewMutateMock = vi.fn();

vi.mock('@/components', () => ({
  PageHeader: ({ title }: { title: string }) => <div>{title}</div>,
  CustomProTable: (props: { columns: Array<{ render?: (_: unknown, record: { id: string; status: 'PENDING' }) => React.ReactNode }> }) => {
    customProTableMock(props);
    const statusNode = props.columns[4]?.render?.(null, {
      id: 'req-001',
      status: 'PENDING',
    });
    return (
      <div>
        <div>table</div>
        {statusNode}
      </div>
    );
  },
}));

vi.mock('@/services/account-request', () => ({
  accountRequestListQueryOptions: vi.fn(),
  useReviewAccountRequest: () => ({
    mutate: reviewMutateMock,
    isPending: false,
  }),
}));

import AccountRequestReviewPage from '../index';

describe('账号申请审核页面', () => {
  it('展示标题并挂载表格', () => {
    render(<AccountRequestReviewPage />);

    expect(screen.getByText('账号申请审核')).toBeInTheDocument();
    expect(screen.getByText('table')).toBeInTheDocument();
    expect(customProTableMock).toHaveBeenCalledTimes(1);
  });

  it('点击待审核后触发审核动作', () => {
    render(<AccountRequestReviewPage />);

    fireEvent.click(screen.getByRole('button', { name: '待审核' }));
    expect(reviewMutateMock).toHaveBeenCalledWith({ id: 'req-001' });
  });
});
