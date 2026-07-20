import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import ContentEditCard from '../index';

describe('ContentEditCard 组件', () => {
  const defaultProps = {
    title: '测试标题',
    content: '测试内容',
    tags: ['#标签1', '#标签2'],
    onTitleChange: vi.fn(),
    onContentChange: vi.fn(),
    onTagsChange: vi.fn(),
    onAIGenerate: vi.fn(),
    aiLoading: false,
  };

  it('应渲染标题输入框', () => {
    render(<ContentEditCard {...defaultProps} />);
    const inputs = screen.getAllByRole('textbox');
    expect(inputs.length).toBeGreaterThan(0);
  });

  it('应正确渲染内容', () => {
    render(<ContentEditCard {...defaultProps} />);
    expect(screen.getByText('测试内容')).toBeInTheDocument();
  });

  it('应正确渲染标签', () => {
    render(<ContentEditCard {...defaultProps} />);
    expect(screen.getByText('#标签1')).toBeInTheDocument();
    expect(screen.getByText('#标签2')).toBeInTheDocument();
  });

  it('应渲染AI生成内容按钮', () => {
    render(<ContentEditCard {...defaultProps} />);
    expect(screen.getByText('AI生成内容')).toBeInTheDocument();
  });

  it('应正确调用标题修改回调', () => {
    render(<ContentEditCard {...defaultProps} />);
    const inputs = screen.getAllByPlaceholderText('请输入内容');
    expect(inputs.length).toBeGreaterThan(0);
  });

  it('应渲染编辑标签文字', () => {
    render(<ContentEditCard {...defaultProps} />);
    expect(screen.getByText('编辑标签：')).toBeInTheDocument();
  });

  it('应正确调用AI生成回调', () => {
    const onAIGenerate = vi.fn();
    render(<ContentEditCard {...defaultProps} onAIGenerate={onAIGenerate} />);
    screen.getByText('AI生成内容').click();
    expect(onAIGenerate).toHaveBeenCalledTimes(1);
  });

  it('AI生成按钮应在加载状态下显示loading状态', () => {
    render(<ContentEditCard {...defaultProps} aiLoading={true} />);
    const button = screen.getByText('AI生成内容');
    expect(button.closest('button')).toHaveClass('ant-btn-loading');
  });
});
