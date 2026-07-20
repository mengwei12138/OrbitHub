import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import EmptyStateCard from '../index';

describe('EmptyStateCard', () => {
  it('渲染空状态文本', () => {
    render(<EmptyStateCard onGoHome={vi.fn()} />);
    expect(screen.getByText('还没有作品')).toBeTruthy();
    expect(screen.getByText('去首页发起一次生成吧')).toBeTruthy();
  });

  it('渲染去首页按钮', () => {
    render(<EmptyStateCard onGoHome={vi.fn()} />);
    expect(screen.getByText('去首页生成 →')).toBeTruthy();
  });

  it('点击去首页按钮触发回调', () => {
    const onGoHome = vi.fn();
    render(<EmptyStateCard onGoHome={onGoHome} />);
    screen.getByText('去首页生成 →').click();
    expect(onGoHome).toHaveBeenCalled();
  });
});
