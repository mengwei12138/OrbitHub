import { ProFormText } from '@ant-design/pro-components';
import { Form, message } from 'antd';
import { useEffect } from 'react';
import { CustomModal } from '@/components';
import type { UserResponse } from '@/services/admin-user';
import { useUpdateUser } from '@/services/admin-user';

interface EditTenantAdminModalProps {
  open: boolean;
  user: UserResponse;
  /** 所属公司名（路由父组件 join 后传入；后端不返回） */
  tenantName: string;
  onClose: () => void;
  onSuccess: () => void;
}

type FormValues = {
  username: string;
  phoneNumber: string;
};

const PHONE_REGEX = /^1\d{10}$/u;

/**
 * PRD V2.0：平台超管侧隐藏租户管理员禁用入口。
 * 编辑弹窗仅允许修改姓名 / 手机号；所属公司和状态只读。
 */
const EditTenantAdminModal: React.FC<EditTenantAdminModalProps> = ({
  open,
  user,
  tenantName,
  onClose,
  onSuccess,
}) => {
  const [form] = Form.useForm();
  const updateUser = useUpdateUser();

  useEffect(() => {
    if (open) {
      form.setFieldsValue({
        username: user.username,
        phoneNumber: user.phoneNumber,
      });
    }
  }, [open, user, form]);

  const handleSubmit = async () => {
    try {
      const values = (await form.validateFields()) as FormValues;
      await updateUser.mutateAsync({
        id: user.id,
        body: {
          username: values.username.trim(),
          phoneNumber: values.phoneNumber.trim(),
        },
      });
      message.success('保存成功');
      onSuccess();
    } catch (e) {
      if ((e as Error).message) {
        message.error((e as Error).message);
      }
    }
  };

  const loading = updateUser.isPending;

  return (
    <CustomModal
      open={open}
      title={`编辑租户管理员 - ${user.username}`}
      width={520}
      submitter={{
        render: () => [
          <button
            key="cancel"
            type="button"
            onClick={onClose}
            disabled={loading}
            style={{
              width: 80,
              height: 32,
              border: '1px solid #d9d9d9',
              borderRadius: 4,
              background: '#fff',
              color: '#595959',
              fontSize: 14,
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1,
            }}
          >
            取消
          </button>,
          <button
            key="submit"
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            style={{
              width: 100,
              height: 32,
              border: 'none',
              borderRadius: 4,
              background: '#1677ff',
              color: '#fff',
              fontSize: 14,
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1,
              marginLeft: 8,
            }}
          >
            {loading ? '保存中…' : '保存修改'}
          </button>,
        ],
      }}
      onOpenChange={(visible) => {
        if (!visible) onClose();
      }}
      form={form}
    >
      <ProFormText
        name="username"
        label="姓名"
        rules={[
          { required: true, message: '请输入姓名' },
          { min: 2, max: 20, message: '2~20 个字符' },
        ]}
      />
      <div style={{ marginTop: 10 }}>
        <ProFormText
          name="phoneNumber"
          label="手机号"
          rules={[
            { required: true, message: '请输入手机号' },
            { pattern: PHONE_REGEX, message: '请输入有效手机号' },
          ]}
        />
      </div>
      <div style={{ marginTop: 10, fontSize: 14 }}>
        <span style={{ color: '#8c8c8c', marginRight: 8 }}>所属公司：</span>
        <span style={{ color: '#1f1f1f' }}>{tenantName}</span>
        <span style={{ marginLeft: 8, color: '#8c8c8c', fontSize: 13 }}>
          （不可修改）
        </span>
      </div>
      <div style={{ marginTop: 10, fontSize: 14 }}>
        <span style={{ color: '#8c8c8c', marginRight: 8 }}>状态：</span>
        <span style={{ color: '#1f1f1f' }}>
          {user.status === 1 ? '启用' : '禁用'}
        </span>
        <span style={{ marginLeft: 8, color: '#8c8c8c', fontSize: 13 }}>
          （V2.0 已隐藏租户管理员禁用入口）
        </span>
      </div>
    </CustomModal>
  );
};

export default EditTenantAdminModal;
