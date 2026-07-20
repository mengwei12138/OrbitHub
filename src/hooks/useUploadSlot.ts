import { useCallback, useRef } from 'react';

/** 限制并行上传数，超出部分在队列中等待 */
export function useUploadSlot(maxConcurrent = 3) {
  const activeRef = useRef(0);
  const queueRef = useRef<Array<() => void>>([]);

  const acquire = useCallback((): Promise<void> => {
    if (activeRef.current < maxConcurrent) {
      activeRef.current += 1;
      return Promise.resolve();
    }
    return new Promise<void>((resolve) => {
      queueRef.current.push(() => {
        activeRef.current += 1;
        resolve();
      });
    });
  }, [maxConcurrent]);

  const release = useCallback(() => {
    activeRef.current = Math.max(0, activeRef.current - 1);
    const next = queueRef.current.shift();
    if (next) next();
  }, []);

  return { acquire, release };
}
