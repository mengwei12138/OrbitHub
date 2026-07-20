import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { useChunkedUpload } from '../../hooks/useChunkedUpload';

const mockUploadController = {
  createSession: vi.fn(),
  uploadPart: vi.fn(),
  getSessionStatus: vi.fn(),
  cancelSession: vi.fn(),
  completeSession: vi.fn(),
};

describe('useChunkedUpload', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockUploadController.createSession.mockResolvedValue({
      uploadSessionId: 'session-123',
      partSizeBytes: '5',
      totalParts: 3,
      maxConcurrentParts: 2,
    });

    mockUploadController.uploadPart.mockResolvedValue({
      partNumber: 1,
      receivedSizeBytes: '5',
      serverPartEtag: 'etag-1',
    });

    mockUploadController.getSessionStatus.mockResolvedValue({
      missingPartNumbers: [],
    });

    mockUploadController.completeSession.mockResolvedValue({
      mediaAssetId: 'media-123',
      fileSizeBytes: '15',
      previewUrl: '/api/v1/media/media-123/preview',
      mimeType: 'text/plain',
    });
  });

  it('应正确初始化', () => {
    const { result } = renderHook(() => useChunkedUpload());

    expect(result.current.uploadFile).toBeDefined();
    expect(result.current.abort).toBeDefined();
    expect(result.current.abortAll).toBeDefined();
  });

  it('应正确完成上传流程', async () => {
    const { result } = renderHook(() => useChunkedUpload());

    const file = new File(['abcdef'], 'test.txt', { type: 'text/plain' });
    const onComplete = vi.fn();

    await result.current.uploadFile(file, 'test-file', {
      chunk: { maxRetries: 3 },
      controller: mockUploadController as never,
      callbacks: { onComplete },
    });

    expect(mockUploadController.completeSession).toHaveBeenCalled();
    expect(onComplete).toHaveBeenCalledWith(
      expect.objectContaining({
        mediaAssetId: 'media-123',
      }),
      file,
    );
  });

  it('上传分片时应计算并传递 sha256', async () => {
    const { result } = renderHook(() => useChunkedUpload());

    const file = new File(['abcdef'], 'test.txt', { type: 'text/plain' });
    const onComplete = vi.fn();

    await result.current.uploadFile(file, 'test-file', {
      chunk: { maxRetries: 3 },
      controller: mockUploadController as never,
      callbacks: { onComplete },
    });

    expect(mockUploadController.uploadPart).toHaveBeenCalled();

    const uploadCalls = mockUploadController.uploadPart.mock.calls;
    expect(uploadCalls.length).toBeGreaterThan(0);

    uploadCalls.forEach((call) => {
      const [, partNumber, , sha256] = call;
      expect(partNumber).toBeDefined();
      expect(sha256).toBeDefined();
      expect(typeof sha256).toBe('string');
      expect(sha256.length).toBe(64);
    });
  });

  it('并发上传时分片应正确计算 sha256', async () => {
    const { result } = renderHook(() => useChunkedUpload());

    const file = new File(['abcdefghijklmnop'], 'test.txt', {
      type: 'text/plain',
    });
    const onComplete = vi.fn();

    await result.current.uploadFile(file, 'test-file', {
      chunk: { maxRetries: 3 },
      controller: mockUploadController as never,
      callbacks: { onComplete },
    });

    const uploadCalls = mockUploadController.uploadPart.mock.calls;
    expect(uploadCalls.length).toBeGreaterThan(0);

    const sha256Values = uploadCalls.map((call) => call[3]);
    const uniqueHashes = new Set(sha256Values);
    expect(uniqueHashes.size).toBe(sha256Values.length);
  });
});
