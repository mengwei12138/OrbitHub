import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { PublishRecord } from '../types';
import VerifyPanel from '../VerifyPanel';

const submitMutateAsync = vi.fn();
const refreshMutateAsync = vi.fn();

vi.mock('@/services/content', () => ({
  useSubmitVerifyCode: () => ({
    mutateAsync: submitMutateAsync,
    isPending: false,
  }),
  useRefreshQrCode: () => ({
    mutateAsync: refreshMutateAsync,
    isPending: false,
  }),
}));

const smsRecord = (overrides?: Partial<PublishRecord>): PublishRecord => ({
  id: 'rec-1',
  accountName: '抖音号-小明',
  status: 'publishing',
  detail: '等待短信验证码',
  verifyType: 'sms',
  ...overrides,
});

const qrRecord = (overrides?: Partial<PublishRecord>): PublishRecord => ({
  id: 'rec-2',
  accountName: '抖音号-小红',
  status: 'publishing',
  detail: '等待扫码',
  verifyType: 'qr',
  qrCodeSrc: 'https://mock.douyin.com/qr/abc.png',
  ...overrides,
});

const publishingRecord = (id = 'rec-3'): PublishRecord => ({
  id,
  accountName: '普通账号',
  status: 'publishing',
  detail: '上传中',
});

describe('VerifyPanel', () => {
  beforeEach(() => {
    submitMutateAsync.mockReset();
    refreshMutateAsync.mockReset();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('records 中无 verifyType 时不渲染', () => {
    const { container } = render(
      <VerifyPanel records={[publishingRecord()]} />,
    );
    expect(container.firstChild).toBeNull();
  });

  it('SMS 子态：渲染输入框，未满 6 位时提交按钮 disabled', () => {
    render(<VerifyPanel records={[smsRecord()]} />);
    const input = screen.getByTestId('verify-input-rec-1') as HTMLInputElement;
    const submitBtn = screen.getByTestId(
      'verify-submit-rec-1',
    ) as HTMLButtonElement;

    expect(input).toBeInTheDocument();
    expect(submitBtn).toBeDisabled();

    fireEvent.change(input, { target: { value: '12345' } });
    expect(submitBtn).toBeDisabled();

    fireEvent.change(input, { target: { value: '123456' } });
    expect(submitBtn).not.toBeDisabled();
  });

  it('SMS 输入框过滤非数字并截断到 6 位', () => {
    render(<VerifyPanel records={[smsRecord()]} />);
    const input = screen.getByTestId('verify-input-rec-1') as HTMLInputElement;

    fireEvent.change(input, { target: { value: 'a1b2c3d4e5f6g7' } });
    expect(input.value).toBe('123456');
  });

  it('SMS 提交调用 mutation 并传递 recordId / code', async () => {
    submitMutateAsync.mockResolvedValue({ status: 'SMS_VERIFYING' });
    render(<VerifyPanel records={[smsRecord()]} />);
    const input = screen.getByTestId('verify-input-rec-1') as HTMLInputElement;
    const submitBtn = screen.getByTestId('verify-submit-rec-1');

    fireEvent.change(input, { target: { value: '123456' } });
    await act(async () => {
      fireEvent.click(submitBtn);
    });

    expect(submitMutateAsync).toHaveBeenCalledWith({
      recordId: 'rec-1',
      data: { code: '123456' },
    });
  });

  it('SMS 错码（verifyErrorCode=SMS_CODE_ERROR）时清空输入并显示错误', async () => {
    const { rerender } = render(<VerifyPanel records={[smsRecord()]} />);
    const input = screen.getByTestId('verify-input-rec-1') as HTMLInputElement;
    fireEvent.change(input, { target: { value: '999999' } });

    rerender(
      <VerifyPanel
        records={[smsRecord({ verifyErrorCode: 'SMS_CODE_ERROR' })]}
      />,
    );

    await waitFor(() => {
      expect(input.value).toBe('');
      expect(screen.getByTestId('verify-error-rec-1').textContent).toContain(
        '验证码错误',
      );
    });
  });

  it('QR 子态：渲染图片 + 刷新按钮', () => {
    render(<VerifyPanel records={[qrRecord()]} />);
    const img = screen.getByTestId('verify-qr-image-rec-2') as HTMLImageElement;
    expect(img.src).toContain('mock.douyin.com/qr/abc.png');
    expect(screen.getByTestId('verify-qr-refresh-rec-2')).toBeInTheDocument();
  });

  it('QR 刷新按钮点击后 disabled，并展示"刷新中... 30s"', async () => {
    refreshMutateAsync.mockResolvedValue({
      status: 'QR_VERIFY_REQUIRED',
      qrCodeSrc: 'https://mock.douyin.com/qr/new.png',
    });
    render(<VerifyPanel records={[qrRecord()]} />);
    const btn = screen.getByTestId(
      'verify-qr-refresh-rec-2',
    ) as HTMLButtonElement;

    expect(btn).not.toBeDisabled();

    await act(async () => {
      fireEvent.click(btn);
    });

    expect(refreshMutateAsync).toHaveBeenCalledWith({ recordId: 'rec-2' });
    // 立即 disabled 且文案包含倒计时秒数
    expect(btn).toBeDisabled();
    expect(btn.textContent).toMatch(/刷新中.*\ds/u);
  });

  it('QR 刷新失败（QR_REFRESH_TIMEOUT）展示超时文案', async () => {
    refreshMutateAsync.mockRejectedValue(
      new Error('[QR_REFRESH_TIMEOUT] 二维码刷新超时'),
    );
    render(<VerifyPanel records={[qrRecord()]} />);
    const btn = screen.getByTestId('verify-qr-refresh-rec-2');

    await act(async () => {
      fireEvent.click(btn);
    });

    await waitFor(() =>
      expect(screen.getByTestId('verify-error-rec-2').textContent).toContain(
        '刷新超时',
      ),
    );
  });

  it('同时多条 record 验证态时渲染多张卡片', () => {
    render(
      <VerifyPanel records={[smsRecord(), qrRecord(), publishingRecord()]} />,
    );
    expect(screen.getByTestId('verify-card-sms-rec-1')).toBeInTheDocument();
    expect(screen.getByTestId('verify-card-qr-rec-2')).toBeInTheDocument();
  });
});
