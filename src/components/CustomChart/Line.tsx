/**
 * CustomLine - 折线图组件
 *
 * 基于 @ant-design/charts 的 Line 封装
 *
 * @description 折线图组件，适用于展示数据趋势
 * @example
 * <Line data={data} xField="time" yField="value" />
 */

import type { LineConfig } from '@ant-design/charts';

import { Line } from '@ant-design/charts';
import type React from 'react';

export type CustomLineProps = LineConfig;

const CustomLine: React.FC<CustomLineProps> = (props) => {
  return <Line {...props} />;
};

export default CustomLine;
