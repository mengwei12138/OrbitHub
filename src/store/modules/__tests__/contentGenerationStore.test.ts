import { beforeEach, describe, expect, it } from 'vitest';
import { useContentGenerationStore } from '../contentGenerationStore';

describe('contentGenerationStore', () => {
  beforeEach(() => {
    useContentGenerationStore.getState().reset();
  });

  it('视频任务完成后展示 toast 并缓存结果', () => {
    useContentGenerationStore.getState().registerVideoTask('task-1', {
      title: '测试视频',
      duration: 10,
      resolution: '720P',
      quality: '标准',
      credits: 250,
    });

    useContentGenerationStore.getState().completeVideoTask('task-1', {
      title: '测试视频',
      duration: 10,
      resolution: '720P',
      quality: '标准',
      credits: 250,
      videoUrl: 'https://example.com/video.mp4',
    });

    const state = useContentGenerationStore.getState();
    expect(state.tasks['task-1']).toBeUndefined();
    expect(state.toast).toEqual({ kind: 'video', taskId: 'task-1' });
    expect(state.videoResultAutoOpen).toBe(false);
    expect(state.videoResult?.videoUrl).toBe('https://example.com/video.mp4');
  });

  it('在视频生成页完成任务时不展示 toast，改为直接打开详情', () => {
    useContentGenerationStore.getState().setVideoGenerationPageActive(true);
    useContentGenerationStore.getState().registerVideoTask('task-v', {
      title: '测试视频',
      duration: 10,
      resolution: '720P',
      quality: '标准',
      credits: 250,
    });

    useContentGenerationStore.getState().completeVideoTask('task-v', {
      title: '测试视频',
      duration: 10,
      resolution: '720P',
      quality: '标准',
      credits: 250,
      videoUrl: 'https://example.com/video.mp4',
    });

    const state = useContentGenerationStore.getState();
    expect(state.toast).toBeNull();
    expect(state.videoResultAutoOpen).toBe(true);
    expect(state.videoResult?.videoUrl).toBe('https://example.com/video.mp4');
  });

  it('图文任务完成后直接展示结果弹窗', () => {
    useContentGenerationStore.getState().registerImageTask('task-2', {
      imageCount: 1,
    });

    useContentGenerationStore.getState().completeImageTask(
      'task-2',
      {
        id: 'task-2',
        title: '标题',
        content: '正文',
        tags: ['#标签'],
        images: ['https://example.com/image.jpg'],
        createdAt: new Date('2026-05-27T00:00:00.000Z'),
      },
      1,
    );

    const state = useContentGenerationStore.getState();
    expect(state.toast).toBeNull();
    expect(state.imageResult?.result.title).toBe('标题');
    expect(state.imageResult?.imageCount).toBe(1);
  });
});
