import { fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import Header from '../index';

describe('Header', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('渲染标题和针对标签', () => {
    const onClose = vi.fn();
    render(<Header title="测试标题" onClose={onClose} />);
    expect(screen.getByText('AI 优化建议')).toBeInTheDocument();
    expect(screen.getByText('针对：测试标题')).toBeInTheDocument();
  });

  it('点击关闭按钮触发回调', () => {
    const onClose = vi.fn();
    render(<Header title="测试标题" onClose={onClose} />);
    fireEvent.click(screen.getByRole('button'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
