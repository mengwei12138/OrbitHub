import { describe, expect, it } from 'vitest';

import { canAcceptMoreUpload } from '../../../utils/mediaUploadLimits';

/**
 * 回归：批量多选时须用函数式更新合并列表，且勿在首个 uploading 时卸载 Dragger。
 * 逻辑见 UploadZoneImage patchFiles + draggerSlotHidden。
 */
describe('UploadZoneImage multi-select regression', () => {
  it('第 10 张不应进入列表', () => {
    const prev = Array.from({ length: 9 }, (_, i) => ({
      uid: String(i),
      name: 'a.jpg',
      status: 'done' as const,
    }));
    expect(canAcceptMoreUpload(prev, 'x', 9)).toBe(false);
  });

  it('批量多选时用 pending 占位避免超额放行', () => {
    let state: Array<{
      uid: string;
      name: string;
      status: 'done' | 'uploading';
    }> = Array.from({ length: 8 }, (_, i) => ({
      uid: String(i),
      name: 'a.jpg',
      status: 'done' as const,
    }));
    let pending = 0;
    const maxCount = 9;

    const tryReserve = (uid: string) => {
      const alreadyListed = state.some((f) => f.uid === uid);
      if (!alreadyListed && state.length + pending >= maxCount) {
        return false;
      }
      if (!alreadyListed) pending += 1;
      state = [...state, { uid, name: 'a.jpg', status: 'uploading' as const }];
      return true;
    };

    expect(tryReserve('eight')).toBe(true);
    expect(tryReserve('nine')).toBe(false);
    expect(state).toHaveLength(9);
  });

  it('函数式更新应累加多个文件', () => {
    let state: { uid: string; status: string }[] = [];
    const patch = (
      updater: typeof state extends infer S ? (p: S) => S : never,
    ) => {
      state = updater(state);
    };

    patch((prev) => [...prev, { uid: 'a', status: 'uploading' }]);
    patch((prev) => [...prev, { uid: 'b', status: 'uploading' }]);
    patch((prev) => {
      const idx = prev.findIndex((f) => f.uid === 'a');
      const next = [...prev];
      next[idx] = { uid: 'a', status: 'done' };
      return next;
    });

    expect(state).toHaveLength(2);
    expect(state.find((f) => f.uid === 'a')?.status).toBe('done');
    expect(state.find((f) => f.uid === 'b')?.status).toBe('uploading');
  });

  /**
   * 回归：handleUploadChange 'uploading' 分支必须把 'done'/'error' 视为终态，
   * 否则并发上传中迟到的进度事件会把已完成的文件回退成 'uploading'，
   * 卡住生成按钮的 hasUploadingMedia 预检（"素材仍在上传中"）。
   */
  it('迟到的 uploading 事件不能覆盖已 done 的文件', () => {
    type F = { uid: string; status: 'uploading' | 'done' | 'error' };
    let state: F[] = [
      { uid: 'a', status: 'done' },
      { uid: 'b', status: 'uploading' },
    ];
    const patch = (updater: (p: F[]) => F[]) => {
      state = updater(state);
    };

    // 模拟 handleUploadChange 'uploading' 分支的状态机守卫
    const applyUploading = (uid: string) => {
      patch((prev) => {
        const idx = prev.findIndex((f) => f.uid === uid);
        if (idx >= 0) {
          if (prev[idx].status === 'done' || prev[idx].status === 'error') {
            return prev;
          }
          const next = [...prev];
          next[idx] = { uid, status: 'uploading' };
          return next;
        }
        return prev;
      });
    };

    applyUploading('a'); // 迟到的进度事件
    expect(state.find((f) => f.uid === 'a')?.status).toBe('done');

    applyUploading('b'); // 正常的进度更新
    expect(state.find((f) => f.uid === 'b')?.status).toBe('uploading');
  });
});
