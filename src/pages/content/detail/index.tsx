import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Button, message, Space } from 'antd';
import type React from 'react';
import { useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { PageHeader } from '@/components';
import {
  PUBLISH_STATUS_CODE,
  publishRecordDetailQueryOptions,
  useRefreshMetrics,
} from '@/services/content';
import type { PublishRecordDetailData } from '@/services/content/types';

import ContentInfoCard from './components/ContentInfoCard';
import ExtensionInfoCard from './components/ExtensionInfoCard';
import PerformanceCard from './components/PerformanceCard';
import PublishInfoCard from './components/PublishInfoCard';
import styles from './style.module.css';

const Detail: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const recordId = searchParams.get('recordId');
  const from = searchParams.get('from') || '/content/history';

  const { data: rawData, isLoading } = useQuery({
    ...publishRecordDetailQueryOptions(recordId as string),
    enabled: !!recordId,
  });

  const data = rawData as PublishRecordDetailData | undefined;
  const isPendingReview = data?.status === PUBLISH_STATUS_CODE.UNDER_REVIEW;
  const queryClient = useQueryClient();

  const refreshMutation = useRefreshMetrics(recordId as string);

  const handleClose = useCallback(() => {
    navigate(from);
  }, [navigate, from]);

  const handleRepublish = useCallback(() => {
    const title = data?.title ? encodeURIComponent(data.title) : '';
    navigate(
      `/content/republish?recordId=${recordId}&name=${title}&from=${encodeURIComponent(from)}`,
    );
  }, [data?.title, navigate, recordId, from]);

  const handleRefresh = useCallback(() => {
    if (!recordId) return;
    const queryKey = ['content', 'publish', 'record', 'detail', recordId];
    refreshMutation.mutate(undefined, {
      onSuccess: (snapshot) => {
        queryClient.setQueryData(queryKey, (prev) =>
          prev ? { ...prev, metrics: snapshot } : prev,
        );
        queryClient.invalidateQueries({ queryKey });
        message.success('数据刷新成功');
      },
      onError: (err) => {
        message.error(err instanceof Error ? err.message : '刷新失败');
      },
    });
  }, [recordId, refreshMutation, queryClient]);

  return (
    <div className={styles.container}>
      <PageHeader title="发布详情" />

      <ContentInfoCard data={data} />
      <PublishInfoCard data={data} />
      <ExtensionInfoCard data={data} />
      <PerformanceCard
        data={data?.metrics}
        loading={isLoading}
        isPendingReview={isPendingReview}
        refreshing={refreshMutation.isPending}
        onRefresh={handleRefresh}
      />

      <div className={styles.bottomBar}>
        <Space size={12}>
          <Button onClick={handleClose}>关闭</Button>
          {data?.canRepublish && (
            <Button type="primary" onClick={handleRepublish}>
              重新发布
            </Button>
          )}
        </Space>
      </div>
    </div>
  );
};

export default Detail;
