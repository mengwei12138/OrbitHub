import type { TagCategory } from '@/services/ai-assistant/types';

export type CreateTagModalProps = {
  open: boolean;
  submitLoading?: boolean;
  categoryOptions: TagCategory[];
  onClose: () => void;
  onSubmit: (values: Record<string, string>) => Promise<void>;
};
