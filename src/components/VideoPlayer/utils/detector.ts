import { getLogger } from '@/utils/logger';

import type { EngineType } from '../engines/types';

export const detectEngineType = (url: string): EngineType => {
  if (/\.m3u8(?:\?.*)?$/iu.test(url)) {
    return 'hls';
  }
  if (/\.mpd(?:\?.*)?$/iu.test(url)) {
    return 'dash';
  }
  // 其余（MP4/WebM/Ogg/MOV 等）走 Plyr，与 VideoPlayer 组件约定一致
  return 'plyr';
};

export const detectEngineTypeByMimeType = (mimeType: string): EngineType => {
  const type = mimeType.toLowerCase();

  if (
    type === 'application/x-mpegurl' ||
    type === 'application/vnd.apple.mpegurl'
  ) {
    return 'hls';
  }
  if (type === 'application/dash+xml') {
    return 'dash';
  }
  if (type.startsWith('video/')) {
    return 'plyr';
  }

  getLogger().warn(`Unknown mimeType: ${mimeType}, falling back to plyr`);
  return 'plyr';
};

export const isHLSUrl = (url: string): boolean =>
  /\.m3u8(?:\?.*)?$/iu.test(url);
export const isDASHUrl = (url: string): boolean =>
  /\.mpd(?:\?.*)?$/iu.test(url);
