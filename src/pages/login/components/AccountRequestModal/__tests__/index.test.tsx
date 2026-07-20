import { act, fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { mutateMock, isPendingRef } = vi.hoisted(() => ({
  mutateMock: vi.fn(),
  isPendingRef: { current: false },
}));

vi.mock('@/services/account-request', () => ({
  useCreateAccountRequest: () => ({
    mutate: mutateMock,
    get isPending() {
      return isPendingRef.current;
    },
  }),
}));

import AccountRequestModal from '../index';

describe('AccountRequestModal', () => {
  beforeEach(() => {
    mutateMock.mockReset();
    isPendingRef.current = false;
  });

  it('填写完整后提交申请', async () => {
    render(<AccountRequestModal open onClose={vi.fn()} />);

    fireEvent.change(screen.getByPlaceholderText('请输入手机号'), {
      target: { value: '13800138000' },
    });
    fireEvent.change(screen.getByPlaceholderText('请输入姓名'), {
      target: { value: '张三' },
    });
    fireEvent.change(screen.getByPlaceholderText('请输入企业名称'), {
      target: { value: '矩阵科技' },
    });

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: '提交申请' }));
    });

    expect(mutateMock).toHaveBeenCalledWith({
      phone: '13800138000',
      realName: '张三',
      company: '矩阵科技',
    });
  });

  it('手机号格式错误时不提交', async () => {
    render(<AccountRequestModal open onClose={vi.fn()} />);

    fireEvent.change(screen.getByPlaceholderText('请输入手机号'), {
      target: { value: '123' },
    });
    fireEvent.change(screen.getByPlaceholderText('请输入姓名'), {
      target: { value: '张三' },
    });

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: '提交申请' }));
    });

    expect(mutateMock).not.toHaveBeenCalled();
  });
});
