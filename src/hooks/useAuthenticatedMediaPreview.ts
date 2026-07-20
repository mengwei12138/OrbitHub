import { useEffect, useState } from 'react';
import { getPreviewBlob } from '@/services/media-upload';

/** 从媒体预览 API 路径解析素材 ID */
export function parseMediaAssetIdFromPreviewUrl(url: string): string | null {
  if (!url) return null;
  try {
    const path = url.startsWith('http')
      ? new URL(url).pathname
      : url.split('?')[0];
    const match = path.match(/\/api\/v1\/media\/(?<id>\d+)\/preview$/u);
    return match?.groups?.id ?? null;
  } catch {
    return null;
  }
}

/**
 * 将需鉴权的媒体预览路径转为可展示的 blob URL。
 * 浏览器直接请求 /api/v1/media/{id}/preview 不会携带 Authorization，故通过 axios 拉取。
 */
export function useAuthenticatedMediaPreview(previewUrl?: string) {
  const [displayUrl, setDisplayUrl] = useState<string | undefined>();
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!previewUrl) {
      setDisplayUrl(undefined);
      setFailed(false);
      return;
    }

    if (previewUrl.startsWith('blob:') || previewUrl.startsWith('data:')) {
      setDisplayUrl(previewUrl);
      setFailed(false);
      return;
    }

    const assetId = parseMediaAssetIdFromPreviewUrl(previewUrl);
    if (!assetId) {
      setDisplayUrl(previewUrl);
      setFailed(false);
      return;
    }

    let objectUrl: string | undefined;
    let cancelled = false;

    setDisplayUrl(undefined);
    setFailed(false);
    getPreviewBlob(assetId)
      .then((blob) => {
        if (cancelled) return;
        objectUrl = URL.createObjectURL(blob);
        setDisplayUrl(objectUrl);
      })
      .catch(() => {
        if (!cancelled) {
          setDisplayUrl(undefined);
          setFailed(true);
        }
      });

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [previewUrl]);

  return { displayUrl, failed };
}
