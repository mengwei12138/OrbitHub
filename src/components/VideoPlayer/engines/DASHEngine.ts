import * as dashjs from 'dashjs';
import { createEngineLogger } from '@/utils/logger';
import { EventEmitter } from '../utils/EventEmitter';
import { BaseEngine } from './BaseEngine';
import type { EngineEvent } from './types';

const DASH_TO_ENGINE_EVENT_MAP: Record<string, EngineEvent> = {
  playbackEnded: 'ended',
  playbackPaused: 'pause',
  playbackPlaying: 'play',
  playbackTimeUpdated: 'timeupdate',
  playbackMetaDataLoaded: 'loadedmetadata',
  playbackVolumeChanged: 'volumechange',
  playbackError: 'error',
};

class DASHEngine extends BaseEngine {
  private player: dashjs.MediaPlayerClass | null = null;

  constructor() {
    const logger = createEngineLogger('dash');
    const emitter = new EventEmitter(logger);
    super('dash', emitter);
  }

  get supported(): boolean {
    return dashjs.supportsMediaSource();
  }

  setElement(video: HTMLVideoElement): void {
    this.logger.debug('Video element set', { tagName: video.tagName });
    this.videoElement = video;

    if (!this.player) {
      this.player = dashjs.MediaPlayer().create();
      this.logger.debug('DASH MediaPlayer created');
    }

    this.player?.initialize(video, undefined, false);
    this.bindEvents();
  }

  load(url: string, mimeType?: string): void {
    void mimeType;
    this.logger.info('Loading DASH source', {
      url,
      engineType: this.engineType,
    });

    if (!this.player) {
      this.logger.error('Load failed: no player instance');
      return;
    }

    this.player.attachSource(url);
  }

  destroy(): void {
    this.logger.debug('DASHEngine destroy started', {
      playerInstance: !!this.player,
    });

    if (this.player) {
      this.player.reset();
      this.player = null;
    }

    if (this.videoElement) {
      this.videoElement.src = '';
      this.videoElement = null;
    }

    super.destroy();
  }

  protected bindEvents(): void {
    if (!this.player) return;

    Object.entries(DASH_TO_ENGINE_EVENT_MAP).forEach(
      ([dashEvent, engineEvent]) => {
        this.player?.on(dashEvent, ((...args: unknown[]) => {
          this.logger.debug('DASH event received', {
            dashEvent,
            engineEvent,
            data: args.length > 0 ? args : undefined,
          });
          this.emit(engineEvent, ...args);
        }) as (...args: unknown[]) => void);
      },
    );
  }
}

export { DASHEngine };
