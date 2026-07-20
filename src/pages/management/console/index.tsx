import { useQuery } from '@tanstack/react-query';
import { Button } from 'antd';
import type React from 'react';
import { useRef } from 'react';
import { PageHeader } from '@/components';
import { tenantStatsQueryOptions } from '@/services/admin-tenant';

import RecentActivityTable, {
  type RecentActivityTableRef,
} from './components/RecentActivity';
import StatsBoard from './components/StatsBoard';
import styles from './style.module.css';

/**
 * 控制台（超管中心）— PRD §3.1
 *
 * - 运营看板：总租户数（仅统计 ACTIVE，不含禁用）+ 较上月变化
 * - 最近动态：按 PRD 表头 时间 / 操作人 / 操作内容；表格自身分页 + 切换每页条数
 *   操作人 / 操作内容 都是后端写时快照（operatorLabel + operationContent），前端拿来即用。
 */
const ConsolePage: React.FC = () => {
  const { data: tenantStats, refetch: refetchTenantStats } = useQuery({
    ...tenantStatsQueryOptions(),
  });

  const recentActivityRef = useRef<RecentActivityTableRef>(null);

  // PRD §3.1：较上月 +N = 本月按 created_at 创建数 - 上月按 created_at 创建数（仅 ACTIVE，不含禁用）
  const totalTenants = tenantStats?.total ?? 0;
  const monthDelta = tenantStats?.monthDelta ?? 0;
  const deltaLabel = `较上月 ${monthDelta >= 0 ? '+' : ''}${monthDelta}`;
  const statsData = [
    { value: totalTenants, label: '总租户数', delta: deltaLabel },
  ];

  const handleRefresh = () => {
    refetchTenantStats();
    recentActivityRef.current?.reload();
  };

  return (
    <div className={styles.container}>
      <PageHeader
        title="控制台"
        toolbar={<Button onClick={handleRefresh}>刷新</Button>}
      />

      <div className={styles.content}>
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>运营看板</h2>
          <StatsBoard stats={statsData} />
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>最近动态</h2>
          <RecentActivityTable ref={recentActivityRef} />
        </section>
      </div>
    </div>
  );
};

export default ConsolePage;
