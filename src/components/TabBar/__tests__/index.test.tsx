import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import TabBar from '../index';

describe('TabBar 组件', () => {
  it('渲染所有 Tab 项', () => {
    const tabs = [
      { key: 'video', name: '视频发布' },
      { key: 'image', name: '图文发布' },
    ];
    render(<TabBar tabs={tabs} activeTab="video" onChange={vi.fn()} />);

    expect(screen.getByText('视频发布')).toBeInTheDocument();
    expect(screen.getByText('图文发布')).toBeInTheDocument();
  });

  it('点击切换调用 onChange', () => {
    const tabs = [
      { key: 'video', name: '视频发布' },
      { key: 'image', name: '图文发布' },
    ];
    const handleChange = vi.fn();
    render(<TabBar tabs={tabs} activeTab="video" onChange={handleChange} />);

    fireEvent.click(screen.getByText('图文发布'));
    expect(handleChange).toHaveBeenCalledWith('image');
  });

  it('点击当前 Tab 不触发 onChange', () => {
    const tabs = [
      { key: 'video', name: '视频发布' },
      { key: 'image', name: '图文发布' },
    ];
    const handleChange = vi.fn();
    render(<TabBar tabs={tabs} activeTab="video" onChange={handleChange} />);

    fireEvent.click(screen.getByText('视频发布'));
    expect(handleChange).not.toHaveBeenCalled();
  });

  it('onChange 回调参数为 Tab key', () => {
    const tabs = [
      { key: 'tab1', name: 'Tab 1' },
      { key: 'tab2', name: 'Tab 2' },
    ];
    const handleChange = vi.fn();
    render(<TabBar tabs={tabs} activeTab="tab1" onChange={handleChange} />);

    fireEvent.click(screen.getByText('Tab 2'));
    expect(handleChange).toHaveBeenCalledWith('tab2');
  });
});
