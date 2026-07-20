import { defineFeature } from '@amiceli/vitest-cucumber';
import { useQuery } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import {
  useLoginStatus,
  useRefreshQrCode,
  useSendVerifyCode,
  useSubmitVerifyCode,
} from '@/services/account';

import AccountAdd from '../index';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

vi.mock('@/services/account', () => ({
  useSendVerifyCode: vi.fn(),
  useSubmitVerifyCode: vi.fn(),
  useLoginStatus: vi.fn(),
  useRefreshQrCode: vi.fn(),
  regionDictionaryQueryOptions: vi.fn(() => ({
    queryKey: ['regionDictionary'],
    queryFn: vi.fn(),
  })),
}));

vi.mock('@tanstack/react-query', () => ({
  useQuery: vi.fn(),
}));

const mockMessage = {
  success: vi.fn(),
  error: vi.fn(),
  warning: vi.fn(),
};

vi.mock('antd', async () => {
  const actual = await vi.importActual('antd');
  return {
    ...actual,
    message: mockMessage,
  };
});

const mockRegionData = {
  provinces: [
    {
      code: 'CQ',
      name: '重庆',
      cities: [{ code: 'CQ', name: '重庆市' }],
    },
    {
      code: 'GD',
      name: '广东',
      cities: [
        { code: 'GZ', name: '广州市' },
        { code: 'SZ', name: '深圳市' },
      ],
    },
  ],
  defaultCityCode: 'CQ',
};

defineFeature('./features/test.feature', ({ Scenario }) => {
  Scenario('成功添加账号流程', ({ Given, When, Then, And }) => {
    Given('用户进入添加账号页面', async () => {
      vi.mocked(useQuery).mockReturnValue({
        data: mockRegionData,
        isLoading: false,
      } as unknown as ReturnType<typeof useQuery>);
    });

    When('选择平台「小红书」', async () => {
      render(<AccountAdd />);
      const platformSelect = screen.getByPlaceholderText('请选择平台');
      fireEvent.click(platformSelect);
    });

    And('输入手机号「13800138000」', async () => {
      const phoneInput = screen.getByPlaceholderText('请输入11位手机号');
      fireEvent.change(phoneInput, { target: { value: '13800138000' } });
    });

    And('点击「获取验证码」', async () => {
      vi.mocked(useSendVerifyCode).mockReturnValue({
        mutate: vi.fn(),
        mutateAsync: vi
          .fn()
          .mockResolvedValue({ requestId: 'test-request-id' }),
        isPending: false,
      } as unknown as ReturnType<typeof useSendVerifyCode>);
      const sendButton = screen.getByText('获取验证码');
      fireEvent.click(sendButton);
    });

    Then('按钮显示倒计时「60s」禁用', async () => {
      await waitFor(() => {
        expect(screen.getByText('60s')).toBeInTheDocument();
      });
    });
  });

  Scenario('手机号格式校验-错误格式', ({ Given, When, Then }) => {
    Given('用户进入添加账号页面', async () => {
      vi.mocked(useQuery).mockReturnValue({
        data: mockRegionData,
        isLoading: false,
      } as unknown as ReturnType<typeof useQuery>);
    });

    When('输入手机号「123」', async () => {
      render(<AccountAdd />);
      const phoneInput = screen.getByPlaceholderText('请输入11位手机号');
      fireEvent.change(phoneInput, { target: { value: '123' } });
      fireEvent.blur(phoneInput);
    });

    Then('显示错误「手机号格式不正确」', async () => {
      await waitFor(() => {
        expect(screen.getByText('手机号格式不正确')).toBeInTheDocument();
      });
    });
  });

  Scenario('手机号格式校验-正确格式', ({ Given, When, Then }) => {
    Given('用户进入添加账号页面', async () => {
      vi.mocked(useQuery).mockReturnValue({
        data: mockRegionData,
        isLoading: false,
      } as unknown as ReturnType<typeof useQuery>);
    });

    When('输入手机号「13812345678」', async () => {
      render(<AccountAdd />);
      const phoneInput = screen.getByPlaceholderText('请输入11位手机号');
      fireEvent.change(phoneInput, { target: { value: '13812345678' } });
    });

    Then('无格式错误提示', async () => {
      await waitFor(() => {
        expect(screen.queryByText('手机号格式不正确')).not.toBeInTheDocument();
      });
    });
  });

  Scenario('获取验证码-倒计时中禁止重复获取', ({ Given, When, Then }) => {
    Given('用户点击「获取验证码」成功', async () => {
      vi.mocked(useSendVerifyCode).mockReturnValue({
        mutate: vi.fn(),
        mutateAsync: vi
          .fn()
          .mockResolvedValue({ requestId: 'test-request-id' }),
        isPending: false,
      } as unknown as ReturnType<typeof useSendVerifyCode>);
      vi.mocked(useQuery).mockReturnValue({
        data: mockRegionData,
        isLoading: false,
      } as unknown as ReturnType<typeof useQuery>);
      render(<AccountAdd />);
      const sendButton = screen.getByText('获取验证码');
      fireEvent.click(sendButton);
    });

    When('倒计时未结束', async () => {
      await waitFor(() => {
        expect(screen.getByText('60s')).toBeInTheDocument();
      });
    });

    Then('不可再次点击获取验证码', async () => {
      const button = screen.getByText('60s');
      expect(button.parentElement).toBeDisabled();
    });
  });

  Scenario('验证码错误不允许下一步', ({ Given, When, Then, And }) => {
    Given('用户获取验证码成功', async () => {
      vi.mocked(useSendVerifyCode).mockReturnValue({
        mutate: vi.fn(),
        mutateAsync: vi
          .fn()
          .mockResolvedValue({ requestId: 'test-request-id' }),
        isPending: false,
      } as unknown as ReturnType<typeof useSendVerifyCode>);
      vi.mocked(useQuery).mockReturnValue({
        data: mockRegionData,
        isLoading: false,
      } as unknown as ReturnType<typeof useQuery>);
    });

    When('输入错误验证码「0000」', async () => {
      render(<AccountAdd />);
      const verifyInput = screen.getByPlaceholderText('请输入验证码');
      fireEvent.change(verifyInput, { target: { value: '0000' } });
    });

    And('点击「下一步」', async () => {
      vi.mocked(useSubmitVerifyCode).mockReturnValue({
        mutate: vi.fn(),
        mutateAsync: vi.fn().mockRejectedValue({ message: '验证码错误' }),
        isPending: false,
      } as unknown as ReturnType<typeof useSubmitVerifyCode>);
      const nextButton = screen.getByText('下一步 ›');
      fireEvent.click(nextButton);
    });

    Then('提示验证码错误', async () => {
      await waitFor(() => {
        expect(mockMessage.error).toHaveBeenCalledWith('验证码错误');
      });
    });

    And('不进入扫码页', async () => {
      expect(screen.queryByText('扫码登录')).not.toBeInTheDocument();
    });
  });

  Scenario('二维码过期可刷新', ({ Given, When, Then }) => {
    Given('用户在扫码页', async () => {
      vi.mocked(useSubmitVerifyCode).mockReturnValue({
        mutate: vi.fn(),
        mutateAsync: vi.fn().mockResolvedValue({
          success: true,
          flow: 'NEED_QR',
          sessionId: 'test-session-id',
          qrCodeUrl: 'http://example.com/qr.png',
          expireSeconds: 40,
        }),
        isPending: false,
      } as unknown as ReturnType<typeof useSubmitVerifyCode>);
      vi.mocked(useLoginStatus).mockReturnValue({
        data: { status: 'PENDING' },
        isLoading: false,
      } as unknown as ReturnType<typeof useLoginStatus>);
      vi.mocked(useQuery).mockReturnValue({
        data: mockRegionData,
        isLoading: false,
      } as unknown as ReturnType<typeof useQuery>);
    });

    When('二维码过期', async () => {});

    Then('显示「二维码已过期」', async () => {
      await waitFor(() => {
        expect(
          screen.getByText('二维码已过期，请刷新重试'),
        ).toBeInTheDocument();
      });
    });

    When('点击「刷新二维码」', async () => {
      vi.mocked(useRefreshQrCode).mockReturnValue({
        mutate: vi.fn(),
        mutateAsync: vi.fn().mockResolvedValue({
          qrCodeUrl: 'http://example.com/qr2.png',
          expireSeconds: 40,
        }),
        isPending: false,
      } as unknown as ReturnType<typeof useRefreshQrCode>);
      const refreshButton = screen.getByText('刷新二维码');
      fireEvent.click(refreshButton);
    });

    Then('获取新二维码和有效期', async () => {
      await waitFor(() => {
        expect(useRefreshQrCode).toHaveBeenCalled();
      });
    });
  });

  Scenario('取消添加返回列表', ({ Given, When, Then }) => {
    Given('用户在添加账号页', async () => {
      vi.mocked(useQuery).mockReturnValue({
        data: mockRegionData,
        isLoading: false,
      } as unknown as ReturnType<typeof useQuery>);
      render(<AccountAdd />);
    });

    When('点击「取消」', async () => {
      const cancelButton = screen.getByText('取消');
      fireEvent.click(cancelButton);
    });

    Then('跳转账号列表', async () => {
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/account');
      });
    });
  });

  Scenario('扫码页返回上一步停止轮询', ({ Given, When, Then, And }) => {
    Given('用户在扫码页，正在轮询sessionId状态', async () => {
      vi.mocked(useLoginStatus).mockReturnValue({
        data: { status: 'PENDING' },
        isLoading: true,
        refetch: vi.fn(),
      } as unknown as ReturnType<typeof useLoginStatus>);
    });

    When('点击「返回上一步」', async () => {
      const backButton = screen.getByText('返回上一步');
      fireEvent.click(backButton);
    });

    Then('停止轮询sessionId状态', async () => {
      await waitFor(() => {
        expect(useLoginStatus).toHaveBeenCalledWith(
          'test-session-id',
          expect.objectContaining({ enabled: false }),
        );
      });
    });

    And('返回手机验证步骤', async () => {
      expect(screen.getByText('手机验证')).toBeInTheDocument();
    });
  });

  Scenario('平台+手机号已存在', ({ Given, When, Then }) => {
    Given('用户输入的账号已存在', async () => {
      vi.mocked(useSendVerifyCode).mockReturnValue({
        mutate: vi.fn(),
        mutateAsync: vi.fn().mockRejectedValue({
          message: '该平台下已存在该手机号',
        }),
        isPending: false,
      } as unknown as ReturnType<typeof useSendVerifyCode>);
      vi.mocked(useQuery).mockReturnValue({
        data: mockRegionData,
        isLoading: false,
      } as unknown as ReturnType<typeof useQuery>);
      render(<AccountAdd />);
    });

    When('点击「获取验证码」', async () => {
      const sendButton = screen.getByText('获取验证码');
      fireEvent.click(sendButton);
    });

    Then('提示「该平台下已存在该手机号」', async () => {
      await waitFor(() => {
        expect(mockMessage.error).toHaveBeenCalledWith(
          '该平台下已存在该手机号',
        );
      });
    });
  });

  Scenario('验证码过期需重新获取', ({ Given, When, Then }) => {
    Given('用户获取验证码后等待超过60秒', async () => {
      vi.mocked(useSubmitVerifyCode).mockReturnValue({
        mutate: vi.fn(),
        mutateAsync: vi
          .fn()
          .mockRejectedValue({ message: '验证码已过期，请重新获取' }),
        isPending: false,
      } as unknown as ReturnType<typeof useSubmitVerifyCode>);
      vi.mocked(useQuery).mockReturnValue({
        data: mockRegionData,
        isLoading: false,
      } as unknown as ReturnType<typeof useQuery>);
      render(<AccountAdd />);
    });

    When('输入验证码并点击「下一步」', async () => {
      const verifyInput = screen.getByPlaceholderText('请输入验证码');
      fireEvent.change(verifyInput, { target: { value: '123456' } });
      const nextButton = screen.getByText('下一步 ›');
      fireEvent.click(nextButton);
    });

    Then('提示「验证码已过期，请重新获取」', async () => {
      await waitFor(() => {
        expect(mockMessage.error).toHaveBeenCalledWith(
          '验证码已过期，请重新获取',
        );
      });
    });
  });

  Scenario('服务异常', ({ Given, When, Then }) => {
    Given('用户点击「获取验证码」', async () => {
      vi.mocked(useSendVerifyCode).mockReturnValue({
        mutate: vi.fn(),
        mutateAsync: vi
          .fn()
          .mockRejectedValue({ message: '服务异常，请稍后重试' }),
        isPending: false,
      } as unknown as ReturnType<typeof useSendVerifyCode>);
      vi.mocked(useQuery).mockReturnValue({
        data: mockRegionData,
        isLoading: false,
      } as unknown as ReturnType<typeof useQuery>);
      render(<AccountAdd />);
    });

    When('调用POST /api/v1/accounts/login/verify-code返回失败', async () => {
      const sendButton = screen.getByText('获取验证码');
      fireEvent.click(sendButton);
    });

    Then('提示「服务异常，请稍后重试」', async () => {
      await waitFor(() => {
        expect(mockMessage.error).toHaveBeenCalledWith('服务异常，请稍后重试');
      });
    });
  });

  Scenario('下一步失败不进入扫码页', ({ Given, When, Then, And }) => {
    Given('用户输入验证码', async () => {
      vi.mocked(useSubmitVerifyCode).mockReturnValue({
        mutate: vi.fn(),
        mutateAsync: vi.fn().mockRejectedValue({ message: '验证失败' }),
        isPending: false,
      } as unknown as ReturnType<typeof useSubmitVerifyCode>);
      vi.mocked(useQuery).mockReturnValue({
        data: mockRegionData,
        isLoading: false,
      } as unknown as ReturnType<typeof useQuery>);
      render(<AccountAdd />);
    });

    When('点击「下一步」但爬虫返回失败', async () => {
      const verifyInput = screen.getByPlaceholderText('请输入验证码');
      fireEvent.change(verifyInput, { target: { value: '123456' } });
      const nextButton = screen.getByText('下一步 ›');
      fireEvent.click(nextButton);
    });

    Then('提示错误信息', async () => {
      await waitFor(() => {
        expect(mockMessage.error).toHaveBeenCalledWith('验证失败');
      });
    });

    And('不进入扫码页', async () => {
      expect(screen.queryByText('扫码登录')).not.toBeInTheDocument();
    });
  });

  Scenario('添加账号-步骤指示器', ({ Given, When, Then }) => {
    Given('用户在添加账号Step1页', async () => {
      vi.mocked(useQuery).mockReturnValue({
        data: mockRegionData,
        isLoading: false,
      } as unknown as ReturnType<typeof useQuery>);
      render(<AccountAdd />);
    });

    When('观察步骤指示器', async () => {});

    Then('显示「1 Phone Verification → 2 Scan Code Login」', async () => {
      await waitFor(() => {
        expect(screen.getByText('手机验证')).toBeInTheDocument();
        expect(screen.getByText('扫码登录')).toBeInTheDocument();
      });
    });
  });

  Scenario('上一步返回保留已填信息', ({ Given, When, Then, And }) => {
    Given('用户在扫码登录页(Step2)', async () => {
      vi.mocked(useSubmitVerifyCode).mockReturnValue({
        mutate: vi.fn(),
        mutateAsync: vi.fn().mockResolvedValue({
          success: true,
          flow: 'NEED_QR',
          sessionId: 'test-session-id',
          qrCodeUrl: 'http://example.com/qr.png',
          expireSeconds: 40,
        }),
        isPending: false,
      } as unknown as ReturnType<typeof useSubmitVerifyCode>);
      vi.mocked(useLoginStatus).mockReturnValue({
        data: { status: 'PENDING' },
        isLoading: false,
      } as unknown as ReturnType<typeof useLoginStatus>);
      vi.mocked(useQuery).mockReturnValue({
        data: mockRegionData,
        isLoading: false,
      } as unknown as ReturnType<typeof useQuery>);
    });

    When('点击「返回上一步」', async () => {
      const backButton = screen.getByText('返回上一步');
      fireEvent.click(backButton);
    });

    Then('返回Step1', async () => {
      await waitFor(() => {
        expect(screen.getByText('手机验证')).toBeInTheDocument();
      });
    });

    And('保留已填写的手机号和验证码', async () => {
      const phoneInput = screen.getByDisplayValue('13800138000');
      expect(phoneInput).toBeInTheDocument();
    });
  });

  Scenario('Step1未填写禁用下一步', ({ Given, When, Then }) => {
    Given('用户在添加账号表单', async () => {
      vi.mocked(useQuery).mockReturnValue({
        data: mockRegionData,
        isLoading: false,
      } as unknown as ReturnType<typeof useQuery>);
      render(<AccountAdd />);
    });

    When('未填写手机号或验证码', async () => {});

    Then('「下一步」按钮禁用', async () => {
      const nextButton = screen.getByText('下一步 ›');
      expect(nextButton).toBeDisabled();
    });
  });

  Scenario('二维码刷新后倒计时重置', ({ Given, When, Then }) => {
    Given('二维码展示中', async () => {
      vi.mocked(useRefreshQrCode).mockReturnValue({
        mutate: vi.fn(),
        mutateAsync: vi.fn().mockResolvedValue({
          qrCodeUrl: 'http://example.com/qr2.png',
          expireSeconds: 40,
        }),
        isPending: false,
      } as unknown as ReturnType<typeof useRefreshQrCode>);
    });

    When('点击「刷新二维码」', async () => {
      const refreshButton = screen.getByText('刷新二维码');
      fireEvent.click(refreshButton);
    });

    Then('倒计时重置为初始值', async () => {
      await waitFor(() => {
        expect(screen.getByText('2:00')).toBeInTheDocument();
      });
    });
  });

  Scenario('二维码超时后需刷新', ({ Given, When, Then, And }) => {
    Given('二维码已超时', async () => {});

    When('等待倒计时结束', async () => {});

    Then('提示二维码已过期', async () => {
      await waitFor(() => {
        expect(
          screen.getByText('二维码已过期，请刷新重试'),
        ).toBeInTheDocument();
      });
    });

    And('需刷新获取新二维码', async () => {
      expect(screen.getByText('刷新二维码')).toBeInTheDocument();
    });
  });

  Scenario('地区选择-默认选中', ({ Given, When, Then }) => {
    Given('用户进入添加账号页面', async () => {
      vi.mocked(useQuery).mockReturnValue({
        data: mockRegionData,
        isLoading: false,
      } as unknown as ReturnType<typeof useQuery>);
      render(<AccountAdd />);
    });

    When('观察表单字段', async () => {});

    Then('默认选中配置中第一个地区（如「重庆」）', async () => {
      await waitFor(() => {
        expect(screen.getByText('重庆市')).toBeInTheDocument();
      });
    });
  });

  Scenario('地区级联选择-先省后市', ({ Given, When, Then, And }) => {
    Given('添加账号页，地区选择器已展示', async () => {
      vi.mocked(useQuery).mockReturnValue({
        data: mockRegionData,
        isLoading: false,
      } as unknown as ReturnType<typeof useQuery>);
      render(<AccountAdd />);
    });

    When('点击「登录地区」下拉', async () => {
      const regionSelect = screen.getByPlaceholderText(
        '请选择省/市（默认重庆）',
      );
      fireEvent.click(regionSelect);
    });

    And('选择「广东」省份', async () => {
      const guangdongOption = screen.getByText('广东');
      fireEvent.click(guangdongOption);
    });

    And('在城市列表中选择「深圳市」', async () => {
      const shenzhenOption = screen.getByText('深圳市');
      fireEvent.click(shenzhenOption);
    });

    Then('最终显示「深圳市」', async () => {
      await waitFor(() => {
        expect(screen.getByDisplayValue('深圳市')).toBeInTheDocument();
      });
    });
  });

  Scenario('地区必填-未选地区禁止获取验证码', ({ Given, When, Then, And }) => {
    Given('添加账号页，清空地区选择', async () => {
      vi.mocked(useQuery).mockReturnValue({
        data: mockRegionData,
        isLoading: false,
      } as unknown as ReturnType<typeof useQuery>);
      render(<AccountAdd />);
    });

    When('输入手机号「13812345678」', async () => {
      const phoneInput = screen.getByPlaceholderText('请输入11位手机号');
      fireEvent.change(phoneInput, { target: { value: '13812345678' } });
    });

    And('点击「获取验证码」', async () => {
      const sendButton = screen.getByText('获取验证码');
      fireEvent.click(sendButton);
    });

    Then('提示「请选择登录地区」', async () => {
      await waitFor(() => {
        expect(mockMessage.error).toHaveBeenCalledWith('请选择登录地区');
      });
    });

    And('阻止获取验证码', async () => {
      expect(useSendVerifyCode).not.toHaveBeenCalled();
    });
  });
});
