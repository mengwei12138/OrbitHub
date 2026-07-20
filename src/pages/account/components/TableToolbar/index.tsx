import { ReloadOutlined } from '@ant-design/icons';
import { Button, Space } from 'antd';
import { useMemo } from 'react';
import { ACCOUNT_RUN_STATUS } from '@/services/account';
import type { AccountResponse } from '@/services/account/types';

import styles from './style.module.css';

export type TableToolbarProps = {
  selectedRowKeys: string[];
  selectedRows?: AccountResponse[];
  onBatchStop: () => void;
  onBatchStart: () => void;
  onBatchDelete: () => void;
  onRefresh: () => void;
};

const TableToolbar: React.FC<TableToolbarProps> = ({
  selectedRowKeys,
  selectedRows = [],
  onBatchStop,
  onBatchStart,
  onBatchDelete,
  onRefresh,
}) => {
  const hasOnlineSelected = useMemo(
    () => selectedRows.some((row) => row.status === ACCOUNT_RUN_STATUS.ONLINE),
    [selectedRows],
  );
  const hasStoppedSelected = useMemo(
    () => selectedRows.some((row) => row.status === ACCOUNT_RUN_STATUS.STOPPED),
    [selectedRows],
  );

  return (
    <div className={styles.wrapper}>
      <Space>
        <span className={styles.selectedBadge}>{selectedRowKeys.length}</span>
        <span className={styles.selectedLabel}>已选</span>
        <Button
          size="small"
          disabled={!hasOnlineSelected}
          onClick={onBatchStop}
        >
          批量停止
        </Button>
        <Button
          size="small"
          disabled={!hasStoppedSelected}
          onClick={onBatchStart}
        >
          批量启动
        </Button>
        <Button
          size="small"
          danger
          disabled={!hasStoppedSelected}
          onClick={onBatchDelete}
        >
          批量删除
        </Button>
      </Space>
      <Button icon={<ReloadOutlined />} onClick={onRefresh} />
    </div>
  );
};

export default TableToolbar;
