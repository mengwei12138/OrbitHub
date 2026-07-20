import styles from './style.module.css';

type ActionsSectionProps = {
  isSensitive: boolean;
  applyLoading?: boolean;
  onApply: () => void;
};

const ActionsSection = ({
  isSensitive,
  applyLoading = false,
  onApply,
}: ActionsSectionProps) => {
  return (
    <div className={styles.actionsSection}>
      <button
        type="button"
        className={styles.applyBtn}
        onClick={onApply}
        disabled={isSensitive || applyLoading}
      >
        {applyLoading ? '应用中…' : '应用'}
      </button>
    </div>
  );
};

export default ActionsSection;
