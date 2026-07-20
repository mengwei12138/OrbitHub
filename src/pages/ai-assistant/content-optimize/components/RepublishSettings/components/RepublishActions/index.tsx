import styles from './style.module.css';

type RepublishActionsProps = {
  loading?: boolean;
  disabled?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

const RepublishActions = ({
  loading = false,
  disabled = false,
  onCancel,
  onConfirm,
}: RepublishActionsProps) => {
  return (
    <div className={styles.republishActions}>
      <button
        type="button"
        className={styles.cancelBtn}
        onClick={onCancel}
        disabled={loading}
      >
        取消
      </button>
      <button
        type="button"
        className={styles.confirmBtn}
        onClick={onConfirm}
        disabled={disabled || loading}
      >
        {loading ? '提交中…' : '确认重发布'}
      </button>
    </div>
  );
};

export default RepublishActions;
