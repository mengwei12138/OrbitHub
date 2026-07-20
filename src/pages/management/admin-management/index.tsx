import { useQuery } from '@tanstack/react-query';
import { Button, Tooltip } from 'antd';
import type React from 'react';
import { useRef, useState } from 'react';
import { Access } from '@/components';
import CustomProTable from '@/components/CustomProTable';
import type { CustomProTableRef } from '@/components/CustomProTable/types';
import PageHeader from '@/components/PageHeader';
import type { UserListQueryParams, UserResponse } from '@/services/admin-user';
import { userListQueryOptions } from '@/services/admin-user';
import { quotaSummaryQueryOptions } from '@/services/admin-user-quota';
import { useUserStore } from '@/store/modules/userStore';
import { formatDateTimeMinute } from '@/utils/date';
import ResetPasswordModal from '../tenant-admin/components/ResetPasswordModal';
import AdminFormModal from './components/AdminFormModal';
import DisableConfirmModal from './components/DisableConfirmModal';
import EnableConfirmModal from './components/EnableConfirmModal';
import styles from './style.module.css';

/**
 * 普通管理员管理（租户管理员视图）。PRD §4.1。
 *
 * - 列表展示本公司全部管理员（TENANT_ADMIN + NORMAL_ADMIN），后端按当前 JWT 自动收敛 tenantId。
 * - 禁止禁用自己（PRD：「不能禁用自己，请联系超级管理员」），自身行不渲染禁用按钮。
 * - 底部展示「公司总社交账号数上限：已使用 X / Y（当前套餐：Z）」从 quota-summary 拉取。
 */
const AdminManagementPage: React.FC = () => {
  const currentUser = useUserStore((s) => s.userInfo);
  // 表格用 ref 直接 reload，配额汇总用 reloadKey 让 useQuery 重取（两个数据源独立）
  const tableRef = useRef<CustomProTableRef>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const triggerReload = () => {
    tableRef.current?.reload();
    setReloadKey((k) => k + 1);
  };

  // 当前登录用户的公司 id（PLATFORM_ADMIN 为 null，理论上不会进本页）
  const currentTenantId = currentUser?.tenantId ?? '';

  // 配额汇总（底部统计条 + 表单上限提示）
  const { data: quotaSummary } = useQuery({
    ...quotaSummaryQueryOptions(currentTenantId),
    queryKey: [
      'admin-user-quota',
      'summary',
      currentTenantId,
      reloadKey, // 写操作后刷新
    ],
  });

  const [formModalOpen, setFormModalOpen] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [editingAdmin, setEditingAdmin] = useState<UserResponse | null>(null);

  const [disableModalOpen, setDisableModalOpen] = useState(false);
  const [disableTarget, setDisableTarget] = useState<UserResponse | null>(null);

  const [enableModalOpen, setEnableModalOpen] = useState(false);
  const [enableTarget, setEnableTarget] = useState<UserResponse | null>(null);

  const [resetPwdModalOpen, setResetPwdModalOpen] = useState(false);
  const [resetPwdTarget, setResetPwdTarget] = useState<UserResponse | null>(
    null,
  );

  const handleCreate = () => {
    setFormMode('create');
    setEditingAdmin(null);
    setFormModalOpen(true);
  };

  const handleEdit = (record: UserResponse) => {
    setFormMode('edit');
    setEditingAdmin(record);
    setFormModalOpen(true);
  };

  const handleDisable = (record: UserResponse) => {
    setDisableTarget(record);
    setDisableModalOpen(true);
  };

  const handleEnable = (record: UserResponse) => {
    setEnableTarget(record);
    setEnableModalOpen(true);
  };

  const handleResetPassword = (record: UserResponse) => {
    setResetPwdTarget(record);
    setResetPwdModalOpen(true);
  };

  const renderRole = (record: UserResponse): string => {
    if (record.roles.includes('TENANT_ADMIN')) return '租户管理员';
    if (record.roles.includes('NORMAL_ADMIN')) return '普通管理员';
    return '-';
  };

  const columns = [
    {
      title: '姓名',
      dataIndex: 'username',
      key: 'username',
      width: 140,
      ellipsis: true,
      formItemProps: { label: '姓名/手机号' },
      fieldProps: { placeholder: '请输入姓名或手机号' },
    },
    {
      title: '角色',
      dataIndex: 'role',
      key: 'role',
      width: 100,
      hideInSearch: true,
      render: (_: unknown, record: UserResponse) => renderRole(record),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      valueType: 'select',
      // 后端 status: 1=启用 / 0=禁用 / undefined=全部。
      // 这里给搜索下拉显式提供「全部」选项；queryOptions 里把 'all' 归一为 undefined。
      valueEnum: {
        all: { text: '全部' },
        1: { text: '启用' },
        0: { text: '禁用' },
      },
      initialValue: 'all',
      fieldProps: { allowClear: true },
      render: (_: unknown, record: UserResponse) => {
        const enabled = record.status === 1;
        return (
          <span
            className={styles.statusTag}
            style={{
              backgroundColor: enabled ? '#f0ffed' : '#fff0f6',
              color: enabled ? '#52c41a' : '#eb2f96',
            }}
          >
            {enabled ? '启用' : '禁用'}
          </span>
        );
      },
    },
    {
      title: '已创建社交账号',
      dataIndex: 'boundCount',
      key: 'boundCount',
      width: 130,
      hideInSearch: true,
      render: (_: unknown, record: UserResponse) => record.boundCount ?? 0,
    },
    {
      title: '社交账号创建上限',
      dataIndex: 'personalQuota',
      key: 'personalQuota',
      width: 140,
      hideInSearch: true,
      render: (_: unknown, record: UserResponse) => record.personalQuota ?? '-',
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
      key: 'action',
      width: 220,
      hideInSearch: true,
      render: (_: unknown, record: UserResponse) => {
        const isSelf = currentUser?.id != null && currentUser.id === record.id;
        return (
          <div>
            <Access path="admin:user:update">
              <Button
                type="link"
                size="small"
                onClick={() => handleEdit(record)}
              >
                编辑
              </Button>
            </Access>
            {record.status === 1 ? (
              <Access path="admin:user:disable">
                {/* PRD §4.1：「不能禁用自己」——隐藏按钮 */}
                {!isSelf && (
                  <Button
                    type="link"
                    danger
                    size="small"
                    onClick={() => handleDisable(record)}
                  >
                    禁用
                  </Button>
                )}
              </Access>
            ) : (
              <Access path="admin:user:enable">
                <Button
                  type="link"
                  size="small"
                  onClick={() => handleEnable(record)}
                >
                  启用
                </Button>
              </Access>
            )}
            <Access path="admin:user:reset-password">
              {/* 租户管理员不能重置自己的密码——隐藏按钮 */}
              {!isSelf && (
                <Button
                  type="link"
                  size="small"
                  onClick={() => handleResetPassword(record)}
                >
                  重置密码
                </Button>
              )}
            </Access>
          </div>
        );
      },
    },
  ];

  return (
    <div className={styles.container}>
      <PageHeader
        title="普通管理员管理"
        toolbar={
          <Access path="admin:user:create">
            {(() => {
              // PRD §1.3 / §4.1：套餐 normalAdminLimit 为"管理员总席位（含 TA）"，
              // 普通管理员可创建数 = limit - 1（TA 固定占 1 席）。
              // 已达上限时禁用入口按钮，避免发起注定被后端 60903 拦截的请求。
              const seatFull =
                quotaSummary != null &&
                quotaSummary.normalAdminCount >= quotaSummary.normalAdminLimit;
              const btn = (
                <Button
                  type="primary"
                  onClick={handleCreate}
                  disabled={seatFull}
                >
                  + 新建普通管理员
                </Button>
              );
              return seatFull ? (
                <Tooltip title="管理员席位已达套餐上限（含租户管理员），请先删除现有普通管理员或联系超级管理员升级套餐">
                  {btn}
                </Tooltip>
              ) : (
                btn
              );
            })()}
          </Access>
        }
      />

      <CustomProTable<UserResponse>
        ref={tableRef}
        rowKey="id"
        columns={columns}
        queryOptions={(params) => {
          const { page = 1, pageSize = 10, ...rest } = params;
          // PRD §4.1：列出本公司全部管理员（TENANT_ADMIN + NORMAL_ADMIN）。
          // 显式传 tenantId 以兜底：后端理论上能按 JWT 收敛，但 dev / 测试环境下
          // 当前用户的 tenantId 可能与列表权限范围不一致；前端硬过滤更稳。
          const statusRaw = (rest as { status?: number | string }).status;
          const status =
            statusRaw === undefined ||
            statusRaw === null ||
            statusRaw === '' ||
            statusRaw === 'all'
              ? undefined
              : Number(statusRaw);
          const apiParams: UserListQueryParams = {
            page,
            pageSize,
            tenantId: currentTenantId || undefined,
            keyword: (rest as { username?: string }).username,
            status,
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

      <div className={styles.summary}>
        <span className={styles.summaryIcon} />
        <span>公司总社交账号数上限：</span>
        <span className={styles.summaryHighlight}>
          {quotaSummary ? (
            <>
              已绑定 {quotaSummary.totalBoundCount}
              <span className={styles.summarySeparator}> / </span>
              已分配 {quotaSummary.totalAssigned}
              <span className={styles.summarySeparator}> / </span>
              总上限 {quotaSummary.packageLimit}
            </>
          ) : (
            '加载中…'
          )}
        </span>
        {quotaSummary && (
          <>
            <span className={styles.summarySeparator}>|</span>
            <span>管理员席位（含租户管理员）：</span>
            <span className={styles.summaryHighlight}>
              已创建 {quotaSummary.normalAdminCount}
              <span className={styles.summarySeparator}> / </span>
              套餐上限 {quotaSummary.normalAdminLimit}
            </span>
          </>
        )}
        {quotaSummary?.packageName && (
          <span className={styles.summaryPackage}>
            （当前套餐：{quotaSummary.packageName}）
          </span>
        )}
      </div>

      <AdminFormModal
        open={formModalOpen}
        onClose={() => setFormModalOpen(false)}
        onSuccess={() => {
          setFormModalOpen(false);
          triggerReload();
        }}
        mode={formMode}
        editingUser={editingAdmin}
        tenantId={currentTenantId}
        quotaSummary={quotaSummary ?? null}
        currentUserId={currentUser?.id ?? null}
      />

      {disableTarget && (
        <DisableConfirmModal
          open={disableModalOpen}
          onClose={() => {
            setDisableModalOpen(false);
            setDisableTarget(null);
          }}
          onSuccess={() => {
            setDisableModalOpen(false);
            setDisableTarget(null);
            triggerReload();
          }}
          userId={disableTarget.id}
          adminName={disableTarget.username}
        />
      )}

      {enableTarget && (
        <EnableConfirmModal
          open={enableModalOpen}
          onClose={() => {
            setEnableModalOpen(false);
            setEnableTarget(null);
          }}
          onSuccess={() => {
            setEnableModalOpen(false);
            setEnableTarget(null);
            triggerReload();
          }}
          userId={enableTarget.id}
          adminName={enableTarget.username}
        />
      )}

      {resetPwdTarget && (
        <ResetPasswordModal
          open={resetPwdModalOpen}
          userId={resetPwdTarget.id}
          adminName={resetPwdTarget.username}
          roleLabel={
            resetPwdTarget.roles.includes('TENANT_ADMIN')
              ? '租户管理员'
              : '普通管理员'
          }
          onClose={() => {
            setResetPwdModalOpen(false);
            setResetPwdTarget(null);
          }}
          onSuccess={() => {
            setResetPwdModalOpen(false);
            setResetPwdTarget(null);
            // 重置密码不改可见字段，但走 triggerReload 以同步 updatedAt
            triggerReload();
          }}
        />
      )}
    </div>
  );
};

export default AdminManagementPage;
