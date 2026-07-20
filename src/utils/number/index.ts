import Decimal from 'decimal.js';

interface ToFixedOptions {
  round?: boolean;
  padZero?: boolean;
}

/**
 * 精度转化
 * @param value 数字或字符串数字
 * @param decimals 精度位数
 * @param options 配置项：round 是否四舍五入（默认 true），padZero 是否补0（默认 true）
 * @returns 转化后的字符串
 * @example toFixed(3.14159, 2) // "3.14"
 * @example toFixed(3.5, 0) // "4"
 * @example toFixed(3.999, 2, { round: false }) // "3.99"
 * @example toFixed(3.10, 2, { padZero: false }) // "3.1"
 */
export function toFixed(
  value: number | string,
  decimals: number,
  options?: ToFixedOptions,
): string {
  const { round = true, padZero = true } = options ?? {};

  const num = new Decimal(value);
  if (num.isNaN()) return 'NaN';

  const result = round
    ? num.toDecimalPlaces(decimals, Decimal.ROUND_HALF_UP)
    : num.toDecimalPlaces(decimals, Decimal.ROUND_DOWN);

  const formatted = result.toFixed(decimals);
  return padZero ? formatted : result.toString();
}

/**
 * 格式化时长为 MM:SS 格式
 * @param seconds 秒数
 * @returns MM:SS 格式字符串
 * @example formatDuration(65) // "01:05"
 * @example formatDuration(3600) // "60:00"
 */
export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}
