import { ArrowLeftOutlined, TagOutlined } from '@ant-design/icons';
import { Button, message } from 'antd';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { queryClient } from '@/api';
import { CustomModal, PageHeader } from '@/components';
import {
  type LowDataContent,
  type OptimizeContentResponse,
  type OptimizeThreshold,
  type RepublishParam,
  useApplyOptimization,
  useCommentReplyAccounts,
  useOptimizeContent,
  useOptimizeThreshold,
  useRepublishTask,
  useSubmitRepublish,
  useUpdateOptimizeThreshold,
} from '@/services/ai-assistant';

import AIOptimizeSuggestion from './components/AIOptimizeSuggestion';
import LowDataContentList from './components/LowDataContent';
import RepublishSettings from './components/RepublishSettings';
import styles from './style.module.css';

type SuggestionStatus = 'idle' | 'loading' | 'success' | 'error' | 'sensitive';

const DEFAULT_THRESHOLD: OptimizeThreshold = {
  viewMin: 500,
  likeRateMinPercent: 2,
};

const ContentOptimizePage = () => {
  const navigate = useNavigate();
  const [messageApi, messageHolder] = message.useMessage();

  const thresholdQuery = useOptimizeThreshold();
  const updateThresholdMutation = useUpdateOptimizeThreshold();
  const [_threshold, setThreshold] =
    useState<OptimizeThreshold>(DEFAULT_THRESHOLD);

  const [optimizingContentId, setOptimizingContentId] = useState<string>();
  const [appliedContentIds, setAppliedContentIds] = useState<Set<string>>(
    () => new Set(),
  );

  const [activeContent, setActiveContent] = useState<LowDataContent | null>(
    null,
  );
  const [suggestionStatus, setSuggestionStatus] =
    useState<SuggestionStatus>('idle');
  const [optimizeResult, setOptimizeResult] =
    useState<OptimizeContentResponse | null>(null);

  const [deleteOriginal, setDeleteOriginal] = useState(false);
  const [accountChanged, setAccountChanged] = useState(false);
  const [optimizationApplied, setOptimizationApplied] = useState(false);
  const optimizationAppliedRef = useRef(false);

  const isDirty =
    optimizationApplied ||
    optimizationAppliedRef.current ||
    (suggestionStatus === 'success' && optimizeResult !== null) ||
    deleteOriginal ||
    accountChanged;

  const optimizeMutation = useOptimizeContent();
  const applyMutation = useApplyOptimization();
  const submitRepublishMutation = useSubmitRepublish();

  const [republishTaskId, setRepublishTaskId] = useState<string>();
  const [publishingContentIds, setPublishingContentIds] = useState<string[]>(
    [],
  );
  const republishTaskQuery = useRepublishTask(republishTaskId, {
    enabled: Boolean(republishTaskId),
  });

  useEffect(() => {
    const status = republishTaskQuery.data?.status;
    if (status && ['SUCCESS', 'FAILED', 'PARTIAL_FAILURE'].includes(status)) {
      queryClient.invalidateQueries({
        queryKey: ['ai-assistant', 'content-optimize', 'low-data'],
      });
      queryClient.invalidateQueries({
        queryKey: ['content', 'publish', 'history', 'records'],
      });
      if (activeContent) {
        setAppliedContentIds((prev) => {
          const next = new Set(prev);
          next.delete(activeContent.contentId);
          return next;
        });
      }
      setRepublishTaskId(undefined);
      setPublishingContentIds([]);
    }
  }, [republishTaskQuery.data?.status, activeContent]);

  // 页面离开确认：当存在未应用的AI优化建议时，提示用户防止数据丢失
  const handleLeaveConfirm = useCallback(
    (targetPath: string) => {
      CustomModal.confirm({
        title: '确认离开',
        content: '您有未保存的更改，离开后所有更改将丢失。确认离开吗？',
        cancelText: '取消',
        okText: '确认离开',
        onOk: () => {
          navigate(targetPath);
        },
      });
    },
    [navigate],
  );

  const handleNavigateToTags = useCallback(() => {
    if (isDirty) {
      handleLeaveConfirm('/ai-assistant/tags');
    } else {
      navigate('/ai-assistant/tags');
    }
  }, [navigate, isDirty, handleLeaveConfirm]);

  const handleBack = useCallback(() => {
    if (isDirty) {
      handleLeaveConfirm('/ai-assistant');
    } else {
      navigate('/ai-assistant');
    }
  }, [navigate, isDirty, handleLeaveConfirm]);

  // 浏览器刷新/关闭提示：使用 beforeunload 事件（无法自定义弹窗内容，仅作兜底提示）
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  const accountsQuery = useCommentReplyAccounts({ page: 1, pageSize: 100 });

  const onlineAccounts = useMemo(() => {
    if (!accountsQuery.data?.list) return [];
    return accountsQuery.data.list
      .filter((account) => account.isOnline)
      .map((account) => ({
        id: account.accountId,
        name: account.nickname || account.phoneNumber,
        platform: account.platform === 'douyin' ? '抖音' : '小红书',
        isOriginal: account.accountId === activeContent?.accountId,
      }));
  }, [accountsQuery.data, activeContent?.accountId]);

  const effectiveThreshold = thresholdQuery.data ?? DEFAULT_THRESHOLD;

  const handleThresholdChange = useCallback(
    (next: OptimizeThreshold) => {
      setThreshold(next);
      updateThresholdMutation.mutate(next, {
        onSuccess: () => {
          messageApi.success('阈值已保存');
        },
        onError: (err) =>
          messageApi.error(err instanceof Error ? err.message : '阈值保存失败'),
      });
    },
    [messageApi, updateThresholdMutation],
  );

  const handleAIClick = useCallback(
    (content: LowDataContent) => {
      const startOptimize = () => {
        setActiveContent(content);
        setOptimizingContentId(content.contentId);
        setSuggestionStatus('loading');

        optimizeMutation.mutate(content.contentId, {
          onSuccess: (data) => {
            setOptimizeResult(data);
            setSuggestionStatus('success');
          },
          onError: (err) => {
            setSuggestionStatus('error');
            setOptimizingContentId(undefined);
            messageApi.error(
              err instanceof Error ? err.message : 'AI 优化失败，请重试',
            );
          },
        });
      };

      if (isDirty) {
        CustomModal.confirm({
          title: '确认切换',
          content: '您有未保存的更改，切换后所有更改将丢失。确认切换吗？',
          cancelText: '取消',
          okText: '确认切换',
          onOk: () => {
            setOptimizationApplied(false);
            optimizationAppliedRef.current = false;
            setDeleteOriginal(false);
            setAccountChanged(false);
            setActiveContent(null);
            setSuggestionStatus('idle');
            setOptimizeResult(null);
            setOptimizingContentId(undefined);
            setAppliedContentIds(new Set());
            startOptimize();
          },
        });
      } else {
        startOptimize();
      }
    },
    [messageApi, optimizeMutation, isDirty],
  );

  const handleSuggestionRetry = useCallback(() => {
    if (activeContent) {
      handleAIClick(activeContent);
    }
  }, [activeContent, handleAIClick]);

  const handleApply = useCallback(
    (data: { title: string; tags: string[]; contentId: string }) => {
      applyMutation.mutate(
        {
          contentId: data.contentId,
          data: { title: data.title, tags: data.tags },
        },
        {
          onSuccess: () => {
            setAppliedContentIds((prev) => {
              const next = new Set(prev);
              next.add(data.contentId);
              return next;
            });
            messageApi.success('AI 建议已应用');
            setOptimizationApplied(true);
            optimizationAppliedRef.current = true;
            queryClient.invalidateQueries({
              queryKey: ['content-detail', activeContent?.contentId ?? ''],
            });
          },
          onError: (err) =>
            messageApi.error(err instanceof Error ? err.message : '应用失败'),
        },
      );
    },
    [applyMutation, messageApi, activeContent],
  );

  const handleClose = useCallback(() => {
    setActiveContent(null);
    setSuggestionStatus('idle');
    setOptimizeResult(null);
    setOptimizingContentId(undefined);
  }, []);

  const handleSubmitRepublish = useCallback(
    (param: RepublishParam) => {
      submitRepublishMutation.mutate(param, {
        onSuccess: ({ taskId }) => {
          const contentId = activeContent?.contentId;
          setRepublishTaskId(taskId);
          setPublishingContentIds(contentId ? [contentId] : []);
          setActiveContent(null);
          setOptimizationApplied(false);
          optimizationAppliedRef.current = false;
          setAppliedContentIds((prev) => {
            const next = new Set(prev);
            if (contentId) next.delete(contentId);
            return next;
          });
          queryClient.invalidateQueries({
            queryKey: ['ai-assistant', 'content-optimize', 'low-data'],
          });
          messageApi.success('已提交重发布任务');
        },
        onError: (err) =>
          messageApi.error(
            err instanceof Error ? err.message : '提交失败，请稍后重试',
          ),
      });
    },
    [messageApi, submitRepublishMutation, activeContent],
  );

  const handleCancelRepublish = useCallback(() => {
    setRepublishTaskId(undefined);
    setActiveContent(null);
    setOptimizationApplied(false);
    optimizationAppliedRef.current = false;
    setAppliedContentIds(new Set());
  }, []);

  const toolbar = useMemo(
    () => (
      <div className={styles.toolbar} data-testid="content-optimize-toolbar">
        <Button icon={<TagOutlined />} onClick={handleNavigateToTags}>
          标签库
        </Button>
        <Button icon={<ArrowLeftOutlined />} onClick={handleBack}>
          返回
        </Button>
      </div>
    ),
    [handleBack, handleNavigateToTags],
  );

  const showSuggestion = activeContent && suggestionStatus !== 'idle';
  const showRepublish = appliedContentIds.size > 0 && activeContent;

  return (
    <div className={styles.container}>
      {messageHolder}
      <PageHeader title="AI 内容优化与重发布" toolbar={toolbar} />

      <LowDataContentList
        threshold={effectiveThreshold}
        defaultThreshold={DEFAULT_THRESHOLD}
        optimizingContentId={optimizingContentId}
        publishingContentIds={publishingContentIds}
        appliedContentIds={Array.from(appliedContentIds)}
        onThresholdChange={handleThresholdChange}
        onAIClick={handleAIClick}
      />

      {showSuggestion && (
        <AIOptimizeSuggestion
          contentId={activeContent.contentId}
          originalTitle={activeContent.title}
          platform={activeContent.platform}
          problemAnalysis={optimizeResult?.suggestion}
          suggestedTitle={optimizeResult?.suggestedTitle}
          suggestedTags={optimizeResult?.suggestedTags}
          status={suggestionStatus}
          applyLoading={applyMutation.isPending}
          onApply={handleApply}
          onClose={handleClose}
          onRetry={handleSuggestionRetry}
        />
      )}

      {showRepublish && (
        <RepublishSettings
          contentId={activeContent.contentId}
          aiOptimizeApplied
          accounts={onlineAccounts}
          initialSelectedAccountIds={[activeContent.accountId]}
          loading={submitRepublishMutation.isPending}
          taskStatus={republishTaskQuery.data ?? null}
          onSubmit={handleSubmitRepublish}
          onCancel={handleCancelRepublish}
          onDeleteOriginalChange={setDeleteOriginal}
          onAccountChange={setAccountChanged}
        />
      )}
    </div>
  );
};

export default ContentOptimizePage;
