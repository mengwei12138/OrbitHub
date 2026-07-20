import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import request from '@/api/request';

vi.mock('@/api/request', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

const mockedGet = vi.mocked(request.get);

import CreditsRecordPage from '../index';

function renderPage() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <CreditsRecordPage />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('CreditsRecordPage', () => {
  beforeEach(() => {
    mockedGet.mockReset();
    mockedGet.mockResolvedValue({
      list: [
        {
          id: '1',
          createdAt: '2026-05-22 12:00:00',
          companyName: '—',
          accountName: '李四',
          contentType: 'video',
          quality: '标准质量',
          virtualHuman: '否',
          credits: -125,
          trial: false,
          contentTitle: 'std视频生成消耗',
        },
        {
          id: '2',
          createdAt: '2026-05-22 12:00:05',
          companyName: '—',
          accountName: '李四',
          contentType: 'video',
          quality: '—',
          virtualHuman: '否',
          credits: 125,
          trial: false,
          contentTitle: '视频生成失败退款',
        },
      ],
      total: 2,
    } as never);
  });

  it('应展示返回按钮并加载积分流水（默认带最近30天日期范围）', async () => {
    renderPage();

    expect(screen.getByText('返回')).toBeTruthy();
    expect(screen.getByText('积分使用记录')).toBeTruthy();

    await waitFor(() => {
      expect(screen.getByText('std视频生成消耗')).toBeTruthy();
      // 上游消耗流水返回负数，按原始符号展示
      expect(screen.getByText('-125')).toBeTruthy();
      // 上游退款流水返回正数，需保留正号以便与消耗区分（不可再 -Math.abs 强转）
      expect(screen.getByText('视频生成失败退款')).toBeTruthy();
      expect(screen.getByText('+125')).toBeTruthy();
    });
    expect(mockedGet).toHaveBeenCalledWith(
      expect.stringContaining('/api/v1/content-generation/credits/log'),
      expect.objectContaining({
        params: expect.objectContaining({
          page: 1,
          pageSize: 10,
          // 默认筛选「最近30天」，必须带上 startTime/endTime，否则后端无法按筛选分页
          startTime: expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/u),
          endTime: expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/u),
        }),
      }),
    );
    // 默认「全部类型」不传 type，避免后端误判筛选
    const lastCall = mockedGet.mock.calls.at(-1);
    expect(lastCall?.[1]?.params).not.toHaveProperty('type');
  });

  it('切换到「视频生成」后查询时把 type=VIDEO 传给后端', {
    // coverage + 并发下整体导入 / 渲染较慢，初始 waitFor 实测可达 10s+，
    // 留 30s 余量避免环境抖动导致 flaky
    timeout: 30000,
  }, async () => {
    renderPage();
    await waitFor(
      () => {
        expect(screen.getByText('std视频生成消耗')).toBeTruthy();
      },
      { timeout: 15000 },
    );

    // antd Select 的下拉项渲染在 .ant-select-item-option-content 节点里，
    // 直接 getByText('视频生成') 会与表格列里的「视频生成」标签冲突，因此在下拉项里精确匹配。
    const typeSelect = screen.getAllByRole('combobox')[0];
    fireEvent.mouseDown(typeSelect);
    await waitFor(() => {
      const options = document.querySelectorAll<HTMLElement>(
        '.ant-select-item-option-content',
      );
      const target = Array.from(options).find(
        (el) => el.textContent === '视频生成',
      );
      expect(target).toBeTruthy();
      fireEvent.click(target as HTMLElement);
    });
    // antd 默认会在两个汉字之间插入空格，accessibleName 实际是「查 询」
    fireEvent.click(screen.getByRole('button', { name: '查 询' }));

    await waitFor(
      () => {
        const lastCall = mockedGet.mock.calls.at(-1);
        expect(lastCall?.[1]?.params).toMatchObject({ type: 'VIDEO' });
      },
      { timeout: 10000 },
    );
  });
});
