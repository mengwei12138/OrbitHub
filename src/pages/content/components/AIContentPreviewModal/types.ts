export type PlatformCountItem = {
  current: number;
  limit: number;
};

export type PlatformCountUnavailable = { available: false };

export type PlatformCountValue = PlatformCountItem | PlatformCountUnavailable;

export type PlatformCount = {
  xiaohongshu: PlatformCountValue;
  douyin: PlatformCountValue;
};

export type AIContentPreviewModalProps = {
  open: boolean;
  contentType: 'IMAGE' | 'VIDEO';
  title: string;
  titleCount: PlatformCount;
  body: string;
  bodyCount: PlatformCount;
  topics: string[];
  topicCount: PlatformCount;
  onTitleChange: (value: string) => void;
  onBodyChange: (value: string) => void;
  onTopicsChange: (topics: string[]) => void;
  onCancel: () => void;
  onApply: () => void;
};
