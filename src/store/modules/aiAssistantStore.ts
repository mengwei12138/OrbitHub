import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AIAssistantChatState {
  accountId: string | null;
  conversationHistory: boolean;
  autoGenerate: boolean;
  page: number;
  pageSize: number;
  setAccountId: (accountId: string | null) => void;
  setConversationHistory: (enabled: boolean) => void;
  setAutoGenerate: (enabled: boolean) => void;
  setPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;
  reset: () => void;
}

const initialState = {
  accountId: null,
  conversationHistory: true,
  autoGenerate: true,
  page: 1,
  pageSize: 20,
};

export const useAIAssistantStore = create<AIAssistantChatState>()(
  persist(
    (set) => ({
      ...initialState,

      setAccountId: (accountId) => set({ accountId }),

      setConversationHistory: (conversationHistory) =>
        set({ conversationHistory }),

      setAutoGenerate: (autoGenerate) => set({ autoGenerate }),

      setPage: (page) => set({ page }),

      setPageSize: (pageSize) => set({ pageSize, page: 1 }),

      reset: () => set(initialState),
    }),
    { name: 'ai-assistant-state' },
  ),
);
