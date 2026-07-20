import { message as antdMessage, Input } from 'antd';
import type { FC } from 'react';
import { useEffect, useState } from 'react';
import { CustomModal } from '@/components';

import styles from './style.module.css';

export type RuleEditModalProps = {
  open: boolean;
  mode: 'add' | 'edit';
  /** 编辑：契约中的分类名称（与规则 category 一致） */
  categoryName?: string;
  initialKeywords: string;
  initialTemplate: string;
  submitLoading?: boolean;
  onClose: () => void;
  onSubmit: (values: {
    categoryName: string;
    keywordsText: string;
    template: string;
  }) => Promise<void>;
};

const RuleEditModal: FC<RuleEditModalProps> = ({
  open,
  mode,
  categoryName,
  initialKeywords,
  initialTemplate,
  submitLoading,
  onClose,
  onSubmit,
}) => {
  const [categoryInput, setCategoryInput] = useState('');
  const [keywordsText, setKeywordsText] = useState('');
  const [template, setTemplate] = useState('');

  useEffect(() => {
    if (!open) {
      return;
    }
    setKeywordsText(initialKeywords);
    setTemplate(initialTemplate);
    if (mode === 'edit' && categoryName) {
      setCategoryInput(categoryName);
    } else {
      setCategoryInput('');
    }
  }, [open, mode, categoryName, initialKeywords, initialTemplate]);

  const resolveCategoryName = () => {
    if (mode === 'edit') {
      return categoryName;
    }
    return categoryInput.trim();
  };

  const handleFinish = async () => {
    try {
      const cat = resolveCategoryName();
      if (!cat) {
        antdMessage.warning('请填写分类名称');
        return false;
      }
      if (!template.trim()) {
        antdMessage.warning('请填写回复模板');
        return false;
      }
      await onSubmit({
        categoryName: cat,
        keywordsText,
        template: template.trim(),
      });
      return true;
    } catch {
      return false;
    }
  };

  const handleOpenChange = (visible: boolean) => {
    if (!visible) {
      onClose();
    }
  };

  const title = mode === 'add' ? '添加分类与规则' : '编辑回复规则';

  return (
    <CustomModal
      title={title}
      open={open}
      onOpenChange={handleOpenChange}
      onFinish={handleFinish}
      modalProps={{ maskClosable: false }}
      submitter={{
        submitButtonProps: { loading: submitLoading },
      }}
      width={560}
    >
      {mode === 'add' ? (
        <div className={styles.field}>
          <div className={styles.label}>分类</div>
          <Input
            className={styles.control}
            placeholder="输入分类名称"
            value={categoryInput}
            maxLength={40}
            onChange={(e) => setCategoryInput(e.target.value)}
          />
        </div>
      ) : (
        <div className={styles.field}>
          <div className={styles.label}>分类</div>
          <Input
            className={styles.control}
            readOnly
            value={categoryName ?? ''}
          />
        </div>
      )}

      <div className={styles.field}>
        <div className={styles.label}>关键词（逗号分隔）</div>
        <Input.TextArea
          className={styles.textarea}
          placeholder="多个关键词用逗号分隔"
          rows={3}
          value={keywordsText}
          onChange={(e) => setKeywordsText(e.target.value)}
        />
      </div>

      <div className={styles.field}>
        <div className={styles.label}>回复模板</div>
        <Input.TextArea
          className={styles.textarea}
          placeholder="该分类自动回复模板"
          rows={4}
          value={template}
          onChange={(e) => setTemplate(e.target.value)}
        />
      </div>
    </CustomModal>
  );
};

export default RuleEditModal;
