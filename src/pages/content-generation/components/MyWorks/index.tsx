import styles from './style.module.css';

export type WorkItem = {
  id: string;
  type: '视频' | '图文';
  title: string;
  date: string;
  /** TENANT 视角下渲染「由 XX 创建」；NORMAL 视角下父组件传 false 抑制渲染。 */
  ownerName?: string;
};

type MyWorksCardProps = {
  works?: WorkItem[];
  onViewAll?: () => void;
  onViewDetail?: (id: string) => void;
  /**
   * 卡片标题与 owner 列的展示分支。
   * 由 OpenSpec change `content-generation-my-works-data-isolation` 引入。
   */
  title?: string;
  isTenantAdmin?: boolean;
};

const MyWorks: React.FC<MyWorksCardProps> = ({
  works = [],
  onViewAll,
  onViewDetail,
  title = '我的作品',
  isTenantAdmin = false,
}) => {
  return (
    <div className={styles.container}>
      <div className={styles.cardHeader}>
        <span className={styles.title}>{title}</span>
        {works.length > 0 && (
          <span className={styles.viewAll} onClick={onViewAll}>
            查看全部 →
          </span>
        )}
      </div>
      <div className={styles.divider} />
      {works.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon} />
          <div className={styles.emptyText}>暂无作品</div>
          <div className={styles.emptyHint}>去首页发起一次生成吧</div>
        </div>
      ) : (
        <div className={styles.content}>
          {works.map((work) => (
            <WorkRow
              key={work.id}
              work={work}
              isTenantAdmin={isTenantAdmin}
              onView={() => onViewDetail?.(work.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

type WorkRowProps = {
  work: WorkItem;
  isTenantAdmin: boolean;
  onView: () => void;
};

const WorkRow: React.FC<WorkRowProps> = ({ work, isTenantAdmin, onView }) => {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        padding: '0 24px',
        height: 56,
      }}
    >
      <span
        style={{
          background: work.type === '视频' ? '#E6F4FF' : '#F9F0FF',
          borderRadius: 4,
          padding: '4px 8px',
          fontSize: 13,
          color: work.type === '视频' ? '#1677FF' : '#722ED1',
        }}
      >
        {work.type}
      </span>
      <span style={{ marginLeft: 12, color: '#434343', fontSize: 14 }}>
        {work.title}
      </span>
      {isTenantAdmin && work.ownerName ? (
        <span
          style={{ marginLeft: 12, color: '#8C8C8C', fontSize: 13 }}
          data-testid={`mywork-card-owner-${work.id}`}
        >
          由 {work.ownerName} 创建
        </span>
      ) : null}
      <span style={{ marginLeft: 'auto', color: '#8C8C8C', fontSize: 13 }}>
        {work.date}
      </span>
      <span
        style={{
          marginLeft: 24,
          color: '#1677FF',
          fontSize: 13,
          cursor: 'pointer',
        }}
        onClick={onView}
      >
        查看
      </span>
    </div>
  );
};

export default MyWorks;
