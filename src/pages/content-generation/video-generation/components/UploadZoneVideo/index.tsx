import { PlusOutlined } from '@ant-design/icons';
import { message, Progress, Upload } from 'antd';
import type { RcFile } from 'antd/es/upload/interface';
import type React from 'react';
import { useCallback, useMemo, useRef } from 'react';
import type { UploadController } from '@/components/CustomMediaUpload';
import CustomMediaUpload from '@/components/CustomMediaUpload';
import type { UploadError } from '@/components/CustomMediaUpload/types';
import { useAuthenticatedMediaPreview } from '@/hooks/useAuthenticatedMediaPreview';
import { useUploadSlot } from '@/hooks/useUploadSlot';
import type { UploadCompleteData } from '@/services/media-upload/types';
import { useUploadWatchdog } from '../../hooks/useUploadWatchdog';
import UploadVideoIcon from '../../images/upload-video-icon.svg';
import type { UploadedMediaFile } from '../../types/media';
import {
  formatMediaStatusSuffix,
  getMediaStatusBreakdown,
} from '../../utils/mediaFiles';
import {
  canAcceptMoreUpload,
  trimToMaxCount,
} from '../../utils/mediaUploadLimits';
import { checkVideoResolution } from '../../utils/resolutionGate';
import shared from '../uploadZone.shared.module.css';
import styles from './style.module.css';

const MAX_COUNT = 3;
const MAX_SIZE_MB = 50;
const MAX_DURATION_SEC = 15;

function withLocalThumb(file: UploadedMediaFile): UploadedMediaFile {
  if (file.thumbUrl) return file;
  const raw = file.originFileObj;
  if (raw instanceof File) {
    return { ...file, thumbUrl: URL.createObjectURL(raw) };
  }
  return file;
}

function revokeThumbUrl(file: UploadedMediaFile) {
  if (file.thumbUrl?.startsWith('blob:')) {
    URL.revokeObjectURL(file.thumbUrl);
  }
}

function createOptimisticUploading(file: RcFile): UploadedMediaFile {
  return {
    uid: file.uid,
    name: file.name,
    status: 'uploading',
    thumbUrl: URL.createObjectURL(file),
    originFileObj: file,
  };
}

export interface UploadZoneVideoProps {
  uploadController?: UploadController;
  value?: UploadedMediaFile[];
  onChange?: (
    files:
      | UploadedMediaFile[]
      | ((prev: UploadedMediaFile[]) => UploadedMediaFile[]),
  ) => void;
  disabled?: boolean;
  className?: string;
  /**
   * 允许上传视频的短边上限。来自当前生成质量档位：
   * 标准质量 720（720P），高级质量 1080（1080P）。
   * 用于在素材进入上传队列前拦截分辨率过高的视频，避免外部生成接口报
   * "video pixel count must be less than or equal to ..." 类错误。
   * 不传时不做分辨率校验。
   */
  maxResolutionShortEdge?: number;
  /** 与 {@link maxResolutionShortEdge} 配套展示的档位文案（如 "720P"）。仅用于错误提示。 */
  maxResolutionLabel?: string;
}

function mergeComplete(
  base: UploadedMediaFile,
  response: UploadCompleteData | undefined,
): UploadedMediaFile {
  if (!response) return base;
  const previewUrl =
    response.previewUrl ||
    (response.mediaAssetId
      ? `/api/v1/media/${response.mediaAssetId}/preview`
      : undefined);
  return {
    ...base,
    status: 'done',
    previewUrl,
    url: previewUrl ?? base.url,
    mediaAssetId: response.mediaAssetId,
    mimeType: response.mimeType,
    probeError: response.probeError,
    cozeFileId: response.cozeFileId,
  };
}

/**
 * 多文件同时上传时，浏览器会并发创建多个 <video> 解析 metadata，
 * Chrome 对同时活跃的媒体元素有上限，超过后部分 onloadedmetadata / onerror
 * 都不会触发——beforeUpload 的 await 会永远 pending，整个上传被阻塞。
 * 加硬超时兜底，超时按"无法校验"走 catch，让上传继续进行。
 */
const VIDEO_PROBE_TIMEOUT_MS = 5000;

interface VideoMetadata {
  duration: number;
  width: number;
  height: number;
}

const probeVideoMetadata = (file: File): Promise<VideoMetadata> =>
  new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.preload = 'metadata';
    let settled = false;
    const cleanup = () => {
      URL.revokeObjectURL(video.src);
      video.onloadedmetadata = null;
      video.onerror = null;
    };
    const settle = (fn: () => void) => {
      if (settled) return;
      settled = true;
      cleanup();
      fn();
    };
    video.onloadedmetadata = () =>
      settle(() =>
        resolve({
          duration: video.duration,
          width: video.videoWidth,
          height: video.videoHeight,
        }),
      );
    video.onerror = () => settle(() => reject(new Error('无法读取视频元数据')));
    setTimeout(
      () => settle(() => reject(new Error('读取视频元数据超时'))),
      VIDEO_PROBE_TIMEOUT_MS,
    );
    video.src = URL.createObjectURL(file);
  });

type VideoThumbProps = {
  file: UploadedMediaFile;
  onRemove: (uid: string) => void;
};

const VideoThumb = ({ file, onRemove }: VideoThumbProps) => {
  const localSrc = file.thumbUrl?.startsWith('blob:')
    ? file.thumbUrl
    : undefined;
  const { displayUrl, failed } = useAuthenticatedMediaPreview(
    file.status === 'done' && !localSrc
      ? (file.previewUrl ?? file.url)
      : undefined,
  );
  const src = file.status === 'uploading' ? localSrc : (localSrc ?? displayUrl);
  // 上传失败 或 已完成但预览拉取失败，都视作错误态——给出统一的红色提示
  const isError = file.status === 'error' || (file.status === 'done' && failed);

  return (
    <div className={`${shared.thumbItem} ${styles.thumbItem}`}>
      {file.status === 'uploading' ? (
        <>
          {localSrc ? (
            <video
              src={localSrc}
              className={styles.thumbVideo}
              preload="metadata"
              muted
            >
              <track kind="captions" />
            </video>
          ) : (
            <div className={shared.thumbPlaceholder} />
          )}
          <div className={styles.progressBar}>
            <Progress
              percent={file.percent ?? 0}
              showInfo={false}
              size="small"
              strokeColor="#1677ff"
            />
          </div>
          <button
            type="button"
            className={shared.deleteBtn}
            aria-label="删除"
            onClick={() => onRemove(file.uid)}
          >
            ×
          </button>
        </>
      ) : isError ? (
        <>
          <div className={shared.thumbError} aria-label="上传失败">
            <span className={shared.thumbErrorIcon} aria-hidden>
              !
            </span>
            <span className={shared.thumbErrorLabel}>上传失败</span>
          </div>
          <button
            type="button"
            className={shared.deleteBtn}
            aria-label="删除"
            onClick={() => onRemove(file.uid)}
          >
            ×
          </button>
          {file.name && <span className={styles.fileName}>{file.name}</span>}
        </>
      ) : (
        <>
          {src ? (
            <video
              src={src}
              className={styles.thumbVideo}
              preload="metadata"
              muted
            >
              <track kind="captions" />
            </video>
          ) : (
            <div className={shared.thumbPlaceholder} />
          )}
          <button
            type="button"
            className={shared.deleteBtn}
            aria-label="删除"
            onClick={() => onRemove(file.uid)}
          >
            ×
          </button>
          {file.name && <span className={styles.fileName}>{file.name}</span>}
        </>
      )}
    </div>
  );
};

const EmptyContent = ({ disabled = false }: { disabled?: boolean }) => {
  const body = (
    <div className={`${shared.emptyLayout} ${styles.emptyLayoutVideo}`}>
      <div className={`${shared.emptyMain} ${styles.emptyMainVideo}`}>
        <img
          src={UploadVideoIcon}
          alt=""
          className={styles.uploadIcon}
          width={48}
          height={48}
        />
        <span className={shared.title}>点击或拖拽上传视频</span>
        <span className={shared.desc}>MP4 · ≤15 秒 · ≤50MB · 最多 3 个</span>
      </div>
      <div className={shared.hintSlot}>
        <span
          className={`${styles.disabledHint} ${!disabled ? styles.disabledHintHidden : ''}`}
        >
          免费试用暂不支持视频素材
        </span>
      </div>
    </div>
  );
  return (
    <div className={`${shared.zoneInner} ${styles.zoneInnerVideo}`}>{body}</div>
  );
};

export const UploadZoneVideo: React.FC<UploadZoneVideoProps> = ({
  uploadController,
  value = [],
  onChange,
  disabled = false,
  className,
  maxResolutionShortEdge,
  maxResolutionLabel,
}) => {
  const files = value;
  const isEmpty = files.length === 0;
  const remainingSlots = MAX_COUNT - files.length;
  const canContinue = remainingSlots > 0 && !disabled;
  const uploadSlot = useUploadSlot(MAX_COUNT);
  const breakdown = useMemo(() => getMediaStatusBreakdown(files), [files]);
  const statusSuffix = formatMediaStatusSuffix(breakdown);

  const patchFiles = useCallback(
    (updater: (prev: UploadedMediaFile[]) => UploadedMediaFile[]) => {
      onChange?.(updater);
    },
    [onChange],
  );
  useUploadWatchdog(files, patchFiles);
  const limitWarnedRef = useRef(false);
  const pendingReservationsRef = useRef(0);

  const warnLimitOnce = useCallback(() => {
    if (!limitWarnedRef.current) {
      limitWarnedRef.current = true;
      message.warning(`最多上传 ${MAX_COUNT} 个视频`);
      queueMicrotask(() => {
        limitWarnedRef.current = false;
      });
    }
  }, []);

  const dropReserved = useCallback(
    (uid: string) => {
      patchFiles((prev) => {
        const target = prev.find((f) => f.uid === uid);
        if (target) revokeThumbUrl(target);
        return prev.filter((f) => f.uid !== uid);
      });
    },
    [patchFiles],
  );

  const beforeUpload = useCallback(
    async (file: RcFile) => {
      const alreadyListed = files.some((f) => f.uid === file.uid);
      if (
        !alreadyListed &&
        files.length + pendingReservationsRef.current >= MAX_COUNT
      ) {
        warnLimitOnce();
        return Upload.LIST_IGNORE;
      }
      if (!alreadyListed) {
        pendingReservationsRef.current += 1;
        queueMicrotask(() => {
          pendingReservationsRef.current = Math.max(
            0,
            pendingReservationsRef.current - 1,
          );
        });
      }
      patchFiles((prev) => {
        if (!canAcceptMoreUpload(prev, file.uid, MAX_COUNT)) return prev;
        return trimToMaxCount(
          [...prev, createOptimisticUploading(file)],
          MAX_COUNT,
        );
      });
      if (file.size > MAX_SIZE_MB * 1024 * 1024) {
        dropReserved(file.uid);
        message.error(`视频大小不能超过 ${MAX_SIZE_MB}MB`);
        return Upload.LIST_IGNORE;
      }
      try {
        const meta = await probeVideoMetadata(file);
        if (meta.duration > MAX_DURATION_SEC) {
          dropReserved(file.uid);
          message.error(`视频时长不能超过 ${MAX_DURATION_SEC} 秒`);
          return Upload.LIST_IGNORE;
        }
        const resolutionCheck = checkVideoResolution(
          meta.width,
          meta.height,
          maxResolutionShortEdge,
          maxResolutionLabel,
        );
        if (!resolutionCheck.ok) {
          dropReserved(file.uid);
          if (resolutionCheck.reason) {
            message.error(resolutionCheck.reason);
          }
          return Upload.LIST_IGNORE;
        }
      } catch {
        message.warning('无法校验视频元数据，将继续上传');
      }
      return true;
    },
    [
      dropReserved,
      files,
      maxResolutionLabel,
      maxResolutionShortEdge,
      patchFiles,
      warnLimitOnce,
    ],
  );

  const handleUploadChange = useCallback(
    (info: { file: UploadedMediaFile }) => {
      const { file } = info;

      if (file.status === 'done') {
        const response = file.response as UploadCompleteData | undefined;
        if (!response?.previewUrl && !response?.mediaAssetId) {
          message.error('上传完成但未返回预览地址');
          patchFiles((prev) => prev.filter((f) => f.uid !== file.uid));
          return;
        }
        const doneFile = mergeComplete(withLocalThumb(file), response);
        patchFiles((prev) => {
          const idx = prev.findIndex((f) => f.uid === file.uid);
          if (idx >= 0) {
            const next = [...prev];
            next[idx] = doneFile;
            return trimToMaxCount(next, MAX_COUNT);
          }
          if (!canAcceptMoreUpload(prev, file.uid, MAX_COUNT)) return prev;
          return trimToMaxCount([...prev, doneFile], MAX_COUNT);
        });
        return;
      }

      if (file.status === 'error') {
        message.error(file.error?.message || '视频上传失败');
        patchFiles((prev) => {
          const idx = prev.findIndex((f) => f.uid === file.uid);
          if (idx >= 0) {
            if (prev[idx].status === 'done') return prev;
            const next = [...prev];
            next[idx] = { ...file, status: 'error' };
            return next;
          }
          if (!canAcceptMoreUpload(prev, file.uid, MAX_COUNT)) return prev;
          return trimToMaxCount(
            [...prev, { ...file, status: 'error' }],
            MAX_COUNT,
          );
        });
        return;
      }

      if (file.status === 'removed') {
        patchFiles((prev) => prev.filter((f) => f.uid !== file.uid));
        return;
      }

      if (file.status === 'uploading') {
        const withThumb = withLocalThumb(file);
        const uploading: UploadedMediaFile = {
          ...withThumb,
          status: 'uploading',
          percent: file.percent,
        };
        patchFiles((prev) => {
          const idx = prev.findIndex((f) => f.uid === file.uid);
          if (idx >= 0) {
            if (prev[idx].status === 'done' || prev[idx].status === 'error') {
              return prev;
            }
            const next = [...prev];
            next[idx] = uploading;
            return next;
          }
          if (!canAcceptMoreUpload(prev, file.uid, MAX_COUNT)) return prev;
          return trimToMaxCount([...prev, uploading], MAX_COUNT);
        });
      }
    },
    [patchFiles],
  );

  const handleRemove = useCallback(
    (uid: string) => {
      const target = files.find((f) => f.uid === uid);
      if (target) revokeThumbUrl(target);
      patchFiles((prev) => prev.filter((f) => f.uid !== uid));
    },
    [files, patchFiles],
  );

  const markFileDone = useCallback(
    (response: UploadCompleteData, file: RcFile) => {
      if (!response?.previewUrl && !response?.mediaAssetId) {
        message.error('上传完成但未返回预览地址');
        patchFiles((prev) => prev.filter((f) => f.uid !== file.uid));
        return;
      }
      patchFiles((prev) => {
        const idx = prev.findIndex((f) => f.uid === file.uid);
        const base: UploadedMediaFile =
          idx >= 0
            ? prev[idx]
            : {
                uid: file.uid,
                name: file.name,
                status: 'uploading',
              };
        const doneFile = mergeComplete(withLocalThumb(base), response);
        if (idx >= 0) {
          const next = [...prev];
          next[idx] = doneFile;
          return trimToMaxCount(next, MAX_COUNT);
        }
        if (!canAcceptMoreUpload(prev, file.uid, MAX_COUNT)) return prev;
        return trimToMaxCount([...prev, doneFile], MAX_COUNT);
      });
    },
    [patchFiles],
  );

  const markFileError = useCallback(
    (file: RcFile, err: UploadError) => {
      message.error(err.message || '视频上传失败');
      patchFiles((prev) => {
        const idx = prev.findIndex((f) => f.uid === file.uid);
        if (idx >= 0) {
          if (prev[idx].status === 'done') return prev;
          const next = [...prev];
          next[idx] = {
            ...next[idx],
            status: 'error',
            error: { message: err.message },
          };
          return next;
        }
        if (!canAcceptMoreUpload(prev, file.uid, MAX_COUNT)) return prev;
        return trimToMaxCount(
          [
            ...prev,
            {
              uid: file.uid,
              name: file.name,
              status: 'error' as const,
              error: { message: err.message },
            },
          ],
          MAX_COUNT,
        );
      });
    },
    [patchFiles],
  );

  const uploadProps = useMemo(
    () => ({
      accept: 'video/mp4,.mp4',
      multiple: true,
      fileList: files,
      maxFileSize: MAX_SIZE_MB,
      showUploadList: false as const,
      uploadSlot,
      disabled,
      beforeUpload,
      onChange: handleUploadChange,
      onComplete: markFileDone,
      onError: (err: UploadError, file: RcFile) => markFileError(file, err),
    }),
    [
      beforeUpload,
      disabled,
      files,
      handleUploadChange,
      markFileDone,
      markFileError,
      uploadSlot,
    ],
  );

  if (!uploadController) {
    return (
      <div className={`${shared.zoneWrap} ${className ?? ''}`}>
        <div className={styles.emptyShell}>
          <EmptyContent disabled={disabled} />
        </div>
      </div>
    );
  }

  return (
    <div className={`${shared.zoneWrap} ${className ?? ''}`}>
      <CustomMediaUpload
        dragger
        uploadController={uploadController}
        className={
          isEmpty
            ? `${styles.draggerSlot}${disabled ? ` ${styles.draggerSlotDisabled}` : ''}`
            : styles.draggerSlotFilled
        }
        {...uploadProps}
      >
        {isEmpty ? (
          <EmptyContent disabled={disabled} />
        ) : (
          <div className={shared.filled}>
            <div className={shared.filledHeader}>
              <span className={shared.countText}>
                已上传 {files.length} 个
                {statusSuffix
                  ? `（${statusSuffix}）`
                  : canContinue
                    ? '（可继续添加）'
                    : ''}
              </span>
              {canContinue && (
                <button type="button" className={shared.addBtn}>
                  继续上传
                </button>
              )}
            </div>
            <div className={shared.thumbGrid}>
              {files.map((file) => (
                <div key={file.uid} onClick={(e) => e.stopPropagation()}>
                  <VideoThumb file={file} onRemove={handleRemove} />
                </div>
              ))}
              {canContinue && (
                <div
                  className={`${shared.thumbAddInner} ${styles.thumbAddInner} ${styles.thumbAdd}`}
                >
                  <PlusOutlined />
                  <span>添加</span>
                </div>
              )}
            </div>
          </div>
        )}
      </CustomMediaUpload>
    </div>
  );
};

export default UploadZoneVideo;
