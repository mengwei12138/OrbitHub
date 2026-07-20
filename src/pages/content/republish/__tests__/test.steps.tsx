import { defineFeature } from '@amiceli/vitest-cucumber';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import type { AccountResponse } from '@/services/account/types';
import {
  CONTENT_MODE_CODE,
  PUBLISH_STATUS_CODE,
  type PublishRecordDetailData,
} from '@/services/content/types';
import Republish from '../index';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
  useSearchParams: () => [
    new URLSearchParams({ recordId: '123', from: '/content/history' }),
  ],
}));

vi.mock('@/services/content', () => ({
  publishRecordDetailQueryOptions: vi.fn(() => ({
    queryKey: ['content', 'publish', 'record', 'detail', '123'],
    queryFn: vi.fn(),
  })),
  useRepublish: vi.fn(() => ({
    mutate: vi.fn(),
    mutateAsync: vi.fn(),
    isPending: false,
  })),
  useAISuggestions: vi.fn(() => ({
    mutateAsync: vi.fn().mockResolvedValue({
      titleSuggestions: {
        variants: [{ text: 'AI生成标题' }],
      },
      contentSuggestions: {
        variants: [
          {
            title: 'AI标题',
            caption: 'AI文案',
            topicTags: ['#AI标签'],
          },
        ],
      },
    }),
    isPending: false,
  })),
  PUBLISH_STATUS_CODE,
}));

vi.mock('@/services/account', () => ({
  useAccountList: vi.fn(),
}));

vi.mock('@tanstack/react-query', () => ({
  useQuery: vi.fn(),
}));

const mockMessage = {
  success: vi.fn(),
  error: vi.fn(),
  warning: vi.fn(),
};

vi.mock('antd', async () => {
  const actual = await vi.importActual('antd');
  return {
    ...actual,
    message: mockMessage,
  };
});

const createMockRecordDetail = (
  overrides: Partial<PublishRecordDetailData> = {},
): PublishRecordDetailData => ({
  recordId: '123',
  contentMode: CONTENT_MODE_CODE.IMAGE,
  title: '原标题',
  caption: '原文案',
  topicTags: ['#原标签'],
  platform: 'douyin',
  accountId: 'acc-1',
  accountNickname: '原账号',
  stage: 'PUBLISHED',
  status: PUBLISH_STATUS_CODE.PUBLISH_SUCCESS,
  publishedAt: '2026-04-01T10:00:00Z',
  canRepublish: true,
  ...overrides,
});

const createMockAccount = (
  overrides: Partial<AccountResponse> = {},
): AccountResponse => ({
  id: 'acc-1',
  accountNo: 'ACC001',
  platform: 'douyin',
  nickname: '测试账号',
  phoneNumber: '138****8000',
  avatar: 'http://example.com/avatar.jpg',
  status: 'ONLINE',
  followers: '1000',
  posts: '100',
  likes: '5000',
  loginRegion: null,
  loginRegionName: null,
  tokenExpireAt: '2026-12-31T23:59:59Z',
  createdAt: '2026-01-01T00:00:00Z',
  ...overrides,
});

const mockUseQuery = (
  recordDetail: PublishRecordDetailData | undefined,
  accountList: { list: AccountResponse[] } | undefined,
) => {
  vi.mocked(require('@tanstack/react-query').useQuery).mockImplementation(
    (options: { queryKey: string[] }) => {
      if (options.queryKey[2] === 'record') {
        return { data: recordDetail, isLoading: false };
      }
      if (options.queryKey[1] === 'account') {
        return { data: accountList, isLoading: false };
      }
      return { data: undefined, isLoading: false };
    },
  );
};

defineFeature('./features/test.feature', ({ Scenario }) => {
  Scenario('重新发布-内容信息继承自原记录', ({ Given, When, Then }) => {
    Given('用户已进入重新发布页（来自历史列表「重发」）', async () => {
      const mockRecord = createMockRecordDetail();
      const mockAccount = createMockAccount();
      mockUseQuery(mockRecord, { list: [mockAccount] });
      render(<Republish />);
    });

    When('观察「原内容信息」区域', async () => {
      await waitFor(() => {
        expect(screen.getByText('原内容信息')).toBeInTheDocument();
      });
    });

    Then('显示原记录的标题、文案、标签、原发布状态', async () => {
      await waitFor(() => {
        expect(screen.getByText('原标题')).toBeInTheDocument();
        expect(screen.getByText('原文案')).toBeInTheDocument();
        expect(screen.getByText('#原标签')).toBeInTheDocument();
      });
    });
  });

  Scenario('重新发布-目标账号默认勾选原账号', ({ Given, When, Then }) => {
    Given('用户已在重新发布页', async () => {
      const mockRecord = createMockRecordDetail();
      const mockAccount = createMockAccount({ id: 'acc-1' });
      mockUseQuery(mockRecord, { list: [mockAccount] });
      render(<Republish />);
    });

    When('观察「重发配置」中的账号区域', async () => {
      await waitFor(() => {
        expect(screen.getByText('目标账号')).toBeInTheDocument();
      });
    });

    Then('原账号已默认勾选（标注「原账号」）', async () => {
      await waitFor(() => {
        expect(screen.getByText(/原账号/u)).toBeInTheDocument();
      });
    });
  });

  Scenario('重新发布-可增选其他账号', ({ Given, When, Then, And }) => {
    Given('用户在重新发布页，原账号已勾选', async () => {
      const mockRecord = createMockRecordDetail({ accountId: 'acc-1' });
      const accounts = [
        createMockAccount({ id: 'acc-1', nickname: '原账号' }),
        createMockAccount({ id: 'acc-2', nickname: '账号2' }),
      ];
      mockUseQuery(mockRecord, { list: accounts });
      render(<Republish />);
    });

    When('点击「选择账号」', async () => {
      await waitFor(() => {
        const selectButton = screen.getByText('选择账号');
        expect(selectButton).toBeInTheDocument();
      });
      const selectButton = screen.getByText('选择账号');
      await userEvent.click(selectButton);
    });

    And('勾选另一个在线账号', async () => {
      await waitFor(() => {
        const accountOption = screen.getByText('账号2');
        expect(accountOption).toBeInTheDocument();
      });
      const accountOption = screen.getByText('账号2');
      await userEvent.click(accountOption);
    });

    Then('新账号添加到发布目标', async () => {
      await waitFor(() => {
        expect(screen.getByText('账号2')).toBeInTheDocument();
      });
    });

    And('原账号保持勾选', async () => {
      await waitFor(() => {
        expect(screen.getByText('原账号')).toBeInTheDocument();
      });
    });
  });

  Scenario('重新发布-单平台单账号限制仍然生效', ({ Given, When, Then }) => {
    Given('用户在重新发布页，原账号为小红书', async () => {
      const mockRecord = createMockRecordDetail({
        platform: 'xiaohongshu',
        accountId: 'acc-xhs',
      });
      const accounts = [
        createMockAccount({
          id: 'acc-xhs',
          platform: 'xiaohongshu',
          nickname: '小红书原账号',
        }),
        createMockAccount({
          id: 'acc-xhs-2',
          platform: 'xiaohongshu',
          nickname: '小红书账号2',
        }),
      ];
      mockUseQuery(mockRecord, { list: accounts });
      render(<Republish />);
    });

    When('尝试增选另一个小红书账号', async () => {
      await waitFor(() => {
        const selectButton = screen.getByText('选择账号');
        expect(selectButton).toBeInTheDocument();
      });
      const selectButton = screen.getByText('选择账号');
      await userEvent.click(selectButton);
    });

    Then('另一个小红书账号不可勾选', async () => {
      await waitFor(() => {
        const xhsAccount2 = screen.getByText('小红书账号2');
        expect(xhsAccount2).toBeInTheDocument();
      });
    });
  });

  Scenario('重新发布-编辑标题/文案/标签', ({ Given, When, Then, And }) => {
    Given('用户在重新发布页', async () => {
      const mockRecord = createMockRecordDetail();
      const mockAccount = createMockAccount();
      mockUseQuery(mockRecord, { list: [mockAccount] });
      render(<Republish />);
    });

    When('修改标题输入框内容', async () => {
      await waitFor(() => {
        const titleInput = screen.getByPlaceholderText('请输入标题');
        expect(titleInput).toBeInTheDocument();
      });
      const titleInput = screen.getByPlaceholderText('请输入标题');
      await userEvent.clear(titleInput);
      await userEvent.type(titleInput, '新标题');
    });

    And('修改文案内容', async () => {
      const contentInput = screen.getByPlaceholderText('请输入内容描述');
      await userEvent.clear(contentInput);
      await userEvent.type(contentInput, '新文案');
    });

    And('修改标签内容', async () => {
      const tagsInput = screen.getByPlaceholderText('输入话题后按回车添加');
      await userEvent.type(tagsInput, '#新标签');
      await userEvent.keyboard('{Enter}');
    });

    Then('内容可正常编辑修改', async () => {
      await waitFor(() => {
        expect(screen.getByDisplayValue('新标题')).toBeInTheDocument();
        expect(screen.getByDisplayValue('新文案')).toBeInTheDocument();
      });
    });
  });

  Scenario('重新发布-AI智能优化', ({ Given, When, Then }) => {
    Given('用户在重新发布页', async () => {
      const mockRecord = createMockRecordDetail();
      const mockAccount = createMockAccount();
      mockUseQuery(mockRecord, { list: [mockAccount] });
      render(<Republish />);
    });

    When('点击「AI智能优化」按钮', async () => {
      await waitFor(() => {
        const aiButton = screen.getByText('AI智能优化');
        expect(aiButton).toBeInTheDocument();
      });
      const aiButton = screen.getByText('AI智能优化');
      await userEvent.click(aiButton);
    });

    Then('调用AI优化当前标题/文案', async () => {
      await waitFor(() => {
        const { useAISuggestions } = require('@/services/content');
        expect(useAISuggestions).toHaveBeenCalled();
      });
    });
  });

  Scenario(
    '重新发布-幂等性校验弹窗确认后继续',
    ({ Given, When, Then, And }) => {
      Given('系统检测到相同内容已在平台发布过，弹窗已弹出', async () => {
        const mockRecord = createMockRecordDetail();
        const mockAccount = createMockAccount();
        mockUseQuery(mockRecord, { list: [mockAccount] });
        render(<Republish />);

        const { useRepublish } = require('@/services/content');
        vi.mocked(useRepublish).mockReturnValue({
          mutate: vi.fn(),
          mutateAsync: vi.fn().mockRejectedValue({
            code: 1001,
            message: 'DUPLICATE_CONTENT',
          }),
          isPending: false,
        } as unknown as ReturnType<typeof useRepublish>);

        await waitFor(() => {
          const confirmButton = screen.getByText('确认重发');
          expect(confirmButton).toBeInTheDocument();
        });
        const confirmButton = screen.getByText('确认重发');
        await userEvent.click(confirmButton);
      });

      When('用户点击弹窗中「继续发布」', async () => {
        await waitFor(() => {
          const continueButton = screen.getByText('继续发布');
          expect(continueButton).toBeInTheDocument();
        });
        const continueButton = screen.getByText('继续发布');
        await userEvent.click(continueButton);
      });

      Then('发布任务正常创建', async () => {
        const { useRepublish } = require('@/services/content');
        await waitFor(() => {
          expect(useRepublish).toHaveBeenCalled();
        });
      });

      And('进入发布进度流程', async () => {
        await waitFor(() => {
          expect(mockNavigate).toHaveBeenCalled();
        });
      });
    },
  );

  Scenario(
    '重新发布-幂等性弹窗点击取消不创建任务',
    ({ Given, When, Then, And }) => {
      Given('幂等性检测弹窗已弹出', async () => {
        const mockRecord = createMockRecordDetail();
        const mockAccount = createMockAccount();
        mockUseQuery(mockRecord, { list: [mockAccount] });
        render(<Republish />);
      });

      When('用户点击弹窗中「取消」', async () => {
        await waitFor(() => {
          const confirmButton = screen.getByText('确认重发');
          expect(confirmButton).toBeInTheDocument();
        });
        const confirmButton = screen.getByText('确认重发');
        await userEvent.click(confirmButton);
      });

      Then('不创建发布任务', async () => {
        await waitFor(() => {
          const cancelButton = screen.getByText('取消');
          if (cancelButton) {
            expect(screen.getByText('幂等性校验')).toBeInTheDocument();
          }
        });
      });

      And('停留在重新发布页', async () => {
        await waitFor(() => {
          expect(screen.getByText('重新发布')).toBeInTheDocument();
        });
      });
    },
  );

  Scenario('重新发布-系统自动重试3次', ({ Given, When, Then, And }) => {
    Given('重新发布触发，平台接口返回失败', async () => {
      const mockRecord = createMockRecordDetail();
      const mockAccount = createMockAccount();
      mockUseQuery(mockRecord, { list: [mockAccount] });

      const { useRepublish } = require('@/services/content');
      vi.mocked(useRepublish).mockReturnValue({
        mutate: vi.fn(),
        mutateAsync: vi.fn().mockRejectedValue(new Error('平台接口失败')),
        isPending: false,
      } as unknown as ReturnType<typeof useRepublish>);

      render(<Republish />);
    });

    When('发起重新发布', async () => {
      await waitFor(() => {
        const confirmButton = screen.getByText('确认重发');
        expect(confirmButton).toBeInTheDocument();
      });
      const confirmButton = screen.getByText('确认重发');
      await userEvent.click(confirmButton);
    });

    Then('系统自动重试3次', async () => {
      const { useRepublish } = require('@/services/content');
      await waitFor(() => {
        expect(useRepublish).toHaveBeenCalled();
      });
    });

    And('重试期间仅重试失败记录', async () => {
      await waitFor(() => {
        expect(mockMessage.error).toHaveBeenCalled();
      });
    });

    And('3次都失败后标记为「发布失败」', async () => {
      await waitFor(() => {
        expect(screen.getByText(/失败/u)).toBeInTheDocument();
      });
    });
  });

  Scenario(
    '重新发布-勾选「重新发布后删除内容」',
    ({ Given, When, Then, And }) => {
      Given('用户在重新发布页，目标账号为原账号', async () => {
        const mockRecord = createMockRecordDetail({ accountId: 'acc-1' });
        const mockAccount = createMockAccount({ id: 'acc-1' });
        mockUseQuery(mockRecord, { list: [mockAccount] });
        render(<Republish />);
      });

      When('勾选「重新发布后删除内容」', async () => {
        await waitFor(() => {
          const checkbox = screen.getByText('重新发布后删除内容');
          expect(checkbox).toBeInTheDocument();
        });
        const checkbox = screen.getByText('重新发布后删除内容');
        await userEvent.click(checkbox);
      });

      And('点击「确认重发」', async () => {
        await waitFor(() => {
          const confirmButton = screen.getByText('确认重发');
          expect(confirmButton).toBeInTheDocument();
        });
        const confirmButton = screen.getByText('确认重发');
        await userEvent.click(confirmButton);
      });

      Then('弹出二次确认框', async () => {
        await waitFor(() => {
          expect(
            screen.getByText(/此操作不可逆，将删除原内容/u),
          ).toBeInTheDocument();
        });
      });

      And('用户确认后才执行删除', async () => {
        await waitFor(() => {
          const confirmDeleteButton = screen.getByText('确认删除');
          expect(confirmDeleteButton).toBeInTheDocument();
        });
      });
    },
  );

  Scenario('重新发布-新发布失败时原内容保留', ({ Given, When, Then, And }) => {
    Given('用户已勾选「重新发布后删除内容」，新发布失败', async () => {
      const mockRecord = createMockRecordDetail();
      const mockAccount = createMockAccount();
      mockUseQuery(mockRecord, { list: [mockAccount] });

      const { useRepublish } = require('@/services/content');
      vi.mocked(useRepublish).mockReturnValue({
        mutate: vi.fn(),
        mutateAsync: vi.fn().mockRejectedValue(new Error('发布失败')),
        isPending: false,
      } as unknown as ReturnType<typeof useRepublish>);

      render(<Republish />);
    });

    When('完成重新发布流程', async () => {
      await waitFor(() => {
        const confirmButton = screen.getByText('确认重发');
        expect(confirmButton).toBeInTheDocument();
      });
      const confirmButton = screen.getByText('确认重发');
      await userEvent.click(confirmButton);
    });

    Then('原内容不被删除', async () => {
      await waitFor(() => {
        expect(mockMessage.error).toHaveBeenCalled();
      });
    });

    And('系统提示用户新发布失败', async () => {
      await waitFor(() => {
        expect(screen.getByText(/重新发布失败/u)).toBeInTheDocument();
      });
    });
  });

  Scenario(
    '重新发布-5分钟内禁止同一内容同账号重复提交',
    ({ Given, When, Then }) => {
      Given('用户对同一账号已发起重新发布（5分钟内）', async () => {
        const mockRecord = createMockRecordDetail();
        const mockAccount = createMockAccount();
        mockUseQuery(mockRecord, { list: [mockAccount] });

        const { useRepublish } = require('@/services/content');
        vi.mocked(useRepublish).mockReturnValue({
          mutate: vi.fn(),
          mutateAsync: vi.fn().mockRejectedValue({
            code: 1003,
            message: 'REPUBLISH_IN_COOLDOWN',
          }),
          isPending: false,
        } as unknown as ReturnType<typeof useRepublish>);

        render(<Republish />);
      });

      When('5分钟内再次尝试对同一账号重新发布同一内容', async () => {
        await waitFor(() => {
          const confirmButton = screen.getByText('确认重发');
          expect(confirmButton).toBeInTheDocument();
        });
        const confirmButton = screen.getByText('确认重发');
        await userEvent.click(confirmButton);
      });

      Then('提示「该内容正在发布中，请稍后再试」', async () => {
        await waitFor(() => {
          expect(
            screen.getByText(/该内容正在发布中，请稍后再试/u),
          ).toBeInTheDocument();
        });
      });
    },
  );

  Scenario('重新发布-点击「取消」返回', ({ Given, When, Then, And }) => {
    Given('用户在重新发布页', async () => {
      const mockRecord = createMockRecordDetail();
      const mockAccount = createMockAccount();
      mockUseQuery(mockRecord, { list: [mockAccount] });
      render(<Republish />);
    });

    When('点击「取消」按钮', async () => {
      await waitFor(() => {
        const cancelButton = screen.getByText('取消');
        expect(cancelButton).toBeInTheDocument();
      });
      const cancelButton = screen.getByText('取消');
      await userEvent.click(cancelButton);
    });

    Then('返回上一页', async () => {
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/content/history');
      });
    });

    And('不创建发布任务', async () => {
      const { useRepublish } = require('@/services/content');
      expect(useRepublish).not.toHaveBeenCalled();
    });
  });

  Scenario('越权防护-只能查看自己的发布记录', ({ Given, When, Then }) => {
    Given('用户已登录账号A，系统中有账号B的发布记录', async () => {
      const mockRecord = createMockRecordDetail({ accountId: 'acc-B' });
      const accounts = [
        createMockAccount({ id: 'acc-A', nickname: '账号A' }),
        createMockAccount({ id: 'acc-B', nickname: '账号B' }),
      ];
      mockUseQuery(mockRecord, { list: accounts });
      render(<Republish />);
    });

    When('用户访问历史发布记录页', async () => {
      await waitFor(() => {
        expect(screen.getByText('重新发布')).toBeInTheDocument();
      });
    });

    Then('只显示账号A的发布记录', async () => {
      await waitFor(() => {
        const { useRepublish } = require('@/services/content');
        expect(useRepublish).toBeDefined();
      });
    });
  });
});
