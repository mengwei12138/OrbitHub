import { Card, Image, Space } from 'antd';
import type React from 'react';
import { PLATFORM_CONFIG, PlatformIcon } from '@/components';
import { PLACEHOLDER } from '@/constants';
import { PUBLISH_STATUS_CODE } from '@/services/content/types';
import { formatDateTimeMinute } from '@/utils/date';
import StatusBadge from '../StatusBadge';
import styles from './style.module.css';
import type { PublishInfoCardProps } from './types';

const PublishInfoCard: React.FC<PublishInfoCardProps> = ({ data }) => {
  const platform = data?.platform ?? PLACEHOLDER;
  const platformLabel =
    PLATFORM_CONFIG[platform as keyof typeof PLATFORM_CONFIG]?.label ??
    PLACEHOLDER;

  const isUnderReview = data?.status === PUBLISH_STATUS_CODE.UNDER_REVIEW;
  const isSuccess = data?.status === PUBLISH_STATUS_CODE.PUBLISH_SUCCESS;

  return (
    <Card title="发布信息" className={styles.card}>
      <div className={styles.infoGrid}>
        <div className={styles.infoRow}>
          <span className={styles.label}>发布账号：</span>
          <Space>
            <PlatformIcon platform={platform} size={16} />
            <span className={styles.value}>
              {data?.accountNickname ?? PLACEHOLDER}（{platformLabel}）
            </span>
          </Space>
        </div>
        <div className={styles.infoRow}>
          <span className={styles.label}>发布时间：</span>
          <span className={styles.value}>
            {data?.publishedAt
              ? formatDateTimeMinute(data.publishedAt)
              : PLACEHOLDER}
          </span>
        </div>
        {data?.platformPublishedAt && (
          <div className={styles.infoRow}>
            <span className={styles.label}>平台发布时间：</span>
            <span className={styles.value}>
              {formatDateTimeMinute(data.platformPublishedAt)}
            </span>
          </div>
        )}
        <div className={styles.infoRow}>
          <span className={styles.label}>发布状态：</span>
          <StatusBadge status={data?.status} />
        </div>
        <div className={styles.infoRow}>
          <span className={styles.label}>封面：</span>
          {data?.coverUrl ? (
            <Image
              src={data.coverUrl}
              width={96}
              height={72}
              className={styles.coverImage}
              preview={{ src: data.coverUrl }}
              alt="封面"
              data-testid="cover-image"
            />
          ) : (
            <span className={styles.value}>{PLACEHOLDER}</span>
          )}
        </div>
        {isSuccess && data?.platformContentUrl && (
          <div className={styles.infoRow}>
            <span className={styles.label}>平台链接：</span>
            <a
              href={data.platformContentUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.link}
            >
              查看
            </a>
          </div>
        )}
        {isUnderReview && (
          <div className={styles.tips}>
            ⚠️ 内容已提交至平台，正在等待平台审核。审核通过后数据将自动同步。
          </div>
        )}
        {data?.status === PUBLISH_STATUS_CODE.PUBLISH_FAILED &&
          data?.errorMessage && (
            <div className={styles.tips}>⚠️ {data.errorMessage}</div>
          )}
      </div>
    </Card>
  );
};

export default PublishInfoCard;
