import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import PublishAllFailedModal from '../index';

vi.mock('@/components', () => ({
  CustomModal: vi.fn(({ open, children }) =>
    open ? <div data-testid="modal">{children}</div> : null,
  ),
}));

describe('PublishAllFailedModal', () => {
  const defaultProps = {
    open: true,
    totalCount: 3,
    failedAccounts: [
      { id: '1', accountName: '抖音-账号A', reason: '网络超时，已重试3次失败' },
      {
        id: '2',
        accountName: '小红书-账号B',
        reason: '账号已失效，请前往账号管理重新扫码',
      },
      {
        id: '3',
        accountName: '抖音-账号C',
        reason: '服务器异常，已重试3次失败',
      },
    ],
    onClose: vi.fn(),
    onViewHistory: vi.fn(),
    onRetry: vi.fn(),
  };

  it('open 为 false 时不渲染', () => {
    const { container } = render(
      <PublishAllFailedModal {...defaultProps} open={false} />,
    );
    expect(container.firstChild).toBeNull();
  });

  it('正确渲染标题', () => {
    render(<PublishAllFailedModal {...defaultProps} />);
    expect(screen.getByText('发布失败')).toBeInTheDocument();
  });

  it('正确渲染副标题', () => {
    render(<PublishAllFailedModal {...defaultProps} />);
    expect(
      screen.getByText('全部 3 个账号发布失败，均已重试3次'),
    ).toBeInTheDocument();
  });

  it('正确渲染所有失败账号', () => {
    render(<PublishAllFailedModal {...defaultProps} />);
    expect(screen.getByText('抖音-账号A')).toBeInTheDocument();
    expect(screen.getByText('小红书-账号B')).toBeInTheDocument();
    expect(screen.getByText('抖音-账号C')).toBeInTheDocument();
  });

  it('正确渲染失败原因', () => {
    render(<PublishAllFailedModal {...defaultProps} />);
    expect(screen.getByText('网络超时，已重试3次失败')).toBeInTheDocument();
    expect(
      screen.getByText('账号已失效，请前往账号管理重新扫码'),
    ).toBeInTheDocument();
    expect(screen.getByText('服务器异常，已重试3次失败')).toBeInTheDocument();
  });

  it('点击查看历史发布按钮触发回调', () => {
    render(<PublishAllFailedModal {...defaultProps} />);
    fireEvent.click(screen.getByText('查看历史发布'));
    expect(defaultProps.onViewHistory).toHaveBeenCalledTimes(1);
  });

  it('点击重新发布按钮触发回调并关闭弹窗', () => {
    render(<PublishAllFailedModal {...defaultProps} />);
    fireEvent.click(screen.getByText('重新发布'));
    expect(defaultProps.onRetry).toHaveBeenCalledTimes(1);
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });

  it('动态显示总数', () => {
    render(<PublishAllFailedModal {...defaultProps} totalCount={5} />);
    expect(
      screen.getByText('全部 5 个账号发布失败，均已重试3次'),
    ).toBeInTheDocument();
  });

  it('单个失败账号时正确显示', () => {
    render(
      <PublishAllFailedModal
        {...defaultProps}
        totalCount={1}
        failedAccounts={[
          { id: '1', accountName: '抖音-账号A', reason: '网络超时' },
        ]}
      />,
    );
    expect(
      screen.getByText('全部 1 个账号发布失败，均已重试3次'),
    ).toBeInTheDocument();
  });
});
