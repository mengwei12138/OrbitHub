import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactNode } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import request from '@/api/request';

import AIAssistantPage from '../index';

vi.mock('@/api/request', () => ({
  default: {
    delete: vi.fn(),
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
  },
}));

const mockedGet = vi.mocked(request.get);
const mockedPost = vi.mocked(request.post);
const mockedDelete = vi.mocked(request.delete);

const renderPage = () => {
  const client = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
    },
  });
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>
      <MemoryRouter>{children}</MemoryRouter>
    </QueryClientProvider>
  );
  return render(<AIAssistantPage />, { wrapper: Wrapper });
};

const installWorkspaceMocks = (options?: { groups?: unknown[] }) => {
  mockedGet.mockImplementation((url: string) => {
    if (url.includes('/workspace/groups')) {
      return Promise.resolve({
        groups:
          options?.groups ??
          [
            {
              id: 'group-001',
              name: '抖音门店咨询',
              accountIds: ['acc-001', 'acc-007'],
              accountCount: 2,
              autoReplyEnabled: true,
              unreadCount: 3,
              hasUrgent: true,
              createdAt: '2026-06-15 09:00:00',
              updatedAt: '2026-06-15 09:00:00',
            },
            {
              id: 'group-002',
              name: '活动咨询跟进',
              accountIds: ['acc-004'],
              accountCount: 1,
              autoReplyEnabled: false,
              unreadCount: 1,
              hasUrgent: false,
              createdAt: '2026-06-15 08:00:00',
              updatedAt: '2026-06-15 08:00:00',
            },
          ],
      } as never);
    }
    if (url.includes('/workspace/accounts')) {
      return Promise.resolve({
        accounts: [
          {
            accountId: 'acc-001',
            nickname: '矩阵号-成都探店',
            platform: 'douyin',
            ownerName: '李运营',
            assignedGroupId: 'group-001',
            assignedGroupName: '抖音门店咨询',
          },
          {
            accountId: 'acc-004',
            nickname: '成都生活方式',
            platform: 'xiaohongshu',
            ownerName: '李运营',
            assignedGroupId: null,
            assignedGroupName: null,
          },
        ],
      } as never);
    }
    if (url.includes('/workspace/conversations')) {
      return Promise.resolve({
        list: [
          {
            id: 'conv-001',
            senderName: 'Naomi WU',
            senderAvatar: null,
            accountId: 'acc-001',
            accountName: '矩阵号-成都探店',
            platform: 'douyin',
            lastMessageText: '我这边现在比较急，麻烦尽快回复。',
            lastMessageAt: '2026-06-15 10:10:00',
            unreadCount: 2,
            isUrgent: true,
          },
          {
            id: 'conv-002',
            senderName: 'Alice L',
            senderAvatar: null,
            accountId: 'acc-007',
            accountName: '抖音-门店活动',
            platform: 'douyin',
            lastMessageText: '当前主推双人到店套餐和新品体验套餐，可根据预算给您推荐。',
            lastMessageAt: '2026-06-15 09:21:00',
            unreadCount: 1,
            isUrgent: false,
          },
          {
            id: 'conv-005',
            senderName: 'Mia Zhou',
            senderAvatar: null,
            accountId: 'acc-007',
            accountName: '抖音-门店活动',
            platform: 'douyin',
            lastMessageText: '周末套餐分为双人体验和家庭组合两档，预算不同可以给您细分推荐。',
            lastMessageAt: '2026-06-15 09:28:00',
            unreadCount: 0,
            isUrgent: false,
          },
        ],
      } as never);
    }
    if (url.includes('/workspace/messages')) {
      return Promise.resolve({
        list: [
          {
            id: 'msg-001',
            conversationId: 'conv-001',
            senderType: 'AI',
            senderName: 'OrbitHub AI',
            text: '您好，欢迎咨询门店活动与营业时间，我可以先为您整理基础信息。',
            createdAt: '2026-06-15 09:42:00',
          },
          {
            id: 'msg-002',
            conversationId: 'conv-001',
            senderType: 'CUSTOMER',
            senderName: 'Naomi WU',
            text: '你好，周末到店有没有活动？',
            createdAt: '2026-06-15 09:48:00',
          },
          {
            id: 'msg-003',
            conversationId: 'conv-001',
            senderType: 'CUSTOMER',
            senderName: 'Naomi WU',
            text: '好的，再告诉我营业时间。',
            createdAt: '2026-06-15 10:05:00',
          },
          {
            id: 'msg-004',
            conversationId: 'conv-001',
            senderType: 'CUSTOMER',
            senderName: 'Naomi WU',
            text: '我这边现在比较急，麻烦尽快回复。',
            createdAt: '2026-06-15 10:10:00',
          },
        ],
      } as never);
    }
    if (url.includes('/knowledge-files')) {
      return Promise.resolve({
        files: [
          {
            id: 'kb-001',
            fileName: '门店FAQ.pdf',
            fileType: 'application/pdf',
            fileSizeBytes: 1024,
            createdAt: '2026-06-15 09:00:00',
            summary: '门店营业时间与活动规则',
          },
        ],
      } as never);
    }
    return Promise.resolve({} as never);
  });
};

describe('AI助手首页工作台', () => {
  beforeEach(() => {
    mockedGet.mockReset();
    mockedPost.mockReset();
    mockedDelete.mockReset();
  });

  afterEach(() => {
    cleanup();
  });

  it('无分组时展示创建引导', async () => {
    installWorkspaceMocks({ groups: [] });
    renderPage();
    expect(
      await screen.findByText('尚未创建任何账号分组。请先创建分组，并将当前管理员已导入账号归组。'),
    ).toBeInTheDocument();
  });

  it('加载成功后展示分组、私信列表与知识库信息', async () => {
    installWorkspaceMocks();
    renderPage();

    expect(await screen.findByText('分组私信工作台')).toBeInTheDocument();
    expect(screen.getByText('抖音门店咨询')).toBeInTheDocument();
    expect(screen.getByText('收到的私信')).toBeInTheDocument();
    expect(screen.getByText('Naomi WU')).toBeInTheDocument();
    expect(screen.getByText('Alice L')).toBeInTheDocument();
    expect(screen.getByText('Mia Zhou')).toBeInTheDocument();
    expect(screen.getByText('知识库')).toBeInTheDocument();
    expect(screen.getByText('账号列表')).toBeInTheDocument();
    expect(screen.getByText('管理知识库')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '编辑分组' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '删除分组' })).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: '创建账号分组' })).toHaveLength(1);
    expect(screen.getAllByText('紧急')).not.toHaveLength(0);
    expect(screen.getAllByText('未读 2')).not.toHaveLength(0);
    expect(screen.getAllByText('未读 1')).not.toHaveLength(0);
  });

  it('点击分组和会话后未读标识仍保持显示', async () => {
    installWorkspaceMocks();
    renderPage();

    await screen.findByText('Naomi WU');
    expect(screen.getAllByText('2')).not.toHaveLength(0);

    await userEvent.click(screen.getByRole('button', { name: /抖音门店咨询/ }));
    await userEvent.click(screen.getByRole('button', { name: /Naomi WU/ }));

    expect(screen.getAllByText('2')).not.toHaveLength(0);
  });

  it('人工发送消息时调用回复接口', async () => {
    installWorkspaceMocks();
    mockedPost.mockResolvedValue(null as never);
    renderPage();

    await screen.findByText('Naomi WU');
    await userEvent.type(
      screen.getByPlaceholderText('输入回复内容，支持人工发送。'),
      '您好，门店周末营业到晚上十点。',
    );
    await userEvent.click(screen.getByRole('button', { name: '发送回复' }));

    await waitFor(() =>
      expect(mockedPost).toHaveBeenCalledWith(
        '/api/v1/ai-assistant/workspace/conversations/conv-001/reply',
        { replyText: '您好，门店周末营业到晚上十点。' },
      ),
    );
  });

  it('点击编辑分组时打开编辑弹窗并回填当前数据', async () => {
    installWorkspaceMocks();
    renderPage();

    await screen.findByText('Naomi WU');
    await userEvent.click(screen.getByRole('button', { name: '编辑分组' }));

    expect(await screen.findByText('编辑账号分组')).toBeInTheDocument();
    expect(screen.getByDisplayValue('抖音门店咨询')).toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: /矩阵号-成都探店/ })).toBeChecked();
  });

  it('点击删除分组时调用删除接口', async () => {
    installWorkspaceMocks();
    mockedDelete.mockResolvedValue(null as never);
    renderPage();

    await screen.findByText('Naomi WU');
    await userEvent.click(screen.getByRole('button', { name: '删除分组' }));
    await userEvent.click(await screen.findByRole('button', { name: '确 定' }));

    await waitFor(() =>
      expect(mockedDelete).toHaveBeenCalledWith(
        '/api/v1/ai-assistant/workspace/groups/group-001',
      ),
    );
  });
});
