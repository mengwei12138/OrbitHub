import { render } from '@testing-library/react';
import { createRef } from 'react';
import { describe, expect, it, vi } from 'vitest';
import CustomEditableProTable from '../index';
import type { CustomEditableProTableRef } from '../types';

vi.mock('@ant-design/pro-components', () => ({
  EditableProTable: vi.fn(
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
          data-testid="editable-table"
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

vi.mock('react-router', () => ({
  useNavigate: () => vi.fn(),
}));

describe('CustomEditableProTable 组件单元测试', () => {
  it('渲染 EditableProTable', () => {
    const { getByTestId } = render(<CustomEditableProTable />);
    expect(getByTestId('editable-table')).toBeDefined();
  });

  it('默认 rowKey 为 id', () => {
    const { getByTestId } = render(<CustomEditableProTable />);
    expect(getByTestId('editable-table').getAttribute('data-rowkey')).toBe(
      'id',
    );
  });

  it('默认启用虚拟化', () => {
    const { getByTestId } = render(<CustomEditableProTable />);
    expect(getByTestId('editable-table').getAttribute('data-virtual')).toBe(
      'true',
    );
  });

  it('ref 存在但为空对象', () => {
    const ref = createRef<CustomEditableProTableRef>();
    render(<CustomEditableProTable ref={ref} />);
    expect(ref.current).toEqual({});
  });
});
