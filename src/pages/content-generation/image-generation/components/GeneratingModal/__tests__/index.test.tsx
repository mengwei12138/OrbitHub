import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { GeneratingModal } from '../index';

describe('GeneratingModal', () => {
  it('visible 为 false 时不渲染', () => {
    const { container } = render(<GeneratingModal visible={false} />);
    expect(container.firstChild).toBeNull();
  });

  it('visible 为 true 时渲染弹窗内容', () => {
    render(<GeneratingModal visible />);
    expect(screen.getByText('图文生成中')).toBeTruthy();
    expect(screen.getByText('AI 正在生成图文内容…')).toBeTruthy();
  });

  it('显示默认进度 50%', () => {
    render(<GeneratingModal visible />);
    expect(screen.getByText('50%')).toBeTruthy();
  });

  it('显示自定义进度', () => {
    render(<GeneratingModal visible progress={75} />);
    expect(screen.getByText('75%')).toBeTruthy();
  });

  it('渲染进度文本', () => {
    render(<GeneratingModal visible progress={60} />);
    expect(screen.getByText('60%')).toBeTruthy();
  });

  it('关闭按钮可点击', () => {
    const onClose = vi.fn();
    render(<GeneratingModal visible onClose={onClose} />);
    const closeBtn = screen.getByText('✕');
    closeBtn.click();
    expect(onClose).toHaveBeenCalled();
  });

  it('后台运行按钮可点击', () => {
    const onBackground = vi.fn();
    render(<GeneratingModal visible onBackground={onBackground} />);
    const bgBtn = screen.getByText('后台运行');
    bgBtn.click();
    expect(onBackground).toHaveBeenCalled();
  });

  it('我知道了按钮可点击', () => {
    const onClose = vi.fn();
    render(<GeneratingModal visible onClose={onClose} />);
    const knowBtn = screen.getByText('我知道了');
    knowBtn.click();
    expect(onClose).toHaveBeenCalled();
  });
});
