import { render } from '@testing-library/react';
import { useEffect, useRef } from 'react';
import { describe, expect, it, vi } from 'vitest';
import VideoPlayer from '../index';
import type { VideoPlayerRef } from '../types';

vi.mock('../engines', () => ({
  createEngineByUrl: vi.fn(() => ({
    supported: true,
    engineType: 'plyr' as const,
    setElement: vi.fn(),
    load: vi.fn(),
    play: vi.fn(() => Promise.resolve()),
    pause: vi.fn(),
    seek: vi.fn(),
    setVolume: vi.fn(),
    setMuted: vi.fn(),
    getCurrentTime: vi.fn(() => 30),
    getDuration: vi.fn(() => 120),
    isPlaying: vi.fn(() => true),
    getNativeElement: vi.fn(() => document.createElement('video')),
    on: vi.fn(),
    off: vi.fn(),
    destroy: vi.fn(),
  })),
}));

describe('VideoPlayer', () => {
  describe('渲染', () => {
    it('应渲染 video 元素', () => {
      const { container } = render(
        <VideoPlayer src="https://example.com/video.mp4" />,
      );
      expect(container.querySelector('video')).toBeInTheDocument();
    });

    it('应正确设置 autoPlay 属性', () => {
      const { container } = render(
        <VideoPlayer src="https://example.com/test.mp4" autoPlay />,
      );
      const video = container.querySelector('video') as HTMLVideoElement;
      expect(video.autoplay).toBe(true);
    });

    it('应正确设置 loop 属性', () => {
      const { container } = render(
        <VideoPlayer src="https://example.com/test.mp4" loop />,
      );
      const video = container.querySelector('video') as HTMLVideoElement;
      expect(video.loop).toBe(true);
    });

    it('应正确设置 muted 属性', () => {
      const { container } = render(
        <VideoPlayer src="https://example.com/test.mp4" muted />,
      );
      const video = container.querySelector('video') as HTMLVideoElement;
      expect(video.muted).toBe(true);
    });

    it('应正确设置 width 和 height', () => {
      const { container } = render(
        <VideoPlayer
          src="https://example.com/test.mp4"
          width={800}
          height={600}
        />,
      );
      const video = container.querySelector('video');
      const wrapper = video?.parentElement;
      expect(wrapper).toHaveStyle({ width: '800px', height: '600px' });
    });
  });

  describe('ref 方法', () => {
    it('ref 应暴露 play 方法', () => {
      const TestComponent = () => {
        const ref = useRef<VideoPlayerRef>(null);

        useEffect(() => {
          if (ref.current) {
            expect(typeof ref.current.play).toBe('function');
          }
        }, []);

        return <VideoPlayer ref={ref} src="https://example.com/test.mp4" />;
      };

      render(<TestComponent />);
    });

    it('ref 应暴露 pause 方法', () => {
      const TestComponent = () => {
        const ref = useRef<VideoPlayerRef>(null);

        useEffect(() => {
          if (ref.current) {
            expect(typeof ref.current.pause).toBe('function');
          }
        }, []);

        return <VideoPlayer ref={ref} src="https://example.com/test.mp4" />;
      };

      render(<TestComponent />);
    });

    it('ref 应暴露 seek 方法', () => {
      const TestComponent = () => {
        const ref = useRef<VideoPlayerRef>(null);

        useEffect(() => {
          if (ref.current) {
            expect(typeof ref.current.seek).toBe('function');
          }
        }, []);

        return <VideoPlayer ref={ref} src="https://example.com/test.mp4" />;
      };

      render(<TestComponent />);
    });

    it('ref 应暴露 setVolume 方法', () => {
      const TestComponent = () => {
        const ref = useRef<VideoPlayerRef>(null);

        useEffect(() => {
          if (ref.current) {
            expect(typeof ref.current.setVolume).toBe('function');
          }
        }, []);

        return <VideoPlayer ref={ref} src="https://example.com/test.mp4" />;
      };

      render(<TestComponent />);
    });

    it('ref 应暴露 setMuted 方法', () => {
      const TestComponent = () => {
        const ref = useRef<VideoPlayerRef>(null);

        useEffect(() => {
          if (ref.current) {
            expect(typeof ref.current.setMuted).toBe('function');
          }
        }, []);

        return <VideoPlayer ref={ref} src="https://example.com/test.mp4" />;
      };

      render(<TestComponent />);
    });

    it('ref 应暴露 getCurrentTime 方法', () => {
      const TestComponent = () => {
        const ref = useRef<VideoPlayerRef>(null);

        useEffect(() => {
          if (ref.current) {
            expect(typeof ref.current.getCurrentTime).toBe('function');
          }
        }, []);

        return <VideoPlayer ref={ref} src="https://example.com/test.mp4" />;
      };

      render(<TestComponent />);
    });

    it('ref 应暴露 getDuration 方法', () => {
      const TestComponent = () => {
        const ref = useRef<VideoPlayerRef>(null);

        useEffect(() => {
          if (ref.current) {
            expect(typeof ref.current.getDuration).toBe('function');
          }
        }, []);

        return <VideoPlayer ref={ref} src="https://example.com/test.mp4" />;
      };

      render(<TestComponent />);
    });

    it('ref 应暴露 isPlaying 方法', () => {
      const TestComponent = () => {
        const ref = useRef<VideoPlayerRef>(null);

        useEffect(() => {
          if (ref.current) {
            expect(typeof ref.current.isPlaying).toBe('function');
          }
        }, []);

        return <VideoPlayer ref={ref} src="https://example.com/test.mp4" />;
      };

      render(<TestComponent />);
    });

    it('ref 应暴露 getNativeElement 方法', () => {
      const TestComponent = () => {
        const ref = useRef<VideoPlayerRef>(null);

        useEffect(() => {
          if (ref.current) {
            expect(typeof ref.current.getNativeElement).toBe('function');
          }
        }, []);

        return <VideoPlayer ref={ref} src="https://example.com/test.mp4" />;
      };

      render(<TestComponent />);
    });
  });

  describe('事件回调', () => {
    it('onPlay 回调应存在', () => {
      const onPlay = vi.fn();
      render(
        <VideoPlayer src="https://example.com/test.mp4" onPlay={onPlay} />,
      );
      expect(onPlay).toBeDefined();
    });

    it('onPause 回调应存在', () => {
      const onPause = vi.fn();
      render(
        <VideoPlayer src="https://example.com/test.mp4" onPause={onPause} />,
      );
      expect(onPause).toBeDefined();
    });

    it('onEnded 回调应存在', () => {
      const onEnded = vi.fn();
      render(
        <VideoPlayer src="https://example.com/test.mp4" onEnded={onEnded} />,
      );
      expect(onEnded).toBeDefined();
    });

    it('onTimeUpdate 回调应存在', () => {
      const onTimeUpdate = vi.fn();
      render(
        <VideoPlayer
          src="https://example.com/test.mp4"
          onTimeUpdate={onTimeUpdate}
        />,
      );
      expect(onTimeUpdate).toBeDefined();
    });

    it('onLoadedMetadata 回调应存在', () => {
      const onLoadedMetadata = vi.fn();
      render(
        <VideoPlayer
          src="https://example.com/test.mp4"
          onLoadedMetadata={onLoadedMetadata}
        />,
      );
      expect(onLoadedMetadata).toBeDefined();
    });

    it('onError 回调应存在', () => {
      const onError = vi.fn();
      render(
        <VideoPlayer src="https://example.com/test.mp4" onError={onError} />,
      );
      expect(onError).toBeDefined();
    });
  });

  describe('组件卸载', () => {
    it('卸载时应正常卸载', () => {
      const { unmount } = render(
        <VideoPlayer src="https://example.com/test.mp4" />,
      );
      unmount();
    });
  });
});
