import { Button } from 'antd';
import type React from 'react';
import styles from './style.module.css';

export interface BackButtonProps {
  onClick?: () => void;
  className?: string;
}

export const BackButton: React.FC<BackButtonProps> = ({
  onClick,
  className,
}) => {
  return (
    <Button
      className={`${styles.backButton} ${className ?? ''}`}
      onClick={onClick}
    >
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <path
          d="M11.0833 7H2.91663"
          stroke="#595959"
          strokeWidth="1.16667"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M6.99996 11.0834L2.91663 7.00008L6.99996 2.91675"
          stroke="#595959"
          strokeWidth="1.16667"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span>返回</span>
    </Button>
  );
};

export default BackButton;
