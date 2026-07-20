import type React from 'react';
import styles from './style.module.css';

/**
 * 虚拟人物素材：字段对齐外部接口 GET /api/user/avatar-assets/list 返回。
 * 仅有 assetId + imageUrl + sortOrder，没有 name/tag。
 */
export interface Avatar {
  assetId: string;
  imageUrl?: string;
  sortOrder?: number;
}

export interface AvatarPickerModalProps {
  visible: boolean;
  avatars: Avatar[];
  selectedAvatarId?: string;
  loading?: boolean;
  error?: string | null;
  onSelect: (avatar: Avatar) => void;
  onCancel: () => void;
  onConfirm: () => void;
}

const CheckIcon: React.FC = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <path
      d="M11 4L5.5 9.5L3 7"
      stroke="#fff"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const AvatarPickerModal: React.FC<AvatarPickerModalProps> = ({
  visible,
  avatars,
  selectedAvatarId,
  loading,
  error,
  onSelect,
  onCancel,
  onConfirm,
}) => {
  if (!visible) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.content}>
        <div className={styles.header}>
          <span className={styles.title}>虚拟人物库</span>
          <span className={styles.closeBtn} onClick={onCancel}>
            ✕
          </span>
        </div>
        <div className={styles.body}>
          <div className={styles.sectionTitle}>虚拟人物素材库</div>
          <div className={styles.warningBar}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <circle cx="7" cy="7" r="6" fill="#FAAD14" />
              <path
                d="M7 4V7.5M7 9.5H7.01"
                stroke="#fff"
                strokeWidth="1.2"
                strokeLinecap="round"
              />
            </svg>
            <span>使用虚拟人物需要消耗 100 积分</span>
          </div>

          {loading ? (
            <div className={styles.statePlaceholder}>加载中…</div>
          ) : error ? (
            <div className={styles.statePlaceholder}>加载失败：{error}</div>
          ) : avatars.length === 0 ? (
            <div className={styles.statePlaceholder}>暂无虚拟人物素材</div>
          ) : (
            <div className={styles.avatarGrid}>
              {avatars.map((avatar) => {
                const isSelected = selectedAvatarId === avatar.assetId;
                return (
                  <div
                    key={avatar.assetId}
                    className={`${styles.avatarCard} ${isSelected ? styles.selected : ''}`}
                    onClick={() => onSelect(avatar)}
                  >
                    <div className={styles.avatarBg}>
                      {avatar.imageUrl ? (
                        <img
                          src={avatar.imageUrl}
                          alt={avatar.assetId}
                          className={styles.avatarImg}
                          loading="lazy"
                        />
                      ) : (
                        <div className={styles.avatarPlaceholder} />
                      )}
                      {isSelected && (
                        <div className={styles.checkBadge}>
                          <CheckIcon />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        <div className={styles.footer}>
          <span className={styles.footerCount}>
            共 {avatars.length} 位虚拟人物
          </span>
          <button className={styles.cancelBtn} onClick={onCancel}>
            取消
          </button>
          <button
            className={styles.confirmBtn}
            onClick={onConfirm}
            disabled={!selectedAvatarId}
          >
            确认选择
          </button>
        </div>
      </div>
    </div>
  );
};

export default AvatarPickerModal;
