import type { VideoLength } from '../components/ContentConfigForm';

const STANDARD_CREDITS: Record<VideoLength, number> = {
  5: 125,
  8: 200,
  10: 250,
  12: 300,
  15: 375,
};

const PREMIUM_CREDITS: Record<VideoLength, number> = {
  5: 150,
  8: 240,
  10: 300,
  12: 360,
  15: 450,
};

const AVATAR_CREDITS = 100;

/** 按 PRD 7.4.5 积分表计算本次生成所需积分（不含免费试用） */
export function calcVideoGenerationCredits(
  quality: 'standard' | 'premium',
  videoLength: VideoLength,
  hasAvatar: boolean,
): number {
  const base =
    quality === 'premium'
      ? PREMIUM_CREDITS[videoLength]
      : STANDARD_CREDITS[videoLength];
  return base + (hasAvatar ? AVATAR_CREDITS : 0);
}
