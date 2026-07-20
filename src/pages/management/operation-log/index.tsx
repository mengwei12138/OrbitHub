import { useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';
import type React from 'react';
import { useMemo } from 'react';
import { CustomEmpty, CustomProTable } from '@/components';
import { tenantListQueryOptions } from '@/services/admin-tenant';
import { userListQueryOptions } from '@/services/admin-user';
import type { OperationLogResponse } from '@/services/operation-log';
import {
  OPERATION_LOG_OPERATION_TYPE_VALUE_ENUM,
  operationLogsQueryOptions,
} from '@/services/operation-log';
import { formatDateTimeMinute } from '@/utils/date';

import styles from './style.module.css';

/** PRD §3.5 时间范围预设。值与后端 ISO 8601 区间一一对应。 */
const DATE_PRESET_ENUM = {
  today: { text: '今天' },
  yesterday: { text: '昨天' },
  last7days: { text: '最近 7 天' },
  last30days: { text: '最近 30 天' },
  thisMonth: { text: '本月' },
  lastMonth: { text: '上月' },
} as const satisfies Record<string, { text: string }>;

const OPERATION_TYPE_COLORS: Record<string, { bg: string; color: string }> = {
  'admin.tenant.create': { bg: '#E6F4FF', color: '#1677FF' },
  'admin.tenant.update': { bg: '#F6FFED', color: '#52C41A' },
  'admin.tenant.disable': { bg: '#FFF0F6', color: '#EB2F96' },
  'admin.tenant.enable': { bg: '#F6FFED', color: '#52C41A' },
  'admin.proxy.tenant-recharge': { bg: '#F9F0FF', color: '#722ED1' },
  'admin.user.create': { bg: '#E6F4FF', color: '#1677FF' },
  'admin.user.update': { bg: '#F6FFED', color: '#52C41A' },
  'admin.user.disable': { bg: '#FFF0F6', color: '#EB2F96' },
  'admin.user.enable': { bg: '#F6FFED', color: '#52C41A' },
  'admin.user.reset-password': { bg: '#FFF7E6', color: '#FA8C16' },
  'admin.user-quota.assign': { bg: '#FFF7E6', color: '#FA8C16' },
  'admin.user.delete': { bg: '#FFF2F0', color: '#FF4D4F' },
  'admin.package.create': { bg: '#E6F4FF', color: '#1677FF' },
  'admin.package.update': { bg: '#F6FFED', color: '#52C41A' },
  'admin.package.delete': { bg: '#FFF2F0', color: '#FF4D4F' },
  'admin.role-permission.assign': { bg: '#F9F0FF', color: '#722ED1' },
};

// 需求未覆盖：套餐管理与角色权限调整暂不在筛选下拉中展示
const HIDDEN_OPERATION_TYPES_IN_FILTER = new Set([
  'admin.package.create',
  'admin.package.update',
  'admin.package.delete',
  'admin.role-permission.assign',
]);

const OPERATION_LOG_OPERATION_TYPE_FILTER_OPTIONS: Array<{
  label: string;
  value: string;
}> = [
  { label: '全部操作类型', value: '' },
  ...Object.entries(OPERATION_LOG_OPERATION_TYPE_VALUE_ENUM)
    .filter(([key]) => !HIDDEN_OPERATION_TYPES_IN_FILTER.has(key))
    .map(([value, { text }]) => ({ label: text, value })),
];

/** 把 PRD 预设值解析成 ISO 8601 时间区间。 */
const presetToRange = (
  preset: string | undefined,
): { startTime?: string; endTime?: string } => {
  const now = dayjs();
  switch (preset) {
    case 'today':
      return {
        startTime: now.startOf('day').toISOString(),
        endTime: now.endOf('day').toISOString(),
      };
    case 'yesterday': {
      const y = now.subtract(1, 'day');
      return {
        startTime: y.startOf('day').toISOString(),
        endTime: y.endOf('day').toISOString(),
      };
    }
    case 'last30days':
      return {
        startTime: now.subtract(29, 'day').startOf('day').toISOString(),
        endTime: now.endOf('day').toISOString(),
      };
    case 'thisMonth':
      return {
        startTime: now.startOf('month').toISOString(),
        endTime: now.endOf('day').toISOString(),
      };
    case 'lastMonth': {
      const m = now.subtract(1, 'month');
      return {
        startTime: m.startOf('month').toISOString(),
        endTime: m.endOf('month').toISOString(),
      };
    }
    default:
      // 默认最近 7 天
      return {
        startTime: now.subtract(6, 'day').startOf('day').toISOString(),
        endTime: now.endOf('day').toISOString(),
      };
  }
};

const OperationTypeTag: React.FC<{ type: string }> = ({ type }) => {
  const scheme = OPERATION_TYPE_COLORS[type] ?? {
    bg: '#F5F5F5',
    color: '#595959',
  };
  const enumEntry = (
    OPERATION_LOG_OPERATION_TYPE_VALUE_ENUM as Record<string, { text: string }>
  )[type];
  const text = enumEntry?.text ?? type;
  return (
    <span
      className={styles.operationTypeTag}
      style={{ backgroundColor: scheme.bg, color: scheme.color }}
    >
      {text}
    </span>
  );
};

/**
 * 操作日志（超管 + 租户管理员共用）。PRD §3.5。
 *
 * 数据权限：后端按 JWT 自动收敛——TENANT_ADMIN 只看本公司、PLATFORM_ADMIN 看全部。
 * 前端只做筛选 UI；操作内容直接展示后端拼好的 operationContent（含「字段: 原值 → 新值」格式）。
 */
const OperationLogPage: React.FC = () => {
  // 公司列表 → "所属公司"列回显 + 筛选下拉
  const { data: tenants = [] } = useQuery({
    queryKey: ['admin-tenant', 'list', 'all-for-operation-log'],
    queryFn: async () => {
      const data = await tenantListQueryOptions({
        page: 1,
        pageSize: 1000,
      }).queryFn();
      return data.list ?? [];
    },
  });
  const tenantNameById = useMemo(() => {
    const m = new Map<string, string>();
    for (const t of tenants) m.set(t.id, t.name);
    return m;
  }, [tenants]);
  const tenantFilterOptions = useMemo<Array<{ label: string; value: string }>>(
    () => [
      { label: '全部公司', value: '' },
      ...tenants.map((t) => ({ label: t.name, value: t.id })),
    ],
    [tenants],
  );

  // 用户列表 → "操作人"列回显（用 userId join 用户名/角色显示）
  const { data: users = [] } = useQuery({
    queryKey: ['admin-user', 'list', 'all-for-operation-log'],
    queryFn: async () => {
      const data = await userListQueryOptions({
        page: 1,
        pageSize: 1000,
      }).queryFn();
      return data.list ?? [];
    },
  });
  const userById = useMemo(() => {
    const m = new Map<string, { username: string; roles: string[] }>();
    for (const u of users) {
      m.set(u.id, { username: u.username, roles: u.roles });
    }
    return m;
  }, [users]);

  const roleDisplay = (roles: string[] | undefined): string => {
    if (!roles) return '';
    if (roles.includes('PLATFORM_ADMIN')) return '超管';
    if (roles.includes('TENANT_ADMIN')) return '租户管理员';
    if (roles.includes('NORMAL_ADMIN')) return '普通管理员';
    return roles[0] ?? '';
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>操作日志</h1>
      </div>

      <CustomProTable<OperationLogResponse>
        rowKey="id"
        queryOptions={(params: Record<string, unknown>) => {
          const { startTime, endTime } = presetToRange(
            params.datePreset as string | undefined,
          );
          const keyword = (params.userKeyword as string | undefined)?.trim();
          return operationLogsQueryOptions({
            startTime,
            endTime,
            operationType: (params.operationType as string) || undefined,
            userKeyword: keyword || undefined,
            tenantId: (params.tenantId as string) || undefined,
            page: params.page as number | undefined,
            pageSize: params.pageSize as number | undefined,
          });
        }}
        columns={[
          {
            title: '时间',
            dataIndex: 'createdAt',
            key: 'createdAt',
            width: 160,
            hideInSearch: true,
            render: (_: unknown, r: OperationLogResponse) => (
              <span className={styles.timeText}>
                {formatDateTimeMinute(r.createdAt)}
              </span>
            ),
          },
          {
            title: '操作人',
            dataIndex: 'userId',
            key: 'userId',
            width: 200,
            hideInSearch: true,
            render: (_: unknown, r: OperationLogResponse) => {
              if (!r.userId) return '-';
              const u = userById.get(r.userId);
              if (!u) return r.userId;
              const role = roleDisplay(u.roles);
              return (
                <span className={styles.operatorText}>
                  {u.username}
                  {role ? `(${role})` : ''}
                </span>
              );
            },
          },
          {
            title: '所属公司',
            dataIndex: 'tenantId',
            key: 'tenantId',
            width: 140,
            hideInSearch: true,
            render: (_: unknown, r: OperationLogResponse) =>
              r.tenantId ? (
                <span className={styles.companyText}>
                  {tenantNameById.get(r.tenantId) ?? r.tenantId}
                </span>
              ) : (
                '-'
              ),
          },
          {
            title: '操作类型',
            dataIndex: 'operationType',
            key: 'operationType',
            width: 130,
            hideInSearch: true,
            render: (_: unknown, r: OperationLogResponse) => (
              <OperationTypeTag type={r.operationType} />
            ),
          },
          {
            title: '操作内容',
            dataIndex: 'operationContent',
            key: 'operationContent',
            hideInSearch: true,
            render: (_: unknown, r: OperationLogResponse) => (
              <span className={styles.contentText}>
                {r.operationContent ?? '-'}
              </span>
            ),
          },
          // 下面是筛选项（hideInTable）
          {
            title: '操作类型',
            dataIndex: 'operationType',
            valueType: 'select',
            hideInTable: true,
            fieldProps: {
              placeholder: '请选择操作类型',
              allowClear: true,
              options: OPERATION_LOG_OPERATION_TYPE_FILTER_OPTIONS,
            },
          },
          {
            title: '操作人',
            dataIndex: 'userKeyword',
            valueType: 'text',
            hideInTable: true,
            fieldProps: {
              placeholder: '请输入操作人姓名 / 手机号',
              allowClear: true,
            },
          },
          {
            title: '所属公司',
            dataIndex: 'tenantId',
            valueType: 'select',
            hideInTable: true,
            fieldProps: {
              placeholder: '请选择公司',
              showSearch: true,
              allowClear: true,
              optionFilterProp: 'label',
              options: tenantFilterOptions,
            },
          },
          {
            title: '时间范围',
            dataIndex: 'datePreset',
            valueType: 'select',
            valueEnum: DATE_PRESET_ENUM,
            initialValue: 'last7days',
            hideInTable: true,
          },
        ]}
        emptyContent={<CustomEmpty description="暂无操作日志" />}
        tableAlertOptionRender={false}
        toolBarRender={false}
      />
    </div>
  );
};

export default OperationLogPage;
