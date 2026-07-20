import { SearchOutlined } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { Select } from 'antd';
import dayjs from 'dayjs';
import type React from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { CustomProTable } from '@/components';
import type { CustomProTableRef } from '@/components/CustomProTable/types';
import type { MatrixRecordResponse } from '@/services/admin-proxy';
import { consumeListQueryOptions } from '@/services/admin-proxy';
import { tenantListQueryOptions } from '@/services/admin-tenant';
import { formatDateTimeMinute } from '@/utils/date';

import styles from './style.module.css';

const DATE_RANGE_OPTIONS = [
  { value: 'today', label: '今天' },
  { value: 'yesterday', label: '昨天' },
  { value: 'last7days', label: '最近 7 天' },
  { value: 'last30days', label: '最近 30 天' },
  { value: 'thisMonth', label: '本月' },
  { value: 'lastMonth', label: '上月' },
];

/** 按 remark 文本推断"内容类型"，与后端 ContentGenerationCreditsLogService.resolveContentType 对齐。 */
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

interface PointsConsumptionSectionProps {
  /** undefined = 未选择；选中具体公司时 PLATFORM_ADMIN 才会调 consume 接口（后端必传 tenantId） */
  tenantId: string | undefined;
  onTenantChange: (tenantId: string | undefined) => void;
}

/** PRD §3.3 "积分消耗明细"——超管视角，按公司 + 日期预设过滤 */
const PointsConsumptionSection: React.FC<PointsConsumptionSectionProps> = ({
  tenantId,
  onTenantChange,
}) => {
  const [datePreset, setDatePreset] = useState<string>('last7days');
  const tableRef = useRef<CustomProTableRef>(null);

  // 筛选条件变化时主动 reload —— CustomProTable 走 ProTable.request 模式，
  // 外部 state（tenantId / datePreset）变了不会自动 refetch。
  // biome-ignore lint/correctness/useExhaustiveDependencies: tenantId/datePreset 不在 effect body 中读取，但需要作为变化触发器
  useEffect(() => {
    tableRef.current?.reload();
  }, [tenantId, datePreset]);

  const { data: tenants = [] } = useQuery({
    queryKey: ['admin-tenant', 'list', 'all-for-consume-filter'],
    queryFn: async () => {
      const data = await tenantListQueryOptions({
        page: 1,
        pageSize: 1000,
      }).queryFn();
      return data.list ?? [];
    },
  });

  const tenantOptions = useMemo(
    () => tenants.map((t) => ({ value: t.id, label: t.name })),
    [tenants],
  );

  // 查询启用时 tenantId 必然有值（见下方 enabled 守卫），所有行都属于同一租户。
  const selectedTenantName = useMemo(
    () => tenants.find((t) => t.id === tenantId)?.name ?? '-',
    [tenants, tenantId],
  );

  return (
    <div className={styles.section}>
      <h3 className={styles.sectionTitle}>积分消耗明细</h3>
      <div className={styles.filterRow}>
        <span className={styles.filterLabel}>租户筛选</span>
        <Select
          className={styles.tenantSearch}
          options={tenantOptions}
          value={tenantId}
          onChange={(v) => onTenantChange(v || undefined)}
          showSearch
          allowClear
          optionFilterProp="label"
          placeholder="请输入公司名称搜索"
          suffixIcon={<SearchOutlined />}
        />
        <span className={styles.filterLabel}>日期筛选</span>
        <Select
          className={styles.filterSelect}
          options={DATE_RANGE_OPTIONS}
          value={datePreset}
          onChange={setDatePreset}
        />
      </div>

      <div className={styles.tableCard}>
        <CustomProTable<MatrixRecordResponse>
          ref={tableRef}
          rowKey="id"
          search={false}
          queryOptions={(params: Record<string, unknown>) => {
            // PLATFORM_ADMIN 必须选具体公司才能查 consume（后端约束）
            // 没选时给出空 query，但仍发请求以让用户看到错误（更易排查）。
            const range = presetToRange(datePreset);
            return {
              ...consumeListQueryOptions({
                tenantId,
                current: (params.page as number | undefined) ?? 1,
                size: (params.pageSize as number | undefined) ?? 10,
                startTime: range.startTime,
                endTime: range.endTime,
              }),
              // 未选公司时禁用查询，避免 PLATFORM_ADMIN 在加载即触发后端 VALIDATION_ERROR
              enabled: !!tenantId,
            };
          }}
          columns={[
            {
              title: '时间',
              dataIndex: 'createTime',
              key: 'createTime',
              width: 160,
              hideInSearch: true,
              render: (_, r) => formatDateTimeMinute(r.createTime),
            },
            {
              title: '租户',
              dataIndex: 'tenantName',
              key: 'tenantName',
              width: 160,
              hideInSearch: true,
              render: () => selectedTenantName,
            },
            {
              title: '内容类型',
              dataIndex: 'contentType',
              key: 'contentType',
              width: 120,
              hideInSearch: true,
              render: (_, r) => resolveContentTypeLabel(r.remark),
            },
            {
              title: '消耗',
              dataIndex: 'changePoints',
              key: 'changePoints',
              width: 100,
              hideInSearch: true,
              render: (_, r) => (
                <span
                  style={{
                    color: r.changePoints < 0 ? '#ff4d4f' : '#52c41a',
                  }}
                >
                  {r.changePoints === 0
                    ? '试用'
                    : r.changePoints.toLocaleString()}
                </span>
              ),
            },
            {
              title: '是否使用免费次数',
              dataIndex: 'useFreeTrial',
              key: 'useFreeTrial',
              width: 160,
              hideInSearch: true,
              render: (_, r) => (r.changePoints === 0 ? '是' : '否'),
            },
          ]}
          tableAlertOptionRender={false}
          toolBarRender={false}
        />
        {!tenantId && (
          <div className={styles.hint}>请选择一家公司查看其积分消耗明细</div>
        )}
      </div>
    </div>
  );
};

export default PointsConsumptionSection;
