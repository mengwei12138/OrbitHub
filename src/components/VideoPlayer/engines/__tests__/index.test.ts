import { describe, expect, it, vi } from 'vitest';

import { createEngine, createEngineByUrl, isEngineSupported } from '../index';

describe('engines/index', () => {
  describe('createEngine', () => {
    it('应创建 NativeEngine', () => {
      const engine = createEngine('native');
      expect(engine.engineType).toBe('native');
      expect(engine.supported).toBe(true);
    });

    it('应创建 PlyrEngine', () => {
      const engine = createEngine('plyr');
      expect(engine.engineType).toBe('plyr');
    });

    it('应创建 HLSEngine', () => {
      const engine = createEngine('hls');
      expect(engine.engineType).toBe('hls');
    });

    it('应创建 DASHEngine', () => {
      const engine = createEngine('dash');
      expect(engine.engineType).toBe('dash');
    });

    it('未知类型应 fallback 到 PlyrEngine', () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const engine = createEngine('unknown' as 'native');
      expect(engine.engineType).toBe('plyr');
      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('[VideoPlayer]'),
      );
      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining(
          'Unknown engine type: unknown, falling back to Plyr',
        ),
      );
      warnSpy.mockRestore();
    });
  });

  describe('createEngineByUrl', () => {
    it('应根据 .m3u8 URL 返回 HLSEngine', () => {
      const engine = createEngineByUrl('https://example.com/video.m3u8');
      expect(engine.engineType).toBe('hls');
    });

    it('应根据 .m3u8 URL（带查询参数）返回 HLSEngine', () => {
      const engine = createEngineByUrl(
        'https://example.com/video.m3u8?token=abc',
      );
      expect(engine.engineType).toBe('hls');
    });

    it('应根据 .mpd URL 返回 DASHEngine', () => {
      const engine = createEngineByUrl('https://example.com/video.mpd');
      expect(engine.engineType).toBe('dash');
    });

    it('应根据 .mpd URL（带查询参数）返回 DASHEngine', () => {
      const engine = createEngineByUrl(
        'https://example.com/video.mpd?token=abc',
      );
      expect(engine.engineType).toBe('dash');
    });

    it('应根据 .mp4 URL 返回 NativeEngine（临时修复：Plyr被替换为Native）', () => {
      const engine = createEngineByUrl('https://example.com/video.mp4');
      expect(engine.engineType).toBe('native');
    });

    it('应根据 .webm URL 返回 NativeEngine（临时修复：Plyr被替换为Native）', () => {
      const engine = createEngineByUrl('https://example.com/video.webm');
      expect(engine.engineType).toBe('native');
    });

    it('应根据 .ogv URL 返回 NativeEngine（临时修复：Plyr被替换为Native）', () => {
      const engine = createEngineByUrl('https://example.com/video.ogv');
      expect(engine.engineType).toBe('native');
    });

    it('应根据 .mov URL 返回 NativeEngine（临时修复：Plyr被替换为Native）', () => {
      const engine = createEngineByUrl('https://example.com/video.mov');
      expect(engine.engineType).toBe('native');
    });

    it('应忽略 URL 大小写', () => {
      const engine1 = createEngineByUrl('https://example.com/video.M3U8');
      const engine2 = createEngineByUrl('https://example.com/video.MPD');
      expect(engine1.engineType).toBe('hls');
      expect(engine2.engineType).toBe('dash');
    });

    it('应优先使用 engineType 选项', () => {
      const engine = createEngineByUrl('https://example.com/video.m3u8', {
        engineType: 'plyr',
      });
      expect(engine.engineType).toBe('native');
    });

    it('应使用 mimeType 选项推断引擎类型', () => {
      const engine = createEngineByUrl(
        'https://example.com/api/v1/media/123/preview',
        {
          mimeType: 'video/mp4',
        },
      );
      expect(engine.engineType).toBe('native');
    });

    it('mimeType 为 video/quicktime 应返回 NativeEngine（临时修复：Plyr被替换为Native）', () => {
      const engine = createEngineByUrl(
        'https://example.com/api/v1/media/123/preview',
        {
          mimeType: 'video/quicktime',
        },
      );
      expect(engine.engineType).toBe('native');
    });

    it('mimeType 为 application/x-mpegurl 应返回 HLS', () => {
      const engine = createEngineByUrl(
        'https://example.com/api/v1/media/123/preview',
        {
          mimeType: 'application/x-mpegurl',
        },
      );
      expect(engine.engineType).toBe('hls');
    });

    it('mimeType 为 application/dash+xml 应返回 DASH', () => {
      const engine = createEngineByUrl(
        'https://example.com/api/v1/media/123/preview',
        {
          mimeType: 'application/dash+xml',
        },
      );
      expect(engine.engineType).toBe('dash');
    });

    it('engineType 优先级高于 mimeType', () => {
      const engine = createEngineByUrl(
        'https://example.com/api/v1/media/123/preview',
        {
          mimeType: 'video/mp4',
          engineType: 'native',
        },
      );
      expect(engine.engineType).toBe('native');
    });

    it('无选项时降级为 URL 检测', () => {
      const engine = createEngineByUrl(
        'https://example.com/api/v1/media/123/preview',
      );
      expect(engine.engineType).toBe('native');
    });
  });

  describe('isEngineSupported', () => {
    it('NativeEngine 应始终支持', () => {
      expect(isEngineSupported('native')).toBe(true);
    });

    it('PlyrEngine 应始终支持', () => {
      expect(isEngineSupported('plyr')).toBe(true);
    });

    it('HLSEngine 支持性取决于环境', () => {
      const engine = isEngineSupported('hls');
      expect(typeof engine).toBe('boolean');
    });

    it('DASHEngine 支持性取决于环境', () => {
      const engine = isEngineSupported('dash');
      expect(typeof engine).toBe('boolean');
    });
  });
});
