import { describe, expect, it } from 'vitest';

import {
  formatDateEnd,
  formatDateStart,
  formatDateTime,
  formatDateTimeMinute,
} from '../index';

describe('date', () => {
  describe('formatDateTime', () => {
    it('应返回 YYYY-MM-DD HH:mm:ss 格式', () => {
      const date = new Date('2024-06-15T10:30:45');
      expect(formatDateTime(date)).toBe('2024-06-15 10:30:45');
    });

    it('应处理时间戳', () => {
      const timestamp = new Date('2024-06-15T10:30:45').getTime();
      expect(formatDateTime(timestamp)).toBe('2024-06-15 10:30:45');
    });

    it('应处理字符串日期', () => {
      expect(formatDateTime('2024-06-15')).toBe('2024-06-15 00:00:00');
    });

    it('无参数时应返回当前时间', () => {
      const result = formatDateTime();
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/u);
    });
  });

  describe('formatDateStart', () => {
    it('应返回 YYYY-MM-DD 00:00:00 格式', () => {
      const date = new Date('2024-06-15T23:59:59');
      expect(formatDateStart(date)).toBe('2024-06-15 00:00:00');
    });

    it('应处理时间戳', () => {
      const timestamp = new Date('2024-06-15T23:59:59').getTime();
      expect(formatDateStart(timestamp)).toBe('2024-06-15 00:00:00');
    });
  });

  describe('formatDateEnd', () => {
    it('应返回 YYYY-MM-DD 23:59:59 格式', () => {
      const date = new Date('2024-06-15T00:00:00');
      expect(formatDateEnd(date)).toBe('2024-06-15 23:59:59');
    });

    it('应处理时间戳', () => {
      const timestamp = new Date('2024-06-15T00:00:00').getTime();
      expect(formatDateEnd(timestamp)).toBe('2024-06-15 23:59:59');
    });
  });

  describe('formatDateTimeMinute', () => {
    it('应返回 YYYY-MM-DD HH:mm 格式（无秒）', () => {
      const date = new Date('2026-04-30T12:57:41.847Z');
      expect(formatDateTimeMinute(date)).toBe('2026-04-30 20:57');
    });

    it('应处理 ISO 字符串日期', () => {
      expect(formatDateTimeMinute('2026-04-30T12:57:41.847Z')).toBe(
        '2026-04-30 20:57',
      );
    });

    it('应处理时间戳', () => {
      const timestamp = new Date('2026-04-30T12:57:41.847Z').getTime();
      expect(formatDateTimeMinute(timestamp)).toBe('2026-04-30 20:57');
    });

    it('无参数时应返回当前时间', () => {
      const result = formatDateTimeMinute();
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/u);
    });
  });
});
