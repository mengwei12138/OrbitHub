import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { Avatar } from '../index';
import { AvatarPickerModal } from '../index';

describe('AvatarPickerModal', () => {
  const mockAvatars: Avatar[] = [
    {
      assetId: 'asset-001',
      imageUrl: 'https://example.com/a.png',
      sortOrder: 1,
    },
    {
      assetId: 'asset-002',
      imageUrl: 'https://example.com/b.png',
      sortOrder: 2,
    },
  ];

  const defaultProps = {
    visible: true,
    avatars: mockAvatars,
    selectedAvatarId: undefined,
    onSelect: vi.fn(),
    onCancel: vi.fn(),
    onConfirm: vi.fn(),
  };

  it('visible 为 false 时不渲染', () => {
    const { container } = render(
      <AvatarPickerModal {...defaultProps} visible={false} />,
    );
    expect(container.firstChild).toBeNull();
  });

  it('visible 为 true 时渲染虚拟人物库标题', () => {
    render(<AvatarPickerModal {...defaultProps} />);
    expect(screen.getByText('虚拟人物库')).toBeTruthy();
  });

  it('按 imageUrl 渲染虚拟人物缩略图', () => {
    render(<AvatarPickerModal {...defaultProps} />);
    const imgs = document.querySelectorAll('img');
    expect(imgs).toHaveLength(mockAvatars.length);
    expect(imgs[0].getAttribute('src')).toBe(mockAvatars[0].imageUrl);
    expect(imgs[1].getAttribute('src')).toBe(mockAvatars[1].imageUrl);
  });

  it('渲染虚拟人物数量', () => {
    render(<AvatarPickerModal {...defaultProps} />);
    expect(screen.getByText(/共 2 位虚拟人物/u)).toBeTruthy();
  });

  it('点击人物卡片触发 onSelect', () => {
    const onSelect = vi.fn();
    render(<AvatarPickerModal {...defaultProps} onSelect={onSelect} />);
    const firstImg = document.querySelectorAll('img')[0] as HTMLImageElement;
    firstImg.click();
    expect(onSelect).toHaveBeenCalledWith(mockAvatars[0]);
  });

  it('未选中时确认按钮 disabled', () => {
    render(<AvatarPickerModal {...defaultProps} />);
    const confirmBtn = screen.getByText('确认选择').closest('button');
    expect(confirmBtn).toBeDisabled();
  });

  it('已选中时确认按钮可用且触发 onConfirm', () => {
    const onConfirm = vi.fn();
    render(
      <AvatarPickerModal
        {...defaultProps}
        selectedAvatarId="asset-001"
        onConfirm={onConfirm}
      />,
    );
    const confirmBtn = screen.getByRole('button', { name: '确认选择' });
    expect(confirmBtn).not.toBeDisabled();
    confirmBtn.click();
    expect(onConfirm).toHaveBeenCalled();
  });

  it('点击取消按钮触发 onCancel', () => {
    const onCancel = vi.fn();
    render(<AvatarPickerModal {...defaultProps} onCancel={onCancel} />);
    screen.getByText('取消').click();
    expect(onCancel).toHaveBeenCalled();
  });

  it('点击关闭按钮触发 onCancel', () => {
    const onCancel = vi.fn();
    render(<AvatarPickerModal {...defaultProps} onCancel={onCancel} />);
    screen.getByText('✕').click();
    expect(onCancel).toHaveBeenCalled();
  });

  it('loading 时展示加载中文案', () => {
    render(<AvatarPickerModal {...defaultProps} avatars={[]} loading />);
    expect(screen.getByText('加载中…')).toBeTruthy();
  });

  it('空数据时展示暂无素材文案', () => {
    render(<AvatarPickerModal {...defaultProps} avatars={[]} />);
    expect(screen.getByText('暂无虚拟人物素材')).toBeTruthy();
  });

  it('error 时展示错误文案', () => {
    render(
      <AvatarPickerModal
        {...defaultProps}
        avatars={[]}
        error="network error"
      />,
    );
    expect(screen.getByText(/加载失败：network error/u)).toBeTruthy();
  });
});
