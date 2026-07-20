import { describe, expect, it } from 'vitest';
import { buildTitleCell, TITLE_DISPLAY_MAX } from '../titleCell';

describe('buildTitleCell', () => {
  it('优先展示标题，未超长不截断', () => {
    const cell = buildTitleCell({
      title: '春日穿搭指南',
      captionExcerpt: '文案前缀',
    });
    expect(cell).not.toBeNull();
    expect(cell?.display).toBe('春日穿搭指南');
    expect(cell?.fullText).toBe('春日穿搭指南');
  });

  it('标题超过 30 字时截断为前 30 字 + ...', () => {
    const title = 'A'.repeat(35);
    const cell = buildTitleCell({ title });
    expect(cell).not.toBeNull();
    expect(cell?.display).toBe(`${'A'.repeat(30)}...`);
    expect(cell?.fullText).toBe(title);
    expect(TITLE_DISPLAY_MAX).toBe(30);
  });

  it('标题为空字符串时回退到 captionExcerpt', () => {
    const cell = buildTitleCell({
      title: '',
      captionExcerpt: '春天就要穿温柔色系啊～分享几个搭配技巧',
    });
    expect(cell).not.toBeNull();
    expect(cell?.display).toBe('春天就要穿温柔色系啊～分享几个搭配技巧');
  });

  it('标题仅含空白字符时回退到 captionExcerpt', () => {
    const cell = buildTitleCell({
      title: '   ',
      captionExcerpt: '正文前 30 字',
    });
    expect(cell).not.toBeNull();
    expect(cell?.display).toBe('正文前 30 字');
  });

  it('captionExcerpt 超过 30 字时也截断', () => {
    const caption = 'B'.repeat(40);
    const cell = buildTitleCell({ title: '', captionExcerpt: caption });
    expect(cell).not.toBeNull();
    expect(cell?.display).toBe(`${'B'.repeat(30)}...`);
    expect(cell?.fullText).toBe(caption);
  });

  it('标题与 captionExcerpt 都为空时返回 null', () => {
    expect(buildTitleCell({})).toBeNull();
    expect(buildTitleCell({ title: '', captionExcerpt: '' })).toBeNull();
    expect(buildTitleCell({ title: '  ', captionExcerpt: '  ' })).toBeNull();
  });
});
