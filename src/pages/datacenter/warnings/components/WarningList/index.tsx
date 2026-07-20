import { Pagination } from 'antd';
import dayjs from 'dayjs';
import { useMemo } from 'react';
import { CustomEmpty } from '@/components';
import WarningCard from '../WarningCard';
import styles from './style.module.css';
import type { Warning, WarningListProps } from './types';

const getPageSizeOptions = (total: number): string[] => {
  if (total <= 20) return ['5', '10', '20'];
  if (total <= 50) return ['10', '20', '50'];
  return ['10', '20', '50', '100'];
};

function groupWarningsByDate(warnings: Warning[]): Record<string, Warning[]> {
  return warnings.reduce(
    (acc, warning) => {
      const date = dayjs(warning.createTime).format('YYYY-MM-DD');
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(warning);
      return acc;
    },
    {} as Record<string, Warning[]>,
  );
}

const WarningList: React.FC<WarningListProps> = ({
  data,
  loading,
  pagination,
  onPageChange,
  onViewDetail,
  onIgnore,
  onHandle,
}) => {
  const groupedWarnings = useMemo(() => groupWarningsByDate(data), [data]);
  const sortedDates = useMemo(
    () =>
      Object.keys(groupedWarnings).sort(
        (a, b) => dayjs(b).valueOf() - dayjs(a).valueOf(),
      ),
    [groupedWarnings],
  );

  if (!loading && data.length === 0) {
    return (
      <div className={styles.container}>
        <CustomEmpty description="暂无预警" />
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.listContainer}>
        {sortedDates.map((date) => (
          <div key={date} className={styles.dateGroup}>
            <div className={styles.dateHeader}>{date}</div>
            <div className={styles.cards}>
              {groupedWarnings[date].map((warning) => (
                <WarningCard
                  key={warning.id}
                  warning={warning}
                  onViewDetail={onViewDetail}
                  onIgnore={onIgnore}
                  onHandle={onHandle}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
      {pagination.total > 0 && (
        <div className={styles.pagination}>
          <Pagination
            current={pagination.current}
            pageSize={pagination.pageSize}
            total={pagination.total}
            onChange={onPageChange}
            showSizeChanger={pagination.total > 10}
            showQuickJumper
            showTotal={(total) => `共 ${total} 条`}
            defaultPageSize={10}
            pageSizeOptions={getPageSizeOptions(pagination.total)}
            locale={{
              items_per_page: '条/页',
              jump_to: '跳至',
              page: '页',
              prev_page: '上一页',
              next_page: '下一页',
            }}
          />
        </div>
      )}
    </div>
  );
};

export default WarningList;
