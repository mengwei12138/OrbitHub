import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useAccountList } from '@/services/account';
import {
  useActivePublishJobs,
  usePromptTemplates,
  useSubmitPublish,
} from '@/services/content';

import Content from '../index';

vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn(),
  useLocation: () => ({ state: null }),
}));

vi.mock('@tanstack/react-query', () => ({
  useQueryClient: () => ({
    fetchQuery: vi.fn().mockResolvedValue({ list: [], hasNext: false }),
  }),
}));

vi.mock('@/services/account', () => ({
  useAccountList: vi.fn(),
}));

vi.mock('@/services/account/queryOptions', () => ({
  accountListQueryOptions: vi.fn(),
}));

vi.mock('@/services/content', async (importOriginal) => {
  const actual = (await importOriginal()) as Record<string, unknown>;
  return {
    ...actual,
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
    usePublishJob: vi.fn(() => ({
      data: undefined,
      isLoading: false,
    })),
  };
});

vi.mock('@/services/media-upload', () => ({
  cancelUploadSession: vi.fn(),
  completeUploadSession: vi.fn(),
  createUploadSession: vi.fn(),
  getUploadSession: vi.fn(),
  uploadPart: vi.fn(),
}));

vi.mock('antd', async (importOriginal) => {
  const actual = (await importOriginal()) as Record<string, unknown>;
  const ModalActual = actual.Modal as Record<string, unknown> &
    ((props: { children?: ReactNode }) => JSX.Element);
  // 让 Modal.confirm 立即调用 onOk，便于测试「截断+二次确认」的确认路径。
  const ModalMock = Object.assign(ModalActual, {
    confirm: vi.fn((opts: { onOk?: () => void }) => {
      opts.onOk?.();
      return { destroy: vi.fn(), update: vi.fn() };
    }),
  });
  return { ...actual, Modal: ModalMock };
});

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
];

describe('内容发布页 标题输入框集成', () => {
  beforeEach(() => {
    vi.mocked(useAccountList).mockReturnValue({
      data: { list: mockAccounts, total: 2 },
    } as unknown as ReturnType<typeof useAccountList>);
    vi.mocked(useActivePublishJobs).mockReturnValue({
      data: { hasActive: false },
    } as unknown as ReturnType<typeof useActivePublishJobs>);
    vi.mocked(usePromptTemplates).mockReturnValue({
      data: { templates: [] },
    } as unknown as ReturnType<typeof usePromptTemplates>);
  });

  it('渲染主表单标题输入框，placeholder 含「必填」提示', async () => {
    render(<Content />);
    await waitFor(() => {
      const input = screen.getByTestId('title-input') as HTMLInputElement;
      expect(input).toBeInTheDocument();
      expect(input.placeholder).toBe('请输入标题（必填，20字以内）');
    });
  });

  it('空标题点击发布 → 显示「请输入标题」错误，不调用提交', async () => {
    const mutateAsync = vi.fn();
    vi.mocked(useSubmitPublish).mockReturnValue({
      mutateAsync,
      isPending: false,
    } as unknown as ReturnType<typeof useSubmitPublish>);

    render(<Content />);
    await waitFor(() => screen.getByTestId('title-input'));

    const publishBtn = screen.getByRole('button', { name: /确认发布/u });
    await userEvent.click(publishBtn);

    expect(mutateAsync).not.toHaveBeenCalled();
  });
});
