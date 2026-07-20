import { Button } from 'antd';
import type { FC } from 'react';
import styles from './style.module.css';

type EmptyStateCardProps = {
  onGoHome: () => void;
};

const EmptyStateCard: FC<EmptyStateCardProps> = ({ onGoHome }) => {
  return (
    <div className={styles.card}>
      <div className={styles.emptyState}>
        <div className={styles.illustrationBg} />
        <div className={styles.emptyTitle}>还没有作品</div>
        <div className={styles.emptyDescription}>去首页发起一次生成吧</div>
        <Button type="primary" className={styles.goButton} onClick={onGoHome}>
          去首页生成 →
        </Button>
      </div>
    </div>
  );
};

export default EmptyStateCard;
