import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';

import MenuAccess from '../index';

vi.mock('@/components/Access', () => ({
  default: vi.fn(({ path, children, fallback }) => {
    if (path === 'admin') return <>{children}</>;
    return <>{fallback}</>;
  }),
}));

vi.mock('@/hooks/useAccess', () => ({
  default: vi.fn(() => false),
}));

describe('MenuAccess', () => {
  it('渲染 children', () => {
    const { container } = render(
      <MemoryRouter>
        <MenuAccess access="admin">有权限</MenuAccess>
      </MemoryRouter>,
    );
    expect(container.textContent).toBe('有权限');
  });
});
