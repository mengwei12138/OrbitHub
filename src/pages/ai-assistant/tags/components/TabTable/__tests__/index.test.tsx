import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import TabTable from '../index';

describe('TabTable', () => {
  it('should render table with columns', () => {
    render(<TabTable categoryOptions={[]} />);

    expect(screen.getAllByText('标签名称').length).toBeGreaterThan(0);
    expect(screen.getAllByText('分类').length).toBeGreaterThan(0);
    expect(screen.getAllByText('使用次数').length).toBeGreaterThan(0);
    expect(screen.getAllByText('最近使用').length).toBeGreaterThan(0);
    expect(screen.getAllByText('状态').length).toBeGreaterThan(0);
    expect(screen.getAllByText('操作').length).toBeGreaterThan(0);
  });
});
