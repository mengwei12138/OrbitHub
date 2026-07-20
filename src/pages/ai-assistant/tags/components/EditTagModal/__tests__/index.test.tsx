import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import EditTagModal from '../index';

const defaultCategoryOptions = [
  { code: 'hot', name: '热门推荐', isCustom: false },
  { code: 'content', name: '内容分类', isCustom: false },
  { code: 'emotion', name: '情感标签', isCustom: false },
];

describe('EditTagModal', () => {
  const mockRecord = {
    id: '1',
    name: 'test-tag',
    category: 'hot',
    categoryCode: 'hot',
    usageCount: 10,
    lastUsedAt: '2024-01-01',
    status: 'ENABLED' as const,
    platform: 'ALL' as const,
  };

  it('should render modal when open', () => {
    const onClose = vi.fn();
    const onSubmit = vi.fn();

    render(
      <EditTagModal
        open
        onClose={onClose}
        onSubmit={onSubmit}
        record={mockRecord}
        categoryOptions={defaultCategoryOptions}
      />,
    );

    expect(screen.getByText('编辑标签')).toBeDefined();
    expect(screen.getByText('分类')).toBeDefined();
    expect(screen.getByText('适用平台')).toBeDefined();
    expect(screen.getByText('标签名称')).toBeDefined();
  });

  it('should not render when closed', () => {
    const onClose = vi.fn();
    const onSubmit = vi.fn();

    render(
      <EditTagModal
        open={false}
        onClose={onClose}
        onSubmit={onSubmit}
        record={mockRecord}
        categoryOptions={defaultCategoryOptions}
      />,
    );

    expect(screen.queryByText('编辑标签')).toBeNull();
  });

  it('should call onClose when canceled', async () => {
    const onClose = vi.fn();
    const onSubmit = vi.fn();

    render(
      <EditTagModal
        open
        onClose={onClose}
        onSubmit={onSubmit}
        record={mockRecord}
        categoryOptions={defaultCategoryOptions}
      />,
    );

    const cancelBtn = screen.getByText('取 消');
    await userEvent.click(cancelBtn);

    expect(onClose).toHaveBeenCalled();
  });
});
