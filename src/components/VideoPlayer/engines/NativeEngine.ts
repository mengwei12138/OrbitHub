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

class NativeEngine extends BaseEngine {
  constructor() {
    const logger = createEngineLogger('native');
    const emitter = new EventEmitter(logger);
    super('native', emitter);
  }

  setElement(video: HTMLVideoElement): void {
    this.logger.debug('Video element set', {
      tagName: video.tagName,
      id: video.id,
    });
    this.videoElement = video;
    video.controls = true;
    this.bindEvents();
  }

  load(url: string, mimeType?: string): void {
    void mimeType;
    this.logger.info('Loading source', {
      url,
      engineType: this.engineType,
    });

    if (!this.videoElement) {
      this.logger.error('Load failed: no video element');
      return;
    }

    this.videoElement.src = url;
    this.videoElement.load();
  }

  destroy(): void {
    this.logger.debug('NativeEngine destroy started');

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

export { NativeEngine };
