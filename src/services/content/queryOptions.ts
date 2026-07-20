import request from '@/api/request';

import type {
  ActivePublishJobsData,
  JobId,
  PlatformCode,
  PublishExtensionFinalStatusCode,
  PublishJobProgressData,
  PublishRecordDetailData,
  PublishRecordListData,
  PublishRecordMetricsSnapshotData,
  PublishRecordProgressData,
  PublishStatusCode,
  RecordId,
  UploadSessionId,
  UploadSessionStatusData,
} from './types';

export type HistoryQueryParams = {
  page?: number;
  pageSize?: number;
  platform?: PlatformCode;
  status?: PublishStatusCode;
  extensionStatus?: PublishExtensionFinalStatusCode;
  startAt?: string;
  endAt?: string;
};

export const uploadSessionQueryOptions = (
  uploadSessionId: UploadSessionId,
) => ({
  queryKey: ['content', 'upload', 'session', uploadSessionId],
  queryFn: async (): Promise<UploadSessionStatusData> => {
    const res = await request.get<UploadSessionStatusData>(
      `/api/v1/content/media/upload-sessions/${uploadSessionId}`,
    );
    return res as unknown as UploadSessionStatusData;
  },
});

export const publishJobQueryOptions = (jobId: JobId) => ({
  queryKey: ['content', 'publish', 'job', jobId],
  queryFn: async (): Promise<PublishJobProgressData> => {
    const res = await request.get<PublishJobProgressData>(
      `/api/v1/content/publish/jobs/${jobId}`,
    );
    return res as unknown as PublishJobProgressData;
  },
  refetchInterval: (query: { state: { data?: PublishJobProgressData } }) =>
    query.state.data?.jobStatus === 'COMPLETED' ? false : 2000,
  refetchIntervalInBackground: false,
  retry: 1,
});

export const publishRecordQueryOptions = (recordId: RecordId) => ({
  queryKey: ['content', 'publish', 'record', recordId],
  queryFn: async (): Promise<PublishRecordProgressData> => {
    const res = await request.get<PublishRecordProgressData>(
      `/api/v1/content/publish/records/${recordId}`,
    );
    return res as unknown as PublishRecordProgressData;
  },
});

export const publishRecordDetailQueryOptions = (recordId: RecordId) => ({
  queryKey: ['content', 'publish', 'record', 'detail', recordId],
  queryFn: async (): Promise<PublishRecordDetailData> => {
    const res = await request.get<PublishRecordDetailData>(
      `/api/v1/content/publish/records/${recordId}/detail`,
    );
    return res as unknown as PublishRecordDetailData;
  },
});

export const publishRecordMetricsRefreshQueryOptions = (
  recordId: RecordId,
) => ({
  queryKey: ['content', 'publish', 'record', 'metrics', 'refresh', recordId],
  queryFn: async (): Promise<PublishRecordMetricsSnapshotData> => {
    const res = await request.post<PublishRecordMetricsSnapshotData>(
      `/api/v1/content/publish/records/${recordId}/metrics:refresh`,
    );
    return res as unknown as PublishRecordMetricsSnapshotData;
  },
});

export const historyRecordsQueryOptions = (params: HistoryQueryParams) => ({
  queryKey: ['content', 'publish', 'history', 'records', params],
  queryFn: async (): Promise<PublishRecordListData> => {
    const res = (await request.get<PublishRecordListData>(
      '/api/v1/content/publish/records',
      { params },
    )) as unknown as PublishRecordListData;
    return res;
  },
});

export const activePublishJobsQueryOptions = () => ({
  queryKey: ['content', 'publish', 'jobs', 'active'],
  queryFn: async (): Promise<ActivePublishJobsData> => {
    const res = await request.get<ActivePublishJobsData>(
      '/api/v1/content/publish/jobs/active',
    );
    return res as unknown as ActivePublishJobsData;
  },
  refetchInterval: 30_000,
  refetchIntervalInBackground: false,
});
