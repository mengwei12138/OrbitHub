import { act, fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import CountdownButton from '../index';

describe('CountdownButton', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('渲染默认文本', () => {
    render(<CountdownButton />);
    expect(
      screen.getByRole('button', { name: '获取验证码' }),
    ).toBeInTheDocument();
  });

  it('渲染自定义文本', () => {
    render(<CountdownButton buttonText="发送验证码" />);
    expect(
      screen.getByRole('button', { name: '发送验证码' }),
    ).toBeInTheDocument();
  });

  it('点击按钮调用 onClick 并开始倒计时', async () => {
    const onClick = vi.fn().mockResolvedValue(true);
    render(<CountdownButton onClick={onClick} />);

    const button = screen.getByRole('button', { name: '获取验证码' });

    await act(async () => {
      fireEvent.click(button);
    });

    expect(onClick).toHaveBeenCalled();
    expect(button).toBeDisabled();
    expect(button).toHaveTextContent('60s');
  });

  it('onClick 返回 number 时以该秒数倒计时', async () => {
    const onClick = vi.fn().mockResolvedValue(240);
    render(<CountdownButton onClick={onClick} duration={60} />);

    const button = screen.getByRole('button', { name: '获取验证码' });

    await act(async () => {
      fireEvent.click(button);
    });

    expect(button).toBeDisabled();
    expect(button).toHaveTextContent('240s');
  });

  it('onClick 返回 false 不开始倒计时', async () => {
    const onClick = vi.fn().mockResolvedValue(false);
    render(<CountdownButton onClick={onClick} />);

    const button = screen.getByRole('button', { name: '获取验证码' });

    await act(async () => {
      fireEvent.click(button);
    });

    expect(onClick).toHaveBeenCalled();
    expect(button).not.toBeDisabled();
  });

  it('倒计时结束后按钮恢复', async () => {
    const onClick = vi.fn().mockResolvedValue(true);
    render(<CountdownButton onClick={onClick} duration={3} />);

    const button = screen.getByRole('button', { name: '获取验证码' });

    await act(async () => {
      fireEvent.click(button);
    });

    expect(button).toBeDisabled();
    expect(button).toHaveTextContent('3s');

    await act(async () => {
      vi.advanceTimersByTime(4000);
    });

    expect(button).not.toBeDisabled();
    expect(button).toHaveTextContent('获取验证码');
  });

  it('disabled 时按钮不可点击', () => {
    render(<CountdownButton disabled />);

    const button = screen.getByRole('button', { name: '获取验证码' });
    expect(button).toBeDisabled();
  });

  it('倒计时中按钮不可点击', async () => {
    const onClick = vi.fn().mockResolvedValue(true);
    render(<CountdownButton onClick={onClick} duration={10} />);

    const button = screen.getByRole('button', { name: '获取验证码' });

    await act(async () => {
      fireEvent.click(button);
    });

    expect(button).toBeDisabled();

    await act(async () => {
      fireEvent.click(button);
    });

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('primary variant 按钮可渲染', () => {
    render(<CountdownButton variant="primary" buttonText="测试按钮" />);
    expect(
      screen.getByRole('button', { name: '测试按钮' }),
    ).toBeInTheDocument();
  });

  it('default variant 按钮可渲染', () => {
    render(<CountdownButton variant="default" buttonText="测试按钮" />);
    expect(
      screen.getByRole('button', { name: '测试按钮' }),
    ).toBeInTheDocument();
  });
});
