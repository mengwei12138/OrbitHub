import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { NativeEngine } from '../NativeEngine';

describe('NativeEngine', () => {
  let engine: NativeEngine;
  let videoElement: HTMLVideoElement;

  beforeEach(() => {
    videoElement = document.createElement('video');
    engine = new NativeEngine();
  });

  afterEach(() => {
    engine.destroy();
  });

  describe('基础属性', () => {
    it('supported 应为 true', () => {
      expect(engine.supported).toBe(true);
    });

    it('engineType 应为 native', () => {
      expect(engine.engineType).toBe('native');
    });
  });

  describe('setElement', () => {
    it('应设置 video 元素', () => {
      engine.setElement(videoElement);
      expect(engine.getNativeElement()).toBe(videoElement);
    });
  });

  describe('load', () => {
    it('应设置 video src', () => {
      engine.setElement(videoElement);
      engine.load('https://example.com/video.mp4');
      expect(videoElement.src).toContain('video.mp4');
    });
  });

  describe('play/pause', () => {
    it('play 应返回 Promise', () => {
      engine.setElement(videoElement);
      const playPromise = engine.play();
      expect(playPromise).toBeInstanceOf(Promise);
    });

    it('pause 应调用 video.pause', () => {
      engine.setElement(videoElement);
      const pauseSpy = vi.spyOn(videoElement, 'pause');
      engine.pause();
      expect(pauseSpy).toHaveBeenCalled();
    });
  });

  describe('seek', () => {
    it('应设置 video.currentTime', () => {
      engine.setElement(videoElement);
      Object.defineProperty(videoElement, 'currentTime', {
        value: 0,
        writable: true,
      });
      engine.seek(50);
      expect(videoElement.currentTime).toBe(50);
    });
  });

  describe('setVolume/setMuted', () => {
    it('setVolume 应设置 video.volume', () => {
      engine.setElement(videoElement);
      engine.setVolume(0.5);
      expect(videoElement.volume).toBe(0.5);
    });

    it('setVolume 应限制范围在 0-1', () => {
      engine.setElement(videoElement);
      engine.setVolume(1.5);
      expect(videoElement.volume).toBe(1);
      engine.setVolume(-0.5);
      expect(videoElement.volume).toBe(0);
    });

    it('setMuted 应设置 video.muted', () => {
      engine.setElement(videoElement);
      engine.setMuted(true);
      expect(videoElement.muted).toBe(true);
      engine.setMuted(false);
      expect(videoElement.muted).toBe(false);
    });
  });

  describe('getCurrentTime/getDuration', () => {
    it('getCurrentTime 应返回 video.currentTime', () => {
      engine.setElement(videoElement);
      Object.defineProperty(videoElement, 'currentTime', {
        value: 30,
        writable: true,
      });
      expect(engine.getCurrentTime()).toBe(30);
    });

    it('getDuration 应返回 video.duration', () => {
      engine.setElement(videoElement);
      Object.defineProperty(videoElement, 'duration', {
        value: 120,
        writable: true,
      });
      expect(engine.getDuration()).toBe(120);
    });

    it('未设置元素时应返回 0', () => {
      expect(engine.getCurrentTime()).toBe(0);
      expect(engine.getDuration()).toBe(0);
    });
  });

  describe('isPlaying', () => {
    it('视频播放中应返回 true', () => {
      engine.setElement(videoElement);
      Object.defineProperty(videoElement, 'paused', { value: false });
      Object.defineProperty(videoElement, 'ended', { value: false });
      expect(engine.isPlaying()).toBe(true);
    });

    it('视频暂停时应返回 false', () => {
      engine.setElement(videoElement);
      Object.defineProperty(videoElement, 'paused', { value: true });
      Object.defineProperty(videoElement, 'ended', { value: false });
      expect(engine.isPlaying()).toBe(false);
    });

    it('视频播放结束时应返回 false', () => {
      engine.setElement(videoElement);
      Object.defineProperty(videoElement, 'paused', { value: true });
      Object.defineProperty(videoElement, 'ended', { value: true });
      expect(engine.isPlaying()).toBe(false);
    });

    it('未设置元素时应返回 false', () => {
      expect(engine.isPlaying()).toBe(false);
    });
  });

  describe('事件监听', () => {
    it('on 应注册事件回调并在事件触发时调用', () => {
      engine.setElement(videoElement);
      const callback = vi.fn();
      engine.on('play', callback);

      videoElement.dispatchEvent(new Event('playing'));

      expect(callback).toHaveBeenCalled();
    });

    it('off 应移除事件回调', () => {
      engine.setElement(videoElement);
      const callback = vi.fn();
      engine.on('play', callback);
      engine.off('play', callback);

      videoElement.dispatchEvent(new Event('playing'));

      expect(callback).not.toHaveBeenCalled();
    });

    it('同一事件可注册多个回调', () => {
      engine.setElement(videoElement);
      const callback1 = vi.fn();
      const callback2 = vi.fn();
      engine.on('play', callback1);
      engine.on('play', callback2);

      videoElement.dispatchEvent(new Event('playing'));

      expect(callback1).toHaveBeenCalled();
      expect(callback2).toHaveBeenCalled();
    });
  });

  describe('destroy', () => {
    it('destroy 后 getNativeElement 应返回 null', () => {
      engine.setElement(videoElement);
      engine.destroy();
      expect(engine.getNativeElement()).toBe(null);
    });

    it('destroy 后回调不应再被调用', () => {
      engine.setElement(videoElement);
      const callback = vi.fn();
      engine.on('play', callback);
      engine.destroy();

      videoElement.dispatchEvent(new Event('playing'));

      expect(callback).not.toHaveBeenCalled();
    });
  });
});
