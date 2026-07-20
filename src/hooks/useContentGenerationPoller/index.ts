import { message } from 'antd';
import { useEffect } from 'react';
import { queryClient } from '@/api/queryClient';
import {
  fetchImageGenerationTaskStatus,
  fetchVideoTaskStatus,
} from '@/services/content-generation';
import { parseImageGenerationResult } from '@/services/content-generation/imageResultParser';
import { creditsBalanceQueryKey } from '@/services/content-generation/queryOptions';
import { useContentGenerationStore } from '@/store/modules/contentGenerationStore';

const POLL_INTERVAL_MS = 1500;

export function useContentGenerationPoller(enabled: boolean) {
  const updateTaskProgress = useContentGenerationStore(
    (s) => s.updateTaskProgress,
  );
  const completeVideoTask = useContentGenerationStore(
    (s) => s.completeVideoTask,
  );
  const completeImageTask = useContentGenerationStore(
    (s) => s.completeImageTask,
  );
  const removeTask = useContentGenerationStore((s) => s.removeTask);

  useEffect(() => {
    if (!enabled) return;

    let cancelled = false;
    let timer: ReturnType<typeof setInterval> | null = null;

    const pollOnce = async () => {
      if (cancelled) return;

      const taskEntries = Object.values(
        useContentGenerationStore.getState().tasks,
      );
      if (taskEntries.length === 0) return;

      await Promise.all(
        taskEntries.map(async (task) => {
          try {
            if (task.kind === 'video') {
              const status = await fetchVideoTaskStatus(task.taskId);
              if (cancelled) return;

              updateTaskProgress(task.taskId, status.progress ?? 0);

              if (status.status === 'COMPLETED') {
                void queryClient.refetchQueries({
                  queryKey: creditsBalanceQueryKey,
                });
                // 视频通常只有一个产物，mediaAssetIds[0] 即「去发布」要用的 id；
                // null 表示该位 ingest 失败，弹窗会保留显示但「去发布」按钮被入口侧屏蔽。
                const firstMediaAssetId =
                  status.mediaAssetIds?.[0] ?? undefined;
                completeVideoTask(task.taskId, {
                  title: task.meta.title,
                  duration: task.meta.duration,
                  resolution: task.meta.resolution,
                  quality: task.meta.quality,
                  credits: task.meta.credits,
                  videoUrl: status.videoUrl ?? status.videoUrls?.[0],
                  mediaAssetId:
                    typeof firstMediaAssetId === 'string'
                      ? firstMediaAssetId
                      : undefined,
                  // taskId 保留在 result：弹窗 onPublish 的兜底 refetch 需要它（详见 VideoResult JSDoc）
                  taskId: task.taskId,
                });
                return;
              }

              if (status.status === 'FAILED') {
                removeTask(task.taskId);
                message.error(
                  status.errorMessage ?? status.message ?? '视频生成失败',
                );
              }
              return;
            }

            const status = await fetchImageGenerationTaskStatus(task.taskId);
            if (cancelled) return;

            updateTaskProgress(task.taskId, status.progress ?? 0);

            if (status.status === 'COMPLETED') {
              void queryClient.refetchQueries({
                queryKey: creditsBalanceQueryKey,
              });
              completeImageTask(
                task.taskId,
                parseImageGenerationResult(task.taskId, status, {
                  productServiceName: task.meta.productServiceName,
                }),
                task.meta.imageCount,
              );
              return;
            }

            if (status.status === 'FAILED') {
              removeTask(task.taskId);
              message.error(
                status.errorMessage ?? status.message ?? '图文生成失败',
              );
            }
          } catch (err) {
            if (cancelled) return;
            removeTask(task.taskId);
            message.error(
              err instanceof Error ? err.message : '查询任务状态失败',
            );
          }
        }),
      );
    };

    const syncPolling = () => {
      const hasTasks =
        Object.keys(useContentGenerationStore.getState().tasks).length > 0;
      if (!hasTasks) {
        if (timer != null) {
          clearInterval(timer);
          timer = null;
        }
        return;
      }
      if (timer == null) {
        void pollOnce();
        timer = setInterval(() => {
          void pollOnce();
        }, POLL_INTERVAL_MS);
      }
    };

    syncPolling();
    const unsubscribe = useContentGenerationStore.subscribe(syncPolling);

    return () => {
      cancelled = true;
      if (timer != null) {
        clearInterval(timer);
      }
      unsubscribe();
    };
  }, [
    enabled,
    updateTaskProgress,
    completeVideoTask,
    completeImageTask,
    removeTask,
  ]);
}

export { POLL_INTERVAL_MS };
