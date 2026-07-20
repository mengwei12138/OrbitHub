import { useMutation } from '@tanstack/react-query';

import { login } from './queryOptions';
import type { LoginRequest } from './types';

interface UseLoginOptions {
  onSuccess?: (data: Awaited<ReturnType<typeof login>>) => void;
  onError?: (error: Error) => void;
}

export const useLogin = (options?: UseLoginOptions) => {
  return useMutation({
    mutationFn: (data: LoginRequest) => login(data),
    onSuccess: options?.onSuccess,
    onError: options?.onError,
  });
};
