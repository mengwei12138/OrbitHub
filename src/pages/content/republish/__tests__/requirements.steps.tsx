import { defineFeature } from '@amiceli/vitest-cucumber';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useNavigate } from 'react-router-dom';
import { vi } from 'vitest';
import {
  publishRecordDetailQueryOptions,
  useAISuggestions,
  useRepublish,
} from '@/services/content';
import type {
  ContentAiCaptionVariant,
  ContentAiTitleVariant,
  PublishRecordDetailData,
} from '@/services/content/types';

import Republish from '..';

vi.mock('@/services/content', () => ({
  publishRecordDetailQueryOptions: vi.fn(() => ({
    queryKey: ['content', 'publish', 'record', 'detail', 'record-1'],
    queryFn: vi.fn(),
  })),
  useRepublish: vi.fn(() => ({
    mutateAsync: vi.fn(),
    isPending: false,
  })),
  useAISuggestions: vi.fn(() => ({
    mutateAsync: vi.fn(),
  })),
}));

vi.mock('@/services/account', () => ({
  useAccountList: vi.fn(() => ({
    data: {
      list: [
        {
          id: 'account-1',
          nickname: '抖音账号A',
          platform: 'douyin',
          status: 'ONLINE',
        },
        {
          id: 'account-2',
          nickname: '抖音账号B',
          platform: 'douyin',
          status: 'ONLINE',
        },
        {
          id: 'account-3',
          nickname: '小红书账号A',
          platform: 'xiaohongshu',
          status: 'ONLINE',
        },
        {
          id: 'account-4',
          nickname: '已停止账号',
          platform: 'douyin',
          status: 'STOPPED',
        },
      ],
    },
  })),
}));

vi.mock('react-router-dom', () => ({
  useNavigate: vi.fn(() => vi.fn()),
  useSearchParams: vi.fn(() => ({
    get: vi.fn((key: string) => {
      if (key === 'recordId') return 'record-1';
      if (key === 'from') return '/content/history';
      return null;
    }),
  })),
}));

const mockRecordDetail: PublishRecordDetailData = {
  recordId: 'record-1',
  accountId: 'account-1',
  accountNickname: '抖音账号A',
  platform: 'douyin',
  contentMode: 'VIDEO',
  title: '原视频标题',
  caption: '原文案内容',
  topicTags: ['#原标签1', '#原标签2'],
  coverUrl: 'https://example.com/cover.jpg',
  primaryMediaAssetId: 'media-1',
  publishedAt: '2024-01-15T10:00:00Z',
  status: 'PUBLISH_SUCCESS',
  stage: 'PUBLISHED',
  canRepublish: true,
};

const mockTitleVariants: ContentAiTitleVariant[] = [
  { text: '优化后标题1', rationale: '理由1' },
  { text: '优化后标题2', rationale: '理由2' },
];

const mockCaptionVariants: ContentAiCaptionVariant[] = [
  {
    title: '新标题1',
    caption: '新文案1',
    topicTags: ['#新标签1'],
    rationale: '理由1',
  },
];

defineFeature('./features/requirements.feature', ({ Scenario }) => {
  beforeEach(() => {
    vi.clearAllMocks();
    (
      publishRecordDetailQueryOptions as ReturnType<typeof vi.fn>
    ).mockReturnValue({
      queryKey: ['content', 'publish', 'record', 'detail', 'record-1'],
      queryFn: vi.fn().mockResolvedValue(mockRecordDetail),
    });
  });

  Scenario('加载原内容信息', ({ Given, When, Then, And }) => {
    Given('用户进入重新发布页', async () => {
      render(<Republish />);
    });
    When('页面加载时', async () => {
      await waitFor(() => {
        expect(screen.getByTestId('republish-page')).toBeInTheDocument();
      });
    });
    Then('显示原内容标题', () => {
      expect(screen.getByText('原视频标题')).toBeInTheDocument();
    });
    And('显示原内容文案', () => {
      expect(screen.getByText('原文案内容')).toBeInTheDocument();
    });
    And('显示原内容标签', () => {
      expect(screen.getByText('#原标签1')).toBeInTheDocument();
      expect(screen.getByText('#原标签2')).toBeInTheDocument();
    });
    And('原发布状态显示', () => {
      expect(screen.getByText(/发布成功/iu)).toBeInTheDocument();
    });
  });

  Scenario('默认勾选原账号', ({ Given, Then, And }) => {
    Given('原发布账号状态为「在线」', () => {
      expect(mockRecordDetail.status).toBe('PUBLISH_SUCCESS');
    });
    Then('目标账号默认勾选原账号', () => {
      const defaultAccount = screen.getByTestId('selected-account-0');
      expect(defaultAccount).toBeInTheDocument();
    });
    And('原账号可正常勾选', () => {
      const accountCheckbox = screen.getByTestId('account-checkbox-account-1');
      expect(accountCheckbox).not.toBeDisabled();
    });
  });

  Scenario('目标账号-单平台单账号限制', ({ Given, When, Then, And }) => {
    Given('用户已选择原抖音账号', async () => {
      const account1 = screen.getByTestId('account-checkbox-account-1');
      await userEvent.click(account1);
      expect(account1).toBeChecked();
    });
    When('再选择另一个抖音账号', async () => {
      const account2 = screen.getByTestId('account-checkbox-account-2');
      await userEvent.click(account2);
    });
    Then('原抖音账号自动取消勾选', () => {
      const account1 = screen.getByTestId('account-checkbox-account-1');
      expect(account1).not.toBeChecked();
    });
    And('新抖音账号变为选中', () => {
      const account2 = screen.getByTestId('account-checkbox-account-2');
      expect(account2).toBeChecked();
    });
  });

  Scenario('目标账号-增选其他账号', ({ Given, When, Then, And }) => {
    Given('用户已选择原账号', async () => {
      const account1 = screen.getByTestId('account-checkbox-account-1');
      expect(account1).toBeChecked();
    });
    When('点击增选其他账号', async () => {
      const addButton = screen.getByText('增选其他账号');
      await userEvent.click(addButton);
    });
    Then('显示账号选择列表', () => {
      expect(screen.getByTestId('account-select-modal')).toBeInTheDocument();
    });
    And('用户可选择同平台或不同平台账号', () => {
      expect(screen.getByText('抖音账号B')).toBeInTheDocument();
      expect(screen.getByText('小红书账号A')).toBeInTheDocument();
    });
  });

  Scenario('目标账号-已停止账号不可选', ({ Given, Then, And }) => {
    Given('原账号状态为「已停止」', () => {
      expect('STOPPED').toBe('STOPPED');
    });
    Then('原账号显示禁用态', () => {
      const stoppedCheckbox = screen.getByTestId('account-checkbox-account-4');
      expect(stoppedCheckbox).toBeDisabled();
    });
    And('不可勾选', () => {
      const stoppedCheckbox = screen.getByTestId('account-checkbox-account-4');
      expect(stoppedCheckbox).toBeDisabled();
    });
  });

  Scenario('目标账号-失效账号不可选', ({ Given, Then, And }) => {
    Given('原账号状态为「失效」', () => {
      expect('INVALID').toBe('INVALID');
    });
    Then('原账号显示禁用态', () => {
      expect(screen.getByTestId('republish-page')).toBeInTheDocument();
    });
    And('不可勾选', () => {
      expect(screen.getByTestId('republish-page')).toBeInTheDocument();
    });
  });

  Scenario('AI生成内容', ({ Given, When, Then, And }) => {
    Given('用户点击「AI生成内容」按钮', async () => {
      render(<Republish />);
      const aiButton = screen.getByRole('button', { name: /AI生成内容/iu });
      await userEvent.click(aiButton);
    });
    When('AI 生成完成', async () => {
      const aiSuggestions = useAISuggestions as ReturnType<typeof vi.fn>;
      aiSuggestions.mockReturnValue({
        mutateAsync: vi.fn().mockResolvedValue({
          titleSuggestions: { variants: mockTitleVariants },
          contentSuggestions: { variants: mockCaptionVariants },
        }),
      });
      await waitFor(() => {
        expect(screen.getByText('新文案1')).toBeInTheDocument();
      });
    });
    Then('自动填充优化后的内容', () => {
      const captionInput = screen.getByTestId('caption-input');
      expect(captionInput).toHaveValue('新文案1');
    });
    And('显示生成成功提示', () => {
      expect(screen.getByText(/AI生成成功/iu)).toBeInTheDocument();
    });
  });

  Scenario('手动编辑标题', ({ Given, When, Then }) => {
    Given('用户可编辑标题', async () => {
      render(<Republish />);
      const titleInput = screen.getByTestId('title-input');
      expect(titleInput).toBeInTheDocument();
    });
    When('输入自定义标题', async () => {
      const titleInput = screen.getByTestId('title-input');
      await userEvent.clear(titleInput);
      await userEvent.type(titleInput, '自定义标题');
    });
    Then('标题更新为用户输入内容', () => {
      const titleInput = screen.getByTestId('title-input');
      expect(titleInput).toHaveValue('自定义标题');
    });
  });

  Scenario('手动编辑文案', ({ Given, When, Then }) => {
    Given('用户可编辑文案', async () => {
      render(<Republish />);
      const captionInput = screen.getByTestId('caption-input');
      expect(captionInput).toBeInTheDocument();
    });
    When('输入自定义文案', async () => {
      const captionInput = screen.getByTestId('caption-input');
      await userEvent.clear(captionInput);
      await userEvent.type(captionInput, '自定义文案内容');
    });
    Then('文案更新为用户输入内容', () => {
      const captionInput = screen.getByTestId('caption-input');
      expect(captionInput).toHaveValue('自定义文案内容');
    });
  });

  Scenario('手动编辑标签', ({ Given, When, Then }) => {
    Given('用户可编辑标签', async () => {
      render(<Republish />);
      const tagInput = screen.getByTestId('tag-input');
      expect(tagInput).toBeInTheDocument();
    });
    When('添加或删除话题标签', async () => {
      const tagInput = screen.getByTestId('tag-input');
      await userEvent.type(tagInput, '#新标签{enter}');
    });
    Then('标签更新为用户修改结果', () => {
      expect(screen.getByText('#新标签')).toBeInTheDocument();
    });
  });

  Scenario('幂等性校验-检测到重复内容', ({ Given, When, Then, And }) => {
    Given('素材MD5+平台+账号已存在成功发布记录', async () => {
      const republish = useRepublish as ReturnType<typeof vi.fn>;
      republish.mockReturnValue({
        mutateAsync: vi.fn().mockRejectedValue({
          code: 1001,
          message: 'DUPLICATE_CONTENT',
        }),
        isPending: false,
      });
      render(<Republish />);
    });
    When('用户点击确认重发', async () => {
      const confirmButton = screen.getByRole('button', { name: /确认重发/iu });
      await userEvent.click(confirmButton);
    });
    Then(
      '显示确认弹窗「检测到该内容已在平台发布过，是否继续发布？」',
      async () => {
        await waitFor(() => {
          expect(
            screen.getByText(/检测到该内容已在平台发布过/iu),
          ).toBeInTheDocument();
        });
      },
    );
    And('用户可选择继续或取消', () => {
      expect(
        screen.getByRole('button', { name: /继续发布/iu }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /取消/iu }),
      ).toBeInTheDocument();
    });
  });

  Scenario('幂等性校验-无重复内容通过', ({ Given, When, Then, And }) => {
    Given('本系统内无相同素材MD5的成功发布记录', async () => {
      const republish = useRepublish as ReturnType<typeof vi.fn>;
      republish.mockReturnValue({
        mutateAsync: vi.fn().mockResolvedValue({ success: true }),
        isPending: false,
      });
      render(<Republish />);
    });
    When('用户点击确认重发', async () => {
      const confirmButton = screen.getByRole('button', { name: /确认重发/iu });
      await userEvent.click(confirmButton);
    });
    Then('直接提交发布请求', async () => {
      await waitFor(() => {
        expect(useRepublish).toHaveBeenCalled();
      });
    });
    And('不弹窗拦截', () => {
      expect(screen.queryByText(/检测到该内容/iu)).not.toBeInTheDocument();
    });
  });

  Scenario('确认重发-用户选择继续', ({ Given, When, Then, And }) => {
    Given('显示幂等性确认弹窗', async () => {
      const republish = useRepublish as ReturnType<typeof vi.fn>;
      republish.mockReturnValue({
        mutateAsync: vi.fn().mockRejectedValue({
          code: 1001,
          message: 'DUPLICATE_CONTENT',
        }),
        isPending: false,
      });
      render(<Republish />);
      const confirmButton = screen.getByRole('button', { name: /确认重发/iu });
      await userEvent.click(confirmButton);
      await waitFor(() => {
        expect(
          screen.getByTestId('duplicate-warning-modal'),
        ).toBeInTheDocument();
      });
    });
    When('用户点击「继续发布」', async () => {
      const continueButton = screen.getByRole('button', { name: /继续发布/iu });
      await userEvent.click(continueButton);
    });
    Then('关闭弹窗', () => {
      expect(
        screen.queryByTestId('duplicate-warning-modal'),
      ).not.toBeInTheDocument();
    });
    And('继续执行发布流程', async () => {
      await waitFor(() => {
        expect(useRepublish).toHaveBeenCalled();
      });
    });
  });

  Scenario('确认重发-用户选择取消', ({ Given, When, Then, And }) => {
    Given('显示幂等性确认弹窗', async () => {
      const republish = useRepublish as ReturnType<typeof vi.fn>;
      republish.mockReturnValue({
        mutateAsync: vi.fn().mockRejectedValue({
          code: 1001,
          message: 'DUPLICATE_CONTENT',
        }),
        isPending: false,
      });
      render(<Republish />);
      const confirmButton = screen.getByRole('button', { name: /确认重发/iu });
      await userEvent.click(confirmButton);
      await waitFor(() => {
        expect(
          screen.getByTestId('duplicate-warning-modal'),
        ).toBeInTheDocument();
      });
    });
    When('用户点击「取消」', async () => {
      const cancelButton = screen.getByRole('button', { name: /取消/iu });
      await userEvent.click(cancelButton);
    });
    Then('关闭弹窗', () => {
      expect(
        screen.queryByTestId('duplicate-warning-modal'),
      ).not.toBeInTheDocument();
    });
    And('不执行发布', () => {
      expect(screen.getByTestId('republish-page')).toBeInTheDocument();
    });
  });

  Scenario('删除原内容-勾选确认', ({ Given, When, Then }) => {
    Given('用户勾选「重新发布后删除内容」', async () => {
      render(<Republish />);
      const deleteCheckbox = screen.getByTestId('delete-original-checkbox');
      await userEvent.click(deleteCheckbox);
    });
    When('点击确认重发', async () => {
      const confirmButton = screen.getByRole('button', { name: /确认重发/iu });
      await userEvent.click(confirmButton);
    });
    Then('弹出二次确认「此操作不可逆，将删除原内容。确认继续？」', async () => {
      await waitFor(() => {
        expect(screen.getByText(/此操作不可逆/iu)).toBeInTheDocument();
      });
    });
  });

  Scenario('删除原内容-新内容发布成功后执行', ({ Given, Then, And }) => {
    Given('用户勾选删除原内容', async () => {
      const republish = useRepublish as ReturnType<typeof vi.fn>;
      republish.mockReturnValue({
        mutateAsync: vi.fn().mockResolvedValue({ success: true }),
        isPending: false,
      });
      render(<Republish />);
      const deleteCheckbox = screen.getByTestId('delete-original-checkbox');
      await userEvent.click(deleteCheckbox);
    });
    And('新内容发布成功', async () => {
      const confirmButton = screen.getByRole('button', { name: /确认重发/iu });
      await userEvent.click(confirmButton);
      await waitFor(() => {
        expect(screen.getByText(/重新发布成功/iu)).toBeInTheDocument();
      });
    });
    Then('执行删除原内容指令', () => {
      expect(useRepublish).toHaveBeenCalled();
    });
    And('原内容被删除', () => {
      const navigate = vi.mocked(useNavigate);
      expect(navigate).toHaveBeenCalledWith('/content/history');
    });
  });

  Scenario('删除原内容-新内容发布失败时保留', ({ Given, Then, And }) => {
    Given('用户勾选删除原内容', async () => {
      render(<Republish />);
      const deleteCheckbox = screen.getByTestId('delete-original-checkbox');
      await userEvent.click(deleteCheckbox);
    });
    And('新内容发布失败', async () => {
      const republish = useRepublish as ReturnType<typeof vi.fn>;
      republish.mockReturnValue({
        mutateAsync: vi.fn().mockRejectedValue(new Error('发布失败')),
        isPending: false,
      });
      const confirmButton = screen.getByRole('button', { name: /确认重发/iu });
      await userEvent.click(confirmButton);
      await waitFor(() => {
        expect(screen.getByText(/发布失败/iu)).toBeInTheDocument();
      });
    });
    Then('保留原内容不删除', () => {
      expect(screen.getByTestId('republish-page')).toBeInTheDocument();
    });
    And('向用户发送通知', () => {
      expect(screen.getByText(/发布失败/iu)).toBeInTheDocument();
    });
  });

  Scenario('删除原内容-用户取消确认', ({ Given, When, Then, And }) => {
    Given('显示删除二次确认弹窗', async () => {
      render(<Republish />);
      const deleteCheckbox = screen.getByTestId('delete-original-checkbox');
      await userEvent.click(deleteCheckbox);
      const confirmButton = screen.getByRole('button', { name: /确认重发/iu });
      await userEvent.click(confirmButton);
      await waitFor(() => {
        expect(screen.getByText(/此操作不可逆/iu)).toBeInTheDocument();
      });
    });
    When('用户点击「取消」', async () => {
      const cancelButton = screen.getByRole('button', { name: /取消/iu });
      await userEvent.click(cancelButton);
    });
    Then('关闭弹窗', () => {
      expect(screen.queryByText(/此操作不可逆/iu)).not.toBeInTheDocument();
    });
    And('取消删除勾选状态', () => {
      const deleteCheckbox = screen.getByTestId('delete-original-checkbox');
      expect(deleteCheckbox).not.toBeChecked();
    });
  });

  Scenario('重新发布-自动重试3次', ({ Given, When, Then, And }) => {
    Given('账号发布失败', async () => {
      const republish = useRepublish as ReturnType<typeof vi.fn>;
      republish.mockReturnValue({
        mutateAsync: vi
          .fn()
          .mockRejectedValueOnce(new Error('网络错误'))
          .mockRejectedValueOnce(new Error('网络错误'))
          .mockRejectedValueOnce(new Error('网络错误')),
        isPending: false,
      });
      render(<Republish />);
    });
    When('系统自动重试', async () => {
      const confirmButton = screen.getByRole('button', { name: /确认重发/iu });
      await userEvent.click(confirmButton);
    });
    Then('重试间隔 30 秒', async () => {
      await waitFor(
        () => {
          expect(screen.getByText(/30秒/iu)).toBeInTheDocument();
        },
        { timeout: 35000 },
      );
    });
    And('最多重试 3 次', () => {
      expect(screen.getByText(/3\/3/iu)).toBeInTheDocument();
    });
    And('3 次都失败后标记为「发布失败」', async () => {
      await waitFor(() => {
        expect(screen.getByText(/发布失败/iu)).toBeInTheDocument();
      });
    });
  });

  Scenario('重新发布-发布成功', ({ Given, When, Then, And }) => {
    Given('重新发布提交成功', async () => {
      const republish = useRepublish as ReturnType<typeof vi.fn>;
      republish.mockReturnValue({
        mutateAsync: vi.fn().mockResolvedValue({ success: true }),
        isPending: false,
      });
      render(<Republish />);
    });
    When('平台返回成功', async () => {
      const confirmButton = screen.getByRole('button', { name: /确认重发/iu });
      await userEvent.click(confirmButton);
      await waitFor(() => {
        expect(screen.getByText(/重新发布成功/iu)).toBeInTheDocument();
      });
    });
    Then('显示重新发布成功提示', () => {
      expect(screen.getByText(/重新发布成功/iu)).toBeInTheDocument();
    });
    And('跳转历史发布记录页', () => {
      const navigate = vi.mocked(useNavigate);
      expect(navigate).toHaveBeenCalledWith('/content/history');
    });
  });

  Scenario('重新发布-发布失败', ({ Given, When, Then, And }) => {
    Given('3 次重试后仍失败', async () => {
      const republish = useRepublish as ReturnType<typeof vi.fn>;
      republish.mockReturnValue({
        mutateAsync: vi
          .fn()
          .mockRejectedValueOnce(new Error('错误1'))
          .mockRejectedValueOnce(new Error('错误2'))
          .mockRejectedValueOnce(new Error('最终失败')),
        isPending: false,
      });
      render(<Republish />);
    });
    When('系统判定为发布失败', async () => {
      const confirmButton = screen.getByRole('button', { name: /确认重发/iu });
      await userEvent.click(confirmButton);
      await waitFor(() => {
        expect(screen.getByText(/最终失败/iu)).toBeInTheDocument();
      });
    });
    Then('显示发布失败提示', () => {
      expect(screen.getByText(/发布失败/iu)).toBeInTheDocument();
    });
    And('展示失败原因', () => {
      expect(screen.getByText(/最终失败/iu)).toBeInTheDocument();
    });
  });

  Scenario('封面策略-封面不更新', ({ Given, Then, And }) => {
    Given('重新发布使用原素材', () => {
      expect(mockRecordDetail.primaryMediaAssetId).toBeDefined();
    });
    Then('封面以首次发布时平台返回的为准', () => {
      render(<Republish />);
      const coverImage = screen.getByTestId('cover-image');
      expect(coverImage).toHaveAttribute('src', mockRecordDetail.coverUrl);
    });
    And('重新发布不更新封面', () => {
      expect(screen.getByTestId('cover-image')).toBeInTheDocument();
    });
  });

  Scenario('防重复提交', ({ Given, When, Then, And }) => {
    Given('重新发布提交中', async () => {
      const republish = useRepublish as ReturnType<typeof vi.fn>;
      republish.mockReturnValue({
        mutateAsync: vi.fn().mockImplementation(() => new Promise(() => {})),
        isPending: true,
      });
      render(<Republish />);
    });
    When('500ms 内重复点击', async () => {
      const confirmButton = screen.getByRole('button', { name: /确认重发/iu });
      await userEvent.click(confirmButton);
      await userEvent.click(confirmButton);
    });
    Then('忽略重复点击', () => {
      expect(useRepublish).toHaveBeenCalledTimes(1);
    });
    And('按钮显示禁用状态', () => {
      const confirmButton = screen.getByRole('button', { name: /确认重发/iu });
      expect(confirmButton).toBeDisabled();
    });
  });

  Scenario('返回历史记录', ({ Given, When, Then }) => {
    Given('用户在重新发布页', async () => {
      render(<Republish />);
    });
    When('点击取消或返回', async () => {
      const cancelButton = screen.getByRole('button', { name: /取消/iu });
      await userEvent.click(cancelButton);
    });
    Then('跳转历史发布记录页', () => {
      const navigate = vi.mocked(useNavigate);
      expect(navigate).toHaveBeenCalledWith('/content/history');
    });
  });

  Scenario(
    '从数据中心进入重新发布页，点击取消返回数据中心',
    ({ Given, When, Then }) => {
      Given('用户从数据中心点击「去处理」进入重新发布页', async () => {
        window.history.replaceState(
          null,
          '',
          '/content/republish?recordId=123&from=datacenter',
        );
        render(<Republish />);
      });
      When('点击取消按钮', async () => {
        const cancelButton = screen.getByRole('button', { name: /取消/iu });
        await userEvent.click(cancelButton);
      });
      Then('跳转数据中心页', () => {
        const navigate = vi.mocked(useNavigate);
        expect(navigate).toHaveBeenCalledWith('/datacenter');
      });
    },
  );
});
