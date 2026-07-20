import { describe, expect, it } from 'vitest';

import { add, div, mul, sub } from '../index';

describe('math', () => {
  describe('add', () => {
    it('浮点数加法应精确', () => {
      expect(add(0.1, 0.2)).toBe(0.3);
    });

    it('多个数字相加应正确', () => {
      expect(add(1, 2, 3, 4)).toBe(10);
    });

    it('空参数应返回 0', () => {
      expect(add()).toBe(0);
    });
  });

  describe('sub', () => {
    it('浮点数减法应精确', () => {
      expect(sub(0.3, 0.1)).toBe(0.2);
    });

    it('多个数字相减应正确', () => {
      expect(sub(10, 1, 2)).toBe(7);
    });

    it('单个数字应返回原值', () => {
      expect(sub(5)).toBe(5);
    });
  });

  describe('mul', () => {
    it('浮点数乘法应精确', () => {
      expect(mul(0.1, 0.2)).toBe(0.02);
    });

    it('多个数字相乘应正确', () => {
      expect(mul(2, 3, 4)).toBe(24);
    });

    it('空参数应返回 0', () => {
      expect(mul()).toBe(0);
    });
  });

  describe('div', () => {
    it('浮点数除法应精确', () => {
      expect(div(0.3, 0.1)).toBe(3);
    });

    it('多个数字相除应正确', () => {
      expect(div(24, 2, 3)).toBe(4);
    });

    it('单个数字应返回原值', () => {
      expect(div(5)).toBe(5);
    });

    it('除数为零时应抛出错误', () => {
      expect(() => div(1, 0)).toThrow('Division by zero');
    });
  });
});
