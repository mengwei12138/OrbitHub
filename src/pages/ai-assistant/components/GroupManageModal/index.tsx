import { Checkbox, Form, Input, Modal } from 'antd';
import { useEffect } from 'react';

import type { AiAssistantGroupAccountOption } from '@/services/ai-assistant';

import styles from '../../style.module.css';

type GroupManageModalProps = {
  open: boolean;
  mode: 'create' | 'edit';
  confirmLoading: boolean;
  accounts: AiAssistantGroupAccountOption[];
  currentGroupId?: string;
  initialValues?: {
    name: string;
    accountIds: string[];
  };
  onCancel: () => void;
  onSubmit: (values: { name: string; accountIds: string[] }) => void;
};

const GroupManageModal = ({
  open,
  mode,
  confirmLoading,
  accounts,
  currentGroupId,
  initialValues,
  onCancel,
  onSubmit,
}: GroupManageModalProps) => {
  const [form] = Form.useForm<{ name: string; accountIds: string[] }>();

  useEffect(() => {
    if (!open) return;
    form.setFieldsValue({
      name: initialValues?.name ?? '',
      accountIds: initialValues?.accountIds ?? [],
    });
  }, [form, initialValues, open]);

  return (
    <Modal
      destroyOnHidden
      centered
      maskClosable={false}
      open={open}
      title={mode === 'create' ? '创建账号分组' : '编辑账号分组'}
      okText={mode === 'create' ? '创建分组' : '保存'}
      cancelText="取消"
      confirmLoading={confirmLoading}
      onCancel={onCancel}
      onOk={() => {
        void form.validateFields().then((values) => {
          onSubmit(values);
        });
      }}
    >
      <div className={styles.modalTip}>
        每个社交账号只能归属一个分组，已被其他分组占用的账号不可重复选择。
      </div>
      <Form form={form} layout="vertical">
        <Form.Item
          label="分组名称"
          name="name"
          rules={[
            { required: true, message: '请输入分组名称' },
            { max: 20, message: '分组名称最多 20 个字符' },
          ]}
        >
          <Input placeholder="例如：抖音门店客服组" />
        </Form.Item>
        <Form.Item
          label="归组账号"
          name="accountIds"
          rules={[{ required: true, message: '请至少选择一个账号' }]}
        >
          <Checkbox.Group style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {accounts.map((account) => {
              const disabled =
                Boolean(account.assignedGroupId) &&
                account.assignedGroupId !== currentGroupId;
              return (
                <Checkbox
                  key={account.accountId}
                  value={account.accountId}
                  disabled={disabled}
                >
                  {account.nickname} · {account.platform === 'douyin' ? '抖音' : '小红书'}
                  {disabled && account.assignedGroupName
                    ? `（已分配到 ${account.assignedGroupName}）`
                    : ''}
                </Checkbox>
              );
            })}
          </Checkbox.Group>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default GroupManageModal;
