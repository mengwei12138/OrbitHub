/** 评论回复页面列表展示用 UI 模型（由 OpenAPI CommentRecord 映射而来） */

export type UiComment = {
  id: string;
  accountName: string;
  platform: 'douyin' | 'xiaohongshu';
  aiCategory: 'positive' | 'negative' | 'neutral' | 'question';
  confidence?: number;
  content: string;
  suggestedReply?: string;
  createdAt: string;
};

export type UiHistoryRecord = {
  id: string;
  accountName: string;
  platform: string;
  content: string;
  replyContent: string;
  status: 'auto' | 'manual' | 'blocked';
  repliedAt: string;
};
