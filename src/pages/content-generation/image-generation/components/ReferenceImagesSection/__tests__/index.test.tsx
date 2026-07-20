import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import type { UploadController } from '@/components/CustomMediaUpload';
import { ReferenceImagesSection } from '../index';

// 把 UploadZoneImage 桩成可观测 props 的轻量替身，避免依赖完整上传链路
vi.mock('../../../../video-generation/components/UploadZoneImage', () => ({
  UploadZoneImage: (props: Record<string, unknown>) => (
    <div
      data-testid="upload-zone-image"
      data-max-count={String(props.maxCount)}
      data-value-count={String(
        Array.isArray(props.value) ? props.value.length : 0,
      )}
    />
  ),
}));

const stubController = {} as UploadController;

describe('ReferenceImagesSection', () => {
  it('渲染卡片标题并标记为可选', () => {
    render(
      <ReferenceImagesSection
        uploadController={stubController}
        referenceImages={[]}
        onReferenceImagesChange={vi.fn()}
      />,
    );
    expect(screen.getByText('参考图片')).toBeTruthy();
    expect(screen.getByText('（可选）')).toBeTruthy();
  });

  it('把 uploadController 与 maxCount=1 透传给 UploadZoneImage', () => {
    render(
      <ReferenceImagesSection
        uploadController={stubController}
        referenceImages={[]}
        onReferenceImagesChange={vi.fn()}
      />,
    );
    const zone = screen.getByTestId('upload-zone-image');
    expect(zone.getAttribute('data-max-count')).toBe('1');
  });

  it('把 value 数组透传给 UploadZoneImage', () => {
    render(
      <ReferenceImagesSection
        uploadController={stubController}
        referenceImages={[]}
        onReferenceImagesChange={vi.fn()}
      />,
    );
    expect(
      screen.getByTestId('upload-zone-image').getAttribute('data-value-count'),
    ).toBe('0');
  });
});
