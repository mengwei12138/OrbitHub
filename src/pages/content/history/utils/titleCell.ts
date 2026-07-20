/**
 * 历史发布记录列表「标题/文案」列的展示规则（PRD V1.09 §8.1.2）：
 * - 优先展示 `title`；超过 {@link TITLE_DISPLAY_MAX} 字截断为前 30 字 + `...`；
 * - `title` 为空或仅含空白时，回退到 `captionExcerpt` 同样规则；
 * - 两者都为空时返回 `null`，由调用方决定占位符。
 *
 * Tooltip 的完整原文由调用方使用返回值 `fullText` 渲染。
 */
export const TITLE_DISPLAY_MAX = 30;

export type TitleCellInput = {
  title?: string | null;
  captionExcerpt?: string | null;
};

export type TitleCellResult = {
  display: string;
  fullText: string;
} | null;

const hasText = (s?: string | null): s is string =>
  typeof s === 'string' && s.trim().length > 0;

export const buildTitleCell = ({
  title,
  captionExcerpt,
}: TitleCellInput): TitleCellResult => {
  const source = hasText(title)
    ? title
    : hasText(captionExcerpt)
      ? captionExcerpt
      : '';
  if (!source) {
    return null;
  }
  const display =
    source.length > TITLE_DISPLAY_MAX
      ? `${source.slice(0, TITLE_DISPLAY_MAX)}...`
      : source;
  return { display, fullText: source };
};
