import styles from './style.module.css';
import type { PublishStatusToastProps } from './types';

const PublishStatusToast: React.FC<PublishStatusToastProps> = ({
  message = '有发布任务正在进行中...',
  linkText = '查看',
  onLinkClick,
  visible = true,
}) => {
  if (!visible) {
    return null;
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.spinner} />
      <span className={styles.text}>{message}</span>
      <div className={styles.separator} />
      <span className={styles.link} onClick={onLinkClick} role="button">
        {linkText}
      </span>
    </div>
  );
};

export default PublishStatusToast;

export type { PublishStatusToastProps };
