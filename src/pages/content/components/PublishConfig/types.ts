export type Platform = 'douyin' | 'xiaohongshu';

export const PLATFORM_FILTER_OPTIONS: Array<{
  value: Platform | 'all';
  label: string;
}> = [
  { value: 'all', label: '全部' },
  { value: 'douyin', label: '抖音' },
  { value: 'xiaohongshu', label: '小红书' },
];

export interface Account {
  id: string;
  name: string;
  phone: string;
  platform: Platform;
  status: 'online' | 'stopped';
}

export interface PublishConfigProps {
  className?: string;
  selectedPlatform: Platform | 'all';
  onPlatformChange: (platform: Platform | 'all') => void;
  accounts: Account[];
  selectedAccountIds: string[];
  onAccountChange: (selectedIds: string[]) => void;
  hasMore?: boolean;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
  isLoadingMore?: boolean;
  onLoadMore?: () => void;
}
