import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { UploadZoneVideo } from '../index';

vi.mock('@/hooks/useAuthenticatedMediaPreview', () => ({
  useAuthenticatedMediaPreview: () => ({
    displayUrl: 'blob:mock-video',
    failed: false,
  }),
}));

describe('UploadZoneVideo', () => {
  it('渲染上传区域文本', () => {
    render(<UploadZoneVideo />);
    expect(screen.getByText('点击或拖拽上传视频')).toBeTruthy();
    expect(screen.getByText('MP4 · ≤15 秒 · ≤50MB · 最多 3 个')).toBeTruthy();
  });

  it('disabled 时展示试用提示且保留占位高度', () => {
    render(<UploadZoneVideo disabled />);
    expect(screen.getByText('免费试用暂不支持视频素材')).toBeTruthy();
    expect(document.querySelector('[class*="hintSlot"]')).toBeTruthy();
  });

  it('非 disabled 时试用提示占位隐藏', () => {
    render(<UploadZoneVideo disabled={false} />);
    const hint = screen.getByText('免费试用暂不支持视频素材');
    expect(hint.className).toMatch(/disabledHintHidden/u);
  });

  it('接受 className prop', () => {
    const { container } = render(<UploadZoneVideo className="custom-class" />);
    expect(container.querySelector('.custom-class')).toBeTruthy();
  });

  it('有已上传项时展示数量', () => {
    render(
      <UploadZoneVideo
        value={[
          {
            uid: '1',
            name: 'a.mp4',
            status: 'done',
            previewUrl: '/api/v1/media/2/preview',
          },
        ]}
        uploadController={{} as never}
        onChange={() => {}}
      />,
    );
    expect(screen.getByText(/已上传 1 个/u)).toBeTruthy();
  });
});
