import { Checkbox } from 'antd';

import styles from './style.module.css';

type DeleteOriginalCheckboxProps = {
  checked: boolean;
  disabled?: boolean;
  onChange: (checked: boolean) => void;
};

const DeleteOriginalCheckbox = ({
  checked,
  disabled = false,
  onChange,
}: DeleteOriginalCheckboxProps) => {
  return (
    <div className={styles.deleteOriginalCheckbox}>
      <Checkbox
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
      />
      <div className={styles.labelGroup}>
        <span className={styles.label}>重新发布后删除原内容</span>
        <span className={styles.hint}>（仅当目标账号包含原账号时可勾选）</span>
      </div>
    </div>
  );
};

export default DeleteOriginalCheckbox;
