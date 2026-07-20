import type { PaginationParams } from '@/api/types';

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

export type MessageHistoryCardProps = {
  queryOptions: (params: PaginationParams) => {
    queryKey: any;
    queryFn: () => Promise<{
      list: MessageRecord[];
      total: string | number;
      [key: string]: any;
    }>;
  };
  accountSelectOptions?: { label: string; value: string }[];
  classificationFilterOptions?: { label: string; value: string }[];
  onView?: (id: string) => void;
};
