// 评论域 · 内部接口（爬虫调用）
// 仅供集成场景使用；前端通常不直接消费

import { useQuery } from '@tanstack/react-query';

import { commentFetchTargetsQueryOptions } from './queryOptions';
import type { CommentFetchTargetsQueryParams } from './types';

export const useCommentFetchTargets = (
  params: CommentFetchTargetsQueryParams | undefined,
  options?: { enabled?: boolean },
) =>
  useQuery({
    ...commentFetchTargetsQueryOptions(
      params ?? { phoneNumber: '', platform: 'douyin' },
    ),
    enabled: Boolean(params) && (options?.enabled ?? true),
  });
