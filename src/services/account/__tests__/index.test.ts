import { describe, expect, it, vi } from 'vitest';
import {
  accountDetailQueryOptions,
  accountListQueryOptions,
  accountLogsQueryOptions,
  batchDeleteAccounts,
  batchStartAccounts,
  batchStopAccounts,
  deleteAccount,
  loginStatusQueryOptions,
  reactivateInit,
  refreshQrCode,
  regionDictionaryQueryOptions,
  sendVerifyCode,
  startAccount,
  stopAccount,
  submitVerifyCode,
} from '../queryOptions';
import type { PlatformCode } from '../types';

vi.mock('@/api/request', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('account queryOptions', () => {
  describe('accountListQueryOptions', () => {
    it('生成正确的 queryKey', () => {
      const params = {
        platform: 'douyin' as PlatformCode,
        page: 1,
        pageSize: 10,
      };
      const options = accountListQueryOptions(params);
      expect(options.queryKey).toEqual(['account', 'list', params]);
    });

    it('调用 GET /api/v1/accounts', async () => {
      const request = (await import('@/api/request')).default;
      const params = {
        platform: 'douyin' as PlatformCode,
        page: 1,
        pageSize: 10,
      };
      const options = accountListQueryOptions(params);

      (request.get as ReturnType<typeof vi.fn>).mockResolvedValue({
        code: 0,
        success: true,
        message: 'success',
        data: {
          list: [],
          page: 1,
          pageSize: 10,
          total: '0',
          totalPages: 0,
          hasNext: false,
          hasPrevious: false,
        },
      });

      await options.queryFn();
      expect(request.get).toHaveBeenCalledWith('/api/v1/accounts', {
        params,
      });
    });
  });

  describe('accountDetailQueryOptions', () => {
    it('生成正确的 queryKey', () => {
      const options = accountDetailQueryOptions('123');
      expect(options.queryKey).toEqual(['account', 'detail', '123']);
    });

    it('调用 GET /api/v1/accounts/{id}', async () => {
      const request = (await import('@/api/request')).default;
      const options = accountDetailQueryOptions('123');

      (request.get as ReturnType<typeof vi.fn>).mockResolvedValue({
        code: 0,
        success: true,
        message: 'success',
        data: {
          id: '123',
          platform: 'douyin',
          accountNo: 'test',
          phoneNumber: '13800000000',
          nickname: '测试账号',
          avatar: 'https://example.com/avatar.jpg',
          status: 'ONLINE',
          followers: '1000',
          posts: '50',
          likes: '5000',
          loginRegion: 'CQ',
          loginRegionName: '重庆',
          tokenExpireAt: '2025-01-01T00:00:00Z',
          createdAt: '2024-01-01T00:00:00Z',
        },
      });

      await options.queryFn();
      expect(request.get).toHaveBeenCalledWith('/api/v1/accounts/123');
    });
  });

  describe('accountLogsQueryOptions', () => {
    it('生成正确的 queryKey', () => {
      const params = { page: 1, pageSize: 10 };
      const options = accountLogsQueryOptions('123', params);
      expect(options.queryKey).toEqual(['account', 'logs', '123', params]);
    });

    it('调用 GET /api/v1/accounts/{id}/logs', async () => {
      const request = (await import('@/api/request')).default;
      const params = { page: 1, pageSize: 10 };
      const options = accountLogsQueryOptions('123', params);

      (request.get as ReturnType<typeof vi.fn>).mockResolvedValue({
        code: 0,
        success: true,
        message: 'success',
        data: {
          list: [],
          page: 1,
          pageSize: 10,
          total: '0',
          totalPages: 0,
          hasNext: false,
          hasPrevious: false,
        },
      });

      await options.queryFn();
      expect(request.get).toHaveBeenCalledWith('/api/v1/accounts/123/logs', {
        params,
      });
    });
  });

  describe('loginStatusQueryOptions', () => {
    it('生成正确的 queryKey', () => {
      const options = loginStatusQueryOptions('session-123');
      expect(options.queryKey).toEqual([
        'account',
        'login',
        'status',
        'session-123',
      ]);
    });

    it('调用 GET /api/v1/accounts/login/{sessionId}/status', async () => {
      const request = (await import('@/api/request')).default;
      const options = loginStatusQueryOptions('session-123');

      (request.get as ReturnType<typeof vi.fn>).mockResolvedValue({
        code: 0,
        success: true,
        message: 'success',
        data: {
          status: 'WAITING_SCAN',
          account: null,
        },
      });

      await options.queryFn();
      expect(request.get).toHaveBeenCalledWith(
        '/api/v1/accounts/login/session-123/status',
      );
    });
  });

  describe('regionDictionaryQueryOptions', () => {
    it('生成正确的 queryKey', () => {
      const options = regionDictionaryQueryOptions();
      expect(options.queryKey).toEqual(['account', 'regions']);
    });

    it('调用 GET /api/v1/accounts/regions', async () => {
      const request = (await import('@/api/request')).default;
      const options = regionDictionaryQueryOptions();

      (request.get as ReturnType<typeof vi.fn>).mockResolvedValue({
        code: 0,
        success: true,
        message: 'success',
        data: {
          provinces: [],
          defaultCityCode: 'CQ',
          updatedAt: '2024-01-01T00:00:00Z',
        },
      });

      await options.queryFn();
      expect(request.get).toHaveBeenCalledWith('/api/v1/accounts/regions');
    });
  });
});

describe('account mutations', () => {
  describe('sendVerifyCode', () => {
    it('调用 POST /api/v1/accounts/login/verify-code', async () => {
      const request = (await import('@/api/request')).default;
      const data = {
        platform: 'douyin',
        phoneNumber: '13800000000',
        region: 'CQ',
      };

      (request.post as ReturnType<typeof vi.fn>).mockResolvedValue({
        code: 0,
        success: true,
        message: 'success',
        data: {
          requestId: 'req-123',
          countdown: 240,
        },
      });

      await sendVerifyCode(data);
      expect(request.post).toHaveBeenCalledWith(
        '/api/v1/accounts/login/verify-code',
        data,
      );
    });
  });

  describe('submitVerifyCode', () => {
    it('调用 POST /api/v1/accounts/login/verify-code/submit', async () => {
      const request = (await import('@/api/request')).default;
      const data = {
        platform: 'douyin',
        phoneNumber: '13800000000',
        code: '123456',
        requestId: 'req-123',
        region: 'CQ',
      };

      (request.post as ReturnType<typeof vi.fn>).mockResolvedValue({
        code: 0,
        success: true,
        message: 'success',
        data: {
          flow: 'NEED_QR',
          sessionId: 'session-123',
          qrCodeUrl: 'https://example.com/qr',
          expireSeconds: 120,
        },
      });

      await submitVerifyCode(data);
      expect(request.post).toHaveBeenCalledWith(
        '/api/v1/accounts/login/verify-code/submit',
        data,
      );
    });
  });

  describe('refreshQrCode', () => {
    it('调用 POST /api/v1/accounts/login/qr-code/refresh', async () => {
      const request = (await import('@/api/request')).default;
      const data = { sessionId: 'session-123' };

      (request.post as ReturnType<typeof vi.fn>).mockResolvedValue({
        code: 0,
        success: true,
        message: 'success',
        data: {
          flow: 'NEED_QR',
          sessionId: 'session-123',
          qrCodeUrl: 'https://example.com/qr-new',
          expireSeconds: 120,
        },
      });

      await refreshQrCode(data);
      expect(request.post).toHaveBeenCalledWith(
        '/api/v1/accounts/login/qr-code/refresh',
        data,
      );
    });
  });

  describe('startAccount', () => {
    it('调用 POST /api/v1/accounts/{id}/start', async () => {
      const request = (await import('@/api/request')).default;

      (request.post as ReturnType<typeof vi.fn>).mockResolvedValue({
        code: 0,
        success: true,
        message: 'success',
        data: null,
      });

      await startAccount('123');
      expect(request.post).toHaveBeenCalledWith('/api/v1/accounts/123/start');
    });
  });

  describe('stopAccount', () => {
    it('调用 POST /api/v1/accounts/{id}/stop', async () => {
      const request = (await import('@/api/request')).default;

      (request.post as ReturnType<typeof vi.fn>).mockResolvedValue({
        code: 0,
        success: true,
        message: 'success',
        data: null,
      });

      await stopAccount('123');
      expect(request.post).toHaveBeenCalledWith('/api/v1/accounts/123/stop');
    });
  });

  describe('deleteAccount', () => {
    it('调用 DELETE /api/v1/accounts/{id}', async () => {
      const request = (await import('@/api/request')).default;

      (request.delete as ReturnType<typeof vi.fn>).mockResolvedValue({
        code: 0,
        success: true,
        message: 'success',
        data: null,
      });

      await deleteAccount('123');
      expect(request.delete).toHaveBeenCalledWith('/api/v1/accounts/123');
    });
  });

  describe('batchStartAccounts', () => {
    it('调用 POST /api/v1/accounts/batch/start', async () => {
      const request = (await import('@/api/request')).default;
      const data = { ids: ['1', '2', '3'] };

      (request.post as ReturnType<typeof vi.fn>).mockResolvedValue({
        code: 0,
        success: true,
        message: 'success',
        data: {
          successCount: 3,
          skippedCount: 0,
        },
      });

      await batchStartAccounts(data);
      expect(request.post).toHaveBeenCalledWith(
        '/api/v1/accounts/batch/start',
        data,
      );
    });
  });

  describe('batchStopAccounts', () => {
    it('调用 POST /api/v1/accounts/batch/stop', async () => {
      const request = (await import('@/api/request')).default;
      const data = { ids: ['1', '2', '3'] };

      (request.post as ReturnType<typeof vi.fn>).mockResolvedValue({
        code: 0,
        success: true,
        message: 'success',
        data: {
          successCount: 3,
          skippedCount: 0,
        },
      });

      await batchStopAccounts(data);
      expect(request.post).toHaveBeenCalledWith(
        '/api/v1/accounts/batch/stop',
        data,
      );
    });
  });

  describe('batchDeleteAccounts', () => {
    it('调用 POST /api/v1/accounts/batch/delete', async () => {
      const request = (await import('@/api/request')).default;
      const data = { ids: ['1', '2', '3'] };

      (request.post as ReturnType<typeof vi.fn>).mockResolvedValue({
        code: 0,
        success: true,
        message: 'success',
        data: {
          successCount: 3,
          skippedCount: 0,
        },
      });

      await batchDeleteAccounts(data);
      expect(request.post).toHaveBeenCalledWith(
        '/api/v1/accounts/batch/delete',
        data,
      );
    });
  });

  describe('reactivateInit', () => {
    it('调用 POST /api/v1/accounts/{id}/reactivate-init 返回预填数据', async () => {
      const request = (await import('@/api/request')).default;
      (request.post as ReturnType<typeof vi.fn>).mockResolvedValue({
        accountId: '42',
        platform: 'douyin',
        phoneNumber: '13800138000',
        nickname: '测试昵称',
      });

      const result = await reactivateInit('42');
      expect(request.post).toHaveBeenCalledWith(
        '/api/v1/accounts/42/reactivate-init',
      );
      expect(result).toEqual({
        accountId: '42',
        platform: 'douyin',
        phoneNumber: '13800138000',
        nickname: '测试昵称',
      });
    });

    it('账号状态不可重激活时抛出业务错误', async () => {
      const request = (await import('@/api/request')).default;
      (request.post as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error('账号当前状态不可重新登录'),
      );

      await expect(reactivateInit('1')).rejects.toThrow(
        '账号当前状态不可重新登录',
      );
    });
  });
});
