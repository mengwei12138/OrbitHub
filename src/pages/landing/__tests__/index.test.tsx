import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';

const navigateMock = vi.fn();
const useUserStoreMock = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>(
    'react-router-dom',
  );
  return {
    ...actual,
    useNavigate: () => navigateMock,
  };
});

vi.mock('@/store/modules/userStore', () => ({
  useUserStore: (selector: (state: { token: string | null; roles: string[] }) => unknown) =>
    selector(useUserStoreMock()),
}));

import LandingPage from '../index';

const renderPage = () =>
  render(
    <MemoryRouter>
      <LandingPage />
    </MemoryRouter>,
  );

describe('Landing 页面', () => {
  it('未登录时展示登录入口并跳转到登录页', () => {
    useUserStoreMock.mockReturnValue({ token: null, roles: [] });
    renderPage();

    expect(
      screen.getByRole('heading', {
        name: /账号矩阵驱动的\s*内容增长平台/u,
      }),
    ).toBeInTheDocument();

    fireEvent.click(screen.getAllByRole('button', { name: '登录平台' })[0]);
    expect(navigateMock).toHaveBeenCalledWith('/login');
  });

  it('已登录时点击进入工作台跳转到角色默认页', () => {
    useUserStoreMock.mockReturnValue({
      token: 'token',
      roles: ['TENANT_ADMIN'],
    });
    renderPage();

    fireEvent.click(screen.getAllByRole('button', { name: '进入工作台' })[0]);
    expect(navigateMock).toHaveBeenCalledWith('/management/admin-management');
  });

  it('已登录时点击登录平台仍进入登录页', () => {
    useUserStoreMock.mockReturnValue({
      token: 'token',
      roles: ['TENANT_ADMIN'],
    });
    renderPage();

    fireEvent.click(screen.getByRole('button', { name: '登录平台' }));
    expect(navigateMock).toHaveBeenCalledWith('/login');
  });
});
