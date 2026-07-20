import { Button, message } from 'antd';

import { CustomModal } from '@/components';
import { useEnableUser } from '@/services/admin-user';

import styles from './style.module.css';

interface EnableConfirmModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  userId: string;
  adminName: string;
}

/** PRD §4.1 启用普通管理员确认弹窗。 */
const EnableConfirmModal: React.FC<EnableConfirmModalProps> = ({
  open,
  onClose,
  onSuccess,
  userId,
  adminName,
}) => {
  const enableUser = useEnableUser();

  const handleConfirm = async () => {
    try {
      await enableUser.mutateAsync(userId);
      message.success(`普通管理员【${adminName}】已启用`);
      onSuccess();
    } catch (e) {
      message.error((e as Error).message || '启用失败');
    }
  };

  return (
    <CustomModal
      open={open}
      title="确认启用"
      onOpenChange={(visible) => !visible && onClose()}
      width={440}
      footer={null}
    >
      <div className={styles.content}>
        <p className={styles.mainText}>
          确定要启用普通管理员【{adminName}】吗？
        </p>

        <div className={styles.section}>
          <p className={styles.sectionTitle}>启用后：</p>
          <ul className={styles.bulletList}>
            <li>该员工可正常登录</li>
            <li>需重新设置其社交账号创建上限（默认 0）</li>
            <li>之前的社交账号已删除，需重新创建</li>
          </ul>
        </div>

        <div className={styles.footer}>
          <Button onClick={onClose} disabled={enableUser.isPending}>
            取消
          </Button>
          <Button
            type="primary"
            loading={enableUser.isPending}
            onClick={handleConfirm}
          >
            确认启用
          </Button>
        </div>
      </div>
    </CustomModal>
  );
};

export default EnableConfirmModal;
