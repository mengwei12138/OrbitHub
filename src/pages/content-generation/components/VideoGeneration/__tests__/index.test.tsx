import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import VideoGeneration from '../index';

describe('VideoGeneration', () => {
  it('渲染视频生成标题', () => {
    render(<VideoGeneration onStartGenerate={vi.fn()} />);
    expect(screen.getByText('视频生成')).toBeTruthy();
  });

  it('渲染描述文本', () => {
    render(<VideoGeneration onStartGenerate={vi.fn()} />);
    expect(
      screen.getByText('上传产品图片/视频，AI 智能生成高质量短视频'),
    ).toBeTruthy();
  });

  it('渲染标签', () => {
    render(<VideoGeneration onStartGenerate={vi.fn()} />);
    expect(
      screen.getByText('支持多素材上传 · 智能场景适配 · 多种清晰度'),
    ).toBeTruthy();
  });

  it('渲染立即生成按钮', () => {
    render(<VideoGeneration onStartGenerate={vi.fn()} />);
    expect(screen.getByText('立即生成')).toBeTruthy();
  });

  it('点击立即生成触发回调', () => {
    const onStartGenerate = vi.fn();
    render(<VideoGeneration onStartGenerate={onStartGenerate} />);
    screen.getByText('立即生成').click();
    expect(onStartGenerate).toHaveBeenCalled();
  });

  it('渲染图片图标', () => {
    render(<VideoGeneration onStartGenerate={vi.fn()} />);
    const img = document.querySelector('img[alt="视频生成"]');
    expect(img).toBeTruthy();
  });
});
