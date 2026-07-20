import type React from 'react';
import douyinIcon from '@/images/platforms/douyin.svg';
import xiaohongshuIcon from '@/images/platforms/xiaohongshu.svg';
import styles from './style.module.css';
import type { PlatformIconProps } from './types';

export const PLATFORM_CONFIG = {
  xiaohongshu: {
    icon: xiaohongshuIcon,
    label: '小红书',
  },
  douyin: {
    icon: douyinIcon,
    label: '抖音',
  },
} as const;

const PlatformIcon: React.FC<PlatformIconProps> = ({ platform, size = 24 }) => {
  const config = PLATFORM_CONFIG[platform as keyof typeof PLATFORM_CONFIG];

  if (!config) {
    return <span style={{ fontSize: size }}>{platform}</span>;
  }

  return (
    <img
      src={config.icon}
      alt={config.label}
      className={styles.icon}
      style={{ width: size, height: size, display: 'block' }}
    />
  );
};

export default PlatformIcon;
