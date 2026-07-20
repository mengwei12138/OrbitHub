import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@/services/content-generation', () => ({
  workDetailQueryOptions: (workId: string | null) => ({
    queryKey: ['content-generation', 'works', 'detail', workId],
    queryFn: async () => ({
      id: 'w1',
      type: 'video',
      title: '测试作品',
      createdAt: '2026-05-23 10:00:00',
      status: 'completed',
      paramsSummary: '10秒 · 720P',
      credits: 100,
      remainingHours: 12,
      videoUrl: 'https://example.com/v.mp4',
    }),
    enabled: !!workId,
  }),
  mapWorkDetailToItem: (dto: {
    id: string;
    type: string;
    title: string;
    createdAt: string;
    paramsSummary?: string;
    credits?: number;
    remainingHours?: number;
    videoUrl?: string;
    status?: string;
  }) => ({
    id: dto.id,
    type: dto.type === 'video' ? '视频' : '图文',
    title: dto.title,
    date: dto.createdAt,
    params: dto.paramsSummary ?? '',
    credits: dto.credits ?? 0,
    remainingHours: dto.remainingHours ?? 0,
    thumbnail: 'video' as const,
    status: dto.status as 'completed',
    videoUrl: dto.videoUrl,
  }),
}));

import WorkDetailPage from '../index';

const renderPage = () => {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={['/content-generation/works/w1']}>
        <Routes>
          <Route
            path="/content-generation/works/:workId"
            element={<WorkDetailPage />}
          />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
};

describe('WorkDetailPage', () => {
  it('渲染作品详情标题与元数据', async () => {
    renderPage();
    expect(await screen.findByText('作品详情')).toBeTruthy();
    expect(await screen.findByText('测试作品')).toBeTruthy();
    expect(screen.getByText('下载视频')).toBeTruthy();
    expect(screen.getByText('去发布')).toBeTruthy();
  });
});
