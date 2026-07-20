/**
 * CustomPie - 饼图组件
 *
 * 基于 @ant-design/charts 的 Pie 封装
 *
 * @description 饼图组件，适用于展示占比数据
 * @example
 * <Pie data={data} angleField="value" colorField="type" />
 */

import type { PieConfig } from '@ant-design/charts';

import { Pie } from '@ant-design/charts';
import type React from 'react';

export type CustomPieProps = PieConfig;

const CustomPie: React.FC<CustomPieProps> = (props) => {
  return <Pie {...props} />;
};

export default CustomPie;
