import {
  type CopyType,
  CUSTOM_WORD_LIMIT_MAX,
  CUSTOM_WORD_LIMIT_MIN,
  type GenerationFormData,
  type ImageCount,
  type ToneStyle,
  type UseCase,
  type WordLimit,
} from './types';

/**
 * 后端 SubmitImageGenerationRequest 的 JSON 反序列化结构。
 * 字段与 backend-service `SubmitImageGenerationRequest.java` 保持一致。
 */
export interface ImageGenerationParamsRaw {
  productServiceName?: string;
  coreSellingPoints?: string;
  targetAudience?: string;
  productDesc?: string;
  usageScenario?: string;
  copyType?: string;
  toneStyle?: string;
  wordCountLimit?: string;
  structurePreference?: string;
  keywords?: string;
  forbiddenWords?: string;
  referenceLink?: string;
  fileIds?: string[];
  imageCount?: number;
}

const COPY_TYPES: readonly CopyType[] = [
  '宣传文案',
  '小红书笔记',
  '产品详情页',
  '邮件营销',
  '短视频脚本',
  '自定义类型',
];

const USE_CASES: readonly UseCase[] = [
  '',
  '小红书 / 抖音推文',
  '电商产品详情图',
  '电商产品主图',
  '其他场景',
];

const TONE_STYLES: readonly ToneStyle[] = [
  '正式',
  '幽默',
  '亲切',
  '紧迫',
  '文艺',
  '专业',
  '种草',
  '促销',
  '自定义风格',
];

const PRESET_WORD_LIMITS: readonly WordLimit[] = [50, 100, 150, 300, 0];

function resolveCopyType(raw: string | undefined): {
  copyType: CopyType;
  customCopyType: string;
} {
  if (!raw) return { copyType: '宣传文案', customCopyType: '' };
  if ((COPY_TYPES as readonly string[]).includes(raw)) {
    return { copyType: raw as CopyType, customCopyType: '' };
  }
  // 非枚举值视为「自定义类型」
  return { copyType: '自定义类型', customCopyType: raw };
}

function resolveUseCase(raw: string | undefined): {
  useCase: UseCase;
  customUseCase: string;
} {
  if (!raw) return { useCase: '', customUseCase: '' };
  if ((USE_CASES as readonly string[]).includes(raw)) {
    return { useCase: raw as UseCase, customUseCase: '' };
  }
  // 非枚举值视为「其他场景」自定义，原文回填到输入框（按 maxLength=20 截断）
  return { useCase: '其他场景', customUseCase: raw.slice(0, 20) };
}

function resolveToneStyle(raw: string | undefined): {
  toneStyle: ToneStyle;
  customToneStyle: string;
} {
  if (!raw) return { toneStyle: '种草', customToneStyle: '' };
  if ((TONE_STYLES as readonly string[]).includes(raw)) {
    return { toneStyle: raw as ToneStyle, customToneStyle: '' };
  }
  return { toneStyle: '自定义风格', customToneStyle: raw };
}

function resolveWordLimit(raw: string | undefined): {
  wordLimit: WordLimit;
  customWordLimit: string;
} {
  if (!raw?.trim()) {
    return { wordLimit: 0, customWordLimit: '' };
  }
  const n = Number.parseInt(raw.trim(), 10);
  if (!Number.isFinite(n)) {
    return { wordLimit: 0, customWordLimit: '' };
  }
  if ((PRESET_WORD_LIMITS as readonly number[]).includes(n)) {
    return { wordLimit: n as WordLimit, customWordLimit: '' };
  }
  if (n >= CUSTOM_WORD_LIMIT_MIN && n <= CUSTOM_WORD_LIMIT_MAX) {
    return { wordLimit: -1, customWordLimit: String(n) };
  }
  return { wordLimit: 0, customWordLimit: '' };
}

function resolveImageCount(raw: number | undefined): ImageCount {
  return raw === 1 ? 1 : 0;
}

/**
 * 把后端持久化的 SubmitImageGenerationRequest JSON 还原成图文生成表单初始值。
 * 仅可还原文本/枚举字段；本地未持久化原始素材文件，referenceImages 始终为空。
 */
export function buildImagePrefillForm(
  paramsRaw: string | undefined | null,
  base: GenerationFormData,
): GenerationFormData {
  if (!paramsRaw) return base;
  let parsed: ImageGenerationParamsRaw;
  try {
    parsed = JSON.parse(paramsRaw) as ImageGenerationParamsRaw;
  } catch {
    return base;
  }
  const { copyType, customCopyType } = resolveCopyType(parsed.copyType);
  const { useCase, customUseCase } = resolveUseCase(parsed.usageScenario);
  const { toneStyle, customToneStyle } = resolveToneStyle(parsed.toneStyle);
  const { wordLimit, customWordLimit } = resolveWordLimit(
    parsed.wordCountLimit,
  );
  return {
    ...base,
    referenceImages: [],
    referenceLink: parsed.referenceLink ?? '',
    productName: parsed.productServiceName ?? '',
    copyType,
    customCopyType,
    useCase,
    customUseCase,
    coreSellingPoint: parsed.coreSellingPoints ?? '',
    targetAudience: parsed.targetAudience ?? '',
    toneStyle,
    customToneStyle,
    wordLimit,
    customWordLimit,
    prohibitedWords: parsed.forbiddenWords ?? '',
    imageCount: resolveImageCount(parsed.imageCount),
  };
}
