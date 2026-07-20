import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { BackButton } from '../index';

describe('BackButton', () => {
  it('渲染按钮', () => {
    render(<BackButton />);
    expect(screen.getByText('返回')).toBeTruthy();
  });

  it('渲染箭头图标', () => {
    render(<BackButton />);
    const svg = document.querySelector('svg');
    expect(svg).toBeTruthy();
  });

  it('接受 onClick 回调', () => {
    const onClick = vi.fn();
    render(<BackButton onClick={onClick} />);
    const button = document.querySelector('button');
    button?.click();
    expect(onClick).toHaveBeenCalled();
  });

  it('接受 className prop', () => {
    const { container } = render(<BackButton className="custom-class" />);
    expect(container.querySelector('.custom-class')).toBeTruthy();
  });
});
