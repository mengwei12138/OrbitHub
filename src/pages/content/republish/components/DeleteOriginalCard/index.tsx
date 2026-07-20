import { Checkbox } from 'antd';
import type React from 'react';

import styles from './style.module.css';

type DeleteOriginalCardProps = {
  checked: boolean;
  disabled?: boolean;
  onChange: (checked: boolean) => void;
};

const DeleteOriginalCard: React.FC<DeleteOriginalCardProps> = ({
  checked,
  disabled = false,
  onChange,
}) => {
  return (
    <div className={styles.card}>
      <span className={styles.title}>删除原内容</span>
      <div className={styles.content}>
        <Checkbox
          checked={checked}
          disabled={disabled}
          onChange={(e) => onChange(e.target.checked)}
        />
        <span className={styles.text}>
          重新发布后删除原内容（仅当发布到同账号时生效）
        </span>
      </div>
    </div>
  );
};

export default DeleteOriginalCard;
