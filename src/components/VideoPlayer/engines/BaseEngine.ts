import { createEngineLogger } from '@/utils/logger';

import type { EngineEvent, EngineType, PlayerEngine } from './types';

type EngineCallback = (...args: unknown[]) => void;

type EventEmitter = {
  on(event: EngineEvent, callback: EngineCallback): void;
  off(event: EngineEvent, callback: EngineCallback): void;
  emit(event: EngineEvent, ...args: unknown[]): void;
  destroy(): void;
  getCallbackCount(event: EngineEvent): number;
};

type BaseEngineLogger = Pick<
  ReturnType<typeof createEngineLogger>,
  'debug' | 'info' | 'warn' | 'error'
>;

const EVENT_TO_HTML_MAP: Record<EngineEvent, string> = {
  play: 'playing',
  pause: 'pause',
  ended: 'ended',
  timeupdate: 'timeupdate',
  loadedmetadata: 'loadedmetadata',
  volumechange: 'volumechange',
  error: 'error',
};

abstract class BaseEngine implements PlayerEngine {
  protected videoElement: HTMLVideoElement | null = null;
  protected emitter: EventEmitter;
  protected logger: BaseEngineLogger;
  readonly engineType: EngineType;
  private startTime: number = 0;

  constructor(engineType: EngineType, emitter: EventEmitter) {
    this.engineType = engineType;
    this.emitter = emitter;
    this.logger = createEngineLogger(engineType);
    this.startTime = Date.now();
  }

  abstract setElement(video: HTMLVideoElement): void;
  abstract load(url: string, mimeType?: string): void;
  protected abstract bindEvents(): void;

  get supported(): boolean {
    return true;
  }

  setVolume(volume: number): void {
    const clampedVolume = Math.max(0, Math.min(1, volume));
    if (this.videoElement) {
      this.videoElement.volume = clampedVolume;
    }
    this.logger.debug('Volume set', { volume: clampedVolume });
  }

  setMuted(muted: boolean): void {
    if (this.videoElement) {
      this.videoElement.muted = muted;
    }
    this.logger.debug('Muted set', { muted });
  }

  getCurrentTime(): number {
    return this.videoElement?.currentTime ?? 0;
  }

  getDuration(): number {
    return this.videoElement?.duration ?? 0;
  }

  isPlaying(): boolean {
    return this.videoElement
      ? !this.videoElement.paused && !this.videoElement.ended
      : false;
  }

  getNativeElement(): HTMLVideoElement | null {
    return this.videoElement;
  }

  on(event: EngineEvent, callback: EngineCallback): void {
    this.emitter.on(event, callback);
  }

  off(event: EngineEvent, callback: EngineCallback): void {
    this.emitter.off(event, callback);
    if (this.videoElement) {
      const htmlEvent = EVENT_TO_HTML_MAP[event];
      if (htmlEvent) {
        this.videoElement.removeEventListener(
          htmlEvent,
          callback as EventListener,
        );
      }
    }
  }

  play(): Promise<void> | void {
    if (!this.videoElement) {
      this.logger.warn('Play called but videoElement is null');
      return Promise.resolve();
    }

    const currentTime = this.videoElement.currentTime;
    const result = this.videoElement.play();

    this.logger.debug('Play triggered', { currentTime });

    if (result instanceof Promise) {
      return result.catch((e) => {
        this.logger.warn('Play promise rejected', { error: e.message });
      });
    }

    return result;
  }

  pause(): void {
    if (!this.videoElement) {
      this.logger.warn('Pause called but videoElement is null');
      return;
    }

    this.videoElement.pause();
    this.logger.debug('Pause triggered', {
      currentTime: this.videoElement.currentTime,
    });
  }

  seek(time: number): void {
    if (!this.videoElement) {
      this.logger.warn('Seek called but videoElement is null');
      return;
    }

    const from = this.videoElement.currentTime;
    this.videoElement.currentTime = time;

    this.logger.debug('Seek performed', { from, to: time });
  }

  destroy(): void {
    const totalPlayTime = Date.now() - this.startTime;

    this.emitter.destroy();
    this.logger.info('Engine destroyed', {
      engineType: this.engineType,
      totalPlayTime,
    });

    this.videoElement = null;
  }

  protected emit(event: EngineEvent, ...args: unknown[]): void {
    const htmlEvent = EVENT_TO_HTML_MAP[event];
    this.logger.debug('Engine event emitted', {
      engineEvent: event,
      htmlEvent,
      data: args.length > 0 ? args : undefined,
    });
    this.emitter.emit(event, ...args);
  }
}

export type { BaseEngineLogger, EventEmitter };
export { BaseEngine };
