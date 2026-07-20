import { useCallback, useRef } from 'react';
import type {
  CancelInfo,
  ChunkConfig,
  ChunkProgress as ChunkProgressType,
  RcFile,
  ResumeConfig,
  UploadController,
  UploadError,
  UploadPartAckData,
  UploadProgress,
} from '../types';

import { calculateSha256, splitFile } from '../utils/chunkFile';
import { createStorage, type ProgressStorage } from '../utils/storage';

type ChunkCallback = {
  onProgress?: (progress: UploadProgress) => void;
  onChunkSuccess?: (partNumber: number, result: UploadPartAckData) => void;
  onComplete?: (response: unknown, file: File) => void;
  onCancel?: (info: CancelInfo) => void;
  onError?: (error: UploadError) => void;
};

interface UploadState {
  fileId: string;
  uploadSessionId: string;
  abortController: AbortController;
  uploadedParts: {
    partNumber: number;
    sha256?: string;
    serverPartEtag?: string;
  }[];
  storage: ProgressStorage;
}

export function useResumeUpload() {
  const uploadStatesRef = useRef<Map<string, UploadState>>(new Map());

  const uploadFile = useCallback(
    async (
      file: File,
      fileId: string,
      options: {
        chunk: ChunkConfig;
        resume: ResumeConfig;
        controller: UploadController;
        callbacks: ChunkCallback;
      },
    ): Promise<unknown> => {
      const { chunk, resume, controller, callbacks } = options;
      const { maxRetries = 3 } = chunk;

      const storage = createStorage(resume.storage ?? 'indexedDB');
      const storageKey = `upload_progress_${fileId}`;

      const abortController = new AbortController();

      let storedProgress = null;
      if (resume.enabled) {
        storedProgress = await storage.get(storageKey);
      }

      let uploadSessionId: string;
      let totalParts: number;
      let partSizeBytes: number;
      let maxConcurrentParts: number | undefined;
      let uploadedParts: {
        partNumber: number;
        sha256?: string;
        serverPartEtag?: string;
      }[] = [];

      if (storedProgress) {
        uploadSessionId = storedProgress.uploadSessionId;
        totalParts = storedProgress.totalParts;
        uploadedParts = storedProgress.uploadedParts;

        const serverStatus = await controller.getSessionStatus(uploadSessionId);

        if (serverStatus.missingPartNumbers.length === 0) {
          const mergeResponse = await controller.completeSession(
            uploadSessionId,
            uploadedParts,
          );
          await storage.remove(storageKey);
          callbacks.onComplete?.(mergeResponse, file);
          return mergeResponse;
        }

        const missingSet = new Set(serverStatus.missingPartNumbers);
        uploadedParts = uploadedParts.filter(
          (p) => !missingSet.has(p.partNumber),
        );

        partSizeBytes = Math.ceil(
          Number(storedProgress.fileSizeBytes) / totalParts,
        );
      } else {
        const session = await controller.createSession(file);
        uploadSessionId = session.uploadSessionId;
        totalParts = session.totalParts;
        partSizeBytes = Number(session.partSizeBytes);
        maxConcurrentParts = session.maxConcurrentParts;
      }

      const effectiveChunkSize = partSizeBytes || 2 * 1024 * 1024;
      const effectiveConcurrency = maxConcurrentParts ?? 3;

      const state: UploadState = {
        fileId,
        uploadSessionId,
        abortController,
        uploadedParts,
        storage,
      };
      uploadStatesRef.current.set(fileId, state);

      const allChunks = splitFile(file, effectiveChunkSize);
      const pendingChunks = allChunks.filter(
        (c) => !uploadedParts.some((p) => p.partNumber === c.index),
      );

      const progress: UploadProgress = {
        percent: Math.round((uploadedParts.length / totalParts) * 100),
        uploadedChunks: uploadedParts.length,
        totalChunks: totalParts,
        chunks: allChunks.map((c) => {
          const uploaded = uploadedParts.find((p) => p.partNumber === c.index);
          return {
            index: c.index,
            percent: uploaded ? 100 : 0,
            status: uploaded ? 'done' : 'pending',
            retries: 0,
            serverPartEtag: uploaded?.serverPartEtag,
          };
        }) as ChunkProgressType[],
      };

      callbacks.onProgress?.(progress);

      const saveProgress = async () => {
        if (resume.enabled !== false) {
          const stored = {
            uploadSessionId,
            fileSizeBytes: String(file.size),
            totalParts,
            uploadedParts: state.uploadedParts,
            updatedAt: new Date().toISOString(),
          };
          await storage.set(storageKey, stored);
        }
      };

      const uploadChunk = async (
        chunkItem: { blob: Blob; index: number },
        retries = 0,
      ): Promise<void> => {
        if (abortController.signal.aborted) {
          progress.chunks[chunkItem.index - 1].status = 'cancelled';
          throw new Error('Upload cancelled');
        }

        progress.chunks[chunkItem.index - 1].status = 'uploading';

        try {
          const sha256 = await calculateSha256(chunkItem.blob);
          const result = await controller.uploadPart(
            uploadSessionId,
            chunkItem.index,
            chunkItem.blob,
            sha256,
          );

          state.uploadedParts.push({
            partNumber: chunkItem.index,
            sha256,
            serverPartEtag: result.serverPartEtag,
          });
          await saveProgress();

          progress.chunks[chunkItem.index - 1].status = 'done';
          progress.chunks[chunkItem.index - 1].percent = 100;
          progress.chunks[chunkItem.index - 1].serverPartEtag =
            result.serverPartEtag;
          progress.uploadedChunks = state.uploadedParts.length;
          progress.percent = Math.round(
            (progress.uploadedChunks / totalParts) * 100,
          );

          callbacks.onChunkSuccess?.(chunkItem.index, result);
          callbacks.onProgress?.(progress);
        } catch (error) {
          if (retries < maxRetries) {
            progress.chunks[chunkItem.index - 1].retries = retries + 1;
            return uploadChunk(chunkItem, retries + 1);
          }

          progress.chunks[chunkItem.index - 1].status = 'error';

          callbacks.onError?.({
            message: (error as Error).message,
            chunkIndex: chunkItem.index,
            retries,
            error: error as Error,
          });
          throw error;
        }
      };

      for (let i = 0; i < pendingChunks.length; i += effectiveConcurrency) {
        if (abortController.signal.aborted) break;

        const batch = pendingChunks.slice(i, i + effectiveConcurrency);

        await Promise.allSettled(
          batch.map((chunkItem) => uploadChunk(chunkItem)),
        );
      }

      if (abortController.signal.aborted) {
        callbacks.onCancel?.({
          file: file as unknown as RcFile,
          fileId,
          uploadSessionId,
          uploadedChunks: state.uploadedParts.map((p) => p.partNumber),
        });

        await controller.cancelSession(uploadSessionId).catch(() => {});
        return;
      }

      const { missingPartNumbers } =
        await controller.getSessionStatus(uploadSessionId);
      if (missingPartNumbers.length > 0) {
        throw new Error(`still missing parts: ${missingPartNumbers.join(',')}`);
      }

      const mergeResponse = await controller.completeSession(
        uploadSessionId,
        state.uploadedParts,
      );
      await storage.remove(storageKey);
      callbacks.onComplete?.(mergeResponse, file);
      return mergeResponse;
    },
    [],
  );

  const abort = useCallback((fileId: string) => {
    const state = uploadStatesRef.current.get(fileId);
    if (state) {
      state.abortController.abort();
      uploadStatesRef.current.delete(fileId);
    }
  }, []);

  const abortAll = useCallback(() => {
    uploadStatesRef.current.forEach((state) => {
      state.abortController.abort();
    });
    uploadStatesRef.current.clear();
  }, []);

  return { uploadFile, abort, abortAll };
}
