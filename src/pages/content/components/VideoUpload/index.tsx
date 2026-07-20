import { PlayCircleFilled } from '@ant-design/icons';
import { Progress } from 'antd';
import type { RcFile } from 'antd/es/upload/interface';
import { useCallback, useMemo, useRef } from 'react';
import CustomMediaUpload from '@/components/CustomMediaUpload';
import VideoPlayer from '@/components/VideoPlayer';
import type { UploadCompleteData } from '@/services/media-upload/types';
import { getLogger } from '@/utils/logger';
import styles from './style.module.css';
import type { VideoUploadFile, VideoUploadProps } from './types';
import { captureVideoFrame, revokeLocalUrl } from './utils/captureVideoFrame';

const logger = getLogger();

const formatDuration = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
};

const formatFileSize = (bytes: number): string => {
  if (bytes >= 1024 * 1024 * 1024) {
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
  }
  if (bytes >= 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }
  if (bytes >= 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }
  return `${bytes} B`;
};

const EmptyZone = () => (
  <div className={styles.zoneContent}>
    <div className={styles.zoneIconCircle}>
      <PlayCircleFilled className={styles.zoneIcon} />
    </div>
    <div className={styles.zoneTitle}>点击或拖拽上传视频</div>
    <div className={styles.zoneDesc}>
      支持 mp4/mov，单文件最大500MB，上传后自动预览
    </div>
    <div className={styles.zoneDesc}>抖音支持9:16或16:9，时长4秒〜15分钟</div>
    <div className={styles.zoneDesc}>小红书支持3:4或9:16，时长≤5分钟</div>
  </div>
);

const getVideoDuration = (file: File): Promise<number> => {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.onloadedmetadata = () => {
      URL.revokeObjectURL(video.src);
      resolve(video.duration);
    };
    video.onerror = () => {
      URL.revokeObjectURL(video.src);
      reject(new Error('无法获取视频时长'));
    };
    video.src = URL.createObjectURL(file);
  });
};

const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));

const simplifyRatio = (width: number, height: number): string => {
  const divisor = gcd(width, height);
  return `${width / divisor}:${height / divisor}`;
};

const getVideoRatio = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.onloadedmetadata = () => {
      URL.revokeObjectURL(video.src);
      const ratio = simplifyRatio(video.videoWidth, video.videoHeight);
      resolve(ratio);
    };
    video.onerror = () => {
      URL.revokeObjectURL(video.src);
      reject(new Error('无法获取视频比例'));
    };
    video.src = URL.createObjectURL(file);
  });
};

function mergeProbeMetadata(
  base: VideoUploadFile,
  response: UploadCompleteData | undefined,
): VideoUploadFile {
  logger.debug('mergeProbeMetadata 输入', {
    baseUrl: base.url,
    baseLocalUrl: base.localUrl,
    responsePreviewUrl: response?.previewUrl,
    responseMediaAssetId: response?.mediaAssetId,
    responseMimeType: response?.mimeType,
  });
  if (!response) {
    logger.debug('mergeProbeMetadata: response 为空，返回 base');
    return base;
  }
  const merged = {
    ...base,
    url: response.previewUrl,
    mediaAssetId: response.mediaAssetId,
    mimeType: response.mimeType,
    widthPx: response.widthPx,
    heightPx: response.heightPx,
    ratio: response.ratio,
    probeError: response.probeError,
    duration:
      typeof response.durationMs === 'number'
        ? response.durationMs / 1000
        : base.duration,
  };
  logger.debug('mergeProbeMetadata 输出', {
    mergedUrl: merged.url,
    mergedLocalUrl: merged.localUrl,
    mergedMediaAssetId: merged.mediaAssetId,
  });
  return merged;
}

type UploadedViewProps = {
  file: VideoUploadFile;
  uploadController: VideoUploadProps['uploadController'];
  maxFileSize?: number;
  minDuration?: number;
  maxDuration?: number;
  onDurationError?: VideoUploadProps['onDurationError'];
  acceptedRatios?: string[];
  onRatioError?: VideoUploadProps['onRatioError'];
  onFilesChange: (files: VideoUploadFile[]) => void;
  onRemove: () => void;
};

const UploadedView = ({
  file,
  uploadController,
  maxFileSize,
  minDuration,
  maxDuration,
  onDurationError,
  acceptedRatios,
  onRatioError,
  onFilesChange,
  onRemove,
}: UploadedViewProps) => {
  const prevFileRef = useRef<VideoUploadFile | null>(null);

  const beforeUpload = useCallback(
    async (uploadFile: RcFile): Promise<boolean> => {
      if (minDuration || maxDuration) {
        try {
          const duration = await getVideoDuration(uploadFile);

          if (minDuration && duration < minDuration) {
            onDurationError?.(uploadFile, duration, { min: minDuration });
            return false;
          }

          if (maxDuration && duration > maxDuration) {
            onDurationError?.(uploadFile, duration, { max: maxDuration });
            return false;
          }
        } catch {
          // 获取时长失败时跳过校验，不阻止上传
        }
      }

      if (acceptedRatios && acceptedRatios.length > 0) {
        try {
          const ratio = await getVideoRatio(uploadFile);
          if (!acceptedRatios.includes(ratio)) {
            onRatioError?.(uploadFile, ratio, acceptedRatios);
            return false;
          }
        } catch {
          // 获取比例失败时跳过校验，不阻止上传
        }
      }
      return true;
    },
    [minDuration, maxDuration, onDurationError, acceptedRatios, onRatioError],
  );

  const handleUploadChange = useCallback(
    async (info: { file: VideoUploadFile }) => {
      const { file: uploadFile } = info;

      if (uploadFile.status === 'done') {
        const response = uploadFile.response as UploadCompleteData | undefined;
        const apiUrl = response?.previewUrl;

        let localThumbUrl: string | undefined;

        if (apiUrl) {
          try {
            localThumbUrl = await captureVideoFrame(apiUrl);
          } catch {
            // 截取失败，降级处理
          }
        }

        if (prevFileRef.current) {
          revokeLocalUrl(prevFileRef.current.localUrl);
          revokeLocalUrl(prevFileRef.current.localThumbUrl);
        }

        const doneFile = mergeProbeMetadata(
          {
            ...uploadFile,
            uid: String(uploadFile.lastModified),
            status: 'done',
            thumbUrl: undefined,
            localUrl: undefined,
            localThumbUrl,
          },
          response,
        );

        prevFileRef.current = doneFile;
        onFilesChange([doneFile]);
      } else if (uploadFile.status === 'error') {
        onFilesChange([{ ...uploadFile, status: 'error' }]);
      } else if (uploadFile.status === 'uploading') {
        onFilesChange([
          { ...uploadFile, status: 'uploading', percent: uploadFile.percent },
        ]);
      }
    },
    [onFilesChange],
  );

  const previewUrl = file.localUrl || file.url;
  const posterUrl = file.thumbUrl || file.localThumbUrl;
  const canPlay = !!previewUrl;

  logger.debug('UploadedView 渲染状态', {
    fileStatus: file.status,
    fileUrl: file.url,
    fileLocalUrl: file.localUrl,
    previewUrl,
    posterUrl,
    canPlay,
    fileMediaAssetId: file.mediaAssetId,
  });

  const metaLine = useMemo(() => {
    const parts: string[] = [];
    if (file.mimeType) {
      const sub = file.mimeType.split('/')[1];
      if (sub) parts.push(sub.toUpperCase());
    }
    if (typeof file.size === 'number' && file.size > 0) {
      parts.push(formatFileSize(file.size));
    }
    if (file.widthPx && file.heightPx) {
      parts.push(`${file.widthPx}×${file.heightPx}`);
    }
    if (file.ratio) {
      parts.push(file.ratio);
    }
    return parts.join(' · ');
  }, [file.mimeType, file.size, file.widthPx, file.heightPx, file.ratio]);

  const handleRemove = useCallback(() => {
    revokeLocalUrl(file.localUrl);
    revokeLocalUrl(file.localThumbUrl);
    prevFileRef.current = null;
    onRemove();
  }, [file.localUrl, file.localThumbUrl, onRemove]);

  return (
    <div className={styles.uploadedContainer}>
      <div className={styles.videoPreview}>
        {file.status === 'uploading' ? (
          <div className={styles.uploadingContainer}>
            <Progress
              type="circle"
              percent={file.percent ?? 0}
              size={80}
              strokeColor="#fff"
              trailColor="rgba(255, 255, 255, 0.4)"
              format={(percent) => (
                <span
                  style={{
                    color: '#fff',
                    textShadow: '0 1px 2px rgba(0,0,0,0.5)',
                  }}
                >
                  {percent}%
                </span>
              )}
            />
            <div className={styles.uploadingText}>视频上传中...</div>
          </div>
        ) : canPlay ? (
          <VideoPlayer
            src={previewUrl}
            poster={posterUrl}
            controls
            autoPlay={false}
          />
        ) : (
          <div className={styles.videoPlaceholder} />
        )}
        {file.duration && canPlay && (
          <div className={styles.durationChip}>
            {formatDuration(file.duration)}
          </div>
        )}
      </div>

      <div className={styles.videoMeta}>
        <div className={styles.videoName}>{file.name}</div>
        {metaLine && <div className={styles.videoInfo}>{metaLine}</div>}
        {file.probeError ? (
          <div
            className={styles.videoHint}
            style={{ color: '#ff7a45' }}
            role="alert"
          >
            素材元数据解析失败，格式可能不受部分平台支持（{file.probeError}）
          </div>
        ) : (
          <div className={styles.videoHint}>
            已生成预览，可继续编辑文案与发布配置
          </div>
        )}
      </div>

      <div className={styles.videoActions}>
        <CustomMediaUpload
          accept="video/mp4,video/quicktime"
          maxFileSize={maxFileSize}
          uploadController={uploadController}
          showUploadList={false}
          onChange={handleUploadChange}
          beforeUpload={beforeUpload}
        >
          <button
            className={`${styles.actionBtn} ${styles.repickBtn}`}
            type="button"
          >
            重新选择视频
          </button>
        </CustomMediaUpload>
        <button
          className={`${styles.actionBtn} ${styles.removeBtn}`}
          type="button"
          onClick={handleRemove}
        >
          移除视频
        </button>
      </div>
    </div>
  );
};

const VideoUpload = ({
  value = [],
  onChange,
  accept = 'video/mp4,video/quicktime',
  maxFileSize,
  uploadController,
  minDuration,
  maxDuration,
  onDurationError,
  acceptedRatios,
  onRatioError,
}: VideoUploadProps) => {
  const isEmpty = useMemo(() => value.length === 0, [value.length]);
  const currentFile = value[0];
  const prevFileRef = useRef<VideoUploadFile | null>(null);

  const beforeUpload = useCallback(
    async (file: RcFile): Promise<boolean> => {
      if (minDuration || maxDuration) {
        try {
          const duration = await getVideoDuration(file);

          if (minDuration && duration < minDuration) {
            onDurationError?.(file, duration, { min: minDuration });
            return false;
          }

          if (maxDuration && duration > maxDuration) {
            onDurationError?.(file, duration, { max: maxDuration });
            return false;
          }
        } catch {
          // 获取时长失败时跳过校验，不阻止上传
        }
      }

      if (acceptedRatios && acceptedRatios.length > 0) {
        try {
          const ratio = await getVideoRatio(file);
          if (!acceptedRatios.includes(ratio)) {
            onRatioError?.(file, ratio, acceptedRatios);
            return false;
          }
        } catch {
          // 获取比例失败时跳过校验，不阻止上传
        }
      }
      return true;
    },
    [minDuration, maxDuration, onDurationError, acceptedRatios, onRatioError],
  );

  const handleFilesChange = useCallback(
    (newFiles: VideoUploadFile[]) => {
      if (prevFileRef.current && newFiles.length === 0) {
        revokeLocalUrl(prevFileRef.current.localUrl);
        revokeLocalUrl(prevFileRef.current.localThumbUrl);
        prevFileRef.current = null;
      } else if (newFiles[0]) {
        prevFileRef.current = newFiles[0];
      }
      onChange?.(newFiles);
    },
    [onChange],
  );

  const handleUploadChange = useCallback(
    async (info: { file: VideoUploadFile }) => {
      const { file } = info;
      logger.debug('handleUploadChange 触发', {
        fileStatus: file.status,
        fileUrl: file.url,
        fileLocalUrl: file.localUrl,
        fileResponse: file.response,
      });

      if (file.status === 'done') {
        const response = file.response as UploadCompleteData | undefined;
        logger.debug('上传完成，准备处理', {
          responsePreviewUrl: response?.previewUrl,
          responseMediaAssetId: response?.mediaAssetId,
        });
        const apiUrl = response?.previewUrl;

        let localThumbUrl: string | undefined;

        if (apiUrl) {
          logger.debug('开始截取视频帧', { apiUrl });
          try {
            localThumbUrl = await captureVideoFrame(apiUrl);
            logger.debug('视频帧截取成功', {
              localThumbUrl: localThumbUrl?.substring(0, 50),
            });
          } catch (e) {
            logger.warn('视频帧截取失败', { error: e });
            // 截取失败，降级处理
          }
        } else {
          logger.debug('apiUrl 为空，跳过截取帧');
        }

        if (prevFileRef.current) {
          logger.debug('清理之前的文件 URL', {
            localUrl: prevFileRef.current.localUrl,
          });
          revokeLocalUrl(prevFileRef.current.localUrl);
          revokeLocalUrl(prevFileRef.current.localThumbUrl);
        }

        logger.debug('构建 doneFile，merge 前', {
          fileUrl: file.url,
          fileLocalUrl: file.localUrl,
          localThumbUrl: localThumbUrl?.substring(0, 50),
        });
        const doneFile = mergeProbeMetadata(
          {
            ...file,
            status: 'done',
            thumbUrl: undefined,
            localUrl: undefined,
            localThumbUrl,
          },
          response,
        );
        logger.debug('doneFile 构建完成', {
          doneFileUrl: doneFile.url,
          doneFileLocalUrl: doneFile.localUrl,
          doneFileMediaAssetId: doneFile.mediaAssetId,
        });

        prevFileRef.current = doneFile;
        handleFilesChange([doneFile]);
      } else if (file.status === 'error') {
        logger.error('上传错误', { status: file.status, file: file, info });
        handleFilesChange([{ ...file, status: 'error' }]);
      } else if (file.status === 'uploading') {
        handleFilesChange([
          { ...file, status: 'uploading', percent: file.percent },
        ]);
      }
    },
    [handleFilesChange],
  );

  const handleRemove = useCallback(() => {
    if (prevFileRef.current) {
      revokeLocalUrl(prevFileRef.current.localUrl);
      revokeLocalUrl(prevFileRef.current.localThumbUrl);
      prevFileRef.current = null;
    }
    onChange?.([]);
  }, [onChange]);

  return (
    <div className={styles.container} data-testid="video-upload">
      <div className={styles.sectionTitle}>视频素材</div>
      <div style={{ display: isEmpty ? 'block' : 'none' }}>
        <CustomMediaUpload
          accept={accept}
          maxFileSize={maxFileSize}
          uploadController={uploadController}
          showUploadList={false}
          onChange={handleUploadChange}
          beforeUpload={beforeUpload}
        >
          <EmptyZone />
        </CustomMediaUpload>
      </div>
      {!isEmpty && currentFile && (
        <UploadedView
          file={currentFile}
          uploadController={uploadController}
          maxFileSize={maxFileSize}
          minDuration={minDuration}
          maxDuration={maxDuration}
          onDurationError={onDurationError}
          acceptedRatios={acceptedRatios}
          onRatioError={onRatioError}
          onFilesChange={handleFilesChange}
          onRemove={handleRemove}
        />
      )}
    </div>
  );
};

export default VideoUpload;

export type { VideoUploadFile, VideoUploadProps };
