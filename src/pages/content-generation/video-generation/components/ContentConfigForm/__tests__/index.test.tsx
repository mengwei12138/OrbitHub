import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { Avatar } from '../index';
import { ContentConfigForm } from '../index';

describe('ContentConfigForm', () => {
  const mockAvatar: Avatar = {
    assetId: 'asset-test-001',
    imageUrl: 'https://example.com/avatar.png',
    sortOrder: 1,
  };

  const defaultProps = {
    trialRemaining: 3,
    trialTotal: 3,
    generationMode: 'standard' as const,
    onModeChange: vi.fn(),
    selectedAvatar: undefined,
    prompt: '',
    promptMaxLength: 1000,
    videoLength: 10 as const,
    resolution: '720P' as const,
    isTrialMode: false,
    onAvatarChange: vi.fn(),
    onAvatarRemove: vi.fn(),
    onPromptChange: vi.fn(),
    onAIPolish: vi.fn(),
    onVideoLengthChange: vi.fn(),
    onResolutionChange: vi.fn(),
  };

  it('渲染模式 Tab 栏', () => {
    render(<ContentConfigForm {...defaultProps} />);
    expect(screen.getByRole('tab', { name: '免费试用' })).toBeTruthy();
    expect(screen.getByRole('tab', { name: '标准质量' })).toBeTruthy();
  });

  it('未选择虚拟人物时显示点击选择', () => {
    render(<ContentConfigForm {...defaultProps} />);
    expect(screen.getByText('点击选择')).toBeTruthy();
  });

  it('已选择虚拟人物时显示人物信息', () => {
    render(<ContentConfigForm {...defaultProps} selectedAvatar={mockAvatar} />);
    expect(screen.getByText(/已选虚拟人物/u)).toBeTruthy();
    expect(screen.getByText(/点击更换/u)).toBeTruthy();
    expect(screen.getByText(/移除/u)).toBeTruthy();
  });

  it('点击选择虚拟人物触发回调', () => {
    render(<ContentConfigForm {...defaultProps} />);
    fireEvent.click(screen.getByText('点击选择'));
    expect(defaultProps.onAvatarChange).toHaveBeenCalled();
  });

  it('点击移除虚拟人物触发回调', () => {
    render(<ContentConfigForm {...defaultProps} selectedAvatar={mockAvatar} />);
    fireEvent.click(screen.getByText('移除'));
    expect(defaultProps.onAvatarRemove).toHaveBeenCalled();
  });

  it('渲染描述提示词输入框', () => {
    render(<ContentConfigForm {...defaultProps} />);
    const textarea = document.querySelector('textarea');
    expect(textarea).toBeTruthy();
  });

  it('输入描述触发回调', () => {
    render(<ContentConfigForm {...defaultProps} />);
    const textarea = document.querySelector('textarea');
    if (textarea) {
      fireEvent.change(textarea, { target: { value: '测试描述' } });
      expect(defaultProps.onPromptChange).toHaveBeenCalledWith('测试描述');
    }
  });

  it('展示 AI 生成标记位置并支持切换', () => {
    const onAIGeneratedMarkPositionChange = vi.fn();
    render(
      <ContentConfigForm
        {...{
          ...defaultProps,
          aiGeneratedMarkPosition: 'bottom-left' as const,
          onAIGeneratedMarkPositionChange,
        }}
      />,
    );

    const select = screen.getByLabelText('AI生成标记位置');
    expect(select).toHaveValue('bottom-left');
    expect(screen.getByRole('option', { name: '左下' })).toBeTruthy();
    expect(screen.getByRole('option', { name: '中下' })).toBeTruthy();
    expect(screen.getByRole('option', { name: '右下' })).toBeTruthy();

    fireEvent.change(select, { target: { value: 'bottom-center' } });
    expect(onAIGeneratedMarkPositionChange).toHaveBeenCalledWith(
      'bottom-center',
    );
  });

  it('点击 AI 润色触发回调', () => {
    render(<ContentConfigForm {...defaultProps} />);
    fireEvent.click(screen.getByText('AI 润色'));
    expect(defaultProps.onAIPolish).toHaveBeenCalled();
  });

  it('isPolishing=true 时按钮 disabled 且文案变为「AI 润色中…」', () => {
    const onAIPolish = vi.fn();
    render(
      <ContentConfigForm
        {...defaultProps}
        isPolishing
        onAIPolish={onAIPolish}
      />,
    );
    const btn = screen.getByText('AI 润色中…').closest('button');
    expect(btn).toBeDisabled();
    if (btn) fireEvent.click(btn);
    // disabled 按钮点击不应触发回调
    expect(onAIPolish).not.toHaveBeenCalled();
  });

  it('试用模式下不渲染 AI 润色按钮', () => {
    render(
      <ContentConfigForm
        {...defaultProps}
        isTrialMode
        generationMode="trial"
      />,
    );
    expect(screen.queryByText('AI 润色')).toBeNull();
    expect(screen.queryByText('AI 润色中…')).toBeNull();
  });

  it('渲染视频长度选项', () => {
    render(<ContentConfigForm {...defaultProps} />);
    expect(screen.getByText('5 秒')).toBeTruthy();
    expect(screen.getByText('10 秒')).toBeTruthy();
  });

  it('点击视频长度触发回调', () => {
    render(<ContentConfigForm {...defaultProps} />);
    fireEvent.click(screen.getByText('5 秒'));
    expect(defaultProps.onVideoLengthChange).toHaveBeenCalledWith(5);
  });

  it('高级质量渲染 720P 与 1080P', () => {
    render(<ContentConfigForm {...defaultProps} generationMode="premium" />);
    expect(screen.getByText('720P')).toBeTruthy();
    expect(screen.getByText('1080P')).toBeTruthy();
  });

  it('标准质量仅展示 720P', () => {
    render(<ContentConfigForm {...defaultProps} generationMode="standard" />);
    expect(screen.getByText('720P')).toBeTruthy();
    expect(screen.queryByText('1080P')).toBeNull();
  });

  it('试用模式仅展示 720P', () => {
    render(
      <ContentConfigForm
        {...defaultProps}
        isTrialMode
        generationMode="trial"
      />,
    );
    expect(screen.getByText('720P')).toBeTruthy();
    expect(screen.queryByText('1080P')).toBeNull();
  });

  it('点击清晰度触发回调（高级质量下 1080P 可点）', () => {
    render(<ContentConfigForm {...defaultProps} generationMode="premium" />);
    fireEvent.click(screen.getByText('1080P'));
    expect(defaultProps.onResolutionChange).toHaveBeenCalledWith('1080P');
  });

  it('试用模式下禁用选择虚拟人物', () => {
    render(<ContentConfigForm {...defaultProps} isTrialMode />);
    const selectBtn = screen.getByText('点击选择').closest('button');
    expect(selectBtn).toBeDisabled();
    expect(screen.getByText('试用版暂不支持虚拟人物')).toBeTruthy();
  });

  it('已选虚拟人物展示积分加价文案', () => {
    render(<ContentConfigForm {...defaultProps} selectedAvatar={mockAvatar} />);
    expect(screen.getByText('虚拟人物 · +100 积分')).toBeTruthy();
    expect(screen.queryByText('试用版暂不支持虚拟人物')).toBeNull();
  });
});
