import { useEffect, useRef } from 'react';
import type { UploadedMediaFile } from '../types/media';

const STALL_TIMEOUT_MS = 60_000;
const CHECK_INTERVAL_MS = 5_000;

/** customRequest 拿到 uploadSlot 后会派发 onProgress，此前 percent 为 undefined。 */
export function hasUploadStarted(file: UploadedMediaFile): boolean {
  return file.percent !== undefined && file.percent !== null;
}

/**
 * 上传超时看门狗：检测已开传但进度长时间不推进的文件，
 * 把它们标成 'error'，避免遇到底层 part 请求 hang / 服务端无响应等异常时
 * 文件永远卡在「上传中」无法 × 删除或重试。
 *
 * 排队等 uploadSlot 的文件 percent 仍为 undefined，不参与超时判定，
 * 避免并发上传时末尾几个文件被误标为失败。
 */
export function useUploadWatchdog(
  files: UploadedMediaFile[],
  patchFiles: (
    updater: (prev: UploadedMediaFile[]) => UploadedMediaFile[],
  ) => void,
) {
  // uid → { lastPercent, lastChangedAt }
  const trackingRef = useRef<
    Map<string, { lastPercent: number; lastChangedAt: number }>
  >(new Map());

  // 每次 files 变化时刷新 tracking 表
  useEffect(() => {
    const tracking = trackingRef.current;
    const seenUids = new Set<string>();
    const now = Date.now();
    for (const file of files) {
      seenUids.add(file.uid);
      if (file.status !== 'uploading' || !hasUploadStarted(file)) {
        tracking.delete(file.uid);
        continue;
      }
      const current = file.percent ?? 0;
      const prev = tracking.get(file.uid);
      if (!prev) {
        tracking.set(file.uid, { lastPercent: current, lastChangedAt: now });
      } else if (current !== prev.lastPercent) {
        prev.lastPercent = current;
        prev.lastChangedAt = now;
      }
    }
    // 清理已经不在列表里的条目（被 × 删掉的）
    for (const uid of Array.from(tracking.keys())) {
      if (!seenUids.has(uid)) tracking.delete(uid);
    }
  }, [files]);

  // 周期巡检：把停滞超过 STALL_TIMEOUT_MS 的文件标成 error
  useEffect(() => {
    const id = window.setInterval(() => {
      const tracking = trackingRef.current;
      if (tracking.size === 0) return;
      const now = Date.now();
      const staledUids: string[] = [];
      for (const [uid, info] of tracking.entries()) {
        if (now - info.lastChangedAt > STALL_TIMEOUT_MS) {
          staledUids.push(uid);
        }
      }
      if (staledUids.length === 0) return;
      patchFiles((prev) => {
        let changed = false;
        const next = prev.map((file) => {
          if (file.status !== 'uploading') return file;
          if (!staledUids.includes(file.uid)) return file;
          changed = true;
          return {
            ...file,
            status: 'error' as const,
            error: { message: '上传超时未推进，请重试' },
          };
        });
        return changed ? next : prev;
      });
      // 已经标成 error 的不再继续监控
      for (const uid of staledUids) tracking.delete(uid);
    }, CHECK_INTERVAL_MS);
    return () => window.clearInterval(id);
  }, [patchFiles]);
}
