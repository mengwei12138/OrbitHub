import { DownloadOutlined } from '@ant-design/icons';
import { Button, message } from 'antd';
import dayjs from 'dayjs';
import type React from 'react';
import { useRef, useState } from 'react';
import { PageHeader } from '@/components';
import type { TenantResponse } from '@/services/admin-tenant';
import { tenantListQueryOptions } from '@/services/admin-tenant';

import PointsConsumptionSection from './components/PointsConsumptionSection';
import PointsOverviewSection from './components/PointsOverviewSection';

import styles from './style.module.css';

const EXPORT_PAGE_SIZE = 1000;

const formatCell = (v: number | string | null | undefined) =>
  v == null ? '-' : String(v);

const escapeCsv = (v: string) =>
  /[",\n\r]/u.test(v) ? `"${v.replace(/"/gu, '""')}"` : v;

const buildOverviewCsv = (rows: TenantResponse[]) => {
  const header = [
    '公司名称',
    '套餐积分',
    '充值积分',
    '总剩余',
    '本月消耗',
    '剩余免费次数',
    '管理员数',
  ];
  const lines = rows.map((r) => {
    const freeText =
      r.freeVideoRemaining == null || r.freeVideoUsed == null
        ? '-'
        : `${r.freeVideoUsed} / ${r.freeVideoUsed + r.freeVideoRemaining}`;
    const rechargePoints = r.totalRecharge ?? null;
    return [
      r.name,
      formatCell(r.packagePoints),
      formatCell(rechargePoints),
      formatCell(r.totalPoints ?? null),
      formatCell(r.monthConsume ?? null),
      freeText,
      formatCell(r.adminCount),
    ]
      .map((c) => escapeCsv(c))
      .join(',');
  });
  return `${[header.join(','), ...lines].join('\r\n')}\r\n`;
};

const downloadCsv = (filename: string, csv: string) => {
  // BOM (﻿) 让 Excel 正确识别 UTF-8 中文
  const blob = new Blob(['﻿', csv], {
    type: 'text/csv;charset=utf-8',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

/**
 * 全局积分管理（超管中心）。PRD §3.3。
 *
 * 上方"各公司积分总览"：列出所有公司 + 每个公司的余额（按需懒加载 balance）。
 * 下方"积分消耗明细"：可按租户 + 日期预设筛选 consume 流水。
 * 点击某公司的 [明细] → 自动把下方筛选切到该公司，并滚动定位。
 */
const PointsManagement: React.FC = () => {
  const [filterTenantId, setFilterTenantId] = useState<string | undefined>();
  const [exporting, setExporting] = useState(false);
  const consumptionRef = useRef<HTMLDivElement>(null);

  const handleDrillDown = (tenantId: string) => {
    setFilterTenantId(tenantId);
    requestAnimationFrame(() => {
      consumptionRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    });
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const opts = tenantListQueryOptions({
        page: 1,
        pageSize: EXPORT_PAGE_SIZE,
        withBalance: true,
      });
      const res = await opts.queryFn();
      const rows = res.list ?? [];
      if (rows.length === 0) {
        message.info('暂无可导出的数据');
        return;
      }
      const csv = buildOverviewCsv(rows);
      downloadCsv(`全局积分管理_${dayjs().format('YYYYMMDD_HHmmss')}.csv`, csv);
      message.success('报表已开始下载');
    } catch (e) {
      message.error((e as Error).message || '导出失败');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className={styles.container}>
      <PageHeader
        title="全局积分管理"
        toolbar={
          <Button
            icon={<DownloadOutlined />}
            loading={exporting}
            onClick={handleExport}
          >
            导出报表
          </Button>
        }
      />

      <PointsOverviewSection onDrillDown={handleDrillDown} />

      <div ref={consumptionRef}>
        <PointsConsumptionSection
          tenantId={filterTenantId}
          onTenantChange={setFilterTenantId}
        />
      </div>
    </div>
  );
};

export default PointsManagement;
