import { describe, expect, it, vi } from 'vitest';

import {
  cancelUploadSession,
  completeUploadSession,
  createUploadSession,
  getPreviewBlob,
  getUploadSession,
  uploadPart,
} from '../index';

vi.mock('@/api/request', () => ({
  default: {
    post: vi.fn(),
    get: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

vi.mock('@/api/blobRequest', () => ({
  default: {
    get: vi.fn(),
  },
}));

describe('media-upload service', () => {
  describe('createUploadSession', () => {
    it('应正确调用 POST /api/v1/media/upload-sessions', async () => {
      const mockResponse = {
        uploadSessionId: 'session-123',
        partSizeBytes: '1048576',
        totalParts: 10,
        expiresAt: '2026-04-24T12:00:00Z',
        maxConcurrentParts: 3,
      };

      const request = await import('@/api/request');
      vi.mocked(request.default.post).mockResolvedValue(mockResponse);

      const result = await createUploadSession({
        fileName: 'test.mp4',
        fileSizeBytes: '10485760',
        purpose: 'DRAFT_VIDEO',
      });

      expect(request.default.post).toHaveBeenCalledWith(
        '/api/v1/media/upload-sessions',
        {
          fileName: 'test.mp4',
          fileSizeBytes: '10485760',
          purpose: 'DRAFT_VIDEO',
        },
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe('getUploadSession', () => {
    it('应正确调用 GET /api/v1/media/upload-sessions/{id}', async () => {
      const mockResponse = {
        uploadSessionId: 'session-123',
        status: 'UPLOADING',
        partSizeBytes: '1048576',
        totalParts: 10,
        fileSizeBytes: '10485760',
        uploadedParts: [],
        missingPartNumbers: [1, 2, 3],
        expiresAt: '2026-04-24T12:00:00Z',
      };

      const request = await import('@/api/request');
      vi.mocked(request.default.get).mockResolvedValue(mockResponse);

      const result = await getUploadSession('session-123');

      expect(request.default.get).toHaveBeenCalledWith(
        '/api/v1/media/upload-sessions/session-123',
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe('uploadPart', () => {
    it('应正确调用 PUT /api/v1/media/upload-sessions/{id}/parts/{partNumber}', async () => {
      const mockResponse = {
        partNumber: 1,
        receivedSizeBytes: '1048576',
        serverPartEtag: 'etag-123',
      };

      const request = await import('@/api/request');
      vi.mocked(request.default.put).mockResolvedValue(mockResponse);

      const blob = new Blob(['test']);
      const result = await uploadPart('session-123', 1, blob, 'sha256hash');

      expect(request.default.put).toHaveBeenCalledWith(
        '/api/v1/media/upload-sessions/session-123/parts/1',
        blob,
        {
          headers: {
            'Content-Type': 'application/octet-stream',
            'X-Part-Sha256': 'sha256hash',
          },
        },
      );
      expect(result).toEqual(mockResponse);
    });

    it('不带 sha256 时不应发送 X-Part-Sha256 头', async () => {
      const mockResponse = {
        partNumber: 1,
        receivedSizeBytes: '1048576',
        serverPartEtag: 'etag-123',
      };

      const request = await import('@/api/request');
      vi.mocked(request.default.put).mockResolvedValue(mockResponse);

      const blob = new Blob(['test']);
      await uploadPart('session-123', 1, blob);

      expect(request.default.put).toHaveBeenCalledWith(
        '/api/v1/media/upload-sessions/session-123/parts/1',
        blob,
        {
          headers: {
            'Content-Type': 'application/octet-stream',
          },
        },
      );
    });
  });

  describe('completeUploadSession', () => {
    it('应正确调用 POST /api/v1/media/upload-sessions/{id}/complete', async () => {
      const mockResponse = {
        mediaAssetId: 'media-123',
        fileSizeBytes: '10485760',
        previewUrl: '/api/v1/media/media-123/preview',
        mimeType: 'video/mp4',
      };

      const request = await import('@/api/request');
      vi.mocked(request.default.post).mockResolvedValue(mockResponse);

      const result = await completeUploadSession('session-123', {
        parts: [{ partNumber: 1, sha256: 'hash1', serverPartEtag: 'etag1' }],
      });

      expect(request.default.post).toHaveBeenCalledWith(
        '/api/v1/media/upload-sessions/session-123/complete',
        {
          parts: [{ partNumber: 1, sha256: 'hash1', serverPartEtag: 'etag1' }],
        },
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe('cancelUploadSession', () => {
    it('应正确调用 DELETE /api/v1/media/upload-sessions/{id}', async () => {
      const request = await import('@/api/request');
      vi.mocked(request.default.delete).mockResolvedValue(undefined);

      await cancelUploadSession('session-123');

      expect(request.default.delete).toHaveBeenCalledWith(
        '/api/v1/media/upload-sessions/session-123',
      );
    });
  });

  describe('getPreviewBlob', () => {
    it('应正确调用 GET /api/v1/media/{mediaAssetId}/preview', async () => {
      const mockBlob = new Blob(['test'], { type: 'video/mp4' });

      const blobRequest = await import('@/api/blobRequest');
      vi.mocked(blobRequest.default.get).mockResolvedValue({ data: mockBlob });

      const result = await getPreviewBlob('media-123');

      expect(blobRequest.default.get).toHaveBeenCalledWith(
        '/api/v1/media/media-123/preview',
        { responseType: 'blob' },
      );
      expect(result).toEqual(mockBlob);
    });
  });
});
