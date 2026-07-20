import { describe, expect, it } from 'vitest';
import { buildImagePrefillForm } from '../regeneratePrefill';
import type { GenerationFormData } from '../types';

const BASE: GenerationFormData = {
  referenceImages: [],
  referenceLink: '',
  productName: '',
  copyType: '宣传文案',
  customCopyType: '',
  useCase: '',
  customUseCase: '',
  coreSellingPoint: '',
  targetAudience: '',
  toneStyle: '种草',
  customToneStyle: '',
  wordLimit: 300,
  customWordLimit: '',
  prohibitedWords: '',
  imageCount: 1,
  aiGeneratedMarkPosition: 'bottom-left',
};

describe('buildImagePrefillForm', () => {
  it('paramsRaw 缺失时返回 base 不变', () => {
    expect(buildImagePrefillForm(undefined, BASE)).toBe(BASE);
    expect(buildImagePrefillForm(null, BASE)).toBe(BASE);
    expect(buildImagePrefillForm('', BASE)).toBe(BASE);
  });

  it('paramsRaw 非合法 JSON 时降级到 base', () => {
    expect(buildImagePrefillForm('not-json', BASE)).toBe(BASE);
  });

  it('回填基础文本与枚举字段', () => {
    const raw = JSON.stringify({
      productServiceName: '智能手表 X1',
      coreSellingPoints: '续航长、心率精准',
      targetAudience: '都市白领',
      usageScenario: '电商产品主图',
      copyType: '小红书笔记',
      toneStyle: '幽默',
      wordCountLimit: '150',
      forbiddenWords: '最佳',
      referenceLink: 'https://example.com/a',
      imageCount: 1,
    });
    const filled = buildImagePrefillForm(raw, BASE);
    expect(filled.productName).toBe('智能手表 X1');
    expect(filled.coreSellingPoint).toBe('续航长、心率精准');
    expect(filled.targetAudience).toBe('都市白领');
    expect(filled.useCase).toBe('电商产品主图');
    expect(filled.copyType).toBe('小红书笔记');
    expect(filled.customCopyType).toBe('');
    expect(filled.toneStyle).toBe('幽默');
    expect(filled.customToneStyle).toBe('');
    expect(filled.wordLimit).toBe(150);
    expect(filled.customWordLimit).toBe('');
    expect(filled.prohibitedWords).toBe('最佳');
    expect(filled.referenceLink).toBe('https://example.com/a');
    expect(filled.imageCount).toBe(1);
    expect(filled.referenceImages).toEqual([]);
  });

  it('非枚举 copyType 落到自定义类型', () => {
    const raw = JSON.stringify({
      productServiceName: 'p',
      coreSellingPoints: 'c',
      targetAudience: 't',
      copyType: '我的自定义文案',
      imageCount: 0,
    });
    const filled = buildImagePrefillForm(raw, BASE);
    expect(filled.copyType).toBe('自定义类型');
    expect(filled.customCopyType).toBe('我的自定义文案');
  });

  it('非枚举 usageScenario 落到「其他场景」并截断到 20 字符', () => {
    const raw = JSON.stringify({
      productServiceName: 'p',
      coreSellingPoints: 'c',
      targetAudience: 't',
      usageScenario: '春节促销活动落地页配图（限时折扣）非常非常长',
      imageCount: 0,
    });
    const filled = buildImagePrefillForm(raw, BASE);
    expect(filled.useCase).toBe('其他场景');
    expect(filled.customUseCase.length).toBeLessThanOrEqual(20);
    expect(filled.customUseCase.startsWith('春节促销活动')).toBe(true);
  });

  it('枚举 usageScenario 不写入 customUseCase', () => {
    const raw = JSON.stringify({
      productServiceName: 'p',
      coreSellingPoints: 'c',
      targetAudience: 't',
      usageScenario: '电商产品主图',
      imageCount: 1,
    });
    const filled = buildImagePrefillForm(raw, BASE);
    expect(filled.useCase).toBe('电商产品主图');
    expect(filled.customUseCase).toBe('');
  });

  it('非枚举 toneStyle 落到自定义风格', () => {
    const raw = JSON.stringify({
      productServiceName: 'p',
      coreSellingPoints: 'c',
      targetAudience: 't',
      toneStyle: '复古港风',
      imageCount: 0,
    });
    const filled = buildImagePrefillForm(raw, BASE);
    expect(filled.toneStyle).toBe('自定义风格');
    expect(filled.customToneStyle).toBe('复古港风');
  });

  it('非预设字数走自定义档位', () => {
    const raw = JSON.stringify({
      productServiceName: 'p',
      coreSellingPoints: 'c',
      targetAudience: 't',
      wordCountLimit: '88',
      imageCount: 0,
    });
    const filled = buildImagePrefillForm(raw, BASE);
    expect(filled.wordLimit).toBe(-1);
    expect(filled.customWordLimit).toBe('88');
  });

  it('imageCount 非 1 时归零', () => {
    const raw = JSON.stringify({
      productServiceName: 'p',
      coreSellingPoints: 'c',
      targetAudience: 't',
      imageCount: 5,
    });
    const filled = buildImagePrefillForm(raw, BASE);
    expect(filled.imageCount).toBe(0);
  });
});
