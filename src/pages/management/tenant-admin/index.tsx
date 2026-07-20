import { useQuery } from '@tanstack/react-query';
import { Button } from 'antd';
import { useMemo, useRef, useState } from 'react';
import { Access } from '@/components';
import CustomProTable from '@/components/CustomProTable';
import type { CustomProTableRef } from '@/components/CustomProTable/types';
import PageHeader from '@/components/PageHeader';
import { tenantListQueryOptions } from '@/services/admin-tenant';
import type { UserListQueryParams, UserResponse } from '@/services/admin-user';
import { userListQueryOptions } from '@/services/admin-user';
import { formatDateTimeMinute } from '@/utils/date';
import EditTenantAdminModal from './components/EditTenantAdminModal';
import ResetPasswordModal from './components/ResetPasswordModal';
import styles from './style.module.css';

/**
 * 租户管理员管理（超管中心）。PRD §3.4。
 *
 * 一公司一租管：列表只展示 role=TENANT_ADMIN 的用户，不开放"新增"。
 * 操作集：编辑（姓名 / 手机号 / 状态）/ 重置密码。状态变更并入编辑弹窗下拉框。
 * 数据权限：仅 PLATFORM_ADMIN 可访问本页（路由层 access=role:PLATFORM_ADMIN）。
 */
const TenantAdminPage: React.FC = () => {
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [resetPasswordModalOpen, setResetPasswordModalOpen] = useState(false);
  const [currentAdmin, setCurrentAdmin] = useState<UserResponse | null>(null);

  // 表格 reload：CustomProTable 用 ProTable.request 模式，外部状态变化不自动 refetch
  const tableRef = useRef<CustomProTableRef>(null);
  const triggerReload = () => tableRef.current?.reload();

  // 公司列表 → 用于「所属公司」列回显 + 顶部筛选下拉
  const { data: tenants = [] } = useQuery({
    queryKey: ['admin-tenant', 'list', 'all-for-tenant-admin-page'],
    queryFn: async () => {
      const data = await tenantListQueryOptions({
        page: 1,
        pageSize: 1000, // 公司数量可控；一次性拉全后客户端 join
      }).queryFn();
      return data.list ?? [];
    },
  });

  const tenantNameById = useMemo(() => {
    const map = new Map<string, string>();
    for (const t of tenants) {
      map.set(t.id, t.name);
    }
    return map;
  }, [tenants]);

  const tenantOptions = useMemo(
    () => [
      { label: '全部公司', value: '' },
      ...tenants.map((t) => ({ label: t.name, value: t.id })),
    ],
    [tenants],
  );

  const columns = [
    {
      title: '姓名',
      dataIndex: 'username',
      key: 'username',
      width: 140,
      ellipsis: true,
    },
    {
      title: '手机号',
      dataIndex: 'phoneNumber',
      key: 'phoneNumber',
      width: 160,
      ellipsis: true,
    },
    {
      title: '所属公司',
      dataIndex: 'tenantId',
      key: 'tenantId',
      width: 200,
      valueType: 'select' as const,
      fieldProps: {
        placeholder: '全部公司',
        allowClear: true,
        showSearch: true,
        optionFilterProp: 'label',
        options: tenantOptions,
      },
      render: (_: unknown, record: UserResponse) =>
        record.tenantId ? (tenantNameById.get(record.tenantId) ?? '-') : '-',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 80,
      hideInSearch: true,
      render: (_: unknown, record: UserResponse) =>
        record.status === 1 ? '启用' : '禁用',
    },
    {
      title: '最后登录',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      width: 160,
      hideInSearch: true,
      render: (_: unknown, record: UserResponse) =>
        record.updatedAt ? formatDateTimeMinute(record.updatedAt) : '-',
    },
    {
      title: '操作',
      key: 'actions',
      hideInSearch: true,
      width: 160,
      render: (_: unknown, record: UserResponse) => (
        <div>
          <Access path="admin:user:update">
            <Button
              type="link"
              onClick={() => {
                setCurrentAdmin(record);
                setEditModalOpen(true);
              }}
            >
              编辑
            </Button>
          </Access>
          <Access path="admin:user:reset-password">
            <Button
              type="link"
              onClick={() => {
                setCurrentAdmin(record);
                setResetPasswordModalOpen(true);
              }}
            >
              重置密码
            </Button>
          </Access>
        </div>
      ),
    },
  ];

  return (
    <div className={styles.container}>
      <PageHeader title="租户管理员管理" />

      <CustomProTable<UserResponse>
        ref={tableRef}
        rowKey="id"
        columns={columns}
        queryOptions={(params) => {
          const { page = 1, pageSize = 10, ...rest } = params;
          const filters = rest as {
            username?: string;
            phoneNumber?: string;
            tenantId?: string;
          };
          // 后端 keyword 用 OR 同时匹配 username / phone，两个筛选框任一非空即透传
          const apiParams: UserListQueryParams = {
            role: 'TENANT_ADMIN',
            page,
            pageSize,
            keyword: filters.username || filters.phoneNumber || undefined,
            tenantId: filters.tenantId || undefined,
          };
          return {
            queryKey: ['admin-user', 'list', apiParams],
            queryFn: async () => {
              const data = await userListQueryOptions(apiParams).queryFn();
              return {
                list: data.list ?? [],
                total: data.total ?? 0,
              };
            },
          };
        }}
      />

      {currentAdmin && (
        <EditTenantAdminModal
          open={editModalOpen}
          user={currentAdmin}
          tenantName={
            currentAdmin.tenantId
              ? (tenantNameById.get(currentAdmin.tenantId) ?? '-')
              : '-'
          }
          onClose={() => setEditModalOpen(false)}
          onSuccess={() => {
            setEditModalOpen(false);
            triggerReload();
          }}
        />
      )}

      {currentAdmin && (
        <ResetPasswordModal
          open={resetPasswordModalOpen}
          userId={currentAdmin.id}
          adminName={currentAdmin.username}
          roleLabel="租户管理员"
          onClose={() => setResetPasswordModalOpen(false)}
          onSuccess={() => {
            setResetPasswordModalOpen(false);
            // 重置密码不需要 reload 列表（不会改可见字段），保留以防 updatedAt 变化
            triggerReload();
          }}
        />
      )}
    </div>
  );
};

export default TenantAdminPage;
