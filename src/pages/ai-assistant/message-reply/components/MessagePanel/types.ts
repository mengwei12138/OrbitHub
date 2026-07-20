import type { PaginationParams } from '@/api/types';

export type PendingMessage = {
  id: string;
  account: {
    name: string;
    platform: 'douyin' | 'xiaohongshu' | 'weibo';
  };
  sender: {
    name: string;
    avatar?: string;
  };
  content: string;
  classification: {
    type: string;
    label: string;
  };
  aiSuggestion?: string;
  isImportant?: boolean;
};

export type MessageRecord = {
  id: string;
  time: string;
  account: {
    name: string;
    platform: 'douyin' | 'xiaohongshu' | 'weibo';
  };
  sender: {
    name: string;
    avatar?: string;
  };
  content: string;
  status: 'replied' | 'manual_reply' | 'blocked';
  replyContent?: string;
};

export type MessagePanelProps = {
  pendingQueryOptions: (params: PaginationParams) => {
    queryKey: any;
    queryFn: () => Promise<{
      list: PendingMessage[];
      total: string | number;
      [key: string]: any;
    }>;
  };
  historyQueryOptions: (params: PaginationParams) => {
    queryKey: any;
    queryFn: () => Promise<{
      list: MessageRecord[];
      total: string | number;
      [key: string]: any;
    }>;
  };
  accountSelectOptions?: { label: string; value: string }[];
  classificationFilterOptions?: { label: string; value: string }[];
  onAutoReply?: (id: string) => void;
  onManualReply?: (messageId: string, content: string) => void;
  onView?: (id: string) => void;
  manualReplyPending?: boolean;
};
