import type { ReactNode } from 'react';

export interface BottomActionBarProps {
  toolbar?: ReactNode;
  disabled?: boolean;
  loading?: boolean;
  onConfirm?: () => void;
}
