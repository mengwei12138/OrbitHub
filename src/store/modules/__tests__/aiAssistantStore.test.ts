import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { useAIAssistantStore } from '../aiAssistantStore';

describe('useAIAssistantStore', () => {
  describe('初始状态', () => {
    it('有正确的初始值', () => {
      const { result } = renderHook(() => useAIAssistantStore());
      expect(result.current.accountId).toBeNull();
      expect(result.current.conversationHistory).toBe(true);
      expect(result.current.autoGenerate).toBe(true);
      expect(result.current.page).toBe(1);
      expect(result.current.pageSize).toBe(20);
    });
  });

  describe('setAccountId', () => {
    it('可以设置账号 ID', () => {
      const { result } = renderHook(() => useAIAssistantStore());
      act(() => {
        result.current.setAccountId('account-123');
      });
      expect(result.current.accountId).toBe('account-123');
    });

    it('可以清除账号 ID', () => {
      const { result } = renderHook(() => useAIAssistantStore());
      act(() => {
        result.current.setAccountId('account-123');
        result.current.setAccountId(null);
      });
      expect(result.current.accountId).toBeNull();
    });
  });

  describe('setConversationHistory', () => {
    it('可以设置对话历史开关', () => {
      const { result } = renderHook(() => useAIAssistantStore());
      act(() => {
        result.current.setConversationHistory(false);
      });
      expect(result.current.conversationHistory).toBe(false);
    });
  });

  describe('setAutoGenerate', () => {
    it('可以设置自动生成开关', () => {
      const { result } = renderHook(() => useAIAssistantStore());
      act(() => {
        result.current.setAutoGenerate(false);
      });
      expect(result.current.autoGenerate).toBe(false);
    });
  });

  describe('setPage', () => {
    it('可以设置页码', () => {
      const { result } = renderHook(() => useAIAssistantStore());
      act(() => {
        result.current.setPage(5);
      });
      expect(result.current.page).toBe(5);
    });
  });

  describe('setPageSize', () => {
    it('可以设置每页条数', () => {
      const { result } = renderHook(() => useAIAssistantStore());
      act(() => {
        result.current.setPageSize(50);
      });
      expect(result.current.pageSize).toBe(50);
    });

    it('设置每页条数时重置 page', () => {
      const { result } = renderHook(() => useAIAssistantStore());
      act(() => {
        result.current.setPage(3);
        result.current.setPageSize(50);
      });
      expect(result.current.page).toBe(1);
    });
  });

  describe('reset', () => {
    it('可以重置所有状态', () => {
      const { result } = renderHook(() => useAIAssistantStore());
      act(() => {
        result.current.setAccountId('account-456');
        result.current.setConversationHistory(false);
        result.current.setAutoGenerate(false);
        result.current.setPage(7);
        result.current.setPageSize(100);
        result.current.reset();
      });
      expect(result.current).toEqual({
        accountId: null,
        conversationHistory: true,
        autoGenerate: true,
        page: 1,
        pageSize: 20,
        setAccountId: result.current.setAccountId,
        setConversationHistory: result.current.setConversationHistory,
        setAutoGenerate: result.current.setAutoGenerate,
        setPage: result.current.setPage,
        setPageSize: result.current.setPageSize,
        reset: result.current.reset,
      });
    });
  });
});
