import { render } from '@testing-library/react';
import { createRef } from 'react';
import { describe, expect, it, vi } from 'vitest';
import CustomTable from '../index';
import type { CustomTableRef } from '../types';

vi.mock('@/components', () => ({
  CustomEmpty: vi.fn(() => <div>CustomEmpty</div>),
}));

vi.mock('antd', () => ({
  Table: vi.fn(
    ({
      dataSource,
      rowKey,
      columns,
      scroll,
      virtual,
    }: {
      dataSource?: unknown[];
      rowKey?: string;
      columns?: Record<string, unknown>[];
      scroll?: { x?: string };
      virtual?: boolean;
    }) => (
      <div
        data-testid="antd-table"
        data-rowkey={String(rowKey)}
        data-scroll={JSON.stringify(scroll)}
        data-virtual={String(virtual)}
      >
        <div data-testid="table-value">{JSON.stringify(dataSource ?? [])}</div>
        <span data-testid="columns-count">{columns?.length || 0}</span>
      </div>
    ),
  ),
}));

describe('CustomTable 组件单元测试', () => {
  it('渲染 antd Table', () => {
    const { getByTestId } = render(<CustomTable dataSource={[{ id: '1' }]} />);
    expect(getByTestId('antd-table')).toBeDefined();
  });

  it('默认 rowKey 为 id', () => {
    const { getByTestId } = render(<CustomTable dataSource={[{ id: '1' }]} />);
    expect(getByTestId('antd-table').getAttribute('data-rowkey')).toBe('id');
  });

  it('自定义 rowKey 正常工作', () => {
    const { getByTestId } = render(
      <CustomTable dataSource={[{ uid: '1' }]} rowKey="uid" />,
    );
    expect(getByTestId('antd-table').getAttribute('data-rowkey')).toBe('uid');
  });

  it('默认启用虚拟化', () => {
    const { getByTestId } = render(<CustomTable dataSource={[{ id: '1' }]} />);
    expect(getByTestId('antd-table').getAttribute('data-virtual')).toBe('true');
  });

  it('ref 存在但为空对象', () => {
    const ref = createRef<CustomTableRef>();
    render(<CustomTable ref={ref} dataSource={[{ id: '1' }]} />);
    expect(ref.current).toEqual({});
  });
});
