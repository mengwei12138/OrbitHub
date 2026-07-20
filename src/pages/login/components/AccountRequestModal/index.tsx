import { Button, Form, Input, Modal, message } from 'antd';
import { useCreateAccountRequest } from '@/services/account-request';

type AccountRequestFormValues = {
  phone: string;
  realName: string;
  company?: string;
};

type AccountRequestModalProps = {
  open: boolean;
  onClose: () => void;
};

const AccountRequestModal = ({
  open,
  onClose,
}: AccountRequestModalProps) => {
  const [form] = Form.useForm<AccountRequestFormValues>();
  const { mutate: createAccountRequest, isPending } = useCreateAccountRequest({
    onSuccess: (_, variables) => {
      message.success(
        `申请已提交，超管审核通过后会为 ${variables.realName} 开通账号。`,
      );
      form.resetFields();
      onClose();
    },
    onError: (error) => {
      message.error(error.message || '申请提交失败');
    },
  });

  const handleCancel = () => {
    if (isPending) return;
    form.resetFields();
    onClose();
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      createAccountRequest({
        phone: values.phone.trim(),
        realName: values.realName.trim(),
        company: values.company?.trim() || undefined,
      });
    } catch {
      // 表单校验失败时由 antd 接管提示
    }
  };

  return (
    <Modal
      open={open}
      onCancel={handleCancel}
      title="申请开通账号"
      centered
      width={480}
      destroyOnHidden
      footer={[
        <Button key="cancel" onClick={handleCancel} disabled={isPending}>
          取消
        </Button>,
        <Button
          key="submit"
          type="primary"
          loading={isPending}
          onClick={handleSubmit}
        >
          提交申请
        </Button>,
      ]}
    >
      <p>
        当前平台采用邀请制开通。请填写个人信息，提交后由超级管理员审核并为您开通账号。
      </p>
      <Form<AccountRequestFormValues>
        form={form}
        layout="vertical"
        requiredMark={false}
      >
        <Form.Item
          label="手机号"
          name="phone"
          rules={[
            { required: true, message: '请输入手机号' },
            { pattern: /^1\d{10}$/, message: '请输入正确的手机号' },
          ]}
        >
          <Input placeholder="请输入手机号" maxLength={11} disabled={isPending} />
        </Form.Item>
        <Form.Item
          label="姓名"
          name="realName"
          rules={[{ required: true, message: '请输入姓名' }]}
        >
          <Input placeholder="请输入姓名" maxLength={30} disabled={isPending} />
        </Form.Item>
        <Form.Item label="企业（可选）" name="company">
          <Input
            placeholder="请输入企业名称"
            maxLength={60}
            disabled={isPending}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AccountRequestModal;
