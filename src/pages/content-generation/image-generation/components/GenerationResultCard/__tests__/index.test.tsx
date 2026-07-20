import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { GenerationResult } from '../../../types';
import { GenerationResultCard } from '../index';

describe('GenerationResultCard', () => {
  const mockResult: GenerationResult = {
    id: '1',
    title: '测试标题',
    content: '测试内容正文',
    tags: ['#标签1', '#标签2'],
    images: [],
    createdAt: new Date(),
  };

  it('visible 为 false 时不渲染', () => {
    const { container } = render(<GenerationResultCard visible={false} />);
    expect(container.firstChild).toBeNull();
  });

  it('visible 为 true 时渲染默认内容', () => {
    render(<GenerationResultCard visible />);
    expect(screen.getByText('图文生成完成')).toBeTruthy();
    expect(screen.getByText('AI 生成结果')).toBeTruthy();
  });

  it('渲染自定义结果数据', () => {
    render(<GenerationResultCard visible result={mockResult} />);
    expect(screen.getByText('测试标题')).toBeTruthy();
    expect(screen.getByText('测试内容正文')).toBeTruthy();
  });

  it('渲染标签列表', () => {
    render(<GenerationResultCard visible result={mockResult} />);
    expect(screen.getByText('#标签1')).toBeTruthy();
    expect(screen.getByText('#标签2')).toBeTruthy();
  });

  it('渲染所有按钮', () => {
    render(<GenerationResultCard visible />);
    expect(screen.getByText('去作品管理')).toBeTruthy();
    expect(screen.getByText('重新生成')).toBeTruthy();
    expect(screen.getByText('去发布')).toBeTruthy();
    expect(screen.getByText('复制内容')).toBeTruthy();
  });

  it('关闭按钮可点击', () => {
    const onClose = vi.fn();
    render(<GenerationResultCard visible onClose={onClose} />);
    screen.getByText('✕').click();
    expect(onClose).toHaveBeenCalled();
  });

  it('去作品管理按钮可点击', () => {
    const onGoWorks = vi.fn();
    render(<GenerationResultCard visible onGoWorks={onGoWorks} />);
    screen.getByText('去作品管理').click();
    expect(onGoWorks).toHaveBeenCalled();
  });

  it('重新生成按钮可点击', () => {
    const onRegenerate = vi.fn();
    render(<GenerationResultCard visible onRegenerate={onRegenerate} />);
    screen.getByText('重新生成').click();
    expect(onRegenerate).toHaveBeenCalled();
  });

  it('去发布按钮可点击', () => {
    const onPublish = vi.fn();
    render(<GenerationResultCard visible onPublish={onPublish} />);
    screen.getByText('去发布').click();
    expect(onPublish).toHaveBeenCalled();
  });

  it('复制内容按钮可点击', () => {
    const onCopy = vi.fn();
    render(<GenerationResultCard visible onCopy={onCopy} />);
    screen.getByText('复制内容').click();
    expect(onCopy).toHaveBeenCalled();
  });
});
