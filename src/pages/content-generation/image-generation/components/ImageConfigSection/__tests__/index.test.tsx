import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { ImageConfigSection } from '../index';

describe('ImageConfigSection', () => {
  const mockProps = {
    imageCount: 1 as const,
    aiGeneratedMarkPosition: 'bottom-left' as const,
    onImageCountChange: vi.fn(),
    onAIGeneratedMarkPositionChange: vi.fn(),
  };

  it('渲染配图设置标题', () => {
    render(<ImageConfigSection {...mockProps} />);
    expect(screen.getByText('配图设置')).toBeTruthy();
  });

  it('渲染配图数量选项', () => {
    render(<ImageConfigSection {...mockProps} />);
    expect(screen.getByText('不生成')).toBeTruthy();
    expect(screen.getByText('1 张')).toBeTruthy();
  });

  it('点击选项触发回调', () => {
    render(<ImageConfigSection {...mockProps} />);
    fireEvent.click(screen.getByText('不生成'));
    expect(mockProps.onImageCountChange).toHaveBeenCalledWith(0);
  });
});
