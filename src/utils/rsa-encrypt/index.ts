import JSEncrypt from 'jsencrypt';

/**
 * 将 Base64 DER 公钥包装为 PEM，供 JSEncrypt 使用（对应后端 X509 SubjectPublicKeyInfo）。
 */
export function toPublicKeyPem(publicKeyBase64: string): string {
  const body = publicKeyBase64.replace(/\s/gu, '');
  const lines = body.match(/.{1,64}/gu) ?? [body];
  return `-----BEGIN PUBLIC KEY-----\n${lines.join('\n')}\n-----END PUBLIC KEY-----`;
}

/**
 * 使用 RSA/ECB/PKCS1Padding 加密密码，返回 Base64 密文（与后端 RsaEncryptionService 一致）。
 */
export function encryptPasswordWithDerPublicKey(
  plainPassword: string,
  publicKeyBase64: string,
): string {
  const encrypt = new JSEncrypt();
  encrypt.setPublicKey(toPublicKeyPem(publicKeyBase64));
  const encrypted = encrypt.encrypt(plainPassword);
  if (!encrypted) {
    throw new Error('密码加密失败');
  }
  return encrypted;
}
