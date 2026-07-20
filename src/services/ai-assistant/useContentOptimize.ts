import { useMutation, useQuery } from '@tanstack/react-query';

import {
  applyOptimization,
  lowDataContentsQueryOptions,
  optimizeContent,
  optimizeThresholdQueryOptions,
  republishTaskQueryOptions,
  submitRepublish,
  updateOptimizeThreshold,
} from './queryOptions';
import type {
  ApplyOptimizationParam,
  LowDataContentQueryParams,
  OptimizeContentResponse,
  RepublishParam,
} from './types';

export const useOptimizeThreshold = () =>
  useQuery(optimizeThresholdQueryOptions());

export const useUpdateOptimizeThreshold = () =>
  useMutation({
    mutationFn: updateOptimizeThreshold,
  });

export const useLowDataContents = (params: LowDataContentQueryParams) =>
  useQuery({
    ...lowDataContentsQueryOptions(params),
    staleTime: 1000 * 30,
  });

export const useOptimizeContent = () =>
  useMutation<OptimizeContentResponse, Error, string>({
    mutationFn: (contentId: string) => optimizeContent(contentId),
  });

export const useApplyOptimization = () =>
  useMutation({
    mutationFn: ({
      contentId,
      data,
    }: {
      contentId: string;
      data: ApplyOptimizationParam;
    }) => applyOptimization(contentId, data),
  });

export const useSubmitRepublish = () =>
  useMutation({
    mutationFn: (data: RepublishParam) => submitRepublish(data),
  });

export const useRepublishTask = (
  taskId: string | undefined,
  options?: { enabled?: boolean },
) =>
  useQuery({
    ...republishTaskQueryOptions(taskId ?? ''),
    enabled: Boolean(taskId) && (options?.enabled ?? true),
  });
