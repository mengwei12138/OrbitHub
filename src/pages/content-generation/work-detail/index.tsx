import { useQuery } from '@tanstack/react-query';
import { Button, Spin } from 'antd';
import { useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PageHeader } from '@/components';
import {
  mapWorkDetailToItem,
  workDetailQueryOptions,
} from '@/services/content-generation';
import WorkDetailContent from '../my-works/components/WorkDetailContent';
import {
  canDownloadWork,
  downloadWork,
  isWorkActionDisabled,
  navigateToPublishWork,
  resolveWorkRegeneratePath,
} from '../my-works/utils/workActions';
import { BackButton } from '../video-generation/components/BackButton';
import styles from './style.module.css';

const WorkDetailPage = () => {
  const { workId } = useParams<{ workId: string }>();
  const navigate = useNavigate();

  const {
    data: workDetail,
    isLoading,
    isError,
    error,
  } = useQuery(workDetailQueryOptions(workId ?? null));

  const work = workDetail ? mapWorkDetailToItem(workDetail) : undefined;
  const actionsDisabled = work ? isWorkActionDisabled(work) : true;
  const canDownload = !!work && canDownloadWork(work);

  const handleBack = useCallback(() => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/content-generation');
    }
  }, [navigate]);

  const handleRegenerate = useCallback(() => {
    if (!work) return;
    navigate(resolveWorkRegeneratePath(work), {
      state: { paramsRaw: work.paramsRaw },
    });
  }, [navigate, work]);

  const handlePublish = useCallback(() => {
    if (!work) return;
    void navigateToPublishWork(work, navigate);
  }, [navigate, work]);

  const handleDownload = useCallback(() => {
    if (!work) return;
    downloadWork(work);
  }, [work]);

  return (
    <div className={styles.container} data-testid="work-detail-page">
      <PageHeader
        title="作品详情"
        toolbar={<BackButton onClick={handleBack} />}
      />
      <Spin spinning={isLoading}>
        <div className={styles.content}>
          {isError && (
            <div className={styles.errorCard}>
              <p>{error instanceof Error ? error.message : '作品加载失败'}</p>
              <Button type="primary" onClick={handleBack}>
                返回
              </Button>
            </div>
          )}
          {!isLoading && !isError && !work && (
            <div className={styles.errorCard}>
              <p>作品不存在或已过期</p>
              <Button type="primary" onClick={handleBack}>
                返回
              </Button>
            </div>
          )}
          {work && (
            <div className={styles.detailCard}>
              <WorkDetailContent
                work={work}
                onDownload={handleDownload}
                onPublish={handlePublish}
                onRegenerate={handleRegenerate}
                onClose={handleBack}
                downloadDisabled={!canDownload}
                publishDisabled={actionsDisabled}
                regenerateDisabled={actionsDisabled}
              />
            </div>
          )}
        </div>
      </Spin>
    </div>
  );
};

export default WorkDetailPage;
