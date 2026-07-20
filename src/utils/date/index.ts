import dayjs, { type Dayjs } from 'dayjs';

/**
 * 格式化日期时间为 YYYY-MM-DD HH:mm:ss 格式
 * @param date 日期对象、数字（时间戳）或字符串
 * @returns 格式化后的时间字符串
 * @example formatDateTime(new Date()) // "2024-01-01 12:30:45"
 * @example formatDateTime('2024-01-01') // "2024-01-01 00:00:00"
 */
export function formatDateTime(date?: Date | number | string | Dayjs): string {
  return dayjs(date).format('YYYY-MM-DD HH:mm:ss');
}

/**
 * 格式化日期为 YYYY-MM-DD 00:00:00 格式（一天的开始）
 * @param date 日期对象、数字（时间戳）或字符串
 * @returns 格式化后的时间字符串
 * @example formatDateStart(new Date()) // "2024-01-01 00:00:00"
 */
export function formatDateStart(date?: Date | number | string | Dayjs): string {
  return dayjs(date).startOf('day').format('YYYY-MM-DD HH:mm:ss');
}

/**
 * 格式化日期为 YYYY-MM-DD 23:59:59 格式（一天的结束）
 * @param date 日期对象、数字（时间戳）或字符串
 * @returns 格式化后的时间字符串
 * @example formatDateEnd(new Date()) // "2024-01-01 23:59:59"
 */
export function formatDateEnd(date?: Date | number | string | Dayjs): string {
  return dayjs(date).endOf('day').format('YYYY-MM-DD HH:mm:ss');
}

/**
 * 格式化日期为 YYYY-MM-DD 格式
 * @param date 日期对象、数字（时间戳）或字符串
 * @returns 格式化后的日期字符串
 * @example formatDate(new Date()) // "2024-01-01"
 */
export function formatDate(date?: Date | number | string | Dayjs): string {
  return dayjs(date).format('YYYY-MM-DD');
}

/**
 * 格式化日期时间为 YYYY-MM-DD HH:mm 格式（无秒）
 * @param date 日期对象、数字（时间戳）或字符串
 * @returns 格式化后的时间字符串
 * @example formatDateTimeMinute(new Date('2026-04-30T12:57:41.847Z')) // "2026-04-30 20:57"
 * @example formatDateTimeMinute('2026-04-30T12:57:41.847Z') // "2026-04-30 20:57"
 */
export function formatDateTimeMinute(
  date?: Date | number | string | Dayjs,
): string {
  if (!date) return dayjs().format('YYYY-MM-DD HH:mm');
  return dayjs(date).format('YYYY-MM-DD HH:mm');
}

/**
 * 格式化日期为 MM-DD HH:mm 格式（预警时间显示格式）
 * @param date 日期对象、数字（时间戳）或字符串
 * @returns 格式化后的时间字符串
 * @example formatShortDateTime(new Date('2026-04-15T09:30:00.000Z')) // "04-15 09:30"
 * @example formatShortDateTime('2026-04-15T09:30:00.000Z') // "04-15 09:30"
 */
export function formatShortDateTime(
  date?: Date | number | string | Dayjs,
): string {
  return dayjs(date).format('MM-DD HH:mm');
}

/**
 * 格式化时间为 HH:mm:ss 格式（上次刷新时间显示格式）
 * @param date 日期对象、数字（时间戳）或字符串
 * @returns 格式化后的时间字符串
 * @example formatTime(new Date('2026-04-15T09:30:45.000Z')) // "09:30:45"
 * @example formatTime('2026-04-15T09:30:45.000Z') // "09:30:45"
 */
export function formatTime(date?: Date | number | string | Dayjs): string {
  return dayjs(date).format('HH:mm:ss');
}
