import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import type { PlatformCount } from '../../AIContentPreviewModal/types';
import ContentEdit from '../index';

const buildTitleCount = (titleLen: number): PlatformCount => ({
  xiaohongshu: { current: titleLen, limit: 20 },
  douyin: { current: titleLen, limit: 20 },
});

describe('ContentEdit 标题输入框', () => {
  it('当传入 onTitleChange 时渲染主表单标题输入框', () => {
    render(
      <ContentEdit
        titleValue=""
        onTitleChange={() => {}}
        titleCount={buildTitleCount(0)}
        value=""
        onChange={() => {}}
      />,
    );
    const titleInput = screen.getByTestId('title-input') as HTMLInputElement;
    expect(titleInput).toBeInTheDocument();
    expect(titleInput.placeholder).toBe('请输入标题（必填，20字以内）');
  });

  it('未传 onTitleChange 时不渲染标题输入框（向后兼容）', () => {
    render(<ContentEdit value="" onChange={() => {}} />);
    expect(screen.queryByTestId('title-input')).not.toBeInTheDocument();
  });

  it('字数提示按统一 20 字限制展示（双平台）', () => {
    render(
      <ContentEdit
        titleValue="测试标题"
        onTitleChange={() => {}}
        titleCount={buildTitleCount(4)}
        value=""
        onChange={() => {}}
      />,
    );
    // 4 字时显示 4 / 20 for both platforms
    expect(screen.getByText(/4 \/ 20（小红书）/u)).toBeInTheDocument();
    expect(screen.getByText(/4 \/ 20（抖音）/u)).toBeInTheDocument();
  });

  it('用户输入时调用 onTitleChange', async () => {
    const onChange = vi.fn();
    render(
      <ContentEdit
        titleValue=""
        onTitleChange={onChange}
        titleCount={buildTitleCount(0)}
        value=""
        onChange={() => {}}
      />,
    );
    const titleInput = screen.getByTestId('title-input');
    await userEvent.type(titleInput, 'A');
    expect(onChange).toHaveBeenCalledWith('A');
  });
});
