import { useMutation, useQuery } from '@tanstack/react-query';

import {
  createTag,
  createTagCategory,
  disableTag,
  enableTag,
  tagCategoriesQueryOptions,
  tagStatsQueryOptions,
  tagsQueryOptions,
  updateTag,
} from './queryOptions';
import type {
  CreateTagCategoryParam,
  CreateTagParam,
  TagListQueryParams,
  UpdateTagParam,
} from './types';

export const useTags = (params: TagListQueryParams) =>
  useQuery(tagsQueryOptions(params));

export const useTagStats = () => useQuery(tagStatsQueryOptions());

export const useCreateTag = () =>
  useMutation({
    mutationFn: (data: CreateTagParam) => createTag(data),
  });

export const useUpdateTag = () =>
  useMutation({
    mutationFn: ({ tagId, data }: { tagId: string; data: UpdateTagParam }) =>
      updateTag(tagId, data),
  });

export const useDisableTag = () =>
  useMutation({
    mutationFn: (tagId: string) => disableTag(tagId),
  });

export const useEnableTag = () =>
  useMutation({
    mutationFn: (tagId: string) => enableTag(tagId),
  });

export const useTagCategories = () => useQuery(tagCategoriesQueryOptions());

export const useCreateTagCategory = () =>
  useMutation({
    mutationFn: (data: CreateTagCategoryParam) => createTagCategory(data),
  });
