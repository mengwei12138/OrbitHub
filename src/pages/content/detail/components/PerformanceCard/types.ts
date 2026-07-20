import type { PublishRecordMetricsSnapshotData } from '@/services/content/types';

export interface PerformanceCardProps {
  data?: PublishRecordMetricsSnapshotData;
  loading?: boolean;
  isPendingReview?: boolean;
  refreshing?: boolean;
  onRefresh?: () => void;
}
