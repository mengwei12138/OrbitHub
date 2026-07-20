import { PlatformIcon } from '@/components';
import { formatCompactCount } from '@/pages/datacenter/utils/format-compact-count';
import { formatDateTimeMinute } from '@/utils/date';
import StatusBadge from '../StatusBadge';
import styles from './style.module.css';
import type { BasicInfoData } from './types';

const BasicInfo: React.FC<BasicInfoData> = ({
  avatar,
  nickname,
  platform,
  fansCount,
  status,
  lastSyncTime,
}) => {
  const formatFansCount = (count: number): string => {
    if (count >= 100000000) {
      return `${(count / 100000000).toFixed(1)}亿`;
    }
    if (count >= 10000) {
      return `${(count / 10000).toFixed(1)}万`;
    }
    return formatCompactCount(count);
  };

  const getAvatarLetter = (name?: string): string => {
    return name?.charAt(0) ?? '?';
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>基本信息</div>

      <div className={styles.content}>
        {avatar ? (
          <img src={avatar} alt={nickname} className={styles.avatar} />
        ) : (
          <div className={styles.avatarLetter}>{getAvatarLetter(nickname)}</div>
        )}

        <div className={styles.info}>
          <div className={styles.nicknameRow}>
            <span className={styles.nickname}>{nickname}</span>
            <PlatformIcon platform={platform} size={22} />
            <span className={styles.platformLabel}>
              {platform === 'xiaohongshu' ? '小红书' : '抖音'}
            </span>
          </div>

          <div className={styles.metaRow}>
            <span>粉丝数：{formatFansCount(fansCount)}</span>
            <span className={styles.divider}>|</span>
            <span>账号状态：</span>
            <StatusBadge status={status} />
            <span className={styles.divider}>|</span>
            <span>最后同步：{formatDateTimeMinute(lastSyncTime)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BasicInfo;
