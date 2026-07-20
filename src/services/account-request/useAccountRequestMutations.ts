import { useMutation } from '@tanstack/react-query';
import {
  createAccountRequest,
  reviewAccountRequest,
} from './queryOptions';
import type {
  CreateAccountRequestPayload,
  ReviewAccountRequestPayload,
} from './types';

type UseCreateAccountRequestOptions = {
  onSuccess?: (data: Awaited<ReturnType<typeof createAccountRequest>>) => void;
  onError?: (error: Error) => void;
};

export const useCreateAccountRequest = (
  options?: UseCreateAccountRequestOptions,
) =>
  useMutation({
    mutationFn: (data: CreateAccountRequestPayload) => createAccountRequest(data),
    onSuccess: options?.onSuccess,
    onError: options?.onError,
  });

type UseReviewAccountRequestOptions = {
  onSuccess?: (data: Awaited<ReturnType<typeof reviewAccountRequest>>) => void;
  onError?: (error: Error) => void;
};

export const useReviewAccountRequest = (
  options?: UseReviewAccountRequestOptions,
) =>
  useMutation({
    mutationFn: (data: ReviewAccountRequestPayload) => reviewAccountRequest(data),
    onSuccess: options?.onSuccess,
    onError: options?.onError,
  });
