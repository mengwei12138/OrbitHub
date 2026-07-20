import type { MenuDataItem, ProTokenType } from '@ant-design/pro-components';
import { PageContainer, ProLayout } from '@ant-design/pro-components';
import { useCallback, useMemo } from 'react';
import { Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { CustomBreadcrumb } from '@/components';
import { GlobalGenerationCompletionHost } from '@/components/ContentGenerationCompletion/GlobalGenerationCompletionHost';
import { useMenus } from '@/hooks';
import { layoutRoute } from '@/routes';
import { useUserStore } from '@/store/modules/userStore';
import {
  FIGMA_COLOR_BG_PAGE,
  FIGMA_COLOR_MENU_BG,
  FIGMA_COLOR_MENU_BG_ACTIVE,
  FIGMA_COLOR_MENU_BG_HOVER,
  FIGMA_COLOR_MENU_TEXT,
  FIGMA_COLOR_MENU_TEXT_ACTIVE,
  FIGMA_COLOR_MENU_TEXT_HOVER,
} from '@/styles/common/vars';
import {
  CreditsDisplay,
  NotificationBadge,
  UserDropdown,
} from './components/GlobalHeader';
import LayoutLogo from './components/LayoutLogo';
import styles from './style.module.css';

export default function Basic() {
  const location = useLocation();
  const navigate = useNavigate();
  const accessibleMenuData = useMenus();
  const token = useUserStore((s) => s.token);

  const handleMenuItemClick = useCallback(
    (item: MenuDataItem) => {
      const path = item.path || '/';
      // 仅当已在该菜单根路径时跳过；子路由（如 /content-generation/my-works）仍应允许回到根路径
      if (location.pathname === path) return;
      navigate(path, { replace: true });
    },
    [location.pathname, navigate],
  );

  const routeConfig = useMemo(
    () => ({
      path: layoutRoute.path,
      routes: accessibleMenuData,
    }),
    [accessibleMenuData],
  );

  const proLayoutTokenConfig = useMemo(
    (): ProTokenType['layout'] => ({
      bgLayout: FIGMA_COLOR_BG_PAGE,
      sider: {
        colorMenuBackground: FIGMA_COLOR_MENU_BG,
        colorBgMenuItemHover: FIGMA_COLOR_MENU_BG_HOVER,
        colorBgMenuItemSelected: FIGMA_COLOR_MENU_BG_ACTIVE,
        colorTextMenu: FIGMA_COLOR_MENU_TEXT,
        colorTextMenuItemHover: FIGMA_COLOR_MENU_TEXT_HOVER,
        colorTextMenuSelected: FIGMA_COLOR_MENU_TEXT_ACTIVE,
      },
      header: {
        colorBgHeader: FIGMA_COLOR_MENU_BG,
        colorBgScrollHeader: FIGMA_COLOR_MENU_BG,
        colorHeaderTitle: FIGMA_COLOR_MENU_TEXT_ACTIVE,
      },
      pageContainer: {
        paddingBlockPageContainerContent: 0,
        paddingInlinePageContainerContent: 0,
      },
    }),
    [],
  );

  const menuItemRender = useCallback(
    (item: MenuDataItem, defaultDom: React.ReactNode) => (
      <div onClick={() => handleMenuItemClick(item)}>{defaultDom}</div>
    ),
    [handleMenuItemClick],
  );

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return (
    <ProLayout
      title={false}
      logo={<LayoutLogo />}
      layout="mix"
      disableMobile
      collapsed={false}
      collapsedButtonRender={false}
      route={routeConfig}
      location={location}
      contentStyle={{ padding: 0 }}
      token={proLayoutTokenConfig}
      actionsRender={() => [
        <NotificationBadge key="notification" />,
        <CreditsDisplay key="credits" />,
        <UserDropdown key="user" />,
      ]}
      menuItemRender={menuItemRender}
      className={styles.layoutHeader}
    >
      <PageContainer pageHeaderRender={() => <CustomBreadcrumb />}>
        <Outlet />
      </PageContainer>
      <GlobalGenerationCompletionHost />
    </ProLayout>
  );
}
