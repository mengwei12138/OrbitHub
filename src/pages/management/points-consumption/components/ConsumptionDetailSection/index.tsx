import type { ProColumns } from '@ant-design/pro-components';
import { useQuery } from '@tanstack/react-query';
import { Select } from 'antd';
import dayjs from 'dayjs';
import type React from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { CustomProTable } from '@/components';
import type { CustomProTableRef } from '@/components/CustomProTable/types';
import type { MatrixRecordResponse } from '@/services/admin-proxy';
import { consumeListQueryOptions } from '@/services/admin-proxy';
import { userListQueryOptions } from '@/services/admin-user';
import { formatDateTimeMinute } from '@/utils/date';

import styles from './style.module.css';

const DATE_OPTIONS = [
  { value: 'today', label: '今天' },
  { value: 'yesterday', label: '昨天' },
  { value: 'last7days', label: '最近 7 天' },
  { value: 'last30days', label: '最近 30 天' },
  { value: 'thisMonth', label: '本月' },
  { value: 'lastMonth', label: '上月' },
];

/** 按 remark 文本推断"内容类型"，与超管侧 PointsConsumptionSection 对齐。 */
const resolveContentTypeLabel = (remark: string | null | undefined): string => {
  const text = remark ?? '';
  if (
    text.includes('视频') ||
    text.includes('video') ||
    text.includes('coze')
  ) {
    return '视频生成';
  }
  if (
    text.includes('图文') ||
    text.includes('文案') ||
    text.includes('copywriting')
  ) {
    return '文案生成';
  }
  if (text.includes('提示词') || text.includes('prompt')) {
    return '提示词';
  }
  return '其他';
};

// 上游 Matrix /points/consume 按字面字符串比对 createTime（不识别时区/Z 后缀），
// 故这里必须发本地 YYYY-MM-DD HH:mm:ss，不能用 toISOString()。
const DATETIME_FORMAT = 'YYYY-MM-DD HH:mm:ss';

const presetToRange = (
  preset: string,
): { startTime?: string; endTime?: string } => {
  const now = dayjs();
  switch (preset) {
    case 'today':
      return {
        startTime: now.startOf('day').format(DATETIME_FORMAT),
        endTime: now.endOf('day').format(DATETIME_FORMAT),
      };
    case 'yesterday': {
      const y = now.subtract(1, 'day');
      return {
        startTime: y.startOf('day').format(DATETIME_FORMAT),
        endTime: y.endOf('day').format(DATETIME_FORMAT),
      };
    }
    case 'last30days':
      return {
        startTime: now
          .subtract(29, 'day')
          .startOf('day')
          .format(DATETIME_FORMAT),
        endTime: now.endOf('day').format(DATETIME_FORMAT),
      };
    case 'thisMonth':
      return {
        startTime: now.startOf('month').format(DATETIME_FORMAT),
        endTime: now.endOf('day').format(DATETIME_FORMAT),
      };
    case 'lastMonth': {
      const m = now.subtract(1, 'month');
      return {
        startTime: m.startOf('month').format(DATETIME_FORMAT),
        endTime: m.endOf('month').format(DATETIME_FORMAT),
      };
    }
    default:
      return {
        startTime: now
          .subtract(6, 'day')
          .startOf('day')
          .format(DATETIME_FORMAT),
        endTime: now.endOf('day').format(DATETIME_FORMAT),
      };
  }
};

/** "全部" 哨兵：避免和真实 userId 冲突，提交后端时映射为 undefined（省略参数）。 */
const ALL_ADMINS = '__all__';

/**
 * PRD §4.2 "消耗明细"——租户管理员视角，后端按 JWT 自动收敛本公司。
 *
 * 普通管理员筛选：下拉枚举本公司全部管理员（含租户管理员自己）。选中具体管理员时把
 * sys_user.id 作为 userId 透传给后端；后端通过 taskId → content_generation_log.user_id
 * 回填并本地过滤（详见 MatrixProxyApplicationService.applyOperatorUserIdFilter）。
 */
const ConsumptionDetailSection: React.FC = () => {
  const [datePreset, setDatePreset] = useState<string>('last7days');
  const [adminFilter, setAdminFilter] = useState<string>(ALL_ADMINS);
  const tableRef = useRef<CustomProTableRef>(null);

  // 本公司管理员列表（含 TENANT_ADMIN 自己 + NORMAL_ADMIN）。pageSize=1000 覆盖套餐内合理上限。
  // 数据权限由后端 JWT 收敛，前端不需要显式传 tenantId。
  const { data: adminList = [] } = useQuery({
    queryKey: ['admin-user', 'list', 'consumption-detail-filter'],
    queryFn: async () => {
      const data = await userListQueryOptions({
        page: 1,
        pageSize: 1000,
      }).queryFn();
      return data.list ?? [];
    },
  });

  const adminOptions = useMemo(
    () => [
      { value: ALL_ADMINS, label: '全部' },
      ...adminList.map((u) => ({ value: u.id, label: u.username })),
    ],
    [adminList],
  );

  // CustomProTable 走 request 模式，外部 state 变化不会自动 refetch
  // biome-ignore lint/correctness/useExhaustiveDependencies: 筛选项仅作为变化触发器
  useEffect(() => {
    tableRef.current?.reload();
  }, [datePreset, adminFilter]);

  const columns: ProColumns<MatrixRecordResponse>[] = [
    {
      title: '时间',
      dataIndex: 'createTime',
      key: 'createTime',
      width: 160,
      search: false,
      render: (_, r) => formatDateTimeMinute(r.createTime),
    },
    {
      title: '姓名',
      dataIndex: 'operatorName',
      key: 'operatorName',
      width: 120,
      search: false,
      render: (_, r) => r.operatorName ?? '-',
    },
    {
      title: '任务 ID',
      dataIndex: 'taskId',
      key: 'taskId',
      width: 200,
      search: false,
      ellipsis: true,
      render: (_, r) => r.taskId ?? '-',
    },
    {
      title: '内容类型',
      dataIndex: 'contentType',
      key: 'contentType',
      width: 120,
      search: false,
      render: (_, r) => resolveContentTypeLabel(r.remark),
    },
    {
      title: '消耗',
      dataIndex: 'changePoints',
      key: 'changePoints',
      width: 100,
      search: false,
      render: (_, r) => (
        <span style={{ color: r.changePoints < 0 ? '#ff4d4f' : '#52c41a' }}>
          {r.changePoints === 0 ? '试用' : r.changePoints.toLocaleString()}
        </span>
      ),
    },
    {
      title: '是否使用免费次数',
      dataIndex: 'useFreeTrial',
      key: 'useFreeTrial',
      width: 140,
      search: false,
      render: (_, r) => (r.changePoints === 0 ? '是' : '否'),
    },
    {
      title: '备注',
      dataIndex: 'remark',
      key: 'remark',
      search: false,
      render: (_, r) => r.remark ?? '-',
    },
  ];

  return (
    <section className={styles.consumptionSection}>
      <h3 className={styles.sectionTitle}>消耗明细</h3>
      <div className={styles.filterRow}>
        <div className={styles.filterItem}>
          <span className={styles.filterLabel}>普通管理员筛选</span>
          <Select
            className={styles.filterSelect}
            options={adminOptions}
            value={adminFilter}
            onChange={setAdminFilter}
            showSearch
            optionFilterProp="label"
          />
        </div>
        <div className={styles.filterItem}>
          <span className={styles.filterLabel}>日期筛选</span>
          <Select
            className={styles.filterSelect}
            options={DATE_OPTIONS}
            value={datePreset}
            onChange={setDatePreset}
          />
        </div>
      </div>
      <CustomProTable<MatrixRecordResponse>
        ref={tableRef}
        rowKey="id"
        search={false}
        queryOptions={(params: Record<string, unknown>) => {
          const range = presetToRange(datePreset);
          return consumeListQueryOptions({
            current: (params.page as number | undefined) ?? 1,
            size: (params.pageSize as number | undefined) ?? 10,
            startTime: range.startTime,
            endTime: range.endTime,
            userId: adminFilter === ALL_ADMINS ? undefined : adminFilter,
          });
        }}
        columns={columns}
        tableAlertOptionRender={false}
        toolBarRender={false}
      />
    </section>
  );
};

export default ConsumptionDetailSection;
