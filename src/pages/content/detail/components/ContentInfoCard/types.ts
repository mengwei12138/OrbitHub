import type { ContentModeCode } from '@/services/content/types';

export interface ContentInfoCardProps {
  data?: {
    title?: string;
    caption?: string;
    topicTags?: string[];
    mentions?: string[];
    contentMode: ContentModeCode;
  };
}
