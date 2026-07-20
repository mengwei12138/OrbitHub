import { describe, expect, it } from 'vitest';

import { parseImageGenerationResult } from '../imageResultParser';

describe('parseImageGenerationResult', () => {
  it('有 productServiceName 时标题用产品名、正文保留整段 AI 文案', () => {
    const content =
      '19岁的你，是不是早就幻想过开着跑车炸街的样子？\n\n引擎轰鸣的瞬间，路人投来羡慕的目光。';

    const result = parseImageGenerationResult(
      'task-1',
      {
        status: 'COMPLETED',
        progress: 100,
        content,
        title: '',
        tags: [],
        images: ['https://example.com/car.png'],
      },
      { productServiceName: '  豪华跑车  ' },
    );

    expect(result.title).toBe('豪华跑车');
    expect(result.content).toBe(content);
    expect(result.images).toEqual(['https://example.com/car.png']);
  });

  it('无 productServiceName 时仍从正文首段拆分标题', () => {
    const result = parseImageGenerationResult('task-2', {
      status: 'COMPLETED',
      progress: 100,
      content: '首行标题\n\n正文段落',
      title: '',
      tags: [],
    });

    expect(result.title).toBe('首行标题');
    expect(result.content).toBe('正文段落');
  });
});
