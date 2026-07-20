import { fireEvent, render, screen } from '@testing-library/react';
import { forwardRef, type ReactNode } from 'react';
import MessagePanel from '../index';

/** 避免 ProTable 在 Tab 来回切换时重复挂载导致 CI 超过默认 5s */
vi.mock('@/components', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/components')>();
  return {
    ...actual,
    CustomProTable: forwardRef<
      unknown,
      { toolbar?: { search?: ReactNode }; queryOptions?: unknown }
    >(function MessagePanelTestProTableMock({ toolbar }, _ref) {
      return (
        <div data-testid="message-panel-mock-pro-table">{toolbar?.search}</div>
      );
    }),
  };
});

const mockQueryOptions = () => ({
  queryKey: ['test'] as unknown[],
  queryFn: async () => ({
    list: [],
    total: 0,
  }),
});

describe('MessagePanel', () => {
  it('默认显示待处理私信 Tab', () => {
    render(
      <MessagePanel
        pendingQueryOptions={mockQueryOptions}
        historyQueryOptions={mockQueryOptions}
      />,
    );
    expect(screen.getByText('待处理私信')).toBeInTheDocument();
    expect(screen.getByText('私信记录')).toBeInTheDocument();
  });

  it('点击私信记录 Tab 切换内容', () => {
    render(
      <MessagePanel
        pendingQueryOptions={mockQueryOptions}
        historyQueryOptions={mockQueryOptions}
      />,
    );
    fireEvent.click(screen.getByRole('tab', { name: '私信记录' }));
    expect(screen.getByRole('tab', { name: '私信记录' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
  });

  it('点击待处理私信 Tab 切换回待处理', () => {
    render(
      <MessagePanel
        pendingQueryOptions={mockQueryOptions}
        historyQueryOptions={mockQueryOptions}
      />,
    );
    fireEvent.click(screen.getByRole('tab', { name: '私信记录' }));
    fireEvent.click(screen.getByRole('tab', { name: '待处理私信' }));
    expect(screen.getByRole('tab', { name: '待处理私信' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
  });

  it('接受 onAutoReply 回调', () => {
    const handleAutoReply = vi.fn();
    render(
      <MessagePanel
        pendingQueryOptions={mockQueryOptions}
        historyQueryOptions={mockQueryOptions}
        onAutoReply={handleAutoReply}
      />,
    );
    expect(handleAutoReply).not.toHaveBeenCalled();
  });

  it('接受 onManualReply 回调', () => {
    const handleManualReply = vi.fn();
    render(
      <MessagePanel
        pendingQueryOptions={mockQueryOptions}
        historyQueryOptions={mockQueryOptions}
        onManualReply={handleManualReply}
      />,
    );
    expect(handleManualReply).not.toHaveBeenCalled();
  });

  it('接受 onView 回调', () => {
    const handleView = vi.fn();
    render(
      <MessagePanel
        pendingQueryOptions={mockQueryOptions}
        historyQueryOptions={mockQueryOptions}
        onView={handleView}
      />,
    );
    expect(handleView).not.toHaveBeenCalled();
  });
});
