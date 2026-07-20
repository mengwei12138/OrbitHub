import { Empty, Input } from 'antd';

import { PlatformIcon } from '@/components';
import type { AiAssistantConversation } from '@/services/ai-assistant';

import styles from '../../style.module.css';

type ConversationListProps = {
  conversations: AiAssistantConversation[];
  selectedConversationId?: string;
  keyword: string;
  onKeywordChange: (value: string) => void;
  onSelect: (conversationId: string) => void;
};

const ConversationList = ({
  conversations,
  selectedConversationId,
  keyword,
  onKeywordChange,
  onSelect,
}: ConversationListProps) => (
  <div className={styles.panel}>
    <div className={styles.panelHeader}>
      <div>
        <h3 className={styles.panelTitle}>收到的私信</h3>
        <div className={styles.panelSubtitle}>按分组汇总展示最新会话与未读提醒</div>
      </div>
    </div>
    <div className={styles.conversationSearch}>
      <Input.Search
        allowClear
        placeholder="搜索昵称、消息或账号"
        value={keyword}
        onChange={(event) => {
          onKeywordChange(event.target.value);
        }}
      />
    </div>
    <div className={styles.conversationList}>
      {conversations.length === 0 ? (
        <Empty description="当前分组暂无私信" image={Empty.PRESENTED_IMAGE_SIMPLE} />
      ) : (
        conversations.map((conversation) => {
          const active = conversation.id === selectedConversationId;
          return (
            <button
              key={conversation.id}
              type="button"
              className={`${styles.conversationCard} ${active ? styles.conversationCardActive : ''}`}
              onClick={() => {
                onSelect(conversation.id);
              }}
            >
              <div className={styles.conversationRow}>
                <div className={styles.conversationName}>{conversation.senderName}</div>
                <div className={styles.conversationTime}>{conversation.lastMessageAt}</div>
              </div>
              <div className={styles.conversationSnippet}>{conversation.lastMessageText}</div>
              <div className={styles.conversationMeta}>
                <div className={styles.conversationAccount}>
                  <PlatformIcon platform={conversation.platform} size={16} />
                  <span>{conversation.accountName}</span>
                </div>
              </div>
              <div className={styles.cardIndicators}>
                {conversation.isUrgent ? (
                  <span className={styles.urgentIndicator}>紧急</span>
                ) : null}
                {conversation.unreadCount > 0 ? (
                  <span className={styles.unreadIndicator}>未读 {conversation.unreadCount}</span>
                ) : null}
              </div>
            </button>
          );
        })
      )}
    </div>
  </div>
);

export default ConversationList;
