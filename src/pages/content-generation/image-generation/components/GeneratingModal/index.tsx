import type React from 'react';
import styles from './style.module.css';

export interface GeneratingModalProps {
  visible: boolean;
  progress?: number;
  onClose?: () => void;
  onBackground?: () => void;
}

const Loader: React.FC = () => (
  <svg className={styles.loader} viewBox="0 0 96 96" fill="none">
    <circle cx="48" cy="48" r="40" stroke="#f9f0ff" strokeWidth="8" />
    <path
      d="M48 8a40 40 0 0 1 40 40"
      stroke="#722ed1"
      strokeWidth="8"
      strokeLinecap="round"
    >
      <animateTransform
        attributeName="transform"
        type="rotate"
        from="0 48 48"
        to="360 48 48"
        dur="1s"
        repeatCount="indefinite"
      />
    </path>
  </svg>
);

export const GeneratingModal: React.FC<GeneratingModalProps> = ({
  visible,
  progress = 50,
  onClose,
  onBackground,
}) => {
  if (!visible) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <span className={styles.modalTitle}>图文生成中</span>
          <span className={styles.closeButton} onClick={onClose}>
            ✕
          </span>
        </div>
        <div className={styles.modalBody}>
          <Loader />
          <span className={styles.loadingText}>AI 正在生成图文内容…</span>
          <div className={styles.progressContainer}>
            <div
              className={styles.progressFill}
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className={styles.progressMeta}>
            <span className={styles.progressPercent}>{progress}%</span>
          </div>
          <span className={styles.hintText}>
            可关闭弹窗，任务将在后台继续运行
          </span>
        </div>
        <div className={styles.modalFooter}>
          <button className={styles.backgroundButton} onClick={onBackground}>
            后台运行
          </button>
          <button className={styles.primaryButton} onClick={onClose}>
            我知道了
          </button>
        </div>
      </div>
    </div>
  );
};

export default GeneratingModal;
