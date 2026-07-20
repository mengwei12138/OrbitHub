import Hls from 'hls.js';
import { createEngineLogger } from '@/utils/logger';
import { EventEmitter } from '../utils/EventEmitter';
import { BaseEngine } from './BaseEngine';
import type { EngineEvent } from './types';

const HTML_TO_ENGINE_EVENT_MAP: Record<string, EngineEvent> = {
  playing: 'play',
  pause: 'pause',
  ended: 'ended',
  timeupdate: 'timeupdate',
  loadedmetadata: 'loadedmetadata',
  volumechange: 'volumechange',
  error: 'error',
};

class HLSEngine extends BaseEngine {
  private hls: Hls | null = null;

  constructor() {
    const logger = createEngineLogger('hls');
    const emitter = new EventEmitter(logger);
    super('hls', emitter);
  }

  get supported(): boolean {
    return Hls.isSupported();
  }

  setElement(video: HTMLVideoElement): void {
    this.logger.debug('Video element set', { tagName: video.tagName });
    this.videoElement = video;
    this.bindEvents();
  }

  load(url: string, mimeType?: string): void {
    void mimeType;
    this.logger.info('Loading HLS source', {
      url,
      engineType: this.engineType,
    });

    if (!this.videoElement) {
      this.logger.error('Load failed: no video element');
      return;
    }

    if (Hls.isSupported()) {
      this.hls = new Hls({
        enableWorker: true,
        lowLatencyMode: false,
      });

      this.hls.on(Hls.Events.MANIFEST_PARSED, (_, data) => {
        this.logger.debug('HLS manifest parsed', {
          levels: data.levels?.length ?? 0,
        });
      });

      this.hls.on(Hls.Events.ERROR, (_, data) => {
        this.logger.error('HLS error', {
          fatal: data.fatal,
          type: data.type,
          details: data.details,
        });

        if (data.fatal) {
          this.emit('error', new Error(`HLS fatal error: ${data.details}`));
        }
      });

      this.hls.loadSource(url);
      this.hls.attachMedia(this.videoElement);
    } else if (this.videoElement.canPlayType('application/vnd.apple.mpegurl')) {
      this.logger.info('Using native HLS support (Safari)');
      this.videoElement.src = url;
    } else {
      this.logger.error('HLS not supported in this environment');
    }
  }

  destroy(): void {
    this.logger.debug('HLSEngine destroy started', {
      hlsInstance: !!this.hls,
    });

    if (this.hls) {
      this.hls.destroy();
      this.hls = null;
    }

    if (this.videoElement) {
      this.videoElement.src = '';
      this.videoElement = null;
    }

    super.destroy();
  }

  protected bindEvents(): void {
    if (!this.videoElement) return;

    Object.entries(HTML_TO_ENGINE_EVENT_MAP).forEach(
      ([htmlEvent, engineEvent]) => {
        const handler = ((...args: unknown[]) => {
          this.logger.debug('HTML event received', {
            htmlEvent,
            engineEvent,
            data: args.length > 0 ? args : undefined,
          });
          this.emit(engineEvent, ...args);
        }) as EventListener;

        this.videoElement?.addEventListener(htmlEvent, handler);
      },
    );
  }
}

export { HLSEngine };
