import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import PublishResultModal from '../index';

vi.mock('@/components', () => ({
  CustomModal: vi.fn(({ open, children }) =>
    open ? <div data-testid="modal">{children}</div> : null,
  ),
}));

describe('PublishResultModal', () => {
  const defaultProps = {
    open: true,
    successCount: 8,
    failedAccounts: [
      {
        id: '1',
        accountName: '小红书-账号B',
        reason: '图片尺寸不符合平台要求',
      },
      { id: '2', accountName: '抖音-账号D', reason: '视频比例不符合9:16' },
      {
        id: '3',
        accountName: '小红书-账号E',
        reason: '网络超时，已重试3次失败',
      },
      {
        id: '4',
        accountName: '抖音-账号F',
        reason: '账号已失效，请前往账号管理重新扫码',
      },
    ],
    onClose: vi.fn(),
    onViewHistory: vi.fn(),
    onContinuePublish: vi.fn(),
  };

  it('open 为 false 时不渲染', () => {
    const { container } = render(
      <PublishResultModal {...defaultProps} open={false} />,
    );
    expect(container.firstChild).toBeNull();
  });

  it('正确渲染标题', () => {
    render(<PublishResultModal {...defaultProps} />);
    expect(screen.getByText('发布完成')).toBeInTheDocument();
  });

  it('正确渲染成功统计', () => {
    render(<PublishResultModal {...defaultProps} />);
    expect(screen.getByText('成功提交：8 个账号')).toBeInTheDocument();
  });

  it('正确渲染失败统计', () => {
    render(<PublishResultModal {...defaultProps} />);
    expect(screen.getByText('失败：4 个账号')).toBeInTheDocument();
  });

  it('正确渲染失败账号及原因标题', () => {
    render(<PublishResultModal {...defaultProps} />);
    expect(screen.getByText('失败账号及原因：')).toBeInTheDocument();
  });

  it('正确渲染所有失败账号', () => {
    render(<PublishResultModal {...defaultProps} />);
    expect(screen.getByText('小红书-账号B')).toBeInTheDocument();
    expect(screen.getByText('抖音-账号D')).toBeInTheDocument();
    expect(screen.getByText('小红书-账号E')).toBeInTheDocument();
    expect(screen.getByText('抖音-账号F')).toBeInTheDocument();
  });

  it('正确渲染失败原因', () => {
    render(<PublishResultModal {...defaultProps} />);
    expect(screen.getByText('图片尺寸不符合平台要求')).toBeInTheDocument();
    expect(screen.getByText('视频比例不符合9:16')).toBeInTheDocument();
  });

  it('正确渲染警告提示', () => {
    render(<PublishResultModal {...defaultProps} />);
    expect(
      screen.getByText(
        '提示："成功"仅代表内容已提交至平台，部分内容可能正在审核中。',
      ),
    ).toBeInTheDocument();
  });

  it('点击查看历史发布按钮触发回调', () => {
    render(<PublishResultModal {...defaultProps} />);
    fireEvent.click(screen.getByText('查看历史发布'));
    expect(defaultProps.onViewHistory).toHaveBeenCalledTimes(1);
  });

  it('点击继续发布按钮触发回调并关闭弹窗', () => {
    render(<PublishResultModal {...defaultProps} />);
    fireEvent.click(screen.getByText('继续发布'));
    expect(defaultProps.onContinuePublish).toHaveBeenCalledTimes(1);
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });

  it('无失败账号时不渲染失败列表', () => {
    render(<PublishResultModal {...defaultProps} failedAccounts={[]} />);
    expect(screen.queryByText('失败账号及原因：')).not.toBeInTheDocument();
  });

  it('无失败账号时只显示成功统计', () => {
    render(<PublishResultModal {...defaultProps} failedAccounts={[]} />);
    expect(screen.getByText('成功提交：8 个账号')).toBeInTheDocument();
    expect(screen.queryByText('失败：')).not.toBeInTheDocument();
  });
});
