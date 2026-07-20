import { useMutation, useQuery } from '@tanstack/react-query';
import request from '@/api/request';
import {
  activePublishJobsQueryOptions,
  type HistoryQueryParams,
  historyRecordsQueryOptions,
  publishJobQueryOptions,
  publishRecordDetailQueryOptions,
  publishRecordQueryOptions,
} from './queryOptions';
import type {
  JobId,
  PublishRecordMetricsSnapshotData,
  PublishSubmitData,
  PublishSubmitRequest,
  RecordId,
  RefreshQrCodeData,
  RepublishRequest,
  SubmitVerifyCodeData,
  SubmitVerifyCodeRequest,
} from './types';

export const submitPublish = (data: PublishSubmitRequest) =>
  request.post<PublishSubmitData>(
    '/api/v1/content/publish/submit',
    data,
  ) as unknown as Promise<PublishSubmitData>;

export const useSubmitPublish = () =>
  useMutation({
    mutationFn: submitPublish,
  });

export const usePublishJob = (jobId: JobId) =>
  useQuery({ ...publishJobQueryOptions(jobId), enabled: !!jobId });

export const usePublishRecord = (recordId: RecordId) =>
  useQuery(publishRecordQueryOptions(recordId));

export const usePublishRecordDetail = (recordId: RecordId) =>
  useQuery(publishRecordDetailQueryOptions(recordId));

export const useRefreshMetrics = (recordId: RecordId) =>
  useMutation({
    mutationFn: (): Promise<PublishRecordMetricsSnapshotData> =>
      request.post<PublishRecordMetricsSnapshotData>(
        `/api/v1/content/publish/records/${recordId}/metrics:refresh`,
      ) as unknown as Promise<PublishRecordMetricsSnapshotData>,
  });

export const useHistoryRecords = (params: HistoryQueryParams) =>
  useQuery(historyRecordsQueryOptions(params));

export const useActivePublishJobs = () =>
  useQuery(activePublishJobsQueryOptions());

export const republish = (recordId: RecordId, data: RepublishRequest) =>
  request.post<PublishSubmitData>(
    `/api/v1/content/publish/records/${recordId}/republish`,
    data,
  ) as unknown as Promise<PublishSubmitData>;

export const useRepublish = () =>
  useMutation({
    mutationFn: ({
      recordId,
      data,
    }: {
      recordId: RecordId;
      data: RepublishRequest;
    }) => republish(recordId, data),
  });

// ────────── content-publish-verify-flow ──────────

export const submitVerifyCode = (
  recordId: RecordId,
  data: SubmitVerifyCodeRequest,
) =>
  request.post<SubmitVerifyCodeData>(
    `/api/v1/content/publish/records/${recordId}/verify-code`,
    data,
  ) as unknown as Promise<SubmitVerifyCodeData>;

/** 提交短信验证码 mutation。成功后保持 SMS 子态 UI 等待下次轮询推进。 */
export const useSubmitVerifyCode = () =>
  useMutation({
    mutationFn: ({
      recordId,
      data,
    }: {
      recordId: RecordId;
      data: SubmitVerifyCodeRequest;
    }) => submitVerifyCode(recordId, data),
  });

export const refreshQrCode = (recordId: RecordId) =>
  request.post<RefreshQrCodeData>(
    `/api/v1/content/publish/records/${recordId}/qr-refresh`,
  ) as unknown as Promise<RefreshQrCodeData>;

/**
 * 刷新二维码 mutation。
 * - status=QR_VERIFY_REQUIRED：用新 qrCodeSrc 更新 `<img>` src
 * - status=SUCCEEDED：用户已扫码成功，前端切换为完成态等下次 publishJob 轮询
 * 前端按钮限频 30s（覆盖爬虫长等时长）。
 */
export const useRefreshQrCode = () =>
  useMutation({
    mutationFn: ({ recordId }: { recordId: RecordId }) =>
      refreshQrCode(recordId),
  });
