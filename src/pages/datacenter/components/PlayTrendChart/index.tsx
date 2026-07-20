import { Select } from 'antd';
import { useMemo } from 'react';
import { Line } from '@/components';
import TrendIcon from '../../images/trend.svg';
import { formatCompactCount } from '../../utils/format-compact-count';
import styles from './style.module.css';
import type { Granularity, PlayTrendChartProps } from './types';

const GRANULARITY_OPTIONS: { value: Granularity; label: string }[] = [
  { value: 'hour', label: '按小时' },
  { value: 'day', label: '按日' },
  { value: 'week', label: '按周' },
  { value: 'month', label: '按月' },
];

const DISCONNECT_NULLS = { connect: false } as unknown as undefined;

export interface AccountOption {
  value: string;
  label: string;
}

interface PlayTrendChartViewProps extends PlayTrendChartProps {
  accountOptions?: AccountOption[];
}

const PlayTrendChart: React.FC<PlayTrendChartViewProps> = ({
  data,
  account,
  granularity = 'day',
  timeRange = 'today',
  loading = false,
  accountOptions = [],
  onAccountChange,
  onGranularityChange,
}) => {
  const availableGranularities = useMemo(() => {
    switch (timeRange) {
      case 'today':
        return GRANULARITY_OPTIONS.filter((opt) =>
          ['hour', 'day'].includes(opt.value),
        );
      case 'last7days':
        return GRANULARITY_OPTIONS.filter((opt) => opt.value === 'day');
      case 'last30days':
        return GRANULARITY_OPTIONS.filter((opt) =>
          ['day', 'week'].includes(opt.value),
        );
      case 'thisYear':
        return GRANULARITY_OPTIONS.filter((opt) => opt.value === 'month');
      default:
        return GRANULARITY_OPTIONS;
    }
  }, [timeRange]);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <img src={TrendIcon} alt="趋势" className={styles.icon} />
        <span className={styles.title}>播放趋势</span>
        <span className={styles.accountLabel}>账号</span>
        <Select
          className={styles.accountSelect}
          placeholder="选择账号"
          value={account}
          options={accountOptions}
          onChange={onAccountChange}
        />
        <div className={styles.granularityTabs}>
          {availableGranularities.map((option) => (
            <button
              key={option.value}
              type="button"
              className={`${styles.granularityTab} ${
                granularity === option.value ? styles.granularityTabActive : ''
              }`}
              onClick={() => onGranularityChange?.(option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.chartArea}>
        {loading && (
          <div className={styles.loadingOverlay}>
            <div className={styles.loadingSkeleton} />
          </div>
        )}
        <div className={styles.chartWrapper}>
          <Line
            data={data}
            xField="date"
            yField="value"
            smooth
            areaStyle={{
              fill: 'l(270) 0:#1677ff00 1:#1677ff33',
            }}
            lineStyle={{
              stroke: '#1677ff',
              lineWidth: 2,
            }}
            connectNulls={DISCONNECT_NULLS}
            point={{
              size: 4,
              shape: 'circle',
              style: {
                stroke: '#fff',
                lineWidth: 2,
                fill: '#fff',
              },
            }}
            axis={{
              y: {
                title: false,
                grid: {
                  line: {
                    style: {
                      stroke: '#f0f0f0',
                      lineWidth: 1,
                    },
                  },
                },
                labelFormatter: (text: string) => {
                  const num = parseInt(text, 10);
                  if (num >= 1000) {
                    return `${num / 1000}K`;
                  }
                  return text;
                },
              },
              x: {
                title: false,
                tick: false,
                labelFormatter: (text: string) => text,
              },
            }}
            tooltip={{
              show: true,
              showTitle: false,
              items: [
                {
                  field: 'value',
                  name: '播放量',
                  valueFormatter: (value: number | null) =>
                    value === null
                      ? '数据缺失'
                      : `${formatCompactCount(value)}次播放`,
                },
              ],
              domStyles: {
                'g2-tooltip': {
                  background: '#fff',
                  border: '1px solid #f0f0f0',
                  borderRadius: '4px',
                  boxShadow: '0 2px 8px 0 rgba(0, 0, 0, 0.06)',
                  padding: '8px 12px',
                },
              },
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default PlayTrendChart;
