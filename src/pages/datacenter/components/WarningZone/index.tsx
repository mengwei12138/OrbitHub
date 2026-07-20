import { PlatformIcon } from '@/components';
import { WARNING_LEVEL_MAP } from '@/styles/datacenter/vars';
import styles from './style.module.css';
import type { WarningZoneProps } from './types';

const getLevelClass = (level: string): string => {
  return WARNING_LEVEL_MAP[level] ?? 'gray';
};

const WarningZone: React.FC<WarningZoneProps> = ({
  alerts,
  stats,
  onViewDetail,
  onIgnore,
  onHandle,
  onViewAll,
}) => {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.dot} />
        <div className={styles.title}>数据预警</div>
        <div className={styles.sep}>·</div>
        <div className={styles.statLabel}>总预警</div>
        <div className={styles.statValue}>{stats.total}</div>
        <div className={styles.sep}>·</div>
        <div className={styles.statLabel}>未读</div>
        <div className={`${styles.statValue} ${styles.statUnreadValue}`}>
          {stats.unread}
        </div>
        <div className={styles.sep}>·</div>
        <div className={styles.statLabel}>异常账号</div>
        <div className={styles.statValue}>{stats.abnormal}</div>
        <div className={styles.spacer} />
        <button className={styles.viewAll} onClick={onViewAll}>
          <span className={styles.viewAllText}>查看全部</span>
          <svg className={styles.viewAllArrow} viewBox="0 0 4 6" fill="none">
            <path
              d="M0.5 0.5L3.5 3L0.5 5.5"
              stroke="currentColor"
              strokeWidth="1"
            />
          </svg>
        </button>
      </div>

      <div className={styles.divider} />

      <div className={styles.alertList}>
        {alerts.map((alert) => (
          <div key={alert.id} className={styles.alertCard}>
            <div
              className={`${styles.levelBar} ${styles[getLevelClass(alert.level)]}`}
            />
            <div
              className={`${styles.levelDot} ${styles[getLevelClass(alert.level)]}`}
            />
            <div className={styles.platformIcon}>
              <PlatformIcon platform={alert.platform} size={22} />
            </div>
            <div className={styles.platformLabel}>
              {alert.platform === 'douyin' ? '抖音' : '小红书'}
            </div>
            <div className={styles.account}>{alert.account}</div>
            <div
              className={`${styles.reason} ${styles[getLevelClass(alert.level)]}`}
            >
              {alert.reason}
            </div>
            <div className={styles.time}>{alert.time}</div>
            <button
              className={`${styles.btn} ${styles.btnLink}`}
              onClick={() => onViewDetail?.(alert)}
            >
              查看详情
            </button>
            {alert.level === 'HIGH' &&
              (alert.status === 'unread' || alert.status === 'read') && (
                <button
                  className={`${styles.btn} ${styles.btnPrimary}`}
                  onClick={() => onHandle?.(alert)}
                >
                  去处理
                </button>
              )}
            {(alert.level === 'MEDIUM' || alert.level === 'NORMAL') &&
              (alert.status === 'unread' || alert.status === 'read') && (
                <button
                  className={`${styles.btn} ${styles.btnDefault}`}
                  onClick={() => onIgnore?.(alert.id)}
                >
                  忽略
                </button>
              )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default WarningZone;
