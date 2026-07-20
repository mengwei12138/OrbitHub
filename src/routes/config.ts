import type { RouteConfig } from './types';

const isDevelopment = import.meta.env.MODE === 'development';

const demoRoutes: RouteConfig[] = isDevelopment
  ? [
      {
        path: '/demo',
        name: 'demo',
        icon: '@/images/menu-icons/icon-home.svg',
        component: '@/pages/demo',
        hideInMenu: true,
      },
    ]
  : [];

const routesConfig: RouteConfig[] = [
  { path: '/', component: '@/pages/landing' },
  { path: '/login', component: '@/pages/login' },
  { path: '/404', component: '@/pages/404' },
  { path: '/403', component: '@/pages/403' },
  { path: '/500', component: '@/pages/500' },
  {
    path: '/',
    layout: '@/layouts/Basic',
    // 后台子路由仍挂在根路径下，由各模块绝对路径命中；根路径本身交给公开官网页。
    children: [
      {
        path: '/account',
        name: '账号管理',
        icon: '@/images/menu-icons/icon-account.svg',
        component: '@/pages/account',
        cssVars: '@/styles/account/vars',
        access: 'role:TENANT_ADMIN,role:NORMAL_ADMIN',
        children: [
          {
            path: '/account/logs',
            name: '账号日志',
            hideInMenu: true,
            component: '@/pages/account/logs',
          },

          {
            path: '/account/add',
            name: '添加账号',
            hideInMenu: true,
            component: '@/pages/account/add',
          },
        ],
      },
      {
        path: '/content',
        name: '内容发布',
        icon: '@/images/menu-icons/icon-content.svg',
        component: '@/pages/content',
        cssVars: '@/styles/content/vars',
        access: 'role:TENANT_ADMIN,role:NORMAL_ADMIN',
        children: [
          {
            path: '/content/history',
            name: '历史发布记录',
            hideInMenu: true,
            component: '@/pages/content/history',
          },
          {
            path: '/content/detail',
            name: '发布详情',
            hideInMenu: true,
            component: '@/pages/content/detail',
          },
          {
            path: '/content/republish',
            name: '重新发布',
            hideInMenu: true,
            component: '@/pages/content/republish',
          },
        ],
      },
      {
        path: '/datacenter',
        name: '数据中心',
        icon: '@/images/menu-icons/icon-datacenter.svg',
        component: '@/pages/datacenter',
        cssVars: '@/styles/datacenter/vars',
        access: 'role:TENANT_ADMIN,role:NORMAL_ADMIN',
        children: [
          {
            path: '/datacenter/warnings',
            name: '预警详情',
            hideInMenu: true,
            component: '@/pages/datacenter/warnings',
          },
          {
            path: '/datacenter/account/:id',
            name: '账号详情',
            hideInMenu: true,
            component: '@/pages/datacenter/account',
          },
        ],
      },
      {
        path: '/ai-assistant',
        name: 'AI助手',
        icon: '@/images/menu-icons/icon-ai-assistant.svg',
        component: '@/pages/ai-assistant',
        cssVars: '@/styles/ai-assistant/vars',
        access: 'role:TENANT_ADMIN,role:NORMAL_ADMIN',
      },
      {
        path: '/content-generation',
        name: '内容生成',
        icon: '@/images/menu-icons/icon-content-generation.svg',
        component: '@/pages/content-generation',
        cssVars: '@/styles/content-generation/vars',
        access: 'role:TENANT_ADMIN,role:NORMAL_ADMIN',
        children: [
          {
            path: '/content-generation/my-works',
            name: '我的作品',
            hideInMenu: true,
            component: '@/pages/content-generation/my-works',
          },
          {
            path: '/content-generation/works/:workId',
            name: '作品详情',
            hideInMenu: true,
            component: '@/pages/content-generation/work-detail',
          },
          {
            path: '/content-generation/image-generation',
            name: '图文生成',
            hideInMenu: true,
            component: '@/pages/content-generation/image-generation',
          },
          {
            path: '/content-generation/video-generation',
            name: '视频生成',
            hideInMenu: true,
            component: '@/pages/content-generation/video-generation',
          },
        ],
      },
      {
        path: '/credits-record',
        name: '积分使用记录',
        icon: '@/images/menu-icons/icon-datacenter.svg',
        component: '@/pages/credits-record',
        hideInMenu: true,
        access: 'role:TENANT_ADMIN,role:NORMAL_ADMIN',
      },
      {
        path: '/management',
        // 父菜单名按角色动态映射：PLATFORM_ADMIN → "超管中心"，TENANT_ADMIN → "后台管理"。
        // 映射逻辑在 useMenus 里完成；此处保留 "后台管理" 作为类型层默认值（PRD §2.3）。
        name: '后台管理',
        icon: '@/images/menu-icons/icon-account.svg',
        component: '@/pages/management',
        // PRD §2.3：普通管理员"仅见业务模块"，不展示后台管理父节点。
        access: 'role:PLATFORM_ADMIN,role:TENANT_ADMIN',
        children: [
          {
            path: '/management/console',
            name: '控制台',
            component: '@/pages/management/console',
            // PRD §3.1 仅超管侧边栏
            access: 'role:PLATFORM_ADMIN',
          },
          {
            path: '/management/company-management',
            name: '公司管理',
            component: '@/pages/management/company-management',
            // PRD §3.2 公司管理：仅超管
            access: 'role:PLATFORM_ADMIN',
          },
          {
            path: '/management/points-management',
            name: '全局积分管理',
            component: '@/pages/management/points-management',
            // PRD §3.3 全局积分管理：仅超管视角
            access: 'role:PLATFORM_ADMIN',
          },
          {
            path: '/management/tenant-admin',
            name: '租户管理员管理',
            component: '@/pages/management/tenant-admin',
            // PRD §3.4 租户管理员管理：超管视角的用户列表
            access: 'role:PLATFORM_ADMIN',
          },
          {
            path: '/management/account-request-review',
            name: '账号申请审核',
            component: '@/pages/management/account-request-review',
            access: 'role:PLATFORM_ADMIN',
          },
          {
            path: '/management/operation-log',
            name: '操作日志',
            component: '@/pages/management/operation-log',
            // PRD §3.5 操作日志：仅超管视角
            access: 'role:PLATFORM_ADMIN',
          },
          {
            path: '/management/admin-management',
            name: '普通管理员管理',
            component: '@/pages/management/admin-management',
            // PRD §4.1 普通管理员管理：租户管理员视角
            access: 'role:TENANT_ADMIN',
          },
          {
            path: '/management/points-consumption',
            name: '积分与消耗明细',
            component: '@/pages/management/points-consumption',
            // PRD §4.2 "仅租户管理员可见"
            access: 'role:TENANT_ADMIN',
          },
        ],
      },
      ...demoRoutes,
    ],
  },
  { path: '*', component: '@/pages/404' },
];

export default routesConfig;
