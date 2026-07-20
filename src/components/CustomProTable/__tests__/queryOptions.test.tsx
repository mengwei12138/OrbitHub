import { act, render, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import CustomProTable from '../index';

const mockQueryFn = vi.fn();

vi.mock('@/api', () => ({
  queryClient: {
    fetchQuery: vi.fn(({ queryFn }) => queryFn()),
  },
}));

vi.mock('@ant-design/pro-components', () => {
  const mockFn = vi.fn(
    ({
      rowKey,
      value,
      request,
    }: {
      rowKey?: string;
      value?: unknown;
      request?: (params: Record<string, unknown>) => Promise<unknown>;
    }) => {
      if (request) {
        vi.useFakeTimers();
        setTimeout(() => {
          request({ current: 1, pageSize: 10 }).then(() => {});
        }, 0);
        vi.advanceTimersByTime(0);
        vi.useRealTimers();
      }
      return (
        <div data-testid="pro-table" data-rowkey={String(rowKey)}>
          <div data-testid="table-value">{JSON.stringify(value ?? [])}</div>
        </div>
      );
    },
  );
  return { ProTable: mockFn };
});

describe('CustomProTable queryOptions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls queryFn when queryOptions provided', async () => {
    mockQueryFn.mockResolvedValue({ list: [{ id: '1' }], total: '1' });

    const queryOptions = vi.fn().mockReturnValue({
      queryKey: ['test'],
      queryFn: mockQueryFn,
    });

    await act(async () => {
      render(<CustomProTable queryOptions={queryOptions} />);
    });

    await waitFor(() => {
      expect(mockQueryFn).toHaveBeenCalled();
    });
  });
});
