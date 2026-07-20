import type { ProColumns } from '@ant-design/pro-components';
import { Button } from 'antd';
import { CustomProTable } from '@/components';
import type { TenantResponse } from '@/services/admin-tenant';
import { tenantListQueryOptions } from '@/services/admin-tenant';

import styles from './style.module.css';

interface CompanyPointsRow {
  id: string;
  companyName: string;
  packagePoints: number | null;
  rechargePoints: number | null;
  totalRemaining: number | null;
  monthConsume: number | null;
  freeVideoUsed: number | null;
  freeVideoRemaining: number | null;
  adminCount: number | null;
  balanceError: string | null;
}

interface PointsOverviewSectionProps {
  onDrillDown: (tenantId: string) => void;
}

/**
 * 各公司积分总览。
 *
 * 数据源：`GET /api/v1/admin/tenants?withBalance=true`。
 * 后端会在分页查询基础上对本页每行调外部 `/balance` + 聚合 `/points/consume` 本月消耗，
 * 走 Redis 10s 缓存 + per-tenantId 单飞，避免上游被打挂。充值成功后后端主动失效缓存，
 * 超管充完值刷新即可看到新值。
 * 行级降级：余额或月消耗拉取失败时对应 *Error 字段非空，相关余额字段回填 "-"。
 */
const PointsOverviewSection: React.FC<PointsOverviewSectionProps> = ({
  onDrillDown,
}) => {
  const formatNumber = (v: number | null) =>
    v == null ? '-' : v.toLocaleString();

  const columns: ProColumns<CompanyPointsRow>[] = [
    {
      title: '公司名称',
      dataIndex: 'companyName',
      key: 'companyName',
      width: 150,
      ellipsis: true,
    },
    {
      title: '套餐积分',
      dataIndex: 'packagePoints',
      key: 'packagePoints',
      width: 110,
      render: (_, r) => formatNumber(r.packagePoints),
    },
    {
      title: '充值积分',
      dataIndex: 'rechargePoints',
      key: 'rechargePoints',
      width: 110,
      render: (_, r) => formatNumber(r.rechargePoints),
    },
    {
      title: '总剩余',
      dataIndex: 'totalRemaining',
      key: 'totalRemaining',
      width: 110,
      render: (_, r) => formatNumber(r.totalRemaining),
    },
    {
      title: '本月消耗',
      dataIndex: 'monthConsume',
      key: 'monthConsume',
      width: 110,
      render: (_, r) => formatNumber(r.monthConsume),
    },
    {
      title: '剩余免费次数',
      dataIndex: 'freeVideo',
      key: 'freeVideo',
      width: 140,
      render: (_, r) =>
        r.freeVideoRemaining == null || r.freeVideoUsed == null
          ? '-'
          : `${r.freeVideoUsed} / ${r.freeVideoUsed + r.freeVideoRemaining}`,
    },
    {
      title: '管理员数',
      dataIndex: 'adminCount',
      key: 'adminCount',
      width: 110,
      render: (_, r) => (r.adminCount == null ? '-' : r.adminCount),
    },
    {
      title: '操作',
      key: 'actions',
      width: 100,
      render: (_, r) => (
        <Button type="link" onClick={() => onDrillDown(r.id)}>
          明细
        </Button>
      ),
    },
  ];

  return (
    <div className={styles.section}>
      <h3 className={styles.sectionTitle}>各公司积分总览</h3>
      <div className={styles.tableCard}>
        <CustomProTable<CompanyPointsRow>
          rowKey="id"
          columns={columns}
          search={false}
          queryOptions={(params) => {
            const opts = tenantListQueryOptions({
              page: params.page,
              pageSize: params.pageSize,
              withBalance: true,
            });
            return {
              queryKey: opts.queryKey,
              queryFn: async () => {
                const res = await opts.queryFn();
                const list: CompanyPointsRow[] = (res.list ?? []).map(
                  (r: TenantResponse) => {
                    const rechargePoints = r.totalRecharge ?? null;
                    return {
                      id: r.id,
                      companyName: r.name,
                      packagePoints: r.packagePoints,
                      rechargePoints,
                      totalRemaining: r.totalPoints ?? null,
                      monthConsume: r.monthConsume ?? null,
                      freeVideoUsed: r.freeVideoUsed ?? null,
                      freeVideoRemaining: r.freeVideoRemaining ?? null,
                      adminCount: r.adminCount,
                      balanceError: r.balanceError ?? null,
                    };
                  },
                );
                return { list, total: res.total };
              },
            };
          }}
        />
      </div>
    </div>
  );
};

export default PointsOverviewSection;
