import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { GenerationCompleteToast } from '../index';

describe('GenerationCompleteToast', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('visible 为 true 时渲染标题与操作文案', () => {
    render(
      <GenerationCompleteToast
        visible
        title="视频生成完成"
        onAction={vi.fn()}
        onClose={vi.fn()}
      />,
    );
    expect(screen.getByText('视频生成完成')).toBeTruthy();
    expect(screen.getByText('点击查看详情')).toBeTruthy();
  });

  it('点击操作按钮触发 onAction', () => {
    const onAction = vi.fn();
    render(
      <GenerationCompleteToast
        visible
        title="视频生成完成"
        onAction={onAction}
        onClose={vi.fn()}
      />,
    );
    fireEvent.click(screen.getByText('点击查看详情'));
    expect(onAction).toHaveBeenCalledTimes(1);
  });

  it('到达 autoCloseMs 后触发 onClose', () => {
    vi.useFakeTimers();
    const onClose = vi.fn();
    render(
      <GenerationCompleteToast
        visible
        title="视频生成完成"
        autoCloseMs={5000}
        onClose={onClose}
      />,
    );
    vi.advanceTimersByTime(5000);
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
