import { formatCompactCount } from '@/pages/datacenter/utils/format-compact-count';
import iconComment from '../../images/icon-comment.svg';
import iconLike from '../../images/icon-like.svg';
import iconMetrics from '../../images/icon-metrics.svg';
import iconPlay from '../../images/icon-play.svg';
import iconShare from '../../images/icon-share.svg';
import styles from './style.module.css';
import type { TodayMetricsData } from './types';

type TodayMetricsProps = TodayMetricsData;

interface KpiCard {
  key: keyof TodayMetricsData;
  label: string;
  icon: string;
  iconBg: string;
}

const kpiConfig: KpiCard[] = [
  { key: 'playCount', label: '播放量', icon: iconPlay, iconBg: '#E6F4FF' },
  { key: 'likeCount', label: '点赞量', icon: iconLike, iconBg: '#FFF1F0' },
  {
    key: 'commentCount',
    label: '评论量',
    icon: iconComment,
    iconBg: '#F6FFED',
  },
  { key: 'shareCount', label: '转发量', icon: iconShare, iconBg: '#F9F0FF' },
];

const TodayMetrics: React.FC<TodayMetricsProps> = ({
  playCount,
  likeCount,
  commentCount,
  shareCount,
}) => {
  const formatValue = (value: number): string => {
    if (value === 0) return '-';
    return formatCompactCount(value);
  };

  const values: TodayMetricsData = {
    playCount,
    likeCount,
    commentCount,
    shareCount,
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <img src={iconMetrics} alt="" className={styles.headerIcon} />
        <span className={styles.title}>今日核心指标</span>
        <span className={styles.subtitle}>该账号今日数据汇总</span>
      </div>

      <div className={styles.grid}>
        {kpiConfig.map((item) => (
          <div key={item.key} className={styles.card}>
            <div
              className={styles.iconBox}
              style={{ backgroundColor: item.iconBg }}
            >
              <img src={item.icon} alt={item.label} />
            </div>
            <div className={styles.content}>
              <div className={styles.label}>{item.label}</div>
              <div className={styles.value}>
                {formatValue(values[item.key])}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TodayMetrics;
