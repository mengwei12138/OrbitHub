import { Button, message } from 'antd';
import { CustomModal } from '@/components';
import { useEnableTenant } from '@/services/admin-tenant';

interface EnableConfirmModalProps {
  open: boolean;
  tenantId: string;
  companyName: string;
  onClose: () => void;
  onConfirm: () => void;
}

const EnableConfirmModal: React.FC<EnableConfirmModalProps> = ({
  open,
  tenantId,
  companyName,
  onClose,
  onConfirm,
}) => {
  const enableTenant = useEnableTenant();

  const handleConfirm = async () => {
    try {
      await enableTenant.mutateAsync(tenantId);
      message.success(`公司【${companyName}】已启用`);
      onConfirm();
    } catch (e) {
      message.error((e as Error).message || '启用失败');
    }
  };
  return (
    <CustomModal
      open={open}
      title="确认启用"
      width={440}
      submitter={{
        render: () => [
          <Button
            key="cancel"
            onClick={onClose}
            disabled={enableTenant.isPending}
          >
            取消
          </Button>,
          <Button
            key="confirm"
            type="primary"
            loading={enableTenant.isPending}
            onClick={handleConfirm}
          >
            确认启用
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
          确定要启用公司【{companyName}】吗？
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
            该公司租户管理员状态恢复为之前的正常/禁用状态
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
            已软删除的社交账号不会恢复，需重新创建
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
            重新占用公司总社交账号数上限，可直接创建新账号
          </li>
        </ul>
      </div>
    </CustomModal>
  );
};

export default EnableConfirmModal;
