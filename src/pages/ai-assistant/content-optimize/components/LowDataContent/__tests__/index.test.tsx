import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { forwardRef, type ReactNode } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import LowDataContent from '../index';

type MockColumn = {
  title?: ReactNode;
  dataIndex?: string | string[];
  key?: React.Key;
  render?: (
    dom: unknown,
    row: Record<string, unknown>,
    index: number,
    action: unknown,
    schema: unknown,
  ) => ReactNode;
};

const mockData = {
  list: [
    {
      contentId: '1001',
      accountId: '1',
      accountNickname: '潮流玩家',
      platform: 'douyin',
      title: '探店记｜城市里被低估的5家咖啡馆',
      viewCount: '180',
      likeRatePercent: 0.8,
      publishedAt: '2026-04-21T11:15:00Z',
    },
    {
      contentId: '1002',
      accountId: '2',
      accountNickname: '美食探店号A',
      platform: 'xiaohongshu',
      title: '夏装搭配指南',
      viewCount: '450',
      likeRatePercent: 1.5,
    },
  ],
  total: 2,
};

vi.mock('@/services/ai-assistant', () => ({
  lowDataContentsQueryOptions: vi.fn(() => ({
    queryKey: ['ai-assistant', 'content-optimize', 'low-data'],
    queryFn: vi.fn(() => Promise.resolve(mockData)),
  })),
}));

vi.mock('@/components/CustomProTable', () => ({
  default: forwardRef<
    unknown,
    {
      queryOptions?: (pagination: { page: number; pageSize: number }) => {
        queryKey: unknown[];
        queryFn: () => Promise<{ list: unknown[]; total: number }>;
      };
      columns?: MockColumn[];
    }
  >(function LowDataContentTestProTableMock({ columns = [] }, _ref) {
    const actionCol =
      columns.find((c) => c.title === '操作') ??
      columns.find((c) => c.dataIndex === 'action');
    return (
      <div data-testid="low-data-mock-pro-table">
        {mockData.list.map((record, idx) => (
          <div key={String(record.contentId ?? idx)}>
            {actionCol?.render?.(undefined, record, idx, undefined, undefined)}
          </div>
        ))}
      </div>
    );
  }),
}));

describe('LowDataContent', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('渲染筛选区域', () => {
    render(<LowDataContent />);
    expect(screen.getByText('播放量低于')).toBeInTheDocument();
    expect(screen.getByText('点赞率低于')).toBeInTheDocument();
  });

  it('渲染搜索框', () => {
    render(<LowDataContent />);
    expect(screen.getByPlaceholderText('搜索标题/账号')).toBeInTheDocument();
  });

  it('点击「重新筛选」不会回写阈值，只触发 reload', async () => {
    const onThresholdChange = vi.fn();
    render(
      <LowDataContent
        threshold={{ viewMin: 500, likeRateMinPercent: 2 }}
        onThresholdChange={onThresholdChange}
      />,
    );
    fireEvent.click(screen.getByTestId('filter-apply-button'));
    await vi.waitFor(() => {
      expect(onThresholdChange).not.toHaveBeenCalled();
    });
  });

  it('点击「重置」触发 onReset', async () => {
    const onReset = vi.fn();
    render(
      <LowDataContent
        threshold={{ viewMin: 1000, likeRateMinPercent: 5 }}
        defaultThreshold={{ viewMin: 500, likeRateMinPercent: 2 }}
        onReset={onReset}
      />,
    );
    fireEvent.click(screen.getByTestId('filter-reset-button'));
    await waitFor(() => expect(onReset).toHaveBeenCalled());
  });

  it('点击 AI 优化触发回调并传递完整内容对象', async () => {
    const onAIClick = vi.fn();
    render(
      <LowDataContent appliedContentIds={['1002']} onAIClick={onAIClick} />,
    );
    fireEvent.click(screen.getByTestId('ai-optimize-button-1001'));
    await waitFor(() => {
      expect(onAIClick).toHaveBeenCalledWith(
        expect.objectContaining({ contentId: '1001' }),
      );
    });
  });

  it('已应用待发布内容显示「已应用待发布」标记且无操作按钮', async () => {
    render(<LowDataContent appliedContentIds={['1002']} />);
    await waitFor(
      () => expect(screen.getByText('✓ 已应用待发布')).toBeInTheDocument(),
      { timeout: 15_000 },
    );
    expect(
      screen.queryByRole('button', { name: '重新发布' }),
    ).not.toBeInTheDocument();
  }, 20_000);

  it('正在优化的行显示「AI 优化中…」', async () => {
    render(<LowDataContent optimizingContentId="1001" />);
    await waitFor(() =>
      expect(screen.getByText('AI 优化中…')).toBeInTheDocument(),
    );
  });
});
