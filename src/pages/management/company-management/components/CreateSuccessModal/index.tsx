import { Button, message } from 'antd';
import { CustomModal } from '@/components';
import { copyToClipboard } from '@/utils';

interface CreateSuccessModalProps {
  open: boolean;
  companyName: string;
  adminAccount: string;
  initialPassword: string;
  onClose: () => void;
}

const CreateSuccessModal: React.FC<CreateSuccessModalProps> = ({
  open,
  companyName,
  adminAccount,
  initialPassword,
  onClose,
}) => {
  const handleCopy = async (text: string) => {
    if (await copyToClipboard(text)) {
      message.success('已复制');
    } else {
      message.error('复制失败，请手动选择密码复制');
    }
  };

  return (
    <CustomModal
      open={open}
      title="创建成功"
      width={440}
      submitter={{
        render: () => [
          <Button key="ok" type="primary" onClick={onClose}>
            我知道了
          </Button>,
        ],
      }}
      onOpenChange={(visible) => {
        if (!visible) onClose();
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <p style={{ fontSize: 14, color: '#1f1f1f', margin: 0 }}>
          公司【{companyName}】已创建成功
        </p>

        <div
          style={{
            background: '#f7faff',
            border: '1px solid #d9e8ff',
            borderRadius: 6,
            padding: '14px 16px',
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
            <span style={{ fontSize: 13, color: '#8c8c8c' }}>
              租户管理员账号
            </span>
            <span style={{ fontSize: 14, fontWeight: 500, color: '#1f1f1f' }}>
              {adminAccount}
            </span>
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'baseline',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
              <span style={{ fontSize: 13, color: '#8c8c8c' }}>初始密码</span>
              <span style={{ fontSize: 15, fontWeight: 500, color: '#1f1f1f' }}>
                {initialPassword}
              </span>
            </div>
            <span
              onClick={() => handleCopy(initialPassword)}
              style={{ fontSize: 13, color: '#1677ff', cursor: 'pointer' }}
            >
              复制
            </span>
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            fontSize: 13,
            color: '#d98c0d',
          }}
        >
          <span>⚠</span>
          <span>请将初始密码安全告知租户管理员，密码仅展示一次</span>
        </div>
      </div>
    </CustomModal>
  );
};

export default CreateSuccessModal;
