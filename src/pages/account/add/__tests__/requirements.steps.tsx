import '@testing-library/react/dont-cleanup-after-each';

import { defineFeature } from '@amiceli/vitest-cucumber';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { RenderOptions, RenderResult } from '@testing-library/react';
import {
  cleanup,
  render as rtlRender,
  screen,
  waitFor,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HttpResponse, http } from 'msw';
import { setupServer } from 'msw/node';
import type { ReactElement, ReactNode } from 'react';
import { vi } from 'vitest';
import { useLoginStatus } from '@/services/account';

import AccountAdd from '../index';

function renderWithQueryClient(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) {
  cleanup();
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  }

  return rtlRender(ui, { wrapper: Wrapper, ...options });
}

vi.mock('@/services/account', () => ({
  regionDictionaryQueryOptions: () => ({
    queryKey: ['account', 'regions'],
    queryFn: vi.fn().mockResolvedValue({
      provinces: [
        {
          code: 'CQ',
          name: '重庆',
          isMunicipality: true,
          enabled: true,
          sortOrder: 0,
          cities: [{ code: 'CQ', name: '重庆市', enabled: true, sortOrder: 0 }],
        },
        {
          code: 'GD',
          name: '广东',
          isMunicipality: false,
          enabled: true,
          sortOrder: 1,
          cities: [
            { code: 'SZ', name: '深圳市', enabled: true, sortOrder: 0 },
            { code: 'GZ', name: '广州市', enabled: true, sortOrder: 1 },
          ],
        },
      ],
      defaultCityCode: 'CQ',
      updatedAt: '2024-01-01T00:00:00Z',
    }),
  }),
  useSendVerifyCode: () => ({
    mutate: vi.fn(),
    mutateAsync: vi
      .fn()
      .mockResolvedValue({ requestId: 'test-request-id', countdown: 240 }),
    isPending: false,
  }),
  useSubmitVerifyCode: () => ({
    mutate: vi.fn(),
    mutateAsync: vi.fn().mockResolvedValue({
      success: true,
      flow: 'NEED_QR',
      sessionId: 'test-session-id',
      qrCodeUrl: 'test-qrcode-url',
      expireSeconds: 40,
    }),
    isPending: false,
  }),
  useRefreshQrCode: () => ({
    mutate: vi.fn(),
    mutateAsync: vi
      .fn()
      .mockResolvedValue({ qrCodeUrl: 'new-qrcode-url', expireSeconds: 40 }),
    isPending: false,
  }),
  useLoginStatus: vi.fn(() => ({
    data: { status: 'WAITING_SCAN' },
    refetch: vi.fn(),
  })),
}));

const mockNavigate = vi.fn();

const server = setupServer();

beforeAll(() => {
  server.use(
    http.get('/api/v1/accounts/regions', () =>
      HttpResponse.json({
        success: true,
        data: {
          provinces: [
            {
              code: 'CQ',
              name: '重庆',
              isMunicipality: true,
              enabled: true,
              sortOrder: 0,
              cities: [
                { code: 'CQ', name: '重庆市', enabled: true, sortOrder: 0 },
              ],
            },
            {
              code: 'GD',
              name: '广东',
              isMunicipality: false,
              enabled: true,
              sortOrder: 1,
              cities: [
                { code: 'SZ', name: '深圳市', enabled: true, sortOrder: 0 },
                { code: 'GZ', name: '广州市', enabled: true, sortOrder: 1 },
              ],
            },
          ],
          defaultCityCode: 'CQ',
          updatedAt: '2024-01-01T00:00:00Z',
        },
      }),
    ),
  );
  server.listen();
});
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

defineFeature('./features/requirements.feature', ({ Scenario }) => {
  Scenario('成功添加账号流程', ({ Given, When, Then, And }) => {
    let accountAddView: RenderResult | undefined;

    Given('用户进入添加账号页面', async () => {
      accountAddView = renderWithQueryClient(<AccountAdd />);
      await waitFor(() => {
        expect(
          screen.getByRole('heading', { name: '手机验证' }),
        ).toBeInTheDocument();
      });
    });

    When('选择平台「小红书」', async () => {
      const platformSelect = screen.getByRole('combobox', { name: /平台/u });
      await userEvent.click(platformSelect);
      await userEvent.click(screen.getByText('小红书'));
    });

    And('输入手机号「13800138000」', async () => {
      const phoneInput = screen.getByPlaceholderText('请输入11位手机号');
      await userEvent.type(phoneInput, '13800138000');
    });

    And('点击「获取验证码」', async () => {
      server.use(
        http.post('/api/v1/accounts/login/verify-code', () =>
          HttpResponse.json({ requestId: 'test-request-id', countdown: 240 }),
        ),
      );
      const sendButton = screen.getByText('获取验证码');
      await userEvent.click(sendButton);
    });

    Then('按钮显示倒计时「60s」禁用', async () => {
      await waitFor(() => {
        const sendButton = screen.getByText('60s');
        expect(sendButton.closest('button')).toBeDisabled();
      });
    });

    When('输入收到的验证码', async () => {
      const codeInput = screen.getByPlaceholderText('请输入验证码');
      await userEvent.type(codeInput, '123456');
    });

    And('点击「下一步」', async () => {
      server.use(
        http.post('/api/v1/accounts/login/verify-code/submit', () =>
          HttpResponse.json({
            success: true,
            sessionId: 'test-session-id',
            qrCodeUrl: 'test-qrcode-url',
            expireSeconds: 40,
          }),
        ),
      );
      const nextButton = screen.getByText('下一步 ›');
      await userEvent.click(nextButton);
    });

    Then('验证成功，返回 sessionId 和 qrCodeUrl', async () => {
      await waitFor(() => {
        expect(
          screen.getByRole('heading', { name: '扫码登录' }),
        ).toBeInTheDocument();
      });
    });

    And('进入扫码页，展示二维码', () => {
      expect(
        screen.getByRole('heading', { name: '扫码登录' }),
      ).toBeInTheDocument();
    });

    When('轮询 GET /api/v1/accounts/login/{sessionId}/status', async () => {
      server.use(
        http.get('/api/v1/accounts/login/:sessionId/status', () =>
          HttpResponse.json({ success: true, data: { status: 'SUCCESS' } }),
        ),
      );
      vi.mocked(useLoginStatus).mockReturnValue({
        data: { status: 'SUCCESS' },
        refetch: vi.fn(),
      } as unknown as ReturnType<typeof useLoginStatus>);
      accountAddView?.rerender(<AccountAdd />);
    });

    Then('等待扫码成功', async () => {
      await waitFor(() => {
        expect(screen.getByText('账号添加成功')).toBeInTheDocument();
      });
    });

    When('收到爬虫回调', () => {});

    Then('提示「账号添加成功」', () => {
      expect(screen.getByText('账号添加成功')).toBeInTheDocument();
    });

    And('跳转账号列表', () => {
      expect(mockNavigate).toHaveBeenCalledWith('/account');
    });
  });

  Scenario('手机号格式校验', ({ Given, When, And, Then }) => {
    Given('用户进入添加账号页面', async () => {
      renderWithQueryClient(<AccountAdd />);
      await waitFor(() => {
        expect(
          screen.getByRole('heading', { name: '手机验证' }),
        ).toBeInTheDocument();
      });
    });

    When('输入手机号「123」', async () => {
      const phoneInput = screen.getByPlaceholderText('请输入11位手机号');
      await userEvent.type(phoneInput, '123');
    });

    And('失去焦点（手机号输入框）', async () => {
      const phoneInput = screen.getByPlaceholderText('请输入11位手机号');
      await phoneInput.blur();
    });

    Then('显示错误「手机号格式不正确」', () => {
      expect(screen.getByText('手机号格式不正确')).toBeInTheDocument();
    });
  });

  Scenario('获取验证码-倒计时中禁止重复获取', ({ Given, When, Then }) => {
    Given('用户点击「获取验证码」成功', async () => {
      server.use(
        http.post('/api/v1/accounts/login/verify-code', () =>
          HttpResponse.json({ requestId: 'test-request-id', countdown: 240 }),
        ),
      );
      renderWithQueryClient(<AccountAdd />);
      const sendButton = screen.getByText('获取验证码');
      await userEvent.click(sendButton);
    });

    Then('按钮禁用，显示倒计时', async () => {
      await waitFor(() => {
        const sendButton = screen.getByText('获取验证码');
        expect(sendButton).toBeDisabled();
      });
    });

    When('倒计时未结束', () => {
      const sendButton = screen.getByText('获取验证码');
      expect(sendButton).toBeDisabled();
    });

    Then('不可再次点击获取验证码', () => {
      const sendButton = screen.getByText('获取验证码');
      expect(sendButton).toHaveProperty('disabled', true);
    });
  });

  Scenario('验证码错误不允许下一步', ({ Given, When, And, Then }) => {
    Given('用户获取验证码成功', async () => {
      server.use(
        http.post('/api/v1/accounts/login/verify-code', () =>
          HttpResponse.json({ requestId: 'test-request-id', countdown: 240 }),
        ),
        http.post('/api/v1/accounts/login/verify-code/submit', () =>
          HttpResponse.json(
            { success: false, message: '验证码错误' },
            { status: 400 },
          ),
        ),
      );
      renderWithQueryClient(<AccountAdd />);
    });

    When('输入错误验证码「0000」', async () => {
      const codeInput = screen.getByPlaceholderText('请输入验证码');
      await userEvent.type(codeInput, '0000');
    });

    And('点击「下一步」', async () => {
      const nextButton = screen.getByText('下一步 ›');
      await userEvent.click(nextButton);
    });

    Then('提示 {error.message}', async () => {
      await waitFor(() => {
        expect(screen.getByText('验证码错误')).toBeInTheDocument();
      });
    });

    And('不进入扫码页', () => {
      expect(
        screen.queryByRole('heading', { name: '扫码登录' }),
      ).not.toBeInTheDocument();
    });
  });

  Scenario('二维码过期可刷新', ({ Given, When, Then, And }) => {
    Given('用户在扫码页', () => {
      renderWithQueryClient(<AccountAdd />);
    });

    When('二维码过期', () => {
      expect(screen.getByText('二维码已过期')).toBeInTheDocument();
    });

    Then('显示「二维码已过期」', () => {
      expect(screen.getByText('二维码已过期')).toBeInTheDocument();
    });

    When('点击「刷新二维码」', async () => {
      server.use(
        http.post('/api/v1/accounts/login/qr-code/refresh', () =>
          HttpResponse.json({
            qrCodeUrl: 'new-qrcode-url',
            expireSeconds: 40,
          }),
        ),
      );
      const refreshButton = screen.getByText('刷新二维码');
      await userEvent.click(refreshButton);
    });

    And('调用 POST /api/v1/accounts/login/qr-code/refresh', () => {});

    And('获取新二维码和有效期', () => {
      expect(screen.getByText('刷新二维码')).toBeInTheDocument();
    });
  });

  Scenario('取消添加返回列表', ({ Given, When, Then }) => {
    Given('用户在添加账号页', () => {
      renderWithQueryClient(<AccountAdd />);
    });

    When('点击「取消」', async () => {
      const cancelButton = screen.getByText('取消');
      await userEvent.click(cancelButton);
    });

    Then('跳转账号列表', () => {
      expect(mockNavigate).toHaveBeenCalledWith('/account');
    });
  });

  Scenario('扫码页返回上一步停止轮询', ({ Given, When, Then, And }) => {
    Given('用户在扫码页，正在轮询 sessionId 状态', async () => {
      server.use(
        http.post('/api/v1/accounts/login/verify-code', () =>
          HttpResponse.json({ requestId: 'test-request-id', countdown: 240 }),
        ),
        http.post('/api/v1/accounts/login/verify-code/submit', () =>
          HttpResponse.json({
            success: true,
            flow: 'NEED_QR',
            sessionId: 'test-session-id',
            qrCodeUrl: 'test-qrcode-url',
            expireSeconds: 40,
          }),
        ),
        http.get('/api/v1/accounts/login/:sessionId/status', () =>
          HttpResponse.json({ status: 'WAITING_SCAN' }),
        ),
      );
      renderWithQueryClient(<AccountAdd />);

      const platformSelect = screen.getByRole('combobox', { name: /平台/u });
      await userEvent.click(platformSelect);
      await userEvent.click(screen.getByText('小红书'));

      const phoneInput = screen.getByPlaceholderText('请输入11位手机号');
      await userEvent.type(phoneInput, '13800138000');

      const sendButton = screen.getByText('获取验证码');
      await userEvent.click(sendButton);

      await waitFor(() => {
        expect(screen.getByText('60s').closest('button')).toBeDisabled();
      });

      const codeInput = screen.getByPlaceholderText('请输入验证码');
      await userEvent.type(codeInput, '123456');

      const nextButton = screen.getByText('下一步 ›');
      await userEvent.click(nextButton);

      await waitFor(() => {
        expect(
          screen.getByRole('heading', { name: '扫码登录' }),
        ).toBeInTheDocument();
      });
    });

    When('点击「返回上一步」', async () => {
      const backButton = screen.getByText('返回上一步');
      await userEvent.click(backButton);
    });

    Then('停止轮询 sessionId 状态', async () => {
      await waitFor(() => {
        expect(
          screen.getByRole('heading', { name: '手机验证' }),
        ).toBeInTheDocument();
      });
    });

    And('清理 sessionId 和二维码数据', () => {
      expect(
        screen.queryByRole('heading', { name: '扫码登录' }),
      ).not.toBeInTheDocument();
    });

    And('返回手机验证步骤', () => {
      expect(
        screen.getByRole('heading', { name: '手机验证' }),
      ).toBeInTheDocument();
    });
  });

  Scenario('平台+手机号已存在', ({ Given, When, Then }) => {
    Given('用户输入的账号已存在', async () => {
      renderWithQueryClient(<AccountAdd />);
      const platformSelect = screen.getByRole('combobox', { name: /平台/u });
      await userEvent.click(platformSelect);
      await userEvent.click(screen.getByText('小红书'));
      const phoneInput = screen.getByPlaceholderText('请输入11位手机号');
      await userEvent.type(phoneInput, '13800138000');
    });

    When('点击「获取验证码」', async () => {
      server.use(
        http.post('/api/v1/accounts/login/verify-code', () =>
          HttpResponse.json(
            { message: '该平台下已存在该手机号' },
            { status: 400 },
          ),
        ),
      );
      const sendButton = screen.getByText('获取验证码');
      await userEvent.click(sendButton);
    });

    Then('提示 {error.message}', async () => {
      await waitFor(() => {
        expect(screen.getByText('该平台下已存在该手机号')).toBeInTheDocument();
      });
    });
  });

  Scenario('验证码过期需重新获取', ({ Given, When, Then }) => {
    Given('用户获取验证码后等待超过60秒', () => {
      renderWithQueryClient(<AccountAdd />);
    });

    When('输入验证码并点击「下一步」', async () => {
      server.use(
        http.post('/api/v1/accounts/login/verify-code/submit', () =>
          HttpResponse.json(
            { message: '验证码已过期，请重新获取' },
            { status: 400 },
          ),
        ),
      );
      const codeInput = screen.getByPlaceholderText('请输入验证码');
      await userEvent.type(codeInput, '123456');
      const nextButton = screen.getByText('下一步 ›');
      await userEvent.click(nextButton);
    });

    Then('提示 {error.message}', async () => {
      await waitFor(() => {
        expect(
          screen.getByText('验证码已过期，请重新获取'),
        ).toBeInTheDocument();
      });
    });
  });

  Scenario('服务异常', ({ Given, When, Then }) => {
    Given('用户点击「获取验证码」', async () => {
      server.use(
        http.post('/api/v1/accounts/login/verify-code', () =>
          HttpResponse.json(
            { message: '服务异常，请稍后重试' },
            { status: 500 },
          ),
        ),
      );
      renderWithQueryClient(<AccountAdd />);
      const phoneInput = screen.getByPlaceholderText('请输入11位手机号');
      await userEvent.type(phoneInput, '13800138000');
      const sendButton = screen.getByText('获取验证码');
      await userEvent.click(sendButton);
    });

    When('调用 POST /api/v1/accounts/login/verify-code 返回失败', () => {});

    Then('提示 {error.message}', async () => {
      await waitFor(() => {
        expect(screen.getByText('服务异常，请稍后重试')).toBeInTheDocument();
      });
    });
  });

  Scenario('下一步失败不进入扫码页', ({ Given, When, Then, And }) => {
    Given('用户输入验证码', async () => {
      server.use(
        http.post('/api/v1/accounts/login/verify-code/submit', () =>
          HttpResponse.json(
            { message: '服务异常，请稍后重试' },
            { status: 500 },
          ),
        ),
      );
      renderWithQueryClient(<AccountAdd />);
      const codeInput = screen.getByPlaceholderText('请输入验证码');
      await userEvent.type(codeInput, '123456');
    });

    When('点击「下一步」但爬虫返回失败', async () => {
      const nextButton = screen.getByText('下一步 ›');
      await userEvent.click(nextButton);
    });

    Then('提示错误信息', async () => {
      await waitFor(() => {
        expect(screen.getByText('服务异常，请稍后重试')).toBeInTheDocument();
      });
    });

    And('不进入扫码页', () => {
      expect(
        screen.queryByRole('heading', { name: '扫码登录' }),
      ).not.toBeInTheDocument();
    });
  });

  Scenario('地区必填-未选地区禁止获取验证码', ({ Given, When, And, Then }) => {
    Given('用户未选择登录地区', async () => {
      renderWithQueryClient(<AccountAdd />);
      await waitFor(() => {
        expect(
          screen.getByRole('heading', { name: '手机验证' }),
        ).toBeInTheDocument();
      });
    });

    When('选择平台「小红书」', async () => {
      const platformSelect = screen.getByRole('combobox', { name: /平台/u });
      await userEvent.click(platformSelect);
      await userEvent.click(screen.getByText('小红书'));
    });

    And('输入手机号「13812345678」', async () => {
      const phoneInput = screen.getByPlaceholderText('请输入11位手机号');
      await userEvent.type(phoneInput, '13812345678');
    });

    Then('点击「获取验证码」时提示「请选择登录地区」', async () => {
      server.use(
        http.post('/api/v1/accounts/login/verify-code', () =>
          HttpResponse.json({ message: '请选择登录地区' }, { status: 400 }),
        ),
      );
      const sendButton = screen.getByText('获取验证码');
      await userEvent.click(sendButton);
      await waitFor(() => {
        expect(screen.getByText('请选择登录地区')).toBeInTheDocument();
      });
    });
  });

  Scenario('地区级联选择-先省后辖市', ({ Given, When, And, Then }) => {
    Given('用户进入添加账号页面', async () => {
      renderWithQueryClient(<AccountAdd />);
      await waitFor(() => {
        expect(
          screen.getByRole('heading', { name: '手机验证' }),
        ).toBeInTheDocument();
      });
    });

    When('点击登录地区下拉', async () => {
      const regionSelect = screen.getByPlaceholderText(/请选择省\/市/u);
      await userEvent.click(regionSelect);
    });

    And('选择省份「广东」', async () => {
      await waitFor(() => {
        expect(screen.getByText('广东')).toBeInTheDocument();
      });
      await userEvent.click(screen.getByText('广东'));
    });

    Then('显示城市列表', async () => {
      await waitFor(() => {
        expect(screen.getByText('深圳市')).toBeInTheDocument();
        expect(screen.getByText('广州市')).toBeInTheDocument();
      });
    });

    When('选择城市「深圳市」', async () => {
      await userEvent.click(screen.getByText('深圳市'));
    });

    Then('显示「深圳市」', async () => {
      await waitFor(() => {
        expect(screen.getByText('深圳市')).toBeInTheDocument();
      });
    });
  });

  Scenario('地区级联选择-直辖市直接确定', ({ Given, When, Then, And }) => {
    Given('用户进入添加账号页面', async () => {
      renderWithQueryClient(<AccountAdd />);
      await waitFor(() => {
        expect(
          screen.getByRole('heading', { name: '手机验证' }),
        ).toBeInTheDocument();
      });
    });

    When('点击登录地区下拉', async () => {
      const regionSelect = screen.getByPlaceholderText(/请选择省\/市/u);
      await userEvent.click(regionSelect);
    });

    And('选择直辖市「重庆」', async () => {
      await waitFor(() => {
        expect(screen.getByText('重庆')).toBeInTheDocument();
      });
      await userEvent.click(screen.getByText('重庆'));
    });

    Then('直接显示「重庆」，无需再选城市', async () => {
      await waitFor(() => {
        expect(screen.getByText('重庆')).toBeInTheDocument();
      });
    });
  });
});
