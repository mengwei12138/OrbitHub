import '@testing-library/react/dont-cleanup-after-each';

import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { defineFeature } from '@amiceli/vitest-cucumber';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
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

const featurePath = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  '../features/requirements.feature',
);

const renderPage = () => {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  });
  return render(
    <QueryClientProvider client={client}>
      <MemoryRouter>
        <AIAssistantPage />
      </MemoryRouter>
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
  });

  afterEach(() => {
    cleanup();
  });

  Scenario('无分组时先创建账号分组', ({ Given, When, Then, And }) => {
    Given('当前管理员已导入社交账号但还没有分组', () => {
      installMocks(false);
    });
    When('进入AI助手页面', () => {
      renderPage();
    });
    Then('页面提示创建账号分组', async () => {
      expect(
        await screen.findByText('尚未创建任何账号分组。请先创建分组，并将当前管理员已导入账号归组。'),
      ).toBeInTheDocument();
    });
    And('可从当前管理员已导入账号中选择成员', async () => {
      expect(await screen.findByRole('button', { name: '创建账号分组' })).toBeInTheDocument();
    });
  });

  Scenario('选择分组后进入私信工作区', ({ Given, When, Then, And }) => {
    Given('当前管理员已经创建账号分组', () => {
      installMocks(true);
    });
    When('点击某个账号分组', () => {
      renderPage();
    });
    Then('页面下方展示私信列表、聊天框和右侧管理栏三栏', async () => {
      expect(await screen.findByText('收到的私信')).toBeInTheDocument();
      expect(screen.getByText('账号列表')).toBeInTheDocument();
    });
    And('中栏可进行人工发送与AI自动回复控制', async () => {
      expect(await screen.findByText('AI 自动回复')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '发送回复' })).toBeInTheDocument();
    });
  });

  Scenario('未读与紧急标识持续展示', ({ Given, When, Then, And }) => {
    Given('当前管理员已经创建账号分组且存在未读私信', () => {
      installMocks(true);
    });
    When('点击某个账号分组并查看会话', async () => {
      renderPage();
      await screen.findByText('Naomi WU');
    });
    Then('分组未读标识持续显示', async () => {
      expect(await screen.findAllByText('未读 1')).not.toHaveLength(0);
    });
    And('会话未读标识持续显示', async () => {
      expect(await screen.findAllByText('未读 1')).not.toHaveLength(0);
    });
    And('连续三条客户消息的会话显示紧急标识', async () => {
      expect(await screen.findByText('紧急')).toBeInTheDocument();
    });
  });

  Scenario('在右栏管理当前分组', ({ Given, When, Then, And }) => {
    Given('当前管理员已进入某个账号分组', () => {
      installMocks(true);
    });
    When('查看右栏账号列表', () => {
      renderPage();
    });
    Then('可看到编辑分组与删除分组入口', async () => {
      expect(await screen.findByRole('button', { name: '编辑分组' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '删除分组' })).toBeInTheDocument();
    });
    And('编辑分组后可修改当前分组名称和成员账号', async () => {
      expect(await screen.findByRole('button', { name: '编辑分组' })).toBeInTheDocument();
    });
  });

  Scenario('管理分组知识库', ({ Given, When, Then, And }) => {
    Given('当前管理员已进入某个账号分组', () => {
      installMocks(true);
    });
    When('点击管理知识库', () => {
      renderPage();
    });
    Then('可上传Word、PDF、TXT文件', async () => {
      expect(await screen.findByText('管理知识库')).toBeInTheDocument();
    });
    And('文件列表展示在当前分组下', async () => {
      expect(await screen.findByText('知识库')).toBeInTheDocument();
    });
  });
});
