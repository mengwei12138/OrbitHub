import { getLogger } from '@/utils/logger';

const logger = getLogger();

export const captureVideoFrame = (videoUrl: string): Promise<string> => {
  logger.debug('开始截取视频帧', { videoUrl });
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.crossOrigin = 'anonymous';
    video.src = videoUrl;
    video.currentTime = 0.1;
    video.muted = true;

    video.onloadeddata = () => {
      logger.debug('onloadeddata 触发', {
        videoWidth: video.videoWidth,
        videoHeight: video.videoHeight,
      });
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      canvas.getContext('2d')?.drawImage(video, 0, 0);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
      logger.debug('截取成功', { dataUrlLength: dataUrl.length });
      resolve(dataUrl);
    };

    video.onerror = (e) => {
      logger.error('video onerror', { error: e });
      reject(new Error('视频加载失败'));
    };

    video.onloadstart = () => {
      logger.debug('video onloadstart');
    };

    video.onloadedmetadata = () => {
      logger.debug('video onloadedmetadata');
    };

    logger.debug('video 元素已创建，等待加载...');
  });
};

export const revokeLocalUrl = (url: string | undefined) => {
  if (url?.startsWith('blob:')) {
    URL.revokeObjectURL(url);
  }
};
