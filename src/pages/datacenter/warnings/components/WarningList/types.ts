import type { Warning } from '../WarningCard/types';

export type { Warning };

export interface WarningGroup {
  date: string;
  warnings: Warning[];
}

export interface WarningListProps {
  data: Warning[];
  loading?: boolean;
  pagination: {
    current: number;
    pageSize: number;
    total: number;
  };
  onPageChange?: (page: number, pageSize: number) => void;
  onViewDetail?: (warning: Warning) => void;
  onIgnore?: (warning: Warning) => void;
  onHandle?: (warning: Warning) => void;
}
