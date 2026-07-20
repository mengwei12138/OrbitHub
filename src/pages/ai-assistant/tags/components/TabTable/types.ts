import type { PaginationParams, PaginationResponse } from '@/api/types';
import type { TagCategory } from '@/services/ai-assistant/types';

export type TagRecord = {
  id: string;
  name: string;
  category: string;
  categoryCode: string | null;
  usageCount: number;
  lastUsedAt: string | null;
  status: 'ENABLED' | 'DISABLED';
  platform: 'ALL' | 'DOUYIN' | 'XIAOHONGSHU';
  createdByName?: string | null;
  editable?: boolean;
};

export type TabTableProps = {
  categoryOptions: TagCategory[];
  queryOptions?: (params: PaginationParams) => {
    queryKey: unknown[];
    queryFn: () => Promise<PaginationResponse<TagRecord>>;
  };
  onEdit?: (record: TagRecord) => void;
  /** 停用（启用态标签） */
  onDisable?: (record: TagRecord) => void;
  /** 启用（停用态标签） */
  onEnable?: (record: TagRecord) => void;
};
