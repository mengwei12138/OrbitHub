import { useQuery } from '@tanstack/react-query';
import { Dropdown, type MenuProps } from 'antd';
import { useCallback, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { PLACEHOLDER } from '@/constants';
import { creditsBalanceQueryOptions } from '@/services/content-generation';
import { useUserStore } from '@/store/modules/userStore';
import chevronDownIcon from '../../images/icon-chevron-down.svg';
import coinIcon from '../../images/icon-coin.svg';
import notificationIcon from '../../images/icon-notification.svg';
import styles from './style.module.css';

function NotificationBadge() {
  return (
    <div className={styles.notification}>
      <img src={notificationIcon} alt="通知" className={styles.icon} />
      <span className={styles.badge} />
    </div>
  );
}

function CreditsDisplay() {
  const navigate = useNavigate();
  const token = useUserStore((s) => s.token);
  const userInfo = useUserStore((s) => s.userInfo);
  const roles = useUserStore((s) => s.roles);
  const setCredits = useUserStore((s) => s.setCredits);

  // PLATFORM_ADMIN（超管）跨租户，不持有积分；调 content/credits/balance 必失败
  // → 跳过显示，避免控制台噪音 + 头部多余的"0"
  const isPlatformAdmin = roles.includes('PLATFORM_ADMIN');

  const { data } = useQuery({
    ...creditsBalanceQueryOptions(),
    enabled: !!token && !isPlatformAdmin,
  });

  useEffect(() => {
    if (data?.totalPoints !== undefined) {
      setCredits(data.totalPoints);
    }
  }, [data?.totalPoints, setCredits]);

  const formatCredits = (credits?: number) => {
    if (credits === undefined || credits === null) return '0';
    return credits.toLocaleString('en-US');
  };

  const displayPoints = data?.totalPoints ?? userInfo?.credits;

  const handleClick = useCallback(() => {
    navigate('/credits-record');
  }, [navigate]);

  // 超管不展示
  if (isPlatformAdmin) return null;

  return (
    <div
      className={styles.credits}
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      }}
      aria-label="查看积分使用记录"
    >
      <img src={coinIcon} alt="积分" className={styles.coinIcon} />
      <span className={styles.creditsText}>{formatCredits(displayPoints)}</span>
    </div>
  );
}

function UserDropdown() {
  const navigate = useNavigate();
  const { userInfo, logout } = useUserStore();

  const handleMenuClick: MenuProps['onClick'] = useCallback(
    ({ key }: { key: string }) => {
      switch (key) {
        case 'credits-record':
          navigate('/credits-record');
          break;
        case 'change-password':
          navigate('/change-password');
          break;
        case 'logout':
          logout();
          navigate('/login', { replace: true });
          break;
      }
    },
    [logout, navigate],
  );

  const menuItems: MenuProps['items'] = useMemo(
    () => [
      {
        key: 'user-info',
        disabled: true,
        label: (
          <div className={styles.userInfoSection}>
            <div className={styles.userInfoRow}>
              <span className={styles.label}>用户名：</span>
              <span className={styles.value}>
                {userInfo?.nickname || userInfo?.username || PLACEHOLDER}
              </span>
            </div>
            <div className={styles.userInfoRow}>
              <span className={styles.label}>ID：</span>
              <span className={styles.value}>
                {userInfo?.id || PLACEHOLDER}
              </span>
            </div>
          </div>
        ),
      },
      { type: 'divider' },
      { key: 'credits-record', label: '积分使用记录' },
      { key: 'change-password', label: '修改密码' },
      { type: 'divider' },
      { key: 'logout', label: '退出登录', danger: true },
    ],
    [userInfo],
  );

  const userInitial = userInfo?.nickname?.[0] || userInfo?.username?.[0] || 'U';

  return (
    <Dropdown
      menu={{ items: menuItems, onClick: handleMenuClick }}
      trigger={['hover']}
      placement="bottomRight"
      overlayStyle={{ width: 220 }}
    >
      <div className={styles.userInfo}>
        <div className={styles.avatar}>{userInitial}</div>
        <span className={styles.username}>
          {userInfo?.nickname || userInfo?.username || '用户'}
        </span>
        <img src={chevronDownIcon} alt="展开" className={styles.chevronDown} />
      </div>
    </Dropdown>
  );
}

export { CreditsDisplay, NotificationBadge, UserDropdown };

export default function GlobalHeader() {
  return (
    <div className={styles.container}>
      <NotificationBadge />
      <div className={styles.divider} />
      <CreditsDisplay />
      <UserDropdown />
    </div>
  );
}
