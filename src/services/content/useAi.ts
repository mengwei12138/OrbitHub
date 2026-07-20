import { useMutation, useQuery } from '@tanstack/react-query';
import request from '@/api/request';

import type {
  ContentAiPromptTemplatesData,
  ContentAiSuggestionsData,
  ContentAiSuggestionsRequest,
  ContentModeCode,
} from './types';

const SUGGESTIONS_URL = '/api/v1/content/ai/suggestions';

const postAiSuggestions = (data: ContentAiSuggestionsRequest) =>
  request.post<ContentAiSuggestionsData>(
    SUGGESTIONS_URL,
    data,
  ) as unknown as Promise<ContentAiSuggestionsData>;

export const getAISuggestions = async (
  data: ContentAiSuggestionsRequest,
): Promise<ContentAiSuggestionsData> => {
  const result = await postAiSuggestions(data);
  return result;
};

export const useAISuggestions = () =>
  useMutation({
    mutationFn: getAISuggestions,
  });

export type PromptTemplatesQueryParams = {
  contentMode?: ContentModeCode;
  includeDisabled?: boolean;
};

export const getPromptTemplates = (params?: PromptTemplatesQueryParams) =>
  request.get<ContentAiPromptTemplatesData>(
    '/api/v1/content/ai/prompt-templates',
    { params },
  ) as unknown as Promise<ContentAiPromptTemplatesData>;

export const usePromptTemplates = (params?: PromptTemplatesQueryParams) =>
  useQuery({
    queryKey: ['content', 'ai', 'prompt-templates', params],
    queryFn: () => getPromptTemplates(params),
  });
