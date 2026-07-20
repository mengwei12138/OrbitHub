import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useUserStore } from '@/store/modules/userStore';

const mockNavigate = vi.fn();
const mockLogout = vi.fn();
let mockPathname = '/home';

const userStoreState = {
  token: 'mock-token' as string | null,
  userInfo: {
    id: '1',
    username: 'admin',
    nickname: '管理员',
    avatar: 'https://example.com/avatar.png',
  },
  logout: mockLogout,
};

vi.mock('react-router-dom', () => ({
  useLocation: () => ({ pathname: mockPathname }),
  useNavigate: () => mockNavigate,
  Outlet: () => <div data-testid="outlet">子页面内容</div>,
  Navigate: ({ to, replace }: { to: string; replace?: boolean }) => (
    <div data-testid="navigate" data-to={to} data-replace={String(!!replace)} />
  ),
}));

vi.mock('@/hooks', () => ({
  useMenus: () => [
    { path: '/home', name: '首页' },
    {
      path: '/account',
      name: '账号管理',
      children: [{ path: '/account/logs', name: '账号日志' }],
    },
    { path: '/content-generation', name: '内容生成' },
  ],
}));

vi.mock('@/store/modules/userStore', () => ({
  useUserStore: <T,>(selector?: (s: typeof userStoreState) => T) =>
    selector ? selector(userStoreState) : userStoreState,
}));

vi.mock('@/routes', () => ({
  layoutRoute: { path: '/' },
}));

vi.mock('@/images/logo-icon.svg', () => ({
  default: '/logo-icon.svg',
}));

vi.mock('../components/GlobalHeader', () => {
  return {
    NotificationBadge: () => <div data-testid="notification">通知</div>,
    CreditsDisplay: () => <div data-testid="credits">积分</div>,
    UserDropdown: () => {
      const { logout } = useUserStore();
      return (
        <div data-testid="user-dropdown">
          <div data-testid="avatar-element">管理员</div>
          <div data-testid="dropdown">
            <div data-testid="dropdown-menu">
              <button
                type="button"
                data-testid="menu-logout"
                onClick={() => {
                  logout();
                  mockNavigate('/login', { replace: true });
                }}
              >
                退出登录
              </button>
            </div>
          </div>
        </div>
      );
    },
  };
});

vi.mock('../components/LayoutLogo', () => ({
  default: ({ collapsed }: { collapsed?: boolean }) => (
    <div data-testid="layout-logo" data-collapsed={collapsed}>
      {collapsed ? (
        <div data-testid="logo-icon-bg-small" />
      ) : (
        <>
          <div data-testid="logo-icon-bg" />
          <span>矩阵管理</span>
        </>
      )}
    </div>
  ),
}));

vi.mock('@/styles/common/vars', () => ({
  FIGMA_COLOR_BG_PAGE: '#f5f5f5',
  FIGMA_COLOR_MENU_BG: '#001529',
  FIGMA_COLOR_MENU_BG_HOVER: '#1890ff',
  FIGMA_COLOR_MENU_BG_ACTIVE: '#1890ff',
  FIGMA_COLOR_MENU_TEXT: '#fff',
  FIGMA_COLOR_MENU_TEXT_HOVER: '#fff',
  FIGMA_COLOR_MENU_TEXT_ACTIVE: '#fff',
  FIGMA_COLOR_PRIMARY: '#1677ff',
  FIGMA_COLOR_ORANGE: '#fa8c16',
  FIGMA_COLOR_BORDER: '#d9d9d9',
  FIGMA_COLOR_BORDER_LIGHT: '#f0f0f0',
}));

vi.mock('@/images/default-avatar.svg', () => ({
  default: '/default-avatar.svg',
}));

vi.mock('@/components', () => ({
  CustomBreadcrumb: () => <div data-testid="breadcrumb">面包屑</div>,
}));

vi.mock('./style.module.css', () => ({
  default: { layoutHeader: 'layout-header' },
}));

vi.mock('@ant-design/icons', () => ({
  LogoutOutlined: () => <span>退出图标</span>,
}));

vi.mock('@ant-design/pro-components', () => ({
  ProLayout: ({
    children,
    title,
    logo,
    menuItemRender,
    actionsRender,
    route,
  }: {
    children: React.ReactNode;
    title: string | false;
    logo?: React.ReactNode;
    menuItemRender: (
      item: { path: string },
      dom: React.ReactNode,
    ) => React.ReactNode;
    actionsRender?: () => React.ReactNode[];
    route: { path: string; routes: { path: string; name: string }[] };
  }) => (
    <div data-testid="pro-layout">
      {logo}
      <div data-testid="layout-title">{title}</div>
      <div data-testid="menu-items">
        {route?.routes?.map((r) => (
          <div key={r.path} data-testid={`menu-item-${r.path}`}>
            {menuItemRender(r, <span>{r.name}</span>)}
          </div>
        ))}
      </div>
      {actionsRender && (
        <div data-testid="actions-render">{actionsRender()}</div>
      )}
      {children}
    </div>
  ),
  PageContainer: ({
    children,
    pageHeaderRender,
  }: {
    children: React.ReactNode;
    pageHeaderRender: () => React.ReactNode;
  }) => (
    <div data-testid="page-container">
      {pageHeaderRender()}
      {children}
    </div>
  ),
}));

import Basic from '../index';

describe('Basic 布局', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPathname = '/home';
    userStoreState.token = 'mock-token';
  });

  it('未登录时重定向到 /login', () => {
    userStoreState.token = null;
    render(<Basic />);
    const nav = screen.getByTestId('navigate');
    expect(nav).toHaveAttribute('data-to', '/login');
    expect(nav).toHaveAttribute('data-replace', 'true');
    expect(screen.queryByTestId('pro-layout')).not.toBeInTheDocument();
  });

  it('渲染 LayoutLogo 组件', () => {
    render(<Basic />);
    expect(screen.getByTestId('layout-logo')).toBeInTheDocument();
  });

  it('渲染面包屑组件', () => {
    render(<Basic />);
    expect(screen.getByTestId('breadcrumb')).toBeInTheDocument();
  });

  it('渲染 Outlet 子页面内容', () => {
    render(<Basic />);
    expect(screen.getByTestId('outlet')).toHaveTextContent('子页面内容');
  });

  it('显示用户昵称', () => {
    render(<Basic />);
    expect(screen.getByTestId('avatar-element')).toHaveTextContent('管理员');
  });

  it('渲染菜单项', () => {
    render(<Basic />);
    expect(screen.getByTestId('menu-item-/home')).toBeInTheDocument();
    expect(screen.getByTestId('menu-item-/account')).toBeInTheDocument();
  });

  it('点击菜单项触发导航', () => {
    mockPathname = '/account';
    render(<Basic />);
    const homeMenuItem = screen.getByTestId('menu-item-/home');
    fireEvent.click(homeMenuItem.querySelector('div') as HTMLDivElement);
    expect(mockNavigate).toHaveBeenCalledWith('/home', { replace: true });
  });

  it('已在当前菜单根路径时重复点击不重复导航', () => {
    mockPathname = '/home';
    render(<Basic />);
    const homeMenuItem = screen.getByTestId('menu-item-/home');
    const menuDiv = homeMenuItem.querySelector('div');
    expect(menuDiv).not.toBeNull();
    fireEvent.click(menuDiv as HTMLDivElement);
    fireEvent.click(menuDiv as HTMLDivElement);
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('子路由下点击菜单根路径仍应导航', () => {
    mockPathname = '/content-generation/my-works';
    render(<Basic />);
    const menuItem = screen.getByTestId('menu-item-/content-generation');
    const menuDiv = menuItem.querySelector('div');
    expect(menuDiv).not.toBeNull();
    fireEvent.click(menuDiv as HTMLDivElement);
    expect(mockNavigate).toHaveBeenCalledWith('/content-generation', {
      replace: true,
    });
  });

  it('点击退出登录调用 logout 并跳转到登录页', () => {
    render(<Basic />);
    const logoutBtn = screen.getByTestId('menu-logout');
    fireEvent.click(logoutBtn);
    expect(mockLogout).toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith('/login', { replace: true });
  });

  it('渲染 PageContainer 包裹内容', () => {
    render(<Basic />);
    expect(screen.getByTestId('page-container')).toBeInTheDocument();
  });

  it('ProLayout 接收正确的 route 配置', () => {
    render(<Basic />);
    // route.routes 应包含 useMenus 返回的菜单数据
    expect(screen.getByTestId('menu-items').children.length).toBe(3);
  });
});
