/**
 * ContentTable 组件类型定义
 * 数据中心页面内容表现表格组件
 * Figma: https://www.figma.com/design/h0gT5MlFnxNOmOIQVd1thT/...node-id=1755-1540
 */

import type { Platform, TimeRange } from '../FilterBar/types';

export type ContentType = 'all' | 'video' | 'image_text';

export type SortBy = 'playCount' | 'likeCount' | 'commentCount';

export type PlatformType = 'douyin' | 'xiaohongshu';

export interface ContentItem {
  id: string;
  cover: string;
  titleOrText: string;
  account: string;
  accountId: string;
  platform: PlatformType;
  play: number;
  like: number;
  comment: number;
  share: number;
  interactionRate: number;
}

export interface ContentTableProps {
  timeRange: TimeRange;
  platform: Platform;
}
