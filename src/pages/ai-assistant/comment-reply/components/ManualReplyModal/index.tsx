import { Input } from 'antd';
import type { FC } from 'react';
import { useEffect, useState } from 'react';
import { CustomModal } from '@/components';

import AiIcon from '../../images/ai-icon.svg';
import styles from './style.module.css';

type Comment = {
  userName: string;
  content: string;
  time: string;
};

type Props = {
  open: boolean;
  comment?: Comment;
  suggestedReply?: string;
  maxLength?: number;
  submitLoading?: boolean;
  onClose: () => void;
  onSubmit: (content: string) => void;
};

const ManualReplyModal: FC<Props> = ({
  open,
  comment,
  suggestedReply = '',
  maxLength = 200,
  submitLoading,
  onClose,
  onSubmit,
}) => {
  const [value, setValue] = useState(suggestedReply);

  useEffect(() => {
    if (open) {
      setValue(suggestedReply ?? '');
    }
  }, [open, suggestedReply]);

  return (
    <CustomModal
      width={560}
      title="手动回复"
      open={open}
      onOpenChange={(visible) => !visible && onClose()}
      onFinish={async () => {
        onSubmit(value);
        return true;
      }}
      submitter={{
        submitButtonProps: { loading: submitLoading },
      }}
    >
      <div className={styles.body}>
        <div className={styles.commentSection}>
          <span className={styles.label}>原评论</span>
          <div className={styles.commentBox}>
            <div className={styles.commentMeta}>
              <span className={styles.userName}>{comment?.userName}</span>
              <span className={styles.separator}>·</span>
              <span className={styles.time}>{comment?.time}</span>
            </div>
            <div className={styles.commentContent}>{comment?.content}</div>
          </div>
        </div>

        <div className={styles.aiHint}>
          <img src={AiIcon} alt="" className={styles.aiIcon} />
          <span className={styles.aiHintText}>已预填 AI 建议，可直接编辑</span>
        </div>

        <div className={styles.textareaWrapper}>
          <Input.TextArea
            value={value}
            onChange={(e) => setValue(e.target.value)}
            maxLength={maxLength}
            showCount
            autoSize={{ minRows: 3, maxRows: 6 }}
            className={styles.textarea}
          />
        </div>
      </div>
    </CustomModal>
  );
};

export default ManualReplyModal;
