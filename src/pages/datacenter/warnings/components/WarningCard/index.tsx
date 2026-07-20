import { Button } from 'antd';
import { PlatformIcon } from '@/components';
import { WARNING_LEVEL_MAP } from '@/styles/datacenter/vars';
import { formatShortDateTime } from '@/utils/date';
import styles from './style.module.css';
import type { WarningCardProps } from './types';

const getLevelClass = (level: string): string => {
  return WARNING_LEVEL_MAP[level] ?? 'gray';
};

const PLATFORM_LABEL = {
  douyin: '抖音',
  xiaohongshu: '小红书',
};

const WarningCard: React.FC<WarningCardProps> = ({
  warning,
  onViewDetail,
  onIgnore,
  onHandle,
}) => {
  const levelClass = getLevelClass(warning.level);
  const showHandleButton =
    warning.level === 'red' &&
    (warning.status === 'unread' || warning.status === 'read');
  const canIgnore =
    (warning.level === 'orange' || warning.level === 'green') &&
    (warning.status === 'unread' || warning.status === 'read');

  return (
    <div className={styles.card}>
      <div className={`${styles.levelBar} ${styles[levelClass]}`} />
      <div className={`${styles.levelDot} ${styles[levelClass]}`} />
      <div className={styles.platformIcon}>
        <PlatformIcon platform={warning.platform} size={22} />
      </div>
      <span className={styles.platformLabel}>
        {PLATFORM_LABEL[warning.platform]}
      </span>
      <span className={styles.account}>{warning.accountName}</span>
      <span className={`${styles.reason} ${styles[levelClass]}`}>
        {warning.reason}
      </span>
      <span className={styles.time}>
        {formatShortDateTime(warning.createTime)}
      </span>
      {showHandleButton ? (
        <Button
          type="primary"
          size="small"
          className={styles.btn}
          onClick={() => onHandle?.(warning)}
        >
          去处理
        </Button>
      ) : canIgnore ? (
        <Button
          type="default"
          size="small"
          className={styles.btn}
          onClick={() => onIgnore?.(warning)}
        >
          忽略
        </Button>
      ) : null}
      <Button
        type="link"
        size="small"
        className={styles.btnLink}
        onClick={() => onViewDetail?.(warning)}
      >
        查看详情
      </Button>
    </div>
  );
};

export default WarningCard;
