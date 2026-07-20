import type { UseQueryResult } from '@tanstack/react-query';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { PublishJobProgressData } from '@/services/content/types';

import PublishProgressModal from '../index';

type PublishJobQueryLike = Pick<
  UseQueryResult<PublishJobProgressData>,
  'data' | 'isLoading'
>;

const { jobDataRef, ts } = vi.hoisted(() => {
  const iso = new Date().toISOString();
  const activeJobProgress: PublishJobProgressData = {
    jobId: 'job-123',
    jobStatus: 'ACTIVE',
    overallPercent: 50,
    totalCount: 2,
    succeededCount: 1,
    failedCount: 0,
    records: [
      {
        recordId: '1',
        accountId: 'acc1',
        stage: 'PUBLISHED',
        percent: 100,
        message: '发布成功（审核中）',
        updatedAt: iso,
      },
      {
        recordId: '2',
        accountId: 'acc2',
        stage: 'UPLOADING',
        percent: 30,
        message: '正在上传',
        updatedAt: iso,
      },
    ],
    updatedAt: iso,
  };

  return {
    ts: iso,
    jobDataRef: {
      current: {
        data: activeJobProgress,
        isLoading: false,
      } satisfies PublishJobQueryLike,
    },
  };
});

vi.mock('@/components', () => ({
  CustomModal: vi.fn(({ open, title, children }) =>
    open ? (
      <div data-testid="modal">
        <div data-testid="modal-title">{title}</div>
        {children}
      </div>
    ) : null,
  ),
  CustomProgress: vi.fn(({ percent }) => (
    <div data-testid="progress" data-percent={percent} />
  )),
}));

vi.mock('@/services/content', () => ({
  usePublishJob: vi.fn(() => jobDataRef.current),
  // content-publish-verify-flow: VerifyPanel 依赖以下 hooks
  useSubmitVerifyCode: vi.fn(() => ({
    mutateAsync: vi.fn(),
    isPending: false,
  })),
  useRefreshQrCode: vi.fn(() => ({ mutateAsync: vi.fn(), isPending: false })),
}));

describe('PublishProgressModal', () => {
  const defaultProps = {
    open: true,
    jobId: 'job-123',
    onClose: vi.fn(),
    onBackgroundRun: vi.fn(),
  };

  it('open 为 false 时不渲染', () => {
    const { container } = render(
      <PublishProgressModal {...defaultProps} open={false} />,
    );
    expect(container.firstChild).toBeNull();
  });

  it('正确渲染标题', () => {
    render(<PublishProgressModal {...defaultProps} />);
    const modalTitle = screen.getByTestId('modal-title');
    expect(within(modalTitle).getByText('发布进度')).toBeInTheDocument();
  });

  it('点击后台运行按钮触发回调', () => {
    render(<PublishProgressModal {...defaultProps} />);
    const modalTitle = screen.getByTestId('modal-title');
    fireEvent.click(within(modalTitle).getByText('后台运行'));
    expect(defaultProps.onBackgroundRun).toHaveBeenCalledTimes(1);
  });

  it('渲染底部提示文案', () => {
    render(<PublishProgressModal {...defaultProps} />);
    expect(screen.getByText(/请勿关闭弹窗/u)).toBeInTheDocument();
  });

  it('jobStatus 为 COMPLETED 时自动触发 onComplete', () => {
    jobDataRef.current = {
      data: {
        jobId: 'job-123',
        jobStatus: 'COMPLETED',
        overallPercent: 100,
        totalCount: 0,
        succeededCount: 0,
        failedCount: 0,
        records: [],
        updatedAt: ts,
      },
      isLoading: false,
    };
    const onComplete = vi.fn();
    render(<PublishProgressModal {...defaultProps} onComplete={onComplete} />);
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it('所有记录处理完成时自动触发 onComplete', () => {
    jobDataRef.current = {
      data: {
        jobId: 'job-123',
        jobStatus: 'ACTIVE',
        overallPercent: 100,
        totalCount: 2,
        succeededCount: 1,
        failedCount: 1,
        records: [
          {
            recordId: '1',
            accountId: 'acc1',
            stage: 'PUBLISHED',
            percent: 100,
            message: '发布成功',
            updatedAt: ts,
          },
          {
            recordId: '2',
            accountId: 'acc2',
            stage: 'FAILED',
            percent: 0,
            message: '发布失败',
            updatedAt: ts,
          },
        ],
        updatedAt: ts,
      },
      isLoading: false,
    };
    const onComplete = vi.fn();
    render(<PublishProgressModal {...defaultProps} onComplete={onComplete} />);
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it('jobStatus 为 ACTIVE 时不触发 onComplete', () => {
    jobDataRef.current = {
      data: {
        jobId: 'job-123',
        jobStatus: 'ACTIVE',
        overallPercent: 0,
        totalCount: 0,
        succeededCount: 0,
        failedCount: 0,
        records: [],
        updatedAt: ts,
      },
      isLoading: false,
    };
    const onComplete = vi.fn();
    render(<PublishProgressModal {...defaultProps} onComplete={onComplete} />);
    expect(onComplete).not.toHaveBeenCalled();
  });
});
