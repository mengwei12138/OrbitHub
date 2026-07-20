import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { ToneStyle, WordLimit } from '../../../types';
import { StyleConfigSection } from '../index';

describe('StyleConfigSection', () => {
  const mockProps = {
    toneStyle: '亲切' as ToneStyle,
    customToneStyle: '',
    wordLimit: 100 as WordLimit,
    customWordLimit: '',
    prohibitedWords: '',
    onToneStyleChange: vi.fn(),
    onCustomToneStyleChange: vi.fn(),
    onWordLimitChange: vi.fn(),
    onCustomWordLimitChange: vi.fn(),
    onProhibitedWordsChange: vi.fn(),
  };

  it('渲染卡片标题', () => {
    render(<StyleConfigSection {...mockProps} />);
    expect(screen.getByText('内容与风格')).toBeTruthy();
  });

  it('渲染语气风格选项（中文 value）', () => {
    render(<StyleConfigSection {...mockProps} />);
    expect(screen.getByText('正式')).toBeTruthy();
    expect(screen.getByText('幽默')).toBeTruthy();
    expect(screen.getByText('亲切')).toBeTruthy();
    expect(screen.getByText('自定义风格')).toBeTruthy();
  });

  it('渲染字数限制选项', () => {
    render(<StyleConfigSection {...mockProps} />);
    expect(screen.getByText('50 字以内')).toBeTruthy();
    expect(screen.getByText('100 字以内')).toBeTruthy();
    expect(screen.getByText('自定义')).toBeTruthy();
  });

  it('点击语气风格触发回调（中文字面值）', () => {
    render(<StyleConfigSection {...mockProps} />);
    fireEvent.click(screen.getByText('正式'));
    expect(mockProps.onToneStyleChange).toHaveBeenCalledWith('正式');
  });

  it('点击字数限制触发回调', () => {
    render(<StyleConfigSection {...mockProps} />);
    fireEvent.click(screen.getByText('50 字以内'));
    expect(mockProps.onWordLimitChange).toHaveBeenCalledWith(50);
  });

  it('输入违禁词触发回调', () => {
    render(<StyleConfigSection {...mockProps} />);
    const textarea = document.querySelector('textarea');
    if (textarea) {
      fireEvent.change(textarea, { target: { value: '违禁词1,违禁词2' } });
      expect(mockProps.onProhibitedWordsChange).toHaveBeenCalledWith(
        '违禁词1,违禁词2',
      );
    }
  });

  it('渲染违禁词输入框', () => {
    render(<StyleConfigSection {...mockProps} />);
    const textarea = document.querySelector('textarea');
    expect(textarea).toBeTruthy();
  });

  it('非自定义风格时不显示自定义输入框', () => {
    render(<StyleConfigSection {...mockProps} />);
    expect(screen.queryByPlaceholderText('请输入自定义风格')).toBeNull();
  });

  it('选中自定义风格时显示输入框', () => {
    render(<StyleConfigSection {...mockProps} toneStyle="自定义风格" />);
    expect(screen.getByPlaceholderText('请输入自定义风格')).toBeTruthy();
  });

  it('输入自定义风格触发回调', () => {
    const props = { ...mockProps, toneStyle: '自定义风格' as ToneStyle };
    render(<StyleConfigSection {...props} />);
    fireEvent.change(screen.getByPlaceholderText('请输入自定义风格'), {
      target: { value: '复古风' },
    });
    expect(props.onCustomToneStyleChange).toHaveBeenCalledWith('复古风');
  });

  it('非自定义字数时不显示字数输入框', () => {
    render(<StyleConfigSection {...mockProps} />);
    expect(screen.queryByPlaceholderText('请输入 1–500 之间的字数')).toBeNull();
  });

  it('选中自定义字数时显示输入框', () => {
    render(<StyleConfigSection {...mockProps} wordLimit={-1} />);
    expect(screen.getByPlaceholderText('请输入 1–500 之间的字数')).toBeTruthy();
  });

  it('输入自定义字数触发回调', () => {
    const props = { ...mockProps, wordLimit: -1 as WordLimit };
    render(<StyleConfigSection {...props} />);
    fireEvent.change(screen.getByPlaceholderText('请输入 1–500 之间的字数'), {
      target: { value: '200' },
    });
    expect(props.onCustomWordLimitChange).toHaveBeenCalledWith('200');
  });
});
