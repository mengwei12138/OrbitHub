import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import type { ReactElement } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import request from '@/api/request';

vi.mock('@/api/request', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

const mockedGet = vi.mocked(request.get);

import { useUserStore } from '@/store/modules/userStore';
import EmptyStateCard from '../components/EmptyStateCard';
import WorkDetailModal from '../components/WorkDetailModal';
import WorkFilterTabs from '../components/WorkFilterTabs';
import WorkRow from '../components/WorkListTable/WorkRow';
import MyWorksPage from '../index';
import type { WorkItem } from '../types';

const mockWork: WorkItem = {
  id: '1',
  type: '视频',
  title: '测试作品标题',
  date: '2026-04-20 14:30',
  params: '时长 10 秒 · 720P · 高级质量',
  credits: 340,
  remainingHours: 18,
  thumbnail: 'video',
  videoUrl: 'https://example.com/test.mp4',
};

const mockImageWork: WorkItem = {
  id: '2',
  type: '图文',
  title: '图文作品标题',
  date: '2026-04-19 09:00',
  params: '小红书笔记 · 宣传文案',
  credits: 50,
  remainingHours: 6,
  thumbnail: 'image',
};

const mockExpiringWork: WorkItem = {
  id: '3',
  type: '视频',
  title: '即将过期作品',
  date: '2026-04-18 16:20',
  params: '时长 8 秒 · 720P · 虚拟人物',
  credits: 360,
  remainingHours: 2,
  thumbnail: 'video',
  expiringSoon: true,
};

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

const renderWithRouter = (ui: ReactElement) => {
  const queryClient = createTestQueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>{ui}</BrowserRouter>
    </QueryClientProvider>,
  );
};

describe('MyWorksPage', () => {
  beforeEach(() => {
    mockedGet.mockImplementation((url: string) => {
      if (typeof url === 'string' && url.includes('/works')) {
        return Promise.resolve({ list: [], total: 0 } as never);
      }
      return Promise.resolve(null as never);
    });
    // 默认重置为普通管理员视角；TENANT 视角测试自行覆盖
    useUserStore.setState({ roles: ['NORMAL_ADMIN'] });
  });

  it('应正确渲染页面结构', () => {
    renderWithRouter(<MyWorksPage />);
    expect(screen.getByText('我的作品')).toBeDefined();
    expect(screen.getByText('返回')).toBeDefined();
  });

  it('页面应显示类型筛选', () => {
    renderWithRouter(<MyWorksPage />);
    expect(screen.getByText('全部作品')).toBeDefined();
    expect(screen.getAllByText('视频').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('图文').length).toBeGreaterThanOrEqual(1);
  });

  // 数据隔离（PRD §1.4）：TENANT_ADMIN 视角下页面标题切换为 "团队作品"
  // 由 OpenSpec change content-generation-my-works-data-isolation 引入
  it('TENANT_ADMIN 视角下 PageHeader 显示 "团队作品"', () => {
    useUserStore.setState({ roles: ['TENANT_ADMIN'] });
    renderWithRouter(<MyWorksPage />);
    expect(screen.getByText('团队作品')).toBeDefined();
    // 反向断言：旧标题不再出现
    expect(screen.queryByText('我的作品')).toBeNull();
  });
});

describe('EmptyStateCard', () => {
  it('应正确渲染空状态', () => {
    const onGoHome = vi.fn();
    render(<EmptyStateCard onGoHome={onGoHome} />);
    expect(screen.getByText('还没有作品')).toBeDefined();
    expect(screen.getByText('去首页发起一次生成吧')).toBeDefined();
  });

  it('点击按钮应调用 onGoHome', () => {
    const onGoHome = vi.fn();
    render(<EmptyStateCard onGoHome={onGoHome} />);
    screen.getByText('去首页生成 →').click();
    expect(onGoHome).toHaveBeenCalled();
  });
});

describe('WorkFilterTabs', () => {
  it('应显示所有筛选选项', () => {
    render(<WorkFilterTabs activeTab="all" onChange={vi.fn()} />);
    expect(screen.getByText('全部作品')).toBeDefined();
    expect(screen.getByText('视频')).toBeDefined();
    expect(screen.getByText('图文')).toBeDefined();
  });

  it('应显示警告提示', () => {
    render(<WorkFilterTabs activeTab="all" onChange={vi.fn()} />);
    expect(
      screen.getByText('作品保存 24 小时后自动清理，请注意及时下载'),
    ).toBeDefined();
  });
});

describe('WorkRow', () => {
  const defaultHandlers = {
    onViewDetail: vi.fn(),
    onPublish: vi.fn(),
    onRegenerate: vi.fn(),
  };

  it('应正确渲染视频作品', () => {
    render(<WorkRow work={mockWork} {...defaultHandlers} />);
    expect(screen.getByText('测试作品标题')).toBeDefined();
    expect(screen.getByText('视频')).toBeDefined();
    expect(screen.getByText('2026-04-20 14:30')).toBeDefined();
  });

  it('应正确渲染图文作品', () => {
    render(<WorkRow work={mockImageWork} {...defaultHandlers} />);
    expect(screen.getByText('图文作品标题')).toBeDefined();
    expect(screen.getByText('图文')).toBeDefined();
  });

  it('即将过期作品应显示警告', () => {
    render(<WorkRow work={mockExpiringWork} {...defaultHandlers} />);
    const warnings = screen.getAllByText(/即将过期/u);
    expect(warnings.length).toBeGreaterThan(0);
  });

  it('生成失败作品不应显示剩余保存时间', () => {
    const failedWork: WorkItem = {
      id: '4',
      type: '图文',
      title: '生成失败',
      date: '2026-05-29 14:29:09',
      params: '小红书笔记',
      credits: 0,
      remainingHours: 0,
      thumbnail: 'image',
      status: 'failed',
      failureReason: '当前排队任务已达上限(10个)，请等待部分任务完成后再试',
    };
    render(<WorkRow work={failedWork} {...defaultHandlers} />);
    expect(screen.queryByText(/剩余保存/u)).toBeNull();
    expect(screen.queryByText(/即将过期/u)).toBeNull();
  });

  it('生成中作品不应显示剩余保存时间', () => {
    const processingWork: WorkItem = {
      id: '5',
      type: '视频',
      title: '生成中作品',
      date: '2026-05-29 14:29:09',
      params: '时长 10 秒',
      credits: 100,
      remainingHours: 0,
      thumbnail: 'video',
      status: 'processing',
    };
    render(<WorkRow work={processingWork} {...defaultHandlers} />);
    expect(screen.queryByText(/剩余保存/u)).toBeNull();
  });

  it('点击详情按钮应调用 onViewDetail', () => {
    const onViewDetail = vi.fn();
    render(
      <WorkRow
        work={mockWork}
        onViewDetail={onViewDetail}
        onPublish={vi.fn()}
        onRegenerate={vi.fn()}
      />,
    );
    const buttons = screen.getAllByRole('button');
    const detailBtn = buttons.find((btn) => btn.textContent === '详 情');
    detailBtn?.click();
    expect(onViewDetail).toHaveBeenCalledWith('1');
  });

  it('点击发布按钮应调用 onPublish', () => {
    const onPublish = vi.fn();
    render(
      <WorkRow
        work={mockWork}
        onViewDetail={vi.fn()}
        onPublish={onPublish}
        onRegenerate={vi.fn()}
      />,
    );
    const publishBtn = screen
      .getAllByRole('button')
      .find((btn) => btn.textContent === '发 布');
    publishBtn?.click();
    expect(onPublish).toHaveBeenCalledWith(mockWork);
  });

  it('点击重新生成按钮应调用 onRegenerate', () => {
    const onRegenerate = vi.fn();
    render(
      <WorkRow
        work={mockWork}
        onViewDetail={vi.fn()}
        onPublish={vi.fn()}
        onRegenerate={onRegenerate}
      />,
    );
    const regenerateBtn = screen
      .getAllByRole('button')
      .find((btn) => btn.textContent === '重新生成');
    regenerateBtn?.click();
    expect(onRegenerate).toHaveBeenCalledWith(mockWork);
  });

  // 数据隔离 owner 列：仅 isTenantAdmin=true 时渲染「由 XX 创建」
  // 由 OpenSpec change content-generation-my-works-data-isolation 引入
  it('NORMAL_ADMIN 视角下不渲染 owner 信息', () => {
    const workWithOwner: WorkItem = {
      ...mockWork,
      ownerUserId: '42',
      ownerName: '张三',
    };
    render(
      <WorkRow
        work={workWithOwner}
        {...defaultHandlers}
        isTenantAdmin={false}
      />,
    );
    expect(screen.queryByText(/由 张三 创建/u)).toBeNull();
    expect(screen.queryByTestId('work-row-owner-1')).toBeNull();
  });

  it('TENANT_ADMIN 视角下渲染「由 XX 创建」', () => {
    const workWithOwner: WorkItem = {
      ...mockWork,
      ownerUserId: '42',
      ownerName: '张三',
    };
    render(
      <WorkRow
        work={workWithOwner}
        {...defaultHandlers}
        isTenantAdmin={true}
      />,
    );
    expect(screen.getByTestId('work-row-owner-1')).toBeDefined();
    expect(screen.getByText(/由 张三 创建/u)).toBeDefined();
  });

  it('TENANT_ADMIN 视角但 ownerName 缺失时不渲染 owner 行', () => {
    // 极端兜底：后端字段都没下发时，前端不应出现「由 undefined 创建」之类的脏文本
    render(
      <WorkRow work={mockWork} {...defaultHandlers} isTenantAdmin={true} />,
    );
    expect(screen.queryByTestId('work-row-owner-1')).toBeNull();
  });
});

describe('WorkDetailModal', () => {
  it('传入 work 为 undefined 时不应渲染', () => {
    render(
      <WorkDetailModal
        open={true}
        work={undefined}
        onClose={vi.fn()}
        onRegenerate={vi.fn()}
        onPublish={vi.fn()}
        onDownload={vi.fn()}
      />,
    );
    expect(screen.queryByText('作品详情')).toBeNull();
  });

  it('传入 work 时应正确渲染', () => {
    render(
      <WorkDetailModal
        open={true}
        work={mockWork}
        onClose={vi.fn()}
        onRegenerate={vi.fn()}
        onPublish={vi.fn()}
        onDownload={vi.fn()}
      />,
    );
    expect(screen.getByText('作品详情')).toBeDefined();
    expect(screen.getByText('测试作品标题')).toBeDefined();
    expect(screen.getByText('340')).toBeDefined();
  });

  it('视频类型应显示下载视频按钮', () => {
    render(
      <WorkDetailModal
        open={true}
        work={mockWork}
        onClose={vi.fn()}
        onRegenerate={vi.fn()}
        onPublish={vi.fn()}
        onDownload={vi.fn()}
      />,
    );
    const buttons = screen.getAllByRole('button');
    const downloadBtn = buttons.find((btn) => btn.textContent === '下载视频');
    expect(downloadBtn).toBeDefined();
  });

  it('图文类型应显示下载按钮', () => {
    render(
      <WorkDetailModal
        open={true}
        work={mockImageWork}
        onClose={vi.fn()}
        onRegenerate={vi.fn()}
        onPublish={vi.fn()}
        onDownload={vi.fn()}
      />,
    );
    const buttons = screen.getAllByRole('button');
    const downloadBtn = buttons.find((btn) => btn.textContent === '下 载');
    expect(downloadBtn).toBeDefined();
  });

  it('点击关闭按钮应调用 onClose', () => {
    const onClose = vi.fn();
    render(
      <WorkDetailModal
        open={true}
        work={mockWork}
        onClose={onClose}
        onRegenerate={vi.fn()}
        onPublish={vi.fn()}
        onDownload={vi.fn()}
      />,
    );
    const buttons = screen.getAllByRole('button');
    const closeBtn = buttons.find((btn) => btn.textContent === '关 闭');
    closeBtn?.click();
    expect(onClose).toHaveBeenCalled();
  });

  it('点击重新生成按钮应调用 onRegenerate', () => {
    const onRegenerate = vi.fn();
    render(
      <WorkDetailModal
        open={true}
        work={mockWork}
        onClose={vi.fn()}
        onRegenerate={onRegenerate}
        onPublish={vi.fn()}
        onDownload={vi.fn()}
      />,
    );
    const buttons = screen.getAllByRole('button');
    const regenBtn = buttons.find((btn) => btn.textContent === '重新生成');
    regenBtn?.click();
    expect(onRegenerate).toHaveBeenCalled();
  });

  it('点击去发布按钮应调用 onPublish', () => {
    const onPublish = vi.fn();
    render(
      <WorkDetailModal
        open={true}
        work={mockWork}
        onClose={vi.fn()}
        onRegenerate={vi.fn()}
        onPublish={onPublish}
        onDownload={vi.fn()}
      />,
    );
    const buttons = screen.getAllByRole('button');
    const publishBtn = buttons.find((btn) => btn.textContent === '去发布');
    publishBtn?.click();
    expect(onPublish).toHaveBeenCalled();
  });

  it('点击下载按钮应调用 onDownload', () => {
    const onDownload = vi.fn();
    render(
      <WorkDetailModal
        open={true}
        work={mockWork}
        onClose={vi.fn()}
        onRegenerate={vi.fn()}
        onPublish={vi.fn()}
        onDownload={onDownload}
      />,
    );
    const buttons = screen.getAllByRole('button');
    const downloadBtn = buttons.find((btn) => btn.textContent === '下载视频');
    downloadBtn?.click();
    expect(onDownload).toHaveBeenCalled();
  });
});
