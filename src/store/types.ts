export type UserInfo = {
  id: string;
  username: string;
  /** 当前用户所属公司 id；PLATFORM_ADMIN 为 null */
  tenantId?: string | null;
  nickname?: string;
  email?: string;
  phone?: string;
  avatar?: string;
  credits?: number;
};

/** 系统角色码（与后端 sys_user.roles JSON 一致） */
export type RoleCode =
  | 'PLATFORM_ADMIN'
  | 'TENANT_ADMIN'
  | 'NORMAL_ADMIN'
  | string;

export type UserState = {
  token: string | null;
  userInfo: UserInfo | null;
  permissions: string[];
  roles: RoleCode[];
  setToken: (token: string | null) => void;
  setUserInfo: (info: UserInfo | null) => void;
  setPermissions: (permissions: string[]) => void;
  setRoles: (roles: RoleCode[]) => void;
  setCredits: (credits: number) => void;
  logout: () => void;
};

export type ThemeState = {
  theme: 'light' | 'dark';
  language: 'zh-CN' | 'en-US';
  setTheme: (theme: 'light' | 'dark') => void;
  setLanguage: (language: 'zh-CN' | 'en-US') => void;
};

export type UIState = {
  siderCollapsed: boolean;
  setSiderCollapsed: (collapsed: boolean) => void;
};
