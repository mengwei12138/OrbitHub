import { render } from '@testing-library/react';
import { createRef } from 'react';
import { describe, expect, it, vi } from 'vitest';
import CustomDragSortTable from '../index';
import type { CustomDragSortTableRef } from '../types';

vi.mock('@ant-design/pro-components', () => ({
  DragSortTable: vi.fn(
    ({
      rowKey,
      columns,
      scroll,
      virtual,
    }: {
      rowKey?: string;
      columns?: Record<string, unknown>[];
      scroll?: { x?: string };
      virtual?: boolean;
    }) => {
      return (
        <div
          data-testid="drag-sort-table"
          data-rowkey={String(rowKey)}
          data-scroll={JSON.stringify(scroll)}
          data-virtual={String(virtual)}
        >
          <span data-testid="columns-count">{columns?.length || 0}</span>
        </div>
      );
    },
  ),
}));

describe('CustomDragSortTable 组件单元测试', () => {
  it('渲染 DragSortTable', () => {
    const { getByTestId } = render(<CustomDragSortTable />);
    expect(getByTestId('drag-sort-table')).toBeDefined();
  });

  it('默认 rowKey 为 id', () => {
    const { getByTestId } = render(<CustomDragSortTable />);
    expect(getByTestId('drag-sort-table').getAttribute('data-rowkey')).toBe(
      'id',
    );
  });

  it('默认启用虚拟化', () => {
    const { getByTestId } = render(<CustomDragSortTable />);
    expect(getByTestId('drag-sort-table').getAttribute('data-virtual')).toBe(
      'true',
    );
  });

  it('ref 存在但为空对象', () => {
    const ref = createRef<CustomDragSortTableRef>();
    render(<CustomDragSortTable ref={ref} />);
    expect(ref.current).toEqual({});
  });
});
