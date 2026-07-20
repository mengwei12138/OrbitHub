import { Button } from 'antd';
import type { FC } from 'react';
import type { WorkItem } from '../../types';
import {
  copyWorkText,
  downloadWork,
  isWorkActionDisabled,
} from '../../utils/workActions';
import styles from './WorkRow.module.css';

type WorkRowProps = {
  work: WorkItem;
  onViewDetail: (id: string) => void;
  onPublish: (work: WorkItem) => void;
  onRegenerate: (work: WorkItem) => void;
  /**
   * 是否以租户管理员视角渲染（决定是否展示 owner 信息行）。
   * 由 OpenSpec change `content-generation-my-works-data-isolation` 引入。
   */
  isTenantAdmin?: boolean;
};

const WorkRow: FC<WorkRowProps> = ({
  work,
  onViewDetail,
  onPublish,
  onRegenerate,
  isTenantAdmin = false,
}) => {
  const isProcessing = work.status === 'processing';
  const isFailed = work.status === 'failed';
  const actionsDisabled = isWorkActionDisabled(work);
  const canDownload =
    work.type === '视频' && !!work.videoUrl && !actionsDisabled;

  const handleDownload = () => downloadWork(work);
  const handleCopyText = () => {
    void copyWorkText(work);
  };

  // 视频类作品且已成功生成时，缩略图直接渲染原生 <video> 控件供用户在列表内点击播放
  const canInlinePlayVideo =
    work.type === '视频' && !!work.videoUrl && !isProcessing && !isFailed;

  return (
    <div className={styles.row}>
      <div className={styles.thumbnail}>
        {canInlinePlayVideo ? (
          <video
            className={styles.thumbnailBg}
            src={work.videoUrl}
            poster={work.thumbnailUrl}
            controls
            preload="metadata"
            playsInline
            style={{ objectFit: 'cover', background: '#000' }}
            data-testid={`work-row-video-${work.id}`}
          >
            <track kind="captions" />
          </video>
        ) : work.thumbnailUrl && !isProcessing ? (
          <img
            src={work.thumbnailUrl}
            alt={work.title}
            className={styles.thumbnailBg}
            style={{ objectFit: 'cover' }}
          />
        ) : (
          <div
            className={`${styles.thumbnailBg} ${
              work.thumbnail === 'video'
                ? styles.thumbnailBgVideo
                : styles.thumbnailBgImage
            }`}
          />
        )}
      </div>

      <div className={styles.info}>
        <div className={styles.row1}>
          <span
            className={`${styles.tag} ${
              work.type === '视频' ? styles.tagVideo : styles.tagImage
            }`}
          >
            {work.type}
          </span>
          <span className={styles.title}>{work.title}</span>
          {isProcessing && (
            <span
              className={`${styles.statusBadge} ${styles.statusProcessing}`}
            >
              生成中
            </span>
          )}
          {isFailed && (
            <span className={`${styles.statusBadge} ${styles.statusFailed}`}>
              生成失败
            </span>
          )}
        </div>

        <div className={styles.row2}>
          {work.date}
          {isTenantAdmin && work.ownerName ? (
            <span
              className={styles.owner}
              data-testid={`work-row-owner-${work.id}`}
            >
              {' · 由 '}
              {work.ownerName}
              {' 创建'}
            </span>
          ) : null}
        </div>

        {isFailed && work.failureReason ? (
          <div className={`${styles.row3} ${styles.failureReason}`}>
            {work.failureReason}
          </div>
        ) : (
          <div className={styles.row3}>{work.params}</div>
        )}

        <div className={styles.row4}>
          <span>消耗 {work.credits} 积分</span>
          {isProcessing || isFailed ? null : work.expiringSoon ? (
            <span className={styles.warning}>
              ⚠ 即将过期（{work.remainingHours} 小时后清理）
            </span>
          ) : work.remainingHours > 0 ? (
            <span>剩余保存：{work.remainingHours} 小时</span>
          ) : null}
        </div>
      </div>

      <div className={styles.actions}>
        {work.type === '视频' ? (
          <Button
            type="primary"
            className={styles.actionBtn}
            disabled={!canDownload}
            onClick={handleDownload}
          >
            下载
          </Button>
        ) : (
          <Button
            type="primary"
            className={styles.actionBtn}
            disabled={actionsDisabled}
            onClick={handleCopyText}
          >
            复制文本
          </Button>
        )}
        <Button
          type="primary"
          className={styles.actionBtn}
          disabled={actionsDisabled}
          onClick={() => onPublish(work)}
        >
          发布
        </Button>
        <Button
          className={styles.actionBtn}
          disabled={actionsDisabled}
          onClick={() => onRegenerate(work)}
        >
          重新生成
        </Button>
        <Button
          className={styles.actionBtn}
          onClick={() => onViewDetail(work.id)}
        >
          详情
        </Button>
      </div>
    </div>
  );
};

export default WorkRow;
