import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import TableEmpty from '../index';

describe('TableEmpty 组件单元测试', () => {
  it('默认渲染', () => {
    render(<TableEmpty />);
    expect(screen.getByText('没有找到匹配的账号')).toBeInTheDocument();
    expect(screen.getByText('请调整筛选条件后重试')).toBeInTheDocument();
  });

  it('自定义 title 和 description', () => {
    render(<TableEmpty title="自定义标题" description="自定义描述" />);
    expect(screen.getByText('自定义标题')).toBeInTheDocument();
    expect(screen.getByText('自定义描述')).toBeInTheDocument();
  });

  it('没有 onReset 时不显示重置按钮', () => {
    render(<TableEmpty />);
    expect(screen.queryByText('重置筛选')).not.toBeInTheDocument();
  });

  it('onReset 回调正常触发', async () => {
    const user = userEvent.setup();
    const onReset = vi.fn();
    render(<TableEmpty onReset={onReset} />);
    await user.click(screen.getByText('重置筛选'));
    expect(onReset).toHaveBeenCalledTimes(1);
  });

  it('onReset 回调正常触发 - 多重触发', async () => {
    const user = userEvent.setup();
    const onReset = vi.fn();
    render(<TableEmpty onReset={onReset} />);
    await user.click(screen.getByText('重置筛选'));
    await user.click(screen.getByText('重置筛选'));
    expect(onReset).toHaveBeenCalledTimes(2);
  });
});
