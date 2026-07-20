import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { UploadZoneImage } from '../index';

vi.mock('@/hooks/useAuthenticatedMediaPreview', () => ({
  useAuthenticatedMediaPreview: () => ({
    displayUrl: 'blob:mock-preview',
    failed: false,
  }),
}));

describe('UploadZoneImage', () => {
  it('渲染上传区域文本', () => {
    render(<UploadZoneImage />);
    expect(screen.getByText('点击或拖拽上传图片')).toBeTruthy();
    expect(screen.getByText('JPG / PNG · 最多 9 张')).toBeTruthy();
  });

  it('接受 className prop', () => {
    const { container } = render(<UploadZoneImage className="custom-class" />);
    expect(container.querySelector('.custom-class')).toBeTruthy();
  });

  it('有已上传项时展示缩略图网格', () => {
    render(
      <UploadZoneImage
        value={[
          {
            uid: '1',
            name: 'a.png',
            status: 'done',
            previewUrl: '/api/v1/media/1/preview',
          },
        ]}
        uploadController={{} as never}
        onChange={() => {}}
      />,
    );
    expect(screen.getByText(/已上传 1 张/u)).toBeTruthy();
    expect(screen.getByText('添加')).toBeTruthy();
  });
});
