import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

import { ImageConfigSection } from '../index';

describe('ImageConfigSection AI 生成标记位置', () => {
  it('生成 1 张配图时展示标记位置并默认左下', () => {
    const html = renderToStaticMarkup(
      <ImageConfigSection
        {...{
          imageCount: 1 as const,
          aiGeneratedMarkPosition: 'bottom-left' as const,
          onImageCountChange: vi.fn(),
          onAIGeneratedMarkPositionChange: vi.fn(),
        }}
      />,
    );

    expect(html).toContain('AI生成标记位置');
    expect(html).toContain(
      '<option value="bottom-left" selected="">左下</option>',
    );
    expect(html).toContain('<option value="bottom-center">中下</option>');
    expect(html).toContain('<option value="bottom-right">右下</option>');
  });

  it('不生成配图时隐藏标记位置', () => {
    const html = renderToStaticMarkup(
      <ImageConfigSection
        {...{
          imageCount: 0 as const,
          aiGeneratedMarkPosition: 'bottom-left' as const,
          onImageCountChange: vi.fn(),
          onAIGeneratedMarkPositionChange: vi.fn(),
        }}
      />,
    );

    expect(html).not.toContain('AI生成标记位置');
  });
});
