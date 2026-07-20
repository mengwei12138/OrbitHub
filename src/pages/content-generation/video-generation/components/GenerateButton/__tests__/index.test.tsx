import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { GenerateButton } from '../index';

describe('GenerateButton', () => {
  it('默认渲染立即生成视频文案', () => {
    render(<GenerateButton credits={100} />);
    expect(screen.getByText('立即生成视频 · 需 100 积分')).toBeTruthy();
  });

  it('试用模式且有剩余次数时显示试用文案', () => {
    render(<GenerateButton isTrialMode trialRemaining={3} credits={100} />);
    expect(screen.getByText('免费试用生成视频 · 剩余 3 次')).toBeTruthy();
  });

  it('试用模式但无剩余次数时显示普通文案', () => {
    render(<GenerateButton isTrialMode trialRemaining={0} credits={100} />);
    expect(screen.getByText('立即生成视频 · 需 100 积分')).toBeTruthy();
  });

  it('接受 onClick 回调', () => {
    const onClick = vi.fn();
    render(<GenerateButton onClick={onClick} credits={100} />);
    const button = document.querySelector('button');
    button?.click();
    expect(onClick).toHaveBeenCalled();
  });

  it('接受 className prop', () => {
    const { container } = render(
      <GenerateButton className="custom-class" credits={100} />,
    );
    expect(container.querySelector('.custom-class')).toBeTruthy();
  });

  it('默认 credits 为 0', () => {
    render(<GenerateButton />);
    expect(screen.getByText('立即生成视频 · 需 0 积分')).toBeTruthy();
  });
});
