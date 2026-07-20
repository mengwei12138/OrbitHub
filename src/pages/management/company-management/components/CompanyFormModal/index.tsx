import { ProFormSelect, ProFormText } from '@ant-design/pro-components';
import { useQuery } from '@tanstack/react-query';
import { Form, message } from 'antd';
import { useEffect, useMemo, useState } from 'react';
import { CustomModal } from '@/components';
import { packageListQueryOptions } from '@/services/admin-package';
import { useCreateTenant } from '@/services/admin-tenant';
import { useCreateUser } from '@/services/admin-user';
import { generateRandomPassword } from '@/utils';

interface CompanyFormModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (info: {
    companyName: string;
    adminAccount: string;
    initialPassword: string;
  }) => void;
}

type FormValues = {
  companyName: string;
  contactName: string;
  adminPhone: string;
  packageId: string;
};

/** PRD §3.2 新增公司弹窗。手机号格式：中国大陆 11 位，1 开头 */
const PHONE_REGEX = /^1\d{10}$/u;
/** 公司编码自动生成（PRD 不要求运营输入；后端 code 用于外部 companyKey 终身绑定） */
const generateCompanyCode = () => `co-${Date.now().toString(36)}`;

const CompanyFormModal: React.FC<CompanyFormModalProps> = ({
  open,
  onClose,
  onSuccess,
}) => {
  const [form] = Form.useForm();
  const { data: packages = [], isLoading: pkgLoading } = useQuery(
    packageListQueryOptions(),
  );

  const createTenant = useCreateTenant();
  const createUser = useCreateUser();

  // 套餐下拉选项
  const packageOptions = useMemo(
    () =>
      packages.map((p) => ({
        label: p.name,
        value: String(p.id),
      })),
    [packages],
  );

  // 「初始积分」根据所选套餐自动回填，且只读（PRD §3.2 + figma 设计图）
  const [selectedPkgId, setSelectedPkgId] = useState<string | undefined>();
  const initialPoints = useMemo(() => {
    if (!selectedPkgId) return undefined;
    const pkg = packages.find((p) => String(p.id) === selectedPkgId);
    return pkg?.points;
  }, [selectedPkgId, packages]);

  // 打开时清空表单
  useEffect(() => {
    if (open) {
      form.resetFields();
      setSelectedPkgId(undefined);
    }
  }, [open, form]);

  const handleSubmit = async () => {
    try {
      const values = (await form.validateFields()) as FormValues;

      // 1. 创建公司
      const tenant = await createTenant.mutateAsync({
        name: values.companyName.trim(),
        code: generateCompanyCode(),
        packageId: values.packageId,
        contactName: values.contactName.trim(),
        contactPhone: values.adminPhone.trim(),
      });

      // 2. 自动生成 8 位初始密码（PRD §3.2）
      const initialPassword = generateRandomPassword(8);

      // 3. 串调创建 TENANT_ADMIN 用户
      //    username 用姓名，phoneNumber 即登录账号
      try {
        await createUser.mutateAsync({
          username: values.contactName.trim(),
          phoneNumber: values.adminPhone.trim(),
          password: initialPassword,
          roles: ['TENANT_ADMIN'],
          tenantId: tenant.id,
          personalQuota: 0,
        });
      } catch (e) {
        // 公司已建但管理员创建失败——保持公司可见，提示运维处理
        message.warning(
          `公司已创建但租户管理员创建失败：${(e as Error).message}。请联系技术支持。`,
        );
        return;
      }

      onSuccess({
        companyName: tenant.name,
        adminAccount: values.adminPhone.trim(),
        initialPassword,
      });
    } catch (e) {
      // antd Form.validateFields 抛 ValidateError 不需要提示；其他抛错才提示
      if ((e as Error).message) {
        message.error((e as Error).message);
      }
    }
  };

  const loading = createTenant.isPending || createUser.isPending;

  return (
    <CustomModal
      open={open}
      title="新增公司"
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
            disabled={loading || pkgLoading}
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
            {loading ? '创建中…' : '确认创建'}
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
        placeholder="请输入公司名称（1~50 字符）"
      />

      <div style={{ marginTop: 10 }}>
        <ProFormText
          name="adminPhone"
          label="手机号"
          rules={[
            { required: true, message: '请输入管理员手机号' },
            {
              pattern: PHONE_REGEX,
              message: '请输入有效的中国大陆 11 位手机号',
            },
          ]}
          placeholder="13xxxxxxxxx"
          addonAfter={
            <span style={{ fontSize: 13, color: '#8c8c8c' }}>
              租户管理员登录账号
            </span>
          }
        />
      </div>

      <div style={{ marginTop: 10 }}>
        <ProFormText
          name="contactName"
          label="姓名"
          rules={[
            { required: true, message: '请输入租户管理员姓名' },
            { min: 2, max: 20, message: '2~20 个字符' },
          ]}
          placeholder="租户管理员姓名（2~20 字符）"
        />
      </div>

      <div style={{ marginTop: 10 }}>
        <ProFormSelect
          name="packageId"
          label="选择套餐"
          rules={[{ required: true, message: '请选择套餐' }]}
          options={packageOptions}
          placeholder={pkgLoading ? '加载中…' : '请选择套餐'}
          fieldProps={{
            loading: pkgLoading,
            onChange: (v) => setSelectedPkgId(v as string),
          }}
        />
      </div>

      {/* 初始积分（PRD §3.2 + figma）：根据套餐自动回填，禁用 */}
      <div style={{ marginTop: 10 }}>
        <Form.Item label="初始积分">
          <input
            data-testid="initial-points"
            readOnly
            disabled
            value={initialPoints != null ? initialPoints.toLocaleString() : ''}
            placeholder="套餐自带积分"
            style={{
              width: '100%',
              height: 32,
              padding: '0 11px',
              fontSize: 14,
              color: '#8c8c8c',
              border: '1px solid #d9d9d9',
              borderRadius: 6,
              background: '#f5f5f5',
              boxSizing: 'border-box',
            }}
          />
        </Form.Item>
      </div>

      <div
        style={{
          fontSize: 13,
          color: '#8c8c8c',
          marginTop: 10,
          lineHeight: 1.6,
        }}
      >
        创建后系统将自动生成 8 位初始密码，请妥善告知租户管理员。
        <br />
        该手机号即为该公司唯一的租户管理员登录账号。
      </div>
    </CustomModal>
  );
};

export default CompanyFormModal;
