import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import DeleteOriginalCard from '../index';

describe('DeleteOriginalCard 组件', () => {
  it('应正确渲染标题', () => {
    render(<DeleteOriginalCard checked={false} onChange={vi.fn()} />);
    expect(screen.getByText('删除原内容')).toBeInTheDocument();
  });

  it('应正确渲染描述文字', () => {
    render(<DeleteOriginalCard checked={false} onChange={vi.fn()} />);
    expect(
      screen.getByText('重新发布后删除原内容（仅当发布到同账号时生效）'),
    ).toBeInTheDocument();
  });

  it('选中状态应正确显示', () => {
    render(<DeleteOriginalCard checked={true} onChange={vi.fn()} />);
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toBeChecked();
  });

  it('未选中状态应正确显示', () => {
    render(<DeleteOriginalCard checked={false} onChange={vi.fn()} />);
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).not.toBeChecked();
  });
});
