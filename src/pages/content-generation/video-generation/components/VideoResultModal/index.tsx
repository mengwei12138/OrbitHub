import type React from 'react';
import { useEffect, useRef, useState } from 'react';
import styles from './style.module.css';

export interface VideoResult {
  title: string;
  duration: number;
  resolution: string;
  quality: string;
  credits: number;
  /** 视频 mp4 外部直链（24h 过期）；仅用于「下载视频」按钮 + 弹窗预览，与发布无关。 */
  videoUrl?: string;
  /**
   * 已 ingest 的本地 mediaAssetId。由 OpenSpec change `content-generation-publish-bridge` 引入：
   * 点击「去发布」**仅**用这个 id；缺失时 host 组件会同步 refetch 状态接口触发后端 fast-path
   * ingest，仍拿不到才弹「素材尚未就绪」（url-proxy 兜底已下掉）。
   *
   * 类型为 string：后端 Long 经 Jackson 字符串化序列化，与 store 上下游一致。
   */
  mediaAssetId?: string;
  /**
   * 任务 id；保留在 result 上是因为「去发布」按钮的兜底 refetch 路径需要这个值，
   * 当 store 里的 mediaAssetId 是「重启前的旧轮询」遗留下来的空值时，能借此再请一次后端。
   */
  taskId?: string;
}

export interface VideoResultModalProps {
  visible: boolean;
  result: VideoResult;
  onClose?: () => void;
  onGoWorks?: () => void;
  onRegenerate?: () => void;
  onPublish?: () => void;
  onDownload?: () => void;
}

const PlayIcon: React.FC = () => (
  <svg width="72" height="72" viewBox="0 0 72 72" fill="none">
    <circle cx="36" cy="36" r="36" fill="rgba(255,255,255,0.9)" />
    <path d="M30 24L48 36L30 48V24Z" fill="#1677ff" />
  </svg>
);

export const VideoResultModal: React.FC<VideoResultModalProps> = ({
  visible,
  result,
  onClose,
  onGoWorks,
  onRegenerate,
  onPublish,
  onDownload,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // 弹窗关闭时重置播放状态，下次打开重新从封面态开始
  useEffect(() => {
    if (!visible) {
      setIsPlaying(false);
      if (videoRef.current) {
        videoRef.current.pause();
      }
    }
  }, [visible]);

  if (!visible) return null;

  const hasVideo = !!result.videoUrl;
  const handlePlay = () => {
    if (!hasVideo) return;
    setIsPlaying(true);
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.content}>
        <div className={styles.header}>
          <span className={styles.title}>视频生成完成</span>
          <span className={styles.closeBtn} onClick={onClose}>
            ✕
          </span>
        </div>
        <div className={styles.body}>
          <div className={styles.videoPreview}>
            {isPlaying && hasVideo ? (
              <video
                ref={videoRef}
                className={styles.videoEl}
                src={result.videoUrl}
                controls
                autoPlay
                playsInline
                data-testid="video-result-player"
              >
                <track kind="captions" />
              </video>
            ) : (
              <>
                <button
                  type="button"
                  className={styles.playBtn}
                  onClick={handlePlay}
                  disabled={!hasVideo}
                  aria-label="播放视频"
                >
                  <PlayIcon />
                </button>
                <span className={styles.videoMeta}>
                  {result.duration}秒 · {result.resolution} · {result.quality}
                </span>
              </>
            )}
          </div>
          <div className={styles.metaCard}>
            <div className={styles.metaRow}>
              <span className={styles.metaLabel}>标题：</span>
              <span className={styles.metaValue}>{result.title}</span>
            </div>
            <div className={styles.metaRow}>
              <span className={styles.metaLabel}>
                时长：{result.duration} 秒
              </span>
              <span className={styles.metaLabel}>
                清晰度：{result.resolution}
              </span>
              <span className={styles.metaLabel}>质量：{result.quality}</span>
            </div>
            <div className={styles.metaRow}>
              <span className={styles.metaLabel}>消耗积分：</span>
              <span className={styles.credits}>{result.credits}</span>
            </div>
          </div>
        </div>
        <div className={styles.footer}>
          <button className={styles.goWorksBtn} onClick={onGoWorks}>
            去作品管理
          </button>
          <button className={styles.regenerateBtn} onClick={onRegenerate}>
            重新生成
          </button>
          <button className={styles.publishBtn} onClick={onPublish}>
            去发布
          </button>
          <button className={styles.downloadBtn} onClick={onDownload}>
            下载视频
          </button>
        </div>
      </div>
    </div>
  );
};

export default VideoResultModal;
