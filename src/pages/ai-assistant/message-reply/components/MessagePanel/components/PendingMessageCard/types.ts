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

export type PendingMessageCardProps = {
  queryOptions: (params: PaginationParams) => {
    queryKey: any;
    queryFn: () => Promise<{
      list: PendingMessage[];
      total: string | number;
      [key: string]: any;
    }>;
  };
  accountSelectOptions?: { label: string; value: string }[];
  classificationFilterOptions?: { label: string; value: string }[];
  onAutoReply?: (id: string) => void;
  onManualReply?: (message: PendingMessage) => void;
};
