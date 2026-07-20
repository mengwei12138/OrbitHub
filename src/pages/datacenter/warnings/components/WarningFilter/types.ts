export type WarningFilterType = 'all' | 'account' | 'content' | 'fans';

export interface WarningFilterValue {
  warningType: WarningFilterType;
  keyword: string;
}

export interface WarningFilterProps {
  value: WarningFilterValue;
  onChange: (value: WarningFilterValue) => void;
}
