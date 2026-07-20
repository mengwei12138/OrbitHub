export type EngineEvent =
  | 'play'
  | 'pause'
  | 'ended'
  | 'timeupdate'
  | 'loadedmetadata'
  | 'error'
  | 'volumechange';

export type EngineCallback = (...args: unknown[]) => void;

export type EngineType = 'native' | 'plyr' | 'hls' | 'dash';

export type PlayerEngine = {
  readonly supported: boolean;
  readonly engineType: EngineType;

  setElement(video: HTMLVideoElement): void;
  load(url: string, mimeType?: string): void;
  play(): Promise<void> | void;
  pause(): void;
  seek(time: number): void;
  setVolume(volume: number): void;
  setMuted(muted: boolean): void;
  getCurrentTime(): number;
  getDuration(): number;
  isPlaying(): boolean;
  getNativeElement(): HTMLVideoElement | null;
  on(event: EngineEvent, callback: EngineCallback): void;
  off(event: EngineEvent, callback: EngineCallback): void;
  destroy(): void;
};
