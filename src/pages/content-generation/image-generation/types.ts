import type { UploadedMediaFile } from '../video-generation/types/media';

/**
 * 文案类型枚举（中文字面值直接对接外部 shixi-open API）。
 * "自定义类型" 时需配合 {@link GenerationFormData.customCopyType} 一起提交。
 */
export type CopyType =
  | '宣传文案'
  | '小红书笔记'
  | '产品详情页'
  | '邮件营销'
  | '短视频脚本'
  | '自定义类型';

/**
 * 使用场景；可选项，空字符串表示未选。
 */
export type UseCase =
  | ''
  | '小红书 / 抖音推文'
  | '电商产品详情图'
  | '电商产品主图'
  | '其他场景';

/**
 * 语气/风格；"自定义风格" 时需配合 {@link GenerationFormData.customToneStyle}。
 */
export type ToneStyle =
  | '正式'
  | '幽默'
  | '亲切'
  | '紧迫'
  | '文艺'
  | '专业'
  | '种草'
  | '促销'
  | '自定义风格';

/** 字数限制；0 表示「不限」，-1 表示「自定义」（需配合 {@link GenerationFormData.customWordLimit}）。 */
export type WordLimit = 50 | 100 | 150 | 300 | 0 | -1;

export const CUSTOM_WORD_LIMIT_MIN = 1;
export const CUSTOM_WORD_LIMIT_MAX = 500;

/** 「其他场景」自定义文本长度上限。 */
export const CUSTOM_USE_CASE_MAX_LENGTH = 20;

/** 「自定义类型」自定义文本长度上限。 */
export const CUSTOM_COPY_TYPE_MAX_LENGTH = 20;

export type ImageCount = 0 | 1;

export type AIGeneratedMarkPosition =
  | 'bottom-left'
  | 'bottom-center'
  | 'bottom-right';

export interface GenerationFormData {
  referenceImages: UploadedMediaFile[];
  referenceLink: string;
  productName: string;
  copyType: CopyType;
  /** 选中"自定义类型"时由用户填入，作为外部 API 的真实 copyType 值。 */
  customCopyType: string;
  useCase: UseCase;
  /** 选中"其他场景"时由用户填入，作为外部 API 的真实 usageScenario 值（最长 20 字符）。 */
  customUseCase: string;
  coreSellingPoint: string;
  targetAudience: string;
  toneStyle: ToneStyle;
  /** 选中"自定义风格"时由用户填入，作为外部 API 的真实 toneStyle 值。 */
  customToneStyle: string;
  wordLimit: WordLimit;
  /** 选中「自定义」字数时填入，有效范围 1–500。 */
  customWordLimit: string;
  prohibitedWords: string;
  imageCount: ImageCount;
  aiGeneratedMarkPosition: AIGeneratedMarkPosition;
}

export interface GenerationResult {
  id: string;
  title: string;
  content: string;
  tags: string[];
  /** 外部平台生成的配图 URL，imageCount=1 且任务完成时非空。24h 内有效。 */
  images: string[];
  createdAt: Date;
  /**
   * 已 ingest 的本地 mediaAssetId 列表，与 {@link images} 索引对齐；某位为 null 表示该位 ingest 失败。
   * 由 OpenSpec change `content-generation-publish-bridge` 引入，「去发布」入口优先消费 id。
   *
   * 类型为 string：后端 Long 经 Jackson 字符串化序列化（防 JS Number 失精度）。
   */
  mediaAssetIds?: (string | null)[];
  /** 与 mediaAssetIds 索引对齐的预览 URL；失败位为 null。 */
  previewUrls?: (string | null)[];
}

export interface GenerationProgress {
  percent: number;
  estimatedTime: number;
  status: 'pending' | 'generating' | 'completed' | 'failed';
}
