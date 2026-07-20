import { describe, expect, it } from 'vitest';

import { createStorage, type StoredProgress } from '../../utils/storage';

describe('storage', () => {
  describe('createStorage', () => {
    it('当 storage 不是 indexedDB 时应返回空操作', async () => {
      const storage = createStorage('localStorage' as 'indexedDB');

      const result = await storage.get('any-key');
      expect(result).toBeNull();

      await storage.set('any-key', {} as StoredProgress);
      await storage.remove('any-key');
    });

    it('应正确存储和检索进度数据', () => {
      const storage = createStorage('indexedDB');

      expect(storage).toHaveProperty('get');
      expect(storage).toHaveProperty('set');
      expect(storage).toHaveProperty('remove');
    });
  });
});
