import { fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, expect, it, vi } from 'vitest';

import RepublishSettings from '../index';

const ACCOUNTS = [
  { id: '1', name: '潮流玩家', platform: '抖音', isOriginal: true },
  { id: '2', name: '时尚穿搭号', platform: '抖音' },
  { id: '3', name: '数码科技号', platform: '小红书' },
];

describe('RepublishSettings', () => {
  it('选中目标账号默认包含原账号时允许勾选删除原内容', () => {
    render(
      <RepublishSettings
        contentId="1001"
        aiOptimizeApplied
        accounts={ACCOUNTS}
      />,
    );
    const checkbox = screen.getByRole('checkbox') as HTMLInputElement;
    expect(checkbox).not.toBeDisabled();
  });

  it('未选中原账号时删除原内容复选框置灰', () => {
    render(
      <RepublishSettings
        contentId="1001"
        aiOptimizeApplied
        accounts={ACCOUNTS}
        initialSelectedAccountIds={['2']}
      />,
    );
    const checkbox = screen.getByRole('checkbox') as HTMLInputElement;
    expect(checkbox).toBeDisabled();
  });

  it('点击「确认重发布」触发 onSubmit 并携带正确参数', () => {
    const onSubmit = vi.fn();
    render(
      <RepublishSettings
        contentId="1001"
        accounts={ACCOUNTS}
        initialSelectedAccountIds={['1', '3']}
        onSubmit={onSubmit}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: '确认重发布' }));
    expect(onSubmit).toHaveBeenCalledWith({
      contentId: '1001',
      targetAccountIds: ['1', '3'],
      deleteOriginal: false,
    });
  });

  it('未提供 contentId 时确认按钮禁用', () => {
    render(<RepublishSettings accounts={ACCOUNTS} />);
    expect(screen.getByRole('button', { name: '确认重发布' })).toBeDisabled();
  });

  it('loading 时按钮显示「提交中…」', () => {
    render(<RepublishSettings contentId="1001" accounts={ACCOUNTS} loading />);
    expect(screen.getByText('提交中…')).toBeInTheDocument();
  });
});
