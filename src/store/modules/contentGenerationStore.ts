import { create } from 'zustand';
import type { GenerationResult } from '@/pages/content-generation/image-generation/types';
import type { VideoResult } from '@/pages/content-generation/video-generation/components/VideoResultModal';

export type ImageTaskMeta = {
  imageCount: 0 | 1;
  /** 提交表单中的产品/服务名称，用于结果弹窗「标题」展示 */
  productServiceName?: string;
};

export type VideoTaskMeta = {
  title: string;
  duration: number;
  resolution: string;
  quality: string;
  credits: number;
};

export type PendingGenerationTask =
  | {
      taskId: string;
      kind: 'video';
      meta: VideoTaskMeta;
      progress: number;
    }
  | {
      taskId: string;
      kind: 'image';
      meta: ImageTaskMeta;
      progress: number;
    };

export type GenerationCompleteToastState = {
  kind: 'video' | 'image';
  taskId: string;
};

type ContentGenerationState = {
  tasks: Record<string, PendingGenerationTask>;
  toast: GenerationCompleteToastState | null;
  videoResult: VideoResult | null;
  /** 用户在视频生成页时完成，需直接打开详情弹窗而非 toast */
  videoResultAutoOpen: boolean;
  /** 由视频生成页 mount/unmount 维护 */
  videoGenerationPageActive: boolean;
  imageResult: { result: GenerationResult; imageCount: 0 | 1 } | null;
  registerVideoTask: (taskId: string, meta: VideoTaskMeta) => void;
  registerImageTask: (taskId: string, meta: ImageTaskMeta) => void;
  updateTaskProgress: (taskId: string, progress: number) => void;
  completeVideoTask: (taskId: string, result: VideoResult) => void;
  completeImageTask: (
    taskId: string,
    result: GenerationResult,
    imageCount: 0 | 1,
  ) => void;
  removeTask: (taskId: string) => void;
  setVideoGenerationPageActive: (active: boolean) => void;
  dismissToast: () => void;
  openVideoResultFromToast: () => void;
  closeVideoResult: () => void;
  closeImageResult: () => void;
  reset: () => void;
};

const initialState = {
  tasks: {} as Record<string, PendingGenerationTask>,
  toast: null as GenerationCompleteToastState | null,
  videoResult: null as VideoResult | null,
  videoResultAutoOpen: false,
  videoGenerationPageActive: false,
  imageResult: null as {
    result: GenerationResult;
    imageCount: 0 | 1;
  } | null,
};

export const useContentGenerationStore = create<ContentGenerationState>()(
  (set, get) => ({
    ...initialState,

    registerVideoTask: (taskId, meta) =>
      set((state) => ({
        tasks: {
          ...state.tasks,
          [taskId]: { taskId, kind: 'video', meta, progress: 0 },
        },
      })),

    registerImageTask: (taskId, meta) =>
      set((state) => ({
        tasks: {
          ...state.tasks,
          [taskId]: { taskId, kind: 'image', meta, progress: 0 },
        },
      })),

    updateTaskProgress: (taskId, progress) =>
      set((state) => {
        const task = state.tasks[taskId];
        if (!task) return state;
        return {
          tasks: {
            ...state.tasks,
            [taskId]: { ...task, progress },
          },
        };
      }),

    completeVideoTask: (taskId, result) => {
      const { tasks, videoGenerationPageActive } = get();
      const nextTasks = { ...tasks };
      delete nextTasks[taskId];
      const showModalDirectly = videoGenerationPageActive;
      set({
        tasks: nextTasks,
        toast: showModalDirectly ? null : { kind: 'video', taskId },
        videoResult: result,
        videoResultAutoOpen: showModalDirectly,
      });
    },

    completeImageTask: (taskId, result, imageCount) => {
      const { tasks } = get();
      const nextTasks = { ...tasks };
      delete nextTasks[taskId];
      set({
        tasks: nextTasks,
        toast: null,
        imageResult: { result, imageCount },
      });
    },

    removeTask: (taskId) =>
      set((state) => {
        const nextTasks = { ...state.tasks };
        delete nextTasks[taskId];
        return { tasks: nextTasks };
      }),

    setVideoGenerationPageActive: (active) =>
      set({ videoGenerationPageActive: active }),

    dismissToast: () => set({ toast: null }),

    openVideoResultFromToast: () => set({ toast: null }),

    closeVideoResult: () =>
      set({ videoResult: null, videoResultAutoOpen: false }),

    closeImageResult: () => set({ imageResult: null }),

    reset: () => set(initialState),
  }),
);
