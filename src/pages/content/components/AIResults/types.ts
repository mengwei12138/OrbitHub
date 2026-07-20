export interface CaptionResult {
  id: string;
  title: string;
  caption: string;
  topicTags: string[];
  rationale?: string | null;
}

export interface Hashtag {
  id: string;
  name: string;
}

export interface AIResultsProps {
  className?: string;
  captionResults?: CaptionResult[];
  selectedCaptionId?: string | null;
  onCaptionSelect?: (result: CaptionResult) => void;
  hashtags?: Hashtag[];
  onHashtagAdd?: () => void;
  onHashtagRemove?: (hashtag: Hashtag) => void;
  onHashtagChange?: (hashtag: Hashtag, newName: string) => void;
  maxHashtags?: number;
  isCaptionExpanded?: boolean;
  onCaptionToggleExpand?: () => void;
}
