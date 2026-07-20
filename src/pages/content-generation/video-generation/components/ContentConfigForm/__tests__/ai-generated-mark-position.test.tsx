import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { ContentConfigForm } from '../index';

describe('ContentConfigForm AI 生成标记位置', () => {
  it('默认展示左下，并提供左下、中下、右下三个选项', () => {
    const html = renderToStaticMarkup(<ContentConfigForm />);

    expect(html).toContain('AI生成标记位置');
    expect(html).toContain(
      '<option value="bottom-left" selected="">左下</option>',
    );
    expect(html).toContain('<option value="bottom-center">中下</option>');
    expect(html).toContain('<option value="bottom-right">右下</option>');
  });
});
