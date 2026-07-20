import { Button, Modal } from 'antd';
import type { ReactNode } from 'react';

import styles from './style.module.css';

export interface ForgotPasswordModalProps {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  content: ReactNode;
}

const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({
  open,
  onClose,
  title,
  content,
}) => {
  return (
    <Modal
      open={open}
      onCancel={onClose}
      title={title}
      centered
      width={440}
      closable
      footer={
        <Button type="primary" block onClick={onClose}>
          我知道了
        </Button>
      }
      className={styles.modal}
    >
      <div className={styles.content}>
        <div className={styles.lockIcon}>
          <svg
            width="64"
            height="64"
            viewBox="0 0 64 64"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect width="64" height="64" rx="12" fill="#E6F4FF" />
            <rect x="20" y="29" width="24" height="18" rx="2" fill="#1677FF" />
            <path
              d="M32 17C26.4772 17 22 21.4772 22 27V29H20V31H44V29H42V27C42 21.4772 37.5228 17 32 17ZM32 19C36.4183 19 40 22.5817 40 27V29H24V27C24 22.5817 27.5817 19 32 19Z"
              fill="#1677FF"
            />
            <circle cx="32" cy="37" r="2" fill="white" />
            <rect x="31" y="37" width="2" height="5" rx="1" fill="white" />
          </svg>
        </div>
        <div className={styles.text}>{content}</div>
      </div>
    </Modal>
  );
};

export default ForgotPasswordModal;
