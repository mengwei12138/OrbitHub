import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import AIOptimizeSuggestion from '../index';

describe('AIOptimizeSuggestion', () => {
  const defaultProps = {
    contentId: 'content-1',
    originalTitle: '原始标题',
    status: 'idle' as const,
    onApply: vi.fn(),
    onClose: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('渲染空卡片容器', () => {
    render(<AIOptimizeSuggestion {...defaultProps} />);
    expect(document.body.querySelector('[class*="card"]')).toBeInTheDocument();
  });

  it('关闭按钮触发回调', () => {
    render(<AIOptimizeSuggestion {...defaultProps} />);
    const closeBtn = document.body.querySelector('[class*="closeBtn"]');
    expect(closeBtn).toBeNull();
  });

  it('取消按钮在 idle 状态不渲染', () => {
    render(<AIOptimizeSuggestion {...defaultProps} />);
    expect(screen.queryByText('取消')).not.toBeInTheDocument();
  });

  it('应用并继续按钮在 idle 状态不渲染', () => {
    render(<AIOptimizeSuggestion {...defaultProps} />);
    expect(screen.queryByText('应用并继续')).not.toBeInTheDocument();
  });
});
