import { fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import SuggestionTitleSection from '../index';

describe('SuggestionTitleSection', () => {
  const defaultProps = {
    title: '建议标题内容',
    originalTitle: '原始标题',
    isEditing: false,
    onEdit: vi.fn(),
    onRestore: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('渲染标题和建议标签', () => {
    render(<SuggestionTitleSection {...defaultProps} />);
    expect(screen.getByText('建议标题')).toBeInTheDocument();
    expect(screen.getByText('（AI 已生成，可直接编辑）')).toBeInTheDocument();
    expect(screen.getByDisplayValue('建议标题内容')).toBeInTheDocument();
  });

  it('编辑标题时触发回调', () => {
    render(<SuggestionTitleSection {...defaultProps} />);
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: '新标题' } });
    expect(defaultProps.onEdit).toHaveBeenCalledWith('新标题');
  });

  it('点击恢复原标题按钮', () => {
    render(<SuggestionTitleSection {...defaultProps} />);
    fireEvent.click(screen.getByText('恢复原标题'));
    expect(defaultProps.onRestore).toHaveBeenCalledTimes(1);
  });

  it('标题与原标题相同时禁用恢复按钮', () => {
    render(<SuggestionTitleSection {...defaultProps} title="原始标题" />);
    expect(screen.getByRole('button', { name: '恢复原标题' })).toBeDisabled();
  });
});
