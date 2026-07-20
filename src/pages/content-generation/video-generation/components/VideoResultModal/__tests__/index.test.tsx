import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { VideoResult } from '../index';
import { VideoResultModal } from '../index';

describe('VideoResultModal', () => {
  const mockResult: VideoResult = {
    title: '测试视频标题',
    duration: 10,
    resolution: '1080P',
    quality: '标准质量',
    credits: 100,
  };

  const defaultProps = {
    visible: true,
    result: mockResult,
    onClose: vi.fn(),
    onGoWorks: vi.fn(),
    onRegenerate: vi.fn(),
    onPublish: vi.fn(),
    onDownload: vi.fn(),
  };

  it('visible 为 false 时不渲染', () => {
    const { container } = render(
      <VideoResultModal {...defaultProps} visible={false} />,
    );
    expect(container.firstChild).toBeNull();
  });

  it('visible 为 true 时渲染视频生成完成', () => {
    render(<VideoResultModal {...defaultProps} />);
    expect(screen.getByText('视频生成完成')).toBeTruthy();
  });

  it('渲染视频元数据', () => {
    render(<VideoResultModal {...defaultProps} />);
    expect(screen.getByText('测试视频标题')).toBeTruthy();
    expect(screen.getByText(/10秒/u)).toBeTruthy();
    expect(screen.getAllByText(/1080P/u).length).toBeGreaterThan(0);
  });

  it('渲染播放按钮', () => {
    render(<VideoResultModal {...defaultProps} />);
    const playBtn = document.querySelector('[class*="play"]');
    expect(playBtn).toBeTruthy();
  });

  it('渲染所有按钮', () => {
    render(<VideoResultModal {...defaultProps} />);
    expect(screen.getByText('去作品管理')).toBeTruthy();
    expect(screen.getByText('重新生成')).toBeTruthy();
    expect(screen.getByText('去发布')).toBeTruthy();
    expect(screen.getByText('下载视频')).toBeTruthy();
  });

  it('去作品管理按钮可点击', () => {
    render(<VideoResultModal {...defaultProps} />);
    screen.getByText('去作品管理').click();
    expect(defaultProps.onGoWorks).toHaveBeenCalled();
  });

  it('重新生成按钮可点击', () => {
    render(<VideoResultModal {...defaultProps} />);
    screen.getByText('重新生成').click();
    expect(defaultProps.onRegenerate).toHaveBeenCalled();
  });

  it('去发布按钮可点击', () => {
    render(<VideoResultModal {...defaultProps} />);
    screen.getByText('去发布').click();
    expect(defaultProps.onPublish).toHaveBeenCalled();
  });

  it('下载视频按钮可点击', () => {
    render(<VideoResultModal {...defaultProps} />);
    screen.getByText('下载视频').click();
    expect(defaultProps.onDownload).toHaveBeenCalled();
  });

  it('关闭按钮可点击', () => {
    render(<VideoResultModal {...defaultProps} />);
    screen.getByText('✕').click();
    expect(defaultProps.onClose).toHaveBeenCalled();
  });
});
