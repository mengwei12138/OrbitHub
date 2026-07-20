import { describe, expect, it } from 'vitest';

import { hasUploadStarted } from '../useUploadWatchdog';

describe('useUploadWatchdog helpers', () => {
  it('排队中的文件 percent 为 undefined，不算已开传', () => {
    expect(
      hasUploadStarted({
        uid: '1',
        name: 'a.jpg',
        status: 'uploading',
      }),
    ).toBe(false);
  });

  it('customRequest onProgress 后 percent 有值，算已开传', () => {
    expect(
      hasUploadStarted({
        uid: '1',
        name: 'a.jpg',
        status: 'uploading',
        percent: 0,
      }),
    ).toBe(true);
  });
});
