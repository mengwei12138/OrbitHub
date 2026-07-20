import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { SubmitImageGenerationRequest } from '@/services/content-generation';
import * as api from '@/services/content-generation/api';

import { ImageGenerationPage } from '../index';

vi.mock('@/services/content-generation/api');

// 桩掉上传组件，避免引入真实分片上传链路
vi.mock('../../video-generation/components/UploadZoneImage', () => ({
  UploadZoneImage: () => <div data-testid="upload-zone-image" />,
}));
vi.mock('../../video-generation/utils/media', () => ({
  createMediaUploadController: () => ({}),
  toAbsoluteMediaUrl: (u: string) => u,
}));

function renderPage() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={client}>
      <MemoryRouter>
        <ImageGenerationPage />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

function fillBaseRequiredFields() {
  fireEvent.change(screen.getByPlaceholderText('例如：智能保温杯'), {
    target: { value: '智能保温杯' },
  });
  fireEvent.change(
    screen.getByPlaceholderText('例如：长效保温 2 小时、智能温度显示'),
    { target: { value: '长效保温' } },
  );
  fireEvent.change(
    screen.getByPlaceholderText('例如：25-35 岁上班族，关注健康'),
    { target: { value: '上班族' } },
  );
  // useCase 是必选 chip
  fireEvent.click(screen.getByText('小红书 / 抖音推文'));
}

describe('ImageGenerationPage', () => {
  // 关键：清空 vi.mock 自动桩的 mock.calls，避免上一个测试的 submit 残留在 mock.calls[0]
  beforeEach(() => {
    vi.clearAllMocks();
    // 给 fetchImageGenerationTaskStatus 一个稳定的 PROCESSING 桩
    // 否则 startPolling 会循环命中 undefined 返回 → 抛错 → 累积 setInterval → 撞测试超时
    vi.spyOn(api, 'fetchImageGenerationTaskStatus').mockResolvedValue({
      status: 'PROCESSING',
      progress: 10,
    });
    // handleGenerate 点击瞬间会 refetch 余额做本地积分预检（IMAGE_GENERATION_CREDITS=50），
    // 没桩会直接被新校验拦下 → 测试集体红。默认给一个充足额度，单测里需要"积分不足"分支再单独覆盖。
    vi.spyOn(api, 'fetchCreditsBalance').mockResolvedValue({
      totalPoints: 1000,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('按钮文案固定 50 积分', () => {
    renderPage();
    expect(screen.getByText('立即生成图文内容 · 50 积分')).toBeTruthy();
  });

  it('未填必填字段时按钮 disabled，不调用 submit', () => {
    renderPage();
    const submitSpy = vi
      .spyOn(api, 'submitImageGenerationTask')
      .mockResolvedValue({ taskId: 'x' });
    fireEvent.click(screen.getByText('立即生成图文内容 · 50 积分'));
    expect(submitSpy).not.toHaveBeenCalled();
  });

  it('提交时把中文枚举与 imageCount 透传给后端', async () => {
    renderPage();
    fillBaseRequiredFields();

    const submitSpy = vi
      .spyOn(api, 'submitImageGenerationTask')
      .mockResolvedValue({ taskId: 'task-1' });
    vi.spyOn(api, 'fetchImageGenerationTaskStatus').mockResolvedValue({
      status: 'PROCESSING',
      progress: 30,
    });

    fireEvent.click(screen.getByText('立即生成图文内容 · 50 积分'));

    await waitFor(() => expect(submitSpy).toHaveBeenCalled());
    const body = submitSpy.mock.calls[0]?.[0] as SubmitImageGenerationRequest;
    expect(body.productServiceName).toBe('智能保温杯');
    expect(body.coreSellingPoints).toBe('长效保温');
    expect(body.targetAudience).toBe('上班族');
    expect(body.usageScenario).toBe('小红书 / 抖音推文');
    expect(body.copyType).toBe('宣传文案');
    expect(body.toneStyle).toBe('种草');
    expect(body.imageCount).toBe(1);
  });

  it('选中自定义字数 + 填入 1–500 后，提交 wordCountLimit 为对应值', async () => {
    renderPage();
    fillBaseRequiredFields();

    fireEvent.click(screen.getByText('自定义'));
    const wordInput = await screen.findByPlaceholderText(
      '请输入 1–500 之间的字数',
    );
    fireEvent.change(wordInput, { target: { value: '200' } });

    const submitSpy = vi
      .spyOn(api, 'submitImageGenerationTask')
      .mockResolvedValue({ taskId: 'task-custom-word' });

    fireEvent.click(screen.getByText('立即生成图文内容 · 50 积分'));
    await waitFor(() => expect(submitSpy).toHaveBeenCalled());
    const body = submitSpy.mock.calls[0]?.[0] as SubmitImageGenerationRequest;
    expect(body.wordCountLimit).toBe('200');
  });

  it('选中自定义字数但未填有效值时不提交', async () => {
    renderPage();
    fillBaseRequiredFields();

    fireEvent.click(screen.getByText('自定义'));
    await screen.findByPlaceholderText('请输入 1–500 之间的字数');

    const submitSpy = vi
      .spyOn(api, 'submitImageGenerationTask')
      .mockResolvedValue({ taskId: 'x' });

    fireEvent.click(screen.getByText('立即生成图文内容 · 50 积分'));
    expect(submitSpy).not.toHaveBeenCalled();
  });

  // 修复"测试环境 49 积分依旧调用了 submit"的本地预检——
  // 不够时直接弹 InsufficientCreditsModal、不发 submit，不再依赖外部"积分不足"兜底。
  it('当前积分 < 50 时弹"积分不足"窗，不发 submit 也不发 queue-count', async () => {
    vi.spyOn(api, 'fetchCreditsBalance').mockResolvedValue({
      totalPoints: 49,
    });
    const submitSpy = vi
      .spyOn(api, 'submitImageGenerationTask')
      .mockResolvedValue({ taskId: 'should-not-be-called' });
    const queueSpy = vi
      .spyOn(api, 'fetchCopywritingQueueCount')
      .mockResolvedValue({ canCreate: true });

    renderPage();
    fillBaseRequiredFields();

    fireEvent.click(screen.getByText('立即生成图文内容 · 50 积分'));

    await waitFor(() => {
      expect(screen.getByText('积分不足')).toBeTruthy();
    });
    expect(submitSpy).not.toHaveBeenCalled();
    expect(queueSpy).not.toHaveBeenCalled();
  });

  it('选中自定义类型 + 填入内容后，提交以该内容作为 copyType', async () => {
    renderPage();
    fillBaseRequiredFields();

    fireEvent.click(screen.getByText('自定义类型'));
    // 等输入框出现再写值（chip 切换为受控渲染，需要 React 完成 commit）
    const customInput = await screen.findByPlaceholderText('请输入自定义类型');
    fireEvent.change(customInput, { target: { value: '夸张风' } });

    const submitSpy = vi
      .spyOn(api, 'submitImageGenerationTask')
      .mockResolvedValue({ taskId: 'task-2' });

    fireEvent.click(screen.getByText('立即生成图文内容 · 50 积分'));
    await waitFor(() => expect(submitSpy).toHaveBeenCalled());
    const body = submitSpy.mock.calls[0]?.[0] as SubmitImageGenerationRequest;
    expect(body.copyType).toBe('夸张风');
  });

  // 这条测试在 1100+ 测试的全量 suite 末尾跑时，jsdom 全局 timer 队列已经有大量堆积，
  // 默认 5s waitFor 不够；单独跑该文件时几百 ms 即通过。bump 到 15s 给它喘息空间。
  it('imageCount=0 时按钮文案仍为 50 积分，且 body.imageCount=0', async () => {
    renderPage();
    fillBaseRequiredFields();

    const skipBtn = screen.getByRole('button', { name: '不生成' });
    fireEvent.click(skipBtn);
    expect(screen.getByText('立即生成图文内容 · 50 积分')).toBeTruthy();

    const submitSpy = vi
      .spyOn(api, 'submitImageGenerationTask')
      .mockResolvedValue({ taskId: 'task-3' });

    fireEvent.click(screen.getByText('立即生成图文内容 · 50 积分'));
    await waitFor(() => expect(submitSpy).toHaveBeenCalled(), {
      timeout: 15000,
    });
    const body = submitSpy.mock.calls[0]?.[0] as SubmitImageGenerationRequest;
    expect(body.imageCount).toBe(0);
  }, 15000);
});
