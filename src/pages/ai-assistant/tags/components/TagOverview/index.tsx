import type { FC } from 'react';
import { PLACEHOLDER } from '@/constants';
import IconContent from '../../images/icon-content.svg?url';
import IconDisabled from '../../images/icon-disabled.svg?url';
import IconEmotion from '../../images/icon-emotion.svg?url';
import IconHot from '../../images/icon-hot.svg?url';
import styles from './style.module.css';
import type { TagOverviewProps } from './types';

const TagOverview: FC<TagOverviewProps> = ({ stats, loading }) => {
  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <span className={styles.title}>标签概览</span>
      </div>
      <div className={styles.statsRow}>
        <div className={`${styles.statCard} ${styles.statHot}`}>
          <div className={styles.cardContent}>
            <div className={styles.cardLeft}>
              <img src={IconHot} className={styles.icon} alt="" />
              <span className={styles.statLabel}>热门推荐</span>
            </div>
            <div className={styles.cardRight}>
              <span className={styles.statValue}>
                {loading ? PLACEHOLDER : stats.hot}
              </span>
              <span className={styles.statUnit}>个</span>
            </div>
          </div>
        </div>
        <div className={`${styles.statCard} ${styles.statContent}`}>
          <div className={styles.cardContent}>
            <div className={styles.cardLeft}>
              <img src={IconContent} className={styles.icon} alt="" />
              <span className={styles.statLabel}>内容分类</span>
            </div>
            <div className={styles.cardRight}>
              <span className={styles.statValue}>
                {loading ? PLACEHOLDER : stats.content}
              </span>
              <span className={styles.statUnit}>个</span>
            </div>
          </div>
        </div>
        <div className={`${styles.statCard} ${styles.statEmotion}`}>
          <div className={styles.cardContent}>
            <div className={styles.cardLeft}>
              <img src={IconEmotion} className={styles.icon} alt="" />
              <span className={styles.statLabel}>情感标签</span>
            </div>
            <div className={styles.cardRight}>
              <span className={styles.statValue}>
                {loading ? PLACEHOLDER : stats.emotion}
              </span>
              <span className={styles.statUnit}>个</span>
            </div>
          </div>
        </div>
        <div className={`${styles.statCard} ${styles.statDisabled}`}>
          <div className={styles.cardContent}>
            <div className={styles.cardLeft}>
              <img src={IconDisabled} className={styles.icon} alt="" />
              <span className={styles.statLabel}>已停用</span>
            </div>
            <div className={styles.cardRight}>
              <span className={styles.statValue}>
                {loading ? PLACEHOLDER : stats.disabled}
              </span>
              <span className={styles.statUnit}>个</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TagOverview;
