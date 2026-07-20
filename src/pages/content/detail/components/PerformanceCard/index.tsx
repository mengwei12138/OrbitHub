import { Button, Card } from 'antd';
import type React from 'react';
import { CustomTable } from '@/components';
import { PLACEHOLDER } from '@/constants';
import type { PublishRecordMetricsSnapshotData } from '@/services/content/types';
import { formatDateTimeMinute } from '@/utils/date';

import styles from './style.module.css';

const METRICS_CONFIG = [
  { key: 'viewCount', label: '播放量' },
  { key: 'likeCount', label: '点赞量' },
  { key: 'commentCount', label: '评论量' },
  { key: 'shareCount', label: '转发量' },
  { key: 'collectCount', label: '收藏量' },
  { key: 'newFollowersCount', label: '新增粉丝' },
  { key: 'engagementRatePercent', label: '互动率(%)' },
] as const;

type MetricRow = {
  key: string;
  [key: string]: string | null;
};

const PerformanceCard: React.FC<{
  data?: PublishRecordMetricsSnapshotData;
  loading?: boolean;
  isPendingReview?: boolean;
  refreshing?: boolean;
  onRefresh?: () => void;
}> = ({ data, loading, isPendingReview, refreshing, onRefresh }) => {
  const columns = METRICS_CONFIG.map((config) => ({
    title: config.label,
    dataIndex: config.key,
    key: config.key,
    render: (value: string | null | undefined) => value ?? PLACEHOLDER,
  }));

  const metricsData: MetricRow[] = isPendingReview
    ? METRICS_CONFIG.map((config) => ({
        key: config.key,
        [config.key]: null,
      }))
    : [
        {
          key: 'metrics',
          viewCount: data?.viewCount ?? null,
          likeCount: data?.likeCount ?? null,
          commentCount: data?.commentCount ?? null,
          shareCount: data?.shareCount ?? null,
          collectCount: data?.collectCount ?? null,
          newFollowersCount: data?.newFollowersCount ?? null,
          engagementRatePercent: data?.engagementRatePercent ?? null,
        },
      ];

  const isStoppedSync = data?.metricsSyncStopped ?? false;

  return (
    <Card
      title="数据表现"
      className={styles.card}
      extra={
        onRefresh && !isPendingReview && !isStoppedSync ? (
          <Button
            type="link"
            loading={refreshing}
            onClick={onRefresh}
            disabled={refreshing}
          >
            刷新
          </Button>
        ) : undefined
      }
    >
      <div className={styles.syncTime}>
        <span>
          最后同步：
          {data?.syncedAt ? formatDateTimeMinute(data.syncedAt) : PLACEHOLDER}
        </span>
      </div>

      <CustomTable
        columns={columns}
        dataSource={metricsData}
        pagination={false}
        loading={loading}
      />

      {isStoppedSync && (
        <div className={styles.tips}>
          ⚠️{' '}
          {data?.metricsSyncStopReason === 'RETENTION_EXPIRED'
            ? '数据已停止同步（发布超过30天），如需最新数据请前往平台查看。'
            : data?.metricsSyncStopReason === 'UNDER_REVIEW'
              ? '内容正在平台审核中，审核通过后数据将自动同步。'
              : '数据已停止同步，如需最新数据请前往平台查看。'}
        </div>
      )}
    </Card>
  );
};

export default PerformanceCard;
