import { describe, expect, it } from 'vitest';

import { canAcceptMoreUpload, trimToMaxCount } from '../mediaUploadLimits';

describe('mediaUploadLimits', () => {
  it('已满时拒绝新 uid', () => {
    const prev = Array.from({ length: 9 }, (_, i) => ({
      uid: String(i),
      name: 'a.jpg',
      status: 'done' as const,
    }));
    expect(canAcceptMoreUpload(prev, 'new', 9)).toBe(false);
    expect(canAcceptMoreUpload(prev, '0', 9)).toBe(true);
  });

  it('trimToMaxCount 截断超出项', () => {
    const files = Array.from({ length: 11 }, (_, i) => ({
      uid: String(i),
      name: 'a.jpg',
      status: 'done' as const,
    }));
    expect(trimToMaxCount(files, 9)).toHaveLength(9);
  });
});
