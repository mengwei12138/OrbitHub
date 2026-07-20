import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { QueueFullModal } from '../index';

describe('QueueFullModal', () => {
  it('visible 为 false 时不渲染', () => {
    const { container } = render(<QueueFullModal visible={false} />);
    expect(container.firstChild).toBeNull();
  });

  it('visible 为 true 时渲染', () => {
    render(<QueueFullModal visible />);
    expect(screen.getByText('生成队列已满')).toBeTruthy();
  });

  it('显示队列任务数量', () => {
    render(<QueueFullModal visible queueCount={5} />);
    expect(screen.getByText(/当前有 5 个任务正在生成中/u)).toBeTruthy();
  });

  it('渲染提示信息', () => {
    render(<QueueFullModal visible />);
    expect(
      screen.getByText(/您可以在「我的作品」中查看已完成的任务/u),
    ).toBeTruthy();
  });

  it('关闭按钮可点击', () => {
    const onClose = vi.fn();
    render(<QueueFullModal visible onClose={onClose} />);
    screen.getByText('✕').click();
    expect(onClose).toHaveBeenCalled();
  });

  it('我知道了按钮可点击', () => {
    const onClose = vi.fn();
    render(<QueueFullModal visible onClose={onClose} />);
    screen.getByText('我知道了').click();
    expect(onClose).toHaveBeenCalled();
  });
});
