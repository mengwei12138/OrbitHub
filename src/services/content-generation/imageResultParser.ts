import type { ImageGenerationTaskStatusDto } from './types';

const HASHTAG_PATTERN = /#[^\s#]+/gu;

export const splitTitleAndBody = (
  raw: string | undefined,
): { title: string; body: string } => {
  const text = (raw ?? '').replace(/\r\n/gu, '\n').trim();
  if (!text) return { title: '', body: '' };
  const paragraphBreak = text.indexOf('\n\n');
  if (paragraphBreak >= 0) {
    return {
      title: text.slice(0, paragraphBreak).trim(),
      body: text.slice(paragraphBreak + 2).trim(),
    };
  }
  const lineBreak = text.indexOf('\n');
  if (lineBreak >= 0) {
    return {
      title: text.slice(0, lineBreak).trim(),
      body: text.slice(lineBreak + 1).trim(),
    };
  }
  return { title: '', body: text };
};

export const extractTrailingTags = (
  body: string,
): { body: string; tags: string[] } => {
  if (!body) return { body: '', tags: [] };
  const segments = body.split(/\n{2,}/u);
  const lastSegment = segments[segments.length - 1]?.trim() ?? '';
  const matches = lastSegment.match(HASHTAG_PATTERN);
  if (matches && matches.length > 0) {
    const remainder = lastSegment.replace(HASHTAG_PATTERN, '').trim();
    if (!remainder || /^[\s，,.。、]+$/u.test(remainder)) {
      return {
        body: segments.slice(0, -1).join('\n\n').trim(),
        tags: matches,
      };
    }
  }
  return { body, tags: [] };
};

export type ParsedImageGenerationResult = {
  id: string;
  title: string;
  content: string;
  tags: string[];
  images: string[];
  createdAt: Date;
  /** 已 ingest 的本地 mediaAssetId 列表，与 images 索引对齐。 */
  mediaAssetIds?: (string | null)[];
  /** 与 mediaAssetIds 配套的预览 URL。 */
  previewUrls?: (string | null)[];
};

export type ParseImageGenerationResultOptions = {
  /** 表单「产品/服务名称」；有值时作为标题，正文为整段 AI 文案 */
  productServiceName?: string;
};

export const parseImageGenerationResult = (
  taskId: string,
  status: ImageGenerationTaskStatusDto,
  options?: ParseImageGenerationResultOptions,
): ParsedImageGenerationResult => {
  const productName = options?.productServiceName?.trim() ?? '';
  const apiTitle = status.title?.trim() ?? '';
  const apiTags = status.tags ?? [];
  const rawContent = (status.content ?? '').replace(/\r\n/gu, '\n').trim();

  if (productName) {
    const stripped =
      apiTags.length > 0
        ? { body: rawContent, tags: apiTags }
        : extractTrailingTags(rawContent);
    return {
      id: taskId,
      title: productName,
      content: stripped.body,
      tags: stripped.tags,
      images: status.images ?? [],
      createdAt: new Date(),
      mediaAssetIds: status.mediaAssetIds,
      previewUrls: status.previewUrls,
    };
  }

  const parsed = splitTitleAndBody(status.content);
  const rawBody = apiTitle ? (status.content ?? '') : parsed.body;
  const stripped =
    apiTags.length > 0
      ? { body: rawBody, tags: apiTags }
      : extractTrailingTags(rawBody);

  return {
    id: taskId,
    title: apiTitle || parsed.title,
    content: stripped.body,
    tags: stripped.tags,
    images: status.images ?? [],
    createdAt: new Date(),
    mediaAssetIds: status.mediaAssetIds,
    previewUrls: status.previewUrls,
  };
};
