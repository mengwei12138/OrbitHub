import request from '@/api/request';

import { encryptPasswordWithDerPublicKey } from '@/utils/rsa-encrypt';

/** 与后端 AuthErrorCode.PUBLIC_KEY_EXPIRED 一致 */
export const AUTH_PUBLIC_KEY_EXPIRED_CODE = 40110;

type PublicKeyResponse = {
  public_key: string;
};

type ErrorWithCode = Error & { code?: number };

let cachedPublicKey: string | null = null;

export function clearAuthPublicKeyCache(): void {
  cachedPublicKey = null;
}

export async function loadAuthPublicKey(forceRefresh = false): Promise<string> {
  if (!forceRefresh && cachedPublicKey) {
    return cachedPublicKey;
  }
  const data = (await request.get<PublicKeyResponse>(
    '/api/v1/auth/public-key',
  )) as unknown as PublicKeyResponse;
  if (!data?.public_key) {
    throw new Error('获取公钥失败');
  }
  cachedPublicKey = data.public_key;
  return cachedPublicKey;
}

function isPublicKeyExpiredError(error: unknown): boolean {
  const code = (error as ErrorWithCode)?.code;
  return code === AUTH_PUBLIC_KEY_EXPIRED_CODE;
}

/**
 * 使用内存缓存的 RSA 公钥加密密码；遇 40110 时刷新公钥并重试一次。
 */
export async function withRsaEncryptedPassword<T>(
  plainPassword: string,
  action: (encryptedPassword: string) => Promise<T>,
): Promise<T> {
  const run = async (forceRefreshKey: boolean) => {
    const publicKey = await loadAuthPublicKey(forceRefreshKey);
    const encrypted = encryptPasswordWithDerPublicKey(plainPassword, publicKey);
    return action(encrypted);
  };

  try {
    return await run(false);
  } catch (error) {
    if (!isPublicKeyExpiredError(error)) {
      throw error;
    }
    clearAuthPublicKeyCache();
    try {
      return await run(true);
    } catch (retryError) {
      if (isPublicKeyExpiredError(retryError)) {
        throw new Error('系统初始化失败，请刷新页面重试');
      }
      throw retryError;
    }
  }
}
