/**
 * 大数字缩略展示：≥1亿「X.X亿」，≥1万「X.X万」，否则使用千分位。
 * 用于内容表现列表等指标列；KPI 卡片的 0 显示「-」由调用方单独处理。
 */
export function formatCompactCount(num: number): string {
  if (!Number.isFinite(num)) {
    return '-';
  }
  if (num >= 100_000_000) {
    return `${(num / 100_000_000).toFixed(1)}亿`;
  }
  if (num >= 10_000) {
    return `${(num / 10_000).toFixed(1)}万`;
  }
  return String(num);
}
