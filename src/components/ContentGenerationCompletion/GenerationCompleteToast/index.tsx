import type React from 'react';
import { useEffect } from 'react';
import {
  FIGMA_CONTENT_GENERATION_BORDER_RADIUS_MD,
  FIGMA_CONTENT_GENERATION_COLOR_BORDER_CARD,
  FIGMA_CONTENT_GENERATION_COLOR_PRIMARY,
  FIGMA_CONTENT_GENERATION_SHADOW_LG,
} from '@/styles/content-generation/vars';
import styles from './style.module.css';

export type GenerationCompleteToastProps = {
  visible: boolean;
  title: string;
  actionText?: string;
  onAction?: () => void;
  onClose?: () => void;
  autoCloseMs?: number;
};

const SuccessIcon: React.FC = () => (
  <svg
    className={styles.successIcon}
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden
  >
    <circle cx="12" cy="12" r="12" fill="#52c41a" />
    <path
      d="M7 12.5L10.5 16L17 9"
      stroke="#fff"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const GenerationCompleteToast: React.FC<
  GenerationCompleteToastProps
> = ({
  visible,
  title,
  actionText = '点击查看详情',
  onAction,
  onClose,
  autoCloseMs = 5000,
}) => {
  useEffect(() => {
    if (!visible || autoCloseMs <= 0) return;
    const timer = window.setTimeout(() => {
      onClose?.();
    }, autoCloseMs);
    return () => window.clearTimeout(timer);
  }, [visible, autoCloseMs, onClose]);

  if (!visible) return null;

  return (
    <div
      className={styles.toast}
      style={{
        borderColor: FIGMA_CONTENT_GENERATION_COLOR_BORDER_CARD,
        borderRadius: FIGMA_CONTENT_GENERATION_BORDER_RADIUS_MD,
        boxShadow: FIGMA_CONTENT_GENERATION_SHADOW_LG,
      }}
      role="status"
      aria-live="polite"
    >
      <SuccessIcon />
      <div className={styles.content}>
        <p className={styles.title}>{title}</p>
        <button
          type="button"
          className={styles.action}
          style={{ color: FIGMA_CONTENT_GENERATION_COLOR_PRIMARY }}
          onClick={onAction}
        >
          {actionText}
        </button>
      </div>
      <button
        type="button"
        className={styles.closeBtn}
        aria-label="关闭通知"
        onClick={onClose}
      >
        ✕
      </button>
    </div>
  );
};

export default GenerationCompleteToast;
