import { describe, expect, it, vi } from 'vitest';
import {
  activePublishJobsQueryOptions,
  historyRecordsQueryOptions,
  publishJobQueryOptions,
  publishRecordDetailQueryOptions,
  publishRecordMetricsRefreshQueryOptions,
  publishRecordQueryOptions,
  uploadSessionQueryOptions,
} from '../queryOptions';
import type { PlatformCode } from '../types';

vi.mock('@/api/request', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('content queryOptions', () => {
  describe('uploadSessionQueryOptions', () => {
    it('生成正确的 queryKey', () => {
      const options = uploadSessionQueryOptions('session-123');
      expect(options.queryKey).toEqual([
        'content',
        'upload',
        'session',
        'session-123',
      ]);
    });

    it('调用 GET /api/v1/content/media/upload-sessions/{uploadSessionId}', async () => {
      const request = (await import('@/api/request')).default;
      const options = uploadSessionQueryOptions('session-123');

      (request.get as ReturnType<typeof vi.fn>).mockResolvedValue({
        code: 0,
        success: true,
        message: 'success',
        data: {
          uploadSessionId: 'session-123',
          status: 'UPLOADING',
          partSizeBytes: '1048576',
          totalParts: 10,
          fileSizeBytes: '10485760',
          uploadedParts: [],
          missingPartNumbers: [1, 2, 3],
          expiresAt: '2025-01-01T00:00:00Z',
          mediaAssetId: null,
        },
      });

      await options.queryFn();
      expect(request.get).toHaveBeenCalledWith(
        '/api/v1/content/media/upload-sessions/session-123',
      );
    });
  });

  describe('publishJobQueryOptions', () => {
    it('生成正确的 queryKey', () => {
      const options = publishJobQueryOptions('job-123');
      expect(options.queryKey).toEqual([
        'content',
        'publish',
        'job',
        'job-123',
      ]);
    });

    it('调用 GET /api/v1/content/publish/jobs/{jobId}', async () => {
      const request = (await import('@/api/request')).default;
      const options = publishJobQueryOptions('job-123');

      (request.get as ReturnType<typeof vi.fn>).mockResolvedValue({
        code: 0,
        success: true,
        message: 'success',
        data: {
          jobId: 'job-123',
          jobStatus: 'ACTIVE',
          overallPercent: 50,
          totalCount: 10,
          succeededCount: 5,
          failedCount: 0,
          records: [],
          updatedAt: '2025-01-01T00:00:00Z',
        },
      });

      await options.queryFn();
      expect(request.get).toHaveBeenCalledWith(
        '/api/v1/content/publish/jobs/job-123',
      );
    });

    it('refetchInterval 在 ACTIVE 状态返回 2000', () => {
      const options = publishJobQueryOptions('job-123');
      const interval = options.refetchInterval({
        state: { data: { jobStatus: 'ACTIVE' } as never },
      });
      expect(interval).toBe(2000);
    });

    it('refetchInterval 在 COMPLETED 状态返回 false 停止轮询', () => {
      const options = publishJobQueryOptions('job-123');
      const interval = options.refetchInterval({
        state: { data: { jobStatus: 'COMPLETED' } as never },
      });
      expect(interval).toBe(false);
    });

    it('refetchInterval 在数据未到达时返回 2000', () => {
      const options = publishJobQueryOptions('job-123');
      const interval = options.refetchInterval({ state: { data: undefined } });
      expect(interval).toBe(2000);
    });

    it('页面失焦不轮询，retry 次数为 1', () => {
      const options = publishJobQueryOptions('job-123');
      expect(options.refetchIntervalInBackground).toBe(false);
      expect(options.retry).toBe(1);
    });
  });

  describe('publishRecordQueryOptions', () => {
    it('生成正确的 queryKey', () => {
      const options = publishRecordQueryOptions('record-123');
      expect(options.queryKey).toEqual([
        'content',
        'publish',
        'record',
        'record-123',
      ]);
    });

    it('调用 GET /api/v1/content/publish/records/{recordId}', async () => {
      const request = (await import('@/api/request')).default;
      const options = publishRecordQueryOptions('record-123');

      (request.get as ReturnType<typeof vi.fn>).mockResolvedValue({
        code: 0,
        success: true,
        message: 'success',
        data: {
          recordId: 'record-123',
          accountId: 'account-456',
          platform: 'douyin',
          stage: 'PUBLISHED',
          percent: 100,
          updatedAt: '2025-01-01T00:00:00Z',
        },
      });

      await options.queryFn();
      expect(request.get).toHaveBeenCalledWith(
        '/api/v1/content/publish/records/record-123',
      );
    });
  });

  describe('publishRecordDetailQueryOptions', () => {
    it('生成正确的 queryKey', () => {
      const options = publishRecordDetailQueryOptions('record-123');
      expect(options.queryKey).toEqual([
        'content',
        'publish',
        'record',
        'detail',
        'record-123',
      ]);
    });

    it('调用 GET /api/v1/content/publish/records/{recordId}/detail', async () => {
      const request = (await import('@/api/request')).default;
      const options = publishRecordDetailQueryOptions('record-123');

      (request.get as ReturnType<typeof vi.fn>).mockResolvedValue({
        code: 0,
        success: true,
        message: 'success',
        data: {
          recordId: 'record-123',
          jobId: 'job-456',
          platform: 'douyin',
          contentMode: 'VIDEO',
          accountId: 'account-789',
          stage: 'PUBLISHED',
          status: 'PUBLISH_SUCCESS',
          publishedAt: '2025-01-01T00:00:00Z',
          canRepublish: true,
          metrics: {
            recordId: 'record-123',
            viewCount: '1000',
            likeCount: '100',
            commentCount: '10',
            shareCount: '5',
            collectCount: '20',
            newFollowersCount: '5',
            engagementRatePercent: '11.5',
            syncedAt: '2025-01-01T00:00:00Z',
            metricsSyncStopped: false,
          },
        },
      });

      await options.queryFn();
      expect(request.get).toHaveBeenCalledWith(
        '/api/v1/content/publish/records/record-123/detail',
      );
    });
  });

  describe('publishRecordMetricsRefreshQueryOptions', () => {
    it('生成正确的 queryKey', () => {
      const options = publishRecordMetricsRefreshQueryOptions('record-123');
      expect(options.queryKey).toEqual([
        'content',
        'publish',
        'record',
        'metrics',
        'refresh',
        'record-123',
      ]);
    });

    it('调用 POST /api/v1/content/publish/records/{recordId}/metrics:refresh', async () => {
      const request = (await import('@/api/request')).default;
      const options = publishRecordMetricsRefreshQueryOptions('record-123');

      (request.post as ReturnType<typeof vi.fn>).mockResolvedValue({
        code: 0,
        success: true,
        message: 'success',
        data: {
          recordId: 'record-123',
          viewCount: '2000',
          likeCount: '200',
          commentCount: '20',
          shareCount: '10',
          collectCount: '40',
          newFollowersCount: '10',
          engagementRatePercent: '11.5',
          syncedAt: '2025-01-01T00:00:00Z',
          metricsSyncStopped: false,
        },
      });

      await options.queryFn();
      expect(request.post).toHaveBeenCalledWith(
        '/api/v1/content/publish/records/record-123/metrics:refresh',
      );
    });
  });

  describe('historyRecordsQueryOptions', () => {
    it('生成正确的 queryKey', () => {
      const params = {
        page: 1,
        pageSize: 20,
        platform: 'douyin' as PlatformCode,
      };
      const options = historyRecordsQueryOptions(params);
      expect(options.queryKey).toEqual([
        'content',
        'publish',
        'history',
        'records',
        params,
      ]);
    });

    it('调用 GET /api/v1/content/publish/records', async () => {
      const request = (await import('@/api/request')).default;
      const params = { page: 1, pageSize: 20 };
      const options = historyRecordsQueryOptions(params);

      (request.get as ReturnType<typeof vi.fn>).mockResolvedValue({
        code: 0,
        success: true,
        message: 'success',
        data: {
          list: [],
          page: 1,
          pageSize: 20,
          total: 0,
          totalPages: 0,
          hasNext: false,
          hasPrevious: false,
        },
      });

      await options.queryFn();
      expect(request.get).toHaveBeenCalledWith(
        '/api/v1/content/publish/records',
        {
          params,
        },
      );
    });
  });

  describe('activePublishJobsQueryOptions', () => {
    it('生成正确的 queryKey', () => {
      const options = activePublishJobsQueryOptions();
      expect(options.queryKey).toEqual([
        'content',
        'publish',
        'jobs',
        'active',
      ]);
    });

    it('调用 GET /api/v1/content/publish/jobs/active', async () => {
      const request = (await import('@/api/request')).default;
      const options = activePublishJobsQueryOptions();

      (request.get as ReturnType<typeof vi.fn>).mockResolvedValue({
        code: 0,
        success: true,
        message: 'success',
        data: {
          hasActive: false,
          jobs: [],
        },
      });

      await options.queryFn();
      expect(request.get).toHaveBeenCalledWith(
        '/api/v1/content/publish/jobs/active',
      );
    });

    it('refetchInterval 为 30 秒，页面失焦不轮询', () => {
      const options = activePublishJobsQueryOptions();
      expect(options.refetchInterval).toBe(30_000);
      expect(options.refetchIntervalInBackground).toBe(false);
    });
  });
});
