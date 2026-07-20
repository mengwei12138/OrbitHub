import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { GenerationResult } from '../../../types';
import { GenerationResultModal } from '../index';

const baseResult: GenerationResult = {
  id: 'task-1',
  title: '测试标题',
  content: '测试内容正文',
  tags: ['#标签1', '#标签2'],
  images: ['https://example.com/img.jpg'],
  createdAt: new Date(),
};

describe('GenerationResultModal', () => {
  it('imageCount=1 时渲染图片 + 下载图片按钮', () => {
    render(
      <GenerationResultModal visible result={baseResult} imageCount={1} />,
    );
    expect(screen.getByText('图文生成完成')).toBeTruthy();
    expect(document.querySelector('img[alt="生成配图"]')).toBeTruthy();
    // 含图模式下，下载按钮在图片区与底部按钮组都出现
    expect(screen.getAllByText('下载图片').length).toBeGreaterThan(0);
  });

  it('imageCount=0 时不渲染图片区与下载图片按钮', () => {
    render(
      <GenerationResultModal
        visible
        result={{ ...baseResult, images: [] }}
        imageCount={0}
      />,
    );
    expect(document.querySelector('img[alt="生成配图"]')).toBeNull();
    expect(screen.queryByText('下载图片')).toBeNull();
  });

  it('imageCount=1 但 images 为空时退化为纯文案', () => {
    render(
      <GenerationResultModal
        visible
        result={{ ...baseResult, images: [] }}
        imageCount={1}
      />,
    );
    expect(document.querySelector('img[alt="生成配图"]')).toBeNull();
    expect(screen.queryByText('下载图片')).toBeNull();
  });

  it('点击复制文本调用剪贴板', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText },
    });
    render(
      <GenerationResultModal visible result={baseResult} imageCount={0} />,
    );
    fireEvent.click(screen.getByText('复制文本'));
    await Promise.resolve();
    expect(writeText).toHaveBeenCalledWith('测试内容正文');
  });

  it('渲染标题、正文与标签', () => {
    render(
      <GenerationResultModal visible result={baseResult} imageCount={0} />,
    );
    expect(screen.getByText('测试标题')).toBeTruthy();
    expect(screen.getByText('测试内容正文')).toBeTruthy();
    expect(screen.getByText('#标签1')).toBeTruthy();
    expect(screen.getByText('#标签2')).toBeTruthy();
  });

  it('title 为空时不渲染标题区', () => {
    render(
      <GenerationResultModal
        visible
        result={{ ...baseResult, title: '' }}
        imageCount={0}
      />,
    );
    expect(screen.queryByText('标题')).toBeNull();
  });
});
