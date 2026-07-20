import { Image, Spin } from 'antd';
import type React from 'react';
import { useAuthenticatedMediaPreview } from '@/hooks/useAuthenticatedMediaPreview';
import styles from './style.module.css';

export interface AuthenticatedMediaThumbProps {
  previewUrl?: string;
  thumbUrl?: string;
  alt?: string;
  className?: string;
}

/** 优先本地缩略图，否则通过鉴权接口拉取预览 blob */
export const AuthenticatedMediaThumb: React.FC<
  AuthenticatedMediaThumbProps
> = ({ previewUrl, thumbUrl, alt = '', className }) => {
  const localSrc = thumbUrl?.startsWith('blob:') ? thumbUrl : undefined;
  const { displayUrl, failed } = useAuthenticatedMediaPreview(
    localSrc ? undefined : previewUrl,
  );
  const src = localSrc ?? displayUrl;

  if (failed && !localSrc) {
    return <div className={`${styles.error} ${className ?? ''}`}>!</div>;
  }

  if (!src) {
    return (
      <div className={`${styles.loading} ${className ?? ''}`}>
        <Spin size="small" />
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      className={`${styles.image} ${className ?? ''}`}
      preview={{ mask: null }}
    />
  );
};

export default AuthenticatedMediaThumb;
