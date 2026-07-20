import { SearchOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import type { FC } from 'react';

import styles from './style.module.css';

type TableEmptyProps = {
  title?: string;
  description?: string;
  onReset?: () => void;
};

const TableEmpty: FC<TableEmptyProps> = ({
  title = '没有找到匹配的账号',
  description = '请调整筛选条件后重试',
  onReset,
}) => {
  return (
    <div className={styles.container}>
      <div className={styles.illustration}>
        <div className={styles.illustrationBg}>
          <SearchOutlined className={styles.searchIcon} />
        </div>
      </div>
      <div className={styles.title}>{title}</div>
      <div className={styles.description}>{description}</div>
      {onReset && (
        <Button className={styles.resetButton} onClick={onReset}>
          重置筛选
        </Button>
      )}
    </div>
  );
};

export default TableEmpty;
