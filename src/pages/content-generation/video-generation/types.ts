export interface Avatar {
  id: string;
  name: string;
  tag: string;
  color?: string;
}

export type VideoLength = 5 | 8 | 10 | 12 | 15;
export type Resolution = '720P' | '1080P';
export type VideoQuality = 'standard' | 'premium';

export interface VideoGenerationFormData {
  imageUrl?: string;
  videoUrl?: string;
  avatar?: Avatar;
  prompt: string;
  videoLength: VideoLength;
  resolution: Resolution;
  quality: VideoQuality;
}

export interface VideoGenerationResult {
  id: string;
  title: string;
  duration: number;
  resolution: string;
  quality: string;
  credits: number;
  videoUrl?: string;
  createdAt: Date;
}
