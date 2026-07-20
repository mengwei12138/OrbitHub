import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { WorkItem } from '../../../types';
import WorkDetailModal from '../index';

describe('WorkDetailModal', () => {
  const mockWork: WorkItem = {
    id: '1',
    type: '视频',
    title: '测试视频',
    date: '2024-01-01',
    params: '1080P, 10秒',
    credits: 100,
    remainingHours: 12,
    thumbnail: 'video',
  };

  it('work 为 undefined 时不渲染', () => {
    const { container } = render(
      <WorkDetailModal
        open
        work={undefined}
        onClose={vi.fn()}
        onRegenerate={vi.fn()}
        onPublish={vi.fn()}
        onDownload={vi.fn()}
      />,
    );
    expect(container.firstChild).toBeNull();
  });

  it('open 为 true 时渲染作品详情', () => {
    render(
      <WorkDetailModal
        open
        work={mockWork}
        onClose={vi.fn()}
        onRegenerate={vi.fn()}
        onPublish={vi.fn()}
        onDownload={vi.fn()}
      />,
    );
    expect(screen.getByText('作品详情')).toBeTruthy();
  });

  it('渲染作品标题', () => {
    render(
      <WorkDetailModal
        open
        work={mockWork}
        onClose={vi.fn()}
        onRegenerate={vi.fn()}
        onPublish={vi.fn()}
        onDownload={vi.fn()}
      />,
    );
    expect(screen.getByText('测试视频')).toBeTruthy();
  });

  it('渲染元数据信息', () => {
    render(
      <WorkDetailModal
        open
        work={mockWork}
        onClose={vi.fn()}
        onRegenerate={vi.fn()}
        onPublish={vi.fn()}
        onDownload={vi.fn()}
      />,
    );
    expect(screen.getByText('标题')).toBeTruthy();
    expect(screen.getByText('生成时间')).toBeTruthy();
    expect(screen.getByText('消耗积分')).toBeTruthy();
    expect(screen.getByText('参数')).toBeTruthy();
  });

  it('渲染下载和发布按钮', () => {
    render(
      <WorkDetailModal
        open
        work={mockWork}
        onClose={vi.fn()}
        onRegenerate={vi.fn()}
        onPublish={vi.fn()}
        onDownload={vi.fn()}
      />,
    );
    expect(screen.getByText('下载视频')).toBeTruthy();
    expect(screen.getByText('去发布')).toBeTruthy();
  });

  it('expiringSoon 为 true 时显示警告', () => {
    const expiringWork = { ...mockWork, expiringSoon: true, remainingHours: 2 };
    render(
      <WorkDetailModal
        open
        work={expiringWork}
        onClose={vi.fn()}
        onRegenerate={vi.fn()}
        onPublish={vi.fn()}
        onDownload={vi.fn()}
      />,
    );
    expect(screen.getByText(/⚠ 即将过期/u)).toBeTruthy();
  });
});
