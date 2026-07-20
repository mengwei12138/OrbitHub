import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import WorkFilterTabs from '../index';

describe('WorkFilterTabs', () => {
  it('渲染全部作品、视频、图文选项', () => {
    render(<WorkFilterTabs activeTab="all" onChange={vi.fn()} />);
    expect(screen.getByText('全部作品')).toBeTruthy();
    expect(screen.getByText('视频')).toBeTruthy();
    expect(screen.getByText('图文')).toBeTruthy();
  });

  it('渲染类型筛选标签', () => {
    render(<WorkFilterTabs activeTab="all" onChange={vi.fn()} />);
    expect(screen.getByText('类型筛选')).toBeTruthy();
  });

  it('渲染警告提示', () => {
    render(<WorkFilterTabs activeTab="all" onChange={vi.fn()} />);
    expect(screen.getByText(/作品保存 24 小时后自动清理/u)).toBeTruthy();
  });

  it('切换到视频触发回调', () => {
    const onChange = vi.fn();
    render(<WorkFilterTabs activeTab="all" onChange={onChange} />);
    fireEvent.click(screen.getByText('视频'));
    expect(onChange).toHaveBeenCalledWith('video');
  });

  it('切换到图文触发回调', () => {
    const onChange = vi.fn();
    render(<WorkFilterTabs activeTab="all" onChange={onChange} />);
    fireEvent.click(screen.getByText('图文'));
    expect(onChange).toHaveBeenCalledWith('image');
  });
});
