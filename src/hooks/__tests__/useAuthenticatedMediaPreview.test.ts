import { renderHook, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  parseMediaAssetIdFromPreviewUrl,
  useAuthenticatedMediaPreview,
} from '../useAuthenticatedMediaPreview';

vi.mock('@/services/media-upload', () => ({
  getPreviewBlob: vi.fn(),
}));

import { getPreviewBlob } from '@/services/media-upload';

describe('parseMediaAssetIdFromPreviewUrl', () => {
  it('解析相对路径', () => {
    expect(parseMediaAssetIdFromPreviewUrl('/api/v1/media/42/preview')).toBe(
      '42',
    );
  });

  it('解析绝对路径', () => {
    expect(
      parseMediaAssetIdFromPreviewUrl(
        'http://localhost:5173/api/v1/media/99/preview',
      ),
    ).toBe('99');
  });

  it('非媒体预览路径返回 null', () => {
    expect(parseMediaAssetIdFromPreviewUrl('/other/path')).toBeNull();
  });
});

describe('useAuthenticatedMediaPreview', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('通过 getPreviewBlob 生成 blob URL', async () => {
    const blob = new Blob(['x'], { type: 'image/png' });
    vi.mocked(getPreviewBlob).mockResolvedValue(blob);

    const { result } = renderHook(() =>
      useAuthenticatedMediaPreview('/api/v1/media/7/preview'),
    );

    await waitFor(() => {
      expect(result.current.displayUrl).toMatch(/^blob:/u);
    });
    expect(getPreviewBlob).toHaveBeenCalledWith('7');
    expect(result.current.failed).toBe(false);
  });

  it('请求失败时标记 failed', async () => {
    vi.mocked(getPreviewBlob).mockRejectedValue(new Error('403'));

    const { result } = renderHook(() =>
      useAuthenticatedMediaPreview('/api/v1/media/7/preview'),
    );

    await waitFor(() => {
      expect(result.current.failed).toBe(true);
    });
    expect(result.current.displayUrl).toBeUndefined();
  });
});
