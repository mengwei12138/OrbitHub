import { ArrowLeftOutlined } from '@ant-design/icons';
import { Button, message, Result } from 'antd';
import { useCallback, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { queryClient } from '@/api';
import type { PaginationParams } from '@/api/types';
import { CountdownButton, PageHeader } from '@/components';
import type {
  UiComment,
  UiHistoryRecord,
} from '@/pages/ai-assistant/comment-reply/types';
import {
  commentReplyAccountsQueryOptions,
  commentReplyHistoryQueryOptions,
  humanReviewCommentsQueryOptions,
  pendingCommentsQueryOptions,
  useAccountCommentReplySettings,
  useAddBlockedKeyword,
  useBlockedKeywords,
  useCommentReplyAccounts,
  useCommentReplyRules,
  useCommentReplyTodayDashboard,
  useDeleteBlockedKeyword,
  useDeleteComment,
  useDeleteCommentReplyRule,
  useHumanClassifyComment,
  useSubmitManualCommentReply,
  useToneOptions,
  useTriggerCommentAutoReply,
  useTriggerCommentScrape,
  useUpdateAccountCommentReplySettings,
  useUpsertCommentReplyRules,
} from '@/services/ai-assistant';
import type { AccountSnapshot } from '@/services/ai-assistant/types';
import { useUserStore } from '@/store/modules/userStore';
import AccountSelector from './components/AccountSelector';
import AddRuleModal from './components/AddRuleModal';
import CommentsPanel from './components/CommentsPanel';
import EditRuleModal from './components/EditRuleModal';
import OfflineWarning from './components/OfflineWarning';
import ReplyRulesSettings from './components/ReplyRulesSettings';
import StatsOverview from './components/StatsOverview';
import styles from './style.module.css';
import { chineseCategoryToApi, mapRecordToComment } from './utils/mapRecords';

const CommentReplyPage = () => {
  const navigate = useNavigate();
  const [messageApi, messageHolder] = message.useMessage();
  const roles = useUserStore((state) => state.roles);
  const canEditRules = roles.includes('TENANT_ADMIN');

  const dashboardQuery = useCommentReplyTodayDashboard();

  const [selectedAccountIds, setSelectedAccountIds] = useState<string[]>([]);
  const primaryAccountId = selectedAccountIds[0];

  const [offlineDismissed, setOfflineDismissed] = useState(false);
  const [autoDeleteBlocked, setAutoDeleteBlocked] = useState(true);

  const [commentsTab, setCommentsTab] = useState<
    'pending' | 'human_review' | 'history'
  >('pending');
  const commentsPanelRef = useRef<HTMLDivElement>(null);

  const accountsQuery = useCommentReplyAccounts({
    page: 1,
    pageSize: 1000,
  });

  const offlineAccountsQuery = useCommentReplyAccounts({
    page: 1,
    pageSize: 1000,
    status: 'offline',
  });

  const pendingQueryOptions = useMemo(
    () =>
      ((params: PaginationParams) => {
        const accountMap = new Map(
          (accountsQuery.data?.list ?? []).map((a) => [
            a.accountId,
            a.nickname ?? a.phoneNumber,
          ]),
        );
        return {
          queryKey: [
            'ai-assistant',
            'comment-reply',
            'pending',
            params,
          ] as const,
          queryFn: async () => {
            const result = await pendingCommentsQueryOptions({
              page: params.page,
              pageSize: params.pageSize,
              accountId: params.accountId as string | undefined,
              keyword: params.keyword as string | undefined,
            }).queryFn();
            return {
              ...result,
              list: result.list.map((record) =>
                mapRecordToComment(
                  record,
                  accountMap.get(record.accountId) ?? '未知账号',
                ),
              ),
            };
          },
        };
      }) as unknown as (params: PaginationParams) => {
        queryKey: unknown[];
        queryFn: () => Promise<{
          list: UiComment[];
          total: string | number;
          [key: string]: any;
        }>;
      },
    [accountsQuery.data?.list],
  );

  const humanQueryOptions = useMemo(
    () =>
      ((params: PaginationParams) => {
        const accountMap = new Map(
          (accountsQuery.data?.list ?? []).map((a) => [
            a.accountId,
            a.nickname ?? a.phoneNumber,
          ]),
        );
        return {
          queryKey: [
            'ai-assistant',
            'comment-reply',
            'human-review',
            params,
          ] as const,
          queryFn: async () => {
            const result = await humanReviewCommentsQueryOptions({
              page: params.page,
              pageSize: params.pageSize,
              accountId: params.accountId as string | undefined,
              keyword: params.keyword as string | undefined,
            }).queryFn();
            return {
              ...result,
              list: result.list.map((record) =>
                mapRecordToComment(
                  record,
                  accountMap.get(record.accountId) ?? '未知账号',
                ),
              ),
            };
          },
        };
      }) as unknown as (params: PaginationParams) => {
        queryKey: unknown[];
        queryFn: () => Promise<{
          list: UiComment[];
          total: string | number;
          [key: string]: any;
        }>;
      },
    [accountsQuery.data?.list],
  );

  const historyQueryOptions = useMemo(
    () =>
      ((params: PaginationParams) =>
        commentReplyHistoryQueryOptions({
          page: params.page,
          pageSize: params.pageSize,
        })) as unknown as (params: PaginationParams) => {
        queryKey: unknown[];
        queryFn: () => Promise<{
          list: UiHistoryRecord[];
          total: string | number;
          [key: string]: any;
        }>;
      },
    [],
  );

  const accountQueryOptions = useMemo(
    () =>
      ((params: PaginationParams) =>
        commentReplyAccountsQueryOptions({
          page: params.page,
          pageSize: params.pageSize,
          keyword: params.keyword as string | undefined,
          platform: params.platform as 'douyin' | 'xiaohongshu' | undefined,
        })) as unknown as (params: PaginationParams) => {
        queryKey: unknown[];
        queryFn: () => Promise<{
          list: AccountSnapshot[];
          total: string | number;
          [key: string]: any;
        }>;
      },
    [],
  );

  const statsOverview = useMemo(() => {
    const d = dashboardQuery.data;
    return {
      autoReply: d?.autoReplyCount ?? 0,
      blockFilter: d?.blockedCount ?? 0,
      pendingHuman: d?.humanReviewCount ?? 0,
    };
  }, [dashboardQuery.data]);

  const panelStats = useMemo(
    () => ({
      pending: dashboardQuery.data?.autoReplyCount ?? 0,
      humanReview: dashboardQuery.data?.humanReviewCount ?? 0,
    }),
    [dashboardQuery.data],
  );

  const offlineAccounts = useMemo(() => {
    const list = offlineAccountsQuery.data?.list ?? [];
    return list
      .filter((a) => !a.isOnline)
      .map((a) => ({
        name: a.nickname ?? a.phoneNumber ?? '',
        platform: a.platform,
        reason: '账号已离线',
      }));
  }, [offlineAccountsQuery.data?.list]);

  const accountFilterOptions = useMemo(() => {
    const options = [{ label: '全部', value: '' }];
    if (accountsQuery.data?.list) {
      const onlineAccounts = accountsQuery.data.list.filter((a) => a.isOnline);
      options.push(
        ...onlineAccounts.map((a) => ({
          label: a.nickname ?? a.phoneNumber,
          value: a.accountId,
        })),
      );
    }
    return options;
  }, [accountsQuery.data?.list]);

  const rulesQuery = useCommentReplyRules();
  const toneOptionsQuery = useToneOptions();
  const blockedKeywordsQuery = useBlockedKeywords();
  const accountSettingsQuery = useAccountCommentReplySettings(primaryAccountId);

  const upsertRulesMutation = useUpsertCommentReplyRules();
  const deleteRuleMutation = useDeleteCommentReplyRule();
  const updateSettingsMutation = useUpdateAccountCommentReplySettings();
  const addKeywordMutation = useAddBlockedKeyword();
  const deleteKeywordMutation = useDeleteBlockedKeyword();

  const scrapeMutation = useTriggerCommentScrape();
  const autoReplyMutation = useTriggerCommentAutoReply();
  const manualReplyMutation = useSubmitManualCommentReply();
  const deleteCommentMutation = useDeleteComment();
  const classifyMutation = useHumanClassifyComment();

  const uiRules = useMemo(() => {
    const rules = rulesQuery.data?.rules ?? [];
    return rules.map((r, idx) => ({
      id: r.ruleId ?? `rule-${r.category}-${idx}`,
      type:
        r.category === 'promotion'
          ? ('neutral' as const)
          : (r.category as 'positive' | 'negative' | 'neutral' | 'question'),
      template: r.template,
      keywords: r.keywords ?? [],
      createdByName: r.createdByName,
      editable: r.editable,
    }));
  }, [rulesQuery.data]);

  const primaryTone = useMemo(() => {
    const first = rulesQuery.data?.rules?.[0];
    return first?.tone ?? 'friendly';
  }, [rulesQuery.data]);

  const handleToneChange = useCallback(
    (tone: string) => {
      const rules = rulesQuery.data?.rules ?? [];
      if (!rules.length) {
        messageApi.warning('暂无规则可更新语气');
        return;
      }
      upsertRulesMutation.mutate(
        {
          rules: rules.map((r) => ({ ...r, tone })),
        },
        {
          onSuccess: () => {
            messageApi.success('语气已更新');
            void rulesQuery.refetch();
          },
          onError: (e) =>
            messageApi.error(e instanceof Error ? e.message : '更新失败'),
        },
      );
    },
    [
      messageApi,
      rulesQuery.data?.rules,
      upsertRulesMutation,
      rulesQuery.refetch,
    ],
  );

  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<{
    id: string;
    type: 'positive' | 'negative' | 'neutral' | 'question';
    template: string;
  } | null>(null);

  const handleAddRule = useCallback(() => {
    setAddModalOpen(true);
  }, []);

  const handleAddRuleSubmit = useCallback(
    (type: string, template: string, keywords: string[]) => {
      const rules = rulesQuery.data?.rules ?? [];
      const newRule = {
        ruleId: null,
        category: type,
        template,
        keywords,
        tone: rules[0]?.tone ?? 'friendly',
      };
      upsertRulesMutation.mutate(
        { rules: [...rules, newRule] },
        {
          onSuccess: () => {
            messageApi.success('规则创建成功');
            setAddModalOpen(false);
            void rulesQuery.refetch();
          },
          onError: (e) =>
            messageApi.error(e instanceof Error ? e.message : '创建失败'),
        },
      );
    },
    [messageApi, rulesQuery, upsertRulesMutation],
  );

  const handleRuleEdit = useCallback(
    (rule: {
      id: string;
      type: 'positive' | 'negative' | 'neutral' | 'question';
      template: string;
    }) => {
      setEditingRule({ id: rule.id, type: rule.type, template: rule.template });
      setEditModalOpen(true);
    },
    [],
  );

  const handleEditRuleSubmit = useCallback(
    (editingRuleId: string, template: string) => {
      const rules = rulesQuery.data?.rules ?? [];
      const editingIdx = rules.findIndex(
        (r) =>
          (r.ruleId ?? `rule-${r.category}-${rules.indexOf(r)}`) ===
          editingRuleId,
      );
      if (editingIdx === -1) {
        messageApi.error('未找到要编辑的规则');
        return;
      }
      const updatedRules = [...rules];
      updatedRules[editingIdx] = { ...updatedRules[editingIdx], template };
      upsertRulesMutation.mutate(
        { rules: updatedRules },
        {
          onSuccess: () => {
            messageApi.success('模板更新成功');
            setEditModalOpen(false);
            setEditingRule(null);
            void rulesQuery.refetch();
          },
          onError: (e) =>
            messageApi.error(e instanceof Error ? e.message : '更新失败'),
        },
      );
    },
    [messageApi, rulesQuery, upsertRulesMutation],
  );

  const handleRuleDelete = useCallback(
    (rule: {
      id: string;
      type: 'positive' | 'negative' | 'neutral' | 'question';
      template: string;
    }) => {
      if (rule.id.startsWith('rule-')) {
        messageApi.error('默认规则不能删除');
        return;
      }
      deleteRuleMutation.mutate(rule.id, {
        onSuccess: () => {
          messageApi.success('规则删除成功');
          void rulesQuery.refetch();
        },
        onError: (e) =>
          messageApi.error(e instanceof Error ? e.message : '删除失败'),
      });
    },
    [messageApi, rulesQuery, deleteRuleMutation],
  );

  const handleToggleAutoReply = useCallback(
    (enabled: boolean) => {
      if (!primaryAccountId) {
        messageApi.warning('请先选择账号');
        return;
      }
      updateSettingsMutation.mutate(
        {
          accountId: primaryAccountId,
          data: { autoReplyEnabled: enabled },
        },
        {
          onSuccess: () => {
            messageApi.success(enabled ? '已开启' : '已关闭');
            accountSettingsQuery.refetch();
          },
          onError: (e) =>
            messageApi.error(e instanceof Error ? e.message : '保存失败'),
        },
      );
    },
    [
      messageApi,
      primaryAccountId,
      updateSettingsMutation,
      accountSettingsQuery,
    ],
  );

  const handleNeedReviewChange = useCallback(
    (type: 'question' | 'negative', checked: boolean) => {
      if (!primaryAccountId) {
        messageApi.warning('请先选择账号');
        return;
      }
      updateSettingsMutation.mutate(
        {
          accountId: primaryAccountId,
          data:
            type === 'question'
              ? { humanInterventionForQuestion: checked }
              : { humanInterventionForNegative: checked },
        },
        {
          onSuccess: () => {
            messageApi.success('设置已保存');
            accountSettingsQuery.refetch();
          },
          onError: (e) =>
            messageApi.error(e instanceof Error ? e.message : '保存失败'),
        },
      );
    },
    [
      messageApi,
      primaryAccountId,
      updateSettingsMutation,
      accountSettingsQuery,
    ],
  );

  const handleKeywordRemove = useCallback(
    (keywordId: string) => {
      deleteKeywordMutation.mutate(keywordId, {
        onSuccess: () => {
          messageApi.success('已移除');
          void blockedKeywordsQuery.refetch();
        },
        onError: (e) =>
          messageApi.error(e instanceof Error ? e.message : '删除失败'),
      });
    },
    [blockedKeywordsQuery, deleteKeywordMutation, messageApi],
  );

  const handleKeywordAdd = useCallback(
    (keyword: string) => {
      const k = keyword.trim();
      if (!k) return;
      addKeywordMutation.mutate(
        {
          keyword: k,
          autoDelete: autoDeleteBlocked,
        },
        {
          onSuccess: () => {
            messageApi.success('已添加');
            void blockedKeywordsQuery.refetch();
          },
          onError: (e) =>
            messageApi.error(e instanceof Error ? e.message : '添加失败'),
        },
      );
    },
    [addKeywordMutation, autoDeleteBlocked, blockedKeywordsQuery, messageApi],
  );

  const handleAutoDeleteChange = useCallback((checked: boolean) => {
    setAutoDeleteBlocked(checked);
  }, []);

  const handleAutoReply = useCallback(
    (comment: UiComment) => {
      autoReplyMutation.mutate(comment.id, {
        onSuccess: () => {
          messageApi.success('已触发自动回复');
          void dashboardQuery.refetch();
          void queryClient.invalidateQueries({
            queryKey: ['ai-assistant', 'comment-reply', 'pending'],
          });
        },
        onError: (e) =>
          messageApi.error(e instanceof Error ? e.message : '操作失败'),
      });
    },
    [autoReplyMutation, dashboardQuery, messageApi],
  );

  const handleManualReplySubmit = useCallback(
    (comment: UiComment, text: string) => {
      manualReplyMutation.mutate(
        { commentId: comment.id, data: { replyText: text } },
        {
          onSuccess: () => {
            messageApi.success('回复已发送');
            void dashboardQuery.refetch();
            void queryClient.invalidateQueries({
              queryKey: ['ai-assistant', 'comment-reply', 'pending'],
            });
            void queryClient.invalidateQueries({
              queryKey: ['ai-assistant', 'comment-reply', 'history'],
            });
          },
          onError: (e) =>
            messageApi.error(e instanceof Error ? e.message : '发送失败'),
        },
      );
    },
    [dashboardQuery, manualReplyMutation, messageApi],
  );

  const handleDelete = useCallback(
    (comment: UiComment) => {
      deleteCommentMutation.mutate(comment.id, {
        onSuccess: () => {
          messageApi.success('已删除');
          void dashboardQuery.refetch();
          void queryClient.invalidateQueries({
            queryKey: ['ai-assistant', 'comment-reply', 'pending'],
          });
          void queryClient.invalidateQueries({
            queryKey: ['ai-assistant', 'comment-reply', 'human-review'],
          });
        },
        onError: (e) =>
          messageApi.error(e instanceof Error ? e.message : '删除失败'),
      });
    },
    [dashboardQuery, deleteCommentMutation, messageApi],
  );

  const handleHumanConfirm = useCallback(
    (comment: UiComment, chineseCategory: string) => {
      classifyMutation.mutate(
        {
          commentId: comment.id,
          data: {
            category: chineseCategoryToApi(chineseCategory),
            replyText: comment.suggestedReply ?? undefined,
          },
        },
        {
          onSuccess: () => {
            messageApi.success('已确认分类');
            void dashboardQuery.refetch();
            void queryClient.invalidateQueries({
              queryKey: ['ai-assistant', 'comment-reply', 'pending'],
            });
            void queryClient.invalidateQueries({
              queryKey: ['ai-assistant', 'comment-reply', 'human-review'],
            });
          },
          onError: (e) =>
            messageApi.error(e instanceof Error ? e.message : '提交失败'),
        },
      );
    },
    [classifyMutation, dashboardQuery, messageApi],
  );

  const handleSkipHuman = useCallback(() => {
    messageApi.info('跳过：列表将在刷新后更新');
    void queryClient.invalidateQueries({
      queryKey: ['ai-assistant', 'comment-reply', 'human-review'],
    });
  }, [messageApi]);

  const handleHistoryDetail = useCallback(() => {
    messageApi.info('详情字段见上方列表（契约暂无单独详情接口）');
  }, [messageApi]);

  const fatalError = dashboardQuery.isError;

  if (fatalError) {
    return (
      <div className={styles.container}>
        <PageHeader title="评论 AI 自动回复" />
        <Result
          status="warning"
          title="加载失败"
          subTitle={
            dashboardQuery.error instanceof Error
              ? dashboardQuery.error.message
              : '请稍后重试'
          }
          extra={
            <Button
              type="primary"
              onClick={() => {
                void dashboardQuery.refetch();
              }}
            >
              重试
            </Button>
          }
        />
        {messageHolder}
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {messageHolder}
      <PageHeader
        title="评论 AI 自动回复"
        toolbar={
          <div className={styles.toolbar}>
            <CountdownButton
              buttonText="立即抓取"
              duration={60}
              disabled={!primaryAccountId}
              onClick={async () => {
                if (!primaryAccountId) {
                  messageApi.warning('请先选择一个在线账号');
                  return false;
                }
                try {
                  const res = await scrapeMutation.mutateAsync({
                    accountId: primaryAccountId,
                  });
                  if (res.status === 'ACCEPTED') {
                    messageApi.success('抓取任务已提交');
                  } else {
                    messageApi.warning(res.errorMessage ?? '抓取未受理');
                  }
                  void queryClient.invalidateQueries({
                    queryKey: ['ai-assistant', 'comment-reply'],
                  });
                  return true;
                } catch (e) {
                  messageApi.error(e instanceof Error ? e.message : '提交失败');
                  return false;
                }
              }}
            />
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => {
                navigate('/ai-assistant');
              }}
            >
              返回
            </Button>
          </div>
        }
      />

      {!offlineDismissed && (
        <OfflineWarning
          accounts={offlineAccounts}
          onClose={() => {
            setOfflineDismissed(true);
          }}
        />
      )}

      <StatsOverview
        stats={statsOverview}
        loading={dashboardQuery.isLoading}
        onPendingHumanClick={() => {
          setCommentsTab('human_review');
          setTimeout(() => {
            commentsPanelRef.current?.scrollIntoView({
              behavior: 'smooth',
              block: 'start',
            });
          }, 0);
        }}
      />

      <AccountSelector
        queryOptions={accountQueryOptions}
        selectedIds={selectedAccountIds}
        onSelectionChange={setSelectedAccountIds}
      />

      <ReplyRulesSettings
        enabled={accountSettingsQuery.data?.autoReplyEnabled ?? false}
        loading={accountSettingsQuery.isLoading || rulesQuery.isLoading}
        rules={uiRules}
        tone={primaryTone}
        toneOptions={toneOptionsQuery.data?.options ?? []}
        autoDeleteBlocked={autoDeleteBlocked}
        needReviewForQuestion={
          accountSettingsQuery.data?.humanInterventionForQuestion ?? true
        }
        needReviewForNegative={
          accountSettingsQuery.data?.humanInterventionForNegative ?? true
        }
        blockedKeywords={(blockedKeywordsQuery.data?.keywords ?? []).map(
          (k) => ({
            keywordId: k.keywordId,
            keyword: k.keyword,
          }),
        )}
        canEditRules={canEditRules}
        onToggle={handleToggleAutoReply}
        onToneChange={handleToneChange}
        onNeedReviewChange={handleNeedReviewChange}
        onKeywordRemove={handleKeywordRemove}
        onKeywordAdd={handleKeywordAdd}
        onAutoDeleteChange={handleAutoDeleteChange}
        onAddRule={handleAddRule}
        onRuleEdit={handleRuleEdit}
        onRuleDelete={handleRuleDelete}
      />

      <AddRuleModal
        open={addModalOpen}
        submitLoading={upsertRulesMutation.isPending}
        onClose={() => setAddModalOpen(false)}
        onSubmit={handleAddRuleSubmit}
      />

      <EditRuleModal
        open={editModalOpen}
        rule={editingRule ?? undefined}
        submitLoading={upsertRulesMutation.isPending}
        onClose={() => {
          setEditModalOpen(false);
          setEditingRule(null);
        }}
        onSubmit={handleEditRuleSubmit}
      />

      <CommentsPanel
        ref={commentsPanelRef}
        tab={commentsTab}
        onTabChange={setCommentsTab}
        stats={panelStats}
        pendingQueryOptions={pendingQueryOptions}
        humanQueryOptions={humanQueryOptions}
        historyQueryOptions={historyQueryOptions}
        accountFilterOptions={accountFilterOptions}
        onAutoReply={handleAutoReply}
        onManualReplySubmit={handleManualReplySubmit}
        onDelete={handleDelete}
        onHumanConfirm={handleHumanConfirm}
        onHumanSkip={handleSkipHuman}
        onViewDetail={handleHistoryDetail}
        manualReplyPending={manualReplyMutation.isPending}
      />
    </div>
  );
};

export default CommentReplyPage;
