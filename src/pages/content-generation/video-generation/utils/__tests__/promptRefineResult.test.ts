import { describe, expect, it } from 'vitest';
import { isRefusalMessage } from '../promptRefineResult';

describe('isRefusalMessage', () => {
  it('null / undefined / 空串 → false', () => {
    expect(isRefusalMessage(null)).toBe(false);
    expect(isRefusalMessage(undefined)).toBe(false);
    expect(isRefusalMessage('')).toBe(false);
    expect(isRefusalMessage('   ')).toBe(false);
  });

  it('典型 refusal 文案命中', () => {
    const text =
      '由于您未提供具体的商品信息（产品名称为null且无其他内容），无法生成符合要求的视频提示词。请补充完整商品的名称、卖点、场景等关键信息后再次尝试。';
    expect(isRefusalMessage(text)).toBe(true);
  });

  it('refusal 但去掉一半特征 → 仍命中（≥2 关键短语）', () => {
    expect(
      isRefusalMessage(
        '由于您未提供具体的商品信息，无法生成符合要求的视频提示词，请补充完整商品的名称后再次尝试。',
      ),
    ).toBe(true);
  });

  it('正常润色结果 → false', () => {
    const refined =
      '【跑车介绍】流线型车身在阳光下闪耀，引擎轰鸣，速度与激情完美融合，展现极致驾驶魅力。';
    expect(isRefusalMessage(refined)).toBe(false);
  });

  it('refined 含一个 refusal 特征短语但非 refusal → false', () => {
    // 比如润色结果中提到"请用户购买"——只命中一个相关词
    const refined = '展示跑车豪华内饰，邀请观众请补充想象自己驾驶的画面。';
    expect(isRefusalMessage(refined)).toBe(false);
  });

  it('短文本即使命中关键词也不视为 refusal', () => {
    expect(isRefusalMessage('无法生成请补充')).toBe(false);
  });

  it('refinedText 恰好等于原 prompt → false（avoid 无用覆盖）', () => {
    const original = '跑车介绍';
    expect(isRefusalMessage(original, { originalPrompt: original })).toBe(
      false,
    );
  });

  it('LLM 输出包含 "请提供具体场景" + "缺少关键信息" → true', () => {
    const text =
      '当前描述过于简单，缺少关键信息，请提供具体场景、目标用户与时长，以便生成更准确的视频脚本。';
    expect(isRefusalMessage(text)).toBe(true);
  });
});
