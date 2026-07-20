import { useCallback, useRef } from 'react';
import type {
  CancelInfo,
  ChunkConfig,
  ChunkProgress as ChunkProgressType,
  RcFile,
  UploadController,
  UploadError,
  UploadPartAckData,
  UploadProgress,
} from '../types';

import { calculateSha256, splitFile } from '../utils/chunkFile';

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
}

export function useChunkedUpload() {
  const uploadStatesRef = useRef<Map<string, UploadState>>(new Map());

  const uploadFile = useCallback(
    async (
      file: File,
      fileId: string,
      options: {
        chunk: ChunkConfig;
        controller: UploadController;
        callbacks: ChunkCallback;
      },
    ): Promise<unknown> => {
      const { chunk, controller, callbacks } = options;
      const { maxRetries = 3 } = chunk;

      const abortController = new AbortController();

      const session = await controller.createSession(file);
      const { uploadSessionId, partSizeBytes, totalParts, maxConcurrentParts } =
        session;
      const effectiveChunkSize = Number(partSizeBytes);
      const effectiveConcurrency = maxConcurrentParts ?? 3;

      const state: UploadState = {
        fileId,
        uploadSessionId,
        abortController,
        uploadedParts: [],
      };
      uploadStatesRef.current.set(fileId, state);

      const chunks = splitFile(file, effectiveChunkSize);
      const progress: UploadProgress = {
        percent: 0,
        uploadedChunks: 0,
        totalChunks: totalParts,
        chunks: chunks.map((c) => ({
          index: c.index,
          percent: 0,
          status: 'pending',
          retries: 0,
        })) as ChunkProgressType[],
      };

      callbacks.onProgress?.(progress);

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

      for (let i = 0; i < chunks.length; i += effectiveConcurrency) {
        if (abortController.signal.aborted) break;

        const batch = chunks.slice(i, i + effectiveConcurrency);

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
