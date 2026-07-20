import { Button, Skeleton } from 'antd';
import type { FC } from 'react';

import ArrowRightIcon from '../../images/arrow-right.svg';
import AutoReplyIcon from '../../images/icon-auto-reply-box.svg';
import BlockFilterIcon from '../../images/icon-block-filter-box.svg';
import PendingHumanIcon from '../../images/icon-pending-human-box.svg';
import styles from './style.module.css';

type StatsData = {
  autoReply: number;
  blockFilter: number;
  pendingHuman: number;
};

type Props = {
  stats: StatsData;
  updatedAt?: string;
  loading?: boolean;
  onPendingHumanClick?: () => void;
};

const StatsOverview: FC<Props> = ({
  stats,
  updatedAt = '2 分钟前',
  loading,
  onPendingHumanClick,
}) => {
  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <span className={styles.title}>今日动态概览</span>
        <span className={styles.updatedAt}>更新于 {updatedAt}</span>
      </div>
      {loading ? (
        <div className={styles.statsRow}>
          <Skeleton.Button active block className={styles.statSkeleton} />
          <Skeleton.Button active block className={styles.statSkeleton} />
          <Skeleton.Button active block className={styles.statSkeleton} />
        </div>
      ) : (
        <div className={styles.statsRow}>
          <div className={`${styles.statCard} ${styles.statGreen}`}>
            <div className={styles.statContent}>
              <div className={styles.statLeft}>
                <div className={styles.iconBox}>
                  <img
                    src={AutoReplyIcon}
                    alt="自动回复"
                    className={styles.icon}
                  />
                </div>
                <span className={styles.statLabel}>自动回复</span>
              </div>
              <div className={styles.statRight}>
                <span className={styles.statValue}>{stats.autoReply}</span>
                <span className={styles.statUnit}>条</span>
              </div>
            </div>
          </div>
          <div className={`${styles.statCard} ${styles.statBlue}`}>
            <div className={styles.statContent}>
              <div className={styles.statLeft}>
                <div className={styles.iconBox}>
                  <img
                    src={BlockFilterIcon}
                    alt="屏蔽过滤"
                    className={styles.icon}
                  />
                </div>
                <span className={styles.statLabel}>屏蔽过滤</span>
              </div>
              <div className={styles.statRight}>
                <span className={styles.statValue}>{stats.blockFilter}</span>
                <span className={styles.statUnit}>条</span>
              </div>
            </div>
          </div>
          <div className={`${styles.statCard} ${styles.statAmber}`}>
            <div className={styles.statContent}>
              <div className={styles.statLeft}>
                <div className={styles.iconBox}>
                  <img
                    src={PendingHumanIcon}
                    alt="待人工处理"
                    className={styles.icon}
                  />
                </div>
                <span className={styles.statLabel}>待人工处理</span>
              </div>
              <div className={styles.statRight}>
                <div className={styles.valueGroup}>
                  <button
                    type="button"
                    className={styles.statValueButton}
                    onClick={onPendingHumanClick}
                  >
                    <span className={styles.statValue}>
                      {stats.pendingHuman}
                    </span>
                    <span className={styles.statUnit}>条</span>
                  </button>
                </div>
                <div className={styles.divider} />
                <Button
                  type="text"
                  className={styles.linkBtn}
                  onClick={onPendingHumanClick}
                >
                  去处理
                  <img
                    src={ArrowRightIcon}
                    alt=""
                    className={styles.arrowIcon}
                  />
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StatsOverview;
