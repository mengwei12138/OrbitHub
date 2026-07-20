import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { AIDisclaimerAlert } from '../index';

describe('AIDisclaimerAlert', () => {
  it('渲染警告文本', () => {
    render(<AIDisclaimerAlert />);
    expect(
      screen.getByText('AI 生成内容，结果仅供参考，请自行审核'),
    ).toBeTruthy();
  });

  it('渲染警告图标', () => {
    render(<AIDisclaimerAlert />);
    const svg = document.querySelector('svg');
    expect(svg).toBeTruthy();
  });

  it('接受 className prop', () => {
    const { container } = render(
      <AIDisclaimerAlert className="custom-class" />,
    );
    expect(container.querySelector('.custom-class')).toBeTruthy();
  });
});
