import { Button } from 'antd';
import type { FC } from 'react';
import type { WorkItem } from '../../types';
import styles from './style.module.css';

export type WorkDetailContentProps = {
  work: WorkItem;
  onDownload: () => void;
  onPublish: () => void;
  onRegenerate: () => void;
  onClose: () => void;
  downloadDisabled?: boolean;
  publishDisabled?: boolean;
  regenerateDisabled?: boolean;
};

const WorkDetailContent: FC<WorkDetailContentProps> = ({
  work,
  onDownload,
  onPublish,
  onRegenerate,
  onClose,
  downloadDisabled = false,
  publishDisabled = false,
  regenerateDisabled = false,
}) => {
  const isProcessing = work.status === 'processing';
  const isFailed = work.status === 'failed';
  const isCompleted = !isProcessing && !isFailed;
  const canShowVideo = work.type === '视频' && !!work.videoUrl && isCompleted;
  const canShowImage = work.type === '图文' && !!work.imageUrl && isCompleted;

  const statusText = isFailed
    ? `生成失败${work.failureReason ? `：${work.failureReason}` : ''}`
    : work.expiringSoon
      ? `⚠ 即将过期（${work.remainingHours} 小时后清理）`
      : isProcessing
        ? '生成中'
        : work.remainingHours != null && work.remainingHours > 0
          ? `已保存（剩余 ${work.remainingHours} 小时）`
          : '已保存';

  return (
    <>
      <div className={styles.metaCard}>
        <div className={styles.metaRow}>
          <span className={styles.metaLabel}>标题</span>
          <span className={styles.metaValue}>{work.title}</span>
        </div>
        <div className={styles.metaRow}>
          <span className={styles.metaLabel}>生成时间</span>
          <span className={styles.metaValue}>{work.date}</span>
        </div>
        <div className={styles.metaRow}>
          <span className={styles.metaLabel}>消耗积分</span>
          <span className={styles.metaValue}>{work.credits}</span>
        </div>
        <div className={styles.metaRow}>
          <span className={styles.metaLabel}>参数</span>
          <span className={styles.metaValue}>{work.params || '—'}</span>
        </div>
        <div className={styles.metaRow}>
          <span className={styles.metaLabel}>状态</span>
          <span className={styles.metaValue}>{statusText}</span>
        </div>
      </div>

      {canShowVideo ? (
        <video
          className={`${styles.preview} ${styles.previewVideo}`}
          src={work.videoUrl}
          poster={work.thumbnailUrl}
          controls
          preload="metadata"
          playsInline
          data-testid="work-detail-video"
        >
          <track kind="captions" />
        </video>
      ) : canShowImage ? (
        <img
          className={`${styles.preview} ${styles.previewImage}`}
          src={work.imageUrl}
          alt={work.title}
          data-testid="work-detail-image"
        />
      ) : (
        <div
          className={`${styles.preview} ${
            work.type === '视频' ? styles.previewVideo : styles.previewImage
          }`}
          data-testid="work-detail-preview-placeholder"
        />
      )}

      <div className={styles.footer}>
        <Button type="primary" onClick={onDownload} disabled={downloadDisabled}>
          {work.type === '视频' ? '下载视频' : '下载'}
        </Button>
        <Button type="primary" onClick={onPublish} disabled={publishDisabled}>
          去发布
        </Button>
        <Button
          className={styles.regenerateBtn}
          onClick={onRegenerate}
          disabled={regenerateDisabled}
        >
          重新生成
        </Button>
        <Button className={styles.closeBtn} onClick={onClose}>
          关闭
        </Button>
      </div>
    </>
  );
};

export default WorkDetailContent;
