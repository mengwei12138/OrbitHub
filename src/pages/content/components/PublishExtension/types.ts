import type { Account } from '../PublishConfig/types';

export type PublishExtensionType = 'location' | 'deal';

export type PublishExtensionSecondaryMode =
  | 'sales'
  | 'checkin'
  | 'local'
  | 'national';

export type PublishExtensionTertiaryMode = 'local' | 'national';

export type PublishExtensionMountStatus = 'success' | 'failed' | 'expired';

export type PublishExtensionCandidate = {
  id: string;
  type: PublishExtensionType;
  name: string;
  description: string;
  sourceLabel: string;
  meta: string;
  shouldFail?: boolean;
};

export type PublishExtensionInfo = {
  accountId: string;
  accountName: string;
  type: PublishExtensionType;
  secondaryMode?: PublishExtensionSecondaryMode;
  tertiaryMode?: PublishExtensionTertiaryMode;
  targetId: string;
  targetName: string;
  targetDescription: string;
  sourceLabel: string;
  preMountId: string;
  preMountedAt: string;
  expiresAt: string;
  status: PublishExtensionMountStatus;
  failureReason?: string;
};

export type PublishExtensionProps = {
  accounts: Account[];
  selectedAccountIds: string[];
  hasMaterial: boolean;
  value: PublishExtensionInfo | null;
  onChange: (value: PublishExtensionInfo) => void;
  onReset: () => void;
};
