import type { Resolution, VideoLength } from './components/ContentConfigForm';
import type { VideoGenerationFormData } from './index';

/**
 * 后端 SubmitVideoGenerationRequest 的 JSON 反序列化结构。
 * 字段与 backend-service `SubmitVideoGenerationRequest.java` 保持一致。
 */
export interface VideoGenerationParamsRaw {
  trial?: boolean;
  quality?: string;
  prompt?: string;
  imageUrls?: string[];
  videoUrls?: string[];
  avatarId?: string;
  videoLength?: number;
  videoAspectRatio?: string;
  title?: string;
}

const VIDEO_LENGTHS: readonly VideoLength[] = [5, 8, 10, 12, 15];

function resolveVideoLength(
  raw: number | undefined,
  fallback: VideoLength,
): VideoLength {
  if (raw == null) return fallback;
  return (VIDEO_LENGTHS as readonly number[]).includes(raw)
    ? (raw as VideoLength)
    : fallback;
}

/**
 * 把后端持久化的 SubmitVideoGenerationRequest JSON 还原成视频生成表单初始值。
 * 仅可还原文本/枚举字段；本地未持久化原始素材文件与虚拟人详情，
 * images / videos / avatar 始终为空，需用户重新选择。
 */
export function buildVideoPrefillForm(
  paramsRaw: string | undefined | null,
  base: VideoGenerationFormData,
): {
  formData: VideoGenerationFormData;
  /** 仅文本字段从历史还原；标记给上层用于决定是否切换 trial/premium。 */
  quality?: 'standard' | 'premium';
  trial?: boolean;
} {
  if (!paramsRaw) return { formData: base };
  let parsed: VideoGenerationParamsRaw;
  try {
    parsed = JSON.parse(paramsRaw) as VideoGenerationParamsRaw;
  } catch {
    return { formData: base };
  }
  const quality: 'standard' | 'premium' | undefined =
    parsed.quality === 'premium' ? 'premium' : 'standard';
  return {
    formData: {
      ...base,
      images: [],
      videos: [],
      avatar: undefined,
      prompt: parsed.prompt ?? '',
      videoLength:
        parsed.trial && parsed.videoLength === 15
          ? 12
          : resolveVideoLength(parsed.videoLength, base.videoLength),
      // 后端无独立 resolution 字段（仅 videoAspectRatio=9:16），保留 base 默认值。
      resolution: base.resolution as Resolution,
    },
    quality,
    trial: parsed.trial,
  };
}
