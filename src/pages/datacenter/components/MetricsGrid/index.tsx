import type { TimeRange } from '../FilterBar/types';
import styles from './style.module.css';
import type { MetricsGridProps } from './types';

/** 与 requirements.feature 中「对比对象」文案一致 */
function comparisonLabelForTimeRange(timeRange: TimeRange): string {
  switch (timeRange) {
    case 'today':
      return '较昨日';
    case 'last7days':
      return '与前7天对比';
    case 'last30days':
      return '与前30天对比';
    case 'thisYear':
      return '与去年同期';
    default:
      return '较昨日';
  }
}

const ArrowUp = () => (
  <svg
    width="10"
    height="8"
    viewBox="0 0 10 8"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M5 0.5L9.5 7.5H0.5L5 0.5Z"
      fill="#52C41A"
      stroke="#52C41A"
      strokeWidth="1"
    />
  </svg>
);

const ArrowDown = () => (
  <svg
    width="10"
    height="8"
    viewBox="0 0 10 8"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M5 7.5L0.5 0.5H9.5L5 7.5Z"
      fill="#FF4D4F"
      stroke="#FF4D4F"
      strokeWidth="1"
    />
  </svg>
);

const MetricsGrid: React.FC<MetricsGridProps> = ({
  metrics,
  timeRange = 'today',
}) => {
  const comparisonLabel = comparisonLabelForTimeRange(timeRange);

  return (
    <div className={styles.container}>
      {metrics.map((metric) => (
        <div key={metric.key} className={styles.card}>
          <div className={styles.cardHeader}>
            <div
              className={styles.iconBox}
              style={{ backgroundColor: metric.iconBgColor }}
            >
              <img
                src={metric.icon}
                alt={metric.title}
                className={styles.icon}
              />
            </div>
            <div className={styles.title}>{metric.title}</div>
          </div>
          <div className={styles.value}>{metric.value}</div>
          {metric.delta !== undefined && metric.deltaType && (
            <div className={styles.footer}>
              <span className={`${styles.arrow} ${styles[metric.deltaType]}`}>
                {metric.deltaType === 'up' ? <ArrowUp /> : <ArrowDown />}
              </span>
              <span className={`${styles.delta} ${styles[metric.deltaType]}`}>
                {metric.delta}
              </span>
              <span className={styles.cmp}>{comparisonLabel}</span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default MetricsGrid;
