import { act, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { loginMutateMock, isPendingRef } = vi.hoisted(() => ({
  loginMutateMock: vi.fn(),
  isPendingRef: { current: false },
}));

vi.mock('@/services/auth', () => ({
  useLogin: () => ({
    mutate: loginMutateMock,
    get isPending() {
      return isPendingRef.current;
    },
  }),
}));

vi.mock('@/store/modules/userStore', () => ({
  useUserStore: () => ({
    setToken: vi.fn(),
    setUserInfo: vi.fn(),
    setPermissions: vi.fn(),
  }),
}));

vi.mock('../components/ForgotPasswordModal', () => ({
  default: () => null,
}));

vi.mock('../components/AccountRequestModal', () => ({
  default: ({ open }: { open: boolean }) =>
    open ? <div>申请开通账号弹窗</div> : null,
}));

import Login from '../index';

function renderPage() {
  return render(
    <MemoryRouter>
      <Login />
    </MemoryRouter>,
  );
}

async function fillFormAndSubmit() {
  fireEvent.change(screen.getByPlaceholderText('请输入手机号'), {
    target: { value: '13800138000' },
  });
  fireEvent.change(screen.getByPlaceholderText('请输入密码'), {
    target: { value: 'pw' },
  });
  const form = screen
    .getByRole('button', { name: /登\s*录/u })
    .closest('form') as HTMLFormElement;
  await act(async () => {
    fireEvent.submit(form);
  });
}

describe('Login 页面', () => {
  beforeEach(() => {
    loginMutateMock.mockReset();
    isPendingRef.current = false;
  });

  it('正常情况下，单次提交触发 1 次 mutate', async () => {
    renderPage();
    await fillFormAndSubmit();
    expect(loginMutateMock).toHaveBeenCalledTimes(1);
  });

  it('mutation 处于 pending 时，按钮带 disabled 属性', () => {
    isPendingRef.current = true;
    renderPage();
    expect(screen.getByRole('button', { name: /登\s*录/u })).toBeDisabled();
  });

  it('mutation pending 状态下重复提交（绕过按钮 disabled 直接 submit 表单）不会再次触发 mutate', async () => {
    isPendingRef.current = true;
    renderPage();
    // 即便从外部直接派发 submit 事件（模拟 Enter 键 / 自动化点击），
    // handleSubmit 里的 isPending 守卫也应拦下。
    await fillFormAndSubmit();
    expect(loginMutateMock).not.toHaveBeenCalled();
  });

  it('同一 tick 内连续两次提交（isPending 还没翻 true 的毫秒级双击）只触发 1 次 mutate', async () => {
    // 这是 isPending 守卫漏掉的真实场景：mutate 调用是同步的，但 React 把 isPending
    // 翻成 true 是异步的，下一帧才 commit。两次点击之间还在同一个 closure，
    // handleSubmit 里读到的 isPending 都是 false。submittingRef 在同一 tick 内即时生效，
    // 这里在第一次 submit 之后立刻再 submit 一次，验证 ref 守卫拦住第二次。
    renderPage();
    fireEvent.change(screen.getByPlaceholderText('请输入手机号'), {
      target: { value: '13800138000' },
    });
    fireEvent.change(screen.getByPlaceholderText('请输入密码'), {
      target: { value: 'pw' },
    });
    const form = screen
      .getByRole('button', { name: /登\s*录/u })
      .closest('form') as HTMLFormElement;
    await act(async () => {
      fireEvent.submit(form);
      fireEvent.submit(form);
    });
    expect(loginMutateMock).toHaveBeenCalledTimes(1);
  });

  it('点击申请开通账号后，显示申请弹窗', () => {
    renderPage();
    fireEvent.click(screen.getByRole('button', { name: '申请开通账号' }));
    expect(screen.getByText('申请开通账号弹窗')).toBeInTheDocument();
  });
});
