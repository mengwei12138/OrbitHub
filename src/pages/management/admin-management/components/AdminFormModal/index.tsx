import { ProFormDigit, ProFormText } from '@ant-design/pro-components';
import { Form, message } from 'antd';
import type React from 'react';
import { useEffect } from 'react';
import { CustomModal } from '@/components';
import {
  type UserResponse,
  useCreateUser,
  useUpdateUser,
} from '@/services/admin-user';
import type { QuotaSummary } from '@/services/admin-user-quota';
import { generateRandomPassword } from '@/utils';

interface AdminFormModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  mode: 'create' | 'edit';
  /** 编辑模式必须传 */
  editingUser: UserResponse | null;
  /** 当前登录租户管理员的 tenantId，用于创建普通管理员时回填 */
  tenantId: string;
  /** 公司配额汇总，用于上限输入框旁的提示 + 前端做一道软校验 */
  quotaSummary: QuotaSummary | null;
  /** 当前登录用户 id，用于编辑自身时禁手机号字段 */
  currentUserId: string | null;
}

type FormValues = {
  username: string;
  phoneNumber: string;
  personalQuota: number;
};

const PHONE_REGEX = /^1\d{10}$/u;

/**
 * PRD §4.1 新建 / 编辑普通管理员弹窗（租户管理员视角）。
 *
 * 提交流程：
 * - 新建：generateRandomPassword → POST /admin/users (role=NORMAL_ADMIN, personalQuota)
 * - 编辑：PUT /admin/users/{id}（姓名/手机号/personalQuota 同体）
 *
 * 操作日志合并：姓名/手机号/上限三项变化都合入同一条 admin.user.update（或 admin.user.create）日志，
 * 不再独立产生 admin.user-quota.assign 记录。
 *
 * 自身编辑约束：
 * - 手机号置灰（PRD：登录账号不可变）
 * - 状态字段在 PRD 是下拉选；但本系统状态由 disable/enable 独立接口操作，
 *   故弹窗不显示状态字段（与公司管理 EditCompanyModal 同惯例）。
 */
const AdminFormModal: React.FC<AdminFormModalProps> = ({
  open,
  onClose,
  onSuccess,
  mode,
  editingUser,
  tenantId,
  quotaSummary,
  currentUserId,
}) => {
  const [form] = Form.useForm();
  const createUser = useCreateUser();
  const updateUser = useUpdateUser();

  const isEdit = mode === 'edit' && editingUser != null;
  const isSelf =
    isEdit && currentUserId != null && editingUser?.id === currentUserId;

  useEffect(() => {
    if (open) {
      if (isEdit && editingUser) {
        form.setFieldsValue({
          username: editingUser.username,
          phoneNumber: editingUser.phoneNumber,
          personalQuota: editingUser.personalQuota ?? 0,
        });
      } else {
        form.resetFields();
        form.setFieldsValue({ personalQuota: 0 });
      }
    }
  }, [open, isEdit, editingUser, form]);

  const handleSubmit = async () => {
    if (seatFull) {
      message.error(
        `管理员席位已达套餐上限（${quotaSummary?.normalAdminCount}/${quotaSummary?.normalAdminLimit}，含租户管理员），无法新建`,
      );
      return;
    }
    try {
      const values = (await form.validateFields()) as FormValues;

      if (isEdit && editingUser) {
        // 编辑：姓名/手机号/上限同请求提交，后端在同一条 admin.user.update 日志中合并展示
        await updateUser.mutateAsync({
          id: editingUser.id,
          body: {
            username: values.username.trim(),
            phoneNumber: values.phoneNumber.trim(),
            personalQuota: values.personalQuota,
          },
        });
        message.success('保存成功');
      } else {
        // 新建：POST /admin/users 已携带 personalQuota，后端 admin.user.create 单条日志即覆盖
        const password = generateRandomPassword(8);
        // 后端要求显式提供 tenantAdminUserId（当前登录的 TENANT_ADMIN 自己），
        // 不依赖"按 caller 角色推断"——支持 PLATFORM_ADMIN 兜底（dev / 测试场景）。
        await createUser.mutateAsync({
          username: values.username.trim(),
          phoneNumber: values.phoneNumber.trim(),
          password,
          roles: ['NORMAL_ADMIN'],
          tenantId,
          tenantAdminUserId: currentUserId ?? undefined,
          personalQuota: values.personalQuota,
        });
        message.success(
          `普通管理员【${values.username.trim()}】创建成功，初始密码：${password}`,
          8,
        );
      }
      onSuccess();
    } catch (e) {
      if ((e as Error).message) {
        message.error((e as Error).message);
      }
    }
  };

  const loading = createUser.isPending || updateUser.isPending;

  const title =
    mode === 'create'
      ? '新建普通管理员'
      : `编辑普通管理员${editingUser ? ` - ${editingUser.username}` : ''}`;

  const quotaHint = quotaSummary
    ? `当前所有上限之和 ${quotaSummary.totalAssigned} / ${quotaSummary.packageLimit}`
    : '加载配额中…';

  // PRD §1.3 / §4.1：套餐 normalAdminLimit 为"管理员总席位（含 TA）"，
  // normalAdminCount 同口径含 TA。仅新建时拦截；编辑不增加席位。
  // 后端 60903（NORMAL_ADMIN_LIMIT_EXCEEDED）做兜底拦截。
  const seatFull =
    mode === 'create' &&
    quotaSummary != null &&
    quotaSummary.normalAdminCount >= quotaSummary.normalAdminLimit;

  return (
    <CustomModal
      open={open}
      title={title}
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
            disabled={loading || seatFull}
            title={
              seatFull
                ? `管理员席位已达套餐上限（${quotaSummary?.normalAdminCount}/${quotaSummary?.normalAdminLimit}，含租户管理员）`
                : undefined
            }
            style={{
              width: 100,
              height: 32,
              border: 'none',
              borderRadius: 4,
              background: '#1677ff',
              color: '#fff',
              fontSize: 14,
              cursor: loading || seatFull ? 'not-allowed' : 'pointer',
              opacity: loading || seatFull ? 0.6 : 1,
              marginLeft: 8,
            }}
          >
            {loading
              ? mode === 'create'
                ? '创建中…'
                : '保存中…'
              : mode === 'create'
                ? '确认创建'
                : '保存修改'}
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
        placeholder="2~20 个字符"
      />

      <div style={{ marginTop: 10 }}>
        <ProFormText
          name="phoneNumber"
          label="手机号"
          rules={[
            { required: true, message: '请输入手机号' },
            { pattern: PHONE_REGEX, message: '请输入有效手机号' },
          ]}
          placeholder="13xxxxxxxxx"
          disabled={isSelf}
          extra={isSelf ? '不可修改自己的登录账号' : undefined}
        />
      </div>

      <div style={{ marginTop: 10 }}>
        <ProFormDigit
          name="personalQuota"
          label="社交账号创建上限"
          min={0}
          fieldProps={{ precision: 0 }}
          rules={[
            { required: true, message: '请输入上限' },
            { type: 'number', min: 0, message: '必须 ≥ 0' },
          ]}
          extra={quotaHint}
        />
      </div>

      {mode === 'create' && seatFull && (
        <div
          style={{
            fontSize: 13,
            color: '#cf1322',
            marginTop: 10,
            padding: '8px 12px',
            background: '#fff1f0',
            border: '1px solid #ffa39e',
            borderRadius: 4,
            lineHeight: 1.6,
          }}
        >
          管理员席位已达套餐上限（{quotaSummary?.normalAdminCount}/
          {quotaSummary?.normalAdminLimit}，含租户管理员；普通管理员可创建数 ={' '}
          {Math.max(0, (quotaSummary?.normalAdminLimit ?? 0) - 1)}
          ）。请联系超级管理员升级套餐，或先删除已有普通管理员。
        </div>
      )}

      {mode === 'create' && !seatFull && (
        <div
          style={{
            fontSize: 13,
            color: '#8c8c8c',
            marginTop: 10,
            lineHeight: 1.6,
          }}
        >
          创建后系统将自动生成 8 位初始密码并显示在弹窗上方，请妥善告知。
        </div>
      )}
    </CustomModal>
  );
};

export default AdminFormModal;
