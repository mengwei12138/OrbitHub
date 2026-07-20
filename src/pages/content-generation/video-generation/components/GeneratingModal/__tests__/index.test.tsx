import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { GeneratingModal } from '../index';

describe('GeneratingModal', () => {
  it('visible 为 false 时不渲染', () => {
    const { container } = render(<GeneratingModal visible={false} />);
    expect(container.firstChild).toBeNull();
  });

  it('visible 为 true 时渲染视频生成中', () => {
    render(<GeneratingModal visible />);
    expect(screen.getByText('视频生成中')).toBeTruthy();
  });

  it('显示默认进度 0%', () => {
    render(<GeneratingModal visible />);
    expect(screen.getByText('0%')).toBeTruthy();
  });

  it('显示自定义进度与预计时长文案', () => {
    render(<GeneratingModal visible progress={50} />);
    expect(screen.getByText('50%')).toBeTruthy();
    expect(screen.getByText('预计还需6~10分钟')).toBeTruthy();
  });

  it('渲染加载动画', () => {
    render(<GeneratingModal visible />);
    const loader = document.querySelector('svg');
    expect(loader).toBeTruthy();
  });

  it('渲染进度文本', () => {
    render(<GeneratingModal visible progress={60} />);
    expect(screen.getByText('60%')).toBeTruthy();
  });

  it('关闭按钮可点击', () => {
    const onClose = vi.fn();
    render(<GeneratingModal visible onClose={onClose} />);
    screen.getByText('✕').click();
    expect(onClose).toHaveBeenCalled();
  });

  it('后台运行按钮可点击', () => {
    const onBackground = vi.fn();
    render(<GeneratingModal visible onBackground={onBackground} />);
    screen.getByText('后台运行').click();
    expect(onBackground).toHaveBeenCalled();
  });

  it('我知道了按钮可点击', () => {
    const onClose = vi.fn();
    render(<GeneratingModal visible onClose={onClose} />);
    screen.getByText('我知道了').click();
    expect(onClose).toHaveBeenCalled();
  });
});
