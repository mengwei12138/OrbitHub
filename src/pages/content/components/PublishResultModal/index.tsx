import type React from 'react';
import { CustomModal } from '@/components';
import styles from './style.module.css';
import type { PublishResultModalProps } from './types';

const SuccessIcon: React.FC = () => (
  <div className={styles.successIconWrapper}>
    <div className={styles.successIcon}>
      <svg
        className={styles.checkmark}
        viewBox="0 0 10 10"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M2 5L4 7L8 3"
          stroke="#FFFFFF"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  </div>
);

const WarningIcon: React.FC = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 14 14"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={styles.warningIcon}
  >
    <path
      d="M7 1.5L13 12.5H1L7 1.5Z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M7 5.5V8"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <circle cx="7" cy="10" r="0.75" fill="currentColor" />
  </svg>
);

const PublishResultModal: React.FC<PublishResultModalProps> = (props) => {
  const {
    open,
    successCount,
    failedAccounts,
    onClose,
    onViewHistory,
    onContinuePublish,
  } = props;

  const handleContinuePublish = () => {
    onContinuePublish();
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
      <div className={styles.successIconBg}>
        <SuccessIcon />
      </div>

      <h2 className={styles.title}>发布完成</h2>

      <div className={styles.statsRow}>
        <span className={styles.statSuccess}>
          成功提交：{successCount} 个账号
        </span>
        {failedAccounts.length > 0 && (
          <span className={styles.statFailed}>
            失败：{failedAccounts.length} 个账号
          </span>
        )}
      </div>

      <div className={styles.divider} />

      {failedAccounts.length > 0 && (
        <>
          <h3 className={styles.sectionTitle}>失败账号及原因：</h3>
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
        </>
      )}

      <div className={styles.warningHint}>
        <WarningIcon />
        <span className={styles.warningText}>
          提示："成功"仅代表内容已提交至平台，部分内容可能正在审核中。
        </span>
      </div>

      <div className={styles.footerDivider} />

      <div className={styles.footer}>
        <button className={styles.secondaryBtn} onClick={onViewHistory}>
          查看历史发布
        </button>
        <button className={styles.primaryBtn} onClick={handleContinuePublish}>
          继续发布
        </button>
      </div>
    </CustomModal>
  );
};

export default PublishResultModal;

export type { PublishResultModalProps } from './types';
