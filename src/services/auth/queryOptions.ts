import request from '@/api/request';

import { withRsaEncryptedPassword } from './rsaPassword';
import type { LoginRequest, TokenResponse } from './types';

export const login = (data: LoginRequest) =>
  withRsaEncryptedPassword(
    data.password,
    (password) =>
      request.post<TokenResponse>('/api/v1/auth/login', {
        username: data.username,
        password,
      }) as unknown as Promise<TokenResponse>,
  );
