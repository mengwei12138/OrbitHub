import type React from 'react';
import styles from './style.module.css';

export interface AIDisclaimerAlertProps {
  className?: string;
}

const AlertIcon: React.FC = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <circle cx="8" cy="8" r="7" fill="#FAAD14" />
    <path
      d="M8 4.5V8.5M8 11H8.01"
      stroke="#fff"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </svg>
);

export const AIDisclaimerAlert: React.FC<AIDisclaimerAlertProps> = ({
  className,
}) => {
  return (
    <div className={`${styles.alert} ${className ?? ''}`}>
      <AlertIcon />
      <span className={styles.text}>AI 生成内容，结果仅供参考，请自行审核</span>
    </div>
  );
};

export default AIDisclaimerAlert;
