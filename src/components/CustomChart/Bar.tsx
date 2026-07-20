/**
 * CustomBar - 柱状图组件
 *
 * 基于 @ant-design/charts 的 Bar 封装
 *
 * @description 柱状图组件，适用于展示分类数据对比
 * @example
 * <Bar data={data} xField="name" yField="value" />
 */

import type { BarConfig } from '@ant-design/charts';

import { Bar } from '@ant-design/charts';
import type React from 'react';

export type CustomBarProps = BarConfig;

const CustomBar: React.FC<CustomBarProps> = (props) => {
  return <Bar {...props} />;
};

export default CustomBar;
