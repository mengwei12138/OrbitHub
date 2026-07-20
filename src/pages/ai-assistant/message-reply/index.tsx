import { ArrowLeftOutlined } from '@ant-design/icons';
import { useQueryClient } from '@tanstack/react-query';
import { Alert, Button, message } from 'antd';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { PaginationParams } from '@/api/types';
import { PageHeader } from '@/components';
import {
  pendingMessagesQueryOptions,
  useMessageCategories,
  useMessageReplyAccounts,
  useMessageReplyRules,
  useMessageScrapeSettings,
  useSubmitManualMessageReply,
  useTriggerMessageAutoReply,
  useTriggerMessageScrape,
  useUpdateMessageScrapeSettings,
  useUpsertMessageCategories,
  useUpsertMessageReplyRules,
} from '@/services/ai-assistant';
import type {
  MessageCategory,
  MessageReplyRule,
  MessageReplySettings,
} from '@/services/ai-assistant/types';
import { useUserStore } from '@/store/modules/userStore';

import AccountSelector, { type Account } from './components/AccountSelector';
import ClassificationRulesSettings, {
  type ClassificationType,
} from './components/ClassificationRulesSettings';
import FetchSettings, {
  type FetchFrequency,
  type MessageType,
} from './components/FetchSettings';
import MessagePanel from './components/MessagePanel';
import RuleEditModal from './components/RuleEditModal';
import styles from './style.module.css';
import type { MessageFetchFrequency } from './utils/mapMessage';
import {
  fetchFrequencyToSeconds,
  fetchTypeToScrapeTypes,
  mapPendingRecord,
  mergeCategoriesAndRulesToReplyRules,
  parseAccountSnapshots,
  parseMessageCategories,
  parseMessageReplyRules,
  parseMessageReplySettings,
  scrapeTypesToFetchType,
  secondsToFetchFrequency,
} from './utils/mapMessage';

type RuleModalState =
  | { open: false }
  | { open: true; mode: 'add' }
  | {
      open: true;
      mode: 'edit';
      ruleId: string;
      categoryName: string;
      keywords: string;
      template: string;
    };

const splitKeywordInput = (s: string) =>
  s
    .split(/[,，]/u)
    .map((x) => x.trim())
    .filter(Boolean);

const API_HINT =
  '私信接口在本期契约中可能返回 HTTP 501（未实现）；解锁后将自动加载数据。当前仍可编辑页面结构并保存设置（成功取决于后端状态）。';

const MessageReplyPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [messageApi, messageHolder] = message.useMessage();
  const roles = useUserStore((state) => state.roles);

  const accountsQuery = useMessageReplyAccounts();
  const scrapeQuery = useMessageScrapeSettings();
  const categoriesQuery = useMessageCategories();
  const rulesQuery = useMessageReplyRules();

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [frequency, setFrequency] = useState<FetchFrequency>('5min');
  const [messageType, setMessageType] = useState<MessageType>('all');
  const [autoReplyEnabled, setAutoReplyEnabled] = useState(true);

  const [importantTypes, setImportantTypes] = useState<ClassificationType[]>(
    [],
  );
  const [notificationMethods, setNotificationMethods] = useState<string[]>([
    '站内通知',
  ]);

  const didHydrateSettingsRef = useRef(false);

  useEffect(() => {
    if (didHydrateSettingsRef.current || scrapeQuery.data === undefined) {
      return;
    }
    const s = parseMessageReplySettings(scrapeQuery.data);
    if (!s) {
      return;
    }
    setFrequency(secondsToFetchFrequency(s.scrapeIntervalSeconds));
    setMessageType(scrapeTypesToFetchType(s.scrapeTypes));
    setAutoReplyEnabled(s.autoReplyEnabled ?? false);
    didHydrateSettingsRef.current = true;
  }, [scrapeQuery.data]);

  const snapshots = useMemo(
    () => parseAccountSnapshots(accountsQuery.data),
    [accountsQuery.data],
  );

  const accountsUi: Account[] = useMemo(
    () =>
      snapshots.map((a) => ({
        id: a.accountId,
        name: a.nickname ?? a.phoneNumber,
        platform: a.platform,
      })),
    [snapshots],
  );

  const primaryAccountId = selectedIds[0];

  const updateScrapeMutation = useUpdateMessageScrapeSettings();
  const triggerScrapeMutation = useTriggerMessageScrape();
  const submitManualMutation = useSubmitManualMessageReply();
  const autoReplyMutation = useTriggerMessageAutoReply();
  const upsertCategoriesMutation = useUpsertMessageCategories();
  const upsertRulesMutation = useUpsertMessageReplyRules();

  const [ruleModal, setRuleModal] = useState<RuleModalState>({ open: false });

  const categoriesParsed = parseMessageCategories(categoriesQuery.data);
  const rulesParsed = parseMessageReplyRules(rulesQuery.data);

  const primaryAccountName = useMemo(
    () => accountsUi.find((a) => a.id === primaryAccountId)?.name ?? '',
    [accountsUi, primaryAccountId],
  );

  const pendingQueryOptions = useCallback(
    (params: PaginationParams) => {
      return {
        queryKey: ['ai-assistant', 'message-reply', 'pending'] as any,
        queryFn: async () => {
          const res = await pendingMessagesQueryOptions({
            page: params.page,
            pageSize: params.pageSize,
            accountId: primaryAccountId,
            classification: params.classification as string | undefined,
            status: params.status as string | undefined,
            keyword: params.keyword as undefined,
          }).queryFn();
          const typedRes = res as { list: unknown[]; total: string | number };
          return {
            ...typedRes,
            list: typedRes.list.map((item) =>
              mapPendingRecord(
                item as Parameters<typeof mapPendingRecord>[0],
                primaryAccountName,
              ),
            ),
          };
        },
      };
    },
    [primaryAccountId, primaryAccountName],
  );

  const historyQueryOptions = useCallback(
    (params: PaginationParams) => {
      return {
        queryKey: ['ai-assistant', 'message-reply', 'history'] as any,
        queryFn: async () => {
          const res = await import('@/api/request').then((m) =>
            m.default.get('/api/v1/ai-assistant/message-reply/history', {
              params: {
                page: params.page,
                pageSize: params.pageSize,
                accountId: primaryAccountId,
                classification: params.classification as string | undefined,
                status: params.status as string | undefined,
                keyword: params.keyword as string | undefined,
              },
            }),
          );
          return res as any;
        },
      };
    },
    [primaryAccountId],
  );

  const replyRulesUi = useMemo(
    () => mergeCategoriesAndRulesToReplyRules(categoriesParsed, rulesParsed),
    [categoriesParsed, rulesParsed],
  );

  const accountSelectOptions = useMemo(
    () => [
      { label: '全部', value: '' },
      ...accountsUi.map((a) => ({ label: a.name, value: a.id })),
    ],
    [accountsUi],
  );

  const classificationFilterOptions = useMemo(() => {
    const base = [{ label: '全部', value: '' }];
    const seen = new Map<string, string>();
    for (const r of replyRulesUi) {
      if (!seen.has(r.type)) {
        seen.set(r.type, r.label);
      }
    }
    return [
      ...base,
      ...[...seen.entries()].map(([value, label]) => ({ label, value })),
    ];
  }, [replyRulesUi]);

  const buildScrapeBody = useCallback((): MessageReplySettings => {
    const base = parseMessageReplySettings(scrapeQuery.data) ?? {};
    return {
      ...base,
      autoReplyEnabled,
      scrapeIntervalSeconds: fetchFrequencyToSeconds(
        frequency as MessageFetchFrequency,
      ),
      scrapeTypes: fetchTypeToScrapeTypes(messageType),
    };
  }, [autoReplyEnabled, frequency, messageType, scrapeQuery.data]);

  const persistScrape = useCallback(
    (patch: Partial<MessageReplySettings>) => {
      updateScrapeMutation.mutate(
        { ...buildScrapeBody(), ...patch },
        {
          onSuccess: () => messageApi.success('设置已保存'),
          onError: (e) =>
            messageApi.error(e instanceof Error ? e.message : '保存失败'),
        },
      );
    },
    [buildScrapeBody, messageApi, updateScrapeMutation],
  );

  const handleFrequencyChange = useCallback(
    (f: FetchFrequency) => {
      setFrequency(f);
      persistScrape({
        scrapeIntervalSeconds: fetchFrequencyToSeconds(
          f as MessageFetchFrequency,
        ),
      });
    },
    [persistScrape],
  );

  const handleMessageTypeChange = useCallback(
    (t: MessageType) => {
      setMessageType(t);
      persistScrape({ scrapeTypes: fetchTypeToScrapeTypes(t) });
    },
    [persistScrape],
  );

  const handleAutoReplyToggle = useCallback(
    (enabled: boolean) => {
      setAutoReplyEnabled(enabled);
      persistScrape({ autoReplyEnabled: enabled });
    },
    [persistScrape],
  );

  const handleTriggerScrape = useCallback(() => {
    if (!primaryAccountId) {
      messageApi.warning('请先选择账号');
      return;
    }
    triggerScrapeMutation.mutate(
      { accountId: primaryAccountId },
      {
        onSuccess: () => {
          messageApi.success('抓取任务已提交');
          void accountsQuery.refetch();
          void queryClient.invalidateQueries({
            queryKey: ['ai-assistant', 'message-reply'],
          });
        },
        onError: (e) =>
          messageApi.error(e instanceof Error ? e.message : '提交失败'),
      },
    );
  }, [
    accountsQuery,
    messageApi,
    primaryAccountId,
    queryClient,
    triggerScrapeMutation,
  ]);

  const handleManualReply = useCallback(
    (messageId: string, content: string) => {
      if (!content.trim()) {
        messageApi.warning('请输入回复内容');
        return;
      }
      submitManualMutation.mutate(
        { messageId, data: { replyText: content } },
        {
          onSuccess: () => {
            messageApi.success('已发送');
            void queryClient.invalidateQueries({
              queryKey: ['ai-assistant', 'message-reply'],
            });
          },
          onError: (e) =>
            messageApi.error(e instanceof Error ? e.message : '发送失败'),
        },
      );
    },
    [messageApi, queryClient, submitManualMutation],
  );

  const handleAutoReply = useCallback(
    (messageId: string) => {
      autoReplyMutation.mutate(messageId, {
        onSuccess: () => {
          messageApi.success('已触发自动回复');
          void queryClient.invalidateQueries({
            queryKey: ['ai-assistant', 'message-reply'],
          });
        },
        onError: (e) =>
          messageApi.error(e instanceof Error ? e.message : '操作失败'),
      });
    },
    [autoReplyMutation, messageApi, queryClient],
  );

  const handleHistoryView = useCallback(() => {
    messageApi.info('详情由列表字段展示（契约暂无单独详情接口）');
  }, [messageApi]);

  const handleRuleModalSubmit = useCallback(
    async (values: {
      categoryName: string;
      keywordsText: string;
      template: string;
    }) => {
      const catName = values.categoryName.trim();
      const keywords = splitKeywordInput(values.keywordsText);
      const nextCategories: MessageCategory[] = [
        ...(categoriesParsed?.categories ?? []),
      ];
      const nextRules: MessageReplyRule[] = [...(rulesParsed?.rules ?? [])];

      const cIdx = nextCategories.findIndex((c) => c.name === catName);
      if (cIdx >= 0) {
        nextCategories[cIdx] = {
          ...nextCategories[cIdx],
          name: catName,
          keywords,
        };
      } else {
        nextCategories.push({ name: catName, keywords });
      }

      if (!ruleModal.open) {
        return;
      }

      if (ruleModal.mode === 'add') {
        const rIdx = nextRules.findIndex((r) => r.category === catName);
        if (rIdx >= 0) {
          nextRules[rIdx] = {
            ...nextRules[rIdx],
            template: values.template,
            category: catName,
          };
        } else {
          nextRules.push({ category: catName, template: values.template });
        }
      } else {
        const idx = replyRulesUi.findIndex((r) => r.id === ruleModal.ruleId);
        if (idx >= 0 && nextRules[idx]) {
          nextRules[idx] = {
            ...nextRules[idx],
            category: catName,
            template: values.template,
          };
        }
      }

      try {
        await upsertCategoriesMutation.mutateAsync({
          categories: nextCategories,
        });
        await upsertRulesMutation.mutateAsync({ rules: nextRules });
        await queryClient.invalidateQueries({
          queryKey: ['ai-assistant', 'message-reply'],
        });
        messageApi.success('规则已保存');
        setRuleModal({ open: false });
      } catch (e) {
        messageApi.error(e instanceof Error ? e.message : '保存失败');
        throw e;
      }
    },
    [
      categoriesParsed?.categories,
      messageApi,
      queryClient,
      replyRulesUi,
      ruleModal,
      rulesParsed?.rules,
      upsertCategoriesMutation,
      upsertRulesMutation,
    ],
  );

  const showApiHint =
    accountsQuery.isError ||
    scrapeQuery.isError ||
    categoriesQuery.isError ||
    rulesQuery.isError;

  const settingsBusy = updateScrapeMutation.isPending || scrapeQuery.isLoading;
  const ruleModalBusy =
    upsertCategoriesMutation.isPending || upsertRulesMutation.isPending;
  const canEditRules = roles.includes('TENANT_ADMIN');

  return (
    <div className={styles.container}>
      {messageHolder}
      {showApiHint ? (
        <Alert type="warning" showIcon closable message={API_HINT} />
      ) : null}
      <PageHeader
        title="私信 AI 自动回复"
        toolbar={
          <div className={styles.toolbar} data-testid="message-reply-toolbar">
            <Button
              loading={triggerScrapeMutation.isPending}
              disabled={!primaryAccountId}
              onClick={handleTriggerScrape}
            >
              立即抓取
            </Button>
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
      <AccountSelector
        accounts={accountsUi}
        selectedIds={selectedIds}
        onChange={setSelectedIds}
      />
      <FetchSettings
        frequency={frequency}
        messageType={messageType}
        disabled={settingsBusy}
        onFrequencyChange={handleFrequencyChange}
        onMessageTypeChange={handleMessageTypeChange}
      />
      <ClassificationRulesSettings
        rules={replyRulesUi}
        autoReplyEnabled={autoReplyEnabled}
        importantTypes={importantTypes}
        notificationMethods={notificationMethods}
        canEditRules={canEditRules}
        onAutoReplyToggle={handleAutoReplyToggle}
        onImportantTypesChange={setImportantTypes}
        onNotificationMethodsChange={setNotificationMethods}
        onRuleEdit={(ruleId) => {
          const ui = replyRulesUi.find((r) => r.id === ruleId);
          if (!ui) {
            return;
          }
          const idx = replyRulesUi.findIndex((r) => r.id === ruleId);
          const raw = rulesParsed?.rules?.[idx];
          setRuleModal({
            open: true,
            mode: 'edit',
            ruleId,
            categoryName: raw?.category ?? ui.label,
            keywords: ui.keywords.join(', '),
            template: raw?.template ?? ui.template,
          });
        }}
        onAddRule={() => {
          setRuleModal({ open: true, mode: 'add' });
        }}
      />
      <MessagePanel
        pendingQueryOptions={pendingQueryOptions}
        historyQueryOptions={historyQueryOptions}
        accountSelectOptions={accountSelectOptions}
        classificationFilterOptions={classificationFilterOptions}
        onAutoReply={handleAutoReply}
        onManualReply={handleManualReply}
        onView={handleHistoryView}
        manualReplyPending={submitManualMutation.isPending}
      />
      {(accountsQuery.isError || scrapeQuery.isError) && (
        <div className={styles.retryBar}>
          <Button
            type="link"
            onClick={() => {
              void accountsQuery.refetch();
              void scrapeQuery.refetch();
            }}
          >
            重新加载账号与抓取设置
          </Button>
        </div>
      )}

      <RuleEditModal
        open={ruleModal.open}
        mode={ruleModal.open ? ruleModal.mode : 'add'}
        categoryName={
          ruleModal.open && ruleModal.mode === 'edit'
            ? ruleModal.categoryName
            : undefined
        }
        initialKeywords={
          ruleModal.open && ruleModal.mode === 'edit' ? ruleModal.keywords : ''
        }
        initialTemplate={
          ruleModal.open && ruleModal.mode === 'edit' ? ruleModal.template : ''
        }
        submitLoading={ruleModalBusy}
        onClose={() => {
          setRuleModal({ open: false });
        }}
        onSubmit={handleRuleModalSubmit}
      />
    </div>
  );
};

export default MessageReplyPage;
