export interface FailedAccount {
  id: string;
  accountName: string;
  reason: string;
}

export interface PublishAllFailedModalProps {
  open: boolean;
  totalCount: number;
  failedAccounts: FailedAccount[];
  onClose: () => void;
  onViewHistory: () => void;
  onRetry: () => void;
}
