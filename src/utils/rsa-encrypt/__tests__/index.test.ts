import { describe, expect, it } from 'vitest';

import { encryptPasswordWithDerPublicKey, toPublicKeyPem } from '../index';

/** 与 backend-service auth 测试配置一致的示例公钥（仅用于加解密单测） */
const SAMPLE_PUBLIC_KEY_B64 =
  'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAjGKHLBWfvbHN7L4miRUdnZwaIpjBhiQhEQLpjBm61JDdroXlves46LK/Mzzj8tMZGRe+SsunkFP86YYuxiEq7d+wPcuwyvVzTB7buvVfwVX8GkVqPYuo0eqP7Nepsuyt6aNTsWqVsDg9FrTgrmti6rwGuF6FdOv0QTQq7g/oyXuz0P1HqwylGOQY6Ugt5dITxVczt/VCjZskXPF5Ex0xhuVktyBJMgVWFZtgKm5UR1PnGxXkhlMaIxyzig2qfkX6o0R9+FRR/3LcP2oqhg4SJgbz2MK9rj7rV46RcmFOurNDTDZ0+fM45guRdnm3j4x8K6Qmzbum3wyqU6lXPGZdVQIDAQAB';

describe('rsa-encrypt', () => {
  it('应将 Base64 公钥包装为 PEM', () => {
    const pem = toPublicKeyPem('YWJj');
    expect(pem).toContain('-----BEGIN PUBLIC KEY-----');
    expect(pem).toContain('YWJj');
    expect(pem).toContain('-----END PUBLIC KEY-----');
  });

  it('应能使用公钥加密密码并返回 Base64 密文', () => {
    const encrypted = encryptPasswordWithDerPublicKey(
      'test-pass',
      SAMPLE_PUBLIC_KEY_B64,
    );
    expect(encrypted.length).toBeGreaterThan(0);
    expect(encrypted).toMatch(/^[A-Za-z0-9+/=]+$/u);
  });
});
