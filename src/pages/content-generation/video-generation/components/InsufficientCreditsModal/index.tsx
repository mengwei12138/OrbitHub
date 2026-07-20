import type React from 'react';
import styles from './style.module.css';

export interface CreditInfo {
  current: number;
  cost: number;
  shortage: number;
}

export interface InsufficientCreditsModalProps {
  visible: boolean;
  creditInfo: CreditInfo;
  onClose?: () => void;
}

const WalletIcon: React.FC = () => (
  <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
    <rect x="8" y="16" width="48" height="36" rx="4" fill="#FFF2F0" />
    <rect x="14" y="24" width="24" height="16" rx="2" fill="#FF4D4F" />
    <text x="20" y="36" fontSize="10" fontWeight="700" fill="#CF1322">
      P
    </text>
  </svg>
);

export const InsufficientCreditsModal: React.FC<
  InsufficientCreditsModalProps
> = ({ visible, creditInfo, onClose }) => {
  if (!visible) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.content}>
        <div className={styles.header}>
          <span className={styles.title}>积分不足</span>
          <span className={styles.closeBtn} onClick={onClose}>
            ✕
          </span>
        </div>
        <div className={styles.body}>
          <div className={styles.icon}>
            <WalletIcon />
          </div>
          <div className={styles.breakdownCard}>
            <div className={styles.breakdownRow}>
              <span className={styles.breakdownLabel}>当前积分</span>
              <span className={styles.breakdownValue}>
                {creditInfo.current}
              </span>
            </div>
            <div className={styles.divider} />
            <div className={styles.breakdownRow}>
              <span className={styles.breakdownLabel}>本次消耗</span>
              <span className={styles.breakdownValue}>-{creditInfo.cost}</span>
            </div>
            <div className={styles.divider} />
            <div className={styles.breakdownRow}>
              <span className={styles.breakdownLabel}>不足积分</span>
              <span className={`${styles.breakdownValue} ${styles.shortage}`}>
                {creditInfo.shortage}
              </span>
            </div>
          </div>
          <div className={styles.contactHint}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <circle cx="7" cy="7" r="6" fill="#FAAD14" />
              <path
                d="M7 4V7.5M7 9.5H7.01"
                stroke="#fff"
                strokeWidth="1.2"
                strokeLinecap="round"
              />
            </svg>
            <span>如需充值，请联系销售或超级管理员</span>
          </div>
        </div>
        <div className={styles.footer}>
          <button className={styles.okBtn} onClick={onClose}>
            我知道了
          </button>
        </div>
      </div>
    </div>
  );
};

export default InsufficientCreditsModal;
