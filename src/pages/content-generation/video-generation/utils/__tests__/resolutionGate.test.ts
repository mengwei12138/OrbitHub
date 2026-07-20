import { describe, expect, it } from 'vitest';
import {
  checkVideoResolution,
  maxResolutionLabelForQuality,
  maxShortEdgeForQuality,
  RESOLUTION_TOLERANCE_PX,
} from '../resolutionGate';

describe('checkVideoResolution', () => {
  it('未配置上限时直接通过', () => {
    expect(checkVideoResolution(1920, 1080, undefined).ok).toBe(true);
    expect(checkVideoResolution(1920, 1080, null).ok).toBe(true);
  });

  it('probe 数据不可用（0 / NaN）时不拦截，交给后端兜底', () => {
    expect(checkVideoResolution(0, 0, 720).ok).toBe(true);
    expect(checkVideoResolution(Number.NaN, 1080, 720).ok).toBe(true);
  });

  it('短边等于上限：通过', () => {
    // 横屏 720P：1280x720，短边 720
    expect(checkVideoResolution(1280, 720, 720).ok).toBe(true);
    // 竖屏 720P：720x1280，短边同样 720
    expect(checkVideoResolution(720, 1280, 720).ok).toBe(true);
  });

  it('短边略超容差内：通过', () => {
    expect(
      checkVideoResolution(1280, 720 + RESOLUTION_TOLERANCE_PX, 720).ok,
    ).toBe(true);
  });

  it('1080P 视频在 720 上限下被拦截，错误文案包含分辨率与档位', () => {
    const res = checkVideoResolution(1920, 1080, 720, '720P');
    expect(res.ok).toBe(false);
    expect(res.reason).toContain('1920×1080');
    expect(res.reason).toContain('720P');
  });

  it('1080P 视频在 1080 上限下通过', () => {
    expect(checkVideoResolution(1920, 1080, 1080).ok).toBe(true);
  });

  it('4K 视频在 1080 上限下被拦截', () => {
    const res = checkVideoResolution(3840, 2160, 1080, '1080P');
    expect(res.ok).toBe(false);
    expect(res.reason).toContain('1080P');
  });

  it('label 缺省时回退到 {maxShortEdge}P 文案', () => {
    const res = checkVideoResolution(1920, 1080, 720);
    expect(res.ok).toBe(false);
    expect(res.reason).toContain('720P');
  });
});

describe('maxShortEdgeForQuality', () => {
  it('premium → 1080，其余 → 720', () => {
    expect(maxShortEdgeForQuality('premium')).toBe(1080);
    expect(maxShortEdgeForQuality('standard')).toBe(720);
    expect(maxShortEdgeForQuality('trial')).toBe(720);
  });
});

describe('maxResolutionLabelForQuality', () => {
  it('premium → 1080P，其余 → 720P', () => {
    expect(maxResolutionLabelForQuality('premium')).toBe('1080P');
    expect(maxResolutionLabelForQuality('standard')).toBe('720P');
  });
});
