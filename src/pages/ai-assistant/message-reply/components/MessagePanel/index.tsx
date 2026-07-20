import { useState } from 'react';
import { TabBar } from '@/components';
import { classificationEmoji } from '../../utils/mapMessage';
import ManualReplyModal from '../ManualReplyModal';
import MessageHistoryCard from './components/MessageHistoryCard';
import PendingMessageCard from './components/PendingMessageCard';
import styles from './style.module.css';
import type { MessagePanelProps } from './types';

const TABS = [
  { key: 'pending', name: '待处理私信' },
  { key: 'history', name: '私信记录' },
];

const platformNames = {
  douyin: '抖音',
  xiaohongshu: '小红书',
  weibo: '微博',
};

const MessagePanel = ({
  pendingQueryOptions,
  historyQueryOptions,
  accountSelectOptions,
  classificationFilterOptions,
  onAutoReply,
  onManualReply,
  onView,
  manualReplyPending,
}: MessagePanelProps) => {
  const [activeTab, setActiveTab] = useState('pending');
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<{
    id: string;
    sender: { name: string };
    account: { name: string; platform: 'douyin' | 'xiaohongshu' | 'weibo' };
    content: string;
    classification: { type: string; label: string };
    aiSuggestion?: string;
  } | null>(null);

  const handleManualReply = (message: {
    id: string;
    sender: { name: string };
    account: { name: string; platform: 'douyin' | 'xiaohongshu' | 'weibo' };
    content: string;
    classification: { type: string; label: string };
    aiSuggestion?: string;
  }) => {
    setSelectedMessage(message);
    setModalVisible(true);
  };

  const handleModalClose = () => {
    setModalVisible(false);
    setSelectedMessage(null);
  };

  const handleModalSubmit = (messageId: string, content: string) => {
    onManualReply?.(messageId, content);
    handleModalClose();
  };

  return (
    <div className={styles.container}>
      <div className={styles.tabBar}>
        <TabBar tabs={TABS} activeTab={activeTab} onChange={setActiveTab} />
      </div>
      {activeTab === 'pending' && (
        <PendingMessageCard
          queryOptions={pendingQueryOptions}
          accountSelectOptions={accountSelectOptions}
          classificationFilterOptions={classificationFilterOptions}
          onAutoReply={onAutoReply}
          onManualReply={handleManualReply}
        />
      )}
      {activeTab === 'history' && (
        <MessageHistoryCard
          queryOptions={historyQueryOptions}
          accountSelectOptions={accountSelectOptions}
          classificationFilterOptions={classificationFilterOptions}
          onView={onView}
        />
      )}
      <ManualReplyModal
        open={modalVisible}
        message={
          selectedMessage
            ? {
                id: selectedMessage.id,
                userName: selectedMessage.sender.name,
                accountName: selectedMessage.account.name,
                platform: platformNames[selectedMessage.account.platform],
                content: selectedMessage.content,
              }
            : undefined
        }
        classification={
          selectedMessage
            ? {
                type: selectedMessage.classification.type,
                label: selectedMessage.classification.label,
                emoji: classificationEmoji(selectedMessage.classification.type),
              }
            : undefined
        }
        suggestedReply={selectedMessage?.aiSuggestion}
        submitLoading={manualReplyPending}
        onClose={handleModalClose}
        onSubmit={handleModalSubmit}
      />
    </div>
  );
};

export type { MessagePanelProps } from './types';
export default MessagePanel;
