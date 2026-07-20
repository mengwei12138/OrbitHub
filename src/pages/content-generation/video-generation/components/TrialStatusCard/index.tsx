import type React from 'react';
import styles from './style.module.css';

/** 视频生成模式 */
export type VideoGenerationMode = 'trial' | 'standard' | 'premium';

/** @deprecated 使用 VideoGenerationMode */
export type VideoQuality = 'standard' | 'premium';

export interface TrialStatusCardProps {
  trialRemaining?: number;
  trialTotal?: number;
  selectedMode?: VideoGenerationMode;
  onModeChange?: (mode: VideoGenerationMode) => void;
  className?: string;
}

const TrialWarningIcon: React.FC = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
    <circle cx="8" cy="8" r="7" fill="#FAAD14" />
    <path
      d="M8 4.5V8.25M8 10.75H8.01"
      stroke="#fff"
      strokeWidth="1.2"
      strokeLinecap="round"
    />
  </svg>
);

export const TrialStatusCard: React.FC<TrialStatusCardProps> = ({
  trialRemaining = 0,
  selectedMode = 'standard',
  onModeChange,
  className,
}) => {
  const showTrialTab = trialRemaining > 0;
  const isTrialActive = selectedMode === 'trial' && showTrialTab;

  const tabs: {
    key: VideoGenerationMode;
    label: string;
    disabled?: boolean;
  }[] = [];
  if (showTrialTab) {
    tabs.push({ key: 'trial', label: '免费试用' });
  }
  tabs.push({ key: 'standard', label: '标准质量' });
  tabs.push({ key: 'premium', label: '高级质量' });

  return (
    <div className={`${styles.header} ${className ?? ''}`}>
      <div className={styles.tabBar} role="tablist">
        {tabs.map((tab) => {
          const isActive =
            tab.key === 'trial'
              ? isTrialActive
              : tab.key === 'standard'
                ? selectedMode === 'standard' ||
                  (selectedMode === 'trial' && !showTrialTab)
                : selectedMode === 'premium';

          return (
            <button
              key={tab.key}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-disabled={tab.disabled}
              disabled={tab.disabled}
              className={`${styles.tabItem} ${isActive ? styles.tabItemActive : ''} ${tab.disabled ? styles.tabItemDisabled : ''}`}
              onClick={() => {
                if (!tab.disabled) {
                  onModeChange?.(tab.key);
                }
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {isTrialActive && (
        <div className={styles.trialNote}>
          <TrialWarningIcon />
          <span>
            免费试用：仅图片素材、不支持虚拟人物、不扣积分。剩余{' '}
            {trialRemaining} 次
          </span>
        </div>
      )}
    </div>
  );
};

export default TrialStatusCard;
