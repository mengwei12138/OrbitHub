/**
 * WarningZone 组件类型定义
 * 数据中心页面预警区域组件
 */

export type AlertLevel = 'HIGH' | 'MEDIUM' | 'NORMAL';

export type AlertStatus = 'unread' | 'read' | 'ignored' | 'processed';

export type PlatformType = 'douyin' | 'xiaohongshu';

export interface Alert {
  id: string;
  level: AlertLevel;
  status: AlertStatus;
  platform: PlatformType;
  account: string;
  accountId: string;
  contentId?: string;
  reason: string;
  time: string;
  eventType: string;
  handleType?: 'login' | 'content' | 'account' | 'security';
}

export interface WarningZoneProps {
  alerts: Alert[];
  stats: {
    total: number;
    unread: number;
    abnormal: number;
  };
  onViewDetail?: (alert: Alert) => void;
  onIgnore?: (alertId: string) => void;
  onHandle?: (alert: Alert) => void;
  onViewAll?: () => void;
}
