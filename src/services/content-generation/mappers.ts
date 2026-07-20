import type { WorkItem } from '@/pages/content-generation/my-works/types';

import type { WorkDetailDto, WorkSummaryDto } from './types';

const TYPE_LABEL: Record<WorkSummaryDto['type'], WorkItem['type']> = {
  video: '视频',
  image: '图文',
};

export const mapWorkSummaryToItem = (work: WorkSummaryDto): WorkItem => ({
  id: work.id,
  type: TYPE_LABEL[work.type],
  title: work.title,
  date: work.createdAt ?? '—',
  params: work.paramsSummary ?? '—',
  credits: work.credits ?? 0,
  remainingHours: work.remainingHours ?? 0,
  thumbnail: work.type === 'video' ? 'video' : 'image',
  expiringSoon: work.expiringSoon,
  status: work.status,
  failureReason: work.failureReason,
  thumbnailUrl: work.thumbnailUrl,
  videoUrl: work.videoUrl,
  imageUrl: work.imageUrl,
  content: work.content,
  paramsRaw: work.paramsRaw,
  imageCount: work.imageCount,
  videoMediaAssetId: work.videoMediaAssetId,
  imageMediaAssetIds: work.imageMediaAssetIds,
  previewUrls: work.previewUrls,
  ownerUserId: work.ownerUserId,
  ownerName: work.ownerName,
});

export const mapWorkDetailToItem = (work: WorkDetailDto): WorkItem =>
  mapWorkSummaryToItem(work);

/** 首页「我的作品」卡片展示项 */
export type MyWorksCardItem = {
  id: string;
  type: WorkItem['type'];
  title: string;
  date: string;
  /** TENANT 视角下渲染「由 {ownerName} 创建」；NORMAL 视角下前端忽略此字段。 */
  ownerName?: string;
};

export const mapWorkSummaryToCardItem = (
  work: WorkSummaryDto,
): MyWorksCardItem => {
  const item = mapWorkSummaryToItem(work);
  return {
    id: item.id,
    type: item.type,
    title: item.title,
    date: item.date.split(' ')[0] ?? item.date,
    ownerName: item.ownerName,
  };
};
