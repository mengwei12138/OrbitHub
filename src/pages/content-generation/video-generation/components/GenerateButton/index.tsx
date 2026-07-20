import { Button } from 'antd';
import type React from 'react';
import styles from './style.module.css';

export interface GenerateButtonProps {
  isTrialMode?: boolean;
  trialRemaining?: number;
  credits?: number;
  onClick?: () => void;
  className?: string;
}

export const GenerateButton: React.FC<GenerateButtonProps> = ({
  isTrialMode = false,
  trialRemaining = 0,
  credits = 0,
  onClick,
  className,
}) => {
  const getButtonText = () => {
    if (isTrialMode && trialRemaining > 0) {
      return `免费试用生成视频 · 剩余 ${trialRemaining} 次`;
    }
    return `立即生成视频 · 需 ${credits} 积分`;
  };

  return (
    <div className={`${styles.container} ${className ?? ''}`}>
      <Button
        type="primary"
        block
        size="large"
        className={styles.button}
        onClick={onClick}
      >
        {getButtonText()}
      </Button>
    </div>
  );
};

export default GenerateButton;
