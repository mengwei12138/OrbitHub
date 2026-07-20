import { Button, Empty, Input, Switch } from 'antd';

import { PlatformIcon } from '@/components';
import type {
  AiAssistantConversation,
  AiAssistantMessage,
} from '@/services/ai-assistant';

import styles from '../../style.module.css';

type ChatPanelProps = {
  conversation?: AiAssistantConversation;
  messages: AiAssistantMessage[];
  draft: string;
  sending: boolean;
  autoReplyEnabled: boolean;
  autoReplyLoading: boolean;
  autoReplyEditable: boolean;
  onDraftChange: (value: string) => void;
  onSend: () => void;
  onToggleAutoReply: (value: boolean) => void;
};

type ChatMessageItem =
  | { type: 'divider'; id: string; label: string }
  | { type: 'message'; id: string; data: AiAssistantMessage };

const formatTimeLabel = (createdAt: string) => {
  const [datePart = '', timePart = ''] = createdAt.split(' ');
  const minuteLabel = timePart.slice(0, 5);
  return datePart ? `${datePart} ${minuteLabel}` : createdAt;
};

const buildTimeline = (messages: AiAssistantMessage[]): ChatMessageItem[] => {
  const items: ChatMessageItem[] = [];
  let previousDate = '';

  messages.forEach((message) => {
    const currentDate = message.createdAt.split(' ')[0] ?? message.createdAt;
    if (currentDate && currentDate !== previousDate) {
      items.push({
        type: 'divider',
        id: `divider-${currentDate}`,
        label: currentDate,
      });
      previousDate = currentDate;
    }

    items.push({
      type: 'message',
      id: message.id,
      data: message,
    });
  });

  return items;
};

const getRoleMeta = (message: AiAssistantMessage) => {
  if (message.senderType === 'CUSTOMER') {
    return {
      label: '客户',
      rowClassName: styles.messageRowCustomer,
      bubbleClassName: styles.messageBubbleCustomer,
      badgeClassName: styles.messageRoleCustomer,
      badgeRowClassName: styles.messageBadgeRowCustomer,
    };
  }
  if (message.senderType === 'AI') {
    return {
      label: 'AI 自动回复',
      rowClassName: styles.messageRowAi,
      bubbleClassName: styles.messageBubbleAi,
      badgeClassName: styles.messageRoleAi,
      badgeRowClassName: styles.messageBadgeRowRight,
    };
  }
  return {
    label: '人工发送',
    rowClassName: styles.messageRowOperator,
    bubbleClassName: styles.messageBubbleOperator,
    badgeClassName: styles.messageRoleOperator,
    badgeRowClassName: styles.messageBadgeRowRight,
  };
};

const ChatPanel = ({
  conversation,
  messages,
  draft,
  sending,
  autoReplyEnabled,
  autoReplyLoading,
  autoReplyEditable,
  onDraftChange,
  onSend,
  onToggleAutoReply,
}: ChatPanelProps) => {
  const timeline = buildTimeline(messages);

  return (
    <div className={`${styles.panel} ${styles.chatPanel}`}>
      <div className={`${styles.panelHeader} ${styles.chatHeader}`}>
        <div className={styles.chatHeaderMain}>
          <div className={styles.chatHeaderTitleRow}>
            <h3 className={styles.panelTitle}>
              {conversation?.senderName ?? '请选择一个私信会话'}
            </h3>
          </div>
          <div className={styles.chatHeaderMeta}>
            {conversation ? (
              <>
                <span>所属账号：{conversation.accountName}</span>
                <span className={styles.chatHeaderDot} />
                <span className={styles.chatHeaderPlatform}>
                  <PlatformIcon platform={conversation.platform} size={16} />
                  <span>
                    {conversation.platform === 'douyin' ? '抖音' : '小红书'}
                  </span>
                </span>
              </>
            ) : (
              <span>从左侧选择一个私信开始处理。</span>
            )}
          </div>
        </div>
        <div className={styles.chatTools}>
          <span className={styles.chatToolsLabel}>自动回复</span>
          <Switch
            checked={autoReplyEnabled}
            disabled={!autoReplyEditable}
            loading={autoReplyLoading}
            onChange={onToggleAutoReply}
          />
        </div>
      </div>

      {!conversation ? (
        <div className={styles.emptyWrap}>
          <Empty description="从左侧选择一个私信开始处理" />
        </div>
      ) : (
        <div className={styles.chatBody}>
          <div className={styles.chatStream}>
            {timeline.map((item) => {
              if (item.type === 'divider') {
                return (
                  <div key={item.id} className={styles.messageDivider}>
                    <span>{item.label}</span>
                  </div>
                );
              }

              const message = item.data;
              const roleMeta = getRoleMeta(message);

              return (
                <div
                  key={item.id}
                  className={`${styles.messageRow} ${roleMeta.rowClassName}`}
                >
                  <div className={styles.messageCard}>
                    <div
                      className={`${styles.messageBadgeRow} ${roleMeta.badgeRowClassName}`}
                    >
                      <span className={roleMeta.badgeClassName}>
                        {roleMeta.label}
                      </span>
                    </div>
                    <div className={styles.messageMain}>
                      <div
                        className={`${styles.messageBubble} ${roleMeta.bubbleClassName}`}
                      >
                        {message.text}
                      </div>
                    </div>
                    <div className={styles.messageMeta}>
                      {formatTimeLabel(message.createdAt)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className={styles.chatInput}>
            <div className={styles.chatInputHeader}>
              <span className={styles.chatInputTitle}>发送回复</span>
            </div>
            <Input.TextArea
              autoSize={{ minRows: 4, maxRows: 6 }}
              className={styles.chatTextarea}
              placeholder="输入回复内容，支持人工发送。"
              value={draft}
              onChange={(event) => {
                onDraftChange(event.target.value);
              }}
            />
            <div className={styles.chatInputFooter}>
              <div className={styles.chatInputHint}>
                {autoReplyEditable
                  ? '可直接人工发送消息。'
                  : '未分组账号暂不支持自动回复。'}
              </div>
              <Button
                type="primary"
                size="large"
                loading={sending}
                disabled={!autoReplyEditable}
                onClick={onSend}
              >
                发送回复
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatPanel;
