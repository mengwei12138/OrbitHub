import { Card, message, Progress, Space, Typography } from 'antd';
import { useMemo, useState } from 'react';
import type {
  UploadController,
  UploadError,
  UploadProgress,
} from '@/components/CustomMediaUpload';
import CustomMediaUpload from '@/components/CustomMediaUpload';
import {
  cancelUploadSession,
  completeUploadSession,
  createUploadSession,
  getPreviewBlob,
  getUploadSession,
  MEDIA_PURPOSE_CODE,
  type MediaPurposeCode,
  type UploadCompleteData,
  uploadPart,
} from '@/services/media-upload';

import styles from './style.module.css';

const { Title, Text } = Typography;

const createUploadController = (
  purpose: MediaPurposeCode,
  onComplete?: (data: UploadCompleteData) => void,
): UploadController => ({
  createSession: async (file: File) => {
    return createUploadSession({
      fileName: file.name,
      fileSizeBytes: String(file.size),
      mimeType: file.type,
      purpose,
    });
  },
  uploadPart: async (uploadSessionId, partNumber, blob, sha256) => {
    return uploadPart(uploadSessionId, partNumber, blob, sha256);
  },
  getSessionStatus: async (uploadSessionId) => {
    return getUploadSession(uploadSessionId);
  },
  cancelSession: async (uploadSessionId) => {
    await cancelUploadSession(uploadSessionId);
  },
  completeSession: async (uploadSessionId, parts) => {
    const result = await completeUploadSession(uploadSessionId, { parts });
    onComplete?.(result);
    return result;
  },
});

const DemoUpload = ({
  title,
  purpose,
  accept,
  dragger,
}: {
  title: string;
  purpose: MediaPurposeCode;
  accept: string;
  dragger?: boolean;
}) => {
  const [progress, setProgress] = useState<UploadProgress | null>(null);
  const [result, setResult] = useState<UploadCompleteData | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');

  const controller = useMemo(
    () =>
      createUploadController(purpose, (data) => {
        setResult(data);
        message.success('上传成功');
      }),
    [purpose],
  );

  const handlePreview = async (mediaAssetId: string) => {
    try {
      const blob = await getPreviewBlob(mediaAssetId);
      const url = URL.createObjectURL(blob);
      setPreviewUrl(url);
    } catch {
      message.error('预览失败');
    }
  };

  return (
    <Card title={title}>
      <CustomMediaUpload
        uploadController={controller}
        accept={accept}
        dragger={dragger}
        onProgress={(p) => setProgress(p)}
        onComplete={(data) => {
          setProgress(null);
          handlePreview(data.mediaAssetId);
        }}
        onError={(err: UploadError) => {
          message.error(err.message);
          setProgress(null);
        }}
      />

      {progress && (
        <div className={styles.progress}>
          <Progress percent={progress.percent} status="active" />
          <Text type="secondary">
            已上传 {progress.uploadedChunks}/{progress.totalChunks} 个分片
          </Text>
        </div>
      )}

      {result && (
        <div className={styles.result}>
          <Title level={5}>上传结果</Title>
          <Space direction="vertical">
            <Text>mediaAssetId: {result.mediaAssetId}</Text>
            <Text>mimeType: {result.mimeType}</Text>
            <Text>fileSizeBytes: {result.fileSizeBytes}</Text>
            {result.widthPx && <Text>widthPx: {result.widthPx}</Text>}
            {result.heightPx && <Text>heightPx: {result.heightPx}</Text>}
            {result.durationMs && <Text>durationMs: {result.durationMs}</Text>}
            {result.ratio && <Text>ratio: {result.ratio}</Text>}
          </Space>
        </div>
      )}

      {previewUrl && (
        <div className={styles.preview}>
          <Title level={5}>预览</Title>
          {accept.startsWith('video') ? (
            <video src={previewUrl} controls className={styles.video} />
          ) : (
            <img src={previewUrl} alt="preview" className={styles.image} />
          )}
        </div>
      )}
    </Card>
  );
};

const Demo = () => {
  return (
    <div className={styles.container}>
      <Title level={3}>CustomMediaUpload Demo</Title>

      <div className={styles.grid}>
        <DemoUpload
          title="图片上传"
          purpose={MEDIA_PURPOSE_CODE.DRAFT_IMAGE}
          accept="image/*"
          dragger
        />

        <DemoUpload
          title="视频上传"
          purpose={MEDIA_PURPOSE_CODE.DRAFT_VIDEO}
          accept="video/*"
          dragger
        />
      </div>
    </div>
  );
};

export default Demo;
