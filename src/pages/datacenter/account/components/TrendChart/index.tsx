import { Line } from '@/components';
import { formatCompactCount } from '@/pages/datacenter/utils/format-compact-count';
import iconTrend from '../../images/icon-trend.svg';
import styles from './style.module.css';
import type { TrendChartDataItem } from './types';

type TrendChartProps = {
  data: TrendChartDataItem[];
  loading?: boolean;
};

const DISCONNECT_NULLS = { connect: false } as unknown as undefined;

const TrendChart: React.FC<TrendChartProps> = ({ data, loading }) => {
  const chartData = data.map((item) => ({
    date: item.date,
    value: item.playCount,
  }));

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <img src={iconTrend} alt="" className={styles.headerIcon} />
        <span className={styles.title}>近 7 天播放趋势</span>
      </div>

      <div className={styles.chartArea}>
        {loading ? (
          <div className={styles.loading}>加载中...</div>
        ) : (
          <Line
            data={chartData}
            xField="date"
            yField="value"
            smooth
            point={{
              size: 8,
              style: { fill: '#fff', stroke: '#1677FF', lineWidth: 2 },
            }}
            line={{ style: { stroke: '#1677FF', lineWidth: 2 } }}
            connectNulls={DISCONNECT_NULLS}
            area={{
              style: {
                fill: 'l(270) 0:#1677FF00 1:#1677FF33',
              },
            }}
            xAxis={{
              label: {
                style: { fontSize: 12, fill: '#8C8C8C' },
              },
              tickLine: null,
            }}
            yAxis={{
              label: {
                style: { fontSize: 12, fill: '#8C8C8C' },
                formatter: (v: string) => {
                  const num = parseInt(v, 10);
                  if (num >= 1000) return `${num / 1000}K`;
                  return v;
                },
              },
              grid: {
                line: { style: { stroke: '#F0F0F0', lineWidth: 1 } },
              },
            }}
            tooltip={{
              show: true,
              showTitle: false,
              items: [
                {
                  field: 'value',
                  name: '播放次数',
                  valueFormatter: (value: number | null) => {
                    if (value === null) return '数据缺失';
                    return `${formatCompactCount(value)}次播放`;
                  },
                },
              ],
            }}
          />
        )}
      </div>
    </div>
  );
};

export default TrendChart;
