import { Input, message } from 'antd';
import type { FC } from 'react';
import { useState } from 'react';
import { CustomModal } from '@/components';

import styles from './style.module.css';

const SYSTEM_TYPES = ['正面', '负面', '中性', '提问'];

type Props = {
  open: boolean;
  submitLoading?: boolean;
  onClose: () => void;
  onSubmit: (type: string, template: string, keywords: string[]) => void;
};

const AddRuleModal: FC<Props> = ({
  open,
  submitLoading,
  onClose,
  onSubmit,
}) => {
  const [type, setType] = useState('');
  const [template, setTemplate] = useState('');
  const [keywords, setKeywords] = useState('');

  const handleSubmit = () => {
    if (!template.trim()) return;
    if (!type.trim()) {
      message.error('请输入类型名称');
      return;
    }
    if (SYSTEM_TYPES.includes(type.trim())) {
      message.error('类型名称不能与系统默认分类同名');
      return;
    }
    const keywordList = keywords
      .split(/[,，;；]/u)
      .map((k) => k.trim())
      .filter(Boolean);
    onSubmit(type.trim(), template.trim(), keywordList);
  };

  return (
    <CustomModal
      width={560}
      title="添加回复规则"
      open={open}
      onOpenChange={(visible) => !visible && onClose()}
      onFinish={async () => {
        handleSubmit();
        return true;
      }}
      submitter={{
        submitButtonProps: {
          loading: submitLoading,
          disabled: !template.trim() || !type.trim(),
        },
      }}
    >
      <div className={styles.body}>
        <div className={styles.field}>
          <span className={styles.label}>类型名称</span>
          <Input
            value={type}
            onChange={(e) => setType(e.target.value)}
            placeholder="请输入类型名称"
          />
        </div>

        <div className={styles.field}>
          <span className={styles.label}>关键词</span>
          <Input
            value={keywords}
            onChange={(e) => setKeywords(e.target.value)}
            placeholder="多个关键词用逗号分隔"
          />
        </div>

        <div className={styles.field}>
          <span className={styles.label}>回复模板</span>
          <Input.TextArea
            value={template}
            onChange={(e) => setTemplate(e.target.value)}
            placeholder="请输入回复模板内容"
            maxLength={500}
            showCount
            autoSize={{ minRows: 4, maxRows: 8 }}
          />
        </div>
      </div>
    </CustomModal>
  );
};

export default AddRuleModal;
