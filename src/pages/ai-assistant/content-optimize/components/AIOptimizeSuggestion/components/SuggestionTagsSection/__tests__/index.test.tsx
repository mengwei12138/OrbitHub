import { fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import SuggestionTagsSection from '../index';

describe('SuggestionTagsSection', () => {
  const defaultProps = {
    tags: ['#城市探店', '#咖啡馆推荐'],
    isEditing: false,
    onRemove: vi.fn(),
    onAdd: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('渲染标签列表', () => {
    render(<SuggestionTagsSection {...defaultProps} />);
    expect(screen.getByText('建议标签')).toBeInTheDocument();
    expect(screen.getByText('#城市探店')).toBeInTheDocument();
    expect(screen.getByText('#咖啡馆推荐')).toBeInTheDocument();
  });

  it('默认状态显示删除按钮和添加输入框', () => {
    render(<SuggestionTagsSection {...defaultProps} isEditing={false} />);
    const removeButtons = screen.getAllByRole('button');
    expect(removeButtons.length).toBe(2);
    expect(
      screen.queryByPlaceholderText('输入后按回车添加'),
    ).toBeInTheDocument();
  });

  it('点击删除标签按钮', () => {
    render(<SuggestionTagsSection {...defaultProps} isEditing={false} />);
    const removeButtons = screen.getAllByRole('button');
    fireEvent.click(removeButtons[0]);
    expect(defaultProps.onRemove).toHaveBeenCalledWith(0);
  });

  it('输入回车添加标签，自动补充#前缀', () => {
    render(<SuggestionTagsSection {...defaultProps} isEditing={true} />);
    const input = screen.getByPlaceholderText('输入后按回车添加');
    fireEvent.keyDown(input, { key: 'Enter', target: { value: '新标签' } });
    expect(defaultProps.onAdd).toHaveBeenCalledWith('#新标签');
  });

  it('输入带#前缀的标签不再重复添加', () => {
    render(<SuggestionTagsSection {...defaultProps} isEditing={true} />);
    const input = screen.getByPlaceholderText('输入后按回车添加');
    fireEvent.keyDown(input, { key: 'Enter', target: { value: '#已有前缀' } });
    expect(defaultProps.onAdd).toHaveBeenCalledWith('#已有前缀');
  });
});
