/**
 * 生成符合 PRD §3.2 规范的初始密码：
 * - 长度 8 位
 * - 包含数字和字母（不强制特殊字符）
 * - 至少包含 1 个数字 + 1 个字母（避免极端情况下生成 8 位全数字或全字母）
 *
 * 使用 crypto.getRandomValues 增强随机性；现代浏览器（>= ES2017）均支持。
 */
export const generateRandomPassword = (length = 8): string => {
  const digits = '0123456789';
  const letters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const all = digits + letters;

  const pickRandom = (alphabet: string): string => {
    const buf = new Uint32Array(1);
    crypto.getRandomValues(buf);
    const idx = (buf[0] ?? 0) % alphabet.length;
    return alphabet.charAt(idx);
  };

  const chars: string[] = [];
  // 保证至少 1 个数字 + 1 个字母
  chars.push(pickRandom(digits));
  chars.push(pickRandom(letters));
  while (chars.length < length) {
    chars.push(pickRandom(all));
  }
  // Fisher-Yates 洗牌，避免"前两位永远是数字+字母"的可预测
  for (let i = chars.length - 1; i > 0; i--) {
    const buf = new Uint32Array(1);
    crypto.getRandomValues(buf);
    const j = (buf[0] ?? 0) % (i + 1);
    const tmp = chars[i] ?? '';
    chars[i] = chars[j] ?? '';
    chars[j] = tmp;
  }
  return chars.join('');
};
