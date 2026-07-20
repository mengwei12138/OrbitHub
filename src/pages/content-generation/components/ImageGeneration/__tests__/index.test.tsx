import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import ImageGeneration from '../index';

describe('ImageGeneration', () => {
  it('渲染图文生成标题', () => {
    render(<ImageGeneration onStartGenerate={vi.fn()} />);
    expect(screen.getByText('图文生成')).toBeTruthy();
  });

  it('渲染描述文本', () => {
    render(<ImageGeneration onStartGenerate={vi.fn()} />);
    expect(
      screen.getByText('填写产品信息，AI 智能生成营销图文内容'),
    ).toBeTruthy();
  });

  it('渲染标签', () => {
    render(<ImageGeneration onStartGenerate={vi.fn()} />);
    expect(
      screen.getByText('封面图 · 详情图 · 主图 · 小红书文案'),
    ).toBeTruthy();
  });

  it('渲染立即生成按钮', () => {
    render(<ImageGeneration onStartGenerate={vi.fn()} />);
    expect(screen.getByText('立即生成')).toBeTruthy();
  });

  it('点击立即生成触发回调', () => {
    const onStartGenerate = vi.fn();
    render(<ImageGeneration onStartGenerate={onStartGenerate} />);
    screen.getByText('立即生成').click();
    expect(onStartGenerate).toHaveBeenCalled();
  });

  it('渲染图片图标', () => {
    render(<ImageGeneration onStartGenerate={vi.fn()} />);
    const img = document.querySelector('img[alt="图文生成"]');
    expect(img).toBeTruthy();
  });
});
