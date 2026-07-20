import Plyr from 'plyr';
import { createEngineLogger } from '@/utils/logger';
import { EventEmitter } from '../utils/EventEmitter';
import type { EngineEvent, PlayerEngine } from './types';

type EngineCallback = (...args: unknown[]) => void;

type PlyrEventEmitter = {
  on(event: string, handler: (...args: unknown[]) => void): void;
  off(event: string, handler: (...args: unknown[]) => void): void;
};

class PlyrEngine implements PlayerEngine {
  readonly supported = true;
  readonly engineType = 'plyr' as const;

  private player: Plyr | null = null;
  private emitter: EventEmitter;
  private logger: ReturnType<typeof createEngineLogger>;
  private isReady = false;
  private pendingSrc: string | null = null;
  private pendingMimeType: string | null = null;
  private startTime: number = 0;
  private destroyed = false;

  constructor() {
    this.logger = createEngineLogger('plyr');
    this.emitter = new EventEmitter(this.logger);
    this.startTime = Date.now();
  }

  setElement(video: HTMLVideoElement): void {
    this.logger.debug('Video element set', { tagName: video.tagName });

    this.player = new Plyr(video, {
      controls: [
        'play-large',
        'play',
        'progress',
        'current-time',
        'duration',
        'mute',
        'volume',
        'captions',
        'settings',
        'fullscreen',
      ],
      settings: ['quality', 'speed'],
      tooltips: { controls: true, seek: true },
    });

    this.logger.debug('Plyr instance created', {
      hasCustomControls: true,
    });

    this.bindEvents();

    // Plyr ready 事件后再加载 source
    (this.player as unknown as PlyrEventEmitter).on('ready', () => {
      this.logger.debug('Plyr ready 事件触发');
      this.logger.debug('Plyr ready');
      this.isReady = true;

      if (this.pendingSrc) {
        this.logger.debug('应用 pendingSrc', { pendingSrc: this.pendingSrc });
        this.applySource(this.pendingSrc, this.pendingMimeType ?? undefined);
        this.pendingSrc = null;
        this.pendingMimeType = null;
      } else {
        this.logger.debug('没有 pendingSrc');
      }
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (this.player as unknown as PlyrEventEmitter).on('error', (e: unknown) => {
      this.logger.error('Plyr error', { error: e });
    });
  }

  load(url: string, mimeType?: string): void {
    this.logger.debug('load 被调用', { url, mimeType, isReady: this.isReady });
    this.logger.info('Loading source', {
      url,
      mimeType,
      engineType: this.engineType,
    });

    if (!this.player) {
      this.logger.error('load 失败: player 为 null');
      this.logger.error('Load failed: no player instance');
      return;
    }

    if (this.isReady) {
      this.logger.debug('isReady 为 true，直接应用 source');
      this.applySource(url, mimeType);
    } else {
      this.logger.debug('isReady 为 false，缓存 source，添加超时 fallback');
      this.pendingSrc = url;
      this.pendingMimeType = mimeType ?? null;
      this.logger.debug('Source queued for pending ready', { url });

      setTimeout(() => {
        if (this.destroyed) {
          this.logger.debug('引擎已销毁，跳过超时应用');
          return;
        }
        if (this.pendingSrc) {
          this.logger.debug('ready 超时，强制应用 source');
          this.applySource(this.pendingSrc, this.pendingMimeType ?? undefined);
          this.pendingSrc = null;
          this.pendingMimeType = null;
        }
      }, 1000);
    }
  }

  private applySource(url: string, mimeType?: string): void {
    this.logger.debug('applySource 被调用', {
      url,
      mimeType,
      destroyed: this.destroyed,
    });
    if (!this.player) {
      this.logger.debug('applySource: player 为 null');
      return;
    }
    if (this.destroyed) {
      this.logger.debug('applySource: 引擎已销毁，跳过');
      return;
    }

    const videoType = mimeType?.startsWith('video/') ? mimeType : 'video/mp4';

    this.logger.debug('设置 player.source', { url, type: videoType });
    this.player.source = {
      type: 'video',
      sources: [{ src: url, type: videoType }],
    };

    this.logger.debug('player.source 已设置');
    this.logger.debug('Source applied', { url, type: videoType });
  }

  play(): Promise<void> | void {
    if (!this.player) {
      this.logger.warn('Play called but player is null');
      return Promise.resolve();
    }

    const currentTime = this.player.currentTime;
    const result = this.player.play();

    this.logger.debug('Play triggered', { currentTime });

    if (result instanceof Promise) {
      return result.catch((e) => {
        this.logger.warn('Play promise rejected', { error: e.message });
      });
    }

    return result;
  }

  pause(): void {
    if (!this.player) {
      this.logger.warn('Pause called but player is null');
      return;
    }

    this.player.pause();
    this.logger.debug('Pause triggered', {
      currentTime: this.player.currentTime,
    });
  }

  seek(time: number): void {
    if (!this.player) {
      this.logger.warn('Seek called but player is null');
      return;
    }

    const from = this.player.currentTime;
    this.player.currentTime = time;

    this.logger.debug('Seek performed', { from, to: time });
  }

  setVolume(volume: number): void {
    if (this.player) {
      this.player.volume = Math.max(0, Math.min(1, volume));
    }
  }

  setMuted(muted: boolean): void {
    if (this.player) {
      this.player.muted = muted;
    }
  }

  getCurrentTime(): number {
    return this.player?.currentTime ?? 0;
  }

  getDuration(): number {
    return this.player?.duration ?? 0;
  }

  isPlaying(): boolean {
    return this.player ? !this.player.paused && !this.player.ended : false;
  }

  getNativeElement(): HTMLVideoElement | null {
    if (!this.player) return null;
    return (
      (this.player as unknown as { elements: { video: HTMLVideoElement } })
        .elements.video ?? null
    );
  }

  on(event: EngineEvent, callback: EngineCallback): void {
    this.emitter.on(event, callback);

    if (this.player) {
      (this.player as unknown as PlyrEventEmitter).on(event, callback);
    }
  }

  off(event: EngineEvent, callback: EngineCallback): void {
    this.emitter.off(event, callback);

    if (this.player) {
      (this.player as unknown as PlyrEventEmitter).off(event, callback);
    }
  }

  destroy(): void {
    this.logger.debug('destroy 被调用');
    this.destroyed = true;
    this.pendingSrc = null;
    this.pendingMimeType = null;
    const totalPlayTime = Date.now() - this.startTime;

    this.emitter.destroy();
    this.logger.debug('PlyrEngine destroy started');

    if (this.player) {
      this.player.destroy();
      this.player = null;
    }

    this.logger.info('PlyrEngine destroyed', {
      engineType: this.engineType,
      totalPlayTime,
    });
  }

  private bindEvents(): void {
    if (!this.player) return;

    const events: EngineEvent[] = [
      'play',
      'pause',
      'ended',
      'timeupdate',
      'loadedmetadata',
      'volumechange',
      'error',
    ];

    events.forEach((engineEvent) => {
      (this.player as unknown as PlyrEventEmitter).on(engineEvent, ((
        ...args: unknown[]
      ) => {
        this.logger.debug('Plyr event received', {
          engineEvent,
          data: args.length > 0 ? args : undefined,
        });
        this.emitter.emit(engineEvent, ...args);
      }) as (...args: unknown[]) => void);
    });
  }
}

export { PlyrEngine };
