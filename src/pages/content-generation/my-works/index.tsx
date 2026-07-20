import { useQuery } from '@tanstack/react-query';
import { message, Spin } from 'antd';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components';
import {
  mapWorkSummaryToItem,
  worksListQueryOptions,
} from '@/services/content-generation';
import { useUserStore } from '@/store/modules/userStore';
import { MY_WORKS_TITLE_TENANT, MY_WORKS_TITLE_USER } from '../constants';
import { BackButton } from '../video-generation/components/BackButton';
import EmptyStateCard from './components/EmptyStateCard';
import WorkFilterTabs from './components/WorkFilterTabs';
import WorkListTable from './components/WorkListTable';
import styles from './style.module.css';
import type { WorkItem } from './types';
import {
  navigateToPublishWork,
  resolveWorkDetailPath,
  resolveWorkRegeneratePath,
} from './utils/workActions';

const DEFAULT_PAGE_SIZE = 10;

const MyWorksPage = () => {
  const navigate = useNavigate();
  // 租户管理员视角下展示团队全部作品 + 每行 owner；普通管理员仅本人作品。
  // 数据隔离由后端按 JWT 角色强制，前端按 roles 决定标题与 owner 列。
  const isTenantAdmin = useUserStore(
    (s) => s.roles?.includes('TENANT_ADMIN') ?? false,
  );
  const [filterType, setFilterType] = useState<'all' | 'video' | 'image'>(
    'all',
  );
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const listQuery = useQuery({
    ...worksListQueryOptions({
      page,
      pageSize,
      type: filterType,
    }),
    // 当列表里存在「生成中」的作品时，每 15s 自动刷新一次，让状态最终一致。
    refetchInterval: (query) => {
      const hasProcessing = (query.state.data?.list ?? []).some(
        (w) => w.status === 'processing',
      );
      return hasProcessing ? 15_000 : false;
    },
  });

  useEffect(() => {
    if (listQuery.isError && listQuery.error) {
      message.error(
        listQuery.error instanceof Error
          ? listQuery.error.message
          : '作品列表加载失败',
      );
    }
  }, [listQuery.isError, listQuery.error]);

  const works = useMemo(
    () => (listQuery.data?.list ?? []).map(mapWorkSummaryToItem),
    [listQuery.data?.list],
  );

  const total = listQuery.data?.total ?? 0;

  const handleViewDetail = (workId: string) => {
    navigate(resolveWorkDetailPath(workId));
  };

  const handlePublish = (work: WorkItem) => {
    void navigateToPublishWork(work, navigate);
  };

  const handleRegenerate = (work: WorkItem) => {
    navigate(resolveWorkRegeneratePath(work), {
      state: { paramsRaw: work.paramsRaw },
    });
  };

  const handleGoHome = () => {
    navigate('/content-generation');
  };

  const handleFilterChange = (tab: 'all' | 'video' | 'image') => {
    setFilterType(tab);
    setPage(1);
  };

  return (
    <div className={styles.container}>
      <PageHeader
        title={isTenantAdmin ? MY_WORKS_TITLE_TENANT : MY_WORKS_TITLE_USER}
        toolbar={<BackButton onClick={() => navigate('/content-generation')} />}
      />
      <Spin spinning={listQuery.isLoading}>
        <div className={styles.content}>
          {!listQuery.isLoading && works.length === 0 ? (
            <EmptyStateCard onGoHome={handleGoHome} />
          ) : (
            <>
              <WorkFilterTabs
                activeTab={filterType}
                onChange={handleFilterChange}
              />
              <WorkListTable
                works={works}
                total={total}
                page={page}
                pageSize={pageSize}
                onPageChange={(nextPage, nextPageSize) => {
                  setPage(nextPage);
                  setPageSize(nextPageSize);
                }}
                onViewDetail={handleViewDetail}
                onPublish={handlePublish}
                onRegenerate={handleRegenerate}
                isTenantAdmin={isTenantAdmin}
              />
            </>
          )}
        </div>
      </Spin>
    </div>
  );
};

export default MyWorksPage;
