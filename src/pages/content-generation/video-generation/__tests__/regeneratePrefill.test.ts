import { describe, expect, it } from 'vitest';
import type { VideoGenerationFormData } from '../index';
import { buildVideoPrefillForm } from '../regeneratePrefill';

const BASE: VideoGenerationFormData = {
  images: [],
  videos: [],
  prompt: '',
  aiGeneratedMarkPosition: 'bottom-left',
  videoLength: 10,
  resolution: '720P',
};

describe('buildVideoPrefillForm', () => {
  it('paramsRaw 缺失时返回 base，且不带 quality 提示', () => {
    const out = buildVideoPrefillForm(undefined, BASE);
    expect(out.formData).toBe(BASE);
    expect(out.quality).toBeUndefined();
    expect(out.trial).toBeUndefined();
  });

  it('paramsRaw 非合法 JSON 时降级到 base', () => {
    const out = buildVideoPrefillForm('not-json', BASE);
    expect(out.formData).toBe(BASE);
  });

  it('回填 prompt 与合法 videoLength', () => {
    const raw = JSON.stringify({
      trial: false,
      quality: 'premium',
      prompt: '一段介绍智能手表的视频',
      videoLength: 15,
      videoAspectRatio: '9:16',
    });
    const out = buildVideoPrefillForm(raw, BASE);
    expect(out.formData.prompt).toBe('一段介绍智能手表的视频');
    expect(out.formData.videoLength).toBe(15);
    expect(out.formData.images).toEqual([]);
    expect(out.formData.videos).toEqual([]);
    expect(out.formData.avatar).toBeUndefined();
    expect(out.formData.resolution).toBe('720P');
    expect(out.quality).toBe('premium');
    expect(out.trial).toBe(false);
  });

  it('非枚举 videoLength 回退到 base.videoLength', () => {
    const raw = JSON.stringify({
      trial: true,
      quality: 'standard',
      videoLength: 7,
    });
    const out = buildVideoPrefillForm(raw, BASE);
    expect(out.formData.videoLength).toBe(BASE.videoLength);
    expect(out.quality).toBe('standard');
    expect(out.trial).toBe(true);
  });

  it('quality 非 premium 一律视为 standard', () => {
    const raw = JSON.stringify({ trial: false, quality: 'unknown' });
    const out = buildVideoPrefillForm(raw, BASE);
    expect(out.quality).toBe('standard');
  });
});
