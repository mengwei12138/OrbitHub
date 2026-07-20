import { message } from 'antd';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { fetchWorkDetail } from '@/services/content-generation';
import { copyToClipboard } from '@/utils';
import type { WorkItem } from '../../types';
import {
  buildPublishPrefillState,
  canDownloadWork,
  copyWorkText,
  isWorkActionDisabled,
  isWorkExpired,
} from '../workActions';

vi.mock('@/utils', () => ({
  copyToClipboard: vi.fn(),
}));

vi.mock('@/services/content-generation', () => ({
  fetchWorkDetail: vi.fn(),
  mapWorkDetailToItem: (detail: { id: string; contentText?: string }) =>
    ({
      id: detail.id,
      type: '图文',
      title: '',
      date: '',
      params: '',
      credits: 0,
      remainingHours: 24,
      thumbnail: 'image',
      status: 'completed',
      content: detail.contentText,
    }) as WorkItem,
}));

vi.mock('antd', () => ({
  message: {
    success: vi.fn(),
    warning: vi.fn(),
    error: vi.fn(),
    loading: vi.fn(() => () => undefined),
  },
}));

const baseWork: WorkItem = {
  id: '1',
  type: '图文',
  title: '突防装备',
  date: '2026-05-27 17:12:03',
  params: '图文 · 含配图',
  credits: 50,
  remainingHours: 24,
  thumbnail: 'image',
  status: 'completed',
};

describe('canDownloadWork', () => {
  it('图文 completed 且有 imageUrl 时可下载', () => {
    expect(
      canDownloadWork({ ...baseWork, imageUrl: 'https://example.com/a.png' }),
    ).toBe(true);
  });

  it('图文 completed 仅有 thumbnailUrl 时可下载', () => {
    expect(
      canDownloadWork({
        ...baseWork,
        thumbnailUrl: 'https://example.com/thumb.png',
      }),
    ).toBe(true);
  });

  it('视频 completed 且有 videoUrl 时可下载', () => {
    expect(
      canDownloadWork({
        ...baseWork,
        type: '视频',
        thumbnail: 'video',
        videoUrl: 'https://example.com/v.mp4',
      }),
    ).toBe(true);
  });

  it('生成中或失败时不可下载', () => {
    expect(
      canDownloadWork({
        ...baseWork,
        status: 'processing',
        imageUrl: 'https://example.com/a.png',
      }),
    ).toBe(false);
    expect(
      canDownloadWork({
        ...baseWork,
        status: 'failed',
        imageUrl: 'https://example.com/a.png',
      }),
    ).toBe(false);
  });

  it('剩余保存时间为 0 小时（已过期）时不可下载', () => {
    expect(
      canDownloadWork({
        ...baseWork,
        remainingHours: 0,
        imageUrl: 'https://example.com/a.png',
      }),
    ).toBe(false);
    expect(
      canDownloadWork({
        ...baseWork,
        type: '视频',
        thumbnail: 'video',
        remainingHours: 0,
        videoUrl: 'https://example.com/v.mp4',
      }),
    ).toBe(false);
  });
});

describe('isWorkExpired', () => {
  it('remainingHours <= 0 视为已过期', () => {
    expect(isWorkExpired({ ...baseWork, remainingHours: 0 })).toBe(true);
    expect(isWorkExpired({ ...baseWork, remainingHours: -1 })).toBe(true);
  });

  it('remainingHours > 0 仍在有效期内', () => {
    expect(isWorkExpired({ ...baseWork, remainingHours: 1 })).toBe(false);
    expect(isWorkExpired({ ...baseWork, remainingHours: 24 })).toBe(false);
  });
});

describe('isWorkActionDisabled', () => {
  it('completed 且剩余保存时间为 0 时禁用发布/重新生成', () => {
    expect(
      isWorkActionDisabled({
        ...baseWork,
        status: 'completed',
        remainingHours: 0,
      }),
    ).toBe(true);
  });

  it('completed 且仍在有效期内时启用', () => {
    expect(
      isWorkActionDisabled({
        ...baseWork,
        status: 'completed',
        remainingHours: 12,
      }),
    ).toBe(false);
  });

  it('processing 或 failed 始终禁用', () => {
    expect(isWorkActionDisabled({ ...baseWork, status: 'processing' })).toBe(
      true,
    );
    expect(isWorkActionDisabled({ ...baseWork, status: 'failed' })).toBe(true);
  });
});

describe('copyWorkText', () => {
  const mockedCopy = vi.mocked(copyToClipboard);
  const mockedFetch = vi.mocked(fetchWorkDetail);
  const mockedMessage = vi.mocked(message);

  beforeEach(() => {
    mockedCopy.mockReset();
    mockedFetch.mockReset();
    mockedMessage.success.mockReset();
    mockedMessage.warning.mockReset();
    mockedMessage.error.mockReset();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('content 已就绪时直接写入剪贴板并提示已复制', async () => {
    mockedCopy.mockResolvedValue(true);
    await copyWorkText({ ...baseWork, content: '正文内容' });
    expect(mockedFetch).not.toHaveBeenCalled();
    expect(mockedCopy).toHaveBeenCalledWith('正文内容');
    expect(mockedMessage.success).toHaveBeenCalledWith('已复制');
  });

  it('列表项缺 content 时回查详情接口补全', async () => {
    mockedFetch.mockResolvedValue({
      id: '1',
      contentText: '详情正文',
    } as never);
    mockedCopy.mockResolvedValue(true);
    await copyWorkText({ ...baseWork });
    expect(mockedFetch).toHaveBeenCalledWith('1');
    expect(mockedCopy).toHaveBeenCalledWith('详情正文');
    expect(mockedMessage.success).toHaveBeenCalledWith('已复制');
  });

  it('详情回查后仍无正文时仅提示，不调用剪贴板', async () => {
    mockedFetch.mockResolvedValue({ id: '1', contentText: '' } as never);
    await copyWorkText({ ...baseWork });
    expect(mockedCopy).not.toHaveBeenCalled();
    expect(mockedMessage.warning).toHaveBeenCalledWith('暂无可复制的文本');
  });

  it('剪贴板写入失败时提示降级方案', async () => {
    mockedCopy.mockResolvedValue(false);
    await copyWorkText({ ...baseWork, content: '正文内容' });
    expect(mockedMessage.error).toHaveBeenCalledWith(
      '复制失败，请手动选择文本',
    );
  });
});

describe('buildPublishPrefillState', () => {
  it('图文作品有 imageMediaAssetIds 时返回 id 路径 state', () => {
    const work: WorkItem = {
      id: '1',
      type: '图文',
      title: '突防装备',
      date: '2026-05-27 17:12:03',
      params: '图文 · 含配图',
      credits: 50,
      remainingHours: 24,
      thumbnail: 'image',
      status: 'completed',
      content: '突防装备战术背心，轻量化设计。',
      // 旧 24h 外链字段仍在，但 buildPublishPrefillState 必须只消费 mediaAssetIds
      imageUrl: 'https://example.com/a.png',
      imageMediaAssetIds: ['567'],
    };
    expect(buildPublishPrefillState(work)).toEqual({
      contentMode: 'IMAGE',
      title: '突防装备',
      content: '突防装备战术背心，轻量化设计。',
      imageMediaAssetIds: ['567'],
    });
  });

  it('视频作品有 videoMediaAssetId 时返回 id 路径 state', () => {
    const work: WorkItem = {
      id: '2',
      type: '视频',
      title: '跑车售卖',
      date: '2026-05-27 17:33:10',
      params: '10秒 · 9:16',
      credits: 250,
      remainingHours: 24,
      thumbnail: 'video',
      status: 'completed',
      content: '19岁的你，是不是早就幻想过开着跑车炸街的样子？',
      videoUrl: 'https://example.com/v.mp4',
      videoMediaAssetId: '890',
    };
    expect(buildPublishPrefillState(work)).toEqual({
      contentMode: 'VIDEO',
      title: '跑车售卖',
      content: '19岁的你，是不是早就幻想过开着跑车炸街的样子？',
      videoMediaAssetId: '890',
    });
  });

  it('视频缺 mediaAssetId 时返回 null——发布页只接受 id，外链不再兜底', () => {
    const work: WorkItem = {
      ...baseWork,
      type: '视频',
      thumbnail: 'video',
      videoUrl: 'https://example.com/v.mp4',
    };
    expect(buildPublishPrefillState(work)).toBeNull();
  });

  it('图文缺 imageMediaAssetIds 时返回 null', () => {
    const work: WorkItem = {
      ...baseWork,
      imageUrl: 'https://example.com/a.png',
    };
    expect(buildPublishPrefillState(work)).toBeNull();
  });

  it('图文 imageMediaAssetIds 全为空数组时也返回 null', () => {
    const work: WorkItem = {
      ...baseWork,
      imageMediaAssetIds: [],
    };
    expect(buildPublishPrefillState(work)).toBeNull();
  });

  it('图文 imageCount=0（纯文案任务）即使没有 mediaAssetIds 也允许发布', () => {
    const work: WorkItem = {
      ...baseWork,
      imageCount: 0,
      content: '只需10元就能解锁30分钟超跑体验',
    };
    expect(buildPublishPrefillState(work)).toEqual({
      contentMode: 'IMAGE',
      title: baseWork.title,
      content: '只需10元就能解锁30分钟超跑体验',
      imageMediaAssetIds: undefined,
    });
  });

  it('图文 imageCount=1 但缺 mediaAssetIds 仍返回 null', () => {
    const work: WorkItem = {
      ...baseWork,
      imageCount: 1,
      content: '正文',
    };
    expect(buildPublishPrefillState(work)).toBeNull();
  });
});
