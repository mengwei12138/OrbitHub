import { useMutation, useQuery } from '@tanstack/react-query';
import request from '@/api/request';
import { uploadSessionQueryOptions } from './queryOptions';
import type {
  CompleteUploadSessionRequest,
  CreateUploadSessionRequest,
  UploadCompleteData,
  UploadPartAckData,
  UploadSessionCreatedData,
  UploadSessionId,
  UploadSessionStatusData,
} from './types';

export const getUploadSessionStatus = (uploadSessionId: UploadSessionId) =>
  request.get<UploadSessionStatusData>(
    `/api/v1/content/media/upload-sessions/${uploadSessionId}`,
  ) as unknown as Promise<UploadSessionStatusData>;

export type { UploadController } from '@/components/CustomMediaUpload/types';

import type {
  CompleteUploadPartRef,
  UploadController,
} from '@/components/CustomMediaUpload/types';

export const createContentUploadController = (
  purpose: 'DRAFT_IMAGE' | 'DRAFT_VIDEO' = 'DRAFT_IMAGE',
): UploadController => ({
  createSession: async (file: File) => {
    const data: CreateUploadSessionRequest = {
      fileName: file.name,
      fileSizeBytes: String(file.size),
      mimeType: file.type,
      purpose,
    };
    const res = await createUploadSession(data);
    return {
      uploadSessionId: res.uploadSessionId,
      partSizeBytes: res.partSizeBytes,
      fileSizeBytes: String(file.size),
      totalParts: res.totalParts,
      expiresAt: res.expiresAt,
      maxConcurrentParts: res.maxConcurrentParts,
    };
  },

  uploadPart: async (uploadSessionId, partNumber, blob, sha256) => {
    const res = await uploadPart(uploadSessionId, partNumber, blob, sha256);
    return res;
  },

  getSessionStatus: async (uploadSessionId) => {
    const data = await getUploadSessionStatus(uploadSessionId);
    return data;
  },

  cancelSession: async (uploadSessionId) => {
    await cancelUploadSession(uploadSessionId);
  },

  completeSession: async (uploadSessionId, parts: CompleteUploadPartRef[]) => {
    const completeData: CompleteUploadSessionRequest = {
      parts: parts.map((p) => ({
        partNumber: p.partNumber,
        sha256: p.sha256,
        serverPartEtag: p.serverPartEtag,
      })),
    };
    return completeUploadSession(uploadSessionId, completeData);
  },
});

export const createUploadSession = (data: CreateUploadSessionRequest) =>
  request.post<UploadSessionCreatedData>(
    '/api/v1/content/media/upload-sessions',
    data,
  ) as unknown as Promise<UploadSessionCreatedData>;

export const uploadPart = (
  uploadSessionId: UploadSessionId,
  partNumber: number,
  blob: Blob,
  sha256?: string,
) => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/octet-stream',
  };

  if (sha256) {
    headers['X-Part-Sha256'] = sha256;
  }

  return request.put(
    `/api/v1/content/media/upload-sessions/${uploadSessionId}/parts/${partNumber}`,
    blob,
    { headers },
  ) as unknown as Promise<UploadPartAckData>;
};

export const completeUploadSession = (
  uploadSessionId: UploadSessionId,
  data: CompleteUploadSessionRequest,
) =>
  request.post<UploadCompleteData>(
    `/api/v1/content/media/upload-sessions/${uploadSessionId}/complete`,
    data,
  ) as unknown as Promise<UploadCompleteData>;

export const cancelUploadSession = (uploadSessionId: UploadSessionId) =>
  request.delete(`/api/v1/content/media/upload-sessions/${uploadSessionId}`);

export const useCreateUploadSession = () =>
  useMutation({
    mutationFn: createUploadSession,
  });

export const useUploadPart = () =>
  useMutation({
    mutationFn: ({
      uploadSessionId,
      partNumber,
      blob,
      sha256,
    }: {
      uploadSessionId: UploadSessionId;
      partNumber: number;
      blob: Blob;
      sha256?: string;
    }) => uploadPart(uploadSessionId, partNumber, blob, sha256),
  });

export const useCompleteUploadSession = () =>
  useMutation({
    mutationFn: ({
      uploadSessionId,
      data,
    }: {
      uploadSessionId: UploadSessionId;
      data: CompleteUploadSessionRequest;
    }) => completeUploadSession(uploadSessionId, data),
  });

export const useCancelUploadSession = () =>
  useMutation({
    mutationFn: cancelUploadSession,
  });

export const useUploadSession = (uploadSessionId: UploadSessionId) =>
  useQuery(uploadSessionQueryOptions(uploadSessionId));
