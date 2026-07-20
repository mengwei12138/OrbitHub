import type { UploadProps } from 'antd';
import { message, Upload } from 'antd';
import type { RcFile } from 'antd/es/upload/interface';
import { forwardRef, useCallback, useImperativeHandle, useMemo } from 'react';
import { useUploadSlot } from '@/hooks/useUploadSlot';
import { useChunkedUpload } from './hooks/useChunkedUpload';
import { useResumeUpload } from './hooks/useResumeUpload';
import type {
  ChunkConfig,
  CustomMediaUploadProps,
  ResumeConfig,
  UploadCompleteData,
  UploadError,
  UploadProgress,
} from './types';
import { generateFileId } from './utils/chunkFile';

const CustomMediaUpload = forwardRef<unknown, CustomMediaUploadProps>(
  (
    {
      uploadController,
      chunk,
      resume,
      dragger,
      accept,
      beforeUpload,
      maxFileSize,
      onFileTypeError,
      onFileSizeError,
      onProgress,
      onError,
      onChunkSuccess,
      onComplete,
      onCancel,
      maxConcurrentUploads,
      uploadSlot: uploadSlotProp,
      ...props
    },
    ref,
  ) => {
    const { uploadFile: chunkedUpload } = useChunkedUpload();
    const { uploadFile: resumeUpload } = useResumeUpload();
    const slotEnabled = Boolean(
      uploadSlotProp ||
        (maxConcurrentUploads != null && maxConcurrentUploads > 0),
    );
    const internalSlot = useUploadSlot(
      maxConcurrentUploads && maxConcurrentUploads > 0
        ? maxConcurrentUploads
        : 1,
    );
    const { acquire, release } = uploadSlotProp ?? internalSlot;

    useImperativeHandle(ref, () => ({}));

    const UploadComponent = useMemo(
      () => (dragger ? Upload.Dragger : Upload),
      [dragger],
    );

    const isFileTypeAccepted = useCallback(
      (file: File, accept: string): boolean => {
        if (!accept) return true;

        const acceptedTypes = accept.split(',').map((t) => t.trim());

        return acceptedTypes.some((type) => {
          if (type.endsWith('/*')) {
            const prefix = type.replace('/*', '/');
            return file.type.startsWith(prefix);
          }
          if (type.startsWith('.')) {
            const ext = type.toLowerCase();
            return file.name.toLowerCase().endsWith(ext);
          }
          return file.type === type;
        });
      },
      [],
    );

    const mergedBeforeUpload = useCallback(
      (file: RcFile, fileList: RcFile[]) => {
        if (accept && !isFileTypeAccepted(file, accept)) {
          if (onFileTypeError) {
            onFileTypeError(file);
          } else {
            message.error(`文件类型不被支持，请选择 ${accept} 类型的文件`);
          }
          return false;
        }

        if (maxFileSize && file.size > maxFileSize * 1024 * 1024) {
          if (onFileSizeError) {
            onFileSizeError(file);
          } else {
            message.error(`文件大小超出限制，最大支持 ${maxFileSize}MB`);
          }
          return false;
        }

        if (beforeUpload) {
          return beforeUpload(file, fileList);
        }

        return true;
      },
      [
        accept,
        maxFileSize,
        onFileTypeError,
        onFileSizeError,
        beforeUpload,
        isFileTypeAccepted,
      ],
    );

    const customRequest = useCallback(
      (options: Parameters<Required<UploadProps>['customRequest']>[0]) => {
        const rawFile = options.file;
        if (!(rawFile instanceof File)) {
          options.onError?.(
            new Error('CustomMediaUpload: file must be a File instance'),
          );
          return;
        }
        const file = rawFile;
        const fileId = generateFileId(file);

        const chunkConfig: Required<ChunkConfig> = {
          maxRetries: chunk?.maxRetries ?? 3,
        };

        const resumeConfig: Required<ResumeConfig> = {
          enabled: resume?.enabled ?? true,
          storage: resume?.storage ?? 'indexedDB',
        };

        const callbacks = {
          onProgress: (progress: UploadProgress) => {
            options.onProgress?.(
              { percent: progress.percent } as unknown as ProgressEvent,
              options.file as RcFile,
            );
            onProgress?.(progress, file as RcFile);
          },
          onChunkSuccess,
          onComplete: (response: unknown) => {
            onComplete?.(response as UploadCompleteData, file as RcFile);
          },
          onCancel,
          onError: (error: UploadError) => {
            onError?.(error, file as RcFile);
          },
        };

        (async () => {
          if (slotEnabled) {
            await acquire();
          }
          try {
            options.onProgress?.(
              { percent: 0 } as unknown as ProgressEvent,
              options.file as RcFile,
            );
            onProgress?.(
              {
                percent: 0,
                uploadedChunks: 0,
                totalChunks: 0,
                chunks: [],
              },
              file as RcFile,
            );

            const response = resumeConfig.enabled
              ? await resumeUpload(file, fileId, {
                  chunk: chunkConfig,
                  resume: resumeConfig,
                  controller: uploadController,
                  callbacks: callbacks as never,
                })
              : await chunkedUpload(file, fileId, {
                  chunk: chunkConfig,
                  controller: uploadController,
                  callbacks: callbacks as never,
                });
            options.onSuccess?.(response, options.file as RcFile);
          } catch (error) {
            const uploadError =
              error instanceof Error ? error : new Error(String(error));
            options.onError?.(uploadError);
            onError?.(
              { message: uploadError.message, error: uploadError },
              file as RcFile,
            );
          } finally {
            if (slotEnabled) {
              release();
            }
          }
        })();
      },
      [
        chunk,
        resume,
        uploadController,
        onProgress,
        onError,
        onChunkSuccess,
        onComplete,
        onCancel,
        chunkedUpload,
        resumeUpload,
        slotEnabled,
        acquire,
        release,
      ],
    );

    return (
      <UploadComponent
        {...props}
        beforeUpload={mergedBeforeUpload}
        customRequest={customRequest}
      />
    );
  },
);

CustomMediaUpload.displayName = 'CustomMediaUpload';

export default CustomMediaUpload;

export type {
  CancelInfo,
  ChunkConfig,
  ChunkProgress,
  CustomMediaUploadProps,
  CustomMediaUploadRef,
  ResumeConfig,
  UploadController,
  UploadError,
  UploadProgress,
} from './types';
