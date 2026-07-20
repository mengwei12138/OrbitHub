export interface WarningStatsProps {
  totalCount: number;
  unreadCount: number;
  abnormalAccountCount: number;
  loading?: boolean;
  onMarkAllRead?: () => void;
  onClearIgnored?: () => void;
}
