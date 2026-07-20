/**
 * 复制文本到剪贴板。
 *
 * 优先使用 navigator.clipboard.writeText（仅 HTTPS / localhost 暴露），
 * 不可用或被拒时降级到 document.execCommand('copy')，兼容内网 HTTP 部署。
 *
 * @returns 复制是否成功
 */
export const copyToClipboard = async (text: string): Promise<boolean> => {
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // 权限被拒或非安全上下文，落到降级方案
    }
  }

  try {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'fixed';
    textarea.style.top = '0';
    textarea.style.left = '-9999px';
    document.body.appendChild(textarea);
    textarea.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(textarea);
    return ok;
  } catch {
    return false;
  }
};
