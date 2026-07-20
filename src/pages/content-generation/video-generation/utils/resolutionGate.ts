/**
 * 视频生成「上传素材」分辨率档位校验。
 *
 * <p>纯函数，便于在不依赖 DOM 的环境下单测；UploadZoneVideo.beforeUpload 用浏览器 probe
 * 拿到 width/height 之后调用 {@link checkVideoResolution} 决定是否拦截。</p>
 */

/** 浏览器 probe 得到的宽高常有 1~2px 抖动，给上限留一点容差避免误杀。 */
export const RESOLUTION_TOLERANCE_PX = 2;

export interface ResolutionCheckResult {
  ok: boolean;
  /** 拒绝时给用户的友好原因；ok=true 时为 undefined。 */
  reason?: string;
}

/**
 * 按当前质量档位的上限校验上传视频分辨率。
 *
 * - 用短边（min(width,height)）判断，对横屏 / 竖屏统一处理。
 * - 缺少有效 width/height（probe 失败）时不拦截，交给后端兜底报错。
 *
 * @param width      probe 到的视频宽（像素）
 * @param height     probe 到的视频高（像素）
 * @param maxShortEdge 当前档位允许的短边上限；不传或 null 跳过校验
 * @param label      展示给用户的档位文案，如 "720P"；未传时回退到 `${maxShortEdge}P`
 */
export function checkVideoResolution(
  width: number,
  height: number,
  maxShortEdge: number | null | undefined,
  label?: string,
): ResolutionCheckResult {
  if (maxShortEdge == null) return { ok: true };
  if (!Number.isFinite(width) || !Number.isFinite(height)) return { ok: true };
  if (width <= 0 || height <= 0) return { ok: true };
  const shortEdge = Math.min(width, height);
  if (shortEdge <= maxShortEdge + RESOLUTION_TOLERANCE_PX) {
    return { ok: true };
  }
  const cap = label ?? `${maxShortEdge}P`;
  return {
    ok: false,
    reason: `视频分辨率（${width}×${height}）超出当前质量档位上限 ${cap}，请更换更低分辨率的视频`,
  };
}

/** 当前生成质量档位 → 短边上限（标准 720 / 高级 1080）。 */
export function maxShortEdgeForQuality(
  quality: 'standard' | 'premium' | string,
): number {
  return quality === 'premium' ? 1080 : 720;
}

/** 当前生成质量档位 → 用户文案。 */
export function maxResolutionLabelForQuality(
  quality: 'standard' | 'premium' | string,
): string {
  return quality === 'premium' ? '1080P' : '720P';
}
