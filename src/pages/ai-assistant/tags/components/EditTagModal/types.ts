import type { TagCategory } from '@/services/ai-assistant/types';

import type { TagRecord } from '../TabTable/types';

export type EditTagModalProps = {
  open: boolean;
  record?: TagRecord;
  submitLoading?: boolean;
  categoryOptions: TagCategory[];
  onClose: () => void;
  onSubmit: (values: Record<string, string>) => Promise<void>;
};
