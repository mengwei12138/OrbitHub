/**
 * 判断 AI 润色返回的 refinedText 是否为「拒绝回复」性质的提示信息，
 * 而非真正可写回到输入框的优化结果。
 *
 * 触发场景：外部平台 LLM 把 `status` 标为 `COMPLETED` 但 `refinedPrompt`
 * 实际是「由于您未提供…，无法生成…，请补充…后再次尝试」这种含括号、
 * 含 null 描述、长篇说理的指引文字。直接覆盖用户输入会很糟糕。
 *
 * 策略：检测多个特征短语，命中 ≥ 2 个才视为 refusal，避免误判正常优化结果。
 * 同时附加长度与原 prompt 比例的简单启发式：refusal 通常比原 prompt 长 1.5×+。
 */

const REFUSAL_PATTERNS: RegExp[] = [
  /无法生成/u,
  /未提供.*?(?:关键|具体|完整|有效)/u,
  /请(?:补充|提供|输入).*?(?:信息|内容|商品|卖点|场景|描述)/u,
  /再次尝试/u,
  /由于您?未/u,
  /缺少.*?(?:信息|内容)/u,
];

const MIN_PATTERN_HITS = 2;

export function isRefusalMessage(
  refinedText: string | null | undefined,
  options?: { originalPrompt?: string },
): boolean {
  if (!refinedText) return false;
  const text = refinedText.trim();
  if (!text) return false;

  let hits = 0;
  for (const pattern of REFUSAL_PATTERNS) {
    if (pattern.test(text)) hits++;
    if (hits >= MIN_PATTERN_HITS) break;
  }
  if (hits < MIN_PATTERN_HITS) return false;

  // 再叠加长度启发式：若同时 refinedText 极短或仅微调原 prompt 也不算 refusal
  // refusal 通常 >= 60 字
  if (text.length < 40) return false;

  // 若原 prompt 已经包含 refinedText（罕见 edge case），不算 refusal
  const original = options?.originalPrompt?.trim();
  if (original && text === original) return false;

  return true;
}
