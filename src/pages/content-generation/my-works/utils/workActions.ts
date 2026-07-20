import { message } from 'antd';
import type { PublishPrefillState } from '@/pages/content/types';
import {
  fetchWorkDetail,
  mapWorkDetailToItem,
} from '@/services/content-generation';
import { copyToClipboard } from '@/utils';
import type { WorkItem } from '../types';

export const triggerVideoDownload = (url: string, fileName: string) => {
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  a.target = '_blank';
  a.rel = 'noopener noreferrer';
  document.body.appendChild(a);
  a.click();
  a.remove();
};

/** 剩余保存时间 <= 0 视为已过期：作品文件不再可访问，禁用下载/发布/重新生成。 */
export const isWorkExpired = (work: WorkItem) =>
  typeof work.remainingHours === 'number' && work.remainingHours <= 0;

export const isWorkActionDisabled = (work: WorkItem) =>
  work.status === 'processing' ||
  work.status === 'failed' ||
  isWorkExpired(work);

/** 图文产物图片地址：优先 imageUrl，列表缩略图 thumbnailUrl 兜底 */
export const resolveWorkImageUrl = (work: WorkItem): string | undefined =>
  work.imageUrl ?? work.thumbnailUrl;

export const canDownloadWork = (work: WorkItem): boolean => {
  if (isWorkActionDisabled(work)) return false;
  if (work.type === '视频') return !!work.videoUrl;
  if (work.type === '图文') return !!resolveWorkImageUrl(work);
  return false;
};

export const downloadWork = (work: WorkItem) => {
  if (work.type === '视频' && work.videoUrl) {
    triggerVideoDownload(work.videoUrl, `${work.title || work.id}.mp4`);
    message.success('开始下载');
    return;
  }
  const imageUrl = resolveWorkImageUrl(work);
  if (work.type === '图文' && imageUrl) {
    triggerVideoDownload(imageUrl, `${work.title || work.id}.png`);
    message.success('开始下载');
    return;
  }
  message.error('暂无可下载的文件');
};

/** 与作品详情页「去发布」一致：跳转内容发布模块 */
export const resolveWorkPublishPath = () => '/content';

/** 与作品详情页「重新生成」一致：按作品类型跳转对应生成页 */
export const resolveWorkRegeneratePath = (work: Pick<WorkItem, 'type'>) =>
  work.type === '视频'
    ? '/content-generation/video-generation'
    : '/content-generation/image-generation';

export const resolveWorkDetailPath = (workId: string) =>
  `/content-generation/works/${workId}`;

/**
 * 我的作品 / 作品详情「去发布」→ 内容发布页 route state。
 *
 * <p>由 OpenSpec change `content-generation-publish-bridge` 改造：发布页只接受已 ingest 的
 * `mediaAssetId`，**不再**透传 24h 外链。`work` 必须含 `videoMediaAssetId` /
 * `imageMediaAssetIds` 才能进入发布；缺失时返回 `null`，调用方应屏蔽跳转 + 提示用户。</p>
 */
export const buildPublishPrefillState = (
  work: WorkItem,
): PublishPrefillState | null => {
  const contentMode = work.type === '视频' ? 'VIDEO' : 'IMAGE';
  if (contentMode === 'VIDEO') {
    if (typeof work.videoMediaAssetId !== 'string') return null;
    return {
      contentMode,
      title: work.title,
      content: work.content?.trim() || undefined,
      videoMediaAssetId: work.videoMediaAssetId,
    };
  }
  // 图文：当提交时 imageCount=0（纯文案任务）时允许发布、不强制 mediaAssetIds；
  // 其它情况必须有有效 imageMediaAssetIds。空 imageCount（旧数据/后端未回填）做保守处理：
  // 按 mediaAssetIds 是否存在决定，避免历史作品全被屏蔽。
  const imageIds = work.imageMediaAssetIds?.filter(
    (id): id is string => typeof id === 'string',
  );
  const isTextOnly = work.imageCount === 0;
  if (!isTextOnly && (!imageIds || imageIds.length === 0)) return null;
  return {
    contentMode,
    title: work.title,
    content: work.content?.trim() || undefined,
    imageMediaAssetIds: imageIds && imageIds.length > 0 ? imageIds : undefined,
  };
};

/** 图文作品复制正文：列表项常缺 content，content 已就绪时不再打详情。 */
export async function copyWorkText(work: WorkItem): Promise<void> {
  const resolved = await ensureWorkContent(work);
  const text = resolved.content?.trim() ?? '';
  if (!text) {
    message.warning('暂无可复制的文本');
    return;
  }
  if (await copyToClipboard(text)) {
    message.success('已复制');
  } else {
    message.error('复制失败，请手动选择文本');
  }
}

/** content 已就绪时跳过详情请求；适合「复制正文」这类只看文案的场景。 */
async function ensureWorkContent(work: WorkItem): Promise<WorkItem> {
  if (work.content?.trim() || work.status !== 'completed') {
    return work;
  }
  try {
    const detail = await fetchWorkDetail(work.id);
    return mapWorkDetailToItem(detail);
  } catch {
    return work;
  }
}

/**
 * 「去发布」前置：拉一次详情拿到最新 mediaAssetIds。详情接口会同时：
 *  · 补全 content_text（必要时按 taskId 回查外部平台）
 *  · 触发 ingest fast-path（见 `ContentGenerationWorkQueryService.ensureIngested`），把
 *    上次轮询失败的 mediaAssetId 在用户线程内补跑一次
 *
 * <p>refetch 跳过条件：content + mediaAssetIds 都已就绪，避免无意义的回查。</p>
 */
export async function resolveWorkForPublish(work: WorkItem): Promise<WorkItem> {
  if (work.status !== 'completed') {
    return work;
  }
  const hasContent = !!work.content?.trim();
  const hasMediaIds =
    work.type === '视频'
      ? typeof work.videoMediaAssetId === 'string'
      : !!work.imageMediaAssetIds && work.imageMediaAssetIds.length > 0;
  if (hasContent && hasMediaIds) {
    return work;
  }
  try {
    const detail = await fetchWorkDetail(work.id);
    return mapWorkDetailToItem(detail);
  } catch {
    return work;
  }
}

export async function navigateToPublishWork(
  work: WorkItem,
  navigate: (path: string, options: { state: PublishPrefillState }) => void,
): Promise<void> {
  const hide = message.loading('正在加载作品内容…', 0);
  try {
    const resolved = await resolveWorkForPublish(work);
    const state = buildPublishPrefillState(resolved);
    if (!state) {
      message.error(
        '素材尚未就绪（系统正在把生成结果保存到本地），请几秒后再试',
      );
      return;
    }
    navigate(resolveWorkPublishPath(), { state });
  } finally {
    hide();
  }
}
