const STORAGE_KEY = 'user-storage';
const ROLE_KEY = 'mh-prototype-role';

type PrototypeRole = 'PLATFORM_ADMIN' | 'TENANT_ADMIN' | 'NORMAL_ADMIN';

const roleLabels: Record<PrototypeRole, string> = {
  PLATFORM_ADMIN: '超级管理员',
  TENANT_ADMIN: '租户管理员',
  NORMAL_ADMIN: '普通管理员',
};

const routeByRole: Record<PrototypeRole, string> = {
  PLATFORM_ADMIN: '/management/console',
  TENANT_ADMIN: '/management/admin-management',
  NORMAL_ADMIN: '/account',
};

const userIdByRole: Record<PrototypeRole, string> = {
  PLATFORM_ADMIN: 'user-platform',
  TENANT_ADMIN: 'user-tenant',
  NORMAL_ADMIN: 'user-normal',
};

const getRole = (): PrototypeRole => {
  const saved = localStorage.getItem(ROLE_KEY);
  if (
    saved === 'PLATFORM_ADMIN' ||
    saved === 'TENANT_ADMIN' ||
    saved === 'NORMAL_ADMIN'
  ) {
    return saved;
  }
  return 'TENANT_ADMIN';
};

const writePrototypeUser = (role: PrototypeRole) => {
  localStorage.setItem(ROLE_KEY, role);
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      state: {
        token: 'prototype-review-token',
        userInfo: {
          id: userIdByRole[role],
          username: roleLabels[role],
          displayName: roleLabels[role],
          tenantId: role === 'PLATFORM_ADMIN' ? null : 'tenant-001',
          tenantName: role === 'PLATFORM_ADMIN' ? null : '成都矩阵科技',
          credits: 126800,
        },
        permissions: [],
        roles: [role],
      },
      version: 0,
    }),
  );
};

const installRoleSwitcher = () => {
  if (document.getElementById('prototype-role-switcher')) return;
  const root = document.createElement('div');
  root.id = 'prototype-role-switcher';
  root.style.cssText = [
    'position:fixed',
    'right:18px',
    'bottom:18px',
    'z-index:9999',
    'display:flex',
    'gap:8px',
    'align-items:center',
    'padding:10px',
    'border:1px solid #d9d9d9',
    'border-radius:8px',
    'background:#fff',
    'box-shadow:0 6px 16px rgba(0,0,0,.12)',
    'font-size:12px',
  ].join(';');

  const label = document.createElement('span');
  label.textContent = '评审角色';
  label.style.color = 'rgba(0,0,0,.65)';
  root.appendChild(label);

  (Object.keys(roleLabels) as PrototypeRole[]).forEach((role) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = roleLabels[role];
    button.style.cssText = [
      'height:28px',
      'padding:0 10px',
      'border:1px solid #1677ff',
      'border-radius:6px',
      'background:#fff',
      'color:#1677ff',
      'cursor:pointer',
    ].join(';');
    if (role === getRole()) {
      button.style.background = '#1677ff';
      button.style.color = '#fff';
    }
    button.addEventListener('click', () => {
      writePrototypeUser(role);
      window.location.href = routeByRole[role];
    });
    root.appendChild(button);
  });

  document.body.appendChild(root);
};

writePrototypeUser(getRole());
window.addEventListener('DOMContentLoaded', installRoleSwitcher);
