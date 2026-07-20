import { describe, expect, it } from 'vitest';

import { formatThousands } from '../index';

describe('money', () => {
  describe('formatThousands', () => {
    it('应正确格式化千分位', () => {
      expect(formatThousands(1234567.89)).toBe('1,234,567.89');
    });

    it('应处理整数', () => {
      expect(formatThousands(1234567, 0)).toBe('1,234,567');
    });

    it('应处理字符串数字', () => {
      expect(formatThousands('1234567.89')).toBe('1,234,567.89');
    });

    it('应处理零', () => {
      expect(formatThousands(0)).toBe('0.00');
    });

    it('应处理非法字符串返回默认值', () => {
      expect(formatThousands('abc')).toBe('0.00');
    });
  });
});
