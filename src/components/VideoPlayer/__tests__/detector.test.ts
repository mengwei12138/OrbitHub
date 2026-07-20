import { describe, expect, it, vi } from 'vitest';

import {
  detectEngineType,
  detectEngineTypeByMimeType,
  isDASHUrl,
  isHLSUrl,
} from '../utils/detector';

describe('detector', () => {
  describe('detectEngineType', () => {
    it('应检测 HLS URL', () => {
      expect(detectEngineType('https://example.com/video.m3u8')).toBe('hls');
      expect(detectEngineType('https://example.com/video.m3u8?token=abc')).toBe(
        'hls',
      );
      expect(detectEngineType('https://example.com/playlist.m3u8')).toBe('hls');
    });

    it('应检测 DASH URL', () => {
      expect(detectEngineType('https://example.com/video.mpd')).toBe('dash');
      expect(detectEngineType('https://example.com/video.mpd?token=abc')).toBe(
        'dash',
      );
      expect(detectEngineType('https://example.com/manifest.mpd')).toBe('dash');
    });

    it('应默认返回 Plyr 引擎', () => {
      expect(detectEngineType('https://example.com/video.mp4')).toBe('plyr');
      expect(detectEngineType('https://example.com/video.webm')).toBe('plyr');
      expect(detectEngineType('https://example.com/video.ogv')).toBe('plyr');
      expect(detectEngineType('https://example.com/video.mov')).toBe('plyr');
    });

    it('应忽略大小写', () => {
      expect(detectEngineType('https://example.com/video.M3U8')).toBe('hls');
      expect(detectEngineType('https://example.com/video.MPD')).toBe('dash');
    });
  });

  describe('detectEngineTypeByMimeType', () => {
    it('应检测 HLS mimeType', () => {
      expect(detectEngineTypeByMimeType('application/x-mpegurl')).toBe('hls');
      expect(detectEngineTypeByMimeType('application/vnd.apple.mpegurl')).toBe(
        'hls',
      );
    });

    it('应检测 DASH mimeType', () => {
      expect(detectEngineTypeByMimeType('application/dash+xml')).toBe('dash');
    });

    it('应检测 video 类型 mimeType 返回 Plyr', () => {
      expect(detectEngineTypeByMimeType('video/mp4')).toBe('plyr');
      expect(detectEngineTypeByMimeType('video/webm')).toBe('plyr');
      expect(detectEngineTypeByMimeType('video/ogg')).toBe('plyr');
      expect(detectEngineTypeByMimeType('video/quicktime')).toBe('plyr');
      expect(detectEngineTypeByMimeType('video/x-msvideo')).toBe('plyr');
    });

    it('应忽略 mimeType 大小写', () => {
      expect(detectEngineTypeByMimeType('VIDEO/MP4')).toBe('plyr');
      expect(detectEngineTypeByMimeType('Video/Webm')).toBe('plyr');
      expect(detectEngineTypeByMimeType('APPLICATION/X-MPEGURL')).toBe('hls');
    });

    it('未知 mimeType 应 fallback 到 Plyr', () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      expect(detectEngineTypeByMimeType('audio/mp3')).toBe('plyr');
      expect(detectEngineTypeByMimeType('application/octet-stream')).toBe(
        'plyr',
      );
      expect(warnSpy).toHaveBeenCalledTimes(2);
      warnSpy.mockRestore();
    });
  });

  describe('isHLSUrl', () => {
    it('应正确识别 HLS URL', () => {
      expect(isHLSUrl('https://example.com/video.m3u8')).toBe(true);
      expect(isHLSUrl('https://example.com/video.mp4')).toBe(false);
      expect(isHLSUrl('https://example.com/video.mpd')).toBe(false);
    });
  });

  describe('isDASHUrl', () => {
    it('应正确识别 DASH URL', () => {
      expect(isDASHUrl('https://example.com/video.mpd')).toBe(true);
      expect(isDASHUrl('https://example.com/video.m3u8')).toBe(false);
      expect(isDASHUrl('https://example.com/video.mp4')).toBe(false);
    });
  });
});
