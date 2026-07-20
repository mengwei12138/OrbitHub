import { Card, Tag } from 'antd';
import type React from 'react';
import { PLACEHOLDER } from '@/constants';
import type { PublishRecordDetailData } from '@/services/content/types';
import { formatDateTimeMinute } from '@/utils/date';
import styles from './style.module.css';

type ExtensionInfoCardProps = {
  data?: PublishRecordDetailData;
};

const TYPE_LABEL = {
  location: '位置',
  deal: '团购',
} as const;

const STATUS_LABEL = {
  NONE: '无商品信息',
  MOUNTED: '已挂载',
  MOUNT_FAILED: '挂载失败',
} as const;

const STATUS_COLOR = {
  NONE: 'default',
  MOUNTED: 'green',
  MOUNT_FAILED: 'red',
} as const;

const PRE_MOUNT_LABEL = {
  SUCCESS: '预挂载成功',
  FAILED: '预挂载失败',
  EXPIRED: '预挂载过期',
} as const;

const ExtensionInfoCard: React.FC<ExtensionInfoCardProps> = ({ data }) => {
  const extension = data?.extensionInfo;

  if (!extension || extension.finalStatus === 'NONE') {
    return (
      <Card title="商品信息" className={styles.card}>
        <div className={styles.emptyText}>未配置商品信息，本次为普通发布。</div>
      </Card>
    );
  }

  return (
    <Card title="商品信息" className={styles.card}>
      <div className={styles.infoGrid}>
        <div className={styles.infoRow}>
          <span className={styles.label}>商品类型：</span>
          <Tag color={extension.type === 'deal' ? 'gold' : 'blue'}>
            {extension.type ? TYPE_LABEL[extension.type] : PLACEHOLDER}
          </Tag>
        </div>
        <div className={styles.infoRow}>
          <span className={styles.label}>挂载对象：</span>
          <span className={styles.value}>
            {extension.targetName ?? PLACEHOLDER}
          </span>
        </div>
        <div className={styles.infoRow}>
          <span className={styles.label}>来源信息：</span>
          <span className={styles.value}>
            {[extension.sourceLabel, extension.targetDescription]
              .filter(Boolean)
              .join('｜') || PLACEHOLDER}
          </span>
        </div>
        <div className={styles.infoRow}>
          <span className={styles.label}>预挂载结果：</span>
          <span className={styles.value}>
            {extension.preMountStatus
              ? PRE_MOUNT_LABEL[extension.preMountStatus]
              : PLACEHOLDER}
            {extension.preMountId ? `（${extension.preMountId}）` : ''}
          </span>
        </div>
        <div className={styles.infoRow}>
          <span className={styles.label}>最终结果：</span>
          <Tag color={STATUS_COLOR[extension.finalStatus]}>
            {STATUS_LABEL[extension.finalStatus]}
          </Tag>
        </div>
        {extension.failureReason && (
          <div className={styles.infoRow}>
            <span className={styles.label}>失败原因：</span>
            <span className={styles.errorText}>{extension.failureReason}</span>
          </div>
        )}
        <div className={styles.infoRow}>
          <span className={styles.label}>更新时间：</span>
          <span className={styles.value}>
            {extension.updatedAt
              ? formatDateTimeMinute(extension.updatedAt)
              : PLACEHOLDER}
          </span>
        </div>
      </div>
    </Card>
  );
};

export default ExtensionInfoCard;
