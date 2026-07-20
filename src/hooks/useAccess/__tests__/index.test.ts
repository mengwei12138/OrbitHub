import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import useAccess from '../index';

vi.mock('@/access', () => ({
  default: vi.fn((code: string) => code === 'admin'),
}));

describe('useAccess', () => {
  it('传入 path 返回 boolean', () => {
    const { result: result1 } = renderHook(() => useAccess('admin'));
    expect(result1.current).toBe(true);

    const { result: result2 } = renderHook(() => useAccess('user'));
    expect(result2.current).toBe(false);
  });
});
