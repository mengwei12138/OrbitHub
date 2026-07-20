import { CopyOutlined } from '@ant-design/icons';
import { Button, message } from 'antd';
import { useEffect, useState } from 'react';
import { CustomModal } from '@/components';
import { useResetPassword } from '@/services/admin-user';
import { copyToClipboard, generateRandomPassword } from '@/utils';

interface ResetPasswordModalProps {
  open: boolean;
  userId: string;
  adminName: string;
  /**
   * 角色描述文案，用于「将为{roleLabel}【{adminName}】重置密码」一行。
   * 不传时回落到「管理员」，保持对普通管理员、租户管理员等场景的兼容。
   */
  roleLabel?: string;
  onClose: () => void;
  onSuccess: () => void;
}

/**
 * PRD §3.4 重置密码：前端生成 8 位字母+数字明文密码 → 提交后端 → 给运营展示并提供复制按钮。
 * 关闭弹窗后下次打开会重新生成，避免上次的密码遗留显示。
 */
const ResetPasswordModal: React.FC<ResetPasswordModalProps> = ({
  open,
  userId,
  adminName,
  roleLabel = '管理员',
  onClose,
  onSuccess,
}) => {
  const [newPassword, setNewPassword] = useState('');
  const resetPassword = useResetPassword();

  // 每次打开弹窗重生成密码：避免上次的密码遗留 + 让"取消后重开"看起来是新一次操作
  useEffect(() => {
    if (open) {
      setNewPassword(generateRandomPassword(8));
    }
  }, [open]);

  const handleCopy = async () => {
    if (await copyToClipboard(newPassword)) {
      message.success('密码已复制');
    } else {
      message.error('复制失败，请手动选择文字复制');
    }
  };

  const handleConfirm = async () => {
    try {
      await resetPassword.mutateAsync({
        id: userId,
        body: { newPassword },
      });
      message.success(`已为【${adminName}】重置密码`);
      onSuccess();
    } catch (e) {
      message.error((e as Error).message || '重置失败');
    }
  };

  const loading = resetPassword.isPending;

  return (
    <CustomModal
      open={open}
      title="重置密码"
      width={440}
      submitter={{
        render: () => [
          <Button key="cancel" onClick={onClose} disabled={loading}>
            取消
          </Button>,
          <Button
            key="confirm"
            type="primary"
            loading={loading}
            onClick={handleConfirm}
          >
            确认重置
          </Button>,
        ],
      }}
      onOpenChange={(visible) => {
        if (!visible) onClose();
      }}
    >
      <div style={{ marginBottom: 16 }}>
        将为{roleLabel}【{adminName}】重置密码
      </div>

      <div
        style={{
          padding: '14px 16px',
          background: '#f7faff',
          border: '1px solid #d9e8ff',
          borderRadius: 6,
          marginBottom: 16,
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'baseline',
          }}
        >
          <div>
            <span style={{ color: '#8c8c8c', marginRight: 8 }}>新密码</span>
            <span
              style={{
                fontWeight: 500,
                fontSize: 15,
                color: '#1677ff',
                fontFamily: 'Menlo, monospace',
              }}
            >
              {newPassword}
            </span>
          </div>
          <button
            type="button"
            onClick={handleCopy}
            style={{
              border: 'none',
              background: 'transparent',
              color: '#1677ff',
              fontSize: 13,
              cursor: 'pointer',
              padding: 0,
            }}
          >
            <CopyOutlined /> 点击复制
          </button>
        </div>
      </div>

      <div style={{ color: '#d98c0d', fontSize: 13 }}>
        ⚠ 请将新密码安全告知对方
      </div>
    </CustomModal>
  );
};

export default ResetPasswordModal;
