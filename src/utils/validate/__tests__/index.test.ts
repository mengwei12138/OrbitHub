import { describe, expect, it } from 'vitest';

import { validateIdCard, validatePhone } from '../index';

describe('validate', () => {
  describe('validatePhone', () => {
    it('应正确校验有效手机号', () => {
      expect(validatePhone('13812345678')).toBe(true);
      expect(validatePhone('19912345678')).toBe(true);
      expect(validatePhone('16612345678')).toBe(true);
    });

    it('应拒绝无效手机号', () => {
      expect(validatePhone('12345678901')).toBe(false);
      expect(validatePhone('1381234567')).toBe(false);
      expect(validatePhone('138123456789')).toBe(false);
      expect(validatePhone('abc')).toBe(false);
    });
  });

  describe('validateIdCard', () => {
    describe('18位身份证', () => {
      it('应拒绝校验码错误的身份证号', () => {
        expect(validateIdCard('110101199001011235')).toBe(false);
        expect(validateIdCard('110101199001011236')).toBe(false);
      });

      it('应拒绝长度错误的身份证号', () => {
        expect(validateIdCard('11010119900101123')).toBe(false);
        expect(validateIdCard('1101011990010112345')).toBe(false);
      });

      it('应拒绝格式错误的身份证号', () => {
        expect(validateIdCard('11010119900101123a')).toBe(false);
        expect(validateIdCard('abcdefghijklmnop')).toBe(false);
      });

      it('应拒绝非法日期的身份证号', () => {
        expect(validateIdCard('110101199002301234')).toBe(false);
        expect(validateIdCard('110101199013011234')).toBe(false);
        expect(validateIdCard('110101199001322234')).toBe(false);
      });

      it('应拒绝无效地区码的身份证号', () => {
        expect(validateIdCard('000101199001011234')).toBe(false);
        expect(validateIdCard('990101199001011234')).toBe(false);
      });
    });

    describe('15位身份证', () => {
      it('应拒绝长度错误的身份证号', () => {
        expect(validateIdCard('11010190010112')).toBe(false);
        expect(validateIdCard('1101019001011234')).toBe(false);
      });

      it('应拒绝格式错误的身份证号', () => {
        expect(validateIdCard('11010190010112a')).toBe(false);
      });
    });

    it('应拒绝空字符串', () => {
      expect(validateIdCard('')).toBe(false);
    });
  });
});
