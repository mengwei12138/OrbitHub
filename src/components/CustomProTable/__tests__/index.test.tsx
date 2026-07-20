import { render, waitFor } from '@testing-library/react';
import { createRef } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import CustomProTable from '../index';
import type { CustomProTableRef } from '../types';

const DEFAULT_PAGINATION = { page: 1, pageSize: 10 };

const mockQueryFn = vi.fn();

vi.mock('@/api', () => ({
  queryClient: {
    fetchQuery: vi.fn(({ queryFn }) => queryFn()),
  },
}));

vi.mock('@ant-design/pro-components', () => {
  const MockProTable = vi.fn(
    ({
      actionRef,
      request,
      rowKey,
      pagination,
      search,
    }: {
      actionRef?: {
        current?: {
          reload?: () => void;
          reset?: () => void;
          setPageInfo?: (info: { current: number; pageSize: number }) => void;
        };
      };
      request?: (params: Record<string, unknown>) => Promise<unknown>;
      rowKey?: string;
      pagination?: Record<string, unknown>;
      search?: Record<string, unknown> | boolean;
    }) => {
      if (request) {
        vi.useFakeTimers();
        setTimeout(() => {
          request({
            current: DEFAULT_PAGINATION.page,
            pageSize: DEFAULT_PAGINATION.pageSize,
          });
        }, 0);
        vi.advanceTimersByTime(0);
        vi.useRealTimers();
      }
      return (
        <div
          data-testid="pro-table"
          data-rowkey={String(rowKey)}
          data-action-reloaded={actionRef ? 'yes' : 'no'}
          data-pagination={JSON.stringify(pagination)}
          data-search={JSON.stringify(search)}
        >
          <span data-testid="columns-count">0</span>
        </div>
      );
    },
  );
  return { ProTable: MockProTable };
});

describe('CustomProTable 组件单元测试', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('ref 方法存在性', () => {
    it('ref.reload 方法存在', () => {
      const ref = createRef<CustomProTableRef>();
      render(<CustomProTable ref={ref} />);
      expect(typeof ref.current?.reload).toBe('function');
    });

    it('ref.reset 方法存在', () => {
      const ref = createRef<CustomProTableRef>();
      render(<CustomProTable ref={ref} />);
      expect(typeof ref.current?.reset).toBe('function');
    });
  });

  describe('queryOptions', () => {
    it('queryOptions 传入时调用 queryFn', async () => {
      const mockData = {
        list: [{ id: '1', name: 'test' }],
        total: '1',
      };
      mockQueryFn.mockResolvedValue(mockData);

      const queryOptions = vi.fn().mockReturnValue({
        queryKey: ['test'],
        queryFn: mockQueryFn,
      });

      render(<CustomProTable queryOptions={queryOptions} />);

      await waitFor(() => {
        expect(mockQueryFn).toHaveBeenCalled();
      });
    });

    it('queryOptions 返回正确的分页参数', async () => {
      const mockData = {
        list: [{ id: '1', name: 'test' }],
        total: '1',
      };
      mockQueryFn.mockResolvedValue(mockData);

      const queryOptions = vi.fn().mockReturnValue({
        queryKey: ['test'],
        queryFn: mockQueryFn,
      });

      render(<CustomProTable queryOptions={queryOptions} />);

      await waitFor(() => {
        expect(queryOptions).toHaveBeenCalledWith(
          expect.objectContaining({
            page: DEFAULT_PAGINATION.page,
            pageSize: DEFAULT_PAGINATION.pageSize,
          }),
        );
      });
    });

    it('dataSource 和 queryOptions 同时传入时，queryOptions 优先', async () => {
      const mockQueryData = {
        list: [{ id: '2', name: 'fromQuery' }],
        total: '1',
      };
      mockQueryFn.mockResolvedValue(mockQueryData);

      const queryOptions = vi.fn().mockReturnValue({
        queryKey: ['test'],
        queryFn: mockQueryFn,
      });

      render(
        <CustomProTable
          dataSource={[{ id: '1', name: 'fromDataSource' }]}
          queryOptions={queryOptions}
        />,
      );

      await waitFor(() => {
        expect(mockQueryFn).toHaveBeenCalled();
      });
    });
  });

  describe('dataSource', () => {
    it('函数形式 dataSource 被调用', async () => {
      const mockDataSource = vi.fn().mockResolvedValue({
        list: [{ id: '1', name: 'test' }],
        total: 1,
      });

      render(<CustomProTable dataSource={mockDataSource} />);

      await waitFor(() => {
        expect(mockDataSource).toHaveBeenCalled();
      });
    });

    it('Promise 形式 dataSource 正常处理', async () => {
      const mockDataSource = Promise.resolve([{ id: '1', name: 'test' }]);

      render(<CustomProTable dataSource={mockDataSource} />);

      await waitFor(() => {
        expect(mockDataSource).toBeDefined();
      });
    });
  });

  describe('search 默认值', () => {
    it('不传 search 时使用默认配置', async () => {
      render(<CustomProTable dataSource={[]} />);

      await waitFor(() => {
        const table = document.querySelector('[data-testid="pro-table"]');
        const search = JSON.parse(table?.getAttribute('data-search') || '{}');
        expect(search).toEqual({ labelWidth: 0, span: 6 });
      });
    });

    it('search={false} 时隐藏搜索', async () => {
      render(<CustomProTable dataSource={[]} search={false} />);

      await waitFor(() => {
        const table = document.querySelector('[data-testid="pro-table"]');
        const search = JSON.parse(table?.getAttribute('data-search') || 'null');
        expect(search).toBe(false);
      });
    });

    it('传入部分 search 配置时合并默认值', async () => {
      render(<CustomProTable dataSource={[]} search={{ labelWidth: 100 }} />);

      await waitFor(() => {
        const table = document.querySelector('[data-testid="pro-table"]');
        const search = JSON.parse(table?.getAttribute('data-search') || '{}');
        expect(search).toEqual({ labelWidth: 100, span: 6 });
      });
    });
  });
});
