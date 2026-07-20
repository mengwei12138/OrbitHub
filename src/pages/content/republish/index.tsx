import { useQuery } from '@tanstack/react-query';
import { Button, Modal, message, Space } from 'antd';
import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CustomModal, PageHeader } from '@/components';
import { useAccountList } from '@/services/account';
import type { AccountResponse } from '@/services/account/types';
import {
  publishRecordDetailQueryOptions,
  useActivePublishJobs,
  useAISuggestions,
  useRepublish,
} from '@/services/content';
import type {
  PlatformCode,
  PublishJobProgressData,
  PublishRecordDetailData,
  PublishSubmitData,
  RepublishRequest,
} from '@/services/content/types';
import BottomActionBar from '../components/BottomActionBar';
import PublishProgressModal from '../components/PublishProgressModal';
import PublishResultModal from '../components/PublishResultModal';
import AccountSelectorModal from './components/AccountSelectorModal';
import ContentEditCard from './components/ContentEditCard';
import DeleteOriginalCard from './components/DeleteOriginalCard';
import OriginalInfoCard from './components/OriginalInfoCard';
import TargetAccountCard from './components/TargetAccountCard';
import styles from './style.module.css';

type PendingRepublishData = {
  targetAccountIds: string[];
  titleByPlatform: Record<string, string>;
  caption: string;
  topicTags: string[];
  primaryMediaAssetId?: string;
  imageMediaAssetIds?: string[];
  deleteOriginalOnSuccess: boolean;
};

const Republish: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const recordId = searchParams.get('recordId');
  const from = searchParams.get('from') || '/content/history';

  const { data: rawRecordDetail } = useQuery({
    ...publishRecordDetailQueryOptions(recordId as string),
    enabled: !!recordId,
  });

  const recordDetail = rawRecordDetail as PublishRecordDetailData | undefined;

  const { data: accountData, refetch: refetchAccountList } = useAccountList({
    page: 1,
    pageSize: 10,
  });

  const [isAccountLoading, setIsAccountLoading] = useState(true);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        refetchAccountList();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [refetchAccountList]);
  const [selectedAccounts, setSelectedAccounts] = useState<AccountResponse[]>(
    [],
  );
  const [title, setTitle] = useState('');
  const [caption, setCaption] = useState('');
  const [topicTags, setTopicTags] = useState<string[]>([]);
  const [deleteOriginal, setDeleteOriginal] = useState(false);

  const isSameAccountSelected =
    !!recordDetail &&
    selectedAccounts.length > 0 &&
    selectedAccounts.every((a) => a.id === recordDetail.accountId);

  React.useEffect(() => {
    if (!isSameAccountSelected && deleteOriginal) {
      setDeleteOriginal(false);
    }
  }, [isSameAccountSelected, deleteOriginal]);
  const [selectAccountModalVisible, setSelectAccountModalVisible] =
    useState(false);

  const [isAILoading, setIsAILoading] = useState(false);

  const [progressModalOpen, setProgressModalOpen] = useState(false);
  const [currentJobId, setCurrentJobId] = useState<string | null>(null);
  const [resultModalData, setResultModalData] = useState<{
    successCount: number;
    failedAccounts: { id: string; accountName: string; reason: string }[];
  } | null>(null);

  const republishMutation = useRepublish();
  const aiSuggestionsMutation = useAISuggestions();
  const { data: activeJobsData } = useActivePublishJobs();
  const hasActiveJob = activeJobsData?.hasActive ?? false;

  React.useEffect(() => {
    if (recordDetail) {
      setTitle(recordDetail.title ?? '');
      setCaption(recordDetail.caption ?? '');
      setTopicTags(recordDetail.topicTags ?? []);
    }
  }, [recordDetail]);

  React.useEffect(() => {
    if (recordDetail && accountData?.list) {
      const originalAccount = accountData.list.find(
        (a) => a.id === recordDetail.accountId,
      );
      if (originalAccount) {
        setSelectedAccounts([originalAccount]);
      } else if (accountData.list.length > 0) {
        setSelectedAccounts([accountData.list[0]]);
      }
      setIsAccountLoading(false);
    }
  }, [recordDetail, accountData]);

  const buildRepublishData = useCallback((): PendingRepublishData => {
    const selectedAccount = selectedAccounts[0];
    const platformTitleMap: Record<string, string> = {};
    if (selectedAccount && title) {
      platformTitleMap[selectedAccount.platform] = title;
    }

    return {
      targetAccountIds: selectedAccounts.map((a) => a.id),
      titleByPlatform: platformTitleMap,
      caption,
      topicTags,
      primaryMediaAssetId:
        recordDetail?.contentMode === 'VIDEO'
          ? recordDetail?.primaryMediaAssetId
          : undefined,
      imageMediaAssetIds:
        recordDetail?.contentMode === 'IMAGE'
          ? recordDetail?.imageMediaAssetIds
          : undefined,
      deleteOriginalOnSuccess: deleteOriginal,
    };
  }, [
    selectedAccounts,
    title,
    caption,
    topicTags,
    recordDetail,
    deleteOriginal,
  ]);

  const handleSelectOther = useCallback(() => {
    setSelectAccountModalVisible(true);
  }, []);

  const handleSelectAccount = useCallback((account: AccountResponse) => {
    setSelectedAccounts([account]);
    setSelectAccountModalVisible(false);
  }, []);

  const handleAIGenerate = useCallback(async () => {
    if (!caption.trim()) {
      message.warning('请输入内容描述');
      return;
    }

    const selectedAccount = selectedAccounts[0];
    if (!selectedAccount) {
      message.warning('请先选择目标账号');
      return;
    }

    setIsAILoading(true);
    try {
      const response = await aiSuggestionsMutation.mutateAsync({
        platform: selectedAccount.platform as PlatformCode,
        contentMode: recordDetail?.contentMode ?? 'IMAGE',
        userPrompt: caption,
        currentTitle: title,
        captionExcerpt: caption,
        currentCaption: caption,
        currentTopicTags: topicTags,
        scope: 'ALL',
        maxVariants: 5,
      });

      if (response.titleSuggestions?.variants?.length) {
        setTitle(response.titleSuggestions.variants[0].text);
      }
      if (response.contentSuggestions?.variants?.length) {
        const first = response.contentSuggestions.variants[0];
        if (first.title) setTitle(first.title);
        if (first.caption) setCaption(first.caption);
        if (first.topicTags?.length) setTopicTags(first.topicTags);
      }
      message.success('AI生成成功');
    } catch (err) {
      message.error(err instanceof Error ? err.message : 'AI生成失败');
    } finally {
      setIsAILoading(false);
    }
  }, [
    caption,
    selectedAccounts,
    recordDetail?.contentMode,
    topicTags,
    title,
    aiSuggestionsMutation,
  ]);

  const navigateBack = useCallback(() => {
    navigate(from.startsWith('/') ? from : `/${from}`);
  }, [navigate, from]);

  const handleCancel = useCallback(() => {
    navigateBack();
  }, [navigateBack]);

  const handleRepublishSuccess = useCallback((response: PublishSubmitData) => {
    const jobId = response?.jobId;
    if (jobId) {
      setCurrentJobId(jobId);
      setProgressModalOpen(true);
    } else {
      message.error('重新发布响应异常');
    }
  }, []);

  const handleProgressModalClose = useCallback(() => {
    setProgressModalOpen(false);
  }, []);

  const handleBackgroundRun = useCallback(() => {
    setProgressModalOpen(false);
    message.info('有发布任务正在进行中...');
    navigateBack();
  }, [navigateBack]);

  const handleVerifyRequired = useCallback(() => {
    setProgressModalOpen(true);
    message.warning('发布需要二次验证，请完成扫码或输入验证码');
  }, []);

  const handlePublishComplete = useCallback((data: PublishJobProgressData) => {
    setProgressModalOpen(false);
    setResultModalData({
      successCount: data.succeededCount,
      failedAccounts: data.records
        .filter((r) => r.stage === 'FAILED')
        .map((r) => ({
          id: r.recordId,
          accountName: r.accountNickname ?? '未知账号',
          reason: r.message ?? '发布失败',
        })),
    });
  }, []);

  const executeRepublish = useCallback(
    (data: RepublishRequest) => {
      if (!recordId) return;
      republishMutation.mutate(
        {
          recordId,
          data,
        },
        {
          onSuccess: (response) => {
            handleRepublishSuccess(response);
          },
          onError: (err) => {
            const axiosError = err as unknown as { code?: number };
            if (axiosError.code === 40900) {
              CustomModal.confirm({
                title: err.message,
                okText: '继续发布',
                cancelText: '取消',
                onOk: () => {
                  const republishData = buildRepublishData();
                  const finalData = {
                    ...republishData,
                    confirmDuplicate: true,
                  };
                  republishMutation.mutate(
                    {
                      recordId: recordId as string,
                      data: finalData as unknown as RepublishRequest,
                    },
                    {
                      onSuccess: (response) => {
                        handleRepublishSuccess(response);
                      },
                      onError: (retryErr) => {
                        message.error(
                          retryErr instanceof Error
                            ? retryErr.message
                            : '重新发布失败',
                        );
                      },
                    },
                  );
                },
              });
            } else {
              message.error(
                err instanceof Error ? err.message : '重新发布失败',
              );
            }
          },
        },
      );
    },
    [recordId, republishMutation, buildRepublishData, handleRepublishSuccess],
  );

  const handleConfirm = useCallback(() => {
    if (!title.trim()) {
      message.error('请输入标题');
      return;
    }

    if (selectedAccounts.length === 0) {
      message.warning('请选择目标账号');
      return;
    }

    const data = buildRepublishData();

    if (deleteOriginal) {
      CustomModal.confirm({
        title: '确认删除',
        content: '此操作不可逆，将删除原内容。确认继续？',
        okText: '确认删除',
        cancelText: '取消',
        okType: 'danger',
        onOk: () => {
          const finalData = { ...data, deleteOriginalOnSuccess: true };
          executeRepublish(finalData as unknown as RepublishRequest);
        },
      });
    } else {
      executeRepublish(data as unknown as RepublishRequest);
    }
  }, [
    title,
    selectedAccounts.length,
    buildRepublishData,
    deleteOriginal,
    executeRepublish,
  ]);

  const handleDeleteOriginalChange = useCallback((checked: boolean) => {
    if (checked) {
      CustomModal.confirm({
        title: '确认删除',
        content: '此操作不可逆，将删除原内容。确认继续？',
        okText: '确认删除',
        cancelText: '取消',
        okType: 'danger',
        onOk: () => {
          setDeleteOriginal(true);
        },
      });
    } else {
      setDeleteOriginal(false);
    }
  }, []);

  return (
    <div className={styles.container}>
      <PageHeader title="重新发布" />

      <OriginalInfoCard data={recordDetail} />

      <TargetAccountCard
        selectedAccounts={selectedAccounts}
        onSelectAccounts={setSelectedAccounts}
        onSelectOther={handleSelectOther}
        loading={isAccountLoading}
      />

      <ContentEditCard
        title={title}
        content={caption}
        tags={topicTags}
        onTitleChange={setTitle}
        onContentChange={setCaption}
        onTagsChange={setTopicTags}
        onAIGenerate={handleAIGenerate}
        aiLoading={isAILoading}
      />

      <DeleteOriginalCard
        checked={deleteOriginal}
        disabled={!isSameAccountSelected}
        onChange={handleDeleteOriginalChange}
      />

      <Modal
        title="选择账号"
        open={selectAccountModalVisible}
        onCancel={() => setSelectAccountModalVisible(false)}
        footer={null}
        width={560}
      >
        <AccountSelectorModal
          open={selectAccountModalVisible}
          selectedId={selectedAccounts[0]?.id}
          onConfirm={handleSelectAccount}
        />
      </Modal>

      <BottomActionBar
        toolbar={
          <Space size={12}>
            <Button onClick={handleCancel}>取消</Button>
            <Button
              type="primary"
              onClick={handleConfirm}
              loading={republishMutation.isPending}
              disabled={hasActiveJob}
            >
              {hasActiveJob ? '有发布任务进行中' : '确认重发'}
            </Button>
          </Space>
        }
      />

      <PublishProgressModal
        open={progressModalOpen}
        jobId={currentJobId}
        onClose={handleProgressModalClose}
        onBackgroundRun={handleBackgroundRun}
        onVerifyRequired={handleVerifyRequired}
        onComplete={handlePublishComplete}
      />

      {resultModalData && (
        <PublishResultModal
          open={true}
          successCount={resultModalData.successCount}
          failedAccounts={resultModalData.failedAccounts}
          onClose={() => {
            setResultModalData(null);
            navigateBack();
          }}
          onViewHistory={() => {
            setResultModalData(null);
            navigate('/content/history');
          }}
          onContinuePublish={() => {
            setResultModalData(null);
            navigateBack();
          }}
        />
      )}
    </div>
  );
};

export default Republish;
