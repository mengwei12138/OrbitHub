import { describe, expect, it } from 'vitest';

import { toFixed } from '../index';

describe('number', () => {
  describe('toFixed', () => {
    it('默认应四舍五入并补0', () => {
      expect(toFixed(Math.PI, 2)).toBe('3.14');
      expect(toFixed(3.5, 0)).toBe('4');
      expect(toFixed(3.1, 2)).toBe('3.10');
      expect(toFixed(Math.PI, 4)).toBe('3.1416');
    });

    it('应支持截断', () => {
      expect(toFixed(3.999, 2, { round: false })).toBe('3.99');
      expect(toFixed(Math.PI, 3, { round: false })).toBe('3.141');
    });

    it('应支持不补0', () => {
      expect(toFixed(3.1, 2, { padZero: false })).toBe('3.1');
      expect(toFixed(3.0, 2, { padZero: false })).toBe('3');
    });

    it('应支持截断且不补0', () => {
      expect(toFixed(3.999, 2, { round: false, padZero: false })).toBe('3.99');
      expect(toFixed(3.0, 2, { round: false, padZero: false })).toBe('3');
    });

    it('应处理字符串数字', () => {
      expect(toFixed('3.14159', 2)).toBe('3.14');
      expect(toFixed('3.5', 0)).toBe('4');
    });

    it('应处理特殊值', () => {
      expect(toFixed(0, 2)).toBe('0.00');
      expect(toFixed(0.0, 2)).toBe('0.00');
    });
  });
});
