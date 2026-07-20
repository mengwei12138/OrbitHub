/**
 * VideoPlayer - 纯播放器封装组件
 *
 * 支持多种视频协议自动路由：
 * - MP4/WebM/Ogg → Plyr 引擎
 * - HLS (.m3u8) → HLS.js 引擎
 * - DASH (.mpd) → DASH.js 引擎
 *
 * 不定义 UI，由业务层二次封装自定义播放控制栏
 *
 * @example
 * // 基础用法
 * <VideoPlayer src="https://example.com/video.mp4" />
 *
 * @example
 * // 开启调试日志
 * <VideoPlayer src="https://example.com/video.mp4" debug={true} />
 *
 * @example
 * // 业务二次封装示例
 * const MyPlayer = forwardRef((props, ref) => {
 *   const playerRef = useRef<VideoPlayerRef>(null);
 *   useImperativeHandle(ref, () => ({
 *     play: () => playerRef.current?.play(),
 *     pause: () => playerRef.current?.pause(),
 *   }));
 *   return (
 *     <div>
 *       <VideoPlayer ref={playerRef} src={props.src} />
 *       <button onClick={() => playerRef.current?.play()}>播放</button>
 *     </div>
 *   );
 * });
 */

import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import { getLogger } from '@/utils/logger';
import { createEngineByUrl, type PlayerEngine } from './engines';
import type { VideoPlayerProps, VideoPlayerRef } from './types';

const VideoPlayer = forwardRef<VideoPlayerRef, VideoPlayerProps>(
  (
    {
      src,
      poster,
      mimeType,
      engineType,
      autoPlay,
      loop,
      muted,
      controls = true,
      preload,
      width,
      height,
      debug = true,
      onPlay,
      onPause,
      onEnded,
      onTimeUpdate,
      onLoadedMetadata,
      onError,
    },
    ref,
  ) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const engineRef = useRef<PlayerEngine | null>(null);
    const prevSrcRef = useRef<string | null>(null);

    useEffect(() => {
      const logger = getLogger();
      logger.debug('VideoPlayer debug mode', {
        debug,
        source: debug !== undefined ? 'props' : 'env',
        mode: import.meta.env.MODE,
      });
    }, [debug]);

    const callbacksRef = useRef({
      onPlay,
      onPause,
      onEnded,
      onTimeUpdate,
      onLoadedMetadata,
      onError,
    });

    useEffect(() => {
      const prev = callbacksRef.current;
      const hasChanged =
        onPlay !== prev.onPlay ||
        onPause !== prev.onPause ||
        onEnded !== prev.onEnded ||
        onTimeUpdate !== prev.onTimeUpdate ||
        onLoadedMetadata !== prev.onLoadedMetadata ||
        onError !== prev.onError;

      if (hasChanged) {
        callbacksRef.current = {
          onPlay: onPlay ?? prev.onPlay,
          onPause: onPause ?? prev.onPause,
          onEnded: onEnded ?? prev.onEnded,
          onTimeUpdate: onTimeUpdate ?? prev.onTimeUpdate,
          onLoadedMetadata: onLoadedMetadata ?? prev.onLoadedMetadata,
          onError: onError ?? prev.onError,
        };
      }
    }, [onPlay, onPause, onEnded, onTimeUpdate, onLoadedMetadata, onError]);

    useEffect(() => {
      const logger = getLogger();
      logger.debug('useEffect 触发', { src, poster });
      if (!videoRef.current || !src) {
        logger.debug('早期返回', { videoRefCurrent: !!videoRef.current, src });
        return;
      }

      if (prevSrcRef.current !== src) {
        logger.debug('Source changed, reinitializing engine', {
          prev: prevSrcRef.current,
          current: src,
        });
        prevSrcRef.current = src;
      }

      if (engineRef.current) {
        engineRef.current.destroy();
      }

      const engine = createEngineByUrl(src, { mimeType, engineType });

      logger.debug('Engine 创建完成', {
        engineType: engine.engineType,
        src,
        mimeType,
      });

      logger.info('Engine created', {
        engineType: engine.engineType,
        src,
      });

      engine.setElement(videoRef.current);

      logger.debug('设置 videoElement');

      engine.on('play', () => {
        getLogger().debug('Event: play');
        callbacksRef.current.onPlay?.();
      });

      engine.on('pause', () => {
        getLogger().debug('Event: pause');
        callbacksRef.current.onPause?.();
      });

      engine.on('ended', () => {
        getLogger().debug('Event: ended');
        callbacksRef.current.onEnded?.();
      });

      engine.on('loadedmetadata', () => {
        const duration = engine.getDuration();
        getLogger().debug('Event: loadedmetadata', { duration });
        callbacksRef.current.onLoadedMetadata?.(duration);
      });

      engine.on('timeupdate', () => {
        callbacksRef.current.onTimeUpdate?.(
          engine.getCurrentTime(),
          engine.getDuration(),
        );
      });

      engine.on('error', (e) => {
        const error = e as Error;
        getLogger().error('Event: error', { error: error.message });
        callbacksRef.current.onError?.(error);
      });

      if (poster) {
        videoRef.current.poster = poster;
        getLogger().debug('Poster set', { poster });
      }

      getLogger().debug('调用 engine.load', { src });
      engine.load(src, mimeType);
      getLogger().debug('engine.load 已调用');

      engineRef.current = engine;
    }, [src, poster, mimeType, engineType]);

    useEffect(() => {
      return () => {
        if (engineRef.current) {
          engineRef.current.destroy();
          engineRef.current = null;
        }
      };
    }, []);

    useImperativeHandle(
      ref,
      () => ({
        play: () => engineRef.current?.play(),
        pause: () => engineRef.current?.pause(),
        seek: (time) => engineRef.current?.seek(time),
        setVolume: (volume) => engineRef.current?.setVolume(volume),
        setMuted: (muted) => engineRef.current?.setMuted(muted),
        getCurrentTime: () => engineRef.current?.getCurrentTime() ?? 0,
        getDuration: () => engineRef.current?.getDuration() ?? 0,
        isPlaying: () => engineRef.current?.isPlaying() ?? false,
        getNativeElement: () => engineRef.current?.getNativeElement() ?? null,
      }),
      [],
    );

    return (
      <div
        ref={containerRef}
        style={{
          width: width ?? '100%',
          height: height ?? '100%',
        }}
      >
        <video
          ref={videoRef}
          autoPlay={autoPlay}
          loop={loop}
          muted={muted}
          controls={controls}
          preload={preload ?? 'metadata'}
          playsInline
          style={{ width: '100%', height: '100%', display: 'block' }}
        />
      </div>
    );
  },
);

VideoPlayer.displayName = 'VideoPlayer';

export default VideoPlayer;

export type { VideoPlayerProps, VideoPlayerRef } from './types';
