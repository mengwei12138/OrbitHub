/**
 * FilterBar 组件类型定义
 * 数据中心页面筛选栏组件
 */

export type TimeRange = 'today' | 'last7days' | 'last30days' | 'thisYear';
export type Platform = 'all' | 'douyin' | 'xiaohongshu';

export interface FilterBarProps {
  timeRange: TimeRange;
  platform: Platform;
  onTimeRangeChange: (value: TimeRange) => void;
  onPlatformChange: (value: Platform) => void;
}

export const TIME_OPTIONS: { value: TimeRange; label: string }[] = [
  { value: 'today', label: '今日' },
  { value: 'last7days', label: '近7天' },
  { value: 'last30days', label: '近30天' },
  { value: 'thisYear', label: '今年' },
];

export const PLATFORM_OPTIONS: { value: Platform; label: string }[] = [
  { value: 'all', label: '全部平台' },
  { value: 'douyin', label: '抖音' },
  { value: 'xiaohongshu', label: '小红书' },
];
