import { describe, expect, it } from 'vitest';
import { formatCompactCount } from '../index';

describe('formatCompactCount', () => {
  it('不足1万直接显示数字', () => {
    expect(formatCompactCount(9999)).toBe('9999');
  });

  it('达到1万显示X.X万', () => {
    expect(formatCompactCount(125_000)).toBe('12.5万');
  });

  it('达到1亿显示X.X亿', () => {
    expect(formatCompactCount(120_000_000)).toBe('1.2亿');
    expect(formatCompactCount(125_000_000)).toBe('1.3亿');
  });

  it('非有限数字返回短横线', () => {
    expect(formatCompactCount(Number.NaN)).toBe('-');
  });
});
