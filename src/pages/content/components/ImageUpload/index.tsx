import { PlusOutlined } from '@ant-design/icons';
import { Button, Image, Progress, Tooltip } from 'antd';
import type { RcFile } from 'antd/es/upload/interface';
import { useCallback, useMemo } from 'react';
import CustomMediaUpload from '@/components/CustomMediaUpload';
import type { UploadCompleteData } from '@/services/media-upload/types';
import styles from './style.module.css';
import type { ImageUploadFile, ImageUploadProps } from './types';

const createThumbFallback = (fileName: string) => {
  const shortName =
    fileName.length > 14 ? `${fileName.slice(0, 11)}...` : fileName;
  const safeName = shortName
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="160" height="160" viewBox="0 0 160 160">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#dbeafe"/>
          <stop offset="100%" stop-color="#93c5fd"/>
        </linearGradient>
      </defs>
      <rect width="160" height="160" rx="12" fill="url(#bg)"/>
      <rect x="22" y="24" width="116" height="82" rx="8" fill="#ffffff" fill-opacity="0.75"/>
      <circle cx="56" cy="55" r="12" fill="#60a5fa"/>
      <path d="M34 94 L68 64 L88 84 L104 70 L130 94 Z" fill="#2563eb" fill-opacity="0.72"/>
      <text x="80" y="128" text-anchor="middle" font-family="Arial, sans-serif" font-size="12" font-weight="700" fill="#1e3a8a">图片素材</text>
      <text x="80" y="146" text-anchor="middle" font-family="Arial, sans-serif" font-size="10" fill="#1d4ed8">${safeName}</text>
    </svg>
  `;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
};

const EmptyZone = () => (
  <div className={styles.zoneContent}>
    <div className={styles.zoneIconCircle}>
      <PlusOutlined className={styles.zoneIcon} />
    </div>
    <div className={styles.zoneTitle}>点击或拖拽上传图片</div>
    <div className={styles.zoneDesc}>
      支持 JPG/PNG/WEBP，单张最大200MB，最多100张
    </div>
    <div className={styles.zoneDesc}>小红书最多18张，支持批量上传</div>
  </div>
);

function mergeProbeMetadata(
  base: ImageUploadFile,
  response: UploadCompleteData | undefined,
): ImageUploadFile {
  if (!response) return base;
  return {
    ...base,
    url: response.previewUrl ?? base.url,
    mediaAssetId: response.mediaAssetId,
    mimeType: response.mimeType,
    widthPx: response.widthPx,
    heightPx: response.heightPx,
    ratio: response.ratio,
    probeError: response.probeError,
  };
}

/**
 * antd Upload 的 onChange 在多文件并发上传时会交错触发，必须用函数式 setState 才能
 * 拿到最新数组、避免「已添加但 setState 还没 flush 的文件」被另一个 done 事件用陈旧
 * 数组整体覆盖。symptom：偶发某些图片卡在 uploading 或干脆从列表里消失。
 *
 * <p>另一类竞态：done / error 是终态，迟到的 uploading 进度事件不能把已完成的文件
 * 回退成「上传中」，否则缩略图会闪烁、发布预检也会被打回。</p>
 */
function applyUploadEventToList(
  prev: ImageUploadFile[],
  file: ImageUploadFile,
): ImageUploadFile[] {
  if (file.status === 'done') {
    const response = file.response as UploadCompleteData | undefined;
    const doneFile = mergeProbeMetadata(
      { ...file, status: 'done', thumbUrl: file.thumbUrl },
      response,
    );
    const existing = prev.findIndex((f) => f.uid === file.uid);
    if (existing >= 0) {
      const next = [...prev];
      next[existing] = doneFile;
      return next;
    }
    return [...prev, doneFile];
  }
  if (file.status === 'error') {
    const existing = prev.findIndex((f) => f.uid === file.uid);
    if (existing >= 0) {
      // done 是终态，迟到的 error 事件不能把已完成的文件打回失败
      if (prev[existing].status === 'done') return prev;
      const next = [...prev];
      next[existing] = { ...file, status: 'error' };
      return next;
    }
    return [...prev, { ...file, status: 'error' }];
  }
  if (file.status === 'uploading') {
    const existing = prev.findIndex((f) => f.uid === file.uid);
    const uploadingFile: ImageUploadFile = {
      ...file,
      status: 'uploading',
      percent: file.percent,
    };
    if (existing >= 0) {
      // done / error 是终态：迟到的 uploading 进度事件不能回退
      if (
        prev[existing].status === 'done' ||
        prev[existing].status === 'error'
      ) {
        return prev;
      }
      const next = [...prev];
      next[existing] = uploadingFile;
      return next;
    }
    return [...prev, uploadingFile];
  }
  return prev;
}

type ThumbItemProps = {
  file: ImageUploadFile;
  onRemove: (file: ImageUploadFile) => void;
};

const ThumbItem = ({ file, onRemove }: ThumbItemProps) => {
  const isUploading = file.status === 'uploading';
  const previewUrl = file.thumbUrl || file.url;
  const fallbackUrl = createThumbFallback(file.name ?? '图片素材');

  const handleRemove = useCallback(() => {
    onRemove(file);
  }, [file, onRemove]);

  return (
    <div className={styles.thumbItem}>
      {isUploading ? (
        <div className={styles.uploadingPlaceholder} />
      ) : previewUrl ? (
        <Image
          src={previewUrl}
          fallback={fallbackUrl}
          alt={file.name}
          className={styles.thumbImage}
          preview={{ mask: null }}
        />
      ) : (
        <div className={styles.thumbPlaceholder} />
      )}

      {isUploading && file.percent !== undefined && (
        <div className={styles.progressOverlay}>
          <Progress
            type="circle"
            percent={file.percent}
            size={48}
            strokeColor="#1677ff"
            trailColor="#f0f2f5"
            showInfo={false}
          />
        </div>
      )}

      {!isUploading && file.probeError && (
        <Tooltip title={`素材元数据解析失败：${file.probeError}`}>
          <div className={styles.probeWarningBadge} role="alert">
            !
          </div>
        </Tooltip>
      )}

      {!isUploading && (
        <>
          <button
            className={styles.deleteBtn}
            onClick={handleRemove}
            title="删除"
          >
            ×
          </button>
          {file.name && <div className={styles.fileName}>{file.name}</div>}
        </>
      )}
    </div>
  );
};

type UploadedViewProps = {
  files: ImageUploadFile[];
  maxCount: number;
  maxFileSize?: number;
  accept: string;
  multiple?: boolean;
  uploadController: ImageUploadProps['uploadController'];
  onFilesChange: (
    files:
      | ImageUploadFile[]
      | ((prevFiles: ImageUploadFile[]) => ImageUploadFile[]),
  ) => void;
};

const UploadedView = ({
  files,
  maxCount,
  maxFileSize,
  accept,
  multiple,
  uploadController,
  onFilesChange,
}: UploadedViewProps) => {
  const canContinueUpload = files.length < maxCount;

  const remainingSlots = maxCount - files.length;

  const beforeUpload = useCallback(
    (file: RcFile, fileList: RcFile[]) => {
      const currentIndex = fileList.indexOf(file);
      const shouldUpload = currentIndex < remainingSlots;
      if (!shouldUpload) {
        return false;
      }
      return true;
    },
    [remainingSlots],
  );

  const handleRemove = useCallback(
    (file: ImageUploadFile) => {
      onFilesChange((prev) => prev.filter((f) => f.uid !== file.uid));
    },
    [onFilesChange],
  );

  const handleUploadChange = useCallback(
    (info: { file: ImageUploadFile }) => {
      const { file } = info;
      onFilesChange((prev) => applyUploadEventToList(prev, file));
    },
    [onFilesChange],
  );

  return (
    <div className={styles.uploadedContainer}>
      <div className={styles.uploadedHeader}>
        <div className={styles.uploadedInfo}>
          <span className={styles.uploadedCount}>
            已上传 {files.length} 张图片
            {canContinueUpload && '（可继续添加）'}
          </span>
          <span className={styles.uploadedLimit}>
            JPG / PNG / WEBP · 单张≤200MB · 抖音最多{maxCount}张 /
            小红书最多18张
          </span>
        </div>
        <CustomMediaUpload
          accept={accept}
          maxCount={maxCount}
          maxFileSize={maxFileSize}
          multiple={multiple ?? maxCount > 1}
          uploadController={uploadController}
          showUploadList={false}
          onChange={handleUploadChange}
          beforeUpload={beforeUpload}
          disabled={!canContinueUpload}
        >
          <Button
            className={styles.continueBtn}
            type="primary"
            ghost
            disabled={!canContinueUpload}
          >
            继续上传
          </Button>
        </CustomMediaUpload>
      </div>

      <div className={styles.thumbGrid}>
        {files.map((file) => (
          <ThumbItem key={file.uid} file={file} onRemove={handleRemove} />
        ))}
      </div>

      <div className={styles.footer}>
        示意：缩略图仅为占位，实际上传后可预览截图或原图
      </div>
    </div>
  );
};

const ImageUpload = ({
  value = [],
  onChange,
  maxCount = 1,
  maxFileSize,
  accept = 'image/*',
  multiple,
  uploadController,
}: ImageUploadProps) => {
  const isEmpty = useMemo(() => value.length === 0, [value.length]);
  const remainingSlots = maxCount - value.length;

  const beforeUpload = useCallback(
    (file: RcFile, fileList: RcFile[]) => {
      const currentIndex = fileList.indexOf(file);
      const shouldUpload = currentIndex < remainingSlots;
      if (!shouldUpload) {
        return false;
      }
      return true;
    },
    [remainingSlots],
  );

  const handleFilesChange = useCallback(
    (
      newFiles:
        | ImageUploadFile[]
        | ((prevFiles: ImageUploadFile[]) => ImageUploadFile[]),
    ) => {
      onChange?.(newFiles);
    },
    [onChange],
  );

  const handleUploadChange = useCallback(
    (info: { file: ImageUploadFile }) => {
      const { file } = info;
      handleFilesChange((prev) => applyUploadEventToList(prev, file));
    },
    [handleFilesChange],
  );

  return (
    <div className={styles.container} data-testid="image-upload">
      <div className={styles.sectionTitle}>图片素材</div>
      <div style={{ display: isEmpty ? 'block' : 'none' }}>
        <CustomMediaUpload
          accept={accept}
          maxCount={maxCount}
          maxFileSize={maxFileSize}
          multiple={multiple ?? maxCount > 1}
          uploadController={uploadController}
          showUploadList={false}
          onChange={handleUploadChange}
          beforeUpload={beforeUpload}
        >
          <EmptyZone />
        </CustomMediaUpload>
      </div>
      {!isEmpty && (
        <UploadedView
          files={value}
          maxCount={maxCount}
          maxFileSize={maxFileSize}
          accept={accept}
          multiple={multiple ?? maxCount > 1}
          uploadController={uploadController}
          onFilesChange={handleFilesChange}
        />
      )}
    </div>
  );
};

export default ImageUpload;

export type { ImageUploadFile, ImageUploadProps };
