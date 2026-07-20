import type {
  PlatformCode,
  PublishRecordStage,
  PublishStatusCode,
} from '@/services/content/types';

export interface PublishInfoCardProps {
  data?: {
    accountNickname?: string;
    platform: PlatformCode;
    publishedAt: string;
    platformPublishedAt?: string;
    status: PublishStatusCode;
    stage: PublishRecordStage;
    coverUrl?: string;
    platformContentUrl?: string;
    errorMessage?: string;
  };
}
