import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import type React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockSearchParams: URLSearchParams = new URLSearchParams();
const reactivateInitQueryFn = vi.fn();
const initQrLoginMutateAsync = vi.fn();
let mockLoginStatusData: unknown;

vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn(),
  useSearchParams: () => [mockSearchParams, vi.fn()],
}));

vi.mock('@/services/account', () => ({
  useInitQrLogin: () => ({
    mutate: vi.fn(),
    mutateAsync: initQrLoginMutateAsync,
    isPending: false,
  }),
  useSubmitLoginAuth: () => ({
    mutate: vi.fn(),
    mutateAsync: vi.fn().mockResolvedValue({ status: 'SUCCESS' }),
    isPending: false,
  }),
  useRefreshQrCode: () => ({
    mutate: vi.fn(),
    mutateAsync: vi.fn().mockResolvedValue({
      sessionId: 'test-session-id',
      qrCodeUrl: 'https://example.com/qrcode.png',
      expireSeconds: 40,
    }),
  }),
  useLoginStatus: () => ({
    data: mockLoginStatusData,
  }),
  reactivateInitQueryOptions: (id: string) => ({
    queryKey: ['account', 'reactivate-init', id],
    queryFn: () => reactivateInitQueryFn(id),
    retry: false,
  }),
}));

vi.mock('@tanstack/react-query', async () => {
  const actual = await vi.importActual('@tanstack/react-query');
  return {
    ...actual,
    useQuery: vi.fn((options: { queryKey?: unknown[] }) => {
      const key = Array.isArray(options?.queryKey) ? options.queryKey : [];
      if (key[0] === 'account' && key[1] === 'reactivate-init') {
        return {
          data: {
            accountId: '42',
            platform: 'douyin',
            phoneNumber: '13800000000',
            nickname: '测试账号',
          },
          error: null,
          isLoading: false,
        };
      }
      // 添加账号页新增的 myQuotaStatusQueryOptions：默认放行（unlimited），
      // 避免把 fallback 的 regionData 误判成"配额已用尽"而触发错误 Alert。
      if (key[0] === 'admin-user-quota') {
        return {
          data: {
            personalQuota: -1,
            currentBoundCount: 0,
            available: null,
            unlimited: true,
          },
          error: null,
          isLoading: false,
        };
      }
      return { data: undefined, error: null, isLoading: false };
    }),
  };
});

import AccountAdd from '../index';

const createWrapper = () => {
  const queryClient = new QueryClient();
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('添加账号页', () => {
  beforeEach(() => {
    // 重置 URL 参数为新增模式（不带 mode/accountId）
    for (const k of Array.from(mockSearchParams.keys())) {
      mockSearchParams.delete(k);
    }
    reactivateInitQueryFn.mockReset();
    reactivateInitQueryFn.mockResolvedValue({
      accountId: '42',
      platform: 'douyin',
      phoneNumber: '13800000000',
      nickname: '测试账号',
    });
    initQrLoginMutateAsync.mockReset();
    initQrLoginMutateAsync.mockResolvedValue({
      sessionId: 'test-session-id',
      qrCodeUrl: 'https://example.com/qrcode.png',
      expireSeconds: 40,
      nextAuthStep: 'SMS',
    });
    mockLoginStatusData = undefined;
  });

  it('应渲染添加账号页面', () => {
    render(<AccountAdd />, { wrapper: createWrapper() });
    expect(
      screen.getByRole('heading', { name: '选择平台' }),
    ).toBeInTheDocument();
    expect(screen.queryByText('登录地区')).not.toBeInTheDocument();
    expect(screen.queryByAltText('二维码')).not.toBeInTheDocument();
  });

  it('应展示可用抖音和禁用的小红书平台选项', async () => {
    render(<AccountAdd />, { wrapper: createWrapper() });

    fireEvent.mouseDown(screen.getByLabelText('平台'));

    expect(screen.getByText('抖音')).toBeInTheDocument();
    expect(
      screen.getByText('小红书（因封控原因暂时下线）'),
    ).toBeInTheDocument();
  });

  it('选择抖音后点击下一步才进入扫码步骤', async () => {
    render(<AccountAdd />, { wrapper: createWrapper() });

    fireEvent.mouseDown(screen.getByLabelText('平台'));
    fireEvent.click(screen.getByText('抖音'));
    fireEvent.click(screen.getByRole('button', { name: '下一步' }));

    await waitFor(() => {
      expect(initQrLoginMutateAsync).toHaveBeenCalledWith({
        platform: 'douyin',
        accountId: undefined,
      });
    });

    expect(
      screen.getByRole('heading', { name: '登录认证' }),
    ).toBeInTheDocument();
    expect(screen.getByAltText('二维码')).toBeInTheDocument();
  });

  it('扫码成功后先停留在确认态，点击确认后再进入验证码认证', async () => {
    mockLoginStatusData = {
      status: 'NEED_AUTH',
      nextAuthStep: 'SMS',
      maskedPhone: '138****8000',
      authMessage: null,
    };

    render(<AccountAdd />, { wrapper: createWrapper() });

    fireEvent.mouseDown(screen.getByLabelText('平台'));
    fireEvent.click(screen.getByText('抖音'));
    fireEvent.click(screen.getByRole('button', { name: '下一步' }));

    await waitFor(() => {
      expect(
        screen.getByText('扫码已完成，请确认后进入后续认证'),
      ).toBeInTheDocument();
    });

    expect(
      screen.queryByLabelText('验证码'),
    ).not.toBeInTheDocument();

    fireEvent.click(
      screen.getByRole('button', { name: '确认进入后续认证' }),
    );

    expect(screen.getByLabelText('验证码')).toBeInTheDocument();
  });

  describe('reactivate 模式', () => {
    it('mode=reactivate 且带 accountId 时展示 reactivate 提示', () => {
      mockSearchParams.set('mode', 'reactivate');
      mockSearchParams.set('accountId', '42');

      render(<AccountAdd />, { wrapper: createWrapper() });

      expect(
        screen.getByText(/正在为账号「测试账号」重新登录/u),
      ).toBeInTheDocument();
    });

    it('mode=reactivate 但缺少 accountId 时降级为新增模式', () => {
      mockSearchParams.set('mode', 'reactivate');
      // 刻意不设 accountId

      render(<AccountAdd />, { wrapper: createWrapper() });

      // 新增模式的 Alert 文案保留
      expect(
        screen.getByText(
          '请选择可用平台，点击下一步后进入登录认证；扫码后如有需要，再完成手机号验证码认证。',
        ),
      ).toBeInTheDocument();
    });

    it('新增模式（无 mode 参数）展示新增模式提示', () => {
      render(<AccountAdd />, { wrapper: createWrapper() });

      expect(
        screen.getByText(
          '请选择可用平台，点击下一步后进入登录认证；扫码后如有需要，再完成手机号验证码认证。',
        ),
      ).toBeInTheDocument();
    });
  });
});
