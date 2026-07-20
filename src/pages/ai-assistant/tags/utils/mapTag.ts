import type {
  Tag,
  TagApplicablePlatform,
  TagCategory,
} from '@/services/ai-assistant/types';

import type { TagRecord } from '../components/TabTable/types';

export type TagPlatformUi = 'ALL' | 'DOUYIN' | 'XIAOHONGSHU';

export const platformUiToApi = (p: TagPlatformUi): TagApplicablePlatform =>
  p === 'ALL' ? 'all' : p === 'DOUYIN' ? 'douyin' : 'xiaohongshu';

/** UI 展示用：去掉契约中的 # 前缀 */
export const stripHashPrefix = (name: string): string =>
  name.startsWith('#') ? name.slice(1) : name;

/** 提交创建/更新：契约示例为 `#标签名` */
export const normalizeTagNameForApi = (raw: string): string => {
  const t = raw.trim();
  if (!t) {
    return t;
  }
  return t.startsWith('#') ? t : `#${t}`;
};

const CATEGORY_PLACEHOLDER = '—';

export type CategoryStyle = {
  backgroundColor: string;
  textColor: string;
};

const CATEGORY_STYLES: Record<string, CategoryStyle> = {
  hot: { backgroundColor: '#FFF2F0', textColor: '#FF4D4F' },
  content: { backgroundColor: '#F5F5F5', textColor: '#7C51D8' },
  emotion: { backgroundColor: '#F6F0FC', textColor: '#722ED1' },
};

export const getCategoryDisplayName = (
  code: string | null | undefined,
  categoryOptions: TagCategory[],
): string => {
  if (code == null || code === '') {
    return CATEGORY_PLACEHOLDER;
  }
  if (categoryOptions.length === 0) {
    return code;
  }
  const found = categoryOptions.find((opt) => opt.code === code);
  return found?.name ?? CATEGORY_PLACEHOLDER;
};

export const getCategoryStyle = (
  code: string | null | undefined,
): CategoryStyle | null => {
  if (code == null || code === '') {
    return null;
  }
  return CATEGORY_STYLES[code] ?? null;
};

export const mapTagToRecord = (
  tag: Tag,
  categoryOptions: TagCategory[],
): TagRecord => ({
  id: tag.tagId,
  name: stripHashPrefix(tag.name),
  category: getCategoryDisplayName(tag.category, categoryOptions),
  categoryCode: tag.category ?? null,
  usageCount: tag.usageCount ?? 0,
  lastUsedAt: tag.lastUsedAt ?? null,
  status: tag.status === 'enabled' ? 'ENABLED' : 'DISABLED',
  platform:
    tag.applicablePlatform === 'all'
      ? 'ALL'
      : tag.applicablePlatform === 'douyin'
        ? 'DOUYIN'
        : 'XIAOHONGSHU',
  createdByName: tag.createdByName,
  editable: tag.editable,
});
