import { Button, message } from 'antd';

import { CustomModal } from '@/components';
import { useDisableUser } from '@/services/admin-user';

import styles from './style.module.css';

interface DisableConfirmModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  userId: string;
  adminName: string;
}

/** PRD §4.1 禁用普通管理员确认弹窗。 */
const DisableConfirmModal: React.FC<DisableConfirmModalProps> = ({
  open,
  onClose,
  onSuccess,
  userId,
  adminName,
}) => {
  const disableUser = useDisableUser();

  const handleConfirm = async () => {
    try {
      await disableUser.mutateAsync(userId);
      message.success(`普通管理员【${adminName}】已禁用`);
      onSuccess();
    } catch (e) {
      message.error((e as Error).message || '禁用失败');
    }
  };

  return (
    <CustomModal
      open={open}
      title="确认禁用"
      onOpenChange={(visible) => !visible && onClose()}
      width={480}
      footer={null}
    >
      <div className={styles.content}>
        <p className={styles.mainText}>
          确定要禁用普通管理员【{adminName}】吗？
        </p>

        <div className={styles.section}>
          <p className={styles.sectionTitle}>禁用后：</p>
          <ul className={styles.bulletList}>
            <li>该员工无法登录系统</li>
            <li>其名下所有社交账号将被软删除（释放公司已用社交账号数）</li>
            <li>该员工的社交账号创建上限被释放，可分配给其他员工</li>
            <li>历史数据保留，可随时启用</li>
          </ul>
        </div>

        <div className={styles.footer}>
          <Button onClick={onClose} disabled={disableUser.isPending}>
            取消
          </Button>
          <Button
            type="primary"
            danger
            loading={disableUser.isPending}
            onClick={handleConfirm}
          >
            确认禁用
          </Button>
        </div>
      </div>
    </CustomModal>
  );
};

export default DisableConfirmModal;
