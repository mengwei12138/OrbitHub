import { Input } from 'antd';
import type { FC } from 'react';
import { useEffect, useState } from 'react';

import { CustomModal } from '@/components';

import styles from './style.module.css';

type Classification = {
  type: string;
  label: string;
  emoji: string;
};

type Message = {
  id: string;
  userName: string;
  accountName: string;
  platform: string;
  content: string;
};

type Props = {
  open: boolean;
  message?: Message;
  classification?: Classification;
  suggestedReply?: string;
  platformNotSupported?: boolean;
  submitLoading?: boolean;
  onClose: () => void;
  onSubmit: (messageId: string, content: string) => void;
};

const ManualReplyModal: FC<Props> = ({
  open,
  message,
  classification,
  suggestedReply = '',
  platformNotSupported = false,
  submitLoading,
  onClose,
  onSubmit,
}) => {
  const [draft, setDraft] = useState(suggestedReply);

  useEffect(() => {
    if (open) {
      setDraft(suggestedReply ?? '');
    }
  }, [open, suggestedReply]);

  const handleSubmit = () => {
    if (message && !platformNotSupported) {
      onSubmit(message.id, draft.trim());
    }
  };

  return (
    <CustomModal
      width={560}
      title="手动回复私信"
      open={open}
      onOpenChange={(visible) => !visible && onClose()}
      footer={null}
    >
      <div className={styles.body}>
        <div className={styles.senderInfo}>
          <div className={styles.avatar} />
          <div className={styles.senderDetail}>
            <span className={styles.userName}>{message?.userName}</span>
            <div className={styles.accountInfo}>
              <span>{message?.accountName}</span>
              <span> · </span>
              <span>{message?.platform}</span>
            </div>
          </div>
        </div>

        <div className={styles.label}>原私信</div>
        <div className={styles.messageBubble}>{message?.content}</div>

        {classification && (
          <div className={styles.aiClassification}>
            <span className={styles.aiLabel}>AI 分类：</span>
            <span className={styles.aiTag}>
              {classification.emoji} {classification.label}
            </span>
          </div>
        )}

        <div className={styles.replySection}>
          <div className={styles.label}>
            回复内容
            <span className={styles.aiHint}>
              <svg className={styles.aiIcon} viewBox="0 0 14 14" fill="none">
                <title>AI</title>
                <circle cx="7" cy="7" r="6.5" stroke="#13C2C2" />
                <path
                  d="M7 4.5V7.5M7 9.5H7.005"
                  stroke="#13C2C2"
                  strokeLinecap="round"
                />
              </svg>
              可编辑 AI 建议后发送
            </span>
          </div>
          <div className={styles.textareaWrapper}>
            <Input.TextArea
              className={styles.textarea}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              rows={4}
              maxLength={500}
              showCount
              placeholder="输入回复内容"
            />
          </div>
        </div>

        <div className={styles.footer}>
          <button type="button" className={styles.btnGhost} onClick={onClose}>
            取消
          </button>
          <button
            type="button"
            className={styles.btnPrimary}
            onClick={handleSubmit}
            disabled={platformNotSupported || submitLoading}
          >
            {submitLoading ? '发送中…' : '确认发送'}
          </button>
        </div>
      </div>
    </CustomModal>
  );
};

export default ManualReplyModal;
