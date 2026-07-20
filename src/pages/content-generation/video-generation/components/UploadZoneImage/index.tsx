import { PlusOutlined } from '@ant-design/icons';
import { message, Progress, Upload } from 'antd';
import type { RcFile, UploadFile } from 'antd/es/upload/interface';
import type React from 'react';
import { useCallback, useMemo, useRef } from 'react';
import type { UploadController } from '@/components/CustomMediaUpload';
import CustomMediaUpload from '@/components/CustomMediaUpload';
import type { UploadError } from '@/components/CustomMediaUpload/types';
import { useUploadSlot } from '@/hooks/useUploadSlot';
import type { UploadCompleteData } from '@/services/media-upload/types';
import { useUploadWatchdog } from '../../hooks/useUploadWatchdog';
import type { UploadedMediaFile } from '../../types/media';
import {
  formatMediaStatusSuffix,
  getMediaStatusBreakdown,
} from '../../utils/mediaFiles';
import {
  canAcceptMoreUpload,
  trimToMaxCount,
} from '../../utils/mediaUploadLimits';
import { AuthenticatedMediaThumb } from '../AuthenticatedMediaThumb';
import shared from '../uploadZone.shared.module.css';
import styles from './style.module.css';

const DEFAULT_MAX_COUNT = 9;

export interface UploadZoneImageProps {
  uploadController?: UploadController;
  value?: UploadedMediaFile[];
  onChange?: (
    files:
      | UploadedMediaFile[]
      | ((prev: UploadedMediaFile[]) => UploadedMediaFile[]),
  ) => void;
  /** 自定义最大上传数量，默认 9。视频生成 = 9、图文生成 = 1。 */
  maxCount?: number;
  className?: string;
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
    // 不设 percent：排队等 uploadSlot 时 customRequest 尚未 onProgress，
    // 看门狗据此区分「未开传」与「已开传但卡住」。
    thumbUrl: URL.createObjectURL(file),
    originFileObj: file,
  };
}

const EmptyContent = ({
  layout = 'dragger',
  maxCount = DEFAULT_MAX_COUNT,
}: {
  layout?: 'dragger' | 'static';
  maxCount?: number;
}) => {
  const body = (
    <div className={`${shared.emptyLayout} ${styles.emptyLayoutImage}`}>
      <div className={`${shared.emptyMain} ${styles.emptyMainImage}`}>
        <div className={styles.iconCircle}>
          <PlusOutlined className={styles.plusIcon} />
        </div>
        <span className={shared.title}>点击或拖拽上传图片</span>
        <span className={shared.desc}>{`JPG / PNG · 最多 ${maxCount} 张`}</span>
      </div>
      <div className={shared.hintSlot} aria-hidden>
        <span className={styles.hintPlaceholder}>{'\u00a0'}</span>
      </div>
    </div>
  );
  if (layout === 'static') {
    return body;
  }
  return (
    <div className={`${shared.zoneInner} ${styles.zoneInnerImage}`}>{body}</div>
  );
};

export const UploadZoneImage: React.FC<UploadZoneImageProps> = ({
  uploadController,
  value = [],
  onChange,
  maxCount = DEFAULT_MAX_COUNT,
  className,
}) => {
  const files = value;
  const isEmpty = files.length === 0;
  const remainingSlots = maxCount - files.length;
  const canContinue = remainingSlots > 0;
  const breakdown = useMemo(() => getMediaStatusBreakdown(files), [files]);
  const statusSuffix = formatMediaStatusSuffix(breakdown);
  const uploadSlot = useUploadSlot(maxCount);
  const limitWarnedRef = useRef(false);
  /** 同一次多选里尚未 commit 的占位计数，避免闭包 files 快照导致超额放行 upload。 */
  const pendingReservationsRef = useRef(0);

  const warnLimitOnce = useCallback(() => {
    if (!limitWarnedRef.current) {
      limitWarnedRef.current = true;
      message.warning(`最多上传 ${maxCount} 张图片`);
      queueMicrotask(() => {
        limitWarnedRef.current = false;
      });
    }
  }, [maxCount]);

  const patchFiles = useCallback(
    (updater: (prev: UploadedMediaFile[]) => UploadedMediaFile[]) => {
      onChange?.(updater);
    },
    [onChange],
  );
  useUploadWatchdog(files, patchFiles);

  /** 同步占位：选文件后立即出现缩略图，不在 beforeUpload 里 await 阻塞 */
  const beforeUpload = useCallback(
    (file: RcFile) => {
      const alreadyListed = files.some((f) => f.uid === file.uid);
      if (
        !alreadyListed &&
        files.length + pendingReservationsRef.current >= maxCount
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
        if (!canAcceptMoreUpload(prev, file.uid, maxCount)) return prev;
        return trimToMaxCount(
          [...prev, createOptimisticUploading(file)],
          maxCount,
        );
      });
      return true;
    },
    [files, maxCount, patchFiles, warnLimitOnce],
  );

  const handleUploadChange = useCallback(
    (info: { file: UploadFile }) => {
      const { file } = info as { file: UploadedMediaFile };

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
            return trimToMaxCount(next, maxCount);
          }
          if (!canAcceptMoreUpload(prev, file.uid, maxCount)) return prev;
          return trimToMaxCount([...prev, doneFile], maxCount);
        });
        return;
      }

      if (file.status === 'error') {
        message.error(file.error?.message || '图片上传失败');
        patchFiles((prev) => {
          const idx = prev.findIndex((f) => f.uid === file.uid);
          if (idx >= 0) {
            // 'done' 是终态，迟到的 error 事件不能把已完成的文件打回失败。
            if (prev[idx].status === 'done') return prev;
            const next = [...prev];
            next[idx] = { ...file, status: 'error' };
            return next;
          }
          if (!canAcceptMoreUpload(prev, file.uid, maxCount)) return prev;
          return trimToMaxCount(
            [...prev, { ...file, status: 'error' }],
            maxCount,
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
          if (!canAcceptMoreUpload(prev, file.uid, maxCount)) return prev;
          return trimToMaxCount([...prev, uploading], maxCount);
        });
      }
    },
    [maxCount, patchFiles],
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
          return trimToMaxCount(next, maxCount);
        }
        if (!canAcceptMoreUpload(prev, file.uid, maxCount)) return prev;
        return trimToMaxCount([...prev, doneFile], maxCount);
      });
    },
    [maxCount, patchFiles],
  );

  const markFileError = useCallback(
    (file: RcFile, err: UploadError) => {
      message.error(err.message || '图片上传失败');
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
        if (!canAcceptMoreUpload(prev, file.uid, maxCount)) return prev;
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
          maxCount,
        );
      });
    },
    [maxCount, patchFiles],
  );

  const uploadProps = useMemo(
    () => ({
      accept: 'image/jpeg,image/png,.jpg,.jpeg,.png',
      multiple: true,
      fileList: files,
      showUploadList: false as const,
      uploadSlot,
      beforeUpload,
      onChange: handleUploadChange,
      onComplete: markFileDone,
      onError: (err: UploadError, file: RcFile) => markFileError(file, err),
    }),
    [
      beforeUpload,
      files,
      handleUploadChange,
      markFileDone,
      markFileError,
      uploadSlot,
    ],
  );

  if (!uploadController) {
    return (
      <div className={`${shared.zoneStatic} ${className ?? ''}`}>
        <EmptyContent layout="static" maxCount={maxCount} />
      </div>
    );
  }

  return (
    <div className={`${shared.zoneWrap} ${className ?? ''}`}>
      {/*
        单一 Upload 实例 + 受控 fileList：避免多实例时 antd 内部列表与业务 state 脱节，
        导致末尾文件的 onSuccess/onChange 丢失、永远卡在「上传中」。
        始终使用 Dragger，空态/有文件态只切换 children，不卸载 Upload。
      */}
      <CustomMediaUpload
        dragger
        uploadController={uploadController}
        className={isEmpty ? styles.draggerSlot : styles.draggerSlotFilled}
        {...uploadProps}
      >
        {isEmpty ? (
          <EmptyContent maxCount={maxCount} />
        ) : (
          <div className={shared.filled}>
            <div className={shared.filledHeader}>
              <span className={shared.countText}>
                已上传 {files.length} 张
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
                <div
                  key={file.uid}
                  className={`${shared.thumbItem} ${styles.thumbItem}`}
                  onClick={(e) => e.stopPropagation()}
                >
                  {file.status === 'uploading' ? (
                    <>
                      {file.thumbUrl ? (
                        <img
                          src={file.thumbUrl}
                          alt=""
                          className={styles.thumbPreview}
                        />
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
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemove(file.uid);
                        }}
                      >
                        ×
                      </button>
                    </>
                  ) : file.status === 'done' ? (
                    <>
                      <div className={styles.thumbMedia}>
                        <AuthenticatedMediaThumb
                          previewUrl={file.previewUrl ?? file.url}
                          thumbUrl={file.thumbUrl}
                          alt={file.name ?? '图片'}
                          className={styles.thumbImage}
                        />
                      </div>
                      <button
                        type="button"
                        className={shared.deleteBtn}
                        aria-label="删除"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemove(file.uid);
                        }}
                      >
                        ×
                      </button>
                    </>
                  ) : (
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
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemove(file.uid);
                        }}
                      >
                        ×
                      </button>
                    </>
                  )}
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

export default UploadZoneImage;
