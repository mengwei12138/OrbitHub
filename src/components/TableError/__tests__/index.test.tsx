import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import TableError from '../index';

describe('TableError 组件单元测试', () => {
  it('默认渲染', () => {
    render(<TableError />);
    expect(screen.getByText('加载失败')).toBeInTheDocument();
    expect(
      screen.getByText('网络异常或服务器错误，请稍后重试'),
    ).toBeInTheDocument();
  });

  it('自定义 title 和 description', () => {
    render(<TableError title="自定义标题" description="自定义描述" />);
    expect(screen.getByText('自定义标题')).toBeInTheDocument();
    expect(screen.getByText('自定义描述')).toBeInTheDocument();
  });

  it('没有 onRetry 时不显示重试按钮', () => {
    render(<TableError />);
    expect(screen.queryByText('重新加载')).not.toBeInTheDocument();
  });

  it('onRetry 回调正常触发', async () => {
    const user = userEvent.setup();
    const onRetry = vi.fn();
    render(<TableError onRetry={onRetry} />);
    await user.click(screen.getByText('重新加载'));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('onRetry 回调正常触发 - 多重触发', async () => {
    const user = userEvent.setup();
    const onRetry = vi.fn();
    render(<TableError onRetry={onRetry} />);
    await user.click(screen.getByText('重新加载'));
    await user.click(screen.getByText('重新加载'));
    expect(onRetry).toHaveBeenCalledTimes(2);
  });
});
