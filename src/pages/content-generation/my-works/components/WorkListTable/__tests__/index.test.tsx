import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { WorkItem } from '../../../types';
import WorkListTable from '../index';

describe('WorkListTable', () => {
  const onPageChange = vi.fn();
  const tableProps = {
    total: 2,
    page: 1,
    pageSize: 10,
    onPageChange,
    onPublish: vi.fn(),
    onRegenerate: vi.fn(),
  };

  const mockWorks: WorkItem[] = [
    {
      id: '1',
      type: '视频',
      title: '视频作品1',
      date: '2024-01-01',
      params: '1080P, 10秒',
      credits: 100,
      remainingHours: 12,
      thumbnail: 'video',
    },
    {
      id: '2',
      type: '图文',
      title: '图文作品1',
      date: '2024-01-02',
      params: '小红书笔记',
      credits: 50,
      remainingHours: 24,
      thumbnail: 'image',
    },
  ];

  it('渲染作品列表', () => {
    render(
      <WorkListTable
        works={mockWorks}
        {...tableProps}
        onViewDetail={vi.fn()}
      />,
    );
    expect(screen.getByText('视频作品1')).toBeTruthy();
    expect(screen.getByText('图文作品1')).toBeTruthy();
  });

  it('渲染分页组件', () => {
    render(
      <WorkListTable
        works={mockWorks}
        {...tableProps}
        onViewDetail={vi.fn()}
      />,
    );
    expect(document.querySelector('.ant-pagination')).toBeTruthy();
  });

  it('空列表时只渲染分页', () => {
    render(
      <WorkListTable
        works={[]}
        {...tableProps}
        total={0}
        onViewDetail={vi.fn()}
      />,
    );
    expect(document.querySelector('.ant-pagination')).toBeTruthy();
  });
});
