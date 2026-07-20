import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { CopyTypeSection } from '../index';

describe('CopyTypeSection', () => {
  const mockProps = {
    copyType: '小红书笔记' as const,
    useCase: '小红书 / 抖音推文' as const,
    customCopyType: '',
    customUseCase: '',
    onCopyTypeChange: vi.fn(),
    onCustomCopyTypeChange: vi.fn(),
    onUseCaseChange: vi.fn(),
    onCustomUseCaseChange: vi.fn(),
  };

  it('渲染卡片标题', () => {
    render(<CopyTypeSection {...mockProps} />);
    expect(screen.getByText('文案类型与使用场景')).toBeTruthy();
  });

  it('渲染文案类型选项（中文 value）', () => {
    render(<CopyTypeSection {...mockProps} />);
    expect(screen.getByText('宣传文案')).toBeTruthy();
    expect(screen.getByText('小红书笔记')).toBeTruthy();
    expect(screen.getByText('产品详情页')).toBeTruthy();
    expect(screen.getByText('自定义类型')).toBeTruthy();
  });

  it('渲染使用场景选项', () => {
    render(<CopyTypeSection {...mockProps} />);
    expect(screen.getByText('（必选）')).toBeTruthy();
    expect(screen.getByText('小红书 / 抖音推文')).toBeTruthy();
    expect(screen.getByText('电商产品详情图')).toBeTruthy();
  });

  it('点击文案类型触发回调（中文字面值）', () => {
    render(<CopyTypeSection {...mockProps} />);
    fireEvent.click(screen.getByText('宣传文案'));
    expect(mockProps.onCopyTypeChange).toHaveBeenCalledWith('宣传文案');
  });

  it('点击使用场景触发回调（中文字面值）', () => {
    render(<CopyTypeSection {...mockProps} />);
    fireEvent.click(screen.getByText('电商产品详情图'));
    expect(mockProps.onUseCaseChange).toHaveBeenCalledWith('电商产品详情图');
  });

  it('非自定义类型时不显示自定义输入框', () => {
    render(<CopyTypeSection {...mockProps} />);
    expect(screen.queryByPlaceholderText('请输入自定义类型')).toBeNull();
  });

  it('选中自定义类型时显示输入框', () => {
    render(<CopyTypeSection {...mockProps} copyType="自定义类型" />);
    expect(screen.getByPlaceholderText('请输入自定义类型')).toBeTruthy();
  });

  it('输入自定义类型触发回调', () => {
    const props = { ...mockProps, copyType: '自定义类型' as const };
    render(<CopyTypeSection {...props} />);
    fireEvent.change(screen.getByPlaceholderText('请输入自定义类型'), {
      target: { value: '夸张风' },
    });
    expect(props.onCustomCopyTypeChange).toHaveBeenCalledWith('夸张风');
  });

  it('非「其他场景」时不显示自定义场景输入框', () => {
    render(<CopyTypeSection {...mockProps} />);
    expect(screen.queryByPlaceholderText('请输入自定义使用场景')).toBeNull();
  });

  it('选中「其他场景」时显示输入框且 maxLength=20', () => {
    render(<CopyTypeSection {...mockProps} useCase="其他场景" />);
    const input = screen.getByPlaceholderText(
      '请输入自定义使用场景',
    ) as HTMLInputElement;
    expect(input).toBeTruthy();
    expect(input.maxLength).toBe(20);
  });

  it('输入自定义场景触发回调', () => {
    const props = { ...mockProps, useCase: '其他场景' as const };
    render(<CopyTypeSection {...props} />);
    fireEvent.change(screen.getByPlaceholderText('请输入自定义使用场景'), {
      target: { value: '春节落地页' },
    });
    expect(props.onCustomUseCaseChange).toHaveBeenCalledWith('春节落地页');
  });
});
