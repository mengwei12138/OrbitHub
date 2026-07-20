import axios, { type AxiosError, type AxiosResponse } from 'axios';

import { useUserStore } from '@/store/modules/userStore';
import { installPrototypeMockAdapter } from '@/prototype/mockApi';
import type { Result } from './types';

const logErrors = (data: Result) => {
  if (!data) return;

  const { errors, message, detail } = data;

  if (errors?.length) {
    const title = message ? `❌ ${message}` : '❌ 错误日志';
    console.group(title);
    errors.forEach((err) => {
      console.error(`  ${err.field}: ${err.message}`);
    });
    console.groupEnd();
    return;
  }

  if (detail) {
    const title = message ? `❌ ${message}` : '❌ 错误日志';
    console.group(title);
    detail.split('\n').forEach((line) => {
      console.error(`  ${line}`);
    });
    console.groupEnd();
  }
};

// 触发跳转到登录页的业务错误码：
// 40108 - 未认证或 Token 已失效（AuthErrorCode.UNAUTHORIZED）
// 60301 - 上游服务认证失败（AdminBizCode.UPSTREAM_AUTH_FAILED）
const AUTH_FAILED_CODES = new Set<number>([40108, 60301]);

const redirectToLogin = () => {
  if (typeof window === 'undefined') return;
  if (window.location.pathname.startsWith('/login')) return;
  localStorage.clear();
  window.location.replace('/login/');
};

const request = axios.create({
  timeout: 0, // timeout AI不可以修改
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

installPrototypeMockAdapter(request);

request.interceptors.request.use(
  (config) => {
    const token = useUserStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    const randomStr = Math.random().toString(36).substring(2, 6);
    const url = config.url ?? '';
    config.url = url.includes('?')
      ? url.replace('?', `?_=${randomStr}&`)
      : `${url}?_=${randomStr}`;
    return config;
  },
  (error) => Promise.reject(error),
);

request.interceptors.response.use(
  <T>(response: AxiosResponse<Result<T>>) => {
    const { success, code, message, data } = response.data ?? {};

    logErrors(response.data);

    const isSuccess = success === true || code === 0;
    if (isSuccess) {
      return data as T;
    }
    if (typeof code === 'number' && AUTH_FAILED_CODES.has(code)) {
      redirectToLogin();
    }
    const err = new Error(message || '请求失败');
    err.code = code;
    return Promise.reject(err);
  },
  (error: AxiosError<Result<unknown>>) => {
    const httpStatus = error.response?.status;
    const code = error.response?.data?.code;
    if (
      httpStatus === 401 ||
      (typeof code === 'number' && AUTH_FAILED_CODES.has(code))
    ) {
      redirectToLogin();
    }
    const message = error.response?.data?.message || error.message;
    const err = new Error(message);
    if (code !== undefined) {
      err.code = code;
    }
    return Promise.reject(err);
  },
);

export default request;
