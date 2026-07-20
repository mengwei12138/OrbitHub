export type WarningLevel = 'red' | 'orange' | 'green' | 'gray';
export type WarningStatus = 'unread' | 'read' | 'ignored' | 'processed';
export type WarningType = 'account' | 'content' | 'fans';
export type HandleType = 'login' | 'content' | 'account' | 'security';

export interface Warning {
  id: string;
  level: WarningLevel;
  accountId: string;
  contentId?: string;
  accountName: string;
  platform: 'douyin' | 'xiaohongshu';
  warningType: WarningType;
  reason: string;
  status: WarningStatus;
  createTime: string;
  handleType?: HandleType;
}

export interface WarningCardProps {
  warning: Warning;
  onViewDetail?: (warning: Warning) => void;
  onIgnore?: (warning: Warning) => void;
  onHandle?: (warning: Warning) => void;
}
