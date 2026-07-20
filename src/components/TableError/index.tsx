import { CloseCircleOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import type { FC } from 'react';

import styles from './style.module.css';

type TableErrorProps = {
  title?: string;
  description?: string;
  onRetry?: () => void;
};

const TableError: FC<TableErrorProps> = ({
  title = '加载失败',
  description = '网络异常或服务器错误，请稍后重试',
  onRetry,
}) => {
  return (
    <div className={styles.container}>
      <div className={styles.illustration}>
        <div className={styles.illustrationBg}>
          <CloseCircleOutlined className={styles.errorIcon} />
        </div>
      </div>
      <div className={styles.title}>{title}</div>
      <div className={styles.description}>{description}</div>
      {onRetry && (
        <Button type="primary" className={styles.retryButton} onClick={onRetry}>
          重新加载
        </Button>
      )}
    </div>
  );
};

export default TableError;
