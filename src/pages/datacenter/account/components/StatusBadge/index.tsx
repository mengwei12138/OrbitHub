import styles from './style.module.css';
import type { StatusBadgeProps } from './types';

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const isOnline = status === 'online';

  return (
    <span
      className={styles.statusBadge}
      data-status={isOnline ? 'online' : 'offline'}
    >
      <span className={styles.statusDot} />
      {isOnline ? '在线' : '离线'}
    </span>
  );
};

export default StatusBadge;
