import headerIcon from '../../images/header-icon.svg';
import abnormalIcon from '../../images/stat-abnormal-icon.svg';
import totalIcon from '../../images/stat-total-icon.svg';
import unreadIcon from '../../images/stat-unread-icon.svg';
import styles from './style.module.css';
import type { WarningStatsProps } from './types';

const WarningStats: React.FC<WarningStatsProps> = ({
  totalCount,
  unreadCount,
  abnormalAccountCount,
  loading,
  onMarkAllRead,
  onClearIgnored,
}) => {
  return (
    <div className={styles.card} data-loading={loading}>
      <div className={styles.header}>
        <img src={headerIcon} alt="" className={styles.headerIcon} />
        <span className={styles.headerTitle}>预警统计</span>
      </div>

      <div className={styles.stats}>
        <div className={styles.statCard}>
          <div className={`${styles.iconBox} ${styles.iconBoxTotal}`}>
            <img src={totalIcon} alt="" />
          </div>
          <div className={styles.statContent}>
            <span className={styles.statLabel}>总预警</span>
            <span className={styles.statValue}>{totalCount}</span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={`${styles.iconBox} ${styles.iconBoxUnread}`}>
            <img src={unreadIcon} alt="" />
          </div>
          <div className={styles.statContent}>
            <span className={styles.statLabel}>未读预警</span>
            <span className={`${styles.statValue} ${styles.statValueUnread}`}>
              {unreadCount}
            </span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={`${styles.iconBox} ${styles.iconBoxAbnormal}`}>
            <img src={abnormalIcon} alt="" />
          </div>
          <div className={styles.statContent}>
            <span className={styles.statLabel}>异常账号</span>
            <span className={`${styles.statValue} ${styles.statValueAbnormal}`}>
              {abnormalAccountCount}
            </span>
          </div>
        </div>
      </div>

      <div className={styles.divider} />

      <div className={styles.batchActions}>
        <span className={styles.batchLabel}>批量操作：</span>
        <button
          className={styles.btnMarkRead}
          onClick={onMarkAllRead}
          type="button"
        >
          全部标记已读
        </button>
        <button
          className={styles.btnClearIgnored}
          onClick={onClearIgnored}
          type="button"
        >
          清空已忽略项
        </button>
      </div>
    </div>
  );
};

export default WarningStats;
