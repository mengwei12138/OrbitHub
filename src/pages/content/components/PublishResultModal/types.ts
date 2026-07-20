export interface FailedAccount {
  id: string;
  accountName: string;
  reason: string;
}

export interface PublishResultModalProps {
  open: boolean;
  successCount: number;
  failedAccounts: FailedAccount[];
  onClose: () => void;
  onViewHistory: () => void;
  onContinuePublish: () => void;
}
