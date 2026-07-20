import type React from 'react';
import { TrialStatusCard, type VideoGenerationMode } from '../TrialStatusCard';
import styles from './style.module.css';

export type VideoLength = 5 | 8 | 10 | 12 | 15;
export type Resolution = '720P' | '1080P';
export type AIGeneratedMarkPosition =
  | 'bottom-left'
  | 'bottom-center'
  | 'bottom-right';

/** 与 AvatarPickerModal 中的 Avatar 字段对齐（外部接口 GET /api/user/avatar-assets/list） */
export interface Avatar {
  assetId: string;
  imageUrl?: string;
  sortOrder?: number;
}

export interface ContentConfigFormProps {
  trialRemaining?: number;
  trialTotal?: number;
  generationMode?: VideoGenerationMode;
  onModeChange?: (mode: VideoGenerationMode) => void;
  selectedAvatar?: Avatar;
  prompt?: string;
  promptMaxLength?: number;
  aiGeneratedMarkPosition?: AIGeneratedMarkPosition;
  videoLength?: VideoLength;
  resolution?: Resolution;
  isTrialMode?: boolean;
  /** AI 润色进行中：按钮置灰并展示 loading 指示 */
  isPolishing?: boolean;
  onAvatarChange?: () => void;
  onAvatarRemove?: () => void;
  onPromptChange?: (prompt: string) => void;
  onAIGeneratedMarkPositionChange?: (position: AIGeneratedMarkPosition) => void;
  onAIPolish?: () => void;
  onVideoLengthChange?: (length: VideoLength) => void;
  onResolutionChange?: (resolution: Resolution) => void;
  className?: string;
}

const SparkleIcon: React.FC = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
    <path
      d="M7 1L8.5 5.5L13 7L8.5 8.5L7 13L5.5 8.5L1 7L5.5 5.5L7 1Z"
      fill="#1677ff"
    />
  </svg>
);

const PersonPlaceholderIcon: React.FC = () => (
  <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden>
    <circle cx="14" cy="9" r="4" fill="#1677ff" />
    <path
      d="M6 24c0-4.418 3.582-8 8-8s8 3.582 8 8"
      stroke="#1677ff"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

export const ContentConfigForm: React.FC<ContentConfigFormProps> = ({
  trialRemaining = 0,
  trialTotal = 3,
  generationMode = 'standard',
  onModeChange,
  selectedAvatar,
  prompt = '',
  promptMaxLength = 1000,
  aiGeneratedMarkPosition = 'bottom-left',
  videoLength = 10,
  resolution = '720P',
  isTrialMode = false,
  isPolishing = false,
  onAvatarChange,
  onAvatarRemove,
  onPromptChange,
  onAIGeneratedMarkPositionChange,
  onAIPolish,
  onVideoLengthChange,
  onResolutionChange,
  className,
}) => {
  const videoLengthOptions: VideoLength[] = isTrialMode
    ? [5, 8, 10, 12]
    : [5, 8, 10, 15];
  // 1080P 仅高级质量档位可选；免费试用 / 标准质量都只能 720P
  const resolutionOptions: Resolution[] =
    generationMode === 'premium' ? ['720P', '1080P'] : ['720P'];
  const hasSelectedAvatar = !!selectedAvatar && !isTrialMode;

  const renderAvatarRow = () => {
    if (isTrialMode) {
      return (
        <div className={styles.avatarRowTrial}>
          <div className={styles.avatarInfoTrial}>
            <p className={styles.avatarTitleMuted}>虚拟人物 · 100 积分</p>
            <p className={styles.trialNotice}>试用版暂不支持虚拟人物</p>
          </div>
          <button
            type="button"
            className={styles.selectAvatarBtnDisabled}
            disabled
          >
            点击选择
          </button>
        </div>
      );
    }

    if (hasSelectedAvatar && selectedAvatar) {
      return (
        <div className={styles.avatarRowSelected}>
          <div className={styles.avatarMain}>
            <div className={styles.avatarThumb}>
              {selectedAvatar.imageUrl ? (
                <img
                  src={selectedAvatar.imageUrl}
                  alt={selectedAvatar.assetId}
                  className={styles.avatarThumbImg}
                />
              ) : (
                <PersonPlaceholderIcon />
              )}
            </div>
            <div className={styles.avatarInfo}>
              <p className={styles.avatarName}>已选虚拟人物</p>
              <p className={styles.avatarCostSelected}>虚拟人物 · +100 积分</p>
            </div>
          </div>
          <div className={styles.avatarActions}>
            <button
              type="button"
              className={styles.changeBtn}
              onClick={onAvatarChange}
            >
              点击更换
            </button>
            <button
              type="button"
              className={styles.removeBtn}
              onClick={onAvatarRemove}
            >
              移除
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className={styles.avatarRowEmpty}>
        <p className={styles.avatarTitleMuted}>虚拟人物 · 100 积分</p>
        <button
          type="button"
          className={styles.selectAvatarBtn}
          onClick={onAvatarChange}
        >
          点击选择
        </button>
      </div>
    );
  };

  return (
    <div className={`${styles.card} ${className ?? ''}`}>
      <TrialStatusCard
        trialRemaining={trialRemaining}
        trialTotal={trialTotal}
        selectedMode={generationMode}
        onModeChange={onModeChange}
      />

      <div className={styles.body}>
        {renderAvatarRow()}

        <div className={styles.field}>
          <label className={styles.label} htmlFor="video-prompt">
            描述提示词
          </label>
          <div className={styles.textareaWrapper}>
            <textarea
              id="video-prompt"
              className={styles.textarea}
              placeholder="请输入商品描述、场景、风格等提示词…"
              value={prompt}
              onChange={(e) => onPromptChange?.(e.target.value)}
              maxLength={promptMaxLength}
            />
            <span className={styles.charCount}>
              {prompt.length} / {promptMaxLength}
            </span>
          </div>
          {!isTrialMode && (
            <div className={styles.polishRow}>
              <button
                type="button"
                className={styles.polishBtn}
                onClick={onAIPolish}
                disabled={isPolishing}
                aria-busy={isPolishing}
              >
                {isPolishing ? (
                  <span className={styles.polishSpinner} aria-hidden />
                ) : (
                  <SparkleIcon />
                )}
                <span>{isPolishing ? 'AI 润色中…' : 'AI 润色'}</span>
              </button>
            </div>
          )}
        </div>

        <div className={styles.markPositionRow}>
          <label
            className={styles.markPositionLabel}
            htmlFor="ai-mark-position"
          >
            AI生成标记位置
          </label>
          <select
            id="ai-mark-position"
            className={styles.markPositionSelect}
            value={aiGeneratedMarkPosition}
            onChange={(event) =>
              onAIGeneratedMarkPositionChange?.(
                event.target.value as AIGeneratedMarkPosition,
              )
            }
          >
            <option value="bottom-left">左下</option>
            <option value="bottom-center">中下</option>
            <option value="bottom-right">右下</option>
          </select>
        </div>

        <div className={styles.field}>
          <span className={styles.label}>视频长度</span>
          <div className={styles.segmentGroup}>
            {videoLengthOptions.map((len) => (
              <button
                key={len}
                type="button"
                className={`${styles.segment} ${videoLength === len ? styles.selected : ''}`}
                onClick={() => onVideoLengthChange?.(len)}
              >
                {len} 秒
              </button>
            ))}
          </div>
        </div>

        <div className={styles.fieldLast}>
          <span className={styles.label}>清晰度</span>
          <div className={styles.segmentGroup}>
            {resolutionOptions.map((res) => (
              <button
                key={res}
                type="button"
                className={`${styles.segment} ${resolution === res ? styles.selected : ''}`}
                onClick={() => onResolutionChange?.(res)}
              >
                {res}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContentConfigForm;
