import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import PublishStatusToast from '../index';

describe('PublishStatusToast', () => {
  it('正确渲染默认提示文案', () => {
    render(<PublishStatusToast />);
    expect(screen.getByText('有发布任务正在进行中...')).toBeInTheDocument();
  });

  it('visible 为 false 时不渲染', () => {
    const { container } = render(<PublishStatusToast visible={false} />);
    expect(container.firstChild).toBeNull();
  });

  it('渲染查看链接', () => {
    render(<PublishStatusToast />);
    expect(screen.getByText('查看')).toBeInTheDocument();
  });

  it('点击链接触发回调', () => {
    const onLinkClick = vi.fn();
    render(<PublishStatusToast onLinkClick={onLinkClick} />);

    fireEvent.click(screen.getByText('查看'));
    expect(onLinkClick).toHaveBeenCalledTimes(1);
  });

  it('渲染自定义文案', () => {
    render(<PublishStatusToast message="自定义消息" linkText="跳转" />);
    expect(screen.getByText('自定义消息')).toBeInTheDocument();
    expect(screen.getByText('跳转')).toBeInTheDocument();
  });

  it('渲染 spinner', () => {
    const { container } = render(<PublishStatusToast />);
    const spinner = container.querySelector('[class*="spinner"]');
    expect(spinner).toBeInTheDocument();
  });
});
