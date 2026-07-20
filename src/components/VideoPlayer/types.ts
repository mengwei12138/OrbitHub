import type { EngineType } from './engines/types';

export type { EngineType };

export type VideoPlayerProps = {
  src: string;
  poster?: string;
  autoPlay?: boolean;
  loop?: boolean;
  muted?: boolean;
  controls?: boolean;
  width?: number | string;
  height?: number | string;
  mimeType?: string;
  engineType?: EngineType;
  onPlay?: () => void;
  onPause?: () => void;
  onEnded?: () => void;
  onTimeUpdate?: (currentTime: number, duration: number) => void;
  onLoadedMetadata?: (duration: number) => void;
  onError?: (error: Error) => void;
  /** 是否开启调试日志 @default import.meta.env.MODE === 'development' */
  debug?: boolean;
  /** 视频预加载策略 @default 'metadata' */
  preload?: 'auto' | 'metadata' | 'none';
  /** HLS.js 配置项 */
  hlsConfig?: Record<string, unknown>;
  /** DASH.js 配置项 */
  dashConfig?: Record<string, unknown>;
};

export type VideoPlayerRef = {
  play: () => Promise<void> | void;
  pause: () => void;
  seek: (time: number) => void;
  setVolume: (volume: number) => void;
  setMuted: (muted: boolean) => void;
  getCurrentTime: () => number;
  getDuration: () => number;
  isPlaying: () => boolean;
  getNativeElement: () => HTMLVideoElement | null;
};
