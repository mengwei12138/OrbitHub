import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import BottomActionBar from '../index';

describe('BottomActionBar', () => {
  it('渲染 separator 和 actions 区域', () => {
    const { container } = render(<BottomActionBar />);
    expect(container.querySelector('[class*="separator"]')).toBeInTheDocument();
    expect(container.querySelector('[class*="actions"]')).toBeInTheDocument();
  });

  it('toolbar 为空时渲染默认确认按钮', () => {
    render(<BottomActionBar />);
    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(1);
    expect(screen.getByText('确认发布')).toBeInTheDocument();
  });

  it('正确渲染 toolbar 内容', () => {
    render(
      <BottomActionBar
        toolbar={
          <>
            <button>取消</button>
            <button>确认</button>
          </>
        }
      />,
    );

    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(2);
  });

  it('点击按钮触发对应回调', () => {
    const onCancel = vi.fn();
    const onConfirm = vi.fn();

    render(
      <BottomActionBar
        toolbar={
          <>
            <button onClick={onCancel}>取消</button>
            <button onClick={onConfirm}>确认</button>
          </>
        }
      />,
    );

    const buttons = screen.getAllByRole('button');
    fireEvent.click(buttons[0]);
    expect(onCancel).toHaveBeenCalledTimes(1);

    fireEvent.click(buttons[1]);
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it('渲染自定义内容的 toolbar', () => {
    render(
      <BottomActionBar
        toolbar={
          <>
            <span>自定义内容</span>
            <button>操作按钮</button>
          </>
        }
      />,
    );

    expect(screen.getByText('自定义内容')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: '操作按钮' }),
    ).toBeInTheDocument();
  });
});
