import { Input } from 'antd';
import type { FC } from 'react';
import { useEffect, useState } from 'react';
import { CustomModal } from '@/components';

import styles from './style.module.css';

type RuleType = 'positive' | 'negative' | 'neutral' | 'question';

type Props = {
  open: boolean;
  rule?: {
    id: string;
    type: RuleType;
    template: string;
  };
  submitLoading?: boolean;
  onClose: () => void;
  onSubmit: (id: string, template: string) => void;
};

const typeLabels: Record<RuleType, string> = {
  positive: '正面',
  negative: '负面',
  neutral: '中性',
  question: '提问',
};

const EditRuleModal: FC<Props> = ({
  open,
  rule,
  submitLoading,
  onClose,
  onSubmit,
}) => {
  const [type, setType] = useState<RuleType>(rule?.type ?? 'positive');
  const [template, setTemplate] = useState(rule?.template ?? '');

  useEffect(() => {
    if (rule) {
      setType(rule.type);
      setTemplate(rule.template);
    }
  }, [rule]);

  const handleSubmit = () => {
    if (!rule?.id || !template.trim()) return;
    onSubmit(rule.id, template.trim());
  };

  return (
    <CustomModal
      width={560}
      title={`编辑${typeLabels[type]}回复模板`}
      open={open}
      onOpenChange={(visible) => !visible && onClose()}
      onFinish={async () => {
        handleSubmit();
        return true;
      }}
      submitter={{
        submitButtonProps: {
          loading: submitLoading,
          disabled: !template.trim(),
        },
      }}
    >
      <div className={styles.body}>
        <div className={styles.field}>
          <span className={styles.label}>评论类型</span>
          <span className={styles.typeValue}>{typeLabels[type]}</span>
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

export default EditRuleModal;
