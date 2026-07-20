# VideoPlayer 组件约定

## 简介

纯播放器封装组件，支持多种视频协议自动路由。**不定义 UI**，由业务层二次封装自定义播放控制栏。

## 架构设计

```
┌─────────────────────────────────────────┐
│  业务二次封装（自定义 UI）               │
│  - 播放/暂停按钮                        │
│  - 进度条                              │
│  - 音量控制                            │
│  - 全屏按钮                            │
├─────────────────────────────────────────┤
│  VideoPlayer（纯播放器，无 UI）         │
│  - ref.play() / pause()               │
│  - seek() / setVolume()                │
│  - 协议自动路由                        │
│  - 日志系统（debug模式）               │
├─────────────────────────────────────────┤
│  engines/                             │
│  ├── BaseEngine（抽象基类）           │
│  ├── EventEmitter（事件发射器）        │
│  └── PlayerEngine（引擎接口）          │
├─────────────────────────────────────────┤
│  Plyr / HLS.js / DASH.js              │
│  - 实际播放器能力                      │
└─────────────────────────────────────────┘
```

### 目录结构

```
VideoPlayer/
├── index.tsx              # 主组件入口
├── types.ts               # Props/Ref 类型定义
├── utils/
│   ├── logger.ts          # 日志系统
│   └── EventEmitter.ts    # 事件发射器
└── engines/
    ├── index.ts           # 引擎工厂
    ├── types.ts           # 引擎接口类型
    ├── BaseEngine.ts      # 抽象基类
    ├── NativeEngine.ts    # 原生引擎
    ├── PlyrEngine.ts      # Plyr 引擎
    ├── HLSEngine.ts       # HLS.js 引擎
    └── DASHEngine.ts      # DASH.js 引擎
```

## 协议路由

| URL 特征            | 引擎    | 协议 |
| ------------------- | ------- | ---- |
| `.m3u8`             | HLS.js  | HLS  |
| `.mpd`              | DASH.js | DASH |
| 其他 (MP4/WebM/Ogg) | Plyr    | 原生 |

## 依赖

| 依赖   | 版本  | 用途                       |
| ------ | ----- | -------------------------- |
| plyr   | 3.7.x | MP4/WebM/Ogg 播放 + 控制栏 |
| hls.js | 1.5.x | HLS 协议支持               |
| dashjs | 5.0.x | DASH 协议支持              |

## 日志系统

### 调试模式

```tsx
// 默认：开发环境开启，生产环境关闭
<VideoPlayer src="https://example.com/video.mp4" />

// 强制开启
<VideoPlayer src="https://example.com/video.mp4" debug={true} />

// 强制关闭
<VideoPlayer src="https://example.com/video.mp4" debug={false} />
```

### 日志级别

| 级别  | 说明                                           |
| ----- | ---------------------------------------------- |
| DEBUG | 详细调试信息（引擎创建、事件注册、音量设置等） |
| INFO  | 主要操作（加载源、销毁引擎）                   |
| WARN  | 警告信息（play() 被拒绝、无 videoElement）     |
| ERROR | 错误信息（HLS/DASH 错误、加载失败）            |

### 日志输出示例

```
[VideoPlayer] [14:32:01.456] INFO Engine created: {engineType: "plyr", src: "..."}
[Plyr] [14:32:01.458] DEBUG Plyr instance created
[VideoPlayer] [14:32:01.500] INFO Loading source: {url: "...", mimeType: "video/mp4"}
[VideoPlayer] [14:32:02.100] DEBUG Play triggered: {currentTime: 0}
[VideoPlayer] [14:32:02.105] DEBUG Engine event emitted: {engineEvent: "play", htmlEvent: "playing"}
```

## 使用示例

### 基础用法

```tsx
import { VideoPlayer } from '@/components';

<VideoPlayer
  src="https://example.com/video.mp4"
  poster="https://example.com/poster.jpg"
/>;
```

### 开启调试日志

```tsx
<VideoPlayer
  src="https://example.com/video.mp4"
  debug={true}
  onError={(error) => console.error('播放错误:', error)}
/>
```

### 二次封装示例

```tsx
import { VideoPlayer, type VideoPlayerRef } from '@/components';
import { forwardRef, useCallback, useRef, useState } from 'react';

const MyVideoPlayer = forwardRef<MyVideoPlayerRef, MyVideoPlayerProps>(
  (props, ref) => {
    const playerRef = useRef<VideoPlayerRef>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);

    useImperativeHandle(ref, () => ({
      play: () => playerRef.current?.play(),
      pause: () => playerRef.current?.pause(),
      seek: (time) => playerRef.current?.seek(time),
      setVolume: (volume) => playerRef.current?.setVolume(volume),
      getCurrentTime: () => playerRef.current?.getCurrentTime() ?? 0,
      getDuration: () => playerRef.current?.getDuration() ?? 0,
      isPlaying: () => playerRef.current?.isPlaying() ?? false,
    }));

    return (
      <div>
        <VideoPlayer
          ref={playerRef}
          src={props.src}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onTimeUpdate={(t, d) => {
            setCurrentTime(t);
            setDuration(d);
          }}
          onLoadedMetadata={(d) => setDuration(d)}
        />
        <div className="controls">
          <button
            onClick={() =>
              isPlaying ? playerRef.current?.pause() : playerRef.current?.play()
            }
          >
            {isPlaying ? '暂停' : '播放'}
          </button>
          <span>
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>
          <input
            type="range"
            min={0}
            max={duration}
            value={currentTime}
            onChange={(e) => playerRef.current?.seek(Number(e.target.value))}
          />
        </div>
      </div>
    );
  },
);
```

## Props

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `src` | `string` | **必填** | 视频源 URL |
| `poster` | `string` | - | 封面图 URL |
| `autoPlay` | `boolean` | `false` | 自动播放 |
| `loop` | `boolean` | `false` | 循环播放 |
| `muted` | `boolean` | `false` | 静音 |
| `controls` | `boolean` | `true` | 显示控制栏（Plyr 默认） |
| `preload` | `'auto' \| 'metadata' \| 'none'` | `'metadata'` | 预加载策略 |
| `width` | `number \| string` | - | 播放器宽度 |
| `height` | `number \| string` | - | 播放器高度 |
| `debug` | `boolean` | `import.meta.env.MODE === 'development'` | 开启调试日志 |
| `onPlay` | `() => void` | - | 播放事件回调 |
| `onPause` | `() => void` | - | 暂停事件回调 |
| `onEnded` | `() => void` | - | 播放结束回调 |
| `onTimeUpdate` | `(currentTime: number, duration: number) => void` | - | 时间更新回调 |
| `onLoadedMetadata` | `(duration: number) => void` | - | 元数据加载完成回调 |
| `onError` | `(error: Error) => void` | - | 错误回调 |

## Ref 接口

| 方法                 | 返回值                     | 说明                |
| -------------------- | -------------------------- | ------------------- |
| `play()`             | `Promise<void> \| void`    | 播放                |
| `pause()`            | `void`                     | 暂停                |
| `seek(time)`         | `void`                     | 跳转至指定时间      |
| `setVolume(volume)`  | `void`                     | 设置音量 (0-1)      |
| `setMuted(muted)`    | `void`                     | 设置静音            |
| `getCurrentTime()`   | `number`                   | 获取当前播放时间    |
| `getDuration()`      | `number`                   | 获取视频总时长      |
| `isPlaying()`        | `boolean`                  | 获取是否正在播放    |
| `getNativeElement()` | `HTMLVideoElement \| null` | 获取原生 video 元素 |

## 注意事项

1. **无 UI 定义**：VideoPlayer 不定义任何 UI，完全由业务层二次封装
2. **协议自动路由**：根据 URL 自动选择合适的播放引擎
3. **ref 必填**：建议通过 ref 获取播放器控制能力
4. **Plyr 控制栏**：默认使用 Plyr 自带的控制栏，设置 `controls={false}` 可隐藏
5. **调试日志**：通过 `debug` prop 控制，默认在开发环境开启

## 性能优化

- **内存泄漏修复**：`off()` 方法现在正确调用 `removeEventListener`
- **回调优化**：使用 `callbacksRef` 只更新变化的回调，避免不必要的重新渲染
- **Src 变化检测**：使用 `useRef` 保存上次的 `src`，只有真正变化时才重新初始化引擎

## 类型导出

组件导出以下类型，可直接从 `@/components` 导入：

```tsx
import type { VideoPlayerProps, VideoPlayerRef } from '@/components';
```
