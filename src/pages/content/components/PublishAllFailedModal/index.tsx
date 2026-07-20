import type React from 'react';
import { CustomModal } from '@/components';
import styles from './style.module.css';
import type { PublishAllFailedModalProps } from './types';

const ErrorIcon: React.FC = () => (
  <div className={styles.errorIconWrapper}>
    <div className={styles.errorIcon}>
      <svg
        className={styles.xMark}
        viewBox="0 0 12 12"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M2 2L10 10M10 2L2 10"
          stroke="#FFFFFF"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
      </svg>
    </div>
  </div>
);

const PublishAllFailedModal: React.FC<PublishAllFailedModalProps> = (props) => {
  const { open, totalCount, failedAccounts, onClose, onViewHistory, onRetry } =
    props;

  const handleRetry = () => {
    onRetry();
    onClose();
  };

  return (
    <CustomModal
      open={open}
      title={null}
      footer={null}
      modalProps={{
        onCancel: onClose,
      }}
      width={560}
      className={styles.modal}
    >
      <div className={styles.errorIconBg}>
        <ErrorIcon />
      </div>

      <h2 className={styles.title}>发布失败</h2>
      <p className={styles.subtitle}>
        全部 {totalCount} 个账号发布失败，均已重试3次
      </p>

      <div className={styles.divider} />

      <div className={styles.failList}>
        {failedAccounts.map((account) => (
          <div key={account.id} className={styles.failItem}>
            <span className={styles.failDot} />
            <span className={styles.failAccountName}>
              {account.accountName}
            </span>
            <span className={styles.failReason}>{account.reason}</span>
          </div>
        ))}
      </div>

      <div className={styles.footerDivider} />

      <div className={styles.footer}>
        <button className={styles.secondaryBtn} onClick={onViewHistory}>
          查看历史发布
        </button>
        <button className={styles.primaryBtn} onClick={handleRetry}>
          重新发布
        </button>
      </div>
    </CustomModal>
  );
};

export default PublishAllFailedModal;

export type { PublishAllFailedModalProps } from './types';
