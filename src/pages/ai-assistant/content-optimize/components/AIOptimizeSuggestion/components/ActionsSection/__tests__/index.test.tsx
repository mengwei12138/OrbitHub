import { fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import ActionsSection from '../index';

describe('ActionsSection', () => {
  const defaultProps = {
    isSensitive: false,
    onApply: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('渲染应用按钮', () => {
    render(<ActionsSection {...defaultProps} />);
    expect(screen.getByText('应用')).toBeInTheDocument();
  });

  it('点击应用按钮', () => {
    render(<ActionsSection {...defaultProps} />);
    fireEvent.click(screen.getByText('应用'));
    expect(defaultProps.onApply).toHaveBeenCalledTimes(1);
  });

  it('敏感词状态时应用按钮禁用', () => {
    render(<ActionsSection {...defaultProps} isSensitive={true} />);
    expect(screen.getByText('应用')).toBeDisabled();
  });

  it('加载状态时显示应用中…', () => {
    render(<ActionsSection {...defaultProps} applyLoading={true} />);
    expect(screen.getByText('应用中…')).toBeInTheDocument();
    expect(screen.getByText('应用中…')).toBeDisabled();
  });
});
