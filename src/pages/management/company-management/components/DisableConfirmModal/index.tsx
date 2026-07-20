import { Button, message } from 'antd';
import { CustomModal } from '@/components';
import { useDisableTenant } from '@/services/admin-tenant';

interface DisableConfirmModalProps {
  open: boolean;
  tenantId: string;
  companyName: string;
  onClose: () => void;
  onConfirm: () => void;
}

const DisableConfirmModal: React.FC<DisableConfirmModalProps> = ({
  open,
  tenantId,
  companyName,
  onClose,
  onConfirm,
}) => {
  const disableTenant = useDisableTenant();

  const handleConfirm = async () => {
    try {
      await disableTenant.mutateAsync(tenantId);
      message.success(`公司【${companyName}】已禁用`);
      onConfirm();
    } catch (e) {
      message.error((e as Error).message || '禁用失败');
    }
  };
  return (
    <CustomModal
      open={open}
      title="确认禁用"
      width={440}
      submitter={{
        render: () => [
          <Button
            key="cancel"
            onClick={onClose}
            disabled={disableTenant.isPending}
          >
            取消
          </Button>,
          <Button
            key="confirm"
            type="primary"
            danger
            loading={disableTenant.isPending}
            onClick={handleConfirm}
          >
            确认禁用
          </Button>,
        ],
      }}
      onOpenChange={(visible) => {
        if (!visible) onClose();
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <p
          style={{ fontSize: 14, fontWeight: 500, color: '#1f1f1f', margin: 0 }}
        >
          确定要禁用公司【{companyName}】吗？
        </p>

        <ul
          style={{
            margin: 0,
            paddingLeft: 0,
            listStyle: 'none',
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
          }}
        >
          <li
            style={{
              fontSize: 13,
              color: '#595959',
              display: 'flex',
              alignItems: 'flex-start',
              gap: 8,
            }}
          >
            <span style={{ color: '#8c8c8c' }}>•</span>
            该公司租户管理员及所有普通管理员无法登录
          </li>
          <li
            style={{
              fontSize: 13,
              color: '#595959',
              display: 'flex',
              alignItems: 'flex-start',
              gap: 8,
            }}
          >
            <span style={{ color: '#8c8c8c' }}>•</span>
            该公司所有社交账号软删除，释放公司总社交账号数上限
          </li>
          <li
            style={{
              fontSize: 13,
              color: '#595959',
              display: 'flex',
              alignItems: 'flex-start',
              gap: 8,
            }}
          >
            <span style={{ color: '#8c8c8c' }}>•</span>
            该公司租户管理员状态自动变为「禁用」
          </li>
          <li
            style={{
              fontSize: 13,
              color: '#595959',
              display: 'flex',
              alignItems: 'flex-start',
              gap: 8,
            }}
          >
            <span style={{ color: '#8c8c8c' }}>•</span>
            历史数据保留，可随时启用
          </li>
        </ul>
      </div>
    </CustomModal>
  );
};

export default DisableConfirmModal;
