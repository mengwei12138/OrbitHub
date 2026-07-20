import { PlusOutlined } from '@ant-design/icons';
import type { ProColumns } from '@ant-design/pro-components';
import { useQuery } from '@tanstack/react-query';
import { Alert, Button, Descriptions, message, Select, Space } from 'antd';
import { useMemo, useRef, useState } from 'react';
import request from '@/api/request';
import { Access, CustomModal } from '@/components';
import CustomProTable from '@/components/CustomProTable';
import type { CustomProTableRef } from '@/components/CustomProTable/types';
import PageHeader from '@/components/PageHeader';
import { packageListQueryOptions } from '@/services/admin-package';
import type {
  TenantListQueryParams,
  TenantResponse,
} from '@/services/admin-tenant';
import { tenantListQueryOptions } from '@/services/admin-tenant';
import CompanyFormModal from './components/CompanyFormModal';
import CreateSuccessModal from './components/CreateSuccessModal';
import DisableConfirmModal from './components/DisableConfirmModal';
import EditCompanyModal from './components/EditCompanyModal';
import EnableConfirmModal from './components/EnableConfirmModal';
import RechargeModal from './components/RechargeModal';
import styles from './style.module.css';

/**
 * 公司管理（超管中心 / 公司管理）。
 * 详见 PRD §3.2。
 *
 * 列表展示：管理员数 = adminCount / adminLimit；社交账号池 = bound / allocated / limit。
 * 动作：列表 / 创建 / 编辑 / 启停 / 充值。
 */
const CompanyManagement: React.FC = () => {
  // 当前选中的公司（被弹窗复用）
  const [currentCompany, setCurrentCompany] = useState<TenantResponse | null>(
    null,
  );

  // 弹窗开关
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [createSuccessModalOpen, setCreateSuccessModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [rechargeModalOpen, setRechargeModalOpen] = useState(false);
  const [packageModalOpen, setPackageModalOpen] = useState(false);
  const [targetPackageId, setTargetPackageId] = useState<string | undefined>();
  const [disableConfirmModalOpen, setDisableConfirmModalOpen] = useState(false);
  const [enableConfirmModalOpen, setEnableConfirmModalOpen] = useState(false);

  // 创建成功后展示给运营的"账号 + 初始密码"
  const [createdInfo, setCreatedInfo] = useState<{
    companyName: string;
    adminAccount: string;
    initialPassword: string;
  } | null>(null);

  // 表格 reload 由 ProTable actionRef 触发，CustomProTable 通过 useImperativeHandle 暴露 reload()
  const tableRef = useRef<CustomProTableRef>(null);
  const triggerReload = () => tableRef.current?.reload();

  // 顶部筛选（PRD §3.2: 套餐 + 状态 + 搜索）。
  // 套餐下拉以套餐 id 为筛选值，"全部" 显式作为列表首项，值为空串 → 在 request 里转成 undefined。
  const { data: packages = [] } = useQuery(packageListQueryOptions());
  const packageOptions = useMemo(
    () => [
      { label: '全部', value: '' },
      ...packages.map((p) => ({ label: p.name, value: p.id })),
    ],
    [packages],
  );
  const selectedPackage = packages.find((p) => p.id === targetPackageId);
  const packageChangeBlocked =
    !!currentCompany &&
    !!selectedPackage &&
    ((currentCompany.adminCount ?? 0) > (selectedPackage.normalAdminLimit ?? 0) ||
      (currentCompany.socialPoolBound ?? 0) >
        selectedPackage.socialAccountLimit);
  const packageDelta =
    selectedPackage && currentCompany?.packagePoints != null
      ? selectedPackage.points - currentCompany.packagePoints
      : 0;

  const submitPackageChange = async () => {
    if (!currentCompany || !targetPackageId || packageChangeBlocked) return;
    try {
      await request.post('/api/v1/prototype/tenants/package-change', {
        tenantId: currentCompany.id,
        packageId: targetPackageId,
      });
      message.success('套餐已变更');
      setPackageModalOpen(false);
      triggerReload();
    } catch (error) {
      message.error(error instanceof Error ? error.message : '套餐变更失败');
    }
  };

  const columns: ProColumns<TenantResponse>[] = [
    {
      title: '公司名称',
      dataIndex: 'name',
      key: 'name',
      ellipsis: true,
      fieldProps: { placeholder: '请输入公司名称', allowClear: true },
    },
    {
      title: '套餐',
      dataIndex: 'packageId',
      key: 'packageId',
      width: 100,
      valueType: 'select',
      fieldProps: {
        placeholder: '全部',
        allowClear: true,
        options: packageOptions,
      },
      render: (_: unknown, record: TenantResponse) => record.packageName ?? '-',
    },
    {
      title: '管理员数',
      dataIndex: 'adminCount',
      key: 'adminCount',
      width: 120,
      hideInSearch: true,
      // PRD §3.2: 格式 已创建 / 套餐上限。
      //   adminCount = 已创建管理员总数（含租户管理员 + 普通管理员）
      //   adminLimit = package.normal_admin_limit（管理员总席位上限，含 TA）
      render: (_: unknown, record: TenantResponse) => {
        const limit = record.adminLimit;
        if (limit == null) return record.adminCount ?? '-';
        return `${record.adminCount ?? 0} / ${limit}`;
      },
    },
    {
      title: '社交账号池',
      dataIndex: 'accountPool',
      key: 'accountPool',
      width: 180,
      hideInSearch: true,
      // 格式：已绑定 / 已分配 / 总上限，后端 socialPoolBound / socialPoolAllocated / socialPoolLimit
      render: (_: unknown, record: TenantResponse) => {
        const limit = record.socialPoolLimit;
        if (limit == null) return '-';
        const allocated = record.socialPoolAllocated ?? 0;
        const bound = record.socialPoolBound ?? 0;
        return `${bound} / ${allocated} / ${limit}`;
      },
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 80,
      valueType: 'select',
      valueEnum: {
        ACTIVE: { text: '启用', status: 'Success' },
        DISABLED: { text: '禁用', status: 'Default' },
      },
      fieldProps: {
        placeholder: '全部',
        allowClear: true,
        options: [
          { label: '全部', value: '' },
          { label: '启用', value: 'ACTIVE' },
          { label: '禁用', value: 'DISABLED' },
        ],
      },
    },
    {
      title: '操作',
      key: 'actions',
      hideInSearch: true,
      width: 280,
      render: (_: unknown, record: TenantResponse) => (
        <div>
          <Access path="admin:tenant:update">
            <Button
              type="link"
              onClick={() => {
                setCurrentCompany(record);
                setEditModalOpen(true);
              }}
            >
              编辑
            </Button>
          </Access>
          <Access path="admin:proxy:tenant-recharge">
            <Button
              type="link"
              onClick={() => {
                setCurrentCompany(record);
                setRechargeModalOpen(true);
              }}
            >
              充值
            </Button>
          </Access>
          <Access path="admin:tenant:update">
            <Button
              type="link"
              onClick={() => {
                setCurrentCompany(record);
                setTargetPackageId(record.packageId);
                setPackageModalOpen(true);
              }}
            >
              套餐变更
            </Button>
          </Access>
          {record.status === 'ACTIVE' ? (
            <Access path="admin:tenant:disable">
              <Button
                type="link"
                danger
                onClick={() => {
                  setCurrentCompany(record);
                  setDisableConfirmModalOpen(true);
                }}
              >
                禁用
              </Button>
            </Access>
          ) : (
            <Access path="admin:tenant:enable">
              <Button
                type="link"
                onClick={() => {
                  setCurrentCompany(record);
                  setEnableConfirmModalOpen(true);
                }}
              >
                启用
              </Button>
            </Access>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className={styles.container}>
      <PageHeader
        title="公司管理"
        toolbar={
          <Access path="admin:tenant:create">
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setFormModalOpen(true)}
            >
              新增公司
            </Button>
          </Access>
        }
      />

      <CustomProTable<TenantResponse>
        ref={tableRef}
        rowKey="id"
        columns={columns}
        // 列表筛选交给 ProTable 内置 search 表单，request 透传 params 到 queryOptions
        queryOptions={(params) => {
          const { page = 1, pageSize = 10, ...rest } = params;
          const apiParams: TenantListQueryParams = {
            page,
            pageSize,
            // ProTable 把状态过滤透传成同名字段；"全部" 选项值为空串，需转 undefined
            status:
              (rest as { status?: 'ACTIVE' | 'DISABLED' | '' }).status ||
              undefined,
            keyword: (rest as { name?: string }).name,
            packageId: (rest as { packageId?: string }).packageId || undefined,
          };
          return {
            queryKey: ['admin-tenant', 'list', apiParams],
            queryFn: async () => {
              const data = await tenantListQueryOptions(apiParams).queryFn();
              return {
                list: data.list ?? [],
                total: data.total ?? 0,
              };
            },
          };
        }}
      />

      <CompanyFormModal
        open={formModalOpen}
        onClose={() => setFormModalOpen(false)}
        onSuccess={(info) => {
          setFormModalOpen(false);
          setCreatedInfo(info);
          setCreateSuccessModalOpen(true);
          triggerReload();
        }}
      />

      <CreateSuccessModal
        open={createSuccessModalOpen}
        companyName={createdInfo?.companyName ?? ''}
        adminAccount={createdInfo?.adminAccount ?? ''}
        initialPassword={createdInfo?.initialPassword ?? ''}
        onClose={() => setCreateSuccessModalOpen(false)}
      />

      {currentCompany && (
        <CustomModal
          open={packageModalOpen}
          title={`套餐变更 - ${currentCompany.name}`}
          width={640}
          submitter={{
            render: () => [
              <Button key="cancel" onClick={() => setPackageModalOpen(false)}>
                取消
              </Button>,
              <Button
                key="submit"
                type="primary"
                disabled={
                  packageChangeBlocked ||
                  !selectedPackage ||
                  selectedPackage.id === currentCompany.packageId
                }
                onClick={submitPackageChange}
              >
                确认变更
              </Button>,
            ],
          }}
          onOpenChange={(visible) => {
            if (!visible) setPackageModalOpen(false);
          }}
        >
          <Space direction="vertical" size={16} style={{ width: '100%' }}>
            <Descriptions column={1} size="small" bordered>
              <Descriptions.Item label="当前套餐">
                {currentCompany.packageName ?? '-'}
              </Descriptions.Item>
              <Descriptions.Item label="目标套餐">
                <Select
                  style={{ width: 220 }}
                  value={targetPackageId}
                  options={packages.map((item) => ({
                    label: item.name,
                    value: item.id,
                  }))}
                  onChange={setTargetPackageId}
                />
              </Descriptions.Item>
              <Descriptions.Item label="管理员上限">
                {currentCompany.adminCount ?? 0} /{' '}
                {currentCompany.adminLimit ?? '-'} →{' '}
                {selectedPackage?.normalAdminLimit ?? '-'}
              </Descriptions.Item>
              <Descriptions.Item label="社交账号上限">
                {currentCompany.socialPoolBound ?? 0} /{' '}
                {currentCompany.socialPoolLimit ?? '-'} →{' '}
                {selectedPackage?.socialAccountLimit ?? '-'}
              </Descriptions.Item>
              <Descriptions.Item label="积分变化预览">
                {packageDelta === 0
                  ? '无变化'
                  : packageDelta > 0
                    ? `套餐积分增加 ${packageDelta.toLocaleString()}`
                    : `套餐积分扣减 ${Math.abs(packageDelta).toLocaleString()}`}
              </Descriptions.Item>
            </Descriptions>
            {packageChangeBlocked ? (
              <Alert
                type="warning"
                showIcon
                message="当前公司用量超过目标套餐额度，需先释放管理员席位或社交账号后才能降级。请联系公司租户管理员。"
              />
            ) : (
              <Alert
                type="info"
                showIcon
                message="原型模式下确认后立即更新本地 mock 数据，并写入套餐变更审计记录。"
              />
            )}
          </Space>
        </CustomModal>
      )}

      {currentCompany && (
        <EditCompanyModal
          open={editModalOpen}
          tenant={currentCompany}
          onClose={() => setEditModalOpen(false)}
          onSuccess={() => {
            setEditModalOpen(false);
            triggerReload();
          }}
        />
      )}

      {currentCompany && (
        <RechargeModal
          open={rechargeModalOpen}
          tenantId={currentCompany.id}
          companyName={currentCompany.name}
          currentPackageName={currentCompany.packageName ?? ''}
          onClose={() => setRechargeModalOpen(false)}
          onSuccess={() => {
            setRechargeModalOpen(false);
            triggerReload();
          }}
        />
      )}

      {currentCompany && (
        <DisableConfirmModal
          open={disableConfirmModalOpen}
          tenantId={currentCompany.id}
          companyName={currentCompany.name}
          onClose={() => setDisableConfirmModalOpen(false)}
          onConfirm={() => {
            setDisableConfirmModalOpen(false);
            triggerReload();
          }}
        />
      )}

      {currentCompany && (
        <EnableConfirmModal
          open={enableConfirmModalOpen}
          tenantId={currentCompany.id}
          companyName={currentCompany.name}
          onClose={() => setEnableConfirmModalOpen(false)}
          onConfirm={() => {
            setEnableConfirmModalOpen(false);
            triggerReload();
          }}
        />
      )}
    </div>
  );
};

export default CompanyManagement;
