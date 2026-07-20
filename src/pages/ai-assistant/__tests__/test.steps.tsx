import '@testing-library/react/dont-cleanup-after-each';

import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { defineFeature } from '@amiceli/vitest-cucumber';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, expect, vi } from 'vitest';

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

const featurePath = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  '../features/test.feature',
);

const renderPage = () => {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  });
  return render(
    <QueryClientProvider client={client}>
      <AIAssistantPage />
    </QueryClientProvider>,
  );
};

const installMocks = (withGroup = true) => {
  mockedGet.mockImplementation((url: string) => {
    if (url.includes('/workspace/groups')) {
      return Promise.resolve({
        groups: withGroup
          ? [
              {
                id: 'group-001',
                name: '抖音门店咨询',
                accountIds: ['acc-001'],
                accountCount: 1,
                autoReplyEnabled: true,
                unreadCount: 1,
                hasUrgent: true,
                createdAt: '2026-06-15 09:00:00',
                updatedAt: '2026-06-15 09:00:00',
              },
            ]
          : [],
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
            assignedGroupId: withGroup ? 'group-001' : null,
            assignedGroupName: withGroup ? '抖音门店咨询' : null,
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
            lastMessageAt: '2026-06-15 10:00:00',
            unreadCount: 1,
            isUrgent: true,
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
            senderType: 'CUSTOMER',
            senderName: 'Naomi WU',
            text: '请发一下活动信息',
            createdAt: '2026-06-15 09:50:00',
          },
          {
            id: 'msg-002',
            conversationId: 'conv-001',
            senderType: 'CUSTOMER',
            senderName: 'Naomi WU',
            text: '再告诉我活动时间。',
            createdAt: '2026-06-15 09:55:00',
          },
          {
            id: 'msg-003',
            conversationId: 'conv-001',
            senderType: 'CUSTOMER',
            senderName: 'Naomi WU',
            text: '我这边现在比较急，麻烦尽快回复。',
            createdAt: '2026-06-15 10:00:00',
          },
        ],
      } as never);
    }
    if (url.includes('/knowledge-files')) {
      return Promise.resolve({ files: [] } as never);
    }
    return Promise.resolve({} as never);
  });
};

defineFeature(featurePath, ({ Scenario }) => {
  beforeEach(() => {
    cleanup();
    mockedGet.mockReset();
    mockedPost.mockReset();
  });

  afterEach(() => {
    cleanup();
  });

  Scenario('无分组时显示创建引导', ({ Given, When, Then }) => {
    Given('AI助手分组接口返回空列表', () => {
      installMocks(false);
    });
    When('打开AI助手首页', () => {
      renderPage();
    });
    Then('页面显示创建账号分组引导', async () => {
      expect(
        await screen.findByText('尚未创建任何账号分组。请先创建分组，并将当前管理员已导入账号归组。'),
      ).toBeInTheDocument();
    });
  });

  Scenario('已有分组时展示三栏工作区', ({ Given, When, Then, And }) => {
    Given('AI助手接口返回一个账号分组和对应私信数据', () => {
      installMocks(true);
    });
    When('打开AI助手首页', () => {
      renderPage();
    });
    Then('页面显示私信列表', async () => {
      expect(await screen.findByText('收到的私信')).toBeInTheDocument();
    });
    And('页面显示聊天框', async () => {
      expect(await screen.findByRole('button', { name: '发送回复' })).toBeInTheDocument();
    });
    And('页面显示分组知识库入口', async () => {
      expect(await screen.findByText('管理知识库')).toBeInTheDocument();
    });
  });

  Scenario('分组与会话未读标识常亮', ({ Given, When, Then, And }) => {
    Given('AI助手接口返回带未读数的分组和私信数据', () => {
      installMocks(true);
    });
    When('打开AI助手首页并点击一个私信会话', async () => {
      renderPage();
      await screen.findByText('Naomi WU');
      await userEvent.click(screen.getByRole('button', { name: /Naomi WU/ }));
    });
    Then('分组未读标识仍然显示', async () => {
      expect(await screen.findAllByText('未读 1')).not.toHaveLength(0);
    });
    And('会话未读标识仍然显示', async () => {
      expect(await screen.findAllByText('未读 1')).not.toHaveLength(0);
    });
  });

  Scenario('左栏显示紧急会话标识', ({ Given, When, Then }) => {
    Given('某个私信会话最近连续三条消息都来自客户', () => {
      installMocks(true);
    });
    When('打开AI助手首页', () => {
      renderPage();
    });
    Then('页面显示紧急标识', async () => {
      expect(await screen.findByText('紧急')).toBeInTheDocument();
    });
  });

  Scenario('右栏显示分组管理入口', ({ Given, When, Then, And }) => {
    Given('AI助手接口返回一个账号分组和对应私信数据', () => {
      installMocks(true);
    });
    When('打开AI助手首页', () => {
      renderPage();
    });
    Then('页面显示编辑分组入口', async () => {
      expect(await screen.findByRole('button', { name: '编辑分组' })).toBeInTheDocument();
    });
    And('页面显示删除分组入口', async () => {
      expect(await screen.findByRole('button', { name: '删除分组' })).toBeInTheDocument();
    });
  });

  Scenario('人工发送消息', ({ Given, When, Then }) => {
    Given('当前已选中一个私信会话', () => {
      installMocks(true);
      mockedPost.mockResolvedValue(null as never);
      renderPage();
    });
    When('输入回复内容并点击发送', async () => {
      await screen.findByText('Naomi WU');
      await userEvent.type(
        screen.getByPlaceholderText('输入回复内容，支持人工发送。'),
        '您好，这是最新活动安排。',
      );
      await userEvent.click(screen.getByRole('button', { name: '发送回复' }));
    });
    Then('调用私信发送接口', async () => {
      await waitFor(() =>
        expect(mockedPost).toHaveBeenCalledWith(
          '/api/v1/ai-assistant/workspace/conversations/conv-001/reply',
          { replyText: '您好，这是最新活动安排。' },
        ),
      );
    });
  });
});
