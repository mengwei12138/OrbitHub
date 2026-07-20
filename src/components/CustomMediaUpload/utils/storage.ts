import type { CompleteUploadPartRef } from '../types';

export type StoredProgress = {
  uploadSessionId: string;
  fileSizeBytes: string;
  totalParts: number;
  uploadedParts: CompleteUploadPartRef[];
  updatedAt: string;
};

const DB_NAME = 'custom-media-upload';
const DB_VERSION = 1;
const STORE_NAME = 'upload-progress';
/** 打开 IDB 的硬超时：blocked / 浏览器异常时兜底，避免上传流程永远 pending */
const OPEN_DB_TIMEOUT_MS = 3000;

const openDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    // 关键：onblocked 必须监听。另一个 tab 占用旧版本 DB 时浏览器只触发它，
    // 不监听会导致 promise 永久 pending，把整条上传链卡死在 customRequest 第一个 await。
    let settled = false;
    const settle = (fn: () => void) => {
      if (!settled) {
        settled = true;
        fn();
      }
    };
    request.onerror = () => settle(() => reject(request.error));
    request.onsuccess = () => settle(() => resolve(request.result));
    request.onblocked = () =>
      settle(() => reject(new Error('IndexedDB open blocked')));
    setTimeout(
      () => settle(() => reject(new Error('IndexedDB open timeout'))),
      OPEN_DB_TIMEOUT_MS,
    );

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'key' });
      }
    };
  });
};

export const createStorage = (storageType: 'indexedDB') => {
  // 关键约定：所有方法对调用方"无副作用失败"——存储异常一律 resolve（get → null，set/remove → void），
  // 绝不 reject。理由：上传成功后我们会 `await storage.remove(key)` 清理断点续传记录，
  // 如果这里 reject，async 函数 `return new Promise(...)` 的拒绝是无法被外层 try/catch 捕获的，
  // 会把已经在服务端成功的整次上传以 onError 收尾，把已 done 的文件回退成 error 态。
  // 并发上传多文件时，IndexedDB 在同一时刻有大量 readwrite 事务排队，request.onerror 偶发触发，
  // 这条路径以前就是 "5 张里 1 张失败" 的根因。
  const get = async (key: string): Promise<StoredProgress | null> => {
    if (storageType !== 'indexedDB') return null;
    try {
      const db = await openDB();
      return await new Promise<StoredProgress | null>((resolve) => {
        try {
          const transaction = db.transaction(STORE_NAME, 'readonly');
          const store = transaction.objectStore(STORE_NAME);
          const request = store.get(key);
          request.onerror = () => resolve(null);
          request.onsuccess = () => {
            const result = request.result;
            resolve(result ? result.progress : null);
          };
          transaction.onerror = () => resolve(null);
          transaction.onabort = () => resolve(null);
        } catch {
          resolve(null);
        }
      });
    } catch {
      return null;
    }
  };

  const set = async (key: string, progress: StoredProgress): Promise<void> => {
    if (storageType !== 'indexedDB') return;
    try {
      const db = await openDB();
      await new Promise<void>((resolve) => {
        try {
          const transaction = db.transaction(STORE_NAME, 'readwrite');
          const store = transaction.objectStore(STORE_NAME);
          const request = store.put({ key, progress });
          request.onerror = () => resolve();
          request.onsuccess = () => resolve();
          transaction.onerror = () => resolve();
          transaction.onabort = () => resolve();
        } catch {
          resolve();
        }
      });
    } catch {
      // 打开 DB 失败也吞掉：上传不依赖断点续传也能跑完
    }
  };

  const remove = async (key: string): Promise<void> => {
    if (storageType !== 'indexedDB') return;
    try {
      const db = await openDB();
      await new Promise<void>((resolve) => {
        try {
          const transaction = db.transaction(STORE_NAME, 'readwrite');
          const store = transaction.objectStore(STORE_NAME);
          const request = store.delete(key);
          request.onerror = () => resolve();
          request.onsuccess = () => resolve();
          transaction.onerror = () => resolve();
          transaction.onabort = () => resolve();
        } catch {
          resolve();
        }
      });
    } catch {
      // 残留记录在下次上传时会被 getSessionStatus 兜底，不影响主流程
    }
  };

  return { get, set, remove };
};

export type ProgressStorage = ReturnType<typeof createStorage>;
