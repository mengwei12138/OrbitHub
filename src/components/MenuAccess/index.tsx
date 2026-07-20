import type { FC, PropsWithChildren } from 'react';
import { Navigate } from 'react-router-dom';
import Access from '@/components/Access';

// dev 模式的放行策略下沉到 access()——role: 始终校验、admin: 权限码 dev 直通。
const MenuAccess: FC<PropsWithChildren<{ access: string }>> = ({
  access,
  children,
}) => (
  <Access path={access} fallback={<Navigate to="/403" replace />}>
    {children}
  </Access>
);

export default MenuAccess;
