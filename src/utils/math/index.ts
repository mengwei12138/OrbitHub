import Decimal from 'decimal.js';

/**
 * 精确加法运算
 * @param values 可变数量的数字，支持多个数字同时计算
 * @returns 精确的加法结果
 * @example add(0.1, 0.2) // 0.3
 * @example add(1, 2, 3, 4) // 10
 */
export function add(...values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce(
    (acc, val) => new Decimal(acc).plus(new Decimal(val)).toNumber(),
    0,
  );
}

/**
 * 精确减法运算
 * @param values 可变数量的数字，支持多个数字同时计算
 * @returns 精确的减法结果
 * @example sub(0.3, 0.1) // 0.2
 * @example sub(10, 1, 2) // 7
 */
export function sub(...values: number[]): number {
  if (values.length === 0) return 0;
  if (values.length === 1) return values[0];
  return values
    .slice(1)
    .reduce(
      (acc, val) => new Decimal(acc).minus(new Decimal(val)).toNumber(),
      values[0],
    );
}

/**
 * 精确乘法运算
 * @param values 可变数量的数字，支持多个数字同时计算
 * @returns 精确的乘法结果
 * @example mul(0.1, 0.2) // 0.02
 * @example mul(2, 3, 4) // 24
 */
export function mul(...values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce(
    (acc, val) => new Decimal(acc).times(new Decimal(val)).toNumber(),
    1,
  );
}

/**
 * 精确除法运算
 * @param values 可变数量的数字，支持多个数字同时计算
 * @returns 精确的除法结果
 * @throws 除数为零时抛出 Error
 * @example div(0.3, 0.1) // 3
 * @example div(24, 2, 3) // 4
 */
export function div(...values: number[]): number {
  if (values.length === 0) throw new Error('At least one value required');
  if (values.length === 1) return values[0];
  const divisor = values[1];
  if (divisor === 0) throw new Error('Division by zero');
  return values
    .slice(1)
    .reduce(
      (acc, val) => new Decimal(acc).dividedBy(new Decimal(val)).toNumber(),
      values[0],
    );
}
