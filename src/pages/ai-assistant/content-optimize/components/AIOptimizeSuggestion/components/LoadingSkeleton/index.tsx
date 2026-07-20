import { LoadingOutlined } from '@ant-design/icons';

import styles from './style.module.css';

const LoadingSkeleton = () => {
  return (
    <div className={styles.loadingSkeleton}>
      <div className={styles.header}>
        <LoadingOutlined className={styles.spinner} />
        <span className={styles.text}>AI 正在为您生成优化建议…</span>
      </div>
      <div className={styles.skeleton}>
        <div className={styles.skeletonRow} style={{ width: '12%' }} />
        <div className={styles.skeletonRow} style={{ width: '95%' }} />
        <div className={styles.skeletonRow} style={{ width: '85%' }} />
        <div className={styles.skeletonRow} style={{ width: '60%' }} />
      </div>
    </div>
  );
};

export default LoadingSkeleton;
