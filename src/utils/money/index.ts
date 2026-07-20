/**
 * 格式化数字为千分位格式
 * @param value 数字或字符串数字
 * @param decimals 小数位数，默认2位
 * @returns 千分位格式字符串
 * @example formatThousands(1234567.89) // "1,234,567.89"
 * @example formatThousands(1234567, 0) // "1,234,567"
 */
export function formatThousands(value: number | string, decimals = 2): string {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (Number.isNaN(num)) return '0.00';
  return new Intl.NumberFormat('zh-CN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(num);
}
