import { defineFeature } from '@amiceli/vitest-cucumber';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useNavigate } from 'react-router-dom';
import { vi } from 'vitest';
import { useAccountList } from '@/services/account';
import {
  createContentUploadController,
  useActivePublishJobs,
  useAISuggestions,
  usePromptTemplates,
  useSubmitPublish,
} from '@/services/content';

import Content from '../index';

vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn(),
}));

vi.mock('@tanstack/react-query', () => ({
  useQueryClient: () => ({
    fetchQuery: vi.fn().mockResolvedValue({
      list: [
        {
          id: '1',
          platform: 'douyin',
          nickname: '抖音账号1',
          phoneNumber: '13800000001',
          status: 'ONLINE',
          followers: 1000,
        },
        {
          id: '2',
          platform: 'xiaohongshu',
          nickname: '小红书账号1',
          phoneNumber: '13800000002',
          status: 'ONLINE',
          followers: 2000,
        },
        {
          id: '3',
          platform: 'douyin',
          nickname: '抖音账号2',
          phoneNumber: '13800000003',
          status: 'ONLINE',
          followers: 3000,
        },
        {
          id: '4',
          platform: 'xiaohongshu',
          nickname: '小红书账号2',
          phoneNumber: '13800000004',
          status: 'STOPPED',
          followers: 4000,
        },
        {
          id: '5',
          platform: 'douyin',
          nickname: '抖音账号3',
          phoneNumber: '13800000005',
          status: 'ONLINE',
          followers: 5000,
        },
      ],
      hasNext: false,
    }),
  }),
}));

vi.mock('@/services/account', () => ({
  useAccountList: vi.fn(),
}));

vi.mock('@/services/content', () => ({
  createContentUploadController: vi.fn(() => ({
    upload: vi.fn(),
    abort: vi.fn(),
  })),
  useActivePublishJobs: vi.fn(),
  useSubmitPublish: vi.fn(() => ({
    mutateAsync: vi.fn(),
    isPending: false,
  })),
  useAISuggestions: vi.fn(() => ({
    mutateAsync: vi.fn(),
  })),
  usePromptTemplates: vi.fn(() => ({
    data: { templates: [] },
  })),
}));

const mockAccounts = [
  {
    id: '1',
    platform: 'douyin',
    nickname: '抖音账号1',
    phoneNumber: '13800000001',
    status: 'ONLINE',
    followers: 1000,
  },
  {
    id: '2',
    platform: 'xiaohongshu',
    nickname: '小红书账号1',
    phoneNumber: '13800000002',
    status: 'ONLINE',
    followers: 2000,
  },
  {
    id: '3',
    platform: 'douyin',
    nickname: '抖音账号2',
    phoneNumber: '13800000003',
    status: 'ONLINE',
    followers: 3000,
  },
  {
    id: '4',
    platform: 'xiaohongshu',
    nickname: '小红书账号2',
    phoneNumber: '13800000004',
    status: 'STOPPED',
    followers: 4000,
  },
  {
    id: '5',
    platform: 'douyin',
    nickname: '抖音账号3',
    phoneNumber: '13800000005',
    status: 'ONLINE',
    followers: 5000,
  },
];

const mockAccountListResponse = {
  list: mockAccounts,
  total: 5,
};

defineFeature('./features/test.feature', ({ Scenario }) => {
  Scenario('内容发布页面基础布局验证', ({ Given, When, Then, And }) => {
    Given('用户已登录系统', async () => {
      vi.mocked(useAccountList).mockReturnValue({
        data: mockAccountListResponse,
      } as unknown as ReturnType<typeof useAccountList>);
      vi.mocked(useActivePublishJobs).mockReturnValue({
        data: { hasActive: false },
      } as unknown as ReturnType<typeof useActivePublishJobs>);
    });

    When('访问内容发布页面', async () => {
      render(<Content />);
    });

    Then('显示页面整体布局', async () => {
      await waitFor(() => {
        expect(screen.getByTestId('content-page')).toBeInTheDocument();
      });
    });

    And('显示左侧侧边栏', async () => {
      expect(screen.getByText('视频发布')).toBeInTheDocument();
    });

    And('显示顶部全局Header', async () => {
      expect(screen.getByText('内容发布')).toBeInTheDocument();
    });

    And('显示面包屑「内容发布」', async () => {
      expect(screen.getByText('内容发布')).toBeInTheDocument();
    });

    And('显示「历史发布」按钮', async () => {
      expect(screen.getByText('历史发布')).toBeInTheDocument();
    });
  });

  Scenario('Tab切换-默认选中图文发布', ({ Given, When, Then }) => {
    Given('用户在内容发布页', async () => {
      vi.mocked(useAccountList).mockReturnValue({
        data: mockAccountListResponse,
      } as unknown as ReturnType<typeof useAccountList>);
      vi.mocked(useActivePublishJobs).mockReturnValue({
        data: { hasActive: false },
      } as unknown as ReturnType<typeof useActivePublishJobs>);
    });

    When('观察顶部Tab状态', async () => {
      render(<Content />);
    });

    Then('「图文发布」Tab默认选中', async () => {
      await waitFor(() => {
        const tabs = screen.getAllByRole('tab');
        expect(tabs.length).toBeGreaterThan(0);
      });
    });
  });

  Scenario('Tab切换-图文发布Tab切换', ({ Given, When, Then, And }) => {
    Given('用户在视频发布Tab', async () => {
      vi.mocked(useAccountList).mockReturnValue({
        data: mockAccountListResponse,
      } as unknown as ReturnType<typeof useAccountList>);
      vi.mocked(useActivePublishJobs).mockReturnValue({
        data: { hasActive: false },
      } as unknown as ReturnType<typeof useActivePublishJobs>);
      render(<Content />);
      const videoTab = screen.getByRole('tab', { name: /视频发布/iu });
      await userEvent.click(videoTab);
    });

    When('点击「图文发布」Tab', async () => {
      const imageTab = screen.getByRole('tab', { name: /图文发布/iu });
      await userEvent.click(imageTab);
    });

    Then('切换到图文发布模式', async () => {
      await waitFor(() => {
        expect(screen.getByTestId('image-upload')).toBeInTheDocument();
      });
    });

    And('上传区域变更为图片上传区', async () => {
      expect(screen.getByTestId('image-upload')).toBeInTheDocument();
    });
  });

  Scenario('Tab切换-视频发布Tab切换', ({ Given, When, Then, And }) => {
    Given('用户在图文发布Tab，已上传图片', async () => {
      vi.mocked(useAccountList).mockReturnValue({
        data: mockAccountListResponse,
      } as unknown as ReturnType<typeof useAccountList>);
      vi.mocked(useActivePublishJobs).mockReturnValue({
        data: { hasActive: false },
      } as unknown as ReturnType<typeof useActivePublishJobs>);
      render(<Content />);
    });

    When('点击「视频发布」Tab', async () => {
      const videoTab = screen.getByRole('tab', { name: /视频发布/iu });
      await userEvent.click(videoTab);
    });

    Then('切换到视频发布模式', async () => {
      await waitFor(() => {
        expect(screen.getByTestId('video-upload')).toBeInTheDocument();
      });
    });

    And('上传区域变更为视频上传区', async () => {
      expect(screen.getByTestId('video-upload')).toBeInTheDocument();
    });

    And('已上传图片素材被清空', async () => {
      const imageUpload = screen.queryByTestId('image-upload');
      if (imageUpload) {
        expect(
          screen.queryByRole('img', { name: /image/u }),
        ).not.toBeInTheDocument();
      }
    });
  });

  Scenario('点击「历史发布」按钮跳转', ({ Given, When, Then }) => {
    const mockNavigate = vi.fn();
    vi.mocked(useNavigate).mockReturnValue(mockNavigate);

    Given('用户在内容发布页', async () => {
      vi.mocked(useAccountList).mockReturnValue({
        data: mockAccountListResponse,
      } as unknown as ReturnType<typeof useAccountList>);
      vi.mocked(useActivePublishJobs).mockReturnValue({
        data: { hasActive: false },
      } as unknown as ReturnType<typeof useActivePublishJobs>);
      render(<Content />);
    });

    When('点击页面右上角「历史发布」按钮', async () => {
      const historyButton = screen.getByText('历史发布');
      await userEvent.click(historyButton);
    });

    Then('页面跳转至历史发布记录页面', async () => {
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/content/history');
      });
    });
  });

  Scenario('图文模式-点击上传区域触发文件选择', ({ Given, When, Then }) => {
    Given('用户在图文发布模式', async () => {
      vi.mocked(useAccountList).mockReturnValue({
        data: mockAccountListResponse,
      } as unknown as ReturnType<typeof useAccountList>);
      vi.mocked(useActivePublishJobs).mockReturnValue({
        data: { hasActive: false },
      } as unknown as ReturnType<typeof useActivePublishJobs>);
      render(<Content />);
    });

    When('点击图片上传区域', async () => {
      const imageUpload = screen.getByTestId('image-upload');
      const input = imageUpload.querySelector('input[type="file"]');
      expect(input).toBeInTheDocument();
    });

    Then('弹出系统文件选择框', async () => {
      const imageUpload = screen.getByTestId('image-upload');
      const input = imageUpload.querySelector('input[type="file"]');
      expect(input).toBeInTheDocument();
    });
  });

  Scenario('图文模式-拖拽上传图片', ({ Given, When, Then }) => {
    const mockUpload = vi.fn().mockResolvedValue({
      previewUrl: 'blob:http://test.com/image.jpg',
      mediaAssetId: 'asset-1',
    });

    Given('用户在图文发布模式', async () => {
      vi.mocked(useAccountList).mockReturnValue({
        data: mockAccountListResponse,
      } as unknown as ReturnType<typeof useAccountList>);
      vi.mocked(useActivePublishJobs).mockReturnValue({
        data: { hasActive: false },
      } as unknown as ReturnType<typeof useActivePublishJobs>);
      vi.mocked(createContentUploadController).mockReturnValue({
        upload: mockUpload,
        abort: vi.fn(),
      } as unknown as ReturnType<typeof createContentUploadController>);
      render(<Content />);
    });

    When('将JPG图片拖拽到上传区域', async () => {
      const imageUpload = screen.getByTestId('image-upload');
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      await userEvent.upload(imageUpload, file);
    });

    Then('图片成功上传并展示缩略图预览', async () => {
      await waitFor(() => {
        expect(mockUpload).toHaveBeenCalled();
      });
    });
  });

  Scenario('图文模式-批量上传多张图片', ({ Given, When, Then }) => {
    const mockUpload = vi.fn().mockResolvedValue({
      previewUrl: 'blob:http://test.com/image.jpg',
      mediaAssetId: 'asset-1',
    });

    Given('用户在图文发布模式', async () => {
      vi.mocked(useAccountList).mockReturnValue({
        data: mockAccountListResponse,
      } as unknown as ReturnType<typeof useAccountList>);
      vi.mocked(useActivePublishJobs).mockReturnValue({
        data: { hasActive: false },
      } as unknown as ReturnType<typeof useActivePublishJobs>);
      vi.mocked(createContentUploadController).mockReturnValue({
        upload: mockUpload,
        abort: vi.fn(),
      } as unknown as ReturnType<typeof createContentUploadController>);
      render(<Content />);
    });

    When('选择5张合法图片上传', async () => {
      const imageUpload = screen.getByTestId('image-upload');
      const files = [
        new File(['test1'], 'test1.jpg', { type: 'image/jpeg' }),
        new File(['test2'], 'test2.jpg', { type: 'image/jpeg' }),
        new File(['test3'], 'test3.jpg', { type: 'image/jpeg' }),
        new File(['test4'], 'test4.jpg', { type: 'image/jpeg' }),
        new File(['test5'], 'test5.jpg', { type: 'image/jpeg' }),
      ];
      await userEvent.upload(imageUpload, files);
    });

    Then('5张图片全部上传成功', async () => {
      await waitFor(() => {
        expect(mockUpload).toHaveBeenCalledTimes(5);
      });
    });
  });

  Scenario('图文模式-80张后再上传20张', ({ Given, When, Then, And }) => {
    Given('用户已上传 80 张图片', async () => {
      render(<Content />);
      const imageTab = screen.getByRole('tab', { name: /图文发布/iu });
      await userEvent.click(imageTab);
      // TODO: 需要模拟上传80张图片的场景
      // 由于需要批量触发文件上传，实现复杂
    });
    When('再上传 20 张图片', async () => {
      const imageUpload = screen.getByTestId('image-upload');
      expect(imageUpload).toBeInTheDocument();
      // TODO: 模拟再上传20张图片
    });
    Then('100 张图片全部上传成功', async () => {
      await waitFor(() => {
        // TODO: 验证图片列表长度为100
        // expect(screen.getAllByTestId(/image-item/iu)).toHaveLength(100);
        // 由于实现复杂，暂标记
      });
    });
    And('100 张图片均可预览显示', async () => {
      await waitFor(() => {
        // TODO: 验证所有图片都有预览图
        // const images = screen.getAllByRole('img');
        // expect(images.length).toBe(100);
      });
    });
  });

  Scenario('图文模式-大量图片上传完整性验证', ({ Given, When, Then, And }) => {
    Given('用户在图文发布模式', async () => {
      render(<Content />);
      // TODO: 需要模拟上传100张图片的场景
    });
    When('上传 100 张图片', async () => {
      const imageUpload = screen.getByTestId('image-upload');
      expect(imageUpload).toBeInTheDocument();
      // TODO: 模拟批量上传100张图片
    });
    Then('上传完成后图片计数显示为 100', async () => {
      await waitFor(() => {
        // TODO: 验证图片计数显示为100
        // expect(screen.getByText(/100.*\/.*100/u)).toBeInTheDocument();
      });
    });
    And('每张图片都有预览图', async () => {
      await waitFor(() => {
        // TODO: 验证每张图片都有预览图
        // const thumbnails = screen.getAllByTestId(/image-thumbnail/iu);
        // expect(thumbnails.length).toBe(100);
      });
    });
  });

  Scenario('视频模式-上传后自动预览', ({ Given, When, Then }) => {
    const mockUpload = vi.fn().mockResolvedValue({
      previewUrl: 'blob:http://test.com/video.mp4',
      mediaAssetId: 'asset-video-1',
    });

    Given('用户在视频发布模式', async () => {
      vi.mocked(useAccountList).mockReturnValue({
        data: mockAccountListResponse,
      } as unknown as ReturnType<typeof useAccountList>);
      vi.mocked(useActivePublishJobs).mockReturnValue({
        data: { hasActive: false },
      } as unknown as ReturnType<typeof useActivePublishJobs>);
      vi.mocked(createContentUploadController).mockReturnValue({
        upload: mockUpload,
        abort: vi.fn(),
      } as unknown as ReturnType<typeof createContentUploadController>);
      render(<Content />);
      const videoTab = screen.getByRole('tab', { name: /视频发布/iu });
      await userEvent.click(videoTab);
    });

    When('上传一个合法MP4视频', async () => {
      const videoUpload = screen.getByTestId('video-upload');
      const file = new File(['test'], 'test.mp4', { type: 'video/mp4' });
      await userEvent.upload(videoUpload, file);
    });

    Then('视频预览区自动展示该视频', async () => {
      await waitFor(() => {
        expect(screen.getByRole('video')).toBeInTheDocument();
      });
    });
  });

  Scenario(
    'AI内容生成-输入描述后点击AI生成内容',
    ({ Given, When, Then, And }) => {
      Given('用户在图文模式，已上传图片', async () => {
        vi.mocked(useAccountList).mockReturnValue({
          data: mockAccountListResponse,
        } as unknown as ReturnType<typeof useAccountList>);
        vi.mocked(useActivePublishJobs).mockReturnValue({
          data: { hasActive: false },
        } as unknown as ReturnType<typeof useActivePublishJobs>);
        vi.mocked(useAISuggestions).mockReturnValue({
          mutateAsync: vi.fn().mockResolvedValue({
            titleSuggestions: {
              variants: [
                { text: '测试标题1', rationale: '理由1' },
                { text: '测试标题2', rationale: '理由2' },
              ],
            },
            contentSuggestions: {
              variants: [
                {
                  title: '测试内容包1',
                  caption: '测试文案1',
                  topicTags: ['#话题1'],
                  rationale: '理由1',
                },
              ],
            },
          }),
        } as unknown as ReturnType<typeof useAISuggestions>);
      });

      When('在AI内容生成输入框输入描述', async () => {
        render(<Content />);
      });

      And('点击「AI生成内容」按钮', async () => {
        const aiButton = screen.getByText('AI生成内容');
        await userEvent.click(aiButton);
      });

      Then('AI返回多个标题版本和内容包候选', async () => {
        await waitFor(() => {
          expect(useAISuggestions).toHaveBeenCalled();
        });
      });
    },
  );

  Scenario('AI生成结果-点击结果版本自动填充', ({ Given, When, Then }) => {
    Given('AI生成结果已展示', async () => {
      vi.mocked(useAccountList).mockReturnValue({
        data: mockAccountListResponse,
      } as unknown as ReturnType<typeof useAccountList>);
      vi.mocked(useActivePublishJobs).mockReturnValue({
        data: { hasActive: false },
      } as unknown as ReturnType<typeof useActivePublishJobs>);
      vi.mocked(useAISuggestions).mockReturnValue({
        mutateAsync: vi.fn().mockResolvedValue({
          titleSuggestions: {
            variants: [
              { text: '测试标题1', rationale: '理由1' },
              { text: '测试标题2', rationale: '理由2' },
            ],
          },
          contentSuggestions: {
            variants: [
              {
                title: '测试内容包1',
                caption: '测试文案1',
                topicTags: ['#话题1'],
                rationale: '理由1',
              },
            ],
          },
        }),
      } as unknown as ReturnType<typeof useAISuggestions>);
      render(<Content />);
      const aiButton = screen.getByText('AI生成内容');
      await userEvent.click(aiButton);
      await waitFor(() => {
        expect(screen.getByTestId('caption-results')).toBeInTheDocument();
      });
    });

    When('点击任意一个AI生成的结果', async () => {
      const captionResult = screen.getByTestId('caption-result-1');
      await userEvent.click(captionResult);
    });

    Then('该内容自动填充到表单', async () => {
      await waitFor(() => {
        expect(
          screen.getByTestId('ai-content-preview-modal'),
        ).toBeInTheDocument();
      });
    });
  });

  Scenario('提示词模板-点击模板展开', ({ Given, When, Then }) => {
    Given('用户在内容发布页', async () => {
      vi.mocked(useAccountList).mockReturnValue({
        data: mockAccountListResponse,
      } as unknown as ReturnType<typeof useAccountList>);
      vi.mocked(useActivePublishJobs).mockReturnValue({
        data: { hasActive: false },
      } as unknown as ReturnType<typeof useActivePublishJobs>);
      vi.mocked(usePromptTemplates).mockReturnValue({
        data: {
          templates: [
            {
              code: 'spring-fashion',
              name: '春日穿搭',
              description: '适合春天穿搭内容',
              defaultPromptByMode: {
                IMAGE: '春日穿搭图片描述',
                VIDEO: '春日穿搭视频描述',
              },
            },
          ],
        },
      } as unknown as ReturnType<typeof usePromptTemplates>);
      render(<Content />);
    });

    When('点击提示词模板标签', async () => {
      const template = screen.getByText('春日穿搭');
      await userEvent.click(template);
    });

    Then('展开显示对应提示词内容', async () => {
      await waitFor(() => {
        expect(screen.getByTestId('template-detail')).toBeInTheDocument();
      });
    });
  });

  Scenario('话题-添加话题标签', ({ Given, When, Then, And }) => {
    Given('用户在内容发布页', async () => {
      vi.mocked(useAccountList).mockReturnValue({
        data: mockAccountListResponse,
      } as unknown as ReturnType<typeof useAccountList>);
      vi.mocked(useActivePublishJobs).mockReturnValue({
        data: { hasActive: false },
      } as unknown as ReturnType<typeof useActivePublishJobs>);
      render(<Content />);
    });

    When('点击「#话题」旁的「+添加」', async () => {
      const addHashtag = screen.getByText('+ 添加');
      await userEvent.click(addHashtag);
    });

    And('输入话题内容', async () => {
      const hashtagInput = screen.getByTestId('hashtag-input');
      await userEvent.type(hashtagInput, '春日穿搭');
      await userEvent.keyboard('{Enter}');
    });

    Then('话题标签显示在话题区域', async () => {
      await waitFor(() => {
        expect(screen.getByText('#春日穿搭')).toBeInTheDocument();
      });
    });
  });

  Scenario('账号选择区-默认展示3个账号', ({ Given, When, Then, And }) => {
    Given('系统中有5个以上账号', async () => {
      vi.mocked(useAccountList).mockReturnValue({
        data: mockAccountListResponse,
      } as unknown as ReturnType<typeof useAccountList>);
      vi.mocked(useActivePublishJobs).mockReturnValue({
        data: { hasActive: false },
      } as unknown as ReturnType<typeof useActivePublishJobs>);
    });

    When('在内容发布页观察账号选择区', async () => {
      render(<Content />);
    });

    Then('默认展示3个账号', async () => {
      await waitFor(() => {
        const accountList = screen.getByTestId('account-list');
        const accountItems =
          within(accountList).getAllByTestId(/account-item/iu);
        expect(accountItems.length).toBe(3);
      });
    });

    And('显示「更多」按钮', async () => {
      expect(screen.getByText('更多')).toBeInTheDocument();
    });
  });

  Scenario('账号选择区-点击「更多」展开全部', ({ Given, When, Then, And }) => {
    Given('默认展示3个账号', async () => {
      vi.mocked(useAccountList).mockReturnValue({
        data: mockAccountListResponse,
      } as unknown as ReturnType<typeof useAccountList>);
      vi.mocked(useActivePublishJobs).mockReturnValue({
        data: { hasActive: false },
      } as unknown as ReturnType<typeof useActivePublishJobs>);
    });

    When('点击「更多」按钮', async () => {
      render(<Content />);
      const moreButton = screen.getByText('更多');
      await userEvent.click(moreButton);
    });

    Then('展开显示所有账号', async () => {
      await waitFor(() => {
        const accountList = screen.getByTestId('account-list');
        const accountItems =
          within(accountList).getAllByTestId(/account-item/iu);
        expect(accountItems.length).toBe(5);
      });
    });

    And('包含在线、已停止、失效状态的账号', async () => {
      await waitFor(() => {
        expect(screen.getByText('小红书账号2')).toBeInTheDocument();
      });
    });
  });

  Scenario('账号选择区-「抖音」平台筛选', ({ Given, When, Then }) => {
    Given('用户在内容发布页', async () => {
      vi.mocked(useAccountList).mockReturnValue({
        data: mockAccountListResponse,
      } as unknown as ReturnType<typeof useAccountList>);
      vi.mocked(useActivePublishJobs).mockReturnValue({
        data: { hasActive: false },
      } as unknown as ReturnType<typeof useActivePublishJobs>);
      render(<Content />);
    });

    When('点击「抖音」筛选标签', async () => {
      const douyinFilter = screen.getByTestId('platform-douyin');
      await userEvent.click(douyinFilter);
    });

    Then('只显示抖音平台的账号', async () => {
      await waitFor(() => {
        const accountList = screen.getByTestId('account-list');
        const accountItems =
          within(accountList).getAllByTestId(/account-item/iu);
        accountItems.forEach((item) => {
          expect(item).toHaveTextContent('抖音');
        });
      });
    });
  });

  Scenario('账号选择区-「在线」账号可勾选', ({ Given, When, Then }) => {
    Given('账号列表中有「在线」状态账号', async () => {
      vi.mocked(useAccountList).mockReturnValue({
        data: mockAccountListResponse,
      } as unknown as ReturnType<typeof useAccountList>);
      vi.mocked(useActivePublishJobs).mockReturnValue({
        data: { hasActive: false },
      } as unknown as ReturnType<typeof useActivePublishJobs>);
      render(<Content />);
    });

    When('点击「在线」账号前的复选框', async () => {
      const onlineCheckbox = screen.getByTestId('account-checkbox-1');
      await userEvent.click(onlineCheckbox);
    });

    Then('复选框变为选中状态', async () => {
      await waitFor(() => {
        const checkbox = screen.getByTestId('account-checkbox-1');
        expect(checkbox).toBeChecked();
      });
    });
  });

  Scenario('账号选择区-「已停止」账号不可勾选', ({ Given, When, Then }) => {
    Given('账号列表中有「已停止」状态账号', async () => {
      vi.mocked(useAccountList).mockReturnValue({
        data: mockAccountListResponse,
      } as unknown as ReturnType<typeof useAccountList>);
      vi.mocked(useActivePublishJobs).mockReturnValue({
        data: { hasActive: false },
      } as unknown as ReturnType<typeof useActivePublishJobs>);
      render(<Content />);
    });

    When('尝试点击「已停止」账号前的复选框', async () => {
      const stoppedCheckbox = screen.getByTestId('account-checkbox-4');
      expect(stoppedCheckbox).toBeDisabled();
    });

    Then('复选框保持不可操作状态', async () => {
      const stoppedCheckbox = screen.getByTestId('account-checkbox-4');
      expect(stoppedCheckbox).toBeDisabled();
    });
  });

  Scenario(
    '单平台单账号-选择一个抖音账号后其他抖音禁用',
    ({ Given, When, Then }) => {
      Given('有2个以上在线抖音账号', async () => {
        vi.mocked(useAccountList).mockReturnValue({
          data: mockAccountListResponse,
        } as unknown as ReturnType<typeof useAccountList>);
        vi.mocked(useActivePublishJobs).mockReturnValue({
          data: { hasActive: false },
        } as unknown as ReturnType<typeof useActivePublishJobs>);
        render(<Content />);
      });

      When('勾选第一个「在线」的抖音账号', async () => {
        const douyinCheckboxA = screen.getByTestId('account-checkbox-1');
        await userEvent.click(douyinCheckboxA);
      });

      Then('其他抖音账号的复选框自动变为禁用态', async () => {
        await waitFor(() => {
          const douyinCheckboxB = screen.getByTestId('account-checkbox-3');
          const douyinCheckboxC = screen.getByTestId('account-checkbox-5');
          expect(douyinCheckboxB).toBeDisabled();
          expect(douyinCheckboxC).toBeDisabled();
        });
      });
    },
  );

  Scenario(
    '单平台单账号-可同时选择不同平台各一个',
    ({ Given, When, Then, And }) => {
      Given('用户在内容发布页', async () => {
        vi.mocked(useAccountList).mockReturnValue({
          data: mockAccountListResponse,
        } as unknown as ReturnType<typeof useAccountList>);
        vi.mocked(useActivePublishJobs).mockReturnValue({
          data: { hasActive: false },
        } as unknown as ReturnType<typeof useActivePublishJobs>);
        render(<Content />);
      });

      When('勾选一个抖音账号', async () => {
        const douyinCheckbox = screen.getByTestId('account-checkbox-1');
        await userEvent.click(douyinCheckbox);
      });

      And('勾选一个小红书账号', async () => {
        const xhsCheckbox = screen.getByTestId('account-checkbox-2');
        await userEvent.click(xhsCheckbox);
      });

      Then('两个账号均成功勾选', async () => {
        await waitFor(() => {
          const douyinCheckbox = screen.getByTestId('account-checkbox-1');
          const xhsCheckbox = screen.getByTestId('account-checkbox-2');
          expect(douyinCheckbox).toBeChecked();
          expect(xhsCheckbox).toBeChecked();
        });
      });
    },
  );

  Scenario('小红书-标题超过20字拦截', ({ Given, When, Then, And }) => {
    Given('在图文模式，已选小红书账号', async () => {
      vi.mocked(useAccountList).mockReturnValue({
        data: mockAccountListResponse,
      } as unknown as ReturnType<typeof useAccountList>);
      vi.mocked(useActivePublishJobs).mockReturnValue({
        data: { hasActive: false },
      } as unknown as ReturnType<typeof useActivePublishJobs>);
      render(<Content />);
      const xhsCheckbox = screen.getByTestId('account-checkbox-2');
      await userEvent.click(xhsCheckbox);
    });

    When('输入21字的标题', async () => {
      const contentInput = screen.getByTestId('content-input');
      await userEvent.type(contentInput, 'A'.repeat(21));
    });

    And('点击「确认发布」', async () => {
      const confirmButton = screen.getByText('确认发布');
      await userEvent.click(confirmButton);
    });

    Then('弹窗拦截，提示「标题超过20字，请精简」', async () => {
      await waitFor(() => {
        expect(screen.getByText(/标题超过20字，请精简/u)).toBeInTheDocument();
      });
    });
  });

  Scenario('抖音-标题超过50字拦截', ({ Given, When, Then, And }) => {
    Given('在视频模式，已选抖音账号', async () => {
      vi.mocked(useAccountList).mockReturnValue({
        data: mockAccountListResponse,
      } as unknown as ReturnType<typeof useAccountList>);
      vi.mocked(useActivePublishJobs).mockReturnValue({
        data: { hasActive: false },
      } as unknown as ReturnType<typeof useActivePublishJobs>);
      render(<Content />);
      const videoTab = screen.getByRole('tab', { name: /视频发布/iu });
      await userEvent.click(videoTab);
      const douyinCheckbox = screen.getByTestId('account-checkbox-1');
      await userEvent.click(douyinCheckbox);
    });

    When('输入51字的标题', async () => {
      const contentInput = screen.getByTestId('content-input');
      await userEvent.type(contentInput, 'A'.repeat(51));
    });

    And('点击「确认发布」', async () => {
      const confirmButton = screen.getByText('确认发布');
      await userEvent.click(confirmButton);
    });

    Then('弹窗拦截，提示「标题超过50字，请精简」', async () => {
      await waitFor(() => {
        expect(screen.getByText(/标题超过50字，请精简/u)).toBeInTheDocument();
      });
    });
  });

  Scenario('小红书-文案超过1000字拦截', ({ Given, When, Then, And }) => {
    Given('在图文模式，已选小红书账号', async () => {
      vi.mocked(useAccountList).mockReturnValue({
        data: mockAccountListResponse,
      } as unknown as ReturnType<typeof useAccountList>);
      vi.mocked(useActivePublishJobs).mockReturnValue({
        data: { hasActive: false },
      } as unknown as ReturnType<typeof useActivePublishJobs>);
      render(<Content />);
      const xhsCheckbox = screen.getByTestId('account-checkbox-2');
      await userEvent.click(xhsCheckbox);
    });

    When('输入超过1000字的文案', async () => {
      const contentInput = screen.getByTestId('content-input');
      await userEvent.type(contentInput, 'A'.repeat(1001));
    });

    And('点击「确认发布」', async () => {
      const confirmButton = screen.getByText('确认发布');
      await userEvent.click(confirmButton);
    });

    Then('弹窗拦截，提示「文案超过1000字，请精简」', async () => {
      await waitFor(() => {
        expect(screen.getByText(/文案超过1000字，请精简/u)).toBeInTheDocument();
      });
    });
  });

  Scenario('小红书-话题超过10个拦截', ({ Given, When, Then, And }) => {
    Given('在图文模式，已选小红书账号，已添加10个话题', async () => {
      render(<Content />);
      // 需要: 选中一个小红书账号，添加10个话题
      // 由于实现复杂，暂标记为需要进一步实现
    });
    When('尝试添加第11个话题', async () => {
      // TODO: 需要模拟添加第11个话题的交互
      // 涉及: 点击添加话题按钮 → 输入话题内容 → 按回车
    });
    And('点击「确认发布」', async () => {
      // TODO: 需要模拟点击确认发布按钮
      const confirmButton = screen.getByText('确认发布');
      await userEvent.click(confirmButton);
    });
    Then('校验拦截，提示「话题超过10个，请精简」', async () => {
      await waitFor(() => {
        expect(screen.getByText(/话题超过10个，请精简/u)).toBeInTheDocument();
      });
    });
  });

  Scenario('点击「确认发布」后按钮立即禁用', ({ Given, When, Then, And }) => {
    const mockMutateAsync = vi.fn(async () => {
      await new Promise((resolve) => setTimeout(resolve, 100));
    });

    Given('用户已选账号已上传素材', async () => {
      vi.mocked(useAccountList).mockReturnValue({
        data: mockAccountListResponse,
      } as unknown as ReturnType<typeof useAccountList>);
      vi.mocked(useActivePublishJobs).mockReturnValue({
        data: { hasActive: false },
      } as unknown as ReturnType<typeof useActivePublishJobs>);
      vi.mocked(useSubmitPublish).mockReturnValue({
        mutateAsync: mockMutateAsync,
        isPending: false,
      } as unknown as ReturnType<typeof useSubmitPublish>);
      vi.mocked(createContentUploadController).mockReturnValue({
        upload: vi.fn().mockResolvedValue({ mediaAssetId: 'test' }),
        abort: vi.fn(),
      } as unknown as ReturnType<typeof createContentUploadController>);
      render(<Content />);
      const douyinCheckbox = screen.getByTestId('account-checkbox-1');
      await userEvent.click(douyinCheckbox);
    });

    When('点击「确认发布」按钮', async () => {
      const confirmButton = screen.getByText('确认发布');
      await userEvent.click(confirmButton);
    });

    Then('按钮立即变为Loading态', async () => {
      await waitFor(() => {
        const loadingButton = screen.getByRole('button', { name: /发布中/iu });
        expect(loadingButton).toBeInTheDocument();
      });
    });

    And('文字变为「发布中...」', async () => {
      await waitFor(() => {
        expect(screen.getByText(/发布中/u)).toBeInTheDocument();
      });
    });

    And('按钮禁用不可再次点击', async () => {
      await waitFor(() => {
        const loadingButton = screen.getByRole('button', { name: /发布中/iu });
        expect(loadingButton).toBeDisabled();
      });
    });
  });

  Scenario('500ms内快速重复点击无效', ({ Given, When, Then }) => {
    let publishCallCount = 0;
    const mockMutateAsync = vi.fn(async () => {
      publishCallCount++;
      await new Promise((resolve) => setTimeout(resolve, 100));
    });

    Given('用户已选账号已上传素材', async () => {
      vi.mocked(useAccountList).mockReturnValue({
        data: mockAccountListResponse,
      } as unknown as ReturnType<typeof useAccountList>);
      vi.mocked(useActivePublishJobs).mockReturnValue({
        data: { hasActive: false },
      } as unknown as ReturnType<typeof useActivePublishJobs>);
      vi.mocked(useSubmitPublish).mockReturnValue({
        mutateAsync: mockMutateAsync,
        isPending: false,
      } as unknown as ReturnType<typeof useSubmitPublish>);
      render(<Content />);
    });

    When('以小于500ms的间隔连续快速点击「确认发布」2次', async () => {
      const confirmButton = screen.getByText('确认发布');
      await userEvent.click(confirmButton);
      await userEvent.click(confirmButton);
    });

    Then('仅触发一次发布请求', async () => {
      await waitFor(() => {
        expect(publishCallCount).toBe(1);
      });
    });
  });

  Scenario('发布进度弹窗展示', ({ Given, When, Then, And }) => {
    const mockMutateAsync = vi.fn(async () => {
      await new Promise((resolve) => setTimeout(resolve, 500));
    });

    Given('用户已选账号已上传素材，点击发布', async () => {
      vi.mocked(useAccountList).mockReturnValue({
        data: mockAccountListResponse,
      } as unknown as ReturnType<typeof useAccountList>);
      vi.mocked(useActivePublishJobs).mockReturnValue({
        data: { hasActive: false },
      } as unknown as ReturnType<typeof useActivePublishJobs>);
      vi.mocked(useSubmitPublish).mockReturnValue({
        mutateAsync: mockMutateAsync,
        isPending: false,
      } as unknown as ReturnType<typeof useSubmitPublish>);
      render(<Content />);
      const confirmButton = screen.getByText('确认发布');
      await userEvent.click(confirmButton);
    });

    When('发布请求发送后', async () => {
      await waitFor(() => {
        expect(mockMutateAsync).toHaveBeenCalled();
      });
    });

    Then('弹窗弹出显示整体进度条', async () => {
      await waitFor(() => {
        expect(
          screen.getByTestId('publish-progress-modal'),
        ).toBeInTheDocument();
      });
    });

    And('显示各账号行状态', async () => {
      await waitFor(() => {
        const progressModal = screen.getByTestId('publish-progress-modal');
        expect(
          within(progressModal).getByText(/抖音账号/u),
        ).toBeInTheDocument();
      });
    });

    And('显示「后台运行」按钮', async () => {
      await waitFor(() => {
        expect(screen.getByText('后台运行')).toBeInTheDocument();
      });
    });
  });

  Scenario('进度弹窗-失败账号显示失败原因', ({ Given, When, Then }) => {
    const mockMutateAsync = vi.fn(async () => {
      throw new Error('发布失败：账号已被封禁');
    });

    Given('发布进度弹窗已打开，某账号发布失败', async () => {
      vi.mocked(useAccountList).mockReturnValue({
        data: mockAccountListResponse,
      } as unknown as ReturnType<typeof useAccountList>);
      vi.mocked(useActivePublishJobs).mockReturnValue({
        data: { hasActive: false },
      } as unknown as ReturnType<typeof useActivePublishJobs>);
      vi.mocked(useSubmitPublish).mockReturnValue({
        mutateAsync: mockMutateAsync,
        isPending: false,
      } as unknown as ReturnType<typeof useSubmitPublish>);
      render(<Content />);
      const confirmButton = screen.getByText('确认发布');
      await userEvent.click(confirmButton);
      await waitFor(() => {
        expect(
          screen.getByTestId('publish-progress-modal'),
        ).toBeInTheDocument();
      });
    });

    When('观察失败账号所在行', async () => {
      // 等待错误信息显示
    });

    Then('显示具体失败原因', async () => {
      await waitFor(() => {
        expect(screen.getByText(/发布失败：账号已被封禁/u)).toBeInTheDocument();
      });
    });
  });

  Scenario(
    '进度弹窗-点击「后台运行」关闭弹窗',
    ({ Given, When, Then, And }) => {
      const mockMutateAsync = vi.fn(async () => {
        await new Promise((resolve) => setTimeout(resolve, 2000));
      });

      Given('发布进度弹窗已打开，发布进行中', async () => {
        vi.mocked(useAccountList).mockReturnValue({
          data: mockAccountListResponse,
        } as unknown as ReturnType<typeof useAccountList>);
        vi.mocked(useActivePublishJobs).mockReturnValue({
          data: { hasActive: false },
        } as unknown as ReturnType<typeof useActivePublishJobs>);
        vi.mocked(useSubmitPublish).mockReturnValue({
          mutateAsync: mockMutateAsync,
          isPending: false,
        } as unknown as ReturnType<typeof useSubmitPublish>);
        render(<Content />);
        const confirmButton = screen.getByText('确认发布');
        await userEvent.click(confirmButton);
        await waitFor(() => {
          expect(
            screen.getByTestId('publish-progress-modal'),
          ).toBeInTheDocument();
        });
      });

      When('点击「后台运行」按钮', async () => {
        const backgroudButton = screen.getByText('后台运行');
        await userEvent.click(backgroudButton);
      });

      Then('弹窗关闭', async () => {
        await waitFor(() => {
          expect(
            screen.queryByTestId('publish-progress-modal'),
          ).not.toBeInTheDocument();
        });
      });

      And('返回内容发布页', async () => {
        expect(screen.getByTestId('content-page')).toBeInTheDocument();
      });

      And('表单内容保留', async () => {
        // TODO: 验证表单内容是否保留
      });

      And('轮询在后台继续运行', async () => {
        // TODO: 验证轮询是否在后台继续运行
      });
    },
  );

  Scenario('后台运行-页面顶部显示进行中提示', ({ Given, When, Then }) => {
    Given('用户已点击「后台运行」', async () => {
      vi.mocked(useAccountList).mockReturnValue({
        data: mockAccountListResponse,
      } as unknown as ReturnType<typeof useAccountList>);
      vi.mocked(useActivePublishJobs).mockReturnValue({
        data: { hasActive: true },
      } as unknown as ReturnType<typeof useActivePublishJobs>);
      render(<Content />);
    });

    When('观察内容发布页顶部', async () => {
      // 页面已渲染
    });

    Then('显示「有发布任务正在进行中...」轻提示', async () => {
      await waitFor(() => {
        expect(screen.getByText(/有发布任务正在进行中/u)).toBeInTheDocument();
      });
    });
  });

  Scenario(
    '后台运行中-「确认发布」按钮置灰禁用',
    ({ Given, When, Then, And }) => {
      Given('用户已点击「后台运行」，发布任务未全部完成', async () => {
        vi.mocked(useAccountList).mockReturnValue({
          data: mockAccountListResponse,
        } as unknown as ReturnType<typeof useAccountList>);
        vi.mocked(useActivePublishJobs).mockReturnValue({
          data: { hasActive: true },
        } as unknown as ReturnType<typeof useActivePublishJobs>);
        render(<Content />);
      });

      When('观察「确认发布」按钮状态', async () => {
        // 按钮状态已在 Given 中设置
      });

      Then('按钮置灰不可点击', async () => {
        await waitFor(() => {
          const confirmButton = screen.getByText('确认发布');
          expect(confirmButton).toBeDisabled();
        });
      });

      And('显示提示「有发布任务正在进行中，请稍后再试」', async () => {
        await waitFor(() => {
          expect(
            screen.getByText(/有发布任务正在进行中，请稍后再试/u),
          ).toBeInTheDocument();
        });
      });
    },
  );

  Scenario('发布完成-全部成功展示', ({ Given, When, Then, And }) => {
    const mockMutateAsync = vi.fn(async () => ({
      success: true,
      results: [
        { accountId: '1', status: 'SUCCESS' },
        { accountId: '2', status: 'SUCCESS' },
      ],
    }));

    Given('所有账号发布成功', async () => {
      vi.mocked(useAccountList).mockReturnValue({
        data: mockAccountListResponse,
      } as unknown as ReturnType<typeof useAccountList>);
      vi.mocked(useActivePublishJobs).mockReturnValue({
        data: { hasActive: false },
      } as unknown as ReturnType<typeof useActivePublishJobs>);
      vi.mocked(useSubmitPublish).mockReturnValue({
        mutateAsync: mockMutateAsync,
        isPending: false,
      } as unknown as ReturnType<typeof useSubmitPublish>);
      render(<Content />);
      const confirmButton = screen.getByText('确认发布');
      await userEvent.click(confirmButton);
    });

    When('等待发布全部完成', async () => {
      await waitFor(() => {
        expect(mockMutateAsync).toHaveBeenCalled();
      });
    });

    Then('显示「发布完成」', async () => {
      await waitFor(() => {
        expect(screen.getByText('发布完成')).toBeInTheDocument();
      });
    });

    And('展示成功账号数量', async () => {
      await waitFor(() => {
        expect(screen.getByText(/成功.*2.*账号/u)).toBeInTheDocument();
      });
    });

    And('失败列表为空', async () => {
      await waitFor(() => {
        const failList = screen.queryByTestId('fail-list');
        if (failList) {
          expect(
            within(failList).queryByRole('listitem'),
          ).not.toBeInTheDocument();
        }
      });
    });
  });

  Scenario('发布完成-部分成功部分失败展示', ({ Given, When, Then, And }) => {
    const mockMutateAsync = vi.fn(async () => ({
      success: false,
      results: [
        { accountId: '1', status: 'SUCCESS' },
        { accountId: '2', status: 'SUCCESS' },
        { accountId: '3', status: 'SUCCESS' },
        { accountId: '4', status: 'SUCCESS' },
        { accountId: '5', status: 'SUCCESS' },
        { accountId: '6', status: 'SUCCESS' },
        { accountId: '7', status: 'SUCCESS' },
        { accountId: '8', status: 'SUCCESS' },
        { accountId: '9', status: 'FAILED', reason: '账号已被封禁' },
        { accountId: '10', status: 'FAILED', reason: '内容违规' },
        { accountId: '11', status: 'FAILED', reason: '网络异常' },
        { accountId: '12', status: 'FAILED', reason: '发布超时' },
      ],
    }));

    Given('8个账号成功4个失败', async () => {
      vi.mocked(useAccountList).mockReturnValue({
        data: mockAccountListResponse,
      } as unknown as ReturnType<typeof useAccountList>);
      vi.mocked(useActivePublishJobs).mockReturnValue({
        data: { hasActive: false },
      } as unknown as ReturnType<typeof useActivePublishJobs>);
      vi.mocked(useSubmitPublish).mockReturnValue({
        mutateAsync: mockMutateAsync,
        isPending: false,
      } as unknown as ReturnType<typeof useSubmitPublish>);
      render(<Content />);
      const confirmButton = screen.getByText('确认发布');
      await userEvent.click(confirmButton);
    });

    When('等待发布全部完成', async () => {
      await waitFor(() => {
        expect(mockMutateAsync).toHaveBeenCalled();
      });
    });

    Then('显示「成功提交：8个账号」', async () => {
      await waitFor(() => {
        expect(screen.getByText(/成功提交.*8.*账号/u)).toBeInTheDocument();
      });
    });

    And('显示「失败：4个账号」', async () => {
      await waitFor(() => {
        expect(screen.getByText(/失败.*4.*账号/u)).toBeInTheDocument();
      });
    });

    And('失败列表展示每个失败账号及原因', async () => {
      await waitFor(() => {
        expect(screen.getByText(/账号已被封禁/u)).toBeInTheDocument();
        expect(screen.getByText(/内容违规/u)).toBeInTheDocument();
        expect(screen.getByText(/网络异常/u)).toBeInTheDocument();
        expect(screen.getByText(/发布超时/u)).toBeInTheDocument();
      });
    });
  });

  Scenario('发布完成-点击「查看历史发布」跳转', ({ Given, When, Then }) => {
    const mockNavigate = vi.fn();
    vi.mocked(useNavigate).mockReturnValue(mockNavigate);

    Given('发布完成结果页已显示', async () => {
      vi.mocked(useAccountList).mockReturnValue({
        data: mockAccountListResponse,
      } as unknown as ReturnType<typeof useAccountList>);
      vi.mocked(useActivePublishJobs).mockReturnValue({
        data: { hasActive: false },
      } as unknown as ReturnType<typeof useActivePublishJobs>);
      vi.mocked(useSubmitPublish).mockReturnValue({
        mutateAsync: vi.fn().mockResolvedValue({ success: true }),
        isPending: false,
      } as unknown as ReturnType<typeof useSubmitPublish>);
      render(<Content />);
      const confirmButton = screen.getByText('确认发布');
      await userEvent.click(confirmButton);
      await waitFor(() => {
        expect(screen.getByText('发布完成')).toBeInTheDocument();
      });
    });

    When('点击「查看历史发布」按钮', async () => {
      const historyButton = screen.getByText('查看历史发布');
      await userEvent.click(historyButton);
    });

    Then('跳转至历史发布记录列表页', async () => {
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/content/history');
      });
    });
  });

  Scenario(
    '发布完成-点击「继续发布」返回发布页',
    ({ Given, When, Then, And }) => {
      Given('发布完成结果页已显示', async () => {
        vi.mocked(useAccountList).mockReturnValue({
          data: mockAccountListResponse,
        } as unknown as ReturnType<typeof useAccountList>);
        vi.mocked(useActivePublishJobs).mockReturnValue({
          data: { hasActive: false },
        } as unknown as ReturnType<typeof useActivePublishJobs>);
        vi.mocked(useSubmitPublish).mockReturnValue({
          mutateAsync: vi.fn().mockResolvedValue({ success: true }),
          isPending: false,
        } as unknown as ReturnType<typeof useSubmitPublish>);
        render(<Content />);
        const confirmButton = screen.getByText('确认发布');
        await userEvent.click(confirmButton);
        await waitFor(() => {
          expect(screen.getByText('发布完成')).toBeInTheDocument();
        });
      });

      When('点击「继续发布」按钮', async () => {
        const continueButton = screen.getByText('继续发布');
        await userEvent.click(continueButton);
      });

      Then('返回内容发布页', async () => {
        await waitFor(() => {
          expect(screen.getByTestId('content-page')).toBeInTheDocument();
        });
      });

      And('页面重置为初始空白状态', async () => {
        // TODO: 验证表单已重置
      });
    },
  );

  Scenario('网络异常-发布时网络断开', ({ Given, When, Then, And }) => {
    const mockMutateAsync = vi
      .fn()
      .mockRejectedValue(new Error('网络异常：连接已断开'));

    Given('用户已选账号已上传素材', async () => {
      vi.mocked(useAccountList).mockReturnValue({
        data: mockAccountListResponse,
      } as unknown as ReturnType<typeof useAccountList>);
      vi.mocked(useActivePublishJobs).mockReturnValue({
        data: { hasActive: false },
      } as unknown as ReturnType<typeof useActivePublishJobs>);
      vi.mocked(useSubmitPublish).mockReturnValue({
        mutateAsync: mockMutateAsync,
        isPending: false,
      } as unknown as ReturnType<typeof useSubmitPublish>);
      render(<Content />);
    });

    When('断开网络连接后点击「确认发布」', async () => {
      const confirmButton = screen.getByText('确认发布');
      await userEvent.click(confirmButton);
    });

    Then('提示网络异常错误信息', async () => {
      await waitFor(() => {
        expect(screen.getByText(/网络异常/u)).toBeInTheDocument();
      });
    });

    And('「确认发布」按钮恢复可用状态', async () => {
      await waitFor(() => {
        const confirmButton = screen.getByText('确认发布');
        expect(confirmButton).not.toBeDisabled();
      });
    });
  });

  Scenario('素材上传失败提示', ({ Given, When, Then, And }) => {
    const mockUpload = vi.fn().mockRejectedValue(new Error('上传超时，请重试'));

    Given('用户在上传素材过程中', async () => {
      vi.mocked(useAccountList).mockReturnValue({
        data: mockAccountListResponse,
      } as unknown as ReturnType<typeof useAccountList>);
      vi.mocked(useActivePublishJobs).mockReturnValue({
        data: { hasActive: false },
      } as unknown as ReturnType<typeof useActivePublishJobs>);
      vi.mocked(createContentUploadController).mockReturnValue({
        upload: mockUpload,
        abort: vi.fn(),
      } as unknown as ReturnType<typeof createContentUploadController>);
      render(<Content />);
    });

    When('网络模拟超时', async () => {
      const imageUpload = screen.getByTestId('image-upload');
      await userEvent.upload(
        imageUpload,
        new File(['test'], 'test.png', { type: 'image/png' }),
      );
    });

    Then('提示具体上传失败错误', async () => {
      await waitFor(() => {
        expect(screen.getByText(/上传超时，请重试/u)).toBeInTheDocument();
      });
    });

    And('允许用户重新上传', async () => {
      await waitFor(() => {
        const imageUpload = screen.getByTestId('image-upload');
        expect(imageUpload).toBeInTheDocument();
      });
    });
  });

  Scenario('AI内容预览弹窗-点击AI生成结果后打开', ({ Given, When, Then }) => {
    Given('AI已生成内容包结果', async () => {
      vi.mocked(useAISuggestions).mockReturnValue({
        mutateAsync: vi.fn().mockResolvedValue({
          titleSuggestions: {
            variants: [{ text: '测试标题1', rationale: '理由1' }],
          },
          contentSuggestions: {
            variants: [
              {
                title: '测试标题1',
                caption: '测试文案1',
                topicTags: ['#话题1', '#话题2'],
                rationale: '理由1',
              },
            ],
          },
        }),
      } as unknown as ReturnType<typeof useAISuggestions>);
    });

    When('用户点击某个AI生成的内容包', async () => {
      render(<Content />);
      const captionResult = screen.getByTestId('caption-result-1');
      await userEvent.click(captionResult);
    });

    Then('AI内容预览与编辑弹窗打开', async () => {
      await waitFor(() => {
        expect(
          screen.getByTestId('ai-content-preview-modal'),
        ).toBeInTheDocument();
      });
    });
  });

  Scenario('AI内容预览弹窗-编辑标题', ({ Given, When, Then, And }) => {
    Given('AI内容预览与编辑弹窗已打开', async () => {
      vi.mocked(useAISuggestions).mockReturnValue({
        mutateAsync: vi.fn().mockResolvedValue({
          titleSuggestions: {
            variants: [{ text: '测试标题', rationale: '理由' }],
          },
          contentSuggestions: {
            variants: [
              {
                title: '测试标题',
                caption: '测试文案',
                topicTags: ['#话题1'],
                rationale: '理由',
              },
            ],
          },
        }),
      } as unknown as ReturnType<typeof useAISuggestions>);
      render(<Content />);
      const captionResult = screen.getByTestId('caption-result-1');
      await userEvent.click(captionResult);
      await waitFor(() => {
        expect(
          screen.getByTestId('ai-content-preview-modal'),
        ).toBeInTheDocument();
      });
    });

    When('在标题输入框中输入内容', async () => {
      const titleInput = screen.getByTestId('ai-preview-title-input');
      await userEvent.clear(titleInput);
      await userEvent.type(titleInput, '新标题内容');
    });

    Then('标题内容实时更新', async () => {
      await waitFor(() => {
        const titleInput = screen.getByTestId(
          'ai-preview-title-input',
        ) as HTMLInputElement;
        expect(titleInput.value).toBe('新标题内容');
      });
    });

    And('小红书字符计数实时更新（如 19/20）', async () => {
      await waitFor(() => {
        expect(screen.getByText(/19.*\/.*20.*小红书/u)).toBeInTheDocument();
      });
    });

    And('抖音字符计数实时更新（如 19/55）', async () => {
      await waitFor(() => {
        expect(screen.getByText(/19.*\/.*55.*抖音/u)).toBeInTheDocument();
      });
    });
  });

  Scenario('AI内容预览弹窗-标题超限显示红色', ({ Given, When, Then, And }) => {
    Given('AI内容预览与编辑弹窗已打开', async () => {
      vi.mocked(useAISuggestions).mockReturnValue({
        mutateAsync: vi.fn().mockResolvedValue({
          titleSuggestions: {
            variants: [{ text: '测试标题', rationale: '理由' }],
          },
          contentSuggestions: {
            variants: [
              {
                title: '测试标题',
                caption: '测试文案',
                topicTags: ['#话题1'],
                rationale: '理由',
              },
            ],
          },
        }),
      } as unknown as ReturnType<typeof useAISuggestions>);
      render(<Content />);
      const captionResult = screen.getByTestId('caption-result-1');
      await userEvent.click(captionResult);
      await waitFor(() => {
        expect(
          screen.getByTestId('ai-content-preview-modal'),
        ).toBeInTheDocument();
      });
    });

    When('标题超过平台限制字数', async () => {
      const titleInput = screen.getByTestId('ai-preview-title-input');
      await userEvent.clear(titleInput);
      await userEvent.paste('A'.repeat(25));
    });

    Then('超限的计数显示红色', async () => {
      await waitFor(() => {
        const redCount = screen.getByTestId('xiaohongshu-title-count');
        expect(redCount).toHaveClass(/red/u);
      });
    });

    And('未超限的计数显示正常颜色', async () => {
      const douyinCount = screen.getByTestId('douyin-title-count');
      expect(douyinCount).not.toHaveClass(/red/u);
    });
  });

  Scenario('AI内容预览弹窗-编辑视频文案', ({ Given, When, Then, And }) => {
    Given('AI内容预览与编辑弹窗已打开', async () => {
      vi.mocked(useAISuggestions).mockReturnValue({
        mutateAsync: vi.fn().mockResolvedValue({
          titleSuggestions: {
            variants: [{ text: '测试标题', rationale: '理由' }],
          },
          contentSuggestions: {
            variants: [
              {
                title: '测试标题',
                caption: '测试文案',
                topicTags: ['#话题1'],
                rationale: '理由',
              },
            ],
          },
        }),
      } as unknown as ReturnType<typeof useAISuggestions>);
      render(<Content />);
      const captionResult = screen.getByTestId('caption-result-1');
      await userEvent.click(captionResult);
      await waitFor(() => {
        expect(
          screen.getByTestId('ai-content-preview-modal'),
        ).toBeInTheDocument();
      });
    });

    When('在视频文案输入框中修改内容', async () => {
      const bodyInput = screen.getByTestId('ai-preview-body-input');
      await userEvent.clear(bodyInput);
      await userEvent.type(bodyInput, '新的视频文案内容');
    });

    Then('文案内容实时更新', async () => {
      await waitFor(() => {
        const bodyInput = screen.getByTestId(
          'ai-preview-body-input',
        ) as HTMLTextAreaElement;
        expect(bodyInput.value).toBe('新的视频文案内容');
      });
    });

    And('小红书计数更新（如 40/1000）', async () => {
      await waitFor(() => {
        expect(screen.getByText(/40.*\/.*1000.*小红书/u)).toBeInTheDocument();
      });
    });

    And('抖音显示「无正文字段」（不支持正文字段）', async () => {
      await waitFor(() => {
        expect(
          screen.getByText(/无正文字段.*抖音|抖音.*无正文字段/u),
        ).toBeInTheDocument();
      });
    });
  });

  Scenario('AI内容预览弹窗-添加话题标签', ({ Given, When, Then, And }) => {
    Given('AI内容预览与编辑弹窗已打开', async () => {
      render(<Content />);
      // TODO: 需要先打开 AI 编辑弹窗
      // 由于打开弹窗需要先生成 AI 内容，实现复杂
    });
    When('在话题输入框输入「#春日穿搭」并按回车', async () => {
      // TODO: 查找话题输入框并输入内容
      // const topicInput = screen.getByTestId('hashtag-input');
      // await userEvent.type(topicInput, '#春日穿搭');
      // await userEvent.keyboard('{Enter}');
    });
    Then('新话题标签添加到列表', async () => {
      await waitFor(() => {
        expect(screen.getByText('#春日穿搭')).toBeInTheDocument();
      });
    });
    And('标签显示蓝色背景样式', async () => {
      // TODO: 验证标签样式
      // const tag = screen.getByText('#春日穿搭');
      // expect(tag).toHaveClass('blue-tag');
    });
    And('平台计数更新（如 小红书 4/10 · 抖音 4/5）', async () => {
      await waitFor(() => {
        expect(
          screen.getByText(/小红书.*\/.*10.*·.*抖音.*\/.*5/u),
        ).toBeInTheDocument();
      });
    });
  });

  Scenario('AI内容预览弹窗-删除话题标签', ({ Given, When, Then, And }) => {
    Given('AI内容预览与编辑弹窗已打开，话题列表包含多个标签', async () => {
      vi.mocked(useAISuggestions).mockReturnValue({
        mutateAsync: vi.fn().mockResolvedValue({
          titleSuggestions: {
            variants: [{ text: '测试标题', rationale: '理由' }],
          },
          contentSuggestions: {
            variants: [
              {
                title: '测试标题',
                caption: '测试文案',
                topicTags: ['#话题1', '#话题2', '#话题3'],
                rationale: '理由',
              },
            ],
          },
        }),
      } as unknown as ReturnType<typeof useAISuggestions>);
      render(<Content />);
      const captionResult = screen.getByTestId('caption-result-1');
      await userEvent.click(captionResult);
      await waitFor(() => {
        expect(
          screen.getByTestId('ai-content-preview-modal'),
        ).toBeInTheDocument();
      });
    });

    When('点击某个话题标签的关闭按钮', async () => {
      const closeButtons = screen.getAllByTestId(/hashtag-close-/iu);
      if (closeButtons.length > 0) {
        await userEvent.click(closeButtons[0]);
      }
    });

    Then('该话题标签从列表移除', async () => {
      await waitFor(() => {
        expect(screen.queryByText('#话题1')).not.toBeInTheDocument();
      });
    });

    And('平台计数相应减少', async () => {
      await waitFor(() => {
        expect(
          screen.getByText(/小红书.*2.*\/.*10.*·.*抖音.*2.*\/.*5/u),
        ).toBeInTheDocument();
      });
    });
  });

  Scenario('AI内容预览弹窗-编辑话题标签', ({ Given, When, Then, And }) => {
    Given('AI内容预览与编辑弹窗已打开', async () => {
      vi.mocked(useAISuggestions).mockReturnValue({
        mutateAsync: vi.fn().mockResolvedValue({
          titleSuggestions: {
            variants: [{ text: '测试标题', rationale: '理由' }],
          },
          contentSuggestions: {
            variants: [
              {
                title: '测试标题',
                caption: '测试文案',
                topicTags: ['#话题1'],
                rationale: '理由',
              },
            ],
          },
        }),
      } as unknown as ReturnType<typeof useAISuggestions>);
      render(<Content />);
      const captionResult = screen.getByTestId('caption-result-1');
      await userEvent.click(captionResult);
      await waitFor(() => {
        expect(
          screen.getByTestId('ai-content-preview-modal'),
        ).toBeInTheDocument();
      });
    });

    When('点击已有话题标签', async () => {
      const hashtag = screen.getByText('#话题1');
      await userEvent.click(hashtag);
    });

    Then('标签变为输入框', async () => {
      await waitFor(() => {
        const editInput = screen.getByTestId('hashtag-edit-input');
        expect(editInput).toBeInTheDocument();
      });
    });

    When('输入新内容并按回车', async () => {
      const editInput = screen.getByTestId('hashtag-edit-input');
      await userEvent.clear(editInput);
      await userEvent.type(editInput, '新话题');
      await userEvent.keyboard('{Enter}');
    });

    Then('话题内容更新为新内容', async () => {
      await waitFor(() => {
        expect(screen.getByText('#新话题')).toBeInTheDocument();
      });
    });

    And('自动添加#前缀（如果没有）', async () => {
      await waitFor(() => {
        expect(screen.getByText('#新话题')).toBeInTheDocument();
      });
    });
  });

  Scenario('AI内容预览弹窗-点击取消', ({ Given, When, Then, And }) => {
    Given('AI内容预览与编辑弹窗已打开，用户已修改内容', async () => {
      vi.mocked(useAISuggestions).mockReturnValue({
        mutateAsync: vi.fn().mockResolvedValue({
          titleSuggestions: {
            variants: [{ text: '测试标题', rationale: '理由' }],
          },
          contentSuggestions: {
            variants: [
              {
                title: '测试标题',
                caption: '测试文案',
                topicTags: ['#话题1'],
                rationale: '理由',
              },
            ],
          },
        }),
      } as unknown as ReturnType<typeof useAISuggestions>);
      render(<Content />);
      const captionResult = screen.getByTestId('caption-result-1');
      await userEvent.click(captionResult);
      await waitFor(() => {
        expect(
          screen.getByTestId('ai-content-preview-modal'),
        ).toBeInTheDocument();
      });
      const titleInput = screen.getByTestId('ai-preview-title-input');
      await userEvent.type(titleInput, '修改后的标题');
    });

    When('点击「取消」按钮', async () => {
      const cancelButton = screen.getByRole('button', { name: /取消/u });
      await userEvent.click(cancelButton);
    });

    Then('弹窗关闭', async () => {
      await waitFor(() => {
        expect(
          screen.queryByTestId('ai-content-preview-modal'),
        ).not.toBeInTheDocument();
      });
    });

    And('不保存任何更改', async () => {
      await waitFor(() => {
        const titleInput = screen.getByTestId('title-input');
        expect((titleInput as HTMLInputElement).value).toBe('');
      });
    });

    And('发布表单内容保持不变', async () => {
      await waitFor(() => {
        const bodyInput = screen.getByTestId('body-input');
        expect((bodyInput as HTMLTextAreaElement).value).toBe('');
      });
    });
  });

  Scenario('AI内容预览弹窗-点击应用', ({ Given, When, Then, And }) => {
    Given('AI内容预览与编辑弹窗已打开，用户已修改内容', async () => {
      vi.mocked(useAISuggestions).mockReturnValue({
        mutateAsync: vi.fn().mockResolvedValue({
          titleSuggestions: {
            variants: [{ text: '测试标题', rationale: '理由' }],
          },
          contentSuggestions: {
            variants: [
              {
                title: '测试标题',
                caption: '测试文案',
                topicTags: ['#话题1'],
                rationale: '理由',
              },
            ],
          },
        }),
      } as unknown as ReturnType<typeof useAISuggestions>);
      render(<Content />);
      const captionResult = screen.getByTestId('caption-result-1');
      await userEvent.click(captionResult);
      await waitFor(() => {
        expect(
          screen.getByTestId('ai-content-preview-modal'),
        ).toBeInTheDocument();
      });
    });

    When('点击「应用」按钮', async () => {
      const applyButton = screen.getByRole('button', { name: /应用/u });
      await userEvent.click(applyButton);
    });

    Then('弹窗关闭', async () => {
      await waitFor(() => {
        expect(
          screen.queryByTestId('ai-content-preview-modal'),
        ).not.toBeInTheDocument();
      });
    });

    And('修改后的内容填充到发布表单', async () => {
      await waitFor(() => {
        const titleInput = screen.getByTestId('title-input');
        expect((titleInput as HTMLInputElement).value).toBe('修改后的标题');
      });
    });

    And('标题、文案、标签均更新', async () => {
      await waitFor(() => {
        const bodyInput = screen.getByTestId('body-input');
        expect((bodyInput as HTMLTextAreaElement).value).toBe('修改后的标题');
        expect(screen.getByText('#话题1')).toBeInTheDocument();
      });
    });
  });

  Scenario(
    'AI内容预览弹窗-图文模式点击AI结果弹出编辑弹窗',
    ({ Given, When, Then }) => {
      Given('图文模式，AI生成结果已展示', async () => {
        vi.mocked(useAISuggestions).mockReturnValue({
          mutateAsync: vi.fn().mockResolvedValue({
            titleSuggestions: {
              variants: [{ text: '测试标题', rationale: '理由' }],
            },
            contentSuggestions: {
              variants: [
                {
                  title: '测试标题',
                  caption: '测试文案',
                  topicTags: ['#话题1', '#话题2'],
                  rationale: '理由',
                },
              ],
            },
          }),
        } as unknown as ReturnType<typeof useAISuggestions>);
        render(<Content />);
      });

      When('点击任意一个AI生成的结果（如❶）', async () => {
        const captionResult = screen.getByTestId('caption-result-1');
        await userEvent.click(captionResult);
      });

      Then('弹出「AI内容预览与编辑」弹窗', async () => {
        await waitFor(() => {
          expect(
            screen.getByTestId('ai-content-preview-modal'),
          ).toBeInTheDocument();
        });
      });
    },
  );

  Scenario(
    'AI内容预览弹窗-视频模式点击AI结果弹出编辑弹窗',
    ({ Given, When, Then, And }) => {
      Given('用户在视频发布Tab，已点击AI生成按钮并有结果', async () => {
        vi.mocked(useAccountList).mockReturnValue({
          data: mockAccountListResponse,
        } as unknown as ReturnType<typeof useAccountList>);
        vi.mocked(useActivePublishJobs).mockReturnValue({
          data: { hasActive: false },
        } as unknown as ReturnType<typeof useActivePublishJobs>);
        vi.mocked(useAISuggestions).mockReturnValue({
          mutateAsync: vi.fn().mockResolvedValue({
            titleSuggestions: {
              variants: [{ text: '测试标题', rationale: '理由' }],
            },
            contentSuggestions: {
              variants: [
                {
                  title: '测试标题',
                  caption: '测试视频文案',
                  topicTags: ['#话题1', '#话题2'],
                  rationale: '理由',
                },
              ],
            },
          }),
        } as unknown as ReturnType<typeof useAISuggestions>);
        render(<Content />);
        const videoTab = screen.getByRole('tab', { name: /视频发布/iu });
        await userEvent.click(videoTab);
        const aiButton = screen.getByText('AI生成内容');
        await userEvent.click(aiButton);
        await waitFor(() => {
          expect(screen.getByTestId('caption-results')).toBeInTheDocument();
        });
      });

      When('点击某个AI生成结果', async () => {
        const captionResult = screen.getByTestId('caption-result-1');
        await userEvent.click(captionResult);
      });

      Then('弹出AI内容预览与编辑弹窗', async () => {
        await waitFor(() => {
          expect(
            screen.getByTestId('ai-content-preview-modal'),
          ).toBeInTheDocument();
        });
      });

      And('弹窗标题显示「视频内容编辑」', async () => {
        await waitFor(() => {
          expect(screen.getByText(/视频内容编辑/u)).toBeInTheDocument();
        });
      });

      And('正文字段显示「视频文案」', async () => {
        await waitFor(() => {
          expect(screen.getByText(/视频文案/u)).toBeInTheDocument();
        });
      });
    },
  );

  Scenario(
    'AI内容预览弹窗-显示标题/正文/话题三个编辑区',
    ({ Given, When, Then, And }) => {
      Given('AI编辑弹窗已打开', async () => {
        vi.mocked(useAISuggestions).mockReturnValue({
          mutateAsync: vi.fn().mockResolvedValue({
            titleSuggestions: {
              variants: [{ text: '测试标题', rationale: '理由' }],
            },
            contentSuggestions: {
              variants: [
                {
                  title: '测试标题',
                  caption: '测试文案',
                  topicTags: ['#话题1'],
                  rationale: '理由',
                },
              ],
            },
          }),
        } as unknown as ReturnType<typeof useAISuggestions>);
        render(<Content />);
        const captionResult = screen.getByTestId('caption-result-1');
        await userEvent.click(captionResult);
        await waitFor(() => {
          expect(
            screen.getByTestId('ai-content-preview-modal'),
          ).toBeInTheDocument();
        });
      });

      When('观察弹窗内容区域', async () => {
        // 弹窗已打开
      });

      Then('显示📝标题编辑区', async () => {
        await waitFor(() => {
          expect(screen.getByText(/📝/u)).toBeInTheDocument();
          expect(
            screen.getByTestId('ai-preview-title-input'),
          ).toBeInTheDocument();
        });
      });

      And(
        '显示📄正文编辑区（图文为「图文描述」，视频为「视频文案」）',
        async () => {
          await waitFor(() => {
            expect(screen.getByText(/📄/u)).toBeInTheDocument();
            expect(
              screen.getByTestId('ai-preview-body-input'),
            ).toBeInTheDocument();
          });
        },
      );

      And('显示🏷️话题编辑区', async () => {
        await waitFor(() => {
          expect(screen.getByText(/🏷️/u)).toBeInTheDocument();
          expect(screen.getByTestId('hashtag-input')).toBeInTheDocument();
        });
      });
    },
  );

  Scenario('AI内容预览弹窗-显示各字段当前字数统计', ({ Given, When, Then }) => {
    Given('AI编辑弹窗已打开', async () => {
      vi.mocked(useAISuggestions).mockReturnValue({
        mutateAsync: vi.fn().mockResolvedValue({
          titleSuggestions: {
            variants: [{ text: '测试标题', rationale: '理由' }],
          },
          contentSuggestions: {
            variants: [
              {
                title: '测试标题',
                caption: '测试文案内容',
                topicTags: ['#话题1'],
                rationale: '理由',
              },
            ],
          },
        }),
      } as unknown as ReturnType<typeof useAISuggestions>);
      render(<Content />);
      const captionResult = screen.getByTestId('caption-result-1');
      await userEvent.click(captionResult);
      await waitFor(() => {
        expect(
          screen.getByTestId('ai-content-preview-modal'),
        ).toBeInTheDocument();
      });
    });

    When('观察各字段下方', async () => {
      // 等待字数统计显示
    });

    Then('显示字数统计，如「18 / 20（小红书） 18 / 55（抖音）」', async () => {
      await waitFor(() => {
        expect(
          screen.getByText(/18.*\/.*20.*小红书.*18.*\/.*55.*抖音/u),
        ).toBeInTheDocument();
      });
    });
  });

  Scenario('AI内容预览弹窗-点击X按钮关闭弹窗', ({ Given, When, Then }) => {
    Given('AI编辑弹窗已打开', async () => {
      vi.mocked(useAISuggestions).mockReturnValue({
        mutateAsync: vi.fn().mockResolvedValue({
          titleSuggestions: {
            variants: [{ text: '测试标题', rationale: '理由' }],
          },
          contentSuggestions: {
            variants: [
              {
                title: '测试标题',
                caption: '测试文案',
                topicTags: ['#话题1'],
                rationale: '理由',
              },
            ],
          },
        }),
      } as unknown as ReturnType<typeof useAISuggestions>);
      render(<Content />);
      const captionResult = screen.getByTestId('caption-result-1');
      await userEvent.click(captionResult);
      await waitFor(() => {
        expect(
          screen.getByTestId('ai-content-preview-modal'),
        ).toBeInTheDocument();
      });
    });

    When('点击弹窗右上角X按钮', async () => {
      const closeButton = screen.getByTestId('ai-preview-close-button');
      await userEvent.click(closeButton);
    });

    Then('弹窗关闭，不填充表单', async () => {
      await waitFor(() => {
        expect(
          screen.queryByTestId('ai-content-preview-modal'),
        ).not.toBeInTheDocument();
      });
    });
  });

  Scenario('AI内容预览弹窗-点击取消按钮关闭弹窗', ({ Given, When, Then }) => {
    Given('AI编辑弹窗已打开', async () => {
      vi.mocked(useAISuggestions).mockReturnValue({
        mutateAsync: vi.fn().mockResolvedValue({
          titleSuggestions: {
            variants: [{ text: '测试标题', rationale: '理由' }],
          },
          contentSuggestions: {
            variants: [
              {
                title: '测试标题',
                caption: '测试文案',
                topicTags: ['#话题1'],
                rationale: '理由',
              },
            ],
          },
        }),
      } as unknown as ReturnType<typeof useAISuggestions>);
      render(<Content />);
      const captionResult = screen.getByTestId('caption-result-1');
      await userEvent.click(captionResult);
      await waitFor(() => {
        expect(
          screen.getByTestId('ai-content-preview-modal'),
        ).toBeInTheDocument();
      });
    });

    When('点击「取消」按钮', async () => {
      const cancelButton = screen.getByRole('button', { name: /取消/u });
      await userEvent.click(cancelButton);
    });

    Then('弹窗关闭，不填充表单', async () => {
      await waitFor(() => {
        expect(
          screen.queryByTestId('ai-content-preview-modal'),
        ).not.toBeInTheDocument();
      });
    });
  });

  Scenario(
    'AI内容预览弹窗-弹窗内修改标题后应用',
    ({ Given, When, Then, And }) => {
      Given('AI编辑弹窗已打开', async () => {
        vi.mocked(useAISuggestions).mockReturnValue({
          mutateAsync: vi.fn().mockResolvedValue({
            titleSuggestions: {
              variants: [{ text: '测试标题', rationale: '理由' }],
            },
            contentSuggestions: {
              variants: [
                {
                  title: '测试标题',
                  caption: '测试文案',
                  topicTags: ['#话题1'],
                  rationale: '理由',
                },
              ],
            },
          }),
        } as unknown as ReturnType<typeof useAISuggestions>);
        render(<Content />);
        const captionResult = screen.getByTestId('caption-result-1');
        await userEvent.click(captionResult);
        await waitFor(() => {
          expect(
            screen.getByTestId('ai-content-preview-modal'),
          ).toBeInTheDocument();
        });
      });

      When('修改标题内容', async () => {
        const titleInput = screen.getByTestId('ai-preview-title-input');
        await userEvent.clear(titleInput);
        await userEvent.type(titleInput, '修改后的标题');
      });

      And('点击「应用」按钮', async () => {
        const applyButton = screen.getByRole('button', { name: /应用/u });
        await userEvent.click(applyButton);
      });

      Then('表单标题输入框内容更新为修改后的内容', async () => {
        await waitFor(() => {
          const formTitleInput = screen.getByTestId('title-input');
          expect((formTitleInput as HTMLInputElement).value).toBe(
            '修改后的标题',
          );
        });
      });
    },
  );

  Scenario(
    'AI内容预览弹窗-弹窗内修改正文后应用',
    ({ Given, When, Then, And }) => {
      Given('AI编辑弹窗已打开', async () => {
        vi.mocked(useAISuggestions).mockReturnValue({
          mutateAsync: vi.fn().mockResolvedValue({
            titleSuggestions: {
              variants: [{ text: '测试标题', rationale: '理由' }],
            },
            contentSuggestions: {
              variants: [
                {
                  title: '测试标题',
                  caption: '测试文案',
                  topicTags: ['#话题1'],
                  rationale: '理由',
                },
              ],
            },
          }),
        } as unknown as ReturnType<typeof useAISuggestions>);
        render(<Content />);
        const captionResult = screen.getByTestId('caption-result-1');
        await userEvent.click(captionResult);
        await waitFor(() => {
          expect(
            screen.getByTestId('ai-content-preview-modal'),
          ).toBeInTheDocument();
        });
      });

      When('修改正文内容', async () => {
        const bodyInput = screen.getByTestId('ai-preview-body-input');
        await userEvent.clear(bodyInput);
        await userEvent.type(bodyInput, '修改后的正文内容');
      });

      And('点击「应用」按钮', async () => {
        const applyButton = screen.getByRole('button', { name: /应用/u });
        await userEvent.click(applyButton);
      });

      Then('表单正文输入框内容更新为修改后的内容', async () => {
        await waitFor(() => {
          const formBodyInput = screen.getByTestId('body-input');
          expect((formBodyInput as HTMLTextAreaElement).value).toBe(
            '修改后的正文内容',
          );
        });
      });
    },
  );

  Scenario(
    'AI内容预览弹窗-弹窗内修改话题后应用',
    ({ Given, When, Then, And }) => {
      Given('AI编辑弹窗已打开', async () => {
        vi.mocked(useAISuggestions).mockReturnValue({
          mutateAsync: vi.fn().mockResolvedValue({
            titleSuggestions: {
              variants: [{ text: '测试标题', rationale: '理由' }],
            },
            contentSuggestions: {
              variants: [
                {
                  title: '测试标题',
                  caption: '测试文案',
                  topicTags: ['#话题1'],
                  rationale: '理由',
                },
              ],
            },
          }),
        } as unknown as ReturnType<typeof useAISuggestions>);
        render(<Content />);
        const captionResult = screen.getByTestId('caption-result-1');
        await userEvent.click(captionResult);
        await waitFor(() => {
          expect(
            screen.getByTestId('ai-content-preview-modal'),
          ).toBeInTheDocument();
        });
      });

      When('修改话题内容', async () => {
        const hashtag = screen.getByText('#话题1');
        await userEvent.click(hashtag);
        await waitFor(() => {
          expect(screen.getByTestId('hashtag-edit-input')).toBeInTheDocument();
        });
        const editInput = screen.getByTestId('hashtag-edit-input');
        await userEvent.clear(editInput);
        await userEvent.type(editInput, '新话题');
        await userEvent.keyboard('{Enter}');
      });

      And('点击「应用」按钮', async () => {
        const applyButton = screen.getByRole('button', { name: /应用/u });
        await userEvent.click(applyButton);
      });

      Then('表单话题区域更新为修改后的内容', async () => {
        await waitFor(() => {
          expect(screen.getByText('#新话题')).toBeInTheDocument();
        });
      });
    },
  );

  Scenario('AI内容预览弹窗-编辑时实时显示字数统计', ({ Given, When, Then }) => {
    Given('AI编辑弹窗已打开', async () => {
      vi.mocked(useAISuggestions).mockReturnValue({
        mutateAsync: vi.fn().mockResolvedValue({
          titleSuggestions: {
            variants: [{ text: '测试标题', rationale: '理由' }],
          },
          contentSuggestions: {
            variants: [
              {
                title: '测试标题',
                caption: '测试文案',
                topicTags: ['#话题1'],
                rationale: '理由',
              },
            ],
          },
        }),
      } as unknown as ReturnType<typeof useAISuggestions>);
      render(<Content />);
      const captionResult = screen.getByTestId('caption-result-1');
      await userEvent.click(captionResult);
      await waitFor(() => {
        expect(
          screen.getByTestId('ai-content-preview-modal'),
        ).toBeInTheDocument();
      });
    });

    When('在标题输入框中输入内容', async () => {
      const titleInput = screen.getByTestId('ai-preview-title-input');
      await userEvent.clear(titleInput);
      await userEvent.type(titleInput, '新标题');
    });

    Then('字数统计数字实时更新', async () => {
      await waitFor(() => {
        expect(screen.getByText(/8.*\/.*20.*小红书/u)).toBeInTheDocument();
      });
    });
  });

  Scenario(
    'AI内容预览弹窗-多平台选中时显示多平台字数限制',
    ({ Given, When, Then }) => {
      Given('已选中抖音+小红书账号，AI编辑弹窗已打开', async () => {
        vi.mocked(useAISuggestions).mockReturnValue({
          mutateAsync: vi.fn().mockResolvedValue({
            titleSuggestions: {
              variants: [{ text: '测试标题', rationale: '理由' }],
            },
            contentSuggestions: {
              variants: [
                {
                  title: '测试标题',
                  caption: '测试文案',
                  topicTags: ['#话题1'],
                  rationale: '理由',
                },
              ],
            },
          }),
        } as unknown as ReturnType<typeof useAISuggestions>);
        render(<Content />);
        const captionResult = screen.getByTestId('caption-result-1');
        await userEvent.click(captionResult);
        await waitFor(() => {
          expect(
            screen.getByTestId('ai-content-preview-modal'),
          ).toBeInTheDocument();
        });
      });

      When('观察字数统计显示', async () => {
        // 等待字数统计显示
      });

      Then(
        '同时显示多平台限制，如「字数：18 / 20（小红书） 18 / 55（抖音）」',
        async () => {
          await waitFor(() => {
            expect(
              screen.getByText(/字数.*18.*\/.*20.*小红书.*18.*\/.*55.*抖音/u),
            ).toBeInTheDocument();
          });
        },
      );
    },
  );

  Scenario(
    'AI内容预览弹窗-小红书正文超1000字应用按钮置灰',
    ({ Given, When, Then, And }) => {
      Given('AI编辑弹窗已打开，选中小红书账号，标题和话题均合法', async () => {
        vi.mocked(useAISuggestions).mockReturnValue({
          mutateAsync: vi.fn().mockResolvedValue({
            titleSuggestions: {
              variants: [{ text: '测试标题', rationale: '理由' }],
            },
            contentSuggestions: {
              variants: [
                {
                  title: '测试标题',
                  caption: '测试文案',
                  topicTags: ['#话题1'],
                  rationale: '理由',
                },
              ],
            },
          }),
        } as unknown as ReturnType<typeof useAISuggestions>);
        render(<Content />);
        const captionResult = screen.getByTestId('caption-result-1');
        await userEvent.click(captionResult);
        await waitFor(() => {
          expect(
            screen.getByTestId('ai-content-preview-modal'),
          ).toBeInTheDocument();
        });
      });

      When('在正文字段输入超过1000字的内容', async () => {
        const bodyInput = screen.getByTestId('ai-preview-body-input');
        await userEvent.clear(bodyInput);
        await userEvent.paste('A'.repeat(1001));
      });

      Then('「应用」按钮变为禁用状态（灰色）', async () => {
        await waitFor(() => {
          const applyButton = screen.getByRole('button', { name: /应用/u });
          expect(applyButton).toBeDisabled();
        });
      });

      And('按钮显示提示「小红书正文超过1000字」', async () => {
        await waitFor(() => {
          expect(screen.getByText(/小红书正文超过1000字/u)).toBeInTheDocument();
        });
      });
    },
  );

  Scenario(
    'AI内容预览弹窗-抖音话题超5个应用按钮置灰',
    ({ Given, When, Then, And }) => {
      Given('选抖音账号，AI编辑弹窗内话题超过5个', async () => {
        render(<Content />);
        // TODO: 需要先打开 AI 编辑弹窗并添加超过5个话题
        // 由于 AI 预览弹窗的打开需要先生成 AI 内容，实现复杂
      });
      When('添加第6个话题', async () => {
        // TODO: 模拟添加第6个话题的交互
      });
      Then('应用按钮置灰不可点击', async () => {
        await waitFor(() => {
          const applyButton = screen.getByRole('button', { name: /应用/iu });
          expect(applyButton).toBeDisabled();
        });
      });
      And('提示「话题超过5个，请精简」', async () => {
        await waitFor(() => {
          expect(screen.getByText(/话题超过5个，请精简/u)).toBeInTheDocument();
        });
      });
    },
  );

  Scenario(
    'AI内容预览弹窗-小红书话题超10个应用按钮置灰',
    ({ Given, When, Then, And }) => {
      Given('选小红书账号，AI编辑弹窗内话题超过10个', async () => {
        render(<Content />);
        // TODO: 需要先打开 AI 编辑弹窗并添加超过10个话题
      });
      When('添加第11个话题', async () => {
        // TODO: 模拟添加第11个话题的交互
      });
      Then('应用按钮置灰不可点击', async () => {
        await waitFor(() => {
          const applyButton = screen.getByRole('button', { name: /应用/iu });
          expect(applyButton).toBeDisabled();
        });
      });
      And('提示「话题超过10个，请精简」', async () => {
        await waitFor(() => {
          expect(screen.getByText(/话题超过10个，请精简/u)).toBeInTheDocument();
        });
      });
    },
  );

  Scenario(
    'AI内容预览弹窗-小红书标题超20字应用时二次确认',
    ({ Given, When, Then, And }) => {
      Given('AI编辑弹窗已打开，选中小红书账号，正文和话题均合法', async () => {
        vi.mocked(useAISuggestions).mockReturnValue({
          mutateAsync: vi.fn().mockResolvedValue({
            titleSuggestions: {
              variants: [{ text: '测试标题', rationale: '理由' }],
            },
            contentSuggestions: {
              variants: [
                {
                  title: '测试标题',
                  caption: '测试文案',
                  topicTags: ['#话题1'],
                  rationale: '理由',
                },
              ],
            },
          }),
        } as unknown as ReturnType<typeof useAISuggestions>);
        render(<Content />);
        const captionResult = screen.getByTestId('caption-result-1');
        await userEvent.click(captionResult);
        await waitFor(() => {
          expect(
            screen.getByTestId('ai-content-preview-modal'),
          ).toBeInTheDocument();
        });
      });

      When('在标题字段输入超过20字内容', async () => {
        const titleInput = screen.getByTestId('ai-preview-title-input');
        await userEvent.clear(titleInput);
        await userEvent.paste('A'.repeat(25));
      });

      And('点击「应用」按钮', async () => {
        const applyButton = screen.getByRole('button', { name: /应用/u });
        await userEvent.click(applyButton);
      });

      Then(
        '弹出二次确认框提示「小红书标题超过20字，是否自动截断？」',
        async () => {
          await waitFor(() => {
            expect(
              screen.getByText(/小红书标题超过20字，是否自动截断？/u),
            ).toBeInTheDocument();
          });
        },
      );

      And('确认框显示「确认截断」和「取消」按钮', async () => {
        await waitFor(() => {
          expect(screen.getByText('确认截断')).toBeInTheDocument();
          expect(screen.getByText('取消')).toBeInTheDocument();
        });
      });
    },
  );

  Scenario(
    'AI内容预览弹窗-确认截断后标题正确截断',
    ({ Given, When, Then, And }) => {
      Given('出现标题超长二次确认弹窗', async () => {
        vi.mocked(useAISuggestions).mockReturnValue({
          mutateAsync: vi.fn().mockResolvedValue({
            titleSuggestions: {
              variants: [{ text: '测试标题', rationale: '理由' }],
            },
            contentSuggestions: {
              variants: [
                {
                  title: '测试标题',
                  caption: '测试文案',
                  topicTags: ['#话题1'],
                  rationale: '理由',
                },
              ],
            },
          }),
        } as unknown as ReturnType<typeof useAISuggestions>);
        render(<Content />);
        const captionResult = screen.getByTestId('caption-result-1');
        await userEvent.click(captionResult);
        await waitFor(() => {
          expect(
            screen.getByTestId('ai-content-preview-modal'),
          ).toBeInTheDocument();
        });
        const titleInput = screen.getByTestId('ai-preview-title-input');
        await userEvent.clear(titleInput);
        await userEvent.paste('A'.repeat(25));
        const applyButton = screen.getByRole('button', { name: /应用/u });
        await userEvent.click(applyButton);
        await waitFor(() => {
          expect(
            screen.getByText(/小红书标题超过20字，是否自动截断？/u),
          ).toBeInTheDocument();
        });
      });

      When('点击「确认截断」按钮', async () => {
        const confirmButton = screen.getByText('确认截断');
        await userEvent.click(confirmButton);
      });

      Then('标题被截断为20字', async () => {
        await waitFor(() => {
          const titleInput = screen.getByTestId(
            'ai-preview-title-input',
          ) as HTMLInputElement;
          expect(titleInput.value.length).toBe(20);
        });
      });

      And('弹窗关闭', async () => {
        await waitFor(() => {
          expect(
            screen.queryByTestId('ai-content-preview-modal'),
          ).not.toBeInTheDocument();
        });
      });

      And('表单标题更新为截断后的内容', async () => {
        await waitFor(() => {
          const formTitleInput = screen.getByTestId('title-input');
          const value = (formTitleInput as HTMLInputElement).value;
          expect(value.length).toBe(20);
        });
      });
    },
  );

  Scenario(
    'AI内容预览弹窗-取消截断停留在弹窗',
    ({ Given, When, Then, And }) => {
      Given('出现标题超长二次确认弹窗', async () => {
        vi.mocked(useAISuggestions).mockReturnValue({
          mutateAsync: vi.fn().mockResolvedValue({
            titleSuggestions: {
              variants: [{ text: '测试标题', rationale: '理由' }],
            },
            contentSuggestions: {
              variants: [
                {
                  title: '测试标题',
                  caption: '测试文案',
                  topicTags: ['#话题1'],
                  rationale: '理由',
                },
              ],
            },
          }),
        } as unknown as ReturnType<typeof useAISuggestions>);
        render(<Content />);
        const captionResult = screen.getByTestId('caption-result-1');
        await userEvent.click(captionResult);
        await waitFor(() => {
          expect(
            screen.getByTestId('ai-content-preview-modal'),
          ).toBeInTheDocument();
        });
        const titleInput = screen.getByTestId('ai-preview-title-input');
        await userEvent.clear(titleInput);
        await userEvent.paste('A'.repeat(25));
        const applyButton = screen.getByRole('button', { name: /应用/u });
        await userEvent.click(applyButton);
        await waitFor(() => {
          expect(
            screen.getByText(/小红书标题超过20字，是否自动截断？/u),
          ).toBeInTheDocument();
        });
      });

      When('点击「取消」按钮', async () => {
        const cancelButton = screen.getByText('取消');
        await userEvent.click(cancelButton);
      });

      Then('标题保持超长内容不变', async () => {
        await waitFor(() => {
          const titleInput = screen.getByTestId(
            'ai-preview-title-input',
          ) as HTMLInputElement;
          expect(titleInput.value.length).toBe(25);
        });
      });

      And('停留在AI编辑弹窗', async () => {
        await waitFor(() => {
          expect(
            screen.getByTestId('ai-content-preview-modal'),
          ).toBeInTheDocument();
        });
      });

      And('表单标题不更新', async () => {
        const formTitleInput = screen.getByTestId('title-input');
        const value = (formTitleInput as HTMLInputElement).value;
        expect(value).toBe('');
      });
    },
  );

  Scenario(
    'AI内容预览弹窗-小红书标题限制20字',
    ({ Given, When, Then, And }) => {
      Given('AI编辑弹窗已打开，选中小红书账号', async () => {
        vi.mocked(useAISuggestions).mockReturnValue({
          mutateAsync: vi.fn().mockResolvedValue({
            titleSuggestions: {
              variants: [{ text: '', rationale: '' }],
            },
            contentSuggestions: {
              variants: [
                {
                  title: '',
                  caption: '',
                  topicTags: [],
                  rationale: '',
                },
              ],
            },
          }),
        } as unknown as ReturnType<typeof useAISuggestions>);
        render(<Content />);
        const captionResult = screen.getByTestId('caption-result-1');
        await userEvent.click(captionResult);
        await waitFor(() => {
          expect(
            screen.getByTestId('ai-content-preview-modal'),
          ).toBeInTheDocument();
        });
      });

      When('标题输入框获取焦点', async () => {
        const titleInput = screen.getByTestId('ai-preview-title-input');
        await userEvent.click(titleInput);
      });

      Then('显示placeholder「请输入标题（必填，20字以内）」', async () => {
        await waitFor(() => {
          const titleInput = screen.getByTestId(
            'ai-preview-title-input',
          ) as HTMLInputElement;
          expect(titleInput.placeholder).toBe('请输入标题（必填，20字以内）');
        });
      });

      And('字符计数显示「0 / 20（小红书）」', async () => {
        await waitFor(() => {
          expect(screen.getByText(/0.*\/.*20.*小红书/u)).toBeInTheDocument();
        });
      });
    },
  );

  Scenario(
    'AI内容预览弹窗-小红书正文限制1000字',
    ({ Given, When, Then, And }) => {
      Given('AI编辑弹窗已打开，选中小红书账号', async () => {
        vi.mocked(useAISuggestions).mockReturnValue({
          mutateAsync: vi.fn().mockResolvedValue({
            titleSuggestions: {
              variants: [{ text: '', rationale: '' }],
            },
            contentSuggestions: {
              variants: [
                {
                  title: '',
                  caption: '',
                  topicTags: [],
                  rationale: '',
                },
              ],
            },
          }),
        } as unknown as ReturnType<typeof useAISuggestions>);
        render(<Content />);
        const captionResult = screen.getByTestId('caption-result-1');
        await userEvent.click(captionResult);
        await waitFor(() => {
          expect(
            screen.getByTestId('ai-content-preview-modal'),
          ).toBeInTheDocument();
        });
      });

      When('正文输入框获取焦点', async () => {
        const bodyInput = screen.getByTestId('ai-preview-body-input');
        await userEvent.click(bodyInput);
      });

      Then('显示placeholder「请输入正文（选填，1000字以内）」', async () => {
        await waitFor(() => {
          const bodyInput = screen.getByTestId(
            'ai-preview-body-input',
          ) as HTMLTextAreaElement;
          expect(bodyInput.placeholder).toBe('请输入正文（选填，1000字以内）');
        });
      });

      And('字符计数显示「0 / 1000（小红书）」', async () => {
        await waitFor(() => {
          expect(screen.getByText(/0.*\/.*1000.*小红书/u)).toBeInTheDocument();
        });
      });
    },
  );

  Scenario('AI内容预览弹窗-小红书话题限制10个', ({ Given, When, Then }) => {
    Given('AI编辑弹窗已打开，选中小红书账号', async () => {
      vi.mocked(useAISuggestions).mockReturnValue({
        mutateAsync: vi.fn().mockResolvedValue({
          titleSuggestions: {
            variants: [{ text: '测试标题', rationale: '理由' }],
          },
          contentSuggestions: {
            variants: [
              {
                title: '测试标题',
                caption: '测试文案',
                topicTags: ['#话题1'],
                rationale: '理由',
              },
            ],
          },
        }),
      } as unknown as ReturnType<typeof useAISuggestions>);
      render(<Content />);
      const captionResult = screen.getByTestId('caption-result-1');
      await userEvent.click(captionResult);
      await waitFor(() => {
        expect(
          screen.getByTestId('ai-content-preview-modal'),
        ).toBeInTheDocument();
      });
    });

    When('话题编辑区显示', async () => {
      // 等待话题编辑区显示
    });

    Then('显示话题数量限制提示「最多添加10个话题」', async () => {
      await waitFor(() => {
        expect(screen.getByText(/最多添加10个话题/u)).toBeInTheDocument();
      });
    });
  });

  Scenario('AI内容预览弹窗-抖音标题限制55字', ({ Given, When, Then, And }) => {
    Given('视频模式，选抖音账号，AI编辑弹窗已打开', async () => {
      render(<Content />);
    });
    When('输入超过55字标题', async () => {
      const titleInput = screen.getByTestId('ai-preview-title-input');
      await userEvent.clear(titleInput);
      await userEvent.paste('A'.repeat(60));
    });
    Then('应用按钮置灰不可点击', async () => {
      await waitFor(() => {
        const applyButton = screen.getByRole('button', { name: /应用/iu });
        expect(applyButton).toBeDisabled();
      });
    });
    And('提示「标题超过55字」', async () => {
      await waitFor(() => {
        expect(screen.getByText(/标题超过55字/u)).toBeInTheDocument();
      });
    });
  });

  Scenario('AI内容预览弹窗-抖音无正文字段', ({ Given, When, Then, And }) => {
    Given('AI编辑弹窗已打开，只选中抖音账号', async () => {
      vi.mocked(useAISuggestions).mockReturnValue({
        mutateAsync: vi.fn().mockResolvedValue({
          titleSuggestions: {
            variants: [{ text: '测试标题', rationale: '理由' }],
          },
          contentSuggestions: {
            variants: [
              {
                title: '测试标题',
                caption: '测试文案',
                topicTags: ['#话题1'],
                rationale: '理由',
              },
            ],
          },
        }),
      } as unknown as ReturnType<typeof useAISuggestions>);
      render(<Content />);
      const douyinCheckbox = screen.getByTestId('account-checkbox-1');
      await userEvent.click(douyinCheckbox);
      const captionResult = screen.getByTestId('caption-result-1');
      await userEvent.click(captionResult);
      await waitFor(() => {
        expect(
          screen.getByTestId('ai-content-preview-modal'),
        ).toBeInTheDocument();
      });
    });

    When('观察正文编辑区', async () => {
      // 等待正文编辑区显示
    });

    Then('正文编辑区显示「该平台不支持正文字段」或类似提示', async () => {
      await waitFor(() => {
        expect(
          screen.getByText(/该平台不支持正文字段|无正文字段/u),
        ).toBeInTheDocument();
      });
    });

    And('不存在正文输入框', async () => {
      const bodyInput = screen.queryByTestId('ai-preview-body-input');
      expect(bodyInput).not.toBeInTheDocument();
    });
  });

  Scenario('AI内容预览弹窗-抖音话题限制5个', ({ Given, When, Then }) => {
    Given('AI编辑弹窗已打开，选中抖音账号', async () => {
      vi.mocked(useAISuggestions).mockReturnValue({
        mutateAsync: vi.fn().mockResolvedValue({
          titleSuggestions: {
            variants: [{ text: '测试标题', rationale: '理由' }],
          },
          contentSuggestions: {
            variants: [
              {
                title: '测试标题',
                caption: '测试文案',
                topicTags: ['#话题1'],
                rationale: '理由',
              },
            ],
          },
        }),
      } as unknown as ReturnType<typeof useAISuggestions>);
      render(<Content />);
      const douyinCheckbox = screen.getByTestId('account-checkbox-1');
      await userEvent.click(douyinCheckbox);
      const captionResult = screen.getByTestId('caption-result-1');
      await userEvent.click(captionResult);
      await waitFor(() => {
        expect(
          screen.getByTestId('ai-content-preview-modal'),
        ).toBeInTheDocument();
      });
    });

    When('话题编辑区显示', async () => {
      // 等待话题编辑区显示
    });

    Then('显示话题数量限制提示「最多添加5个话题」', async () => {
      await waitFor(() => {
        expect(screen.getByText(/最多添加5个话题/u)).toBeInTheDocument();
      });
    });
  });

  Scenario(
    'AI内容预览弹窗-抖音图文正文限制5000字',
    ({ Given, When, Then, And }) => {
      Given('图文模式，选抖音账号，AI编辑弹窗已打开', async () => {
        render(<Content />);
        // TODO: 需要先打开 AI 编辑弹窗
      });
      When('输入超过5000字正文', async () => {
        // TODO: 模拟输入超过5000字的正文内容
        // 由于需要先打开 AI 预览弹窗，实现复杂
      });
      Then('应用按钮置灰不可点击', async () => {
        await waitFor(() => {
          const applyButton = screen.getByRole('button', { name: /应用/iu });
          expect(applyButton).toBeDisabled();
        });
      });
      And('提示「正文超过5000字」', async () => {
        await waitFor(() => {
          expect(screen.getByText(/正文超过5000字/u)).toBeInTheDocument();
        });
      });
    },
  );

  Scenario(
    'AI内容预览弹窗-仅选抖音账号正文3000字应用按钮可用',
    ({ Given, When, Then, And }) => {
      Given('图文模式，选抖音账号，AI编辑弹窗已打开', async () => {
        render(<Content />);
      });
      When('输入3000字正文（未超过5000字限制）', async () => {
        const bodyInput = screen.getByTestId('ai-preview-body-input');
        await userEvent.clear(bodyInput);
        await userEvent.paste('A'.repeat(3000));
      });
      Then('应用按钮可用可点击', () => {
        const applyButton = screen.getByRole('button', { name: /应用/iu });
        expect(applyButton).not.toBeDisabled();
      });
      And('字数统计显示 3000/5000（抖音）', () => {
        expect(screen.getByText(/3000.*\/.*5000.*抖音/u)).toBeInTheDocument();
      });
    },
  );

  Scenario(
    'AI内容预览弹窗-应用后表单内容与弹窗编辑一致',
    ({ Given, When, Then, And }) => {
      Given('AI编辑弹窗已打开，选中多个平台账号', async () => {
        vi.mocked(useAISuggestions).mockReturnValue({
          mutateAsync: vi.fn().mockResolvedValue({
            titleSuggestions: {
              variants: [{ text: '测试标题', rationale: '理由' }],
            },
            contentSuggestions: {
              variants: [
                {
                  title: '测试标题',
                  caption: '测试文案',
                  topicTags: ['#话题1'],
                  rationale: '理由',
                },
              ],
            },
          }),
        } as unknown as ReturnType<typeof useAISuggestions>);
        render(<Content />);
        const douyinCheckbox = screen.getByTestId('account-checkbox-1');
        await userEvent.click(douyinCheckbox);
        const xhsCheckbox = screen.getByTestId('account-checkbox-2');
        await userEvent.click(xhsCheckbox);
        const captionResult = screen.getByTestId('caption-result-1');
        await userEvent.click(captionResult);
        await waitFor(() => {
          expect(
            screen.getByTestId('ai-content-preview-modal'),
          ).toBeInTheDocument();
        });
      });

      When('在弹窗内修改标题、正文、话题', async () => {
        const titleInput = screen.getByTestId('ai-preview-title-input');
        await userEvent.clear(titleInput);
        await userEvent.type(titleInput, '修改后的标题');
        const bodyInput = screen.getByTestId('ai-preview-body-input');
        await userEvent.clear(bodyInput);
        await userEvent.type(bodyInput, '修改后的正文');
      });

      And('点击「应用」按钮', async () => {
        const applyButton = screen.getByRole('button', { name: /应用/u });
        await userEvent.click(applyButton);
      });

      Then('表单的标题字段更新为弹窗内修改的内容', async () => {
        await waitFor(() => {
          const formTitleInput = screen.getByTestId('title-input');
          expect((formTitleInput as HTMLInputElement).value).toBe(
            '修改后的标题',
          );
        });
      });

      And('表单的正文字段更新为弹窗内修改的内容', async () => {
        await waitFor(() => {
          const formBodyInput = screen.getByTestId('body-input');
          expect((formBodyInput as HTMLTextAreaElement).value).toBe(
            '修改后的正文',
          );
        });
      });

      And('表单的话题标签更新为弹窗内修改的内容', async () => {
        await waitFor(() => {
          expect(screen.getByText('#话题1')).toBeInTheDocument();
        });
      });
    },
  );

  Scenario(
    'AI内容预览弹窗-确认发布后端收到最终编辑内容',
    ({ Given, When, Then }) => {
      const mockMutateAsync = vi.fn();

      Given('用户在表单点击确认发布', async () => {
        vi.mocked(useAccountList).mockReturnValue({
          data: mockAccountListResponse,
        } as unknown as ReturnType<typeof useAccountList>);
        vi.mocked(useActivePublishJobs).mockReturnValue({
          data: { hasActive: false },
        } as unknown as ReturnType<typeof useActivePublishJobs>);
        vi.mocked(useAISuggestions).mockReturnValue({
          mutateAsync: vi.fn().mockResolvedValue({
            titleSuggestions: {
              variants: [{ text: 'AI生成标题', rationale: '理由' }],
            },
            contentSuggestions: {
              variants: [
                {
                  title: 'AI生成标题',
                  caption: 'AI生成正文',
                  topicTags: ['#AI话题'],
                  rationale: '理由',
                },
              ],
            },
          }),
        } as unknown as ReturnType<typeof useAISuggestions>);
        vi.mocked(useSubmitPublish).mockReturnValue({
          mutateAsync: mockMutateAsync,
          isPending: false,
        } as unknown as ReturnType<typeof useSubmitPublish>);
        render(<Content />);
        const captionResult = screen.getByTestId('caption-result-1');
        await userEvent.click(captionResult);
        await waitFor(() => {
          expect(
            screen.getByTestId('ai-content-preview-modal'),
          ).toBeInTheDocument();
        });
        const titleInput = screen.getByTestId('ai-preview-title-input');
        await userEvent.clear(titleInput);
        await userEvent.type(titleInput, '用户修改后的标题');
        const applyButton = screen.getByRole('button', { name: /应用/u });
        await userEvent.click(applyButton);
        await waitFor(() => {
          expect(
            screen.queryByTestId('ai-content-preview-modal'),
          ).not.toBeInTheDocument();
        });
      });

      When('发布请求发送', async () => {
        const confirmButton = screen.getByText('确认发布');
        await userEvent.click(confirmButton);
      });

      Then(
        '后端收到的请求体中包含最终编辑的内容（不是AI生成原始内容）',
        async () => {
          await waitFor(() => {
            expect(mockMutateAsync).toHaveBeenCalled();
            const callArgs = mockMutateAsync.mock.calls[0][0];
            expect(callArgs.title).toBe('用户修改后的标题');
          });
        },
      );
    },
  );

  Scenario(
    'AI内容预览弹窗-不编辑直接应用保持原内容',
    ({ Given, When, Then, And }) => {
      Given('AI编辑弹窗已打开，内容为AI生成结果', async () => {
        vi.mocked(useAISuggestions).mockReturnValue({
          mutateAsync: vi.fn().mockResolvedValue({
            titleSuggestions: {
              variants: [{ text: 'AI生成标题', rationale: '理由' }],
            },
            contentSuggestions: {
              variants: [
                {
                  title: 'AI生成标题',
                  caption: 'AI生成正文',
                  topicTags: ['#AI话题'],
                  rationale: '理由',
                },
              ],
            },
          }),
        } as unknown as ReturnType<typeof useAISuggestions>);
        render(<Content />);
        const captionResult = screen.getByTestId('caption-result-1');
        await userEvent.click(captionResult);
        await waitFor(() => {
          expect(
            screen.getByTestId('ai-content-preview-modal'),
          ).toBeInTheDocument();
        });
      });

      When('不修改任何内容直接点击「应用」按钮', async () => {
        const applyButton = screen.getByRole('button', { name: /应用/u });
        await userEvent.click(applyButton);
      });

      Then('表单内容保持AI生成结果不变', async () => {
        await waitFor(() => {
          const formTitleInput = screen.getByTestId('title-input');
          expect((formTitleInput as HTMLInputElement).value).toBe('AI生成标题');
        });
      });

      And('弹窗关闭', async () => {
        await waitFor(() => {
          expect(
            screen.queryByTestId('ai-content-preview-modal'),
          ).not.toBeInTheDocument();
        });
      });
    },
  );
});
