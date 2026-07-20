import { Pagination } from 'antd';
import type { FC } from 'react';
import type { WorkItem } from '../../types';
import styles from './style.module.css';
import WorkRow from './WorkRow';

type WorkListTableProps = {
  works: WorkItem[];
  total: number;
  page: number;
  pageSize: number;
  onPageChange: (page: number, pageSize: number) => void;
  onViewDetail: (id: string) => void;
  onPublish: (work: WorkItem) => void;
  onRegenerate: (work: WorkItem) => void;
  /** 租户管理员视角下行内多渲染一行 owner 信息；由父组件按角色决定。 */
  isTenantAdmin?: boolean;
};

const WorkListTable: FC<WorkListTableProps> = ({
  works,
  total,
  page,
  pageSize,
  onPageChange,
  onViewDetail,
  onPublish,
  onRegenerate,
  isTenantAdmin = false,
}) => {
  return (
    <div className={styles.card}>
      {works.map((work) => (
        <WorkRow
          key={work.id}
          work={work}
          onViewDetail={onViewDetail}
          onPublish={onPublish}
          onRegenerate={onRegenerate}
          isTenantAdmin={isTenantAdmin}
        />
      ))}

      <div className={styles.paginationWrapper}>
        <Pagination
          current={page}
          pageSize={pageSize}
          total={total}
          showTotal={(t) => `共 ${t} 条`}
          showSizeChanger={total > pageSize}
          showQuickJumper
          onChange={(nextPage, nextPageSize) => {
            onPageChange(nextPage, nextPageSize ?? pageSize);
          }}
          locale={{
            items_per_page: '条/页',
            jump_to: '跳至',
            page: '页',
            prev_page: '上一页',
            next_page: '下一页',
          }}
        />
      </div>
    </div>
  );
};

export default WorkListTable;
