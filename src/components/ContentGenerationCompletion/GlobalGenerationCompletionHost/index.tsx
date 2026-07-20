import { message } from 'antd';
import type React from 'react';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GenerationCompleteToast } from '@/components/ContentGenerationCompletion/GenerationCompleteToast';
import { useContentGenerationPoller } from '@/hooks/useContentGenerationPoller';
import type { PublishPrefillState } from '@/pages/content/types';
import { GenerationResultModal } from '@/pages/content-generation/image-generation/components/GenerationResultModal';
import {
  type VideoResult,
  VideoResultModal,
} from '@/pages/content-generation/video-generation/components/VideoResultModal';
import {
  fetchImageGenerationTaskStatus,
  fetchVideoTaskStatus,
} from '@/services/content-generation';
import { useContentGenerationStore } from '@/store/modules/contentGenerationStore';
import { useUserStore } from '@/store/modules/userStore';

const ASSET_NOT_READY_HINT =
  '素材尚未就绪（系统正在把生成结果保存到本地），请几秒后再试';

export const GlobalGenerationCompletionHost: React.FC = () => {
  const navigate = useNavigate();
  const token = useUserStore((s) => s.token);
  const toast = useContentGenerationStore((s) => s.toast);
  const videoResult = useContentGenerationStore((s) => s.videoResult);
  const imageResult = useContentGenerationStore((s) => s.imageResult);
  const dismissToast = useContentGenerationStore((s) => s.dismissToast);
  const openVideoResultFromToast = useContentGenerationStore(
    (s) => s.openVideoResultFromToast,
  );
  const closeVideoResult = useContentGenerationStore((s) => s.closeVideoResult);
  const closeImageResult = useContentGenerationStore((s) => s.closeImageResult);
  const videoResultAutoOpen = useContentGenerationStore(
    (s) => s.videoResultAutoOpen,
  );

  const [videoModalVisible, setVideoModalVisible] = useState(false);

  useEffect(() => {
    if (!token) {
      useContentGenerationStore.getState().reset();
      setVideoModalVisible(false);
    }
  }, [token]);

  useContentGenerationPoller(!!token);

  useEffect(() => {
    if (videoResultAutoOpen && videoResult) {
      setVideoModalVisible(true);
    }
  }, [videoResultAutoOpen, videoResult]);

  const toastTitle = useMemo(() => {
    if (!toast) return '';
    return toast.kind === 'video' ? '视频生成完成' : '图文生成完成';
  }, [toast]);

  const handleToastAction = () => {
    if (!toast) return;
    dismissToast();
    if (toast.kind === 'video' && videoResult) {
      openVideoResultFromToast();
      setVideoModalVisible(true);
    }
  };

  const handleToastClose = () => {
    dismissToast();
  };

  const handleCloseVideoResult = () => {
    setVideoModalVisible(false);
    closeVideoResult();
  };

  const resolvedVideoResult: VideoResult = videoResult ?? {
    title: '',
    duration: 0,
    resolution: '720P',
    quality: '标准',
    credits: 0,
  };

  return (
    <>
      <GenerationCompleteToast
        visible={toast != null}
        title={toastTitle}
        onAction={handleToastAction}
        onClose={handleToastClose}
      />

      <VideoResultModal
        visible={videoModalVisible && videoResult != null}
        result={resolvedVideoResult}
        onClose={handleCloseVideoResult}
        onRegenerate={handleCloseVideoResult}
        onGoWorks={() => {
          handleCloseVideoResult();
          navigate('/content-generation/my-works');
        }}
        onPublish={() => {
          void (async () => {
            // content-generation-publish-bridge：发布页只接受已 ingest 的 mediaAssetId。
            // store 里 mediaAssetId 可能是「重启前轮询」拿到的空值——这里再请一次状态接口，
            // 后端的 getVideoTaskStatus fast-path 会顺带触发 ingest，拿回新 id。
            let mediaAssetId = videoResult?.mediaAssetId;
            if (typeof mediaAssetId !== 'string' && videoResult?.taskId) {
              try {
                const status = await fetchVideoTaskStatus(videoResult.taskId);
                const refreshed = status.mediaAssetIds?.[0];
                if (typeof refreshed === 'string') mediaAssetId = refreshed;
              } catch {
                /* 静默：下一步会弹通用 toast */
              }
            }
            if (typeof mediaAssetId !== 'string') {
              message.error(ASSET_NOT_READY_HINT);
              return;
            }
            handleCloseVideoResult();
            navigate('/content', {
              state: {
                contentMode: 'VIDEO',
                title: videoResult?.title,
                videoMediaAssetId: mediaAssetId,
              } satisfies PublishPrefillState,
            });
          })();
        }}
        onDownload={() => {
          if (videoResult?.videoUrl) {
            window.open(videoResult.videoUrl, '_blank');
          }
        }}
      />

      <GenerationResultModal
        visible={imageResult != null}
        result={imageResult?.result}
        imageCount={imageResult?.imageCount ?? 0}
        onClose={closeImageResult}
        onRegenerate={closeImageResult}
        onGoWorks={() => {
          closeImageResult();
          navigate('/content-generation/my-works');
        }}
        onPublish={() => {
          if (!imageResult) return;
          void (async () => {
            const isTextOnly = imageResult.imageCount === 0;
            let filteredIds = (imageResult.result.mediaAssetIds ?? []).filter(
              (id): id is string => typeof id === 'string',
            );
            // 仅当用户提交时 imageCount>=1 才需要拿到 mediaAssetIds；纯文案任务允许直接发布。
            if (
              !isTextOnly &&
              filteredIds.length === 0 &&
              imageResult.result.id
            ) {
              // store 里可能是「重启前轮询」拿到的空值——refetch 一次让后端 fast-path ingest 顶上
              try {
                const status = await fetchImageGenerationTaskStatus(
                  imageResult.result.id,
                );
                filteredIds = (status.mediaAssetIds ?? []).filter(
                  (id): id is string => typeof id === 'string',
                );
              } catch {
                /* 静默：下一步弹通用 toast */
              }
            }
            if (!isTextOnly && filteredIds.length === 0) {
              message.error(ASSET_NOT_READY_HINT);
              return;
            }
            closeImageResult();
            navigate('/content', {
              state: {
                contentMode: 'IMAGE',
                title: imageResult.result.title,
                content: imageResult.result.content,
                tags: imageResult.result.tags,
                imageMediaAssetIds:
                  filteredIds.length > 0 ? filteredIds : undefined,
              } satisfies PublishPrefillState,
            });
          })();
        }}
      />
    </>
  );
};

export default GlobalGenerationCompletionHost;
