import { ProFormText } from '@ant-design/pro-components';
import { Form, message } from 'antd';
import { useEffect } from 'react';
import { CustomModal } from '@/components';
import type { TenantResponse } from '@/services/admin-tenant';
import { useUpdateTenant } from '@/services/admin-tenant';

interface EditCompanyModalProps {
  open: boolean;
  tenant: TenantResponse;
  onClose: () => void;
  onSuccess: () => void;
}

type FormValues = {
  companyName: string;
  contactName: string;
  adminPhone: string;
};

const PHONE_REGEX = /^1\d{10}$/u;

/**
 * PRD §3.2 编辑公司弹窗：可改公司名 / 姓名 / 手机号。
 * 状态只读（启停走列表页独立按钮）；套餐不可改（PRD V1.1 已移除套餐变更）。
 *
 * 姓名/手机号属于 TENANT_ADMIN 用户字段，PUT /admin/tenants/{id} 在后端同事务内
 * 会把 tenant.contactName/contactPhone 同步写到该公司 TENANT_ADMIN 的
 * sys_user.username / sys_user.phoneNumber（参见 TenantApplicationService.updateTenant）。
 */
const EditCompanyModal: React.FC<EditCompanyModalProps> = ({
  open,
  tenant,
  onClose,
  onSuccess,
}) => {
  const [form] = Form.useForm();
  const updateTenant = useUpdateTenant();

  useEffect(() => {
    if (open) {
      form.setFieldsValue({
        companyName: tenant.name,
        contactName: tenant.contactName ?? '',
        adminPhone: tenant.contactPhone ?? '',
      });
    }
  }, [open, tenant, form]);

  const handleSubmit = async () => {
    try {
      const values = (await form.validateFields()) as FormValues;
      await updateTenant.mutateAsync({
        id: tenant.id,
        body: {
          name: values.companyName.trim(),
          packageId: tenant.packageId, // 不可改但 PUT 需要传
          contactName: values.contactName.trim(),
          contactPhone: values.adminPhone.trim(),
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

  const loading = updateTenant.isPending;
  const statusText = tenant.status === 'ACTIVE' ? '启用' : '禁用';

  return (
    <CustomModal
      open={open}
      title={`编辑公司 - ${tenant.name}`}
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
        name="companyName"
        label="公司名称"
        rules={[
          { required: true, message: '请输入公司名称' },
          { min: 1, max: 50, message: '1~50 个字符' },
        ]}
      />
      <div style={{ marginTop: 10 }}>
        <ProFormText
          name="contactName"
          label="姓名"
          rules={[
            { required: true, message: '请输入姓名' },
            { min: 2, max: 20, message: '2~20 个字符' },
          ]}
        />
      </div>
      <div style={{ marginTop: 10 }}>
        <ProFormText
          name="adminPhone"
          label="手机号"
          rules={[
            { required: true, message: '请输入手机号' },
            { pattern: PHONE_REGEX, message: '请输入有效手机号' },
          ]}
        />
      </div>
      <div style={{ marginTop: 10, fontSize: 14 }}>
        <span style={{ color: '#8c8c8c', marginRight: 8 }}>状态：</span>
        <span style={{ color: '#1f1f1f' }}>{statusText}</span>
        <span style={{ marginLeft: 8, color: '#8c8c8c', fontSize: 13 }}>
          （状态变更请使用列表页的独立按钮）
        </span>
      </div>
    </CustomModal>
  );
};

export default EditCompanyModal;
