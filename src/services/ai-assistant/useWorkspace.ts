import { useMutation, useQuery } from '@tanstack/react-query';

import {
  aiAssistantConversationsQueryOptions,
  aiAssistantGroupAccountsQueryOptions,
  aiAssistantGroupsQueryOptions,
  aiAssistantKnowledgeFilesQueryOptions,
  aiAssistantMessagesQueryOptions,
  createAiAssistantGroup,
  deleteAiAssistantGroup,
  deleteAiAssistantKnowledgeFile,
  sendAiAssistantMessage,
  updateAiAssistantGroup,
  updateAiAssistantGroupAutoReply,
  uploadAiAssistantKnowledgeFile,
} from './queryOptions';

export const useAiAssistantGroups = () =>
  useQuery(aiAssistantGroupsQueryOptions());

export const useAiAssistantGroupAccounts = () =>
  useQuery(aiAssistantGroupAccountsQueryOptions());

export const useAiAssistantConversations = (params: {
  groupId?: string;
  keyword?: string;
}) => useQuery(aiAssistantConversationsQueryOptions(params));

export const useAiAssistantMessages = (params: {
  groupId?: string;
  conversationId?: string;
}) => useQuery(aiAssistantMessagesQueryOptions(params));

export const useAiAssistantKnowledgeFiles = (groupId?: string) =>
  useQuery(aiAssistantKnowledgeFilesQueryOptions(groupId));

export const useCreateAiAssistantGroup = () =>
  useMutation({
    mutationFn: createAiAssistantGroup,
  });

export const useUpdateAiAssistantGroup = () =>
  useMutation({
    mutationFn: ({
      groupId,
      data,
    }: {
      groupId: string;
      data: Parameters<typeof updateAiAssistantGroup>[1];
    }) => updateAiAssistantGroup(groupId, data),
  });

export const useDeleteAiAssistantGroup = () =>
  useMutation({
    mutationFn: deleteAiAssistantGroup,
  });

export const useSendAiAssistantMessage = () =>
  useMutation({
    mutationFn: ({
      conversationId,
      data,
    }: {
      conversationId: string;
      data: Parameters<typeof sendAiAssistantMessage>[1];
    }) => sendAiAssistantMessage(conversationId, data),
  });

export const useUpdateAiAssistantGroupAutoReply = () =>
  useMutation({
    mutationFn: ({
      groupId,
      autoReplyEnabled,
    }: {
      groupId: string;
      autoReplyEnabled: boolean;
    }) => updateAiAssistantGroupAutoReply(groupId, { autoReplyEnabled }),
  });

export const useUploadAiAssistantKnowledgeFile = () =>
  useMutation({
    mutationFn: ({
      groupId,
      data,
    }: {
      groupId: string;
      data: Parameters<typeof uploadAiAssistantKnowledgeFile>[1];
    }) => uploadAiAssistantKnowledgeFile(groupId, data),
  });

export const useDeleteAiAssistantKnowledgeFile = () =>
  useMutation({
    mutationFn: ({ groupId, fileId }: { groupId: string; fileId: string }) =>
      deleteAiAssistantKnowledgeFile(groupId, fileId),
  });
