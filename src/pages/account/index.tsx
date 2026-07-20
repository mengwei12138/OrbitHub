import { DeleteOutlined } from '@ant-design/icons';
import type { ProColumns } from '@ant-design/pro-components';
import { useQuery } from '@tanstack/react-query';
import { Button, message, Select, Space, Tooltip } from 'antd';
import { useCallback, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import request from '@/api/request';
import {
  CustomModal,
  CustomProTable,
  PageHeader,
  PLATFORM_CONFIG,
  PlatformIcon,
} from '@/components';
import type { CustomProTableRef } from '@/components/CustomProTable/types';
import {
  ACCOUNT_RUN_STATUS,
  ACCOUNT_RUN_STATUS_VALUE_ENUM,
  accountListQueryOptions,
  accountRunStatusCanDelete,
  useBatchDeleteAccounts,
  useBatchStartAccounts,
  useBatchStopAccounts,
  useDeleteAccount,
  useStartAccount,
  useStopAccount,
} from '@/services/account';
import type {
  AccountResponse,
  AccountRunStatus,
  PlatformCode,
} from '@/services/account/types';
import { myQuotaStatusQueryOptions } from '@/services/admin-user-quota';
import { useUserStore } from '@/store/modules/userStore';
import { formatThousands } from '@/utils/money';

import StatusBadge from './components/StatusBadge';
import TableToolbar from './components/TableToolbar';
import styles from './style.module.css';

const Account: React.FC = () => {
  const navigate = useNavigate();
  const tableRef = useRef<CustomProTableRef>(null);
  const roles = useUserStore((state) => state.roles);
  const userInfo = useUserStore((state) => state.userInfo);
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);
  const [selectedRows, setSelectedRows] = useState<AccountResponse[]>([]);
  const [tableLoading, setTableLoading] = useState(false);
  const [ownershipAction, setOwnershipAction] = useState<
    'assign' | 'transfer' | null
  >(null);
  const [ownershipAccount, setOwnershipAccount] =
    useState<AccountResponse | null>(null);
  const [targetOwnerId, setTargetOwnerId] = useState<string>('user-normal');

  const { mutate: startAccount } = useStartAccount();
  const { mutate: stopAccount } = useStopAccount();
  const { mutate: deleteAccount } = useDeleteAccount();
  const { mutate: batchStartAccounts } = useBatchStartAccounts();
  const { mutate: batchStopAccounts } = useBatchStopAccounts();
  const { mutate: batchDeleteAccounts } = useBatchDeleteAccounts();

  // 列表页「+ 添加账号」按钮的席位预检：与添加页保持同口径，避免用户进入表单后才被拒绝。
  const quotaStatusQuery = useQuery(myQuotaStatusQueryOptions());
  const quotaExhausted =
    !!quotaStatusQuery.data &&
    !quotaStatusQuery.data.unlimited &&
    (quotaStatusQuery.data.available ?? 0) <= 0;
  const quotaTooltipMessage = quotaExhausted
    ? `席位不足：个人上限 ${quotaStatusQuery.data?.personalQuota ?? 0}，已绑定 ${quotaStatusQuery.data?.currentBoundCount ?? 0}，请联系租户管理员上调。`
    : '';

  const handleStart = useCallback(
    (id: string) => {
      CustomModal.confirm({
        title: '确认启动',
        content: '即将启动该账号',
        onOk: () => {
          startAccount(id, {
            onSuccess: () => {
              message.success('已启动该账号');
              tableRef.current?.reload();
            },
          });
        },
      });
    },
    [startAccount],
  );

  const handleStop = useCallback(
    (id: string) => {
      CustomModal.confirm({
        title: '确认停止',
        content: '即将停止该账号，停止后该账号将无法承载任务',
        onOk: () => {
          stopAccount(id, {
            onSuccess: () => {
              message.success('已停止该账号');
              tableRef.current?.reload();
            },
          });
        },
      });
    },
    [stopAccount],
  );

  const handleReactivate = useCallback(
    (id: string) => {
      navigate(`/account/add?mode=reactivate&accountId=${id}`);
    },
    [navigate],
  );

  const handleDelete = useCallback(
    (id: string, nickname: string) => {
      CustomModal.confirm({
        title: '确认删除',
        content: `确定要删除账号 ${nickname} 吗？删除后不可恢复`,
        okType: 'danger',
        onOk: () => {
          deleteAccount(id, {
            onSuccess: () => {
              message.success('已删除账号');
              tableRef.current?.reload();
            },
          });
        },
      });
    },
    [deleteAccount],
  );

  const handleBatchStop = useCallback(() => {
    const onlineIds = selectedRows
      .filter((row) => row.status === ACCOUNT_RUN_STATUS.ONLINE)
      .map((row) => row.id);
    CustomModal.confirm({
      title: '确认批量停止',
      content: `即将停止选中的 ${onlineIds.length} 个在线账号`,
      onOk: () => {
        setTableLoading(true);
        batchStopAccounts(
          { ids: onlineIds },
          {
            onSuccess: () => {
              message.success(`已批量停止 ${onlineIds.length} 个账号`);
              setSelectedRowKeys([]);
              setSelectedRows([]);
              setTableLoading(false);
              tableRef.current?.reload();
            },
            onError: (error) => {
              message.error(error?.message || '批量停止失败，请重试');
              setTableLoading(false);
            },
          },
        );
      },
    });
  }, [batchStopAccounts, selectedRows]);

  const handleBatchStart = useCallback(() => {
    const stoppedIds = selectedRows
      .filter((row) => row.status === ACCOUNT_RUN_STATUS.STOPPED)
      .map((row) => row.id);
    CustomModal.confirm({
      title: '确认批量启动',
      content: `即将启动选中的 ${stoppedIds.length} 个已停止账号`,
      onOk: () => {
        setTableLoading(true);
        batchStartAccounts(
          { ids: stoppedIds },
          {
            onSuccess: () => {
              message.success(`已批量启动 ${stoppedIds.length} 个账号`);
              setSelectedRowKeys([]);
              setSelectedRows([]);
              setTableLoading(false);
              tableRef.current?.reload();
            },
            onError: (error) => {
              message.error(error?.message || '批量启动失败，请重试');
              setTableLoading(false);
              tableRef.current?.reload();
            },
          },
        );
      },
    });
  }, [batchStartAccounts, selectedRows]);

  const handleBatchDelete = useCallback(() => {
    CustomModal.confirm({
      title: '确认删除',
      content: `确定要删除选中的 ${selectedRowKeys.length} 个账号吗？删除后不可恢复`,
      okType: 'danger',
      onOk: () => {
        setTableLoading(true);
        batchDeleteAccounts(
          { ids: selectedRowKeys },
          {
            onSuccess: () => {
              message.success(`已批量删除 ${selectedRowKeys.length} 个账号`);
              setSelectedRowKeys([]);
              setSelectedRows([]);
              setTableLoading(false);
              tableRef.current?.reload();
            },
            onError: (error) => {
              message.error(error?.message || '批量删除失败，请重试');
              setTableLoading(false);
              tableRef.current?.reload();
            },
          },
        );
      },
    });
  }, [batchDeleteAccounts, selectedRowKeys]);

  const handleRefresh = useCallback(() => {
    tableRef.current?.reload();
  }, []);

  const isTenantAdmin = roles.includes('TENANT_ADMIN');
  const isNormalAdmin = roles.includes('NORMAL_ADMIN');
  const normalAdminOptions = [
    { label: '李运营', value: 'user-normal' },
    { label: '王运营', value: 'user-normal-2' },
  ];
  const assignOwnerOptions = isTenantAdmin
    ? [{ label: '张主管（租户管理员）', value: 'user-tenant' }, ...normalAdminOptions]
    : normalAdminOptions;

  const openOwnershipModal = useCallback(
    (
      record: AccountResponse,
      action: 'assign' | 'transfer',
    ) => {
      setOwnershipAccount(record);
      setOwnershipAction(action);
      if (action === 'transfer') {
        setTargetOwnerId(
          record.ownerUserId === 'user-normal' ? 'user-normal-2' : 'user-normal',
        );
      } else {
        setTargetOwnerId('user-normal');
      }
    },
    [],
  );

  const closeOwnershipModal = useCallback(() => {
    setOwnershipAction(null);
    setOwnershipAccount(null);
  }, []);

  const submitOwnershipChange = useCallback(async () => {
    if (!ownershipAccount || !ownershipAction) return;
    try {
      await request.post('/api/v1/prototype/accounts/ownership', {
        accountId: ownershipAccount.id,
        targetUserId: targetOwnerId,
        action: ownershipAction,
      });
      message.success('账号归属已更新');
      closeOwnershipModal();
      tableRef.current?.reload();
    } catch (error) {
      message.error(error instanceof Error ? error.message : '归属变更失败');
    }
  }, [
    closeOwnershipModal,
    ownershipAccount,
    ownershipAction,
    targetOwnerId,
  ]);

  const renderOwnershipButton = (
    record: AccountResponse,
    action: 'assign' | 'transfer',
    label: string,
  ) => {
    const stopped = record.status === ACCOUNT_RUN_STATUS.STOPPED;
    const isCurrentNormalOwner = record.ownerUserId === userInfo?.id;
    const disabled =
      !stopped || (action === 'transfer' && !isCurrentNormalOwner);
    const tooltip = !stopped
      ? '需先停止账号后才能变更归属'
      : action === 'transfer' && !isCurrentNormalOwner
        ? '只能移交本人名下账号'
        : '';
    return (
      <Tooltip title={tooltip}>
        <Button
          type="link"
          size="small"
          disabled={disabled}
          onClick={() => openOwnershipModal(record, action)}
        >
          {label}
        </Button>
      </Tooltip>
    );
  };

  const columns = useMemo(
    (): ProColumns<AccountResponse>[] => [
      {
        title: '平台',
        dataIndex: 'platform',
        valueType: 'select',
        valueEnum: Object.fromEntries(
          Object.entries(PLATFORM_CONFIG).map(([key, val]) => [
            key,
            { text: val.label },
          ]),
        ),
        hideInTable: true,
      },
      {
        title: '账号状态',
        dataIndex: 'status',
        valueType: 'select',
        fieldProps: { placeholder: '全部' },
        valueEnum: ACCOUNT_RUN_STATUS_VALUE_ENUM,
        hideInTable: true,
      },
      {
        title: '关键词',
        dataIndex: 'keyword',
        valueType: 'text',
        formItemProps: {
          label: null,
        },
        fieldProps: {
          placeholder: '搜索账号昵称 / 手机号…',
        },
        hideInTable: true,
      },
      {
        title: '平台',
        dataIndex: 'platform',
        hideInSearch: true,
        width: 120,
        render: (_: React.ReactNode, record: AccountResponse) => {
          const platform = record.platform;
          return (
            <Space size={4}>
              <PlatformIcon platform={platform} />
              <span>
                {PLATFORM_CONFIG[platform as keyof typeof PLATFORM_CONFIG]
                  ?.label ?? platform}
              </span>
            </Space>
          );
        },
      },
      {
        title: '账号',
        dataIndex: 'nickname',
        hideInSearch: true,
        width: 220,
        render: (_, record) => (
          <Space direction="vertical" size={0}>
            <span className={styles.accountNickname}>{record.nickname}</span>
            <span className={styles.accountPhone}>{record.phoneNumber}</span>
          </Space>
        ),
      },
      {
        title: '粉丝数',
        dataIndex: 'followers',
        hideInSearch: true,
        width: 100,
        render: (val: unknown) => (
          <span className={styles.followers}>
            {val ? formatThousands(Number(val), 0) : '-'}
          </span>
        ),
      },
      {
        title: '状态',
        dataIndex: 'status',
        hideInSearch: true,
        width: 80,
        render: (status: unknown) => <StatusBadge status={status as string} />,
      },
      {
        title: '归属管理员',
        dataIndex: 'ownerName',
        hideInSearch: true,
        width: 120,
        render: (_, record) => record.ownerName ?? '-',
      },
      {
        title: '操作',
        key: 'actions',
        hideInSearch: true,
        width: 180,
        render: (_, record) => (
          <Space size={12}>
            <Button
              type="link"
              size="small"
              onClick={() => navigate(`/account/logs?accountId=${record.id}`)}
            >
              日志
            </Button>
            {record.status === ACCOUNT_RUN_STATUS.ONLINE && (
              <Button
                size="small"
                className={styles.stopBtn}
                onClick={() => handleStop(record.id)}
              >
                停止
              </Button>
            )}
            {record.status === ACCOUNT_RUN_STATUS.STOPPED && (
              <Button
                size="small"
                className={styles.startBtn}
                onClick={() => handleStart(record.id)}
              >
                启动
              </Button>
            )}
            {record.status === ACCOUNT_RUN_STATUS.INVALID && (
              <Button
                size="small"
                type="primary"
                onClick={() => handleReactivate(record.id)}
              >
                重新登录
              </Button>
            )}
            {isTenantAdmin &&
              renderOwnershipButton(record, 'assign', '分配')}
            {isNormalAdmin &&
              renderOwnershipButton(record, 'transfer', '移交')}
          </Space>
        ),
      },
      {
        title: '删除',
        key: 'delete',
        hideInSearch: true,
        width: 60,
        render: (_, record) => {
          const canDelete = accountRunStatusCanDelete(record.status);
          return (
            <DeleteOutlined
              style={{
                color: canDelete ? '#ff4d4f' : '#d9d9d9',
                cursor: canDelete ? 'pointer' : 'not-allowed',
                fontSize: 16,
              }}
              onClick={() => {
                if (!canDelete) {
                  message.warning(
                    record.status === ACCOUNT_RUN_STATUS.ONLINE
                      ? '请先停止账号后再删除'
                      : '当前状态不可删除',
                  );
                  return;
                }
                handleDelete(record.id, record.nickname);
              }}
            />
          );
        },
      },
    ],
    [
      navigate,
      handleStop,
      handleStart,
      handleDelete,
      handleReactivate,
      isTenantAdmin,
      isNormalAdmin,
      renderOwnershipButton,
    ],
  );

  return (
    <div className={styles.container}>
      <PageHeader
        title="账号管理"
        toolbar={
          <Tooltip title={quotaTooltipMessage}>
            <Button
              type="primary"
              onClick={() => {
                navigate('/account/add');
              }}
            >
              + 添加账号
            </Button>
          </Tooltip>
        }
      />

      <CustomProTable<AccountResponse>
        ref={tableRef}
        queryOptions={(params) =>
          accountListQueryOptions({
            page: params?.page,
            pageSize: params?.pageSize,
            keyword: params?.keyword as string | undefined,
            platform: params?.platform as PlatformCode | undefined,
            status: params?.status as AccountRunStatus | undefined,
          })
        }
        columns={columns}
        rowKey="id"
        loading={tableLoading}
        headerTitle={
          <TableToolbar
            selectedRowKeys={selectedRowKeys}
            selectedRows={selectedRows}
            onBatchStop={handleBatchStop}
            onBatchStart={handleBatchStart}
            onBatchDelete={handleBatchDelete}
            onRefresh={handleRefresh}
          />
        }
        rowSelection={{
          selectedRowKeys,
          onChange: (keys, rows) => {
            setSelectedRowKeys(keys as string[]);
            setSelectedRows(rows);
          },
        }}
      />

      <CustomModal
        open={!!ownershipAction && !!ownershipAccount}
        title={
          ownershipAction === 'transfer'
              ? '移交社交账号'
              : '分配社交账号'
        }
        width={520}
        submitter={{
          render: () => [
            <Button key="cancel" onClick={closeOwnershipModal}>
              取消
            </Button>,
            <Button
              key="submit"
              type="primary"
              onClick={submitOwnershipChange}
            >
              确认变更
            </Button>,
          ],
        }}
        onOpenChange={(visible) => {
          if (!visible) closeOwnershipModal();
        }}
      >
        <Space direction="vertical" size={14} style={{ width: '100%' }}>
          <div>
            <span style={{ color: '#8c8c8c' }}>社交账号：</span>
            <span>{ownershipAccount?.nickname ?? '-'}</span>
          </div>
          <div>
            <span style={{ color: '#8c8c8c' }}>原归属：</span>
            <span>{ownershipAccount?.ownerName ?? '-'}</span>
          </div>
          <div>
            <span style={{ color: '#8c8c8c' }}>目标归属：</span>
            <Select
              style={{ width: 220 }}
              value={targetOwnerId}
              options={
                ownershipAction === 'transfer'
                  ? normalAdminOptions.filter(
                      (option) => option.value !== ownershipAccount?.ownerUserId,
                    )
                  : assignOwnerOptions
              }
              onChange={setTargetOwnerId}
            />
          </div>
          <div style={{ color: '#8c8c8c', lineHeight: 1.7 }}>
            影响说明：账号归属变更后，发布、AI 助手和数据中心中的账号可见范围会按新归属展示；本原型仅更新本地 mock 数据并写入评审审计记录。
          </div>
        </Space>
      </CustomModal>
    </div>
  );
};

export default Account;
