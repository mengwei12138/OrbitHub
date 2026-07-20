export type Platform = 'douyin' | 'xiaohongshu';

export type AccountStatus = 'online' | 'offline';

export type BasicInfoData = {
  avatar?: string;
  nickname: string;
  platform: Platform;
  fansCount: number;
  status: AccountStatus;
  lastSyncTime: string;
};
