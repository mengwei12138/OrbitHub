import { PlusOutlined } from '@ant-design/icons';
import { useQueryClient } from '@tanstack/react-query';
import { Button, Empty, Result, Space, message } from 'antd';
import { useEffect, useMemo, useState } from 'react';

import { CustomModal } from '@/components';
import {
  useAiAssistantConversations,
  useCreateAiAssistantGroup,
  useDeleteAiAssistantGroup,
  useDeleteAiAssistantKnowledgeFile,
  useAiAssistantGroupAccounts,
  useAiAssistantGroups,
  useAiAssistantKnowledgeFiles,
  useAiAssistantMessages,
  useSendAiAssistantMessage,
  useUpdateAiAssistantGroup,
  useUpdateAiAssistantGroupAutoReply,
  useUploadAiAssistantKnowledgeFile,
} from '@/services/ai-assistant';

import ChatPanel from './components/ChatPanel';
import ConversationList from './components/ConversationList';
import GroupManageModal from './components/GroupManageModal';
import GroupSidebar from './components/GroupSidebar';
import GroupTabs, { type WorkspaceGroupTab } from './components/GroupTabs';
import KnowledgeBaseModal from './components/KnowledgeBaseModal';
import styles from './style.module.css';

type GroupModalState =
  | { open: false }
  | { open: true; mode: 'create' }
  | { open: true; mode: 'edit'; groupId: string };

const groupQueryKey = ['ai-assistant', 'workspace', 'groups'] as const;
const accountQueryKey = ['ai-assistant', 'workspace', 'accounts'] as const;

const sortGroupTabsForReview = (
  left: WorkspaceGroupTab,
  right: WorkspaceGroupTab,
) => {
  if (left.isUngrouped && !right.isUngrouped) return 1;
  if (!left.isUngrouped && right.isUngrouped) return -1;
  if ((left.hasUrgent ? 1 : 0) !== (right.hasUrgent ? 1 : 0)) {
    return (right.hasUrgent ? 1 : 0) - (left.hasUrgent ? 1 : 0);
  }
  if (left.unreadCount !== right.unreadCount) {
    return right.unreadCount - left.unreadCount;
  }
  return left.name.localeCompare(right.name, 'zh-CN');
};

const sortConversationsForReview = <
  T extends { isUrgent?: boolean; unreadCount: number; lastMessageAt: string },
>(
  left: T,
  right: T,
) => {
  if ((left.isUrgent ? 1 : 0) !== (right.isUrgent ? 1 : 0)) {
    return (right.isUrgent ? 1 : 0) - (left.isUrgent ? 1 : 0);
  }
  if (left.unreadCount !== right.unreadCount) {
    return right.unreadCount - left.unreadCount;
  }
  return right.lastMessageAt.localeCompare(left.lastMessageAt);
};

const AIAssistantPage = () => {
  const queryClient = useQueryClient();
  const [messageApi, messageContextHolder] = message.useMessage();
  const [activeGroupId, setActiveGroupId] = useState<string>();
  const [selectedConversationId, setSelectedConversationId] = useState<string>();
  const [keyword, setKeyword] = useState('');
  const [draft, setDraft] = useState('');
  const [groupModalState, setGroupModalState] = useState<GroupModalState>({
    open: false,
  });
  const [knowledgeModalOpen, setKnowledgeModalOpen] = useState(false);

  const groupsQuery = useAiAssistantGroups();
  const accountsQuery = useAiAssistantGroupAccounts();

  const groups = groupsQuery.data?.groups ?? [];
  const allAccounts = accountsQuery.data?.accounts ?? [];

  const assignedAccountIds = useMemo(
    () => new Set(groups.flatMap((group) => group.accountIds)),
    [groups],
  );

  const ungroupedAccounts = useMemo(
    () =>
      allAccounts.filter((account) => !assignedAccountIds.has(account.accountId)),
    [allAccounts, assignedAccountIds],
  );

  const groupTabs = useMemo<WorkspaceGroupTab[]>(() => {
    const base: WorkspaceGroupTab[] = groups.map((group) => ({
      id: group.id,
      name: group.name,
      accountCount: group.accountCount,
      unreadCount: group.unreadCount,
      hasUrgent: group.hasUrgent,
    }));
    if (ungroupedAccounts.length > 0) {
      base.push({
        id: 'ungrouped',
        name: '未分组账号',
        accountCount: ungroupedAccounts.length,
        unreadCount: 0,
        isUngrouped: true,
      });
    }
    return [...base].sort(sortGroupTabsForReview);
  }, [groups, ungroupedAccounts.length]);

  useEffect(() => {
    if (groupTabs.length === 0) {
      setActiveGroupId(undefined);
      return;
    }
    if (!activeGroupId || !groupTabs.some((tab) => tab.id === activeGroupId)) {
      setActiveGroupId(groupTabs[0]?.id);
    }
  }, [activeGroupId, groupTabs]);

  const activeGroup = groups.find((group) => group.id === activeGroupId);
  const isUngrouped = activeGroupId === 'ungrouped';
  const currentGroupAccounts = useMemo(() => {
    if (isUngrouped) return ungroupedAccounts;
    if (!activeGroup) return [];
    return allAccounts.filter((account) => activeGroup.accountIds.includes(account.accountId));
  }, [activeGroup, allAccounts, isUngrouped, ungroupedAccounts]);

  const conversationsQuery = useAiAssistantConversations({
    groupId: activeGroupId,
    keyword,
  });

  const conversations = useMemo(
    () => [...(conversationsQuery.data?.list ?? [])].sort(sortConversationsForReview),
    [conversationsQuery.data?.list],
  );

  useEffect(() => {
    if (conversations.length === 0) {
      setSelectedConversationId(undefined);
      return;
    }
    if (
      !selectedConversationId ||
      !conversations.some((item) => item.id === selectedConversationId)
    ) {
      setSelectedConversationId(conversations[0]?.id);
    }
  }, [conversations, selectedConversationId]);

  const selectedConversation = conversations.find(
    (item) => item.id === selectedConversationId,
  );

  const messagesQuery = useAiAssistantMessages({
    groupId: activeGroupId,
    conversationId: selectedConversationId,
  });

  const knowledgeFilesQuery = useAiAssistantKnowledgeFiles(
    !isUngrouped ? activeGroup?.id : undefined,
  );

  const createGroupMutation = useCreateAiAssistantGroup();
  const updateGroupMutation = useUpdateAiAssistantGroup();
  const deleteGroupMutation = useDeleteAiAssistantGroup();
  const sendMessageMutation = useSendAiAssistantMessage();
  const updateAutoReplyMutation = useUpdateAiAssistantGroupAutoReply();
  const uploadKnowledgeMutation = useUploadAiAssistantKnowledgeFile();
  const deleteKnowledgeMutation = useDeleteAiAssistantKnowledgeFile();

  const refreshWorkspace = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: groupQueryKey }),
      queryClient.invalidateQueries({ queryKey: accountQueryKey }),
      queryClient.invalidateQueries({
        queryKey: ['ai-assistant', 'workspace', 'conversations'],
      }),
      queryClient.invalidateQueries({
        queryKey: ['ai-assistant', 'workspace', 'messages'],
      }),
      queryClient.invalidateQueries({
        queryKey: ['ai-assistant', 'workspace', 'knowledge-files'],
      }),
    ]);
  };

  const currentGroupFormValues =
    groupModalState.open && groupModalState.mode === 'edit'
      ? groups.find((group) => group.id === groupModalState.groupId)
      : undefined;

  const handleSubmitGroup = async (values: {
    name: string;
    accountIds: string[];
  }) => {
    try {
      if (groupModalState.open && groupModalState.mode === 'edit') {
        await updateGroupMutation.mutateAsync({
          groupId: groupModalState.groupId,
          data: values,
        });
        setActiveGroupId(groupModalState.groupId);
      } else {
        await createGroupMutation.mutateAsync(values);
        setActiveGroupId(undefined);
      }
      setGroupModalState({ open: false });
      await refreshWorkspace();
      messageApi.success('账号分组已保存');
    } catch (error) {
      messageApi.error(error instanceof Error ? error.message : '保存分组失败');
    }
  };

  const handleDeleteGroup = () => {
    if (!activeGroup || isUngrouped) return;
    CustomModal.confirm({
      title: '删除账号分组',
      content: '删除后，分组内账号会回到未分组视图，知识库文件也会一并移除。',
      onOk: async () => {
        try {
          await deleteGroupMutation.mutateAsync(activeGroup.id);
          setActiveGroupId(undefined);
          setSelectedConversationId(undefined);
          await refreshWorkspace();
          messageApi.success('分组已删除');
        } catch (error) {
          messageApi.error(error instanceof Error ? error.message : '删除分组失败');
        }
      },
    });
  };

  const handleSendMessage = async () => {
    if (!selectedConversationId) {
      messageApi.warning('请先选择一个私信会话');
      return;
    }
    if (!draft.trim()) {
      messageApi.warning('请输入回复内容');
      return;
    }
    try {
      await sendMessageMutation.mutateAsync({
        conversationId: selectedConversationId,
        data: { replyText: draft.trim() },
      });
      setDraft('');
      await refreshWorkspace();
      messageApi.success('消息已发送');
    } catch (error) {
      messageApi.error(error instanceof Error ? error.message : '发送失败');
    }
  };

  const handleToggleAutoReply = async (checked: boolean) => {
    if (!activeGroup || isUngrouped) return;
    try {
      await updateAutoReplyMutation.mutateAsync({
        groupId: activeGroup.id,
        autoReplyEnabled: checked,
      });
      await refreshWorkspace();
      messageApi.success(
        checked ? '已开启该分组 AI 自动回复' : '已关闭该分组 AI 自动回复',
      );
    } catch (error) {
      messageApi.error(error instanceof Error ? error.message : '更新失败');
    }
  };

  const handleUploadKnowledgeFile = async (file: File) => {
    if (!activeGroup || isUngrouped) return;
    try {
      await uploadKnowledgeMutation.mutateAsync({
        groupId: activeGroup.id,
        data: {
          fileName: file.name,
          fileType: file.type || 'application/octet-stream',
          fileSizeBytes: file.size,
        },
      });
      await refreshWorkspace();
      messageApi.success('知识库文件已导入');
    } catch (error) {
      messageApi.error(error instanceof Error ? error.message : '上传失败');
    }
  };

  const handleDeleteKnowledgeFile = async (fileId: string) => {
    if (!activeGroup || isUngrouped) return;
    try {
      await deleteKnowledgeMutation.mutateAsync({
        groupId: activeGroup.id,
        fileId,
      });
      await refreshWorkspace();
      messageApi.success('知识库文件已删除');
    } catch (error) {
      messageApi.error(error instanceof Error ? error.message : '删除失败');
    }
  };

  const noGroupYet = groups.length === 0;

  return (
    <div className={styles.page}>
      {messageContextHolder}

      <div className={styles.toolbar}>
        <div className={styles.toolbarTitle}>
          <h2>分组私信工作台</h2>
          <p>
            先按账号建立业务分组，再在同一工作台内集中处理私信、开启 AI
            自动回复并维护分组知识库。
          </p>
        </div>
        <div className={styles.toolbarActions}>
          <Space>
            <Button
              icon={<PlusOutlined />}
              type="primary"
              onClick={() => {
                setGroupModalState({ open: true, mode: 'create' });
              }}
            >
              创建账号分组
            </Button>
          </Space>
        </div>
      </div>

      {groupsQuery.isError || accountsQuery.isError ? (
        <Result
          status="warning"
          title="加载失败"
          subTitle="AI 助手工作台数据暂时不可用，请稍后重试"
          extra={
            <Button
              type="primary"
              onClick={() => {
                void groupsQuery.refetch();
                void accountsQuery.refetch();
              }}
            >
              重试
            </Button>
          }
        />
      ) : groupsQuery.isLoading || accountsQuery.isLoading ? (
        <div className={styles.emptyWrap}>
          <Empty description="正在加载分组工作台..." />
        </div>
      ) : noGroupYet && ungroupedAccounts.length === 0 ? (
        <div className={styles.emptyWrap}>
          <Empty
            description="当前管理员还没有可分组的社交账号，请先导入账号后再创建分组。"
          />
        </div>
      ) : (
        <>
          <GroupTabs
            groups={groupTabs}
            activeGroupId={activeGroupId}
            onChange={(groupId) => {
              setActiveGroupId(groupId);
              setSelectedConversationId(undefined);
            }}
          />

          {noGroupYet ? (
            <div className={styles.emptyWrap}>
              <Empty
                description="尚未创建任何账号分组。请先创建分组，并将当前管理员已导入账号归组。"
              >
                <Button
                  type="primary"
                  onClick={() => {
                    setGroupModalState({ open: true, mode: 'create' });
                  }}
                >
                  创建账号分组
                </Button>
              </Empty>
            </div>
          ) : (
            <div className={styles.workspace}>
              <ConversationList
                conversations={conversations}
                selectedConversationId={selectedConversationId}
                keyword={keyword}
                onKeywordChange={setKeyword}
                onSelect={setSelectedConversationId}
              />
              <ChatPanel
                conversation={selectedConversation}
                messages={messagesQuery.data?.list ?? []}
                draft={draft}
                sending={sendMessageMutation.isPending}
                autoReplyEnabled={activeGroup?.autoReplyEnabled ?? false}
                autoReplyLoading={updateAutoReplyMutation.isPending}
                autoReplyEditable={!isUngrouped && Boolean(activeGroup)}
                onDraftChange={setDraft}
                onSend={() => {
                  void handleSendMessage();
                }}
                onToggleAutoReply={(checked) => {
                  void handleToggleAutoReply(checked);
                }}
              />
              <GroupSidebar
                accounts={currentGroupAccounts}
                knowledgeFiles={knowledgeFilesQuery.data?.files ?? []}
                isUngrouped={isUngrouped}
                canManageGroup={Boolean(activeGroup)}
                onEditGroup={() => {
                  if (!activeGroup || isUngrouped) return;
                  setGroupModalState({
                    open: true,
                    mode: 'edit',
                    groupId: activeGroup.id,
                  });
                }}
                onDeleteGroup={handleDeleteGroup}
                onManageKnowledgeBase={() => {
                  setKnowledgeModalOpen(true);
                }}
              />
            </div>
          )}
        </>
      )}

      <GroupManageModal
        open={groupModalState.open}
        mode={groupModalState.open ? groupModalState.mode : 'create'}
        confirmLoading={
          createGroupMutation.isPending || updateGroupMutation.isPending
        }
        accounts={allAccounts}
        currentGroupId={currentGroupFormValues?.id}
        initialValues={
          currentGroupFormValues
            ? {
                name: currentGroupFormValues.name,
                accountIds: currentGroupFormValues.accountIds,
              }
            : undefined
        }
        onCancel={() => {
          setGroupModalState({ open: false });
        }}
        onSubmit={(values) => {
          void handleSubmitGroup(values);
        }}
      />

      <KnowledgeBaseModal
        open={knowledgeModalOpen}
        uploading={uploadKnowledgeMutation.isPending}
        files={knowledgeFilesQuery.data?.files ?? []}
        deletingFileId={
          deleteKnowledgeMutation.variables &&
          'fileId' in deleteKnowledgeMutation.variables
            ? deleteKnowledgeMutation.variables.fileId
            : undefined
        }
        onCancel={() => {
          setKnowledgeModalOpen(false);
        }}
        onUpload={(file) => {
          void handleUploadKnowledgeFile(file);
        }}
        onDelete={(fileId) => {
          void handleDeleteKnowledgeFile(fileId);
        }}
      />
    </div>
  );
};

export default AIAssistantPage;
