import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { useEffect } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { SubmitVideoGenerationRequest } from '@/services/content-generation';
import * as api from '@/services/content-generation/api';

import { VideoGenerationPage } from '../index';
import type { UploadedMediaFile } from '../types/media';

vi.mock('@/services/content-generation/api');

const doneImage: UploadedMediaFile = {
  uid: 'img-1',
  name: 'test.jpg',
  status: 'done',
  previewUrl: 'https://example.com/test.jpg',
};

vi.mock('../components/UploadZoneImage', () => ({
  UploadZoneImage: ({
    onChange,
  }: {
    onChange: (files: UploadedMediaFile[]) => void;
  }) => {
    // 仅初始化一次，避免父组件每次 render 传入新 onChange 导致循环更新
    // biome-ignore lint/correctness/useExhaustiveDependencies: invoke onChange once on mount only
    useEffect(() => {
      onChange([doneImage]);
    }, []);
    return <div data-testid="upload-zone-image" />;
  },
}));

vi.mock('../components/UploadZoneVideo', () => ({
  UploadZoneVideo: () => <div data-testid="upload-zone-video" />,
}));

vi.mock('../utils/media', () => ({
  createMediaUploadController: () => ({}),
  toAbsoluteMediaUrl: (url: string) => url,
}));

function renderPage() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={client}>
      <MemoryRouter>
        <VideoGenerationPage />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('VideoGenerationPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(api, 'fetchAvatarAssets').mockResolvedValue([]);
    vi.spyOn(api, 'fetchVideoTaskStatus').mockResolvedValue({
      status: 'COMPLETED',
      progress: 100,
      videoUrl: 'https://example.com/result.mp4',
    });
    // 付费档位 handleGenerate 会 refetch 余额做本地积分预检（10s standard = 250 积分），
    // 没桩会直接被新校验拦下；试用模式不查这层。
    vi.spyOn(api, 'fetchCreditsBalance').mockResolvedValue({
      totalPoints: 10_000,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('试用次数用尽时提交 paid 任务（trial: false）', async () => {
    vi.spyOn(api, 'fetchTrialQuota').mockResolvedValue({
      total: 3,
      remaining: 0,
    });
    const submitSpy = vi
      .spyOn(api, 'submitVideoGenerationTask')
      .mockResolvedValue({ taskId: 'task-1' });

    renderPage();

    await waitFor(() => {
      expect(screen.getByText('立即生成视频 · 需 250 积分')).toBeTruthy();
    });

    fireEvent.change(
      screen.getByPlaceholderText('请输入商品描述、场景、风格等提示词…'),
      { target: { value: '测试提示词' } },
    );
    fireEvent.click(screen.getByText('立即生成视频 · 需 250 积分'));

    await waitFor(() => {
      expect(submitSpy).toHaveBeenCalledTimes(1);
    });

    const body = submitSpy.mock.calls[0][0] as SubmitVideoGenerationRequest;
    expect(body.trial).toBe(false);
    expect(body.quality).toBe('standard');
  });

  it('仍有试用次数且处于试用模式时提交 trial: true', async () => {
    vi.spyOn(api, 'fetchTrialQuota').mockResolvedValue({
      total: 3,
      remaining: 2,
    });
    const submitSpy = vi
      .spyOn(api, 'submitVideoGenerationTask')
      .mockResolvedValue({ taskId: 'task-2' });

    renderPage();

    await waitFor(() => {
      expect(screen.getByText('免费试用生成视频 · 剩余 2 次')).toBeTruthy();
    });

    fireEvent.change(
      screen.getByPlaceholderText('请输入商品描述、场景、风格等提示词…'),
      { target: { value: '试用提示词' } },
    );
    fireEvent.click(screen.getByText('免费试用生成视频 · 剩余 2 次'));

    await waitFor(() => {
      expect(submitSpy).toHaveBeenCalledTimes(1);
    });

    const body = submitSpy.mock.calls[0][0] as SubmitVideoGenerationRequest;
    expect(body.trial).toBe(true);
    expect(body.quality).toBeUndefined();
  });

  // 修复"测试环境积分不足依旧调用了 submit"的本地预检——付费档位拦下，trial 模式不受影响。
  it('付费档位余额不足 requiredCredits 时弹"积分不足"窗，不发 submit 也不发 queue-count', async () => {
    vi.spyOn(api, 'fetchTrialQuota').mockResolvedValue({
      total: 3,
      remaining: 0,
    });
    vi.spyOn(api, 'fetchCreditsBalance').mockResolvedValue({
      totalPoints: 100, // 10s standard 需 250 → 不够
    });
    const submitSpy = vi
      .spyOn(api, 'submitVideoGenerationTask')
      .mockResolvedValue({ taskId: 'should-not-be-called' });
    const queueSpy = vi
      .spyOn(api, 'fetchVideoQueueCount')
      .mockResolvedValue({ canCreate: true });

    renderPage();

    await waitFor(() => {
      expect(screen.getByText('立即生成视频 · 需 250 积分')).toBeTruthy();
    });
    fireEvent.change(
      screen.getByPlaceholderText('请输入商品描述、场景、风格等提示词…'),
      { target: { value: '测试提示词' } },
    );
    fireEvent.click(screen.getByText('立即生成视频 · 需 250 积分'));

    await waitFor(() => {
      expect(screen.getByText('积分不足')).toBeTruthy();
    });
    expect(submitSpy).not.toHaveBeenCalled();
    expect(queueSpy).not.toHaveBeenCalled();
  });

  it('试用模式下余额为 0 也允许提交（积分预检对 trial 不生效）', async () => {
    vi.spyOn(api, 'fetchTrialQuota').mockResolvedValue({
      total: 3,
      remaining: 2,
    });
    vi.spyOn(api, 'fetchCreditsBalance').mockResolvedValue({
      totalPoints: 0,
    });
    const submitSpy = vi
      .spyOn(api, 'submitVideoGenerationTask')
      .mockResolvedValue({ taskId: 'task-trial-zero' });

    renderPage();

    await waitFor(() => {
      expect(screen.getByText('免费试用生成视频 · 剩余 2 次')).toBeTruthy();
    });
    fireEvent.change(
      screen.getByPlaceholderText('请输入商品描述、场景、风格等提示词…'),
      { target: { value: '试用提示词' } },
    );
    fireEvent.click(screen.getByText('免费试用生成视频 · 剩余 2 次'));

    await waitFor(() => {
      expect(submitSpy).toHaveBeenCalledTimes(1);
    });
    const body = submitSpy.mock.calls[0][0] as SubmitVideoGenerationRequest;
    expect(body.trial).toBe(true);
  });

  it('后端拒绝「免费试用次数已用尽」时自动切回标准质量并刷新配额', async () => {
    // 复现 bug：缓存里的 trial-quota 已陈旧，前端按 remaining>0 提交了 trial=true，
    // 后端拒绝；fix 后应自动 fallback 到 standard，并 invalidate 配额缓存。
    vi.spyOn(api, 'fetchTrialQuota').mockResolvedValue({
      total: 3,
      remaining: 1,
    });
    const submitSpy = vi
      .spyOn(api, 'submitVideoGenerationTask')
      .mockRejectedValue(new Error('免费试用次数已用尽'));

    renderPage();

    await waitFor(() => {
      expect(screen.getByText('免费试用生成视频 · 剩余 1 次')).toBeTruthy();
    });

    fireEvent.change(
      screen.getByPlaceholderText('请输入商品描述、场景、风格等提示词…'),
      { target: { value: '试用提示词' } },
    );
    fireEvent.click(screen.getByText('免费试用生成视频 · 剩余 1 次'));

    // 后端返回错误后应切回 standard 文案
    await waitFor(() => {
      expect(screen.getByText(/立即生成视频 · 需 \d+ 积分/u)).toBeTruthy();
    });
    expect(submitSpy).toHaveBeenCalledTimes(1);
  });
});
