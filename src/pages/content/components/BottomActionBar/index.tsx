import { Button } from 'antd';
import styles from './style.module.css';
import type { BottomActionBarProps } from './types';

const BottomActionBar: React.FC<BottomActionBarProps> = ({
  toolbar,
  disabled,
  loading,
  onConfirm,
}) => {
  return (
    <div className={styles.wrapper}>
      <div className={styles.separator} />
      <div className={styles.actions}>
        {toolbar ? (
          toolbar
        ) : (
          <Button
            type="primary"
            disabled={disabled}
            loading={loading}
            onClick={onConfirm}
          >
            确认发布
          </Button>
        )}
      </div>
    </div>
  );
};

export default BottomActionBar;

export type { BottomActionBarProps };
