/**
 * MetricsGrid 组件类型定义
 * 数据中心页面 KPI 指标网格组件
 */

import type { TimeRange } from '../FilterBar/types';

export type DeltaType = 'up' | 'down';

export interface Metric {
  key: string;
  title: string;
  value: number | string;
  delta?: number | string;
  deltaType?: DeltaType;
  icon: string;
  iconBgColor: string;
}

export interface MetricsGridProps {
  metrics: Metric[];
  /** 全局时间筛选，决定环比对比文案 */
  timeRange?: TimeRange;
}
