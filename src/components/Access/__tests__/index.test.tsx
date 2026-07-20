import { render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import Access from '../index';

vi.mock('@/hooks/useAccess', () => ({
  default: vi.fn((path: string) => path === 'admin'),
}));

describe('Access', () => {
  it('有权限时渲染 children', () => {
    const { container } = render(<Access path="admin">有权限</Access>);
    expect(container.textContent).toBe('有权限');
  });

  it('无权限时渲染 fallback', () => {
    const { container } = render(
      <Access path="user" fallback={<span>无权限</span>}>
        有权限
      </Access>,
    );
    expect(container.textContent).toBe('无权限');
  });

  it('无权限且无 fallback 时渲染 null', () => {
    const { container } = render(<Access path="user">有权限</Access>);
    expect(container.textContent).toBe('');
  });
});
