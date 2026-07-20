/**
 * PlayTrendChart 组件类型定义
 * 数据中心页面播放趋势图组件
 */

import type { TimeRange } from '@/pages/datacenter/components/FilterBar/types';

export type Granularity = 'hour' | 'day' | 'week' | 'month';

export interface TrendDataPoint {
  date: string;
  value: number | null;
}

export interface PlayTrendChartProps {
  data: TrendDataPoint[];
  account?: string;
  granularity?: Granularity;
  timeRange?: TimeRange;
  loading?: boolean;
  onAccountChange?: (accountId: string) => void;
  onGranularityChange?: (granularity: Granularity) => void;
}
