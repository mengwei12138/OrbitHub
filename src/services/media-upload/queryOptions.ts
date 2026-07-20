import { useMutation, useQuery } from '@tanstack/react-query';
import blobRequest from '@/api/blobRequest';
import request from '@/api/request';

import type {
  CompleteUploadSessionRequest,
  CreateUploadSessionRequest,
  MediaPurposeCode,
  UploadCompleteData,
  UploadPartAckData,
  UploadSessionCreatedData,
  UploadSessionId,
  UploadSessionStatusData,
} from './types';

export const createUploadSession = (
  data: CreateUploadSessionRequest,
): Promise<UploadSessionCreatedData> =>
  request.post<UploadSessionCreatedData>(
    '/api/v1/media/upload-sessions',
    data,
  ) as unknown as Promise<UploadSessionCreatedData>;

export const getUploadSession = (
  uploadSessionId: UploadSessionId,
): Promise<UploadSessionStatusData> =>
  request.get<UploadSessionStatusData>(
    `/api/v1/media/upload-sessions/${uploadSessionId}`,
  ) as unknown as Promise<UploadSessionStatusData>;

export const uploadPart = (
  uploadSessionId: UploadSessionId,
  partNumber: number,
  blob: Blob,
  sha256?: string,
): Promise<UploadPartAckData> => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/octet-stream',
  };

  if (sha256) {
    headers['X-Part-Sha256'] = sha256;
  }

  return request.put<UploadPartAckData>(
    `/api/v1/media/upload-sessions/${uploadSessionId}/parts/${partNumber}`,
    blob,
    { headers },
  ) as unknown as Promise<UploadPartAckData>;
};

export const completeUploadSession = (
  uploadSessionId: UploadSessionId,
  data: CompleteUploadSessionRequest,
): Promise<UploadCompleteData> =>
  request.post<UploadCompleteData>(
    `/api/v1/media/upload-sessions/${uploadSessionId}/complete`,
    data,
  ) as unknown as Promise<UploadCompleteData>;

export const cancelUploadSession = (
  uploadSessionId: UploadSessionId,
): Promise<void> =>
  request.delete(
    `/api/v1/media/upload-sessions/${uploadSessionId}`,
  ) as unknown as Promise<void>;

export const getPreviewBlob = async (mediaAssetId: string): Promise<Blob> => {
  const response = await blobRequest.get(
    `/api/v1/media/${mediaAssetId}/preview`,
    {
      responseType: 'blob',
    },
  );
  return response.data;
};

export const useCreateUploadSession = () =>
  useMutation({
    mutationFn: createUploadSession,
  });

export const useGetUploadSession = (uploadSessionId: UploadSessionId) =>
  useQuery({
    queryKey: ['media-upload', 'session', uploadSessionId],
    queryFn: () => getUploadSession(uploadSessionId),
    enabled: !!uploadSessionId,
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

export type { MediaPurposeCode };
