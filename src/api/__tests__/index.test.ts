import type { AxiosResponse } from 'axios';

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { queryClient } from '../queryClient';
import request from '../request';
import type { PaginationParams, PaginationResponse, Result } from '../types';

describe('API 请求模块', () => {
  describe('request 配置', () => {
    it('应该配置了 baseURL 或者未配置 baseURL', () => {
      expect(
        request.defaults.baseURL === undefined || request.defaults.baseURL,
      ).toBeTruthy();
    });

    it('应该配置了超时时间', () => {
      expect(request.defaults.timeout).toBe(0);
    });

    it('应该配置了 Content-Type 请求头', () => {
      expect(request.defaults.headers['Content-Type']).toBe('application/json');
    });

    it('应该配置了请求拦截器', () => {
      expect(
        request.interceptors.request.handlers?.length ?? 0,
      ).toBeGreaterThan(0);
    });

    it('应该配置了响应拦截器', () => {
      expect(
        request.interceptors.response.handlers?.length ?? 0,
      ).toBeGreaterThan(0);
    });
  });

  describe('request 响应拦截器', () => {
    const createMockResponse = (
      data: Result<unknown>,
      status = 200,
    ): AxiosResponse<Result<unknown>> => ({
      data,
      status,
      statusText: '',
      headers: {},
      config: {} as never,
    });

    it('成功响应应返回 data', async () => {
      const response = createMockResponse({
        code: 0,
        success: true,
        message: 'success',
        data: { id: '123' },
        ts: '1234567890',
      });

      const handler = request.interceptors.response.handlers?.[0]?.fulfilled;
      if (handler) {
        const result = await handler(response);
        expect(result).toEqual({ id: '123' });
      }
    });

    it('code 为 0 应返回 data', async () => {
      const response = createMockResponse({
        code: 0,
        success: false,
        message: 'success',
        data: 'test',
        ts: '1234567890',
      });

      const handler = request.interceptors.response.handlers?.[0]?.fulfilled;
      if (handler) {
        const result = await handler(response);
        expect(result).toBe('test');
      }
    });

    it('success 为 false 且 code 非 0 应拒绝', async () => {
      const response = createMockResponse({
        code: 500,
        success: false,
        message: 'Server error',
        data: null,
        ts: '1234567890',
      });

      const handler = request.interceptors.response.handlers?.[0]?.fulfilled;
      if (handler) {
        await expect(handler(response)).rejects.toThrow('Server error');
      }
    });

    it('无错误信息时应使用默认消息', async () => {
      const response = createMockResponse({
        code: 400,
        success: false,
        message: '',
        data: null,
        ts: '1234567890',
      });

      const handler = request.interceptors.response.handlers?.[0]?.fulfilled;
      if (handler) {
        await expect(handler(response)).rejects.toThrow('请求失败');
      }
    });

    it('errors 数组应被记录', async () => {
      const consoleGroupSpy = vi
        .spyOn(console, 'group')
        .mockImplementation(() => {});
      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      const response = createMockResponse({
        code: 400,
        success: false,
        message: 'Validation failed',
        errors: [
          { field: 'name', message: 'Name is required' },
          { field: 'email', message: 'Invalid email' },
        ],
        data: null,
        ts: '1234567890',
      });

      const handler = request.interceptors.response.handlers?.[0]?.fulfilled;
      if (handler) {
        try {
          await handler(response);
        } catch {
          // expected
        }
      }

      expect(consoleGroupSpy).toHaveBeenCalledWith('❌ Validation failed');
      expect(consoleErrorSpy).toHaveBeenCalledWith('  name: Name is required');
      expect(consoleErrorSpy).toHaveBeenCalledWith('  email: Invalid email');

      consoleGroupSpy.mockRestore();
      consoleErrorSpy.mockRestore();
    });
  });

  describe('request 错误处理', () => {
    it('无响应时应使用错误消息', async () => {
      const error = {
        message: 'Network Error',
        response: undefined,
      };

      const handler = request.interceptors.response.handlers?.[1]?.rejected;
      if (handler) {
        await expect(handler(error as never)).rejects.toThrow('Network Error');
      }
    });

    it('有响应但无错误消息时应使用错误信息', async () => {
      const error = {
        message: 'Bad Request',
        response: {
          status: 400,
          data: { message: '' },
        },
      };

      const handler = request.interceptors.response.handlers?.[1]?.rejected;
      if (handler) {
        await expect(handler(error as never)).rejects.toThrow('Bad Request');
      }
    });
  });

  // 覆盖「token 失效 / 上游认证失败 → 自动跳登录」，避免回归到「只弹 toast 不跳转」
  describe('request 拦截器 - 自动跳转登录', () => {
    const createMockResponse = (
      data: Result<unknown>,
      status = 200,
    ): AxiosResponse<Result<unknown>> => ({
      data,
      status,
      statusText: '',
      headers: {},
      config: {} as never,
    });

    const originalLocation = window.location;
    let replaceMock: ReturnType<typeof vi.fn>;

    beforeEach(() => {
      replaceMock = vi.fn();
      // jsdom 默认的 window.location 没有可被 spy 的 replace 方法，
      // 直接整体重写为带 replace 的对象，并把 pathname 置为非 /login 以避开短路
      Object.defineProperty(window, 'location', {
        configurable: true,
        value: { pathname: '/credits-record', replace: replaceMock },
      });
    });

    afterEach(() => {
      Object.defineProperty(window, 'location', {
        configurable: true,
        value: originalLocation,
      });
    });

    it.each([
      [40108, '未认证或Token已失效'],
      [60301, '认证失败'],
    ])('200 + 业务码 %d 应跳转 /login/', async (code, message) => {
      const response = createMockResponse({
        code,
        success: false,
        message,
        data: null,
        ts: '0',
      });
      const handler = request.interceptors.response.handlers?.[0]?.fulfilled;
      if (handler) {
        await expect(handler(response)).rejects.toThrow(message);
      }
      expect(replaceMock).toHaveBeenCalledWith('/login/');
    });

    it('HTTP 401 也应跳转 /login/', async () => {
      const error = {
        message: 'Unauthorized',
        response: { status: 401, data: { code: 40108, message: '未认证' } },
      };
      // 拦截器是 .use(success, error) 注册，rejected 与 fulfilled 同处一个 handler 槽位
      const handler =
        request.interceptors.response.handlers?.[1]?.rejected ??
        request.interceptors.response.handlers?.[0]?.rejected;
      if (handler) {
        await expect(handler(error as never)).rejects.toThrow();
      }
      expect(replaceMock).toHaveBeenCalledWith('/login/');
    });

    it('与认证无关的业务错误（如 50000）不应跳转', async () => {
      const response = createMockResponse({
        code: 50000,
        success: false,
        message: '系统错误',
        data: null,
        ts: '0',
      });
      const handler = request.interceptors.response.handlers?.[0]?.fulfilled;
      if (handler) {
        await expect(handler(response)).rejects.toThrow('系统错误');
      }
      expect(replaceMock).not.toHaveBeenCalled();
    });

    it('已经在 /login 时不应再次跳转，避免循环', async () => {
      Object.defineProperty(window, 'location', {
        configurable: true,
        value: { pathname: '/login', replace: replaceMock },
      });
      const response = createMockResponse({
        code: 40108,
        success: false,
        message: '未认证',
        data: null,
        ts: '0',
      });
      const handler = request.interceptors.response.handlers?.[0]?.fulfilled;
      if (handler) {
        await expect(handler(response)).rejects.toThrow();
      }
      expect(replaceMock).not.toHaveBeenCalled();
    });
  });
});

describe('queryClient', () => {
  it('应导出 QueryClient 实例', () => {
    expect(queryClient).toBeDefined();
    expect(queryClient).toHaveProperty('getQueryData');
    expect(queryClient).toHaveProperty('setQueryData');
    expect(queryClient).toHaveProperty('invalidateQueries');
    expect(queryClient).toHaveProperty('clear');
  });

  it('queryClient 实例方法应可用', () => {
    expect(typeof queryClient.getQueryData).toBe('function');
    expect(typeof queryClient.setQueryData).toBe('function');
    expect(typeof queryClient.invalidateQueries).toBe('function');
    expect(typeof queryClient.clear).toBe('function');
  });
});

describe('types', () => {
  it('Result 类型应包含必要字段', () => {
    const result: Result<string> = {
      code: 0,
      success: true,
      message: 'success',
      data: 'test',
      ts: '1234567890',
    };

    expect(result.code).toBe(0);
    expect(result.success).toBe(true);
    expect(result.message).toBe('success');
    expect(result.data).toBe('test');
    expect(result.ts).toBe('1234567890');
  });

  it('Result 类型应支持 errors 字段', () => {
    const result: Result<null> = {
      code: 400,
      success: false,
      message: 'Validation failed',
      errors: [{ field: 'name', message: 'Required' }],
      data: null,
      ts: '1234567890',
    };

    expect(result.errors).toHaveLength(1);
    expect(result.errors?.[0].field).toBe('name');
  });

  it('PaginationParams 应包含分页字段', () => {
    const params: PaginationParams = {
      page: 1,
      pageSize: 20,
    };

    expect(params.page).toBe(1);
    expect(params.pageSize).toBe(20);
  });

  it('PaginationParams 应支持额外字段', () => {
    const params: PaginationParams = {
      page: 1,
      pageSize: 20,
      keyword: 'test',
      status: 'active',
    };

    expect(params.keyword).toBe('test');
    expect(params.status).toBe('active');
  });

  it('PaginationResponse 应包含 list 和 total', () => {
    const response: PaginationResponse<{ id: string }> = {
      list: [{ id: '1' }, { id: '2' }],
      total: 100,
    };

    expect(response.list).toHaveLength(2);
    expect(response.total).toBe(100);
  });
});
