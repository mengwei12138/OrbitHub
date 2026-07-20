import { describe, expect, it } from 'vitest';

import type { UploadedMediaFile } from '../../types/media';
import {
  collectDoneCozeFileIds,
  collectDonePreviewUrls,
  getMaterialBlockReason,
  hasDoneMedia,
} from '../mediaFiles';

describe('mediaFiles', () => {
  const doneFile: UploadedMediaFile = {
    uid: '1',
    name: 'test.jpg',
    status: 'done',
    previewUrl: '/api/v1/media/1/preview',
  };

  it('collectDonePreviewUrls 仅收集已完成项', () => {
    const urls = collectDonePreviewUrls([
      doneFile,
      { uid: '2', name: 'pending.jpg', status: 'uploading' },
    ]);
    expect(urls).toHaveLength(1);
    expect(urls[0]).toContain('/api/v1/media/1/preview');
  });

  it('hasDoneMedia 判断是否有可用素材', () => {
    expect(hasDoneMedia([doneFile])).toBe(true);
    expect(
      hasDoneMedia([{ uid: '2', name: 'pending.jpg', status: 'uploading' }]),
    ).toBe(false);
  });

  it('仅有 mediaAssetId 的 done 项也算可用', () => {
    expect(
      hasDoneMedia([
        { uid: '3', name: 'a.jpg', status: 'done', mediaAssetId: '42' },
      ]),
    ).toBe(true);
    expect(
      collectDonePreviewUrls([
        { uid: '3', name: 'a.jpg', status: 'done', mediaAssetId: '42' },
      ]),
    ).toEqual([expect.stringContaining('/api/v1/media/42/preview')]);
  });

  it('getMaterialBlockReason 上传中优先提示等待', () => {
    expect(
      getMaterialBlockReason(
        [{ uid: '1', name: 'a.jpg', status: 'uploading' }],
        [],
        true,
      ),
    ).toBe('素材仍在上传中，请稍候再试');
  });

  it('getMaterialBlockReason 有列表但未完成时提示未完成', () => {
    expect(
      getMaterialBlockReason(
        [{ uid: '1', name: 'a.jpg', status: 'error' }],
        [],
        true,
      ),
    ).toBe('素材尚未上传完成，请等待上传结束后再试');
  });

  it('collectDoneCozeFileIds 收集 done 状态且 cozeFileId 非空的文件', () => {
    const files: UploadedMediaFile[] = [
      { uid: '1', name: 'a.jpg', status: 'done', cozeFileId: 'coze-001' },
      { uid: '2', name: 'b.jpg', status: 'done', cozeFileId: null },
      { uid: '3', name: 'c.jpg', status: 'done' }, // cozeFileId undefined
      { uid: '4', name: 'd.jpg', status: 'uploading', cozeFileId: 'coze-004' },
      { uid: '5', name: 'e.jpg', status: 'done', cozeFileId: 'coze-005' },
    ];
    expect(collectDoneCozeFileIds(files)).toEqual(['coze-001', 'coze-005']);
  });

  it('collectDoneCozeFileIds 空数组返回空数组', () => {
    expect(collectDoneCozeFileIds([])).toEqual([]);
  });
});
