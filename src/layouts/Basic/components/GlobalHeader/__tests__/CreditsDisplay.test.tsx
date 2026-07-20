import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/services/content-generation', () => ({
  creditsBalanceQueryOptions: () => ({
    queryKey: ['content-generation', 'credits-balance'],
    queryFn: vi.fn().mockResolvedValue({ totalPoints: 875 }),
  }),
}));

const mockSetCredits = vi.fn();

vi.mock('@/store/modules/userStore', () => ({
  useUserStore: (selector?: (s: unknown) => unknown) => {
    const state = {
      token: 'mock-token',
      userInfo: { id: '1', username: 'admin', credits: 0 },
      roles: ['ADMIN'],
      setCredits: mockSetCredits,
    };
    return selector ? selector(state) : state;
  },
}));

import { CreditsDisplay } from '../index';

function LocationProbe() {
  const location = useLocation();
  return <div data-testid="location">{location.pathname}</div>;
}

function renderCredits() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={['/']}>
        <CreditsDisplay />
        <Routes>
          <Route path="*" element={<LocationProbe />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('CreditsDisplay', () => {
  beforeEach(() => {
    mockSetCredits.mockClear();
  });

  it('应展示外部平台返回的积分余额', async () => {
    renderCredits();

    await waitFor(() => {
      expect(screen.getByText('875')).toBeTruthy();
    });
    expect(mockSetCredits).toHaveBeenCalledWith(875);
  });

  it('点击积分区域跳转到积分使用记录页', async () => {
    renderCredits();

    await waitFor(() => {
      expect(screen.getByText('875')).toBeTruthy();
    });
    fireEvent.click(screen.getByRole('button', { name: '查看积分使用记录' }));

    expect(screen.getByTestId('location').textContent).toBe('/credits-record');
  });
});
